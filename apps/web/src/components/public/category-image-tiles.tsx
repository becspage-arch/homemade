import 'server-only'
import Link from 'next/link'
import { prisma, TutorialStatus } from '@homemade/db'
import { mediaSrcSet } from '@/lib/media'

import './home-cards/home-cards.css'

interface CategoryRow {
  slug: string
  name: string
  description: string | null
}

/**
 * "Browse all categories" image grid. Replaces the previous parchment-
 * tile grid with image-driven cards: a category-hero photo (sourced
 * from the category's most-loved published tutorial), category name
 * overlaid bottom-left in cream Fraunces, and a one-line description
 * beneath the image for orientation (Decision 4 locked 2026-05-25).
 *
 * The hero photo lookup runs once per page render. Cheap: one
 * `findFirst` per category, all in parallel.
 */
export async function CategoryImageTiles({
  categories,
}: {
  categories: CategoryRow[]
}) {
  if (categories.length === 0) return null

  // Pull one hero photo per category — the most-loved published
  // tutorial whose hero is a real photo (not a procedural fallback).
  const heroByCategory = await loadCategoryHeroes(categories.map((c) => c.slug))

  return (
    <section className="home-all-categories">
      <header className="home-rail-header">
        <h2 className="home-rail-heading">Browse all categories</h2>
      </header>
      <div className="home-categories-image-grid">
        {categories.map((cat) => {
          const heroMedia = heroByCategory.get(cat.slug) ?? null
          const card = heroMedia
            ? mediaSrcSet(heroMedia, 'card', ['public'])
            : null
          return (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="home-category-image-tile"
            >
              <span className="home-category-image-card">
                {card ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.src}
                    srcSet={card.srcSet}
                    sizes="(min-width: 900px) 22vw, 50vw"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span aria-hidden="true" />
                )}
                <span className="home-category-image-overlay">{cat.name}</span>
              </span>
              {cat.description && (
                <span className="home-category-image-description">
                  {cat.description}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}

async function loadCategoryHeroes(
  categorySlugs: string[],
): Promise<Map<string, { r2Key: string | null; cloudflareId: string | null }>> {
  const rows = await Promise.all(
    categorySlugs.map((slug) =>
      prisma.tutorial.findFirst({
        where: {
          status: TutorialStatus.PUBLISHED,
          category: { slug },
          hero: { isNot: null },
          heroImageStrategy: { not: 'PROCEDURAL_CARD' },
        },
        orderBy: [
          { heroQuality: 'asc' }, // EDITORIAL sorts first alphabetically
          { bookmarks: { _count: 'desc' } },
          { projects: { _count: 'desc' } },
          { publishedAt: 'desc' },
        ],
        select: {
          hero: { select: { r2Key: true, cloudflareId: true } },
          category: { select: { slug: true } },
        },
      }),
    ),
  )
  const map = new Map<
    string,
    { r2Key: string | null; cloudflareId: string | null }
  >()
  for (const row of rows) {
    if (row?.hero) map.set(row.category.slug, row.hero)
  }
  return map
}
