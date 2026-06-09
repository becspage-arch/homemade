import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const tutorials = await prisma.tutorial.findMany({
    where: {
      category: { slug: 'animals-smallholding' },
      status: 'PUBLISHED',
    },
    select: { slug: true, subCategory: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })

  const byCat: Record<string, string[]> = {}
  for (const t of tutorials) {
    const sub = t.subCategory?.slug ?? 'unknown'
    if (!byCat[sub]) byCat[sub] = []
    byCat[sub].push(t.slug)
  }

  for (const [sub, slugs] of Object.entries(byCat)) {
    console.log(`\n## ${sub} (${slugs.length})`)
    for (const s of slugs) console.log(`  ${s}`)
  }

  console.log(`\nTOTAL: ${tutorials.length}`)
  await prisma.$disconnect()
}

main().catch(console.error)
