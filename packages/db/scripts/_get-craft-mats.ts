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
  console.log('MAT_COUNT:' + mats.length)
  for (const m of mats) console.log('MAT:' + m.slug + '|' + m.name)
  await prisma.$disconnect()
}
main()
