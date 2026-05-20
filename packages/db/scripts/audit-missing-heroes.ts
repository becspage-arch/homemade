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

  // Per-category totals + missing-hero counts (PUBLISHED + DRAFT separately)
  const cats = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    select: { slug: true },
  })

  console.log('MISSING HERO IMAGES:')
  console.log(`Category                  | Pub-total | Pub-no-hero | Draft-total | Draft-no-hero`)
  console.log(`--------------------------+-----------+-------------+-------------+--------------`)

  for (const c of cats) {
    const pubTotal = await prisma.tutorial.count({
      where: { category: { slug: c.slug }, status: 'PUBLISHED' },
    })
    const pubNoHero = await prisma.tutorial.count({
      where: { category: { slug: c.slug }, status: 'PUBLISHED', heroMediaId: null },
    })
    const draftTotal = await prisma.tutorial.count({
      where: { category: { slug: c.slug }, status: 'DRAFT' },
    })
    const draftNoHero = await prisma.tutorial.count({
      where: { category: { slug: c.slug }, status: 'DRAFT', heroMediaId: null },
    })
    if (pubTotal === 0 && draftTotal === 0) continue
    console.log(
      `${c.slug.padEnd(25)} | ${String(pubTotal).padStart(9)} | ${String(pubNoHero).padStart(11)} | ${String(draftTotal).padStart(11)} | ${String(draftNoHero).padStart(13)}`,
    )
  }

  // For categories with significant gaps, sample 8 titles
  console.log(`\n\nSAMPLE TITLES from each category (PUBLISHED-no-hero):`)
  for (const c of cats) {
    const sample = await prisma.tutorial.findMany({
      where: { category: { slug: c.slug }, status: 'PUBLISHED', heroMediaId: null },
      select: { title: true, slug: true },
      take: 8,
      orderBy: { publishedAt: 'desc' },
    })
    if (sample.length === 0) continue
    console.log(`\n=== ${c.slug} ===`)
    sample.forEach((s) => console.log(`  - ${s.title}`))
  }
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
