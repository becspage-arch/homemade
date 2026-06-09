import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const cat = await prisma.category.findUnique({
    where: { slug: 'baking' },
    select: {
      id: true,
      slug: true,
      pipelineStatus: true,
      targetTutorialCount: true,
      lastAutopilotRunAt: true,
      launchOrder: true,
    },
  })
  if (!cat) { console.log('NOT_FOUND'); return }

  const published = await prisma.tutorial.count({
    where: { categoryId: cat.id, status: 'PUBLISHED' },
  })

  console.log(JSON.stringify({ ...cat, published_count: published }, null, 2))

  if (cat.targetTutorialCount !== null && published >= cat.targetTutorialCount) {
    console.log(`TARGET MET: ${published} >= ${cat.targetTutorialCount} — would flip to COMPLETE`)
  } else {
    console.log(`NOT YET COMPLETE: ${published} published / ${cat.targetTutorialCount ?? 'no target'} target`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
