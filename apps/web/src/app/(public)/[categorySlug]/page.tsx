import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma, TutorialStatus, Difficulty } from '@homemade/db'
import { TutorialCard } from '@/components/public/tutorial-card'
import { RecentlyMadeRail } from '@/components/public/recently-made-rail'
import { Breadcrumbs } from '@/components/public/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { mediaSrcSet } from '@/lib/media'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { loadRecentlyMade } from '@/lib/recently-made'
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

interface PageProps {
  params: Promise<{ categorySlug: string }>
  searchParams: Promise<{ difficulty?: string; equipment?: string }>
}

const loadCategory = cache(async (slug: string) => {
  // Public category pages 404 for `isPublicVisible: false` rows — admin and
  // worker scripts use the unfiltered helper. The auto-flip on 10 published
  // tutorials promotes a category here automatically.
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

// Equipment-barrier filter (Pottery + future kiln/wheel-bearing crafts).
//   'none'       — only tutorials needing neither a kiln nor a wheel.
//   'no-kiln'    — hide kiln-only tutorials; allow wheel-only.
//   'no-wheel'   — hide wheel-only tutorials; allow kiln-only.
// All other values fall through to no filter.
type EquipmentFilter = 'none' | 'no-kiln' | 'no-wheel' | null

function parseEquipment(raw: string | undefined): EquipmentFilter {
  if (raw === 'none' || raw === 'no-kiln' || raw === 'no-wheel') return raw
  return null
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params
  const { difficulty, equipment } = await searchParams
  const category = await loadCategory(categorySlug)
  if (!category) return notFoundMetadata()
  const filtered = Boolean(difficulty) || Boolean(equipment)
  const title = `${category.name} recipes, techniques and tutorials`
  const description =
    category.description
      ? category.description
      : `Browse every published ${category.name.toLowerCase()} tutorial on Homemade.`
  return buildPublicMetadata({
    title,
    description,
    path: `/${categorySlug}`,
    ogType: 'website',
    // Filtered / query-paginated views consolidate to the canonical unfiltered
    // category URL — `buildPublicMetadata` always sets the canonical to the
    // path passed in, so the filtered view's canonical points at `/{slug}`.
    index: !filtered,
  })
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { categorySlug } = await params
  const { difficulty: difficultyRaw, equipment: equipmentRaw } = await searchParams
  const difficulty = parseDifficulty(difficultyRaw)
  const equipment = parseEquipment(equipmentRaw)

  const category = await loadCategory(categorySlug)
  if (!category) notFound()

  // Equipment-barrier filter is only meaningful for craft categories whose
  // tutorials carry the `requiresKiln` / `requiresWheel` flags. Today that
  // is pottery-ceramics; future kiln-bearing or wheel-bearing crafts pick
  // it up automatically by setting the flags on their tutorial rows.
  const equipmentWhere =
    equipment === 'none'
      ? { requiresKiln: false, requiresWheel: false }
      : equipment === 'no-kiln'
        ? { requiresKiln: false }
        : equipment === 'no-wheel'
          ? { requiresWheel: false }
          : {}

  const [tutorials, currentUser, recentlyMade] = await Promise.all([
    prisma.tutorial.findMany({
      where: {
        categoryId: category.id,
        status: TutorialStatus.PUBLISHED,
        ...(difficulty ? { difficulty } : {}),
        ...equipmentWhere,
      },
      orderBy: [{ publishedAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        difficulty: true,
        season: true,
        subCategoryId: true,
        requiresKiln: true,
        requiresWheel: true,
        hero: { select: { cloudflareId: true, r2Key: true } },
      },
    }),
    getCurrentDbUser(),
    loadRecentlyMade({ limit: 10, categorySlug: category.slug }),
  ])

  const readerState = currentUser
    ? await loadReaderState(
        currentUser.id,
        tutorials.map((t) => t.id),
      )
    : emptyReaderState()

  const grouped = new Map<string | null, typeof tutorials>()
  for (const t of tutorials) {
    const key = t.subCategoryId
    const existing = grouped.get(key)
    if (existing) existing.push(t)
    else grouped.set(key, [t])
  }

  const subCategoriesById = new Map(
    category.subCategories.map((s) => [s.id, s] as const),
  )

  const orderedKeys: (string | null)[] = [
    ...category.subCategories
      .map((s) => s.id)
      .filter((id): id is string => grouped.has(id)),
    ...(grouped.has(null) ? [null] : []),
  ]

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: category.name, href: `/${category.slug}` },
  ]
  const collectionSchema = buildCollectionPageSchema({
    url: `/${category.slug}`,
    name: category.name,
    description: category.description,
    items: tutorials.map((t) => ({
      name: t.title,
      url: `/${category.slug}/${t.slug}`,
    })),
  })
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs)

  return (
    <div className="category-page">
      <JsonLd data={[collectionSchema, breadcrumbSchema]} />
      <Breadcrumbs items={breadcrumbs} />
      <header className="category-header">
        <span className="category-eyebrow">Category</span>
        <h1 className="category-title">{category.name}</h1>
        {category.description && (
          <p className="category-description">{category.description}</p>
        )}
        {difficulty && (
          <p className="category-filter-note">
            Showing {difficulty.toLowerCase()} tutorials only ·{' '}
            <a href={`/${category.slug}`}>show all</a>
          </p>
        )}
        {equipment && (
          <p className="category-filter-note">
            {equipment === 'none'
              ? 'Showing tutorials needing neither a kiln nor a wheel.'
              : equipment === 'no-kiln'
                ? 'Hiding tutorials that need a kiln.'
                : 'Hiding tutorials that need a wheel.'}{' '}
            <a href={`/${category.slug}`}>show all</a>
          </p>
        )}
        {category.slug === 'pottery-ceramics' && !equipment && (
          <nav className="category-equipment-filter" aria-label="Equipment filter">
            <a
              href={`/${category.slug}?equipment=none`}
              className="category-equipment-filter-link"
            >
              No kiln, no wheel
            </a>
            <a
              href={`/${category.slug}?equipment=no-kiln`}
              className="category-equipment-filter-link"
            >
              No kiln
            </a>
            <a
              href={`/${category.slug}?equipment=no-wheel`}
              className="category-equipment-filter-link"
            >
              No wheel
            </a>
          </nav>
        )}
      </header>

      {recentlyMade.length > 0 && (
        <RecentlyMadeRail
          heading={`Recent makes in ${category.name.toLowerCase()}`}
          tiles={recentlyMade}
        />
      )}

      {tutorials.length === 0 ? (
        <p className="category-empty">
          {equipment
            ? `No tutorials in ${category.name.toLowerCase()} match that equipment filter yet.`
            : difficulty
              ? `No ${difficulty.toLowerCase()} tutorials in ${category.name.toLowerCase()} yet.`
              : `Nothing published in ${category.name.toLowerCase()} just yet. New tutorials are added each week.`}
        </p>
      ) : (
        orderedKeys.map((key) => {
          const items = grouped.get(key) ?? []
          const subCat = key ? subCategoriesById.get(key) : null
          return (
            <section key={key ?? '__none'} className="category-section">
              {subCat ? (
                <header className="category-section-header">
                  <h2 className="category-section-title">{subCat.name}</h2>
                  {subCat.description && (
                    <p className="category-section-description">
                      {subCat.description}
                    </p>
                  )}
                </header>
              ) : (
                <header className="category-section-header">
                  <h2 className="category-section-title">More in {category.name}</h2>
                </header>
              )}
              <div className="category-grid">
                {items.map((t) => {
                  const card = mediaSrcSet(t.hero, 'card', ['public'])
                  return (
                    <TutorialCard
                      key={t.id}
                      href={`/${category.slug}/${t.slug}`}
                      title={t.title}
                      excerpt={t.excerpt}
                      heroUrl={card?.src ?? null}
                      heroSrcSet={card?.srcSet}
                      difficulty={t.difficulty}
                      season={t.season}
                      requiresKiln={t.requiresKiln}
                      requiresWheel={t.requiresWheel}
                      state={readerStateFor(readerState, t.id)}
                    />
                  )
                })}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
