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
  key: string
  label: string
  values: { value: string; label: string }[]
}

const PICKERS_BY_SLUG: Record<string, PickerBand[]> = {
  mindset: [
    {
      key: 'mood',
      label: 'How are you feeling?',
      values: [
        { value: 'anxious', label: 'Anxious' },
        { value: 'scattered', label: 'Scattered' },
        { value: 'sad', label: 'Sad' },
        { value: 'overwhelmed', label: 'Overwhelmed' },
        { value: 'flat', label: 'Flat' },
        { value: 'lit-up', label: 'Lit-up' },
        { value: 'grieving', label: 'Grieving' },
        { value: 'restless', label: 'Restless' },
      ],
    },
    {
      key: 'timeBand',
      label: 'How much time do you have?',
      values: [
        { value: 'UP_TO_5', label: '5 minutes' },
        { value: 'UP_TO_20', label: '20 minutes' },
        { value: 'UP_TO_45', label: '45 minutes' },
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
  ],
  sustainability: [
    {
      key: 'depth',
      label: 'Commitment level',
      values: [
        { value: 'BEGINNER', label: 'Try' },
        { value: 'INTERMEDIATE', label: 'Embed' },
        { value: 'ADVANCED', label: 'Go all-in' },
      ],
    },
  ],
  'animals-smallholding': [
    {
      key: 'depth',
      label: 'Where are you?',
      values: [
        { value: 'BEGINNER', label: 'Considering' },
        { value: 'INTERMEDIATE', label: 'Setting up' },
        { value: 'ADVANCED', label: 'Already keeping' },
      ],
    },
  ],
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

  const mood = searchParams.mood ?? null
  const timeBand = searchParams.timeBand ?? null
  const depth = parseDifficulty(searchParams.depth)

  const pickers = PICKERS_BY_SLUG[category.slug] ?? []
  const anyPicked = Boolean(mood || timeBand || depth || subCategory)
  const base = `/${category.slug}`

  const where: Record<string, unknown> = {
    categoryId: category.id,
    status: TutorialStatus.PUBLISHED,
  }
  if (subCategory) where.subCategoryId = subCategory.id
  if (depth) where.difficulty = depth
  if (mood) where.mood = { has: mood }
  if (timeBand) where.timeBand = timeBand

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
                : band.key === 'mood'
                  ? mood
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
              ? 'Nothing yet matches that combination.'
              : `${recommended.length} suggestion${recommended.length === 1 ? '' : 's'} for you right now.`}
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
      return 'Pick how you are feeling, how much time you have, and how deep you want to go. We will match you with a practice that fits.'
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
