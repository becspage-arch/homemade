import {
  bodyText, compose, hasEquipment, hasMissingIngredientAmount, hasOrderedMethod,
  hasQuantifiedIngredients, hasTiming, hasYield, ingredientNames,
  methodReferencesIngredients, type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * RECIPE (cooking, baking, natural-home, herbal-medicine where REMEDY isn't
 * applicable) — the "RECIPE" checklist section, every item a hard block.
 *
 * Two checklist lines are render-time derivations the public page computes from
 * the ingredient list: allergen tags and dietary tags are auto-detected from the
 * Ingredient table at index time, not authored per row. The verifiable bar for
 * them is therefore "the ingredient list carries named ingredients the detector
 * can run on" — enforced via ingredientNames(). Requiring a populated
 * dietaryFlags column would gate on a derived field that only ~36% of live rows
 * carry, which is a data-model gap, not an unmakeable recipe. This is documented
 * in the hand-off as the one place the rule checks the derivation's SOURCE.
 */
export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)

  if (!hasQuantifiedIngredients(ctx.body)) {
    reasons.push('no ingredients list with quantities')
  }
  if (hasMissingIngredientAmount(ctx.body)) {
    reasons.push('an ingredient has a missing / null amount (and is not a "to taste" style item)')
  }
  if (!hasOrderedMethod(ctx)) {
    reasons.push('no ordered method steps with action verbs')
  }
  if (!methodReferencesIngredients(ctx, text)) {
    reasons.push('method does not reference the ingredients')
  }
  if (!hasYield(ctx, text)) {
    reasons.push('no yield (servings / quantity)')
  }
  if (!hasTiming(ctx, text)) {
    reasons.push('no prep / cook / total time')
  }
  if (!hasEquipment(ctx, text)) {
    reasons.push('no equipment / tools list')
  }
  // Allergen + dietary tags derive from named ingredients — the source must be
  // present for the detector to run.
  if (ingredientNames(ctx.body).length === 0) {
    reasons.push('no named ingredients (allergen + dietary tags cannot be auto-detected)')
  }

  return compose(ctx, `${ctx.categorySlug}:recipe`, reasons)
}
