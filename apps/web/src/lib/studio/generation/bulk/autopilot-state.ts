import 'server-only'
import { prisma } from '@homemade/db'
import type { Craft } from './run'

/**
 * DB-backed autopilot switch per craft. The bulk cron reads this to decide
 * whether to auto-fill; the admin bulk page toggles it. DB (not env) so it
 * survives deploys and an admin can flip it without a redeploy.
 */

export async function isAutopilotEnabled(craft: Craft): Promise<boolean> {
  const row = await prisma.bulkAutopilotState.findUnique({ where: { craft }, select: { enabled: true } })
  return row?.enabled ?? false
}

export async function setAutopilotEnabled(craft: Craft, enabled: boolean, userId?: string): Promise<void> {
  await prisma.bulkAutopilotState.upsert({
    where: { craft },
    create: { craft, enabled, updatedById: userId ?? null },
    update: { enabled, updatedById: userId ?? null },
  })
}

/**
 * ── THE SOURCE MODE ────────────────────────────────────────────────────────
 *
 * Which image model the cross-stitch pipeline draws with, and the single biggest
 * lever on yield. Measured over the September 2026 firings: Flux schnell keeps
 * about one attempt in fourteen, Flux 1.1 Pro about two in five. Pro costs
 * roughly ten times as much per image (~£0.032 against ~£0.003) — which comes out
 * at a similar cost PER GEM, and a batch that finishes instead of culling ten
 * ideas for nothing.
 *
 * 'schnell'  — today's behaviour: schnell everywhere except the dense lane.
 * 'pro-all'  — Flux 1.1 Pro in every lane. The dense lane is unchanged (it was
 *              already Pro, with the showpiece style); the other lanes keep
 *              their own style prompt, so a small cute piece still reads flat
 *              and bold rather than turning into a tiny showpiece.
 */
export const XS_SOURCE_MODES = ['schnell', 'pro-all'] as const
export type XsSourceMode = (typeof XS_SOURCE_MODES)[number]

/** What the pipeline does when nothing has said otherwise. */
export const DEFAULT_XS_SOURCE_MODE: XsSourceMode = 'schnell'

/** Coerce anything (env string, DB column, admin form field) to a real mode. */
export function coerceSourceMode(raw: unknown): XsSourceMode {
  return XS_SOURCE_MODES.includes(raw as XsSourceMode) ? (raw as XsSourceMode) : DEFAULT_XS_SOURCE_MODE
}

/**
 * The mode in force. The env var wins when it is set — an ops override that
 * cannot be flipped away by accident from the admin page — otherwise the DB
 * column, which is what the admin toggle writes.
 */
export async function crossStitchSourceMode(): Promise<XsSourceMode> {
  const env = process.env.BULK_XS_SOURCE_MODE
  if (env && XS_SOURCE_MODES.includes(env as XsSourceMode)) return env as XsSourceMode
  const row = await prisma.bulkAutopilotState
    .findUnique({ where: { craft: 'cross-stitch' }, select: { sourceMode: true } })
    .catch(() => null)
  return coerceSourceMode(row?.sourceMode)
}

/** Set the cross-stitch source mode (the admin toggle). */
export async function setCrossStitchSourceMode(mode: XsSourceMode, userId?: string): Promise<void> {
  await prisma.bulkAutopilotState.upsert({
    where: { craft: 'cross-stitch' },
    create: { craft: 'cross-stitch', enabled: false, sourceMode: mode, updatedById: userId ?? null },
    update: { sourceMode: mode, updatedById: userId ?? null },
  })
}

export async function autopilotStates(): Promise<Record<Craft, boolean>> {
  const rows = await prisma.bulkAutopilotState.findMany({ select: { craft: true, enabled: true } })
  const m = new Map(rows.map((r) => [r.craft, r.enabled]))
  return {
    'cross-stitch': m.get('cross-stitch') ?? false,
    needlework: m.get('needlework') ?? false,
    crochet: m.get('crochet') ?? false,
  }
}

/**
 * ── THE GATE MODE ──────────────────────────────────────────────────────────
 *
 * WHO JUDGES a cross-stitch candidate, and therefore whether the cron path
 * spends anything on a paid model at all.
 *
 * 'candidates' — the default from 6 September 2026. Nothing on the cron path
 *   makes a single call through `anthropic.ts`: the planner runs the pool
 *   sampler only, `gateConfigured()` is not required, and `visionGate` is never
 *   called. Each idea gets one generation, is checked by the two deterministic
 *   guards (bare fabric, pale) and the duplicate guard, and is then PARKED as an
 *   UNLISTED `Pattern` row with `candidateStatus 'PENDING'`. A Claude Code
 *   session on Rebecca's Max plan looks at the contact sheets and decides, with
 *   `apps/web/scripts/xs-candidates.ts`. Per-firing cost is Fal only.
 * 'api'        — the earlier behaviour, kept working for a deliberate switch
 *   back: a per-candidate Anthropic vision gate judges every render and
 *   publishes the gems itself.
 *
 * Nothing ships un-judged either way. In candidates mode the judgement simply
 * happens later, by a person or a session, and until it does the row is UNLISTED
 * and reaches no public surface and no public count.
 */
