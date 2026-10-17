/**
 * Idempotent upsert of the master Stitch list from
 * `packages/db/scripts/data/stitches.ts` into the Stitch table.
 *
 * Re-runs cleanly: created / updated / unchanged counts are reported at the
 * end, and each update names the fields it changes. Run once before uploading
 * the crochet anchor batch.
 *
 * The file is the source for the crochet, knitting and cross-stitch rows. The
 * table also holds the embroidery rows, which `scripts/seed-embroidery-stitches.ts`
 * seeds and this never touches. Edit the
 * notes HERE, not in the table: a voice sweep that rewrote 24 rows in the
 * database on 17 June 2026 and not the file meant a full run would have put
 * the long dashes back (fixed 17 October; `data/stitches.test.ts` now refuses
 * them). A dry run should report updated=0 against the live table.
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

/**
 * `--craft=<craft>` limits the run to one craft's rows. Without it the seeder
 * writes every row in the seed file. The cross-stitch batch was landed with
 * `--craft=cross-stitch` because a full run would then have pushed the 24
 * long-dash notes back over the swept crochet and knitting rows; that drift is
 * gone, so a full run is safe again, and the dry run says so (updated=0).
 */
const CRAFT_FILTER =
  process.argv.find((a) => a.startsWith('--craft='))?.slice('--craft='.length) ?? null

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  let created = 0
  let updated = 0
  let unchanged = 0

  // Two passes: first the rows without parents, then the rows with parents
  // (so the parent FK resolves cleanly without a deferred-constraint dance).
  const selected = CRAFT_FILTER
    ? STITCHES.filter((s) => s.craft === CRAFT_FILTER)
    : STITCHES
  if (CRAFT_FILTER && selected.length === 0) {
    throw new Error(`No seed rows for craft "${CRAFT_FILTER}".`)
  }
  const ordered = [
    ...selected.filter((s) => !s.parentStitchSlug),
    ...selected.filter((s) => s.parentStitchSlug),
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
      // Only written when the seed row declares them, so a row that leaves
      // aliases out never clears the ones already in the table.
      ...(seed.aliases ? { aliases: seed.aliases } : {}),
    }
    if (!existing) {
      if (!DRY_RUN) {
        await prisma.stitch.create({ data: { slug: seed.slug, ...payload } })
      }
      created += 1
      console.log(`[seed] + ${seed.slug} (${seed.canonicalName})`)
      continue
    }

    // Field by field, so a run says WHAT it would change. A change the file did
    // not mean to make (the table edited in place since the file was written)
    // shows up here before it is pushed back over the live rows.
    const changed: string[] = []
    if (existing.craft !== payload.craft) changed.push('craft')
    if (existing.canonicalName !== payload.canonicalName) changed.push('canonicalName')
    if ((existing.ukName ?? null) !== payload.ukName) changed.push('ukName')
    if ((existing.usName ?? null) !== payload.usName) changed.push('usName')
    if ((existing.ukAbbreviation ?? null) !== payload.ukAbbreviation) changed.push('ukAbbreviation')
    if ((existing.usAbbreviation ?? null) !== payload.usAbbreviation) changed.push('usAbbreviation')
    if (existing.category !== payload.category) changed.push('category')
    if ((existing.chartSymbol ?? null) !== payload.chartSymbol) changed.push('chartSymbol')
    if ((existing.difficulty ?? null) !== payload.difficulty) changed.push('difficulty')
    if ((existing.parentStitchId ?? null) !== payload.parentStitchId) changed.push('parent')
    if ((existing.notes ?? null) !== payload.notes) changed.push('notes')
    if (seed.aliases && seed.aliases.join('|') !== (existing.aliases ?? []).join('|')) changed.push('aliases')
    const hasChanged = changed.length > 0

    if (hasChanged) {
      if (!DRY_RUN) {
        await prisma.stitch.update({ where: { slug: seed.slug }, data: payload })
      }
      updated += 1
      console.log(`[seed] ~ ${seed.slug} (${changed.join(', ')})`)
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
