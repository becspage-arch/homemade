import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const result = await prisma.$queryRaw`
    SELECT c.id, c.slug, c."pipelineStatus", c."targetTutorialCount",
           c."lastAutopilotRunAt", c."launchOrder",
           (SELECT COUNT(*)::int FROM "Tutorial" t WHERE t."categoryId" = c.id AND t."status" = 'PUBLISHED') AS published_count
    FROM "Category" c
    WHERE c."pipelineStatus" = 'READY'
    ORDER BY c."lastAutopilotRunAt" ASC NULLS FIRST, c."launchOrder" ASC
    LIMIT 1
  ` as any[]

  console.log('PICKED:', JSON.stringify(result, null, 2))

  const counts = await prisma.$queryRaw`
    SELECT "pipelineStatus", COUNT(*)::int as count
    FROM "Category"
    GROUP BY "pipelineStatus"
    ORDER BY "pipelineStatus"
  ` as any[]
  console.log('STATUS_COUNTS:', JSON.stringify(counts))

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
