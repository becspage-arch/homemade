'use server'

import { revalidatePath } from 'next/cache'
import { inngest } from '@/inngest/client'
import { audit } from '@/lib/audit'
import { requireAdminRole } from '@/lib/get-current-user'
import {
  setAutopilotEnabled,
  setCrossStitchSourceMode,
  coerceSourceMode,
  setCrossStitchGateMode,
  coerceGateMode,
  setMakerPhotoGateMode,
  coercePhotoGateMode,
  type XsSourceMode,
  type XsGateMode,
  type PhotoGateMode,
} from '@/lib/studio/generation/bulk/autopilot-state'

type ActionResult = { ok: true; queued: number } | { ok: false; error: string }
type ToggleResult = { ok: true; enabled: boolean } | { ok: false; error: string }
type SourceModeResult = { ok: true; mode: XsSourceMode } | { ok: false; error: string }
type GateModeResult = { ok: true; mode: XsGateMode } | { ok: false; error: string }
type PhotoGateModeResult = { ok: true; mode: PhotoGateMode } | { ok: false; error: string }

const MAX = 20

/** The crafts the bulk page can drive. Mirrors `Craft` in the batch runner. */
export type BulkCraft = 'cross-stitch' | 'needlework' | 'crochet'

/**
 * The crafts that still have a server-side batch to fire. Crochet is absent on
 * purpose: its planning, authoring and judging are a Claude session's work on
 * Rebecca's Max plan, so there is no Inngest job to trigger — the routine in
 * `docs/autopilot-prompts/crochet.md` drives it instead.
 */
const BATCH_EVENT: Partial<Record<BulkCraft, string>> = {
  'cross-stitch': 'bulk/cross-stitch.batch',
  needlework: 'bulk/needlework.batch',
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
  if (!event) {
    return {
      ok: false,
      error: 'Crochet is filled by a Claude routine, not from here — see docs/autopilot-prompts/crochet.md.',
    }
  }
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
 * Turn a craft's unattended autopilot on/off. DB-backed, so it takes effect
 * immediately (no redeploy) and survives deploys.
 *
 * Cross-stitch and needlework read it in their Inngest cron's preflight. Crochet
 * has no cron — its routine reads the same row at pre-flight and exits clean
 * when it is off, so one switch means the same thing across the three crafts.
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

/**
 * WHO JUDGES the cross-stitch candidates — "Judged in Claude sessions (no API)"
 * against "Judged by the API gate".
 *
 * In 'candidates' mode the whole cron path makes no call through
 * `anthropic.ts` at all: the planner samples the pool, the vision gate is never
 * reached, and every idea is parked as an UNLISTED candidate for a Claude Code
 * session on the Max plan to judge with `apps/web/scripts/xs-candidates.ts`.
 * DB-backed like the other switches, so it applies to the next firing with no
 * deploy; `BULK_XS_GATE_MODE` pins it for ops.
 */
export async function setBulkGateMode(mode: string): Promise<GateModeResult> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })
  const next = coerceGateMode(mode)
  try {
    await setCrossStitchGateMode(next, actor.id)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not update the gate mode.' }
  }
  await audit({
    actorId: actor.id,
    action: 'system.bulk_generation.gate_mode',
    resource: 'bulk:cross-stitch',
    metadata: { mode: next },
  })
  revalidatePath('/admin/system/bulk-generation')
  return { ok: true, mode: next }
}

/**
 * WHO JUDGES a member's finished-project photo. 'api' (the default) decides on
 * upload so the member sees an answer straight away; 'routine' leaves the photo
 * pending for the scheduled session to judge.
 */
export async function setPhotoGateMode(mode: string): Promise<PhotoGateModeResult> {
  const actor = await requireAdminRole({ minimum: 'ADMIN' })
  const next = coercePhotoGateMode(mode)
  try {
    await setMakerPhotoGateMode(next, actor.id)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not update the photo gate mode.' }
  }
  await audit({
    actorId: actor.id,
    action: 'system.bulk_generation.photo_gate_mode',
    resource: 'maker-photos',
    metadata: { mode: next },
  })
  revalidatePath('/admin/system/bulk-generation')
  return { ok: true, mode: next }
}
