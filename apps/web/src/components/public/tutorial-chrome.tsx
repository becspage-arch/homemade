import Link from 'next/link'
import type { ReactNode } from 'react'

import type { HeroAttributionData } from './hero-attribution'
import { ServingsCell } from './tutorial-content/servings-cell'
import { TutorialHero } from './tutorial-reader/tutorial-hero'
import { TutorialInfoStrip } from './tutorial-reader/tutorial-info-strip'
import { TutorialJumpChips } from './tutorial-reader/tutorial-jump-chips'
import { heroCtaLabel } from '@/lib/category-cta'

import './tutorial-page.css'

const SOURCE_LABEL: Record<string, string> = {
  TESTED: 'Tested in the Homemade kitchen, garden, or studio.',
  CLASSIC:
    'A classic technique with long precedent, cross-referenced across established sources.',
  SYNTHESISED:
    'Synthesised from public-domain and extension-service sources by the Homemade editorial team.',
  PUBLIC_DOMAIN: 'From the public domain.',
  CREATOR: 'Contributed by an external creator.',
}

export interface TutorialAttribution {
  /** Display name shown in "By {name}". null falls back to "By Homemade" if homemade=true. */
  name: string | null
  /** Maker handle for the /makers/[handle] link. null hides the link. */
  handle: string | null
  /** True when verified by Homemade — shows a small verified dot. */
  verified: boolean
  /** True when the tutorial has no external creator. Renders "By Homemade". */
  homemade: boolean
}

/**
 * Recipe-only metadata for the info strip. Most fields move into the
 * "About this recipe" footer cluster — only the essentials (time,
 * difficulty, servings, dietary chips) render above the body.
 */
export interface TutorialRecipeMeta {
  type:
    | 'RECIPE'
    | 'TECHNIQUE'
    | 'PRACTICE'
    | 'READING'
    | 'GROWING_GUIDE'
    | 'REMEDY'
    | 'HERB_PROFILE'
    | 'STITCH'
    | 'PATTERN'
  servings: number | null
  yieldDescription: string | null
  prepMinutes: number | null
  cookMinutes: number | null
  totalMinutes: number | null
  cuisine: string | null
  mealType: string | null
  dietaryFlags: string[]
  freezable: boolean
  batchable: boolean
  makeAheadSummary: string | null
  foundational: boolean
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
  /** When set, renders the discreet © tooltip over the hero. */
  heroAttribution?: HeroAttributionData | null
  publishedAt: Date | null
  /** Last-reviewed signal for Google freshness. Surfaced in the
   *  About-this-recipe cluster, not the hero. */
  updatedAt?: Date | null
  sourceType: string
  sourceNotes: string | null
  /** Optional byline / attribution row. */
  attribution?: TutorialAttribution | null
  /** Recipe-side metadata for the info strip — null for techniques. */
  recipeMeta?: TutorialRecipeMeta | null
  /** Pottery equipment-barrier flag. Set true on tutorials needing a kiln. */
  requiresKiln?: boolean
  /** Pottery equipment-barrier flag. Set true on tutorials needing a wheel. */
  requiresWheel?: boolean
  /** The rendered tutorial body. */
  body: ReactNode
  /**
   * Hero ghost-action slot — bookmark + share buttons (client
   * components) live here, next to the primary CTA in the sage scrim.
   * Pass `null` when the reader is signed out and there's nothing to
   * render.
   */
  heroActionsSlot?: ReactNode
  /** Cooking-mode toggle — recipes only, rendered in the jump-chips row. */
  cookingModeSlot?: ReactNode
  /** Project action bar (signed-in only) — Start / Continue project pill. */
  projectActionsSlot?: ReactNode
  /** Above-body slot (Made by Makers tile moves here). */
  preBodySlot?: ReactNode
  /** Optional left rail (sticky TOC). When passed, body becomes 3-column. */
  leftRail?: ReactNode
  /** Optional right rail (project companion). When passed, body becomes 3-column. */
  rightRail?: ReactNode
  /** Optional footer rendered after the sources aside. */
  footerSlot?: ReactNode
}

