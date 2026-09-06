import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { prisma, Visibility } from '@homemade/db'
import { inngest } from '../client'
import {
  runNeedleworkBatch,
  runCrochetBatch,
  crossStitchAttempt,
  crossStitchPlanContext,
  killIsUnrerollable,
  runIsComplete,
  summaryLine,
  tweakFor,
  MAX_XS_ATTEMPTS,
  type Craft,
  type StepRunner,
  type AttemptResult,
} from '@/lib/studio/generation/bulk/run'
import {
  planModelBriefs,
  finaliseBriefs,
  modelAuthoredCount,
  dressedCount,
  remainingShelfSlots,
  rejectedSubjects,
  tallyRejects,
  PLANNER_MODE,
  type PlanChunk,
  MODEL_CHUNK,
  type CrossStitchBrief,
} from '@/lib/studio/generation/bulk/planner'
import { recentCrossStitchSlugs, candidateIsPro, type CandidateTweak } from '@/lib/studio/generation/bulk/cross-stitch'
import { gateConfigured } from '@/lib/studio/generation/vision-gate'
import { isAutopilotEnabled } from '@/lib/studio/generation/bulk/autopilot-state'
import { liveShelfCounts } from '@/lib/studio/generation/bulk/dedupe-guard'
import { allShelvesAtTarget } from '@/lib/studio/generation/bulk/shelf-plan'
import { PATTERN_CATEGORIES, CROSS_STITCH_SHELVES } from '@/lib/studio/generation/categories'
import { crossStitchSpendWindow, overCap, crochetSpendWindow, overCrochetCap } from '@/lib/studio/generation/bulk/spend-guard'
import { fargateRenderWired as crochetRenderWired } from '@/lib/studio/generation/bulk/crochet'
import { liveCrochetShelfCounts } from '@/lib/studio/generation/bulk/crochet-dedupe'
import { CROCHET_LANE_SHELVES } from '@/lib/studio/generation/bulk/crochet-planner'

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

const XS_CRON_COUNT = 10
const NW_CRON_COUNT = 4
/**
 * Crochet's cron batch size. Kept small on purpose: every idea is a cold
 * Fargate render of seven or eight minutes, and they run concurrently, so six
 * is a batch that finishes inside the firing rather than one that overlaps the
 * next. Raise it with a manual run, not with the cron.
 */
const CR_CRON_COUNT = 6
const MAX_MANUAL = 20

/** A run whose counters have not moved for this long is dead, not slow. */
const STALL_HOURS = 6

/**
 * Category ceilings. The cross-stitch number is DERIVED from the per-shelf
 * targets in categories.ts (`patternTarget` is their sum) so the cron, the admin
 * dashboard and the planner's shelf weighting can never disagree about what
 * "full" means. BULK_XS_TARGET stays as an ops override only.
 */
const TARGETS: Record<Craft, number> = {
  'cross-stitch': Number(process.env.BULK_XS_TARGET) || PATTERN_CATEGORIES['cross-stitch']!.patternTarget,
  needlework: Number(process.env.BULK_NW_TARGET) || 1500,
  // Also derived from its per-shelf targets, so the cron's stop point and the
  // planner's shelf weighting read the same number.
  crochet: Number(process.env.BULK_CROCHET_TARGET) || PATTERN_CATEGORIES.crochet!.patternTarget,
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
  if (craft === 'crochet') {
    return prisma.crochetPattern.count({ where: { ownerUserId: null, visibility: Visibility.PUBLIC } })
  }
  return prisma.pattern.count({ where: { type: 'CROSS_STITCH', ownerUserId: null, visibility: Visibility.PUBLIC } })
}

interface PreflightResult {
  skip: string | null
  count?: number
  target?: number
  /** True when the skip is worth a BulkRun row (the admin needs to see it). */
  record?: boolean
}

