import { config as loadEnv } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let dir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

import { prisma } from '../src'

async function main() {
  const rows = await prisma.tutorial.findMany({
    where: { category: { slug: 'baking' }, status: 'PUBLISHED' },
    select: { slug: true, subCategory: { select: { slug: true } } },
    orderBy: { subCategory: { slug: 'asc' } },
  })
  const bySubCat: Record<string, string[]> = {}
  for (const r of rows) {
    const sc = r.subCategory?.slug ?? 'none'
    if (!bySubCat[sc]) bySubCat[sc] = []
    bySubCat[sc].push(r.slug)
  }
  for (const [sc, slugs] of Object.entries(bySubCat)) {
    console.log(`\n## ${sc} (${slugs.length})`)
    for (const s of slugs) console.log(`  - ${s}`)
  }
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
