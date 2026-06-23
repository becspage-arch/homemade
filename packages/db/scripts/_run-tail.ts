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
    SELECT c.slug cat, t.slug, t.title, m.source
    FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE t.status='PUBLISHED' AND c.slug IN ('cooking','baking')
      AND m.source IN ('pexels','unsplash','wikimedia','pixabay') AND m."verificationStatus"='UNVERIFIED'
      AND (t."heroImageStrategy" IS NULL OR t."heroImageStrategy" <> 'AI_GENERATED')
    ORDER BY t.title`)
  console.log(`TAIL count: ${rows.length}`)
  rows.forEach((r: any) => console.log(`  [${r.cat}] ${r.title}  (${r.source})`))
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
