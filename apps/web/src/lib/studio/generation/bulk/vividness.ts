/**
 * VIVIDNESS — the deterministic pale-render guard that runs BEFORE the vision gate.
 *
 * The vision gate is a model looking at a picture, and models are forgiving about
 * exactly the fault this catalogue keeps shipping: a washed-out piece, pale
 * pastel on near-white aida, that reads as "soft and pretty" on a screen and as
 * nothing at all in floss. The September 2026 proof batch published a cupcake
 * that was cream on cream; the old catalogue is full of the same thing.
 *
 * So the pale check is arithmetic, not judgement. It measures the finished render
 * and returns a number, which means it is repeatable, testable against the real
 * catalogue, and impossible to sweet-talk.
 *
 * BINARY, like every other automated control here: a render below the floor is a
 * 'repair' with `more-saturation`, and the gate is never called for it — no point
 * asking an expensive judge about a piece we already know is too pale.
 *
 * Pure: a PNG Buffer in, numbers out. No `server-only`, no Prisma.
 */

import sharp from 'sharp'
import { FABRIC } from './cross-stitch-style'

/** What one render measures. */
export interface Vividness {
  /**
   * INK — the fraction of stitched pixels that sit at least `INK_DELTA` in
   * luminance away from the fabric, 0..1. "How much of this design is actually
   * dark against the cloth."
   *
   * This is the measurement that does the work. Mean contrast does not separate
   * the failure from the shelf (a Delft hare averages 0.193, a washed-out lamb
   * 0.170 — no usable margin), because a mean dilutes a few strong outlines
   * across a lot of pale filler. Counting how much of the piece is genuinely
   * dark separates them by an order of magnitude instead.
   */
  ink: number
  /**
   * Mean chroma of the stitched pixels, 0..1 — `max(r,g,b) - min(r,g,b)`, i.e.
   * colourfulness in absolute terms rather than relative to lightness, so a
   * pale pastel does not score as "fully saturated" the way HSL would have it.
   */
  chroma: number
  /** Mean absolute luminance difference from the fabric, 0..1. Reported for
   *  diagnostics; the verdict rests on `ink`. */
  contrast: number
  /** Fraction of the render that is stitched rather than bare fabric, 0..1. */
  stitchedFraction: number
}

/** A stitched pixel this far from the fabric in luminance counts as "ink". */
export const INK_DELTA = 0.35

/** Analysis resolution — small is plenty for means, and fast. */
const SAMPLE = 96

/** A pixel this close to the fabric colour is bare cloth, not stitching. */
const FABRIC_EPSILON = 18

function rgbOf(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

/** Rec. 709 relative luminance, 0..255. */
function luma(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Measure one finished render. Bare fabric is excluded from both means, so a
 * design with lots of negative space is judged on its design, not on how much
 * cloth surrounds it.
 */
export async function measureVividness(png: Buffer, fabricHex: string = FABRIC): Promise<Vividness> {
  const raw = await sharp(png)
    .flatten({ background: fabricHex })
    .resize(SAMPLE, SAMPLE, { fit: 'fill', kernel: 'lanczos3' })
    .removeAlpha()
    .raw()
    .toBuffer()

  const [fr, fg, fb] = rgbOf(fabricHex)
  const fabricLuma = luma(fr, fg, fb)

  let stitched = 0
  let inked = 0
  let chromaSum = 0
  let contrastSum = 0
  for (let i = 0; i < raw.length; i += 3) {
    const r = raw[i]!
    const g = raw[i + 1]!
    const b = raw[i + 2]!
    // Bare cloth: close to the fabric colour on every channel.
    if (Math.abs(r - fr) <= FABRIC_EPSILON && Math.abs(g - fg) <= FABRIC_EPSILON && Math.abs(b - fb) <= FABRIC_EPSILON) {
      continue
    }
    stitched++
    const contrast = Math.abs(luma(r, g, b) - fabricLuma) / 255
    if (contrast >= INK_DELTA) inked++
    chromaSum += (Math.max(r, g, b) - Math.min(r, g, b)) / 255
    contrastSum += contrast
  }

  const total = raw.length / 3
  if (stitched === 0) return { ink: 0, chroma: 0, contrast: 0, stitchedFraction: 0 }
  return {
    ink: inked / stitched,
    chroma: chromaSum / stitched,
    contrast: contrastSum / stitched,
    stitchedFraction: stitched / total,
  }
}

/**
 * CALIBRATION — measured across all 1,153 September 2026 catalogue thumbnails
 * plus the five gems of the first server proof batch.
 *
 * TONE OR COLOUR, never both required. Those are the two independent ways a
 * cross-stitch design can carry, and demanding both would kill the monochrome
 * shelf outright — Delft and blackwork are two-tone by design and have almost no
 * chroma at all.
 *
 * The measured reference set (ink / mean chroma):
 *
 *   MUST FAIL   proof-batch cupcake, cream on cream     0.013 / 0.194
 *               cute-lamb-meadow, pale pastel           0.032 / 0.256
 *   MUST PASS   proof cottage, 9 colours, a gem         0.145 / 0.202
 *               delft-hare, 12 colours two-tone         0.174 / 0.104
 *               blackwork-snowflake, 4 colours          0.263 / 0.061
 *               big-coral-reef, 120 colours             0.554 / 0.338
 *               proof haunted house, 87 colours, Pro    0.623 / 0.363
 *
 * Ink separates the two groups by more than 4x with nothing in between, so the
 * floor sits in that gap. Note the chroma column: the cupcake is MORE colourful
 * than the Delft hare and the two-colour blackwork, which is exactly why a
 * chroma test alone cannot find it — a washed-out piece can be full of pale
 * colour. Tone is what it lacks.
 *
 * Two of the pale examples the brief named — apf-sage-rabbit (0.395 ink) and
 * vintage-foxglove (0.223) — measure as perfectly solid and are NOT caught. They
 * are muted, not washed out: sage-rabbit is a low-chroma monochrome piece
 * structurally identical to Delft, and failing it would mean failing the shelf.
 */

/** Below this fraction of genuinely dark stitches, a render has no tonal spine. */
export const MIN_INK = 0.06
/**
 * ...unless it is genuinely saturated. A high-chroma piece that is deliberately
 * light still reads in floss, so colour rescues it. Set well above every washed-
 * out reference (the worst is 0.256) so it can never rescue a pale wash.
 */
export const MIN_CHROMA = 0.30

export interface VividnessVerdict {
  /** True when the render is too pale to ship — repair with more saturation. */
  tooPale: boolean
  reason: string
}

/**
 * Binary verdict. Deliberately generous: a render has to fail on tone AND on
 * colour to be called pale, so the whole complexity range — four-colour
 * blackwork charms through 120-colour showpieces — passes untouched.
 */
export function vividnessVerdict(v: Vividness): VividnessVerdict {
  const measured = `ink ${v.ink.toFixed(3)}, chroma ${v.chroma.toFixed(3)}, contrast ${v.contrast.toFixed(3)}`
  if (v.ink >= MIN_INK) return { tooPale: false, reason: `carries on tone (${measured})` }
  if (v.chroma >= MIN_CHROMA) return { tooPale: false, reason: `carries on colour (${measured})` }
  return {
    tooPale: true,
    reason: `washed out — ${measured}, under both floors (ink ${MIN_INK} / chroma ${MIN_CHROMA})`,
  }
}

/** Measure and judge in one call. */
export async function judgeVividness(png: Buffer, fabricHex: string = FABRIC): Promise<VividnessVerdict & Vividness> {
  const v = await measureVividness(png, fabricHex)
  return { ...v, ...vividnessVerdict(v) }
}
