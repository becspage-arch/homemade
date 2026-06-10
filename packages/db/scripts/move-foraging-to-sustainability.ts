/**
 * Move `foraging` from garden to sustainability (garden cleanup A,
 * 2026-06-10).
 *
 * Foraging is wild-food harvesting + plant ID + safety — the opposite
 * of cultivation — and belongs under sustainability (which already
 * covers lower-impact eating + traditional skills + local ecology),
 * not garden. Zero PUBLISHED tutorials carry `garden/foraging` at the
 * time of the move so the shift is cheap.
 *
 * What this script does (idempotent):
 *
 *   1. Creates `sustainability/foraging` SubCategory if missing, with
 *      autopilotEnabled=true and the same human-readable description
 *      garden/foraging carries today.
 *   2. Updates `garden/foraging` SubCategory: autopilotEnabled=false,
 *      description appended with " [moved to sustainability/foraging
 *      2026-06-10]" so the admin UI surfaces the move. The row is
 *      retained (not deleted) to preserve referential integrity —
 *      anything that references it by id keeps working.
 *
 * Re-runs report the before / after state; never duplicates.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/move-foraging-to-sustainability.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/move-foraging-to-sustainability.ts --dry-run
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

const FORAGING_DESCRIPTION =
  'Wild food identification (UK hedgerow, woodland, coastline). Absolute-beginner safety rules. Plants only; mushroom foraging is its own separate scope.'

const DEPRECATED_NOTE = ' [moved to sustainability/foraging 2026-06-10]'

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  // ── 1. sustainability/foraging ─────────────────────────────────────
  const sustainability = await prisma.category.findUnique({
    where: { slug: 'sustainability' },
    select: { id: true },
  })
  if (!sustainability) {
    console.error('[move] sustainability category not found. Run seed-categories.ts first.')
    process.exit(2)
  }

  const susExisting = await prisma.subCategory.findUnique({
    where: { categoryId_slug: { categoryId: sustainability.id, slug: 'foraging' } },
    select: { id: true, autopilotEnabled: true, description: true },
  })

  if (!susExisting) {
    if (DRY_RUN) {
      console.log('[move] [would create] sustainability/foraging autopilotEnabled=true')
    } else {
      const sub = await prisma.subCategory.create({
        data: {
          slug: 'foraging',
          name: 'Foraging',
          description: FORAGING_DESCRIPTION,
          // Order placed at the end of the existing sustainability sub-cats
          // (composting 10, water 20, solar-and-energy 30,
          // insulation-and-draughtproofing 40, waste-reduction 50,
          // off-grid 60). Foraging lands at 70 — visible in the admin UI
          // ordering without re-sorting the existing pool.
          order: 70,
          categoryId: sustainability.id,
          autopilotEnabled: true,
        },
        select: { id: true },
      })
      console.log(`[move] CREATED sustainability/foraging -> ${sub.id} autopilot=true`)
    }
  } else {
    console.log(`[move] sustainability/foraging already exists (id=${susExisting.id}, autopilot=${susExisting.autopilotEnabled})`)
  }

  // ── 2. garden/foraging deprecated ─────────────────────────────────
  const garden = await prisma.category.findUnique({
    where: { slug: 'garden' },
    select: { id: true },
  })
  if (!garden) {
    console.error('[move] garden category not found.')
    process.exit(2)
  }

  const gardenForaging = await prisma.subCategory.findUnique({
    where: { categoryId_slug: { categoryId: garden.id, slug: 'foraging' } },
    select: { id: true, autopilotEnabled: true, description: true },
  })

  if (!gardenForaging) {
    console.log('[move] garden/foraging row not found — nothing to deprecate.')
  } else {
    const alreadyDeprecated =
      gardenForaging.autopilotEnabled === false &&
      gardenForaging.description?.includes('[moved to sustainability/foraging')

    if (alreadyDeprecated) {
      console.log('[move] garden/foraging already deprecated.')
    } else {
      const baseDescription = (gardenForaging.description ?? '').replace(
        /\s*\[moved to sustainability\/foraging[^\]]*\]\s*$/,
        '',
      )
      const updatedDescription = baseDescription + DEPRECATED_NOTE

      if (DRY_RUN) {
        console.log(`[move] [would update] garden/foraging autopilot=false, append "${DEPRECATED_NOTE}"`)
      } else {
        await prisma.subCategory.update({
          where: { id: gardenForaging.id },
          data: {
            autopilotEnabled: false,
            description: updatedDescription,
          },
        })
        console.log('[move] DEPRECATED garden/foraging autopilot=false, description updated')
      }
    }
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[move] failed:', err)
  process.exit(1)
})
