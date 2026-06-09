import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const tutorials = await prisma.tutorial.findMany({
    where: {
      category: { slug: 'animals-smallholding' },
      status: 'PUBLISHED',
    },
    select: { slug: true, subCategory: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })
  const bySubcat: Record<string, string[]> = {}
  for (const t of tutorials) {
    const sc = t.subCategory?.slug ?? 'unknown'
    if (!bySubcat[sc]) bySubcat[sc] = []
    bySubcat[sc].push(t.slug)
  }
  for (const [sc, slugs] of Object.entries(bySubcat)) {
    console.log(`\n### ${sc} (${slugs.length})`)
    slugs.forEach(s => console.log(`- ${s}`))
  }
  console.log(`\nTotal: ${tutorials.length}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
