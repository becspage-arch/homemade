import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break; }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

interface Row {
  id: string
  slug: string
  pipelineStatus: string
  targetTutorialCount: number | null
  lastAutopilotRunAt: Date | null
  launchOrder: number | null
  published_count: number
}

async function main() {
  const { prisma } = await import('../src/index.js')
  try {
    const rows: Row[] = await prisma.$queryRaw`
      SELECT c.id, c.slug, c."pipelineStatus", c."targetTutorialCount",
             c."lastAutopilotRunAt", c."launchOrder",
             (SELECT COUNT(*)::int FROM "Tutorial" t
              WHERE t."categoryId" = c.id AND t.status = 'PUBLISHED') AS published_count
      FROM "Category" c
      WHERE c."pipelineStatus" = 'READY'
      ORDER BY c."lastAutopilotRunAt" ASC NULLS FIRST, c."launchOrder" ASC
    `

    const readyCounts: { status: string; cnt: bigint }[] = await prisma.$queryRaw`
      SELECT "pipelineStatus" as status, COUNT(*) as cnt
      FROM "Category"
      GROUP BY "pipelineStatus"
    `

    console.log('READY_CATEGORIES:' + JSON.stringify(rows, (k, v) => typeof v === 'bigint' ? Number(v) : v))
    console.log('STATUS_COUNTS:' + JSON.stringify(readyCounts, (k, v) => typeof v === 'bigint' ? Number(v) : v))
  } finally {
    await prisma.$disconnect()
  }
}
main().catch(e => { console.error(e.message); process.exit(1) })
