import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}
async function main() {
  const { prisma } = await import('../src/index.js')

  // Per-day publish counts for the last 10 days
  const tenDaysAgo = new Date()
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
  tenDaysAgo.setHours(0, 0, 0, 0)

  const recent = await prisma.tutorial.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { gte: tenDaysAgo },
    },
    select: {
      publishedAt: true,
      category: { select: { slug: true } },
    },
  })

  // Group by day + category
  const byDay: Record<string, Record<string, number>> = {}
  for (const t of recent) {
    if (!t.publishedAt) continue
    const day = t.publishedAt.toISOString().slice(0, 10)
    const cat = t.category.slug
    byDay[day] = byDay[day] ?? {}
    byDay[day][cat] = (byDay[day][cat] || 0) + 1
  }

  const days = Object.keys(byDay).sort()
  console.log('\nPUBLISHED PER DAY:')
  console.log(`Day        | Total | Per category`)
  console.log(`-----------+-------+-------------------------------------------------------`)
  for (const day of days) {
    const cats = byDay[day]
    const total = Object.values(cats).reduce((a, b) => a + b, 0)
    const breakdown = Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .map(([c, n]) => `${c} ${n}`)
      .join(', ')
    console.log(`${day} | ${String(total).padStart(5)} | ${breakdown}`)
  }

  // Targets + current state
  console.log('\nTARGET FILL:')
  const cats = await prisma.category.findMany({
    select: {
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      _count: { select: { tutorials: { where: { status: 'PUBLISHED' } } } },
    },
    orderBy: { order: 'asc' },
  })
  let totalPublished = 0
  let totalTarget = 0
  console.log(`Category                  | Status      | Published / Target | Remaining`)
  console.log(`--------------------------+-------------+--------------------+-----------`)
  for (const c of cats) {
    const pub = c._count.tutorials
    const target = c.targetTutorialCount ?? 0
    const remaining = Math.max(0, target - pub)
    totalPublished += pub
    totalTarget += target
    console.log(
      `${c.slug.padEnd(25)} | ${c.pipelineStatus.padEnd(11)} | ${String(pub).padStart(6)} / ${String(target).padStart(6)} | ${String(remaining).padStart(6)}`,
    )
  }
  console.log(`--------------------------+-------------+--------------------+-----------`)
  console.log(`TOTAL                                  | ${String(totalPublished).padStart(6)} / ${String(totalTarget).padStart(6)} | ${String(Math.max(0, totalTarget - totalPublished)).padStart(6)}`)

  // 7-day rolling average
  const last7days = days.slice(-7)
  let last7sum = 0
  for (const d of last7days) {
    last7sum += Object.values(byDay[d]).reduce((a, b) => a + b, 0)
  }
  const avg7 = last7days.length > 0 ? last7sum / last7days.length : 0
  console.log(`\nROLLING 7-DAY AVERAGE: ${avg7.toFixed(1)} tutorials / day`)
  if (avg7 > 0) {
    const remaining = totalTarget - totalPublished
    const daysToFill = remaining / avg7
    console.log(`Days to fill remaining ${remaining} tutorials at this pace: ${daysToFill.toFixed(0)} days (~${(daysToFill / 30).toFixed(1)} months)`)
  }
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
