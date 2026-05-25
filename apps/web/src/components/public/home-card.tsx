import Link from 'next/link'
import { tutorialHeroSrc } from '@/lib/tutorial-hero'
import type { ReaderTutorialState } from '@/lib/user-state'

interface MediaLike {
  cloudflareId?: string | null
  r2Key?: string | null
  alt?: string | null
}

const DIETARY_BADGES: Record<string, { glyph: string; label: string }> = {
  vegan: { glyph: 'V', label: 'Vegan' },
  vegetarian: { glyph: 'Vg', label: 'Vegetarian' },
  glutenFree: { glyph: 'GF', label: 'Gluten-free' },
  dairyFree: { glyph: 'DF', label: 'Dairy-free' },
  nutFree: { glyph: 'NF', label: 'Nut-free' },
  pescatarian: { glyph: 'P', label: 'Pescatarian' },
  halal: { glyph: 'H', label: 'Halal' },
  kosher: { glyph: 'K', label: 'Kosher' },
}

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

interface HomeCardTutorial {
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

export interface HomeCardProps {
  tutorial: HomeCardTutorial
  state?: ReaderTutorialState
  /** Optional overline shown above the title — eg "In season". */
  overline?: string | null
  /** Compact / hero variant. Defaults to "card". */
  size?: 'card' | 'wide'
}

function formatMinutes(min: number | null | undefined): string | null {
  if (!min || min <= 0) return null
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

export function HomeCard({ tutorial, state, overline, size = 'card' }: HomeCardProps) {
  const href = `/${tutorial.category.slug}/${tutorial.slug}`
  const hero = tutorialHeroSrc(tutorial, 'card', ['public'])
  const time = formatMinutes(tutorial.totalMinutes ?? tutorial.timeMinutes ?? null)
  const difficulty = DIFFICULTY_LABEL[tutorial.difficulty] ?? null
  const dietary = (tutorial.dietaryFlags ?? [])
    .filter((flag) => DIETARY_BADGES[flag])
    .slice(0, 3)

  return (
    <Link href={href} className={`home-card home-card-${size}`}>
      <span className="home-card-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={`home-card-image${hero.isProcedural ? ' procedural' : ''}`}
          src={hero.src}
          srcSet={hero.srcSet}
          sizes={
            size === 'wide'
              ? '(min-width: 900px) 60vw, 100vw'
              : '(min-width: 900px) 28vw, (min-width: 600px) 44vw, 80vw'
          }
          alt={tutorial.hero?.alt ?? ''}
          loading="lazy"
          decoding="async"
        />
        {state?.bookmarked && (
          <span className="home-card-saved" aria-label="Saved" title="Saved">
            <BookmarkGlyph />
          </span>
        )}
        {state?.projectStatus === 'IN_PROGRESS' &&
          typeof state.projectProgressPercent === 'number' && (
            <span
              className="home-card-progress"
              aria-label={`${state.projectProgressPercent}% complete`}
            >
              <span
                className="home-card-progress-fill"
                style={{
                  width: `${Math.max(0, Math.min(100, state.projectProgressPercent))}%`,
                }}
              />
            </span>
          )}
        {dietary.length > 0 && (
          <span className="home-card-dietary" aria-hidden="false">
            {dietary.map((flag) => (
              <span
                key={flag}
                className="home-card-dietary-badge"
                title={DIETARY_BADGES[flag]!.label}
                aria-label={DIETARY_BADGES[flag]!.label}
              >
                {DIETARY_BADGES[flag]!.glyph}
              </span>
            ))}
          </span>
        )}
      </span>
      <span className="home-card-body">
        {overline && <span className="home-card-overline">{overline}</span>}
        <span className="home-card-category">{tutorial.category.name}</span>
        <span className="home-card-title">{tutorial.title}</span>
        {tutorial.excerpt && size === 'wide' && (
          <span className="home-card-excerpt">{tutorial.excerpt}</span>
        )}
        {(time || difficulty) && (
          <span className="home-card-meta">
            {time && <span>{time}</span>}
            {time && difficulty && <span aria-hidden="true">·</span>}
            {difficulty && <span>{difficulty}</span>}
          </span>
        )}
      </span>
    </Link>
  )
}

function BookmarkGlyph() {
  return (
    <svg viewBox="0 0 16 20" width="14" height="18" aria-hidden="true">
      <path
        d="M2 1.5h12v17l-6-4-6 4z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
