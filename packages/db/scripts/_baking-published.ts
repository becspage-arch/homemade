import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const tutorials = await prisma.tutorial.findMany({
    where: { category: { slug: 'baking' }, status: { in: ['PUBLISHED', 'DRAFT'] } },
    select: { slug: true, subCategory: { select: { slug: true } }, status: true },
    orderBy: [{ subCategory: { slug: 'asc' } }, { slug: 'asc' }],
  })

  // Count by sub-category
  const byCat: Record<string, number> = {}
  for (const t of tutorials) {
    const sc = t.subCategory?.slug ?? 'unknown'
    byCat[sc] = (byCat[sc] ?? 0) + 1
  }
  
  console.log('=== Sub-category counts ===')
  for (const [cat, count] of Object.entries(byCat).sort()) {
    console.log(`${cat.padEnd(28)} ${count}`)
  }
  console.log(`\nTOTAL: ${tutorials.length}`)
  
  console.log('\n=== All slugs ===')
  for (const t of tutorials) {
    console.log(`${t.subCategory?.slug ?? 'unknown'}\t${t.slug}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
