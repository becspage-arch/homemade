import 'server-only'
import { gateConfigured, visionGate, type GateResult } from '../vision-gate'
import { planCrossStitchBriefs, planNeedleworkBriefs, finaliseBriefs, dressedCount, PLANNER_MODE, type CrossStitchBrief, type NeedleworkBrief, type XsPlanContext } from './planner'
import {
  generateCrossStitchCandidate,
  publishCrossStitchGem,
  uploadRejectSample,
  type CandidateTweak,
  type RejectSample,
} from './cross-stitch'
import {
  fingerprintCandidate,
  loadPublicCrossStitchFingerprints,
  findDuplicate,
  liveShelfCounts,
  publicSubjectKeys,
} from './dedupe-guard'
import { judgeVividness } from './vividness'
import { crossStitchGateMode, type XsGateMode, type XsSourceMode } from './autopilot-state'
import { CROSS_STITCH_SHELVES } from '../categories'
import { summaryLine } from './run-status'
import { shelfDeficits, allocateShelves, capShelfBriefs, shelfSlots } from './shelf-plan'
import { setShelfCaps } from './subject-pool'
import {
  generateNeedleworkCandidate,
  publishNeedleworkGem,
  recentNeedleworkSlugs,
  fargateRenderWired,
} from './needlework'
import { crochetShelfPlan } from './crochet-planner'
import { liveCrochetShelfCounts, publicCrochetSubjectKeys } from './crochet-dedupe'

/**
 * The batch RUNNER — the craft-agnostic orchestrator the Inngest jobs call. One
 * firing = one batch: plan varied briefs → per candidate (generate → GATE →
 * repair/re-roll/cull → publish the gems) → a one-line summary.
 *
 * STEP-DRIVEN. Each unit of real work (planning, and every generate→gate→publish
 * ATTEMPT) runs inside its own `step.run`, so each is a separate short HTTP
 * request that Inngest orchestrates. This is load-bearing: the whole batch used
 * to run in ONE synchronous request and blew Cloudflare's ~100s proxy timeout
 * (HTTP 504) after publishing only a gem or two — the cause of the low, patchy
 * yield. Per-attempt steps keep every request small; the batch can then run for
 * many minutes across dozens of steps and actually finish. A local caller (a
 * server script / test) passes no step and everything runs inline.
 *
 * Nothing ships un-judged: if the gate isn't wired (ANTHROPIC_API_KEY unset) the
 * run is a clean no-op — it generates nothing rather than publish blind.
 */

export type Craft = 'cross-stitch' | 'needlework' | 'crochet'

// The run-completion predicate + the summary line live in `run-status.ts` (pure,
// unit-testable, no server-only deps) and are re-exported here so callers keep
// importing one module.
export { runIsComplete, summaryLine, type RunCounters } from './run-status'

/**
 * Minimal step runner — matches Inngest's `step.run(id, fn)`. Inline default so
 * the batch also runs outside Inngest (local scripts) with no orchestration.
 * Step results MUST be JSON-serialisable (Inngest memoises them), so every
 * attempt returns a small verdict object — never the render Buffer / PatternData.
 */
export interface StepRunner {
  run<T>(id: string, fn: () => Promise<T>): Promise<T>
}
const inlineStep: StepRunner = { run: (_id, fn) => fn() }

