/**
 * Pure SVG rendering helpers for the chart engine. No React, no hooks,
 * no state — the helpers take pattern data + transform + viewport and
 * return SVG strings or React-ready element descriptors. Kept pure so
 * the same logic powers live editing, static thumbnails (server SSR),
 * PDF chart pages, and unit tests.
 *
 * Rendering principle: the pattern is the hero. The chrome (grid, ruler,
 * crosshairs) is faint and considered; the stitches themselves carry
 * weight. We render each cell as two diagonal strokes with tiny
 * deterministic jitter so the chart reads hand-stitched rather than
 * Excel-cell mechanical, and we layer a subtle highlight diagonal on
 * top to imply strand thickness.
 *
 * Performance:
 * - At effective cell size < 6px (very low zoom) the renderer collapses
 *   each cell to a filled rect so 80×100 patterns still scroll at 60fps.
 * - Layers are grouped by colour so the SVG paint pass batches strokes.
 */

import type { PatternData, PaletteEntry, CellQuadrant, FractionalStitch } from '@homemade/db/pattern'

export const DEFAULT_CELL_PX = 32
export const LOW_ZOOM_THRESHOLD = 6
export const RENDER_PRECISION = 2

/** Container width at or below which the chart is being worked on a phone.
 *  Matches the Studio stylesheet's mobile breakpoint. */
export const NARROW_CONTAINER_PX = 720

/**
 * The line under which fitting the whole chart stops being a useful first
 * view. It is `LOW_ZOOM_THRESHOLD` on purpose: that is where the renderer
 * gives up on symbols and collapses every square to a flat rect, so below
 * it the chart has stopped reading as a chart and a square is far too
 * small to tap. A 210-cell chart fitted on a 390px phone lands at under two
 * pixels a square, which is what the mobile audit found.
 */
export const FIT_FLOOR_CELL_PX = LOW_ZOOM_THRESHOLD

/**
 * Where a phone starts instead: a cell size you can put a fingertip on,
 * centred on the chart's middle (the crosshair) which is where a counted
 * piece is started from.
 */
export const FIRST_VIEW_CELL_PX = 26

/** Deterministic hash producing [0, 1) from (x, y, axis). Avoids the
 *  shimmer of Math.random() on re-render — stitches stay put. */
function hash01(x: number, y: number, axis: number): number {
  let h = (x | 0) * 374761393 + (y | 0) * 668265263 + (axis | 0) * 1442695040
  h = ((h ^ (h >>> 13)) * 1274126177) | 0
  h = (h ^ (h >>> 16)) >>> 0
  return h / 0xffffffff
}

/** ±jitterFraction of cell size, centred at 0. */
function jitter(x: number, y: number, axis: number, jitterFraction: number): number {
  return (hash01(x, y, axis) - 0.5) * 2 * jitterFraction
}

/** Lighten / darken a #RRGGBB hex by a percentage in [-1, 1]. */
export function shiftColour(hex: string, amount: number): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!m || !m[1]) return hex
  const v = m[1]
  const r = parseInt(v.slice(0, 2), 16)
  const g = parseInt(v.slice(2, 4), 16)
  const b = parseInt(v.slice(4, 6), 16)
  const shift = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c + (amount > 0 ? 255 - c : c) * amount)))
  const out = (shift(r) << 16) | (shift(g) << 8) | shift(b)
  return '#' + out.toString(16).padStart(6, '0')
}

/**
 * Blend two #RRGGBB colours. `t` is how far to travel from `a` to `b`, so
 * `mixColour(floss, fabric, 0.55)` is the washed-out tone worked line and
 * point work is drawn in — the colour is still recognisably the floss, but
 * it has plainly been covered.
 */
