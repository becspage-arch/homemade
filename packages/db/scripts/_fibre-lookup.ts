import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'
async function main() {
  const tools = await prisma.tool.findMany({
    where: { slug: { contains: 'felt' } },
    select: { slug: true, name: true },
    orderBy: { slug: 'asc' }
  })
  const mat = await prisma.craftMaterial.findMany({
    where: { craft: 'fibre-arts' },
    select: { slug: true, name: true },
    orderBy: { slug: 'asc' }
  })
  console.log('TOOLS:' + JSON.stringify(tools.map(t => t.slug)))
  console.log('MATERIALS:' + JSON.stringify(mat.map(m => m.slug)))
  await prisma.$disconnect()
}
main()
