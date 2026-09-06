import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { prisma, Prisma, Visibility } from '@homemade/db'
import { inngest } from '../client'
import { waitForRender } from '../loom-render-wait'
import {
  crossStitchAttempt,
  crossStitchPlanContext,
  crochetPlanContext,
  crochetGateAndPublish,
  needleworkGateAndPublish,
  killIsUnrerollable,
  crossStitchCandidateAttempt,
  planCrossStitchCandidateBriefs,
  MAX_XS_CANDIDATE_ATTEMPTS,
  runIsComplete,
  summaryLine,
  tweakFor,
  MAX_XS_ATTEMPTS,
  MAX_CROCHET_REPAIRS,
  MAX_NW_REPAIRS,
  type Craft,
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
  planNeedleworkBriefs,
  PLANNER_MODE,
  type PlanChunk,
  MODEL_CHUNK,
  type CrossStitchBrief,
  type NeedleworkBrief,
} from '@/lib/studio/generation/bulk/planner'
import {
  recentCrossStitchSlugs,
  candidateIsPro,
  recordRejectSample,
  type CandidateTweak,
} from '@/lib/studio/generation/bulk/cross-stitch'
import { gateConfigured } from '@/lib/studio/generation/vision-gate'
import { isAutopilotEnabled, crossStitchSourceMode, crossStitchGateMode, type XsGateMode } from '@/lib/studio/generation/bulk/autopilot-state'
import {
  takeRerollRequests,
  sweepUnjudgedCandidates,
  candidateStats,
  candidateWarnings,
} from '@/lib/studio/generation/bulk/candidates'
import { liveShelfCounts } from '@/lib/studio/generation/bulk/dedupe-guard'
import { allShelvesAtTarget } from '@/lib/studio/generation/bulk/shelf-plan'
import { PATTERN_CATEGORIES, CROSS_STITCH_SHELVES } from '@/lib/studio/generation/categories'
import { crossStitchSpendWindow, overCap, crochetSpendWindow, overCrochetCap } from '@/lib/studio/generation/bulk/spend-guard'
import {
  fargateRenderWired as crochetRenderWired,
  startCrochetCandidate,
  pollCrochetCandidate,
  renderCrochetCandidate,
  loadCrochetCandidate,
  paletteHexesFor,
} from '@/lib/studio/generation/bulk/crochet'
import {
  startNeedleworkCandidate,
  pollNeedleworkCandidate,
  renderNeedleworkCandidate,
  loadNeedleworkCandidate,
  recentNeedleworkSlugs,
} from '@/lib/studio/generation/bulk/needlework'
import { liveCrochetShelfCounts, recentCrochetNames } from '@/lib/studio/generation/bulk/crochet-dedupe'
import {
  CROCHET_LANE_SHELVES,
  planCrochetBriefs,
  modelAuthoredCount as crochetModelAuthoredCount,
  type CrochetBrief,
} from '@/lib/studio/generation/bulk/crochet-planner'

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
 * Needlework and crochet take the same shape, with one difference that used to
 * make it impossible: their ideas each render a photoreal hero on Fargate, seven
 * to nine minutes of Blender. Their idea workers do NOT wait for it — they start
 * the ECS task, `step.sleep` a minute at a time while the run is suspended, poll
 * once a minute with a single AWS call, and come back for the picture in a later
 * step. See `src/inngest/loom-render-wait.ts` and STITCH_ENGINE.md §8g.
 *
 * Nothing ships un-judged: if the gate isn't wired (ANTHROPIC_API_KEY unset) the
 * dispatcher is a clean no-op — it plans + generates nothing rather than publish blind.
 */

const XS_CRON_COUNT = 10
/**
 * The candidates-mode cron batch — bigger than the API-gated one, because the
 * spend per idea is smaller and the bottleneck moved.
 *
 * Twelve ideas, still every two hours, still under the daily generation cap in
 * `spend-guard.ts` (12 ideas × ~1.1 generations × 12 firings ≈ 160 against a cap
 * of 480). Per-firing cost is Fal only: eleven schnell generations at ~$0.003
 * and one dense showpiece on Flux 1.1 Pro at ~$0.032, so roughly $0.07 a firing
 * — about £0.60 a day for the whole autopilot, and not a penny of it to a
 * per-token model API.
 */
