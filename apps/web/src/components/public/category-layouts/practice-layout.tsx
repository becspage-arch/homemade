import Link from 'next/link'
import { prisma, TutorialStatus, type Difficulty } from '@homemade/db'
import { HomeCard } from '@/components/public/home-card'
import { CategorySubRail } from '@/components/public/category-sub-rail'
import { RecentlyMadeRail } from '@/components/public/recently-made-rail'
import { loadRecentlyMade } from '@/lib/recently-made'
import {
  emptyReaderState,
  loadReaderState,
  readerStateFor,
} from '@/lib/user-state'

interface PracticeLayoutCategory {
  id: string
  slug: string
  name: string
  description: string | null
  subCategories: { id: string; slug: string; name: string }[]
}

interface PracticeLayoutProps {
  category: PracticeLayoutCategory
  searchParams: Record<string, string | undefined>
  currentUserId: string | null
}

const CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  difficulty: true,
  totalMinutes: true,
  timeMinutes: true,
  dietaryFlags: true,
  category: { select: { slug: true, name: true } },
  hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
  publishedAt: true,
  subCategoryId: true,
} as const

interface PickerBand {
  /** URL parameter name. */
  key: string
  /** Question for the user. */
  label: string
  values: { value: string; label: string }[]
}

/**
 * Mindset picker is the heart of the Practice archetype. Bands map to the
 * real schema enums so the WHERE clause hits the right column:
 *   target   → Tutorial.practiceTargets (PracticeTarget[])
 *   timeBand → Tutorial.timeBand        (TimeBand)
 *   depth    → Tutorial.practiceDepth   (Difficulty)
 *
 * Labels are voice-tuned for the user state, not the schema.
 */
const MINDSET_PICKER: PickerBand[] = [
  {
    key: 'target',
    label: 'What do you need right now?',
    values: [
      { value: 'ANXIETY', label: 'Anxious' },
      { value: 'STUCK', label: 'Stuck' },
      { value: 'GRIEF', label: 'Grieving' },
      { value: 'FEAR', label: 'Fearful' },
      { value: 'CONFIDENCE', label: 'Confidence' },
      { value: 'ENERGY', label: 'Energy' },
      { value: 'JOY', label: 'Joy' },
      { value: 'SLEEP', label: 'Sleep' },
      { value: 'ABUNDANCE', label: 'Abundance' },
      { value: 'RELATIONSHIPS', label: 'Relationships' },
      { value: 'BODY', label: 'Body' },
      { value: 'SELF_WORTH', label: 'Self-worth' },
    ],
  },
  {
    key: 'timeBand',
    label: 'How much time do you have?',
    values: [
      { value: 'THREE_MIN', label: '3 min' },
      { value: 'FIVE_MIN', label: '5 min' },
      { value: 'TEN_MIN', label: '10 min' },
      { value: 'TWENTY_MIN', label: '20 min' },
      { value: 'THIRTY_PLUS', label: '30 min+' },
    ],
  },
  {
    key: 'depth',
    label: 'Pace',
    values: [
      { value: 'BEGINNER', label: 'Gentle' },
      { value: 'INTERMEDIATE', label: 'Steady' },
      { value: 'ADVANCED', label: 'Deep' },
    ],
  },
]

const SUSTAINABILITY_PICKER: PickerBand[] = [
  {
    key: 'difficulty',
    label: 'Commitment level',
    values: [
      { value: 'BEGINNER', label: 'Try' },
      { value: 'INTERMEDIATE', label: 'Embed' },
      { value: 'ADVANCED', label: 'Go all-in' },
    ],
  },
]

const ANIMALS_PICKER: PickerBand[] = [
  {
    key: 'difficulty',
    label: 'Where are you?',
    values: [
      { value: 'BEGINNER', label: 'Considering' },
      { value: 'INTERMEDIATE', label: 'Setting up' },
      { value: 'ADVANCED', label: 'Already keeping' },
    ],
  },
]

const PICKERS_BY_SLUG: Record<string, PickerBand[]> = {
  mindset: MINDSET_PICKER,
  sustainability: SUSTAINABILITY_PICKER,
  'animals-smallholding': ANIMALS_PICKER,
}

function parseDifficulty(raw: string | undefined): Difficulty | null {
  if (!raw) return null
  const upper = raw.toUpperCase()
  if (upper === 'BEGINNER' || upper === 'INTERMEDIATE' || upper === 'ADVANCED') {
    return upper as Difficulty
  }
  return null
}

