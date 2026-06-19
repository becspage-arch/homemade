import Link from 'next/link'
import { tutorialHeroSrc } from '@/lib/tutorial-hero'
import { SaveHeart } from './save-heart'

import './home-cards.css'

interface MediaLike {
  cloudflareId?: string | null
  r2Key?: string | null
  alt?: string | null
}

export interface DiscoveryCardTutorial {
  id: string
  slug: string
  title: string
  category: { slug: string; name: string }
  hero?: MediaLike | null
}

interface DiscoveryCardProps {
  tutorial: DiscoveryCardTutorial
  /** Whether the signed-in reader has this on their Make it list. */
  saved: boolean
  sizes?: string
}

/**
 * A single tile in the discovery wall. Image-led, minimal caption, with a
 * save-on-hover heart overlaid top-right. The heart is a sibling of the link
 * (not nested) so the markup stays valid and the save gesture doesn't trigger
 * navigation.
 */
export function DiscoveryCard({
  tutorial,
  saved,
  sizes = '(min-width: 1200px) 22vw, (min-width: 768px) 30vw, 45vw',
}: DiscoveryCardProps) {
  const href = `/${tutorial.category.slug}/${tutorial.slug}`
  const hero = tutorialHeroSrc(tutorial, 'card', ['public'])

  return (
    <div className="discovery-card">
      <Link href={href} className="discovery-card-link">
        <span className="discovery-card-image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`discovery-card-image${hero.isProcedural ? ' procedural' : ''}`}
            src={hero.src}
            srcSet={hero.srcSet}
            sizes={sizes}
            alt={tutorial.hero?.alt ?? ''}
            loading="lazy"
            decoding="async"
          />
        </span>
        <span className="discovery-card-body">
          <span className="discovery-card-overline">{tutorial.category.name}</span>
          <span className="discovery-card-title">{tutorial.title}</span>
        </span>
      </Link>
      <SaveHeart tutorialId={tutorial.id} initialSaved={saved} />
    </div>
  )
}