export function mixColour(a: string, b: string, t: number): string {
  const pa = /^#?([0-9a-fA-F]{6})$/.exec(a)
  const pb = /^#?([0-9a-fA-F]{6})$/.exec(b)
  if (!pa?.[1] || !pb?.[1]) return a
  const k = t < 0 ? 0 : t > 1 ? 1 : t
  const channel = (i: number) => {
    const ca = parseInt(pa[1]!.slice(i, i + 2), 16)
    const cb = parseInt(pb[1]!.slice(i, i + 2), 16)
    return Math.max(0, Math.min(255, Math.round(ca + (cb - ca) * k)))
  }
  const out = (channel(0) << 16) | (channel(2) << 8) | channel(4)
  return '#' + out.toString(16).padStart(6, '0')
}

/** Returns 'dark' or 'light' depending on the perceived brightness of
 *  the given hex colour. Used to pick a legible symbol-overlay colour. */
export function symbolOnFill(hex: string): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!m || !m[1]) return '#302a24'
  const v = m[1]
  const r = parseInt(v.slice(0, 2), 16)
  const g = parseInt(v.slice(2, 4), 16)
  const b = parseInt(v.slice(4, 6), 16)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.58 ? '#1a1410' : '#fafafa'
}

/**
 * Stroke width for one back-stitch line, in pixels.
 *
 * Back-stitch is worked in one or two strands against two for a full cross, so
 * on the cloth it reads at roughly two thirds the weight of a stitch arm — a
 * definite line, not a hair. The renderer's cross body is `cellPx * 0.22`, so
 * the outline sits just under two thirds of that. The floor keeps the line
 * visible when a whole 200-cell chart is squeezed into a 1,000px thumbnail,
 * which is exactly where the first draft's `cellPx * 0.08` vanished.
 */
export function backstitchStrokeWidth(cellPx: number, mode: 'beauty' | 'chart' = 'chart'): number {
  return Math.max(1.6, cellPx * (mode === 'beauty' ? 0.15 : 0.12))
}

/** Radius of a French knot, in pixels. A knot sits proud of about half a cell. */
export function frenchKnotRadius(cellPx: number): number {
  return cellPx * 0.28
}

export interface PaletteIndex {
  bySymbol: Map<string, PaletteEntry & { index: number }>
}

export function buildPaletteIndex(pattern: PatternData): PaletteIndex {
  const bySymbol = new Map<string, PaletteEntry & { index: number }>()
  pattern.palette.forEach((entry, index) => {
    bySymbol.set(entry.symbol, { ...entry, index })
  })
  return { bySymbol }
}

// ───────────────────────────────────────────────────────────────────────────
// Path builders — return raw SVG `d` strings the renderer composites in.
// ───────────────────────────────────────────────────────────────────────────

/**
 * Build the X path for one full cross-stitch cell at grid coordinate
 * (x, y) sized at `cellPx` pixels per cell. Adds deterministic jitter
 * to each endpoint so the chart reads hand-stitched. Returns the path
 * `d` attribute string.
 */
export function buildCellCrossPath(
  x: number,
  y: number,
  cellPx: number,
): string {
  const J = 0.06
  const j = (axis: number) => jitter(x, y, axis, J)
  const px = x * cellPx
  const py = y * cellPx
  const c = cellPx
  const x1a = px + j(1) * c
  const y1a = py + j(2) * c
  const x1b = px + (1 - j(3)) * c
  const y1b = py + (1 - j(4)) * c
  const x2a = px + (1 - j(5)) * c
  const y2a = py + j(6) * c
  const x2b = px + j(7) * c
  const y2b = py + (1 - j(8)) * c
  const r = RENDER_PRECISION
  return (
    `M${x1a.toFixed(r)} ${y1a.toFixed(r)} L${x1b.toFixed(r)} ${y1b.toFixed(r)} ` +
    `M${x2a.toFixed(r)} ${y2a.toFixed(r)} L${x2b.toFixed(r)} ${y2b.toFixed(r)}`
  )
}

/**
 * Build the highlight overlay stroke for one cell — a single thin
 * diagonal at a slightly brighter shade, offset to imply strand
 * thickness picking up the light.
 */
