import 'server-only'
import { gateConfigured, visionGate, type GateResult } from '../vision-gate'
import { planCrossStitchBriefs, planNeedleworkBriefs, dressedCount, PLANNER_MODE, type CrossStitchBrief, type NeedleworkBrief } from './planner'
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
import type { XsSourceMode } from './autopilot-state'
import { CROSS_STITCH_SHELVES } from '../categories'
import { summaryLine } from './run-status'
import { shelfDeficits, allocateShelves, capShelfBriefs, shelfSlots } from './shelf-plan'
import {
  generateNeedleworkCandidate,
  publishNeedleworkGem,
  recentNeedleworkSlugs,
  fargateRenderWired,
} from './needlework'
import { planCrochetBriefs, crochetShelfPlan, modelAuthoredCount, type CrochetBrief } from './crochet-planner'
import {
  generateCrochetCandidate,
  publishCrochetGem,
  paletteHexesFor,
  fargateRenderWired as crochetRenderWired,
  findCrochetDuplicate,
  loadCrochetCatalogue,
  CrochetIncompleteError,
} from './crochet'
import { liveCrochetShelfCounts, publicCrochetSubjectKeys } from './crochet-dedupe'
import { crochetSpendWindow, overCrochetCap } from './spend-guard'

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
  const alloc = capShelfBriefs(allocateShelves(deficits, count), count)
  return {
    avoidSubjectKeys,
    shelfSlots: shelfSlots(alloc),
    shelfQuota: alloc.map((a) => ({ slug: a.slug, name: a.name, briefs: a.briefs, deficit: a.deficit })),
  }
}

