import type { Metadata } from 'next'
import { prisma, Visibility } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { NeedleworkStudioShell } from '@/components/studio/needlework/NeedleworkStudioShell'
import type {
  NeedleworkPatternData,
  NeedleworkVectorData,
  NeedleworkProjectProgressData,
  MyNeedleworkProjectListItem,
  NeedleworkDiscipline,
  NeedleworkPatternFormat,
  NeedleworkProjectPhase,
} from '@/components/studio/needlework/types'
import { mediaUrl } from '@/lib/media'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Needlework Studio · homemade',
  description:
    'Follow patterns stitch by stitch. Counted thread on the grid, surface embroidery with annotation. Save your place, print a clean PDF.',
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<{
    needleworkPatternId?: string
    needleworkPatternSlug?: string
  }>
}

/**
 * /studio/needlework — the Needlework category Studio.
 *
 * URL state:
 *
 *   no needleworkPatternId   → empty state (discipline picker + your projects)
 *   needleworkPatternId=…    → load pattern + render active-project surface
 *   needleworkPatternSlug=…  → load by slug (from library deep-links)
 */
export default async function NeedleworkStudioPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const user = await getCurrentDbUser()

  let pattern: NeedleworkPatternData | null = null
  let progress: NeedleworkProjectProgressData | null = null

  if (sp.needleworkPatternId || sp.needleworkPatternSlug) {
    const row = await prisma.needleworkPattern.findUnique({
      where: sp.needleworkPatternId
        ? { id: sp.needleworkPatternId }
        : { slug: sp.needleworkPatternSlug as string },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        discipline: true,
        patternFormat: true,
        gridData: true,
        chartData: true,
        vectorData: true,
        regionAnnotations: true,
        widthCells: true,
        heightCells: true,
        colourCount: true,
        fabricSpec: true,
        threadTypes: true,
        frameType: true,
        culturalAttribution: true,
        thumbnailMediaId: true,
        heroMediaId: true,
        difficulty: true,
        estimatedHours: true,
        premium: true,
        visibility: true,
        ownerUserId: true,
        designer: { select: { slug: true, displayName: true } },
        sourceTutorial: {
          select: { id: true, slug: true, category: { select: { slug: true } } },
        },
      },
    })

    if (row) {
      const isOwned = user && row.ownerUserId === user.id
      const isLibrary =
        row.ownerUserId === null &&
        (row.visibility === Visibility.PUBLIC || row.visibility === Visibility.UNLISTED)

      if (isOwned || isLibrary) {
        // The stored vectorData carries the printable document; lift its dense
        // colour map out as an alternate Studio view to the clean outline.
        const rawVd = row.vectorData as
          | (NeedleworkVectorData & {
              document?: { denseMapSvg?: string; colourGuideSvg?: string }
            })
          | null
        const vectorData: NeedleworkVectorData | null = rawVd
          ? {
              ...rawVd,
              colourMapSvg: rawVd.document?.denseMapSvg ?? rawVd.document?.colourGuideSvg ?? null,
            }
          : null
        pattern = {
          id: row.id,
          slug: row.slug,
          name: row.name,
          description: row.description,
          discipline: row.discipline as NeedleworkDiscipline,
          patternFormat: row.patternFormat as NeedleworkPatternFormat,
          gridData: row.gridData,
          chartData: row.chartData,
          vectorData,
          regionAnnotations: row.regionAnnotations as NeedleworkPatternData['regionAnnotations'],
          widthCells: row.widthCells,
          heightCells: row.heightCells,
          colourCount: row.colourCount,
          fabricSpec: row.fabricSpec,
          threadTypes: row.threadTypes,
          frameType: row.frameType,
          culturalAttribution: row.culturalAttribution,
          thumbnailMediaId: row.thumbnailMediaId,
          heroMediaId: row.heroMediaId,
          difficulty: row.difficulty,
          estimatedHours: row.estimatedHours,
          premium: row.premium,
          ownerUserId: row.ownerUserId,
          designerSlug: row.designer?.slug ?? null,
          designerName: row.designer?.displayName ?? null,
          sourceTutorialSlug: row.sourceTutorial?.slug ?? null,
          sourceTutorialCategorySlug: row.sourceTutorial?.category?.slug ?? null,
        }
      }
    }

    if (pattern && user) {
      progress = await loadProgress(user.id, pattern.id)
    }
  }

  let myProjects: MyNeedleworkProjectListItem[] = []
  if (user && !pattern) {
    const rows = await prisma.needleworkProjectProgress.findMany({
      where: { userId: user.id },
      orderBy: { lastWorkedAt: 'desc' },
      take: 24,
      select: {
        needleworkPatternId: true,
        lastWorkedAt: true,
        completedAt: true,
        needleworkPattern: {
          select: {
            id: true,
            name: true,
            discipline: true,
            difficulty: true,
            thumbnailMediaId: true,
          },
        },
      },
    })
    myProjects = rows.map((row) => ({
      needleworkPatternId: row.needleworkPatternId,
      patternName: row.needleworkPattern.name,
      discipline: row.needleworkPattern.discipline as NeedleworkDiscipline,
      difficulty: row.needleworkPattern.difficulty,
      thumbnailMediaId: row.needleworkPattern.thumbnailMediaId,
      lastWorkedAt: row.lastWorkedAt.toISOString(),
      completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    }))
  }

  // Recently added needlework patterns from the library. Hides itself
  // when nothing has been published yet.
  const recentlyAddedRows = pattern
    ? []
    : await prisma.needleworkPattern.findMany({
        where: {
          ownerUserId: null,
          visibility: Visibility.PUBLIC,
          publishedAt: { not: null },
        },
        orderBy: { publishedAt: 'desc' },
        take: 6,
        select: {
          id: true,
          slug: true,
          name: true,
          thumbnail: { select: { cloudflareId: true, r2Key: true } },
        },
      })
  const recentlyAdded = recentlyAddedRows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    thumbnailUrl: mediaUrl(p.thumbnail, 'card'),
  }))

  const startMode = pattern ? 'pattern' : 'empty'

  return (
    <NeedleworkStudioShell
      startMode={startMode}
      signedIn={Boolean(user)}
      userEmail={user?.email ?? null}
      userName={user?.name ?? null}
      pattern={pattern}
      progress={progress}
      myProjects={myProjects}
      recentlyAdded={recentlyAdded}
    />
  )
}

async function loadProgress(
  userId: string,
  needleworkPatternId: string,
): Promise<NeedleworkProjectProgressData | null> {
  const row = await prisma.needleworkProjectProgress.findUnique({
    where: { userId_needleworkPatternId: { userId, needleworkPatternId } },
    select: {
      currentPhase: true,
      completedCells: true,
      completedRegions: true,
      notes: true,
      lastWorkedAt: true,
      completedAt: true,
    },
  })
  if (!row) return null
  return {
    currentPhase: row.currentPhase as NeedleworkProjectPhase,
    completedCells: (row.completedCells as Record<string, true>) ?? {},
    completedRegions: (row.completedRegions as Record<string, true>) ?? {},
    notes: row.notes,
    lastWorkedAt: row.lastWorkedAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
  }
}