export function buildCellHighlightPath(
  x: number,
  y: number,
  cellPx: number,
): string {
  const J = 0.04
  const j = (axis: number) => jitter(x, y, axis + 10, J)
  const px = x * cellPx
  const py = y * cellPx
  const c = cellPx
  const offset = c * 0.12
  const r = RENDER_PRECISION
  return (
    `M${(px + j(1) * c + offset).toFixed(r)} ${(py + j(2) * c).toFixed(r)} ` +
    `L${(px + (1 - j(3)) * c).toFixed(r)} ${(py + (1 - j(4)) * c - offset).toFixed(r)}`
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Fractional stitches
// ───────────────────────────────────────────────────────────────────────────

/** Corner offsets of each quadrant, in cell units. */
const QUADRANT_CORNER: Record<CellQuadrant, [number, number]> = {
  tl: [0, 0],
  tr: [1, 0],
  bl: [0, 1],
  br: [1, 1],
}

const OPPOSITE_QUADRANT: Record<CellQuadrant, CellQuadrant> = {
  tl: 'br',
  tr: 'bl',
  bl: 'tr',
  br: 'tl',
}

/**
 * The AREA a fractional stitch covers, as an SVG path.
 *
 * A quarter stitch covers the quarter of the cell at its corner; a three-quarter
 * covers everything except that quarter, which is the L-shaped rest. Together
 * they tile the cell, which is what lets a stair-stepped diagonal be worked as
 * a smooth one. Used by the printed chart and the low-zoom viewport, where a
 * cell is a block of colour rather than a drawn stitch.
 */
export function fractionalAreaPath(
  f: Pick<FractionalStitch, 'x' | 'y' | 'q' | 'k'>,
  cellPx: number,
): string {
  const px = f.x * cellPx
  const py = f.y * cellPx
  const c = cellPx
  const [qx, qy] = QUADRANT_CORNER[f.q]
  const cornerX = px + qx * c
  const cornerY = py + qy * c
  const midX = px + c / 2
  const midY = py + c / 2
  if (f.k === 'quarter') {
    // The quadrant square: from the cell's corner to the cell's centre.
    const ax = Math.min(cornerX, midX)
    const bx = Math.max(cornerX, midX)
    const ay = Math.min(cornerY, midY)
    const by = Math.max(cornerY, midY)
    return `M${ax} ${ay}L${bx} ${ay}L${bx} ${by}L${ax} ${by}Z`
  }
  // Everything but that quadrant: walk the cell's outline, cutting the corner.
  const x0 = px
  const y0 = py
  const x1 = px + c
  const y1 = py + c
  const corners: [number, number][] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ]
  const skipIndex = { tl: 0, tr: 1, br: 2, bl: 3 }[f.q]
  const pts: [number, number][] = []
  for (let i = 0; i < 4; i++) {
    if (i === skipIndex) {
      // Replace the corner with the two half-edge points and the centre.
      const prev = corners[(i + 3) % 4]!
      const next = corners[(i + 1) % 4]!
      const here = corners[i]!
      pts.push([(here[0] + prev[0]) / 2, (here[1] + prev[1]) / 2])
      pts.push([midX, midY])
      pts.push([(here[0] + next[0]) / 2, (here[1] + next[1]) / 2])
      continue
    }
    pts.push(corners[i]!)
  }
  return `M${pts.map(([x, y]) => `${x} ${y}`).join('L')}Z`
}

/**
 * The THREAD a fractional stitch lays down, as an SVG path — the beauty-mode
 * view, where a stitch is drawn rather than blocked in.
 *
 * A quarter stitch is one leg of a cross cut in half: corner to centre. A
 * three-quarter is a full diagonal across the cell plus a half leg reaching in
 * from the opposite corner, which is exactly what the needle does.
 */
export function fractionalThreadPath(
  f: Pick<FractionalStitch, 'x' | 'y' | 'q' | 'k'>,
  cellPx: number,
): string {
  const px = f.x * cellPx
  const py = f.y * cellPx
  const c = cellPx
  const midX = px + c / 2
  const midY = py + c / 2
  const at = (q: CellQuadrant): [number, number] => {
    const [qx, qy] = QUADRANT_CORNER[q]
    return [px + qx * c, py + qy * c]
  }
  if (f.k === 'quarter') {
    const [cx, cy] = at(f.q)
    return `M${cx} ${cy}L${midX} ${midY}`
  }
  // The full diagonal that misses this quadrant, plus the quarter leg from the
  // opposite corner.
  const diagonal: [CellQuadrant, CellQuadrant] =
    f.q === 'tl' || f.q === 'br' ? ['tr', 'bl'] : ['tl', 'br']
  const [ax, ay] = at(diagonal[0])
  const [bx, by] = at(diagonal[1])
  const [ox, oy] = at(OPPOSITE_QUADRANT[f.q])
  return `M${ax} ${ay}L${bx} ${by}M${ox} ${oy}L${midX} ${midY}`
}

/** Where a fractional stitch's symbol sits — the middle of the area it covers. */
export function fractionalSymbolAnchor(
  f: Pick<FractionalStitch, 'x' | 'y' | 'q' | 'k'>,
  cellPx: number,
): { x: number; y: number } {
  const [qx, qy] = QUADRANT_CORNER[f.q]
  const sign = f.k === 'quarter' ? 1 : -1
  // A quarter sits in its own corner; a three-quarter sits away from the corner
  // it is missing.
  return {
    x: f.x * cellPx + cellPx * (0.5 + sign * (qx === 0 ? -0.22 : 0.22)),
    y: f.y * cellPx + cellPx * (0.5 + sign * (qy === 0 ? -0.22 : 0.22)),
  }
}

/** Group fractional stitches by palette symbol, palette order first. */
export function groupFractionalsBySymbol(
  pattern: PatternData,
): Map<string, FractionalStitch[]> {
  const out = new Map<string, FractionalStitch[]>()
  for (const entry of pattern.palette) out.set(entry.symbol, [])
  for (const f of pattern.grid.fractional) {
    const bucket = out.get(f.s)
    if (bucket) bucket.push(f)
    else out.set(f.s, [f])
  }
  return out
}

/**
 * Compute the tight bounding box of every stitched cell + back-stitch
 * endpoint + French knot + bead in a pattern. Returns null when the
 * pattern is empty. Used by the thumbnail / hero renderer to crop the
 * frame to the actual subject instead of showing the whole empty
 * grid.
 *
 * Coordinates are inclusive — `maxX` is the highest x-index of any
 * cell, not one past it; the renderer adds +1 to convert to width.
 */
export function stitchedBoundingBox(pattern: PatternData): {
  minX: number
  minY: number
  maxX: number
  maxY: number
} | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let touched = false
  for (const cell of pattern.grid.cells) {
    if (cell.x < minX) minX = cell.x
    if (cell.y < minY) minY = cell.y
    if (cell.x > maxX) maxX = cell.x
    if (cell.y > maxY) maxY = cell.y
    touched = true
  }
  for (const seg of pattern.grid.backstitch) {
    const xs = [seg.x1, seg.x2]
    const ys = [seg.y1, seg.y2]
    for (const x of xs) {
      const fx = Math.floor(x)
      const cx = Math.ceil(x) - 1
      if (fx < minX) minX = fx
      if (cx > maxX) maxX = cx
    }
    for (const y of ys) {
      const fy = Math.floor(y)
      const cy = Math.ceil(y) - 1
      if (fy < minY) minY = fy
      if (cy > maxY) maxY = cy
    }
    touched = true
  }
  for (const k of pattern.grid.frenchKnots) {
    if (k.x < minX) minX = k.x
    if (k.y < minY) minY = k.y
    if (k.x > maxX) maxX = k.x
    if (k.y > maxY) maxY = k.y
    touched = true
  }
  for (const b of pattern.grid.beads) {
    if (b.x < minX) minX = b.x
    if (b.y < minY) minY = b.y
    if (b.x > maxX) maxX = b.x
    if (b.y > maxY) maxY = b.y
    touched = true
  }
  for (const f of pattern.grid.fractional) {
    if (f.x < minX) minX = f.x
    if (f.y < minY) minY = f.y
    if (f.x > maxX) maxX = f.x
    if (f.y > maxY) maxY = f.y
    touched = true
  }
  if (!touched) return null
  return {
    minX: Math.max(0, minX),
    minY: Math.max(0, minY),
    maxX: Math.min(pattern.grid.width - 1, maxX),
    maxY: Math.min(pattern.grid.height - 1, maxY),
  }
}

