/**
 * One-off seed for the Pottery & ceramics taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   pottery-ceramics  "Pottery & ceramics"  (pipelineStatus → READY)
 *   SubCat     hand-building-no-equipment        "Hand-building (no equipment)"
 *   SubCat     surface-decoration                "Surface decoration"
 *   SubCat     throwing                          "Throwing"
 *   SubCat     glazing                           "Glazing"
 *   SubCat     firing                            "Firing"
 *   SubCat     clay-fundamentals                 "Clay fundamentals"
 *
 * The Category itself was seeded earlier by `seed-categories.ts` with
 * `pipelineStatus: NOT_READY`. This script:
 *   1. Flips Category.pipelineStatus → READY so the single-queue round-
 *      robin autopilot picks Pottery up on its next fire.
 *   2. Owns the six sub-category list. The 70 / 30 weighting between the
 *      no-equipment track and the wheel + kiln track is enforced by the
 *      authoring prompt; the sub-categories themselves are equipment-
 *      neutral (a "surface decoration" tutorial could be sgraffito on
 *      bisque earthenware — kiln-required — or polymer-clay carving —
 *      no kiln).
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-pottery-ceramics-taxonomy.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-pottery-ceramics-taxonomy.ts --dry-run
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
    slug: 'hand-building-no-equipment',
    name: 'Hand-building (no equipment)',
    description:
      'Pinch, coil, slab, drape, hump, and sprig-moulded work in air-dry, polymer, paper-clay, and kiln-fired bodies that can be built without a wheel. The no-equipment-track home of the pipeline; the largest single sub-category.',
    order: 10,
  },
  {
    slug: 'surface-decoration',
    name: 'Surface decoration',
    description:
      'Sgraffito, mishima inlay, slip-trailing, terra sigillata, burnishing, carving, stamping, and impressed work on greenware and bisque. Works across no-equipment and kiln-fired bodies; the technique is the same whether the body is polymer or stoneware.',
    order: 20,
  },
  {
    slug: 'throwing',
    name: 'Throwing',
    description:
      'Wheel work — centring, opening, pulling walls, trimming foot rings, lidded forms, throwing off the hump. Requires a potter\'s wheel. The wheel + kiln track.',
    order: 30,
  },
  {
    slug: 'glazing',
    name: 'Glazing',
    description:
      'Dipping, brushing, pouring, spraying, and layering glazes on bisqueware. Both raw-material chemistry and pre-mixed commercial glazes. The no-equipment-track tutorials lean on commercial pre-mixed glazes; the studio track lands the raw chemistry.',
    order: 40,
  },
  {
    slug: 'firing',
    name: 'Firing',
    description:
      'Bisque and glaze firing schedules at cone 06, 04, 6, and 9-10. Electric kiln cycles, pyrometric-cone witness firings, raku and pit-fire methods. Kiln-required; the studio sub-category most heavily safety-loaded.',
    order: 50,
  },
  {
    slug: 'clay-fundamentals',
    name: 'Clay fundamentals',
    description:
      'Choosing a clay body, wedging, reclaim, drying stages (wet → leather-hard → bone-dry → greenware), bisque vs. glazeware, the differences between earthenware, stoneware, and porcelain. Foundational reading the other sub-categories cross-link back to.',
    order: 60,
  },
]

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  console.log(
    `[seed-pottery-ceramics-taxonomy] starting${dryRun ? ' (dry-run)' : ''}`,
  )

  const { prisma } = await import('../src/index.js')

  const pottery = await prisma.category.upsert({
    where: { slug: 'pottery-ceramics' },
    create: {
      slug: 'pottery-ceramics',
      name: 'Pottery & ceramics',
      description: 'Hand-building, throwing, glazing, and firing.',
      order: 130,
      pipelineStatus: 'READY',
    },
    update: { pipelineStatus: 'READY' },
  })
  console.log(
    `[seed] pottery-ceramics → ${pottery.id} (pipelineStatus=READY)`,
  )

  for (const spec of SUB_CATEGORIES) {
    const sub = await prisma.subCategory.upsert({
      where: { categoryId_slug: { categoryId: pottery.id, slug: spec.slug } },
      create: {
        slug: spec.slug,
        name: spec.name,
        description: spec.description,
        order: spec.order,
        categoryId: pottery.id,
      },
      update: {
        name: spec.name,
        description: spec.description,
        order: spec.order,
      },
    })
    console.log(`[seed] pottery-ceramics/${spec.slug} → ${sub.id}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
