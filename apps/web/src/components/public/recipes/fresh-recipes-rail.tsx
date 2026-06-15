import Link from 'next/link'
import { prisma, TutorialStatus } from '@homemade/db'
import { mediaUrl } from '@/lib/media'

import './community-recipes-rail.css'

/**
 * "Fresh in {category}" — the most recently published library recipes in a
 * category. Stands in for the "recipes you might like" rail until a real
 * recommendation engine exists: every other rail on the page is
 * popularity-first (magazine, quick wins, sub-rails), so newest-first surfaces
 * the long tail those bury. Reuses the community-rail card styling.
 *
 * Renders nothing when the category has fewer than a railful of recipes (the
 * other rails already cover a small category).
 */
export async function FreshRecipesRail({
  categoryId,
  categorySlug,
  categoryName,
}: {
  categoryId: string
  categorySlug: string
  categoryName: string
}) {
  const recipes = await prisma.tutorial.findMany({
    where: { categoryId, status: TutorialStatus.PUBLISHED },
    orderBy: { publishedAt: 'desc' },
    take: 10,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      hero: { select: { r2Key: true, cloudflareId: true } },
    },
  })

  if (recipes.length < 6) return null

  return (
    <section className="community-rail" aria-label={`Fresh in ${categoryName.toLowerCase()}`}>
      <div className="community-rail-head">
        <h2 className="community-rail-title">Fresh in {categoryName.toLowerCase()}</h2>
        <p className="community-rail-lede">The most recently added recipes.</p>
      </div>
      <div className="community-rail-track">
        {recipes.map((r) => {
          const src = r.hero ? mediaUrl(r.hero, 'card') : null
          return (
            <Link key={r.id} href={`/${categorySlug}/${r.slug}`} className="community-card">
              <span className="community-card-media">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={r.title} loading="lazy" />
                ) : (
                  <span className="community-card-placeholder" aria-hidden="true" />
                )}
              </span>
              <span className="community-card-title">{r.title}</span>
              {r.excerpt && <span className="community-card-summary">{r.excerpt}</span>}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
