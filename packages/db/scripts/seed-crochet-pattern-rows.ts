/**
 * Crochet pattern row seed — idempotent upsert of the seed CrochetPattern
 * rows that back the Studio Crochet active-project surface.
 *
 * v1 seeds one row: the three-round granny square. The data lives inline
 * in this file rather than read from a JSON brief because the schema
 * shape is sibling-to-Pattern (not a Tutorial), and we want the row to
 * stay in sync with the existing granny-square Tutorial body — see
 * `drafts/granny-square-basic-three-round.json` for the prose pattern.
 *
 * After this runs the granny-square Tutorial carries a
 * `crochetPatternInset` body node that points at this row by slug; the
 * Studio Crochet shell loads it via `/studio/crochet?crochetPatternId=...`.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-crochet-pattern-rows.ts
 *
 * Wired into deploy.yml after seed-crochet-starter-content.ts.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

interface RowSpec {
  rowsStructured: Array<{
    section: string
    rowNumber: number
    rowLabel?: string
    isRoundNotRow?: boolean
    instruction: string
    stitchCount?: number
    stitchCountAsCluster?: number
    colourLabel?: string
    colourHex?: string | null
    referencePhotoMediaId?: string | null
    helpNote?: string
    helpTroubleshooterTutorialSlug?: string
  }>
  chartData: unknown
  thumbnailSlug?: string
  schematicSlug?: string
}

interface CrochetPatternSpec {
  slug: string
  name: string
  description: string
  yarnWeightSlug: string
  hookSlug: string
  format: 'WRITTEN_ONLY' | 'WRITTEN_AND_CHART' | 'CHART_ONLY'
  construction: 'TOP_DOWN_SEAMLESS' | 'BOTTOM_UP_SEAMLESS' | 'SEAMED' | 'SEAMLESS_ROUND' | 'ROW' | 'MOTIF_JOIN' | 'AMIGURUMI' | 'OTHER'
  shapeCategory: 'BLANKET' | 'GARMENT' | 'AMIGURUMI' | 'MOTIF' | 'ACCESSORY' | 'HOMEWARE' | 'DECOR' | 'WEARABLE_ACCESSORY' | 'LACEWORK' | 'BAG' | 'HAT' | 'SCARF' | 'SHAWL'
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  terminologyConvention: 'uk' | 'us'
  gaugeText: string
  finishedSizeText: string
  abbreviationsUsed: string[]
  craftStitchSlugs: string[]
  craftTechniqueTags: string[]
  premium: boolean
  yardageBySize: Record<string, number>
  rows: RowSpec['rowsStructured']
  chartData: unknown
  clusterCountByRound: Record<string, number>
  sourceTutorialSlug: string
  thumbnailMediaId?: string
}

const GRANNY_SQUARE: CrochetPatternSpec = {
  slug: 'granny-square-basic-three-round',
  name: 'Granny square, three rounds',
  description:
    'The Victorian three-round granny square in DK cotton. Twelve clusters of three trebles separated by chain spaces, built outward from a magic-ring centre. The starter motif behind every granny blanket.',
  yarnWeightSlug: 'dk',
  hookSlug: 'crochet-hook-4-0mm',
  format: 'WRITTEN_AND_CHART',
  construction: 'MOTIF_JOIN',
  shapeCategory: 'MOTIF',
  difficulty: 'BEGINNER',
  terminologyConvention: 'uk',
  gaugeText:
    'Each three-round granny square measures 9 to 10 cm across the diagonal in DK cotton on a 4 mm hook, before blocking. Blocked, the squares settle to 10 by 10 cm.',
  finishedSizeText: '10 by 10 cm per square, blocked.',
  abbreviationsUsed: ['ch', 'sl st', 'tr', 'MR'],
  craftStitchSlugs: [
    'crochet-chain',
    'crochet-slip-stitch',
    'crochet-treble',
    'crochet-magic-ring',
    'crochet-treble-cluster',
  ],
  craftTechniqueTags: ['magic-ring', 'blocking'],
  premium: false,
  yardageBySize: { default: 40 },
  sourceTutorialSlug: 'granny-square-basic-three-round',
  rows: [
    {
      section: 'Pattern',
      rowNumber: 1,
      rowLabel: 'Round 1 (centre colour)',
      isRoundNotRow: true,
      instruction:
        'Form a magic ring. Ch 3 (counts as first treble), 2 tr into the ring, ch 2 (first corner space), [3 tr into the ring, ch 2] three more times. Sl st to the top of the beginning ch-3 to join. Pull the tail to close the ring. Fasten off centre colour, leaving a 10 cm tail.',
      stitchCount: 12,
      stitchCountAsCluster: 4,
      colourLabel: 'centre colour',
      helpNote:
        'First time? The magic ring is the trickiest part of any granny square. Work the round before you pull the tail to close — once the stitches anchor the ring, the centre will stay shut. If you pull the tail too early the loop slides free.',
      helpTroubleshooterTutorialSlug: 'crochet-magic-ring',
    },
    {
      section: 'Pattern',
      rowNumber: 2,
      rowLabel: 'Round 2 (outer colour)',
      isRoundNotRow: true,
      instruction:
        'Join the outer colour with a sl st into any ch-2 corner space. Ch 3 (counts as first treble), [2 tr into the same corner space, ch 2, 3 tr into the same corner space], the first corner is now formed. Then: ch 1, *(3 tr, ch 2, 3 tr) all into the next ch-2 corner space, ch 1, repeat from * twice more. Sl st to the top of the beginning ch-3 to join.',
      stitchCount: 24,
      stitchCountAsCluster: 8,
      colourLabel: 'outer colour',
      helpNote:
        'Round 2 starts the four-corner shape. Each ch-2 corner space gets two clusters of three trebles separated by ch 2; each side gets a single chain in between. Eight clusters total when round 2 is done.',
    },
    {
      section: 'Pattern',
      rowNumber: 3,
      rowLabel: 'Round 3 (outer colour, continuous)',
      isRoundNotRow: true,
      instruction:
        'Sl st across the next 2 trebles to bring the hook to the corner space. Ch 3 (counts as first treble), 2 tr into the corner space, ch 2, 3 tr into the same corner space (first corner formed). *Ch 1, 3 tr into the next ch-1 side space, ch 1, (3 tr, ch 2, 3 tr) into the next ch-2 corner space*, repeat from * to * twice more. Ch 1, 3 tr into the final ch-1 side space, ch 1. Sl st to the top of the beginning ch-3 to join. Fasten off, leaving a 10 cm tail for weaving in.',
      stitchCount: 36,
      stitchCountAsCluster: 12,
      colourLabel: 'outer colour',
      helpNote:
        'Round 3 is the finishing round. Twelve clusters total: two at each corner, one on each side. Block the square once you have woven in your ends so the corners sit square.',
    },
  ],
  chartData: {
    title: 'Granny square, three-round chart',
    layout: 'round',
    craft: 'crochet',
    terminologyConvention: 'uk',
    caption:
      'Read each round outwards from the centre. The chain-2 corner spaces sit at the four corners of the finished square; the chain-1 side spaces appear from round 2 onwards.',
    rounds: [
      {
        roundNumber: 1,
        label: 'Rnd 1',
        stitches: [
          { symbol: 'magic-ring', label: 'magic ring centre' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 2, label: 'ch 2 corner' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 2, label: 'ch 2 corner' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 2, label: 'ch 2 corner' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 2, label: 'ch 2 corner' },
        ],
      },
      {
        roundNumber: 2,
        label: 'Rnd 2',
        stitches: [
          { symbol: 'treble', count: 3, label: 'first cluster' },
          { symbol: 'chain', count: 2, label: 'ch 2 corner' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 1, label: 'ch 1 side' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 2, label: 'ch 2 corner' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 1, label: 'ch 1 side' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 2, label: 'ch 2 corner' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 1, label: 'ch 1 side' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 2, label: 'ch 2 corner' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 1, label: 'ch 1 side' },
        ],
      },
      {
        roundNumber: 3,
        label: 'Rnd 3',
        stitches: [
          { symbol: 'treble', count: 3, label: 'first cluster' },
          { symbol: 'chain', count: 2, label: 'ch 2 corner' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 1, label: 'ch 1 side' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 1, label: 'ch 1 side' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 2, label: 'ch 2 corner' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 1, label: 'ch 1 side' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 1, label: 'ch 1 side' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 2, label: 'ch 2 corner' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 1, label: 'ch 1 side' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 1, label: 'ch 1 side' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 2, label: 'ch 2 corner' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 1, label: 'ch 1 side' },
          { symbol: 'treble', count: 3 },
          { symbol: 'chain', count: 1, label: 'ch 1 side' },
        ],
      },
    ],
  },
  clusterCountByRound: { '1': 4, '2': 8, '3': 12 },
}

const PATTERNS: CrochetPatternSpec[] = [GRANNY_SQUARE]

async function main(): Promise<void> {
  const { prisma, Visibility } = await import('../src/index.js')

  console.log('[seed] Crochet pattern rows, upserting Studio CrochetPattern seeds.')

  for (const spec of PATTERNS) {
    const yarn = await prisma.yarnWeight.findUnique({ where: { slug: spec.yarnWeightSlug } })
    const hook = await prisma.crochetHook.findUnique({ where: { slug: spec.hookSlug } })
    const tutorial = await prisma.tutorial.findUnique({
      where: { slug: spec.sourceTutorialSlug },
      select: { id: true, subCategoryId: true },
    })

    if (!yarn) {
      console.warn(`[seed] SKIP ${spec.slug}, missing yarn weight ${spec.yarnWeightSlug}`)
      continue
    }
    if (!hook) {
      console.warn(`[seed] SKIP ${spec.slug}, missing hook ${spec.hookSlug}`)
      continue
    }
    if (!tutorial) {
      console.warn(`[seed] SKIP ${spec.slug}, source tutorial ${spec.sourceTutorialSlug} not yet published`)
      continue
    }

    const existing = await prisma.crochetPattern.findUnique({
      where: { slug: spec.slug },
      select: { id: true, rowsStructured: true, thumbnailMediaId: true },
    })

    // Preserve generated media IDs across re-runs. The pattern-rows
    // seed defines authoring content (instruction, count, colour
    // label, help note) but doesn't know about thumbnailMediaId or
    // per-row referencePhotoMediaId — those land via
    // seed-crochet-pattern-photos.ts. Merge them in here so a re-run
    // never wipes the photos.
    interface ExistingRowShape {
      section?: string
      rowNumber?: number
      referencePhotoMediaId?: string | null
    }
    const existingRows: ExistingRowShape[] = Array.isArray(existing?.rowsStructured)
      ? (existing.rowsStructured as ExistingRowShape[])
      : []
    const photoByKey = new Map<string, string>()
    for (const row of existingRows) {
      if (row?.referencePhotoMediaId && typeof row.referencePhotoMediaId === 'string') {
        photoByKey.set(`${row.section}:${row.rowNumber}`, row.referencePhotoMediaId)
      }
    }
    const mergedRows = spec.rows.map((row) => {
      const key = `${row.section}:${row.rowNumber}`
      const existingPhoto = photoByKey.get(key)
      if (existingPhoto && !row.referencePhotoMediaId) {
        return { ...row, referencePhotoMediaId: existingPhoto }
      }
      return row
    })

    const baseData = {
      name: spec.name,
      description: spec.description,
      rowsStructured: mergedRows as unknown,
      chartData: spec.chartData as unknown,
      format: spec.format,
      construction: spec.construction,
      shapeCategory: spec.shapeCategory,
      difficulty: spec.difficulty,
      premium: spec.premium,
      terminologyConvention: spec.terminologyConvention,
      gaugeText: spec.gaugeText,
      finishedSizeText: spec.finishedSizeText,
      abbreviationsUsed: spec.abbreviationsUsed,
      craftStitchSlugs: spec.craftStitchSlugs,
      craftTechniqueTags: spec.craftTechniqueTags,
      yardageBySize: spec.yardageBySize as unknown,
      clusterCountByRound: spec.clusterCountByRound as unknown,
      primaryYarnWeightId: yarn.id,
      primaryHookId: hook.id,
      sourceTutorialId: tutorial.id,
      subCategoryId: tutorial.subCategoryId,
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
      // Preserve hero thumbnail across re-runs unless spec explicitly sets one.
      ...(existing?.thumbnailMediaId && !spec.thumbnailMediaId
        ? { thumbnailMediaId: existing.thumbnailMediaId }
        : spec.thumbnailMediaId
        ? { thumbnailMediaId: spec.thumbnailMediaId }
        : {}),
    }

    if (existing) {
      await prisma.crochetPattern.update({
        where: { slug: spec.slug },
        data: baseData,
      })
      console.log(`[seed] UPDATED ${spec.slug} (id=${existing.id})`)
    } else {
      const created = await prisma.crochetPattern.create({
        data: {
          slug: spec.slug,
          ...baseData,
        },
        select: { id: true },
      })
      console.log(`[seed] CREATED ${spec.slug} (id=${created.id})`)
    }
  }

  console.log('[seed] Crochet pattern rows done.')
}

main()
  .catch((err) => {
    console.error('[seed] Unhandled error:', err)
    process.exit(1)
  })
  .finally(async () => {
    const { prisma } = await import('../src/index.js')
    await prisma.$disconnect()
  })
