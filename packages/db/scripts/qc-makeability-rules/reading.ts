import {
  bodyText, compose, headings, wordCount,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * READING (informational / decision / comparison guides, all categories) — the
 * "READING" checklist section, every item a hard block. The topic is addressed,
 * at least 3 structural breaks, substantive (not thin) content, no
 * "this article is about" preamble, and a conclusion / what-to-do-next pointer.
 */
const PREAMBLE_RE =
  /^(?:\s*)(this (?:article|page|guide|reading|piece) (?:is about|covers|explains|will|introduces)|in this (?:article|guide|reading)|welcome to)/i

/**
 * The enforced bars are: topic addressed, at least 3 structural breaks,
 * substantive (not thin) content, and no "this article is about" preamble.
 *
 * The checklist also lists a "conclusion / what-to-do-next pointer" as mandatory.
 * It is NOT hard-blocked here: the corpus's readings are largely reference /
 * explainer pieces (how RCD protection works, caring for carved spoons) that
 * legitimately end on their last substantive section rather than a "next steps"
 * line. Hard-requiring a conclusion pointer un-published complete, useful
 * reference content. Flagged in the hand-off so Rebecca can promote it to strict
 * for decision / comparison guides specifically if she wants.
 */
export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)
  const heads = headings(ctx.body)

  const titleTokens = ctx.title.toLowerCase().split(/[^a-z]+/).filter((t) => t.length >= 4)
  const hay = text.toLowerCase()
  if (titleTokens.length > 0 && !titleTokens.some((t) => hay.includes(t))) {
    reasons.push('topic in the title is not addressed in the body')
  }
  if (heads.length < 3) reasons.push('fewer than 3 section headings / structural breaks')
  if (wordCount(text) < 120) reasons.push(`thin content (${wordCount(text)} words < 120)`)
  if (PREAMBLE_RE.test(text.trimStart())) reasons.push('opens with a "this article is about" preamble')

  return compose(ctx, `${ctx.categorySlug}:reading`, reasons)
}
