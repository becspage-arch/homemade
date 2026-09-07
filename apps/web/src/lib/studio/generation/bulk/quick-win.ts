/**
 * THE QUICK-WIN GUARD — the deterministic clarity check for the under-60-cell
 * tier, run after the chart is built and before anything is parked.
 *
 * The tier exists because the world-best audit (September 2026) found the
 * catalogue had nothing at all a customer could finish in an evening: the
 * smallest lane was 68 cells and everything else was bigger. The whole promise
 * of a 48-cell piece is that a stranger can name the subject from the picture
 * on the listing — a strawberry, a robin, a teacup, a star, a mushroom. A
 * 48-cell chart that is a pretty smudge is worse than no chart at all, because
 * the customer only finds out after buying the floss.
 *
 * "Nameable" is not something arithmetic can decide. What arithmetic CAN decide
 * is whether the chart has the SHAPE of a nameable motif, and every way a small
 * chart fails has a measurable signature:
 *
 *   · the motif is too small in the frame, or bleeds to every edge, so there is
 *     no silhouette to read;
 *   · it is broken into dozens of little colour islands rather than a few solid
 *     areas, so at two millimetres a shape it has no edges;
 *   · it carries far more or far fewer flosses than the tier allows, which
 *     means the converter found mush or found nothing.
 *
 * So the guard measures those and is BINARY, like every other automated control
 * in this pipeline: a chart that fails is re-rolled once and then discarded, and
 * nobody is asked to look at it.
 *
 * Pure — a PatternData in, numbers out. No sharp, no Prisma, no `server-only`.
 */

import { computeStitchabilityMetrics, type PatternData } from '@homemade/db'

/** The cell bounds of the tier itself. A chart outside them is not a quick win. */
export const QUICK_MIN_CELLS = 36
export const QUICK_MAX_CELLS = 64

/** The floss bounds. Under six there is no picture; over fourteen it is not a
 *  one-evening make and the colours cannot be told apart at this size. */
export const QUICK_MIN_COLOURS = 6
export const QUICK_MAX_COLOURS = 14

/**
 * How much of the grid the motif's own bounding box has to cover.
 *
 * Below this the subject is a stamp adrift in a field of cloth: it reads as
 * nothing on a listing thumbnail and it wastes the fabric. The tier's own
 * examples — one fruit, one bird, one cup — fill most of the frame.
 */
export const QUICK_MIN_BOX_SHARE = 0.4

/**
 * ...and how much of it may actually be stitched.
 *
 * The floor keeps out a chart that is a few scattered marks. The ceiling is the
 * bare-cloth rule restated as a measurement: a quick win sits ON the fabric, so
 * a chart with almost every cell stitched is a tiny full-coverage scene, which
 * is a different tier and does not read at this size.
 */
export const QUICK_MIN_STITCHED_SHARE = 0.18
export const QUICK_MAX_STITCHED_SHARE = 0.88

/** A same-colour blob smaller than this is a speck, not an area of the design. */
export const QUICK_MIN_AREA_CELLS = 4

/**
 * The most solid colour areas the motif may break into, per floss.
 *
 * One floss usually draws one or two areas of a small motif — the body and a
 * highlight, the cap and its spots. Four areas per floss means the colours are
 * scattered through each other rather than laid down in shapes, which at two
 * millimetres a cell is exactly the mush the tier cannot afford.
 */
export const QUICK_MAX_AREAS_PER_COLOUR = 3.2

/** The share of stitches that may be lone single crosses. */
export const QUICK_MAX_CONFETTI = 0.14

/**
 * The biggest single colour area, as a share of the stitching.
 *
 * A nameable motif has a dominant shape — the body of the bird, the flesh of
 * the fruit. Without one there is no silhouette, only a scatter.
 */
export const QUICK_MIN_DOMINANT_SHARE = 0.14

export interface QuickWinMeasures {
  widthCells: number
  heightCells: number
  colourCount: number
  /** Stitched cells as a share of the whole grid. */
  stitchedShare: number
  /** The motif's bounding box as a share of the whole grid. */
  boxShare: number
  /** Solid same-colour areas of at least `QUICK_MIN_AREA_CELLS` cells. */
  areas: number
  /** ...per floss in the palette. */
  areasPerColour: number
  /** The largest single area as a share of the stitching. */
  dominantShare: number
  /** Lone single stitches as a share of the stitching. */
  confettiShare: number
}

export interface QuickWinVerdict {
  /** Binary: does this chart read as one nameable motif at this size? */
  ok: boolean
  /** Why not, in short phrases — recorded on the run so a kill is auditable. */
  reasons: string[]
  measures: QuickWinMeasures
}

/**
 * Measure a finished quick-win chart. Every number is read straight off the
 * grid, so the same chart always gets the same verdict.
 */
