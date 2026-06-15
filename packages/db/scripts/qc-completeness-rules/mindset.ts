import { proseRule, type CategoryRule } from './shared.js'

/**
 * Mindset: PRACTICE + READING rows are short scripts (affirmations, tapping
 * sequences, rituals, journal prompts). They carry no steps-list contract, so
 * the rule is generic checks plus a low thin-prose floor. The floor is kept
 * low (30 words) so legitimately short verbatim energy statements / single
 * affirmations are not flagged — the generic NaN / undefined / placeholder /
 * empty-body checks do the real work here.
 */
export const rule: CategoryRule = {
  slug: 'mindset',
  check: proseRule({ minWords: 30 }),
}
