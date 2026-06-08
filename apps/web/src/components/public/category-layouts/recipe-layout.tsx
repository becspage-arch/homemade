import { headers } from 'next/headers'
import { prisma, TutorialStatus, type Difficulty } from '@homemade/db'
import { HomeCard } from '@/components/public/home-card'
import { CategoryHero } from '@/components/public/category-hero'
import { SubCategoryChips } from '@/components/public/sub-category-chips'
import { CategoryFilterChips } from '@/components/public/category-filter-chips'
import { CategorySubRail } from '@/components/public/category-sub-rail'
import { RecentlyMadeRail } from '@/components/public/recently-made-rail'
import { HomeRail } from '@/components/public/home-rail'
import { CategoryScopedSearch } from '@/components/public/category/category-scoped-search'
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
    difficulty?: string
    equipment?: string
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

function parseDifficulty(raw: string | undefined): Difficulty | null {
  if (!raw) return null
  const upper = raw.toUpperCase()
  if (upper === 'BEGINNER' || upper === 'INTERMEDIATE' || upper === 'ADVANCED') {
    return upper as Difficulty
  }
  return null
}

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

export async function RecipeLayout({
  category,
  searchParams,
  currentUserId,
}: RecipeLayoutProps) {
  const difficulty = parseDifficulty(searchParams.difficulty)
  const subSlug = searchParams.sub ?? null

  const subCategory = subSlug
    ? category.subCategories.find((s) => s.slug === subSlug) ?? null
    : null
  const activeSubSlug = subCategory ? subCategory.slug : null
  const isFiltered = Boolean(difficulty) || Boolean(activeSubSlug)

  const preserveQuery: Record<string, string> = {}
  if (difficulty) preserveQuery.difficulty = difficulty.toLowerCase()

  const [countryCode, recentlyMade] = await Promise.all([
    readCountryCode(),
    loadRecentlyMade({ limit: 10, categorySlug: category.slug }),
  ])

  let unfilteredRails: { sub: { id: string; slug: string; name: string }; tutorials: TutorialCardLike[] }[] = []
  let filteredTutorials: TutorialCardLike[] = []
  let inSeasonForCategory: TutorialCardLike[] = []

  if (isFiltered) {
    const tutorials = await prisma.tutorial.findMany({
      where: {
        categoryId: category.id,
        status: TutorialStatus.PUBLISHED,
        ...(difficulty ? { difficulty } : {}),
        ...(activeSubSlug && subCategory
          ? { subCategoryId: subCategory.id }
          : {}),
      },
      orderBy: [{ publishedAt: 'desc' }],
      select: CARD_SELECT,
    })
    filteredTutorials = tutorials as TutorialCardLike[]
  } else {
    const perSubResults = await Promise.all(
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
    )
    unfilteredRails = category.subCategories
      .map((sub, i) => ({ sub, tutorials: (perSubResults[i] ?? []) as TutorialCardLike[] }))
      .filter((r) => r.tutorials.length > 0)

    inSeasonForCategory = (await loadInSeasonForCategory({
      categoryId: category.id,
      now: new Date(),
      countryCode,
      limit: 8,
    })) as TutorialCardLike[]
  }

  const allIds = new Set<string>()
  for (const t of filteredTutorials) allIds.add(t.id)
  for (const r of unfilteredRails) for (const t of r.tutorials) allIds.add(t.id)
  for (const t of inSeasonForCategory) allIds.add(t.id)
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
          <CategoryFilterChips
            categorySlug={category.slug}
            showEquipment={false}
            activeDifficulty={difficulty}
            activeEquipment={null}
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
