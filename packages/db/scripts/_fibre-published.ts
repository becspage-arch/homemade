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
  const rows = await prisma.tutorial.findMany({
    where: { categorySlug: 'fibre-arts', status: 'PUBLISHED' },
    select: { slug: true, subCategorySlug: true },
    orderBy: { subCategorySlug: 'asc' }
  })
  // Print count by sub-category
  const counts: Record<string, number> = {}
  for (const r of rows) {
    const s = r.subCategorySlug ?? 'none'
    counts[s] = (counts[s] ?? 0) + 1
  }
  console.log('Sub-category counts:', JSON.stringify(counts))
  console.log('Total:', rows.length)
  // Print all slugs for skip-list
  for (const r of rows) process.stdout.write(r.slug + '\n')
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
