/**
 * THE STEP LAYOUT of one candidates-mode cross-stitch idea.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx src/inngest/functions/bulk-cross-stitch-candidate.test.ts
 *
 * Inngest's free tier counts every step execution against a monthly allowance,
 * and this worker fires twelve times every two hours — so the number of steps an
 * attempt spends is a real budget, not an implementation detail. These tests
 * drive every outcome with fake collaborators and assert the exact ids spent, so
 * a well-meaning `step.run` added back for tidiness fails here rather than four
 * weeks later on an exhausted quota.
 *
 * They also pin the ORDER, which is the safety argument: the counter write must
 * come after the attempt and must not be re-entered by a retry of it.
 */

import assert from 'node:assert/strict'
import {
  runCrossStitchCandidateIdea,
  XS_CANDIDATE_MAX_STEPS,
  XS_CANDIDATE_STEP_IDS,
  type CandidateIdeaDeps,
  type CandidatePrep,
  type CandidateRecord,
  type CandidateStep,
} from './bulk-cross-stitch-candidate'
import type { CrossStitchBrief } from '@/lib/studio/generation/bulk/planner'
import type { AttemptResult } from '@/lib/studio/generation/bulk/run'

const BRIEF = {
  slug: 'harvest-wreath',
  subject: 'harvest wreath',
  subjectKey: 'wreath',
  style: 'bright',
  w: 155,
  h: 155,
  colours: 40,
  lane: 'medium',
  source: 'sampler',
  plannerMode: 'constrained',
  dressed: false,
  shelf: 'autumn',
  shelfName: 'Autumn',
  themeId: 'autumn',
} as unknown as CrossStitchBrief

const PREP: CandidatePrep = { sourceMode: 'schnell', pro: false, capped: null }

interface Harness {
  ids: string[]
  events: unknown[]
  writes: CandidateRecord[]
  step: CandidateStep
}

function harness(): Harness {
  const ids: string[] = []
  const events: unknown[] = []
  const writes: CandidateRecord[] = []
  return {
    ids,
    events,
    writes,
    step: {
      run: async <T,>(id: string, fn: () => Promise<T>): Promise<T> => {
        ids.push(id)
        return fn()
      },
      sendEvent: async (id: string, payload: unknown) => {
        ids.push(id)
        events.push(payload)
        return undefined
      },
    },
  }
}

function deps(
  h: Harness,
  opts: { prep?: Partial<CandidatePrep>; result?: Partial<AttemptResult>; throws?: boolean } = {},
): CandidateIdeaDeps {
  return {
    prepare: async () => ({ ...PREP, ...opts.prep }),
    attempt: async () => {
      if (opts.throws) throw new Error('fal fell over')
      return { verdict: 'keep', reasons: [], published: false, ...opts.result } as AttemptResult
    },
    record: async (args) => {
      h.writes.push(args)
    },
    nextTweak: () => ({ satMul: 1.15 }),
    maxAttempts: 2,
  }
}

async function run(h: Harness, d: CandidateIdeaDeps, attempt = 1): Promise<Record<string, unknown>> {
  return runCrossStitchCandidateIdea({
    runId: 'run_1',
    brief: BRIEF,
    attempt,
    tweak: {},
    rerollCount: 0,
    step: h.step,
    deps: d,
  })
}

/** Silence the worker's operational logging for one call. */
async function quiet<T>(fn: () => Promise<T>): Promise<T> {
  const warn = console.warn
  const error = console.error
  console.warn = () => {}
  console.error = () => {}
  try {
    return await fn()
  } finally {
    console.warn = warn
    console.error = error
  }
}