/**
 * Should this run proceed, and is it a no-op? Cron obeys the per-craft autopilot
 * switch + the category target; a manual run always proceeds. The gate must be
 * wired either way (nothing ships un-judged), and the Fal spend cap binds BOTH —
 * a manual "run a batch" click cannot spend past the daily ceiling either.
 * Runs inside a memoised step so its result is stable across Inngest replays.
 */
async function preflight(craft: Craft, manual: boolean): Promise<PreflightResult> {
  if (!gateConfigured()) return { skip: 'gate-not-wired' }

  if (craft === 'cross-stitch') {
    // Housekeeping first: a run that died mid-fan-out would otherwise sit
    // unfinished forever, and nothing else in the system ever looks at it.
    await sweepStalledRuns().catch((err) => {
      console.error('[bulk cross-stitch] stalled-run sweep failed', err)
    })
    const window = await crossStitchSpendWindow()
    const capped = overCap(window)
    if (capped) return { skip: capped, record: true }
  }

  if (craft === 'crochet') {
    // A crochet hero is the loom's render of the pattern's own program, so
    // without the render there is no pattern to publish — not a poorer one.
    if (!crochetRenderWired()) return { skip: 'render-not-wired' }
    const window = await crochetSpendWindow()
    const capped = overCrochetCap(window)
    if (capped) return { skip: capped, record: true }
  }

  if (!manual) {
    if (!(await isAutopilotEnabled(craft))) return { skip: `autopilot paused for ${craft}` }
    const count = await publicCount(craft)
    if (count >= TARGETS[craft]) return { skip: 'catalogue full', count, target: TARGETS[craft] }
    if (craft === 'cross-stitch') {
      // The category target is the sum of the shelf targets, so the two normally
      // agree — but a HOLD shelf sitting over its target could keep the category
      // number short forever. Idle when every shelf with a lane is done too.
      const counts = await liveShelfCounts().catch(() => ({}) as Record<string, number>)
      if (Object.keys(counts).length && allShelvesAtTarget(CROSS_STITCH_SHELVES, counts)) {
        return { skip: 'every shelf at target', count, target: TARGETS[craft] }
      }
    }
    if (craft === 'crochet') {
      // Crochet's category target counts all fifty-seven shelves, most of which
      // the loom cannot build for yet, so the category number would never be
      // reached and the cron would never idle. It idles when every shelf that
      // HAS a generation lane is full instead.
      const counts = await liveCrochetShelfCounts().catch(() => ({}) as Record<string, number>)
      if (allShelvesAtTarget(CROCHET_LANE_SHELVES, counts)) {
        return { skip: 'every buildable shelf at target', count, target: TARGETS[craft] }
      }
    }
  }
  return { skip: null }
}

// ─────────────────────── run finaliser + alerting ───────────────────────

/**
 * THE RUN FINALISER. Fan-out bought the batch its reliability but cost it an
 * ending: each idea is an independent event, so no single invocation knows the
 * run is over, and until now nothing ever marked one done. Every terminal
 * outcome therefore calls this, and the LAST one to arrive finds the counters
 * complete and closes the row.
 *
 * `finishedAt` is the flag the admin banner, the stalled sweep and any future
 * reporting read; `summary` is the one-line history entry the long-running
 * batch could never write for itself.
 */
