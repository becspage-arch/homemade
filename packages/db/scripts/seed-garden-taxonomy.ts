/**
 * Seed (or upsert) the Garden taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *
 *   Plant-family + specialist-system sub-cats (the original 9, kept so the
 *   4 PUBLISHED tutorials authored under them continue to resolve):
 *     vegetables, fruit, herbs, flowers, permaculture, microgreens,
 *     hydroponics, mushroom-growing, foraging
 *
 *   Activity / cross-cutting sub-cats (added by the pipeline-setup pass,
 *   2026-06-10):
 *     soil-compost, propagation, pest-disease-management, seasonal-care,
 *     tools-equipment, indoor-gardening, garden-design, wildlife-gardening
 *
 * Total: 17 sub-cats. Fifteen run on autopilot; two (`garden-design`,
 * `wildlife-gardening`) are specialist stubs with `autopilotEnabled=false`
 * and will be authored by future dedicated workers.
 *
 * Per the autopilot-null-sort memory: newly-flipped Category.garden lands at
 * the back of the round-robin queue with `lastAutopilotRunAt` NULL; do not
 * backdate. The script does not touch `pipelineStatus`; the READY flip lives
 * in `flip-garden-ready.ts` and runs as a separate auditable step after the
 * rest of the Garden pipeline scaffolding is committed and deployed green.
 *
 * The script is idempotent and slug-keyed. It upserts the descriptions and
 * autopilot flags on each run, so re-running picks up tweaks without
 * duplicating rows.
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
  autopilotEnabled: boolean
}

const SUB_CATEGORIES: SubCatSpec[] = [
  // Plant-family sub-cats (original 9; preserved to keep PUBLISHED tutorials linked).
  {
    slug: 'vegetables',
    name: 'Vegetables',
    description:
      'Beans, brassicas, alliums, roots, salads, fruiting vegetables. Sowing windows, spacing, harvesting cues, pest management.',
    order: 10,
    autopilotEnabled: true,
  },
  {
    slug: 'fruit',
    name: 'Fruit',
    description:
      'Soft fruit, tree fruit, cane fruit. Rootstocks, pruning, pollination groups, netting against birds.',
    order: 20,
    autopilotEnabled: true,
  },
  {
    slug: 'herbs',
    name: 'Herbs',
    description:
      'Mediterranean (rosemary, thyme, sage) and tender (basil, coriander) culinary herbs. Drainage, light, replacement cycles.',
    order: 30,
    autopilotEnabled: true,
  },
  {
    slug: 'flowers',
    name: 'Flowers',
    description:
      'Edible flowers, cut-flower beds, companion-planting workhorses. Annuals and perennials, sowing windows, deadheading.',
    order: 40,
    autopilotEnabled: true,
  },
  {
    slug: 'permaculture',
    name: 'Permaculture',
    description:
      'Forest gardens, polycultures, no-dig, sheet mulching, perennial vegetables, water harvesting.',
    order: 50,
    autopilotEnabled: true,
  },
  {
    slug: 'microgreens',
    name: 'Microgreens',
    description:
      'Tray-grown seedlings cut at the cotyledon-to-first-true-leaf stage. Indoor, year-round, high yield per square metre.',
    order: 60,
    autopilotEnabled: true,
  },
  {
    slug: 'hydroponics',
    name: 'Hydroponics',
    description:
      'Soilless growing (nutrient film, deep water culture, ebb-and-flow, Dutch buckets). Indoor and greenhouse systems.',
    order: 70,
    autopilotEnabled: true,
  },
  {
    slug: 'mushroom-growing',
    name: 'Mushroom growing',
    description:
      "Oyster, shiitake, lion's mane on logs and bags. Inoculation, fruiting conditions, harvest cues, safety.",
    order: 80,
    autopilotEnabled: true,
  },
  // Foraging moved to sustainability 2026-06-10 (garden cleanup A). The
  // row is preserved for referential integrity; autopilotEnabled=false
  // and the description carries the move note so the admin UI surfaces
  // the shift. The seed `packages/db/scripts/move-foraging-to-sustainability.ts`
  // is the canonical migration; this entry stays in lockstep so a
  // future re-run of seed-garden-taxonomy doesn't undo the move.
  {
    slug: 'foraging',
    name: 'Foraging',
    description:
      'Wild food identification (UK hedgerow, woodland, coastline). Absolute-beginner safety rules. [moved to sustainability/foraging 2026-06-10]',
    order: 90,
    autopilotEnabled: false,
  },

  // Activity / cross-cutting sub-cats (added 2026-06-10, pipeline-setup pass).
  {
    slug: 'soil-compost',
    name: 'Soil and compost',
    description:
      'Soil testing (pH, nutrient, texture), hot and cold composting, leaf mould, green manures, mulching, no-dig beds.',
    order: 100,
    autopilotEnabled: true,
  },
  {
    slug: 'propagation',
    name: 'Propagation',
    description:
      'Seed sowing, softwood / semi-ripe / hardwood cuttings, division, layering, simple grafting. Plant-agnostic propagation method guides.',
    order: 110,
    autopilotEnabled: true,
  },
  {
    slug: 'pest-disease-management',
    name: 'Pest and disease management',
    description:
      'Integrated pest management, beneficial insects, organic controls, common pest identification, common plant diseases. Cross-plant guides.',
    order: 120,
    autopilotEnabled: true,
  },
  {
    slug: 'seasonal-care',
    name: 'Seasonal care',
    description:
      'Month-by-month tasks, pruning windows, planting calendars, frost protection, autumn clear-down, winter maintenance.',
    order: 130,
    autopilotEnabled: true,
  },
  {
    slug: 'tools-equipment',
    name: 'Tools and equipment',
    description:
      'Hand tools, power tools, maintenance, storage, sharpening. Choosing kit, looking after it, when to upgrade.',
    order: 140,
    autopilotEnabled: true,
  },
  {
    slug: 'indoor-gardening',
    name: 'Indoor gardening',
    description:
      'Houseplants, windowsill herbs, microgreen trays, sprouting, light-only growing. Indoor-only methods that do not need outdoor space.',
    order: 150,
    autopilotEnabled: true,
  },

  // Specialist stubs (autopilot off; future dedicated workers will commission).
  {
    slug: 'garden-design',
    name: 'Garden design',
    description:
      'Layout planning, plant combinations, garden rooms, cottage / formal / modern styles, hard landscaping basics. Aesthetic judgement work, paused for specialist authoring.',
    order: 160,
    autopilotEnabled: false,
  },
  {
    slug: 'wildlife-gardening',
    name: 'Wildlife gardening',
    description:
      'Pollinator gardens, habitat creation, native plants, bird-friendly, hedgehog highways. Region-specific species lists paused for specialist authoring.',
    order: 170,
    autopilotEnabled: false,
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
  console.log(`[seed] garden -> ${garden.id}`)

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const spec of SUB_CATEGORIES) {
    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: garden.id, slug: spec.slug } },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create] garden/${spec.slug} autopilot=${spec.autopilotEnabled}`)
      } else {
        const sub = await prisma.subCategory.create({
          data: {
            slug: spec.slug,
            name: spec.name,
            description: spec.description,
            order: spec.order,
            categoryId: garden.id,
            autopilotEnabled: spec.autopilotEnabled,
          },
        })
        console.log(`[seed] CREATED garden/${spec.slug} -> ${sub.id} autopilot=${spec.autopilotEnabled}`)
      }
      created += 1
      continue
    }

    const needsUpdate =
      existing.name !== spec.name ||
      existing.description !== spec.description ||
      existing.order !== spec.order ||
      existing.autopilotEnabled !== spec.autopilotEnabled

    if (!needsUpdate) {
      unchanged += 1
      continue
    }

    if (DRY_RUN) {
      console.log(`  [would update] garden/${spec.slug} autopilot=${spec.autopilotEnabled}`)
    } else {
      await prisma.subCategory.update({
        where: { id: existing.id },
        data: {
          name: spec.name,
          description: spec.description,
          order: spec.order,
          autopilotEnabled: spec.autopilotEnabled,
        },
      })
      console.log(`[seed] UPDATED garden/${spec.slug} autopilot=${spec.autopilotEnabled}`)
    }
    updated += 1
  }

  console.log(
    `\n[seed] garden-taxonomy: created=${created} updated=${updated} unchanged=${unchanged} total=${SUB_CATEGORIES.length}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
