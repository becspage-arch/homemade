import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter } as any)
  const total = await (prisma as any).tutorial.count({ where: { category: { slug: 'mindset' }, status: 'PUBLISHED' } })
  console.log('Mindset PUBLISHED:', total)
  await prisma.$disconnect()
}
main().catch(console.error)
