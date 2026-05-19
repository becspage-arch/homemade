import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const cat = await prisma.category.findUnique({ where: { slug: 'herbal-medicine' } })
  if (!cat) { console.log('NO CATEGORY'); return }

  const published = await prisma.tutorial.findMany({
    where: { categoryId: cat.id, status: 'PUBLISHED' },
    select: { slug: true, title: true, type: true },
  })
  console.log('PUBLISHED:')
  for (const t of published) console.log(JSON.stringify(t))

  const draft = await prisma.tutorial.findMany({
    where: { categoryId: cat.id, status: 'DRAFT' },
    select: { slug: true, title: true, type: true },
  })
  console.log('DRAFT:')
  for (const t of draft) console.log(JSON.stringify(t))

  await prisma.$disconnect()
}

main().catch(console.error)