export function measureQuickWin(data: PatternData): QuickWinMeasures {
  const { width, height, cells } = data.grid
  const gridCells = Math.max(1, width * height)
  const stitched = cells.length

  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  const at = new Map<number, string>()
  for (const c of cells) {
    at.set(c.y * width + c.x, c.s)
    if (c.x < minX) minX = c.x
    if (c.x > maxX) maxX = c.x
    if (c.y < minY) minY = c.y
    if (c.y > maxY) maxY = c.y
  }
  const boxCells = maxX < 0 ? 0 : (maxX - minX + 1) * (maxY - minY + 1)

  // Solid areas: 4-connected runs of one colour. Four-connected rather than
  // eight, because a diagonal touch is not an area a needle works as one.
  const seen = new Uint8Array(width * height)
  let areas = 0
  let largest = 0
  const stack: number[] = []
  for (const c of cells) {
    const start = c.y * width + c.x
    if (seen[start]) continue
    const colour = c.s
    let size = 0
    stack.length = 0
    stack.push(start)
    seen[start] = 1
    while (stack.length > 0) {
      const i = stack.pop()!
      size++
      const x = i % width
      const y = (i - x) / width
      const neighbours = [
        x > 0 ? i - 1 : -1,
        x < width - 1 ? i + 1 : -1,
        y > 0 ? i - width : -1,
        y < height - 1 ? i + width : -1,
      ]
      for (const n of neighbours) {
        if (n < 0 || seen[n]) continue
        if (at.get(n) !== colour) continue
        seen[n] = 1
        stack.push(n)
      }
    }
    if (size >= QUICK_MIN_AREA_CELLS) areas++
    if (size > largest) largest = size
  }

  const colourCount = data.palette.length
  return {
    widthCells: width,
    heightCells: height,
    colourCount,
    stitchedShare: stitched / gridCells,
    boxShare: boxCells / gridCells,
    areas,
    areasPerColour: colourCount > 0 ? areas / colourCount : 0,
    dominantShare: stitched > 0 ? largest / stitched : 0,
    confettiShare: computeStitchabilityMetrics(data).confettiShare,
  }
}

/**
 * The verdict. Binary, and it collects every reason rather than stopping at the
 * first, because a chart that fails three of these is a different problem from
 * one that fails a single threshold by a hair.
 */
export function quickWinVerdict(data: PatternData): QuickWinVerdict {
  const m = measureQuickWin(data)
  const reasons: string[] = []
  const pct = (n: number): string => `${(n * 100).toFixed(0)}%`

  const longest = Math.max(m.widthCells, m.heightCells)
  if (longest < QUICK_MIN_CELLS || longest > QUICK_MAX_CELLS) {
    reasons.push(`${m.widthCells}×${m.heightCells} is outside the ${QUICK_MIN_CELLS}–${QUICK_MAX_CELLS} cell tier`)
  }
  if (m.colourCount < QUICK_MIN_COLOURS || m.colourCount > QUICK_MAX_COLOURS) {
    reasons.push(`${m.colourCount} flosses, outside the ${QUICK_MIN_COLOURS}–${QUICK_MAX_COLOURS} a one-evening make allows`)
  }
  if (m.boxShare < QUICK_MIN_BOX_SHARE) {
    reasons.push(`the motif fills only ${pct(m.boxShare)} of the frame — under ${pct(QUICK_MIN_BOX_SHARE)}, it reads as a speck`)
  }
  if (m.stitchedShare < QUICK_MIN_STITCHED_SHARE) {
    reasons.push(`only ${pct(m.stitchedShare)} of the grid is stitched — under ${pct(QUICK_MIN_STITCHED_SHARE)}, there is no picture`)
  }
  if (m.stitchedShare > QUICK_MAX_STITCHED_SHARE) {
    reasons.push(`${pct(m.stitchedShare)} of the grid is stitched — a full-coverage scene shrunk, not a motif on cloth`)
  }
  if (m.areasPerColour > QUICK_MAX_AREAS_PER_COLOUR) {
    reasons.push(`${m.areas} colour areas across ${m.colourCount} flosses (${m.areasPerColour.toFixed(1)} each) — scattered, not shapes`)
  }
  if (m.confettiShare > QUICK_MAX_CONFETTI) {
    reasons.push(`${pct(m.confettiShare)} single stitches — over ${pct(QUICK_MAX_CONFETTI)} at this size the shape has no edges`)
  }
  if (m.dominantShare < QUICK_MIN_DOMINANT_SHARE) {
    reasons.push(`the biggest colour area is ${pct(m.dominantShare)} of the stitching — no dominant shape to name`)
  }

  return { ok: reasons.length === 0, reasons, measures: m }
}
