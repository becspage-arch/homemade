import { headers } from 'next/headers'
import { prisma, Prisma, TutorialStatus } from '@homemade/db'
import { HomeCard } from '@/components/public/home-card'
import {
  RecipeFilterSidebar,
  type RecipeFacetGroup,
} from '@/components/public/category/recipe-filter-sidebar'
import { cuisineLabel } from '@/lib/cuisine-label'
import { CategoryHero } from '@/components/public/category-hero'
import { SubCategoryChips } from '@/components/public/sub-category-chips'
import { CategorySubRail } from '@/components/public/category-sub-rail'
import { RecentlyMadeRail } from '@/components/public/recently-made-rail'
import { HomeRail } from '@/components/public/home-rail'
import { CategoryScopedSearch } from '@/components/public/category/category-scoped-search'
import { RecipeDietaryChips } from '@/components/public/category/recipe-dietary-chips'
import { EditorialMagazineBlock } from '@/components/public/category/editorial-magazine-block'
import { CommunityRecipesRail } from '@/components/public/recipes/community-recipes-rail'
import { FreshRecipesRail } from '@/components/public/recipes/fresh-recipes-rail'
import { loadRecentlyMade } from '@/lib/recently-made'
import { loadInSeasonForCategory } from '@/lib/in-season-for-category'
import { isoWeekStartUtc } from '@/lib/editorial-picks'
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
    cuisine?: string
    sort?: string
  }
  currentUserId: string | null
}

