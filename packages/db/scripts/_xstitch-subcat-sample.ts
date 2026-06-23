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
  const subs = ['art-reproductions', 'cocktails', 'home-cosy', 'landscapes', 'monochrome', 'seasonal']
  for (const s of subs) {
    const rows = await db.$queryRawUnsafe(`
      SELECT p.name FROM "Pattern" p JOIN "SubCategory" sc ON p."subCategoryId"=sc.id JOIN "Category" c ON sc."categoryId"=c.id
      WHERE c.slug='cross-stitch' AND sc.slug=$1 AND p.visibility='PUBLIC' ORDER BY random() LIMIT 12`, s)
    console.log(`\n[${s}] (${rows.length} sampled)`)
    rows.forEach((r: any) => console.log(`   ${r.name}`))
  }
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
