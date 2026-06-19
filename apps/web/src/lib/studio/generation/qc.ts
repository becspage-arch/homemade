import type { PatternData } from '@homemade/db'

/**
 * Cross-stitch generation QC — three gates (see `project_cross_stitch_pipeline`):
 *
 *   1. structuralQc  — pure, deterministic completeness + makeability check.
 *   2. vision gate   — Claude looks at the render (recognisable? on-style?
 *                      muddy? stray text?). NOT codeable as a pure function;
 *                      runs in a Claude worker session against the render and,
 *                      for Tier E, the reference style. Lives in the REVIEW
 *                      queue workflow, not here.
 *   3. licenceQc     — every pattern carries a verified source licence +
 *                      correct attribution, else it does not publish.
 *
 * structuralQc + licenceQc gate the cron autopilot; the vision gate decides
 * what auto-publishes vs what is held in REVIEW for a Claude session.
 */

export interface StructuralVerdict {
  pass: boolean
  reasons: string[]
  /** Single-symbol "confetti" ratio (0-1) — high means a noisy, hard-to-stitch chart. */
  confettiRatio: number
}

const MIN_CELLS = 10
const MAX_DIM = 400
const MIN_DIM = 14
const MAX_COLOURS = 96
const MAX_CONFETTI_RATIO = 0.18

/** Deterministic structural + makeability gate for a cross-stitch chart. */
export function structuralQc(data: PatternData): StructuralVerdict {
  const reasons: string[] = []
  const { grid, palette, fabric } = data
  const cellCount = grid.cells.length

  if (cellCount < MIN_CELLS) reasons.push(`too few stitched cells (${cellCount})`)
  if (grid.width < MIN_DIM || grid.height < MIN_DIM) reasons.push(`dimensions too small (${grid.width}x${grid.height})`)
  if (grid.width > MAX_DIM || grid.height > MAX_DIM) reasons.push(`dimensions too large (${grid.width}x${grid.height})`)
  if (palette.length < 1) reasons.push('empty palette / no stitch key')
  if (palette.length > MAX_COLOURS) reasons.push(`palette too large (${palette.length})`)
  if (!fabric || fabric.count <= 0) reasons.push('missing fabric count (finished size not computable)')

  // Every stitched cell must map to a palette entry (a valid stitch key).
  const symbols = new Set(palette.map((p) => p.symbol))
  const orphan = grid.cells.find((c) => !symbols.has(c.s))
  if (orphan) reasons.push(`cell references symbol "${orphan.s}" missing from the stitch key`)

  // Every palette entry needs a brand + code + colour (the floss list).
  const badFloss = palette.find((p) => !p.brand || !p.code || !/^#[0-9a-fA-F]{6}$/.test(p.rgb))
  if (badFloss) reasons.push(`floss entry "${badFloss.symbol}" missing brand/code/colour`)

  // Confetti / makeability: fraction of cells whose colour appears < 8 times
  // total. A high ratio means lots of isolated single stitches — miserable to
  // stitch and a sign the source converted to mush.
  const counts = new Map<string, number>()
  for (const c of grid.cells) counts.set(c.s, (counts.get(c.s) ?? 0) + 1)
  let confettiCells = 0
  for (const c of grid.cells) if ((counts.get(c.s) ?? 0) < 8) confettiCells++
  const confettiRatio = cellCount ? confettiCells / cellCount : 1
  if (confettiRatio > MAX_CONFETTI_RATIO) reasons.push(`too much confetti (${(confettiRatio * 100).toFixed(0)}% isolated stitches)`)

  return { pass: reasons.length === 0, reasons, confettiRatio }
}

export interface LicenceInput {
  licence: 'CC0' | 'PD' | 'CC-BY' | 'HOMEMADE-AI' | 'HOMEMADE-ORIGINAL' | null
  credit: string | null
  /** Designer attribution on the row (Homemade-original or a real designer). */
  designerId: string | null
}

export interface LicenceVerdict {
  pass: boolean
  reasons: string[]
}

const ATTRIBUTION_REQUIRED: Record<string, boolean> = { 'CC0': false, 'PD': false, 'CC-BY': true, 'HOMEMADE-AI': false, 'HOMEMADE-ORIGINAL': false }

/** Every pattern must have a known licence + designer attribution, and a
 *  credit line where the licence requires attribution. */
export function licenceQc(input: LicenceInput): LicenceVerdict {
  const reasons: string[] = []
  if (!input.licence) reasons.push('no source licence recorded')
  if (!input.designerId) reasons.push('no designer attribution')
  if (input.licence && ATTRIBUTION_REQUIRED[input.licence] && !input.credit) {
    reasons.push(`licence ${input.licence} requires a credit line but none recorded`)
  }
  return { pass: reasons.length === 0, reasons }
}
