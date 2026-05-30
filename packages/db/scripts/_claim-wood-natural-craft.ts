import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const updated = await prisma.category.update({
    where: { slug: 'wood-natural-craft' },
    data: { lastAutopilotRunAt: new Date() },
    select: { id: true, slug: true, lastAutopilotRunAt: true },
  })
  console.log('CLAIMED:' + JSON.stringify(updated))
  await prisma.$disconnect()
}
main()
