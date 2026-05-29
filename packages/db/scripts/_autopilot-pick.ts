import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const rows = await prisma.category.findMany({
    where: { pipelineStatus: 'READY' },
    select: {
      id: true, slug: true, name: true, pipelineStatus: true,
      targetTutorialCount: true, lastAutopilotRunAt: true, launchOrder: true,
      _count: { select: { tutorials: { where: { status: 'PUBLISHED' } } } }
    },
    orderBy: [{ lastAutopilotRunAt: 'asc' }, { launchOrder: 'asc' }],
    take: 5
  })
  console.log('CATEGORIES:' + JSON.stringify(rows))
  await prisma.$disconnect()
}
main().catch(e => { console.error(e.message); process.exit(1) })
