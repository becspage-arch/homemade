/**
 * pattern-engine — the single server-side boundary for "make a cross-stitch
 * pattern from a source". It is the ONE place the generate-image → convert
 * path lives, shared by every caller so it is built once, never forked:
 *
 *   - Photo → pattern   (customer uploads a photo)      → `imageToPattern`
 *   - Idea → pattern    (customer describes an idea)    → `generatePatternImage` then `imageToPattern`
 *   - Bulk / admin      (the catalogue routine, later)  → the same two calls
 *
 * The convert half delegates to `photoToPatternData` — the rigorous converter
 * (sharp downscale + image-q palette + nearest-floss reduction + confetti
 * minimise) that the bulk catalogue routine already uses, so a customer's own
 * pattern is the same quality as a published one. The generate half wraps the
 * server Flux calls in `generation/sources`.
 *
 * IMPORTANT — this is NOT the bulk cull gate. The ruthless keep-or-kill vision
 * gate is a catalogue concept and never runs here: a customer's own request is
 * accepted, not judged. The only floor is structural — a real image came back
 * and it converted to a valid floss chart.
 *
 * Server-only (sharp + fetch to fal). Never import into client code.
 */

import 'server-only'
import sharp from 'sharp'
import { computePatternMetrics, type PatternData } from '@homemade/db'
import { fluxIllustration, fluxIllustrationPro } from './sources'
import {
  photoToPatternData,
  type PhotoToPatternSettings,
} from '@/lib/studio/photo-to-pattern'

export interface GeneratedPatternImage {
  /** The generated illustration, normalised to PNG bytes. */
  buffer: Buffer
  /** The same image as a `data:` URL, ready to hand to the client for the
   *  approve / regenerate step (the customer's acceptance gate). */
  dataUrl: string
  /** Provenance credit (Homemade-original, AI-assisted). */
  credit: string
}

export interface GeneratePatternImageOptions {
  /**
   * Use the Flux 1.1 Pro showpiece engine instead of the fast schnell path.
   * Pro carries far more genuinely-distinct tonal gradation, which the
   * converter resolves into a denser, richer chart — worth it for a large,
   * detailed piece. Defaults to false (schnell: fast, clean, flat — the same
   * path the bulk routine uses).
   */
  detailed?: boolean
  /** Square is the right default for a single motif; the converter re-frames
   *  to the requested chart dimensions. */
  imageSize?: 'square_hd' | 'portrait_4_3' | 'landscape_4_3'
  /** Pixel size for the Pro tier (it takes width/height, not a size name).
   *  Defaults to 1024². */
  proSize?: { width: number; height: number }
  /** Whether the Pro tier appends its dense showpiece style ('showpiece', the
   *  default) or leaves the caller's prompt exactly as written ('as-written' —
   *  the bulk pro-all mode, where each size lane brings its own style). */
  proStyle?: 'showpiece' | 'as-written'
}

/**
 * Generate an original illustration from a customer's text brief. Returns the
 * image for the customer to approve or regenerate — it does NOT convert yet.
 * Throws on a blank / failed generation so the caller can surface a clean
 * "couldn't generate, try again" rather than persist nothing.
 */
export async function generatePatternImage(
  brief: string,
  opts: GeneratePatternImageOptions = {},
): Promise<GeneratedPatternImage> {
  const subject = brief.trim()
  if (!subject) throw new Error('generatePatternImage: empty brief')

  const src = opts.detailed
    ? await fluxIllustrationPro(subject, {
        width: opts.proSize?.width ?? 1024,
        height: opts.proSize?.height ?? 1024,
        ...(opts.proStyle ? { style: opts.proStyle } : {}),
      })
    : await fluxIllustration(subject, { imageSize: opts.imageSize ?? 'square_hd' })

  // Normalise to PNG so the preview data URL and the re-posted convert bytes
  // are one predictable format regardless of what fal handed back.
  const png = await sharp(src.buffer).png().toBuffer()
  return {
    buffer: png,
    dataUrl: `data:image/png;base64,${png.toString('base64')}`,
    credit: src.credit,
  }
}

export interface ImageToPatternResult {
  data: PatternData
  metrics: ReturnType<typeof computePatternMetrics>
  /** Downscaled RGBA the caller may cache for slider re-runs (see the
   *  photo-to-chart LRU). */
  rgba: Buffer
}

/**
 * Convert source image bytes into a validated floss chart — the rigorous
 * converter every catalogue pattern is built with. `cachedRgba` lets a caller
 * (the photo-to-chart slider) skip the sharp downscale when only the colour
 * count / confetti pass changed.
 */
export async function imageToPattern(
  imageBytes: Buffer,
  settings: PhotoToPatternSettings,
  cachedRgba?: Buffer | null,
): Promise<ImageToPatternResult> {
  const { data, rgba } = await photoToPatternData(imageBytes, settings, cachedRgba)
  return { data, metrics: computePatternMetrics(data), rgba }
}
