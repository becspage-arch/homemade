import Link from 'next/link'
import type { ReaderTutorialState } from '@/lib/user-state'

import './tutorial-card.css'

// Card hero size grid: ~360px (mobile 1-col) up to ~400px (3-col desktop).
// Cover 1x + 2x DPR cleanly with card + public variants.
const CARD_SIZES = '(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw'

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
  /** Optional srcSet covering Retina + larger viewports. Pair with `heroUrl`. */
  heroSrcSet?: string | null
  /** Optional alt text for the hero image. Falls back to '' (decorative). */
  heroAlt?: string | null
  difficulty: string
  season: string | null
  categoryName?: string | null
  /** Reader state from the signed-in user, when available. */
  state?: ReaderTutorialState
  /** Optional byline — "By {name}" or "By Homemade". */
  byline?: string | null
  /** Pottery equipment-barrier flag. Set true on tutorials that need a kiln. */
  requiresKiln?: boolean
  /** Pottery equipment-barrier flag. Set true on tutorials that need a wheel. */
  requiresWheel?: boolean
}

export function TutorialCard({
  href,
  title,
  excerpt,
  heroUrl,
  heroSrcSet,
  heroAlt,
  difficulty,
  season,
  categoryName,
  state,
  byline,
  requiresKiln,
  requiresWheel,
}: TutorialCardProps) {
  const inProgress =
    state?.projectStatus === 'IN_PROGRESS' &&
    typeof state.projectProgressPercent === 'number'

  const showEquipmentBadge = Boolean(requiresKiln || requiresWheel)

  return (
    <Link href={href} className="tutorial-card">
      <span className="tutorial-card-image-wrap">
        {heroUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="tutorial-card-image"
            src={heroUrl}
            srcSet={heroSrcSet ?? undefined}
            sizes={CARD_SIZES}
            alt={heroAlt ?? ''}
            loading="lazy"
            decoding="async"
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
        {showEquipmentBadge && (
          <span className="tutorial-card-equipment-badge">
            {requiresKiln && requiresWheel
              ? 'Kiln + wheel'
              : requiresKiln
                ? 'Requires a kiln'
                : 'Requires a wheel'}
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
