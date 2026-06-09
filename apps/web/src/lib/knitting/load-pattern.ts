/**
 * Server-side loaders that map a KnittingPattern row (or a Tutorial
 * row, or a hand-crafted demo) onto the KnittingPatternData shape
 * the Studio consumes.
 *
 * Order of resolution:
 *   1. KnittingPattern by slug (K-4 canonical source).
 *   2. Tutorial fallback by id or slug (K-1 + K-3 source — kept for
 *      back-compat with Tutorial rows authored before K-4 shipped
 *      the dedicated pattern model).
 *   3. Demo fallback handled by `loadDemoKnittingPattern` at the page
 *      level.
 */

import { prisma } from '@homemade/db'

import type {
  CastOnMethod,
  BindOffMethod,
  InTheRoundMethod,
  KnittingPatternData,
  KnittingShape,
  MyKnittingProjectListItem,
  PatternRow,
} from '@/components/studio/knitting/types'
import type { KnittingChartData } from '@/lib/knitting/renderer/types'

// Prisma Decimal serialises with .toString(). The runtime type lives at
// `@prisma/client/runtime/library` but that sub-path is not exposed
// reliably through the package's exports config in pnpm monorepos.
// The structural type below is enough for the converter below.
interface PrismaDecimalLike {
  toString(): string
}

interface LoadArgs {
  tutorialId?: string
  slug?: string
}

// CYC yarn-weight category integer per the standard chart (0 = lace,
// 7 = jumbo). Maps the KnittingYarnWeightStandard enum onto the
// renderer's existing numeric `primaryYarnWeightCategory` field so
// the Studio doesn't need to learn the enum.
const YARN_WEIGHT_CATEGORY: Record<string, number> = {
  LACE: 0,
  FINGERING: 1,
  SPORT: 2,
  DK: 3,
  WORSTED: 4,
  ARAN: 4,
  BULKY: 5,
  SUPER_BULKY: 6,
  JUMBO: 7,
}

// Human-readable name for the enum slug. Mirrors the CYC labels.
const YARN_WEIGHT_NAME: Record<string, string> = {
  LACE: 'Lace (CYC 0)',
  FINGERING: 'Fingering (CYC 1)',
  SPORT: 'Sport (CYC 2)',
  DK: 'DK (CYC 3)',
  WORSTED: 'Worsted (CYC 4)',
  ARAN: 'Aran (CYC 4)',
  BULKY: 'Bulky (CYC 5)',
  SUPER_BULKY: 'Super bulky (CYC 6)',
  JUMBO: 'Jumbo (CYC 7)',
}

function decimalToNumber(value: PrismaDecimalLike | null | undefined): number | null {
  if (value === null || value === undefined) return null
  return Number(value.toString())
}

