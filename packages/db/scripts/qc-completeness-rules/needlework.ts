import { textilePatternRule, type CategoryRule } from './shared.js'

/** Needlework: PATTERN rows need row/round instructions UNLESS they are a
 *  counted discipline (blackwork / needlepoint / hardanger / sashiko), which
 *  express stitches on a chart grid rather than written rows — those are
 *  exempt from the row/round check inside textilePatternRule. */
export const rule: CategoryRule = {
  slug: 'needlework',
  check: textilePatternRule(),
}
