import Link from 'next/link'
import type { ReactNode } from 'react'

import './tutorial-page.css'

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

const SEASON_LABEL: Record<string, string> = {
  SPRING: 'Spring',
  SUMMER: 'Summer',
  AUTUMN: 'Autumn',
  WINTER: 'Winter',
  YEAR_ROUND: 'Year-round',
}

const SOURCE_LABEL: Record<string, string> = {
  TESTED: 'Tested in the Homemade kitchen, garden, or studio.',
  CLASSIC:
    'A classic technique with long precedent, cross-referenced across established sources.',
  SYNTHESISED:
    'Synthesised from public-domain and extension-service sources by the Homemade editorial team.',
  PUBLIC_DOMAIN: 'From the public domain.',
  CREATOR: 'Contributed by an external creator.',
}

export interface TutorialChromeProps {
  title: string
  subtitle: string | null
  excerpt: string | null
  category: { slug: string; name: string } | null
  subCategoryName: string | null
  difficulty: string
  timeMinutes: number | null
  season: string | null
  heroUrl: string | null
  heroAlt: string | null
  publishedAt: Date | null
  readingTime: string | null
  sourceType: string
  sourceNotes: string | null
  /** The rendered tutorial body. */
  body: ReactNode
  /**
   * Whether breadcrumb links should function. The admin preview passes false
   * so a half-typed category slug doesn't navigate away.
   */
  linkBreadcrumb?: boolean
  /**
   * Optional row of actions (bookmark / start-making etc.) rendered between
   * the info bar and the body. Public route fills this in for signed-in
   * readers; admin preview leaves it empty.
   */
  actionsSlot?: ReactNode
  /** Optional left rail (sticky TOC). When passed, body becomes 3-column. */
  leftRail?: ReactNode
  /** Optional right rail (project companion). When passed, body becomes 3-column. */
  rightRail?: ReactNode
  /** Optional footer rendered after the sources aside. */
  footerSlot?: ReactNode
}

/**
 * Shared "tutorial as a reader sees it" presentation component. Used by:
 *   - the public route `(public)/[categorySlug]/[tutorialSlug]`
 *   - the admin Preview toggle, where it reads in-progress form values
 *
 * Pure presentation — the caller passes already-rendered body content and
 * resolved values (e.g. the Cloudflare hero URL).
 */
export function TutorialChrome(props: TutorialChromeProps) {
  const {
    title,
    subtitle,
    excerpt,
    category,
    subCategoryName,
    difficulty,
    timeMinutes,
    season,
    heroUrl,
    heroAlt,
    publishedAt,
    readingTime,
    sourceType,
    sourceNotes,
    body,
    linkBreadcrumb = true,
    actionsSlot,
    leftRail,
    rightRail,
    footerSlot,
  } = props
  const hasRails = Boolean(leftRail || rightRail)

  return (
    <article className="tutorial-page">
      <div className="tutorial-page-hero">
        {category && (
          <nav aria-label="Breadcrumb" className="tutorial-breadcrumb">
            {linkBreadcrumb ? (
              <Link href={`/${category.slug}`}>{category.name}</Link>
            ) : (
              <span>{category.name}</span>
            )}
            {subCategoryName && (
              <>
                <span aria-hidden="true">/</span>
                <span>{subCategoryName}</span>
              </>
            )}
          </nav>
        )}

        <div className="tutorial-hero-grid">
          <div className="tutorial-hero-text">
            <h1 className="tutorial-title">{title || 'Untitled tutorial'}</h1>
            {subtitle ? (
              <p className="tutorial-standfirst">{subtitle}</p>
            ) : excerpt ? (
              <p className="tutorial-standfirst">{excerpt}</p>
            ) : null}
          </div>

          {heroUrl ? (
            <div
              className="tutorial-hero-image"
              role="img"
              aria-label={heroAlt ?? title}
              style={{ backgroundImage: `url(${heroUrl})` }}
            />
          ) : (
            <div className="tutorial-hero-image placeholder" aria-hidden="true">
              h
            </div>
          )}
        </div>

        <dl className="tutorial-info-bar">
          <div>
            <dt>Difficulty</dt>
            <dd>{DIFFICULTY_LABEL[difficulty] ?? difficulty.toLowerCase()}</dd>
          </div>
          {timeMinutes !== null && (
            <div>
              <dt>Time</dt>
              <dd>{formatTime(timeMinutes)}</dd>
            </div>
          )}
          {season && (
            <div>
              <dt>Season</dt>
              <dd>{SEASON_LABEL[season] ?? season}</dd>
            </div>
          )}
          {readingTime && (
            <div>
              <dt>Reading time</dt>
              <dd>{readingTime}</dd>
            </div>
          )}
          {publishedAt && (
            <div>
              <dt>Published</dt>
              <dd>
                <time dateTime={publishedAt.toISOString()}>
                  {publishedAt.toLocaleDateString('en-GB', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {actionsSlot && (
        <div className="tutorial-actions-bar">{actionsSlot}</div>
      )}

      {hasRails ? (
        <div className="tutorial-page-rails">
          <div className="tutorial-page-rail-left">{leftRail}</div>
          <div className="tutorial-page-body tutorial-page-body-railed">
            {body}

            <aside className="tutorial-sources">
              <span className="tutorial-sources-label">
                {sourceType === 'TESTED'
                  ? 'A note from Homemade'
                  : 'Sources and provenance'}
              </span>
              <p className="tutorial-sources-text">
                {SOURCE_LABEL[sourceType] ?? ''}
              </p>
              {sourceNotes && (
                <p className="tutorial-sources-notes">{sourceNotes}</p>
              )}
            </aside>
            {footerSlot}
          </div>
          <div className="tutorial-page-rail-right">{rightRail}</div>
        </div>
      ) : (
        <div className="tutorial-page-body">
          {body}

          <aside className="tutorial-sources">
            <span className="tutorial-sources-label">
              {sourceType === 'TESTED'
                ? 'A note from Homemade'
                : 'Sources and provenance'}
            </span>
            <p className="tutorial-sources-text">
              {SOURCE_LABEL[sourceType] ?? ''}
            </p>
            {sourceNotes && (
              <p className="tutorial-sources-notes">{sourceNotes}</p>
            )}
          </aside>
          {footerSlot}
        </div>
      )}
    </article>
  )
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours} hr`
  return `${hours} hr ${mins} min`
}
