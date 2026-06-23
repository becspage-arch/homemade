import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p }
const PILOT = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-pilot/gen-results.json'
async function main() {
  const { prisma } = await import('../src/index.js')
  const db = prisma as any
  const ids = JSON.parse(readFileSync(PILOT, 'utf8')).filter((r: any) => r.genFile && !r.error).map((r: any) => r.tutorialId)
  const rows = await db.$queryRawUnsafe(`
    SELECT t.slug, m.source, t."heroImageStrategy" strat, t."updatedAt", m."createdAt" mediaCreated
    FROM "Tutorial" t JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE t.id = ANY($1) AND m.source <> 'flux-pro'`, ids)
  console.log(`Pilot heroes reverted away from flux-pro: ${rows.length}`)
  rows.forEach((r: any) => console.log(`  ${r.slug}: now ${r.source}/${r.strat}  heroMediaCreated=${r.mediaCreated?.toISOString?.()||r.mediaCreated}  tutUpdated=${r.updatedAt?.toISOString?.()||r.updatedAt}`))
  // newest hero media across cooking/baking right now
  const newest = await db.$queryRawUnsafe(`
    SELECT m.source, m."createdAt", t.slug FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE c.slug IN ('cooking','baking') ORDER BY m."createdAt" DESC LIMIT 5`)
  console.log('\n5 most-recently-created heroes (cooking/baking):')
  newest.forEach((r: any) => console.log(`  ${r.mediaCreated||r.createdAt?.toISOString?.()||r.createdAt}  ${r.source}  ${r.slug}`))
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