export async function loadKnittingPatternForStudio(
  args: LoadArgs,
): Promise<KnittingPatternData | null> {
  if (!args.tutorialId && !args.slug) return null

  // 1. Try the K-4 canonical source first.
  if (args.slug) {
    const pattern = await prisma.knittingPattern.findUnique({
      where: { slug: args.slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        rowByRow: true,
        chartData: true,
        schematicMediaId: true,
        thumbnailMediaId: true,
        heroMediaId: true,
        projectShape: true,
        techniqueDisciplines: true,
        castOnMethod: true,
        bindOffMethod: true,
        inTheRoundMethod: true,
        gaugeText: true,
        finishedSizeText: true,
        sizesGraded: true,
        yardageBySize: true,
        abbreviationsUsed: true,
        specialStitchesUsed: true,
        craftStitchSlugs: true,
        craftTechniqueTags: true,
        repeatRowGroups: true,
        difficulty: true,
        premium: true,
        yarnWeightStandard: true,
        needleSizeMm: true,
        designer: { select: { slug: true, displayName: true } },
        tutorial: {
          select: { id: true, slug: true, category: { select: { slug: true } } },
        },
      },
    })
    if (pattern) {
      const inTheRound = pattern.inTheRoundMethod
      return {
        id: pattern.id,
        slug: pattern.slug,
        name: pattern.name,
        description: pattern.description,
        rowsStructured: (Array.isArray(pattern.rowByRow)
          ? (pattern.rowByRow as unknown as PatternRow[])
          : []),
        chartData: (pattern.chartData as unknown as KnittingChartData | null) ?? null,
        schematicMediaId: pattern.schematicMediaId,
        thumbnailMediaId: pattern.thumbnailMediaId ?? pattern.heroMediaId,
        construction:
          inTheRound && inTheRound !== 'STRAIGHT_FLAT' ? 'IN_THE_ROUND' : 'FLAT',
        shapeCategory: mapProjectShape(pattern.projectShape),
        sizesGraded: (pattern.sizesGraded as KnittingPatternData['sizesGraded']) ?? null,
        yardageBySize:
          (pattern.yardageBySize as KnittingPatternData['yardageBySize']) ?? null,
        gaugeText: pattern.gaugeText,
        finishedSizeText: pattern.finishedSizeText,
        abbreviationsUsed: pattern.abbreviationsUsed,
        specialStitchesUsed: pattern.specialStitchesUsed,
        craftStitchSlugs: pattern.craftStitchSlugs,
        craftTechniqueTags: pattern.craftTechniqueTags,
        repeatRowGroups:
          (pattern.repeatRowGroups as KnittingPatternData['repeatRowGroups']) ??
          null,
        difficulty: pattern.difficulty,
        premium: pattern.premium,
        designerSlug: pattern.designer?.slug ?? null,
        designerName: pattern.designer?.displayName ?? null,
        sourceTutorialSlug: pattern.tutorial?.slug ?? null,
        sourceTutorialCategorySlug: pattern.tutorial?.category?.slug ?? null,
        sourceTutorialId: pattern.tutorial?.id ?? null,
        primaryYarnWeightCategory: pattern.yarnWeightStandard
          ? YARN_WEIGHT_CATEGORY[pattern.yarnWeightStandard] ?? null
          : null,
        primaryYarnWeightName: pattern.yarnWeightStandard
          ? YARN_WEIGHT_NAME[pattern.yarnWeightStandard] ?? null
          : null,
        primaryNeedleMm: decimalToNumber(pattern.needleSizeMm),
        primaryNeedleName: null,
        castOnMethod: pattern.castOnMethod
          ? mapKnittingPatternCastOn(pattern.castOnMethod)
          : null,
        bindOffMethod: pattern.bindOffMethod
          ? mapKnittingPatternBindOff(pattern.bindOffMethod)
          : null,
        inTheRoundMethod: inTheRound as InTheRoundMethod | null,
      }
    }
  }

  // 2. Tutorial fallback for K-1 / K-3 rows authored before K-4.
  const tutorial = await prisma.tutorial.findFirst({
    where: args.tutorialId ? { id: args.tutorialId } : { slug: args.slug ?? '' },
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
      tutorial.inTheRoundMethod && tutorial.inTheRoundMethod !== 'STRAIGHT_FLAT'
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
    inTheRoundMethod: (tutorial.inTheRoundMethod as InTheRoundMethod | null) ?? null,
  }
}

function mapProjectShape(shape: string | null | undefined): KnittingShape | null {
  if (!shape) return null
  switch (shape) {
    case 'SCARF':
      return 'ACCESSORY'
    case 'HAT':
      return 'HAT'
    case 'SHAWL':
      return 'SHAWL'
    case 'BLANKET':
      return 'BLANKET'
    case 'MITT_GLOVE':
      return 'ACCESSORY'
    case 'SOCK':
      return 'SOCKS'
    case 'SWEATER':
    case 'CARDIGAN':
    case 'VEST':
      return 'GARMENT'
    case 'OTHER':
    default:
      return 'ACCESSORY'
  }
}

// KnittingPattern.castOnMethod (Prisma enum) → Studio CastOnMethod
// (string union). Same value set; the enum is a superset of K-1's
// Tutorial.castOnMethod string vocabulary so every enum value is
// safely cast.
function mapKnittingPatternCastOn(value: string): CastOnMethod | null {
  return value as CastOnMethod
}

function mapKnittingPatternBindOff(value: string): BindOffMethod | null {
  return value as BindOffMethod
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
