import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

const slug = process.argv[2]
if (!slug) { console.error('Usage: claim-slot.ts <slug>'); process.exit(1) }

async function main() {
  const result = await prisma.category.update({
    where: { slug },
    data: { lastAutopilotRunAt: new Date() },
    select: { slug: true, lastAutopilotRunAt: true },
  })
  console.log('SLOT_CLAIMED:', JSON.stringify(result))
  await prisma.$disconnect()
}

main().catch(e => { console.error('ERR:', e.message); process.exit(1) })
