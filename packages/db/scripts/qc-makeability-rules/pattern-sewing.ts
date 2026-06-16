/**
 * Sewing PATTERN — the "PATTERN — sewing" checklist section, every item a hard
 * block. Sewing has two storage paths by design (house patterns store pieces +
 * instructions in DB columns; freesewing patterns generate pieces live from the
 * engine), so this rule never reads raw columns. It runs against the uniform
 * `ResolvedSewingPattern` the dispatcher (`getResolvedPattern`) produces, so the
 * completeness check is identical regardless of source. `source: 'UNRESOLVED'`
 * is an automatic fail.
 *
 * This file is PURE — it imports no Prisma and no freesewing engine. The
 * resolution (DB read or live draft) happens in the dispatcher, in apps/web,
 * where the freesewing packages resolve. The interface below is the contract
 * between the two.
 */
import { bodyText, mechanicalChecks, type MakeabilityResult } from './shared.js'

export interface ResolvedSewingPiece {
  name: string
  /** Cut count (e.g. "cut 2"). null when the source did not state it. */
  cut: number | null
  /** Grain direction marking. null when the source did not state it. */
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
  /** Per-size fabric requirement map keyed by size name. */
  fabricRequirements: Record<string, unknown[]>
}

export interface ResolvedSewingSize {
  name: string
  /** Body measurement map for this size (bust/waist/hip/…). */
  body: Record<string, number>
}

export interface ResolvedSewingPattern {
  pieces: ResolvedSewingPiece[]
  instructionsBody: unknown | null
  materials: ResolvedSewingMaterials | null
  sizing: ResolvedSewingSize[]
  finishedMeasurements: Record<string, unknown> | null
  seamAllowanceCm: number | null
  /** seamAllowanceIncluded toggle — "specified" is satisfied by either an
   *  explicit cm value or an explicit included/excluded stance. */
  seamAllowanceStated: boolean
  skillLevel: string | null
  constructionDirection: string | null
  cuttingLayouts: Record<string, unknown[]> | null
  sizesCount: number
  source: 'HOUSE_DB' | 'FREESEWING_LIVE' | 'UNRESOLVED'
  resolutionError?: string
}

/** A piece carries enough metadata to cut it: a name, a cut count, and a grain
 *  marking. Freesewing live-draft parts have a name + geometry but no cut /
 *  grain, so they fail this — honestly: those facts are not on the row. */
function piecesHaveDetail(pieces: ResolvedSewingPiece[]): boolean {
  if (pieces.length === 0) return false
  return pieces.every((p) => p.name.trim().length > 0 && p.cut != null && p.cut > 0 && !!p.grain)
}

function instructionsResolvable(body: unknown | null): boolean {
  if (body == null) return false
  const text = bodyText(body)
  if (text.trim().length < 80) return false
  // a step structure: numbered headings / ordered list, or several sentences
  return /\b(step|first|next|then|sew|stitch|press|pin|attach|fold|finish|cut|fuse|topstitch|hem|seam)\b/i.test(text)
}

/**
 * Run the "PATTERN — sewing" checklist against a resolved pattern. Returns the
 * standard MakeabilityResult ({ ok, reasons, rules }). Cross-cutting mechanical
 * checks run on the resolved instructions body.
 */
export function auditResolvedSewingPattern(r: ResolvedSewingPattern): MakeabilityResult {
  const reasons: string[] = []
  const rules: string[] = []
  const RULE = 'sewing:pattern'
  const fail = (reason: string, rule = RULE) => { reasons.push(reason); rules.push(rule) }

  if (r.source === 'UNRESOLVED') {
    fail(`pattern could not be resolved via the dispatcher${r.resolutionError ? `: ${r.resolutionError}` : ''}`)
    return { ok: false, reasons, rules }
  }

  // Cross-cutting mechanical checks on the resolved instructions body.
  if (r.instructionsBody != null) {
    const mech = mechanicalChecks(bodyText(r.instructionsBody))
    reasons.push(...mech.reasons); rules.push(...mech.rules)
  }

  if (r.pieces.length === 0) fail('no pattern pieces resolvable via the dispatcher')
  if (!piecesHaveDetail(r.pieces)) fail('pattern pieces lack name / cut count / grain markings')
  if (!instructionsResolvable(r.instructionsBody)) fail('no step-by-step instructions resolvable via the dispatcher')

  const m = r.materials
  if (!m || m.fabrics.length === 0 || !m.fabrics.some((f) => !!f.type)) fail('no fabric type recommendations')
  if (!m || (!m.fabrics.some((f) => f.widthCm != null) && Object.keys(m.fabricRequirements).length === 0)) {
    fail('no fabric width assumption (140cm / 112cm)')
  }
  if (!m || Object.keys(m.fabricRequirements).length === 0) fail('no fabric requirements per size')
  if (!m || (m.notions.length === 0 && !m.hasInterfacing)) fail('no interfacing / notions / thread')

  if (r.sizing.length === 0 || !r.sizing.some((s) => Object.keys(s.body).length > 0)) {
    fail('no sizing chart (body measurements per size)')
  }
  if (r.finishedMeasurements == null || Object.keys(r.finishedMeasurements).length === 0) {
    fail('no finished garment measurements per size')
  }
  if (!r.seamAllowanceStated) fail('no seam allowance specified (included or to be added)')
  if (!r.skillLevel) fail('no skill level indication')
  if (!r.constructionDirection) fail('no construction direction')
  if (r.cuttingLayouts == null || Object.keys(r.cuttingLayouts).length === 0) {
    fail('no cutting layout per size + fabric width')
  }
  if (r.sizesCount < 1) fail('no sizes graded')

  return { ok: reasons.length === 0, reasons, rules }
}
