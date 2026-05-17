/**
 * Idempotent upsert of the master Stitch list from
 * `packages/db/scripts/data/stitches.ts` into the Stitch table.
 *
 * Re-runs cleanly: created / updated / unchanged counts are reported at the
 * end. Run once before uploading the crochet anchor batch.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-stitches.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-stitches.ts --dry-run
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

import { STITCHES } from './data/stitches.js'

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  let created = 0
  let updated = 0
  let unchanged = 0

  // Two passes: first the rows without parents, then the rows with parents
  // (so the parent FK resolves cleanly without a deferred-constraint dance).
  const ordered = [
    ...STITCHES.filter((s) => !s.parentStitchSlug),
    ...STITCHES.filter((s) => s.parentStitchSlug),
  ]

  for (const seed of ordered) {
    const parentStitchId = seed.parentStitchSlug
      ? (await prisma.stitch.findUnique({ where: { slug: seed.parentStitchSlug } }))?.id ?? null
      : null
    if (seed.parentStitchSlug && !parentStitchId) {
      throw new Error(
        `Stitch "${seed.slug}" references parent slug "${seed.parentStitchSlug}" which is not seeded.`,
      )
    }

    const existing = await prisma.stitch.findUnique({ where: { slug: seed.slug } })
    const payload = {
      craft: seed.craft,
      canonicalName: seed.canonicalName,
      ukName: seed.ukName ?? null,
      usName: seed.usName ?? null,
      ukAbbreviation: seed.ukAbbreviation ?? null,
      usAbbreviation: seed.usAbbreviation ?? null,
      category: seed.category,
      chartSymbol: seed.chartSymbol ?? null,
      difficulty: seed.difficulty ?? null,
      parentStitchId,
      notes: seed.notes ?? null,
    }
    if (!existing) {
      if (!DRY_RUN) {
        await prisma.stitch.create({ data: { slug: seed.slug, ...payload } })
      }
      created += 1
      console.log(`[seed] + ${seed.slug} (${seed.canonicalName})`)
      continue
    }

    const hasChanged =
      existing.craft !== payload.craft ||
      existing.canonicalName !== payload.canonicalName ||
      (existing.ukName ?? null) !== payload.ukName ||
      (existing.usName ?? null) !== payload.usName ||
      (existing.ukAbbreviation ?? null) !== payload.ukAbbreviation ||
      (existing.usAbbreviation ?? null) !== payload.usAbbreviation ||
      existing.category !== payload.category ||
      (existing.chartSymbol ?? null) !== payload.chartSymbol ||
      (existing.difficulty ?? null) !== payload.difficulty ||
      (existing.parentStitchId ?? null) !== payload.parentStitchId ||
      (existing.notes ?? null) !== payload.notes

    if (hasChanged) {
      if (!DRY_RUN) {
        await prisma.stitch.update({ where: { slug: seed.slug }, data: payload })
      }
      updated += 1
      console.log(`[seed] ~ ${seed.slug}`)
    } else {
      unchanged += 1
    }
  }

  console.log(
    `\n[seed] stitches: created=${created} updated=${updated} unchanged=${unchanged} total=${STITCHES.length}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
