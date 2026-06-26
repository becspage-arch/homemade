/**
 * Needle-painting (blended long-and-short) fill.
 *
 * Real long-and-short shading is NOT a stack of flat colour bands — that reads as
 * stripes. It is many SHORT stitches of alternating length, brick-staggered and
 * overlapping, each a single shade, marching along a fade axis through a graded
 * ramp. Because the long stitches poke into the next shade's zone and the short
 * ones leave gaps the next row fills, adjacent shades INTERLOCK and the eye reads
 * a smooth blend. This primitive renders exactly that: one shape + a dark→light
 * ramp + a fade direction -> the individual coloured stitches that build the
 * blend. A pattern stores one outline and the ramp; the loom does the rest.
 */

import type { Vec2 } from '../core/vec'
import { strandRadiusMm, type ThreadStroke } from '../render/thread'
import { stroke, type StitchContext } from './types'

export interface NeedlePaintOpts {
  /** Long-stitch length (mm). Defaults from strand thickness. */
  longMm?: number
  /** Short-stitch length (mm). Defaults to ~0.58 × long. */
  shortMm?: number
  /** Distance between stitch rows across the width (mm). Defaults from strands. */
  spacingMm?: number
  /** How far each stitch advances vs its length (<1 overlaps -> coverage + blend). */
  advance?: number
}

/**
 * Fill `poly` with blended long-and-short stitches running along `axisDeg`, the
 * colour graded across the polygon along that axis through `ramp` (ramp[0] at the
 * low/base end, ramp[last] at the high/tip end). Returns the real thread strokes.
 */
export function needlePaintFill(
  poly: Vec2[],
  ramp: string[],
  axisDeg: number,
  ctx: StitchContext,
  opts: NeedlePaintOpts = {},
): ThreadStroke[] {
  if (poly.length < 3 || ramp.length === 0) return []
  const r = strandRadiusMm(ctx.strands)
  const long = opts.longMm ?? Math.max(3.6, r * 9)
  const short = opts.shortMm ?? long * 0.58
  const dv = opts.spacingMm ?? Math.max(0.6, r * 1.6)
  const advance = opts.advance ?? 0.5

  const a = (axisDeg * Math.PI) / 180
  const cs = Math.cos(a)
  const sn = Math.sin(a)
  // Rotate into "fill space" so the fade axis is +x and rows scan along y.
  const fp = poly.map((p) => ({ x: p.x * cs + p.y * sn, y: -p.x * sn + p.y * cs }))
  const toWorld = (x: number, y: number): Vec2 => ({ x: x * cs - y * sn, y: x * sn + y * cs })

  let mnX = Infinity
  let mxX = -Infinity
  let mnY = Infinity
  let mxY = -Infinity
  for (const p of fp) {
    if (p.x < mnX) mnX = p.x
    if (p.x > mxX) mxX = p.x
    if (p.y < mnY) mnY = p.y
    if (p.y > mxY) mxY = p.y
  }
  const spanW = mxX - mnX || 1

  // Deterministic per-fill jitter seeded from the stitch context.
  let jc = (ctx.seed * 2654435761) >>> 0 || 1
  const jr = (): number => {
    jc = (jc * 1103515245 + 12345) >>> 0
    return jc / 4294967296
  }

  const out: ThreadStroke[] = []
  let row = 0
  let idx = 0
  for (let y = mnY + dv * 0.5; y < mxY; y += dv, row++) {
    // Scanline x-crossings of the polygon at this y.
    const xs: number[] = []
    for (let i = 0; i < fp.length; i++) {
      const p1 = fp[i]!
      const p2 = fp[(i + 1) % fp.length]!
      if ((p1.y <= y && p2.y > y) || (p2.y <= y && p1.y > y)) {
        xs.push(p1.x + ((y - p1.y) / (p2.y - p1.y)) * (p2.x - p1.x))
      }
    }
    xs.sort((m, n) => m - n)
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = xs[k]!
      const x1 = xs[k + 1]!
      if (x1 - x0 < 0.8) continue
      let pos = x0 - (row % 2) * long * 0.45 // brick stagger between rows
      let alt = 0
      while (pos < x1) {
        const L = (alt % 2 === 0 ? long : short) * (0.82 + 0.4 * jr())
        const start = Math.max(pos, x0)
        const end = Math.min(pos + L, x1)
        if (end - start > 0.7) {
          const t = Math.max(0, Math.min(1, ((start + end) / 2 - mnX) / spanW))
          let ci = Math.round(t * (ramp.length - 1) + (jr() - 0.5) * 1.6)
          ci = Math.max(0, Math.min(ramp.length - 1, ci))
          const cy = y + (jr() - 0.5) * dv * 0.5
          const slope = (jr() - 0.5) * 0.16
          out.push(
            stroke([toWorld(start, cy), toWorld(end, cy + slope * (end - start))], { ...ctx, hex: ramp[ci]! }, { seedJitter: idx * 0.13, archScale: 1.05 }),
          )
          idx++
        }
        pos += L * advance
        alt++
      }
    }
  }
  return out
}
