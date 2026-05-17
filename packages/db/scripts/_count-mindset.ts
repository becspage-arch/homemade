import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
import { prisma } from '../src'
async function main() {
  const count = await prisma.tutorial.count({ where: { category: { slug: 'mindset' }, status: 'PUBLISHED' } })
  console.log('Mindset PUBLISHED count:', count)
}
main().catch(console.error).finally(() => prisma.$disconnect())
