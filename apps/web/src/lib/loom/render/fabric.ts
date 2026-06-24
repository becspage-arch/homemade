/**
 * The woven fabric ground.
 *
 * Even-weave embroidery cloth (linen / cotton / aida) is warp and weft threads
 * crossing over and under in a plain weave. Rather than splat thousands of tiny
 * fabric capsules, we shade the ground as a height field: a per-pixel weave
 * relief lit by the same key light as the stitches, so the cloth has real grain
 * and the stitches sit ON a surface rather than floating on a flat colour.
 */

import { clamp } from '../core/vec'
import { parseHex } from '../core/color'
import { valueNoise3 } from '../core/noise'
import type { Framebuffer } from './framebuffer'

export interface FabricOpts {
  /** Cloth colour (natural linen, white aida, etc.). */
  hex: string
  /** Threads per centimetre (linen ~5.5/cm = 14-count; finer = smaller grain). */
  threadsPerCm: number
  /** Relief strength of the weave bumps, 0..1. */
  weave: number
  /** Light direction in the fabric plane (toward the light): x right, y up. */
  lightX: number
  lightY: number
  seed: number
}

const FABRIC_DEFAULT = {
  threadsPerCm: 7,
  weave: 0.6,
  lightX: -0.6,
  lightY: 0.62,
}

/** Plain-weave height at a point (mm), 0..1. */
function weaveHeight(xmm: number, ymm: number, pitch: number): number {
  const u = xmm / pitch
  const vv = ymm / pitch
  const iu = Math.floor(u)
  const iv = Math.floor(vv)
  const fu = u - iu
  const fv = vv - iv
  // Rounded cross-section of each thread across its own width.
  const warp = Math.sin(Math.PI * clamp(fu, 0, 1))
  const weft = Math.sin(Math.PI * clamp(fv, 0, 1))
  const over = ((iu + iv) & 1) === 0
  return over ? Math.max(warp, weft * 0.4) : Math.max(weft, warp * 0.4)
}

/** Paint the fabric into the framebuffer base (z = 0, full coverage). */
export function paintFabric(fb: Framebuffer, opts: FabricOpts, pps: number): void {
  const { w, h } = fb
  const base = parseHex(opts.hex)
  const threadsPerCm = opts.threadsPerCm ?? FABRIC_DEFAULT.threadsPerCm
  const weave = opts.weave ?? FABRIC_DEFAULT.weave
  const pitch = 10 / threadsPerCm // mm between thread centres
  const lx = opts.lightX ?? FABRIC_DEFAULT.lightX
  const ly = opts.lightY ?? FABRIC_DEFAULT.lightY
  const ll = Math.hypot(lx, ly) || 1
  const lxn = lx / ll
  const lyn = ly / ll
  const eps = pitch * 0.18 // finite-difference step in mm
  const amp = weave * 0.9

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const xmm = (x + 0.5) / pps
      const ymm = (y + 0.5) / pps
      const hC = weaveHeight(xmm, ymm, pitch)
      const hX = weaveHeight(xmm + eps, ymm, pitch)
      const hY = weaveHeight(xmm, ymm + eps, pitch)
      // Surface gradient -> a 2D-ish normal; light it with a plane-lambert.
      const gx = (hX - hC) * amp
      const gy = (hY - hC) * amp
      // Normal (−gx, −gy, 1) projected lambert against (lxn, lyn) in plane.
      // Screen y is down, so flip gy to match an up-light.
      const lambert = clamp(0.5 + (-gx * lxn + gy * lyn) * 2.6, 0, 1.4)
      // Slubby fibre variation in the cloth.
      const slub = 1 + (valueNoise3(xmm * 1.3 + opts.seed, ymm * 1.3, opts.seed * 0.5) - 0.5) * 0.1
      const dip = 1 - (1 - hC) * 0.22 // crevices between threads sit a touch darker
      const shade = (0.74 + 0.34 * lambert) * slub * dip
      fb.setBase(
        x,
        y,
        {
          r: base.r * shade,
          g: base.g * shade,
          b: base.b * shade,
        },
        0,
      )
    }
  }
}
