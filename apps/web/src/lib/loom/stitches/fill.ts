/**
 * Shading / leaf fills: long-and-short and fishbone. Both build the real
 * individual stitches that make the fill — long-and-short interlocks staggered
 * straight stitches (the painterly shading stitch); fishbone overlaps angled
 * stitches across a central spine (the classic leaf fill).
 */

import type { Vec2 } from '../core/vec'
import type { ThreadStroke } from '../render/thread'
import { stroke, type StitchContext } from './types'
import { strandRadiusMm } from '../render/thread'
import { pathLength, pointAt, leftNormal } from './util'

/**
 * Long-and-short fill of a rectangle. Stitches run along the height in columns
 * across the width; the stitch boundaries are staggered (brickwork) and the top
 * row alternates long / short, so rows interlock the way real long-and-short
 * shading does. `angleDeg` rotates the block. Single colour here; the placement
 * engine layers colours by running several bands.
 */
export function longAndShort(
  cx: number,
  cy: number,
  w: number,
  h: number,
  angleDeg: number,
  ctx: StitchContext,
  opts: { rowMm?: number } = {},
): ThreadStroke[] {
  const r = strandRadiusMm(ctx.strands)
  const pitch = r * 1.6
  const rowMm = opts.rowMm ?? 3.2
  const nCols = Math.max(1, Math.round(w / pitch))
  const rad = (angleDeg * Math.PI) / 180
  const ca = Math.cos(rad)
  const sa = Math.sin(rad)
  const rot = (x: number, y: number): Vec2 => ({ x: cx + x * ca - y * sa, y: cy + x * sa + y * ca })
  const out: ThreadStroke[] = []
  for (let c = 0; c <= nCols; c++) {
    const x = -w / 2 + (c / nCols) * w
    // Alternate columns start staggered by half a row -> interlocking boundaries.
    const offset = c % 2 === 0 ? 0 : rowMm * 0.5
    let y = -h / 2 - offset
    let k = 0
    while (y < h / 2) {
      // First stitch of a column is long or short (the long-and-short edge).
      const len = k === 0 ? (c % 2 === 0 ? rowMm : rowMm * 0.55) : rowMm
      const y1 = Math.min(h / 2, y + len)
      if (y1 > -h / 2) {
        out.push(stroke([rot(x, Math.max(-h / 2, y)), rot(x, y1)], ctx, { seedJitter: c * 0.13 + k * 0.07 }))
      }
      y += len
      k++
    }
  }
  return out
}

/**
 * Fishbone leaf fill. Stitches come alternately from the left and right edge of
 * the leaf, each slanting down across the central vein and overlapping there —
 * which builds the raised herringbone spine fishbone is known for. `tip` and
 * `base` define the central axis; `width` is the leaf width at its middle.
 */
export function fishbone(
  tip: Vec2,
  base: Vec2,
  width: number,
  ctx: StitchContext,
  opts: { stepMm?: number } = {},
): ThreadStroke[] {
  const r = strandRadiusMm(ctx.strands)
  const stepMm = opts.stepMm ?? r * 1.6
  const spine = [tip, base]
  const total = pathLength(spine)
  const n = Math.max(2, Math.round(total / stepMm))
  const out: ThreadStroke[] = []
  for (let i = 1; i <= n; i++) {
    const d = (i / n) * total
    const c = pointAt(spine, d)
    const nrm = leftNormal(c.t)
    // Leaf half-width tapers to the tip and base (an almond profile).
    const u = d / total
    const halfW = (width / 2) * Math.sin(Math.PI * Math.min(1, Math.max(0, u))) + r
    const side = i % 2 === 0 ? 1 : -1
    const edge: Vec2 = { x: c.p.x + nrm.x * halfW * side, y: c.p.y + nrm.y * halfW * side }
    // Each stitch runs from the edge, across the vein, to just past centre on
    // the spine slightly further toward the base (the overlap = the spine).
    const cross = pointAt(spine, Math.min(total, d + stepMm * 0.9))
    out.push(stroke([edge, cross.p], ctx, { seedJitter: i * 0.11, archScale: 1.1 }))
  }
  return out
}
