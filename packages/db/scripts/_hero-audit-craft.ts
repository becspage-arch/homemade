/**
 * Hero quality audit — crochet + knitting + needlework (+ cross-stitch Pattern).
 *
 * READ ONLY. Classifies every PUBLISHED pattern + tutorial hero by source:
 *   DESIGNER_PROVIDED   — designer asset (Stitching Mama etc.), sacred per lock
 *   CHART_ENGINE_RENDER — in-house chart engine output, accurate by construction
 *   STOCK_PHOTO_MATCHED — keyword stock sourcing (unsplash/pexels/wikimedia/pixabay)
 *   FAL_GENERATED       — already Fal/Flux generated
 *   PROCEDURAL          — procedural fallback card
 *   MISSING             — heroMediaId null
 *   OTHER               — unrecognised source label (printed verbatim)
 *
 * Also reports chartData presence + shape/format/discipline so Part 2's
 * decision tree (charted -> render; non-charted product -> Fal; garment ->
 * defer) can be sized.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/_hero-audit-craft.ts
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

type Cls =
  | 'DESIGNER_PROVIDED'
  | 'CHART_ENGINE_RENDER'
  | 'STOCK_PHOTO_MATCHED'
  | 'FAL_GENERATED'
  | 'PROCEDURAL'
  | 'MISSING'
  | 'OTHER'

const STOCK = new Set(['unsplash', 'pexels', 'wikimedia', 'pixabay', 'usda', 'nlm', 'met', 'smithsonian'])
const FAL = new Set(['flux-schnell', 'flux-pro', 'flux-product-shot', 'sewing-hero-flat-flux', 'flux'])
const CHART = new Set(['in-house-chart-engine', 'chart-engine', 'synthetic-chart', 'crochet-chart-engine'])
const PROCEDURAL = new Set(['procedural-card', 'procedural'])
// Designer-provided labels seen historically. Anything containing these tokens
// is treated as designer asset. Stitching Mama imports + manual designer uploads.
const DESIGNER_TOKENS = ['designer', 'stitching-mama', 'stitchingmama', 'listing', 'mockup', 'original']

function classify(source: string | null): Cls {
  if (!source) return 'MISSING'
  const s = source.toLowerCase()
  if (STOCK.has(s)) return 'STOCK_PHOTO_MATCHED'
  if (FAL.has(s) || s.startsWith('flux')) return 'FAL_GENERATED'
  if (CHART.has(s) || s.includes('chart-engine') || s.includes('chart-render')) return 'CHART_ENGINE_RENDER'
  if (PROCEDURAL.has(s)) return 'PROCEDURAL'
  if (DESIGNER_TOKENS.some((t) => s.includes(t))) return 'DESIGNER_PROVIDED'
  return 'OTHER'
}

interface Row {
  source: string | null
  hasChart: boolean
  shape: string | null
  group: string // sub-cat / discipline / shape bucket label
}

function tally(rows: Row[]) {
  const byCls: Record<string, number> = {}
  const otherSources: Record<string, number> = {}
  const stockByChart = { charted: 0, uncharted: 0 }
  const missingByChart = { charted: 0, uncharted: 0 }
  for (const r of rows) {
    const c = classify(r.source)
    byCls[c] = (byCls[c] ?? 0) + 1
    if (c === 'OTHER') otherSources[r.source ?? '∅'] = (otherSources[r.source ?? '∅'] ?? 0) + 1
    if (c === 'STOCK_PHOTO_MATCHED') (r.hasChart ? stockByChart.charted++ : stockByChart.uncharted++)
    if (c === 'MISSING') (r.hasChart ? missingByChart.charted++ : missingByChart.uncharted++)
  }
  return { byCls, otherSources, stockByChart, missingByChart }
}

function printTally(label: string, rows: Row[]) {
  const t = tally(rows)
  console.log(`\n### ${label}  (n=${rows.length})`)
  const order: Cls[] = ['DESIGNER_PROVIDED', 'CHART_ENGINE_RENDER', 'STOCK_PHOTO_MATCHED', 'FAL_GENERATED', 'PROCEDURAL', 'MISSING', 'OTHER']
  for (const c of order) {
    if (t.byCls[c]) console.log(`  ${c.padEnd(20)} ${t.byCls[c]}`)
  }
  if (Object.keys(t.otherSources).length) {
    console.log('  OTHER sources breakdown:')
    for (const [k, v] of Object.entries(t.otherSources).sort((a, b) => b[1] - a[1])) {
      console.log(`      ${k} = ${v}`)
    }
  }
  console.log(`  STOCK split: charted=${t.stockByChart.charted} uncharted=${t.stockByChart.uncharted}`)
  console.log(`  MISSING split: charted=${t.missingByChart.charted} uncharted=${t.missingByChart.uncharted}`)
  // shape breakdown of the STOCK + MISSING (the fix candidates)
  const fix = rows.filter((r) => ['STOCK_PHOTO_MATCHED', 'MISSING'].includes(classify(r.source)))
  const byShape: Record<string, { charted: number; uncharted: number }> = {}
  for (const r of fix) {
    const k = r.shape ?? r.group ?? '∅'
    byShape[k] ??= { charted: 0, uncharted: 0 }
    if (r.hasChart) byShape[k].charted++
    else byShape[k].uncharted++
  }
  if (fix.length) {
    console.log('  FIX-CANDIDATE shape/group breakdown (stock+missing):')
    for (const [k, v] of Object.entries(byShape).sort((a, b) => (b[1].charted + b[1].uncharted) - (a[1].charted + a[1].uncharted))) {
      console.log(`      ${String(k).padEnd(22)} charted=${v.charted} uncharted=${v.uncharted}`)
    }
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')

  // ---- Tutorials in the three craft categories ----
  const cats = await prisma.category.findMany({
    where: { slug: { in: ['crochet', 'knitting', 'needlework'] } },
    select: { id: true, slug: true },
  })
  for (const cat of cats) {
    const tuts = await prisma.tutorial.findMany({
      where: { categoryId: cat.id, status: 'PUBLISHED' },
      select: {
        heroImageStrategy: true,
        hero: { select: { source: true } },
        subCategory: { select: { slug: true } },
      },
    })
    const rows: Row[] = tuts.map((t) => ({
      source: t.hero?.source ?? null,
      hasChart: false,
      shape: null,
      group: t.subCategory?.slug ?? '∅',
    }))
    printTally(`TUTORIAL / ${cat.slug}`, rows)
  }

  // ---- CrochetPattern ----
  const cps = await prisma.crochetPattern.findMany({
    where: { visibility: 'PUBLIC' },
    select: {
      chartData: true, shapeCategory: true,
      hero: { select: { source: true } },
      subCategory: { select: { slug: true } },
    },
  })
  printTally('CrochetPattern', cps.map((p) => ({
    source: p.hero?.source ?? null,
    hasChart: p.chartData != null,
    shape: p.shapeCategory ?? null,
    group: p.subCategory?.slug ?? '∅',
  })))

  // ---- KnittingPattern ----
  const kps = await prisma.knittingPattern.findMany({
    where: { visibility: 'PUBLIC' },
    select: {
      chartData: true, projectShape: true,
      hero: { select: { source: true } },
      subCategory: { select: { slug: true } },
    },
  })
  printTally('KnittingPattern', kps.map((p) => ({
    source: p.hero?.source ?? null,
    hasChart: p.chartData != null,
    shape: (p as { projectShape?: string | null }).projectShape ?? null,
    group: p.subCategory?.slug ?? '∅',
  })))

  // ---- NeedleworkPattern ----
  const nps = await prisma.needleworkPattern.findMany({
    where: { visibility: 'PUBLIC' },
    select: {
      chartData: true, discipline: true, patternFormat: true,
      hero: { select: { source: true } },
      subCategory: { select: { slug: true } },
    },
  })
  printTally('NeedleworkPattern', nps.map((p) => ({
    source: p.hero?.source ?? null,
    hasChart: p.chartData != null,
    shape: (p as { discipline?: string | null }).discipline ?? null,
    group: p.subCategory?.slug ?? '∅',
  })))

  // ---- Cross-stitch Pattern (the Stitching Mama studio model) ----
  const xps = await prisma.pattern.findMany({
    where: { heroMediaId: { not: null } },
    select: {
      hero: { select: { source: true } },
    },
  }).catch(() => [] as { hero: { source: string | null } | null }[])
  if (xps.length) {
    printTally('Pattern (cross-stitch studio, hero!=null only)', xps.map((p) => ({
      source: p.hero?.source ?? null, hasChart: true, shape: null, group: 'cross-stitch',
    })))
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
