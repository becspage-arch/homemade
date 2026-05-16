'use server'

import { inngest } from '@/inngest/client'
import { audit } from '@/lib/audit'
import { requireAdminRole } from '@/lib/get-current-user'

type ActionResult = { ok: true } | { ok: false; error: string }

export async function triggerTypesenseReindex(): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })
  try {
    await inngest.send({
      name: 'tutorials/reindex.requested',
      data: { triggeredBy: actor.id },
    })
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not reach Inngest.',
    }
  }
  await audit({
    actorId: actor.id,
    action: 'system.typesense_reindex_requested',
    resource: 'Inngest:typesense-reindex',
  })
  return { ok: true }
}

/**
 * Manually re-run the analytics daily + cohort rollup for a date range.
 * Useful after a cron failure or a schema change that needs a backfill.
 *
 * `force: true` re-processes dates that are already marked complete —
 * leave false to skip done days.
 */
export async function triggerAnalyticsRollup(args: {
  from: string
  to: string
  force?: boolean
}): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })
  const fromDate = new Date(args.from)
  const toDate = new Date(args.to)
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return { ok: false, error: 'Invalid date range.' }
  }
  if (fromDate.getTime() > toDate.getTime()) {
    return { ok: false, error: '"From" must be before "To".' }
  }
  try {
    await inngest.send({
      name: 'analytics/rollup.backfill',
      data: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        force: Boolean(args.force),
        triggeredBy: actor.id,
      },
    })
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not reach Inngest.',
    }
  }
  await audit({
    actorId: actor.id,
    action: 'system.analytics_rollup_requested',
    resource: 'Inngest:analytics-rollup-backfill',
    metadata: { from: args.from, to: args.to, force: Boolean(args.force) },
  })
  return { ok: true }
}
