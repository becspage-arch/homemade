import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const rows = await prisma.tutorial.findMany({
    where: { category: { slug: 'cooking' }, status: 'PUBLISHED' },
    select: { slug: true, subCategorySlug: true, mealType: true, cuisine: true },
    take: 20,
    orderBy: { createdAt: 'desc' }
  })
  console.log('SAMPLE:' + JSON.stringify(rows))
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
