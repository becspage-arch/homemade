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
  excerpt: string | null
  difficulty: string
  totalMinutes?: number | null
  timeMinutes?: number | null
  category: { slug: string; name: string }
  hero?: MediaLike | null
}

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

function formatMinutes(min: number | null | undefined): string | null {
  if (!min || min <= 0) return null
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

/**
 * Magazine Editorial Card (Pattern D). Wider than the standard discovery
 * card. Used as the lead tile in the In Season mosaic and other slots
 * that deserve a dek (italic Fraunces excerpt) alongside the title.
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
  const time = formatMinutes(tutorial.totalMinutes ?? tutorial.timeMinutes ?? null)
  const difficulty = DIFFICULTY_LABEL[tutorial.difficulty] ?? null

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
        {tutorial.excerpt && (
          <span className="home-magazine-card-excerpt">{tutorial.excerpt}</span>
        )}
        {(time || difficulty) && (
          <span className="home-magazine-card-meta">
            {time && <span>{time}</span>}
            {time && difficulty && <span aria-hidden="true">·</span>}
            {difficulty && <span>{difficulty}</span>}
          </span>
        )}
      </span>
    </Link>
  )
}
