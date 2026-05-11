import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma, TutorialStatus, Difficulty } from '@homemade/db'
import { TutorialCard } from '@/components/public/tutorial-card'
import { mediaUrl } from '@/lib/media'
import { getCurrentDbUser } from '@/lib/get-current-user'
import {
  emptyReaderState,
  loadReaderState,
  readerStateFor,
} from '@/lib/user-state'

import './category-page.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ categorySlug: string }>
  searchParams: Promise<{ difficulty?: string }>
}

async function loadCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      subCategories: { orderBy: [{ order: 'asc' }, { name: 'asc' }] },
    },
  })
}

function parseDifficulty(raw: string | undefined): Difficulty | null {
  if (!raw) return null
  const upper = raw.toUpperCase()
  if (upper === 'BEGINNER' || upper === 'INTERMEDIATE' || upper === 'ADVANCED') {
    return upper as Difficulty
  }
  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params
  const category = await loadCategory(categorySlug)
  if (!category) return { title: 'Not found · homemade' }
  return {
    title: `${category.name} · homemade`,
    description: category.description ?? undefined,
    robots: { index: false, follow: false },
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { categorySlug } = await params
  const { difficulty: difficultyRaw } = await searchParams
  const difficulty = parseDifficulty(difficultyRaw)

  const category = await loadCategory(categorySlug)
  if (!category) notFound()

  const [tutorials, currentUser] = await Promise.all([
    prisma.tutorial.findMany({
      where: {
        categoryId: category.id,
        status: TutorialStatus.PUBLISHED,
        ...(difficulty ? { difficulty } : {}),
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
        hero: { select: { cloudflareId: true, r2Key: true } },
      },
    }),
    getCurrentDbUser(),
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

  return (
    <div className="category-page">
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
      </header>

      {tutorials.length === 0 ? (
        <p className="category-empty">
          {difficulty
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
                {items.map((t) => (
                  <TutorialCard
                    key={t.id}
                    href={`/${category.slug}/${t.slug}`}
                    title={t.title}
                    excerpt={t.excerpt}
                    heroUrl={mediaUrl(t.hero, 'card')}
                    difficulty={t.difficulty}
                    season={t.season}
                    state={readerStateFor(readerState, t.id)}
                  />
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
