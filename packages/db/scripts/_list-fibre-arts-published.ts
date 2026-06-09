import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const cat = await prisma.category.findUnique({ where: { slug: 'fibre-arts' } })
  if (!cat) {
    console.log('NO_CATEGORY')
    await prisma.$disconnect()
    return
  }
  const subcats = await prisma.subCategory.findMany({
    where: { categoryId: cat.id },
    select: { slug: true, name: true },
  })
  const tuts = await prisma.tutorial.findMany({
    where: { categoryId: cat.id, status: 'PUBLISHED' },
    select: { slug: true, subCategoryId: true, subCategory: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })
  const bySub: Record<string, string[]> = {}
  for (const t of tuts) {
    const k = t.subCategory?.slug ?? 'NONE'
    bySub[k] = bySub[k] ?? []
    bySub[k].push(t.slug)
  }
  console.log('SUBCATS:', JSON.stringify(subcats, null, 2))
  console.log('TOTAL:', tuts.length)
  for (const [k, v] of Object.entries(bySub)) {
    console.log(`\n=== ${k} (${v.length}) ===`)
    for (const s of v) console.log(s)
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
