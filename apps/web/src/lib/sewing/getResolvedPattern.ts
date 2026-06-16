// SPDX-License-Identifier: MIT
//
// Sewing pattern resolution dispatcher.
//
// Sewing has two storage paths by design:
//   - HOUSE patterns store pieces + instructions + materials in DB columns.
//   - FREESEWING patterns store almost nothing; their pieces are drafted live
//     from the @freesewing engine at render time (CYC default measurements for
//     the showcase, the user's measurements when personalising).
//
// The completeness gate must judge both identically, so this dispatcher folds
// both into ONE `ResolvedSewingPattern` shape. For house patterns it reads the
// DB columns; for freesewing patterns it drafts the pieces live at CYC defaults
// and reads the remaining facts from the columns. Any resolution failure (an
// unknown design slug, an engine throw) returns `source: 'UNRESOLVED'` with the
// captured error — which the makeability rule treats as a hard fail.
//
// The completeness rule (`pattern-sewing.ts`) is pure and lives in packages/db;
// it never reads a raw column. This file is the only place the freesewing engine
// is touched for the gate, and it lives in apps/web because that is where the
// @freesewing/* packages resolve.

import { draftPattern } from './grading/grader'
import { getDesignConfig } from './grading/design-registry'
import type { MeasurementsPayload } from './measurements'

// ──────────────────────────────────────────────────────────────────────────
// Resolved shape. Kept structurally identical to `ResolvedSewingPattern` in
// packages/db/scripts/qc-makeability-rules/pattern-sewing.ts — the makeability
// rule consumes this object by structural typing, so the two definitions must
// stay in lockstep. Defined locally (rather than imported across the package
// boundary) so this file, which lives in the Next-built `src` tree, never pulls
// a packages/db script into the web typecheck / bundle.
// ──────────────────────────────────────────────────────────────────────────

export interface ResolvedSewingPiece {
  name: string
  cut: number | null
  grain: string | null
}

export interface ResolvedFabricRecommendation {
  type: string | null
  widthCm: number | null
}

export interface ResolvedSewingMaterials {
  fabrics: ResolvedFabricRecommendation[]
  notions: { name: string }[]
  hasInterfacing: boolean
  fabricRequirements: Record<string, unknown[]>
}

export interface ResolvedSewingSize {
  name: string
  body: Record<string, number>
}

export interface ResolvedSewingPattern {
  pieces: ResolvedSewingPiece[]
  instructionsBody: unknown | null
  materials: ResolvedSewingMaterials | null
  sizing: ResolvedSewingSize[]
  finishedMeasurements: Record<string, unknown> | null
  seamAllowanceCm: number | null
  seamAllowanceStated: boolean
  skillLevel: string | null
  constructionDirection: string | null
  cuttingLayouts: Record<string, unknown[]> | null
  sizesCount: number
  source: 'HOUSE_DB' | 'FREESEWING_LIVE' | 'UNRESOLVED'
  resolutionError?: string
}

// CYC default measurement sets (mirrors grading/showcase.ts). Used to live-draft
// freesewing pieces so the gate can confirm the engine resolves a real pattern.
const CYC_WOMENS_M_CM: MeasurementsPayload = {
  bustChestCm: 92, waistCm: 74, hipCm: 100, bodyHeightCm: 168, inseamCm: 78,
  bustPointCm: 18, backWaistLengthCm: 41, frontWaistLengthCm: 42,
  shoulderWidthCm: 41, armLengthCm: 60, wristCircumferenceCm: 16, neckCircumferenceCm: 36,
}
const CYC_MENS_M_CM: MeasurementsPayload = {
  bustChestCm: 100, waistCm: 87, hipCm: 99, bodyHeightCm: 178, inseamCm: 80,
  shoulderWidthCm: 45, armLengthCm: 66, wristCircumferenceCm: 17, neckCircumferenceCm: 38,
}

function defaultMeasurementsFor(designSlug: string): MeasurementsPayload {
  const cfg = getDesignConfig(designSlug)
  if (!cfg) return CYC_WOMENS_M_CM
  return cfg.genderFamily === 'MENS' ? CYC_MENS_M_CM : CYC_WOMENS_M_CM
}

/** The subset of SewingPattern columns the dispatcher reads. Structural so it
 *  accepts a Prisma row without importing the generated type. */
export interface SewingPatternRowForResolve {
  isFreesewingDesign: boolean
  freesewingDesignSlug: string | null
  pieceList: unknown
  instructionsBody: unknown
  recommendedFabrics: unknown
  recommendedNotions: unknown
  fabricRequirementsCm: unknown
  supportedSizes: unknown
  finishedGarmentChart: unknown
  cuttingLayouts: unknown
  seamAllowanceCm: { toString(): string } | number | null
  hasInterfacing: boolean
  skillLevel: string | null
  constructionDirection: string | null
}

function num(v: { toString(): string } | number | null | undefined): number | null {
  if (v == null) return null
  const n = typeof v === 'number' ? v : Number(v.toString())
  return Number.isFinite(n) ? n : null
}

