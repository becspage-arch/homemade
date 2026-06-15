import { recipeRule, type CategoryRule } from './shared.js'

/** Cooking: RECIPE rows must carry ingredients, a method, and a realistic
 *  yield or timing signal. TECHNIQUE rows must explain the technique. */
export const rule: CategoryRule = {
  slug: 'cooking',
  check: recipeRule({ requireYieldTiming: true }),
}
