/**
 * Hit-testing the line and point work on a chart.
 *
 * Cells are trivial to hit: divide by the cell size and floor. Back-stitch,
 * French knots and fractional stitches are not — a back-stitch segment is a
 * line with no width to speak of, a knot is a dot a third of a square across,
 * and a fractional covers a corner of a square rather than the square. This
 * module is the whole geometry, kept pure: no React, no DOM, no store, so it
 * can be tested straight from a script.
 *
 * Everything works in CELL UNITS — the pointer position converted to
 * fractional grid coordinates — so the maths does not care what the zoom is.
 * The zoom only decides the tolerance: `toleranceInCells` turns a fingertip
 * measured in screen pixels into the distance in squares it covers, which is
 * generous when zoomed out and tight when zoomed in, exactly as a stitcher
 * expects.
 *
 * Order of precedence when a tap could mean two things: whatever is drawn on
 * top wins, because that is the thing the stitcher is looking at. The canvas
 * paints cells, then fractionals, then back-stitch, then knots — so a tap
 * that is both on a cell and near a line goes to the line.
 */

import {
  backstitchKey,
  fractionalKey,
  frenchKnotKey,
  type BackstitchSegment,
  type CellQuadrant,
  type FractionalStitch,
  type FrenchKnot,
  type PatternData,
} from '@homemade/db/pattern'

/**
 * How wide a fingertip is, in screen pixels. Apple and Google both put the
 * smallest comfortable touch target at around 44px across, so half of that is
 * how far from a line a thumb can land and still mean it.
 */
export const TOUCH_TOLERANCE_PX = 11

/**
 * Floor and ceiling on the tolerance in cell units. The floor stops a very
 * deep zoom demanding pixel-perfect aim; the ceiling stops a chart zoomed
 * right out from grabbing a line the stitcher never went near — at a fifth of
 * a screen pixel per square, 11px would otherwise reach fifty squares.
 */
export const MIN_TOLERANCE_CELLS = 0.1
export const MAX_TOLERANCE_CELLS = 1.2

/** How far from a knot's centre a tap still counts, in cell units. Matches
 *  `frenchKnotRadius` (0.28 of a cell) with a little room around it. */
export const KNOT_RADIUS_CELLS = 0.28

/** A piece of line or point work a tap landed on. */
export type ChartHit =
  | { kind: 'backstitch'; index: number; key: string; distance: number }
  | { kind: 'knot'; index: number; key: string; distance: number }
  | { kind: 'fractional'; index: number; key: string; distance: number }

export interface HitTestOptions {
  /** Pointer position in cell units (fractional grid coordinates). */
  x: number
  y: number
  /** Cell size on screen, in pixels: `DEFAULT_CELL_PX * viewport.scale`. */
  scaledCellPx: number
  /** Layers that are switched off cannot be tapped — nothing is drawn there. */
  layers?: { backstitch?: boolean; frenchKnots?: boolean; fractional?: boolean }
  /** Isolating a colour hides the rest, so the rest cannot be tapped either. */
  isolate?: string | null
  /**
   * Display mode filter. `stitched` and `remaining` hide half the chart; what
   * is hidden cannot be tapped. Given the progress set, this decides whether
   * an element is on screen at all.
   */
  displayMode?: 'all' | 'stitched' | 'remaining'
  stitched?: ReadonlySet<string>
}

/**
 * A fingertip in cell units. `scaledCellPx` is how many screen pixels one
 * square covers right now, so the tolerance shrinks as the chart is zoomed in.
 */
export function toleranceInCells(scaledCellPx: number, touchPx = TOUCH_TOLERANCE_PX): number {
  if (!(scaledCellPx > 0)) return MAX_TOLERANCE_CELLS
  const raw = touchPx / scaledCellPx
  return Math.min(MAX_TOLERANCE_CELLS, Math.max(MIN_TOLERANCE_CELLS, raw))
}

/**
 * Shortest distance from a point to a line SEGMENT (not to the infinite line
 * through it), in the same units the inputs are given in. The clamp on `t` is
 * what makes it the segment: past either end, the nearest point is that end.
 */
export function pointSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1
  const dy = y2 - y1
  const lengthSquared = dx * dx + dy * dy
  if (lengthSquared === 0) return Math.hypot(px - x1, py - y1)
  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared
  t = t < 0 ? 0 : t > 1 ? 1 : t
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

/** Which quarter of its square a point in cell units falls in. */
export function quadrantAt(x: number, y: number): CellQuadrant {
  const fx = x - Math.floor(x)
  const fy = y - Math.floor(y)
  if (fy < 0.5) return fx < 0.5 ? 'tl' : 'tr'
  return fx < 0.5 ? 'bl' : 'br'
}

