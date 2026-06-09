import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}
async function main() {
  const { prisma } = await import('../src/index.js')
  const needleworkCat = await prisma.category.findUnique({ where: { slug: 'needlework' }, select: { id: true } })
  if (!needleworkCat) { console.log('needlework category not found'); return }
  // Get slugs by sub-cat
  const subCats = ['foundations', 'surface-embroidery', 'blackwork']
  for (const sc of subCats) {
    const sub = await prisma.subCategory.findFirst({ where: { slug: sc, categoryId: needleworkCat.id }, select: { id: true } })
    if (!sub) { console.log(sc, 'sub-cat not found'); continue }
    const entries = await prisma.tutorial.findMany({ where: { subCategoryId: sub.id }, select: { slug: true }, orderBy: { slug: 'asc' } })
    console.log(`\n=== ${sc} (${entries.length}) ===`)
    entries.forEach(e => console.log(' ', e.slug))
  }
  await prisma.$disconnect()
}
main()
