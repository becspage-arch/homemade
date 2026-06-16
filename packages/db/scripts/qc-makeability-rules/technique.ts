import {
  bodyText, compose, hasActionableSteps, hasNodeType, headings,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * TECHNIQUE (all categories) — the "TECHNIQUE" checklist section.
 *
 * The enforced makeability bar is: a real procedure (steps), a completion
 * criterion (how you know it is right / done), and a common-mistakes /
 * troubleshooting signal. These three separate a genuine how-to from a decision
 * guide mis-typed as a TECHNIQUE.
 *
 * The checklist also lists a materials list, a tools list, and a uses section as
 * mandatory. Those are NOT hard-blocked here, and deliberately so: the corpus
 * spans craft techniques (which name materials/tools inline in the steps) AND
 * husbandry / management techniques (weaning lambs, catching chickens, supering
 * bees) that need no materials or tools at all and whose USE is their title.
 * Hard-requiring a discrete materials/tools/uses section un-published clearly
 * makeable husbandry + procedural techniques (locked don't-over-prune rule).
 * Flagged in the hand-off so Rebecca can promote any of them to strict per
 * sub-type if she wants a craft-only template enforced.
 */
const COMPLETION_RE =
  /\b(until|when|once|you(?:'ll| will| should)? (?:see|feel|notice|have|know)|looks? (?:like|when)|should (?:be|look|feel|have|sit)|ready (?:when|to|for)|done when|right when|finished when|the (?:result|piece|seam|edge|surface|finish|dough|paint|glaze|shape|wax|bond|joint|udder|bird|animal|lamb|hive) (?:is|should|will|looks|sits)|forms? a|leaves? a|sits? (?:flush|flat)|holds? (?:its|the)|even\b|smooth\b|the finished|brings? up|comes? up|set\b|secure\b|firm\b|watertight|drying off|normally\b|signs? of|is calm|is settled)\b/i
const MISTAKES_RE =
  /\b(common mistake|mistakes? to avoid|troubleshoot|what (?:can )?go(?:es)? wrong|going wrong|if (?:it|the|your).{0,40}(?:wrong|too|not)|avoid|don'?t\b|pitfall|fix(?:ing)?\b|too (?:thick|thin|hot|cold|dry|wet|much|little|early|late|young|old)|over[- ]?(?:work|heat|tighten|feed)|under[- ]?|can cause|stresses?|risk|untreated|permanent|damage|harm|fails?|won'?t\b|never\b|watch (?:for|out)|take care|be careful)\b/i

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)
  const heads = headings(ctx.body)

  if (!hasActionableSteps(ctx)) reasons.push('no step-by-step instructions')
  if (!COMPLETION_RE.test(text)) reasons.push('no completion criterion (how you know it is right / done)')

  const mistakes =
    hasNodeType(ctx.body, 'troubleshooter') ||
    heads.some((h) => /mistake|troubleshoot|problem|what can go wrong|pitfall|watch out|tips?\b|care\b/i.test(h)) ||
    MISTAKES_RE.test(text)
  if (!mistakes) reasons.push('no common mistakes / troubleshooting section')

  return compose(ctx, `${ctx.categorySlug}:technique`, reasons)
}
