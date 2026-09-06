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

/**
 * Total cross-stitch generations allowed in any trailing 24 hours.
 *
 * Sized for twelve two-hourly firings of ten ideas: observed batches run about
 * 3.5 generations per idea (best-of-N plus repairs), so 12 × 10 × 3.5 ≈ 420, and
 * 480 leaves headroom for a bad night without the cap silently truncating a
 * normal day. Roughly £2 a day at full tilt.
 */
export const XS_DAILY_GENERATION_CAP = 480
/**
 * Of those, how many may be the expensive Flux 1.1 Pro dense tier — two per
 * firing, matching the range rule's one dense showpiece per batch plus a repair.
 */
export const XS_DAILY_PRO_CAP = 24

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

// ─────────────────────────── CROCHET ───────────────────────────

/**
 * THE CROCHET SPEND GUARD.
 *
 * Crochet spends differently from cross-stitch, so it gets its own ceiling
 * rather than a share of that one. Every idea costs a FARGATE TASK (a 4-vCPU
 * Blender render, minutes of task time), and the pictorial lane additionally
 * costs one Flux illustration. There is no best-of-N: the geometry is
 * deterministic, so a second roll of the same program is the same image, and
 * the runner takes at most one repair render per idea.
 *
 * Same shape as the cross-stitch cap and the same binary rule: at or over the
 * ceiling, nothing generates. Checked in the dispatcher's preflight and again
 * inside the batch, because the preflight's answer is minutes stale by the time
 * a late idea runs.
 */

/**
 * Crochet RENDERS allowed in any trailing 24 hours.
 *
 * Sized for four six-hourly firings of six ideas, plus a repair render on a
 * couple of them: 4 x 6 = 24, and 40 leaves room for a bad night and a manual
 * batch on top without the cap silently truncating a normal day. A cold Fargate
 * task is seven or eight minutes, so this is roughly five task-hours a day.
 */
export const CROCHET_DAILY_RENDER_CAP = Number(process.env.BULK_CROCHET_RENDER_CAP) || 40

/**
 * Of those, how many may also pay for a Flux illustration — the pictorial
 * tapestry lane, which is the only crochet path that touches the image engine
 * at all. The showpiece end of the range uses the dense Pro tier.
 */
export const CROCHET_DAILY_ILLUSTRATION_CAP = Number(process.env.BULK_CROCHET_ILLUSTRATION_CAP) || 12

/**
 * Approximate cost of one Fargate render task, for the admin spend line only —
 * never for a decision. A 4-vCPU / 8 GB Fargate task for about eight minutes at
 * on-demand rates.
 */
export const CROCHET_RENDER_UNIT_COST = 0.03

/** Sum the crochet counters over the trailing `hours`. */
export async function crochetSpendWindow(hours = 24): Promise<SpendWindow> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  const agg = await prisma.bulkRun.aggregate({
    where: { craft: 'crochet', startedAt: { gte: since } },
    _sum: { generations: true, proGenerations: true },
  })
  return {
    // `generations` counts renders for crochet; `proGenerations` counts the
    // ideas that also paid for an illustration. Same columns, craft-specific
    // meaning, so the BulkRun table stays one shape across the crafts.
    generations: agg._sum.generations ?? 0,
    proGenerations: agg._sum.proGenerations ?? 0,
    since,
  }
}

/** Binary cap verdict for crochet. Null when there is room. */
export function overCrochetCap(window: SpendWindow, opts: { illustration?: boolean } = {}): string | null {
  if (window.generations >= CROCHET_DAILY_RENDER_CAP) {
    return `daily crochet render cap reached (${window.generations}/${CROCHET_DAILY_RENDER_CAP} in the last 24h)`
  }
  if (opts.illustration && window.proGenerations >= CROCHET_DAILY_ILLUSTRATION_CAP) {
    return `daily crochet illustration cap reached (${window.proGenerations}/${CROCHET_DAILY_ILLUSTRATION_CAP} in the last 24h)`
  }
  return null
}

/** Approximate crochet spend for a window (renders plus illustrations). */
export function approxCrochetSpend(window: SpendWindow): number {
  return window.generations * CROCHET_RENDER_UNIT_COST + window.proGenerations * PRO_UNIT_COST
}

/** Approximate spend for a window, in the same units as the unit costs above. */
export function approxSpend(window: SpendWindow): number {
  const schnell = Math.max(0, window.generations - window.proGenerations)
  return schnell * SCHNELL_UNIT_COST + window.proGenerations * PRO_UNIT_COST
}
