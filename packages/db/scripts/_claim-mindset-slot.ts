import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })

import { prisma } from '../src'

async function main(): Promise<void> {
  const cat = await prisma.category.findFirst({ where: { slug: 'mindset' }, select: { id: true, pipelineStatus: true } })
  if (!cat) { console.error('mindset category not found'); process.exit(1) }
  console.log('pipelineStatus:', cat.pipelineStatus)
  await prisma.category.update({ where: { id: cat.id }, data: { lastAutopilotRunAt: new Date() } })
  console.log('Slot claimed for mindset at', new Date().toISOString())
}

main().catch(e => { console.error(e.message); process.exit(1) }).finally(() => prisma.$disconnect())
