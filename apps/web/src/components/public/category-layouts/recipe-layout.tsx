import { headers } from 'next/headers'
import { prisma, TutorialStatus } from '@homemade/db'
import { HomeCard } from '@/components/public/home-card'
import { CategoryHero } from '@/components/public/category-hero'
import { SubCategoryChips } from '@/components/public/sub-category-chips'
import { CategorySubRail } from '@/components/public/category-sub-rail'
import { RecentlyMadeRail } from '@/components/public/recently-made-rail'
import { HomeRail } from '@/components/public/home-rail'
import { CategoryScopedSearch } from '@/components/public/category/category-scoped-search'
import { RecipeDietaryChips } from '@/components/public/category/recipe-dietary-chips'
import { loadRecentlyMade } from '@/lib/recently-made'
import { loadInSeasonForCategory } from '@/lib/in-season-for-category'
import {
  emptyReaderState,
  loadReaderState,
  readerStateFor,
} from '@/lib/user-state'

interface RecipeLayoutCategory {
  id: string
  slug: string
  name: string
  description: string | null
  subCategories: { id: string; slug: string; name: string }[]
}

interface RecipeLayoutProps {
  category: RecipeLayoutCategory
  searchParams: {
    sub?: string
    dietary?: string
  }
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
  requiresKiln: true,
  requiresWheel: true,
} as const

async function readCountryCode(): Promise<string | null> {
  try {
    const h = await headers()
    const cf = h.get('cf-ipcountry') ?? h.get('x-vercel-ip-country')
    if (cf && cf.length === 2) return cf.toUpperCase()
  } catch {
    // Outside a request scope (test) — fine.
  }
  return null
}

const SUGGESTIONS_BY_SLUG: Record<string, { label: string; q: string }[]> = {
  cooking: [
    { label: 'Tonight', q: 'weeknight dinner' },
    { label: 'Vegan', q: 'vegan' },
    { label: 'Under 30 minutes', q: 'quick' },
    { label: 'Comfort food', q: 'comfort food' },
    { label: 'In season', q: 'seasonal' },
  ],
  baking: [
    { label: 'Sourdough', q: 'sourdough' },
    { label: 'Weekend bake', q: 'weekend' },
    { label: 'Birthday cake', q: 'birthday' },
    { label: 'Quick bread', q: 'no knead' },
    { label: 'Pastry', q: 'pastry' },
  ],
  'herbal-medicine': [
    { label: 'Anxiety', q: 'anxiety' },
    { label: "Child's cough", q: 'cough child' },
    { label: 'Hayfever', q: 'hayfever' },
    { label: 'Winter immunity', q: 'immune winter' },
    { label: 'Sleep', q: 'sleep insomnia' },
  ],
  'natural-home': [
    { label: 'Cold-process soap', q: 'soap cold process' },
    { label: 'Beeswax candles', q: 'beeswax candle' },
    { label: 'Sensitive skin', q: 'sensitive skin' },
    { label: 'Cleaning spray', q: 'multipurpose cleaner' },
    { label: 'Gift idea', q: 'gift' },
  ],
}

const PLACEHOLDER_BY_SLUG: Record<string, string> = {
  cooking: 'What are you cooking?',
  baking: 'What are you baking?',
  'herbal-medicine': "What are you looking for? Try 'hayfever' or 'sleep'",
  'natural-home': 'What are you making? Try a soap or a cleaning spray',
}

/** Recipe categories where time-aware "quick wins" is meaningful. */
const QUICK_WINS_CATEGORIES = new Set(['cooking', 'baking', 'natural-home'])
/** Recipe categories where the seasonal rail is meaningful. */
const SEASONAL_CATEGORIES = new Set(['cooking', 'baking', 'herbal-medicine'])

