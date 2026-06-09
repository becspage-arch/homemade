import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  // Count by pipeline status for the halt signal
  const statusCounts = await prisma.category.groupBy({
    by: ['pipelineStatus'],
    _count: { id: true },
  })
  const counts = Object.fromEntries(statusCounts.map(r => [r.pipelineStatus, r._count.id]))
  console.log('STATUS_COUNTS:' + JSON.stringify(counts))

  // Round-robin pick
  const candidates = await prisma.category.findMany({
    where: { pipelineStatus: 'READY' },
    orderBy: [{ lastAutopilotRunAt: 'asc' }, { launchOrder: 'asc' }],
    take: 5,
    select: {
      id: true,
      slug: true,
      name: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      lastAutopilotRunAt: true,
      launchOrder: true,
      _count: { select: { tutorials: { where: { status: 'PUBLISHED' } } } },
    },
  })

  console.log('CANDIDATES:' + JSON.stringify(candidates))
  await prisma.$disconnect()
}
main()
