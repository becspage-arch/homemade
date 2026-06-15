import { textilePatternRule, type CategoryRule } from './shared.js'

/** Crochet: PATTERN rows must carry real row/round instructions and a
 *  non-broken foundation chain. This is the category where the autopilot
 *  shipped ~73% skeletons (NaN, undefined, "instructions go here"). */
export const rule: CategoryRule = {
  slug: 'crochet',
  check: textilePatternRule(),
}