export async function RecipeLayout({
  category,
  searchParams,
  currentUserId,
}: RecipeLayoutProps) {
  const subSlug = searchParams.sub ?? null
  const dietary = searchParams.dietary ?? null

  const subCategory = subSlug
    ? category.subCategories.find((s) => s.slug === subSlug) ?? null
    : null
  const activeSubSlug = subCategory ? subCategory.slug : null
  const isFiltered = Boolean(dietary) || Boolean(activeSubSlug)

  const preserveQuery: Record<string, string> = {}
  if (dietary) preserveQuery.dietary = dietary

  const [countryCode, recentlyMade] = await Promise.all([
    readCountryCode(),
    loadRecentlyMade({ limit: 10, categorySlug: category.slug }),
  ])

  let unfilteredRails: { sub: { id: string; slug: string; name: string }; tutorials: TutorialCardLike[] }[] = []
  let filteredTutorials: TutorialCardLike[] = []
  let inSeasonForCategory: TutorialCardLike[] = []
  let quickWins: TutorialCardLike[] = []

  if (isFiltered) {
    const tutorials = await prisma.tutorial.findMany({
      where: {
        categoryId: category.id,
        status: TutorialStatus.PUBLISHED,
        ...(dietary ? { dietaryFlags: { has: dietary } } : {}),
        ...(activeSubSlug && subCategory ? { subCategoryId: subCategory.id } : {}),
      },
      orderBy: [{ publishedAt: 'desc' }],
      select: CARD_SELECT,
    })
    filteredTutorials = tutorials as TutorialCardLike[]
  } else {
    const [perSubResults, seasonal, quick] = await Promise.all([
      Promise.all(
        category.subCategories.map((sub) =>
          prisma.tutorial.findMany({
            where: {
              categoryId: category.id,
              subCategoryId: sub.id,
              status: TutorialStatus.PUBLISHED,
            },
            orderBy: [
              { bookmarks: { _count: 'desc' } },
              { projects: { _count: 'desc' } },
              { publishedAt: 'desc' },
            ],
            take: 8,
            select: CARD_SELECT,
          }),
        ),
      ),
      SEASONAL_CATEGORIES.has(category.slug)
        ? loadInSeasonForCategory({
            categoryId: category.id,
            now: new Date(),
            countryCode,
            limit: 8,
          })
        : Promise.resolve([]),
      QUICK_WINS_CATEGORIES.has(category.slug)
        ? prisma.tutorial.findMany({
            where: {
              categoryId: category.id,
              status: TutorialStatus.PUBLISHED,
              totalMinutes: { lte: 30, not: null },
            },
            orderBy: [
              { bookmarks: { _count: 'desc' } },
              { publishedAt: 'desc' },
            ],
            take: 8,
            select: CARD_SELECT,
          })
        : Promise.resolve([]),
    ])

    unfilteredRails = category.subCategories
      .map((sub, i) => ({ sub, tutorials: (perSubResults[i] ?? []) as TutorialCardLike[] }))
      .filter((r) => r.tutorials.length > 0)
    inSeasonForCategory = seasonal as TutorialCardLike[]
    quickWins = quick as TutorialCardLike[]
  }

  const allIds = new Set<string>()
  for (const t of filteredTutorials) allIds.add(t.id)
  for (const r of unfilteredRails) for (const t of r.tutorials) allIds.add(t.id)
  for (const t of inSeasonForCategory) allIds.add(t.id)
  for (const t of quickWins) allIds.add(t.id)
  const readerState = currentUserId
    ? await loadReaderState(currentUserId, Array.from(allIds))
    : emptyReaderState()

  const suggestions = SUGGESTIONS_BY_SLUG[category.slug]
  const placeholder = PLACEHOLDER_BY_SLUG[category.slug] ?? 'What are you making?'

  return (
    <div className="category-page">
      <CategoryHero category={category} />

      <CategoryScopedSearch
        categorySlug={category.slug}
        placeholder={placeholder}
        suggestions={suggestions}
      />

      {category.subCategories.length > 0 && (
        <div className="category-chip-rows">
          <SubCategoryChips
            categorySlug={category.slug}
            subCategories={category.subCategories.map((s) => ({
              slug: s.slug,
              name: s.name,
            }))}
            activeSlug={activeSubSlug}
            preserveQuery={preserveQuery}
          />
          <RecipeDietaryChips
            categorySlug={category.slug}
            activeFlag={dietary}
            preserveQuery={
              activeSubSlug ? { ...preserveQuery, sub: activeSubSlug } : preserveQuery
            }
          />
        </div>
      )}

      {!isFiltered && inSeasonForCategory.length > 0 && (
        <HomeRail heading={`In season right now in ${category.name.toLowerCase()}`}>
          {inSeasonForCategory.map((t) => (
            <HomeCard
              key={t.id}
              tutorial={t}
              state={readerStateFor(readerState, t.id)}
            />
          ))}
        </HomeRail>
      )}

      {!isFiltered && quickWins.length > 0 && (
        <HomeRail
          heading={quickWinsHeadingFor(category.slug)}
          subheading="Under 30 minutes, start to finish."
        >
          {quickWins.map((t) => (
            <HomeCard
              key={t.id}
              tutorial={t}
              state={readerStateFor(readerState, t.id)}
            />
          ))}
        </HomeRail>
      )}

      {recentlyMade.length > 0 && !isFiltered && (
        <RecentlyMadeRail
          heading={`Recent makes in ${category.name.toLowerCase()}`}
          tiles={recentlyMade}
        />
      )}

      {!isFiltered &&
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

      {isFiltered && (
        <section className="category-filtered-section">
          {filteredTutorials.length === 0 ? (
            <p className="category-empty">
              Nothing in {category.name.toLowerCase()} matches that filter yet.
            </p>
          ) : (
            <div className="category-filtered-grid">
              {filteredTutorials.map((t) => (
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
    </div>
  )
}

function quickWinsHeadingFor(slug: string): string {
  switch (slug) {
    case 'cooking': return 'Tonight, in under half an hour'
    case 'baking': return 'Quick bakes'
    case 'natural-home': return 'Quick makes'
    default: return 'Quick wins'
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
  requiresKiln?: boolean
  requiresWheel?: boolean
}

export type RecipeLayoutFilteredCardLike = TutorialCardLike
