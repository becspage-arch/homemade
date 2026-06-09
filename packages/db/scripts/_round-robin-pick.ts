import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const rows = await prisma.$queryRaw<any[]>`
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
               AND t."status" = 'PUBLISHED'
           ) AS published_count
    FROM "Category" c
    WHERE c."pipelineStatus" = 'READY'
    ORDER BY c."lastAutopilotRunAt" ASC NULLS FIRST, c."launchOrder" ASC
    LIMIT 5
  `
  console.log('READY_ROWS:' + JSON.stringify(rows))

  const counts = await prisma.$queryRaw<any[]>`
    SELECT "pipelineStatus", COUNT(*)::int as count
    FROM "Category"
    GROUP BY "pipelineStatus"
    ORDER BY "pipelineStatus"
  `
  console.log('STATUS_COUNTS:' + JSON.stringify(counts))
  await prisma.$disconnect()
}
main()
