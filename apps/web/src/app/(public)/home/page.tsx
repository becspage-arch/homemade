import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma, TutorialStatus } from '@homemade/db'
import { JsonLd } from '@/components/seo/json-ld'
import { GroupHero, loadGroupHeroMedia } from '@/components/public/group-landing/group-hero'
import { CategoryPreviewSection } from '@/components/public/group-landing/category-preview-section'
import { HomeRail } from '@/components/public/home-rail'
import { HomeCard } from '@/components/public/home-card'
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
  readerStateFor,
} from '@/lib/user-state'

import '@/components/public/group-landing/group-landing.css'

export const dynamic = 'force-dynamic'

const GROUP = GROUP_CONFIGS.home
const PREVIEW_PER_CATEGORY = 6

export const metadata: Metadata = buildPublicMetadata({
  title: 'Home — fix, formulate, raise, sustain',
  description:
    'A homemade home: from the leaky tap to the soap on the basin, the chickens in the garden to the compost heap. Practical, tested, ad-free.',
  path: '/home',
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

export default async function HomeLandingPage() {
  const categories = await prisma.category.findMany({
    where: {
      slug: { in: GROUP.categorySlugs },
      isPublicVisible: true,
    },
    select: { id: true, slug: true, name: true, description: true },
  })

  const [heroMedia, currentUser, perCategoryResults, quickFixes] = await Promise.all([
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
        category: { slug: 'home-repair' },
        status: TutorialStatus.PUBLISHED,
        timeMinutes: { lte: 30 },
      },
      orderBy: [
        { bookmarks: { _count: 'desc' } },
        { publishedAt: 'desc' },
      ],
      take: 8,
      select: CARD_SELECT,
    }),
  ])

  const previews = categories.map((c, i) => ({
    category: c,
    tutorials: (perCategoryResults[i] ?? []) as TutorialCard[],
  }))

  const allIds = new Set<string>()
  for (const p of previews) for (const t of p.tutorials) allIds.add(t.id)
  for (const q of quickFixes) allIds.add(q.id)
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
    url: '/home',
    name: 'Home — Homemade',
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
    { name: 'Home & home-keeping', href: '/home' },
  ])

  return (
    <div className="group-landing">
      <JsonLd data={[collectionSchema, breadcrumbSchema]} />

      <GroupHero
        heroMedia={heroMedia}
        eyebrow="Home"
        title={GROUP.title}
        lede={GROUP.lede}
      />

      <section className="group-landing-intro" aria-label="Introduction">
        <div>
          <p className="group-landing-intro-eyebrow">What you&apos;ll find</p>
          <h2 className="group-landing-intro-headline">
            Four ways of keeping a household.
          </h2>
        </div>
        <p className="group-landing-intro-body">
          Home repair for what breaks. Natural home for what you put on
          your skin and around your sink. Animals and smallholding for
          what lives in the garden, the coop, or the paddock. Sustainability
          for the long view. None of it is decorative. All of it works.
        </p>
      </section>

      {quickFixes.length > 0 && (
        <HomeRail
          heading="Quick fixes from the home-repair shelf"
          subheading="Under 30 minutes, basic tools."
          seeAllHref="/home-repair"
          seeAllLabel="All home repair →"
        >
          {(quickFixes as TutorialCard[]).map((t) => (
            <HomeCard
              key={t.id}
              tutorial={t}
              state={readerStateFor(readerState, t.id)}
            />
          ))}
        </HomeRail>
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

      <footer className="group-landing-intro" aria-label="When to call a pro">
        <div>
          <p className="group-landing-intro-eyebrow">Stop signs</p>
          <h2 className="group-landing-intro-headline">
            Some jobs are not yours.
          </h2>
        </div>
        <p className="group-landing-intro-body">
          Gas, ever. Electrical work behind the consumer unit. Anything
          structural — load-bearing walls, joists, roof timbers. Asbestos in
          older homes — get it tested before you cut. The home-repair
          landing carries a fuller stop list at the bottom; start there if
          you are unsure.
          <br />
          <Link
            href="/home-repair"
            className="group-landing-feature-action ghost"
            style={{ display: 'inline-block', marginTop: 12 }}
          >
            Open home repair →
          </Link>
        </p>
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
