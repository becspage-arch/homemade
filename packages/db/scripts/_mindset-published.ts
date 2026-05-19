import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const cat = await prisma.category.findUnique({ where: { slug: 'mindset' } })
  if (!cat) { process.exit(1) }
  const rows = await prisma.tutorial.findMany({
    where: { categoryId: cat.id },
    select: { slug: true, status: true },
    orderBy: { slug: 'asc' },
  })
  for (const r of rows) console.log(`${r.status}\t${r.slug}`)
}

main().catch(e => { console.error(e); process.exit(1) })
