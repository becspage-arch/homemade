import { headers } from 'next/headers'
import { prisma, Prisma, TutorialStatus, DISH_COLLECTIONS } from '@homemade/db'
import { HomeCard } from '@/components/public/home-card'
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
import { WorldCuisineChips, cuisineLabel } from '@/components/public/category/world-cuisine-chips'
import { RecipeLibraryControls, type RecipeFacetGroup } from '@/components/public/category/recipe-library-controls'
import { loadRecentlyMade } from '@/lib/recently-made'
import { loadInSeasonForCategory } from '@/lib/in-season-for-category'
import { loadFamiliarForCategory } from '@/lib/familiar-for-category'
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
    collection?: string
    sort?: string
  }
  currentUserId: string | null
}

/** Vague umbrella cuisines that aren't a useful browse facet. */
const CUISINE_NOISE = new Set(['international', 'asian', 'european', 'global', 'fusion'])

/** Dietary facet labels (food categories). */
const DIETARY_LABELS: Record<string, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  glutenFree: 'Gluten-free',
  dairyFree: 'Dairy-free',
  nutFree: 'Nut-free',
  pescatarian: 'Pescatarian',
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

/**
 * Food categories that get the dish-type discoverability treatment
 * (phase_dish_type_001): region-aware familiar-canon featuring + world-cuisine
 * browse chips. Built reusably; only cooking + baking are wired on for now.
 */
const FOOD_CATEGORIES = new Set(['cooking', 'baking'])

/** Recipe categories where time-aware "quick wins" is meaningful. */
const QUICK_WINS_CATEGORIES = new Set(['cooking', 'baking', 'natural-home'])
/** Recipe categories where the seasonal rail is meaningful. */
const SEASONAL_CATEGORIES = new Set(['cooking', 'baking', 'herbal-medicine'])

export async function RecipeLayout(props: RecipeLayoutProps) {
  // Food categories use the faceted library (sidebar filters + grid), matching
  // the pattern categories' selection UX. Other recipe archetypes
  // (herbal-medicine, natural-home) keep the legacy rails + chip layout.
  if (FOOD_CATEGORIES.has(props.category.slug)) {
    return <FoodRecipeLayout {...props} />
  }
  return <LegacyRecipeLayout {...props} />
}