export interface BatchSummary {
  craft: Craft
  requested: number
  published: number
  culled: number
  /** Gate-passed candidates the publish-path duplicate guard refused. */
  duplicates: number
  /** Ideas that never generated (the trailing-24h Fal spend cap was hit). */
  skipped: number
  repaired: number
  /** Total candidate generations across the batch (best-of-N: >1 per idea). */
  generations: number
  /** Of those, how many used the Flux 1.1 Pro (dense) tier. */
  proGenerations: number
  /** Attempts the pale guard rejected before the vision gate was called. */
  paleSkips: number
  /** CANDIDATES MODE: ideas parked as UNLISTED candidates for a session to judge. */
  parked?: number
  /** Which gate judged this batch — 'candidates' (a session, later) or 'api'. */
  gateMode?: XsGateMode
  /** Model briefs the post-filter threw out for un-renderable props. */
  propRejects?: number
  /** Model briefs thrown out as a repeat of another brief in the same batch. */
  collisionRejects?: number
  /** Which planner wrote the briefs — free invention, or dressed pool subjects. */
  plannerMode?: string
  /** Of the briefs planned, how many re-dressed their pool subject. */
  dressedBriefs?: number
  errors: number
  /** Slugs of the gems that shipped. */
  gems: string[]
  /** The gate reasons that led to a cull — feeds the audit's top-kill aggregate. */
  killReasons: string[]
  /** One-line progress string for the audit log + admin history. */
  line: string
  /** Set when the batch could not run at all (gate/render not wired). Distinct
   *  from `skipped`, which counts ideas the spend cap stopped. */
  notRun?: string
}

/**
 * Best-of-N cap for cross-stitch: total Flux generations per idea before we cull.
 * Image generation is cheap and most gate 'kill's are a single unlucky roll of a
 * fine idea, so we take several fresh shots. Every shot still passes the identical
 * ruthless gate — this raises attempts-per-idea, never the bar.
 *
 * Raised from 4 to 6 in September 2026 (Rebecca's call) and kept there when the
 * Pro source mode was reverted on budget: in the one pro-all batch, three of the
 * four gems landed on attempt 3 and one on attempt 5, so a cap of four was
 * demonstrably throwing away work that a fifth roll would have found. Six shots
 * of schnell still costs a fraction of one Pro shot.
 */
export const MAX_XS_ATTEMPTS = 6
export const MAX_NW_REPAIRS = 1 // needlework re-rolls a Fargate render — keep repairs tight.

/** The lightweight, JSON-safe result of ONE generate→gate→(maybe publish) attempt. */
export interface AttemptResult {
  verdict: GateResult['verdict']
  reasons: string[]
  repairAction?: GateResult['repairAction']
  published: boolean
  /**
   * Set when the gate KEPT the candidate but the publish-path duplicate guard
   * refused it: the slug it duplicates. TERMINAL — the idea is never re-rolled,
   * because a duplicate means the idea itself was already made and a fresh roll
   * of the same idea is another duplicate. Nothing was written.
   */
  duplicateOf?: string
  duplicateReason?: string
  /** True when this attempt generated on the Flux 1.1 Pro (dense) tier. */
  pro?: boolean
  /** True when the deterministic pale guard rejected it before the vision gate. */
  tooPale?: boolean
  /**
   * CANDIDATES MODE: the candidate was parked as an UNLISTED row for a Claude
   * session to judge. Terminal for the run — nothing more will happen to this
   * idea inside the autopilot.
   */
  parked?: boolean
  /**
   * The render this attempt threw away, kept in R2 so a person can see what the
   * gate killed. Set only on a terminal cull and on a pale skip — the two
   * outcomes that leave no other trace. JSON-safe (a URL, not a Buffer), so it
   * travels through an Inngest step result intact.
   */
  rejectSample?: RejectSample
}

/**
 * A 'kill' that a fresh re-roll genuinely can't fix — the fault is in the IDEA,
 * not this roll of it. Same subject → same readable text, same IP-risk, same
 * near-duplicate every time, so re-rolling just burns generations. Everything
 * else (malformed/blobby/off-subject/washed-out/anatomy) is exactly what a fresh
 * stochastic roll usually fixes, so it earns another shot.
 */
export function killIsUnrerollable(reasons: string[]): boolean {
  const text = reasons.join(' ').toLowerCase()
  return (
    /\b(text|letter|lettering|word|words|wording|signage|caption|typograph|spelled|writing|script)\b/.test(text) ||
    /\b(ip|brand|branded|celebrity|franchise|copyright|copyrighted|trademark|logo|licen[cs]|recognis|recogniz)\w*/.test(text) ||
    /\b(duplicate|near-dup|near dup|too similar|already kept|same as)\w*/.test(text)
  )
}

