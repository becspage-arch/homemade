/**
 * Satin stitch — parallel stitches packed edge to edge to fill a shape with a
 * smooth sheen. The fill is REAL parallel stitches (countable, each spanning
 * the shape), not a flat colour: that is what gives satin its grain and the
 * single sheen band that runs across the block.
 */

import type { Vec2 } from '../core/vec'
import type { ThreadStroke } from '../render/thread'
import { stroke, type StitchContext } from './types'
import { strandRadiusMm } from '../render/thread'

/**
 * Satin-fill an arbitrary closed polygon — pack parallel stitches across the
 * shape, clipped to its outline (scanline fill). This is how a solid embroidered
 * flower/leaf is worked: a filled region of real parallel thread, not an outline.
 * `angleDeg` sets the stitch direction.
 */
export function satinFillPolygon(
  poly: Vec2[],
  ctx: StitchContext,
  opts: { angleDeg?: number; spacingMm?: number } = {},
): ThreadStroke[] {
  if (poly.length < 3) return []
  const r = strandRadiusMm(ctx.strands)
  const spacing = opts.spacingMm ?? r * 1.5
  const a = ((opts.angleDeg ?? 0) * Math.PI) / 180
  const ca = Math.cos(-a)
  const sa = Math.sin(-a)
  const cb = Math.cos(a)
  const sb = Math.sin(a)
  // Rotate the polygon into "fill space" so the scan lines are horizontal.
  const rp = poly.map((p) => ({ x: p.x * ca - p.y * sa, y: p.x * sa + p.y * ca }))
  let minY = Infinity
  let maxY = -Infinity
  for (const p of rp) {
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  const out: ThreadStroke[] = []
  let idx = 0
  for (let y = minY + spacing * 0.5; y < maxY; y += spacing) {
    const xs: number[] = []
    for (let i = 0; i < rp.length; i++) {
      const p1 = rp[i]!
      const p2 = rp[(i + 1) % rp.length]!
      if ((p1.y <= y && p2.y > y) || (p2.y <= y && p1.y > y)) {
        xs.push(p1.x + ((y - p1.y) / (p2.y - p1.y)) * (p2.x - p1.x))
      }
    }
    xs.sort((m, n) => m - n)
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = xs[k]!
      const x1 = xs[k + 1]!
      if (x1 - x0 < 0.25) continue
      const a0: Vec2 = { x: x0 * cb - y * sb, y: x0 * sb + y * cb }
      const a1: Vec2 = { x: x1 * cb - y * sb, y: x1 * sb + y * cb }
      out.push(stroke([a0, a1], ctx, { seedJitter: idx * 0.13, archScale: 1.1 }))
      idx++
    }
  }
  return out
}

/**
 * Satin-fill a rectangle centred at (cx,cy), `w` wide and `h` tall, with the
 * stitches running across the height and stepping along the width. `angleDeg`
 * rotates the whole block (the stitch direction). Stitches are packed so they
 * just touch for full coverage.
 */
export function satinBlock(
  cx: number,
  cy: number,
  w: number,
  h: number,
  angleDeg: number,
  ctx: StitchContext,
): ThreadStroke[] {
  const r = strandRadiusMm(ctx.strands)
  const pitch = r * 1.5 // centre spacing so stitches just overlap
  const n = Math.max(1, Math.round(w / pitch))
  const rad = (angleDeg * Math.PI) / 180
  const ca = Math.cos(rad)
  const sa = Math.sin(rad)
  const rot = (x: number, y: number): Vec2 => ({
    x: cx + x * ca - y * sa,
    y: cy + x * sa + y * ca,
  })
  const out: ThreadStroke[] = []
  for (let i = 0; i <= n; i++) {
    const x = -w / 2 + (i / n) * w
    // A touch of length variation along the edges so the block isn't a ruler line.
    const jitter = (i % 2 === 0 ? 1 : -1) * h * 0.012
    const a = rot(x, -h / 2 - jitter)
    const b = rot(x, h / 2 + jitter)
    out.push(stroke([a, b], ctx, { seedJitter: i * 0.19, archScale: 1.15 }))
  }
  return out
}

/**
 * Satin band between two boundary polylines `edgeA` and `edgeB` (same point
 * count, paired across the shape). Stitches span from a point on edge A to the
 * paired point on edge B — this is how satin follows a tapering shape (a leaf, a
 * petal). Packed by `density` stitches per millimetre of edge length.
 */
export function satinBand(
  edgeA: Vec2[],
  edgeB: Vec2[],
  ctx: StitchContext,
  opts: { density?: number } = {},
): ThreadStroke[] {
  const n = Math.min(edgeA.length, edgeB.length)
  if (n < 2) return []
  const r = strandRadiusMm(ctx.strands)
  const density = opts.density ?? 1 / (r * 1.5)
  // Resample the paired edges to the stitch count.
  let edgeLen = 0
  for (let i = 1; i < n; i++) edgeLen += Math.hypot(edgeA[i]!.x - edgeA[i - 1]!.x, edgeA[i]!.y - edgeA[i - 1]!.y)
  const count = Math.max(2, Math.round(edgeLen * density))
  const out: ThreadStroke[] = []
  for (let i = 0; i <= count; i++) {
    const u = i / count
    const fa = samplePolyline(edgeA, u)
    const fb = samplePolyline(edgeB, u)
    out.push(stroke([fa, fb], ctx, { seedJitter: i * 0.17, archScale: 1.15 }))
  }
  return out
}

function samplePolyline(path: Vec2[], u: number): Vec2 {
  const idx = u * (path.length - 1)
  const i = Math.min(path.length - 2, Math.floor(idx))
  const f = idx - i
  return { x: path[i]!.x + (path[i + 1]!.x - path[i]!.x) * f, y: path[i]!.y + (path[i + 1]!.y - path[i]!.y) * f }
}
