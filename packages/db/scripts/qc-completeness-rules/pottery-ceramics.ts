import { craftRule, type CategoryRule } from './shared.js'

/** Pottery + ceramics: hand-building / throwing / glazing PATTERN + TECHNIQUE
 *  rows must carry steps; guide prose leans on the generic checks. */
export const rule: CategoryRule = {
  slug: 'pottery-ceramics',
  check: craftRule(),
}
