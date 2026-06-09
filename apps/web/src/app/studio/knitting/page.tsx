import type { Metadata } from 'next'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { KnittingStudioShell } from '@/components/studio/knitting/KnittingStudioShell'
import {
  loadKnittingPatternForStudio,
  loadKnittingProjectsForUser,
  loadDemoKnittingPattern,
} from '@/lib/knitting/load-pattern'
import { prisma } from '@homemade/db'

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

  const myProjects = user && !pattern ? await loadKnittingProjectsForUser(user.id) : []

  const startMode: 'empty' | 'pattern' = pattern ? 'pattern' : 'empty'

  return (
    <KnittingStudioShell
      startMode={startMode}
      signedIn={Boolean(user)}
      userEmail={user?.email ?? null}
      userName={user?.name ?? null}
      pattern={pattern}
      progress={null}
      myProjects={myProjects}
      yarnWeights={yarnWeights}
    />
  )
}
