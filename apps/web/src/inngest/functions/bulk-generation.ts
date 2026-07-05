import 'server-only'
import { inngest } from '../client'
import { audit } from '@/lib/audit'
import { runCrossStitchBatch, runNeedleworkBatch, type BatchSummary } from '@/lib/studio/generation/bulk/run'

/**
 * Server-side BULK CATALOGUE generation — the cross-stitch + needlework gem
 * routine, moved OFF Rebecca's PC into admin-triggered / cron Inngest jobs.
 *
 * Each function has TWO triggers:
 *   - a cron for the unattended cadence (gated on BULK_AUTOPILOT so it stays
 *     paused until Rebecca opts the automated fill in — the manual trigger below
 *     always works regardless);
 *   - an event ('bulk/<craft>.batch') the admin "Run a batch" button fires.
 *
 * The batch runs the shared generation engine + the ruthless server-side vision
 * gate (run.ts). If the gate isn't wired (ANTHROPIC_API_KEY unset) the run is a
 * clean no-op — nothing ships un-judged.
 */

const XS_CRON_COUNT = 8
const NW_CRON_COUNT = 4
const MAX_MANUAL = 20

/** The payload the admin "Run a batch" event carries (cron fires carry neither). */
interface BatchEventData {
  count?: number
  triggeredBy?: string
}

function manualCount(raw: unknown, fallback: number): number {
  const n = typeof raw === 'number' ? Math.round(raw) : NaN
  if (!Number.isFinite(n)) return fallback
  return Math.max(1, Math.min(MAX_MANUAL, n))
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

export const bulkCrossStitchBatch = inngest.createFunction(
  {
    id: 'bulk-cross-stitch-batch',
    name: 'Bulk: cross-stitch gem batch',
    // One batch at a time — two overlapping runs would race the catalogue.
    concurrency: { limit: 1 },
    retries: 1,
    triggers: [{ cron: '0 */2 * * *' }, { event: 'bulk/cross-stitch.batch' }],
  },
  async ({ event, step, logger }) => {
    const data = event.data as BatchEventData | undefined
    const manual = typeof data?.count === 'number'
    if (!manual && process.env.BULK_AUTOPILOT !== '1') {
      return { skipped: 'autopilot paused (BULK_AUTOPILOT!=1)' }
    }
    const count = manual ? manualCount(data?.count, XS_CRON_COUNT) : XS_CRON_COUNT
    const summary = await step.run('cross-stitch-batch', () => runCrossStitchBatch(count))
    logger.info('bulk cross-stitch batch done', { line: summary.line })
    if (manual) await step.run('audit', () => auditManual(data?.triggeredBy, summary))
    return summary
  },
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
  async ({ event, step, logger }) => {
    const data = event.data as BatchEventData | undefined
    const manual = typeof data?.count === 'number'
    if (!manual && process.env.BULK_AUTOPILOT !== '1') {
      return { skipped: 'autopilot paused (BULK_AUTOPILOT!=1)' }
    }
    const count = manual ? manualCount(data?.count, NW_CRON_COUNT) : NW_CRON_COUNT
    const summary = await step.run('needlework-batch', () => runNeedleworkBatch(count))
    logger.info('bulk needlework batch done', { line: summary.line })
    if (manual) await step.run('audit', () => auditManual(data?.triggeredBy, summary))
    return summary
  },
)
