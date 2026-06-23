/** Split the 80 published cross-stitch TUTORIAL heroes (stock-sourced) into chunks. */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p }
const ROOT = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-xstitch'
function arg(n: string, def: string) { const a = process.argv.find(x => x.startsWith(`--${n}=`)); if (a) return a.slice(n.length + 3); const i = process.argv.indexOf(`--${n}`); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def }
async function main() {
  const size = Number(arg('size', '40'))
  const { prisma } = await import('../src/index.js')
  const db = prisma as any
  const rows = await db.$queryRawUnsafe(`
    SELECT t.id, t.slug, t.title, t.subtitle, t.excerpt
    FROM "Tutorial" t JOIN "Category" c ON t."categoryId"=c.id JOIN "Media" m ON t."heroMediaId"=m.id
    WHERE t.status='PUBLISHED' AND c.slug='cross-stitch'
      AND m.source IN ('pexels','unsplash','wikimedia','pixabay')
      AND (t."heroImageStrategy" IS NULL OR t."heroImageStrategy" <> 'AI_GENERATED')
    ORDER BY t.id ASC`)
  const dir = resolve(ROOT, 'chunks')
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  let n = 0
  for (let i = 0; i < rows.length; i += size) {
    writeFileSync(resolve(dir, `chunk_${String(n).padStart(3, '0')}.json`), JSON.stringify(rows.slice(i, i + size)))
    n++
  }
  console.log(`TOTAL=${rows.length} CHUNKS=${n} SIZE=${size}`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