const XS_CANDIDATE_CRON_COUNT = 12
/** How many of a candidates batch's slots a re-roll request may claim. */
const XS_MAX_REROLLS_PER_BATCH = 3
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
async function preflight(craft: Craft, manual: boolean, gateMode?: XsGateMode): Promise<PreflightResult> {
  // THE GATE WIRING CHECK IS MODE-DEPENDENT. In the cross-stitch 'candidates'
  // mode there IS no API gate on the path — a Claude Code session judges the
  // parked candidates afterwards — so a missing ANTHROPIC_API_KEY is not a
  // reason to generate nothing. Every other craft, and 'api' mode, still refuse
  // to run un-gated.
  const needsApiGate = craft !== 'cross-stitch' || gateMode !== 'candidates'
  if (needsApiGate && !gateConfigured()) return { skip: 'gate-not-wired' }

  // Housekeeping first: a run that died mid-fan-out would otherwise sit
  // unfinished forever, and nothing else in the system ever looks at it. Every
  // craft fans out now, so every craft's cron does the sweep.
  await sweepStalledRuns().catch((err) => {
    console.error('[bulk] stalled-run sweep failed', err)
  })
  // Same housekeeping, same schedule, for the candidate parking bay: a candidate
  // nobody judged inside a week is retired as REJECTED with reason 'unjudged',
  // so the bay cannot grow forever behind a routine that quietly stopped firing.
  if (craft === 'cross-stitch') {
    await sweepUnjudgedCandidates()
      .then((n) => {
        if (n > 0) console.warn(`[bulk cross-stitch] swept ${n} un-judged candidates`)
      })
      .catch((err) => {
        console.error('[bulk cross-stitch] candidate sweep failed', err)
      })
    // The parking bay's own health check, through the same alert path as a run
    // that yielded nothing: an autopilot whose judging routine has stopped is a
    // silence, and silence is what an unattended system must never produce. The
    // wording is the admin banner's, so page and alert cannot drift apart.
    await candidateStats()
      .then((stats) => {
        const warns = candidateWarnings(stats)
        if (!warns.length) return
        Sentry.captureMessage('bulk cross-stitch candidates are not being judged', {
          level: 'warning',
          extra: {
            pending: stats.pending,
            oldest: stats.oldest?.toISOString() ?? null,
            lastJudgedAt: stats.lastJudgedAt?.toISOString() ?? null,
            reasons: warns,
          },
        })
      })
      .catch((err) => {
        console.error('[bulk cross-stitch] candidate health check failed', err)
      })
  }

  if (craft === 'cross-stitch') {
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
      dressedBriefs: true, parked: true,
    },
  })
  if (!run || run.finishedAt) return { finished: false, alerted: false }
  if (!runIsComplete(run)) return { finished: false, alerted: false }

  const summary = summaryLine({ ...run, plannerMode: PLANNER_MODE })
  // A run that produced nothing, or that fell over on half its ideas, is a
  // problem a human needs to hear about — the whole point of an unattended
  // autopilot is that silence means it is working.
  // WHAT "NOTHING" MEANS DEPENDS ON THE MODE. A candidates-mode run finishes
  // with `published` at zero every single time — a session fills that in hours
  // later — so the alert reads the run's real output: did it park anything?
  const yieldedNothing = run.published === 0 && run.parked === 0
  const errorStorm = run.requested > 0 && run.errors >= run.requested / 2
  const alert = run.requested > 0 && (yieldedNothing || errorStorm) && !run.alerted

  await prisma.bulkRun.update({
    where: { id: runId },
    data: { finishedAt: new Date(), summary, ...(alert ? { alerted: true } : {}) },
  })
  if (alert) {
    Sentry.captureMessage(`bulk ${run.craft} run yielded nothing`, {
      level: 'warning',
      extra: {
        runId: run.id,
        craft: run.craft,
        requested: run.requested,
        published: run.published,
        culled: run.culled,
        duplicates: run.duplicates,
        skipped: run.skipped,
        parked: run.parked,
        errors: run.errors,
        generations: run.generations,
        reason: yieldedNothing ? 'published 0, parked 0' : 'errors on half or more of the ideas',
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
    // Every craft fans out now, so any of them can lose an idea to an event
    // that never landed or a container that went away mid-render.
    where: { finishedAt: null, updatedAt: { lt: cutoff } },
    select: {
      id: true, craft: true, requested: true, published: true, culled: true, duplicates: true,
      skipped: true, repaired: true, generations: true, errors: true, updatedAt: true, modelBriefs: true,
      paleSkips: true, propRejects: true, collisionRejects: true, dressedBriefs: true, parked: true,
    },
  })
  for (const run of stalled) {
    await prisma.bulkRun.update({
      where: { id: run.id },
      data: { finishedAt: new Date(), summary: `stalled — ${summaryLine({ ...run, plannerMode: PLANNER_MODE })}`, alerted: true },
    })
    Sentry.captureMessage(`bulk ${run.craft} run yielded nothing`, {
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

    // WHO JUDGES this batch. Read first, because it decides whether the run
    // needs the API gate wired at all, how many ideas it plans, and whether a
    // single call is made through `anthropic.ts` anywhere on the path.
    const gateMode = await step.run('gate-mode', () => crossStitchGateMode())
    const pre = await step.run('preflight', () => preflight('cross-stitch', manual, gateMode))
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

    const cronCount = gateMode === 'candidates' ? XS_CANDIDATE_CRON_COUNT : XS_CRON_COUNT
    const n = manual ? manualCount(data?.count, cronCount) : cronCount

    // ── CANDIDATES MODE: plan from the pool, park what survives ─────────────
    // No planner model call, no gate call, nothing through `anthropic.ts`. The
    // pool sampler writes the briefs (deficit-weighted shelves, lane tags, the
    // text-risk and prop rules and the within-batch collision rule all
    // unchanged), re-roll requests from the last judging session take the first
    // few slots, and every idea that survives the deterministic guards is parked
    // as an UNLISTED candidate for the next session to look at.
    if (gateMode === 'candidates') {
      const rerolls = await step.run('reroll-queue', () => takeRerollRequests(Math.min(XS_MAX_REROLLS_PER_BATCH, n)))
      const fresh = Math.max(0, n - rerolls.length)
      const candCtx = (await step.run('plan-context', () => crossStitchPlanContext(fresh))) ?? {}
      const sampled = fresh > 0 ? await step.run('plan-candidates', () => planCrossStitchCandidateBriefs(fresh, candCtx)) : []
      const planned = [...rerolls.map((r) => r.brief), ...sampled]
      if (!planned.length) return { skipped: 'no briefs planned', gateMode }
      const rerollCounts = new Map(rerolls.map((r) => [r.brief.slug, r.rerollCount]))

      const triggeredBy = manual && typeof data?.triggeredBy === 'string' && data.triggeredBy ? data.triggeredBy : null
      const candidateRun = await step.run('create-run', () =>
        prisma.bulkRun.create({
          data: {
            craft: 'cross-stitch',
            trigger: manual ? 'manual' : 'cron',
            requested: planned.length,
            // Nothing was model-authored: no model was called.
            modelBriefs: 0,
            dressedBriefs: dressedCount(planned),
            triggeredById: triggeredBy,
          },
          select: { id: true },
        }),
      )
      await step.sendEvent(
        'dispatch-ideas',
        planned.map((brief) => ({
          name: 'bulk/cross-stitch.idea',
          data: {
            runId: candidateRun.id,
            brief,
            attempt: 1,
            tweak: {} as CandidateTweak,
            gateMode,
            rerollCount: rerollCounts.get(brief.slug) ?? 0,
          },
        })),
      )
      return {
        runId: candidateRun.id,
        dispatched: planned.length,
        rerolls: rerolls.length,
        gateMode,
        plannerMode: PLANNER_MODE,
      }
    }

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
    const sourceMode = await step.run('source-mode', () => crossStitchSourceMode())
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
    return { runId: run.id, dispatched: briefs.length, modelAuthored: authored, propRejects, collisionRejects, dressed, plannerMode: PLANNER_MODE, sourceMode, gateMode }
  },
)

interface IdeaEventData {
  runId?: string
  brief?: CrossStitchBrief
  attempt?: number
  tweak?: CandidateTweak
  /** Carried on the event so a mid-batch admin flip cannot split one run's ideas
   *  across two judging models. Absent on an event from an older deploy. */
  gateMode?: XsGateMode
  /** Candidates mode: how many re-rolls this idea will have had once it lands. */
  rerollCount?: number
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
    const { runId, brief, attempt = 1, tweak, gateMode, rerollCount = 0 } = (event.data ?? {}) as IdeaEventData
    if (!runId || !brief) return { skipped: 'missing runId/brief' }

    // CANDIDATES MODE — a separate, shorter path that never touches
    // `anthropic.ts`: generate, pale guard, duplicate guard, park.
    if (gateMode === 'candidates') {
      // Inngest's `step.run` types its result as `Jsonify<T>`, which is the same
      // shape at runtime but not assignable to `T` generically. Every value this
      // path memoises IS plain JSON (a verdict object, a Prisma update result),
      // so the adapter states that once here rather than spreading casts through
      // the worker.
      const stepAdapter: CandidateStep = {
        run: <T,>(id: string, fn: () => Promise<T>): Promise<T> => step.run(id, fn) as unknown as Promise<T>,
        sendEvent: (id, payload) => step.sendEvent(id, payload as Parameters<typeof step.sendEvent>[1]),
      }
      return runCandidateIdea({ runId, brief, attempt, tweak: tweak ?? {}, rerollCount, step: stepAdapter })
    }

    // Which model draws this attempt. Read per attempt (not per batch) so
    // flipping the admin toggle takes effect on the very next idea rather than
    // the next dispatch — and memoised as its own step so a replay is stable.
    const sourceMode = await step.run('source-mode', () => crossStitchSourceMode())
    const pro = candidateIsPro(brief, tweak ?? {}, sourceMode)

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
        return crossStitchAttempt(brief, tweak ?? {}, kept, { bulkRunId: runId, attempt, sourceMode })
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
      // A pale skip leaves no other trace — keep the render that failed the
      // arithmetic so the floor can be re-calibrated against real culls.
      const paleSample = result.rejectSample
      if (paleSample) await step.run('record-reject-pale', () => recordRejectSample(runId, paleSample))
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
    // The picture the gate killed, so a person can check the gate was right.
    const cullSample = result.rejectSample
    if (cullSample) await step.run('record-reject-cull', () => recordRejectSample(runId, cullSample))
    await step.run('check-complete', () => finaliseIfComplete(runId))
    return { outcome: 'culled', slug: brief.slug }
  },
)

/** The slice of Inngest's step API the candidates worker uses. */
interface CandidateStep {
  run: <T>(id: string, fn: () => Promise<T>) => Promise<T>
  sendEvent: (id: string, payload: unknown) => Promise<unknown>
}

/**
 * ONE candidates-mode idea. The same fan-out shape as the API-gated worker —
 * one generation per invocation, atomic increments on the run row, a re-emitted
 * event for the one re-roll a pale render earns — with the judging taken out.
 *
 * Terminal outcomes here are: parked (the normal one), duplicate, pale twice
 * over, or an error. `parked` is what the run's alert reads, because
 * `published` cannot move until a session has looked at the contact sheet.
 */
async function runCandidateIdea(args: {
  runId: string
  brief: CrossStitchBrief
  attempt: number
  tweak: CandidateTweak
  rerollCount: number
  step: CandidateStep
}): Promise<Record<string, unknown>> {
  const { runId, brief, attempt, tweak, rerollCount, step } = args
  const sourceMode = await step.run('source-mode', () => crossStitchSourceMode())
  const pro = candidateIsPro(brief, tweak, sourceMode)

  // The spend cap at the point of spending — a queue of ideas fanned out before
  // the cap was hit would otherwise sail straight through it.
  const capped = await step.run('spend-cap', async () => {
    const window = await crossStitchSpendWindow()
    return overCap(window, { pro })
  })
  if (capped) {
    await step.run('record-skipped', () =>
      prisma.bulkRun.update({ where: { id: runId }, data: { skipped: { increment: 1 } } }),
    )
    await step.run('check-complete', () => finaliseIfComplete(runId))
    console.warn(`[bulk cross-stitch candidates] ${brief.slug} skipped — ${capped}`)
    return { outcome: 'skipped', slug: brief.slug, reason: capped }
  }

  let result: AttemptResult
  try {
    result = await step.run('attempt', () =>
      crossStitchCandidateAttempt(brief, tweak, { bulkRunId: runId, attempt, sourceMode, rerollCount }),
    )
  } catch (err) {
    await step.run('record-error', () =>
      prisma.bulkRun.update({
        where: { id: runId },
        data: { errors: { increment: 1 }, generations: { increment: 1 }, ...(pro ? { proGenerations: { increment: 1 } } : {}) },
      }),
    )
    await step.run('check-complete', () => finaliseIfComplete(runId))
    console.error(`[bulk cross-stitch candidates] ${brief.slug} attempt ${attempt} failed`, err)
    return { outcome: 'error', slug: brief.slug }
  }

  const proInc = (result.pro ?? pro) ? { proGenerations: { increment: 1 } } : {}

  if (result.parked) {
    await step.run('record-parked', () =>
      prisma.bulkRun.update({
        where: { id: runId },
        data: { parked: { increment: 1 }, generations: { increment: 1 }, ...proInc, gemSlugs: { push: brief.slug } },
      }),
    )
    await step.run('check-complete', () => finaliseIfComplete(runId))
    return { outcome: 'parked', slug: brief.slug }
  }

  if (result.duplicateOf) {
    const reason = `duplicate of ${result.duplicateOf}`.slice(0, 80)
    await step.run('record-duplicate', () =>
      prisma.bulkRun.update({
        where: { id: runId },
        data: { duplicates: { increment: 1 }, generations: { increment: 1 }, ...proInc, killReasons: { push: reason } },
      }),
    )
    await step.run('check-complete', () => finaliseIfComplete(runId))
    console.warn(`[bulk cross-stitch candidates] ${brief.slug} refused — ${result.duplicateReason}`)
    return { outcome: 'duplicate', slug: brief.slug, duplicateOf: result.duplicateOf }
  }

  // The pale guard's ONE saturation re-roll. Nothing else re-rolls here: there
  // is no gate asking for a repair, so a render that is not pale is parked.
  if (result.verdict === 'repair' && attempt < MAX_XS_CANDIDATE_ATTEMPTS) {
    await step.run('record-reroll', () =>
      prisma.bulkRun.update({
        where: { id: runId },
        data: {
          generations: { increment: 1 },
          ...proInc,
          repaired: { increment: 1 },
          ...(result.tooPale ? { paleSkips: { increment: 1 } } : {}),
        },
      }),
    )
    const paleSample = result.rejectSample
    if (paleSample) await step.run('record-reject-pale', () => recordRejectSample(runId, paleSample))
    await step.sendEvent('next-attempt', {
      name: 'bulk/cross-stitch.idea',
      data: { runId, brief, attempt: attempt + 1, tweak: tweakFor(result.repairAction), gateMode: 'candidates', rerollCount },
    })
    return { outcome: 'reroll', slug: brief.slug, attempt: attempt + 1 }
  }

  // Still pale after its re-roll: discarded, and the render kept so the pale
  // floor can be re-calibrated against the pictures it actually rejected.
  const reason = (result.reasons[0] ?? 'discarded').slice(0, 80)
  await step.run('record-cull', () =>
    prisma.bulkRun.update({
      where: { id: runId },
      data: {
        culled: { increment: 1 },
        generations: { increment: 1 },
        ...proInc,
        ...(result.tooPale ? { paleSkips: { increment: 1 } } : {}),
        killReasons: { push: reason },
      },
    }),
  )
  const cullSample = result.rejectSample
  if (cullSample) await step.run('record-reject-cull', () => recordRejectSample(runId, cullSample))
  await step.run('check-complete', () => finaliseIfComplete(runId))
  return { outcome: 'discarded', slug: brief.slug, reason }
}

// ──────────────────── NEEDLEWORK + CROCHET (fan-out, async render) ────────────────────
//
// Both crafts hero themselves on Fargate: seven to nine minutes of Blender per
// idea. That is what kept them off the server. A batch could not run inside one
// function (the whole run is hours), and an idea could not run inside one step
// (the render alone is five times the request limit).
//
// So they now take cross-stitch's shape with the render made asynchronous
// inside it. A DISPATCHER plans the briefs, writes the BulkRun row and fans out
// one event per idea; an IDEA WORKER does one idea from end to end:
//
//   generate  author the design / illustration, compile, audit, START the task
//   wait      sleep a minute, spend one describe-tasks call, repeat
//   render    fetch the PNG, photoreal finish, fidelity gate, park the hero
//   publish   gate the hero, duplicate guard, publish a complete row
//
// No step is longer than one AWS call or one model call, and the run is
// SUSPENDED for the render itself, so a batch of six costs the web service
// almost nothing while forty minutes of Blender happens elsewhere.
//
// Concurrency is capped at three ideas per craft: three renders at once is a
// batch that finishes inside its firing without a queue of Fargate tasks (each
// 4 vCPU / 8 GB) piling up behind the spend guard.
//
// Every idea updates the BulkRun row with ATOMIC increments the moment it
// reaches a terminal outcome, so the admin card shows the batch filling up
// while it runs, and the LAST idea to finish closes the row with its summary
// line (`finaliseIfComplete`).

/** Ideas rendering at once, per craft. Each one is a 4-vCPU Fargate task. */
const RENDER_CONCURRENCY = 3

interface CrochetIdeaEventData {
  runId?: string
  brief?: CrochetBrief
  attempt?: number
}

interface NeedleworkIdeaEventData {
  runId?: string
  brief?: NeedleworkBrief
  attempt?: number
}

/** One idea's terminal outcome: bump the run's counters, then close it if last. */
async function recordIdeaOutcome(runId: string, data: Prisma.BulkRunUpdateInput): Promise<void> {
  await prisma.bulkRun.update({ where: { id: runId }, data })
  await finaliseIfComplete(runId)
}

// ─────────────────────────── NEEDLEWORK ───────────────────────────

export const bulkNeedleworkBatch = inngest.createFunction(
  {
    id: 'bulk-needlework-batch',
    name: 'Bulk: needlework dispatcher',
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

    const briefs = await step.run('plan', async () => {
      const recent = await recentNeedleworkSlugs().catch(() => [])
      return planNeedleworkBriefs(n, recent)
    })
    if (!briefs.length) return { skipped: 'no briefs planned' }

    const triggeredById = manual && typeof data?.triggeredBy === 'string' && data.triggeredBy ? data.triggeredBy : null
    const run = await step.run('create-run', () =>
      prisma.bulkRun.create({
        data: {
          craft: 'needlework',
          trigger: manual ? 'manual' : 'cron',
          requested: briefs.length,
          triggeredById,
        },
        select: { id: true },
      }),
    )

    await step.sendEvent(
      'dispatch-ideas',
      briefs.map((brief) => ({ name: 'bulk/needlework.idea', data: { runId: run.id, brief, attempt: 1 } })),
    )
    return { runId: run.id, dispatched: briefs.length }
  },
)

export const bulkNeedleworkIdea = inngest.createFunction(
  {
    id: 'bulk-needlework-idea',
    name: 'Bulk: needlework idea (one render)',
    // Three Fargate renders at once, no more. Unlike cross-stitch the heavy work
    // is NOT in this container — it is a 4-vCPU Blender task elsewhere — so the
    // limit is about how many of those to pay for at a time, not memory here.
    concurrency: { limit: RENDER_CONCURRENCY },
    retries: 1,
    triggers: [{ event: 'bulk/needlework.idea' }],
  },
  async ({ event, step }) => {
    const { runId, brief, attempt = 1 } = (event.data ?? {}) as NeedleworkIdeaEventData
    if (!runId || !brief) return { skipped: 'missing runId/brief' }

    let rendered: Awaited<ReturnType<typeof renderNeedleworkCandidate>>
    try {
      // GENERATE — Flux, the needlework conversion, and the START of the render.
      const pending = await step.run('generate', () => startNeedleworkCandidate(brief))

      // WAIT — suspended between polls; the container is free the whole time.
      await waitForRender(step, `nw-${brief.slug}`, () => pollNeedleworkCandidate(pending))

      // RENDER — the finished hero, parked in the scratch bucket for the gate.
      rendered = await step.run('render', () => renderNeedleworkCandidate(pending))
    } catch (err) {
      await step.run('record-error', () =>
        recordIdeaOutcome(runId, { errors: { increment: 1 }, generations: { increment: 1 } }),
      )
      console.error(`[bulk needlework] ${brief.slug} attempt ${attempt} failed`, err)
      return { outcome: 'error', slug: brief.slug }
    }

    // GATE + PUBLISH — the same judgement and the same publisher the inline
    // runner uses; the gate sees the catalogue's recent names as its kept list.
    const result = await step.run('gate-publish', async () => {
      const kept = await recentNeedleworkSlugs().catch(() => [])
      const candidate = await loadNeedleworkCandidate(rendered)
      return needleworkGateAndPublish(brief, candidate, kept)
    })

    if (result.published) {
      await step.run('record-keep', () =>
        recordIdeaOutcome(runId, {
          published: { increment: 1 },
          generations: { increment: 1 },
          gemSlugs: { push: brief.slug },
        }),
      )
      return { outcome: 'published', slug: brief.slug }
    }

    // A 'repair' earns exactly one fresh render — the only repair needlework
    // runs — and anything else culls. A Fargate render is too expensive to
    // re-roll further on a hunch.
    if (result.verdict === 'repair' && attempt <= MAX_NW_REPAIRS) {
      await step.run('record-reroll', () =>
        prisma.bulkRun.update({
          where: { id: runId },
          data: { repaired: { increment: 1 }, generations: { increment: 1 } },
        }),
      )
      await step.sendEvent('next-attempt', {
        name: 'bulk/needlework.idea',
        data: { runId, brief, attempt: attempt + 1 },
      })
      return { outcome: 'reroll', slug: brief.slug, attempt: attempt + 1 }
    }

    const reason = (result.reasons[0] ?? 'kill').slice(0, 80)
    await step.run('record-cull', () =>
      recordIdeaOutcome(runId, {
        culled: { increment: 1 },
        generations: { increment: 1 },
        killReasons: { push: reason },
      }),
    )
    return { outcome: 'culled', slug: brief.slug }
  },
)

// ─────────────────────────── CROCHET ───────────────────────────

export const bulkCrochetBatch = inngest.createFunction(
  {
    id: 'bulk-crochet-batch',
    name: 'Bulk: crochet dispatcher',
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

    // TWO steps, as cross-stitch has it: the catalogue reads and the planner's
    // model call must not share one request, or a slow chunk 502s both.
    const planCtx = (await step.run('plan-context', () => crochetPlanContext(n))) ?? {}
    const briefs = await step.run('plan-briefs', () => planCrochetBriefs(n, planCtx))
    if (!briefs.length) return { skipped: 'no briefs planned' }

    // For crochet these are the same number: a brief the planner model wrote is
    // by definition one it dressed, because constrained mode is the only mode
    // that produces one.
    const authored = crochetModelAuthoredCount(briefs)
    const triggeredById = manual && typeof data?.triggeredBy === 'string' && data.triggeredBy ? data.triggeredBy : null
    const run = await step.run('create-run', () =>
      prisma.bulkRun.create({
        data: {
          craft: 'crochet',
          trigger: manual ? 'manual' : 'cron',
          requested: briefs.length,
          // For crochet these are the same number: a brief the planner model
          // wrote is by definition one it dressed. Both are set so the summary
          // line reads the same as the inline runner's.
          modelBriefs: authored,
          dressedBriefs: authored,
          triggeredById,
        },
        select: { id: true },
      }),
    )

    await step.sendEvent(
      'dispatch-ideas',
      briefs.map((brief) => ({ name: 'bulk/crochet.idea', data: { runId: run.id, brief, attempt: 1 } })),
    )
    return { runId: run.id, dispatched: briefs.length, modelAuthored: authored, plannerMode: PLANNER_MODE }
  },
)

export const bulkCrochetIdea = inngest.createFunction(
  {
    id: 'bulk-crochet-idea',
    name: 'Bulk: crochet idea (one render)',
    concurrency: { limit: RENDER_CONCURRENCY },
    retries: 1,
    triggers: [{ event: 'bulk/crochet.idea' }],
  },
  async ({ event, step }) => {
    const { runId, brief, attempt = 1 } = (event.data ?? {}) as CrochetIdeaEventData
    if (!runId || !brief) return { skipped: 'missing runId/brief' }

    const illustration = brief.treatment === 'grid-tapestry'
    const proInc = illustration ? { proGenerations: { increment: 1 } } : {}

    // The spend cap again, here at the point of spending. The dispatcher checked
    // it minutes ago; a queue of ideas fanned out before the cap was hit would
    // otherwise sail straight through it. A crochet idea costs a Fargate task;
    // the pictorial lane costs an illustration on top.
    const capped = await step.run('spend-cap', async () => {
      const window = await crochetSpendWindow()
      return overCrochetCap(window, { illustration })
    })
    if (capped) {
      await step.run('record-skipped', () => recordIdeaOutcome(runId, { skipped: { increment: 1 } }))
      console.warn(`[bulk crochet] ${brief.slug} skipped — ${capped}`)
      return { outcome: 'skipped', slug: brief.slug, reason: capped }
    }

    let rendered: Awaited<ReturnType<typeof renderCrochetCandidate>>
    try {
      // GENERATE — author the program, compile, audit, declare the settled size,
      // and START the exact-hero render. The audit gate refuses before a task is
      // launched, so un-stitchable geometry never costs a render.
      const pending = await step.run('generate', () =>
        startCrochetCandidate(brief, paletteHexesFor(brief.brief.palette)),
      )

      // WAIT — suspended between polls; the container is free the whole time.
      await waitForRender(step, `cr-${brief.slug}`, () => pollCrochetCandidate(pending))

      // RENDER — the finished hero, parked in the scratch bucket for the gate.
      rendered = await step.run('render', () => renderCrochetCandidate(pending))
    } catch (err) {
      await step.run('record-error', () =>
        recordIdeaOutcome(runId, { errors: { increment: 1 }, generations: { increment: 1 }, ...proInc }),
      )
      console.error(`[bulk crochet] ${brief.slug} attempt ${attempt} failed`, err)
      return { outcome: 'error', slug: brief.slug }
    }

    // GATE + PUBLISH — the same judgement, duplicate guard, completeness gate
    // and publisher the inline runner uses.
    const result = await step.run('gate-publish', async () => {
      const kept = await recentCrochetNames().catch(() => [])
      const candidate = await loadCrochetCandidate(rendered)
      return crochetGateAndPublish(brief, candidate, kept, { bulkRunId: runId, attempt })
    })

    if (result.published) {
      await step.run('record-keep', () =>
        recordIdeaOutcome(runId, {
          published: { increment: 1 },
          generations: { increment: 1 },
          ...proInc,
          gemSlugs: { push: brief.slug },
        }),
      )
      return { outcome: 'published', slug: brief.slug }
    }

    // TERMINAL: the gate kept it, the duplicate guard did not. Nothing was
    // written, and the idea is NOT re-rolled — the same brief renders the same
    // object, so another roll collides all over again.
    if (result.duplicateOf) {
      const reason = `duplicate of ${result.duplicateOf}`.slice(0, 80)
      await step.run('record-duplicate', () =>
        recordIdeaOutcome(runId, {
          duplicates: { increment: 1 },
          generations: { increment: 1 },
          ...proInc,
          killReasons: { push: reason },
        }),
      )
      console.warn(`[bulk crochet] ${brief.slug} refused — ${result.duplicateReason}`)
      return { outcome: 'duplicate', slug: brief.slug, duplicateOf: result.duplicateOf }
    }

    // Only a staging fault earns a second attempt, and that attempt authors a
    // DIFFERENT design for the same brief: crochet geometry is deterministic, so
    // re-rendering the same program is the same picture.
    if (result.verdict === 'repair' && attempt <= MAX_CROCHET_REPAIRS) {
      await step.run('record-reroll', () =>
        prisma.bulkRun.update({
          where: { id: runId },
          data: { repaired: { increment: 1 }, generations: { increment: 1 }, ...proInc },
        }),
      )
      await step.sendEvent('next-attempt', {
        name: 'bulk/crochet.idea',
        data: { runId, brief, attempt: attempt + 1 },
      })
      return { outcome: 'reroll', slug: brief.slug, attempt: attempt + 1 }
    }

    const reason = (result.reasons[0] ?? 'kill').slice(0, 80)
    await step.run('record-cull', () =>
      recordIdeaOutcome(runId, {
        culled: { increment: 1 },
        generations: { increment: 1 },
        ...proInc,
        killReasons: { push: reason },
      }),
    )
    return { outcome: 'culled', slug: brief.slug }
  },
)
