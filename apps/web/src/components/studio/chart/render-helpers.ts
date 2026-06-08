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

import type { PatternData, PaletteEntry } from '@homemade/db'

export const DEFAULT_CELL_PX = 32
export const LOW_ZOOM_THRESHOLD = 6
export const RENDER_PRECISION = 2

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
  const worldX = (screenX - viewport.panX) / (cellPx * viewport.scale)
  const worldY = (screenY - viewport.panY) / (cellPx * viewport.scale)
  return { x: Math.floor(worldX), y: Math.floor(worldY) }
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
