import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  const connectionString = process.env.DATABASE_URL!
  const adapter = new PrismaPg({ connectionString })
  const prisma = new PrismaClient({ adapter })

  // Step 0: Check pause state
  const paused = await prisma.autopilotPauseState.findMany({
    where: {
      streamName: { in: ['queue', 'global'] },
      pausedAt: { not: null },
    },
  })
  console.log('PAUSE_CHECK:', JSON.stringify(paused))

  // Step 1: Pick next category (round-robin)
  const picked = await prisma.$queryRaw<
    Array<{
      id: string
      slug: string
      pipelineStatus: string
      targetTutorialCount: number | null
      lastAutopilotRunAt: Date | null
      launchOrder: number
      published_count: number
    }>
  >`
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
    LIMIT 1
  `
  console.log('ROUND_ROBIN_PICK:', JSON.stringify(picked))

  // Also get counts for halting info
  const counts = await prisma.$queryRaw<
    Array<{ pipeline_status: string; cnt: bigint }>
  >`
    SELECT "pipelineStatus" AS pipeline_status, COUNT(*) AS cnt
    FROM "Category"
    GROUP BY "pipelineStatus"
  `
  console.log('CATEGORY_STATUS_COUNTS:', JSON.stringify(counts, (_, v) => typeof v === 'bigint' ? String(v) : v))

  await prisma.$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })
