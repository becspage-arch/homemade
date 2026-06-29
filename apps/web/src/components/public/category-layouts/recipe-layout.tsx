import { headers } from 'next/headers'
import { prisma, Prisma, TutorialStatus } from '@homemade/db'
import { HomeCard } from '@/components/public/home-card'
import {
  RecipeFilterSidebar,
  type RecipeFacetGroup,
} from '@/components/public/category/recipe-filter-sidebar'
import { cuisineLabel } from '@/lib/cuisine-label'
import { CategoryHero } from '@/components/public/category-hero'
import { CategorySubRail } from '@/components/public/category-sub-rail'
import { RecentlyMadeRail } from '@/components/public/recently-made-rail'
import { HomeRail } from '@/components/public/home-rail'
import Link from 'next/link'
import { CategoryScopedSearch } from '@/components/public/category/category-scoped-search'
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
    ingredient?: string
    meal?: string
    time?: string
    sort?: string
    browse?: string
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

/** Meal facet (mealType values → label), in serving order. */
const MEAL_FACETS: { value: string; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'brunch', label: 'Brunch' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'starter', label: 'Starter' },
  { value: 'side', label: 'Side' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'snack', label: 'Snack' },
  { value: 'drink', label: 'Drink' },
]

/** Time facet (URL value → label + max minutes). */
const TIME_FACETS: { value: string; label: string; max: number }[] = [
  { value: 'q30', label: 'Under 30 mins', max: 30 },
  { value: 'q60', label: 'Under 1 hour', max: 60 },
  { value: 'q90', label: 'Under 1½ hours', max: 90 },
]

/**
 * Curated "headline" ingredients people actually filter by — each groups the
 * many specific slugs (chicken-thigh, chicken-breast…) under one label and
 * deliberately excludes pantry staples (salt, oil, flour) and false matches
 * (chicken STOCK, fish SAUCE). `match`/`exclude` are lowercase slug substrings.
 */
interface HeadlineIngredient {
  value: string
  label: string
  categories: ('cooking' | 'baking')[]
  match: string[]
  exclude?: string[]
}
const HEADLINE_INGREDIENTS: HeadlineIngredient[] = [
  // cooking — proteins first (what people search by most)
  { value: 'chicken', label: 'Chicken', categories: ['cooking'], match: ['chicken'], exclude: ['stock-chicken', 'chicken-stock'] },
  { value: 'beef', label: 'Beef', categories: ['cooking'], match: ['beef', 'steak'], exclude: ['stock-beef', 'beef-stock'] },
  { value: 'pork', label: 'Pork & bacon', categories: ['cooking'], match: ['pork', 'bacon', 'gammon', 'pancetta', 'chorizo', 'sausage'] },
  { value: 'lamb', label: 'Lamb', categories: ['cooking'], match: ['lamb'] },
  { value: 'fish-seafood', label: 'Fish & seafood', categories: ['cooking'], match: ['salmon', 'cod', 'haddock', 'tuna', 'prawn', 'shrimp', 'mussel', 'crab', 'squid', 'mackerel', 'sardine', 'seafood', 'anchov', 'scallop'], exclude: ['fish-sauce', 'fish-stock'] },
  { value: 'eggs', label: 'Eggs', categories: ['cooking'], match: ['egg'], exclude: ['eggplant'] },
  { value: 'cheese', label: 'Cheese', categories: ['cooking', 'baking'], match: ['cheese', 'parmesan', 'cheddar', 'mozzarella', 'feta', 'halloumi', 'ricotta', 'paneer', 'mascarpone'] },
  { value: 'potato', label: 'Potatoes', categories: ['cooking'], match: ['potato'] },
  { value: 'mushroom', label: 'Mushrooms', categories: ['cooking'], match: ['mushroom'] },
  { value: 'tomato', label: 'Tomatoes', categories: ['cooking'], match: ['tomato'] },
  { value: 'rice', label: 'Rice', categories: ['cooking'], match: ['rice'], exclude: ['rice-vinegar', 'rice-wine', 'rice-flour', 'rice-paper'] },
  { value: 'pasta', label: 'Pasta & noodles', categories: ['cooking'], match: ['pasta', 'spaghetti', 'penne', 'macaroni', 'noodle', 'lasagne', 'tagliatelle', 'rigatoni', 'fusilli', 'gnocchi'] },
  { value: 'beans-pulses', label: 'Beans & pulses', categories: ['cooking'], match: ['lentil', 'chickpea', 'kidney-bean', 'black-bean', 'cannellini', 'butter-bean', 'borlotti', 'dal'] },
  // baking
  { value: 'chocolate', label: 'Chocolate', categories: ['baking'], match: ['chocolate', 'cocoa', 'cacao'] },
  { value: 'vanilla', label: 'Vanilla', categories: ['baking'], match: ['vanilla'] },
  { value: 'berries', label: 'Berries', categories: ['baking'], match: ['berry', 'strawberr', 'raspberr', 'blueberr', 'blackberr'] },
  { value: 'apple-pear', label: 'Apple & pear', categories: ['baking'], match: ['apple', 'pear'], exclude: ['pineapple'] },
  { value: 'citrus', label: 'Citrus', categories: ['baking'], match: ['lemon', 'orange', 'lime', 'citrus'] },
  { value: 'banana', label: 'Banana', categories: ['baking'], match: ['banana'] },
  { value: 'nuts', label: 'Nuts', categories: ['baking'], match: ['almond', 'walnut', 'pecan', 'hazelnut', 'pistachio', 'peanut', 'cashew'] },
  { value: 'caramel', label: 'Caramel & toffee', categories: ['baking'], match: ['caramel', 'toffee', 'dulce', 'butterscotch'] },
  { value: 'dried-fruit', label: 'Dried fruit', categories: ['baking'], match: ['raisin', 'sultana', 'currant', 'date-', 'fig', 'apricot', 'mixed-peel'] },
]

