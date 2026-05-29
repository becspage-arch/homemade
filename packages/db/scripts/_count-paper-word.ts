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
    where: { category: { slug: 'paper-word' }, status: 'PUBLISHED' },
    _count: { id: true },
  })
  let total = 0
  for (const s of subs.sort((a, b) => (a.subCategoryId ?? '').localeCompare(b.subCategoryId ?? ''))) {
    console.log(`subCategoryId ${s.subCategoryId}: ${s._count.id}`)
    total += s._count.id
  }
  console.log('TOTAL:', total)
  await prisma.$disconnect()
}
main().catch(console.error)
