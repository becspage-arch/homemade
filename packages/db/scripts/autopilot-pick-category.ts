import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

const claimSlug = process.argv[2] // if provided, claim this slug

async function main(): Promise<void> {
  if (claimSlug) {
    const updated = await prisma.category.updateMany({
      where: { slug: claimSlug },
      data: { lastAutopilotRunAt: new Date() },
    })
    console.log(`Claimed slot for ${claimSlug}: updated ${updated.count} row(s)`)
    return
  }

  const categories = await prisma.category.findMany({
    where: { pipelineStatus: 'READY' },
    select: {
      id: true,
      slug: true,
      name: true,
      targetTutorialCount: true,
      lastAutopilotRunAt: true,
      launchOrder: true,
    },
    orderBy: [{ lastAutopilotRunAt: 'asc' }, { launchOrder: 'asc' }],
  })

  for (const c of categories) {
    const pubCount = await prisma.tutorial.count({
      where: { categoryId: c.id, status: 'PUBLISHED' },
    })
    console.log(
      `${c.slug} | lastRun: ${c.lastAutopilotRunAt?.toISOString() ?? 'null'} | published: ${pubCount} / target: ${c.targetTutorialCount ?? 'null'} | launchOrder: ${c.launchOrder}`,
    )
  }

  const statusCounts = await prisma.category.groupBy({
    by: ['pipelineStatus'],
    _count: true,
  })
  console.log('\nStatus counts:')
  for (const s of statusCounts) {
    console.log(`  ${s.pipelineStatus}: ${s._count}`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
