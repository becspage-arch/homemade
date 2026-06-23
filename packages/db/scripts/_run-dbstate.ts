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
  const done = await db.$queryRawUnsafe(`
    SELECT c.slug category, COUNT(*) n FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE t.status='PUBLISHED' AND c.slug IN ('cooking','baking') AND m.source='flux-pro' GROUP BY c.slug`)
  const remain = await db.$queryRawUnsafe(`
    SELECT COUNT(*) n FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE t.status='PUBLISHED' AND c.slug IN ('cooking','baking')
      AND m.source IN ('pexels','unsplash','wikimedia','pixabay') AND m."verificationStatus"='UNVERIFIED'
      AND (t."heroImageStrategy" IS NULL OR t."heroImageStrategy" <> 'AI_GENERATED')`)
  console.log('flux-pro committed so far:'); done.forEach((r: any) => console.log(`  ${r.category}: ${Number(r.n)}`))
  console.log(`remaining to regen: ${Number(remain[0].n)}`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
