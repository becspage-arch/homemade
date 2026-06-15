import { craftRule, type CategoryRule } from './shared.js'

/** Home + repair: fix-it PATTERN / PROJECT + TECHNIQUE rows must carry steps;
 *  guide prose leans on the generic checks. */
export const rule: CategoryRule = {
  slug: 'home-repair',
  check: craftRule(),
}
