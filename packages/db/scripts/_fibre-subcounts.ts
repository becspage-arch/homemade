import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'
async function main() {
  const rows = await prisma.tutorial.findMany({
    where: { category: { slug: 'fibre-arts' }, status: 'PUBLISHED' },
    select: { subCategory: { select: { slug: true } } },
  })
  const counts: Record<string, number> = {}
  for (const r of rows) {
    const slug = r.subCategory?.slug ?? 'none'
    counts[slug] = (counts[slug] ?? 0) + 1
  }
  console.log('SUBCOUNTS:' + JSON.stringify(counts))
  await prisma.$disconnect()
}
main()
