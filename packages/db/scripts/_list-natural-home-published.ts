import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const tutorials = await prisma.tutorial.findMany({
    where: { category: { slug: 'natural-home' }, status: 'PUBLISHED' },
    select: { slug: true, subCategory: { select: { slug: true } } },
    orderBy: [{ slug: 'asc' }]
  })
  for (const t of tutorials) {
    process.stdout.write(`${t.subCategory?.slug ?? 'null'} | ${t.slug}\n`)
  }
  console.log(`\nTotal: ${tutorials.length}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
