/**
 * Idempotent upsert of the full 17-category set with target counts +
 * visibility + launch order. Pairs with migration
 * `20260619000000_phase_categories_targets_001`.
 *
 * - New categories (Garden, Herbal medicine, Crochet, Knitting, Needlework,
 *   Sewing, Fibre arts, Wood & natural craft, Paper & word, Pottery &
 *   ceramics, Animals & smallholding, Home & repair, Natural home,
 *   Sustainability) are created with their factual one-liner description,
 *   target count from BUILD_PROGRESS.md § "Multi-category fill plan",
 *   isPublicVisible auto-computed (true if at least 10 published already,
 *   otherwise false), and a launchOrder.
 *
 * - Existing categories (Cooking, Baking, Mindset) keep their description /
 *   order — only `targetTutorialCount`, `launchOrder`, and (re-computed)
 *   `isPublicVisible` are touched.
 *
 * Visibility recompute runs against the live published count, so a stale
 * row with < 10 published would flip back to private — that's intentional
 * and matches the auto-flip behaviour in the publish path.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-categories.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-categories.ts --dry-run
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-categories.ts --prod
 *
 * `--prod` is a belt-and-braces confirmation prompt — required when
 * DATABASE_URL points at the production Neon branch.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline'

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

interface CategorySeed {
  slug: string
  name: string
  description: string
  targetTutorialCount: number
  launchOrder: number
  isExistingShipped: boolean
}

// Single-queue autopilot (phase_autopilot_single_queue_001).
// Existing shipped categories are the only ones with authoring prompts +
// master entities, so they're the only ones the round-robin queue should
// pick from on landing. Placeholder categories flip to READY in the
// per-category pipeline-setup session that lands their authoring prompt.
type PipelineSeedStatus = 'READY' | 'NOT_READY'

const CATEGORIES: CategorySeed[] = [
  // Existing shipped categories — descriptions handled by
  // update-category-descriptions.ts; we only set target + launchOrder here.
  {
    slug: 'cooking',
    name: 'Cooking',
    description:
      'Recipes, sauces, breads, preserves, ferments, and the techniques that support them. British and European canon plus air-fryer and slow-cooker.',
    targetTutorialCount: 7000,
    launchOrder: 1,
    isExistingShipped: true,
  },
  {
    slug: 'baking',
    name: 'Baking',
    description:
      'Bread, cakes, pastries, biscuits, pies, scones, and confectionery. Weights in grams, conventional °C temperatures, classical and modern methods.',
    targetTutorialCount: 3000,
    launchOrder: 2,
    isExistingShipped: true,
  },
  {
    slug: 'garden',
    name: 'Garden',
    description:
      'Vegetables, fruit, herbs, flowers, permaculture, microgreens, hydroponics, mushroom growing, and foraging.',
    targetTutorialCount: 4000,
    launchOrder: 3,
    isExistingShipped: false,
  },
  {
    slug: 'mindset',
    name: 'Mindset',
    description:
      'Tapping, energy statements, rituals, journal prompts, meditations, and readings. Practical, non-medical, drawn from multiple traditions.',
    targetTutorialCount: 1000,
    launchOrder: 4,
    isExistingShipped: true,
  },
  {
    slug: 'herbal-medicine',
    name: 'Herbal medicine',
    description:
      'Remedies, tinctures, infusions, decoctions, oils, balms, salves, and syrups. Home apothecary basics; not medical advice.',
    targetTutorialCount: 2500,
    launchOrder: 5,
    isExistingShipped: false,
  },
  {
    slug: 'crochet',
    name: 'Crochet',
    description: 'Stitches, techniques, and patterns. Public-domain pattern reference.',
    targetTutorialCount: 1500,
    launchOrder: 6,
    isExistingShipped: false,
  },
  {
    slug: 'knitting',
    name: 'Knitting',
    description: 'Stitches, techniques, and patterns. Public-domain pattern reference.',
    targetTutorialCount: 1500,
    launchOrder: 7,
    isExistingShipped: false,
  },
  {
    slug: 'needlework',
    name: 'Needlework',
    description: 'Cross-stitch, tatting, lacemaking, and needlepoint.',
    targetTutorialCount: 800,
    launchOrder: 8,
    isExistingShipped: false,
  },
  {
    slug: 'sewing',
    name: 'Sewing',
    description: 'Dressmaking, quilting, mending, and visible mending.',
    targetTutorialCount: 1200,
    launchOrder: 9,
    isExistingShipped: false,
  },
  {
    slug: 'fibre-arts',
    name: 'Fibre arts',
    description: 'Spinning, weaving, dyeing, felting, rug making, and macramé.',
    targetTutorialCount: 800,
    launchOrder: 10,
    isExistingShipped: false,
  },
  {
    slug: 'wood-natural-craft',
    name: 'Wood & natural craft',
    description: 'Woodworking, whittling, spoon carving, basketry, and willow weaving.',
    targetTutorialCount: 800,
    launchOrder: 11,
    isExistingShipped: false,
  },
  {
    slug: 'paper-word',
    name: 'Paper & word',
    description:
      'Paper crafts, bookbinding, calligraphy, scrapbooking, and journalling as craft.',
    targetTutorialCount: 800,
    launchOrder: 12,
    isExistingShipped: false,
  },
  {
    slug: 'pottery-ceramics',
    name: 'Pottery & ceramics',
    description: 'Hand-building, throwing, glazing, and firing.',
    targetTutorialCount: 500,
    launchOrder: 13,
    isExistingShipped: false,
  },
  {
    slug: 'animals-smallholding',
    name: 'Animals & smallholding',
    description: 'Beekeeping, chickens, and backyard livestock.',
    targetTutorialCount: 700,
    launchOrder: 14,
    isExistingShipped: false,
  },
  {
    slug: 'home-repair',
    name: 'Home & repair',
    description: 'Building, upholstery, furniture restoration, and bushcraft.',
    targetTutorialCount: 800,
    launchOrder: 15,
    isExistingShipped: false,
  },
  {
    slug: 'natural-home',
    name: 'Natural home',
    description: 'Soap, candles, DIY beauty, DIY cleaning, and home fragrance.',
    targetTutorialCount: 800,
    launchOrder: 16,
    isExistingShipped: false,
  },
  {
    slug: 'sustainability',
    name: 'Sustainability',
    description:
      'Solar, water reduction, composting, waste reduction, energy efficiency, and off-grid basics.',
    targetTutorialCount: 700,
    launchOrder: 17,
    isExistingShipped: false,
  },
]

// The auto-flip threshold lives in one place so the seed and the publish-path
// hook agree.
export const PUBLIC_VISIBILITY_THRESHOLD = 10

function validate(rows: CategorySeed[]): void {
  const errors: string[] = []
  const slugs = new Set<string>()
  const orders = new Set<number>()
  for (const row of rows) {
    if (slugs.has(row.slug)) errors.push(`duplicate slug: ${row.slug}`)
    slugs.add(row.slug)
    if (!/^[a-z0-9-]+$/.test(row.slug)) {
      errors.push(`invalid slug shape (must be lower-kebab): ${row.slug}`)
    }
    if (orders.has(row.launchOrder)) errors.push(`duplicate launchOrder: ${row.launchOrder}`)
    orders.add(row.launchOrder)
    if (row.targetTutorialCount <= 0) {
      errors.push(`${row.slug}: targetTutorialCount must be positive`)
    }
    if (row.description.length === 0) errors.push(`${row.slug}: empty description`)
  }
  if (errors.length > 0) {
    console.error('[seed-categories] validation failed:')
    for (const e of errors) console.error('  -', e)
    process.exit(2)
  }
}

async function confirmProd(): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(
      'You passed --prod. Type "yes seed prod" to proceed: ',
      (answer: string) => {
        rl.close()
        resolve(answer.trim().toLowerCase() === 'yes seed prod')
      },
    )
  })
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  const prod = process.argv.includes('--prod')

  validate(CATEGORIES)
  console.log(
    `[seed-categories] ${CATEGORIES.length} categories validated${dryRun ? ' (dry-run)' : ''}`,
  )

  const dbUrl = process.env.DATABASE_URL ?? ''
  if (prod) {
    if (!dbUrl.includes('neon.tech')) {
      console.warn(
        '[seed-categories] --prod passed but DATABASE_URL does not look like a Neon URL — continuing anyway.',
      )
    }
    const ok = await confirmProd()
    if (!ok) {
      console.error('[seed-categories] aborted by user.')
      process.exit(1)
    }
  }

  const { prisma, TutorialStatus } = await import('../src/index.js')

  // Published counts per slug — used to decide isPublicVisible on each row.
  const publishedByCategoryId = await prisma.tutorial.groupBy({
    by: ['categoryId'],
    where: { status: TutorialStatus.PUBLISHED },
    _count: { _all: true },
  })
  const existingCategories = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      targetTutorialCount: true,
      launchOrder: true,
      isPublicVisible: true,
      pipelineStatus: true,
    },
  })
  const idBySlug = new Map(existingCategories.map((c) => [c.slug, c.id]))
  const publishedBySlug = new Map<string, number>()
  for (const row of publishedByCategoryId) {
    const slug = existingCategories.find((c) => c.id === row.categoryId)?.slug
    if (slug) publishedBySlug.set(slug, row._count._all)
  }

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const row of CATEGORIES) {
    const publishedCount = publishedBySlug.get(row.slug) ?? 0
    const existing = existingCategories.find((c) => c.slug === row.slug)

    // Visibility on seed:
    //   - Existing shipped categories: leave the existing flag alone (so Cooking
    //     / Baking / Mindset stay public regardless of how many tutorials are
    //     PUBLISHED at any given moment — they're the spine).
    //   - New categories: auto-compute from the live published count, so the
    //     row lands private until autopilot has dropped 10 tutorials in.
    // The publish-path auto-flip (`maybeFlipCategoryVisibility`) only ever
    // flips false → true, so once a new category crosses the threshold it
    // stays public even if rows get unpublished.
    const isPublicVisible = row.isExistingShipped
      ? existing?.isPublicVisible ?? true
      : publishedCount >= PUBLIC_VISIBILITY_THRESHOLD

    // Single-queue autopilot seed status. Shipped spine categories land
    // READY so the queue picks them on first fire; the 14 placeholders stay
    // NOT_READY until their pipeline-setup session lands. The seed only
    // touches pipelineStatus when it would advance NOT_READY → desired —
    // never overrides PAUSED or COMPLETE state set by the publish hook /
    // admin.
    const desiredPipelineStatus: PipelineSeedStatus = row.isExistingShipped
      ? 'READY'
      : 'NOT_READY'
    const shouldAdvancePipelineStatus =
      existing?.pipelineStatus === 'NOT_READY' && desiredPipelineStatus !== 'NOT_READY'

    if (!existing) {
      if (dryRun) {
        console.log(
          `  [would create] ${row.slug} — target ${row.targetTutorialCount}, launchOrder ${row.launchOrder}, public ${isPublicVisible}, pipeline ${desiredPipelineStatus}`,
        )
        created++
        continue
      }
      await prisma.category.create({
        data: {
          slug: row.slug,
          name: row.name,
          description: row.description,
          targetTutorialCount: row.targetTutorialCount,
          launchOrder: row.launchOrder,
          isPublicVisible,
          pipelineStatus: desiredPipelineStatus,
          // `order` keeps its default 0; admin UI uses launchOrder for the
          // public rotation. Existing admin sorts that rely on `order` still
          // tie-break by `name asc`.
          order: row.launchOrder,
        },
      })
      console.log(
        `  [create] ${row.slug} — target ${row.targetTutorialCount}, launchOrder ${row.launchOrder}, public ${isPublicVisible}, pipeline ${desiredPipelineStatus}`,
      )
      created++
      continue
    }

    const desiredDescription = row.isExistingShipped ? existing.description ?? row.description : row.description

    const fieldsEqual =
      existing.targetTutorialCount === row.targetTutorialCount &&
      existing.launchOrder === row.launchOrder &&
      existing.isPublicVisible === isPublicVisible &&
      !shouldAdvancePipelineStatus &&
      (row.isExistingShipped || existing.description === row.description)

    if (fieldsEqual) {
      unchanged++
      continue
    }

    if (dryRun) {
      console.log(
        `  [would update] ${row.slug} — target ${existing.targetTutorialCount} → ${row.targetTutorialCount}, launchOrder ${existing.launchOrder} → ${row.launchOrder}, public ${existing.isPublicVisible} → ${isPublicVisible}${shouldAdvancePipelineStatus ? `, pipeline ${existing.pipelineStatus} → ${desiredPipelineStatus}` : ''}`,
      )
      updated++
      continue
    }

    await prisma.category.update({
      where: { id: existing.id },
      data: {
        name: row.name,
        description: desiredDescription,
        targetTutorialCount: row.targetTutorialCount,
        launchOrder: row.launchOrder,
        isPublicVisible,
        ...(shouldAdvancePipelineStatus ? { pipelineStatus: desiredPipelineStatus } : {}),
      },
    })
    console.log(
      `  [update] ${row.slug} — target ${row.targetTutorialCount}, launchOrder ${row.launchOrder}, public ${isPublicVisible}`,
    )
    updated++
  }

  console.log(
    `\n[seed-categories] done. ${created} created, ${updated} updated, ${unchanged} unchanged.`,
  )

  // Surface foreign rows that aren't in the seed config — never delete them,
  // just report so the operator can decide.
  const stray = existingCategories.filter((c) => !CATEGORIES.some((r) => r.slug === c.slug))
  if (stray.length > 0) {
    console.log(`\n[seed-categories] ${stray.length} category row(s) not in seed config:`)
    for (const c of stray) console.log(`  - ${c.slug} (${c.name})`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
