import {
  bodyText, compose, hasBrokenFoundation, hasFoundationCount, hasGauge,
  hasMaterials, hasRowRound, hasTruncatedStitchInstruction,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * Crochet PATTERN — makeable via EITHER a populated chart OR written
 * row/round instructions. Written instructions must carry row/round markers, a
 * real foundation count (no NaN/undefined/0), and no truncated "... sp work."
 * stitch groups (the 2026-06-15 corner-spec-dropped signature). Plus materials
 * (yarn weight + hook) and a gauge.
 */
export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)

  const hasChart = ctx.chart.crochetChartData || ctx.chart.tutorialChartDefinition || ctx.chart.insetChartWithSymbols
  const hasWritten = hasRowRound(text)
  if (!hasChart && !hasWritten) {
    reasons.push('no chart and no written row/round instructions')
  }
  if (hasWritten) {
    if (hasBrokenFoundation(text)) {
      reasons.push('foundation chain count is broken (NaN / undefined / 0)')
    } else if (!hasFoundationCount(text)) {
      reasons.push('no positive foundation/stitch count anywhere in the instructions')
    }
    if (hasTruncatedStitchInstruction(text)) {
      reasons.push('truncated instruction — a stitch group says "work" with no stitch count (corner/cluster spec dropped)')
    }
  }
  if (!hasMaterials(ctx.body) && !ctx.gaugeText) {
    reasons.push('no materials list (yarn weight, hook size)')
  }
  if (!hasGauge(ctx)) {
    reasons.push('no gauge stated')
  }
  return compose(ctx, 'crochet:pattern', reasons)
}