/**
 * Does a point land on the area this fractional stitch covers?
 *
 * A quarter stitch covers the quadrant at its corner. A three-quarter covers
 * everything except that quadrant — the L-shaped rest of the square. (Neither
 * is a triangle: the thread runs corner-to-centre, and the area of cloth it
 * takes is the quadrant square.)
 */
export function pointInFractional(
  x: number,
  y: number,
  f: Pick<FractionalStitch, 'x' | 'y' | 'q' | 'k'>,
): boolean {
  if (Math.floor(x) !== f.x || Math.floor(y) !== f.y) return false
  const q = quadrantAt(x, y)
  return f.k === 'quarter' ? q === f.q : q !== f.q
}

function hiddenByDisplayMode(
  key: string,
  opts: Pick<HitTestOptions, 'displayMode' | 'stitched'>,
): boolean {
  const mode = opts.displayMode ?? 'all'
  if (mode === 'all') return false
  const done = opts.stitched?.has(key) ?? false
  return mode === 'stitched' ? !done : done
}

/**
 * The piece of line or point work a tap landed on, or null when it landed on
 * bare chart. Nearest-within-tolerance, and where two kinds both answer, the
 * one drawn on top wins: knots, then back-stitch, then fractionals.
 *
 * One linear pass per layer. A 600-square chart with four thousand segments
 * is a few thousand distance calculations, which is far below a frame even on
 * a phone, so there is no spatial index to keep in step with edits.
 */
export function hitTestLineWork(pattern: PatternData, opts: HitTestOptions): ChartHit | null {
  const tolerance = toleranceInCells(opts.scaledCellPx)
  const layers = opts.layers ?? {}
  const isolate = opts.isolate ?? null
  const filtered = (opts.displayMode ?? 'all') !== 'all'
  // The geometry is tested before the key is built. Writing a key costs a
  // string per element, and a tap on a chart with thousands of segments has
  // no business writing thousands of strings to find the one it landed on.
  const shown = (key: string) => !filtered || !hiddenByDisplayMode(key, opts)

  // French knots sit on top of everything else.
  if (layers.frenchKnots !== false) {
    const reach = KNOT_RADIUS_CELLS + Math.min(tolerance, 0.25)
    let bestIndex = -1
    let bestDistance = Infinity
    const knots: FrenchKnot[] = pattern.grid.frenchKnots
    for (let i = 0; i < knots.length; i++) {
      const knot = knots[i]!
      if (isolate && knot.s !== isolate) continue
      const distance = Math.hypot(opts.x - (knot.x + 0.5), opts.y - (knot.y + 0.5))
      if (distance > reach || distance >= bestDistance) continue
      if (!shown(frenchKnotKey(knot))) continue
      bestIndex = i
      bestDistance = distance
    }
    if (bestIndex >= 0) {
      const knot = knots[bestIndex]!
      return { kind: 'knot', index: bestIndex, key: frenchKnotKey(knot), distance: bestDistance }
    }
  }

  // Then the outline, which is drawn over the cells: a tap that is both on a
  // square and near a line means the line.
  if (layers.backstitch !== false) {
    let bestIndex = -1
    let bestDistance = Infinity
    const segments: BackstitchSegment[] = pattern.grid.backstitch
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]!
      if (isolate && seg.s !== isolate) continue
      // A cheap box test before the distance: a segment whose bounding box is
      // further away than the tolerance cannot be the one under the finger,
      // and most of a big chart's outline is nowhere near any given tap.
      if (
        opts.x < Math.min(seg.x1, seg.x2) - tolerance ||
        opts.x > Math.max(seg.x1, seg.x2) + tolerance ||
        opts.y < Math.min(seg.y1, seg.y2) - tolerance ||
        opts.y > Math.max(seg.y1, seg.y2) + tolerance
      ) {
        continue
      }
      const distance = pointSegmentDistance(opts.x, opts.y, seg.x1, seg.y1, seg.x2, seg.y2)
      if (distance > tolerance || distance >= bestDistance) continue
      if (!shown(backstitchKey(seg))) continue
      bestIndex = i
      bestDistance = distance
    }
    if (bestIndex >= 0) {
      const seg = segments[bestIndex]!
      return {
        kind: 'backstitch',
        index: bestIndex,
        key: backstitchKey(seg),
        distance: bestDistance,
      }
    }
  }

  // Then the fractional stitches, which are areas rather than lines, so a tap
  // either lands inside one or it does not. A square holding one fractional
  // and nothing else answers anywhere inside it — a quarter stitch in the
  // corner of a square is too small a target otherwise.
  if (layers.fractional !== false && pattern.grid.fractional.length > 0) {
    const cx = Math.floor(opts.x)
    const cy = Math.floor(opts.y)
    const inCell: number[] = []
    const fractionals: FractionalStitch[] = pattern.grid.fractional
    for (let i = 0; i < fractionals.length; i++) {
      const f = fractionals[i]!
      if (f.x !== cx || f.y !== cy) continue
      if (isolate && f.s !== isolate) continue
      if (!shown(fractionalKey(f))) continue
      inCell.push(i)
    }
    if (inCell.length === 1) {
      const index = inCell[0]!
      const f = pattern.grid.fractional[index]!
      return { kind: 'fractional', index, key: fractionalKey(f), distance: 0 }
    }
    for (const index of inCell) {
      const f = pattern.grid.fractional[index]!
      if (pointInFractional(opts.x, opts.y, f)) {
        return { kind: 'fractional', index, key: fractionalKey(f), distance: 0 }
      }
    }
  }

  return null
}

