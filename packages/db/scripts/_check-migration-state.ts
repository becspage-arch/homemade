/**
 * Inspect the _prisma_migrations table to see if the
 * phase_species_kingdom_001 migration is recorded as failed +
 * what the table state actually is (Species exists? PlantVariety
 * still exists? kingdom column?).
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

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  console.log('=== _prisma_migrations (last 5) ===')
  const rows = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT migration_name, started_at, finished_at, rolled_back_at, logs FROM "_prisma_migrations" ORDER BY started_at DESC LIMIT 5`,
  )
  for (const r of rows) console.log(r)

  console.log('\n=== Table existence: Species vs PlantVariety ===')
  const tables = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('Species', 'PlantVariety')`,
  )
  for (const t of tables) console.log(t)

  console.log('\n=== Species columns (if exists) ===')
  const sCols = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='Species' ORDER BY ordinal_position`,
  )
  for (const c of sCols) console.log(c)

  console.log('\n=== PlantVariety columns (if exists) ===')
  const pvCols = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='PlantVariety' ORDER BY ordinal_position`,
  )
  for (const c of pvCols) console.log(c)

  console.log('\n=== Kingdom enum ===')
  const kt = await prisma.$queryRawUnsafe<unknown[]>(
    `SELECT typname FROM pg_type WHERE typname = 'Kingdom'`,
  )
  for (const t of kt) console.log(t)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
