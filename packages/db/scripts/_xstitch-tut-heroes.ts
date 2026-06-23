import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p }
async function main() {
  const { prisma } = await import('../src/index.js')
  const db = prisma as any
  const bySource = await db.$queryRawUnsafe(`
    SELECT m.source, COUNT(*) n FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE c.slug='cross-stitch' AND t.status='PUBLISHED' GROUP BY m.source ORDER BY n DESC`)
  console.log('cross-stitch tutorial heroes by source:')
  bySource.forEach((r: any) => console.log(`  ${r.source}: ${Number(r.n)}`))
  const byType = await db.$queryRawUnsafe(`
    SELECT t."contentType", COUNT(*) n FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id
    WHERE c.slug='cross-stitch' AND t.status='PUBLISHED' GROUP BY t."contentType" ORDER BY n DESC`)
  console.log('cross-stitch tutorials by contentType:')
  byType.forEach((r: any) => console.log(`  ${r.contentType}: ${Number(r.n)}`))
  // sample r2 keys to view
  const sample = await db.$queryRawUnsafe(`
    SELECT t.title, t."contentType", m.source, m."r2Key" FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE c.slug='cross-stitch' AND t.status='PUBLISHED' ORDER BY t.title LIMIT 10`)
  console.log('sample (title | type | source | r2Key):')
  sample.forEach((r: any) => console.log(`  ${r.title} | ${r.contentType} | ${r.source} | ${r.r2Key}`))
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
