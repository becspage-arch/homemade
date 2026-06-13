import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const count = await prisma.tutorial.count({
    where: { category: { slug: 'wood-natural-craft' }, status: 'PUBLISHED' },
  })
  console.log('PUBLISHED_COUNT:', count)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
