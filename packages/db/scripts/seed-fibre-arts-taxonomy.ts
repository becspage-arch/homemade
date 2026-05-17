/**
 * One-off seed for the Fibre arts taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *   Category   fibre-arts        "Fibre arts"        (Category already
 *                                                     seeded by
 *                                                     seed-categories.ts;
 *                                                     this script only
 *                                                     creates the
 *                                                     sub-categories)
 *   SubCat     felting           "Felting"           (~30% of library)
 *   SubCat     spinning          "Spinning"          (~20%)
 *   SubCat     weaving           "Weaving"           (~20%)
 *   SubCat     natural-dyeing    "Natural dyeing"    (~15%)
 *   SubCat     macrame           "Macramé"           (~10%)
 *   SubCat     rug-making        "Rug making"        (~5%)
 *
 * Basketry is **deliberately not here** — basketry belongs to
 * `wood-natural-craft`. See `docs/fibre-arts-author.md` § "What's in
 * scope".
 *
 * Pipeline-status flip is a separate script
 * (`flip-fibre-arts-ready.ts`) so the taxonomy seed can run idempotently
 * during the master-seed pass while the autopilot-readiness flip is
 * gated by the rest of the scaffold (author prompt, renderers,
 * craft-materials, tools) being in place.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-fibre-arts-taxonomy.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-fibre-arts-taxonomy.ts --dry-run
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
    slug: 'felting',
    name: 'Felting',
    description:
      'Wet felting, needle felting, nuno felting, hat-shaping, wet-felted vessels. The lowest-barrier sub-category — a piece of merino roving, olive-oil soap, and a kitchen counter is the starter kit.',
    order: 10,
  },
  {
    slug: 'spinning',
    name: 'Spinning',
    description:
      'Drop spindle (top-whorl, bottom-whorl), supported spindle, spinning wheel (Saxony / castle / e-spinner), fibre preparation (carding, combing, blending). Wheel and spindle paired throughout.',
    order: 20,
  },
  {
    slug: 'weaving',
    name: 'Weaving',
    description:
      'Frame loom, rigid heddle, four-shaft, tapestry, inkle, card weaving. Standard four-block drafts (threading, tie-up, treadling, drawdown) for the patterns; the renderer handles the layout.',
    order: 30,
  },
  {
    slug: 'natural-dyeing',
    name: 'Natural dyeing',
    description:
      'Plant dyes, mineral mordants, indigo, eco-printing. Every entry cross-links the dye-plant source in Garden and the mordant-safety reference in Herbal medicine.',
    order: 40,
  },
  {
    slug: 'macrame',
    name: 'Macramé',
    description:
      'The ten fundamental knots (square, alternating square, half-hitch L+R, double half-hitch L+R, lark’s head, gathering, overhand, figure-8) plus the projects built from them — plant hangers, wall hangings, belts.',
    order: 50,
  },
  {
    slug: 'rug-making',
    name: 'Rug making',
    description:
      'Hooked, latch-hook, rag rugs, locker hook. Slower-to-publish than the other sub-categories because the source canon is thinner and finished pieces are harder to photograph well.',
    order: 60,
  },
]

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  console.log(`[seed-fibre-arts-taxonomy] starting${dryRun ? ' (dry-run)' : ''}`)

  if (dryRun) {
    for (const spec of SUB_CATEGORIES) {
      console.log(`  fibre-arts/${spec.slug} → ${spec.name}`)
    }
    return
  }

  const { prisma } = await import('../src/index.js')

  // The Category itself was seeded by seed-categories.ts. Look it up by
  // slug; bail if it's missing rather than recreating it (the
  // launchOrder + targetTutorialCount fields live there and we don't
  // want to clobber them).
  const fibreArts = await prisma.category.findUnique({
    where: { slug: 'fibre-arts' },
  })
  if (!fibreArts) {
    throw new Error(
      '[seed-fibre-arts-taxonomy] Category "fibre-arts" not found — run seed-categories.ts first',
    )
  }
  console.log(`[seed] fibre-arts → ${fibreArts.id}`)

  for (const spec of SUB_CATEGORIES) {
    const sub = await prisma.subCategory.upsert({
      where: { categoryId_slug: { categoryId: fibreArts.id, slug: spec.slug } },
      create: {
        slug: spec.slug,
        name: spec.name,
        description: spec.description,
        order: spec.order,
        categoryId: fibreArts.id,
      },
      update: {
        // Keep description + order in sync if the brief evolves; never
        // overwrite slug or categoryId.
        name: spec.name,
        description: spec.description,
        order: spec.order,
      },
    })
    console.log(`[seed] fibre-arts/${spec.slug} → ${sub.id}`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed-fibre-arts-taxonomy] failed:', err)
  process.exit(1)
})