async function main(): Promise<void> {
  // ── the normal outcome: parked ──────────────────────────────────────────────
  {
    const h = harness()
    const out = await run(h, deps(h, { result: { parked: true } }))
    assert.equal(out.outcome, 'parked')
    assert.deepEqual(h.ids, ['prepare', 'attempt', 'finish'], 'a parked idea spends three steps')
    assert.equal(h.writes.length, 1)
    assert.equal(h.writes[0]!.finalise, true, 'parking is terminal, so the run is finalised')
    assert.deepEqual(h.writes[0]!.data.parked, { increment: 1 })
    assert.deepEqual(h.writes[0]!.data.generations, { increment: 1 })
    assert.deepEqual(h.writes[0]!.data.gemSlugs, { push: 'harvest-wreath' })
  }

  // ── the duplicate guard's refusal ───────────────────────────────────────────
  {
    const h = harness()
    const out = await quiet(() =>
      run(h, deps(h, { result: { verdict: 'kill', duplicateOf: 'autumn-wreath', duplicateReason: 'dhash' } })),
    )
    assert.equal(out.outcome, 'duplicate')
    assert.deepEqual(h.ids, ['prepare', 'attempt', 'finish'])
    assert.deepEqual(h.writes[0]!.data.duplicates, { increment: 1 })
    assert.deepEqual(h.writes[0]!.data.killReasons, { push: 'duplicate of autumn-wreath' })
    assert.equal(h.writes[0]!.finalise, true)
  }

  // ── the pale guard's one saturation re-roll: the longest path there is ──────
  {
    const h = harness()
    const out = await run(
      h,
      deps(h, {
        result: {
          verdict: 'repair',
          repairAction: 'more-saturation',
          tooPale: true,
          reasons: ['too pale'],
          rejectSample: { slug: 'harvest-wreath', attempt: 1, url: 'https://r2/x.png', verdict: 'repair', reasons: ['too pale'], lane: 'medium', shelf: 'autumn', colours: 40 },
        },
      }),
    )
    assert.equal(out.outcome, 'reroll')
    assert.deepEqual(h.ids, ['prepare', 'attempt', 'reroll', 'next-attempt'], 'the re-roll path is the four-step one')
    assert.equal(h.ids.length, XS_CANDIDATE_MAX_STEPS, 'nothing may spend more steps than the documented ceiling')
    assert.equal(h.writes[0]!.finalise, false, 'a re-roll is not terminal — the run must stay open')
    assert.deepEqual(h.writes[0]!.data.repaired, { increment: 1 })
    assert.deepEqual(h.writes[0]!.data.paleSkips, { increment: 1 })
    assert.ok(h.writes[0]!.sample, 'the render that failed the arithmetic rides in the same write')
    assert.equal(h.events.length, 1)
    const sent = h.events[0] as { name: string; data: { attempt: number; gateMode: string; rerollCount: number } }
    assert.equal(sent.name, 'bulk/cross-stitch.idea')
    assert.equal(sent.data.attempt, 2)
    assert.equal(sent.data.gateMode, 'candidates', 're-rolls must stay in candidates mode')
    assert.equal(sent.data.rerollCount, 0)
  }

  // ── pale twice over: discarded, no second event ─────────────────────────────
  {
    const h = harness()
    const out = await run(
      h,
      deps(h, { result: { verdict: 'repair', tooPale: true, reasons: ['still too pale'] } }),
      2,
    )
    assert.equal(out.outcome, 'discarded')
    assert.deepEqual(h.ids, ['prepare', 'attempt', 'finish'], 'a spent idea does not pay for an event it will not send')
    assert.equal(h.events.length, 0)
    assert.deepEqual(h.writes[0]!.data.culled, { increment: 1 })
    assert.deepEqual(h.writes[0]!.data.paleSkips, { increment: 1 })
    assert.deepEqual(h.writes[0]!.data.killReasons, { push: 'still too pale' })
    assert.equal(h.writes[0]!.finalise, true)
  }

  // ── the daily Fal cap: nothing is generated, and the run still closes ───────
  {
    const h = harness()
    const out = await quiet(() => run(h, deps(h, { prep: { capped: 'daily generation cap reached' } })))
    assert.equal(out.outcome, 'skipped')
    assert.deepEqual(h.ids, ['prepare', 'finish'], 'a capped idea never reaches the generator')
    assert.deepEqual(h.writes[0]!.data.skipped, { increment: 1 })
    assert.equal(h.writes[0]!.finalise, true)
  }

  // ── a generation that fell over ─────────────────────────────────────────────
  {
    const h = harness()
    const out = await quiet(() => run(h, deps(h, { throws: true })))
    assert.equal(out.outcome, 'error')
    assert.deepEqual(h.ids, ['prepare', 'attempt', 'finish'])
    assert.deepEqual(h.writes[0]!.data.errors, { increment: 1 })
    assert.deepEqual(h.writes[0]!.data.generations, { increment: 1 }, 'a failed attempt still spent a generation')
    assert.equal(h.writes[0]!.finalise, true)
  }

  // ── the Pro tier is counted from the attempt, falling back to the prep read ─
  {
    const h = harness()
    await run(h, deps(h, { prep: { pro: true }, result: { parked: true, pro: true } }))
    assert.deepEqual(h.writes[0]!.data.proGenerations, { increment: 1 })

    const h2 = harness()
    await quiet(() => run(h2, deps(h2, { prep: { pro: true }, throws: true })))
    assert.deepEqual(h2.writes[0]!.data.proGenerations, { increment: 1 }, 'a Pro attempt that threw still cost a Pro generation')
  }

  // ── the vocabulary itself: no id may be spent that is not declared ──────────
  {
    const declared = new Set<string>(XS_CANDIDATE_STEP_IDS)
    const seen = new Set<string>()
    for (const opts of [
      { result: { parked: true } },
      { result: { verdict: 'kill' as const, duplicateOf: 'x' } },
      { result: { verdict: 'repair' as const, tooPale: true, reasons: ['pale'] } },
      { prep: { capped: 'capped' } },
      { throws: true },
    ]) {
      const h = harness()
      await quiet(() => run(h, deps(h, opts)))
      for (const id of h.ids) seen.add(id)
      assert.ok(h.ids.length <= XS_CANDIDATE_MAX_STEPS, `${h.ids.join(',')} is over the step ceiling`)
      assert.equal(h.ids[0], 'prepare', 'every path reads the spend cap before it spends')
    }
    for (const id of seen) assert.ok(declared.has(id), `${id} is spent but not declared in XS_CANDIDATE_STEP_IDS`)
    assert.deepEqual([...seen].sort(), [...XS_CANDIDATE_STEP_IDS].sort(), 'every declared id is reachable')
  }

  console.log('bulk-cross-stitch-candidate: step layout OK')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
