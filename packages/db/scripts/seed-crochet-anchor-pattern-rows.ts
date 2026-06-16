/**
 * Crochet anchor pattern rows — idempotent upsert of the CrochetPattern rows
 * that back the five Dillmont-anchored PATTERN tutorials in the crochet anchor
 * batch (2026-06-16). Sibling of `seed-crochet-pattern-rows.ts`; same shape, so
 * the Studio Crochet surface and the makeability gate's chart check both read a
 * real `chartData` on a linked CrochetPattern row.
 *
 * Each spec carries the structured rows (`rowsStructured`) and reads the chart
 * (`chartData`) straight from the matching anchor tutorial JSON's
 * `crochet.chartDefinition`, so the chart on the CrochetPattern stays identical
 * to the chart rendered on the tutorial. The row is linked back to its tutorial
 * via `sourceTutorialId`, which the makeability loader reads as
 * `crochetPatternsSourced`.
 *
 * Run AFTER the anchor tutorials are uploaded (the tutorial must exist for the
 * sourceTutorialId link to resolve):
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-crochet-anchor-pattern-rows.ts
 */

import type { Prisma } from '../src/index.js'
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
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
  section: string
  rowNumber: number
  rowLabel: string
  isRoundNotRow: boolean
  instruction: string
  stitchCount: number
}

interface CrochetPatternSpec {
  slug: string
  file: string
  name: string
  description: string
  yarnWeightSlug: string
  hookSlug: string
  format: 'WRITTEN_ONLY' | 'WRITTEN_AND_CHART' | 'CHART_ONLY'
  construction: 'TOP_DOWN_SEAMLESS' | 'BOTTOM_UP_SEAMLESS' | 'SEAMED' | 'SEAMLESS_ROUND' | 'ROW' | 'MOTIF_JOIN' | 'AMIGURUMI' | 'OTHER'
  shapeCategory: 'BLANKET' | 'GARMENT' | 'AMIGURUMI' | 'MOTIF' | 'ACCESSORY' | 'HOMEWARE' | 'DECOR' | 'WEARABLE_ACCESSORY' | 'LACEWORK' | 'BAG' | 'HAT' | 'SCARF' | 'SHAWL'
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  gaugeText: string
  finishedSizeText: string
  abbreviationsUsed: string[]
  craftStitchSlugs: string[]
  craftTechniqueTags: string[]
  yardageBySize: Record<string, number>
  rows: RowSpec[]
}

const ANCHOR_DIR = resolve(__dirname, 'anchor-crochet')

