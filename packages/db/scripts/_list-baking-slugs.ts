import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const cat = await prisma.category.findUnique({ where: { slug: 'baking' } })
  if (!cat) throw new Error('baking not found')
  const subCats = await prisma.subCategory.findMany({
    where: { categoryId: cat.id },
    select: { id: true, slug: true, name: true },
  })
  const idToSlug = Object.fromEntries(subCats.map(s => [s.id, s.slug]))
  const tuts = await prisma.tutorial.findMany({
    where: { categoryId: cat.id, status: 'PUBLISHED' },
    select: { slug: true, subCategoryId: true },
  })
  const grouped: Record<string, string[]> = {}
  for (const t of tuts) {
    const subSlug = (t.subCategoryId && idToSlug[t.subCategoryId]) || 'null'
    grouped[subSlug] ??= []
    grouped[subSlug].push(t.slug)
  }
  console.log('### Sub-categories:')
  for (const s of subCats) console.log(`- ${s.slug} (${s.name})`)
  console.log()
  console.log('### Counts by sub-category:')
  for (const sub of Object.keys(grouped).sort()) {
    console.log(`- ${sub}: ${grouped[sub].length}`)
  }
  console.log()
  for (const sub of Object.keys(grouped).sort()) {
    console.log(`### ${sub} (${grouped[sub].length})`)
    console.log(grouped[sub].sort().join(', '))
    console.log()
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
