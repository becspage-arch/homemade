/**
 * Premium gating for the recipe surfaces.
 *
 * Gating is LIVE (the premium framework shipped). `checkRecipeGate` enforces
 * against a per-user `isPremium` resolved from `hasPremium(user)`; callers pass
 * the real value, not a hardcoded false. The cooking + baking planning suite —
 * recipe scaling, the meal-plan calendar, and the shopping-list generator — is
 * premium. Viewing recipes, tin conversion, ingredient substitution, and
 * region/unit derivation stay free for everyone.
 *
 * Printing / downloading any recipe, list, or plan is handled by the universal
 * print/download gate in `@/components/premium`, not a feature flag here.
 *
 * The renderer surfaces a gated feature as a calm inline block, never a popup:
 * one explanatory sentence + a single "Upgrade to Homemade Premium" CTA. No
 * urgency, no scarcity.
 */

export const RECIPE_PREMIUM_GATING_ENABLED = true

export type RecipeGateFeature =
  | 'RECIPE_UPLOAD'
  | 'COMMUNITY_RECIPES'
  | 'MEAL_PLANNING'
  | 'SHOPPING_LIST'
  | 'RECIPE_SCALING'

interface UserContext {
  signedIn: boolean
  isPremium?: boolean
}

export interface RecipeGateResult {
  allowed: boolean
  feature: RecipeGateFeature
  message: string
  rationale: string
}

const COPY: Record<RecipeGateFeature, { message: string; rationale: string }> = {
  RECIPE_UPLOAD: {
    message: 'Uploading your own recipes is part of Homemade Premium.',
    rationale:
      'Premium lets you save your recipes to Homemade, photograph them, and keep them alongside the library.',
  },
  COMMUNITY_RECIPES: {
    message: 'Browsing other Makers’ recipes is part of Homemade Premium.',
    rationale:
      'Premium opens the community recipe collection; the full Homemade library stays free for everyone.',
  },
  MEAL_PLANNING: {
    message: 'The meal-plan calendar is part of Homemade Premium.',
    rationale:
      'Premium lets you slot recipes into a weekly plan and carry it across your devices.',
  },
  SHOPPING_LIST: {
    message: 'The shopping-list generator is part of Homemade Premium.',
    rationale:
      'Premium turns any recipe or meal plan into an aisle-sorted shopping list with quantities combined.',
  },
  RECIPE_SCALING: {
    message: 'Scaling a recipe up or down is part of Homemade Premium.',
    rationale:
      'Premium rescales every ingredient to the batch you want; the recipe stays free to read at its written amounts.',
  },
}

/**
 * Read a gate's display copy without consulting the feature flag. The stub
 * "Coming soon" routes use this so the rationale shows before
 * RECIPE_PREMIUM_GATING_ENABLED flips on.
 */
export function getRecipeGateCopy(feature: RecipeGateFeature): {
  message: string
  rationale: string
} {
  return COPY[feature]
}

export function checkRecipeGate(
  feature: RecipeGateFeature,
  user: UserContext,
): RecipeGateResult {
  if (!RECIPE_PREMIUM_GATING_ENABLED) {
    return { allowed: true, feature, message: '', rationale: '' }
  }
  if (user.isPremium) {
    return { allowed: true, feature, message: '', rationale: '' }
  }
  const copy = COPY[feature]
  return { allowed: false, feature, message: copy.message, rationale: copy.rationale }
}
