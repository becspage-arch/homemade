import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  // Get all published tutorials in crochet foundations + stitches subcats
  const tutorials = await prisma.tutorial.findMany({
    where: {
      category: { slug: 'crochet' },
      status: 'PUBLISHED',
      type: { in: ['TECHNIQUE', 'STITCH'] }
    },
    select: { slug: true, title: true, type: true, subCategory: { select: { slug: true } } },
    orderBy: [{ subCategoryId: 'asc' }, { slug: 'asc' }]
  })
  console.log(`Total TECHNIQUE+STITCH tutorials: ${tutorials.length}`)
  const foundations = tutorials.filter(t => t.subCategory?.slug === 'foundations')
  const stitches = tutorials.filter(t => t.subCategory?.slug === 'stitches')
  console.log(`\nFoundations (${foundations.length}):`)
  foundations.forEach(t => console.log(`  ${t.slug}`))
  console.log(`\nStitches (${stitches.length}):`)
  stitches.forEach(t => console.log(`  ${t.slug}`))
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
