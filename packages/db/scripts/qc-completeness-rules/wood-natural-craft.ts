import { craftRule, type CategoryRule } from './shared.js'

/** Wood + natural craft: PROJECT-style PATTERN rows and TECHNIQUE rows must
 *  carry steps; guide prose leans on the generic checks. */
export const rule: CategoryRule = {
  slug: 'wood-natural-craft',
  check: craftRule(),
}
