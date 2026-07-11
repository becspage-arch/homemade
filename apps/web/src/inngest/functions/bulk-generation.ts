import 'server-only'
import { prisma, Visibility } from '@homemade/db'
import { inngest } from '../client'
import {
  runNeedleworkBatch,
  crossStitchAttempt,
  killIsUnrerollable,
  tweakFor,
  MAX_XS_ATTEMPTS,
  type Craft,
  type StepRunner,
  type AttemptResult,
} from '@/lib/studio/generation/bulk/run'
import { planCrossStitchBriefs, type CrossStitchBrief } from '@/lib/studio/generation/bulk/planner'
import { recentCrossStitchSlugs, type CandidateTweak } from '@/lib/studio/generation/bulk/cross-stitch'
import { gateConfigured } from '@/lib/studio/generation/vision-gate'
import { isAutopilotEnabled } from '@/lib/studio/generation/bulk/autopilot-state'

/**
 * Server-side BULK CATALOGUE generation — the cross-stitch + needlework gem
 * routine, moved OFF Rebecca's PC into admin-triggered / cron Inngest jobs.
 *
 * ── ARCHITECTURE: fan-out, one event per idea ──────────────────────────────
 * A batch used to run every idea's generate→gate→publish loop inside ONE Inngest
 * function run, i.e. one long synchronous HTTP request — which the gateway killed
 * with a 504 at ~200s after only a gem or two, the real cause of the low, patchy
 * yield. Inngest runs sequential `step.run`s within a single request, so splitting
 * into steps did NOT bound the request; the fix is to fan OUT.
 *
 * Cross-stitch now works in two functions:
 *   - the DISPATCHER (`bulk/cross-stitch.batch`, cron + manual): preflight →
 *     plan N briefs → create a BulkRun row → emit one `bulk/cross-stitch.idea`
 *     event per brief. Fast (planning only), well under any timeout.
 *   - the IDEA worker (`bulk/cross-stitch.idea`): does ONE generate→gate→publish
 *     ATTEMPT per invocation (≈ one image gen, short request). Best-of-N is fanned
 *     out too: a 'repair' or a re-rollable 'kill' re-emits the same idea for the
 *     next attempt (up to MAX_XS_ATTEMPTS); a kill a re-roll can't fix, or the cap,
 *     culls. Each invocation updates the BulkRun row with ATOMIC increments, so the
 *     admin panel sees live per-run outcomes. Every published gem still passes the
 *     identical ruthless gate — more shots per idea, never a lower bar.
 *
 * Needlework still runs as a single function (it's paused, renders one slow
 * Fargate hero per idea, and re-rolls are expensive) but records to the same
 * BulkRun table. [Follow-up: fan needlework out the same way when it's signed off.]
 *
 * Nothing ships un-judged: if the gate isn't wired (ANTHROPIC_API_KEY unset) the
 * dispatcher is a clean no-op — it plans + generates nothing rather than publish blind.
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

interface PreflightResult {
  skip: string | null
  count?: number
  target?: number
}

/**
 * Should this run proceed, and is it a no-op? Cron obeys the per-craft autopilot
 * switch + the category target; a manual run always proceeds. The gate must be
 * wired either way (nothing ships un-judged). Runs inside a memoised step so its
 * result is stable across Inngest replays.
 */
async function preflight(craft: Craft, manual: boolean): Promise<PreflightResult> {
  if (!gateConfigured()) return { skip: 'gate-not-wired' }
  if (!manual) {
    if (!(await isAutopilotEnabled(craft))) return { skip: `autopilot paused for ${craft}` }
    const count = await publicCount(craft)
    if (count >= TARGETS[craft]) return { skip: 'catalogue full', count, target: TARGETS[craft] }
  }
  return { skip: null }
}

/** Adapt Inngest's `step` to the small runner interface run.ts expects. */
function stepRunner(step: {
  run: (id: string, fn: () => Promise<unknown>) => Promise<unknown>
}): StepRunner {
  return { run: <T>(id: string, fn: () => Promise<T>) => step.run(id, fn) as Promise<T> }
}

// ─────────────────────────── CROSS-STITCH (fan-out) ───────────────────────────

export const bulkCrossStitchBatch = inngest.createFunction(
  {
    id: 'bulk-cross-stitch-batch',
    name: 'Bulk: cross-stitch dispatcher',
    concurrency: { limit: 1 },
    retries: 1,
    triggers: [{ cron: '0 */2 * * *' }, { event: 'bulk/cross-stitch.batch' }],
  },
  async ({ event, step }) => {
    const data = event.data as BatchEventData | undefined
    const manual = typeof data?.count === 'number'

    const pre = await step.run('preflight', () => preflight('cross-stitch', manual))
    if (pre.skip) return { skipped: pre.skip, ...(pre.count != null ? { count: pre.count, target: pre.target } : {}) }

    const n = manual ? manualCount(data?.count, XS_CRON_COUNT) : XS_CRON_COUNT

    // Plan the briefs (one cheap Anthropic call), then create the run row.
    const briefs = await step.run('plan', async () => {
      const recent = await recentCrossStitchSlugs().catch(() => [])
      return planCrossStitchBriefs(n, recent)
    })
    if (!briefs.length) return { skipped: 'no briefs planned' }

    const triggeredById = manual && typeof data?.triggeredBy === 'string' && data.triggeredBy ? data.triggeredBy : null
    const run = await step.run('create-run', () =>
      prisma.bulkRun.create({
        data: { craft: 'cross-stitch', trigger: manual ? 'manual' : 'cron', requested: briefs.length, triggeredById },
        select: { id: true },
      }),
    )

    // Fan out: one idea event per brief. Each runs as its own short invocation.
    await step.sendEvent(
      'dispatch-ideas',
      briefs.map((brief) => ({
        name: 'bulk/cross-stitch.idea',
        data: { runId: run.id, brief, attempt: 1, tweak: {} as CandidateTweak },
      })),
    )
    return { runId: run.id, dispatched: briefs.length }
  },
)