const PATTERNS: CrochetPatternSpec[] = [
  {
    slug: 'crochet-simple-chain-loop-edging',
    file: 'pattern-chain-loop-edging.json',
    name: 'Simple chain-loop edging',
    description: 'A plain looped scallop edging worked in 4-ply cotton: one firm base row of double crochet, then a row of chain loops. Lengthens to fit any straight edge.',
    yarnWeightSlug: 'fingering',
    hookSlug: 'crochet-hook-3-0mm',
    format: 'WRITTEN_AND_CHART',
    construction: 'ROW',
    shapeCategory: 'LACEWORK',
    difficulty: 'BEGINNER',
    gaugeText: '16 double crochet to 10 cm in 4-ply cotton on a 3 mm hook.',
    finishedSizeText: 'About 12 cm long and 3 cm deep as written; lengthen in multiples of 3 chains.',
    abbreviationsUsed: ['ch', 'dc', 'st'],
    craftStitchSlugs: ['crochet-chain', 'crochet-double-uk'],
    craftTechniqueTags: ['edging', 'working-in-rows'],
    yardageBySize: { default: 15 },
    rows: [
      { section: 'Pattern', rowNumber: 1, rowLabel: 'Row 1', isRoundNotRow: false, instruction: 'Make a foundation chain of 20 chains. Work 1 dc in the 2nd chain from the hook, then 1 dc in each of the next 18 chains.', stitchCount: 19 },
      { section: 'Pattern', rowNumber: 2, rowLabel: 'Row 2', isRoundNotRow: false, instruction: 'Ch 1 and turn. 1 dc in the first dc. [Ch 5, skip 2 dc, 1 dc in the next dc] 6 times. Six chain loops sit between 7 anchor stitches. Fasten off.', stitchCount: 7 },
    ],
  },
  {
    slug: 'crochet-picot-edging',
    file: 'pattern-picot-edging.json',
    name: 'Picot edging',
    description: 'A pointed picot trim worked in 4-ply cotton: a firm base row, then a row of small picot points. The classic finish for collars, cuffs, and lace edges.',
    yarnWeightSlug: 'fingering',
    hookSlug: 'crochet-hook-3-0mm',
    format: 'WRITTEN_AND_CHART',
    construction: 'ROW',
    shapeCategory: 'LACEWORK',
    difficulty: 'BEGINNER',
    gaugeText: '16 double crochet to 10 cm in 4-ply cotton on a 3 mm hook.',
    finishedSizeText: 'About 12 cm long and 2 cm deep as written; lengthen in multiples of 2 stitches.',
    abbreviationsUsed: ['ch', 'dc', 'sl st', 'st'],
    craftStitchSlugs: ['crochet-double-uk', 'crochet-chain', 'crochet-slip-stitch', 'crochet-picot'],
    craftTechniqueTags: ['edging', 'working-in-rows'],
    yardageBySize: { default: 12 },
    rows: [
      { section: 'Pattern', rowNumber: 1, rowLabel: 'Row 1', isRoundNotRow: false, instruction: 'Make a foundation chain of 20 chains. Work 1 dc in the 2nd chain from the hook, then 1 dc in each of the next 18 chains.', stitchCount: 19 },
      { section: 'Pattern', rowNumber: 2, rowLabel: 'Row 2', isRoundNotRow: false, instruction: 'Ch 1 and turn. 1 dc in the first dc. [Ch 3, sl st into the 3rd chain from the hook to make a picot, skip 1 dc, 1 dc in the next dc] 9 times. Nine picots sit between 10 anchor stitches. Fasten off.', stitchCount: 10 },
    ],
  },
  {
    slug: 'crochet-solid-treble-square-motif',
    file: 'pattern-solid-square-motif.json',
    name: 'Solid treble square motif',
    description: 'A dense three-round square in DK cotton, treble filling every stitch with a chain-2 space at each corner. A firmer building block than the open granny square.',
    yarnWeightSlug: 'dk',
    hookSlug: 'crochet-hook-4-0mm',
    format: 'WRITTEN_AND_CHART',
    construction: 'SEAMLESS_ROUND',
    shapeCategory: 'MOTIF',
    difficulty: 'BEGINNER',
    gaugeText: 'Rounds 1 to 3 make a square about 10 cm across in DK cotton on a 4 mm hook, blocked.',
    finishedSizeText: 'About 10 by 10 cm, blocked.',
    abbreviationsUsed: ['ch', 'tr', 'sl st', 'sp', 'st', 'MR'],
    craftStitchSlugs: ['crochet-magic-ring', 'crochet-treble', 'crochet-chain', 'crochet-slip-stitch'],
    craftTechniqueTags: ['working-in-the-round', 'magic-ring', 'blocking'],
    yardageBySize: { default: 18 },
    rows: [
      { section: 'Pattern', rowNumber: 1, rowLabel: 'Round 1', isRoundNotRow: true, instruction: 'Form a magic ring. Ch 3 (counts as the first treble), 2 tr into the ring, ch 2, [3 tr into the ring, ch 2] 3 times. Sl st to the top of the ch 3 to join, then pull the tail to close the ring.', stitchCount: 12 },
      { section: 'Pattern', rowNumber: 2, rowLabel: 'Round 2', isRoundNotRow: true, instruction: 'Sl st into the next ch-2 corner space. Ch 3, then 2 tr, ch 2, 3 tr all into the same corner space. [1 tr in each of the next 3 tr, then 3 tr, ch 2, 3 tr into the next ch-2 corner space] 3 times. 1 tr in each of the next 3 tr. Sl st to the top of the ch 3 to join.', stitchCount: 36 },
      { section: 'Pattern', rowNumber: 3, rowLabel: 'Round 3', isRoundNotRow: true, instruction: 'Sl st into the next ch-2 corner space. Ch 3, then 2 tr, ch 2, 3 tr all into the same corner space. [1 tr in each of the next 9 tr, then 3 tr, ch 2, 3 tr into the next ch-2 corner space] 3 times. 1 tr in each of the next 9 tr. Sl st to the top of the ch 3 to join. Fasten off.', stitchCount: 60 },
    ],
  },
  {
    slug: 'crochet-solid-hexagon-motif',
    file: 'pattern-hexagon-motif.json',
    name: 'Solid hexagon motif',
    description: 'A small solid hexagon in DK cotton, treble filling each side with a single chain at each of the six corners. Two rounds make a coaster-sized motif that tiles with no gaps.',
    yarnWeightSlug: 'dk',
    hookSlug: 'crochet-hook-4-0mm',
    format: 'WRITTEN_AND_CHART',
    construction: 'SEAMLESS_ROUND',
    shapeCategory: 'MOTIF',
    difficulty: 'BEGINNER',
    gaugeText: 'Rounds 1 and 2 make a hexagon about 9 cm point to point in DK cotton on a 4 mm hook, blocked.',
    finishedSizeText: 'About 9 cm across the points, blocked.',
    abbreviationsUsed: ['ch', 'tr', 'sl st', 'sp', 'st', 'MR'],
    craftStitchSlugs: ['crochet-magic-ring', 'crochet-treble', 'crochet-chain', 'crochet-slip-stitch'],
    craftTechniqueTags: ['working-in-the-round', 'magic-ring', 'blocking'],
    yardageBySize: { default: 14 },
    rows: [
      { section: 'Pattern', rowNumber: 1, rowLabel: 'Round 1', isRoundNotRow: true, instruction: 'Form a magic ring. Ch 3 (counts as the first treble), 2 tr into the ring, ch 1, [3 tr into the ring, ch 1] 5 times. Sl st to the top of the ch 3 to join, then pull the tail to close the ring.', stitchCount: 18 },
      { section: 'Pattern', rowNumber: 2, rowLabel: 'Round 2', isRoundNotRow: true, instruction: 'Sl st into the next ch-1 corner space. Ch 3, then 2 tr, ch 1, 3 tr all into the same corner space. [1 tr in each of the next 3 tr, then 3 tr, ch 1, 3 tr into the next ch-1 corner space] 5 times. 1 tr in each of the next 3 tr. Sl st to the top of the ch 3 to join. Fasten off.', stitchCount: 54 },
    ],
  },
  {
    slug: 'crochet-shell-lace-edging',
    file: 'pattern-shell-lace-edging.json',
    name: 'Shell lace edging',
    description: 'A deeper scalloped edging in 4-ply cotton: a firm base row topped with fans of five treble, each anchored by a double crochet. A generous lace border.',
    yarnWeightSlug: 'fingering',
    hookSlug: 'crochet-hook-3-0mm',
    format: 'WRITTEN_AND_CHART',
    construction: 'ROW',
    shapeCategory: 'LACEWORK',
    difficulty: 'INTERMEDIATE',
    gaugeText: '16 double crochet to 10 cm in 4-ply cotton on a 3 mm hook.',
    finishedSizeText: 'About 12 cm long and 4 cm deep as written; lengthen in multiples of 6 stitches.',
    abbreviationsUsed: ['ch', 'dc', 'tr', 'st'],
    craftStitchSlugs: ['crochet-double-uk', 'crochet-treble', 'crochet-shell', 'crochet-chain'],
    craftTechniqueTags: ['edging', 'lacework', 'working-in-rows'],
    yardageBySize: { default: 18 },
    rows: [
      { section: 'Pattern', rowNumber: 1, rowLabel: 'Row 1', isRoundNotRow: false, instruction: 'Make a foundation chain of 20 chains. Work 1 dc in the 2nd chain from the hook, then 1 dc in each of the next 18 chains.', stitchCount: 19 },
      { section: 'Pattern', rowNumber: 2, rowLabel: 'Row 2', isRoundNotRow: false, instruction: 'Ch 1 and turn. 1 dc in the first dc. [Skip 2 dc, 5 tr in the next dc to make a shell, skip 2 dc, 1 dc in the next dc] 3 times. Three shells sit between 4 anchor stitches. Fasten off.', stitchCount: 19 },
    ],
  },
]

