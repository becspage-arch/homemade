import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
    where: { category: { slug: 'natural-home' }, status: 'PUBLISHED' },
    select: { slug: true, subCategory: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })
  console.log('Total PUBLISHED:', tutorials.length)
  const byCat: Record<string, number> = {}
  for (const t of tutorials) {
    const sc = t.subCategory?.slug ?? 'unknown'
    byCat[sc] = (byCat[sc] ?? 0) + 1
  }
  console.log('By sub-category:', JSON.stringify(byCat, null, 2))
  console.log('All slugs:')
  for (const t of tutorials) console.log(t.slug)
  await prisma.$disconnect()
}
main()
