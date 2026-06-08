import Link from 'next/link'
import { tutorialHeroSrc } from '@/lib/tutorial-hero'
import type { ReaderStateMap } from '@/lib/user-state'
import { readerStateFor } from '@/lib/user-state'
import { HomeCard } from '../home-card'

interface MediaLike {
  cloudflareId?: string | null
  r2Key?: string | null
  alt?: string | null
}

interface FeatureTutorial {
  id: string
  slug: string
  title: string
  excerpt: string | null
  difficulty: string
  totalMinutes?: number | null
  timeMinutes?: number | null
  dietaryFlags?: string[] | null
  category: { slug: string; name: string }
  hero?: MediaLike | null
}

interface EditorialMagazineBlockProps {
  /** Section heading, voice-tuned per archetype ("Tonight", "Designer of the week"). */
  heading: string
  subheading?: string | null
  /** The lead feature card, rendered large. */
  feature: FeatureTutorial
  /** 2 to 3 supporting cards alongside. */
  supporting: FeatureTutorial[]
  readerState: ReaderStateMap
}

/**
 * Magazine-style editorial feature: one large hero card + 2 to 3 supporting
 * cards. Used by Recipe and Pattern archetypes for the "Tonight" or
 * "Designer of the week" lead-in zone.
 */
export function EditorialMagazineBlock({
  heading,
  subheading,
  feature,
  supporting,
  readerState,
}: EditorialMagazineBlockProps) {
  const featureHero = tutorialHeroSrc(feature, 'hero', ['public'])
  const featureHref = `/${feature.category.slug}/${feature.slug}`

  return (
    <section className="magazine-block">
      <header className="magazine-block-header">
        <h2 className="magazine-block-heading">{heading}</h2>
        {subheading && <p className="magazine-block-subheading">{subheading}</p>}
      </header>
      <div className="magazine-block-layout">
        <Link href={featureHref} className="magazine-block-feature">
          <span className="magazine-block-feature-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featureHero.src}
              srcSet={featureHero.srcSet}
              sizes="(min-width: 1100px) 60vw, 100vw"
              alt={feature.hero?.alt ?? ''}
              loading="eager"
              decoding="async"
              className={featureHero.isProcedural ? 'procedural' : undefined}
            />
          </span>
          <span className="magazine-block-feature-body">
            <span className="magazine-block-feature-category">
              {feature.category.name}
            </span>
            <span className="magazine-block-feature-title">{feature.title}</span>
            {feature.excerpt && (
              <span className="magazine-block-feature-excerpt">{feature.excerpt}</span>
            )}
          </span>
        </Link>
        <ul className="magazine-block-supporting">
          {supporting.slice(0, 3).map((t) => (
            <li key={t.id}>
              <HomeCard
                tutorial={t}
                state={readerStateFor(readerState, t.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
