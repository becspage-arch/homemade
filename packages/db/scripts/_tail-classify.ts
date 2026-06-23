import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p }
const RUN = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-run'
const REF = /starter|sugar syrup|caramel|consistenc|\bstages\b|\bmethod\b|feeding|troubleshooting|ready to bake|rhythm|how to|piping/i
async function main() {
  const { prisma } = await import('../src/index.js')
  const db = prisma as any
  const rows = await db.$queryRawUnsafe(`
    SELECT t.id, t.slug, t.title, t.subtitle, t.excerpt
    FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE t.status='PUBLISHED' AND c.slug IN ('cooking','baking')
      AND m.source IN ('pexels','unsplash','wikimedia','pixabay') AND m."verificationStatus"='UNVERIFIED'
      AND (t."heroImageStrategy" IS NULL OR t."heroImageStrategy" <> 'AI_GENERATED')
    ORDER BY t.title`)
  const ref = rows.filter((r: any) => REF.test(r.title))
  const dish = rows.filter((r: any) => !REF.test(r.title))
  writeFileSync(resolve(RUN, 'tail-reference.json'), JSON.stringify(ref, null, 2))
  writeFileSync(resolve(RUN, 'tail-dishes.json'), JSON.stringify(dish, null, 2))
  console.log(`TOTAL=${rows.length}  REFERENCE=${ref.length}  DISHES=${dish.length}`)
  console.log('\n--- REFERENCE (will get ingredient/subject image) ---')
  ref.forEach((r: any) => console.log(`  ${r.slug} :: ${r.title}`))
  console.log('\n--- DISHES (hero will be removed, text-only) ---')
  dish.forEach((r: any) => console.log(`  ${r.title}`))
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
