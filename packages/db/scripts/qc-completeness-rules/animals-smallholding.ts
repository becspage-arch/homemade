import { craftRule, type CategoryRule } from './shared.js'

/** Animals + smallholding: how-to PATTERN / TECHNIQUE rows must carry steps;
 *  husbandry guide prose leans on the generic checks. */
export const rule: CategoryRule = {
  slug: 'animals-smallholding',
  check: craftRule(),
}