async function finaliseIfComplete(runId: string): Promise<{ finished: boolean; alerted: boolean }> {
  const run = await prisma.bulkRun.findUnique({
    where: { id: runId },
    select: {
      id: true, craft: true, requested: true, published: true, culled: true, duplicates: true,
      skipped: true, repaired: true, generations: true, errors: true, finishedAt: true, alerted: true,
      modelBriefs: true, paleSkips: true, propRejects: true, collisionRejects: true,
      dressedBriefs: true,
    },
  })
  if (!run || run.finishedAt) return { finished: false, alerted: false }
  if (!runIsComplete(run)) return { finished: false, alerted: false }

  const summary = summaryLine({ ...run, plannerMode: PLANNER_MODE })
  // A run that produced nothing, or that fell over on half its ideas, is a
  // problem a human needs to hear about — the whole point of an unattended
  // autopilot is that silence means it is working.
  const yieldedNothing = run.published === 0
  const errorStorm = run.requested > 0 && run.errors >= run.requested / 2
  const alert = run.requested > 0 && (yieldedNothing || errorStorm) && !run.alerted

  await prisma.bulkRun.update({
    where: { id: runId },
    data: { finishedAt: new Date(), summary, ...(alert ? { alerted: true } : {}) },
  })
  if (alert) {
    Sentry.captureMessage('bulk cross-stitch run yielded nothing', {
      level: 'warning',
      extra: {
        runId: run.id,
        craft: run.craft,
        requested: run.requested,
        published: run.published,
        culled: run.culled,
        duplicates: run.duplicates,
        skipped: run.skipped,
        errors: run.errors,
        generations: run.generations,
        reason: yieldedNothing ? 'published 0' : 'errors on half or more of the ideas',
        summary,
      },
    })
  }
  return { finished: true, alerted: alert }
}

/**
 * Close out runs that stopped moving. A run whose counters have not changed for
 * STALL_HOURS lost its ideas somewhere (an Inngest event that never landed, a
 * container that went away mid-attempt) and will never complete on its own.
 */
