// SPDX-License-Identifier: MIT
// Shared geometry helpers for the hero-flat renderer.
//
// All archetype primitives work in a "view-local" coordinate system
// where (0, 0) is the visual centre of the front or back view, x grows
// right, y grows down. The twoViewSvg helper composes two view-local
// renders into a single 800x1000 canvas with front on the left and back
// on the right.

export const CANVAS_W = 800
export const CANVAS_H = 1000
export const STROKE_PRIMARY = 1.5
export const STROKE_SECONDARY = 0.9
export const STROKE_DETAIL = 0.7
export const VIEW_GAP_PX = 40

/** Format a number for SVG output: trim trailing zeros, max 2 decimals.
 *  Keeps the cache-key SVG stable across machines. */
export function n(v: number): string {
  if (!Number.isFinite(v)) return '0'
  const rounded = Math.round(v * 100) / 100
  return rounded.toString()
}

/** Cubic bezier point with explicit handle. Used by the silhouette
 *  builder so each segment carries enough context for a smooth join. */
export interface SilPoint {
  x: number
  y: number
  /** Handle for the OUTGOING segment from this point. Null = sharp corner. */
  outHandle?: { x: number; y: number } | null
  /** Handle for the INCOMING segment ending at this point. Null = straight. */
  inHandle?: { x: number; y: number } | null
}

/**
 * Build a closed silhouette path from a list of SilPoints. Each segment
 * uses a cubic bezier when both adjacent handles are present, falling
 * back to a straight line when neither is. The path closes with Z.
 *
 * Handles are absolute coordinates (not deltas) for code readability.
 */
export function silhouette(points: SilPoint[]): string {
  if (points.length === 0) return ''
  const segs: string[] = []
  segs.push(`M ${n(points[0]!.x)} ${n(points[0]!.y)}`)
  for (let i = 1; i <= points.length; i++) {
    const prev = points[(i - 1) % points.length]!
    const cur = points[i % points.length]!
    if (prev.outHandle && cur.inHandle) {
      segs.push(
        `C ${n(prev.outHandle.x)} ${n(prev.outHandle.y)}, ${n(cur.inHandle.x)} ${n(cur.inHandle.y)}, ${n(cur.x)} ${n(cur.y)}`,
      )
    } else if (prev.outHandle) {
      segs.push(
        `Q ${n(prev.outHandle.x)} ${n(prev.outHandle.y)}, ${n(cur.x)} ${n(cur.y)}`,
      )
    } else if (cur.inHandle) {
      segs.push(
        `Q ${n(cur.inHandle.x)} ${n(cur.inHandle.y)}, ${n(cur.x)} ${n(cur.y)}`,
      )
    } else {
      segs.push(`L ${n(cur.x)} ${n(cur.y)}`)
    }
  }
  segs.push('Z')
  return segs.join(' ')
}

/** Generate a smooth bezier path from (x1,y1) to (x2,y2) with handle
 *  offsets expressed as a fraction of the segment vector. */
export function smoothLine(
  x1: number, y1: number, x2: number, y2: number,
  h1Frac = 0.33, h2Frac = 0.33,
  perpBias = 0,
): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  const px = len > 0 ? -dy / len : 0
  const py = len > 0 ? dx / len : 0
  const c1x = x1 + dx * h1Frac + px * perpBias
  const c1y = y1 + dy * h1Frac + py * perpBias
  const c2x = x2 - dx * h2Frac + px * perpBias
  const c2y = y2 - dy * h2Frac + py * perpBias
  return `M ${n(x1)} ${n(y1)} C ${n(c1x)} ${n(c1y)}, ${n(c2x)} ${n(c2y)}, ${n(x2)} ${n(y2)}`
}

/** Compose front + back inner markup into the final 800x1000 SVG.
 *  Each view is scaled to fit within half the canvas minus the gap,
 *  using viewHeightPx as the design's natural height. */
export function twoViewSvg(
  front: string,
  back: string,
  viewHeightPx: number,
): string {
  // Available width for one view inside the canvas.
  const halfW = (CANVAS_W - VIEW_GAP_PX) / 2
  // Available height inside the canvas with vertical margin.
  const availH = CANVAS_H - 80
  // Scale so the natural design height fits the available height.
  const scale = Math.min(1, availH / viewHeightPx)
  // After scaling, the view sits centred horizontally and vertically.
  const xLeft = halfW / 2
  const xRight = halfW + VIEW_GAP_PX + halfW / 2
  const yMid = CANVAS_H / 2
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}" fill="none" stroke="black" stroke-width="${STROKE_PRIMARY}" stroke-linejoin="round" stroke-linecap="round">`,
    `  <g transform="translate(${n(xLeft)} ${n(yMid)}) scale(${n(scale)})">${front}</g>`,
    `  <g transform="translate(${n(xRight)} ${n(yMid)}) scale(${n(scale)})">${back}</g>`,
    `</svg>`,
  ].join('\n')
}

/** A short dashed line (used for centre back seams and topstitch hints). */
export function dashedLine(
  x1: number, y1: number, x2: number, y2: number,
  dash = '2 4', width = STROKE_DETAIL,
): string {
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke-dasharray="${dash}" stroke-width="${n(width)}" />`
}

/** Solid construction line at secondary weight (for seams, yokes, cuffs). */
export function seamLine(
  x1: number, y1: number, x2: number, y2: number,
  width = STROKE_SECONDARY,
): string {
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke-width="${n(width)}" />`
}

/** Smooth bezier line as a construction detail (curved seams, yokes). */
export function curveLine(d: string, width = STROKE_SECONDARY): string {
  return `<path d="${d}" stroke-width="${n(width)}" />`
}

/** Mirror an SilPoint horizontally about the x=0 axis. */
export function mirrorX(p: SilPoint): SilPoint {
  return {
    x: -p.x,
    y: p.y,
    inHandle: p.inHandle ? { x: -p.inHandle.x, y: p.inHandle.y } : p.inHandle,
    outHandle: p.outHandle ? { x: -p.outHandle.x, y: p.outHandle.y } : p.outHandle,
  }
}
