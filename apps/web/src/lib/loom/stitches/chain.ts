/**
 * Chain stitch and its family (chain line, feather, fly). Chains are rendered
 * as real, countable interlocking loops — never a smooth tube. (Hard lesson
 * carried over: a line of loops must read as N distinct links.)
 */

import type { Vec2 } from '../core/vec'
import type { ThreadStroke } from '../render/thread'
import { stroke, type StitchContext } from './types'
import { strandRadiusMm } from '../render/thread'
import { pathLength, pointAt, leftNormal } from './util'

/**
 * Chain stitch along a polyline: a row of interlocking oval loops. Each loop is
 * one closed stroke; consecutive loops overlap so they interlock like a real
 * chain.
 */
export function chainStitch(
  points: Vec2[],
  ctx: StitchContext,
  opts: { linkMm?: number; widthMm?: number } = {},
): ThreadStroke[] {
  const r = strandRadiusMm(ctx.strands)
  const linkMm = opts.linkMm ?? 2.0
  const halfW = (opts.widthMm ?? r * 3.2) / 2
  const total = pathLength(points)
  const advance = linkMm * 0.72 // overlap = interlock
  const out: ThreadStroke[] = []
  let d = 0
  let i = 0
  while (d < total - 1e-6) {
    const c = pointAt(points, Math.min(total, d + linkMm / 2))
    const t = c.t
    const n = leftNormal(t)
    const halfLen = linkMm * 0.6
    // An oval ring: a closed loop, long axis along the path, short axis across.
    const ring: Vec2[] = []
    const steps = 14
    for (let k = 0; k <= steps; k++) {
      const a = (k / steps) * Math.PI * 2
      const along = Math.cos(a) * halfLen
      const across = Math.sin(a) * halfW
      ring.push({ x: c.p.x + t.x * along + n.x * across, y: c.p.y + t.y * along + n.y * across })
    }
    out.push(stroke(ring, ctx, { seedJitter: i * 0.29, radiusScale: 0.82, archScale: 0.5 }))
    d += advance
    i++
  }
  return out
}

/**
 * Fly stitch: a V (or shallow Y) loop tacked at the bottom — like an open
 * detached chain. `left` and `right` are the two top anchor points, `bottom`
 * the tacked point.
 */
export function flyStitch(left: Vec2, right: Vec2, bottom: Vec2, ctx: StitchContext): ThreadStroke[] {
  const mid: Vec2 = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 }
  // The looped V: left -> bottom -> right, bowed through the tack point.
  const loop: Vec2[] = [left, { x: (left.x + bottom.x) / 2, y: (left.y + bottom.y) / 2 }, bottom, { x: (right.x + bottom.x) / 2, y: (right.y + bottom.y) / 2 }, right]
  // The tail tack below the bottom.
  const dx = bottom.x - mid.x
  const dy = bottom.y - mid.y
  const tl = Math.hypot(dx, dy) || 1
  const tack: Vec2[] = [bottom, { x: bottom.x + (dx / tl) * 1.2, y: bottom.y + (dy / tl) * 1.2 }]
  return [stroke(loop, ctx, { archScale: 0.7 }), stroke(tack, ctx, { seedJitter: 0.6 })]
}

/**
 * Fern stitch: a column of three-armed groups down a stem — a central stitch in
 * line with the stem plus two side arms angled out, repeated, giving feathery
 * foliage. Worked as the real three straight stitches per node.
 */
export function fernStitch(
  points: Vec2[],
  ctx: StitchContext,
  opts: { stitchMm?: number; stepMm?: number; spreadDeg?: number } = {},
): ThreadStroke[] {
  const stitchMm = opts.stitchMm ?? 2.6
  const stepMm = opts.stepMm ?? 2.2
  const spread = ((opts.spreadDeg ?? 40) * Math.PI) / 180
  const total = pathLength(points)
  const n = Math.max(1, Math.round(total / stepMm))
  const out: ThreadStroke[] = []
  for (let i = 0; i <= n; i++) {
    const d = (i / n) * total
    const c = pointAt(points, d)
    // Arms point back up the stem (toward where it came from).
    const bx = -c.t.x
    const by = -c.t.y
    const arm = (ang: number): Vec2 => {
      const ca = Math.cos(ang)
      const sa = Math.sin(ang)
      return { x: c.p.x + (bx * ca - by * sa) * stitchMm, y: c.p.y + (bx * sa + by * ca) * stitchMm }
    }
    out.push(stroke([c.p, arm(0)], ctx, { seedJitter: i * 0.31 }))
    if (i > 0) {
      out.push(stroke([c.p, arm(spread)], ctx, { seedJitter: i * 0.31 + 0.1 }))
      out.push(stroke([c.p, arm(-spread)], ctx, { seedJitter: i * 0.31 + 0.2 }))
    }
  }
  return out
}

/**
 * Feather stitch: alternating fly stitches down a line, branching left then
 * right — the open, fern-like border stitch.
 */
export function featherStitch(
  points: Vec2[],
  ctx: StitchContext,
  opts: { stepMm?: number; spreadMm?: number } = {},
): ThreadStroke[] {
  const stepMm = opts.stepMm ?? 3.0
  const spread = opts.spreadMm ?? 2.6
  const total = pathLength(points)
  const n = Math.max(1, Math.round(total / stepMm))
  const out: ThreadStroke[] = []
  let prev = pointAt(points, 0).p
  for (let i = 1; i <= n; i++) {
    const d = (i / n) * total
    const c = pointAt(points, d)
    const nrm = leftNormal(c.t)
    const side = i % 2 === 0 ? 1 : -1
    const branch: Vec2 = { x: c.p.x + nrm.x * spread * side, y: c.p.y + nrm.y * spread * side }
    // V from the previous centre point out to this branch and back to the line.
    const loop: Vec2[] = [
      { x: prev.x + nrm.x * spread * -side * 0.0, y: prev.y },
      prev,
      branch,
      c.p,
    ]
    out.push(stroke(loop, ctx, { seedJitter: i * 0.33, archScale: 0.7 }))
    prev = c.p
  }
  return out
}
