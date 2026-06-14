/**
 * QC routine — pattern chart gap (NON-BLOCKING, self-healing).
 *
 * Scans published PATTERN tutorials in the chart-software categories and
 * writes a backfill queue of any that are missing their chart. It does NOT
 * block or unpublish anything (there is no human to triage, per the
 * AI-only-moderation rule) — it just keeps an up-to-date worklist that the
 * chart-backfill worker session drains.
 *
 * Rule:
 *   - crochet / knitting PATTERN          -> needs `chartDefinition`.
 *   - needlework COUNTED PATTERN          -> needs `chartDefinition` OR a
 *     linked NeedleworkPattern with chartData (blackwork / needlepoint /
 *     hardanger / sashiko). Surface disciplines are exempt.
 *
 * Output: packages/db/docs/pattern-chart-backfill-queue.json
 *
 * Run (cron-friendly):
 *   pnpm --filter "@homemade/db" exec tsx scripts/qc-pattern-chart-gap.ts
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let d = 0; d < 12; d++) {
    const c = resolve(dir, '.env.credentials')
    if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
    const p = dirname(dir); if (p === dir) break; dir = p
  }
}

const COUNTED_NEEDLEWORK = new Set(['blackwork', 'needlepoint', 'hardanger', 'sashiko'])
const QUEUE_PATH = resolve(__dirname, '..', 'docs', 'pattern-chart-backfill-queue.json')

interface QueueItem {
  slug: string
  title: string
  category: string
  subCategory: string | null
  projectShape: string | null
  reason: 'no-chartDefinition' | 'no-counted-chart'
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const cats = await prisma.category.findMany({
    where: { slug: { in: ['crochet', 'knitting', 'needlework'] } },
    select: { id: true, slug: true },
  })

  const queue: QueueItem[] = []
  const perCat: Record<string, { patterns: number; missing: number }> = {}

  for (const cat of cats) {
    const rows = await prisma.tutorial.findMany({
      where: { categoryId: cat.id, status: 'PUBLISHED', type: 'PATTERN' },
      select: {
        slug: true, title: true, projectShape: true, chartDefinition: true,
        subCategory: { select: { slug: true } },
        crochetPattern: { select: { chartData: true } },
        needleworkPattern: { select: { chartData: true } },
      },
    })
    perCat[cat.slug] = { patterns: rows.length, missing: 0 }

    for (const r of rows) {
      const sub = r.subCategory?.slug ?? null
      const hasChart = r.chartDefinition != null
        || r.crochetPattern?.chartData != null
        || r.needleworkPattern?.chartData != null

      if (cat.slug === 'needlework') {
        // Only counted disciplines need a chart.
        if (!sub || !COUNTED_NEEDLEWORK.has(sub)) continue
        if (hasChart) continue
        queue.push({ slug: r.slug ?? r.title, title: r.title, category: cat.slug, subCategory: sub, projectShape: r.projectShape, reason: 'no-counted-chart' })
        perCat[cat.slug]!.missing++
      } else {
        if (hasChart) continue
        queue.push({ slug: r.slug ?? r.title, title: r.title, category: cat.slug, subCategory: sub, projectShape: r.projectShape, reason: 'no-chartDefinition' })
        perCat[cat.slug]!.missing++
      }
    }
  }

  writeFileSync(QUEUE_PATH, JSON.stringify({
    generatedAt: new Date().toISOString(),
    total: queue.length,
    perCategory: perCat,
    items: queue.sort((a, b) => a.category.localeCompare(b.category) || a.slug.localeCompare(b.slug)),
  }, null, 2))

  console.log('[qc-chart-gap] non-blocking scan complete.')
  for (const [k, v] of Object.entries(perCat)) {
    console.log(`  ${k}: ${v.patterns} PATTERN published, ${v.missing} missing a chart`)
  }
  console.log(`[qc-chart-gap] queued ${queue.length} -> ${QUEUE_PATH}`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
