import {
  bodyText, compose, hasActionableSteps,
  hasQuantifiedIngredients, hasTiming, hasYield,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * RECIPE (cooking, baking, natural-home). Needs a quantified ingredients list,
 * a method (prose method counts — see interpretation note in shared.ts), a
 * stated yield, and at least one timing signal.
 *
 * We do NOT add a secondary "too few action verbs" gate on top of
 * hasActionableSteps: a simple recipe (a two-line salad assembly) is fully
 * makeable, and counting action-verb sentences over-failed those. hasYield and
 * hasTiming scan both the metadata columns and the body prose ("Makes 10",
 * "bake 12 to 15 minutes").
 */
export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)

  if (!hasQuantifiedIngredients(ctx.body)) {
    reasons.push('no ingredients list with quantities')
  }
  if (!hasActionableSteps(ctx)) {
    reasons.push('no method / steps')
  }
  if (!hasYield(ctx, text)) {
    reasons.push('no yield (servings / quantity)')
  }
  if (!hasTiming(ctx, text)) {
    reasons.push('no prep or cook time')
  }
  return compose(ctx, `${ctx.categorySlug}:recipe`, reasons)
}
