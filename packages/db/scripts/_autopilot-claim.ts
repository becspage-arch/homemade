import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  const connectionString = process.env.DATABASE_URL!
  const adapter = new PrismaPg({ connectionString })
  const prisma = new PrismaClient({ adapter })

  const categoryId = process.argv[2]
  if (!categoryId) { console.error('Usage: tsx scripts/_autopilot-claim.ts <categoryId>'); process.exit(1) }

  await prisma.category.update({
    where: { id: categoryId },
    data: { lastAutopilotRunAt: new Date() },
  })
  console.log('CLAIMED:', categoryId, new Date().toISOString())
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
