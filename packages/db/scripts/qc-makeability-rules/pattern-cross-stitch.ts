import { compose, hasMaterials, type MakeabilityContext, type MakeabilityResult } from './shared.js'

/**
 * Cross-stitch PATTERN — a counted discipline. The chart is the pattern. A
 * cross-stitch pattern with no chart is not a pattern; it fails, full stop.
 *
 * Chart is satisfied by a linked Pattern.data with stitches, a resolved
 * patternInset/craftChart node with symbols, or Tutorial.chartDefinition.
 * Also requires a materials list (fabric count, thread, hoop) and designer /
 * house attribution.
 */
export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const chartPresent =
    ctx.chart.crossStitchChart || ctx.chart.insetChartWithSymbols || ctx.chart.tutorialChartDefinition
  if (!chartPresent) {
    reasons.push('cross-stitch pattern has no chart (mandatory — a chart-less cross-stitch pattern is not a pattern)')
  }
  if (!hasMaterials(ctx.body)) {
    reasons.push('no materials list (fabric count, thread, hoop)')
  }
  const attribution =
    ctx.hasDesigner ||
    /design(ed by|er|\s+house)|\bhouse\b|adapted from|after a design/i.test(ctx.sourceNotes ?? '')
  if (!attribution) {
    reasons.push('no designer / house attribution')
  }
  return compose(ctx, 'cross-stitch:pattern', reasons)
}