/**
 * Group cells by palette symbol so the renderer can emit one <g>
 * per colour, set `color` / `stroke` once, and let the browser batch
 * the paint pass. Returns a Map preserving palette insertion order.
 */
export function groupCellsBySymbol(
  pattern: PatternData,
): Map<string, { x: number; y: number }[]> {
  const out = new Map<string, { x: number; y: number }[]>()
  for (const entry of pattern.palette) out.set(entry.symbol, [])
  for (const cell of pattern.grid.cells) {
    let bucket = out.get(cell.s)
    if (!bucket) {
      bucket = []
      out.set(cell.s, bucket)
    }
    bucket.push({ x: cell.x, y: cell.y })
  }
  return out
}

/**
 * Pre-built composite path for an entire colour bucket — every cell's
 * X-strokes concatenated. The renderer emits one <path> per colour,
 * which beats one <path> per cell by 10-20x in DOM cost.
 */
export function buildBucketCrossPath(
  cells: { x: number; y: number }[],
  cellPx: number,
): string {
  if (cells.length === 0) return ''
  const parts: string[] = []
  for (const { x, y } of cells) {
    parts.push(buildCellCrossPath(x, y, cellPx))
  }
  return parts.join(' ')
}

export function buildBucketHighlightPath(
  cells: { x: number; y: number }[],
  cellPx: number,
): string {
  if (cells.length === 0) return ''
  const parts: string[] = []
  for (const { x, y } of cells) {
    parts.push(buildCellHighlightPath(x, y, cellPx))
  }
  return parts.join(' ')
}

