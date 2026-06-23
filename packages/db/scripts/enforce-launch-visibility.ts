/**
 * Canonical launch visibility enforcer.
 *
 * The public site exposes ONLY signed-off categories. This script is the single
 * source of truth for that set: it sets Category.isPublicVisible = true for the
 * categories in LAUNCH_VISIBLE_CATEGORY_SLUGS and = false for every other
 * category. Hidden categories 404 to the public and stay out of search.
 *
 * When a category signs off (per playbook_category_signoff), add its slug to
 * LAUNCH_VISIBLE_CATEGORY_SLUGS below and the next deploy reveals it. This
 * replaces the older per-category "flip public" writes (flip-crochet-public,
 * flip-needlework-ready) which forced visibility on every deploy — those now
 * leave isPublicVisible alone and this enforcer owns the dimension.
 *
 * Idempotent; reports before / after. Runs LAST among the visibility-touching
 * deploy steps so it is authoritative.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/enforce-launch-visibility.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/enforce-launch-visibility.ts --dry-run
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

const DRY_RUN = process.argv.includes('--dry-run')

/**
 * The only categories the public can see. Add a slug here when the category
 * has been signed off (see playbook_category_signoff).
 */
const LAUNCH_VISIBLE_CATEGORY_SLUGS = ['cooking', 'baking', 'cross-stitch']

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  console.log('[launch-visibility] Visible set:', LAUNCH_VISIBLE_CATEGORY_SLUGS.join(', '))

  const categories = await prisma.category.findMany({
    select: { id: true, slug: true, isPublicVisible: true },
    orderBy: { slug: 'asc' },
  })

  let reveals = 0
  let hides = 0

  for (const cat of categories) {
    const shouldBeVisible = LAUNCH_VISIBLE_CATEGORY_SLUGS.includes(cat.slug)
    if (cat.isPublicVisible === shouldBeVisible) continue

    if (shouldBeVisible) reveals += 1
    else hides += 1

    if (DRY_RUN) {
      console.log(
        `[launch-visibility] DRY RUN: would set ${cat.slug}.isPublicVisible = ${shouldBeVisible}`,
      )
    } else {
      await prisma.category.update({
        where: { id: cat.id },
        data: { isPublicVisible: shouldBeVisible },
      })
      console.log(`[launch-visibility] ${cat.slug}.isPublicVisible -> ${shouldBeVisible}`)
    }
  }

  // Guard: every slug in the visible set must exist, or we have a typo that
  // would silently leave a category hidden.
  const known = new Set(categories.map((c) => c.slug))
  for (const slug of LAUNCH_VISIBLE_CATEGORY_SLUGS) {
    if (!known.has(slug)) {
      console.error(`[launch-visibility] WARNING: '${slug}' is not a known category slug`)
    }
  }

  console.log(
    `[launch-visibility] Done. ${reveals} revealed, ${hides} hidden this run.`,
  )
}

main()
  .catch((err) => {
    console.error('[launch-visibility] Unhandled error:', err)
    process.exit(1)
  })
  .finally(async () => {
    const { prisma } = await import('../src/index.js')
    await prisma.$disconnect()
  })
