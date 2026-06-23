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
  const size = await db.$queryRawUnsafe(`
    SELECT c.slug category, COUNT(*) n
    FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE t.status='PUBLISHED' AND c.slug IN ('cooking','baking')
      AND m.source IN ('pexels','unsplash','wikimedia','pixabay')
      AND m."verificationStatus"='UNVERIFIED'
      AND (t."heroImageStrategy" IS NULL OR t."heroImageStrategy" <> 'AI_GENERATED')
    GROUP BY c.slug`)
  console.log('Regen target (stock + UNVERIFIED + not AI):')
  let tot = 0
  size.forEach((r: any) => { console.log(`  ${r.category}: ${Number(r.n)}`); tot += Number(r.n) })
  console.log(`  TOTAL: ${tot}`)

  const flux = await db.$queryRawUnsafe(`
    SELECT COUNT(*) n FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE t.status='PUBLISHED' AND c.slug IN ('cooking','baking') AND m.source='flux-schnell'
      AND (t."heroImageStrategy" IS NULL OR t."heroImageStrategy" <> 'AI_GENERATED')`)
  console.log(`  (flux-schnell still on old strategy, separate follow-up: ${Number(flux[0].n)})`)

  const ex = await db.$queryRawUnsafe(`
    SELECT t.title, t.excerpt, t.subtitle FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE t.status='PUBLISHED' AND c.slug IN ('cooking','baking') AND m.source IN ('pexels','unsplash','wikimedia','pixabay')
      AND m."verificationStatus"='UNVERIFIED'
    ORDER BY random() LIMIT 6`)
  console.log('\nSample excerpts (for prompt-richness check):')
  ex.forEach((r: any) => console.log(`  • ${r.title}\n      subtitle: ${r.subtitle || '(none)'}\n      excerpt: ${(r.excerpt || '(none)').slice(0, 160)}`))
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
