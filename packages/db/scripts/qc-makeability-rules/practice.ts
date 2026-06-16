import {
  bodyText, compose, hasActionableSteps, wordCount,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * PRACTICE (mindset). Needs a stated duration (or a repetition count, which is
 * how affirmations/energy statements express their length), clear practice
 * instructions (steps or guided prose), and a what-to-expect / how-it-adapts
 * section. Must not make vague feel-good claims or give medical advice.
 *
 * The mindset voice lock keeps bodies factual; verbatim energy statements are
 * sacred. So duration is read generously: a timed minutes value, a "repeat x3"
 * count, or a tapping-round structure all satisfy it.
 */
// Duration / length cue. Generous on purpose: a timed value (digit, hyphenated
// "five-minute", or spelled-out), a breath count, "a minute / a moment", a
// tapping round, or a repetition count. Energy statements express length as
// "say it three times", not minutes.
const DURATION_RE =
  /\b\d+[\s-]*(?:min(?:ute)?s?|seconds?|breaths?)\b|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty)[\s-]+(?:slow\s+|deep\s+)?(?:minute|second|breath)|\b(?:a|one)\s+(?:minute|moment)\b|\bminutes?\b|\bbreaths?\b/i
const REPETITION_RE =
  /\b(?:repeat|say|tap|read)\b[^.]{0,50}?\b(?:x\s*\d+|\d+\s*times|once|twice|three times|four times)\b|\bround\b|\bx\s*\d\b|repeat (?:x\s*)?\d/i

const VAGUE_CLAIM_RE =
  /you'?ll feel better|feel better (?:soon|fast|right away)|everything will be (?:fine|okay|ok)|all your problems (?:will )?(?:melt|disappear|vanish)|melt away your/i

// Genuine medical CLAIMS only. Deliberately narrow: reflective mindset content
// legitimately discusses diagnoses, anxiety, and health as TOPICS ("a journal
// prompt for health anxiety", "what does this diagnosis explain") — those are
// not medical advice. Only an actual treatment/cure claim or telling the reader
// to stop their medication counts.
const MEDICAL_ADVICE_RE =
  /\b(this (?:practice|tapping|ritual).{0,20}(?:cures?|will heal|will cure)|cures? your|will cure your|replaces? (?:your )?medication|instead of (?:your )?medication|stop taking your (?:medication|medicine|pills|prescription)|a substitute for (?:medical|professional))/i

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []   // blocking — un-publish
  const flags: string[] = []     // non-blocking — keep + flag
  const text = bodyText(ctx.body)

  // Clear instructions are the hard makeability bar for a practice.
  const hasInstructions = hasActionableSteps(ctx) || wordCount(text) >= 60
  if (!hasInstructions) {
    reasons.push('no clear practice instructions')
  }
  if (VAGUE_CLAIM_RE.test(text)) {
    reasons.push('vague feel-good claim (e.g. "you\'ll feel better")')
  }
  if (MEDICAL_ADVICE_RE.test(text)) {
    reasons.push('contains medical advice (not allowed in a mindset practice)')
  }
  // Duration is a FLAG, not a blocker: many journal-prompt practices are
  // open-ended by design and remain fully performable without a stated time.
  // We do NOT require a "what to expect" section either — the locked
  // mindset-voice rule bans the vague "what you might notice" lists that would
  // satisfy it. Both would mean un-publishing makeable, curated practices.
  const hasDuration =
    DURATION_RE.test(text) || REPETITION_RE.test(text) || (ctx.timeMinutes ?? 0) > 0
  if (!hasDuration) {
    flags.push('no duration / repetition count stated (open-ended practice)')
  }
  return compose(ctx, 'mindset:practice', reasons, flags)
}