function readMaterials(row: SewingPatternRowForResolve): ResolvedSewingMaterials {
  const fabrics: ResolvedFabricRecommendation[] = []
  if (Array.isArray(row.recommendedFabrics)) {
    for (const f of row.recommendedFabrics as Record<string, unknown>[]) {
      if (!f || typeof f !== 'object') continue
      fabrics.push({
        type: typeof f.type === 'string' ? f.type : null,
        widthCm: typeof f.widthCm === 'number' ? f.widthCm : null,
      })
    }
  }
  const notions: { name: string }[] = []
  if (Array.isArray(row.recommendedNotions)) {
    for (const n of row.recommendedNotions as Record<string, unknown>[]) {
      if (n && typeof n === 'object' && typeof n.name === 'string') notions.push({ name: n.name })
    }
  }
  const fabricRequirements: Record<string, unknown[]> = {}
  if (row.fabricRequirementsCm && typeof row.fabricRequirementsCm === 'object') {
    for (const [size, val] of Object.entries(row.fabricRequirementsCm as Record<string, unknown>)) {
      if (Array.isArray(val) && val.length) fabricRequirements[size] = val
      else if (val && typeof val === 'object' && Object.keys(val).length) fabricRequirements[size] = [val]
    }
  }
  return { fabrics, notions, hasInterfacing: row.hasInterfacing === true, fabricRequirements }
}

function readSizing(raw: unknown): ResolvedSewingSize[] {
  if (!Array.isArray(raw)) return []
  const out: ResolvedSewingSize[] = []
  for (const s of raw) {
    if (!s || typeof s !== 'object') continue
    const o = s as Record<string, unknown>
    if (typeof o.name !== 'string') continue
    const body = o.body && typeof o.body === 'object' ? (o.body as Record<string, number>) : {}
    out.push({ name: o.name, body })
  }
  return out
}

function readCuttingLayouts(raw: unknown): Record<string, unknown[]> | null {
  if (!raw || typeof raw !== 'object') return null
  const out: Record<string, unknown[]> = {}
  for (const [size, val] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(val) && val.length) out[size] = val
    else if (val && typeof val === 'object' && Object.keys(val).length) out[size] = [val]
  }
  return Object.keys(out).length ? out : null
}

function readHousePieces(raw: unknown): ResolvedSewingPiece[] {
  if (!Array.isArray(raw)) return []
  const out: ResolvedSewingPiece[] = []
  for (const p of raw) {
    if (!p || typeof p !== 'object') continue
    const o = p as Record<string, unknown>
    if (typeof o.name !== 'string' || !o.name.trim()) continue
    out.push({
      name: o.name,
      cut: typeof o.cut === 'number' ? o.cut : null,
      grain:
        typeof o.grainDirection === 'string' ? o.grainDirection :
        typeof o.grain === 'string' ? o.grain :
        o.grainline != null ? 'lengthwise' : null,
    })
  }
  return out
}

function commonFacts(row: SewingPatternRowForResolve): Omit<ResolvedSewingPattern, 'pieces' | 'source' | 'resolutionError'> {
  const saCm = num(row.seamAllowanceCm)
  const finished = row.finishedGarmentChart && typeof row.finishedGarmentChart === 'object'
    ? (row.finishedGarmentChart as Record<string, unknown>)
    : null
  const sizing = readSizing(row.supportedSizes)
  return {
    instructionsBody: row.instructionsBody ?? null,
    materials: readMaterials(row),
    sizing,
    finishedMeasurements: finished,
    seamAllowanceCm: saCm,
    seamAllowanceStated: saCm != null,
    skillLevel: row.skillLevel ?? null,
    constructionDirection: row.constructionDirection ?? null,
    cuttingLayouts: readCuttingLayouts(row.cuttingLayouts),
    sizesCount: sizing.length,
  }
}

/**
 * Resolve a SewingPattern row into the uniform shape the makeability gate reads.
 * Never throws — a resolution failure is reported as source 'UNRESOLVED'.
 */
export async function getResolvedPattern(row: SewingPatternRowForResolve): Promise<ResolvedSewingPattern> {
  const common = commonFacts(row)

  if (row.isFreesewingDesign) {
    const slug = row.freesewingDesignSlug
    if (!slug) {
      return { ...common, pieces: [], source: 'UNRESOLVED', resolutionError: 'freesewing design slug missing' }
    }
    try {
      const drafted = await draftPattern({ designSlug: slug, measurements: defaultMeasurementsFor(slug) })
      const pieces: ResolvedSewingPiece[] = drafted.partList.map((p) => ({ name: p.name, cut: null, grain: null }))
      if (pieces.length === 0) {
        return { ...common, pieces, source: 'UNRESOLVED', resolutionError: 'engine drafted zero parts' }
      }
      return { ...common, pieces, source: 'FREESEWING_LIVE' }
    } catch (err) {
      return {
        ...common,
        pieces: [],
        source: 'UNRESOLVED',
        resolutionError: err instanceof Error ? err.message : String(err),
      }
    }
  }

  // House pattern: pieces from the DB column.
  const pieces = readHousePieces(row.pieceList)
  return { ...common, pieces, source: 'HOUSE_DB' }
}
