import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

const slug = process.argv[2]
if (!slug) { console.error('Usage: tsx _list-published-slugs.ts <categorySlug>'); process.exit(1) }

async function main() {
  const rows = await prisma.tutorial.findMany({
    where: { category: { slug }, status: 'PUBLISHED' },
    select: { slug: true },
    orderBy: { slug: 'asc' }
  })
  console.log('PUBLISHED_SLUGS:' + rows.map(r => r.slug).join(','))
  await prisma.$disconnect()
}
main().catch(e => { console.error(e.message); process.exit(1) })
