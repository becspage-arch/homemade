import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const catId = 'cmp8mecss0002d4v43yzggom7'

  // Get all sub-categories and their published tutorial counts + types
  const subCats = await prisma.subCategory.findMany({
    where: { categoryId: catId },
    select: {
      id: true,
      slug: true,
      name: true,
      order: true,
      _count: { select: { tutorials: { where: { status: 'PUBLISHED' } } } }
    },
    orderBy: { order: 'asc' }
  })
  console.log('Sub-categories:')
  for (const sc of subCats) {
    console.log(`  ${sc.slug} (order=${sc.order}): ${sc._count.tutorials} published`)
  }

  // Count by tutorial type in this category
  const typeCounts = await prisma.$queryRaw<Array<{type: string, count: number}>>`
    SELECT t.type, COUNT(*)::int as count
    FROM "Tutorial" t
    WHERE t."categoryId" = ${catId} AND t."status" = 'PUBLISHED'
    GROUP BY t.type
    ORDER BY t.type
  `
  console.log('Tutorial type counts:', JSON.stringify(typeCounts))

  // Compute coverage per content type using the skill's mapping rules
  // TECHNIQUE: type=TECHNIQUE AND subcat.slug='foundations'
  const techCount = await prisma.tutorial.count({
    where: {
      categoryId: catId,
      status: 'PUBLISHED',
      type: 'TECHNIQUE',
      subCategory: { slug: 'foundations' }
    }
  })
  // STITCH: type=STITCH
  const stitchCount = await prisma.tutorial.count({
    where: { categoryId: catId, status: 'PUBLISHED', type: 'STITCH' }
  })
  // MOTIF: type=PATTERN AND subcat.slug='motifs'
  const motifCount = await prisma.tutorial.count({
    where: {
      categoryId: catId,
      status: 'PUBLISHED',
      type: 'PATTERN',
      subCategory: { slug: 'motifs' }
    }
  })
  // HOMEWARE: type=PATTERN AND subcat.slug='homewares'
  const homewareCount = await prisma.tutorial.count({
    where: {
      categoryId: catId,
      status: 'PUBLISHED',
      type: 'PATTERN',
      subCategory: { slug: 'homewares' }
    }
  })
  // GARMENT: type=PATTERN AND subcat.slug='garments' (inferred)
  const garmentCount = await prisma.tutorial.count({
    where: {
      categoryId: catId,
      status: 'PUBLISHED',
      type: 'PATTERN',
      subCategory: { slug: 'garments' }
    }
  })
  // AMIGURUMI: type=PATTERN AND subcat.slug='amigurumi' (inferred)
  const amigurumiCount = await prisma.tutorial.count({
    where: {
      categoryId: catId,
      status: 'PUBLISHED',
      type: 'PATTERN',
      subCategory: { slug: 'amigurumi' }
    }
  })

  console.log('Coverage by content type:')
  console.log(`  TECHNIQUE: ${techCount}`)
  console.log(`  STITCH: ${stitchCount}`)
  console.log(`  MOTIF: ${motifCount}`)
  console.log(`  HOMEWARE: ${homewareCount}`)
  console.log(`  GARMENT: ${garmentCount}`)
  console.log(`  AMIGURUMI: ${amigurumiCount}`)

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
