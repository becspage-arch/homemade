import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const updated = await prisma.category.update({
    where: { id: 'cmp8mect30003d4v4f2pheoi8' },
    data: { lastAutopilotRunAt: new Date() },
    select: { id: true, slug: true, lastAutopilotRunAt: true },
  })
  console.log('CLAIMED:', JSON.stringify(updated))
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
