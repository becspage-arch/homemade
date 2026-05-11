import Link from 'next/link'

import './tutorial-card.css'

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
}

const SEASON_LABEL: Record<string, string> = {
  SPRING: 'spring',
  SUMMER: 'summer',
  AUTUMN: 'autumn',
  WINTER: 'winter',
  YEAR_ROUND: 'year-round',
}

export interface TutorialCardProps {
  href: string
  title: string
  excerpt: string | null
  heroUrl: string | null
  difficulty: string
  season: string | null
  categoryName?: string | null
}

export function TutorialCard({
  href,
  title,
  excerpt,
  heroUrl,
  difficulty,
  season,
  categoryName,
}: TutorialCardProps) {
  return (
    <Link href={href} className="tutorial-card">
      {heroUrl ? (
        <span
          className="tutorial-card-image"
          role="img"
          aria-label=""
          style={{ backgroundImage: `url(${heroUrl})` }}
        />
      ) : (
        <span className="tutorial-card-image placeholder" aria-hidden="true">
          h
        </span>
      )}
      <span className="tutorial-card-body">
        {categoryName && (
          <span className="tutorial-card-eyebrow">{categoryName}</span>
        )}
        <span className="tutorial-card-title">{title}</span>
        {excerpt && <span className="tutorial-card-excerpt">{excerpt}</span>}
        <span className="tutorial-card-meta">
          <span>{DIFFICULTY_LABEL[difficulty] ?? difficulty.toLowerCase()}</span>
          {season && <span>{SEASON_LABEL[season] ?? season.toLowerCase()}</span>}
        </span>
      </span>
    </Link>
  )
}
