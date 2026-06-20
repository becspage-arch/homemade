import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const categories = await prisma.category.findMany({
    where: { pipelineStatus: 'READY' },
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      lastAutopilotRunAt: true,
      launchOrder: true,
      autopilotContentTypesEnabled: true,
      _count: { select: { tutorials: { where: { status: 'PUBLISHED' } } } },
    },
    orderBy: [
      { lastAutopilotRunAt: 'asc' },
      { launchOrder: 'asc' },
    ],
  })

  const readyCount = await prisma.category.count({ where: { pipelineStatus: 'READY' } })
  const notReadyCount = await prisma.category.count({ where: { pipelineStatus: 'NOT_READY' } })
  const completeCount = await prisma.category.count({ where: { pipelineStatus: 'COMPLETE' } })
  const pausedCount = await prisma.category.count({ where: { pipelineStatus: 'PAUSED' } })

  console.log(JSON.stringify({
    candidates: categories,
    counts: { ready: readyCount, notReady: notReadyCount, complete: completeCount, paused: pausedCount },
  }, null, 2))

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
