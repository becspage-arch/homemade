import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const tutorials = await prisma.tutorial.findMany({
    where: { category: { slug: 'wood-natural-craft' }, status: 'PUBLISHED' },
    select: { slug: true, subCategory: { select: { slug: true } } },
    orderBy: [{ slug: 'asc' }]
  })
  // Group by sub-category
  const bySub: Record<string, string[]> = {}
  for (const t of tutorials) {
    const k = t.subCategory?.slug ?? 'none'
    if (!bySub[k]) bySub[k] = []
    bySub[k].push(t.slug)
  }
  for (const [sub, slugs] of Object.entries(bySub)) {
    console.log(`\n${sub} (${slugs.length}):`)
    for (const s of slugs) console.log(`  ${s}`)
  }
  console.log(`\nTotal: ${tutorials.length}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
