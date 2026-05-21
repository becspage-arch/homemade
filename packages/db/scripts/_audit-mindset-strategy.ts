/**
 * Quick check: how many mindset tutorials have heroImageStrategy=PROCEDURAL_CARD
 * vs UNSET, and how many have a real heroMediaId.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let dir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}
import { prisma } from '../src'

async function main() {
  const rows = await prisma.$queryRaw<{ strategy: string; has_media: boolean; cnt: bigint }[]>`
    SELECT
      t."heroImageStrategy" AS strategy,
      (t."heroMediaId" IS NOT NULL) AS has_media,
      COUNT(*) AS cnt
    FROM "Tutorial" t
    JOIN "Category" c ON c.id = t."categoryId"
    WHERE c.slug = 'mindset' AND t.status = 'PUBLISHED'
    GROUP BY t."heroImageStrategy", (t."heroMediaId" IS NOT NULL)
    ORDER BY cnt DESC
  `
  console.log('\nMindset heroImageStrategy breakdown (PUBLISHED only):')
  console.log('strategy             | has_media |  count')
  console.log('---------------------+-----------+-------')
  for (const r of rows) {
    console.log(`${r.strategy.padEnd(20)} | ${String(r.has_media).padEnd(9)} | ${r.cnt}`)
  }
}
main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
