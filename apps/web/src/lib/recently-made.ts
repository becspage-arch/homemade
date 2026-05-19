import 'server-only'
import { prisma } from '@homemade/db'

export interface RecentlyMadeTile {
  projectId: string
  publishedAt: Date
  tutorialTitle: string
  tutorialSlug: string
  categoryName: string
  categorySlug: string
  heroSource: { cloudflareId: string | null; r2Key: string | null } | null
  makerName: string
  makerHandle: string
}

/**
 * Most-recent public UserProjects across all categories. Powers the
 * "Recently made by the community" rail on the homepage and (when filtered
 * by category) the category page rail. Returns at most `limit` rows.
 *
 * Filters:
 *   - UserProject.isPublic = true
 *   - User.isPublicMakerProfile = true (so private-profile Makers don't leak
 *     via this rail)
 *   - the User must have a handle (otherwise we can't link them)
 *
 * Sorted by publishedAt descending. Falls back to startedAt for the few
 * legacy rows where publishedAt would somehow be null on a public row.
 */
export async function loadRecentlyMade(opts: {
  limit?: number
  categorySlug?: string | null
}): Promise<RecentlyMadeTile[]> {
  const limit = opts.limit ?? 12
  const rows = await prisma.userProject.findMany({
    where: {
      isPublic: true,
      user: {
        isPublicMakerProfile: true,
        displayHandle: { not: null },
      },
      ...(opts.categorySlug
        ? { tutorial: { category: { slug: opts.categorySlug } } }
        : {}),
    },
    orderBy: [{ publishedAt: 'desc' }, { startedAt: 'desc' }],
    take: limit,
    select: {
      id: true,
      publishedAt: true,
      startedAt: true,
      heroPhoto: {
        select: { media: { select: { cloudflareId: true, r2Key: true } } },
      },
      tutorial: {
        select: {
          slug: true,
          title: true,
          category: { select: { slug: true, name: true } },
          hero: { select: { cloudflareId: true, r2Key: true } },
        },
      },
      user: {
        select: { name: true, displayHandle: true },
      },
    },
  })

  return rows.map((r) => ({
    projectId: r.id,
    publishedAt: r.publishedAt ?? r.startedAt,
    tutorialTitle: r.tutorial.title,
    tutorialSlug: r.tutorial.slug,
    categoryName: r.tutorial.category.name,
    categorySlug: r.tutorial.category.slug,
    heroSource: r.heroPhoto?.media ?? r.tutorial.hero,
    makerName: r.user.name ?? r.user.displayHandle ?? 'A maker',
    // displayHandle filtered to non-null above, so the `!` is safe.
    makerHandle: r.user.displayHandle!,
  }))
}
