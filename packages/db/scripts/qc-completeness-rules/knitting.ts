import { textilePatternRule, type CategoryRule } from './shared.js'

/** Knitting: PATTERN rows must carry real row/round instructions. ~78% of the
 *  published knitting patterns were skeletons at audit time. */
export const rule: CategoryRule = {
  slug: 'knitting',
  check: textilePatternRule(),
}