async function LegacyRecipeLayout({
  category,
  searchParams,
  currentUserId,
}: RecipeLayoutProps) {
  const subSlug = searchParams.sub ?? null
  const dietary = searchParams.dietary ?? null
  const cuisineFilter = searchParams.cuisine ?? null

  const subCategory = subSlug
    ? category.subCategories.find((s) => s.slug === subSlug) ?? null
    : null
  const activeSubSlug = subCategory ? subCategory.slug : null
  const isFiltered = Boolean(dietary) || Boolean(activeSubSlug) || Boolean(cuisineFilter)
  const isFoodCategory = FOOD_CATEGORIES.has(category.slug)

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
  let familiarRail: TutorialCardLike[] = []
  let worldCuisines: string[] = []

  if (isFiltered) {
    const tutorials = await prisma.tutorial.findMany({
      where: {
        categoryId: category.id,
        status: TutorialStatus.PUBLISHED,
        ...(dietary ? { dietaryFlags: { has: dietary } } : {}),
        ...(activeSubSlug && subCategory ? { subCategoryId: subCategory.id } : {}),
        ...(cuisineFilter ? { cuisine: cuisineFilter } : {}),
      },
      // Familiar canon first, then most-loved, so a filtered slice still leads
      // with the dishes a UK/US cook recognises before world-food discovery.
      orderBy: [
        { familiarCanon: 'desc' },
        { bookmarks: { _count: 'desc' } },
        { projects: { _count: 'desc' } },
        { publishedAt: 'desc' },
      ],
      select: CARD_SELECT,
    })
    filteredTutorials = tutorials as TutorialCardLike[]
  } else {
    const weekStart = isoWeekStartUtc(new Date())
    const [perSubResults, seasonal, quick, mostLoved, magazinePicks, familiar, cuisineGroups] = await Promise.all([
      Promise.all(
        category.subCategories.map((sub) =>
          prisma.tutorial.findMany({
            where: {
              categoryId: category.id,
              subCategoryId: sub.id,
              status: TutorialStatus.PUBLISHED,
            },
            // Familiar canon first so each dish-type shelf leads with the
            // dishes a UK/US cook recognises, then newest. (Ordering by the
            // bookmark/project _counts here meant 19 correlated aggregations
            // per request — ~3s of the page's TTFB — for no signal while
            // engagement is empty. familiarCanon + publishedAt are indexed.)
            orderBy: [
              { familiarCanon: 'desc' },
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
      // Region-aware familiar comfort canon (food categories only).
      isFoodCategory
        ? loadFamiliarForCategory({ categoryId: category.id, countryCode, limit: 12 })
        : Promise.resolve([]),
      // Cuisines present in this category, ordered by count, for the world
      // browse chips (food categories only).
      isFoodCategory
        ? prisma.tutorial.groupBy({
            by: ['cuisine'],
            where: {
              categoryId: category.id,
              status: TutorialStatus.PUBLISHED,
              cuisine: { not: null },
            },
            _count: { cuisine: true },
            orderBy: { _count: { cuisine: 'desc' } },
          })
        : Promise.resolve([]),
    ])

    unfilteredRails = category.subCategories
      .map((sub, i) => ({ sub, tutorials: (perSubResults[i] ?? []) as TutorialCardLike[] }))
      .filter((r) => r.tutorials.length > 0)
    inSeasonForCategory = seasonal as TutorialCardLike[]
    quickWins = quick as TutorialCardLike[]
    familiarRail = familiar as TutorialCardLike[]
    // Only surface cuisines with real depth, and cap the bar so it stays a
    // single tidy scrollable row rather than a 70-chip wall. The long tail of
    // one-off cuisines is still reachable via ?cuisine= / search. Drop vague
    // umbrella terms that aren't a useful browse facet.
    worldCuisines = (cuisineGroups as { cuisine: string | null; _count: { cuisine: number } }[])
      .filter((g) => g.cuisine && !CUISINE_NOISE.has(g.cuisine) && g._count.cuisine >= 10)
      .map((g) => g.cuisine as string)
      .slice(0, 16)

    // Prefer admin-pinned magazine picks for the current week. Then, for food
    // categories, lead the feature with the region-aware familiar canon (so the
    // "kitchen this week" hero is a dish a UK/US cook recognises, not whatever
    // was authored most recently). Otherwise fall back to most-loved EDITORIAL.
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
    if (!magazineFeature && isFoodCategory) {
      const withHero = familiarRail.filter((t) => t.hero)
      if (withHero.length >= 4) {
        magazineFeature = withHero[0] ?? null
        magazineSupporting = withHero.slice(1, 4)
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
  for (const t of familiarRail) allIds.add(t.id)
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
          {isFoodCategory && worldCuisines.length > 0 && (
            <WorldCuisineChips
              categorySlug={category.slug}
              cuisines={worldCuisines}
              activeCuisine={cuisineFilter}
              preserveQuery={(() => {
                const q: Record<string, string> = {}
                if (dietary) q.dietary = dietary
                if (activeSubSlug) q.sub = activeSubSlug
                return q
              })()}
            />
          )}
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

      {!isFiltered && isFoodCategory && (() => {
        const usedIds = new Set<string>(
          [magazineFeature?.id, ...magazineSupporting.map((t) => t.id)].filter(
            (id): id is string => Boolean(id),
          ),
        )
        const rail = familiarRail.filter((t) => !usedIds.has(t.id)).slice(0, 10)
        if (rail.length === 0) return null
        return (
          <HomeRail
            heading={familiarHeadingFor(category.slug)}
            subheading="The dishes everyone knows, front and centre."
          >
            {rail.map((t) => (
              <HomeCard
                key={t.id}
                tutorial={t}
                state={readerStateFor(readerState, t.id)}
              />
            ))}
          </HomeRail>
        )
      })()}

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

/**
 * Faceted recipe library for the food categories (phase_dish_type_001).
 *
 * Discovery rails up top (inspiration), then a single faceted library — a
 * left filter sidebar (Dish type / Cuisine / Collections / Dietary, each a
 * vertical list of toggle buttons that clear on a second click) plus the
 * results grid. This replaces the off-screen chip strips with the same
 * selection model the pattern categories use. When a filter is active the
 * inspiration rails collapse so the library is the whole focus.
 */
async function FoodRecipeLayout({ category, searchParams, currentUserId }: RecipeLayoutProps) {
  const subSlug = searchParams.sub ?? null
  const dietary = searchParams.dietary ?? null
  const cuisineFilter = searchParams.cuisine ?? null
  const collection = searchParams.collection ?? null
  const sort = searchParams.sort ?? 'familiar'
  const subCategory = subSlug
    ? category.subCategories.find((s) => s.slug === subSlug) ?? null
    : null
  const isFiltered = Boolean(subSlug || dietary || cuisineFilter || collection)

  const countryCode = await readCountryCode()

  const where: Prisma.TutorialWhereInput = {
    categoryId: category.id,
    status: TutorialStatus.PUBLISHED,
    ...(subCategory ? { subCategoryId: subCategory.id } : {}),
    ...(dietary ? { dietaryFlags: { has: dietary } } : {}),
    ...(cuisineFilter ? { cuisine: cuisineFilter } : {}),
    ...(collection ? { mood: { has: collection } } : {}),
  }
  const orderBy: Prisma.TutorialOrderByWithRelationInput[] =
    sort === 'newest'
      ? [{ publishedAt: 'desc' }]
      : sort === 'quick'
        ? [{ totalMinutes: { sort: 'asc', nulls: 'last' } }, { publishedAt: 'desc' }]
        : sort === 'popular'
          ? [{ bookmarks: { _count: 'desc' } }, { projects: { _count: 'desc' } }, { publishedAt: 'desc' }]
          : [{ familiarCanon: 'desc' }, { bookmarks: { _count: 'desc' } }, { publishedAt: 'desc' }]

  const weekStart = isoWeekStartUtc(new Date())
  const [
    results,
    totalCount,
    subCatGroups,
    cuisineGroups,
    moodRows,
    dietRows,
    magazinePicks,
    familiar,
    seasonal,
    quick,
    recentlyMade,
  ] = await Promise.all([
    prisma.tutorial.findMany({ where, orderBy, take: 96, select: CARD_SELECT }),
    prisma.tutorial.count({ where }),
    prisma.tutorial.groupBy({
      by: ['subCategoryId'],
      where: { categoryId: category.id, status: TutorialStatus.PUBLISHED },
      _count: { _all: true },
    }),
    prisma.tutorial.groupBy({
      by: ['cuisine'],
      where: { categoryId: category.id, status: TutorialStatus.PUBLISHED, cuisine: { not: null } },
      _count: { cuisine: true },
      orderBy: { _count: { cuisine: 'desc' } },
    }),
    prisma.$queryRaw<{ value: string; count: number }[]>`
      SELECT m AS value, COUNT(*)::int AS count FROM "Tutorial", unnest(mood) m
      WHERE "categoryId" = ${category.id} AND status = 'PUBLISHED' GROUP BY m`,
    prisma.$queryRaw<{ value: string; count: number }[]>`
      SELECT d AS value, COUNT(*)::int AS count FROM "Tutorial", unnest("dietaryFlags") d
      WHERE "categoryId" = ${category.id} AND status = 'PUBLISHED' GROUP BY d`,
    isFiltered
      ? Promise.resolve([])
      : prisma.categoryMagazinePick.findMany({
          where: { categoryId: category.id, weekStarting: weekStart },
          orderBy: { position: 'asc' },
          include: { tutorial: { select: CARD_SELECT } },
        }),
    isFiltered
      ? Promise.resolve([])
      : loadFamiliarForCategory({ categoryId: category.id, countryCode, limit: 12 }),
    isFiltered
      ? Promise.resolve([])
      : loadInSeasonForCategory({ categoryId: category.id, now: new Date(), countryCode, limit: 8 }),
    isFiltered
      ? Promise.resolve([])
      : prisma.tutorial.findMany({
          where: { categoryId: category.id, status: TutorialStatus.PUBLISHED, totalMinutes: { lte: 30, not: null } },
          orderBy: [{ familiarCanon: 'desc' }, { publishedAt: 'desc' }],
          take: 8,
          select: CARD_SELECT,
        }),
    isFiltered ? Promise.resolve([]) : loadRecentlyMade({ limit: 10, categorySlug: category.slug }),
  ])

  // ── facet groups ──────────────────────────────────────────────────────────
  const subCount = new Map(subCatGroups.map((g) => [g.subCategoryId, g._count._all]))
  const dishOptions = category.subCategories
    .map((s) => ({ value: s.slug, label: s.name, count: subCount.get(s.id) ?? 0 }))
    .filter((o) => o.count > 0)

  const cuisineOptions = (cuisineGroups as { cuisine: string | null; _count: { cuisine: number } }[])
    .filter((g) => g.cuisine && !CUISINE_NOISE.has(g.cuisine) && g._count.cuisine >= 5)
    .slice(0, 18)
    .map((g) => ({ value: g.cuisine as string, label: cuisineLabel(g.cuisine as string), count: g._count.cuisine }))

  const moodCount = new Map(moodRows.map((r) => [r.value, r.count]))
  const collectionOptions = DISH_COLLECTIONS.filter((c) =>
    (c.categories as string[]).includes(category.slug),
  )
    .map((c) => ({ value: c.mood, label: c.name, count: moodCount.get(c.mood) ?? 0 }))
    .filter((o) => o.count > 0)

  const dietCount = new Map(dietRows.map((r) => [r.value, r.count]))
  const dietaryOptions = ['vegetarian', 'vegan', 'glutenFree', 'dairyFree', 'nutFree']
    .map((v) => ({ value: v, label: DIETARY_LABELS[v] ?? v, count: dietCount.get(v) ?? 0 }))
    .filter((o) => o.count > 0)

  const groups: RecipeFacetGroup[] = [
    { key: 'sub', title: 'Dish type', allLabel: 'All dishes', options: dishOptions },
    ...(cuisineOptions.length
      ? [{ key: 'cuisine', title: 'Cuisine', allLabel: 'All cuisines', options: cuisineOptions }]
      : []),
    ...(collectionOptions.length ? [{ key: 'collection', title: 'Collections', options: collectionOptions }] : []),
    ...(dietaryOptions.length ? [{ key: 'dietary', title: 'Dietary', options: dietaryOptions }] : []),
  ]
  const current = { sub: subSlug, cuisine: cuisineFilter, collection, dietary }

  // ── magazine feature (familiar-first), only on the unfiltered landing ──────
  let magazineFeature: TutorialCardLike | null = null
  let magazineSupporting: TutorialCardLike[] = []
  const familiarRail = familiar as TutorialCardLike[]
  if (!isFiltered) {
    if (magazinePicks.length > 0) {
      const feature = magazinePicks.find((p) => p.position === 1)
      if (feature) {
        magazineFeature = feature.tutorial as TutorialCardLike
        magazineSupporting = magazinePicks
          .filter((p) => p.position >= 2 && p.position <= 4)
          .map((p) => p.tutorial as TutorialCardLike)
      }
    }
    if (!magazineFeature) {
      const withHero = familiarRail.filter((t) => t.hero)
      if (withHero.length >= 4) {
        magazineFeature = withHero[0] ?? null
        magazineSupporting = withHero.slice(1, 4)
      }
    }
  }

  // ── reader state for every visible card ───────────────────────────────────
  const allIds = new Set<string>()
  for (const t of results) allIds.add(t.id)
  for (const t of familiarRail) allIds.add(t.id)
  for (const t of seasonal as TutorialCardLike[]) allIds.add(t.id)
  for (const t of quick as TutorialCardLike[]) allIds.add(t.id)
  if (magazineFeature) allIds.add(magazineFeature.id)
  for (const t of magazineSupporting) allIds.add(t.id)
  const readerState = currentUserId
    ? await loadReaderState(currentUserId, Array.from(allIds))
    : emptyReaderState()

  const usedFeatureIds = new Set(
    [magazineFeature?.id, ...magazineSupporting.map((t) => t.id)].filter((id): id is string => Boolean(id)),
  )
  const familiarStrip = familiarRail.filter((t) => !usedFeatureIds.has(t.id)).slice(0, 10)
  const seasonalRail = seasonal as TutorialCardLike[]
  const quickRail = quick as TutorialCardLike[]

  return (
    <div className="category-page">
      <CategoryHero category={category} />

      <CategoryScopedSearch
        categorySlug={category.slug}
        placeholder={PLACEHOLDER_BY_SLUG[category.slug] ?? 'What are you making?'}
        suggestions={SUGGESTIONS_BY_SLUG[category.slug]}
      />

      {!isFiltered && magazineFeature && magazineSupporting.length > 0 && (
        <EditorialMagazineBlock
          heading={magazineHeadingFor(category.slug)}
          subheading={magazineSubheadingFor(category.slug)}
          feature={magazineFeature}
          supporting={magazineSupporting}
          readerState={readerState}
        />
      )}

      {!isFiltered && familiarStrip.length > 0 && (
        <HomeRail
          heading={familiarHeadingFor(category.slug)}
          subheading="The dishes everyone knows, front and centre."
        >
          {familiarStrip.map((t) => (
            <HomeCard key={t.id} tutorial={t} state={readerStateFor(readerState, t.id)} />
          ))}
        </HomeRail>
      )}

      {!isFiltered && seasonalRail.length > 0 && (
        <HomeRail heading={`In season right now in ${category.name.toLowerCase()}`}>
          {seasonalRail.map((t) => (
            <HomeCard key={t.id} tutorial={t} state={readerStateFor(readerState, t.id)} />
          ))}
        </HomeRail>
      )}

      {!isFiltered && quickRail.length > 0 && (
        <HomeRail
          heading={quickWinsHeadingFor(category.slug)}
          subheading="Under 30 minutes, start to finish."
        >
          {quickRail.map((t) => (
            <HomeCard key={t.id} tutorial={t} state={readerStateFor(readerState, t.id)} />
          ))}
        </HomeRail>
      )}

      {!isFiltered && recentlyMade.length > 0 && (
        <RecentlyMadeRail
          heading={`Recent makes in ${category.name.toLowerCase()}`}
          tiles={recentlyMade}
        />
      )}

      <section id="recipes" className="recipe-library">
        <h2 className="recipe-library-heading">
          {isFiltered ? 'Matching recipes' : `Browse every ${category.name.toLowerCase()} recipe`}
        </h2>
        <p className="recipe-library-sub">
          Filter by dish, cuisine, collection or diet — pick again to clear.
        </p>
        <RecipeLibraryControls
          groups={groups}
          current={current}
          count={totalCount}
          sort={sort}
          basePath={`/${category.slug}`}
        >
          {results.length === 0 ? (
            <p className="recipe-library-empty">
              Nothing matches that yet. Try lifting a filter.
            </p>
          ) : (
            <div className="category-filtered-grid">
              {results.map((t) => (
                <HomeCard
                  key={t.id}
                  tutorial={t as TutorialCardLike}
                  state={readerStateFor(readerState, t.id)}
                />
              ))}
            </div>
          )}
        </RecipeLibraryControls>
      </section>

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
    </div>
  )
}

function familiarHeadingFor(slug: string): string {
  switch (slug) {
    case 'cooking': return 'Comfort classics'
    case 'baking': return 'Classic bakes'
    default: return 'Familiar favourites'
  }
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
