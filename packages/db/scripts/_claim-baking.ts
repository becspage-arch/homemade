import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const updated = await prisma.category.update({
    where: { slug: 'baking' },
    data: { lastAutopilotRunAt: new Date() },
    select: { slug: true, lastAutopilotRunAt: true },
  })
  console.log('CLAIMED:', JSON.stringify(updated))
}

main().catch(console.error).finally(() => prisma.$disconnect())
