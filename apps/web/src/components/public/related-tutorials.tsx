import Link from 'next/link'
import { prisma, TutorialStatus } from '@homemade/db'
import { tutorialHeroSrc } from '@/lib/tutorial-hero'

import './related-tutorials.css'

type HeroStrategyLike =
  | 'UNSET'
  | 'PROCEDURAL_CARD'
  | 'PUBLIC_DOMAIN_PLATE'
  | 'REAL_PHOTO'
  | 'AI_GENERATED'

interface RelatedTutorialsProps {
  currentTutorialId: string
  categoryId: string
  subCategoryId: string | null
  techniqueSlugs: string[]
  /** Caps the rail; the schema rail uses 6 by default. */
  limit?: number
}

/**
 * Internal-linking spoke → spoke rail rendered below each tutorial body.
 * Selection priority (each candidate is pulled once, then deduped):
 *   1. shared technique slugs (most signal)
 *   2. same subcategory
 *   3. same category fallback
 * Keeps the rail full at `limit` items even on tutorials with no
 * technique slugs by falling through to the broader buckets.
 */
export async function RelatedTutorials({
  currentTutorialId,
  categoryId,
  subCategoryId,
  techniqueSlugs,
  limit = 6,
}: RelatedTutorialsProps) {
  const baseWhere = {
    id: { not: currentTutorialId },
    status: TutorialStatus.PUBLISHED,
  } as const

  const seen = new Set<string>()
  const picks: Array<{
    id: string
    slug: string
    title: string
    excerpt: string | null
    category: { slug: string; name: string }
    hero: { cloudflareId: string | null; r2Key: string | null } | null
    heroImageStrategy: HeroStrategyLike
  }> = []

  function take(list: typeof picks) {
    for (const t of list) {
      if (seen.has(t.id)) continue
      seen.add(t.id)
      picks.push(t)
      if (picks.length >= limit) return true
    }
    return false
  }

  if (techniqueSlugs.length > 0) {
    const byTechnique = await prisma.tutorial.findMany({
      where: {
        ...baseWhere,
        techniqueSlugs: { hasSome: techniqueSlugs },
      },
      orderBy: [{ publishedAt: 'desc' }],
      take: limit,
      select: relatedSelect(),
    })
    if (take(byTechnique)) return renderRail(picks)
  }

  if (subCategoryId) {
    const bySub = await prisma.tutorial.findMany({
      where: { ...baseWhere, subCategoryId },
      orderBy: [{ publishedAt: 'desc' }],
      take: limit,
      select: relatedSelect(),
    })
    if (take(bySub)) return renderRail(picks)
  }

  const byCategory = await prisma.tutorial.findMany({
    where: { ...baseWhere, categoryId },
    orderBy: [{ publishedAt: 'desc' }],
    take: limit,
    select: relatedSelect(),
  })
  take(byCategory)

  return renderRail(picks)
}

function relatedSelect() {
  return {
    id: true,
    slug: true,
    title: true,
    excerpt: true,
    heroImageStrategy: true,
    category: { select: { slug: true, name: true } },
    hero: { select: { cloudflareId: true, r2Key: true } },
  } as const
}

function renderRail(picks: Array<{
  id: string
  slug: string
  title: string
  excerpt: string | null
  category: { slug: string; name: string }
  hero: { cloudflareId: string | null; r2Key: string | null } | null
}>) {
  if (picks.length === 0) return null
  return (
    <aside className="related-tutorials" aria-labelledby="related-tutorials-heading">
      <h2 id="related-tutorials-heading" className="related-tutorials-heading">
        What to make next
      </h2>
      <ul className="related-tutorials-list">
        {picks.map((t) => {
          const card = tutorialHeroSrc(t, 'card', ['public'])
          return (
            <li key={t.id} className="related-tutorials-item">
              <Link
                href={`/${t.category.slug}/${t.slug}` as never}
                className="related-tutorials-link"
              >
                <span className="related-tutorials-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.src}
                    srcSet={card.srcSet}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="related-tutorials-body">
                  <span className="related-tutorials-eyebrow">
                    {t.category.name}
                  </span>
                  <span className="related-tutorials-title">{t.title}</span>
                  {t.excerpt && (
                    <span className="related-tutorials-excerpt">{t.excerpt}</span>
                  )}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
