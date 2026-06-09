import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const cat = await prisma.category.findFirst({ where: { slug: 'pottery-ceramics' } })
  if (!cat) { console.log('[]'); return }
  const slugs = await prisma.tutorial.findMany({
    where: { categoryId: cat.id, status: 'PUBLISHED' },
    select: { slug: true },
    orderBy: { createdAt: 'asc' }
  })
  console.log(JSON.stringify(slugs.map(s => s.slug)))
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
