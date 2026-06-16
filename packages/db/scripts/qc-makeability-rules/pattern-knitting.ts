import {
  bodyText, compose, hasFoundationCount, hasGauge, hasMaterials, hasRowRound,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * Knitting PATTERN — makeable via EITHER a populated chart OR written row
 * instructions. Written instructions must carry row markers and a real cast-on
 * count. Plus materials (yarn weight + needle) and a gauge.
 */
export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)

  const hasChart = ctx.chart.knittingChartData || ctx.chart.tutorialChartDefinition || ctx.chart.insetChartWithSymbols
  const hasWritten = hasRowRound(text) || /\bcast[- ]?on\b/i.test(text)
  if (!hasChart && !hasWritten) {
    reasons.push('no chart and no written row instructions')
  }
  if (hasWritten && !hasChart) {
    if (/\bcast[- ]?on\s*(?:NaN|undefined|0)\b/i.test(text)) {
      reasons.push('cast-on count is broken (NaN / undefined / 0)')
    } else if (!hasFoundationCount(text)) {
      reasons.push('no positive cast-on / stitch count in the instructions')
    }
    if (!hasRowRound(text)) {
      reasons.push('no row/round instructions (cast-on mentioned but no rows worked)')
    }
  }
  if (!hasMaterials(ctx.body) && !ctx.gaugeText) {
    reasons.push('no materials list (yarn weight, needle size)')
  }
  if (!hasGauge(ctx)) {
    reasons.push('no gauge stated')
  }
  return compose(ctx, 'knitting:pattern', reasons)
}
