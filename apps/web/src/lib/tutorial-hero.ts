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
  /**
   * Stored render strategy for the hero. When `PROCEDURAL_CARD` the helper
   * skips the attached Media row entirely — image-verification rejected the
   * stored photo and pointed the renderer at the procedural fallback, so the
   * `r2Key` on the row is stale (404s) and must not be served.
   */
  heroImageStrategy?: HeroStrategyLike | null
}

/**
 * Lightweight mirror of the Prisma `HeroStrategy` enum string union so this
 * file stays import-free of `@homemade/db` (which would force every consumer
 * through the Prisma client bundle). Keep in sync with
 * `packages/db/prisma/schema.prisma` § enum HeroStrategy.
 */
type HeroStrategyLike =
  | 'UNSET'
  | 'PROCEDURAL_CARD'
  | 'PUBLIC_DOMAIN_PLATE'
  | 'REAL_PHOTO'
  | 'AI_GENERATED'

function shouldUseProcedural(tutorial: TutorialHeroInput): boolean {
  if (tutorial.heroImageStrategy === 'PROCEDURAL_CARD') return true
  const media = tutorial.hero
  if (!media) return true
  if (!media.r2Key && !media.cloudflareId) return true
  return false
}

/**
 * Resolve the hero image source for a tutorial card or hero block. Returns
 * `{ src, srcSet, isProcedural }`.
 *
 * - If the tutorial has a Media row attached AND its `heroImageStrategy`
 *   isn't `PROCEDURAL_CARD`, build the standard responsive sources via
 *   `mediaSrcSet`.
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
  if (!shouldUseProcedural(tutorial)) {
    const real = mediaSrcSet(tutorial.hero ?? null, defaultVariant, extraVariants)
    if (real) {
      return { src: real.src, srcSet: real.srcSet, isProcedural: false }
    }
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
 * `mediaUrl` semantics — falls through to the procedural card on no-media
 * or when `heroImageStrategy === 'PROCEDURAL_CARD'`.
 */
export function tutorialHeroUrl(
  tutorial: TutorialHeroInput,
  variant: ImageVariant = 'card',
): string {
  if (shouldUseProcedural(tutorial)) {
    return proceduralCardUrl(tutorial.id)
  }
  return (
    mediaUrl(tutorial.hero ?? null, variant) ?? proceduralCardUrl(tutorial.id)
  )
}
