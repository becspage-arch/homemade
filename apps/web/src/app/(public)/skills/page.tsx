import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma, TutorialStatus } from '@homemade/db'
import { JsonLd } from '@/components/seo/json-ld'
import { GroupHero, loadGroupHeroMedia } from '@/components/public/group-landing/group-hero'
import { CategoryPreviewSection } from '@/components/public/group-landing/category-preview-section'
import { FoundationsPath } from '@/components/public/category/foundations-path'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { GROUP_CONFIGS } from '@/lib/nav-groups'
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from '@/lib/seo/schema-builders'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import {
  emptyReaderState,
  loadReaderState,
} from '@/lib/user-state'

import '@/components/public/group-landing/group-landing.css'
import '@/components/public/category/category-shared.css'

export const dynamic = 'force-dynamic'

const GROUP = GROUP_CONFIGS.skills
const PREVIEW_PER_CATEGORY = 6

export const metadata: Metadata = buildPublicMetadata({
  title: 'Skills — learn a craft from the ground up',
  description:
    'Wood and willow, clay and glaze, paper and ink. Slow craft skills taught in plain language, with the foundation tutorials you need to begin.',
  path: '/skills',
  ogType: 'website',
})

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
} as const

export default async function SkillsLandingPage() {
  const categories = await prisma.category.findMany({
    where: {
      slug: { in: GROUP.categorySlugs },
      isPublicVisible: true,
    },
    select: { id: true, slug: true, name: true, description: true },
  })

  const [heroMedia, currentUser, perCategoryResults, foundations] = await Promise.all([
    loadGroupHeroMedia(GROUP.categorySlugs),
    getCurrentDbUser(),
    Promise.all(
      categories.map((c) =>
        prisma.tutorial.findMany({
          where: {
            categoryId: c.id,
            status: TutorialStatus.PUBLISHED,
          },
          orderBy: [
            { bookmarks: { _count: 'desc' } },
            { projects: { _count: 'desc' } },
            { publishedAt: 'desc' },
          ],
          take: PREVIEW_PER_CATEGORY,
          select: CARD_SELECT,
        }),
      ),
    ),
    prisma.tutorial.findMany({
      where: {
        category: { slug: { in: GROUP.categorySlugs } },
        status: TutorialStatus.PUBLISHED,
        foundational: true,
      },
      orderBy: [{ publishedAt: 'asc' }],
      take: 8,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        difficulty: true,
        category: { select: { slug: true, name: true } },
        hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
      },
    }),
  ])

  const previews = categories.map((c, i) => ({
    category: c,
    tutorials: (perCategoryResults[i] ?? []) as TutorialCard[],
  }))

  const allIds = new Set<string>()
  for (const p of previews) for (const t of p.tutorials) allIds.add(t.id)
  for (const f of foundations) allIds.add(f.id)
  const readerState = currentUser
    ? await loadReaderState(currentUser.id, Array.from(allIds))
    : emptyReaderState()

  const orderedPreviews = GROUP.categorySlugs
    .map((slug) => previews.find((p) => p.category.slug === slug))
    .filter(
      (p): p is { category: typeof categories[number]; tutorials: TutorialCard[] } =>
        p !== undefined,
    )

  const collectionSchema = buildCollectionPageSchema({
    url: '/skills',
    name: 'Skills — Homemade',
    description: GROUP.lede,
    items: previews.flatMap((p) =>
      p.tutorials.map((t) => ({
        name: t.title,
        url: `/${p.category.slug}/${t.slug}`,
      })),
    ),
  })
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Skills', href: '/skills' },
  ])

  return (
    <div className="group-landing">
      <JsonLd data={[collectionSchema, breadcrumbSchema]} />

      <GroupHero
        heroMedia={heroMedia}
        eyebrow="Skills"
        title={GROUP.title}
        lede={GROUP.lede}
      />

      <section className="group-landing-intro" aria-label="Introduction">
        <div>
          <p className="group-landing-intro-eyebrow">What you&apos;ll find</p>
          <h2 className="group-landing-intro-headline">
            Slow crafts, taught well.
          </h2>
        </div>
        <p className="group-landing-intro-body">
          Wood and natural-craft work, paper and word craft, and pottery
          and ceramics. Each discipline is taught from the foundations
          up. If you have never picked up a knife, a press, or a piece
          of clay, you will leave knowing where to start.
        </p>
      </section>

      {foundations.length > 0 && (
        <FoundationsPath
          heading="Start here"
          subheading="Foundation skills that cross every craft below."
          steps={foundations.map((f) => ({
            id: f.id,
            slug: f.slug,
            title: f.title,
            excerpt: f.excerpt,
            difficulty: f.difficulty,
            category: f.category,
            hero: f.hero,
          }))}
        />
      )}

      {orderedPreviews.map(({ category, tutorials }) => (
        <CategoryPreviewSection
          key={category.id}
          category={category}
          tutorials={tutorials.map((t) => ({
            ...t,
            category: { slug: category.slug, name: category.name },
          }))}
          readerState={readerState}
        />
      ))}

      <footer className="group-landing-intro" aria-label="More skills">
        <div>
          <p className="group-landing-intro-eyebrow">Pick a discipline</p>
          <h2 className="group-landing-intro-headline">
            Or go straight to one.
          </h2>
        </div>
        <div>
          <p className="group-landing-intro-body">
            Each discipline has its own landing page with sub-categories,
            tool axis, and the full tutorial library.
          </p>
          <div className="group-landing-feature-actions" style={{ marginTop: 16 }}>
            {orderedPreviews.map(({ category }) => (
              <Link
                key={category.slug}
                href={`/${category.slug}`}
                className="group-landing-feature-action ghost"
              >
                {category.name} →
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

interface TutorialCard {
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
  publishedAt: Date | null
}
