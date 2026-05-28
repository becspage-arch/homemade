import Link from 'next/link'
import { tutorialHeroSrc } from '@/lib/tutorial-hero'

import './home-cards.css'

interface MediaLike {
  cloudflareId?: string | null
  r2Key?: string | null
  alt?: string | null
}

interface ScheduledActionCardProps {
  href: string
  /** "Day 4 · Sourdough loaf" overline. */
  overline: string
  /** "Shape and proof" — the step title. */
  title: string
  /** One short line summarising the step body. Clamped to 1 line. */
  body: string
  ctaLabel?: string
  tutorial: {
    id: string
    title?: string
    hero?: MediaLike | null
  }
}

/**
 * Scheduled action card (Pattern E, Substack horizontal). Small hero
 * thumb on the right, overline + title + body + CTA on the left. Used
 * by the "Today's scheduled project actions" rail so each row reads
 * like an inbox of next steps rather than a wall of text.
 */
export function ScheduledActionCard({
  href,
  overline,
  title,
  body,
  ctaLabel = 'Open the project →',
  tutorial,
}: ScheduledActionCardProps) {
  const hero = tutorialHeroSrc(tutorial, 'card', ['public'])
  return (
    <article className="home-scheduled-card">
      <Link href={href} className="home-scheduled-card-link">
        <span className="home-scheduled-card-body">
          <span className="home-scheduled-overline">{overline}</span>
          <span className="home-scheduled-title">{title}</span>
          <span className="home-scheduled-body">{body}</span>
          <span className="home-scheduled-cta">{ctaLabel}</span>
        </span>
        <span className="home-scheduled-thumb" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero.src}
            srcSet={hero.srcSet}
            sizes="88px"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </span>
      </Link>
    </article>
  )
}
