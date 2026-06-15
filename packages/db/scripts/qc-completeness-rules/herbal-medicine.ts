import { recipeRule, type CategoryRule } from './shared.js'

/** Herbal-medicine: REMEDY rows need ingredients + a preparation method.
 *  Yield / timing is not required — remedies carry shelf-life instead of
 *  servings, and HERB_PROFILE rows are reference prose (generic checks only). */
export const rule: CategoryRule = {
  slug: 'herbal-medicine',
  check: recipeRule({ requireYieldTiming: false }),
}
