import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'
async function main() {
  const count = await prisma.tutorial.count({ where: { categoryId: 'cmp1gjrmd0000xkv4ac12gorm', status: 'PUBLISHED' } })
  console.log('Cooking PUBLISHED:', count)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
