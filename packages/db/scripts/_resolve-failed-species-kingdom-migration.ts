/**
 * One-off recovery: mark the failed first attempt of
 * phase_species_kingdom_001 as rolled-back so subsequent `prisma
 * migrate deploy` runs can re-apply the corrected (idempotent)
 * migration cleanly.
 *
 * Context (2026-06-10): the first attempt of the migration partially
 * applied — table rename + Kingdom enum + index renames + FK
 * constraint rename all succeeded, but a redundant
 * `ALTER TABLE "CompanionPlanting" RENAME CONSTRAINT ...` to the
 * same name aborted the migration. _prisma_migrations recorded the
 * attempt with finished_at=NULL and the error in logs.
 *
 * The corrected migration is fully idempotent (every step IF EXISTS
 * / IF NOT EXISTS-guarded) and is safe to re-run against the
 * partial-apply state. This script just marks the failed row as
 * rolled-back so Prisma proceeds.
 *
 * Safe to re-run; if the failed row is already marked rolled-back,
 * the UPDATE is a no-op.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/_resolve-failed-species-kingdom-migration.ts
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

const MIGRATION_NAME = '20260911000000_phase_species_kingdom_001'

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const before = await prisma.$queryRawUnsafe<Array<{ migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }>>(
    `SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" WHERE migration_name = $1`,
    MIGRATION_NAME,
  )

  if (before.length === 0) {
    console.log(`[resolve] no row for ${MIGRATION_NAME} in _prisma_migrations — nothing to do.`)
    await prisma.$disconnect()
    return
  }

  const row = before[0]!
  console.log(`[resolve] before: finished_at=${row.finished_at}, rolled_back_at=${row.rolled_back_at}`)

  if (row.rolled_back_at !== null) {
    console.log('[resolve] already marked rolled-back — nothing to do.')
    await prisma.$disconnect()
    return
  }

  if (row.finished_at !== null) {
    console.log('[resolve] row is finished (not failed) — refusing to mark rolled-back.')
    await prisma.$disconnect()
    return
  }

  await prisma.$executeRawUnsafe(
    `UPDATE "_prisma_migrations" SET rolled_back_at = NOW() WHERE migration_name = $1 AND finished_at IS NULL AND rolled_back_at IS NULL`,
    MIGRATION_NAME,
  )

  const after = await prisma.$queryRawUnsafe<Array<{ migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }>>(
    `SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" WHERE migration_name = $1`,
    MIGRATION_NAME,
  )
  console.log(`[resolve] after:  finished_at=${after[0]?.finished_at}, rolled_back_at=${after[0]?.rolled_back_at}`)
  console.log('[resolve] done. Next `prisma migrate deploy` will re-apply the corrected migration.')

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[resolve] failed:', err)
  process.exit(1)
})
