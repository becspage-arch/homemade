/**
 * Canonical needlework SURFACE pattern shape + the lossless converter between it
 * and the DB columns (`NeedleworkPattern.vectorData` / `regionAnnotations`).
 *
 * ── The decision ────────────────────────────────────────────────────────────
 * The single source of truth for a surface-embroidery pattern is the engine's
 * `StitchedElement[]` (the loom render contract) plus its finished size, fabric
 * and default thread — i.e. exactly the `*.pattern.json` shape `renderHero`,
 * `buildPatternDocument` and `patternToPrintTemplate` already consume. It is the
 * RICHEST shape: it carries per-element geometry (knot points, shaded-fill
 * polygons with dark→light ramps + fade axes, worked-line paths), which the old
 * region model (an SVG outline + `{id,label}` regions + one stitch/colour per
 * region) cannot express. The region model is therefore a DERIVED editing view,
 * not the truth.
 *
 * We persist the canonical dataset INSIDE the existing `vectorData` Json column
 * (no migration): `vectorData` keeps its Studio-compat fields
 * (`svgContent/width/height/regions`) AND carries the canonical
 * `stitchedElements` + `finishedSizeMm` + `fabricSpec` + `defaultThread` +
 * `frameType` + optional `palette`/`stitchLegend`/`document`. `regionAnnotations`
 * is derived (one row per stitch×colour group) for the Studio surface editor.
 *
 * Round-trip: canonical → stored → canonical returns the SAME `stitchedElements`
 * verbatim (they are stored, not reconstructed), so DB → engine is always
 * lossless. The FUTURE diagram generator targets `NeedleworkSurfacePattern`.
 */

import type { StitchedElement } from '../loom/render/renderPattern'
import { nearestDmcFull } from '../floss/dmc-full'
import { patternToLineArtSvg } from './engine/lineart'
import type { PatternDocument } from './engine/document'

export interface NeedleworkFabricSpec {
  material?: string | null
  colourHex?: string | null
  count?: number | null
}

export interface NeedleworkPaletteEntry {
  code: number
  dmc: string
  name: string
  hex: string
  skeins?: number
}

export interface NeedleworkStitchLegendEntry {
  letter: string
  stitchId: string
  name: string
}

/** The canonical surface-embroidery pattern — the loom contract + its context. */
export interface NeedleworkSurfacePattern {
  stitchedElements: StitchedElement[]
  finishedSizeMm: { width: number; height: number }
  fabricSpec?: NeedleworkFabricSpec | null
  defaultThread?: { type: string; weight: string } | null
  frameType?: string | null
  palette?: NeedleworkPaletteEntry[]
  stitchLegend?: NeedleworkStitchLegendEntry[]
}

/** A surface pattern region (Studio surface editor view). */
export interface NeedleworkRegionAnnotation {
  id: string
  stitchType: string
  threadRef: string
  colourHex: string
  notes?: string
}

/**
 * The shape stored in `NeedleworkPattern.vectorData`. Structurally a superset of
 * the Studio's `NeedleworkVectorData` (`svgContent/width/height/regions`) so the
 * Studio keeps working, plus the canonical render contract.
 */
export interface StoredNeedleworkVectorData {
  /** Schema marker so older region-only rows are distinguishable. */
  schemaVersion: 2
  // ── Studio-compat (the surface editor reads these) ──
  svgContent: string
  width: number
  height: number
  regions: Array<{ id: string; label: string }>
  // ── Canonical render contract ──
  stitchedElements: StitchedElement[]
  finishedSizeMm: { width: number; height: number }
  fabricSpec?: NeedleworkFabricSpec | null
  defaultThread?: { type: string; weight: string } | null
  frameType?: string | null
  palette?: NeedleworkPaletteEntry[]
  stitchLegend?: NeedleworkStitchLegendEntry[]
  /** Precomputed printable document (floss key, stitch key, steps, SVGs). */
  document?: PatternDocument
}

function baseSlug(s: string): string {
  return s.replace(/^embroidery-/, '')
}

/** Stable region id for a (stitch, colour) group. */
function groupId(stitchSlug: string, hex: string): string {
  return `${baseSlug(stitchSlug)}__${hex.replace('#', '').toLowerCase()}`
}

