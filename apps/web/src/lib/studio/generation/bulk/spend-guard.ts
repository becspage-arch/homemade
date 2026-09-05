import 'server-only'
import { prisma } from '@homemade/db'

/**
 * THE FAL SPEND GUARD — a hard daily ceiling on cross-stitch image generation.
 *
 * The autopilot is meant to run unattended for weeks. Unattended plus a paid
 * per-generation API is exactly the shape of an accident: a planner that starts
 * returning briefs the gate always kills burns four Flux generations per idea,
 * every two hours, for as long as nobody looks. So there is a cap, and like every
 * other automated control here it is BINARY — at or over it, nothing generates.
 *
 * Two ceilings, because the two tiers cost an order of magnitude apart:
 *   · total generations (mostly Flux schnell — fast, cheap);
 *   · Flux 1.1 Pro generations, the 100+ colour dense showpieces.
 *
 * The window is the trailing 24 hours of BulkRun counters, which every idea
 * increments atomically as it finishes. Checked twice: in the dispatcher's
 * preflight (so a cron firing over the cap records a skipped run and stops), and
 * again in the idea worker (events may already be queued from before the cap was
 * hit — the dispatcher's answer is minutes stale by the time an idea runs).
 */

/** Total cross-stitch generations allowed in any trailing 24 hours. */
export const XS_DAILY_GENERATION_CAP = 240
/** Of those, how many may be the expensive Flux 1.1 Pro dense tier. */
export const XS_DAILY_PRO_CAP = 12

/**
 * Approximate unit costs, for the admin spend line only — never for a decision.
 * Fal's published per-image prices at the time of writing; the admin card labels
 * the total "approximate" because these drift and the two tiers are billed
 * differently.
 */
export const SCHNELL_UNIT_COST = 0.003
export const PRO_UNIT_COST = 0.032

export interface SpendWindow {
  /** Total generations recorded in the window. */
  generations: number
  /** Of those, Flux 1.1 Pro. */
  proGenerations: number
  /** Start of the window. */
  since: Date
}

/** Sum the cross-stitch generation counters over the trailing `hours`. */
export async function crossStitchSpendWindow(hours = 24): Promise<SpendWindow> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  const agg = await prisma.bulkRun.aggregate({
    where: { craft: 'cross-stitch', startedAt: { gte: since } },
    _sum: { generations: true, proGenerations: true },
  })
  return {
    generations: agg._sum.generations ?? 0,
    proGenerations: agg._sum.proGenerations ?? 0,
    since,
  }
}

/**
 * Binary cap verdict. Returns null when there is room, or a short human reason
 * when there is not. `pro` says whether the generation about to run would use
 * the expensive tier — a batch is not blocked by the Pro cap unless it is
 * actually about to spend Pro.
 */
export function overCap(window: SpendWindow, opts: { pro?: boolean } = {}): string | null {
  if (window.generations >= XS_DAILY_GENERATION_CAP) {
    return `daily generation cap reached (${window.generations}/${XS_DAILY_GENERATION_CAP} in the last 24h)`
  }
  if (opts.pro && window.proGenerations >= XS_DAILY_PRO_CAP) {
    return `daily Flux Pro cap reached (${window.proGenerations}/${XS_DAILY_PRO_CAP} in the last 24h)`
  }
  return null
}

/** Approximate spend for a window, in the same units as the unit costs above. */
export function approxSpend(window: SpendWindow): number {
  const schnell = Math.max(0, window.generations - window.proGenerations)
  return schnell * SCHNELL_UNIT_COST + window.proGenerations * PRO_UNIT_COST
}