function readChartData(file: string): unknown {
  const path = resolve(ANCHOR_DIR, file)
  const raw = JSON.parse(readFileSync(path, 'utf8')) as {
    crochet?: { chartDefinition?: unknown }
  }
  const chart = raw.crochet?.chartDefinition
  if (!chart) throw new Error(`No crochet.chartDefinition found in ${file}`)
  return chart
}

async function main(): Promise<void> {
  const { prisma, Visibility } = await import('../src/index.js')

  console.log('[seed] Crochet anchor pattern rows, upserting Studio CrochetPattern rows.')

  for (const spec of PATTERNS) {
    const yarn = await prisma.yarnWeight.findUnique({ where: { slug: spec.yarnWeightSlug } })
    const hook = await prisma.crochetHook.findUnique({ where: { slug: spec.hookSlug } })
    const tutorial = await prisma.tutorial.findUnique({
      where: { slug: spec.slug },
      select: { id: true, subCategoryId: true },
    })

    if (!yarn) { console.warn(`[seed] SKIP ${spec.slug}, missing yarn weight ${spec.yarnWeightSlug}`); continue }
    if (!hook) { console.warn(`[seed] SKIP ${spec.slug}, missing hook ${spec.hookSlug}`); continue }
    if (!tutorial) { console.warn(`[seed] SKIP ${spec.slug}, source tutorial not found, upload it first`); continue }

    const chartData = readChartData(spec.file)

    const baseData = {
      name: spec.name,
      description: spec.description,
      rowsStructured: spec.rows as unknown as Prisma.InputJsonValue,
      chartData: chartData as Prisma.InputJsonValue,
      format: spec.format,
      construction: spec.construction,
      shapeCategory: spec.shapeCategory,
      difficulty: spec.difficulty,
      premium: false,
      terminologyConvention: 'uk',
      gaugeText: spec.gaugeText,
      finishedSizeText: spec.finishedSizeText,
      abbreviationsUsed: spec.abbreviationsUsed,
      craftStitchSlugs: spec.craftStitchSlugs,
      craftTechniqueTags: spec.craftTechniqueTags,
      yardageBySize: spec.yardageBySize as Prisma.InputJsonValue,
      primaryYarnWeightId: yarn.id,
      primaryHookId: hook.id,
      sourceTutorialId: tutorial.id,
      subCategoryId: tutorial.subCategoryId,
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
    }

    const existing = await prisma.crochetPattern.findUnique({ where: { slug: spec.slug }, select: { id: true } })
    if (existing) {
      await prisma.crochetPattern.update({ where: { slug: spec.slug }, data: baseData })
      console.log(`[seed] UPDATED ${spec.slug} (id=${existing.id})`)
    } else {
      const created = await prisma.crochetPattern.create({ data: { slug: spec.slug, ...baseData }, select: { id: true } })
      console.log(`[seed] CREATED ${spec.slug} (id=${created.id})`)
    }
  }

  console.log('[seed] Crochet anchor pattern rows done.')
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