/**
 * Derive the Studio region list + region annotations from the canonical
 * elements. One region per (stitch, colour) group — the natural editable unit of
 * a surface design ("the moss-green stems", "the white blossom knots").
 */
export function deriveRegions(elements: StitchedElement[]): {
  regions: Array<{ id: string; label: string }>
  regionAnnotations: NeedleworkRegionAnnotation[]
} {
  const groups = new Map<string, { stitchType: string; hex: string }>()
  for (const el of elements) {
    // A shaded fill is labelled by its mid-ramp shade (matches the document).
    const hex = el.shade?.ramp?.length
      ? el.shade.ramp[Math.floor(el.shade.ramp.length / 2)]!
      : el.colourHex
    const id = groupId(el.stitchType, hex)
    if (!groups.has(id)) groups.set(id, { stitchType: el.stitchType, hex })
  }
  const regions: Array<{ id: string; label: string }> = []
  const regionAnnotations: NeedleworkRegionAnnotation[] = []
  for (const [id, g] of groups) {
    const floss = nearestDmcFull(g.hex)
    const stitchName = baseSlug(g.stitchType).replace(/-/g, ' ')
    regions.push({ id, label: `${stitchName} · ${floss.name}` })
    regionAnnotations.push({
      id,
      stitchType: g.stitchType,
      threadRef: `DMC ${floss.code}`,
      colourHex: floss.hex,
    })
  }
  return { regions, regionAnnotations }
}

/**
 * Canonical → stored. Produces the `vectorData` JSON (with the line-art transfer
 * template baked into `svgContent` so the Studio surface view shows the design)
 * and the derived `regionAnnotations`.
 */
export function toStoredVectorData(
  pattern: NeedleworkSurfacePattern,
  opts: { document?: PatternDocument } = {},
): { vectorData: StoredNeedleworkVectorData; regionAnnotations: NeedleworkRegionAnnotation[] } {
  const { regions, regionAnnotations } = deriveRegions(pattern.stitchedElements)
  const svgContent = patternToLineArtSvg(pattern.stitchedElements, pattern.finishedSizeMm)
  const vectorData: StoredNeedleworkVectorData = {
    schemaVersion: 2,
    svgContent,
    width: pattern.finishedSizeMm.width,
    height: pattern.finishedSizeMm.height,
    regions,
    stitchedElements: pattern.stitchedElements,
    finishedSizeMm: pattern.finishedSizeMm,
    fabricSpec: pattern.fabricSpec ?? null,
    defaultThread: pattern.defaultThread ?? null,
    frameType: pattern.frameType ?? null,
    palette: pattern.palette,
    stitchLegend: pattern.stitchLegend,
    document: opts.document,
  }
  return { vectorData, regionAnnotations }
}

/** Type guard: a stored vectorData that carries the canonical render contract. */
export function isStoredVectorData(v: unknown): v is StoredNeedleworkVectorData {
  return (
    !!v &&
    typeof v === 'object' &&
    Array.isArray((v as { stitchedElements?: unknown }).stitchedElements)
  )
}

/**
 * Stored → canonical. Lossless when the row carries `stitchedElements` (every
 * pattern authored through this pipeline does). Region-only legacy rows (Studio
 * drafts with no elements) return an empty element list — they are "not yet
 * rendered" and must be re-authored through the canonical path; we never try to
 * fabricate geometry from an SVG outline.
 */
export function fromStoredVectorData(
  vectorData: unknown,
): NeedleworkSurfacePattern | null {
  if (!isStoredVectorData(vectorData)) return null
  const v = vectorData
  const size =
    v.finishedSizeMm ??
    (typeof v.width === 'number' && typeof v.height === 'number'
      ? { width: v.width, height: v.height }
      : null)
  if (!size) return null
  return {
    stitchedElements: v.stitchedElements,
    finishedSizeMm: size,
    fabricSpec: v.fabricSpec ?? null,
    defaultThread: v.defaultThread ?? null,
    frameType: v.frameType ?? null,
    palette: v.palette,
    stitchLegend: v.stitchLegend,
  }
}

/** The persisted document, if the row carries one. */
export function storedDocument(vectorData: unknown): PatternDocument | null {
  if (!isStoredVectorData(vectorData)) return null
  return vectorData.document ?? null
}