// ───────────────────────────────────────────────────────────────────────────
// Pan + zoom math
// ───────────────────────────────────────────────────────────────────────────

export interface Viewport {
  /** Pixel offset of the world origin in screen space. */
  panX: number
  panY: number
  /** Zoom factor — 1 means cellPx = DEFAULT_CELL_PX on screen. */
  scale: number
}

export const DEFAULT_VIEWPORT: Viewport = { panX: 0, panY: 0, scale: 1 }

/** Convert a screen-space point (relative to the SVG bounds) into the
 *  world cell coordinate the user is pointing at. Integer cell index. */
export function screenToCell(
  screenX: number,
  screenY: number,
  viewport: Viewport,
  cellPx: number = DEFAULT_CELL_PX,
): { x: number; y: number } {
  const point = screenToCellPoint(screenX, screenY, viewport, cellPx)
  return { x: Math.floor(point.x), y: Math.floor(point.y) }
}

/**
 * The same conversion without the floor: the pointer's position in CELL
 * UNITS, fractions and all. Line and point work do not live on square
 * boundaries — a back-stitch segment runs corner to corner and a knot sits
 * in the middle of a square — so hit-testing them needs the real position,
 * not the square it happens to be over.
 */
export function screenToCellPoint(
  screenX: number,
  screenY: number,
  viewport: Viewport,
  cellPx: number = DEFAULT_CELL_PX,
): { x: number; y: number } {
  return {
    x: (screenX - viewport.panX) / (cellPx * viewport.scale),
    y: (screenY - viewport.panY) / (cellPx * viewport.scale),
  }
}

