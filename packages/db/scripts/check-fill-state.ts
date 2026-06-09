import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}
async function main() {
  const { prisma } = await import('../src/index.js')
  const rows = await (prisma as any).$queryRaw<any[]>`
    SELECT
      c.slug,
      c."pipelineStatus" AS status,
      c."targetTutorialCount" AS target,
      COUNT(t.id) FILTER (WHERE t.status = 'PUBLISHED') AS published,
      COUNT(t.id) FILTER (WHERE t.status = 'DRAFT') AS draft,
      c."launchOrder"
    FROM "Category" c
    LEFT JOIN "Tutorial" t ON t."categoryId" = c.id
    GROUP BY c.slug, c."pipelineStatus", c."targetTutorialCount", c."launchOrder"
    ORDER BY c."launchOrder" ASC NULLS LAST
  `
  console.log('category               | status      | published | target | gap   | drafts')
  console.log('-'.repeat(90))
  let totalGap = 0
  for (const r of rows) {
    const pub = Number(r.published)
    const tar = r.target ? Number(r.target) : 0
    const gap = Math.max(0, tar - pub)
    if (r.status === 'READY') totalGap += gap
    console.log(`${r.slug.padEnd(22)} | ${(r.status || '').padEnd(11)} | ${String(pub).padStart(9)} | ${String(tar).padStart(6)} | ${String(gap).padStart(5)} | ${String(Number(r.draft)).padStart(6)}`)
  }
  console.log('\nTotal gap across READY categories:', totalGap)
  console.log('Total gap if all categories were READY:', rows.reduce((s: number, r: any) => s + Math.max(0, (r.target ? Number(r.target) : 0) - Number(r.published)), 0))
}
main().catch((e) => { console.error(e); process.exit(1) })