function buildHref(
  base: string,
  current: Record<string, string | undefined>,
  setKey: string,
  newValue: string | null,
): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(current)) {
    if (v !== undefined && k !== setKey) params.set(k, v)
  }
  if (newValue) params.set(setKey, newValue)
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export async function PracticeLayout({
  category,
  searchParams,
  currentUserId,
}: PracticeLayoutProps) {
  const subSlug = searchParams.sub ?? null
  const subCategory = subSlug
    ? category.subCategories.find((s) => s.slug === subSlug) ?? null
    : null

  const isMindset = category.slug === 'mindset'

  // Different bound fields per category.
  const target = isMindset ? (searchParams.target ?? null) : null
  const timeBand = isMindset ? (searchParams.timeBand ?? null) : null
  const depth = isMindset ? parseDifficulty(searchParams.depth) : null
  const difficulty = !isMindset ? parseDifficulty(searchParams.difficulty) : null

  const pickers = PICKERS_BY_SLUG[category.slug] ?? []
  const anyPicked = Boolean(
    target || timeBand || depth || difficulty || subCategory,
  )
  const base = `/${category.slug}`

  const where: Record<string, unknown> = {
    categoryId: category.id,
    status: TutorialStatus.PUBLISHED,
  }
  if (subCategory) where.subCategoryId = subCategory.id
  if (target) where.practiceTargets = { has: target }
  if (timeBand) where.timeBand = timeBand
  if (depth) where.practiceDepth = depth
  if (difficulty) where.difficulty = difficulty

  const [recommended, recentlyMade, perSubResults] = await Promise.all([
    anyPicked
      ? prisma.tutorial.findMany({
          where,
          orderBy: [
            { bookmarks: { _count: 'desc' } },
            { publishedAt: 'desc' },
          ],
          take: 12,
          select: CARD_SELECT,
        })
      : Promise.resolve([]),
    loadRecentlyMade({ limit: 10, categorySlug: category.slug }),
    anyPicked
      ? Promise.resolve([])
      : Promise.all(
          category.subCategories.map((sub) =>
            prisma.tutorial.findMany({
              where: {
                categoryId: category.id,
                subCategoryId: sub.id,
                status: TutorialStatus.PUBLISHED,
              },
              orderBy: [
                { bookmarks: { _count: 'desc' } },
                { publishedAt: 'desc' },
              ],
              take: 8,
              select: CARD_SELECT,
            }),
          ),
        ),
  ])

  const unfilteredRails = Array.isArray(perSubResults)
    ? category.subCategories
        .map((sub, i) => ({ sub, tutorials: (perSubResults[i] ?? []) as TutorialCardLike[] }))
        .filter((r) => r.tutorials.length > 0)
    : []

  const allIds = new Set<string>()
  for (const t of recommended as TutorialCardLike[]) allIds.add(t.id)
  for (const r of unfilteredRails) for (const t of r.tutorials) allIds.add(t.id)
  const readerState = currentUserId
    ? await loadReaderState(currentUserId, Array.from(allIds))
    : emptyReaderState()

  return (
    <div className="practice-landing">
      <header className="practice-landing-header">
        <p className="practice-landing-eyebrow">{category.name}</p>
        <h1 className="practice-landing-title">{practiceTitleFor(category.slug)}</h1>
        <p className="practice-landing-lede">{practiceLedeFor(category.slug)}</p>
      </header>

      {pickers.length > 0 && (
        <section className="practice-picker" aria-label="Practice picker">
          {pickers.map((band) => {
            const currentValue =
              band.key === 'depth'
                ? depth ?? null
                : band.key === 'difficulty'
                  ? difficulty ?? null
                  : band.key === 'target'
                    ? target
                    : band.key === 'timeBand'
                      ? timeBand
                      : null
            return (
              <div key={band.key} className="practice-picker-band">
                <span className="practice-picker-label">{band.label}</span>
                <div className="practice-picker-chips">
                  <Link
                    href={buildHref(base, searchParams, band.key, null)}
                    className={`practice-picker-chip${!currentValue ? ' is-active' : ''}`}
                  >
                    Any
                  </Link>
                  {band.values.map((v) => {
                    const isActive = currentValue === v.value
                    const target = isActive
                      ? buildHref(base, searchParams, band.key, null)
                      : buildHref(base, searchParams, band.key, v.value)
                    return (
                      <Link
                        key={v.value}
                        href={target}
                        className={`practice-picker-chip${isActive ? ' is-active' : ''}`}
                      >
                        {v.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>
      )}

      {anyPicked && (
        <section className="practice-recommended">
          <h2 className="practice-recommended-heading">
            {recommended.length === 0
              ? 'Nothing yet matches that combination. Try lifting a filter.'
              : `${recommended.length} for you right now.`}
          </h2>
          {recommended.length > 0 && (
            <div className="practice-recommended-grid">
              {(recommended as TutorialCardLike[]).map((t) => (
                <HomeCard
                  key={t.id}
                  tutorial={t}
                  state={readerStateFor(readerState, t.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {!anyPicked && recentlyMade.length > 0 && (
        <RecentlyMadeRail
          heading={`Recent makes in ${category.name.toLowerCase()}`}
          tiles={recentlyMade}
        />
      )}

      {!anyPicked &&
        unfilteredRails.map(({ sub, tutorials }) => (
          <CategorySubRail
            key={sub.id}
            categorySlug={category.slug}
            subCategorySlug={sub.slug}
            heading={sub.name}
            tutorials={tutorials}
            readerState={readerState}
          />
        ))}
    </div>
  )
}

function practiceTitleFor(slug: string): string {
  switch (slug) {
    case 'mindset': return 'Where are you, right now?'
    case 'sustainability': return 'One step at a time.'
    case 'animals-smallholding': return 'A life with animals.'
    default: return 'Find your next practice.'
  }
}

function practiceLedeFor(slug: string): string {
  switch (slug) {
    case 'mindset':
      return 'Pick what you need, how much time you have, and how deep you want to go. We will match you with a practice that fits.'
    case 'sustainability':
      return 'Composting, energy, water, waste, off-grid. Start small or commit deep — both count.'
    case 'animals-smallholding':
      return 'Bees, poultry, sheep, goats, rabbits, pigs. Whether you are researching, setting up, or already keeping.'
    default:
      return 'Pick where you are and we will surface what fits.'
  }
}

interface TutorialCardLike {
  id: string
  slug: string
  title: string
  excerpt: string | null
  difficulty: string
  totalMinutes: number | null
  timeMinutes: number | null
  dietaryFlags: string[]
  category: { slug: string; name: string }
  hero: { cloudflareId: string | null; r2Key: string | null; alt: string | null } | null
  subCategoryId?: string | null
}
