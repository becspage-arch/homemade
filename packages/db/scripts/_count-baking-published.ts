import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const count = await prisma.tutorial.count({
    where: { categoryId: 'cmp6k8pfp0000rgv4kpfgse4e', status: 'PUBLISHED' }
  })
  console.log('Baking published:', count)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