/**
 * Is this the LAST word on the idea, or will it be re-rolled?
 *
 * Mirrors the re-roll condition the runner and the Inngest idea worker both
 * apply, and exists so `crossStitchAttempt` can answer it while it still holds
 * the render: a terminal cull is the one moment worth keeping the picture, and
 * by the time the caller decides, the Buffer is gone.
 */
export function attemptIsTerminal(verdict: GateResult['verdict'], reasons: string[], attempt: number): boolean {
  if (verdict === 'keep') return true
  if (attempt >= MAX_XS_ATTEMPTS) return true
  return verdict === 'kill' && killIsUnrerollable(reasons)
}

export function tweakFor(action: GateResult['repairAction']): CandidateTweak {
  switch (action) {
    case 'more-saturation':
      return { satMul: 1.15 }
    case 'more-colours':
      return { colourDelta: 8 }
    case 'fewer-colours':
      return { colourDelta: -8 }
    default:
      return {} // reroll / re-centre — a fresh stochastic generation is the fix.
  }
}

// ─────────────────────────── CROSS-STITCH ───────────────────────────

/**
 * One cross-stitch attempt: generate → gate → DUPLICATE GUARD → publish. The
 * render Buffer never leaves this function (step results must stay small).
 *
 * The guard between the gate and the publish is the whole point of the September
 * 2026 hardening: the gate can only see the subjects kept in the same batch, so
 * it has no idea whether this candidate repeats something published in July. The
 * guard compares the candidate's image, chart AND subject fingerprints against
 * every PUBLIC cross-stitch pattern, and a hit is terminal.
 */
/**
 * Keep one killed render, if this attempt belongs to a recorded run. A local
 * inline run has no `BulkRun` row and so nowhere to hang the sample — it simply
 * skips the upload rather than filling R2 with orphans.
 */
async function sampleFor(
  renderPng: Buffer,
  brief: CrossStitchBrief,
  ctx: { bulkRunId?: string | null; attempt?: number },
  verdict: string,
  reasons: string[],
  colours: number,
): Promise<{ rejectSample?: RejectSample }> {
  if (!ctx.bulkRunId) return {}
  const sample = await uploadRejectSample(renderPng, brief, {
    runId: ctx.bulkRunId,
    attempt: ctx.attempt ?? 1,
    verdict,
    reasons,
    colours,
  })
  return sample ? { rejectSample: sample } : {}
}

