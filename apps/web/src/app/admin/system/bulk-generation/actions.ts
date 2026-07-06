'use server'

import { revalidatePath } from 'next/cache'
import { inngest } from '@/inngest/client'
import { audit } from '@/lib/audit'
import { requireAdminRole } from '@/lib/get-current-user'
import { setAutopilotEnabled } from '@/lib/studio/generation/bulk/autopilot-state'

type ActionResult = { ok: true; queued: number } | { ok: false; error: string }
type ToggleResult = { ok: true; enabled: boolean } | { ok: false; error: string }

const MAX = 20

/**
 * Fire a server-side bulk gem batch for a craft — the "Run a batch" button. The
 * work runs in the Inngest function (bulk-generation.ts): plan → generate →
 * ruthless vision gate → publish gems. Returns as soon as the event is queued;
 * watch progress in the Inngest dashboard (the batch takes minutes).
 */
export async function triggerBulkBatch(craft: 'cross-stitch' | 'needlework', count: number): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })
  const n = Math.max(1, Math.min(MAX, Math.round(Number(count) || 0)))
  const event = craft === 'needlework' ? 'bulk/needlework.batch' : 'bulk/cross-stitch.batch'
  try {
    await inngest.send({ name: event, data: { count: n, triggeredBy: actor.id } })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not reach Inngest.' }
  }
  await audit({
    actorId: actor.id,
    action: 'system.bulk_generation.requested',
    resource: `bulk:${craft}`,
    metadata: { craft, count: n },
  })
  return { ok: true, queued: n }
}

/**
 * Turn a craft's unattended autopilot cron on/off. DB-backed, so it takes effect
 * immediately (no redeploy) and survives deploys.
 */
export async function setBulkAutopilot(craft: 'cross-stitch' | 'needlework', enabled: boolean): Promise<ToggleResult> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })
  try {
    await setAutopilotEnabled(craft, enabled, actor.id)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not update the autopilot switch.' }
  }
  await audit({
    actorId: actor.id,
    action: 'system.bulk_generation.autopilot',
    resource: `bulk:${craft}`,
    metadata: { craft, enabled },
  })
  revalidatePath('/admin/system/bulk-generation')
  return { ok: true, enabled }
}
