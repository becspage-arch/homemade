import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const mats = await prisma.craftMaterial.findMany({
    where: { craft: 'fibre-arts' },
    select: { slug: true, name: true },
    orderBy: { slug: 'asc' },
  })
  console.log('CRAFT MATERIALS (fibre-arts):')
  mats.forEach(m => console.log(`  ${m.slug} — ${m.name}`))
  console.log('\nTotal:', mats.length)
}
main().catch(console.error).finally(() => prisma.$disconnect())
