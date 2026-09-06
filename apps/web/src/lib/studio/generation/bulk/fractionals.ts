/**
 * FRACTIONAL STITCHES — take the staircase off the diagonals.
 *
 * A cross-stitch grid can only draw a diagonal as a staircase, and at the scale
 * a chart is stitched that staircase is visible: a cheek, a petal edge, the
 * slope of a roof all come out as little steps. The fix every kit worth buying
 * uses is the quarter and three-quarter stitch — at the corner of a step, the
 * cell is shared between the two colours instead of going wholly to one, and
 * the edge reads as a line rather than a flight of stairs.
 *
 * This module finds those corners and shares those cells. It is a PURE function
 * over a finished chart, like the outline and the bare-fabric passes beside it.
 *
 * What counts as a corner: a cell of colour A whose left and top neighbours are
 * BOTH colour B, and whose top-left diagonal is B as well, sits in the concave
 * corner of B's staircase. Its top-left quarter belongs to B, and the rest of it
 * to A — so it becomes a three-quarter of A (missing the top-left) plus a
 * quarter of B (at the top-left), which together tile the cell exactly. The full
 * cross that was there is removed: the cell is worked as two fractionals now,
 * not as a cross with something on top.
 *
 * Three things keep it honest:
 *
 *   inside only   a boundary against BARE FABRIC is left alone. Sharing a cell
 *                 with the cloth erodes the silhouette, and the silhouette is
 *                 what the back-stitch outline is drawn along — the two would
 *                 disagree about where the edge is.
 *   regions       both colours have to be real areas, not two stray cells.
 *   contrast      a step you cannot see is not worth splitting a cell for.
 *
 * And a cap, taken strongest-contrast first: fractionals are slower to work
 * than whole crosses, so a chart gets them where they earn their keep.
 *
 * Pure: no `server-only`, no Prisma, no sharp. Tested on synthetic grids in
 * `fractionals.test.ts`.
 */

import type { CellQuadrant, FractionalStitch, PatternData } from '@homemade/db'
import { rgbToLab } from '@/lib/floss/equivalence-table'
import { looksLikeLineWork } from './outline'

// ───────────────────────────────────────────────────────────────────────────
// Tunables
// ───────────────────────────────────────────────────────────────────────────

/** Lab distance below which the step between two colours is not worth smoothing. */
export const MIN_STEP_DELTA_E = 26

/** Share of the stitched cells below which a colour region is texture, not an area. */
export const MIN_REGION_SHARE = 0.004

/** ...and never fewer than this many cells, whatever the chart's size. */
export const MIN_REGION_CELLS = 10

/**
 * The cap: share of a chart's stitches that may become fractionals.
 *
 * A quarter stitch takes about as long to work as a whole one — you are still
 * threading, placing and fastening — so a chart smoothed everywhere would cost
 * a stitcher a great deal of extra evening for a difference they would have to
 * look for. At 3% a 10,000-stitch chart gets 300 shared cells, which is enough
 * to take the steps off the faces and the strong diagonals and no more.
 */
export const MAX_FRACTIONAL_SHARE = 0.03

export interface FractionalOptions {
  minDeltaE?: number
  minRegionCells?: number
  maxShare?: number
}

export interface FractionalResult {
  data: PatternData
  /** Cells shared between two colours (each produces two fractional stitches). */
  cellsShared: number
  /** Fractional stitches emitted — two per shared cell. */
  stitches: number
  reason: string
}

type Lab = [number, number, number]

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!m?.[1]) return [0, 0, 0]
  const v = m[1]
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}

function deltaE(a: Lab, b: Lab): number {
  const dl = a[0] - b[0]
  const da = a[1] - b[1]
  const db = a[2] - b[2]
  return Math.sqrt(dl * dl + da * da + db * db)
}

/** Label same-colour 4-connected regions; -1 for bare fabric. */
function labelRegions(
  width: number,
  height: number,
  symbolAt: (i: number) => string | undefined,
): { label: Int32Array; size: number[] } {
  const label = new Int32Array(width * height).fill(-1)
  const size: number[] = []
  const stack: number[] = []
  for (let start = 0; start < width * height; start++) {
    if (label[start] !== -1) continue
    const s = symbolAt(start)
    if (s === undefined) continue
    const id = size.length
    size.push(0)
    label[start] = id
    stack.push(start)
    let n = 0
    while (stack.length > 0) {
      const i = stack.pop()!
      n++
      const x = i % width
      const y = (i - x) / width
      const push = (nx: number, ny: number): void => {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) return
        const j = ny * width + nx
        if (label[j] !== -1) return
        if (symbolAt(j) !== s) return
        label[j] = id
        stack.push(j)
      }
      push(x + 1, y)
      push(x - 1, y)
      push(x, y + 1)
      push(x, y - 1)
    }
    size[id] = n
  }
  return { label, size }
}

/** The four corners, each with the two orthogonal directions that meet there. */
const CORNERS: Array<{ q: CellQuadrant; dx: number; dy: number }> = [
  { q: 'tl', dx: -1, dy: -1 },
  { q: 'tr', dx: 1, dy: -1 },
  { q: 'bl', dx: -1, dy: 1 },
  { q: 'br', dx: 1, dy: 1 },
]

interface Candidate {
  x: number
  y: number
  q: CellQuadrant
  /** The cell's own colour — takes the three-quarter. */
  mine: string
  /** The colour rounding the corner — takes the quarter. */
  theirs: string
  contrast: number
}

