import { craftRule, type CategoryRule } from './shared.js'

/** Sewing: PATTERN + TECHNIQUE rows must carry construction steps (a list, a
 *  method heading, or an imperative step run). Sewing patterns are step-led,
 *  not row/round-led, so the craft rule is the right shape. */
export const rule: CategoryRule = {
  slug: 'sewing',
  check: craftRule(),
}
