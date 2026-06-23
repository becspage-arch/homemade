/**
 * Ensure the "Stitching Mama" house-designer row exists. Idempotent.
 *
 * This used to also seed three hand-coded placeholder starter patterns
 * (tiny-alphabet-sampler, garden-bird-silhouette, wild-flower). They were crude
 * early-scaffolding pixel patterns that showed up as junk in the public library
 * alongside the genuine Stitching Mama catalogue, so they've been retired and
 * the rows deleted. Only the designer-row upsert remains, so the genuine
 * catalogue + tutorial-migrated patterns still have somewhere to point.
 */

import { prisma } from '../src/index.js'

async function main() {
  const designer = await prisma.designer.upsert({
    where: { slug: 'stitching-mama' },
    create: {
      slug: 'stitching-mama',
      displayName: 'Stitching Mama',
      bio: 'House label for the Homemade cross-stitch library. Full catalogue lands in Phase C.',
      isHouseDesigner: true,
    },
    update: {},
    select: { id: true, slug: true, displayName: true },
  })
  console.log(`Designer ready: ${designer.displayName} (${designer.id})`)
  console.log('Seed complete.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