export async function runCrossStitchBatch(count: number, step: StepRunner = inlineStep): Promise<BatchSummary> {
  const base: BatchSummary = { craft: 'cross-stitch', requested: count, published: 0, culled: 0, duplicates: 0, skipped: 0, repaired: 0, generations: 0, proGenerations: 0, paleSkips: 0, errors: 0, gems: [], killReasons: [], line: '' }
  if (!gateConfigured()) {
    return { ...base, notRun: 'gate-not-wired', line: 'cross-stitch batch skipped — ANTHROPIC_API_KEY not set, refusing to publish un-gated' }
  }

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

/**
 * Crochet's repair budget. Unlike a Flux roll, a crochet render is
 * DETERMINISTIC: the same program renders the same image every time, so
 * re-rolling a fault in the object is pointless. The one thing a fresh attempt
 * can fix is the DESIGN, so a repair here means "author a different design for
 * the same brief and render that". One, and only one.
 */
export const MAX_CROCHET_REPAIRS = 1

/**
 * One crochet attempt: author a program → render its exact hero on Fargate,
 * unpersisted → gate the render → duplicate guard → publish a complete row.
 *
 * Nothing is written before the gate says keep, so a killed candidate leaves no
 * row and nothing in R2. After the gate, the completeness gate runs against the
 * assembled row and a row that fails it is culled rather than published.
 */
export async function crochetAttempt(
  brief: CrochetBrief,
  keptSubjects: string[],
  ctx: { bulkRunId?: string | null; attempt?: number } = {},
): Promise<AttemptResult> {
  const candidate = await generateCrochetCandidate(brief, paletteHexesFor(brief.brief.palette))
  return crochetGateAndPublish(brief, candidate, keptSubjects, ctx)
}

/**
 * Everything a crochet candidate goes through AFTER its hero exists: the vision
 * gate, the duplicate guard, and the publisher with its completeness gate.
 *
 * Split out because the server-side autopilot renders asynchronously — it
 * starts the Fargate task in one request and comes back for the picture in a
 * later one — and both paths must judge and publish through exactly the same
 * code. The inline runner above hands it a candidate it just rendered; the
 * Inngest idea worker hands it one it fetched back out of the scratch bucket.
 */
export async function crochetGateAndPublish(
  brief: CrochetBrief,
  candidate: Awaited<ReturnType<typeof generateCrochetCandidate>>,
  keptSubjects: string[],
  ctx: { bulkRunId?: string | null; attempt?: number } = {},
): Promise<AttemptResult> {
  const verdict = await visionGate(candidate.heroPng, {
    subject: `${brief.name}: ${brief.subject}`,
    craft: 'crochet',
    keptSubjects,
  })
  if (verdict.verdict !== 'keep') {
    return {
      verdict: verdict.verdict,
      reasons: verdict.reasons,
      repairAction: verdict.repairAction,
      published: false,
    }
  }

  // The gate says gem. Is it a gem the catalogue already has, by idea or by
  // construction? A hit is terminal.
  const catalogue = await loadCrochetCatalogue()
  const hit = findCrochetDuplicate(
    { subjectKey: brief.subjectKey, programFingerprint: candidate.fingerprint },
    catalogue,
  )
  if (hit) {
    return {
      verdict: 'keep',
      reasons: [`duplicate of ${hit.slug}: ${hit.reason}`],
      published: false,
      duplicateOf: hit.slug,
      duplicateReason: hit.reason,
    }
  }

  try {
    await publishCrochetGem(brief, candidate, {
      bulkRunId: ctx.bulkRunId ?? null,
      gate: { verdict: verdict.verdict, reasons: verdict.reasons },
      attempt: ctx.attempt ?? 1,
    })
  } catch (err) {
    // A row that fails the completeness gate is CULLED, not published with a
    // flag and not held for review. It reads as a kill in the run counters,
    // with the gate's own reasons, so a systematic gap shows up in the log.
    if (err instanceof CrochetIncompleteError) {
      return { verdict: 'kill', reasons: err.result.reasons.slice(0, 3), published: false }
    }
    throw err
  }
  return { verdict: 'keep', reasons: verdict.reasons, published: true }
}

/**
 * The planning context for one crochet batch: the whole catalogue as an avoid
 * list, and a shelf quota drawn in proportion to each BUILDABLE shelf's gap to
 * its target. Shared by the inline runner and the Inngest dispatcher so both
 * plan identically.
 */
export async function crochetPlanContext(count: number): Promise<Parameters<typeof planCrochetBriefs>[1]> {
  const [counts, avoidSubjectKeys] = await Promise.all([
    liveCrochetShelfCounts().catch(() => ({}) as Record<string, number>),
    publicCrochetSubjectKeys().catch(() => [] as string[]),
  ])
  const plan = crochetShelfPlan(counts, count)
  return { avoidSubjectKeys, shelfSlots: plan.slots, shelfQuota: plan.quota }
}

export async function runCrochetBatch(count: number, step: StepRunner = inlineStep): Promise<BatchSummary> {
  const base: BatchSummary = { craft: 'crochet', requested: count, published: 0, culled: 0, duplicates: 0, skipped: 0, repaired: 0, generations: 0, proGenerations: 0, paleSkips: 0, errors: 0, gems: [], killReasons: [], line: '' }
  if (!gateConfigured()) {
    return { ...base, notRun: 'gate-not-wired', line: 'crochet batch skipped — ANTHROPIC_API_KEY not set, refusing to publish un-gated' }
  }
  if (!crochetRenderWired()) {
    return { ...base, notRun: 'render-not-wired', line: 'crochet batch skipped — LOOM_RENDER!=fargate, the exact-pattern hero render is not wired' }
  }

  const briefs = await step.run('cr-plan', async () => {
    const ctx = await crochetPlanContext(count)
    return planCrochetBriefs(count, ctx)
  })
  base.plannerMode = PLANNER_MODE
  // For crochet these are the same number: a brief the planner model wrote is
  // by definition one it dressed, because constrained mode is the only mode
  // that produces one.
  base.dressedBriefs = modelAuthoredCount(briefs)
  const keptSubjects: string[] = []

  for (const brief of briefs) {
    try {
      // The spend cap at the point of spending. A crochet idea costs a Fargate
      // task; the pictorial lane costs an illustration on top.
      const capped = await step.run(`cr-${brief.slug}-cap`, async () => {
        const window = await crochetSpendWindow()
        return overCrochetCap(window, { illustration: brief.treatment === 'grid-tapestry' })
      })
      if (capped) {
        base.skipped++
        console.warn(`[bulk crochet] ${brief.slug} skipped — ${capped}`)
        continue
      }

      let last: AttemptResult | null = null
      let publishedThis = false
      let duplicated = false
      for (let attempt = 1; attempt <= MAX_CROCHET_REPAIRS + 1; attempt++) {
        base.generations++
        if (brief.treatment === 'grid-tapestry') base.proGenerations++
        const attemptNo = attempt
        last = await step.run(`cr-${brief.slug}-a${attempt}`, () =>
          crochetAttempt(brief, keptSubjects, { attempt: attemptNo }),
        )
        if (last.duplicateOf) {
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
        // Only a staging fault earns a second render; anything about the object
        // itself is terminal, because the geometry is deterministic.
        if (last.verdict === 'repair' && attempt <= MAX_CROCHET_REPAIRS) {
          base.repaired++
          continue
        }
        break
      }
      if (!publishedThis && !duplicated && last && !last.published) {
        base.culled++
        base.killReasons.push(...last.reasons)
      }
    } catch (err) {
      base.errors++
      console.error(`[bulk crochet] ${brief.slug} failed`, err)
    }
  }

  base.line = summaryLine({ ...base, modelBriefs: base.dressedBriefs })
  return base
}

export async function runBatch(craft: Craft, count: number, step: StepRunner = inlineStep): Promise<BatchSummary> {
  if (craft === 'needlework') return runNeedleworkBatch(count, step)
  if (craft === 'crochet') return runCrochetBatch(count, step)
  return runCrossStitchBatch(count, step)
}
