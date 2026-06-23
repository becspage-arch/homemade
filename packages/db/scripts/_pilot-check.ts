import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p }
const ROOT = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-pilot'

async function main() {
  const { prisma } = await import('../src/index.js')
  const db = prisma as any
  const results = JSON.parse(readFileSync(ROOT + '/gen-results.json', 'utf8')).filter((r: any) => r.genFile && !r.error)
  const ids = results.map((r: any) => r.tutorialId)
  const rows = await db.$queryRawUnsafe(`SELECT m.source, m."verificationStatus" v, t."heroImageStrategy" s, COUNT(*) n FROM "Tutorial" t JOIN "Media" m ON t."heroMediaId"=m.id WHERE t.id = ANY($1) GROUP BY m.source, m."verificationStatus", t."heroImageStrategy"`, ids)
  console.log('Committed tutorials, current hero state:')
  rows.forEach((r: any) => console.log(`  ${r.source} / ${r.v} / ${r.s} : ${Number(r.n)}`))
  const one = await db.$queryRawUnsafe(`SELECT t.slug, m."r2Key" FROM "Tutorial" t JOIN "Media" m ON t."heroMediaId"=m.id WHERE t.id = ANY($1) AND m.source='flux-pro' LIMIT 1`, ids)
  console.log('Sample new hero slug:', one[0]?.slug)
  console.log('Sample r2Key:', one[0]?.r2Key)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
