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
  return { 'cross-stitch': m.get('cross-stitch') ?? false, needlework: m.get('needlework') ?? false }
}
