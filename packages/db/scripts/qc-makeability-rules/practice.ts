import {
  bodyText, compose, hasActionableSteps, wordCount,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * PRACTICE (mindset) — the "PRACTICE" checklist section. Clear instructions, a
 * duration / repetition count, no vague feel-good claims, no medical advice, and
 * no "fine for everyone" language are the enforced bars.
 *
 * Two checklist lines are NOT hard-blocked here, and deliberately so:
 *   - "Medical disclaimer" — the locked mindset voice ([[feedback_mindset_voice]])
 *     bans defensive disclaimers IN THE BODY, and no render-layer disclaimer
 *     component exists yet. Requiring in-body disclaimer text would both
 *     contradict the locked voice and un-publish ~every practice for a missing
 *     render feature. Flagged in the hand-off as a site-wide render-layer gap
 *     keyed off Tutorial.requiresMedicalDisclaimer.
 *   - "What to expect / sensory cues" — the locked mindset voice bans the vague
 *     "what you might notice" lists that would satisfy this; the factual tapping
 *     / affirmation scripts deliberately omit them. Enforcing it would reinstate
 *     banned phrasing.
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
