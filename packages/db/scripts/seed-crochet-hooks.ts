/**
 * Idempotent upsert of the master CrochetHook list from
 * `packages/db/scripts/data/crochet-hooks.ts` into the CrochetHook table.
 *
 * Re-runs cleanly. Run once before uploading the crochet anchor batch.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-crochet-hooks.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-crochet-hooks.ts --dry-run
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

import { CROCHET_HOOKS } from './data/crochet-hooks.js'

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const seed of CROCHET_HOOKS) {
    const existing = await prisma.crochetHook.findUnique({ where: { slug: seed.slug } })
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
        await prisma.crochetHook.create({ data: { slug: seed.slug, ...payload } })
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
        await prisma.crochetHook.update({ where: { slug: seed.slug }, data: payload })
      }
      updated += 1
      console.log(`[seed] ~ ${seed.slug}`)
    } else {
      unchanged += 1
    }
  }

  console.log(
    `\n[seed] crochet-hooks: created=${created} updated=${updated} unchanged=${unchanged} total=${CROCHET_HOOKS.length}${DRY_RUN ? ' (dry-run)' : ''}`,
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