/**
 * Every back-stitch segment a drag passed over, in the order it met them.
 * This is the "mark the run" gesture for line work: hold and draw along an
 * outline and the segments under the finger are ticked off, the same way
 * dragging with the mark-stitched tool ticks off a run of squares.
 *
 * Takes the pointer's previous and current positions so a fast drag cannot
 * skip a short segment between two samples: the test is segment-to-segment
 * distance, not point-to-segment.
 */
export function segmentsCrossedBy(
  pattern: PatternData,
  from: { x: number; y: number },
  to: { x: number; y: number },
  opts: HitTestOptions,
): number[] {
  const tolerance = toleranceInCells(opts.scaledCellPx)
  const isolate = opts.isolate ?? null
  const filtered = (opts.displayMode ?? 'all') !== 'all'
  if (opts.layers?.backstitch === false) return []
  const out: number[] = []
  const segments: BackstitchSegment[] = pattern.grid.backstitch
  const minX = Math.min(from.x, to.x) - tolerance
  const maxX = Math.max(from.x, to.x) + tolerance
  const minY = Math.min(from.y, to.y) - tolerance
  const maxY = Math.max(from.y, to.y) + tolerance
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!
    if (isolate && seg.s !== isolate) continue
    if (
      Math.max(seg.x1, seg.x2) < minX ||
      Math.min(seg.x1, seg.x2) > maxX ||
      Math.max(seg.y1, seg.y2) < minY ||
      Math.min(seg.y1, seg.y2) > maxY
    ) {
      continue
    }
    if (segmentDistance(from.x, from.y, to.x, to.y, seg.x1, seg.y1, seg.x2, seg.y2) > tolerance) {
      continue
    }
    if (filtered && hiddenByDisplayMode(backstitchKey(seg), opts)) continue
    out.push(i)
  }
  return out
}

/**
 * Shortest distance between two line segments. Crossing segments are zero
 * apart; otherwise the nearest pair of points is on an endpoint of one of
 * them, which is the four-way minimum below.
 */
export function segmentDistance(
  ax1: number,
  ay1: number,
  ax2: number,
  ay2: number,
  bx1: number,
  by1: number,
  bx2: number,
  by2: number,
): number {
  if (segmentsIntersect(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2)) return 0
  return Math.min(
    pointSegmentDistance(ax1, ay1, bx1, by1, bx2, by2),
    pointSegmentDistance(ax2, ay2, bx1, by1, bx2, by2),
    pointSegmentDistance(bx1, by1, ax1, ay1, ax2, ay2),
    pointSegmentDistance(bx2, by2, ax1, ay1, ax2, ay2),
  )
}

function orientation(px: number, py: number, qx: number, qy: number, rx: number, ry: number): number {
  const v = (qy - py) * (rx - qx) - (qx - px) * (ry - qy)
  return v === 0 ? 0 : v > 0 ? 1 : 2
}

function onSegment(px: number, py: number, qx: number, qy: number, rx: number, ry: number): boolean {
  return (
    qx <= Math.max(px, rx) &&
    qx >= Math.min(px, rx) &&
    qy <= Math.max(py, ry) &&
    qy >= Math.min(py, ry)
  )
}

function segmentsIntersect(
  ax1: number,
  ay1: number,
  ax2: number,
  ay2: number,
  bx1: number,
  by1: number,
  bx2: number,
  by2: number,
): boolean {
  const o1 = orientation(ax1, ay1, ax2, ay2, bx1, by1)
  const o2 = orientation(ax1, ay1, ax2, ay2, bx2, by2)
  const o3 = orientation(bx1, by1, bx2, by2, ax1, ay1)
  const o4 = orientation(bx1, by1, bx2, by2, ax2, ay2)
  if (o1 !== o2 && o3 !== o4) return true
  if (o1 === 0 && onSegment(ax1, ay1, bx1, by1, ax2, ay2)) return true
  if (o2 === 0 && onSegment(ax1, ay1, bx2, by2, ax2, ay2)) return true
  if (o3 === 0 && onSegment(bx1, by1, ax1, ay1, bx2, by2)) return true
  if (o4 === 0 && onSegment(bx1, by1, ax2, ay2, bx2, by2)) return true
  return false
}
