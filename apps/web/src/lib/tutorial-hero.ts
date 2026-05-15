import 'server-only'
import { mediaSrcSet, mediaUrl, type ImageVariant } from './media'
import { proceduralCardUrl } from './procedural-card'

interface MediaLike {
  r2Key?: string | null
  cloudflareId?: string | null
}

interface TutorialHeroInput {
  id: string
  hero?: MediaLike | null
}

/**
 * Resolve the hero image source for a tutorial card or hero block. Returns
 * `{ src, srcSet, isProcedural }`.
 *
 * - If the tutorial has a Media row attached, build the standard responsive
 *   sources via `mediaSrcSet`.
 * - Otherwise, fall back to the procedural-card route. The procedural URL is
 *   the same across variants because the SVG scales — Cloudflare's image
 *   transformations won't rewrite SVGs, but the browser scales them cleanly.
 *
 * `isProcedural` lets callers decide whether to apply the saturated
 * photography filter (`filter: saturate(0.88)`) or leave the procedural card
 * alone.
 */
export function tutorialHeroSrc(
  tutorial: TutorialHeroInput,
  defaultVariant: ImageVariant,
  extraVariants: ImageVariant[] = [],
): { src: string; srcSet?: string; isProcedural: boolean } {
  const media = tutorial.hero ?? null
  const real = mediaSrcSet(media, defaultVariant, extraVariants)
  if (real) {
    return { src: real.src, srcSet: real.srcSet, isProcedural: false }
  }
  // Single fallback URL — Cloudflare CDN caches it. Browsers downscale the
  // SVG cleanly so a srcSet isn't needed for procedural variants.
  return {
    src: proceduralCardUrl(tutorial.id),
    isProcedural: true,
  }
}

/**
 * Plain string variant for call sites that only need a single URL (admin
 * preview thumbnails, generated metadata images, OG cards). Mirrors
 * `mediaUrl` semantics — falls through to the procedural card on no-media.
 */
export function tutorialHeroUrl(
  tutorial: TutorialHeroInput,
  variant: ImageVariant = 'card',
): string {
  return (
    mediaUrl(tutorial.hero ?? null, variant) ?? proceduralCardUrl(tutorial.id)
  )
}
