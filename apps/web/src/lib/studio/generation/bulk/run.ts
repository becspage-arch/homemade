import 'server-only'
import { gateConfigured, visionGate, type GateResult } from '../vision-gate'
import { planCrossStitchBriefs, planNeedleworkBriefs } from './planner'
import {
  generateCrossStitchCandidate,
  publishCrossStitchGem,
  recentCrossStitchSlugs,
  type CandidateTweak,
} from './cross-stitch'
import {
  generateNeedleworkCandidate,
  publishNeedleworkGem,
  recentNeedleworkSlugs,
  fargateRenderWired,
} from './needlework'

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

export type Craft = 'cross-stitch' | 'needlework'

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
  repaired: number
  /** Total candidate generations across the batch (best-of-N: >1 per idea). */
  generations: number
  errors: number
  /** Slugs of the gems that shipped. */
  gems: string[]
  /** The gate reasons that led to a cull — feeds the audit's top-kill aggregate. */
  killReasons: string[]
  /** One-line progress string for the audit log + admin history. */
  line: string
  /** Set when the batch could not run at all (gate/render not wired). */
  skipped?: string
}

/**
 * Best-of-N cap for cross-stitch: total Flux generations per idea before we cull.
 * Image generation is cheap and most gate 'kill's are a single unlucky roll of a
 * fine idea, so we take several fresh shots. Every shot still passes the identical
 * ruthless gate — this raises attempts-per-idea, never the bar.
 */
const MAX_XS_ATTEMPTS = 4
const MAX_NW_REPAIRS = 1 // needlework re-rolls a Fargate render — keep repairs tight.

/** The lightweight, JSON-safe result of ONE generate→gate→(maybe publish) attempt. */
interface AttemptResult {
  verdict: GateResult['verdict']
  reasons: string[]
  repairAction?: GateResult['repairAction']
  published: boolean
}

/**
 * A 'kill' that a fresh re-roll genuinely can't fix — the fault is in the IDEA,
 * not this roll of it. Same subject → same readable text, same IP-risk, same
 * near-duplicate every time, so re-rolling just burns generations. Everything
 * else (malformed/blobby/off-subject/washed-out/anatomy) is exactly what a fresh
 * stochastic roll usually fixes, so it earns another shot.
 */
function killIsUnrerollable(reasons: string[]): boolean {
  const text = reasons.join(' ').toLowerCase()
  return (
    /\b(text|letter|lettering|word|words|wording|signage|caption|typograph|spelled|writing|script)\b/.test(text) ||
    /\b(ip|brand|branded|celebrity|franchise|copyright|copyrighted|trademark|logo|licen[cs]|recognis|recogniz)\w*/.test(text) ||
    /\b(duplicate|near-dup|near dup|too similar|already kept|same as)\w*/.test(text)
  )
}

function tweakFor(action: GateResult['repairAction']): CandidateTweak {
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

/** One cross-stitch attempt: generate → gate → publish on 'keep'. Buffer stays local. */
async function crossStitchAttempt(
  brief: Awaited<ReturnType<typeof planCrossStitchBriefs>>[number],
  tweak: CandidateTweak,
  keptSubjects: string[],
): Promise<AttemptResult> {
  const candidate = await generateCrossStitchCandidate(brief, tweak)
  const verdict = await visionGate(candidate.renderPng, {
    subject: brief.subject,
    craft: 'cross-stitch',
    colours: candidate.colourCount,
    keptSubjects,
  })
  if (verdict.verdict === 'keep') {
    await publishCrossStitchGem(brief, candidate)
    return { verdict: 'keep', reasons: verdict.reasons, published: true }
  }
  return { verdict: verdict.verdict, reasons: verdict.reasons, repairAction: verdict.repairAction, published: false }
}

export async function runCrossStitchBatch(count: number, step: StepRunner = inlineStep): Promise<BatchSummary> {
  const base: BatchSummary = { craft: 'cross-stitch', requested: count, published: 0, culled: 0, repaired: 0, generations: 0, errors: 0, gems: [], killReasons: [], line: '' }
  if (!gateConfigured()) {
    return { ...base, skipped: 'gate-not-wired', line: 'cross-stitch batch skipped — ANTHROPIC_API_KEY not set, refusing to publish un-gated' }
  }

  const briefs = await step.run('xs-plan', async () => {
    const recent = await recentCrossStitchSlugs().catch(() => [])
    return planCrossStitchBriefs(count, recent)
  })
  const keptSubjects: string[] = []

  for (const brief of briefs) {
    try {
      // Best-of-N: take up to MAX_XS_ATTEMPTS fresh shots at this idea, each its
      // own step. A 'repair' re-rolls with a cosmetic tweak; a re-rollable 'kill'
      // re-rolls fresh; a kill the idea can't survive (text/IP/near-dup) culls.
      let tweak: CandidateTweak = {}
      let last: AttemptResult | null = null
      let publishedThis = false
      for (let attempt = 1; attempt <= MAX_XS_ATTEMPTS; attempt++) {
        base.generations++
        const tweakForStep = tweak
        last = await step.run(`xs-${brief.slug}-a${attempt}`, () => crossStitchAttempt(brief, tweakForStep, keptSubjects))
        if (last.verdict === 'keep') {
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
      if (!publishedThis && last && last.verdict !== 'keep') {
        base.culled++
        base.killReasons.push(...last.reasons)
      }
    } catch (err) {
      base.errors++
      console.error(`[bulk cross-stitch] ${brief.slug} failed`, err)
    }
  }

  base.line = `cross-stitch: ${base.published} gems published, ${base.culled} culled, ${base.repaired} repairs, ${base.generations} generations, ${base.errors} errors (of ${count})`
  return base
}

// ─────────────────────────── NEEDLEWORK ───────────────────────────

/** One needlework attempt: Flux → convert → loom render → gate → publish on 'keep'. */
async function needleworkAttempt(
  brief: Awaited<ReturnType<typeof planNeedleworkBriefs>>[number],
  keptSubjects: string[],
): Promise<AttemptResult> {
  const candidate = await generateNeedleworkCandidate(brief)
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
  const base: BatchSummary = { craft: 'needlework', requested: count, published: 0, culled: 0, repaired: 0, generations: 0, errors: 0, gems: [], killReasons: [], line: '' }
  if (!gateConfigured()) {
    return { ...base, skipped: 'gate-not-wired', line: 'needlework batch skipped — ANTHROPIC_API_KEY not set, refusing to publish un-gated' }
  }
  if (!fargateRenderWired()) {
    return { ...base, skipped: 'render-not-wired', line: 'needlework batch skipped — LOOM_RENDER!=fargate, hero render not wired' }
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

  base.line = `needlework: ${base.published} gems published, ${base.culled} culled, ${base.repaired} repairs, ${base.generations} generations, ${base.errors} errors (of ${count})`
  return base
}

export async function runBatch(craft: Craft, count: number, step: StepRunner = inlineStep): Promise<BatchSummary> {
  return craft === 'needlework' ? runNeedleworkBatch(count, step) : runCrossStitchBatch(count, step)
}
