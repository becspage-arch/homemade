/**
 * Line stitches — the ones worked along a path: straight, running, back, stem,
 * split. Each constructs the real individual stitches; nothing is faked as a
 * single smooth tube.
 */

import type { Vec2 } from '../core/vec'
import { strandRadiusMm, type ThreadStroke } from '../render/thread'
import { stroke, type StitchContext } from './types'
import { pathLength, pointAt, leftNormal } from './util'

/** A single straight stitch from a to b. */
export function straightStitch(a: Vec2, b: Vec2, ctx: StitchContext): ThreadStroke[] {
  return [stroke([a, b], ctx)]
}

/** Running stitch: dashes of `stitchMm` separated by `gapMm` along a->b. */
export function runningStitch(
  a: Vec2,
  b: Vec2,
  ctx: StitchContext,
  opts: { stitchMm?: number; gapMm?: number } = {},
): ThreadStroke[] {
  const stitchMm = opts.stitchMm ?? 2.2
  const gapMm = opts.gapMm ?? 1.6
  const path = [a, b]
  const total = pathLength(path)
  const out: ThreadStroke[] = []
  let d = 0
  let i = 0
  while (d < total - 1e-6) {
    const end = Math.min(total, d + stitchMm)
    out.push(stroke([pointAt(path, d).p, pointAt(path, end).p], ctx, { seedJitter: i * 0.31 }))
    d = end + gapMm
    i++
  }
  return out
}

/**
 * Back stitch: an unbroken line of touching stitches along a polyline. Each
 * segment of `points` (resampled to `stitchMm`) is one stitch laid end to end.
 */
export function backStitch(
  points: Vec2[],
  ctx: StitchContext,
  opts: { stitchMm?: number } = {},
): ThreadStroke[] {
  const stitchMm = opts.stitchMm ?? 2.0
  const total = pathLength(points)
  const n = Math.max(1, Math.round(total / stitchMm))
  const out: ThreadStroke[] = []
  for (let i = 0; i < n; i++) {
    const d0 = (i / n) * total
    const d1 = ((i + 1) / n) * total
    out.push(stroke([pointAt(points, d0).p, pointAt(points, d1).p], ctx, { seedJitter: i * 0.27 }))
  }
  return out
}

/**
 * Stem stitch: overlapping slanted stitches worked along a line, the working
 * thread held to one side, producing a raised ropelike line. Each stitch slants
 * across the line and overlaps the previous by ~half its length.
 */
export function stemStitch(
  points: Vec2[],
  ctx: StitchContext,
  opts: { stitchMm?: number; slantMm?: number } = {},
): ThreadStroke[] {
  const stitchMm = opts.stitchMm ?? 2.2
  const slant = opts.slantMm ?? 0.5
  const total = pathLength(points)
  const advance = stitchMm * 0.55 // overlap gives the rope
  const out: ThreadStroke[] = []
  let d = 0
  let i = 0
  while (d < total - 1e-6) {
    const start = pointAt(points, d)
    const endD = Math.min(total, d + stitchMm)
    const end = pointAt(points, endD)
    const nStart = leftNormal(start.t)
    const nEnd = leftNormal(end.t)
    // Slant: start sits on one side of the line, end crosses toward the other.
    const a: Vec2 = { x: start.p.x - nStart.x * slant, y: start.p.y - nStart.y * slant }
    const b: Vec2 = { x: end.p.x + nEnd.x * slant, y: end.p.y + nEnd.y * slant }
    out.push(stroke([a, b], ctx, { seedJitter: i * 0.41, archScale: 1.1 }))
    d += advance
    i++
  }
  return out
}

/**
 * Couching: a thread (or bundle) laid along a path and tacked down at intervals
 * by small stitches across it — often in a contrasting thread. Returns the laid
 * thread plus its tacking stitches.
 */
export function couching(
  points: Vec2[],
  laid: StitchContext,
  ctx: StitchContext,
  opts: { tackEveryMm?: number; tackCtx?: StitchContext } = {},
): ThreadStroke[] {
  const tackEvery = opts.tackEveryMm ?? 3.0
  const tackCtx = opts.tackCtx ?? ctx
  const total = pathLength(points)
  // The laid thread: one continuous, slightly thicker stroke sitting proud.
  const out: ThreadStroke[] = [stroke(points, laid, { radiusScale: 1.15, archScale: 1.2 })]
  const n = Math.max(1, Math.round(total / tackEvery))
  for (let i = 1; i < n; i++) {
    const c = pointAt(points, (i / n) * total)
    const nrm = leftNormal(c.t)
    const w = strandRadiusMm(laid.strands) * 1.6
    out.push(
      stroke(
        [
          { x: c.p.x - nrm.x * w, y: c.p.y - nrm.y * w },
          { x: c.p.x + nrm.x * w, y: c.p.y + nrm.y * w },
        ],
        tackCtx,
        { seedJitter: i * 0.23, archScale: 0.5 },
      ),
    )
  }
  return out
}

/**
 * Split stitch: like a fine chainlike line — each new stitch comes up through
 * the middle of the previous, so stitches overlap on the centreline with a
 * slight alternating zigzag that reads as the split.
 */
export function splitStitch(
  points: Vec2[],
  ctx: StitchContext,
  opts: { stitchMm?: number } = {},
): ThreadStroke[] {
  const stitchMm = opts.stitchMm ?? 2.0
  const total = pathLength(points)
  const advance = stitchMm * 0.6
  const out: ThreadStroke[] = []
  let d = 0
  let i = 0
  while (d < total - 1e-6) {
    const start = pointAt(points, d)
    const endD = Math.min(total, d + stitchMm)
    const end = pointAt(points, endD)
    const wig = (i % 2 === 0 ? 1 : -1) * 0.12
    const nStart = leftNormal(start.t)
    const a: Vec2 = { x: start.p.x + nStart.x * wig, y: start.p.y + nStart.y * wig }
    out.push(stroke([a, end.p], ctx, { seedJitter: i * 0.37, radiusScale: 0.96 }))
    d += advance
    i++
  }
  return out
}
