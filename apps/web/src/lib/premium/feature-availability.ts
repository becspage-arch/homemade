/**
 * Premium feature availability — the single switchboard for what the /premium
 * page is allowed to advertise.
 *
 * Rule (Stripe go-live + our own): the page must never promise a premium
 * feature that isn't actually live. Each premium feature is marked `live` or
 * `coming` here; the /premium cards AND the comparison table render only the
 * `live` ones and hide the rest. When a feature ships, flip its one line to
 * `live` and it appears on the page on the next deploy — no other edit needed.
 *
 * FREE features are not listed here. They're always shown (they're already
 * live) and are tagged `free` on the comparison rows instead.
 *
 * Pure constants only — safe to import from server components and the client
 * pricing component alike.
 */

export type FeatureStatus = 'live' | 'coming'

/**
 * Stable keys for every premium feature that appears (or will appear) on
 * /premium. The value is whether it's live yet.
 *
 * Live today: the cooking/baking planning suite, the cross-stitch create-a-
 * pattern-from-a-photo flow, the project + materials planner, and the universal
 * download/print action. Everything else is built behind it and flips on as it
 * ships.
 */
export const PREMIUM_FEATURE_STATUS = {
  // Universal — live across the signed-off categories.
  downloads: 'live',

  // Cooking + baking planning suite — live.
  recipeScaling: 'live',
  mealPlanner: 'live',
  shoppingList: 'live',

  // Cross-stitch — live.
  photoToChart: 'live',
  projectPlanner: 'live',

  // Built but not yet live — hidden from /premium until they ship.
  grading: 'coming',
  designAPattern: 'coming',
  aiAssistant: 'coming',
  makeAThons: 'coming',
  // Reference-category personalisation (garden/home/herbal/… planners,
  // calculators, journals). Flip on as each reference category signs off.
  referencePlanners: 'coming',
  referenceCalculators: 'coming',
  referenceJournals: 'coming',
  // Independent-designer library. Stays hidden until at least 5 designers are
  // onboarded; flip to 'live' then (or wire to a live designer count).
  designerLibrary: 'coming',
} as const satisfies Record<string, FeatureStatus>

export type PremiumFeatureKey = keyof typeof PREMIUM_FEATURE_STATUS

/** True when a premium feature is live and may be advertised on /premium. */
export function isFeatureLive(key: PremiumFeatureKey): boolean {
  return PREMIUM_FEATURE_STATUS[key] === 'live'
}
