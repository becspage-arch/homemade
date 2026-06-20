import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const recipes = await prisma.tutorial.findMany({
    where: {
      category: { slug: 'cooking' },
      status: 'PUBLISHED',
      cuisine: 'british',
    },
    select: { slug: true, title: true },
    orderBy: { slug: 'asc' },
  })
  console.log(`British published recipes: ${recipes.length}`)
  recipes.forEach(r => console.log(`  ${r.slug}`))
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
