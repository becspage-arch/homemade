import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

const slug = process.argv[2]
if (!slug) { console.error('Usage: tsx _claim-slot.ts <slug>'); process.exit(1) }

async function main() {
  const updated = await prisma.category.update({
    where: { slug },
    data: { lastAutopilotRunAt: new Date() },
    select: { id: true, slug: true, lastAutopilotRunAt: true },
  })
  console.log('CLAIMED:' + JSON.stringify(updated))
  await prisma.$disconnect()
}
main()
