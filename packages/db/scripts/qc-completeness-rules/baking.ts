import { recipeRule, type CategoryRule } from './shared.js'

/** Baking: same recipe contract as cooking — ingredients + method + yield or
 *  timing. This is the category the 2026-05 empty-ingredients regression hit. */
export const rule: CategoryRule = {
  slug: 'baking',
  check: recipeRule({ requireYieldTiming: true }),
}
