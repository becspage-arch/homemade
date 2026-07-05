import 'server-only'
import { prisma, Visibility } from '@homemade/db'
import { inngest } from '../client'
import { audit } from '@/lib/audit'
import { runCrossStitchBatch, runNeedleworkBatch, type BatchSummary, type Craft } from '@/lib/studio/generation/bulk/run'

/**
 * Server-side BULK CATALOGUE generation — the cross-stitch + needlework gem
 * routine, moved OFF Rebecca's PC into admin-triggered / cron Inngest jobs.
 *
 * Each function has TWO triggers:
 *   - a cron for the unattended cadence, gated PER CRAFT (BULK_AUTOPILOT_CROSS_STITCH
 *     / BULK_AUTOPILOT_NEEDLEWORK) so one craft can fill while the other waits for
 *     sign-off. The manual "Run a batch" button always works regardless;
 *   - an event ('bulk/<craft>.batch') the admin button fires.
 *
 * The cron STOPS when the category reaches its target (like the old PC routine's
 * 1500 ceiling) — the catalogue fills, then idles. Manual runs always run (so you
 * can still top up a "full" category).
 *
 * The batch runs the shared generation engine + the ruthless server-side vision
 * gate (run.ts). If the gate isn't wired (ANTHROPIC_API_KEY unset) the run is a
 * clean no-op — nothing ships un-judged.
 */

const XS_CRON_COUNT = 8
const NW_CRON_COUNT = 4
const MAX_MANUAL = 20

/** Category ceilings — the cron idles once a craft hits its target. Overridable. */
const TARGETS: Record<Craft, number> = {
  'cross-stitch': Number(process.env.BULK_XS_TARGET) || 1500,
  needlework: Number(process.env.BULK_NW_TARGET) || 1500,
}

interface BatchEventData {
  count?: number
  triggeredBy?: string
}

function manualCount(raw: unknown, fallback: number): number {
  const n = typeof raw === 'number' ? Math.round(raw) : NaN
  if (!Number.isFinite(n)) return fallback
  return Math.max(1, Math.min(MAX_MANUAL, n))
}

/** Live PUBLIC library count for a craft — drives the stop-at-target check. */
async function publicCount(craft: Craft): Promise<number> {
  if (craft === 'needlework') {
    return prisma.needleworkPattern.count({ where: { ownerUserId: null, visibility: Visibility.PUBLIC } })
  }
  return prisma.pattern.count({ where: { type: 'CROSS_STITCH', ownerUserId: null, visibility: Visibility.PUBLIC } })
}

function autopilotOn(craft: Craft): boolean {
  const flag = craft === 'needlework' ? process.env.BULK_AUTOPILOT_NEEDLEWORK : process.env.BULK_AUTOPILOT_CROSS_STITCH
  return flag === '1'
}

/** Manual runs carry a real admin user id → record a rich audit entry. */
async function auditManual(triggeredBy: unknown, summary: BatchSummary): Promise<void> {
  if (typeof triggeredBy !== 'string' || !triggeredBy) return
  await audit({
    actorId: triggeredBy,
    action: 'system.bulk_generation.completed',
    resource: `bulk:${summary.craft}`,
    metadata: {
      craft: summary.craft,
      requested: summary.requested,
      published: summary.published,
      culled: summary.culled,
      repaired: summary.repaired,
      errors: summary.errors,
      gems: summary.gems,
      line: summary.line,
      ...(summary.skipped ? { skipped: summary.skipped } : {}),
    },
  })
}

/**
 * Shared body — plain async (no Inngest step). Each function wraps ONE call to
 * this in a single step.run so it's checkpointed/retryable as a unit.
 */
async function runCraft(
  craft: Craft,
  eventData: unknown,
  cronCount: number,
  run: (n: number) => Promise<BatchSummary>,
): Promise<unknown> {
  const data = eventData as BatchEventData | undefined
  const manual = typeof data?.count === 'number'

  if (!manual && !autopilotOn(craft)) {
    return { skipped: `autopilot paused (BULK_AUTOPILOT_${craft === 'needlework' ? 'NEEDLEWORK' : 'CROSS_STITCH'}!=1)` }
  }
  // Cron stops at the category target; a manual run can still top up past it.
  if (!manual) {
    const count = await publicCount(craft)
    if (count >= TARGETS[craft]) {
      return { skipped: 'catalogue full', count, target: TARGETS[craft] }
    }
  }

  const n = manual ? manualCount(data?.count, cronCount) : cronCount
  const summary = await run(n)
  if (manual) await auditManual(data?.triggeredBy, summary)
  return summary
}

export const bulkCrossStitchBatch = inngest.createFunction(
  {
    id: 'bulk-cross-stitch-batch',
    name: 'Bulk: cross-stitch gem batch',
    concurrency: { limit: 1 },
    retries: 1,
    triggers: [{ cron: '0 */2 * * *' }, { event: 'bulk/cross-stitch.batch' }],
  },
  async ({ event, step }) =>
    step.run('bulk-cross-stitch', () => runCraft('cross-stitch', event.data, XS_CRON_COUNT, runCrossStitchBatch)),
)

export const bulkNeedleworkBatch = inngest.createFunction(
  {
    id: 'bulk-needlework-batch',
    name: 'Bulk: needlework gem batch',
    concurrency: { limit: 1 },
    retries: 1,
    // Needlework renders on Fargate (heavier + slower) — a gentler cadence.
    triggers: [{ cron: '0 */6 * * *' }, { event: 'bulk/needlework.batch' }],
  },
  async ({ event, step }) =>
    step.run('bulk-needlework', () => runCraft('needlework', event.data, NW_CRON_COUNT, runNeedleworkBatch)),
)
