import { craftRule, type CategoryRule } from './shared.js'

/** Paper + word (bookbinding, calligraphy, papercraft): PATTERN + TECHNIQUE
 *  rows must carry steps; guide / history prose leans on the generic checks. */
export const rule: CategoryRule = {
  slug: 'paper-word',
  check: craftRule(),
}
