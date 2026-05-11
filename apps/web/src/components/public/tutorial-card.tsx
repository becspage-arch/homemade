import Link from 'next/link'
import type { ReaderTutorialState } from '@/lib/user-state'

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
  /** Reader state from the signed-in user, when available. */
  state?: ReaderTutorialState
  /** Optional byline — "By {name}" or "By Homemade". */
  byline?: string | null
}

export function TutorialCard({
  href,
  title,
  excerpt,
  heroUrl,
  difficulty,
  season,
  categoryName,
  state,
  byline,
}: TutorialCardProps) {
  const inProgress =
    state?.projectStatus === 'IN_PROGRESS' &&
    typeof state.projectProgressPercent === 'number'

  return (
    <Link href={href} className="tutorial-card">
      <span className="tutorial-card-image-wrap">
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
        {state?.bookmarked && (
          <span
            className="tutorial-card-saved"
            aria-label="Saved"
            title="Saved"
          >
            <BookmarkGlyph filled />
          </span>
        )}
      </span>
      <span className="tutorial-card-body">
        {categoryName && (
          <span className="tutorial-card-eyebrow">{categoryName}</span>
        )}
        <span className="tutorial-card-title">{title}</span>
        {byline && <span className="tutorial-card-byline">{byline}</span>}
        {excerpt && <span className="tutorial-card-excerpt">{excerpt}</span>}
        <span className="tutorial-card-meta">
          <span>{DIFFICULTY_LABEL[difficulty] ?? difficulty.toLowerCase()}</span>
          {season && <span>{SEASON_LABEL[season] ?? season.toLowerCase()}</span>}
        </span>
        {inProgress && (
          <span className="tutorial-card-progress">
            {state!.projectProgressPercent}% in progress
          </span>
        )}
      </span>
    </Link>
  )
}

function BookmarkGlyph({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 16 20"
      width="14"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2 1.5h12v17l-6-4-6 4z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
