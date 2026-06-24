/**
 * Map traced chart shapes → real stitches. The geometry comes straight from the
 * pattern's drawing (vectorize.ts); here we decide which stitch each traced
 * shape is and what colour, so the render follows the actual pattern:
 *   - a tiny drawn dot      -> French knot (berries, umbel florets, lavender)
 *   - a large drawn circle  -> whipped wheel (the seed-pods)
 *   - any other line/curve  -> thread laid along that exact path (stems, the
 *                              straight-stitch petals, leaf loops)
 * Colour is sampled from the colour guide at each shape's location and snapped
 * to the pattern's palette, so we never invent a colour either.
 */

import type { Vec2 } from '../core/vec'
import type { ThreadStroke } from '../render/thread'
import type { StitchContext } from '../stitches/types'
import { stemStitch, straightStitch } from '../stitches/line'
import { frenchKnot, wovenWheel } from '../stitches/detached'
import type { TracedShape } from './vectorize'

export interface BuildOpts {
  /** Millimetres per trace-pixel. */
  mmPerPx: number
  /** Returns a hex colour for a point in trace-pixel space. */
  sampleColour: (x: number, y: number) => string
  /** A drawn shape smaller than this (mm) is a French-knot dot. */
  knotMaxMm?: number
  /** A closed shape larger than this (mm) is a whipped wheel. */
  wheelMinMm?: number
  strands?: number
}

export function buildStrokesFromShapes(shapes: TracedShape[], opts: BuildOpts): ThreadStroke[] {
  const mm = opts.mmPerPx
  const knotMax = opts.knotMaxMm ?? 1.6
  const wheelMin = opts.wheelMinMm ?? 4.5
  const strands = opts.strands ?? 3
  let seed = 1
  const out: ThreadStroke[] = []
  const ctx = (hex: string): StitchContext => ({ kind: 'perle-cotton', hex, strands, seed: seed++ })
  const toMm = (p: [number, number]): Vec2 => ({ x: p[0] * mm, y: p[1] * mm })

  for (const s of shapes) {
    const hex = opts.sampleColour(s.cx, s.cy)
    const diamMm = s.diag * mm
    const c: Vec2 = { x: s.cx * mm, y: s.cy * mm }

    if (diamMm < knotMax) {
      out.push(...frenchKnot(c, ctx(hex), { wraps: diamMm < 0.9 ? 1 : 2 }))
      continue
    }
    if (s.loop && diamMm > wheelMin) {
      out.push(...wovenWheel(c, (diamMm / 2) * 0.95, ctx(hex), { spokes: 9 }))
      continue
    }
    // A laid line: real thread along the traced path.
    const path = s.pts.map(toMm)
    const lenMm = s.len * mm
    if (path.length === 2 || lenMm < 6) {
      out.push(...straightStitch(path[0]!, path[path.length - 1]!, ctx(hex)))
    } else {
      out.push(...stemStitch(path, ctx(hex)))
    }
  }
  return out
}

/** Nearest palette colour to an (r,g,b), returned as hex. */
export function makePaletteSnapper(paletteHex: string[]): (r: number, g: number, b: number) => string {
  const pal = paletteHex.map((h) => {
    const v = h.replace('#', '')
    return { hex: h, r: parseInt(v.slice(0, 2), 16), g: parseInt(v.slice(2, 4), 16), b: parseInt(v.slice(4, 6), 16) }
  })
  return (r, g, b) => {
    let best = pal[0]!
    let bd = Infinity
    for (const p of pal) {
      const d = (p.r - r) ** 2 + (p.g - g) ** 2 + (p.b - b) ** 2
      if (d < bd) {
        bd = d
        best = p
      }
    }
    return best.hex
  }
}
