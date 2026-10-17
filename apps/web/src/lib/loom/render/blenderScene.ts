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

/**
 * The styled listing-photo SET a crochet hero is shot in (bar criterion 8,
 * "photographed like a bestseller"). Read by `loom_render_crochet.py` as
 * `view.stage`; it only adds set dressing round the piece and moves the camera
 * (elevation, distance, aperture), never the piece, its yarn or its colours
 * (notes/feedback_hero_must_be_exact_pattern.md). Everything in a set is built
 * procedurally in Blender: no downloaded or third-party photos.
 *
 *   studio      the clean near-white product sweep (the default; an absent
 *               `stage` renders exactly as before)
 *   linen       a rumpled oatmeal linen throw, cream wall, warm side light
 *   windowsill  a wooden sill, a bright blurred window, a linen napkin, a jug,
 *               books and a dried lavender bunch out of focus
 *   nursery     a cream knit blanket, blush wall, picture frame, wooden star,
 *               a glowing lantern and a lilac blanket
 *   christmas   a cream knit throw, pine sprigs, red berries, fairy-light bokeh
 */
export const HERO_STAGES = ['studio', 'linen', 'windowsill', 'nursery', 'christmas'] as const
export type HeroStage = (typeof HERO_STAGES)[number]

export function isHeroStage(v: unknown): v is HeroStage {
  return typeof v === 'string' && (HERO_STAGES as readonly string[]).includes(v)
}

/**
 * Each styled set comes in several VARIANTS (different props, surface, palette,
 * light direction and time of day) so a shelf of listings does not all look
 * the same. Read by `loom_render_crochet.py` as `view.stageVariant`; the FIRST
 * id of each list is the original set (and what an absent `stageVariant`
 * renders). The order here must match `STAGE_VARIANTS` in the Python.
 *
 *   linen       throw (oatmeal throw, vase of pampas) / basket (wicker basket of
 *               yarn balls) / worktable (oak table, scissors, hook, yarn) /
 *               dried (blush linen, jar of dried grasses, loose rose heads)
 *   windowsill  garden (morning garden, jug, dried bunch) / rain (grey rainy
 *               day, drops on the glass, a mug) / autumn (low gold sun, fallen
 *               leaves, a pumpkin) / spring (gingham, a glass jar of tulips)
 *   nursery     lantern (cream knit, lilac blanket, star lantern) / cot (white
 *               cot sheet, rails, bunting) / shelf (wooden shelf, books, a
 *               potted plant) / rug (pastel rug, wooden blocks, stacking rings)
 *   christmas   pine (pine sprigs, berries, fairy bokeh, candle lantern) /
 *               baubles (a branch hung with baubles over white fur) / snow (a
 *               snowy night window, white knit, a candle) / gifts (wrapped
 *               presents, kraft and red ribbon, bokeh)
 */
export const HERO_STAGE_VARIANTS = {
  linen: ['throw', 'basket', 'worktable', 'dried'],
  windowsill: ['garden', 'rain', 'autumn', 'spring'],
  nursery: ['lantern', 'cot', 'shelf', 'rug'],
  christmas: ['pine', 'baubles', 'snow', 'gifts'],
} as const satisfies Record<Exclude<HeroStage, 'studio'>, readonly string[]>

export type HeroStageVariant = (typeof HERO_STAGE_VARIANTS)[keyof typeof HERO_STAGE_VARIANTS][number]

/** FNV-1a 32-bit: a stable hash of the pattern's slug (same in every run and
 *  every Node version), so a pattern always gets the same set. */
function fnv1a(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

/**
 * The variant of `stage` a pattern is shot in: `explicit` when it names one of
 * that stage's variants (fixed by hand), otherwise picked deterministically
 * from a hash of `seed` (the pattern's slug). Studio has no variants.
 */
export function pickHeroStageVariant(stage: HeroStage, seed: string, explicit?: string): string | undefined {
  if (stage === 'studio') return undefined
  const ids: readonly string[] = HERO_STAGE_VARIANTS[stage]
  if (explicit && ids.includes(explicit)) return explicit
  return ids[fnv1a(seed) % ids.length]
}

/**
 * The listing PHOTO style a styled stage is shot with (job stage2, "the photo
 * is flat"). Read by `loom_render_crochet.py` as `view.photo`; only a styled
 * stage reads it, and an absent `photo` (or 'v1') is the stage exactly as
 * before, so no existing hero moves.
 *
 *   v1  the original stage photo (even light from the front, f/14, the
 *       stage's own camera and props)
 *   v2  one soft warm window key from the side with soft-edged shadows, a
 *       gentle fill and a little rim; a wide real aperture (f/5.6) focused on
 *       the toy's face so the room melts into bokeh; a slight turn with the
 *       eye line at the face; the dried bunch rebuilt from thin stems, small
 *       heads and wisps, the cloth under the toy softly crumpled, the spring
 *       jug brought into frame
 */
export const HERO_PHOTO_STYLES = ['v1', 'v2'] as const
export type HeroPhoto = (typeof HERO_PHOTO_STYLES)[number]

export function isHeroPhoto(v: unknown): v is HeroPhoto {
  return typeof v === 'string' && (HERO_PHOTO_STYLES as readonly string[]).includes(v)
}

/**
 * The individual knobs behind `photo: 'v2'` (each wins over the v2 default
 * when set; with v2 off each is a no-op unless set). Names and defaults match
 * `PHOTO_V2` in loom_render_crochet.py (checked by blenderScene.test.ts).
 */
export interface HeroPhotoKnobs {
  /** 'window' = the one-sided window rig (v2), 'stage' = the stage's own lights. */
  photoLight?: 'window' | 'stage'
  /** Key strength relative to the studio key at the piece (1.6). */
  photoKey?: number
  /** Key azimuth in degrees: 0 from the camera, 90 camera left, 180 behind;
   *  negative = camera right (80). */
  photoKeyDeg?: number
  /** Key elevation in degrees (30). */
  photoKeyElev?: number
  /** Key size over its distance: bigger = softer shadow edges (0.55). */
  photoKeySoft?: number
  /** Key spread in degrees: narrower keeps the window light on the toy and off the wall (70). */
  photoKeySpread?: number
  /** Fill strength on the far side (0.15). */
  photoFill?: number
  /** Rim strength, from behind on the key's side (0.9). */
  photoRim?: number
  /** Multiplier on the stage's own room lights (0.2). */
  photoSetLight?: number
  /** Multiplier on the studio key + fill kept on the toy (0.15). */
  photoStudio?: number
  /** Multiplier on the world (ambient) strength (0.4). */
  photoAmbient?: number
  /** Added to the stage exposure (0). */
  photoExposure?: number
  /** A real f-number (5.6); smaller = a creamier background. */
  photoFstop?: number
  /** 'face' focuses on the eyes/nose, 'centre' on the aim point. */
  photoFocus?: 'face' | 'centre'
  /** 'threequarter' = the turned, face-height camera; 'stage' = the set's own. */
  photoCamera?: 'threequarter' | 'stage'
  /** The turn, added to the scene's own yaw (16). */
  photoYawDeg?: number
  /** Camera tilt, 90 = level (77: the cow bar looks down ~13 deg; the stages use 80). */
  photoTiltDeg?: number
  /** The piece's height as a share of the frame height; 0 = the stage zoom.
   *  Unset under v2 = per stage (`PHOTO_FRAME_BY`: nursery 0.82, christmas
   *  0.74, linen 0.72, windowsill 0.68; 0.68 otherwise). */
  photoFrame?: number
  /** Aim height as a fraction of the piece height (0.5). */
  photoAim?: number
  /** 'v2' = the rebuilt dried bunch and the spring jug in frame. */
  photoProps?: 'v1' | 'v2'
  /** The cloth under the toy: 'auto' = the stage's own, softly crumpled;
   *  'knit' / 'linen' swap it; 'none' leaves the stage's cloth as it was. */
  photoBlanket?: 'auto' | 'knit' | 'linen' | 'none'
  /** Crumple depth as a fraction of the piece height (0.09). */
  photoCrumple?: number
}

/** The v2 defaults, mirrored from `PHOTO_V2` in the Python (documentation and
 *  the parity test; the renderer applies them itself). */
export const HERO_PHOTO_V2_DEFAULTS: Required<HeroPhotoKnobs> = {
  photoLight: 'window',
  photoKey: 1.6,
  photoKeyDeg: 80,
  photoKeyElev: 30,
  photoKeySoft: 0.55,
  photoKeySpread: 70,
  photoFill: 0.15,
  photoRim: 0.9,
  photoSetLight: 0.2,
  photoStudio: 0.15,
  photoAmbient: 0.4,
  photoExposure: 0,
  photoFstop: 5.6,
  photoFocus: 'face',
  photoCamera: 'threequarter',
  photoYawDeg: 16,
  photoTiltDeg: 77,
  photoFrame: 0.68,
  photoAim: 0.5,
  photoProps: 'v2',
  photoBlanket: 'auto',
  photoCrumple: 0.09,
}

/**
 * The scene `view` keys for a photo style plus hand-set knobs: nothing for an
 * unset / 'v1' style with no knobs (so the scene JSON is unchanged), else
 * `photo` and only the knobs actually given.
 */
export function heroPhotoView(photo?: HeroPhoto, knobs?: HeroPhotoKnobs): { photo?: HeroPhoto } & HeroPhotoKnobs {
  const out: { photo?: HeroPhoto } & HeroPhotoKnobs = {}
  if (photo === 'v2') out.photo = 'v2'
  if (knobs) {
    for (const [k, v] of Object.entries(knobs)) {
      if (v !== undefined && k in HERO_PHOTO_V2_DEFAULTS) (out as Record<string, unknown>)[k] = v
    }
  }
  return out
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
