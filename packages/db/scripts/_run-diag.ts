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
  // Recently created Media (any source) attached as cooking/baking hero
  const recent = await db.$queryRawUnsafe(`
    SELECT m.source, COUNT(*) n, MAX(m."createdAt") latest
    FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE c.slug IN ('cooking','baking') AND m."createdAt" > now() - interval '6 hours'
    GROUP BY m.source ORDER BY n DESC`)
  console.log('Heroes whose Media was created in last 6h:')
  recent.forEach((r: any) => console.log(`  ${r.source}: ${Number(r.n)}  latest ${r.latest?.toISOString?.() || r.latest}`))

  // Full current source breakdown for cooking+baking heroes
  const bd = await db.$queryRawUnsafe(`
    SELECT c.slug cat, m.source, COUNT(*) n
    FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE t.status='PUBLISHED' AND c.slug IN ('cooking','baking')
    GROUP BY c.slug, m.source ORDER BY c.slug, n DESC`)
  console.log('\nCurrent hero source breakdown:')
  bd.forEach((r: any) => console.log(`  ${r.cat} ${String(r.source).padEnd(14)} ${Number(r.n)}`))

  // Total published cooking/baking (did the corpus grow?)
  const tot = await db.$queryRawUnsafe(`
    SELECT c.slug cat, COUNT(*) n FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id
    WHERE t.status='PUBLISHED' AND c.slug IN ('cooking','baking') GROUP BY c.slug`)
  console.log('\nPublished totals now:')
  tot.forEach((r: any) => console.log(`  ${r.cat}: ${Number(r.n)}`))
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
