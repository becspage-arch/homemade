import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const cats = await prisma.subCategory.findMany({
    where: { category: { slug: 'cooking' } },
    select: { slug: true, name: true },
    orderBy: { name: 'asc' }
  })
  console.log('SUBCATS:' + JSON.stringify(cats))
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
