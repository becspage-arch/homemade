import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const slugs = await prisma.tutorial.findMany({
    where: {
      category: { slug: 'cooking' },
      status: 'PUBLISHED',
    },
    select: { slug: true, title: true },
    orderBy: { slug: 'asc' },
  })
  console.log(JSON.stringify(slugs.map(s => s.slug)))
}

main().catch((e) => { console.error(e); process.exit(1) })
