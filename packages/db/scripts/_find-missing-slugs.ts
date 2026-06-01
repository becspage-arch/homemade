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
  const missing = [
    'victoria-sandwich','apple-upside-down-cake','marmalade-cake',
    'danish-pastry-whirl','madeleines-french','melting-moments',
    'raisin-scones','wholemeal-cheese-scones','scottish-treacle-scones'
  ]
  const rows: any[] = await prisma.$queryRaw`
    SELECT t.slug, t.status, c.slug AS category_slug, t."createdAt"
    FROM "Tutorial" t
    JOIN "Category" c ON c.id = t."categoryId"
    WHERE t.slug = ANY(${missing})
    ORDER BY t.slug
  `
  if (rows.length === 0) {
    console.log('None of the 9 slugs found anywhere in the DB!')
  }
  for (const r of rows) {
    console.log(`${r.slug}: status=${r.status}, category=${r.category_slug}, created=${r.createdAt?.toISOString()?.slice(0,19)}`)
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
