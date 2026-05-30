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
  const subs = await prisma.tutorial.groupBy({
    by: ['subCategoryId'],
    where: { category: { slug: 'fibre-arts' }, status: 'PUBLISHED' },
    _count: { id: true },
  })
  const subCats = await prisma.subCategory.findMany({
    where: { category: { slug: 'fibre-arts' } },
    select: { id: true, slug: true },
  })
  const subMap = Object.fromEntries(subCats.map((s: any) => [s.id, s.slug]))
  let total = 0
  for (const s of subs) {
    const slug = subMap[(s as any).subCategoryId ?? ''] ?? '(none)'
    console.log(slug + ': ' + s._count.id)
    total += s._count.id
  }
  console.log('TOTAL: ' + total)
  await prisma.$disconnect()
}
main().catch((e: any) => { console.error(e); process.exit(1) })
