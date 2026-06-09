/**
 * Forcibly release the Prisma migration advisory lock (objid 72707369)
 * by terminating the backend that holds it.
 *
 * Use when the deploy hits P1002 advisory-lock timeout because a prior
 * pgbouncer-pooled connection still owns the lock. Run
 * inspect-advisory-lock.ts first to confirm what is being killed.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/release-advisory-lock.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/release-advisory-lock.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

const DRY_RUN = process.argv.includes('--dry-run')

const raw = process.env.DATABASE_URL
if (!raw) {
  console.error('DATABASE_URL not set')
  process.exit(2)
}
const direct = raw.replace('-pooler.', '.')

async function main(): Promise<void> {
  const client = new pg.Client({ connectionString: direct })
  await client.connect()

  const lockHolders = await client.query<{ pid: number }>(
    `SELECT pid FROM pg_locks
     WHERE locktype = 'advisory' AND objid = 72707369 AND granted = true`,
  )

  if (lockHolders.rows.length === 0) {
    console.log('[release] lock is already free; nothing to do')
    await client.end()
    return
  }

  for (const { pid } of lockHolders.rows) {
    if (DRY_RUN) {
      console.log(`[release] would call pg_terminate_backend(${pid}) (dry-run)`)
      continue
    }
    const result = await client.query<{ pg_terminate_backend: boolean }>(
      'SELECT pg_terminate_backend($1) AS pg_terminate_backend',
      [pid],
    )
    console.log(`[release] pg_terminate_backend(${pid}) = ${result.rows[0]?.pg_terminate_backend}`)
  }

  if (!DRY_RUN) {
    const after = await client.query(
      `SELECT pid FROM pg_locks
       WHERE locktype = 'advisory' AND objid = 72707369 AND granted = true`,
    )
    console.log(`[release] remaining holders: ${after.rows.length}`)
  }

  await client.end()
}

main().catch((err) => {
  console.error('[release] failed:', err)
  process.exit(1)
})
