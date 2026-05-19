import type { MetadataRoute } from 'next'
import { prisma, TutorialStatus } from '@homemade/db'
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
      where: { status: TutorialStatus.PUBLISHED },
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
