import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  await prisma.category.update({
    where: { slug: 'sustainability' },
    data: { lastAutopilotRunAt: new Date() },
  })
  console.log('CLAIMED: sustainability slot claimed at ' + new Date().toISOString())
}

main().catch(err => { console.error(err); process.exit(1) }).finally(() => prisma.$disconnect())
