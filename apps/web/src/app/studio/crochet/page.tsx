import type { Metadata } from 'next'
import { prisma, Visibility } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { CrochetStudioShell } from '@/components/studio/crochet/CrochetStudioShell'
import type { CrochetPatternData, MyCrochetProjectListItem } from '@/components/studio/crochet/types'
import { mediaUrl } from '@/lib/media'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Crochet Studio · homemade',
  description: 'Open a pattern. Mark each row as you go. Switch between written, chart, and schematic views.',
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<{
    crochetPatternId?: string
    crochetPatternSlug?: string
    new?: 'amigurumi-designer' | 'photo-to-tapestry' | 'ai-assisted'
  }>
}

/**
 * /studio/crochet — the crochet category Studio.
 *
 * State derived from the URL query (mirrors the cross-stitch Studio
 * convention so the shell never unmounts on panel toggles):
 *
 *   no crochetPatternId, no ?new   → empty state (sign-in hero or "Your projects")
 *   crochetPatternId=…             → load pattern + render active-project surface
 *   ?new=amigurumi-designer        → amigurumi shape generator (premium, step 14)
 *   ?new=photo-to-tapestry         → photo to tapestry grid (premium, step 16)
 *   ?new=ai-assisted               → AI-assisted custom pattern (premium, step 15)
 *
 * Library patterns silently fork on first edit, same pattern as
 * cross-stitch Studio. v1 ships without the fork path because the
 * library is read-only progress, not edit.
 */