async function sweepStalledRuns(): Promise<number> {
  const cutoff = new Date(Date.now() - STALL_HOURS * 60 * 60 * 1000)
  const stalled = await prisma.bulkRun.findMany({
    where: { craft: 'cross-stitch', finishedAt: null, updatedAt: { lt: cutoff } },
    select: {
      id: true, craft: true, requested: true, published: true, culled: true, duplicates: true,
      skipped: true, repaired: true, generations: true, errors: true, updatedAt: true, modelBriefs: true,
      paleSkips: true, propRejects: true, collisionRejects: true, dressedBriefs: true,
    },
  })
  for (const run of stalled) {
    await prisma.bulkRun.update({
      where: { id: run.id },
      data: { finishedAt: new Date(), summary: `stalled — ${summaryLine({ ...run, plannerMode: PLANNER_MODE })}`, alerted: true },
    })
    Sentry.captureMessage('bulk cross-stitch run yielded nothing', {
      level: 'warning',
      extra: {
        runId: run.id,
        craft: run.craft,
        requested: run.requested,
        published: run.published,
        errors: run.errors,
        reason: `stalled — no progress since ${run.updatedAt.toISOString()}`,
      },
    })
  }
  return stalled.length
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
    /**
     * A dispatcher that dies BEFORE it creates its run row leaves nothing behind
     * — no row to finalise, no row for the stalled sweep to find, nothing on the
     * admin page. Which is precisely the silence an unattended autopilot must
     * never produce. When the retries are spent, record the failure as a run row
     * with requested 0 and raise the same warning every other dead run raises.
     */
    onFailure: async ({ error }) => {
      const reason = `dispatcher failed — ${error instanceof Error ? error.message : String(error)}`.slice(0, 300)
      await prisma.bulkRun
        .create({
          data: {
            craft: 'cross-stitch',
            trigger: 'cron',
            requested: 0,
            skipReason: reason,
            summary: reason,
            finishedAt: new Date(),
            alerted: true,
          },
        })
        .catch((err) => {
          console.error('[bulk cross-stitch] could not record the dispatcher failure', err)
        })
      Sentry.captureMessage('bulk cross-stitch run yielded nothing', {
        level: 'warning',
        extra: { reason, stage: 'dispatcher' },
      })
    },
  },
  async ({ event, step }) => {
    const data = event.data as BatchEventData | undefined
    const manual = typeof data?.count === 'number'

    const pre = await step.run('preflight', () => preflight('cross-stitch', manual))
    if (pre.skip) {
      // A capped run is recorded so the admin panel shows WHY nothing happened —
      // a silent no-op looks identical to a broken autopilot.
      if (pre.record) {
        await step.run('record-skip', () =>
          prisma.bulkRun.create({
            data: {
              craft: 'cross-stitch',
              trigger: manual ? 'manual' : 'cron',
              requested: 0,
              skipReason: pre.skip,
              summary: `skipped — ${pre.skip}`,
              finishedAt: new Date(),
            },
          }),
        )
      }
      return { skipped: pre.skip, ...(pre.count != null ? { count: pre.count, target: pre.target } : {}) }
    }

    const n = manual ? manualCount(data?.count, XS_CRON_COUNT) : XS_CRON_COUNT

    // Plan the briefs. The planner is handed the WHOLE catalogue as an avoid
    // list plus a shelf quota weighted by each shelf's gap to target — not the
    // last 40 names it used to get, which is how five "big japanese garden"
    // charts were commissioned.
    //
    // TWO steps, not one. Each Inngest step is its own HTTP request and the
    // gateway kills a request at ~100s, so the catalogue reads and the Anthropic
    // call must not share a request: together they were enough to 502, and a
    // 502 in a single combined step loses the catalogue read on every retry too.
    const planCtx = (await step.run('plan-context', () => crossStitchPlanContext(n))) ?? {}

    // The model call is split into chunks of MODEL_CHUNK, each its own step. One
    // call for the whole batch ran past the ~100s gateway limit and 504'd, which
    // dropped the run to pool-sampled briefs every time — a quiet failure that
    // reads as a normal batch. Smaller calls fit, and a slow chunk costs only
    // that chunk.
    const chunks: PlanChunk[] = []
    const modelBriefs: CrossStitchBrief[] = []
    for (let taken = 0, chunk = 1; taken < n; taken += MODEL_CHUNK, chunk++) {
      const want = Math.min(MODEL_CHUNK, n - taken)
      const got = await step.run(`plan-briefs-${chunk}`, () => planModelBriefs(want, planCtx, modelBriefs))
      if (got) {
        chunks.push(got)
        modelBriefs.push(...got.briefs)
      }
    }

    // FREE mode only: one retry round for whatever the brief post-filter threw
    // out, asked on the shelves that lost it and naming the rejected subjects,
    // so the second attempt is not a re-roll of the same mistake. In CONSTRAINED
    // mode a rejected slot goes straight to the pool sampler instead — it draws
    // from the same subject list the model was supposed to choose from, and has
    // out-yielded model inventions better than two to one.
    if (modelBriefs.length < n && PLANNER_MODE === 'free') {
      const retryCtx = { ...planCtx, shelfSlots: remainingShelfSlots(planCtx, modelBriefs) }
      const banned = rejectedSubjects(chunks)
      const got = await step.run('plan-briefs-retry', () => planModelBriefs(n - modelBriefs.length, retryCtx, modelBriefs, banned))
      if (got) {
        chunks.push(got)
        modelBriefs.push(...got.briefs)
      }
    }
    const { propRejects, collisionRejects } = tallyRejects(chunks)

    // Top up any shortfall from the curated pool and hold the size range.
    const briefs = await step.run('plan-finalise', () => finaliseBriefs(modelBriefs, n, planCtx))
    if (!briefs.length) return { skipped: 'no briefs planned' }
    const authored = modelAuthoredCount(briefs)
    const dressed = dressedCount(briefs)
    if (authored < briefs.length) {
      console.warn(`[bulk cross-stitch] only ${authored} of ${briefs.length} briefs were model-authored; the rest came from the pool`)
    }

    const triggeredById = manual && typeof data?.triggeredBy === 'string' && data.triggeredBy ? data.triggeredBy : null
    const run = await step.run('create-run', () =>
      prisma.bulkRun.create({
        data: {
          craft: 'cross-stitch',
          trigger: manual ? 'manual' : 'cron',
          requested: briefs.length,
          modelBriefs: authored,
          propRejects,
          collisionRejects,
          dressedBriefs: dressed,
          triggeredById,
        },
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
    return { runId: run.id, dispatched: briefs.length, modelAuthored: authored, propRejects, collisionRejects, dressed, plannerMode: PLANNER_MODE }
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

    const pro = candidateIsPro(brief, tweak ?? {})

    // The spend cap again, here at the point of spending. The dispatcher checked
    // it minutes ago; a queue of ideas fanned out before the cap was hit would
    // otherwise sail straight through it.
    const capped = await step.run('spend-cap', async () => {
      const window = await crossStitchSpendWindow()
      return overCap(window, { pro })
    })
    if (capped) {
      await step.run('record-skipped', () =>
        prisma.bulkRun.update({ where: { id: runId }, data: { skipped: { increment: 1 } } }),
      )
      await step.run('check-complete', () => finaliseIfComplete(runId))
      console.warn(`[bulk cross-stitch] ${brief.slug} skipped — ${capped}`)
      return { outcome: 'skipped', slug: brief.slug, reason: capped }
    }

    // ONE attempt: generate → gate → duplicate guard → publish on keep. The gate
    // sees only this batch's kept subjects; the guard inside the attempt compares
    // the finished candidate against the WHOLE public catalogue.
    let result: AttemptResult
    try {
      result = await step.run('attempt', async () => {
        const kept = await recentCrossStitchSlugs().catch(() => [])
        return crossStitchAttempt(brief, tweak ?? {}, kept, { bulkRunId: runId, attempt })
      })
    } catch (err) {
      await step.run('record-error', () =>
        prisma.bulkRun.update({
          where: { id: runId },
          data: { errors: { increment: 1 }, generations: { increment: 1 }, ...(pro ? { proGenerations: { increment: 1 } } : {}) },
        }),
      )
      await step.run('check-complete', () => finaliseIfComplete(runId))
      console.error(`[bulk cross-stitch] ${brief.slug} attempt ${attempt} failed`, err)
      return { outcome: 'error', slug: brief.slug }
    }

    const proInc = result.pro ?? pro ? { proGenerations: { increment: 1 } } : {}

    if (result.published) {
      await step.run('record-keep', () =>
        prisma.bulkRun.update({
          where: { id: runId },
          data: { published: { increment: 1 }, generations: { increment: 1 }, ...proInc, gemSlugs: { push: brief.slug } },
        }),
      )
      await step.run('check-complete', () => finaliseIfComplete(runId))
      return { outcome: 'published', slug: brief.slug }
    }

    // TERMINAL: the gate kept it, the duplicate guard did not. Nothing was
    // written and the idea is NOT re-rolled — the idea itself is the duplicate,
    // so another roll of it collides all over again.
    if (result.duplicateOf) {
      const reason = `duplicate of ${result.duplicateOf}`.slice(0, 80)
      await step.run('record-duplicate', () =>
        prisma.bulkRun.update({
          where: { id: runId },
          data: { duplicates: { increment: 1 }, generations: { increment: 1 }, ...proInc, killReasons: { push: reason } },
        }),
      )
      await step.run('check-complete', () => finaliseIfComplete(runId))
      console.warn(`[bulk cross-stitch] ${brief.slug} refused — ${result.duplicateReason}`)
      return { outcome: 'duplicate', slug: brief.slug, duplicateOf: result.duplicateOf }
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
          data: {
            generations: { increment: 1 },
            ...proInc,
            ...(result.verdict === 'repair' ? { repaired: { increment: 1 } } : {}),
            ...(result.tooPale ? { paleSkips: { increment: 1 } } : {}),
          },
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
        data: { culled: { increment: 1 }, generations: { increment: 1 }, ...proInc, killReasons: { push: reason } },
      }),
    )
    await step.run('check-complete', () => finaliseIfComplete(runId))
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
          duplicates: summary.duplicates,
          skipped: summary.skipped,
          repaired: summary.repaired,
          generations: summary.generations,
          proGenerations: summary.proGenerations,
          errors: summary.errors,
          gemSlugs: summary.gems,
          killReasons: summary.killReasons,
          triggeredById,
          // Needlework still runs as ONE function, so its row is complete the
          // moment it is written — no finaliser needed.
          finishedAt: new Date(),
          summary: summary.line,
        },
      }),
    )
    return summary
  },
)

