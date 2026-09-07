import type { Prisma } from '@homemade/db'
import type { XsSourceMode } from '@/lib/studio/generation/bulk/autopilot-state'
import type { CandidateTweak, RejectSample } from '@/lib/studio/generation/bulk/cross-stitch'
import type { CrossStitchBrief } from '@/lib/studio/generation/bulk/planner'
import type { AttemptResult } from '@/lib/studio/generation/bulk/run'

/**
 * ONE candidates-mode cross-stitch idea, as a STEP LAYOUT.
 *
 * ── why this file exists ────────────────────────────────────────────────────
 * Inngest's free tier counts every step execution — every `step.run`, every
 * `step.sendEvent`, every sleep — against one monthly allowance, and this
 * worker runs twelve times every two hours. It used to spend five or six step
 * executions on an attempt that does exactly one interesting thing (call Fal),
 * because each counter increment, each diagnostic write and each "is the run
 * finished?" check was its own memoised step.
 *
 * The rule that replaced them: A STEP IS FOR SOMETHING THAT MUST NOT HAPPEN
 * TWICE, OR THAT IS TOO EXPENSIVE TO REPEAT. Everything else rides along inside
 * one. That leaves exactly four ids, and only ever three of them on one run:
 *
 *   prepare       two config reads (source mode, spend window). Pure reads, so a
 *                 retry costs nothing and changes nothing.
 *   attempt       the Fal generation and the whole deterministic chain behind it
 *                 (pale guard, quick-win / showpiece guards, bare-fabric, the
 *                 converter, the duplicate guard, park, thumbnail, search sync).
 *                 Its own step because it is the expensive, retry-worthy call
 *                 and because a retry must NOT re-run the counters below it.
 *   finish        the terminal counter increment, the kept reject render and the
 *                 run finaliser, in that order. Increment first, because it is
 *                 the one thing here that must not run twice; the two after it
 *                 are idempotent and swallow their own errors, so they can never
 *                 send the increment round again.
 *   reroll        the same write on the ONE non-terminal outcome (the pale
 *                 guard's saturation re-roll), without the finaliser.
 *   next-attempt  `step.sendEvent`. Stays its own step: re-sending the event on a
 *                 retry would buy a second Fal generation.
 *
 * ── why the deps are injected ───────────────────────────────────────────────
 * `bulk-generation.ts` is `server-only` and reaches Prisma, Fal, sharp and R2,
 * so nothing can import it to check what it does. This module takes its three
 * collaborators as arguments instead, which makes the step layout itself
 * testable: `bulk-cross-stitch-candidate.test.ts` drives every outcome with fake
 * collaborators and asserts the ids that were spent.
 */

/** The slice of Inngest's step API this worker uses. */
export interface CandidateStep {
  run: <T>(id: string, fn: () => Promise<T>) => Promise<T>
  sendEvent: (id: string, payload: unknown) => Promise<unknown>
}

/** Every step id one candidates-mode attempt may spend. Asserted by the test. */
export const XS_CANDIDATE_STEP_IDS = ['prepare', 'attempt', 'finish', 'reroll', 'next-attempt'] as const
export type XsCandidateStepId = (typeof XS_CANDIDATE_STEP_IDS)[number]

/**
 * The most step executions ONE invocation of this worker may ever spend.
 *
 * Four, on the re-roll path (prepare, attempt, reroll, next-attempt). Every
 * terminal outcome spends three, and a spend-capped one spends two.
 */
export const XS_CANDIDATE_MAX_STEPS = 4

/** What `prepare` reads, in one step, before anything is spent. */
export interface CandidatePrep {
  sourceMode: XsSourceMode
  /** True when this attempt will draw on the Flux 1.1 Pro (dense) tier. */
  pro: boolean
  /** The daily Fal cap's reason to stop, or null to go ahead. */
  capped: string | null
}

/** One write against the run row: counters, then diagnostics, then the finaliser. */
export interface CandidateRecord {
  runId: string
  data: Prisma.BulkRunUpdateInput
  /** The render this outcome threw away, kept so the pale floor can be re-checked. */
  sample?: RejectSample | null
  /** True on a terminal outcome: close the run if this was its last idea. */
  finalise: boolean
}

/** The three things this worker cannot do for itself. */
export interface CandidateIdeaDeps {
  prepare: (brief: CrossStitchBrief, tweak: CandidateTweak) => Promise<CandidatePrep>
  attempt: (args: {
    brief: CrossStitchBrief
    tweak: CandidateTweak
    runId: string
    attempt: number
    sourceMode: XsSourceMode
    rerollCount: number
  }) => Promise<AttemptResult>
  record: (args: CandidateRecord) => Promise<void>
  /** The tweak the next roll of a repaired idea is generated with. */
  nextTweak: (result: AttemptResult) => CandidateTweak
  /** How many attempts one idea gets before it is discarded rather than re-rolled. */
  maxAttempts: number
}

