import 'server-only'
import Link from 'next/link'
import { prisma, TutorialStatus, CategoryArchetype, Visibility } from '@homemade/db'
import { mediaSrcSet } from '@/lib/media'

import './home-cards/home-cards.css'

interface CategoryRow {
  slug: string
  name: string
  description: string | null
}

type TileMedia = { r2Key: string | null; cloudflareId: string | null }

/**
 * "Browse all categories" image grid. Image-driven cards: a category tile
 * image, category name overlaid bottom-left in cream Fraunces, and a one-line
 * description beneath the image for orientation (Decision 4 locked 2026-05-25).
 *
 * Tile image resolution (per category, all in parallel):
 *   1. Category.tileImageMediaId — a deliberate, hand-picked override.
 *   2. Pattern-craft categories (archetype PATTERN) — the most-popular
 *      published pattern's image, so a cross-stitch tile shows an actual chart
 *      render rather than a stock technique photo a tutorial happened to carry.
 *   3. Everything else — the most-loved published tutorial's real photo.
 */
export async function CategoryImageTiles({
  categories,
}: {
  categories: CategoryRow[]
}) {
  if (categories.length === 0) return null

  const heroByCategory = await loadCategoryTiles(categories.map((c) => c.slug))

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

async function loadCategoryTiles(
  categorySlugs: string[],
): Promise<Map<string, TileMedia>> {
  const map = new Map<string, TileMedia>()

  // One query for the categories' archetype + deliberate tile-image override.
  const cats = await prisma.category.findMany({
    where: { slug: { in: categorySlugs } },
    select: {
      slug: true,
      archetype: true,
      tileImage: { select: { r2Key: true, cloudflareId: true } },
    },
  })
  const archetypeBySlug = new Map<string, CategoryArchetype>()
  const needsDerived: string[] = []
  for (const c of cats) {
    archetypeBySlug.set(c.slug, c.archetype)
    if (c.tileImage) {
      // 1. Deliberate override wins.
      map.set(c.slug, c.tileImage)
    } else {
      needsDerived.push(c.slug)
    }
  }

  // Derive a tile for the rest. Pattern crafts pull from their pattern
  // catalogue (a real chart render); everything else from a tutorial photo.
  await Promise.all(
    needsDerived.map(async (slug) => {
      if (archetypeBySlug.get(slug) === CategoryArchetype.PATTERN) {
        const pattern = await prisma.pattern.findFirst({
          where: {
            visibility: Visibility.PUBLIC,
            publishedAt: { not: null },
            subCategory: { category: { slug } },
            OR: [
              { heroMediaId: { not: null } },
              { thumbnailMediaId: { not: null } },
            ],
          },
          orderBy: [{ popularityScore: 'desc' }, { publishedAt: 'desc' }],
          select: {
            hero: { select: { r2Key: true, cloudflareId: true } },
            thumbnail: { select: { r2Key: true, cloudflareId: true } },
          },
        })
        const media = pattern?.hero ?? pattern?.thumbnail
        if (media) {
          map.set(slug, media)
          return
        }
        // Fall through to the tutorial photo if the catalogue is empty.
      }

      const tutorial = await prisma.tutorial.findFirst({
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
        select: { hero: { select: { r2Key: true, cloudflareId: true } } },
      })
      if (tutorial?.hero) map.set(slug, tutorial.hero)
    }),
  )

  return map
}