// ─────────────────────────── CROCHET (single run) ───────────────────────────

/**
 * Bulk: crochet gem batch.
 *
 * The needlework shape, deliberately: one function per batch rather than the
 * cross-stitch fan-out, because a crochet idea is one slow Fargate render and
 * there is no best-of-N to fan out (the geometry is deterministic, so a second
 * roll of the same program is the same picture). The batch runs each idea in
 * its own `step.run`, so no single request is long, and records to the same
 * BulkRun table the other two crafts use.
 *
 * Six-hourly, and it obeys the same three gates as every other craft: the
 * autopilot switch, the daily spend cap, and the category target. Cron firings
 * do nothing at all until an admin turns the switch on.
 *
 * ── DO NOT TURN THE SWITCH ON YET ─────────────────────────────────────────
 * The loom's Fargate render is a BLOCKING call: `fargateRenderBase` starts the
 * ECS task and polls it to completion, so one hero is a seven- or eight-minute
 * synchronous await. Inside a `step.run` that is a seven-minute HTTP request,
 * and the gateway kills a request at about 100 seconds — the same wall the
 * cross-stitch autopilot was fanned out to escape, and the reason needlework
 * next door is paused. Until the render is split (dispatch the task in one
 * step, sleep, poll in a later one) this function is correct but will time out
 * on the first idea, and the supported way to run a crochet batch is
 * `scripts/bulk-crochet-batch.ts` from a worker box.
 */