/** Food categories that get the cuisine facet in the filtered view. */
const FOOD_CATEGORIES = new Set(['cooking', 'baking'])
/** Vague umbrella cuisines that aren't a useful browse facet. */
const CUISINE_NOISE = new Set(['international', 'asian', 'european', 'global', 'fusion'])
/** Dietary facet labels. */
const DIETARY_LABELS: Record<string, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  glutenFree: 'Gluten-free',
  dairyFree: 'Dairy-free',
  nutFree: 'Nut-free',
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
  const cuisineFilter = searchParams.cuisine ?? null
  const filterSort = searchParams.sort ?? 'popular'
  const isFoodCategory = FOOD_CATEGORIES.has(category.slug)

  const subCategory = subSlug
    ? category.subCategories.find((s) => s.slug === subSlug) ?? null
    : null
  const activeSubSlug = subCategory ? subCategory.slug : null
  const isFiltered = Boolean(dietary) || Boolean(activeSubSlug) || Boolean(cuisineFilter)

  const preserveQuery: Record<string, string> = {}
  if (dietary) preserveQuery.dietary = dietary
  if (cuisineFilter) preserveQuery.cuisine = cuisineFilter

  const [countryCode, recentlyMade] = await Promise.all([
    readCountryCode(),
    loadRecentlyMade({ limit: 10, categorySlug: category.slug }),
  ])

  let unfilteredRails: { sub: { id: string; slug: string; name: string }; tutorials: TutorialCardLike[] }[] = []
  let filteredTutorials: TutorialCardLike[] = []
  let inSeasonForCategory: TutorialCardLike[] = []
  let quickWins: TutorialCardLike[] = []
  let magazineFeature: TutorialCardLike | null = null
  let magazineSupporting: TutorialCardLike[] = []
  let filterGroups: RecipeFacetGroup[] = []
  let filteredCount = 0

  if (isFiltered) {
    const where: Prisma.TutorialWhereInput = {
      categoryId: category.id,
      status: TutorialStatus.PUBLISHED,
      ...(dietary ? { dietaryFlags: { has: dietary } } : {}),
      ...(activeSubSlug && subCategory ? { subCategoryId: subCategory.id } : {}),
      ...(cuisineFilter ? { cuisine: cuisineFilter } : {}),
    }
    const orderBy: Prisma.TutorialOrderByWithRelationInput[] =
      filterSort === 'newest'
        ? [{ publishedAt: 'desc' }]
        : filterSort === 'quick'
          ? [{ totalMinutes: { sort: 'asc', nulls: 'last' } }, { publishedAt: 'desc' }]
          : [{ bookmarks: { _count: 'desc' } }, { projects: { _count: 'desc' } }, { publishedAt: 'desc' }]

    const [tutorials, count, subCatGroups, cuisineGroups, dietRows] = await Promise.all([
      prisma.tutorial.findMany({ where, orderBy, take: 96, select: CARD_SELECT }),
      prisma.tutorial.count({ where }),
      prisma.tutorial.groupBy({
        by: ['subCategoryId'],
        where: { categoryId: category.id, status: TutorialStatus.PUBLISHED },
        _count: { _all: true },
      }),
      isFoodCategory
        ? prisma.tutorial.groupBy({
            by: ['cuisine'],
            where: { categoryId: category.id, status: TutorialStatus.PUBLISHED, cuisine: { not: null } },
            _count: { cuisine: true },
            orderBy: { _count: { cuisine: 'desc' } },
          })
        : Promise.resolve([]),
      prisma.$queryRaw<{ value: string; count: number }[]>`
        SELECT d AS value, COUNT(*)::int AS count FROM "Tutorial", unnest("dietaryFlags") d
        WHERE "categoryId" = ${category.id} AND status = 'PUBLISHED' GROUP BY d`,
    ])
    filteredTutorials = tutorials as TutorialCardLike[]
    filteredCount = count

    const subCount = new Map(subCatGroups.map((g) => [g.subCategoryId, g._count._all]))
    const dishOptions = category.subCategories
      .map((s) => ({ value: s.slug, label: s.name, count: subCount.get(s.id) ?? 0 }))
      .filter((o) => o.count > 0)
    const cuisineOptions = (cuisineGroups as { cuisine: string | null; _count: { cuisine: number } }[])
      .filter((g) => g.cuisine && !CUISINE_NOISE.has(g.cuisine) && g._count.cuisine >= 5)
      .slice(0, 18)
      .map((g) => ({ value: g.cuisine as string, label: cuisineLabel(g.cuisine as string), count: g._count.cuisine }))
    const dietCount = new Map(dietRows.map((r) => [r.value, r.count]))
    const dietaryOptions = ['vegetarian', 'vegan', 'glutenFree', 'dairyFree', 'nutFree']
      .map((v) => ({ value: v, label: DIETARY_LABELS[v] ?? v, count: dietCount.get(v) ?? 0 }))
      .filter((o) => o.count > 0)

    filterGroups = [
      { key: 'sub', title: 'Dish type', allLabel: 'All dishes', options: dishOptions },
      ...(cuisineOptions.length
        ? [{ key: 'cuisine', title: 'Cuisine', allLabel: 'All cuisines', options: cuisineOptions }]
        : []),
      ...(dietaryOptions.length ? [{ key: 'dietary', title: 'Dietary', options: dietaryOptions }] : []),
    ]
  } else {
    const weekStart = isoWeekStartUtc(new Date())
    const [perSubResults, seasonal, quick, mostLoved, magazinePicks] = await Promise.all([
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
      prisma.tutorial.findMany({
        where: {
          categoryId: category.id,
          status: TutorialStatus.PUBLISHED,
          hero: { isNot: null },
          heroQuality: 'EDITORIAL',
        },
        orderBy: [
          { bookmarks: { _count: 'desc' } },
          { projects: { _count: 'desc' } },
          { publishedAt: 'desc' },
        ],
        take: 4,
        select: CARD_SELECT,
      }),
      prisma.categoryMagazinePick.findMany({
        where: {
          categoryId: category.id,
          weekStarting: weekStart,
        },
        orderBy: { position: 'asc' },
        include: {
          tutorial: {
            select: CARD_SELECT,
          },
        },
      }),
    ])

    unfilteredRails = category.subCategories
      .map((sub, i) => ({ sub, tutorials: (perSubResults[i] ?? []) as TutorialCardLike[] }))
      .filter((r) => r.tutorials.length > 0)
    inSeasonForCategory = seasonal as TutorialCardLike[]
    quickWins = quick as TutorialCardLike[]

    // Prefer admin-pinned magazine picks for the current week. Falls back
    // to algorithmic most-loved EDITORIAL heroes when none are scheduled.
    if (magazinePicks.length > 0) {
      const feature = magazinePicks.find((p) => p.position === 1)
      const supporting = magazinePicks
        .filter((p) => p.position >= 2 && p.position <= 4)
        .map((p) => p.tutorial as TutorialCardLike)
      if (feature) {
        magazineFeature = feature.tutorial as TutorialCardLike
        magazineSupporting = supporting
      }
    }
    if (!magazineFeature) {
      const loved = mostLoved as TutorialCardLike[]
      if (loved.length > 0) {
        magazineFeature = loved[0] ?? null
        magazineSupporting = loved.slice(1, 4)
      }
    }
  }

  const allIds = new Set<string>()
  for (const t of filteredTutorials) allIds.add(t.id)
  for (const r of unfilteredRails) for (const t of r.tutorials) allIds.add(t.id)
  for (const t of inSeasonForCategory) allIds.add(t.id)
  for (const t of quickWins) allIds.add(t.id)
  if (magazineFeature) allIds.add(magazineFeature.id)
  for (const t of magazineSupporting) allIds.add(t.id)
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

      {!isFiltered && magazineFeature && magazineSupporting.length > 0 && (
        <EditorialMagazineBlock
          heading={magazineHeadingFor(category.slug)}
          subheading={magazineSubheadingFor(category.slug)}
          feature={magazineFeature}
          supporting={magazineSupporting}
          readerState={readerState}
        />
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

      {!isFiltered && (
        <CommunityRecipesRail categorySlug={category.slug} signedIn={Boolean(currentUserId)} />
      )}

      {!isFiltered && (
        <FreshRecipesRail
          categoryId={category.id}
          categorySlug={category.slug}
          categoryName={category.name}
        />
      )}

      {isFiltered && (
        <section className="category-filtered-section">
          <RecipeFilterSidebar
            groups={filterGroups}
            current={{ sub: activeSubSlug, cuisine: cuisineFilter, dietary }}
            count={filteredCount}
            sort={filterSort}
            basePath={`/${category.slug}`}
          >
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
          </RecipeFilterSidebar>
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

function magazineHeadingFor(slug: string): string {
  switch (slug) {
    case 'cooking': return 'The kitchen this week'
    case 'baking': return 'The bake of the week'
    case 'herbal-medicine': return 'The remedy this week'
    case 'natural-home': return 'The make of the week'
    default: return 'This week'
  }
}

function magazineSubheadingFor(slug: string): string {
  switch (slug) {
    case 'cooking':
      return 'A featured dish plus a handful of supporting cooks.'
    case 'baking':
      return 'One feature bake, three more worth your weekend.'
    case 'herbal-medicine':
      return 'The remedy we keep coming back to, with three close cousins.'
    case 'natural-home':
      return 'One feature formulation, with three more from the shelf.'
    default:
      return 'One feature, three to follow.'
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
