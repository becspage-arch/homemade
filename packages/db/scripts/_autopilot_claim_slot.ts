import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const categoryId = process.argv[2]
  if (!categoryId) { console.error('Usage: _autopilot_claim_slot.ts <categoryId>'); process.exit(1) }
  await prisma.category.update({
    where: { id: categoryId },
    data: { lastAutopilotRunAt: new Date() },
  })
  console.log('CLAIMED_OK:' + categoryId)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