export async function crossStitchAttempt(
  brief: CrossStitchBrief,
  tweak: CandidateTweak,
  keptSubjects: string[],
  ctx: { bulkRunId?: string | null; attempt?: number; sourceMode?: XsSourceMode } = {},
): Promise<AttemptResult> {
  const candidate = await generateCrossStitchCandidate(brief, tweak, ctx.sourceMode)

  // ── the pale guard, BEFORE the gate ──────────────────────────────────────
  // Arithmetic, not judgement. A washed-out render reads as "soft and pretty" to
  // a vision model and as nothing at all in floss, and it is the fault this
  // catalogue keeps shipping. Measuring it is cheap, repeatable and impossible
  // to talk round, so it happens first — and a piece we already know is too pale
  // never costs a gate call.
  // Judged against its own shelf: the monochrome shelf and the two-tone style
  // lanes carry on tone alone, every other shelf has to carry colour too.
  const vivid = await judgeVividness(candidate.renderPng, undefined, { shelf: brief.shelf, style: brief.style })
  if (vivid.tooPale) {
    return {
      verdict: 'repair',
      reasons: [vivid.reason],
      repairAction: 'more-saturation',
      published: false,
      pro: candidate.pro,
      tooPale: true,
      // Every pale skip keeps its render: the pale floor is arithmetic, and
      // arithmetic can only be re-calibrated against the pictures it rejected.
      ...(await sampleFor(candidate.renderPng, brief, ctx, 'repair', [vivid.reason], candidate.colourCount)),
    }
  }

  const verdict = await visionGate(candidate.renderPng, {
    subject: brief.subject,
    craft: 'cross-stitch',
    colours: candidate.colourCount,
    keptSubjects,
  })
  if (verdict.verdict !== 'keep') {
    // Keep the render only when this is the idea's LAST attempt — an attempt
    // that will be re-rolled is not what killed the idea.
    const terminal = attemptIsTerminal(verdict.verdict, verdict.reasons, ctx.attempt ?? 1)
    return {
      verdict: verdict.verdict,
      reasons: verdict.reasons,
      repairAction: verdict.repairAction,
      published: false,
      pro: candidate.pro,
      ...(terminal ? await sampleFor(candidate.renderPng, brief, ctx, verdict.verdict, verdict.reasons, candidate.colourCount) : {}),
    }
  }

  // Gate says gem. Now: is it a gem we already have?
  const fingerprints = await fingerprintCandidate(candidate.renderPng, candidate.data, brief.subject)
  const catalogue = await loadPublicCrossStitchFingerprints()
  const hit = findDuplicate(fingerprints, catalogue)
  if (hit) {
    return {
      verdict: 'keep',
      reasons: [`duplicate of ${hit.slug}: ${hit.reason}`],
      published: false,
      duplicateOf: hit.slug,
      duplicateReason: hit.reason,
      pro: candidate.pro,
    }
  }

  await publishCrossStitchGem(brief, candidate, {
    fingerprints,
    gate: { verdict: verdict.verdict, reasons: verdict.reasons },
    bulkRunId: ctx.bulkRunId ?? null,
    attempt: ctx.attempt ?? 1,
    tweak,
  })
  return { verdict: 'keep', reasons: verdict.reasons, published: true, pro: candidate.pro }
}

// ───────────────────── CROSS-STITCH: the candidates gate mode ─────────────────

/**
 * How many generations ONE idea gets in candidates mode.
 *
 * Two, and only for one reason: a pale render gets a single saturation re-roll,
 * because the pale floor is arithmetic and a boosted re-roll fixes it about half
 * the time. Everything else gets exactly ONE shot. Best-of-six existed to feed a
 * ruthless per-attempt vision gate; here the judging is a person looking at a
 * contact sheet, and the honest way to raise yield is to park more ideas rather
 * than to roll one idea six times against a judge that is not there yet.
 */
export const MAX_XS_CANDIDATE_ATTEMPTS = 2

/**
 * ONE candidate attempt with NO API CALL ANYWHERE ON THE PATH.
 *
 * generate → bare-fabric clearing (inside the generator) → the pale guard →
 * the duplicate guard against the whole public catalogue AND the pending
 * parking bay → park as an UNLISTED `Pattern` with `candidateStatus 'PENDING'`.
 *
 * The differences from `crossStitchAttempt` are the whole point of the mode:
 * `visionGate` is never called, so nothing here reaches `anthropic.ts`; the
 * duplicate guard also sees the candidates already waiting to be judged, so two
 * firings cannot park the same idea twice; and a pale render that comes back
 * pale after its one re-roll is DISCARDED with its render kept as a reject
 * sample, because the pale floor is the one bar this path can still enforce on
 * its own.
 */
