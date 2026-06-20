import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  await prisma.category.update({
    where: { id: 'cmp8mecss0002d4v43yzggom7' },
    data: { lastAutopilotRunAt: new Date() }
  })
  console.log('Claimed slot: lastAutopilotRunAt updated for crochet')
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
