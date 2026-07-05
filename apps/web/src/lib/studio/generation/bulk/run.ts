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
  errors: number
  /** Slugs of the gems that shipped. */
  gems: string[]
  /** One-line progress string for the audit log + admin history. */
  line: string
  /** Set when the batch could not run at all (gate/render not wired). */
  skipped?: string
}

const MAX_XS_REPAIRS = 3
const MAX_NW_REPAIRS = 1 // needlework re-rolls a Fargate render — keep repairs tight.

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
  const base: BatchSummary = { craft: 'cross-stitch', requested: count, published: 0, culled: 0, repaired: 0, errors: 0, gems: [], line: '' }
  if (!gateConfigured()) {
    return { ...base, skipped: 'gate-not-wired', line: 'cross-stitch batch skipped — ANTHROPIC_API_KEY not set, refusing to publish un-gated' }
  }

  const recent = await recentCrossStitchSlugs().catch(() => [])
  const briefs = await planCrossStitchBriefs(count, recent)
  const keptSubjects: string[] = []

  for (const brief of briefs) {
    try {
      let tweak: CandidateTweak = {}
      let verdict: GateResult | null = null
      let publishedThis = false
      for (let attempt = 0; attempt <= MAX_XS_REPAIRS; attempt++) {
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
        if (verdict.verdict === 'repair' && attempt < MAX_XS_REPAIRS) {
          base.repaired++
          tweak = tweakFor(verdict)
          continue
        }
        break // kill, or repairs exhausted
      }
      if (!publishedThis && verdict && verdict.verdict !== 'keep') base.culled++
    } catch (err) {
      base.errors++
      console.error(`[bulk cross-stitch] ${brief.slug} failed`, err)
    }
  }

  base.line = `cross-stitch: ${base.published} gems published, ${base.culled} culled, ${base.repaired} repairs, ${base.errors} errors (of ${count})`
  return base
}

// ─────────────────────────── NEEDLEWORK ───────────────────────────

export async function runNeedleworkBatch(count: number): Promise<BatchSummary> {
  const base: BatchSummary = { craft: 'needlework', requested: count, published: 0, culled: 0, repaired: 0, errors: 0, gems: [], line: '' }
  if (!gateConfigured()) {
    return { ...base, skipped: 'gate-not-wired', line: 'needlework batch skipped — ANTHROPIC_API_KEY not set, refusing to publish un-gated' }
  }
  if (!fargateRenderWired()) {
    return { ...base, skipped: 'render-not-wired', line: 'needlework batch skipped — LOOM_RENDER!=fargate, hero render not wired' }
  }

  const recent = await recentNeedleworkSlugs().catch(() => [])
  const briefs = await planNeedleworkBriefs(count, recent)
  const keptSubjects: string[] = []

  for (const brief of briefs) {
    try {
      let verdict: GateResult | null = null
      let publishedThis = false
      for (let attempt = 0; attempt <= MAX_NW_REPAIRS; attempt++) {
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
      if (!publishedThis && verdict && verdict.verdict !== 'keep') base.culled++
    } catch (err) {
      base.errors++
      console.error(`[bulk needlework] ${brief.slug} failed`, err)
    }
  }

  base.line = `needlework: ${base.published} gems published, ${base.culled} culled, ${base.repaired} repairs, ${base.errors} errors (of ${count})`
  return base
}

export async function runBatch(craft: Craft, count: number): Promise<BatchSummary> {
  return craft === 'needlework' ? runNeedleworkBatch(count) : runCrossStitchBatch(count)
}
