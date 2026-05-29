import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const updated = await prisma.category.updateMany({
    where: { slug: 'sustainability', pipelineStatus: 'READY' },
    data: { lastAutopilotRunAt: new Date() },
  })
  console.log('CLAIMED:', JSON.stringify(updated))
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