export async function crossStitchCandidateAttempt(
  brief: CrossStitchBrief,
  tweak: CandidateTweak,
  ctx: { bulkRunId?: string | null; attempt?: number; sourceMode?: XsSourceMode; rerollCount?: number } = {},
): Promise<AttemptResult> {
  const attempt = ctx.attempt ?? 1
  const candidate = await generateCrossStitchCandidate(brief, tweak, ctx.sourceMode)

  // The pale guard — arithmetic, and the only quality bar left on this path.
  const vivid = await judgeVividness(candidate.renderPng, undefined, { shelf: brief.shelf, style: brief.style })
  if (vivid.tooPale) {
    const lastShot = attempt >= MAX_XS_CANDIDATE_ATTEMPTS
    return {
      // One saturation re-roll, then the idea is discarded rather than parked:
      // asking a session to look at a render we already know is unstitchable
      // wastes the only judging capacity there is.
      verdict: lastShot ? 'kill' : 'repair',
      reasons: [vivid.reason],
      ...(lastShot ? {} : { repairAction: 'more-saturation' as const }),
      published: false,
      pro: candidate.pro,
      tooPale: true,
      ...(await sampleFor(candidate.renderPng, brief, ctx, lastShot ? 'kill' : 'repair', [vivid.reason], candidate.colourCount)),
    }
  }

  // Is this a gem we already have — or one already sitting in the parking bay?
  const fingerprints = await fingerprintCandidate(candidate.renderPng, candidate.data, brief.subject)
  const catalogue = await loadPublicCrossStitchFingerprints({ includePending: true })
  const hit = findDuplicate(fingerprints, catalogue)
  if (hit) {
    return {
      verdict: 'kill',
      reasons: [`duplicate of ${hit.slug}: ${hit.reason}`],
      published: false,
      duplicateOf: hit.slug,
      duplicateReason: hit.reason,
      pro: candidate.pro,
    }
  }

  await publishCrossStitchGem(brief, candidate, {
    fingerprints,
    // No gate ran, and the row says so rather than claiming a keep it never got.
    gate: { verdict: 'keep', reasons: ['parked for session judging — no API gate'] },
    bulkRunId: ctx.bulkRunId ?? null,
    attempt,
    tweak,
    park: true,
    rerollCount: ctx.rerollCount ?? 0,
  })
  return { verdict: 'keep', reasons: [], published: false, parked: true, pro: candidate.pro }
}

/**
 * The candidates-mode planner: the POOL SAMPLER ONLY.
 *
 * `finaliseBriefs` with an empty model list is exactly the fallback path the
 * dispatcher already runs when the planner model times out — deficit-weighted
 * shelves, lane tags, the text-risk rule, the prop rule and the within-batch
 * collision rule all unchanged. It simply never makes the model call, which is
 * the one thing this mode is for.
 */
export function planCrossStitchCandidateBriefs(count: number, ctx: XsPlanContext = {}): CrossStitchBrief[] {
  return finaliseBriefs([], count, ctx)
}

/**
 * The planning context for one batch: the whole catalogue as an avoid list, and
 * a shelf quota drawn in proportion to each shelf's gap to its target. Shared by
 * the inline runner and the Inngest dispatcher so both plan identically.
 */
export async function crossStitchPlanContext(count: number): Promise<Parameters<typeof planCrossStitchBriefs>[1]> {
  const [counts, avoidSubjectKeys] = await Promise.all([
    liveShelfCounts().catch(() => ({}) as Record<string, number>),
    publicSubjectKeys().catch(() => [] as string[]),
  ])
  const deficits = shelfDeficits(CROSS_STITCH_SHELVES, counts)
  // Cap any one shelf at its share of the batch. A shelf far behind its target
  // otherwise takes three or four slots at once and the batch turns into three
  // variations on one idea — which is how batch 6 planned three celestial pieces,
  // two of them the same composition.
  // Set shelves (small makes) may take several slots at once — the pool's own
  // `setOf` tags say which, so the cap follows the pool rather than a second list.
  const alloc = capShelfBriefs(allocateShelves(deficits, count), count, setShelfCaps())
  return {
    avoidSubjectKeys,
    shelfSlots: shelfSlots(alloc),
    shelfQuota: alloc.map((a) => ({ slug: a.slug, name: a.name, briefs: a.briefs, deficit: a.deficit })),
  }
}

