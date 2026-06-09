import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const tools = await prisma.tool.findMany({
    where: { OR: [
      { slug: { contains: 'felt' } },
      { slug: { contains: 'spin' } },
      { slug: { contains: 'weav' } },
      { slug: { contains: 'loom' } },
      { slug: { contains: 'macram' } },
      { slug: { contains: 'dye' } },
      { slug: { contains: 'rug' } },
      { slug: { contains: 'hook' } },
      { slug: { contains: 'needle' } },
      { slug: { contains: 'carder' } },
      { slug: { contains: 'shuttle' } },
      { slug: { contains: 'spindle' } },
      { slug: { contains: 'bobbin' } },
      { slug: { contains: 'comb' } },
      { slug: { contains: 'heddle' } },
      { slug: { contains: 'reed' } },
      { slug: { contains: 'swift' } },
      { slug: { contains: 'winder' } },
      { slug: { contains: 'mat' } },
      { slug: { contains: 'frame' } },
    ] },
    select: { slug: true, name: true },
    orderBy: { slug: 'asc' },
  })
  console.log('TOOL_COUNT:' + tools.length)
  for (const t of tools) console.log('TOOL:' + t.slug + '|' + t.name)
  await prisma.$disconnect()
}
main()
