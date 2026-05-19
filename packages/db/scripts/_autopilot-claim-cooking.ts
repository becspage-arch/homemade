import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  const connectionString = process.env.DATABASE_URL!
  const adapter = new PrismaPg({ connectionString })
  const prisma = new PrismaClient({ adapter })

  const CATEGORY_ID = 'cmp1gjrmd0000xkv4ac12gorm' // cooking

  await prisma.category.update({
    where: { id: CATEGORY_ID },
    data: { lastAutopilotRunAt: new Date() },
  })

  console.log('CLAIM_OK: cooking lastAutopilotRunAt set to', new Date().toISOString())
  await prisma.$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })
