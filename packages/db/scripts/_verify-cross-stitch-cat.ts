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
  const cat = await (prisma as any).$queryRaw<any[]>`
    SELECT id, slug, name, "pipelineStatus", "isPublicVisible", "order"
    FROM "Category" WHERE slug IN ('cross-stitch','needlework')
  `
  console.log('CATEGORIES:')
  cat.forEach((c: any) => console.log(`  ${c.slug.padEnd(14)} status=${c.pipelineStatus.padEnd(11)} visible=${c.isPublicVisible} order=${c.order} id=${c.id}`))

  const subs = await (prisma as any).$queryRaw<any[]>`
    SELECT s.slug, s.name FROM "SubCategory" s
    JOIN "Category" c ON s."categoryId" = c.id
    WHERE c.slug = 'cross-stitch' ORDER BY s.slug
  `
  console.log('\nCROSS-STITCH SUB-CATS:', subs.length)
  subs.forEach((s: any) => console.log(`  ${s.slug.padEnd(28)} ${s.name}`))

  const tuts = await (prisma as any).$queryRaw<any[]>`
    SELECT t.slug, t.status, c.slug AS cat
    FROM "Tutorial" t JOIN "Category" c ON t."categoryId" = c.id
    WHERE c.slug IN ('cross-stitch','needlework') ORDER BY c.slug, t.slug
  `
  console.log('\nTUTORIALS IN BOTH CATEGORIES:', tuts.length)
  tuts.forEach((t: any) => console.log(`  [${t.cat.padEnd(12)}] [${t.status.padEnd(9)}] ${t.slug}`))
}
main().catch((e) => { console.error(e); process.exit(1) })
