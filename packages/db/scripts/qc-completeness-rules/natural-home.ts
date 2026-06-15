import { recipeRule, type CategoryRule } from './shared.js'

/** Natural-home: RECIPE rows (soaps, cleaners, balms) need ingredients + a
 *  method. Yield / timing is not required — finished-product shelf life is the
 *  meaningful field here and is optional, so we don't gate on yield. */
export const rule: CategoryRule = {
  slug: 'natural-home',
  check: recipeRule({ requireYieldTiming: false }),
}
