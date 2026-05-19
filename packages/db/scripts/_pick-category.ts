import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  // Get counts for context
  const allCats = await prisma.category.findMany({
    select: { pipelineStatus: true },
  })
  const ready = allCats.filter(c => c.pipelineStatus === 'READY').length
  const notReady = allCats.filter(c => c.pipelineStatus === 'NOT_READY').length
  const complete = allCats.filter(c => c.pipelineStatus === 'COMPLETE').length
  const paused = allCats.filter(c => c.pipelineStatus === 'PAUSED').length

  // Round-robin pick
  const candidates = await prisma.category.findMany({
    where: { pipelineStatus: 'READY' },
    orderBy: [
      { lastAutopilotRunAt: 'asc' },
      { launchOrder: 'asc' },
    ],
    take: 5,
  })

  if (candidates.length === 0) {
    console.log(JSON.stringify({
      picked: null,
      counts: { ready, notReady, complete, paused },
    }))
    return
  }

  // Check each candidate for published vs target
  for (const cat of candidates) {
    const publishedCount = await prisma.tutorial.count({
      where: { categoryId: cat.id, status: 'PUBLISHED' },
    })

    if (cat.targetTutorialCount !== null && publishedCount >= cat.targetTutorialCount) {
      // Flip to COMPLETE
      await prisma.category.update({
        where: { id: cat.id },
        data: { pipelineStatus: 'COMPLETE' },
      })
      console.error(`Flipped ${cat.slug} to COMPLETE (${publishedCount}/${cat.targetTutorialCount})`)
      continue
    }

    console.log(JSON.stringify({
      picked: { ...cat, publishedCount },
      counts: { ready, notReady, complete, paused },
    }))
    return
  }

  // All candidates were complete
  console.log(JSON.stringify({
    picked: null,
    counts: { ready, notReady, complete, paused },
  }))
}

main().catch(e => { console.error(e); process.exit(1) })
