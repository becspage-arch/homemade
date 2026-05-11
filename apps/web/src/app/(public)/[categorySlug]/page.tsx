import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma, TutorialStatus } from '@homemade/db'
import { TutorialCard } from '@/components/public/tutorial-card'
import { cloudflareDeliveryUrl } from '@/lib/media'

import './category-page.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ categorySlug: string }>
}

async function loadCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      subCategories: { orderBy: [{ order: 'asc' }, { name: 'asc' }] },
    },
  })
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

export default async function CategoryPage({ params }: PageProps) {
  const { categorySlug } = await params
  const category = await loadCategory(categorySlug)
  if (!category) notFound()

  const tutorials = await prisma.tutorial.findMany({
    where: {
      categoryId: category.id,
      status: TutorialStatus.PUBLISHED,
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
      hero: { select: { cloudflareId: true } },
    },
  })

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

  // Render sub-category groups in declared order, then any unassigned at the end.
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
      </header>

      {tutorials.length === 0 ? (
        <p className="category-empty">
          Nothing published in {category.name.toLowerCase()} just yet. New
          tutorials are added each week.
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
                    heroUrl={cloudflareDeliveryUrl(t.hero?.cloudflareId, 'card')}
                    difficulty={t.difficulty}
                    season={t.season}
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
