import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'
async function main() {
  const rows = await prisma.tutorial.findMany({
    where: { category: { slug: 'fibre-arts' } },
    select: { slug: true },
  })
  const slugs = rows.map(r => r.slug)
  console.log('SLUGS:' + JSON.stringify(slugs))
  await prisma.$disconnect()
}
main()
