/**
 * write-halt-signal — append a row to AutopilotHaltSignal.
 *
 * Used by autopilot worker sessions (`docs/autopilot-prompts/*.md`) when a
 * pre-flight check fires (backlog drained, quality drift, hard cap reached,
 * double-fire skip, env-pause set). The hourly Inngest cron
 * (`apps/web/src/inngest/functions/autopilot-halt-notify.ts`) drains the
 * unsent rows and surfaces them via Sentry + CloudWatch.
 *
 *   pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
 *     --stream cooking --reason BACKLOG_DRAINED --detail "47 in scope, threshold 50"
 *
 * `--stream` must be one of `cooking` / `baking` / `mindset`.
 * `--reason` is a free string but the autopilot prompts use:
 *   BACKLOG_DRAINED       — fewer than the threshold of in-scope backlog
 *                           entries remain; autopilot disables itself.
 *   QUALITY_DRIFT         — voice-check error rate trending up across the
 *                           last 3 batch reports; autopilot skips this fire,
 *                           cron stays enabled, manual review needed.
 *   HARD_CAP_REACHED      — 10+ consecutive autopilot batches with no
 *                           human commit; autopilot disables itself.
 *   SKIPPED_DOUBLE_FIRE   — a previous worker for the same stream is still
 *                           active; this fire exits cleanly.
 *   ENV_PAUSED            — AUTOPILOT_PAUSED=true read at preflight; this
 *                           fire exits cleanly without touching anything.
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

interface Args {
  stream: string
  reason: string
  detail: string | null
}

function parseArgs(argv: string[]): Args {
  let stream: string | null = null
  let reason: string | null = null
  let detail: string | null = null
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === undefined) continue
    if (a === '--stream') stream = argv[++i] ?? null
    else if (a === '--reason') reason = argv[++i] ?? null
    else if (a === '--detail') detail = argv[++i] ?? null
    else if (a.startsWith('--stream=')) stream = a.slice('--stream='.length)
    else if (a.startsWith('--reason=')) reason = a.slice('--reason='.length)
    else if (a.startsWith('--detail=')) detail = a.slice('--detail='.length)
  }
  if (!stream || !reason) {
    console.error(
      'usage: write-halt-signal --stream <cooking|baking|mindset> --reason <REASON> [--detail "free text"]',
    )
    process.exit(2)
  }
  if (!['cooking', 'baking', 'mindset'].includes(stream)) {
    console.error(`stream must be cooking | baking | mindset (got "${stream}")`)
    process.exit(2)
  }
  return { stream, reason, detail }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const row = await prisma.autopilotHaltSignal.create({
    data: {
      stream: args.stream,
      reason: args.reason,
      detail: args.detail,
    },
  })
  process.stdout.write(
    `[write-halt-signal] wrote ${row.id} stream=${row.stream} reason=${row.reason}\n`,
  )
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
