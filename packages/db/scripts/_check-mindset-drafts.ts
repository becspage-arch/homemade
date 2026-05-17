import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })

import { prisma } from '../src'

async function main(): Promise<void> {
  const drafts = await prisma.tutorial.findMany({
    where: { category: { slug: 'mindset' }, status: 'DRAFT' },
    select: { slug: true, practiceType: true, type: true },
    orderBy: { slug: 'asc' }
  })
  console.log('DRAFT slugs:')
  drafts.forEach(d => console.log(`  ${d.practiceType ?? d.type}: ${d.slug}`))
}

main().catch(e => { console.error(e.message); process.exit(1) }).finally(() => prisma.$disconnect())