export default async function CrochetStudioPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const user = await getCurrentDbUser()

  let pattern: CrochetPatternData | null = null
  let progress: Awaited<ReturnType<typeof loadProgress>> = null

  if (sp.crochetPatternId || sp.crochetPatternSlug) {
    const row = await prisma.crochetPattern.findUnique({
      where: sp.crochetPatternId
        ? { id: sp.crochetPatternId }
        : { slug: sp.crochetPatternSlug as string },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        rowsStructured: true,
        chartData: true,
        schematicMediaId: true,
        thumbnailMediaId: true,
        format: true,
        construction: true,
        shapeCategory: true,
        sizesGraded: true,
        yardageBySize: true,
        gaugeText: true,
        finishedSizeText: true,
        pieceCount: true,
        pieces: true,
        buildOrder: true,
        abbreviationsUsed: true,
        specialStitchesUsed: true,
        craftStitchSlugs: true,
        craftTechniqueTags: true,
        terminologyConvention: true,
        clusterCountByRound: true,
        repeatRowGroups: true,
        leftHandedChartAvailable: true,
        difficulty: true,
        premium: true,
        visibility: true,
        ownerUserId: true,
        designer: { select: { slug: true, displayName: true } },
        thumbnail: { select: { id: true } },
        schematic: { select: { id: true } },
        sourceTutorial: { select: { id: true, slug: true, category: { select: { slug: true } } } },
        primaryYarnWeight: { select: { standardCategory: true, canonicalName: true } },
        primaryHook: { select: { mmSize: true, canonicalName: true } },
      },
    })

    if (row) {
      const isOwned = user && row.ownerUserId === user.id
      const isLibrary =
        row.ownerUserId === null &&
        (row.visibility === Visibility.PUBLIC || row.visibility === Visibility.UNLISTED)
      if (isOwned || isLibrary) {
        pattern = {
          id: row.id,
          slug: row.slug,
          name: row.name,
          description: row.description,
          rowsStructured: row.rowsStructured,
          chartData: row.chartData,
          schematicMediaId: row.schematicMediaId,
          thumbnailMediaId: row.thumbnailMediaId,
          format: row.format,
          construction: row.construction,
          shapeCategory: row.shapeCategory,
          sizesGraded: row.sizesGraded,
          yardageBySize: row.yardageBySize,
          gaugeText: row.gaugeText,
          finishedSizeText: row.finishedSizeText,
          pieceCount: row.pieceCount,
          pieces: row.pieces,
          buildOrder: row.buildOrder,
          abbreviationsUsed: row.abbreviationsUsed,
          specialStitchesUsed: row.specialStitchesUsed,
          craftStitchSlugs: row.craftStitchSlugs,
          craftTechniqueTags: row.craftTechniqueTags,
          terminologyConvention: row.terminologyConvention,
          clusterCountByRound: row.clusterCountByRound,
          repeatRowGroups: row.repeatRowGroups,
          leftHandedChartAvailable: row.leftHandedChartAvailable,
          difficulty: row.difficulty,
          premium: row.premium,
          ownerUserId: row.ownerUserId,
          designerSlug: row.designer?.slug ?? null,
          designerName: row.designer?.displayName ?? null,
          sourceTutorialSlug: row.sourceTutorial?.slug ?? null,
          sourceTutorialCategorySlug: row.sourceTutorial?.category?.slug ?? null,
          sourceTutorialId: row.sourceTutorial?.id ?? null,
          primaryYarnWeightCategory: row.primaryYarnWeight?.standardCategory ?? null,
          primaryYarnWeightName: row.primaryYarnWeight?.canonicalName ?? null,
          primaryHookMm: row.primaryHook?.mmSize ?? null,
          primaryHookName: row.primaryHook?.canonicalName ?? null,
        }
      }
    }

    if (pattern && user) {
      progress = await loadProgress(user.id, pattern.id)
    }
  }

  const yarnWeights = pattern
    ? await prisma.yarnWeight.findMany({
        select: { slug: true, canonicalName: true, standardCategory: true },
        orderBy: { standardCategory: 'asc' },
      })
    : []

  let myProjects: MyCrochetProjectListItem[] = []
  if (user && !pattern) {
    const rows = await prisma.crochetProjectProgress.findMany({
      where: { userId: user.id },
      orderBy: { lastWorkedAt: 'desc' },
      take: 24,
      select: {
        crochetPatternId: true,
        currentRow: true,
        currentSection: true,
        lastWorkedAt: true,
        completedAt: true,
        crochetPattern: {
          select: {
            id: true,
            name: true,
            shapeCategory: true,
            difficulty: true,
            thumbnailMediaId: true,
          },
        },
      },
    })
    myProjects = rows.map((row) => ({
      crochetPatternId: row.crochetPatternId,
      patternName: row.crochetPattern.name,
      shapeCategory: row.crochetPattern.shapeCategory,
      difficulty: row.crochetPattern.difficulty,
      thumbnailMediaId: row.crochetPattern.thumbnailMediaId,
      currentRow: row.currentRow,
      currentSection: row.currentSection,
      lastWorkedAt: row.lastWorkedAt.toISOString(),
      completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    }))
  }

  const startMode: 'empty' | 'pattern' | 'new-amigurumi-designer' | 'new-photo-to-tapestry' | 'new-ai-assisted' = pattern
    ? 'pattern'
    : sp.new === 'amigurumi-designer'
    ? 'new-amigurumi-designer'
    : sp.new === 'photo-to-tapestry'
    ? 'new-photo-to-tapestry'
    : sp.new === 'ai-assisted'
    ? 'new-ai-assisted'
    : 'empty'

  // Recently added to the library - surfaced on the Studio landing as a
  // taste of what's in the library, with a link out to /crochet for the
  // full browse. Empty when nothing's published yet; the rail hides
  // itself in that case.
  const recentlyAddedRows = pattern
    ? []
    : await prisma.crochetPattern.findMany({
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

  return (
    <CrochetStudioShell
      startMode={startMode}
      signedIn={Boolean(user)}
      userEmail={user?.email ?? null}
      userName={user?.name ?? null}
      userTerminologyPreference={user?.crochetTerminologyPreference ?? null}
      userLeftHanded={user?.crochetLeftHanded ?? false}
      pattern={pattern}
      progress={progress}
      myProjects={myProjects}
      yarnWeights={yarnWeights}
      recentlyAdded={recentlyAdded}
    />
  )
}

async function loadProgress(userId: string, crochetPatternId: string) {
  const row = await prisma.crochetProjectProgress.findUnique({
    where: { userId_crochetPatternId: { userId, crochetPatternId } },
    select: {
      currentRow: true,
      currentSection: true,
      completedRows: true,
      notes: true,
      perRowNotes: true,
      gradedSize: true,
      customMeasurements: true,
      leftHandedOverride: true,
      terminologyOverride: true,
      preferredView: true,
      countByCluster: true,
      lastWorkedAt: true,
      completedAt: true,
      projectSetup: true,
    },
  })
  if (!row) return null
  return {
    currentRow: row.currentRow,
    currentSection: row.currentSection,
    completedRows: (row.completedRows as Record<string, number[]>) ?? {},
    notes: row.notes,
    perRowNotes: (row.perRowNotes as Record<string, string>) ?? {},
    gradedSize: row.gradedSize,
    customMeasurements: row.customMeasurements as Record<string, number> | null,
    leftHandedOverride: row.leftHandedOverride,
    terminologyOverride: row.terminologyOverride as 'uk' | 'us' | null,
    preferredView: row.preferredView as 'written' | 'chart' | 'schematic' | null,
    countByCluster: row.countByCluster,
    lastWorkedAt: row.lastWorkedAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    projectSetup: row.projectSetup as import('@/components/studio/crochet/types').ProjectSetup | null,
  }
}