export const XS_GATE_MODES = ['candidates', 'api'] as const
export type XsGateMode = (typeof XS_GATE_MODES)[number]

/** What the pipeline does when nothing has said otherwise. */
export const DEFAULT_XS_GATE_MODE: XsGateMode = 'candidates'

/** Coerce anything (env string, DB column, admin form field) to a real mode. */
export function coerceGateMode(raw: unknown): XsGateMode {
  return XS_GATE_MODES.includes(raw as XsGateMode) ? (raw as XsGateMode) : DEFAULT_XS_GATE_MODE
}

/**
 * The gate mode in force. The env var wins when it is set — an ops override that
 * cannot be flipped away by accident from the admin page — otherwise the DB
 * column, which is what the admin toggle writes.
 *
 * Falls back to the DEFAULT on any DB error rather than throwing: the safe
 * answer to "can I reach the switch" is the mode that spends nothing.
 */
export async function crossStitchGateMode(): Promise<XsGateMode> {
  const env = process.env.BULK_XS_GATE_MODE
  if (env && XS_GATE_MODES.includes(env as XsGateMode)) return env as XsGateMode
  const row = await prisma.bulkAutopilotState
    .findUnique({ where: { craft: 'cross-stitch' }, select: { gateMode: true } })
    .catch(() => null)
  return coerceGateMode(row?.gateMode)
}

/** Set the cross-stitch gate mode (the admin toggle). */
export async function setCrossStitchGateMode(mode: XsGateMode, userId?: string): Promise<void> {
  await prisma.bulkAutopilotState.upsert({
    where: { craft: 'cross-stitch' },
    create: { craft: 'cross-stitch', enabled: false, gateMode: mode, updatedById: userId ?? null },
    update: { gateMode: mode, updatedById: userId ?? null },
  })
}

/**
 * ── THE MAKER-PHOTO GATE MODE ──────────────────────────────────────────────
 *
 * WHO JUDGES a member's finished-project photo when they upload it.
 *
 * 'api'     — the default (Rebecca's call, 6 September 2026): the photo gate
 *   runs on upload, so the member sees a decision straight away rather than
 *   waiting hours for a scheduled session. This is the one place a per-token
 *   call is worth it, because a person is standing there.
 * 'routine' — the upload stays PENDING behind "Checking your photo" and the
 *   cross-stitch routine's photo step judges the queue with
 *   `apps/web/scripts/maker-photos-judge.ts`. Zero API spend, hours of latency.
 *
 * Kept on the `BulkAutopilotState` row with craft 'maker-photos' — the same
 * DB-backed, no-redeploy switch shape as the autopilot and the source mode.
 */
export const PHOTO_GATE_MODES = ['api', 'routine'] as const
export type PhotoGateMode = (typeof PHOTO_GATE_MODES)[number]

/** A member waiting for a decision beats a saved fraction of a penny. */
export const DEFAULT_PHOTO_GATE_MODE: PhotoGateMode = 'api'

/** The `BulkAutopilotState` key the photo switch lives under. */
export const PHOTO_GATE_STATE_KEY = 'maker-photos'

export function coercePhotoGateMode(raw: unknown): PhotoGateMode {
  return PHOTO_GATE_MODES.includes(raw as PhotoGateMode) ? (raw as PhotoGateMode) : DEFAULT_PHOTO_GATE_MODE
}

/** The photo gate mode in force. `MAKER_PHOTO_GATE_MODE` wins when set. */
export async function makerPhotoGateMode(): Promise<PhotoGateMode> {
  const env = process.env.MAKER_PHOTO_GATE_MODE
  if (env && PHOTO_GATE_MODES.includes(env as PhotoGateMode)) return env as PhotoGateMode
  const row = await prisma.bulkAutopilotState
    .findUnique({ where: { craft: PHOTO_GATE_STATE_KEY }, select: { photoGateMode: true } })
    .catch(() => null)
  return coercePhotoGateMode(row?.photoGateMode)
}

/** Set the maker-photo gate mode (the admin toggle). */
export async function setMakerPhotoGateMode(mode: PhotoGateMode, userId?: string): Promise<void> {
  await prisma.bulkAutopilotState.upsert({
    where: { craft: PHOTO_GATE_STATE_KEY },
    create: { craft: PHOTO_GATE_STATE_KEY, enabled: false, photoGateMode: mode, updatedById: userId ?? null },
    update: { photoGateMode: mode, updatedById: userId ?? null },
  })
}
