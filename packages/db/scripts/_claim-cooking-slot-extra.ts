import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const cat = await prisma.category.update({
    where: { slug: 'cooking' },
    data: { lastAutopilotRunAt: new Date() },
    select: { id: true, slug: true, lastAutopilotRunAt: true },
  })
  console.log('CLAIMED:', JSON.stringify(cat))
}

main().catch(console.error).finally(() => prisma.$disconnect())
