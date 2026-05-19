import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  const connectionString = process.env.DATABASE_URL!
  const adapter = new PrismaPg({ connectionString })
  const prisma = new PrismaClient({ adapter })

  // Get all published cooking tutorial slugs
  const tutorials = await prisma.tutorial.findMany({
    where: {
      category: { slug: 'cooking' },
      status: 'PUBLISHED',
    },
    select: { slug: true },
    orderBy: { slug: 'asc' },
  })

  console.log('PUBLISHED_SLUGS:', tutorials.map(t => t.slug).join('\n'))
  console.log('COUNT:', tutorials.length)
  await prisma.$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })
