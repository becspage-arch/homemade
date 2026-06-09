import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const slugs = await prisma.tutorial.findMany({
    where: { category: { slug: 'animals-smallholding' }, status: 'PUBLISHED' },
    select: { slug: true, subCategory: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })
  const byCat: Record<string, string[]> = {}
  for (const s of slugs) {
    const sub = s.subCategory?.slug ?? 'unknown'
    byCat[sub] = byCat[sub] ?? []
    byCat[sub].push(s.slug)
  }
  for (const [sub, list] of Object.entries(byCat)) {
    console.log(`## ${sub} (${list.length})`)
    list.forEach(sl => console.log(`  ${sl}`))
  }
  console.log(`\nTOTAL: ${slugs.length}`)
}

main().finally(() => prisma.$disconnect())
