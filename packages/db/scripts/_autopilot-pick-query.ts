import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const cat = await prisma.category.findUnique({
    where: { slug: 'crochet' },
    select: {
      id: true,
      slug: true,
      autopilotContentTypesEnabled: true,
    }
  })
  console.log('CATEGORY:', JSON.stringify(cat, null, 2))
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
