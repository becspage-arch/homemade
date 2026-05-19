import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const cats = await prisma.category.findMany({
    select: { slug: true, name: true, pipelineStatus: true, lastAutopilotRunAt: true, targetTutorialCount: true },
    orderBy: [{ pipelineStatus: 'asc' }, { lastAutopilotRunAt: 'asc' }],
  })
  for (const c of cats) {
    const published = await prisma.tutorial.count({ where: { categoryId: (await prisma.category.findUnique({ where: { slug: c.slug }, select: { id: true } }))!.id, status: 'PUBLISHED' } })
    console.log(`${c.pipelineStatus.padEnd(12)} ${c.slug.padEnd(30)} ${published}/${c.targetTutorialCount ?? '?'}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
