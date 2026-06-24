/**
 * A small CPU software renderer for thread.
 *
 * This is a real per-pixel rasteriser, not SVG shape-compositing. Thread only
 * reads as thread when it is shaded per-pixel: a floss strand is a slightly
 * twisted, faintly fuzzy tube that catches light ALONG its length (the
 * anisotropic sheen of stranded cotton), nests against its neighbours with
 * shadow in the crevices, and casts a soft shadow onto the fabric below it.
 * None of that is expressible as flat filled paths, so we shade every covered
 * pixel ourselves and resolve crossings with a z-buffer.
 *
 * The whole engine is built on ONE primitive: a `ThreadSeg` capsule. Fabric is
 * warp + weft capsules at z=0; embroidery is capsules at z>0. Satin, stem,
 * chain, knots — every stitch decomposes to capsules. That uniformity is what
 * makes the render accurate-by-construction: there is no separate "looks like a
 * French knot" code path, only real thread laid where the pattern says.
 *
 * Adapted from the crochet-era yarn rasteriser (the one piece of that work that
 * carries over): the per-pixel fibre shading, screen-space AO, directional
 * self-shadow and the photographic develop pass are proven. Embroidery is flat
 * (2.5D), so the 3D/Blender machinery is gone; this stays a fast 2D raster.
 */

import { add, clamp, normalize, v, type Vec3 } from '../core/vec'
import { hash2 } from '../core/noise'
import type { Rgb } from '../core/color'

export interface Material {
  /** Base thread colour, 0..255. */
  colour: Rgb
  /** Fibre sheen 0..1 — matte wool low, stranded cotton mid, silk/rayon high. */
  sheen: number
  /** Tightness of the sheen highlight; higher = glossier, tighter band. */
  shininess: number
  /** Twists per millimetre of strand — drives the ply banding striation. */
  plyPerMm: number
  /** Fibre-halo amount 0..1 — smooth cotton ~0.1, wool ~0.4, wool roving ~1. */
  halo: number
}

export interface Lights {
  /** Key light direction (view space, toward the light), unit length. */
  key: Vec3
  /** Ambient floor 0..1. */
  ambient: number
  /** Fill light from the camera side, softens the shadow side. */
  fill: number
  /** Hemispheric ambient tint from above (cool), near-white multiplier. */
  skyTint: Rgb
  /** Hemispheric ambient tint from below (warm bounce), near-white multiplier. */
  groundTint: Rgb
}

/**
 * A capsule of thread: view-space endpoints (mm, for lighting) + screen-space
 * endpoints (px, for coverage/depth) + radius. `along` keeps the ply banding
 * continuous from one capsule to the next along a stitch.
 */
export interface ThreadSeg {
  /** View-space endpoints in mm — for lighting (tangent, normal) and depth. */
  av: Vec3
  bv: Vec3
  /** Screen-space endpoints in px (supersampled) — for coverage + depth. */
  ax: number
  ay: number
  bx: number
  by: number
  /** Screen radius in px. */
  r: number
  /** Distance along the strand at `av`, in mm — keeps ply banding continuous. */
  along: number
  material: Material
  /** Stable per-stitch seed for deterministic micro-irregularity. */
  seed: number
}

const VIEWDIR = v(0, 0, 1)

export class Framebuffer {
  readonly w: number
  readonly h: number
  readonly col: Float32Array // rgb, 0..1
  readonly depth: Float32Array // larger = nearer/higher; -inf = empty
  readonly cov: Float32Array // coverage / alpha 0..1
  private lights: Lights

  constructor(w: number, h: number, lights: Lights) {
    this.w = w
    this.h = h
    this.col = new Float32Array(w * h * 3)
    this.depth = new Float32Array(w * h).fill(-Infinity)
    this.cov = new Float32Array(w * h)
    this.lights = lights
  }

  /**
   * Write a flat base pixel (used by the fabric ground): colour at z, full
   * coverage. Threads splatted later (z>0) sit on top.
   */
  setBase(x: number, y: number, c: Rgb, z: number): void {
    const idx = y * this.w + x
    const o = idx * 3
    this.col[o] = c.r / 255
    this.col[o + 1] = c.g / 255
    this.col[o + 2] = c.b / 255
    this.cov[idx] = 1
    this.depth[idx] = z
  }

  splat(seg: ThreadSeg): void {
    const { w, h } = this
    const r = seg.r
    const minX = Math.max(0, Math.floor(Math.min(seg.ax, seg.bx) - r - 1))
    const maxX = Math.min(w - 1, Math.ceil(Math.max(seg.ax, seg.bx) + r + 1))
    const minY = Math.max(0, Math.floor(Math.min(seg.ay, seg.by) - r - 1))
    const maxY = Math.min(h - 1, Math.ceil(Math.max(seg.ay, seg.by) + r + 1))
    if (minX > maxX || minY > maxY) return

    const abx = seg.bx - seg.ax
    const aby = seg.by - seg.ay
    const abLen2 = abx * abx + aby * aby || 1e-6
    const segLenPx = Math.sqrt(abLen2)

    // Screen tangent + perpendicular for the tube cross-section.
    const tx = abx / segLenPx
    const ty = aby / segLenPx
    const perpX = -ty
    const perpY = tx

    // View-space tangent for anisotropic fibre shading.
    const Tv = normalize({ x: seg.bv.x - seg.av.x, y: seg.bv.y - seg.av.y, z: seg.bv.z - seg.av.z })
    // View-space direction that projects to the screen perpendicular (screen y
    // is flipped relative to view y).
    const perp3 = normalize(v(perpX, -perpY, 0))
    const L = this.lights.key
    const H = normalize(add(L, VIEWDIR))
    const mat = seg.material
    const segViewLen = Math.hypot(
      seg.bv.x - seg.av.x,
      seg.bv.y - seg.av.y,
      seg.bv.z - seg.av.z,
    )
    // The fibre highlight is a BRIGHT version of the floss colour, not pure
    // white — coloured thread keeps its hue in the sheen. Pure-white specular is
    // what washed thin stitches out to pale ghosts.
    const SPEC_MIX = 0.5
    const specR = mat.colour.r + (255 - mat.colour.r) * SPEC_MIX
    const specG = mat.colour.g + (255 - mat.colour.g) * SPEC_MIX
    const specB = mat.colour.b + (255 - mat.colour.b) * SPEC_MIX

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const pax = x + 0.5 - seg.ax
        const pay = y + 0.5 - seg.ay
        let t = (pax * abx + pay * aby) / abLen2
        t = t < 0 ? 0 : t > 1 ? 1 : t
        const cxp = seg.ax + abx * t
        const cyp = seg.ay + aby * t
        const dx = x + 0.5 - cxp
        const dy = y + 0.5 - cyp
        const dist = Math.hypot(dx, dy)
        if (dist > r) continue

        // Signed cross-section coordinate in [-1, 1].
        const s = (dx * perpX + dy * perpY) / r
        const s2 = clamp(s, -1, 1)
        const bulge = Math.sqrt(Math.max(0, 1 - s2 * s2))

        // Depth: along the segment (mm) plus the tube's near bulge so round
        // strands occlude correctly where stitches cross.
        const za = seg.av.z
        const zb = seg.bv.z
        const depth = za + (zb - za) * t + bulge * 0.18

        const idx = y * w + x
        if (depth <= this.depth[idx]!) {
          // Behind what's already here. Skip if clearly behind; near-ties still
          // feather so crossings aren't crisp.
          if (depth < this.depth[idx]! - 0.25) continue
        }

        // ---- Per-pixel fibre shading ----
        const N = normalize({
          x: perp3.x * s2 + VIEWDIR.x * bulge,
          y: perp3.y * s2 + VIEWDIR.y * bulge,
          z: perp3.z * s2 + VIEWDIR.z * bulge,
        })

        const NdotL = Math.max(0, N.x * L.x + N.y * L.y + N.z * L.z)
        // Kajiya–Kay: fibre catches light along the strand, not by a point normal.
        const TdotL = Tv.x * L.x + Tv.y * L.y + Tv.z * L.z
        const diffKK = Math.sqrt(Math.max(0, 1 - TdotL * TdotL))
        let diffuse = this.lights.ambient + (1 - this.lights.ambient) * (0.55 * NdotL + 0.45 * diffKK)
        diffuse += this.lights.fill * Math.max(0, N.z)

        // Anisotropic sheen band running along the strand (the floss highlight).
        const TdotH = Tv.x * H.x + Tv.y * H.y + Tv.z * H.z
        const specA = Math.pow(Math.sqrt(Math.max(0, 1 - TdotH * TdotH)), mat.shininess) * mat.sheen
        // Round bulge highlight from the tube normal.
        const NdotH = Math.max(0, N.x * H.x + N.y * H.y + N.z * H.z)
        const specN = Math.pow(NdotH, mat.shininess * 0.6) * mat.sheen * 0.5

        // Ply twist: a SUBTLE periodic light/dark banding along the strand,
        // skewed slightly by the cross coordinate. Stranded cotton has a real
        // twist, but it must whisper — overdo it and parallel threads turn into
        // candy-cane corduroy instead of smooth floss.
        const alongMm = seg.along + t * segViewLen
        const plyPhase = alongMm * mat.plyPerMm * Math.PI * 2 + s2 * 0.8
        const ply = Math.sin(plyPhase)
        const plyShade = 1 + 0.05 * ply
        const plyGlint = ply > 0.85 ? (ply - 0.85) * 0.6 * mat.sheen : 0

        // Micro fibre noise so nothing is mechanically uniform.
        const noise = hash2(x * 0.5 + seg.seed, y * 0.5 - seg.seed)
        const fuzz = 1 + (noise - 0.5) * 0.1 * (0.5 + mat.halo)

        const shadeAmt = diffuse * plyShade * fuzz
        const whiteSpec = specA + specN + plyGlint

        // Hemispheric ambient tint: strands facing up pick up the cool light,
        // those facing down the warm bounce. Kills the flat single-colour CG look.
        const hy = 0.5 + 0.5 * N.y
        const tintR = this.lights.groundTint.r + (this.lights.skyTint.r - this.lights.groundTint.r) * hy
        const tintG = this.lights.groundTint.g + (this.lights.skyTint.g - this.lights.groundTint.g) * hy
        const tintB = this.lights.groundTint.b + (this.lights.skyTint.b - this.lights.groundTint.b) * hy

        let cr = mat.colour.r * shadeAmt * tintR + specR * whiteSpec
        let cg = mat.colour.g * shadeAmt * tintG + specG * whiteSpec
        let cb = mat.colour.b * shadeAmt * tintB + specB * whiteSpec
        cr = cr < 0 ? 0 : cr > 255 ? 255 : cr
        cg = cg < 0 ? 0 : cg > 255 ? 255 : cg
        cb = cb < 0 ? 0 : cb > 255 ? 255 : cb

        // Edge feather: fade coverage at the tube rim for a soft, fibrous edge.
        const cov = smoothstep(1.0, 0.74, Math.abs(s))

        if (depth >= this.depth[idx]!) {
          const o = idx * 3
          this.col[o] = mix(this.col[o]!, cr / 255, cov)
          this.col[o + 1] = mix(this.col[o + 1]!, cg / 255, cov)
          this.col[o + 2] = mix(this.col[o + 2]!, cb / 255, cov)
          if (cov > this.cov[idx]!) this.cov[idx] = cov
          if (depth > this.depth[idx]!) this.depth[idx] = depth
        }
      }
    }
  }

  /**
   * Screen-space ambient occlusion from the depth buffer: a pixel is darkened
   * when nearby pixels are higher than it — exactly the crevice between threads
   * and where a stitch meets the fabric. Turns a field of lit tubes into a
   * surface with real depth.
   */
  ambientOcclusion(radiusPx: number, strength: number): void {
    const { w, h, depth, col } = this
    const ao = new Float32Array(w * h)
    const R = Math.max(1, Math.round(radiusPx))
    const samples = [
      [R, 0], [-R, 0], [0, R], [0, -R],
      [R, R], [R, -R], [-R, R], [-R, -R],
      [R * 2, 0], [-R * 2, 0], [0, R * 2], [0, -R * 2],
    ]
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x
        const dC = depth[idx]!
        let occ = 0
        let n = 0
        for (const [sx, sy] of samples) {
          const nx = x + sx!
          const ny = y + sy!
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
          const nidx = ny * w + nx
          n++
          if (depth[nidx]! > dC + 0.06) occ++
        }
        ao[idx] = n > 0 ? occ / n : 0
      }
    }
    // Blur the occlusion so it reads as soft self-shadow, not blotchy patches.
    const aoB = blur1(ao, w, h, Math.max(1, Math.round(R)))
    for (let i = 0; i < w * h; i++) {
      const k = 1 - strength * aoB[i]!
      const o = i * 3
      col[o] = col[o]! * k
      col[o + 1] = col[o + 1]! * k
      col[o + 2] = col[o + 2]! * k
    }
  }

  /**
   * Directional self-shadow: march toward the key light in screen space and
   * darken a pixel if a higher stitch stands between it and the light. This is
   * the soft shadow each raised stitch casts onto the fabric / lower threads —
   * the cue AO (crevice-only) can't give.
   */
  directionalShadow(opts: {
    lx: number
    ly: number
    steps: number
    stepPx: number
    bias: number
    range: number
    strength: number
  }): void {
    const { w, h, depth, col } = this
    const shadow = new Float32Array(w * h)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x
        const dC = depth[idx]!
        let occ = 0
        for (let i = 1; i <= opts.steps; i++) {
          const nx = Math.round(x + opts.lx * opts.stepPx * i)
          const ny = Math.round(y + opts.ly * opts.stepPx * i)
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) break
          const nidx = ny * w + nx
          const rise = depth[nidx]! - dC - opts.bias
          if (rise > 0) {
            const f = Math.min(1, rise / opts.range) * (1 - (i - 1) / opts.steps)
            if (f > occ) occ = f
          }
        }
        shadow[idx] = occ
      }
    }
    // Soften the cast shadow into a penumbra.
    const sB = blur1(shadow, w, h, Math.max(1, Math.round(opts.stepPx * 1.5)))
    for (let i = 0; i < w * h; i++) {
      const k = 1 - opts.strength * sB[i]!
      const o = i * 3
      col[o] = col[o]! * k
      col[o + 1] = col[o + 1]! * k
      col[o + 2] = col[o + 2]! * k
    }
  }

  /**
   * Develop the raw render into a photograph: a gentle filmic tone curve, a
   * touch of saturation, a soft vignette, fine grain, optional highlight bloom.
   * Flat embroidery wants a crisp, evenly-lit hoop shot, so depth-of-field and
   * chromatic aberration (which suited the 3D macro doll) default off.
   */
  develop(opts: {
    ss: number
    bloom?: number
    grain?: number
    vignette?: number
    exposure?: number
    saturation?: number
    contrast?: number
    dof?: number
  }): { data: Buffer; width: number; height: number } {
    const { w, h, col, depth, cov } = this
    const full = col.slice()
    const cxv = w / 2
    const cyv = h / 2
    const maxR = Math.hypot(cxv, cyv)
    const exposure = opts.exposure ?? 1.0

    // Depth-of-field: a macro shot keeps the raised stitches sharp and lets the
    // cloth fall softly out of focus. Focus on the highest stitches; blur grows
    // with distance below that plane (the ground at z=0 gets the softest).
    const dof = opts.dof ?? 0
    if (dof > 0) {
      let focal = -Infinity
      for (let i = 0; i < w * h; i++) if (cov[i]! > 0.3 && depth[i]! > focal) focal = depth[i]!
      if (focal > -Infinity) {
        const blurred = boxBlur(full, w, h, Math.max(1, Math.round(dof * 7)))
        for (let i = 0; i < w * h; i++) {
          const coc = Math.min(1, Math.abs(depth[i]! - focal) * 0.9) * dof
          const o = i * 3
          full[o] = mix(full[o]!, blurred[o]!, coc)
          full[o + 1] = mix(full[o + 1]!, blurred[o + 1]!, coc)
          full[o + 2] = mix(full[o + 2]!, blurred[o + 2]!, coc)
        }
      }
    }

    // Bloom: bleed light out of the brightest highlights (the floss sheen).
    const bloom = opts.bloom ?? 0
    if (bloom > 0) {
      const bright = new Float32Array(w * h * 3)
      for (let i = 0; i < w * h; i++) {
        const o = i * 3
        const l = 0.2126 * full[o]! + 0.7152 * full[o + 1]! + 0.0722 * full[o + 2]!
        const e = Math.max(0, l - 0.8)
        bright[o] = full[o]! * e
        bright[o + 1] = full[o + 1]! * e
        bright[o + 2] = full[o + 2]! * e
      }
      const bl = boxBlur(boxBlur(bright, w, h, 8), w, h, 14)
      for (let i = 0; i < w * h * 3; i++) full[i] = full[i]! + bl[i]! * bloom * 1.4
    }

    const vig = opts.vignette ?? 0
    const grain = opts.grain ?? 0
    const sat = opts.saturation ?? 1.06
    const contrast = opts.contrast ?? 1.0
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 3
        let r = filmic(full[o]! * exposure * 1.02)
        let g = filmic(full[o + 1]! * exposure)
        let b = filmic(full[o + 2]! * exposure * 0.99)
        // Gentle S-curve contrast around mid-grey — gives the punch a flat
        // filmic curve lacks, without crushing.
        if (contrast !== 1.0) {
          r = contrastS(r, contrast)
          g = contrastS(g, contrast)
          b = contrastS(b, contrast)
        }
        const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
        r = l + (r - l) * sat
        g = l + (g - l) * sat
        b = l + (b - l) * sat
        if (vig > 0) {
          const d = Math.hypot(x - cxv, y - cyv) / maxR
          const k = 1 - vig * smoothstep(0.55, 1.1, d)
          r *= k
          g *= k
          b *= k
        }
        if (grain > 0) {
          const n = (hash2(x * 1.3 + 7, y * 0.7 + 3) - 0.5) * grain * 0.07
          r += n
          g += n
          b += n
        }
        full[o] = r
        full[o + 1] = g
        full[o + 2] = b
      }
    }

    // Box downsample by ss into 8-bit RGBA.
    const ss = Math.max(1, Math.round(opts.ss))
    const ow = Math.floor(w / ss)
    const oh = Math.floor(h / ss)
    const out = Buffer.alloc(ow * oh * 4)
    const inv = 1 / (ss * ss)
    for (let y = 0; y < oh; y++) {
      for (let x = 0; x < ow; x++) {
        let r = 0
        let g = 0
        let b = 0
        for (let j = 0; j < ss; j++) {
          for (let i = 0; i < ss; i++) {
            const o = ((y * ss + j) * w + (x * ss + i)) * 3
            r += full[o]!
            g += full[o + 1]!
            b += full[o + 2]!
          }
        }
        const oo = (y * ow + x) * 4
        out[oo] = clamp(r * inv * 255, 0, 255)
        out[oo + 1] = clamp(g * inv * 255, 0, 255)
        out[oo + 2] = clamp(b * inv * 255, 0, 255)
        out[oo + 3] = 255
      }
    }
    return { data: out, width: ow, height: oh }
  }
}

