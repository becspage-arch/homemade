import 'server-only'
import { prisma, TutorialStatus, Visibility } from '@homemade/db'
import { mediaSrcSet } from '@/lib/media'

interface GroupHeroProps {
  /** Pre-fetched hero media (use a Tutorial.hero or a Pattern.hero). */
  heroMedia: { cloudflareId: string | null; r2Key: string | null; alt?: string | null } | null
  eyebrow: string
  title: string
  lede: string
}

/**
 * Group-landing hero. Full-bleed photograph with a sage scrim and
 * editorial-register text block bottom-left. Matches the homepage
 * .home-hero-feature register so the brand reads consistently from
 * the homepage through each group landing.
 *
 * No CTA on the hero itself — the section bands below are the action
 * surface, identical to how CategoryHero behaves on /[categorySlug].
 */
export function GroupHero({ heroMedia, eyebrow, title, lede }: GroupHeroProps) {
  const card = heroMedia ? mediaSrcSet(heroMedia, 'hero', ['public']) : null
  return (
    <section className="group-landing-hero-zone">
      <div className="home-hero-feature group-landing-hero">
        <span className="home-hero-image-wrap">
          {card && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="home-hero-image"
              src={card.src}
              srcSet={card.srcSet}
              sizes="100vw"
              alt={heroMedia?.alt ?? ''}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          )}
        </span>
        <div className="home-hero-overlay">
          <div className="home-hero-text">
            <span className="home-hero-overline">{eyebrow}</span>
            <h1 className="home-hero-title">{title}</h1>
            <p className="home-hero-excerpt">{lede}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Pick a hero photo for a group landing. Strategy: first try the most
 * recently-published EDITORIAL-quality tutorial hero across any of the
 * group's categories. Fall back to the most-loved tutorial regardless
 * of hero quality. Returns null if nothing has a hero photo at all
 * (the GroupHero then renders text-only on the sage band).
 */
export async function loadGroupHeroMedia(
  categorySlugs: string[],
): Promise<{ cloudflareId: string | null; r2Key: string | null; alt?: string | null } | null> {
  const editorial = await prisma.tutorial.findFirst({
    where: {
      category: { slug: { in: categorySlugs } },
      status: TutorialStatus.PUBLISHED,
      hero: { isNot: null },
      heroQuality: 'EDITORIAL',
      heroImageStrategy: { not: 'PROCEDURAL_CARD' },
    },
    orderBy: [
      { bookmarks: { _count: 'desc' } },
      { publishedAt: 'desc' },
    ],
    select: {
      hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
    },
  })
  if (editorial?.hero) return editorial.hero

  const anyHero = await prisma.tutorial.findFirst({
    where: {
      category: { slug: { in: categorySlugs } },
      status: TutorialStatus.PUBLISHED,
      hero: { isNot: null },
      heroImageStrategy: { not: 'PROCEDURAL_CARD' },
    },
    orderBy: [
      { bookmarks: { _count: 'desc' } },
      { publishedAt: 'desc' },
    ],
    select: {
      hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
    },
  })
  if (anyHero?.hero) return anyHero.hero

  // Pattern categories — fall back to a pattern hero.
  const pattern = await prisma.pattern.findFirst({
    where: {
      subCategory: { category: { slug: { in: categorySlugs } } },
      ownerUserId: null,
      visibility: Visibility.PUBLIC,
      publishedAt: { not: null },
      hero: { isNot: null },
    },
    orderBy: { publishedAt: 'desc' },
    select: {
      hero: { select: { cloudflareId: true, r2Key: true } },
    },
  })
  if (pattern?.hero) return { ...pattern.hero, alt: null }

  return null
}
