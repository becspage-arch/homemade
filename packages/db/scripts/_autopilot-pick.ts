import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const cats = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      lastAutopilotRunAt: true,
      launchOrder: true,
    },
    orderBy: [{ lastAutopilotRunAt: 'asc' }, { launchOrder: 'asc' }],
  })

  for (const c of cats) {
    const count = await prisma.tutorial.count({
      where: { categoryId: c.id, status: 'PUBLISHED' },
    })
    console.log(
      JSON.stringify({
        slug: c.slug,
        pipelineStatus: c.pipelineStatus,
        target: c.targetTutorialCount,
        lastRun: c.lastAutopilotRunAt,
        launchOrder: c.launchOrder,
        published: count,
      })
    )
  }

  await prisma.$disconnect()
}

main().catch(console.error)
