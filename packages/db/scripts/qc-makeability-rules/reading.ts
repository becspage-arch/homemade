import {
  bodyText, compose, headings, wordCount,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * READING (all categories). Structured prose covering the topic the title
 * announces: at least 3 headings / sections, real useful content (not filler),
 * and no "this article is about" preamble. Voice + glossary are enforced by the
 * generic checks + the existing voice gate.
 */
const PREAMBLE_RE =
  /^(?:\s*)(this (?:article|page|guide|reading|piece) (?:is about|covers|explains|will|introduces)|in this (?:article|guide|reading)|welcome to)/i

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)

  if (headings(ctx.body).length < 3) {
    reasons.push('fewer than 3 headings / sections')
  }
  if (wordCount(text) < 120) {
    reasons.push(`thin content (${wordCount(text)} words < 120)`)
  }
  if (PREAMBLE_RE.test(text.trimStart())) {
    reasons.push('opens with a "this article is about" preamble')
  }
  return compose(ctx, `${ctx.categorySlug}:reading`, reasons)
}
