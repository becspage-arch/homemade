import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { prisma, TutorialStatus } from '@homemade/db'
import { HomeCard } from '@/components/public/home-card'
import { HomeRail } from '@/components/public/home-rail'
import { JsonLd } from '@/components/seo/json-ld'
import { GroupHero, loadGroupHeroMedia } from '@/components/public/group-landing/group-hero'
import { CategoryPreviewSection } from '@/components/public/group-landing/category-preview-section'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { loadInSeasonForCategory } from '@/lib/in-season-for-category'
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

const GROUP = GROUP_CONFIGS.food
const PREVIEW_PER_CATEGORY = 6
const SEASONAL_LIMIT = 8

export const metadata: Metadata = buildPublicMetadata({
  title: 'Food — recipes, baking and herbal remedies you can make at home',
  description:
    'Tested recipes for everyday cooking, considered baking and a working herbal medicine cabinet. Independent, ad-free, by makers who care.',
  path: '/food',
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
  categoryId: true,
  mood: true,
  season: true,
  cuisine: true,
  mealType: true,
} as const

async function readCountryCode(): Promise<string | null> {
  try {
    const h = await headers()
    const cf = h.get('cf-ipcountry') ?? h.get('x-vercel-ip-country')
    if (cf && cf.length === 2) return cf.toUpperCase()
  } catch {
    // outside request scope (tests)
  }
  return null
}

export default async function FoodLandingPage() {
  const categories = await prisma.category.findMany({
    where: {
      slug: { in: GROUP.categorySlugs },
      isPublicVisible: true,
    },
    select: { id: true, slug: true, name: true, description: true },
  })
  const categoryById = new Map(categories.map((c) => [c.id, c]))

  const [heroMedia, currentUser, countryCode, perCategoryResults] = await Promise.all([
    loadGroupHeroMedia(GROUP.categorySlugs),
    getCurrentDbUser(),
    readCountryCode(),
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
  ])

  // Pull season picks across all three categories, then merge + dedupe.
  const seasonalPerCategory = await Promise.all(
    categories.map((c) =>
      loadInSeasonForCategory({
        categoryId: c.id,
        now: new Date(),
        countryCode,
        limit: SEASONAL_LIMIT,
      }),
    ),
  )
  const seasonalAll = seasonalPerCategory
    .flat()
    .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i)
    .slice(0, SEASONAL_LIMIT)

  const previews = categories.map((c, i) => ({
    category: c,
    tutorials: (perCategoryResults[i] ?? []) as TutorialCard[],
  }))

  const allIds = new Set<string>()
  for (const p of previews) for (const t of p.tutorials) allIds.add(t.id)
  for (const t of seasonalAll) allIds.add(t.id)
  const readerState = currentUser
    ? await loadReaderState(currentUser.id, Array.from(allIds))
    : emptyReaderState()

  const collectionItems = previews.flatMap((p) =>
    p.tutorials.map((t) => ({
      name: t.title,
      url: `/${p.category.slug}/${t.slug}`,
    })),
  )
  const collectionSchema = buildCollectionPageSchema({
    url: '/food',
    name: 'Food — Homemade',
    description: GROUP.lede,
    items: collectionItems,
  })
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Food', href: '/food' },
  ])

  // Order matters: render in the canonical group order from nav-groups.ts
  const orderedPreviews = GROUP.categorySlugs
    .map((slug) => previews.find((p) => p.category.slug === slug))
    .filter((p): p is { category: typeof categories[number]; tutorials: TutorialCard[] } => p !== undefined)

  return (
    <div className="group-landing">
      <JsonLd data={[collectionSchema, breadcrumbSchema]} />

      <GroupHero
        heroMedia={heroMedia}
        eyebrow="Food"
        title={GROUP.title}
        lede={GROUP.lede}
      />

      <section className="group-landing-intro" aria-label="Introduction">
        <div>
          <p className="group-landing-intro-eyebrow">What you&apos;ll find</p>
          <h2 className="group-landing-intro-headline">
            Three ways of feeding the people you love.
          </h2>
        </div>
        <p className="group-landing-intro-body">
          Cooking is the everyday work of feeding a household well.
          Baking is the slower craft. Herbal medicine is the cabinet
          you build over years, plant by plant. Every recipe here is
          tested, written in plain English, and free.
        </p>
      </section>

      {seasonalAll.length > 0 && (
        <HomeRail heading="In season across the kitchen right now">
          {seasonalAll.map((t) => {
            const card = t as TutorialCard
            const cat = categoryById.get(card.categoryId ?? '') ?? card.category
            const tutorial = { ...card, category: { slug: cat.slug, name: cat.name } }
            return (
              <HomeCard
                key={card.id}
                tutorial={tutorial}
                state={readerStateFor(readerState, card.id)}
              />
            )
          })}
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

      <footer className="group-landing-intro" aria-label="More food">
        <div>
          <p className="group-landing-intro-eyebrow">Looking for something specific?</p>
          <h2 className="group-landing-intro-headline">
            Search what you&apos;re cooking.
          </h2>
        </div>
        <div>
          <p className="group-landing-intro-body">
            Use the search bar above for ingredient-led queries
            (&quot;tomatoes&quot;, &quot;leftover chicken&quot;,
            &quot;dairy-free&quot;), or open a category to browse by
            sub-category and dietary axis.
          </p>
          <div className="group-landing-feature-actions" style={{ marginTop: 16 }}>
            <Link href="/cooking" className="group-landing-feature-action ghost">
              Open cooking →
            </Link>
            <Link href="/baking" className="group-landing-feature-action ghost">
              Open baking →
            </Link>
            <Link href="/herbal-medicine" className="group-landing-feature-action ghost">
              Open herbal medicine →
            </Link>
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
  categoryId?: string
  mood?: string[]
  season?: string | null
  cuisine?: string | null
  mealType?: string | null
}
