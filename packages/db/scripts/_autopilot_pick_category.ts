import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  // Get counts for all statuses
  const counts = await prisma.category.groupBy({
    by: ['pipelineStatus'],
    _count: { id: true },
  })
  console.log('STATUS_COUNTS:' + JSON.stringify(counts))

  // Pick candidate: READY, oldest lastAutopilotRunAt
  const candidates = await prisma.category.findMany({
    where: { pipelineStatus: 'READY' },
    select: {
      id: true,
      slug: true,
      name: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      lastAutopilotRunAt: true,
      launchOrder: true,
      _count: {
        select: {
          tutorials: { where: { status: 'PUBLISHED' } },
        },
      },
    },
    orderBy: [
      { lastAutopilotRunAt: 'asc' },
      { launchOrder: 'asc' },
    ],
  })

  if (candidates.length === 0) {
    console.log('NO_CANDIDATES')
    await prisma.$disconnect()
    return
  }

  // Filter out complete-but-not-flipped categories
  let picked = null
  let retried = false
  for (const c of candidates) {
    const publishedCount = c._count.tutorials
    if (c.targetTutorialCount != null && publishedCount >= c.targetTutorialCount) {
      // Should have been flipped already — flip it now
      await prisma.category.update({
        where: { id: c.id },
        data: { pipelineStatus: 'COMPLETE' },
      })
      console.log(`FLIPPED_COMPLETE:${c.slug} (published=${publishedCount} >= target=${c.targetTutorialCount})`)
      retried = true
      continue
    }
    picked = { ...c, publishedCount }
    break
  }

  if (!picked) {
    console.log('NO_VALID_CANDIDATES_AFTER_FILTER')
  } else {
    console.log('PICKED:' + JSON.stringify({
      id: picked.id,
      slug: picked.slug,
      name: picked.name,
      pipelineStatus: picked.pipelineStatus,
      targetTutorialCount: picked.targetTutorialCount,
      publishedCount: picked.publishedCount,
      lastAutopilotRunAt: picked.lastAutopilotRunAt,
      launchOrder: picked.launchOrder,
    }))
  }

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