export async function runCrossStitchBatch(count: number, step: StepRunner = inlineStep): Promise<BatchSummary> {
  const gateMode = await crossStitchGateMode()
  const base: BatchSummary = { craft: 'cross-stitch', requested: count, published: 0, culled: 0, duplicates: 0, skipped: 0, repaired: 0, generations: 0, proGenerations: 0, paleSkips: 0, parked: 0, gateMode, errors: 0, gems: [], killReasons: [], line: '' }
  // In candidates mode there is no API gate to be wired: the judging happens in
  // a Claude Code session afterwards, so a missing key is not a reason to
  // generate nothing. In 'api' mode it is exactly that, unchanged.
  if (gateMode === 'api' && !gateConfigured()) {
    return { ...base, notRun: 'gate-not-wired', line: 'cross-stitch batch skipped — ANTHROPIC_API_KEY not set, refusing to publish un-gated' }
  }
  if (gateMode === 'candidates') return runCrossStitchCandidateBatch(count, step, base)

  const plan = await step.run('xs-plan', async () => {
    const ctx = await crossStitchPlanContext(count)
    return planCrossStitchBriefs(count, ctx)
  })
  const briefs = plan.briefs
  base.propRejects = plan.propRejects
  base.collisionRejects = plan.collisionRejects
  base.plannerMode = PLANNER_MODE
  base.dressedBriefs = dressedCount(briefs)
  const keptSubjects: string[] = []

  for (const brief of briefs) {
    try {
      // Best-of-N: take up to MAX_XS_ATTEMPTS fresh shots at this idea, each its
      // own step. A 'repair' re-rolls with a cosmetic tweak; a re-rollable 'kill'
      // re-rolls fresh; a kill the idea can't survive (text/IP/near-dup) culls.
      let tweak: CandidateTweak = {}
      let last: AttemptResult | null = null
      let publishedThis = false
      let duplicated = false
      for (let attempt = 1; attempt <= MAX_XS_ATTEMPTS; attempt++) {
        base.generations++
        const tweakForStep = tweak
        const attemptNo = attempt
        last = await step.run(`xs-${brief.slug}-a${attempt}`, () =>
          crossStitchAttempt(brief, tweakForStep, keptSubjects, { attempt: attemptNo }),
        )
        if (last.pro) base.proGenerations++
        if (last.tooPale) base.paleSkips++
        if (last.duplicateOf) {
          // TERMINAL. The idea itself is the duplicate — re-rolling it just
          // generates the same collision again.
          base.duplicates++
          base.killReasons.push(`duplicate of ${last.duplicateOf}`)
          duplicated = true
          break
        }
        if (last.verdict === 'keep' && last.published) {
          keptSubjects.push(brief.subject)
          base.gems.push(brief.slug)
          base.published++
          publishedThis = true
          break
        }
        if (attempt >= MAX_XS_ATTEMPTS) break // out of shots — cull below
        if (last.verdict === 'repair') {
          base.repaired++
          tweak = tweakFor(last.repairAction)
          continue
        }
        // verdict === 'kill'
        if (killIsUnrerollable(last.reasons)) break // re-roll can't save it — cull
        tweak = {} // a bad roll of a fine idea — take a fresh stochastic shot
      }
      if (!publishedThis && !duplicated && last && last.verdict !== 'keep') {
        base.culled++
        base.killReasons.push(...last.reasons)
      }
    } catch (err) {
      base.errors++
      console.error(`[bulk cross-stitch] ${brief.slug} failed`, err)
    }
  }

  base.line = summaryLine(base)
  return base
}

/**
 * The candidates-mode batch: plan from the pool, generate ONE candidate an idea,
 * park what survives the deterministic guards. Zero API calls, start to finish.
 *
 * COST. Twelve ideas of Flux schnell at about $0.003 each, plus the one dense
 * showpiece on Flux 1.1 Pro at about $0.032, plus the odd pale re-roll: roughly
 * $0.07 a firing, twelve firings a day — call it £0.60 a day, and well inside
 * the daily generation cap in `spend-guard.ts`. Nothing else is spent, because
 * nothing else is called.
 */
