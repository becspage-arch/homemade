/**
 * AUDIT — "patterns missing charts" across the chart-software categories.
 * READ ONLY.
 *
 * Rule (Rebecca): a tutorial that is a PATTERN to make a finished object
 * needs a chart. Teaching/technique (STITCH / READING) does not.
 *
 * Discriminator: Tutorial.type ∈ {STITCH, PATTERN, READING}.
 * A PATTERN "has a chart" if chartDefinition is set OR it links a pattern
 * row (crochetPatternId / needleworkPatternId / patternId) whose chartData
 * is set.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{ let dir = __dirname
  for (let d = 0; d < 12; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(dir); if (p === dir) break; dir = p } }

async function main() {
  const { prisma } = await import('../src/index.js')
  const cats = await prisma.category.findMany({ where: { slug: { in: ['crochet', 'knitting', 'needlework'] } }, select: { id: true, slug: true } })

  console.log('=== Tutorial pattern-chart gap (PUBLISHED) ===')
  let grandPatternNoChart = 0
  for (const cat of cats) {
    const rows = await prisma.tutorial.findMany({
      where: { categoryId: cat.id, status: 'PUBLISHED' },
      select: { type: true, chartDefinition: true, crochetPatternId: true, needleworkPatternId: true, patternId: true,
        crochetPattern: { select: { chartData: true } }, needleworkPattern: { select: { chartData: true } }, pattern: { select: { id: true } },
        subCategory: { select: { slug: true } } },
    }) as unknown as Array<{ type: string; chartDefinition: unknown; crochetPattern: { chartData: unknown } | null; needleworkPattern: { chartData: unknown } | null; pattern: { id: string } | null; subCategory: { slug: string } | null }>

    const byType: Record<string, number> = {}
    let patternTotal = 0, patternWithChart = 0
    const noChartBySub: Record<string, number> = {}
    for (const r of rows) {
      byType[r.type] = (byType[r.type] ?? 0) + 1
      if (r.type === 'PATTERN') {
        patternTotal++
        const hasChart = r.chartDefinition != null || r.crochetPattern?.chartData != null || r.needleworkPattern?.chartData != null
        if (hasChart) patternWithChart++
        else noChartBySub[r.subCategory?.slug ?? '∅'] = (noChartBySub[r.subCategory?.slug ?? '∅'] ?? 0) + 1
      }
    }
    const noChart = patternTotal - patternWithChart
    grandPatternNoChart += noChart
    console.log(`\n## ${cat.slug}`)
    console.log(`  types: ${Object.entries(byType).map(([k, v]) => `${k}=${v}`).join(' ')}`)
    console.log(`  PATTERN: total=${patternTotal} withChart=${patternWithChart} MISSING-CHART=${noChart}`)
    console.log(`  missing-chart by sub-cat: ${Object.entries(noChartBySub).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' ')}`)
  }

  // Cross-stitch studio Pattern model — these are charted by construction (gridData/chartData).
  const xsTotal = await prisma.pattern.count()
  const xsPublic = await prisma.pattern.count({ where: { visibility: 'PUBLIC' } })
  console.log(`\n## cross-stitch (Pattern model): total=${xsTotal} public=${xsPublic} (charted studio model)`)

  // Studio pattern models
  const cp = await prisma.crochetPattern.count({ where: { visibility: 'PUBLIC' } })
  const kp = await prisma.knittingPattern.count({ where: { visibility: 'PUBLIC' } })
  const np = await prisma.needleworkPattern.count({ where: { visibility: 'PUBLIC' } })
  console.log(`## studio pattern rows public: CrochetPattern=${cp} KnittingPattern=${kp} NeedleworkPattern=${np}`)

  console.log(`\n=== TOTAL published PATTERN tutorials MISSING a chart: ${grandPatternNoChart} ===`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
