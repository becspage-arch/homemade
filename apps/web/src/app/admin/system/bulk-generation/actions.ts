'use server'

import { revalidatePath } from 'next/cache'
import { inngest } from '@/inngest/client'
import { audit } from '@/lib/audit'
import { requireAdminRole } from '@/lib/get-current-user'
import {
  setAutopilotEnabled,
  setCrossStitchSourceMode,
  coerceSourceMode,
  type XsSourceMode,
} from '@/lib/studio/generation/bulk/autopilot-state'

type ActionResult = { ok: true; queued: number } | { ok: false; error: string }
type ToggleResult = { ok: true; enabled: boolean } | { ok: false; error: string }
type SourceModeResult = { ok: true; mode: XsSourceMode } | { ok: false; error: string }

const MAX = 20

/** The crafts the bulk page can drive. Mirrors `Craft` in the batch runner. */
export type BulkCraft = 'cross-stitch' | 'needlework' | 'crochet'

const BATCH_EVENT: Record<BulkCraft, string> = {
  'cross-stitch': 'bulk/cross-stitch.batch',
  needlework: 'bulk/needlework.batch',
  crochet: 'bulk/crochet.batch',
}

/**
 * Fire a server-side bulk gem batch for a craft — the "Run a batch" button. The
 * work runs in the Inngest function (bulk-generation.ts): plan → generate →
 * ruthless vision gate → publish gems. Returns as soon as the event is queued;
 * watch progress in the Inngest dashboard (the batch takes minutes).
 */
export async function triggerBulkBatch(craft: BulkCraft, count: number): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })
  const n = Math.max(1, Math.min(MAX, Math.round(Number(count) || 0)))
  const event = BATCH_EVENT[craft]
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
export async function setBulkAutopilot(craft: BulkCraft, enabled: boolean): Promise<ToggleResult> {
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

/**
 * Which image model the cross-stitch pipeline draws with — "Draw with Flux Pro
 * for every size". DB-backed like the autopilot switch, so it takes effect on
 * the next idea without a deploy.
 *
 * It is a spend decision as much as a quality one: Pro is ~£0.032 an image
 * against schnell's ~£0.003, bought because it keeps about two attempts in five
 * where schnell keeps one in fourteen. The daily Pro cap in spend-guard.ts is
 * the backstop underneath it.
 */
export async function setBulkSourceMode(mode: string): Promise<SourceModeResult> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })
  const next = coerceSourceMode(mode)
  try {
    await setCrossStitchSourceMode(next, actor.id)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not update the source model.' }
  }
  await audit({
    actorId: actor.id,
    action: 'system.bulk_generation.source_mode',
    resource: 'bulk:cross-stitch',
    metadata: { mode: next },
  })
  revalidatePath('/admin/system/bulk-generation')
  return { ok: true, mode: next }
}
