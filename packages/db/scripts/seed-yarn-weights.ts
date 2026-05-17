/**
 * Idempotent upsert of the master YarnWeight list from
 * `packages/db/scripts/data/yarn-weights.ts` into the YarnWeight table.
 *
 * Re-runs cleanly. Run once before uploading the crochet anchor batch.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-yarn-weights.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-yarn-weights.ts --dry-run
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

import { YARN_WEIGHTS } from './data/yarn-weights.js'

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const seed of YARN_WEIGHTS) {
    const existing = await prisma.yarnWeight.findUnique({ where: { slug: seed.slug } })
    const payload = {
      canonicalName: seed.canonicalName,
      standardCategory: seed.standardCategory,
      ukNames: seed.ukNames,
      usNames: seed.usNames,
      wrapsPerInch: seed.wrapsPerInch ?? null,
      recommendedHookRangeMm: seed.recommendedHookRangeMm ?? null,
      recommendedNeedleRangeMm: seed.recommendedNeedleRangeMm ?? null,
      typicalDrape: seed.typicalDrape ?? null,
      typicalProjects: seed.typicalProjects ?? null,
      notes: seed.notes ?? null,
    }
    if (!existing) {
      if (!DRY_RUN) {
        await prisma.yarnWeight.create({ data: { slug: seed.slug, ...payload } })
      }
      created += 1
      console.log(`[seed] + ${seed.slug} (${seed.canonicalName})`)
      continue
    }

    const hasChanged =
      existing.canonicalName !== payload.canonicalName ||
      existing.standardCategory !== payload.standardCategory ||
      !arraysEqual(existing.ukNames, payload.ukNames) ||
      !arraysEqual(existing.usNames, payload.usNames) ||
      (existing.wrapsPerInch ?? null) !== payload.wrapsPerInch ||
      (existing.recommendedHookRangeMm ?? null) !== payload.recommendedHookRangeMm ||
      (existing.recommendedNeedleRangeMm ?? null) !== payload.recommendedNeedleRangeMm ||
      (existing.typicalDrape ?? null) !== payload.typicalDrape ||
      (existing.typicalProjects ?? null) !== payload.typicalProjects ||
      (existing.notes ?? null) !== payload.notes

    if (hasChanged) {
      if (!DRY_RUN) {
        await prisma.yarnWeight.update({ where: { slug: seed.slug }, data: payload })
      }
      updated += 1
      console.log(`[seed] ~ ${seed.slug}`)
    } else {
      unchanged += 1
    }
  }

  console.log(
    `\n[seed] yarn-weights: created=${created} updated=${updated} unchanged=${unchanged} total=${YARN_WEIGHTS.length}${DRY_RUN ? ' (dry-run)' : ''}`,
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