interface IdeaEventData {
  runId?: string
  brief?: CrossStitchBrief
  attempt?: number
  tweak?: CandidateTweak
}

export const bulkCrossStitchIdea = inngest.createFunction(
  {
    id: 'bulk-cross-stitch-idea',
    name: 'Bulk: cross-stitch idea (one attempt)',
    // ONE generation at a time. The web container is memory-tight (512 MB shared
    // with live traffic); a cross-stitch generation (Flux buffer + quantise +
    // full-size SVG rasterise) is memory-heavy, and running several at once OOM-
    // kills the container — which 502s every in-flight idea AND the live site.
    // Serial keeps peak memory to one generation; each idea is still its own short
    // request, so the batch completes across many small invocations.
    concurrency: { limit: 1 },
    retries: 1,
    triggers: [{ event: 'bulk/cross-stitch.idea' }],
  },
  async ({ event, step }) => {
    const { runId, brief, attempt = 1, tweak } = (event.data ?? {}) as IdeaEventData
    if (!runId || !brief) return { skipped: 'missing runId/brief' }

    // ONE attempt: generate → gate → publish on keep. The near-duplicate check
    // runs against the recent live catalogue (ideas are independent now).
    let result: AttemptResult
    try {
      result = await step.run('attempt', async () => {
        const kept = await recentCrossStitchSlugs().catch(() => [])
        return crossStitchAttempt(brief, tweak ?? {}, kept)
      })
    } catch (err) {
      await step.run('record-error', () =>
        prisma.bulkRun.update({ where: { id: runId }, data: { errors: { increment: 1 }, generations: { increment: 1 } } }),
      )
      console.error(`[bulk cross-stitch] ${brief.slug} attempt ${attempt} failed`, err)
      return { outcome: 'error', slug: brief.slug }
    }

    if (result.published) {
      await step.run('record-keep', () =>
        prisma.bulkRun.update({
          where: { id: runId },
          data: { published: { increment: 1 }, generations: { increment: 1 }, gemSlugs: { push: brief.slug } },
        }),
      )
      return { outcome: 'published', slug: brief.slug }
    }

    // Best-of-N: re-roll a 'repair' or a re-rollable 'kill' as a fresh event, up
    // to the cap. Kills a re-roll can't fix (text/IP/near-dup) skip straight to cull.
    const canReroll =
      attempt < MAX_XS_ATTEMPTS &&
      (result.verdict === 'repair' || (result.verdict === 'kill' && !killIsUnrerollable(result.reasons)))
    if (canReroll) {
      const nextTweak: CandidateTweak = result.verdict === 'repair' ? tweakFor(result.repairAction) : {}
      await step.run('record-reroll', () =>
        prisma.bulkRun.update({
          where: { id: runId },
          data: { generations: { increment: 1 }, ...(result.verdict === 'repair' ? { repaired: { increment: 1 } } : {}) },
        }),
      )
      await step.sendEvent('next-attempt', {
        name: 'bulk/cross-stitch.idea',
        data: { runId, brief, attempt: attempt + 1, tweak: nextTweak },
      })
      return { outcome: 'reroll', slug: brief.slug, attempt: attempt + 1 }
    }

    // Terminal cull: cap reached, or a kill a re-roll can't save.
    const reason = (result.reasons[0] ?? 'kill').slice(0, 80)
    await step.run('record-cull', () =>
      prisma.bulkRun.update({
        where: { id: runId },
        data: { culled: { increment: 1 }, generations: { increment: 1 }, killReasons: { push: reason } },
      }),
    )
    return { outcome: 'culled', slug: brief.slug }
  },
)

// ─────────────────────────── NEEDLEWORK (single run) ───────────────────────────

export const bulkNeedleworkBatch = inngest.createFunction(
  {
    id: 'bulk-needlework-batch',
    name: 'Bulk: needlework gem batch',
    concurrency: { limit: 1 },
    retries: 1,
    // Needlework renders on Fargate (heavier + slower) — a gentler cadence.
    triggers: [{ cron: '0 */6 * * *' }, { event: 'bulk/needlework.batch' }],
  },
  async ({ event, step }) => {
    const data = event.data as BatchEventData | undefined
    const manual = typeof data?.count === 'number'

    const pre = await step.run('preflight', () => preflight('needlework', manual))
    if (pre.skip) return { skipped: pre.skip, ...(pre.count != null ? { count: pre.count, target: pre.target } : {}) }

    const n = manual ? manualCount(data?.count, NW_CRON_COUNT) : NW_CRON_COUNT
    const summary = await runNeedleworkBatch(n, stepRunner(step))

    const triggeredById = manual && typeof data?.triggeredBy === 'string' && data.triggeredBy ? data.triggeredBy : null
    await step.run('record-run', () =>
      prisma.bulkRun.create({
        data: {
          craft: 'needlework',
          trigger: manual ? 'manual' : 'cron',
          requested: summary.requested,
          published: summary.published,
          culled: summary.culled,
          repaired: summary.repaired,
          generations: summary.generations,
          errors: summary.errors,
          gemSlugs: summary.gems,
          killReasons: summary.killReasons,
          triggeredById,
        },
      }),
    )
    return summary
  },
)
