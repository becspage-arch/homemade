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
    where: { categoryId: 'cmp8mecva000ad4v4zgmh43ay', status: 'PUBLISHED' },
    select: { slug: true, subCategory: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })
  const byCat: Record<string, string[]> = {}
  for (const t of tutorials) {
    const sub = t.subCategory?.slug ?? 'unknown'
    if (!byCat[sub]) byCat[sub] = []
    byCat[sub].push(t.slug)
  }
  for (const [sub, slugs] of Object.entries(byCat)) {
    console.log(`\n## ${sub} (${slugs.length}):`)
    slugs.forEach(s => console.log('  ' + s))
  }
  console.log('\nTotal:', tutorials.length)
  await prisma.$disconnect()
}
main().catch(err => { console.error(err); process.exit(1) })
