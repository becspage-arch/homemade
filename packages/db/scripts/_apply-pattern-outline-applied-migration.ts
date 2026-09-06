/**
 * Apply migration 20261014000000_pattern_outline_applied directly.
 * Used because prisma migrate deploy cannot load .env.credentials via the
 * normal tsx script env-loading path — same reason as the sewing-technique
 * slugs apply script beside it.
 *
 * One additive nullable JSONB column, so it is safe to re-run.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "outlineApplied" JSONB`)
    console.log('  ✓ Pattern.outlineApplied column added (or already existed)')

    const migrationName = '20261014000000_pattern_outline_applied'
    const existing = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM "_prisma_migrations" WHERE migration_name = $1`,
      migrationName,
    )
    if (existing.length === 0) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
         VALUES (gen_random_uuid(), 'manual', NOW(), $1, NULL, NULL, NOW(), 1)`,
        migrationName,
      )
      console.log('  ✓ Migration recorded in _prisma_migrations')
    } else {
      console.log('  ↩ Migration already recorded in _prisma_migrations')
    }

    console.log('\nMigration applied.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