/** Convert a cell-corner world coordinate (allowing non-integer cell
 *  corners for back-stitch endpoints) into screen pixels. */
export function worldToScreen(
  worldX: number,
  worldY: number,
  viewport: Viewport,
  cellPx: number = DEFAULT_CELL_PX,
): { x: number; y: number } {
  return {
    x: viewport.panX + worldX * cellPx * viewport.scale,
    y: viewport.panY + worldY * cellPx * viewport.scale,
  }
}

/** Returns the viewport that fits the whole pattern inside the given
 *  container, centred, with a soft padding. */
export function fitToScreen(
  pattern: PatternData,
  containerWidth: number,
  containerHeight: number,
  cellPx: number = DEFAULT_CELL_PX,
  padding = 48,
): Viewport {
  const usableW = Math.max(1, containerWidth - padding * 2)
  const usableH = Math.max(1, containerHeight - padding * 2)
  const scaleX = usableW / (pattern.grid.width * cellPx)
  const scaleY = usableH / (pattern.grid.height * cellPx)
  const scale = Math.min(scaleX, scaleY)
  const renderedW = pattern.grid.width * cellPx * scale
  const renderedH = pattern.grid.height * cellPx * scale
  return {
    panX: (containerWidth - renderedW) / 2,
    panY: (containerHeight - renderedH) / 2,
    scale,
  }
}

/**
 * The viewport that puts one cell centre at the middle of the container at
 * a given zoom. Used by the first view on a phone (centred on the chart's
 * middle) and by the floss key's jump-to-a-parked-square action.
 */
export function centreCellViewport(
  cellX: number,
  cellY: number,
  scale: number,
  containerWidth: number,
  containerHeight: number,
  cellPx: number = DEFAULT_CELL_PX,
): Viewport {
  return {
    scale,
    panX: containerWidth / 2 - (cellX + 0.5) * cellPx * scale,
    panY: containerHeight / 2 - (cellY + 0.5) * cellPx * scale,
  }
}

/**
 * The view a chart should open at on this container. A chart that still
 * reads as a chart when fitted simply fits, so the Maker sees the whole
 * design. One that would land too small to read or tap, which is every
 * showpiece chart on a phone, opens zoomed to a stitchable cell size over
 * its centre instead, so the first tap lands on the square they meant.
 */
export function initialViewport(
  pattern: PatternData,
  containerWidth: number,
  containerHeight: number,
  cellPx: number = DEFAULT_CELL_PX,
): Viewport {
  const fit = fitToScreen(pattern, containerWidth, containerHeight, cellPx)
  if (containerWidth > NARROW_CONTAINER_PX) return fit
  if (fit.scale * cellPx >= FIT_FLOOR_CELL_PX) return fit
  return centreCellViewport(
    Math.floor(pattern.grid.width / 2),
    Math.floor(pattern.grid.height / 2),
    FIRST_VIEW_CELL_PX / cellPx,
    containerWidth,
    containerHeight,
    cellPx,
  )
}

/**
 * Apply a zoom delta anchored at a screen-space point. Keeps the world
 * point under the cursor fixed during zoom — the universal "zoom feels
 * right" behaviour.
 */
export function zoomAtPoint(
  viewport: Viewport,
  zoomDelta: number,
  anchorScreenX: number,
  anchorScreenY: number,
  minScale = 0.05,
  maxScale = 12,
): Viewport {
  const nextScale = Math.max(minScale, Math.min(maxScale, viewport.scale * zoomDelta))
  const actualDelta = nextScale / viewport.scale
  return {
    scale: nextScale,
    panX: anchorScreenX - (anchorScreenX - viewport.panX) * actualDelta,
    panY: anchorScreenY - (anchorScreenY - viewport.panY) * actualDelta,
  }
}
