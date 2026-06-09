/**
 * Server-side loaders that map a Tutorial row (or a hand-crafted
 * demo) onto the KnittingPatternData shape the Studio consumes. The
 * loaders shape the same data Tutorial.body contains, plus the
 * knitting-specific K-1 fields, into a typed pattern object.
 *
 * v1 status: the dedicated KnittingPattern model is K-4 follow-on.
 * Until it lands, knitting patterns live as Tutorial rows under the
 * `knitting` Category with type=PATTERN.
 */

import { prisma } from '@homemade/db'

import type {
  CastOnMethod,
  BindOffMethod,
  InTheRoundMethod,
  KnittingPatternData,
  MyKnittingProjectListItem,
} from '@/components/studio/knitting/types'

interface LoadArgs {
  tutorialId?: string
  slug?: string
}

export async function loadKnittingPatternForStudio(
  args: LoadArgs,
): Promise<KnittingPatternData | null> {
  if (!args.tutorialId && !args.slug) return null
  const tutorial = await prisma.tutorial.findFirst({
    where: args.tutorialId
      ? { id: args.tutorialId }
      : { slug: args.slug ?? '' },
    select: {
      id: true,
      slug: true,
      title: true,
      castOnMethod: true,
      bindOffMethod: true,
      inTheRoundMethod: true,
      gaugeText: true,
      finishedSizeText: true,
      craftStitchSlugs: true,
      craftTechniqueTags: true,
      primaryYarnWeight: {
        select: { standardCategory: true, canonicalName: true },
      },
      primaryNeedle: { select: { mmSize: true, canonicalName: true } },
      heroMediaId: true,
      category: { select: { slug: true } },
    },
  })
  if (!tutorial) return null

  return {
    id: tutorial.id,
    slug: tutorial.slug,
    name: tutorial.title,
    description: null,
    rowsStructured: [],
    chartData: null,
    schematicMediaId: null,
    thumbnailMediaId: tutorial.heroMediaId,
    construction:
      (tutorial.inTheRoundMethod && tutorial.inTheRoundMethod !== 'STRAIGHT_FLAT')
        ? 'IN_THE_ROUND'
        : 'FLAT',
    shapeCategory: null,
    sizesGraded: null,
    yardageBySize: null,
    gaugeText: tutorial.gaugeText,
    finishedSizeText: tutorial.finishedSizeText,
    abbreviationsUsed: [],
    specialStitchesUsed: [],
    craftStitchSlugs: tutorial.craftStitchSlugs,
    craftTechniqueTags: tutorial.craftTechniqueTags,
    repeatRowGroups: null,
    difficulty: null,
    premium: false,
    designerSlug: null,
    designerName: null,
    sourceTutorialSlug: tutorial.slug,
    sourceTutorialCategorySlug: tutorial.category?.slug ?? null,
    sourceTutorialId: tutorial.id,
    primaryYarnWeightCategory: tutorial.primaryYarnWeight?.standardCategory ?? null,
    primaryYarnWeightName: tutorial.primaryYarnWeight?.canonicalName ?? null,
    primaryNeedleMm: tutorial.primaryNeedle?.mmSize ?? null,
    primaryNeedleName: tutorial.primaryNeedle?.canonicalName ?? null,
    castOnMethod: (tutorial.castOnMethod as CastOnMethod | null) ?? null,
    bindOffMethod: (tutorial.bindOffMethod as BindOffMethod | null) ?? null,
    inTheRoundMethod:
      (tutorial.inTheRoundMethod as InTheRoundMethod | null) ?? null,
  }
}

/**
 * Smoke-test sample pattern. Returns a hand-crafted KnittingChartData
 * the chart viewport can render without a real KnittingPattern row.
 * Used by /studio/knitting?demo=1 to verify the K-2 contract end-to-
 * end and by the print page when the slug doesn't resolve.
 */
