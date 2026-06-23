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
  // Candidate sample patterns to delete
  console.log('=== candidate patterns (garden bird / alphabet sampler) ===')
  const pats = await db.$queryRawUnsafe(`
    SELECT p.id, p.slug, p.name, p.visibility, sc.slug subcat, p."createdAt"
    FROM "Pattern" p LEFT JOIN "SubCategory" sc ON p."subCategoryId"=sc.id
    WHERE p.name ILIKE '%garden bird%' OR p.name ILIKE '%alphabet sampler%' OR p.name ILIKE '%bird silhouette%' OR p.name ILIKE '%tiny alphabet%'
    ORDER BY p."createdAt" DESC`)
  pats.forEach((r: any) => console.log(`  [${r.visibility}] ${r.name}  (slug=${r.slug}, subcat=${r.subcat}, created=${r.createdAt?.toISOString?.()||r.createdAt})  id=${r.id}`))

  // Cross-stitch TUTORIAL image sharing
  console.log('\n=== cross-stitch tutorials: hero image sharing ===')
  const tut = await db.$queryRawUnsafe(`
    SELECT COUNT(*) total, COUNT(DISTINCT t."heroMediaId") distinctHeroes, COUNT(*) FILTER (WHERE t."heroMediaId" IS NULL) noHero
    FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id
    WHERE c.slug='cross-stitch' AND t.status='PUBLISHED'`)
  console.log(`  published cross-stitch tutorials: ${Number(tut[0].total)}, distinct hero media: ${Number(tut[0].distinctheroes)}, no hero: ${Number(tut[0].nohero)}`)
  const dupes = await db.$queryRawUnsafe(`
    SELECT m.source, m.id, COUNT(*) n, MIN(t.title) example
    FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE c.slug='cross-stitch' AND t.status='PUBLISHED'
    GROUP BY m.id, m.source HAVING COUNT(*) > 1 ORDER BY n DESC LIMIT 15`)
  console.log('  most-shared hero media (id used by N tutorials):')
  dupes.forEach((r: any) => console.log(`    ${Number(r.n)}x  source=${r.source}  egTitle="${r.example}"  media=${r.id}`))
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
