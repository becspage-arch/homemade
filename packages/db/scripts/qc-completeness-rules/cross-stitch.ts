import { textilePatternRule, type CategoryRule } from './shared.js'

/** Cross-stitch: a counted discipline. PATTERN rows are chart-led, so the
 *  row/round check is skipped (cross-stitch is in COUNTED_NEEDLEWORK and most
 *  rows carry a chart). The generic checks still guard against leaked
 *  NaN / undefined / placeholder bodies. The 36 Stitching Mama patterns are
 *  Pattern rows, not Tutorial rows, so they are untouched by this gate. */
export const rule: CategoryRule = {
  slug: 'cross-stitch',
  check: textilePatternRule(),
}
