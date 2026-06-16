import { compose, hasMaterials, type MakeabilityContext, type MakeabilityResult } from './shared.js'

/**
 * Counted needlework PATTERN (blackwork, hardanger, needlepoint, sashiko) —
 * stitches live on a chart grid, so the chart is MANDATORY. Satisfied by a
 * linked NeedleworkPattern.chartData, a resolved patternInset/chart node with
 * symbols, or Tutorial.chartDefinition. Plus a materials list (fabric, thread,
 * needle).
 */
export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const chartPresent =
    ctx.chart.needleworkChartData || ctx.chart.insetChartWithSymbols || ctx.chart.tutorialChartDefinition
  if (!chartPresent) {
    reasons.push('counted-needlework pattern has no chart (mandatory for a counted discipline)')
  }
  if (!hasMaterials(ctx.body)) {
    reasons.push('no materials list (fabric, thread, needle)')
  }
  return compose(ctx, 'needlework-counted:pattern', reasons)
}
