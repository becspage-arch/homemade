/**
 * Preflight helper for the autopilot worker SKILL.md files. Returns exit
 * code 1 if the named stream has a paused `AutopilotPauseState` row, plus a
 * single line on stdout suitable for a `--detail` argument. Exit code 0 if
 * the stream is running.
 *
 * Used after the env-flag check and before the no-double-firing check:
 *
 *   PAUSE_REASON=$(pnpm --filter @homemade/db exec tsx \
 *     scripts/check-autopilot-pause-state.ts --stream cooking 2>/dev/null) || {
 *     pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
 *       --stream cooking --reason MANUAL_PAUSE --detail "$PAUSE_REASON"
 *     echo "[autopilot] cooking — paused via admin UI; exiting clean."
 *     exit 0
 *   }
 *
 * Reads DATABASE_URL from `.env.credentials` walking up from this file.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

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

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag)
  return i >= 0 ? process.argv[i + 1] : undefined
}

async function main(): Promise<void> {
  const stream = arg('--stream')
  if (!stream || !['cooking', 'baking', 'mindset'].includes(stream)) {
    console.error('usage: check-autopilot-pause-state.ts --stream cooking|baking|mindset')
    process.exit(2)
  }
  const { prisma } = await import('../src/index.js')
  const row = await prisma.autopilotPauseState.findUnique({
    where: { streamName: stream },
  })
  await prisma.$disconnect()
  if (row?.pausedAt) {
    const reason = row.reason ?? 'no reason provided'
    process.stdout.write(`Manual pause from /admin/system/autopilot at ${row.pausedAt.toISOString()}: ${reason}`)
    process.exit(1)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error('[check-autopilot-pause-state] failed:', err)
  process.exit(2)
})
