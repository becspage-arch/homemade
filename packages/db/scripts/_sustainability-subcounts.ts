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
    where: { category: { slug: 'sustainability' }, status: 'PUBLISHED' },
    select: { slug: true, subCategory: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })
  console.log('Total PUBLISHED:', tutorials.length)
  const byCat: Record<string, number> = {}
  for (const t of tutorials) {
    const key = t.subCategory?.slug ?? 'none'
    byCat[key] = (byCat[key] ?? 0) + 1
  }
  console.log('By sub-category:')
  for (const [k, v] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`)
  }
  await prisma.$disconnect()
}
main()
