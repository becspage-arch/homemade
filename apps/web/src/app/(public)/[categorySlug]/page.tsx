import { cache } from 'react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma, TutorialStatus, Difficulty } from '@homemade/db'
import { HomeCard } from '@/components/public/home-card'
import { CategoryHero } from '@/components/public/category-hero'
import { SubCategoryChips } from '@/components/public/sub-category-chips'
import { CategoryFilterChips } from '@/components/public/category-filter-chips'
import { CategorySubRail } from '@/components/public/category-sub-rail'
import { RecentlyMadeRail } from '@/components/public/recently-made-rail'
import { HomeRail } from '@/components/public/home-rail'
import { JsonLd } from '@/components/seo/json-ld'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { loadRecentlyMade } from '@/lib/recently-made'
import { loadInSeasonForCategory } from '@/lib/in-season-for-category'
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from '@/lib/seo/schema-builders'
import {
  buildPublicMetadata,
  notFoundMetadata,
} from '@/lib/seo/metadata-helpers'
import {
  emptyReaderState,
  loadReaderState,
  readerStateFor,
} from '@/lib/user-state'

import './category-page.css'

export const dynamic = 'force-dynamic'

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

interface PageProps {
  params: Promise<{ categorySlug: string }>
  searchParams: Promise<{
    sub?: string
    difficulty?: string
    equipment?: string
  }>
}

const loadCategory = cache(async (slug: string) => {
  return prisma.category.findFirst({
    where: { slug, isPublicVisible: true },
    include: {
      subCategories: { orderBy: [{ order: 'asc' }, { name: 'asc' }] },
    },
  })
})

function parseDifficulty(raw: string | undefined): Difficulty | null {
  if (!raw) return null
  const upper = raw.toUpperCase()
  if (upper === 'BEGINNER' || upper === 'INTERMEDIATE' || upper === 'ADVANCED') {
    return upper as Difficulty
  }
  return null
}

type EquipmentFilter = 'none' | 'no-kiln' | 'no-wheel' | null

function parseEquipment(raw: string | undefined): EquipmentFilter {
  if (raw === 'none' || raw === 'no-kiln' || raw === 'no-wheel') return raw
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

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params
  const { difficulty, equipment, sub } = await searchParams
  const category = await loadCategory(categorySlug)
  if (!category) return notFoundMetadata()
  const filtered = Boolean(difficulty) || Boolean(equipment) || Boolean(sub)
  const title = `${category.name} recipes, techniques and tutorials`
  const description =
    category.description ??
    `Browse every published ${category.name.toLowerCase()} tutorial on Homemade.`
  return buildPublicMetadata({
    title,
    description,
    path: `/${categorySlug}`,
    ogType: 'website',
    index: !filtered,
  })
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { categorySlug } = await params
  const sp = await searchParams
  const difficulty = parseDifficulty(sp.difficulty)
  const equipment = parseEquipment(sp.equipment)
  const subSlug = sp.sub ?? null

  const category = await loadCategory(categorySlug)
  if (!category) notFound()

  const subCategory = subSlug
    ? category.subCategories.find((s) => s.slug === subSlug) ?? null
    : null
  // Unknown sub slug — render as unfiltered rather than 404.
  const activeSubSlug = subCategory ? subCategory.slug : null

  const isFiltered = Boolean(difficulty) || Boolean(equipment) || Boolean(activeSubSlug)
  const showEquipmentFilters =
    category.slug === 'pottery-ceramics' ||
    category.subCategories.some(() => false) // future: extend if other crafts gain the flags

  const equipmentWhere =
    equipment === 'none'
      ? { requiresKiln: false, requiresWheel: false }
      : equipment === 'no-kiln'
        ? { requiresKiln: false }
        : equipment === 'no-wheel'
          ? { requiresWheel: false }
          : {}

  const preserveQuery: Record<string, string> = {}
  if (difficulty) preserveQuery.difficulty = difficulty.toLowerCase()
  if (equipment) preserveQuery.equipment = equipment

  const preserveQueryWithSub: Record<string, string> = { ...preserveQuery }
  if (activeSubSlug) preserveQueryWithSub.sub = activeSubSlug

  const [currentUser, countryCode, recentlyMade] = await Promise.all([
    getCurrentDbUser(),
    readCountryCode(),
    loadRecentlyMade({ limit: 10, categorySlug: category.slug }),
  ])

  // Branch on whether any filter is active. Unfiltered = section-anchored
  // rails per sub-category. Filtered = single grid of matching tutorials.
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
        ...equipmentWhere,
      },
      orderBy: [{ publishedAt: 'desc' }],
      select: CARD_SELECT,
    })
    filteredTutorials = tutorials as TutorialCardLike[]
  } else {
    // Top 8 most-loved per sub-category, in canonical sub-category order.
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

  // Reader state across every tutorial id rendered on the page.
  const allIds = new Set<string>()
  for (const t of filteredTutorials) allIds.add(t.id)
  for (const r of unfilteredRails) for (const t of r.tutorials) allIds.add(t.id)
  for (const t of inSeasonForCategory) allIds.add(t.id)
  const readerState = currentUser
    ? await loadReaderState(currentUser.id, Array.from(allIds))
    : emptyReaderState()

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: category.name, href: `/${category.slug}` },
  ]
  const collectionSchema = buildCollectionPageSchema({
    url: `/${category.slug}`,
    name: category.name,
    description: category.description,
    items: (isFiltered ? filteredTutorials : unfilteredRails.flatMap((r) => r.tutorials)).map(
      (t) => ({ name: t.title, url: `/${category.slug}/${t.slug}` }),
    ),
  })
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs)

  return (
    <div className="category-page">
      <JsonLd data={[collectionSchema, breadcrumbSchema]} />

      <CategoryHero category={category} />

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
            showEquipment={showEquipmentFilters}
            activeDifficulty={difficulty}
            activeEquipment={equipment}
            preserveQuery={
              activeSubSlug ? { ...preserveQuery, sub: activeSubSlug } : preserveQuery
            }
          />
        </div>
      )}

      {recentlyMade.length > 0 && !isFiltered && (
        <RecentlyMadeRail
          heading={`Recent makes in ${category.name.toLowerCase()}`}
          tiles={recentlyMade}
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
