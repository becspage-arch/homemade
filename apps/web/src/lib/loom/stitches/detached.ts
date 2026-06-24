/**
 * Detached stitches — worked at a spot rather than along a line: French knot,
 * detached chain (lazy daisy), seed. Each is constructed as the real thread the
 * stitch lays, never substituted with a dot or a bead.
 */

import type { Vec2 } from '../core/vec'
import type { ThreadStroke } from '../render/thread'
import { stroke, type StitchContext } from './types'
import { strandRadiusMm } from '../render/thread'

/**
 * French knot: the thread wrapped `wraps` times and pulled tight into a small
 * round bump. Built as a real tight coil (a short spiral), so the wrap lines
 * show — not a flat dot.
 */
export function frenchKnot(
  center: Vec2,
  ctx: StitchContext,
  opts: { wraps?: number } = {},
): ThreadStroke[] {
  const wraps = opts.wraps ?? 2
  const r = strandRadiusMm(ctx.strands)
  // A real French knot is a plump ball, distinctly wider than the thread — not a
  // dot. Size it generously relative to the thread (and grow it with wraps).
  const knotR = r * (1.7 + wraps * 0.4)
  const base = stroke([center, center], ctx)
  const mat = base.material
  // Build the ball as two filled spirals stacked: a wide base coil low down, and
  // a smaller crown coil sitting on top at greater height. Each spiral runs all
  // the way in to its centre so there is no donut hole, and the raised crown
  // gives the rounded dome a single flat spiral can't.
  const makeSpiral = (outerR: number, turns: number, z0: number, archMm: number, seedOff: number): ThreadStroke => {
    const segs = Math.max(26, Math.round(22 * turns))
    const path: Vec2[] = []
    for (let j = 0; j <= segs; j++) {
      const u = j / segs
      const ang = 2 * Math.PI * turns * u + ctx.seed + seedOff
      const rr = outerR * (1 - 0.95 * u)
      path.push({ x: center.x + Math.cos(ang) * rr, y: center.y + Math.sin(ang) * rr })
    }
    return {
      path,
      z0,
      arch: archMm,
      radiusMm: r * 1.05,
      filaments: base.filaments,
      twistPerMm: base.twistPerMm,
      material: mat,
      seed: ctx.seed + seedOff,
    }
  }
  const turns = 2.0 + wraps * 0.6
  return [
    makeSpiral(knotR, turns, r * 0.4, knotR * 0.35, 0),
    makeSpiral(knotR * 0.58, turns * 0.7, knotR * 0.7, knotR * 0.4, 1.7),
  ]
}

/**
 * Detached chain / lazy daisy: a single chain loop anchored by a small tack
 * stitch over its tip — the classic petal. `base` is where the needle comes up,
 * `tip` the far end of the petal.
 */
export function lazyDaisy(base: Vec2, tip: Vec2, ctx: StitchContext): ThreadStroke[] {
  const dx = tip.x - base.x
  const dy = tip.y - base.y
  const L = Math.hypot(dx, dy) || 1e-6
  const tx = dx / L
  const ty = dy / L
  const nx = -ty
  const ny = tx
  const w = L * 0.32 // half-width of the loop
  const loop: Vec2[] = [
    base,
    { x: base.x + tx * L * 0.3 + nx * w, y: base.y + ty * L * 0.3 + ny * w },
    { x: base.x + tx * L * 0.85 + nx * w * 0.5, y: base.y + ty * L * 0.85 + ny * w * 0.5 },
    tip,
    { x: base.x + tx * L * 0.85 - nx * w * 0.5, y: base.y + ty * L * 0.85 - ny * w * 0.5 },
    { x: base.x + tx * L * 0.3 - nx * w, y: base.y + ty * L * 0.3 - ny * w },
    base,
  ]
  // Tack stitch over the tip, holding the loop closed.
  const tack: Vec2[] = [
    { x: tip.x - tx * w * 0.3, y: tip.y - ty * w * 0.3 },
    { x: tip.x + tx * L * 0.18, y: tip.y + ty * L * 0.18 },
  ]
  return [
    stroke(loop, ctx, { archScale: 0.6, radiusScale: 0.92 }),
    stroke(tack, ctx, { seedJitter: 0.5 }),
  ]
}

/**
 * Whipped / woven wheel: spokes radiating from a centre, then a thread spiralled
 * out over them filling a raised round flower (a woven rose / seed-head). Built
 * as the real spokes plus the real spiral — countable, not a flat disc.
 */
export function wovenWheel(
  center: Vec2,
  radius: number,
  ctx: StitchContext,
  opts: { spokes?: number } = {},
): ThreadStroke[] {
  const r = strandRadiusMm(ctx.strands)
  const spokes = opts.spokes ?? 7
  const out: ThreadStroke[] = []
  for (let k = 0; k < spokes; k++) {
    const a = (k / spokes) * Math.PI * 2 + ctx.seed
    out.push(
      stroke([center, { x: center.x + Math.cos(a) * radius, y: center.y + Math.sin(a) * radius }], ctx, {
        radiusScale: 0.85,
        seedJitter: k * 0.13,
      }),
    )
  }
  // The woven spiral filling the disc, raised into a dome.
  const turns = Math.max(2, radius / (r * 1.5))
  const segs = Math.max(40, Math.round(turns * 26))
  const path: Vec2[] = []
  for (let j = 0; j <= segs; j++) {
    const u = j / segs
    const ang = 2 * Math.PI * turns * u + ctx.seed
    const rr = radius * u
    path.push({ x: center.x + Math.cos(ang) * rr, y: center.y + Math.sin(ang) * rr })
  }
  out.push({
    path,
    z0: r * 0.5,
    arch: radius * 0.5,
    radiusMm: strandRadiusMm(ctx.strands),
    filaments: out[0]!.filaments,
    twistPerMm: out[0]!.twistPerMm,
    material: out[0]!.material,
    seed: ctx.seed + 3.1,
  })
  return out
}

/** Seed stitch: a single tiny straight stitch (scatter these to fill/texture). */
export function seed(center: Vec2, ctx: StitchContext, opts: { lenMm?: number; angleDeg?: number } = {}): ThreadStroke[] {
  const len = opts.lenMm ?? 1.4
  const rad = ((opts.angleDeg ?? 0) * Math.PI) / 180
  const dx = (Math.cos(rad) * len) / 2
  const dy = (Math.sin(rad) * len) / 2
  return [stroke([{ x: center.x - dx, y: center.y - dy }, { x: center.x + dx, y: center.y + dy }], ctx)]
}
