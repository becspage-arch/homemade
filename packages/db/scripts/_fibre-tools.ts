import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'
async function main() {
  // Get fibre-arts relevant tools
  const tools = await prisma.tool.findMany({
    where: { OR: [
      { slug: { contains: 'spin' } },
      { slug: { contains: 'weav' } },
      { slug: { contains: 'felt' } },
      { slug: { contains: 'loom' } },
      { slug: { contains: 'macram' } },
      { slug: { contains: 'rug' } },
      { slug: { contains: 'fibre' } },
      { slug: { contains: 'card' } },
      { slug: { contains: 'shuttle' } },
      { slug: { contains: 'dye' } },
      { slug: { contains: 'needle' } },
      { slug: { contains: 'heddle' } },
      { slug: { contains: 'bobbin' } },
      { slug: { contains: 'spindle' } },
    ]},
    select: { slug: true, name: true },
    orderBy: { slug: 'asc' }
  })
  const mats = await prisma.craftMaterial.findMany({
    select: { slug: true, name: true, craft: true },
    orderBy: { slug: 'asc' }
  })
  console.log('TOOLS:' + JSON.stringify(tools))
  console.log('MATS:' + JSON.stringify(mats))
  await prisma.$disconnect()
}
main()
