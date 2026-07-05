import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma, TutorialStatus, Visibility } from '@homemade/db'
import { JsonLd } from '@/components/seo/json-ld'
import { GroupHero, loadGroupHeroMedia } from '@/components/public/group-landing/group-hero'
import { CategoryPreviewSection } from '@/components/public/group-landing/category-preview-section'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { GROUP_CONFIGS } from '@/lib/nav-groups'
import { patternHeroUrl } from '@/lib/studio/pattern-hero'
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from '@/lib/seo/schema-builders'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import { emptyReaderState, loadReaderState } from '@/lib/user-state'

import '@/components/public/group-landing/group-landing.css'

export const dynamic = 'force-dynamic'

const GROUP = GROUP_CONFIGS.make
const PREVIEW_PER_CATEGORY = 6

export const metadata: Metadata = buildPublicMetadata({
  title: 'Make — patterns and projects from independent designers',
  description:
    'Cross-stitch, knitting, crochet, sewing and fibre arts. Designed patterns from independent makers and the Studio to open them in.',
  path: '/make',
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

export default async function MakeLandingPage() {
  const categories = await prisma.category.findMany({
    where: {
      slug: { in: GROUP.categorySlugs },
      isPublicVisible: true,
    },
    select: { id: true, slug: true, name: true, description: true },
  })

  const [heroMedia, currentUser, perCategoryResults, featuredPatterns] = await Promise.all([
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
    prisma.pattern.findMany({
      where: {
        ownerUserId: null,
        visibility: Visibility.PUBLIC,
        publishedAt: { not: null },
        hero: { isNot: null },
        subCategory: {
          category: { slug: { in: GROUP.categorySlugs } },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      select: {
        id: true,
        slug: true,
        name: true,
        hero: { select: { cloudflareId: true, r2Key: true } },
        subCategory: {
          select: { category: { select: { slug: true } } },
        },
      },
    }),
  ])

  const previews = categories.map((c, i) => ({
    category: c,
    tutorials: (perCategoryResults[i] ?? []) as TutorialCard[],
  }))

  const allIds = new Set<string>()
  for (const p of previews) for (const t of p.tutorials) allIds.add(t.id)
  const readerState = currentUser
    ? await loadReaderState(currentUser.id, Array.from(allIds))
    : emptyReaderState()

  const orderedPreviews = GROUP.categorySlugs
    .map((slug) => previews.find((p) => p.category.slug === slug))
    .filter(
      (p): p is { category: typeof categories[number]; tutorials: TutorialCard[] } =>
        p !== undefined,
    )

  const collectionItems = previews.flatMap((p) =>
    p.tutorials.map((t) => ({
      name: t.title,
      url: `/${p.category.slug}/${t.slug}`,
    })),
  )
  const collectionSchema = buildCollectionPageSchema({
    url: '/make',
    name: 'Make — Homemade',
    description: GROUP.lede,
    items: collectionItems,
  })
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Make', href: '/make' },
  ])

  return (
    <div className="group-landing">
      <JsonLd data={[collectionSchema, breadcrumbSchema]} />

      <GroupHero
        heroMedia={heroMedia}
        eyebrow="Make"
        title={GROUP.title}
        lede={GROUP.lede}
      />

      <section className="group-landing-intro" aria-label="Introduction">
        <div>
          <p className="group-landing-intro-eyebrow">What you&apos;ll find</p>
          <h2 className="group-landing-intro-headline">
            Six handcraft disciplines, one Studio.
          </h2>
        </div>
        <p className="group-landing-intro-body">
          Cross-stitch, knitting, crochet, needlework, sewing, and fibre arts.
          Designed patterns from independent makers, opened in the Homemade
          Studio so you can mark stitched, track rows, log gauge, and print a
          clean PDF when you are done.
        </p>
      </section>

      {featuredPatterns.length >= 3 && (
        <section className="group-landing-feature-band" aria-label="Open the Studio">
          <div>
            <p className="group-landing-feature-eyebrow">The Studio</p>
            <h2 className="group-landing-feature-title">
              Open a pattern and stitch.
            </h2>
            <p className="group-landing-feature-body">
              Every designed pattern in the library opens in the Studio.
              Design your own from an idea or a photograph, start from a
              blank canvas, or browse the catalogue and pick something that
              speaks to you.
            </p>
            <div className="group-landing-feature-actions">
              <Link
                href="/studio/cross-stitch?new=design"
                className="group-landing-feature-action primary"
              >
                Design your own →
              </Link>
              <Link
                href="/cross-stitch"
                className="group-landing-feature-action ghost"
              >
                Browse cross-stitch patterns →
              </Link>
            </div>
          </div>
          <div className="group-landing-feature-media" aria-hidden="true">
            {featuredPatterns.slice(0, 6).map((p) => (
              <span key={p.id} className="group-landing-feature-media-tile">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={patternHeroUrl({ id: p.id, hero: p.hero }, 'card')}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </span>
            ))}
          </div>
        </section>
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
