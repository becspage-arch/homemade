/**
 * Unified publish gate — completeness AND makeability.
 *
 * This is the single authoritative "may this row go live?" check that every
 * script-side publish path shares (the autopilot upload `uploadTutorial` and
 * the batch DRAFT->PUBLISHED flip `gatedPublishDrafts`). It runs:
 *
 *   1. the structural completeness gate (qc-completeness-rules) — the original
 *      no-skeleton / no-NaN / has-a-method check; and
 *   2. the per-type makeability gate (qc-makeability-rules) — the stricter
 *      "could a competent person actually MAKE this?" check (a cross-stitch
 *      pattern with no chart, a recipe with no quantities, a counted-needlework
 *      pattern with no chart, etc.).
 *
 * A row is publishable only if BOTH pass. Makeability `voice:` nits and `flag:`
 * improvements never block (they are kept-and-flagged, matching the audit).
 * Binary block / skip — no warning tier. Autopilot cannot bypass it because the
 * publish paths call this, not a raw status write.
 */
import type { PrismaClient } from '@prisma/client'
import { checkCompleteness } from './qc-completeness-rules/index.js'
import { auditMakeability, ruleKeyFor } from './qc-makeability-rules/index.js'
import { MAKEABILITY_SELECT, buildContextForRow } from './qc-makeability-rules/loader.js'

export interface PublishGateResult {
  publishable: boolean
  /** Blocking reasons from completeness + makeability (excludes voice/flag). */
  reasons: string[]
  /** Rule ids parallel to reasons. */
  rules: string[]
  ruleKey: string
  /** Non-blocking notes kept for the report (voice nits + improvement flags). */
  flags: string[]
  /** Ready-to-store qcBlockReason value (null when publishable). */
  blockReason: Record<string, unknown> | null
}

const nonBlocking = (rule: string): boolean => rule.startsWith('voice:') || rule.startsWith('flag:')

/** Gate a single persisted Tutorial row by id. Loads the row + its linked
 *  craft-pattern rows (for real chart facts) and runs both gates. */
export async function checkRowPublishable(
  prisma: PrismaClient,
  id: string,
  source: string,
): Promise<PublishGateResult> {
  const row = await prisma.tutorial.findUnique({ where: { id }, select: MAKEABILITY_SELECT })
  if (!row) {
    return { publishable: false, reasons: ['row not found'], rules: ['gate:not-found'], ruleKey: 'unknown', flags: [], blockReason: { blocked: true, reasons: ['row not found'] } }
  }

  const ctx = await buildContextForRow(prisma, row as never)

  // Completeness (pure) from the same context.
  const completeness = checkCompleteness({
    slug: ctx.slug,
    categorySlug: ctx.categorySlug,
    subCategorySlug: ctx.subCategorySlug,
    type: ctx.type,
    body: ctx.body,
    servings: ctx.servings,
    yieldDescription: ctx.yieldDescription,
    totalMinutes: ctx.totalMinutes,
    timeMinutes: ctx.timeMinutes,
    prepMinutes: ctx.prepMinutes,
    cookMinutes: ctx.cookMinutes,
    hasChart:
      ctx.chart.tutorialChartDefinition || ctx.chart.crochetChartData ||
      ctx.chart.knittingChartData || ctx.chart.needleworkChartData ||
      ctx.chart.crossStitchChart || ctx.chart.insetChartWithSymbols,
  })

  const make = auditMakeability(ctx)
  const ruleKey = ruleKeyFor(ctx)

  const reasons: string[] = []
  const rules: string[] = []
  const flags: string[] = []

  for (let i = 0; i < completeness.reasons.length; i++) {
    reasons.push(completeness.reasons[i]!); rules.push(completeness.rules[i]!)
  }
  for (let i = 0; i < make.reasons.length; i++) {
    if (nonBlocking(make.rules[i]!)) flags.push(make.reasons[i]!)
    else { reasons.push(make.reasons[i]!); rules.push(make.rules[i]!) }
  }

  const publishable = reasons.length === 0
  const blockReason = publishable ? null : {
    blocked: true,
    gate: 'publish (completeness + makeability)',
    ruleKey,
    reasons,
    rules,
    flags,
    blockedFromStatus: 'PUBLISHED',
    checkedAt: new Date().toISOString(),
    source,
  }
  return { publishable, reasons, rules, ruleKey, flags, blockReason }
}