export function loadDemoKnittingPattern(): KnittingPatternData {
  return {
    id: 'demo-mosaic-hat',
    slug: 'demo-mosaic-hat',
    name: 'Mosaic Hat — sample',
    description: 'A short cable-and-rib mosaic hat used to demonstrate the Studio.',
    rowsStructured: [
      {
        section: 'Brim',
        rowNumber: 1,
        rowLabel: 'Rnd 1',
        instruction: 'K1, p1 around.',
        stitchCount: 96,
        isRoundNotRow: true,
      },
      {
        section: 'Brim',
        rowNumber: 2,
        rowLabel: 'Rnd 2',
        instruction: 'K1, p1 around.',
        stitchCount: 96,
        isRoundNotRow: true,
      },
      {
        section: 'Body',
        rowNumber: 1,
        rowLabel: 'Rnd 1',
        instruction: 'Work cable chart, repeating 8-stitch pattern across.',
        stitchCount: 96,
        isRoundNotRow: true,
      },
      {
        section: 'Body',
        rowNumber: 2,
        rowLabel: 'Rnd 2',
        instruction: 'Knit all stitches.',
        stitchCount: 96,
        isRoundNotRow: true,
      },
    ],
    chartData: buildDemoChart(),
    schematicMediaId: null,
    thumbnailMediaId: null,
    construction: 'IN_THE_ROUND',
    shapeCategory: 'HAT',
    sizesGraded: null,
    yardageBySize: { default: 220 },
    gaugeText: '22 sts × 30 rows = 10 cm in stockinette',
    finishedSizeText: '56 cm head circumference',
    abbreviationsUsed: ['k', 'p', 'C4F'],
    specialStitchesUsed: ['C4F'],
    craftStitchSlugs: ['knit', 'purl', 'cable'],
    craftTechniqueTags: ['cable'],
    repeatRowGroups: [
      {
        startRow: 1,
        endRow: 4,
        label: 'Cable repeat',
        defaultTargetCm: 18,
      },
    ],
    difficulty: 'intermediate',
    premium: false,
    designerSlug: null,
    designerName: 'Homemade demo',
    sourceTutorialSlug: null,
    sourceTutorialCategorySlug: null,
    sourceTutorialId: null,
    primaryYarnWeightCategory: 4,
    primaryYarnWeightName: 'Worsted (CYC 4)',
    primaryNeedleMm: 4.5,
    primaryNeedleName: '4.5 mm needle',
    castOnMethod: 'LONG_TAIL',
    bindOffMethod: 'STRETCHY',
    inTheRoundMethod: 'MAGIC_LOOP',
  }
}

export async function loadKnittingProjectsForUser(
  _userId: string,
): Promise<MyKnittingProjectListItem[]> {
  // KnittingProjectProgress is K-4. v1: return empty so the grid hides
  // and the empty hero is the entire surface for signed-in users
  // without a known sync path.
  return []
}

/**
 * Hand-crafted KnittingChartData against K-2's locked contract. An
 * 8-stitch cable repeat over four rounds with one cable crossing at
 * round 1 (C4F holding two stitches in front). Used by ?demo=1 in
 * the Studio and the print page so the chart viewport exercises the
 * full K-2 path end-to-end without requiring a real pattern in the
 * database.
 */
function buildDemoChart() {
  return {
    schemaVersion: 1 as const,
    type: 'CABLE' as const,
    grid: {
      width: 8,
      height: 4,
      // Sparse map: only non-default cells are listed. Default symbol
      // for CABLE is 'k' (knit).
      cells: [
        // Round 1: purl borders, cable in the middle
        { x: 2, y: 0, s: 'p' },
        { x: 5, y: 0, s: 'p' },
        // Rounds 2-4: same borders, knit fill
        { x: 2, y: 1, s: 'p' },
        { x: 5, y: 1, s: 'p' },
        { x: 2, y: 2, s: 'p' },
        { x: 5, y: 2, s: 'p' },
        { x: 2, y: 3, s: 'p' },
        { x: 5, y: 3, s: 'p' },
      ],
      cables: [
        {
          startX: 3,
          endX: 4,
          y: 0,
          crossDirection: 'LEFT' as const,
          type: 'C4F',
        },
      ],
    },
    metadata: {
      construction: 'IN_THE_ROUND' as const,
      rsRowsStartFrom: 'RIGHT' as const,
      designer: 'Homemade demo',
      title: '4-row cable repeat',
    },
  }
}
