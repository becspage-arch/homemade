import type { MetadataRoute } from 'next'
import { prisma, TutorialStatus, Visibility, PatternType } from '@homemade/db'
import { siteUrl } from '@/lib/seo/site-url'

/**
 * Dynamic sitemap. Google caps a single sitemap at 50,000 URLs; once the
 * library outgrows that we'll split into `/sitemap-0.xml`, `/sitemap-1.xml`,
 * etc. with a parent index. Until then a single file fits everything.
 *
 * Cache contract: this route is force-dynamic but Next.js will revalidate
 * if the deploy adds the right header — we cache for 24h at the edge by
 * setting the `Cache-Control` response header in middleware-equivalent
 * surfaces. For now Next's default revalidation behaviour is acceptable
 * because each deploy invalidates the route.
 */
export const dynamic = 'force-dynamic'
export const revalidate = 3600

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const [tutorials, categories, makers, madeIt] = await Promise.all([
    prisma.tutorial.findMany({
      // Only tutorials in a publicly-visible (signed-off) category. A published
      // tutorial in a hidden category 404s to the public, so it must not appear
      // in the sitemap or it would invite crawlers to a dead URL.
      where: {
        status: TutorialStatus.PUBLISHED,
        category: { isPublicVisible: true },
      },
      orderBy: { publishedAt: 'desc' },
      select: {
        slug: true,
        updatedAt: true,
        category: { select: { slug: true } },
      },
    }),
    prisma.category.findMany({
      where: { isPublicVisible: true },
      orderBy: [{ launchOrder: 'asc' }, { name: 'asc' }],
      select: { slug: true, updatedAt: true },
    }),
    prisma.user.findMany({
      where: {
        isPublicMakerProfile: true,
        displayHandle: { not: null },
      },
      orderBy: { updatedAt: 'desc' },
      select: { displayHandle: true, updatedAt: true },
    }),
    prisma.userProject.findMany({
      where: {
        isPublic: true,
        user: {
          isPublicMakerProfile: true,
          displayHandle: { not: null },
        },
      },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        publishedAt: true,
        updatedAt: true,
        user: { select: { displayHandle: true } },
      },
    }),
  ])

  // Pattern detail pages (/<craft>/patterns/<slug>). Only house/library patterns
  // (ownerUserId null) that are PUBLIC, mirroring each detail route's own guard.
  // Crochet/knitting patterns are intentionally absent — they have no public
  // /<craft>/patterns/<slug> route (crochet surfaces via its source tutorial,
  // already covered by the tutorial loop above).
  const [crossStitchPatterns, needleworkPatterns] = await Promise.all([
    prisma.pattern.findMany({
      where: {
        type: PatternType.CROSS_STITCH,
        ownerUserId: null,
        visibility: Visibility.PUBLIC,
        slug: { not: null },
      },
      orderBy: { publishedAt: 'desc' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.needleworkPattern.findMany({
      where: {
        ownerUserId: null,
        visibility: Visibility.PUBLIC,
        slug: { not: null },
      },
      orderBy: { publishedAt: 'desc' },
      select: { slug: true, updatedAt: true },
    }),
  ])

  const entries: MetadataRoute.Sitemap = []

  // Homepage
  entries.push({
    url: siteUrl('/'),
    lastModified: now,
    changeFrequency: 'daily',
    priority: 1.0,
  })

  // Static surfaces
  for (const path of ['/about', '/makers', '/legal']) {
    entries.push({
      url: siteUrl(path),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    })
  }

  // Group landings (Food / Make / Skills / Home — Mindset and Grow are
  // 1:1 with their category and already covered by the category loop).
  for (const path of ['/food', '/make', '/skills', '/home']) {
    entries.push({
      url: siteUrl(path),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    })
  }
  for (const path of [
    '/legal/privacy',
    '/legal/terms',
    '/legal/cookies',
    '/legal/acceptable-use',
    '/legal/dmca',
    '/legal/subscription-terms',
  ]) {
    entries.push({
      url: siteUrl(path),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    })
  }

  // Categories
  for (const cat of categories) {
    entries.push({
      url: siteUrl(`/${cat.slug}`),
      lastModified: cat.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // Tutorials
  for (const t of tutorials) {
    entries.push({
      url: siteUrl(`/${t.category.slug}/${t.slug}`),
      lastModified: t.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  // Pattern detail pages. A published pattern in a hidden category 404s to the
  // public (same as tutorials), so only emit when its craft category is
  // publicly visible.
  const publicCategorySlugs = new Set(categories.map((c) => c.slug))
  if (publicCategorySlugs.has('cross-stitch')) {
    for (const p of crossStitchPatterns) {
      if (!p.slug) continue
      entries.push({
        url: siteUrl(`/cross-stitch/patterns/${p.slug}`),
        lastModified: p.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }
  if (publicCategorySlugs.has('needlework')) {
    for (const p of needleworkPatterns) {
      if (!p.slug) continue
      entries.push({
        url: siteUrl(`/needlework/patterns/${p.slug}`),
        lastModified: p.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  // Maker profiles
  for (const m of makers) {
    if (!m.displayHandle) continue
    entries.push({
      url: siteUrl(`/m/${m.displayHandle}`),
      lastModified: m.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.5,
    })
  }

  // Made-it entries
  for (const project of madeIt) {
    if (!project.user.displayHandle) continue
    const lastMod = project.updatedAt ?? project.publishedAt ?? now
    entries.push({
      url: siteUrl(`/m/${project.user.displayHandle}/made/${project.id}`),
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.4,
    })
  }

  return entries
}

// Static export so the helper above remains tree-shakeable for tests.
export { ONE_DAY_MS as _ONE_DAY_MS }
