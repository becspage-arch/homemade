import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  const connectionString = process.env.DATABASE_URL!
  const adapter = new PrismaPg({ connectionString })
  const prisma = new PrismaClient({ adapter })

  // Get all published paper-word tutorial slugs + sub-category
  const tutorials = await prisma.tutorial.findMany({
    where: {
      category: { slug: 'paper-word' },
      status: 'PUBLISHED',
    },
    select: { slug: true, subCategory: { select: { slug: true } } },
    orderBy: [{ subCategory: { slug: 'asc' } }, { slug: 'asc' }],
  })

  for (const t of tutorials) {
    console.log(`${t.subCategory?.slug ?? 'none'}\t${t.slug}`)
  }
  console.log('COUNT:', tutorials.length)
  await prisma.$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })
