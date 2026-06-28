/**
 * Build the Blender backend scene from the loom's thread strokes.
 *
 * `loom_render.py` (the photoreal hero backend) reads a JSON scene of the form
 * `{ fabric, strokes: [{ hex, sheen, radiusMm, filaments }] }`. Both proof
 * scripts (`loom-blender-proof`, `loom-render-fixture`) hand-rolled this same
 * conversion; this factors it into one pure function so the production
 * `renderHero` entrypoint and the proof scripts agree byte-for-byte.
 *
 * Pure + deterministic: no node deps, no I/O. It also carries the one cosmetic
 * grade we want applied BEFORE Blender sees the colours — pulling over-saturated
 * greens back a touch (the foliage was rendering a shade too electric). Doing it
 * here (rather than a global compositor saturation) keeps it per-pattern: only
 * the greens that are actually present get nudged, every other floss colour is
 * passed through untouched.
 */

import { filamentPolylines, type ThreadStroke } from './thread'

export interface BlenderFabric {
  widthMm: number
  heightMm: number
  hex: string
  /**
   * Mounting frame, drives how `loom_render.py` frames the hero:
   *   HOOP / RING_FRAME / null → a round wooden hoop on a SQUARED canvas (so a
   *     portrait design's circular hoop isn't clipped left/right).
   *   SLATE_FRAME / STRETCHER_BARS / Q_SNAPS → a rectangular wooden frame hugging
   *     the design (canvas follows the design's aspect).
   *   NONE → no frame, just taut cloth (canvas squared for portrait).
   */
  frameType?: string | null
}

export interface BlenderStroke {
  hex: string
  sheen: number
  radiusMm: number
  filaments: number[][][]
}

export interface BlenderScene {
  fabric: BlenderFabric
  strokes: BlenderStroke[]
}

export interface BlenderSceneOptions {
  /**
   * Pull saturated greens down a touch (the foliage over-saturates under the
   * AgX + saturation grade). Default on; the magnitude is `greenDesat`.
   */
  tameGreens?: boolean
  /** Multiplier applied to a green's saturation when `tameGreens` (1 = no-op). */
  greenDesat?: number
  /**
   * Pull HIGHLY-saturated WARM hues (reds / warm pinks) down a touch. AgX skews
   * bright saturated reds toward orange; easing their saturation (and the very
   * brightest a hair darker) keeps them reading as true red/rose. OFF by default
   * so other crafts are untouched; surface-embroidery (needle-painting in rich
   * rose/red palettes) opts in. Muted warm tones are left alone.
   */
  tameWarm?: boolean
  /** Multiplier applied to a warm hue's saturation when `tameWarm` (1 = no-op). */
  warmDesat?: number
}

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))

function channelHex(c: number): string {
  return clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0')
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${channelHex(r)}${channelHex(g)}${channelHex(b)}`
}

/** sRGB 0-255 -> HSL (h in degrees 0-360, s/l in 0-1). */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return { h: 0, s: 0, l }
  const s = d / (1 - Math.abs(2 * l - 1))
  let h: number
  if (max === rn) h = ((gn - bn) / d) % 6
  else if (max === gn) h = (bn - rn) / d + 2
  else h = (rn - gn) / d + 4
  h *= 60
  if (h < 0) h += 360
  return { h, s, l }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let r = 0
  let g = 0
  let b = 0
  if (hp >= 0 && hp < 1) [r, g, b] = [c, x, 0]
  else if (hp < 2) [r, g, b] = [x, c, 0]
  else if (hp < 3) [r, g, b] = [0, c, x]
  else if (hp < 4) [r, g, b] = [0, x, c]
  else if (hp < 5) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const m = l - c / 2
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

/**
 * Tame an over-saturated green. Greens (hue ~70-165) that carry a lot of chroma
 * read as electric once AgX + the saturation grade hit them; nudge their
 * saturation down. Everything outside the green band is returned untouched.
 */
export function tameGreen(hex: string, desat: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return hex
  const n = parseInt(m[1]!, 16)
  const r = (n >> 16) & 0xff
  const g = (n >> 8) & 0xff
  const b = n & 0xff
  const { h, s, l } = rgbToHsl(r, g, b)
  const isGreen = h >= 70 && h <= 165
  if (!isGreen || s < 0.35) return rgbToHex(r, g, b)
  // Scale the saturation toward grey; the stronger the saturation the more we
  // pull, so a deep forest green is calmed more than a soft sage.
  const pull = desat + (1 - desat) * (1 - clamp(s, 0, 1))
  const out = hslToRgb(h, clamp(s * pull, 0, 1), l)
  return rgbToHex(out.r, out.g, out.b)
}

/**
 * Tame an over-saturated WARM hue (red / orange / warm pink). AgX skews bright
 * saturated reds toward orange; pull their saturation down (the more saturated,
 * the more pull) and ease the very brightest a hair darker so they stay out of
 * AgX's bright-red rolloff. Muted warm tones and everything outside the warm band
 * are returned untouched.
 */
export function tameWarm(hex: string, desat: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return hex
  const n = parseInt(m[1]!, 16)
  const r = (n >> 16) & 0xff
  const g = (n >> 8) & 0xff
  const b = n & 0xff
  const { h, s, l } = rgbToHsl(r, g, b)
  const isWarm = h >= 330 || h <= 38
  if (!isWarm || s < 0.4) return rgbToHex(r, g, b)
  // AgX skews even medium warm-reds to orange, so pull saturated warm tones down
  // firmly (a would-be-orange red lands as a true dusty rose). Soft tones (s<0.4)
  // are already faithful and left alone.
  const s2 = Math.min(s * desat, 0.34)
  const l2 = s > 0.6 ? l * 0.95 : l
  const out = hslToRgb(h, clamp(s2, 0, 1), clamp(l2, 0, 1))
  return rgbToHex(out.r, out.g, out.b)
}

/**
 * Convert a flat list of thread strokes into the Blender backend scene. This is
 * the single source of truth for that conversion.
 */
export function strokesToBlenderScene(
  strokes: ThreadStroke[],
  fabric: BlenderFabric,
  options: BlenderSceneOptions = {},
): BlenderScene {
  const tame = options.tameGreens ?? true
  const desat = options.greenDesat ?? 0.82
  const tameW = options.tameWarm ?? false
  const warmDesat = options.warmDesat ?? 0.7
  return {
    fabric,
    strokes: strokes.map((st) => {
      const fp = filamentPolylines(st)
      const raw = rgbToHex(st.material.colour.r, st.material.colour.g, st.material.colour.b)
      let hex = tame ? tameGreen(raw, desat) : raw
      if (tameW) hex = tameWarm(hex, warmDesat)
      return {
        hex,
        sheen: st.material.sheen,
        radiusMm: fp.radiusMm,
        filaments: fp.filaments.map((poly) => poly.map((q) => [q.x, q.y, q.z])),
      }
    }),
  }
}
