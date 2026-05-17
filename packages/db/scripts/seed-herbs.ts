/**
 * Idempotent upsert of the master Herb list from
 * `packages/db/scripts/data/herbs.ts` into the Herb table.
 *
 * Re-runs cleanly: created / updated / unchanged counts are reported at the
 * end. Run once before uploading the herbal anchor batch.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-herbs.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-herbs.ts --dry-run
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

import { HERBS } from './data/herbs.js'

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const seed of HERBS) {
    const existing = await prisma.herb.findUnique({ where: { slug: seed.slug } })
    if (!existing) {
      if (!DRY_RUN) {
        await prisma.herb.create({
          data: {
            slug: seed.slug,
            commonName: seed.commonName,
            latinBinomial: seed.latinBinomial,
            family: seed.family ?? null,
            partsUsed: seed.partsUsed,
            primaryActions: seed.primaryActions,
            keyConstituents: seed.keyConstituents ?? [],
            traditionsCited: seed.traditionsCited,
            safetyFlags: seed.safetyFlags,
            drugInteractionNotes: seed.drugInteractionNotes ?? null,
            notes: seed.notes ?? null,
          },
        })
      }
      created += 1
      console.log(`[seed] + ${seed.slug} (${seed.commonName})`)
      continue
    }

    // Cheap field comparison; only the array + string fields the seed sets.
    const hasChanged =
      existing.commonName !== seed.commonName ||
      existing.latinBinomial !== seed.latinBinomial ||
      (existing.family ?? null) !== (seed.family ?? null) ||
      !arraysEqual(existing.partsUsed, seed.partsUsed) ||
      !arraysEqual(existing.primaryActions, seed.primaryActions) ||
      !arraysEqual(existing.keyConstituents, seed.keyConstituents ?? []) ||
      !arraysEqual(existing.traditionsCited, seed.traditionsCited) ||
      !arraysEqual(existing.safetyFlags, seed.safetyFlags) ||
      (existing.drugInteractionNotes ?? null) !== (seed.drugInteractionNotes ?? null) ||
      (existing.notes ?? null) !== (seed.notes ?? null)

    if (hasChanged) {
      if (!DRY_RUN) {
        await prisma.herb.update({
          where: { slug: seed.slug },
          data: {
            commonName: seed.commonName,
            latinBinomial: seed.latinBinomial,
            family: seed.family ?? null,
            partsUsed: seed.partsUsed,
            primaryActions: seed.primaryActions,
            keyConstituents: seed.keyConstituents ?? [],
            traditionsCited: seed.traditionsCited,
            safetyFlags: seed.safetyFlags,
            drugInteractionNotes: seed.drugInteractionNotes ?? null,
            notes: seed.notes ?? null,
          },
        })
      }
      updated += 1
      console.log(`[seed] ~ ${seed.slug}`)
    } else {
      unchanged += 1
    }
  }

  console.log(
    `\n[seed] herbs: created=${created} updated=${updated} unchanged=${unchanged} total=${HERBS.length}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
