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

  const cat = await prisma.category.findFirst({
    where: { slug: 'needlework' },
    select: { id: true, slug: true, pipelineStatus: true, targetTutorialCount: true, autopilotContentTypesEnabled: true }
  })
  console.log('CAT:', JSON.stringify(cat))

  const subCats = await prisma.subCategory.findMany({
    where: { categoryId: cat!.id, autopilotEnabled: true },
    orderBy: [{ order: 'asc' }],
    select: { id: true, slug: true, name: true, order: true }
  })

  for (const sc of subCats) {
    const count = await prisma.tutorial.count({ where: { subCategoryId: sc.id, status: 'PUBLISHED' } })
    console.log(`SUBCAT:${sc.slug} | order:${sc.order} | published:${count}`)
  }

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
