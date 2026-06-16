import { compose, type ChartFacts, type MakeabilityContext, type MakeabilityResult } from './shared.js'

/**
 * Cross-stitch PATTERN — the "PATTERN — cross-stitch" checklist section,
 * enforced line for line. A counted discipline: the chart IS the pattern, and
 * every mandatory item is a hard block. No OR clauses.
 *
 * The structural checks read the resolved Pattern.data facts (folded into
 * `ChartFacts` by the loader / standalone builder), so the same set runs whether
 * the pattern is a Tutorial-linked chart or a standalone library Pattern row.
 *
 * Render-time derivations the checklist still lists as mandatory — finished
 * dimensions (cm), needle size, hoop suggestion, centre marks — all derive
 * deterministically from the fabric count + grid dimensions, so the checkable
 * bar for them is "fabric specified AND grid dimensions present". This is not a
 * softening: the source data the derivation needs must be present, exactly as
 * the temperature / unit / region derivations are handled elsewhere.
 */
export function crossStitchReasons(facts: ChartFacts, hasDesigner: boolean): string[] {
  const reasons: string[] = []
  if (!facts.crossStitchChart && !facts.insetChartWithSymbols && !facts.tutorialChartDefinition) {
    reasons.push('no chart with stitch symbols (mandatory — a chart-less cross-stitch pattern is not a pattern)')
  }
  if (!facts.stitchKeyValid) {
    reasons.push('no valid stitch key (each palette entry needs symbol + brand + thread code + colour)')
  }
  if (!facts.fabricSpecified) {
    reasons.push('no fabric specified (type + count) — also the basis for finished size, needle size and hoop')
  }
  if (!facts.gridDimensions) {
    reasons.push('no grid dimensions (finished dimensions, centre marks, needle and hoop all derive from these)')
  }
  if (!hasDesigner) {
    reasons.push('no designer / house attribution')
  }
  if (facts.backstitchUsed && !facts.backstitchData) {
    reasons.push('backstitch is used but no backstitch instructions / segments are on the chart')
  }
  if (facts.frenchKnotsUsed && !facts.frenchKnotsData) {
    reasons.push('french knots are used but no french-knot placement is on the chart')
  }
  return reasons
}

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  return compose(ctx, 'cross-stitch:pattern', crossStitchReasons(ctx.chart, ctx.hasDesigner))
}
