import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const tutorials = await prisma.tutorial.findMany({
    where: { category: { slug: 'cross-stitch' } },
    select: { slug: true, title: true, type: true, status: true, subCategory: { select: { slug: true } } },
    orderBy: { createdAt: 'asc' },
  })
  for (const t of tutorials) {
    console.log(t.slug + '\t' + t.type + '\t' + t.status + '\t' + (t.subCategory?.slug ?? 'null'))
  }
  console.log('\nTotal:', tutorials.length)
}

main().catch(console.error).finally(() => prisma.$disconnect())
