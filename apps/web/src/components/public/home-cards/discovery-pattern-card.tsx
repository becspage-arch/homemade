import Link from 'next/link'
import { patternHeroUrl } from '@/lib/studio/pattern-hero'
import { PatternSaveHeart } from '@/components/public/pattern-save-heart'
import type { DiscoveryPatternCard as DiscoveryPattern } from '@/lib/homepage-data'

import './home-cards.css'

/**
 * A real catalogue pattern tile in the discovery wall. Reuses the
 * `.discovery-card` styling so patterns sit seamlessly among the tutorial
 * tiles (same varied masonry heights, same hover lift), but links to the
 * pattern's detail page and carries a pattern save-heart rather than the
 * tutorial one.
 */
export function DiscoveryPatternCard({
  pattern,
  saved,
}: {
  pattern: DiscoveryPattern
  saved: boolean
}) {
  const src = patternHeroUrl(
    { id: pattern.id, hero: pattern.hero, thumbnail: pattern.thumbnail },
    'card',
  )
  return (
    <div className="discovery-card">
      <Link href={pattern.detailHref} className="discovery-card-link">
        <span className="discovery-card-image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="discovery-card-image"
            src={src}
            sizes="(min-width: 1200px) 22vw, (min-width: 768px) 30vw, 45vw"
            alt={pattern.hero?.alt ?? pattern.thumbnail?.alt ?? ''}
            loading="lazy"
            decoding="async"
          />
        </span>
        <span className="discovery-card-body">
          <span className="discovery-card-overline">
            {craftLabel(pattern.craftSlug)} pattern
          </span>
          <span className="discovery-card-title">{pattern.name}</span>
        </span>
      </Link>
      <PatternSaveHeart patternId={pattern.id} initialSaved={saved} />
    </div>
  )
}

/** Slug → display label for the card overline. */
function craftLabel(slug: string): string {
  switch (slug) {
    case 'cross-stitch':
      return 'Cross-stitch'
    case 'needlework':
      return 'Needlework'
    case 'knitting':
      return 'Knitting'
    case 'crochet':
      return 'Crochet'
    default:
      return slug.charAt(0).toUpperCase() + slug.slice(1)
  }
}
