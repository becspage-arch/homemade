import {
  bodyText, compose, hasActionableSteps, wordCount,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * PRACTICE (mindset) — the "PRACTICE" checklist section. Clear instructions, a
 * duration / repetition count, no vague feel-good claims, no medical advice, and
 * no "fine for everyone" language are the enforced bars.
 *
 * No in-body medical disclaimer is required. The site-wide disclaimer is the
 * single source and the locked mindset voice ([[feedback_mindset_voice]]) bans
 * defensive in-body disclaimers ([[feedback_content_completeness_checklist]],
 * locked 2026-06-16). The "no medical advice" rule below is a different,
 * retained rule; it blocks claims, it does not demand disclaimer text.
 *
 * "What to expect / sensory cues" is also NOT hard-blocked: the locked mindset
 * voice bans the vague "what you might notice" lists that would satisfy it; the
 * factual tapping / affirmation scripts deliberately omit them. Enforcing it
 * would reinstate banned phrasing.
 */
const DURATION_RE =
  /\b\d+[\s-]*(?:min(?:ute)?s?|seconds?|breaths?)\b|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty)[\s-]+(?:slow\s+|deep\s+)?(?:minute|second|breath)|\b(?:a|one)\s+(?:minute|moment)\b|take as long as|a few (?:minutes|moments)|spend (?:a )?(?:few|some)/i
const REPETITION_RE =
  /\b(?:repeat|say|tap|read|breathe)\b[^.]{0,50}?\b(?:x\s*\d+|\d+\s*times|once|twice|three times|four times)\b|\bround\b|repeat (?:x\s*)?\d|each round|three times/i
const VAGUE_CLAIM_RE =
  /you'?ll feel better|feel better (?:soon|fast|right away)|everything will be (?:fine|okay|ok)|all your problems (?:will )?(?:melt|disappear|vanish)|melt away your/i
const FINE_FOR_EVERYONE_RE =
  /\b(fine|safe|suitable|works?|good|right) for (?:almost )?(?:everyone|anyone|all|everybody)\b|\beveryone (?:can|should|will benefit)/i
const MEDICAL_ADVICE_RE =
  /\b(this (?:practice|tapping|ritual).{0,20}(?:cures?|will heal|will cure)|cures? your|will cure your|replaces? (?:your )?medication|instead of (?:your )?medication|stop taking your (?:medication|medicine|pills|prescription)|a substitute for (?:medical|professional))/i

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)

  const hasInstructions = hasActionableSteps(ctx) || wordCount(text) >= 60
  if (!hasInstructions) reasons.push('no clear practice instructions')

  const hasDuration = DURATION_RE.test(text) || REPETITION_RE.test(text) || (ctx.timeMinutes ?? 0) > 0
  if (!hasDuration) reasons.push('no duration / repetition count stated')

  if (VAGUE_CLAIM_RE.test(text)) reasons.push('vague feel-good claim (e.g. "you\'ll feel better")')
  if (MEDICAL_ADVICE_RE.test(text)) reasons.push('contains medical advice (not allowed in a mindset practice)')
  if (FINE_FOR_EVERYONE_RE.test(text)) reasons.push('contains "fine for everyone" style language')

  return compose(ctx, 'mindset:practice', reasons)
}
