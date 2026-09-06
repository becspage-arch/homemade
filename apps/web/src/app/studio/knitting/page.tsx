import type { Metadata } from 'next'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import { KnittingStudioShell } from '@/components/studio/knitting/KnittingStudioShell'
import {
  loadKnittingPatternForStudio,
  loadKnittingProjectsForUser,
  loadKnittingGradableSpec,
  loadDemoKnittingPattern,
} from '@/lib/knitting/load-pattern'
import { prisma, PatternType, Visibility } from '@homemade/db'
import { patternHeroUrl } from '@/lib/studio/pattern-hero'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Knitting Studio · homemade',
  description:
    'Open a knitting pattern. Track your row, round, repeat, and stitch as you go. Switch between written, chart, and schematic views.',
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<{
    knittingPatternId?: string
    knittingPatternSlug?: string
    demo?: string
  }>
}

/**
 * /studio/knitting — knitting category Studio.
 *
 * URL state mirrors the cross-stitch / crochet Studios:
 *
 *   no knittingPatternId, no demo → empty state (signed-out hero +
 *     "Your projects" grid for signed-in)
 *   knittingPatternId=…           → load Tutorial-as-pattern + render
 *                                   active-project surface
 *   demo=1                        → load a hand-crafted sample (used
 *                                   for smoke-testing the chart
 *                                   viewport against the K-2 contract
 *                                   without a real KnittingPattern in
 *                                   the DB)
 *
 * Implementation note: K-1's schema added knitting-specific Tutorial
 * fields but didn't create a dedicated KnittingPattern model. K-3
 * sources its pattern data from Tutorial rows via
 * `loadKnittingPatternForStudio`. A future K-4 migration adds the
 * dedicated KnittingPattern model + KnittingProjectProgress; only the
 * loader needs to change, the Studio shell is agnostic to the source.
 */
export default async function KnittingStudioPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const user = await getCurrentDbUser()

  let pattern = null
  if (sp.demo === '1') {
    pattern = loadDemoKnittingPattern()
  } else if (sp.knittingPatternId || sp.knittingPatternSlug) {
    pattern = await loadKnittingPatternForStudio({
      tutorialId: sp.knittingPatternId,
      slug: sp.knittingPatternSlug,
    })
  }

  const yarnWeights = pattern
    ? await prisma.yarnWeight.findMany({
        select: { slug: true, canonicalName: true, standardCategory: true },
        orderBy: { standardCategory: 'asc' },
      })
    : []

  // The grader's surface. Null unless this pattern has earned its own loom
  // hero AND says enough to grade; the loader holds both checks, so a null
  // answer keeps the size table and the fit panel off the page entirely.
  const gradable =
    pattern && pattern.slug && sp.demo !== '1'
      ? await loadKnittingGradableSpec(pattern.slug)
      : null

  const myProjects = user && !pattern ? await loadKnittingProjectsForUser(user.id) : []

  // Recently added knitting patterns from the library. Falls back to no
  // rail when there's nothing published. The rail hides itself.
  const recentlyAddedRows = pattern
    ? []
    : await prisma.pattern.findMany({
        where: {
          ownerUserId: null,
          visibility: Visibility.PUBLIC,
          publishedAt: { not: null },
          type: PatternType.KNITTING_CHART,
        },
        orderBy: { publishedAt: 'desc' },
        take: 6,
        select: {
          id: true,
          slug: true,
          name: true,
          hero: { select: { cloudflareId: true, r2Key: true } },
        },
      })
  const recentlyAdded = recentlyAddedRows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    thumbnailUrl: patternHeroUrl({ id: p.id, hero: p.hero }, 'card'),
  }))

  const startMode: 'empty' | 'pattern' = pattern ? 'pattern' : 'empty'

  return (
    <KnittingStudioShell
      startMode={startMode}
      signedIn={Boolean(user)}
      userEmail={user?.email ?? null}
      userName={user?.name ?? null}
      pattern={pattern}
      gradable={gradable}
      isPremium={hasPremium(user)}
      progress={null}
      myProjects={myProjects}
      yarnWeights={yarnWeights}
      recentlyAdded={recentlyAdded}
    />
  )
}