/**
 * Share the corner cells of stair-stepped diagonals between the two colours
 * that meet there. Returns the chart unchanged when nothing qualifies, or when
 * it already carries fractionals — a chart is only ever smoothed once.
 */
export function deriveFractionals(
  data: PatternData,
  opts: FractionalOptions = {},
): FractionalResult {
  if (data.grid.fractional.length > 0) {
    return { data, cellsShared: 0, stitches: 0, reason: 'chart already carries fractional stitches' }
  }
  const { width, height, cells } = data.grid
  if (cells.length === 0) return { data, cellsShared: 0, stitches: 0, reason: 'empty chart' }

  const minDeltaE = opts.minDeltaE ?? MIN_STEP_DELTA_E
  const minRegion =
    opts.minRegionCells ?? Math.max(MIN_REGION_CELLS, Math.round(cells.length * MIN_REGION_SHARE))
  const budget = Math.floor(cells.length * (opts.maxShare ?? MAX_FRACTIONAL_SHARE))
  if (budget < 1) return { data, cellsShared: 0, stitches: 0, reason: 'chart too small to smooth' }

  const at = new Map<number, string>()
  for (const c of cells) at.set(c.y * width + c.x, c.s)
  const symOf = (i: number): string | undefined => at.get(i)
  const sym = (x: number, y: number): string | undefined => {
    if (x < 0 || y < 0 || x >= width || y >= height) return undefined
    return at.get(y * width + x)
  }

  const lab = new Map<string, Lab>()
  for (const p of data.palette) {
    const [r, g, b] = hexToRgb(p.rgb)
    lab.set(p.symbol, rgbToLab(r, g, b))
  }

  const { label, size } = labelRegions(width, height, symOf)
  const bigRegion = (x: number, y: number): boolean => {
    const id = label[y * width + x]
    return id !== undefined && id >= 0 && (size[id] ?? 0) >= minRegion
  }

  const candidates: Candidate[] = []
  const taken = new Set<number>()
  for (const c of cells) {
    const mine = c.s
    const myLab = lab.get(mine)
    if (!myLab) continue
    if (!bigRegion(c.x, c.y)) continue

    for (const corner of CORNERS) {
      const sideA = sym(c.x + corner.dx, c.y)
      const sideB = sym(c.x, c.y + corner.dy)
      const diag = sym(c.x + corner.dx, c.y + corner.dy)
      // The corner has to be a corner: both arms and the diagonal one colour,
      // and that colour not this cell's own.
      if (sideA === undefined || sideA !== sideB || sideA !== diag || sideA === mine) continue
      // ...and the cell has to be part of a run of its own colour the other way,
      // or it is a lone pixel rather than a step on a diagonal.
      if (sym(c.x - corner.dx, c.y) !== mine && sym(c.x, c.y - corner.dy) !== mine) continue

      const theirs = sideA
      const theirLab = lab.get(theirs)
      if (!theirLab) continue
      if (!bigRegion(c.x + corner.dx, c.y + corner.dy)) continue
      const contrast = deltaE(myLab, theirLab)
      if (contrast < minDeltaE) continue

      candidates.push({ x: c.x, y: c.y, q: corner.q, mine, theirs, contrast })
    }
  }

  if (candidates.length === 0) {
    return { data, cellsShared: 0, stitches: 0, reason: 'no stair-stepped diagonals worth sharing' }
  }

  // Strongest step first, deterministic on ties so a re-run is the same chart.
  // One cell is only ever shared once: a cell in two corners at once is the tip
  // of a spike, and sharing it twice would stitch it twice.
  candidates.sort((a, b) => b.contrast - a.contrast || a.y - b.y || a.x - b.x || a.q.localeCompare(b.q))
  const chosen: Candidate[] = []
  for (const cand of candidates) {
    if (chosen.length >= budget) break
    const key = cand.y * width + cand.x
    if (taken.has(key)) continue
    taken.add(key)
    chosen.push(cand)
  }

  const fractional: FractionalStitch[] = []
  for (const cand of chosen) {
    fractional.push({ x: cand.x, y: cand.y, q: cand.q, k: 'threeQuarter', s: cand.mine })
    fractional.push({ x: cand.x, y: cand.y, q: cand.q, k: 'quarter', s: cand.theirs })
  }
  // The shared cells are worked as two fractionals now, so the full cross goes.
  const nextCells = cells.filter((c) => !taken.has(c.y * width + c.x))

  return {
    data: { ...data, grid: { ...data.grid, cells: nextCells, fractional } },
    cellsShared: chosen.length,
    stitches: fractional.length,
    reason: `${chosen.length} step corner${chosen.length === 1 ? '' : 's'} shared between two colours`,
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Who gets smoothed
// ───────────────────────────────────────────────────────────────────────────

/**
 * Should this chart be smoothed at all?
 *
 * Everything except line work. Delft and blackwork draw their diagonals as
 * steps on purpose — the blockiness IS the style, and a shared cell in one
 * would look like a mistake. Everything else, at any size, gains from it: the
 * dense showpiece tier most of all, because that is where the diagonals are.
 */
export function smoothingWantedFor(
  data: PatternData,
  ctx: { shelf?: string | null } = {},
): { yes: boolean; reason: string } {
  if (data.grid.fractional.length > 0) {
    return { yes: false, reason: 'chart already carries fractional stitches' }
  }
  if (ctx.shelf === 'monochrome') return { yes: false, reason: 'the monochrome shelf is line work' }
  const lineWork = looksLikeLineWork(data)
  if (lineWork.yes) return { yes: false, reason: lineWork.reason }
  return { yes: true, reason: 'stair-stepped diagonals are worth smoothing' }
}