async function runCrossStitchCandidateBatch(
  count: number,
  step: StepRunner,
  base: BatchSummary,
): Promise<BatchSummary> {
  const briefs = await step.run('xs-plan-candidates', async () => {
    const ctx = await crossStitchPlanContext(count)
    return planCrossStitchCandidateBriefs(count, ctx)
  })
  base.plannerMode = PLANNER_MODE
  base.dressedBriefs = dressedCount(briefs)

  for (const brief of briefs) {
    try {
      let tweak: CandidateTweak = {}
      let last: AttemptResult | null = null
      let settled = false
      for (let attempt = 1; attempt <= MAX_XS_CANDIDATE_ATTEMPTS; attempt++) {
        base.generations++
        const tweakForStep = tweak
        const attemptNo = attempt
        last = await step.run(`xs-cand-${brief.slug}-a${attempt}`, () =>
          crossStitchCandidateAttempt(brief, tweakForStep, { attempt: attemptNo }),
        )
        if (last.pro) base.proGenerations++
        if (last.tooPale) base.paleSkips++
        if (last.duplicateOf) {
          base.duplicates++
          base.killReasons.push(`duplicate of ${last.duplicateOf}`)
          settled = true
          break
        }
        if (last.parked) {
          base.parked = (base.parked ?? 0) + 1
          base.gems.push(brief.slug)
          settled = true
          break
        }
        // Only a pale render earns a second shot, and only its one.
        if (last.verdict === 'repair' && attempt < MAX_XS_CANDIDATE_ATTEMPTS) {
          base.repaired++
          tweak = tweakFor(last.repairAction)
          continue
        }
        break
      }
      if (!settled && last) {
        base.culled++
        base.killReasons.push(...last.reasons)
      }
    } catch (err) {
      base.errors++
      console.error(`[bulk cross-stitch candidates] ${brief.slug} failed`, err)
    }
  }

  base.line = summaryLine(base)
  return base
}

// ─────────────────────────── NEEDLEWORK ───────────────────────────

/** One needlework attempt: Flux → convert → loom render → gate → publish on 'keep'. */
async function needleworkAttempt(
  brief: NeedleworkBrief,
  keptSubjects: string[],
): Promise<AttemptResult> {
  const candidate = await generateNeedleworkCandidate(brief)
  return needleworkGateAndPublish(brief, candidate, keptSubjects)
}

/**
 * Everything a needlework candidate goes through AFTER its hero exists: the
 * vision gate and, on 'keep', the publisher.
 *
 * Split out for the same reason crochet's is — the server-side autopilot renders
 * asynchronously, starting the Fargate task in one request and coming back for
 * the picture in a later one, and both paths must judge and publish through
 * exactly the same code.
 */
export async function needleworkGateAndPublish(
  brief: NeedleworkBrief,
  candidate: Awaited<ReturnType<typeof generateNeedleworkCandidate>>,
  keptSubjects: string[],
): Promise<AttemptResult> {
  const verdict = await visionGate(candidate.heroPng, {
    subject: brief.subject,
    craft: 'needlework',
    colours: candidate.conversion.colourCount,
    keptSubjects,
  })
  if (verdict.verdict === 'keep') {
    await publishNeedleworkGem(brief, candidate)
    return { verdict: 'keep', reasons: verdict.reasons, published: true }
  }
  return { verdict: verdict.verdict, reasons: verdict.reasons, published: false }
}

