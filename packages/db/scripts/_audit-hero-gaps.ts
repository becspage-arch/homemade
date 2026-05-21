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
  const rows = await prisma.$queryRaw<{ slug: string; published: bigint; no_hero: bigint }[]>`
    SELECT c.slug,
      COUNT(*) FILTER (WHERE t.status = 'PUBLISHED') AS published,
      COUNT(*) FILTER (WHERE t.status = 'PUBLISHED' AND t."heroMediaId" IS NULL) AS no_hero
    FROM "Tutorial" t
    JOIN "Category" c ON c.id = t."categoryId"
    GROUP BY c.slug
    ORDER BY no_hero DESC
  `

  console.log('\ncategory                     | published | no_hero |  gap%')
  console.log('-----------------------------+-----------+---------+------')
  let totalPub = 0n, totalGap = 0n
  for (const r of rows) {
    const pct = r.published > 0n ? Math.round(Number(r.no_hero) / Number(r.published) * 100) : 0
    console.log(`${r.slug.padEnd(28)} | ${String(r.published).padStart(9)} | ${String(r.no_hero).padStart(7)} | ${pct}%`)
    totalPub += r.published
    totalGap += r.no_hero
  }
  const totalPct = totalPub > 0n ? Math.round(Number(totalGap) / Number(totalPub) * 100) : 0
  console.log(`${'TOTAL'.padEnd(28)} | ${String(totalPub).padStart(9)} | ${String(totalGap).padStart(7)} | ${totalPct}%`)
}
main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
