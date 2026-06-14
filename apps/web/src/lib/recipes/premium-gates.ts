/**
 * Premium gating for the recipe surfaces.
 *
 * Mirrors the Pattern Studio gate shape (`lib/studio/premium-gates.ts`): every
 * gate ships allowed-by-default until the config flag flips, so the upload /
 * community / meal-plan / shopping-list workers find the gates already wired
 * and only have to flip one boolean plus a per-user `isPremium` check.
 *
 * Default OFF per the build-to-free-quality lock. This worker lays the gates;
 * a later worker (the premium-setup phase) flips them. The stub routes for each
 * surface read the gate COPY directly so the reader sees the rationale even
 * while gating is off.
 *
 * The renderer surfaces a gated feature as a calm inline block, never a popup:
 * one explanatory sentence + a single "Upgrade to Homemade Premium" CTA. No
 * urgency, no scarcity.
 */

export const RECIPE_PREMIUM_GATING_ENABLED = false

export type RecipeGateFeature =
  | 'RECIPE_UPLOAD'
  | 'COMMUNITY_RECIPES'
  | 'MEAL_PLANNING'
  | 'SHOPPING_LIST'

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