export async function runNeedleworkBatch(count: number, step: StepRunner = inlineStep): Promise<BatchSummary> {
  const base: BatchSummary = { craft: 'needlework', requested: count, published: 0, culled: 0, duplicates: 0, skipped: 0, repaired: 0, generations: 0, proGenerations: 0, paleSkips: 0, errors: 0, gems: [], killReasons: [], line: '' }
  if (!gateConfigured()) {
    return { ...base, notRun: 'gate-not-wired', line: 'needlework batch skipped — ANTHROPIC_API_KEY not set, refusing to publish un-gated' }
  }
  if (!fargateRenderWired()) {
    return { ...base, notRun: 'render-not-wired', line: 'needlework batch skipped — LOOM_RENDER!=fargate, hero render not wired' }
  }

  const briefs = await step.run('nw-plan', async () => {
    const recent = await recentNeedleworkSlugs().catch(() => [])
    return planNeedleworkBriefs(count, recent)
  })
  const keptSubjects: string[] = []

  // Needlework re-rolls an expensive Fargate render, so its repair cap stays
  // tight (no best-of-N): a 'kill' culls immediately.
  for (const brief of briefs) {
    try {
      let last: AttemptResult | null = null
      let publishedThis = false
      for (let attempt = 0; attempt <= MAX_NW_REPAIRS; attempt++) {
        base.generations++
        last = await step.run(`nw-${brief.slug}-a${attempt}`, () => needleworkAttempt(brief, keptSubjects))
        if (last.verdict === 'keep') {
          keptSubjects.push(brief.subject)
          base.gems.push(brief.slug)
          base.published++
          publishedThis = true
          break
        }
        if (last.verdict === 'repair' && attempt < MAX_NW_REPAIRS) {
          base.repaired++
          continue // a fresh render is the only repair we run for needlework.
        }
        break
      }
      if (!publishedThis && last && last.verdict !== 'keep') {
        base.culled++
        base.killReasons.push(...last.reasons)
      }
    } catch (err) {
      base.errors++
      console.error(`[bulk needlework] ${brief.slug} failed`, err)
    }
  }

  base.line = summaryLine(base)
  return base
}

// ─────────────────────────── CROCHET ───────────────────────────
//
// Crochet has no batch runner here any more. Its three model calls — the
// planner, the design author and the vision gate — were Anthropic API calls,
// and under Rebecca's standing rule that work runs inside a Claude session on
// her Max plan instead. The lane is now `apps/web/scripts/crochet-autopilot.ts`,
// driven by the routine prompt in `docs/autopilot-prompts/crochet.md`: the
// session plans and authors, the CLI expands, audits, renders and publishes,
// and the session judges the contact sheets in between.
//
// What survives here is the DETERMINISTIC planning context, because the shelf
// quota and the avoid list are catalogue arithmetic and belong with the other
// crafts' equivalents.

/**
 * The planning context for one crochet batch: the whole catalogue as an avoid
 * list, and a shelf quota drawn in proportion to each BUILDABLE shelf's gap to
 * its target.
 */
export async function crochetPlanContext(count: number): Promise<{
  counts: Record<string, number>
  avoidSubjectKeys: string[]
  shelfSlots: string[]
  shelfQuota: { slug: string; name: string; briefs: number; deficit: number }[]
}> {
  const [counts, avoidSubjectKeys] = await Promise.all([
    liveCrochetShelfCounts().catch(() => ({}) as Record<string, number>),
    publicCrochetSubjectKeys().catch(() => [] as string[]),
  ])
  const plan = crochetShelfPlan(counts, count)
  return { counts, avoidSubjectKeys, shelfSlots: plan.slots, shelfQuota: plan.quota }
}

export async function runBatch(craft: Craft, count: number, step: StepRunner = inlineStep): Promise<BatchSummary> {
  if (craft === 'needlework') return runNeedleworkBatch(count, step)
  if (craft === 'crochet') {
    throw new Error(
      'runBatch("crochet"): crochet is filled by a Claude routine, not by a batch runner — see docs/autopilot-prompts/crochet.md and apps/web/scripts/crochet-autopilot.ts',
    )
  }
  return runCrossStitchBatch(count, step)
}