/** Filmic-ish tone curve (Reinhard with a shoulder) for photographic falloff. */
function filmic(x: number): number {
  const vv = Math.max(0, x)
  return (vv * (2.51 * vv + 0.03)) / (vv * (2.43 * vv + 0.59) + 0.14)
}

/** Separable box blur on an RGB float buffer. */
function boxBlur(src: Float32Array, w: number, h: number, radius: number): Float32Array {
  if (radius < 1) return src.slice()
  const tmp = new Float32Array(src.length)
  const dst = new Float32Array(src.length)
  const norm = 1 / (radius * 2 + 1)
  for (let y = 0; y < h; y++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0
      for (let x = -radius; x <= radius; x++) sum += src[(y * w + clampi(x, 0, w - 1)) * 3 + c]!
      for (let x = 0; x < w; x++) {
        tmp[(y * w + x) * 3 + c] = sum * norm
        const xo = clampi(x - radius, 0, w - 1)
        const xn = clampi(x + radius + 1, 0, w - 1)
        sum += src[(y * w + xn) * 3 + c]! - src[(y * w + xo) * 3 + c]!
      }
    }
  }
  for (let x = 0; x < w; x++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0
      for (let y = -radius; y <= radius; y++) sum += tmp[(clampi(y, 0, h - 1) * w + x) * 3 + c]!
      for (let y = 0; y < h; y++) {
        dst[(y * w + x) * 3 + c] = sum * norm
        const yo = clampi(y - radius, 0, h - 1)
        const yn = clampi(y + radius + 1, 0, h - 1)
        sum += tmp[(yn * w + x) * 3 + c]! - tmp[(yo * w + x) * 3 + c]!
      }
    }
  }
  return dst
}

