/**
 * Idempotent upsert of the master KnittingNeedle list from
 * `packages/db/scripts/data/knitting-needles.ts` into the KnittingNeedle
 * table. Re-runs cleanly. Run once before uploading the knitting anchor
 * batch.
 *
 * Mirrors `seed-crochet-hooks.ts` shape exactly — knitting and crochet
 * share the master-row pattern; only the per-craft Tutorial FK differs.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-knitting-needles.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-knitting-needles.ts --dry-run
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

import { KNITTING_NEEDLES } from './data/knitting-needles.js'

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const seed of KNITTING_NEEDLES) {
    const existing = await prisma.knittingNeedle.findUnique({ where: { slug: seed.slug } })
    const payload = {
      mmSize: seed.mmSize,
      canonicalName: seed.canonicalName,
      ukSize: seed.ukSize ?? null,
      usSize: seed.usSize ?? null,
      jpSize: seed.jpSize ?? null,
      suitableYarnWeightSlugs: seed.suitableYarnWeightSlugs,
      notes: seed.notes ?? null,
    }
    if (!existing) {
      if (!DRY_RUN) {
        await prisma.knittingNeedle.create({ data: { slug: seed.slug, ...payload } })
      }
      created += 1
      console.log(`[seed] + ${seed.slug} (${seed.canonicalName})`)
      continue
    }

    const hasChanged =
      existing.mmSize !== payload.mmSize ||
      existing.canonicalName !== payload.canonicalName ||
      (existing.ukSize ?? null) !== payload.ukSize ||
      (existing.usSize ?? null) !== payload.usSize ||
      (existing.jpSize ?? null) !== payload.jpSize ||
      !arraysEqual(existing.suitableYarnWeightSlugs, payload.suitableYarnWeightSlugs) ||
      (existing.notes ?? null) !== payload.notes

    if (hasChanged) {
      if (!DRY_RUN) {
        await prisma.knittingNeedle.update({ where: { slug: seed.slug }, data: payload })
      }
      updated += 1
      console.log(`[seed] ~ ${seed.slug}`)
    } else {
      unchanged += 1
    }
  }

  console.log(
    `\n[seed] knitting-needles: created=${created} updated=${updated} unchanged=${unchanged} total=${KNITTING_NEEDLES.length}${DRY_RUN ? ' (dry-run)' : ''}`,
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
