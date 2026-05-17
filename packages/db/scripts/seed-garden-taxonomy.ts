/**
 * One-off seed for the Garden taxonomy.
 *
 * Pairs with migration `20260622000000_phase_garden_pipeline_001`. Sets up:
 *   Category   garden       (flips pipelineStatus NOT_READY → READY)
 *   SubCat     vegetables
 *   SubCat     fruit
 *   SubCat     herbs
 *   SubCat     flowers
 *   SubCat     permaculture
 *   SubCat     microgreens
 *   SubCat     hydroponics
 *   SubCat     mushroom-growing
 *   SubCat     foraging
 *
 * Sub-categories match the description seeded in `seed-categories.ts`. The
 * upload-tutorial script requires both the Category and any referenced
 * SubCategory to exist before Garden growing-guide rows can be inserted.
 *
 * Flipping pipelineStatus to READY is the final step — the autopilot
 * single-queue cron picks Garden up on its next fire. Run after
 * `seed-plants.ts` so the master `PlantVariety` rows exist before any
 * bulk authoring batch references them.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-garden-taxonomy.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
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
    slug: 'vegetables',
    name: 'Vegetables',
    description:
      'Beans, brassicas, alliums, roots, salads, fruiting vegetables. Sowing windows, spacing, harvesting cues, pest management.',
    order: 10,
  },
  {
    slug: 'fruit',
    name: 'Fruit',
    description:
      'Soft fruit, tree fruit, cane fruit. Rootstocks, pruning, pollination groups, netting against birds.',
    order: 20,
  },
  {
    slug: 'herbs',
    name: 'Herbs',
    description:
      'Mediterranean (rosemary, thyme, sage) and tender (basil, coriander) culinary herbs. Drainage, light, replacement cycles.',
    order: 30,
  },
  {
    slug: 'flowers',
    name: 'Flowers',
    description:
      'Edible flowers, cut-flower beds, companion-planting workhorses. Annuals and perennials, sowing windows, deadheading.',
    order: 40,
  },
  {
    slug: 'permaculture',
    name: 'Permaculture',
    description:
      'Forest gardens, polycultures, no-dig, sheet mulching, perennial vegetables, water harvesting.',
    order: 50,
  },
  {
    slug: 'microgreens',
    name: 'Microgreens',
    description:
      'Tray-grown seedlings cut at the cotyledon-to-first-true-leaf stage. Indoor, year-round, high yield per square metre.',
    order: 60,
  },
  {
    slug: 'hydroponics',
    name: 'Hydroponics',
    description:
      'Soilless growing — nutrient film, deep water culture, ebb-and-flow, Dutch buckets. Indoor and greenhouse systems.',
    order: 70,
  },
  {
    slug: 'mushroom-growing',
    name: 'Mushroom growing',
    description:
      'Oyster, shiitake, lion\'s mane on logs and bags. Inoculation, fruiting conditions, harvest cues, safety.',
    order: 80,
  },
  {
    slug: 'foraging',
    name: 'Foraging',
    description:
      'Wild food identification — UK hedgerow, woodland, coastline. Identification beats yield; absolute beginner safety rules.',
    order: 90,
  },
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  // The Garden Category row is already seeded by `seed-categories.ts` with
  // pipelineStatus = NOT_READY. The pipeline-setup session flips it to READY
  // now that the schema + author docs + master plant table + anchor batch
  // are all in place. We never touch description / target / launchOrder
  // here — those live in `seed-categories.ts`.
  const existing = await prisma.category.findUnique({
    where: { slug: 'garden' },
    select: { id: true, name: true, pipelineStatus: true },
  })

  if (!existing) {
    throw new Error(
      'Category "garden" not found. Run `seed-categories.ts` first to create the row.',
    )
  }

  const wasNotReady = existing.pipelineStatus === 'NOT_READY'
  if (wasNotReady) {
    await prisma.category.update({
      where: { id: existing.id },
      data: { pipelineStatus: 'READY' },
    })
    console.log(`[seed-garden-taxonomy] garden pipeline: NOT_READY → READY`)
  } else {
    console.log(
      `[seed-garden-taxonomy] garden pipelineStatus already ${existing.pipelineStatus} — left as-is`,
    )
  }

  for (const spec of SUB_CATEGORIES) {
    const sub = await prisma.subCategory.upsert({
      where: { categoryId_slug: { categoryId: existing.id, slug: spec.slug } },
      create: {
        slug: spec.slug,
        name: spec.name,
        description: spec.description,
        order: spec.order,
        categoryId: existing.id,
      },
      update: {
        description: spec.description,
        order: spec.order,
      },
    })
    console.log(`[seed-garden-taxonomy] garden/${spec.slug} → ${sub.id}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed-garden-taxonomy] failed:', err)
  process.exit(1)
})
