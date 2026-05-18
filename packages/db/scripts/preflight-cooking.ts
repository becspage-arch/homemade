import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  // 1. Pause check
  const paused = await prisma.autopilotPauseState.findMany({
    where: { streamName: { in: ['queue', 'global'] } },
  })
  const activePauses = paused.filter(r => r.pausedAt !== null)
  if (activePauses.length > 0) {
    console.log('MANUAL_PAUSE:', JSON.stringify(activePauses))
    process.exit(2)
  }
  console.log('PAUSE_CHECK: clear')

  // 2. Category state
  const cooking = await prisma.category.findFirst({
    where: { slug: 'cooking' },
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      lastAutopilotRunAt: true,
      launchOrder: true,
      _count: { select: { tutorials: { where: { status: 'PUBLISHED' } } } },
    },
  })
  if (!cooking) { console.log('CATEGORY_NOT_FOUND'); process.exit(3) }
  console.log('COOKING_STATE:', JSON.stringify({
    id: cooking.id,
    pipelineStatus: cooking.pipelineStatus,
    lastAutopilotRunAt: cooking.lastAutopilotRunAt,
    published: cooking._count.tutorials,
    target: cooking.targetTutorialCount,
  }))

  if (cooking.pipelineStatus !== 'READY') {
    console.log('NOT_READY: pipelineStatus=' + cooking.pipelineStatus)
    process.exit(4)
  }

  // 3. Hard chain cap check — count consecutive autopilot batches since last human commit
  // (We'll just note the last run timestamp for the double-fire check)
  const fiftyMinsAgo = new Date(Date.now() - 50 * 60 * 1000)
  const recentLastRun = cooking.lastAutopilotRunAt && cooking.lastAutopilotRunAt > fiftyMinsAgo
  console.log('DOUBLE_FIRE_WINDOW:', recentLastRun ? 'WITHIN_50_MIN' : 'CLEAR')
  console.log('LAST_RUN:', cooking.lastAutopilotRunAt?.toISOString() ?? 'never')

  await prisma.$disconnect()
}

main().catch(e => { console.error('ERR:', e.message); process.exit(1) })
