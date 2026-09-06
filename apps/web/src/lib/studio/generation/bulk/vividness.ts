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
 *
 * TONE-OR-COLOUR APPLIES TO THE TWO-TONE WORK ONLY (see `MIN_COLOUR_CHROMA`).
 */
export const MIN_CHROMA = 0.30

/**
 * THE CHROMA FLOOR for a colour shelf, September 2026.
 *
 * "Tone or colour, never both" is the right rule for a shelf that is two-tone by
 * design — Delft, blackwork, redwork, sage. It is the wrong rule everywhere
 * else: a piece filed under Animals or Food is sold as a COLOUR chart, and a
 * render with a tonal spine but no colour in it is not the thing the customer
 * bought. So on every other shelf the guard wants both — ink AND chroma.
 *
 * Calibrated across the 1,058 live public cross-stitch thumbnails (6 September
 * 2026 snapshot), measured with `measureVividness` above:
 *
 *   100+ colour showpieces   lowest chroma 0.188 (big-japanese-garden, 114 col)
 *                            then 0.189, 0.194, 0.197, 0.197, 0.200 …
 *   bright cute pieces       0.24 – 0.45
 *   recent gate-passed gems  black cat 0.096 / collie 0.097 / badger 0.092
 *   deliberately two-tone    husky puppy 0.018, panda 0.045, dalmatian 0.024
 *                            (all with strong ink: 0.30 – 0.56)
 *   washed-out family        seal pup 0.045, snowy owlet 0.055, baby elephant
 *                            0.059, chinchilla 0.063 (ink only 0.06 – 0.13)
 *
 * The floor sits at 0.06: three times below the least colourful showpiece, below
 * every recent gem, and above the pieces with essentially no colour at all. 39
 * live colour-shelf patterns fall under the combined rule that pass today (21 on
 * the shelves the autopilot still generates into).
 *
 * IT IS A CONSERVATIVE FIRST CUT, and the honest limit is worth writing down:
 * mean chroma does NOT separate the washed-out family from deliberate two-tone
 * work — they overlap between 0.02 and 0.11, and INK is what tells them apart
 * (0.06–0.13 versus 0.30–0.56). A floor high enough to catch the pale family
 * outright (0.10+) also fails four gems published in the last fortnight. The
 * reject samples this run now keeps (`BulkRun.rejectSamples`) are the missing
 * evidence: with real culled renders to fit against, the next calibration can
 * scale the floor with ink instead of guessing at a flat one.
 */
export const MIN_COLOUR_CHROMA = 0.06

/**
 * The shelf that is two-tone by design — the whole reason the OR rule exists.
 */
export const MONOCHROME_SHELF = 'monochrome'

/**
 * Style lanes that are two-tone by design, and so are judged on tone alone. The
 * live `STYLE` keys are all colour lanes; these are the names the monochrome
 * shelf's own work carries, kept here so re-opening that lane cannot silently
 * hand its charts a colour floor they were never meant to meet.
 */
export const TWO_TONE_STYLES: ReadonlySet<string> = new Set([
  'monochrome', 'blackwork', 'delft', 'redwork', 'whitework', 'sepia', 'sage',
])

/** What the brief was: enough of it to know which rule this render is judged by. */
export interface VividnessContext {
  /** The shelf the gem would be filed under. */
  shelf?: string | null
  /** The style lane the brief asked for. */
  style?: string | null
}

/** Is this piece judged on tone alone (two-tone by design), or on tone AND colour? */
export function isTwoTone(ctx: VividnessContext = {}): boolean {
  return ctx.shelf === MONOCHROME_SHELF || TWO_TONE_STYLES.has(ctx.style ?? '')
}

export interface VividnessVerdict {
  /** True when the render is too pale to ship — repair with more saturation. */
  tooPale: boolean
  reason: string
}

/**
 * Binary verdict.
 *
 * TWO-TONE work (the monochrome shelf, a two-tone style lane) has to fail on
 * tone AND on colour to be called pale, so four-colour blackwork charms pass
 * untouched. A COLOUR shelf has to carry both: ink for the tonal spine, chroma
 * for the colour it is sold as.
 */
export function vividnessVerdict(v: Vividness, ctx: VividnessContext = {}): VividnessVerdict {
  const measured = `ink ${v.ink.toFixed(3)}, chroma ${v.chroma.toFixed(3)}, contrast ${v.contrast.toFixed(3)}`
  if (isTwoTone(ctx)) {
    if (v.ink >= MIN_INK) return { tooPale: false, reason: `two-tone, carries on tone (${measured})` }
    if (v.chroma >= MIN_CHROMA) return { tooPale: false, reason: `two-tone, carries on colour (${measured})` }
    return {
      tooPale: true,
      reason: `washed out — ${measured}, under both floors (ink ${MIN_INK} / chroma ${MIN_CHROMA})`,
    }
  }
  if (v.ink < MIN_INK) {
    return { tooPale: true, reason: `washed out — ${measured}, no tonal spine (ink floor ${MIN_INK})` }
  }
  if (v.chroma < MIN_COLOUR_CHROMA) {
    return {
      tooPale: true,
      reason: `colourless for a colour shelf — ${measured}, under the chroma floor ${MIN_COLOUR_CHROMA}`,
    }
  }
  return { tooPale: false, reason: `carries on tone and colour (${measured})` }
}

/** Measure and judge in one call. */
export async function judgeVividness(
  png: Buffer,
  fabricHex: string = FABRIC,
  ctx: VividnessContext = {},
): Promise<VividnessVerdict & Vividness> {
  const v = await measureVividness(png, fabricHex)
  return { ...v, ...vividnessVerdict(v, ctx) }
}
