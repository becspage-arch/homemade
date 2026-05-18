/**
 * One-off seed for the Wood & natural craft taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   wood-natural-craft   "Wood & natural craft"
 *   SubCat     whittling            "Whittling"
 *   SubCat     spoon-carving        "Spoon carving"
 *   SubCat     green-woodwork       "Green-woodwork"
 *   SubCat     seasoned-wood        "Seasoned-wood projects"
 *   SubCat     basketry-willow      "Basketry & willow weaving"
 *   SubCat     pyrography           "Pyrography"
 *
 * Six sub-categories per the locked Wood & natural craft breakdown in
 * the pipeline-setup brief. The upload-tutorial script requires both
 * the Category and any referenced SubCategory to exist before
 * wood-craft rows can be inserted.
 *
 * Category itself was seeded earlier by `seed-categories.ts`. This
 * script only owns the sub-category list; it never re-creates the
 * Category row and never touches `pipelineStatus`. The READY flip
 * lives in `flip-wood-natural-craft-ready.ts` and is run as a
 * separate auditable step after the rest of the pipeline scaffolding
 * is committed and deployed green.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-wood-natural-craft-taxonomy.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-wood-natural-craft-taxonomy.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
for (const candidate of [
  resolve(__dirname, '../../..', '.env.credentials'),
  resolve(__dirname, '../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../..', '.env.credentials'),
  resolve(__dirname, '../../../../../..', '.env.credentials'),
]) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate })
    break
  }
}

interface SubCatSpec {
  slug: string
  name: string
  description: string
  order: number
}

const SUB_CATEGORIES: SubCatSpec[] = [
  {
    slug: 'whittling',
    name: 'Whittling',
    description:
      'Knife-only projects worked from a small blank — birds, butter knives, pot stirrers, simple figures, walking-stick details.',
    order: 10,
  },
  {
    slug: 'spoon-carving',
    name: 'Spoon carving',
    description:
      'Green-wood eating spoons, cooking spoons, ladles, kuksas, scoops. Sycamore, birch, lime, cherry.',
    order: 20,
  },
  {
    slug: 'green-woodwork',
    name: 'Green-woodwork',
    description:
      'Chairs, stools, mallets, tool handles, riven-blank work at the shaving horse. Hazel, ash, oak, beech.',
    order: 30,
  },
  {
    slug: 'seasoned-wood',
    name: 'Seasoned-wood projects',
    description:
      'Boxes, frames, picture frames, small furniture, joinery basics. Kiln-dried or air-dried board stock.',
    order: 40,
  },
  {
    slug: 'basketry-willow',
    name: 'Basketry & willow weaving',
    description:
      'Round baskets, square baskets, hurdles, garden structures, willow-rod fencing. Salix triandra, viminalis, purpurea.',
    order: 50,
  },
  {
    slug: 'pyrography',
    name: 'Pyrography',
    description:
      'Wood burning, design transfer, shading techniques. Birch, lime, sycamore, maple, beech, poplar, untreated pine only; ventilation required.',
    order: 60,
  },
]

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const woodNaturalCraft = await prisma.category.findUnique({
    where: { slug: 'wood-natural-craft' },
  })
  if (!woodNaturalCraft) {
    console.error(
      '[seed] wood-natural-craft category not found. Run seed-categories.ts first.',
    )
    process.exit(2)
  }
  console.log(`[seed] wood-natural-craft → ${woodNaturalCraft.id}`)

  let created = 0
  let unchanged = 0

  for (const spec of SUB_CATEGORIES) {
    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: woodNaturalCraft.id, slug: spec.slug } },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create] wood-natural-craft/${spec.slug}`)
      } else {
        const sub = await prisma.subCategory.create({
          data: {
            slug: spec.slug,
            name: spec.name,
            description: spec.description,
            order: spec.order,
            categoryId: woodNaturalCraft.id,
          },
        })
        console.log(`[seed] wood-natural-craft/${spec.slug} → ${sub.id}`)
      }
      created += 1
      continue
    }

    unchanged += 1
  }

  console.log(
    `\n[seed] wood-natural-craft-taxonomy: created=${created} unchanged=${unchanged} total=${SUB_CATEGORIES.length}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
