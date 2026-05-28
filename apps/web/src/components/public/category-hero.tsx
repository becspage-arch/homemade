import 'server-only'
import { prisma, TutorialStatus } from '@homemade/db'
import { HeroOverlay } from './home-cards/hero-overlay'

interface CategoryHeroProps {
  category: {
    id: string
    slug: string
    name: string
    description: string | null
  }
}

/**
 * Category page hero. Loads the category's most-loved published
 * tutorial and uses its hero photo as the background. Renders the
 * category name + description in the sage scrim that the homepage hero
 * already established. Half the height of the homepage hero — this is
 * a section header, not the main marquee.
 *
 * No CTA: the chips and grid below are the action surface.
 *
 * The href on the overlay points to the category page itself so the
 * tap target stays meaningful (Pinterest behaviour — image click
 * doesn't do nothing).
 */
export async function CategoryHero({ category }: CategoryHeroProps) {
  const anchor = await prisma.tutorial.findFirst({
    where: {
      categoryId: category.id,
      status: TutorialStatus.PUBLISHED,
      hero: { isNot: null },
      heroImageStrategy: { not: 'PROCEDURAL_CARD' },
    },
    orderBy: [
      { heroQuality: 'asc' },
      { bookmarks: { _count: 'desc' } },
      { projects: { _count: 'desc' } },
      { publishedAt: 'desc' },
    ],
    select: {
      hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
    },
  })

  return (
    <section className="category-hero-zone">
      <HeroOverlay
        href={`/${category.slug}`}
        imageMedia={anchor?.hero ?? null}
        title={category.name}
        excerpt={category.description}
        ctaLabel=""
      />
    </section>
  )
}
