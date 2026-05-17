/**
 * One-off seed for the Garden taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   garden                     "Garden"
 *   SubCat     vegetables                 "Vegetables"               (under garden)
 *   SubCat     fruit                      "Fruit"                    (under garden)
 *   SubCat     herbs                      "Herbs"                    (under garden)
 *   SubCat     flowers                    "Flowers"                  (under garden)
 *   SubCat     permaculture               "Permaculture"             (under garden)
 *   SubCat     microgreens                "Microgreens"              (under garden)
 *   SubCat     hydroponics                "Hydroponics"              (under garden)
 *   SubCat     mushroom-growing           "Mushroom growing"         (under garden)
 *   SubCat     foraging                   "Foraging"                 (under garden)
 *
 * Sub-categories match the description seeded in `seed-categories.ts`. The
 * upload-tutorial script requires both the Category and any referenced
 * SubCategory to exist before Garden rows can be inserted.
 *
 * Category itself was seeded earlier by `seed-categories.ts`. This script
 * is idempotent and slug-keyed; it never re-creates the category and
 * never touches `pipelineStatus`. The READY flip lives in
 * `flip-garden-ready.ts` and is run as a separate auditable step after
 * the rest of the pipeline scaffolding is committed and deployed green.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-garden-taxonomy.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-garden-taxonomy.ts --dry-run
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

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const garden = await prisma.category.findUnique({ where: { slug: 'garden' } })
  if (!garden) {
    console.error(
      '[seed] garden category not found. Run seed-categories.ts first.',
    )
    process.exit(2)
  }
  console.log(`[seed] garden → ${garden.id}`)

  let created = 0
  let unchanged = 0

  for (const spec of SUB_CATEGORIES) {
    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: garden.id, slug: spec.slug } },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create] garden/${spec.slug}`)
      } else {
        const sub = await prisma.subCategory.create({
          data: {
            slug: spec.slug,
            name: spec.name,
            description: spec.description,
            order: spec.order,
            categoryId: garden.id,
          },
        })
        console.log(`[seed] garden/${spec.slug} → ${sub.id}`)
      }
      created += 1
      continue
    }

    unchanged += 1
  }

  console.log(
    `\n[seed] garden-taxonomy: created=${created} unchanged=${unchanged} total=${SUB_CATEGORIES.length}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