/**
 * Shared "tutorial as a reader sees it" presentation component. Used
 * by the public route AND the admin Preview toggle. Pure presentation —
 * the caller passes already-rendered body content and resolved values.
 *
 * Layout (top to bottom):
 *   1. TutorialHero — full-bleed photo + sage scrim with category
 *      overline, title, standfirst, byline, primary CTA + ghost actions
 *   2. TutorialInfoStrip — compact time / difficulty / servings /
 *      dietary chips
 *   3. TutorialJumpChips — Jump to method + Cook hands-free
 *   4. Optional project actions bar (signed-in only)
 *   5. Optional pre-body slot (Made by Makers)
 *   6. Body (with optional 3-col rails for in-progress projects)
 *   7. Sources block (collapsible)
 *   8. Footer slot
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
    heroUrl,
    heroAlt,
    heroAttribution,
    sourceType,
    sourceNotes,
    attribution,
    recipeMeta,
    requiresKiln,
    requiresWheel,
    body,
    heroActionsSlot,
    cookingModeSlot,
    projectActionsSlot,
    preBodySlot,
    leftRail,
    rightRail,
    footerSlot,
  } = props

  const equipmentLabel =
    requiresKiln && requiresWheel
      ? 'Kiln + wheel'
      : requiresKiln
        ? 'Requires a kiln'
        : requiresWheel
          ? 'Requires a wheel'
          : null
  const hasRails = Boolean(leftRail || rightRail)
  const isRecipe = recipeMeta?.type === 'RECIPE'

  const totalForBar =
    isRecipe && recipeMeta?.totalMinutes != null
      ? recipeMeta.totalMinutes
      : timeMinutes

  const categoryOverline = category
    ? subCategoryName
      ? `${category.name.toUpperCase()} · ${subCategoryName.toUpperCase()}`
      : category.name.toUpperCase()
    : ''

  const primaryCtaHref = isRecipe ? '#ingredients' : '#tutorial-body'
  const primaryCtaLabel = heroCtaLabel(category?.slug ?? '')

  const bylineSlot = attribution ? <AttributionByline attribution={attribution} /> : null

  return (
    <article className="tutorial-page">
      <TutorialHero
        heroUrl={heroUrl}
        heroAlt={heroAlt}
        heroAttribution={heroAttribution}
        categoryOverline={categoryOverline}
        title={title || 'Untitled tutorial'}
        standfirst={subtitle ?? excerpt}
        bylineSlot={bylineSlot}
        primaryCtaLabel={primaryCtaLabel}
        primaryCtaHref={primaryCtaHref}
        actionsSlot={heroActionsSlot}
      />

      <div className="tutorial-page-inner">
        <TutorialInfoStrip
          timeMinutes={totalForBar}
          difficulty={difficulty}
          equipmentLabel={equipmentLabel}
          dietaryFlags={isRecipe ? recipeMeta?.dietaryFlags : undefined}
          servingsCell={
            isRecipe && recipeMeta ? (
              <ServingsCell
                defaultServings={recipeMeta.servings}
                yieldDescription={recipeMeta.yieldDescription}
                mealType={recipeMeta.mealType}
              />
            ) : undefined
          }
        />

        <TutorialJumpChips
          isRecipe={isRecipe}
          cookingModeSlot={cookingModeSlot}
        />

        {projectActionsSlot && (
          <div className="tutorial-project-actions">{projectActionsSlot}</div>
        )}

        {preBodySlot && (
          <div className="tutorial-pre-body">{preBodySlot}</div>
        )}

        {hasRails ? (
          <div className="tutorial-page-rails">
            <div className="tutorial-page-rail-left">{leftRail}</div>
            <div
              id="tutorial-body"
              className="tutorial-page-body tutorial-page-body-railed"
            >
              {body}

              <SourcesAside sourceType={sourceType} sourceNotes={sourceNotes} />
              {footerSlot}
            </div>
            <div className="tutorial-page-rail-right">{rightRail}</div>
          </div>
        ) : (
          <div id="tutorial-body" className="tutorial-page-body">
            {body}

            <SourcesAside sourceType={sourceType} sourceNotes={sourceNotes} />
            {footerSlot}
          </div>
        )}
      </div>
    </article>
  )
}

function AttributionByline({ attribution }: { attribution: TutorialAttribution }) {
  if (attribution.homemade) {
    return <span className="tutorial-hero-byline-text">By Homemade</span>
  }
  if (!attribution.name) return null
  return (
    <span className="tutorial-hero-byline-text">
      By{' '}
      {attribution.handle ? (
        <Link
          href={`/makers/${attribution.handle}`}
          className="tutorial-hero-byline-link"
        >
          {attribution.name}
        </Link>
      ) : (
        <span>{attribution.name}</span>
      )}
      {attribution.verified && (
        <span
          className="tutorial-hero-byline-verified"
          aria-label="Verified maker"
          title="Verified maker"
        >
          <svg viewBox="0 0 14 14" width="11" height="11" aria-hidden="true">
            <circle cx="7" cy="7" r="6.4" fill="currentColor" />
            <path
              d="M4 7.4l2 2 4-4"
              stroke="var(--color-sage)"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </span>
  )
}

function SourcesAside({
  sourceType,
  sourceNotes,
}: {
  sourceType: string
  sourceNotes: string | null
}) {
  const body = SOURCE_LABEL[sourceType] ?? ''
  if (!body && !sourceNotes) return null
  return (
    <details className="tutorial-sources">
      <summary className="tutorial-sources-summary">
        <span className="tutorial-sources-label">Where this came from</span>
      </summary>
      <div className="tutorial-sources-content">
        {body && <p className="tutorial-sources-text">{body}</p>}
        {sourceNotes && (
          <p className="tutorial-sources-notes">{sourceNotes}</p>
        )}
      </div>
    </details>
  )
}