export interface CandidateIdeaArgs {
  runId: string
  brief: CrossStitchBrief
  attempt: number
  tweak: CandidateTweak
  rerollCount: number
  step: CandidateStep
  deps: CandidateIdeaDeps
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
export async function runCrossStitchCandidateIdea(args: CandidateIdeaArgs): Promise<Record<string, unknown>> {
  const { runId, brief, attempt, tweak, rerollCount, step, deps } = args

  // STEP 1 — the two reads this attempt turns on: which model draws it (read per
  // attempt, so flipping the admin toggle takes effect on the very next idea)
  // and whether the daily Fal cap has already been reached. The dispatcher
  // checked the cap minutes ago; a queue of ideas fanned out before it was hit
  // would otherwise sail straight through it.
  const prep = await step.run('prepare', () => deps.prepare(brief, tweak))

  if (prep.capped) {
    await step.run('finish', () => deps.record({ runId, data: { skipped: { increment: 1 } }, finalise: true }))
    console.warn(`[bulk cross-stitch candidates] ${brief.slug} skipped — ${prep.capped}`)
    return { outcome: 'skipped', slug: brief.slug, reason: prep.capped }
  }

  // STEP 2 — the expensive one, and the only one worth a retry on its own.
  let result: AttemptResult
  try {
    result = await step.run('attempt', () =>
      deps.attempt({ brief, tweak, runId, attempt, sourceMode: prep.sourceMode, rerollCount }),
    )
  } catch (err) {
    await step.run('finish', () =>
      deps.record({
        runId,
        data: {
          errors: { increment: 1 },
          generations: { increment: 1 },
          ...(prep.pro ? { proGenerations: { increment: 1 } } : {}),
        },
        finalise: true,
      }),
    )
    console.error(`[bulk cross-stitch candidates] ${brief.slug} attempt ${attempt} failed`, err)
    return { outcome: 'error', slug: brief.slug }
  }

  const proInc = (result.pro ?? prep.pro) ? { proGenerations: { increment: 1 } } : {}

  // STEP 3 — one of four terminal writes, or the re-roll pair.
  if (result.parked) {
    await step.run('finish', () =>
      deps.record({
        runId,
        data: {
          parked: { increment: 1 },
          generations: { increment: 1 },
          ...proInc,
          gemSlugs: { push: brief.slug },
        },
        finalise: true,
      }),
    )
    return { outcome: 'parked', slug: brief.slug }
  }

  if (result.duplicateOf) {
    const reason = `duplicate of ${result.duplicateOf}`.slice(0, 80)
    await step.run('finish', () =>
      deps.record({
        runId,
        data: {
          duplicates: { increment: 1 },
          generations: { increment: 1 },
          ...proInc,
          killReasons: { push: reason },
        },
        finalise: true,
      }),
    )
    console.warn(`[bulk cross-stitch candidates] ${brief.slug} refused — ${result.duplicateReason}`)
    return { outcome: 'duplicate', slug: brief.slug, duplicateOf: result.duplicateOf }
  }

  // The pale guard's ONE saturation re-roll. Nothing else re-rolls here: there
  // is no gate asking for a repair, so a render that is not pale is parked.
  if (result.verdict === 'repair' && attempt < deps.maxAttempts) {
    await step.run('reroll', () =>
      deps.record({
        runId,
        data: {
          generations: { increment: 1 },
          ...proInc,
          repaired: { increment: 1 },
          ...(result.tooPale ? { paleSkips: { increment: 1 } } : {}),
        },
        sample: result.rejectSample ?? null,
        finalise: false,
      }),
    )
    await step.sendEvent('next-attempt', {
      name: 'bulk/cross-stitch.idea',
      data: {
        runId,
        brief,
        attempt: attempt + 1,
        tweak: deps.nextTweak(result),
        gateMode: 'candidates',
        rerollCount,
      },
    })
    return { outcome: 'reroll', slug: brief.slug, attempt: attempt + 1 }
  }

  // Still pale after its re-roll: discarded, and the render kept so the pale
  // floor can be re-calibrated against the pictures it actually rejected.
  const reason = (result.reasons[0] ?? 'discarded').slice(0, 80)
  await step.run('finish', () =>
    deps.record({
      runId,
      data: {
        culled: { increment: 1 },
        generations: { increment: 1 },
        ...proInc,
        ...(result.tooPale ? { paleSkips: { increment: 1 } } : {}),
        killReasons: { push: reason },
      },
      sample: result.rejectSample ?? null,
      finalise: true,
    }),
  )
  return { outcome: 'discarded', slug: brief.slug, reason }
}
