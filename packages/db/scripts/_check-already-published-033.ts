import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const slugs = ['almond-amaretto-cake','comb-texture-buttercream']
  const found = await prisma.tutorial.findMany({
    where: { slug: { in: slugs }, status: 'PUBLISHED' },
    select: { slug: true }
  })
  console.log('Already published:', found.map(f => f.slug).join(', ') || 'none')
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
