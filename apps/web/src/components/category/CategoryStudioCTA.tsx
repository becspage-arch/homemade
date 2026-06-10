/**
 * CategoryStudioCTA  -  the wide warm-taupe card that sits directly below
 * the category hero, before any tutorial / pattern rails.
 *
 * Establishes the Studio as a destination from the category page. Without
 * it the library reads as a shop with nowhere obvious to go from a
 * pattern; with it, the user sees the Studio is the place they will
 * actually work, and the library is what they pick a starting point from.
 */

import Link from 'next/link'
import { STUDIO_CATEGORY_CONFIG, type StudioCategorySlug } from '@/lib/studio/category-config'
import './CategoryStudioCTA.css'

interface CategoryStudioCTAProps {
  category: StudioCategorySlug
  /** Optional rendered hero from an existing library pattern, used as
   *  the soft illustration on the right. Accurate by construction per
   *  the locked image policy. */
  heroImageUrl?: string | null
  heroImageAlt?: string | null
}

export function CategoryStudioCTA({
  category,
  heroImageUrl,
  heroImageAlt,
}: CategoryStudioCTAProps) {
  const config = STUDIO_CATEGORY_CONFIG[category]
  return (
    <section className="category-studio-cta" aria-label={`${config.studioName} call to action`}>
      <div className="category-studio-cta-body">
        <h2 className="category-studio-cta-title">The {config.studioName}</h2>
        <p className="category-studio-cta-text">{config.ctaBody}</p>
        <Link href={config.studioHref} className="category-studio-cta-button">
          Open the Studio
          <span className="category-studio-cta-button-arrow" aria-hidden="true">→</span>
        </Link>
      </div>
      {heroImageUrl && (
        <div className="category-studio-cta-art" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImageUrl} alt={heroImageAlt ?? ''} loading="lazy" decoding="async" />
        </div>
      )}
    </section>
  )
}
