import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const tutorials = await prisma.tutorial.findMany({
    where: { category: { slug: 'fibre-arts' } },
    select: { slug: true, status: true, subCategory: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })
  console.log('COUNT:' + tutorials.length)
  console.log('SLUGS:' + JSON.stringify(tutorials.map(t => ({ slug: t.slug, status: t.status, sub: t.subCategory?.slug }))))
  await prisma.$disconnect()
}
main()
