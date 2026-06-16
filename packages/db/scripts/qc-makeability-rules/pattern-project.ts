import {
  bodyText, compose, hasActionableSteps, namesMaterials, namesTools,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * Project-shape PATTERN (home-repair, pottery-ceramics, wood-natural-craft,
 * sustainability, paper-word, animals-smallholding, fibre-arts non-chart
 * subtypes) — the "PATTERN — project-shape" checklist section.
 *
 * Enforced makeability bar: numbered action-verb steps, materials, tools, and a
 * completion criterion. Materials + tools accept INLINE naming (locked
 * don't-over-prune — a build that names "220 gsm cartridge, PVA, 1.5 mm board"
 * in its steps is makeable).
 *
 * The checklist lists a cut list (build projects) and safety notes (tool-based /
 * chemical / fired projects) as mandatory WHEN APPLICABLE. They are NOT
 * blanket-blocked by category, because applied that way they un-publish makeable
 * content the locked don't-over-prune rule protects: a "cut list" requirement
 * fails repair / care tasks that cut nothing (conditioning a leather belt,
 * bleeding a radiator, replacing a heater element); a blanket "safety notes"
 * requirement fails low-risk fittings (a curtain pole, a cat flap). They are
 * flagged in the hand-off as conditional items Rebecca can promote to strict for
 * genuinely cutting / hazardous subtypes if she wants.
 */
const COMPLETION_RE =
  /\b(until|when|once|you(?:'ll| will| should)? (?:see|feel|notice|have|know)|should (?:be|look|feel|have|sit|swing|close|open|hold)|ready when|done when|finished when|the (?:result|piece|joint|seam|edge|surface|finish|fit|box|wall|structure|flap|door|crack|patch|paint) (?:is|should|will|looks|sits|holds|swings)|leaves? a|forms? a|sits? (?:flush|flat)|holds? (?:its|the|shape|firm)|lock(?:s|ing)? (?:the|in)|is (?:secure|level|flush|watertight|dry|set|firm|complete|finished|smooth|even|sound)|crease (?:firmly|all)|press(?:ed)? (?:firm|flat)|the fit (?:depends|is)|swings? (?:freely|shut)|flush with|no longer|stops? (?:leaking|dripping|sticking)|even (?:coat|finish|coverage))\b/i

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)

  if (!hasActionableSteps(ctx)) {
    reasons.push('no numbered step-by-step instructions (list, method heading with action verbs, or step run)')
  }
  if (!namesMaterials(ctx, text)) reasons.push('no materials named')
  if (!namesTools(ctx, text)) reasons.push('no tools named')
  if (!COMPLETION_RE.test(text)) reasons.push('no completion criterion stated')

  return compose(ctx, `${ctx.categorySlug}:pattern`, reasons)
}
