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
  const cat = await prisma.category.findUnique({ where: { slug: 'animals-smallholding' }, select: { id: true } })
  if (!cat) throw new Error('no category')
  const tuts = await prisma.tutorial.findMany({
    where: { categoryId: cat.id },
    select: { slug: true, subCategory: { select: { slug: true } }, status: true },
    orderBy: { subCategory: { slug: 'asc' } },
  })
  const bySub: Record<string, string[]> = {}
  for (const t of tuts) {
    const sub = t.subCategory?.slug ?? 'NULL'
    if (!bySub[sub]) bySub[sub] = []
    bySub[sub].push(`${t.slug} [${t.status}]`)
  }
  for (const sub of Object.keys(bySub).sort()) {
    console.log(`\n=== ${sub} (${bySub[sub].length}) ===`)
    bySub[sub].sort().forEach(s => console.log(s))
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
