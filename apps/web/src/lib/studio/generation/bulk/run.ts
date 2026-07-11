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
 * repair-or-cull → publish the gems) → a one-line summary. This is the exact loop
 * the retired PC routine ran, now server-side and unattended.
 *
 * Nothing ships un-judged: if the gate isn't wired (ANTHROPIC_API_KEY unset) the
 * run is a clean no-op — it generates nothing rather than publish blind.
 */

export type Craft = 'cross-stitch' | 'needlework'

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

function tweakFor(g: GateResult): CandidateTweak {
  switch (g.repairAction) {
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

export async function runCrossStitchBatch(count: number): Promise<BatchSummary> {
  const base: BatchSummary = { craft: 'cross-stitch', requested: count, published: 0, culled: 0, repaired: 0, generations: 0, errors: 0, gems: [], killReasons: [], line: '' }
  if (!gateConfigured()) {
    return { ...base, skipped: 'gate-not-wired', line: 'cross-stitch batch skipped — ANTHROPIC_API_KEY not set, refusing to publish un-gated' }
  }

  const recent = await recentCrossStitchSlugs().catch(() => [])
  const briefs = await planCrossStitchBriefs(count, recent)
  const keptSubjects: string[] = []

  for (const brief of briefs) {
    try {
      // Best-of-N: take up to MAX_XS_ATTEMPTS fresh shots at this idea. A 'repair'
      // re-rolls with a cosmetic tweak; a re-rollable 'kill' re-rolls fresh; a
      // kill the idea can't survive (text/IP/near-dup) short-circuits to a cull.
      let tweak: CandidateTweak = {}
      let verdict: GateResult | null = null
      let publishedThis = false
      for (let attempt = 1; attempt <= MAX_XS_ATTEMPTS; attempt++) {
        base.generations++
        const candidate = await generateCrossStitchCandidate(brief, tweak)
        verdict = await visionGate(candidate.renderPng, {
          subject: brief.subject,
          craft: 'cross-stitch',
          colours: candidate.colourCount,
          keptSubjects,
        })
        if (verdict.verdict === 'keep') {
          await publishCrossStitchGem(brief, candidate)
          keptSubjects.push(brief.subject)
          base.gems.push(brief.slug)
          base.published++
          publishedThis = true
          break
        }
        if (attempt >= MAX_XS_ATTEMPTS) break // out of shots — cull below
        if (verdict.verdict === 'repair') {
          base.repaired++
          tweak = tweakFor(verdict)
          continue
        }
        // verdict === 'kill'
        if (killIsUnrerollable(verdict.reasons)) break // re-roll can't save it — cull
        tweak = {} // a bad roll of a fine idea — take a fresh stochastic shot
      }
      if (!publishedThis && verdict && verdict.verdict !== 'keep') {
        base.culled++
        base.killReasons.push(...verdict.reasons)
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

export async function runNeedleworkBatch(count: number): Promise<BatchSummary> {
  const base: BatchSummary = { craft: 'needlework', requested: count, published: 0, culled: 0, repaired: 0, generations: 0, errors: 0, gems: [], killReasons: [], line: '' }
  if (!gateConfigured()) {
    return { ...base, skipped: 'gate-not-wired', line: 'needlework batch skipped — ANTHROPIC_API_KEY not set, refusing to publish un-gated' }
  }
  if (!fargateRenderWired()) {
    return { ...base, skipped: 'render-not-wired', line: 'needlework batch skipped — LOOM_RENDER!=fargate, hero render not wired' }
  }

  const recent = await recentNeedleworkSlugs().catch(() => [])
  const briefs = await planNeedleworkBriefs(count, recent)
  const keptSubjects: string[] = []

  // Needlework re-rolls an expensive Fargate render, so its repair cap stays
  // tight (no best-of-N): a 'kill' culls immediately.
  for (const brief of briefs) {
    try {
      let verdict: GateResult | null = null
      let publishedThis = false
      for (let attempt = 0; attempt <= MAX_NW_REPAIRS; attempt++) {
        base.generations++
        const candidate = await generateNeedleworkCandidate(brief)
        verdict = await visionGate(candidate.heroPng, {
          subject: brief.subject,
          craft: 'needlework',
          colours: candidate.conversion.colourCount,
          keptSubjects,
        })
        if (verdict.verdict === 'keep') {
          await publishNeedleworkGem(brief, candidate)
          keptSubjects.push(brief.subject)
          base.gems.push(brief.slug)
          base.published++
          publishedThis = true
          break
        }
        if (verdict.verdict === 'repair' && attempt < MAX_NW_REPAIRS) {
          base.repaired++
          continue // a fresh render is the only repair we run for needlework.
        }
        break
      }
      if (!publishedThis && verdict && verdict.verdict !== 'keep') {
        base.culled++
        base.killReasons.push(...verdict.reasons)
      }
    } catch (err) {
      base.errors++
      console.error(`[bulk needlework] ${brief.slug} failed`, err)
    }
  }

  base.line = `needlework: ${base.published} gems published, ${base.culled} culled, ${base.repaired} repairs, ${base.generations} generations, ${base.errors} errors (of ${count})`
  return base
}

export async function runBatch(craft: Craft, count: number): Promise<BatchSummary> {
  return craft === 'needlework' ? runNeedleworkBatch(count) : runCrossStitchBatch(count)
}
