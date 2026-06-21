import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { PrismaClient, TutorialStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const cat = await prisma.category.findFirst({ where: { slug: 'cooking' }, select: { id: true } })
  if (!cat) { console.error('no cooking category'); process.exit(1) }

  const tutorials = await prisma.tutorial.findMany({
    where: { categoryId: cat.id, status: TutorialStatus.PUBLISHED },
    select: { slug: true },
    orderBy: { slug: 'asc' },
  })
  tutorials.forEach((t: { slug: string }) => console.log(t.slug))
  await prisma.$disconnect()
  await pool.end()
}

main().catch(e => { console.error(e); process.exit(1) })
