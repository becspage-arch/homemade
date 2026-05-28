import Link from 'next/link'
import { tutorialHeroSrc } from '@/lib/tutorial-hero'

interface MediaLike {
  cloudflareId?: string | null
  r2Key?: string | null
  alt?: string | null
}

interface MagazineCardTutorial {
  id: string
  slug: string
  title: string
  category: { slug: string; name: string }
  hero?: MediaLike | null
}

/**
 * Magazine Editorial Card (Pattern D). Wider than the standard discovery
 * card. Used as the lead tile in the In Season mosaic and other slots
 * that want a larger image with category + title only — no meta, no
 * excerpt, so the image dominates the card.
 */
export function MagazineCard({
  tutorial,
  kicker,
  sizes = '(min-width: 900px) 38vw, 100vw',
}: {
  tutorial: MagazineCardTutorial
  kicker?: string
  sizes?: string
}) {
  const href = `/${tutorial.category.slug}/${tutorial.slug}`
  const hero = tutorialHeroSrc(tutorial, 'card', ['public'])

  return (
    <Link href={href} className="home-magazine-card">
      <span className="home-magazine-card-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={`home-magazine-card-image${hero.isProcedural ? ' procedural' : ''}`}
          src={hero.src}
          srcSet={hero.srcSet}
          sizes={sizes}
          alt={tutorial.hero?.alt ?? ''}
          loading="lazy"
          decoding="async"
        />
      </span>
      <span className="home-magazine-card-body">
        <span className="home-magazine-card-kicker">
          {kicker ?? tutorial.category.name}
        </span>
        <span className="home-magazine-card-title">{tutorial.title}</span>
      </span>
    </Link>
  )
}
