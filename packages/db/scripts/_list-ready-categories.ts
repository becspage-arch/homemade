import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')

  const rows = await prisma.$queryRaw<Array<{
    id: string
    slug: string
    pipelineStatus: string
    targetTutorialCount: number | null
    lastAutopilotRunAt: Date | null
    launchOrder: number | null
    published_count: number
  }>>`
    SELECT c.id,
           c.slug,
           c."pipelineStatus",
           c."targetTutorialCount",
           c."lastAutopilotRunAt",
           c."launchOrder",
           (
             SELECT COUNT(*)::int
             FROM "Tutorial" t
             WHERE t."categoryId" = c.id
               AND t.status = 'PUBLISHED'
           ) AS published_count
    FROM "Category" c
    WHERE c."pipelineStatus" = 'READY'
    ORDER BY c."lastAutopilotRunAt" ASC NULLS FIRST, c."launchOrder" ASC
  `

  console.log('All READY categories:', JSON.stringify(rows, null, 2))
  await prisma.$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })
