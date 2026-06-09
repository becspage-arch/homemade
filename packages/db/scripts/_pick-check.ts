import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const cat = await prisma.category.findUnique({
    where: { slug: 'animals-smallholding' },
    select: { id: true, slug: true, pipelineStatus: true, targetTutorialCount: true, lastAutopilotRunAt: true },
  })

  const count = await prisma.tutorial.count({
    where: { categoryId: cat!.id, status: 'PUBLISHED' },
  })

  console.log(JSON.stringify({ ...cat, publishedCount: count }))
  await prisma.$disconnect()
}

main().catch(console.error)
