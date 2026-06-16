/**
 * Inspect (read-only) the Prisma migration advisory lock (objid 72707369).
 *
 * Reports any backend holding the lock plus that backend's recent query
 * and idle state. Reports nothing if the lock is free. Does NOT terminate
 * anything; use release-advisory-lock.ts after reviewing this output.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/inspect-advisory-lock.ts
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

const raw = process.env.DATABASE_URL
if (!raw) {
  console.error('DATABASE_URL not set')
  process.exit(2)
}
// Strip the pgbouncer pooler segment so we connect to the compute
// endpoint directly. Mirrors deploy.yml.
const direct = raw.replace('-pooler.', '.')

async function main(): Promise<void> {
  const client = new pg.Client({ connectionString: direct })
  await client.connect()

  const locks = await client.query<{
    pid: number
    granted: boolean
    classid: number
    objid: number
    objsubid: number
  }>(
    `SELECT pid, granted, classid, objid, objsubid
     FROM pg_locks
     WHERE locktype = 'advisory' AND objid = 72707369
     ORDER BY granted DESC, pid`,
  )

  if (locks.rows.length === 0) {
    console.log('[inspect] no backend holds advisory lock 72707369 right now')
    await client.end()
    return
  }

  console.log(`[inspect] ${locks.rows.length} row(s) on advisory lock 72707369:`)
  for (const row of locks.rows) {
    console.log(`  pid=${row.pid}  granted=${row.granted}`)

    const activity = await client.query<{
      pid: number
      state: string | null
      application_name: string | null
      client_addr: string | null
      query_start: Date | null
      state_change: Date | null
      backend_start: Date | null
      wait_event_type: string | null
      wait_event: string | null
      query: string | null
      usename: string | null
    }>(
      `SELECT pid, state, application_name, client_addr, query_start,
              state_change, backend_start, wait_event_type, wait_event,
              query, usename
       FROM pg_stat_activity
       WHERE pid = $1`,
      [row.pid],
    )
    if (activity.rows.length === 0) {
      console.log(`    (no pg_stat_activity row; backend already gone)`)
      continue
    }
    const a = activity.rows[0]!
    console.log(`    usename            = ${a.usename}`)
    console.log(`    application_name   = ${a.application_name}`)
    console.log(`    client_addr        = ${a.client_addr}`)
    console.log(`    state              = ${a.state}`)
    console.log(`    backend_start      = ${a.backend_start?.toISOString()}`)
    console.log(`    query_start        = ${a.query_start?.toISOString()}`)
    console.log(`    state_change       = ${a.state_change?.toISOString()}`)
    console.log(`    wait_event_type    = ${a.wait_event_type}`)
    console.log(`    wait_event         = ${a.wait_event}`)
    const q = (a.query ?? '').replace(/\s+/g, ' ').trim().slice(0, 240)
    console.log(`    query (truncated)  = ${q}`)
  }

  await client.end()
}

main().catch((err) => {
  console.error('[inspect] failed:', err)
  process.exit(1)
})
