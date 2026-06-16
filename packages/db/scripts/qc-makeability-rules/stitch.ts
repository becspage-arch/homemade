import {
  bodyText, compose, hasActionableSteps, headings,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * STITCH (crochet, knitting, needlework, cross-stitch). Needs a clear
 * explanation of how to form the stitch (a visual chart/diagram/illustration
 * OR detailed step-by-step that does not depend on a visual) and a "where it is
 * used" section. Generic checks guard placeholders / broken bodies.
 */
const USES_RE =
  /\b(used (?:in|for|to)|use it (?:in|for|to|when)|where (?:this|it) (?:goes|is used)|typically used|common(?:ly)? (?:in|used)|goes next|appears? in|found in|works? well (?:in|for)|basis (?:for|of)|foundation (?:for|of)|underpins?|fills?\b|building block|leads? (?:to|into)|combine[ds]? into|forms? the|builds? into|good for|ideal when|projects?)\b/i

const USES_HEADING_RE = /use|where|next|project|underpin|basis|foundation|fills|good for/i

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)

  const hasVisual =
    ctx.chart.tutorialChartDefinition || ctx.chart.hasChartNode ||
    /image|diagram|illustration|symbol/i.test(JSON.stringify(headings(ctx.body)))
  const hasStepwise = hasActionableSteps(ctx)
  if (!hasVisual && !hasStepwise) {
    reasons.push('no visual (chart/diagram) and no step-by-step way to form the stitch')
  }
  if (!USES_RE.test(text) && !headings(ctx.body).some((h) => USES_HEADING_RE.test(h))) {
    reasons.push('no "where it is used" section')
  }
  return compose(ctx, `${ctx.categorySlug}:stitch`, reasons)
}