/** Separable box blur on a single-channel buffer (AO / shadow masks). */
function blur1(src: Float32Array, w: number, h: number, radius: number): Float32Array {
  if (radius < 1) return src.slice()
  const tmp = new Float32Array(src.length)
  const dst = new Float32Array(src.length)
  const norm = 1 / (radius * 2 + 1)
  for (let y = 0; y < h; y++) {
    let sum = 0
    for (let x = -radius; x <= radius; x++) sum += src[y * w + clampi(x, 0, w - 1)]!
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = sum * norm
      sum += src[y * w + clampi(x + radius + 1, 0, w - 1)]! - src[y * w + clampi(x - radius, 0, w - 1)]!
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0
    for (let y = -radius; y <= radius; y++) sum += tmp[clampi(y, 0, h - 1) * w + x]!
    for (let y = 0; y < h; y++) {
      dst[y * w + x] = sum * norm
      sum += tmp[clampi(y + radius + 1, 0, h - 1) * w + x]! - tmp[clampi(y - radius, 0, h - 1) * w + x]!
    }
  }
  return dst
}

/** Symmetric S-curve contrast around mid-grey. */
function contrastS(x: number, k: number): number {
  const t = clamp(x, 0, 1)
  const c = t < 0.5 ? 0.5 * Math.pow(2 * t, k) : 1 - 0.5 * Math.pow(2 * (1 - t), k)
  return c
}

function clampi(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export { VIEWDIR }
