/**
 * Apply migration phase_sewing_technique_slugs_001 directly.
 * Used because prisma migrate deploy cannot load .env.credentials
 * via the normal tsx script env-loading path.
 * Safe to re-run: all statements are additive (IF NOT EXISTS / column ADD).
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
    await prisma.$executeRawUnsafe(`ALTER TABLE "SewingPattern" ADD COLUMN IF NOT EXISTS "techniqueSlugs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`)
    console.log('  ✓ techniqueSlugs column added (or already existed)')

    await prisma.$executeRawUnsafe(`ALTER TABLE "SewingPattern" ADD COLUMN IF NOT EXISTS "criticalTechniques" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`)
    console.log('  ✓ criticalTechniques column added (or already existed)')

    await prisma.$executeRawUnsafe(`ALTER TABLE "SewingPattern" ADD COLUMN IF NOT EXISTS "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`)
    console.log('  ✓ aliases column added (or already existed)')

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SewingPattern_techniqueSlugs_idx" ON "SewingPattern" USING GIN ("techniqueSlugs")`)
    console.log('  ✓ GIN index on techniqueSlugs (or already existed)')

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SewingPattern_criticalTechniques_idx" ON "SewingPattern" USING GIN ("criticalTechniques")`)
    console.log('  ✓ GIN index on criticalTechniques (or already existed)')

    // Mark migration as applied in _prisma_migrations so prisma migrate status stays clean
    const migrationName = '20260910150000_phase_sewing_technique_slugs_001'
    const existing = await prisma.$queryRawUnsafe<{id: string}[]>(
      `SELECT id FROM "_prisma_migrations" WHERE migration_name = $1`,
      migrationName
    )
    if (existing.length === 0) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
         VALUES (gen_random_uuid(), 'manual', NOW(), $1, NULL, NULL, NOW(), 1)`,
        migrationName
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

main().catch((e) => { console.error(e); process.exit(1) })
