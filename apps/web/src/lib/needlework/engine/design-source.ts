/**
 * The two input paths into the engine — both produce ONE flat-colour design
 * bitmap for the deterministic back half. This file builds the Flux PROMPTS
 * (pure, no network); the script-side caller does the actual Flux call + decode.
 *
 *  Path A — design brief: a Territory x Look x Palette brief (design-direction.ts)
 *           -> a text prompt for a flat, segmentable embroidery illustration.
 *  Path B — reference image: a photo/artwork -> an img2img instruction that
 *           flattens it to the same clean, limited-palette illustration. This is
 *           the customer "upload a photo -> your own pattern" path.
 *
 * The style suffix is the important part: we ask for FLAT colour blocks, clean
 * shapes and a plain ground. That is what segments cleanly into regions, which
 * is what makes the derived stitch pattern faithful. Photoreal or finely
 * textured input does NOT segment well — that is the honest quality gap between
 * the two paths.
 */

/** A design brief, aligned to design-direction.ts (kept loose to avoid a hard dep). */
export interface DesignBriefInput {
  /** The specific delightful concept — the hook. e.g. 'a plump robin on a sprig of holly'. */
  concept: string
  /** Look vibe text (from LOOKS), e.g. the cottagecore-botanical vibe. */
  lookVibe: string
  /** Palette colour-story hexes to steer the colours toward. */
  paletteHexes: string[]
  /** Optional palette name for the prompt. */
  paletteName?: string
  /**
   * Ground description. Defaults to a plain white background (excluded as cloth).
   * For a design that belongs on coloured cloth (e.g. a celestial piece on a
   * night sky), pass that ground here AND set EngineOptions.groundHint to match.
   */
  ground?: string
}

const FLAT_STYLE_BASE =
  'A detailed, richly coloured illustration designed for hand embroidery — ' +
  'naturalistic forms with clear, well-defined shapes and clean edges, fine ' +
  'detail and many distinct colours, gentle clean shading within each shape so a ' +
  'stitcher could blend thread shades. No heavy black outlines, no harsh gradients ' +
  'across the whole image, no photographic background. Plain white background, ' +
  'centred composition, crisp. No text, no letters, no words, no watermark, no signature.'

function styleSuffix(ground?: string): string {
  const bg = ground ? `${ground}. ` : 'plain white background. '
  return `${bg}${FLAT_STYLE_BASE}`
}

/** Path A: a flat-illustration text prompt from a design brief. */
export function briefToPrompt(brief: DesignBriefInput): string {
  const palette =
    brief.paletteHexes.length > 0
      ? `Colour palette${brief.paletteName ? ` (${brief.paletteName})` : ''}: ${brief.paletteHexes.join(', ')}. `
      : ''
  return (
    `${brief.concept}. ${brief.lookVibe} ${palette}` +
    `Designed as a single motif for hand embroidery. ${styleSuffix(brief.ground)}`
  )
}

/** Path B: an img2img instruction that flattens a reference into our style. */
export function referenceToPrompt(note: string): string {
  return (
    `${note}. Redraw as a ${FLAT_STYLE_BASE} ` +
    'Keep the recognisable subject and composition; simplify into a small number of ' +
    'flat colour shapes suitable for embroidery.'
  )
}

/**
 * Recommended img2img strength for path B: high enough to flatten the photo into
 * clean shapes, low enough to keep the subject. 0.78 posterises a photo well.
 */
export const REFERENCE_IMG2IMG_STRENGTH = 0.78
