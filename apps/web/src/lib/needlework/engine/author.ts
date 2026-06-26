/**
 * Authoring helpers — the reusable building blocks for turning traced shapes (or
 * authored geometry) into the pattern's StitchedElement[]. The SEMANTIC choices
 * (which shape is a petal vs a leaf, the palette, the stitch per part) are made
 * per design by the generation step; these helpers make those choices concrete in
 * a consistent way: DMC-snapped shade ramps, shaded long-and-short fills, French-
 * knot rings (flower centres / stamens), and worked lines (stems). The output
 * feeds buildPatternDocument + the loom's renderHero unchanged.
 */

import { nearestDmcFull } from '../../floss/dmc-full'
import type { StitchedElement } from '../../loom/render/renderPattern'

export type Pt = [number, number]
const DEFAULT_THREAD = { type: 'stranded-cotton', weight: '6-strand' }

function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')}`
}

/** n real DMC shades interpolated dark→light and snapped to the full DMC table. */
export function dmcRamp(darkHex: string, lightHex: string, n: number): string[] {
  const d = hexToRgb(darkHex)
  const l = hexToRgb(lightHex)
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    const t = n <= 1 ? 0 : i / (n - 1)
    out.push(nearestDmcFull(toHex(d[0] + (l[0] - d[0]) * t, d[1] + (l[1] - d[1]) * t, d[2] + (l[2] - d[2]) * t)).hex)
  }
  return out
}

/** Snap a single colour to the nearest full-range DMC stand (hex). */
export function dmc(hex: string): string {
  return nearestDmcFull(hex).hex
}

export function centroidOf(pts: Pt[]): Pt {
  let sx = 0
  let sy = 0
  for (const p of pts) {
    sx += p[0]
    sy += p[1]
  }
  return [sx / pts.length, sy / pts.length]
}

/** Fade direction (degrees) from one point to another. */
export function axisDeg(from: Pt, to: Pt): number {
  return (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI
}

/**
 * A shaded long-and-short fill: one closed shape worked through a dark→light DMC
 * ramp along a fade axis (the loom renders it as BLENDED needle-painting). Give
 * either an explicit `axisDeg` or a `shadeFrom` point (the fade runs from there
 * through the shape's centroid — e.g. a flower centre, so petals fade outward).
 */
export function shadedFill(
  poly: Pt[],
  ramp: string[],
  opts: { axisDeg?: number; shadeFrom?: Pt; thread?: { type: string; weight: string } } = {},
): StitchedElement {
  const cen = centroidOf(poly)
  const ad = opts.axisDeg ?? (opts.shadeFrom ? axisDeg(opts.shadeFrom, cen) : 90)
  return {
    stitchType: 'embroidery-long-and-short',
    colourHex: ramp[Math.floor(ramp.length / 2)] ?? ramp[0] ?? '#000000',
    thread: opts.thread ?? DEFAULT_THREAD,
    directionDeg: ad,
    geometry: { kind: 'path', points: poly },
    shade: { ramp, axisDeg: ad },
  }
}

/** A worked line (stem stitch by default) along a path. */
export function workedLine(
  points: Pt[],
  colourHex: string,
  opts: { slug?: string; thread?: { type: string; weight: string } } = {},
): StitchedElement {
  return {
    stitchType: opts.slug ?? 'embroidery-stem',
    colourHex,
    thread: opts.thread ?? DEFAULT_THREAD,
    directionDeg: null,
    geometry: { kind: 'path', points },
  }
}

/** A French knot at a point. */
export function frenchKnot(at: Pt, colourHex: string, thread = DEFAULT_THREAD): StitchedElement {
  return { stitchType: 'embroidery-french-knot', colourHex, thread, directionDeg: null, geometry: { kind: 'point', at } }
}

/**
 * A ring of French knots — a flower centre / stamen cluster. `colours` may be one
 * colour or a list cycled around the ring (for naturalistic stamen variation).
 */
export function frenchKnotRing(
  centre: Pt,
  radius: number,
  count: number,
  colours: string | string[],
  opts: { startDeg?: number; thread?: { type: string; weight: string } } = {},
): StitchedElement[] {
  const list = Array.isArray(colours) ? colours : [colours]
  const start = ((opts.startDeg ?? -90) * Math.PI) / 180
  const out: StitchedElement[] = []
  for (let i = 0; i < count; i++) {
    const a = start + (i / count) * Math.PI * 2
    out.push(frenchKnot([centre[0] + Math.cos(a) * radius, centre[1] + Math.sin(a) * radius], list[i % list.length]!, opts.thread))
  }
  return out
}

/**
 * Translate/scale/rotate/mirror a polygon (e.g. re-place a traced leaf around the
 * design). `from` is the source anchor (usually the leaf's centroid), `to` the
 * target position.
 */
export function placePoly(pts: Pt[], from: Pt, to: Pt, scale: number, mirror: boolean, rotDeg: number): Pt[] {
  const a = (rotDeg * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  return pts.map(([x, y]) => {
    const dx = (x - from[0]) * scale * (mirror ? -1 : 1)
    const dy = (y - from[1]) * scale
    return [to[0] + (dx * c - dy * s), to[1] + (dx * s + dy * c)] as Pt
  })
}

/**
 * Uniformly scale + recentre a set of points from source px into a finished
 * millimetre canvas (squared so a round hoop frames the whole design), returning
 * the transform and the finished size. Author geometry in px, then map once.
 */
export function fitToHoopMm(
  allPts: Pt[],
  targetWidthMm: number,
  opts: { padFrac?: number; square?: boolean } = {},
): { tx: (p: Pt) => Pt; sizeMm: { width: number; height: number } } {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [x, y] of allPts) {
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
  }
  const pad = (opts.padFrac ?? 0.06) * Math.max(maxX - minX, maxY - minY)
  minX -= pad
  minY -= pad
  maxX += pad
  maxY += pad
  if (opts.square ?? true) {
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const half = Math.max(maxX - minX, maxY - minY) / 2
    minX = cx - half
    maxX = cx + half
    minY = cy - half
    maxY = cy + half
  }
  const scale = targetWidthMm / (maxX - minX)
  return {
    tx: (p: Pt): Pt => [(p[0] - minX) * scale, (p[1] - minY) * scale],
    sizeMm: { width: targetWidthMm, height: (maxY - minY) * scale },
  }
}
