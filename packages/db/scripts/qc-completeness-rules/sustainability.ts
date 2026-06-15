import { craftRule, type CategoryRule } from './shared.js'

/** Sustainability: project / how-to PATTERN + TECHNIQUE rows must carry steps;
 *  explainer prose leans on the generic checks. */
export const rule: CategoryRule = {
  slug: 'sustainability',
  check: craftRule(),
}
