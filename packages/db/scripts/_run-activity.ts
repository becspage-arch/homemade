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
  const rows = await db.$queryRawUnsafe(`
    SELECT date_trunc('hour', t."createdAt") hr, COUNT(*) n
    FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id
    WHERE c.slug IN ('cooking','baking') AND t."createdAt" > now() - interval '8 hours'
    GROUP BY hr ORDER BY hr DESC`)
  console.log('cooking/baking Tutorial.createdAt by hour (last 8h):')
  rows.forEach((r: any) => console.log(`  ${r.hr?.toISOString?.()||r.hr}: ${Number(r.n)} created`))
  const upd = await db.$queryRawUnsafe(`
    SELECT date_trunc('hour', t."updatedAt") hr, COUNT(*) n
    FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id
    WHERE c.slug IN ('cooking','baking') AND t."updatedAt" > now() - interval '3 hours'
    GROUP BY hr ORDER BY hr DESC`)
  console.log('cooking/baking Tutorial.updatedAt by hour (last 3h):')
  upd.forEach((r: any) => console.log(`  ${r.hr?.toISOString?.()||r.hr}: ${Number(r.n)} updated`))
  const now = await db.$queryRawUnsafe(`SELECT now() as t`)
  console.log('DB now():', now[0].t?.toISOString?.() || now[0].t)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