function slugInGroup(slug: string, g: HeadlineIngredient): boolean {
  return g.match.some((m) => slug.includes(m)) && !(g.exclude ?? []).some((m) => slug.includes(m))
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
  const ingredientFilter = searchParams.ingredient ?? null
  const mealFilter = searchParams.meal ?? null
  const timeFilter = searchParams.time ?? null
  const filterSort = searchParams.sort ?? 'popular'
  const isFoodCategory = FOOD_CATEGORIES.has(category.slug)

  const subCategory = subSlug
    ? category.subCategories.find((s) => s.slug === subSlug) ?? null
    : null
  const activeSubSlug = subCategory ? subCategory.slug : null
  const anyFilter =
    Boolean(dietary) || Boolean(activeSubSlug) || Boolean(cuisineFilter) ||
    Boolean(ingredientFilter) || Boolean(mealFilter) || Boolean(timeFilter)
  // The results view (search-style faceted grid) shows when the visitor is
  // filtering OR has tapped "Browse all recipes". Otherwise the landing
  // (hero + magazine + rails) shows, exactly as before.
  const showResults = anyFilter || searchParams.browse === '1'
  const isFiltered = showResults

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
    const timeMax = TIME_FACETS.find((t) => t.value === timeFilter)?.max ?? null
    const ingGroup = ingredientFilter
      ? HEADLINE_INGREDIENTS.find((g) => g.value === ingredientFilter && g.categories.includes(category.slug as 'cooking' | 'baking'))
      : null
    const ingredientWhere: Prisma.TutorialWhereInput | null = ingGroup
      ? {
          recipeIngredients: {
            some: {
              ingredient: {
                AND: [
                  { OR: ingGroup.match.map((m) => ({ slug: { contains: m } })) },
                  ...(ingGroup.exclude?.length
                    ? [{ NOT: { OR: ingGroup.exclude.map((m) => ({ slug: { contains: m } })) } }]
                    : []),
                ],
              },
            },
          },
        }
      : null
    const where: Prisma.TutorialWhereInput = {
      categoryId: category.id,
      status: TutorialStatus.PUBLISHED,
      ...(dietary ? { dietaryFlags: { has: dietary } } : {}),
      ...(activeSubSlug && subCategory ? { subCategoryId: subCategory.id } : {}),
      ...(cuisineFilter ? { cuisine: cuisineFilter } : {}),
      ...(mealFilter ? { mealType: mealFilter } : {}),
      ...(timeMax ? { totalMinutes: { lte: timeMax, not: null } } : {}),
      ...(ingredientWhere ?? {}),
    }
    const orderBy: Prisma.TutorialOrderByWithRelationInput[] =
      filterSort === 'newest'
        ? [{ publishedAt: 'desc' }]
        : filterSort === 'quick'
          ? [{ totalMinutes: { sort: 'asc', nulls: 'last' } }, { publishedAt: 'desc' }]
          : [{ bookmarks: { _count: 'desc' } }, { projects: { _count: 'desc' } }, { publishedAt: 'desc' }]

    const catWhere = { categoryId: category.id, status: TutorialStatus.PUBLISHED }
    const [tutorials, count, subCatGroups, cuisineGroups, mealGroups, dietRows, usedIngRows] = await Promise.all([
      prisma.tutorial.findMany({ where, orderBy, take: 96, select: CARD_SELECT }),
      prisma.tutorial.count({ where }),
      prisma.tutorial.groupBy({ by: ['subCategoryId'], where: catWhere, _count: { _all: true } }),
      isFoodCategory
        ? prisma.tutorial.groupBy({
            by: ['cuisine'],
            where: { ...catWhere, cuisine: { not: null } },
            _count: { cuisine: true },
            orderBy: { _count: { cuisine: 'desc' } },
          })
        : Promise.resolve([]),
      prisma.tutorial.groupBy({
        by: ['mealType'],
        where: { ...catWhere, mealType: { not: null } },
        _count: { mealType: true },
      }),
      prisma.$queryRaw<{ value: string; count: number }[]>`
        SELECT d AS value, COUNT(*)::int AS count FROM "Tutorial", unnest("dietaryFlags") d
        WHERE "categoryId" = ${category.id} AND status = 'PUBLISHED' GROUP BY d`,
      prisma.$queryRaw<{ slug: string }[]>`
        SELECT DISTINCT i.slug FROM "RecipeIngredient" ri
        JOIN "Tutorial" t ON t.id = ri."tutorialId"
        JOIN "Ingredient" i ON i.id = ri."ingredientId"
        WHERE t."categoryId" = ${category.id} AND t.status = 'PUBLISHED'`,
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
    const mealCount = new Map(
      (mealGroups as { mealType: string | null; _count: { mealType: number } }[]).map((g) => [g.mealType, g._count.mealType]),
    )
    const mealOptions = MEAL_FACETS
      .map((m) => ({ value: m.value, label: m.label, count: mealCount.get(m.value) ?? 0 }))
      .filter((o) => o.count > 0)
    const dietCount = new Map(dietRows.map((r) => [r.value, r.count]))
    const dietaryOptions = ['vegetarian', 'vegan', 'glutenFree', 'dairyFree', 'nutFree']
      .map((v) => ({ value: v, label: DIETARY_LABELS[v] ?? v, count: dietCount.get(v) ?? 0 }))
      .filter((o) => o.count > 0)
    const timeOptions = TIME_FACETS.map((t) => ({ value: t.value, label: t.label }))
    const usedSlugs = (usedIngRows as { slug: string }[]).map((r) => r.slug)
    const ingredientOptions = HEADLINE_INGREDIENTS
      .filter((g) => g.categories.includes(category.slug as 'cooking' | 'baking'))
      .filter((g) => usedSlugs.some((s) => slugInGroup(s, g)))
      .map((g) => ({ value: g.value, label: g.label }))

    filterGroups = [
      { key: 'sub', title: 'Dish type', allLabel: 'All dishes', options: dishOptions },
      ...(cuisineOptions.length
        ? [{ key: 'cuisine', title: 'Cuisine', allLabel: 'All cuisines', options: cuisineOptions }]
        : []),
      ...(ingredientOptions.length
        ? [{ key: 'ingredient', title: 'Main ingredient', options: ingredientOptions }]
        : []),
      ...(mealOptions.length ? [{ key: 'meal', title: 'Meal', options: mealOptions }] : []),
      { key: 'time', title: 'Time', options: timeOptions },
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

  const placeholder = PLACEHOLDER_BY_SLUG[category.slug] ?? 'What are you making?'

  return (
    <div className="category-page">
      <CategoryHero category={category} />

      <div className="category-find-bar">
        <CategoryScopedSearch categorySlug={category.slug} placeholder={placeholder} />
        {!showResults && (
          <Link href={`/${category.slug}?browse=1`} className="category-browse-all">
            Browse all {category.name.toLowerCase()} →
          </Link>
        )}
      </div>

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
            current={{
              sub: activeSubSlug,
              cuisine: cuisineFilter,
              ingredient: ingredientFilter,
              meal: mealFilter,
              time: timeFilter,
              dietary,
            }}
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
