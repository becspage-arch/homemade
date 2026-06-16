import {
  bodyText, compose, hasActionableSteps, hasNodeType, headings,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * STITCH (cross-stitch, crochet, knitting, needlework) — the "STITCH" checklist
 * section. A way to FORM the stitch (a chart / diagram / illustration OR clear
 * step-by-step formation — text formation is fully makeable for a crochet / knit
 * technique stitch that has no chart), a uses section, a variations section, and
 * a difficulty level. Detected generously so a text-and-infopanel stitch tutorial
 * with related-stitch notes passes; only one that never explains the formation,
 * never says where it is used, or never offers a variation fails.
 */
const USES_RE =
  /\b(used (?:in|for|to)|use it (?:in|for|to|when)|where (?:this|it) (?:goes|is used)|typically used|common(?:ly)? (?:in|used)|appears? in|found in|works? well (?:in|for)|basis (?:for|of)|foundation (?:for|of)|good for|building block|fills?\b|gives? a|produces? a|creates? a|the same effect as|standard for|used to (?:make|create|produce)|ideal (?:for|when))\b/i
// Variations OR a comparison to a related / alternative stitch or method (a
// basic stitch's "variation" is usually "the X is firmer; use this when …").
const VARIATIONS_RE =
  /\b(variation|variant|alternativ|you can also|another way|a different|or work it|reverse|mirror|elongat|crossed variant|whipped|threaded|double|half|similar (?:rib|effect|stitch|result)|produce[s]? a similar|front[- ]post|back[- ]post|deeper|more pronounced|what to try next|related (?:stitch|technique)|than the .{0,30}(?:stitch|cast[- ]?on|crochet|knit)|the .{0,20}(?:cast[- ]?on|stitch) is (?:better|firmer|softer|stronger|neater)|compared to|instead of|or (?:the|a) .{0,20}(?:cast[- ]?on|stitch)|use (?:this|it) (?:when|where|for)|softer (?:and|than)|firmer (?:and|than))\b/i
const DIFFICULTY_WORD_RE = /\b(beginner|easy|simple|intermediate|advanced|confident|difficulty|skill level)\b/i

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)
  const heads = headings(ctx.body)

  // Formation: a visual (chart / image / infoPanel) OR clear step-by-step.
  const canForm =
    ctx.chart.tutorialChartDefinition || ctx.chart.hasChartNode || hasNodeType(ctx.body, 'image') ||
    hasNodeType(ctx.body, 'infoPanel') || hasActionableSteps(ctx) ||
    /image|diagram|illustration|symbol|chart/i.test(JSON.stringify(heads))
  if (!canForm) reasons.push('no way to form the stitch (no chart / diagram / illustration and no step-by-step formation)')

  if (!USES_RE.test(text) && !heads.some((h) => /use|where|good for|projects?|next|similar/i.test(h))) {
    reasons.push('no uses section (where this stitch is typically used)')
  }

  if (!VARIATIONS_RE.test(text) && !heads.some((h) => /variation|variant|alternativ|next|similar|related/i.test(h))) {
    reasons.push('no common variations section')
  }

  const hasDifficulty = ctx.difficulty != null || DIFFICULTY_WORD_RE.test(text) || heads.some((h) => DIFFICULTY_WORD_RE.test(h))
  if (!hasDifficulty) reasons.push('no difficulty level')

  return compose(ctx, `${ctx.categorySlug}:stitch`, reasons)
}