export const bulkCrochetBatch = inngest.createFunction(
  {
    id: 'bulk-crochet-batch',
    name: 'Bulk: crochet gem batch',
    concurrency: { limit: 1 },
    retries: 1,
    // Every idea renders on Fargate, so crochet keeps needlework's gentler
    // cadence rather than cross-stitch's two-hourly one.
    triggers: [{ cron: '0 */6 * * *' }, { event: 'bulk/crochet.batch' }],
  },
  async ({ event, step }) => {
    const data = event.data as BatchEventData | undefined
    const manual = typeof data?.count === 'number'

    const pre = await step.run('preflight', () => preflight('crochet', manual))
    if (pre.skip) {
      if (pre.record) {
        await step.run('record-skip', () =>
          prisma.bulkRun.create({
            data: {
              craft: 'crochet',
              trigger: manual ? 'manual' : 'cron',
              requested: 0,
              skipReason: pre.skip,
              summary: `skipped — ${pre.skip}`,
              finishedAt: new Date(),
            },
          }),
        )
      }
      return { skipped: pre.skip, ...(pre.count != null ? { count: pre.count, target: pre.target } : {}) }
    }

    const n = manual ? manualCount(data?.count, CR_CRON_COUNT) : CR_CRON_COUNT
    const summary = await runCrochetBatch(n, stepRunner(step))

    const triggeredById = manual && typeof data?.triggeredBy === 'string' && data.triggeredBy ? data.triggeredBy : null
    await step.run('record-run', () =>
      prisma.bulkRun.create({
        data: {
          craft: 'crochet',
          trigger: manual ? 'manual' : 'cron',
          requested: summary.requested,
          published: summary.published,
          culled: summary.culled,
          duplicates: summary.duplicates,
          skipped: summary.skipped,
          repaired: summary.repaired,
          // For crochet these two columns count RENDERS and, of those, the ideas
          // that also paid for an illustration — the two things the spend guard
          // caps. Same columns, craft-specific meaning.
          generations: summary.generations,
          proGenerations: summary.proGenerations,
          modelBriefs: summary.dressedBriefs ?? 0,
          errors: summary.errors,
          gemSlugs: summary.gems,
          killReasons: summary.killReasons,
          triggeredById,
          // One function, so the row is complete the moment it is written.
          finishedAt: new Date(),
          summary: summary.line,
        },
      }),
    )
    return summary
  },
)
