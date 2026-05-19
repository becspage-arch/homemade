import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const cat = await prisma.category.findUnique({ where: { slug: 'mindset' } })
  if (!cat) { console.error('mindset not found'); process.exit(1) }
  await prisma.category.update({
    where: { id: cat.id },
    data: { lastAutopilotRunAt: new Date() },
  })
  const published = await prisma.tutorial.count({ where: { categoryId: cat.id, status: 'PUBLISHED' } })
  console.log(JSON.stringify({ id: cat.id, slug: cat.slug, pipelineStatus: cat.pipelineStatus, targetTutorialCount: cat.targetTutorialCount, publishedCount: published }))
}

main().catch(e => { console.error(e); process.exit(1) })
