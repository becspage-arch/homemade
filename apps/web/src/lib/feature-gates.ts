/**
 * Feature-gate helper.
 *
 * Single source of truth for "is this user allowed to use feature X". v1
 * gates every feature on "is the user logged in" — every signed-in user
 * gets the full surface. When the Stripe / RBAC / user-tier session lands
 * (Master Plan, premium-setup phase), this helper grows a `tier` check and
 * the listed Tier-B features start gating on it. Callers should already
 * be routing through this helper so the gate flips in one place.
 *
 * Usage:
 *
 *   const allowed = canUseChartFeature(user, 'chart.mark-stitch')
 *   if (!allowed) { ... show upsell ... }
 *
 * Today: every signed-in user gets every feature; anonymous users get
 * nothing. The function deliberately accepts the same `User | null` shape
 * that `getCurrentDbUser()` returns so callers can pass straight through.
 */

import type { User } from '@homemade/db'

/**
 * The feature surface the chart viewer exposes. Tier A features ship to
 * every signed-in user permanently. Tier B features ship to every signed-in
 * user today but are the candidates for premium gating once Stripe / RBAC
 * lands.
 *
 * Adding a new feature: add the slug here, route the call through
 * `canUseChartFeature`, and the eventual paid-tier work moves the slug
 * into the Tier B branch.
 */
export type ChartFeature =
  // Tier A — interaction essentials (never gated)
  | 'chart.view'
  | 'chart.zoom-pan'
  | 'chart.fullscreen'
  | 'chart.dark-mode'
  | 'chart.legend-highlight'
  | 'chart.view-toggle' // symbol-on-colour / symbol-only / colour-only
  // Tier B — future premium-gate candidates (allowed for all logged-in
  // users today, will be flipped to premium-only when paid tiers ship)
  | 'chart.mark-stitch'
  | 'chart.display-toggle' // stitched / remaining
  | 'chart.sync'
  | 'chart.print-pdf'
  | 'chart.palette-swap'
  | 'chart.magic-markers'
  | 'chart.notes'

/**
 * Returns true if the user can use the given chart feature.
 *
 * Today: returns true for any signed-in user; false for anonymous. When
 * paid tiers ship, the Tier B branch grows a `user.tier === 'PREMIUM'`
 * check.
 */
export function canUseChartFeature(
  user: Pick<User, 'id'> | null | undefined,
  _feature: ChartFeature,
): boolean {
  // Anonymous users cannot use any chart feature, including reading. The
  // chart node renderer enforces this at render time with a sign-in CTA;
  // this helper is the second line of defence for any caller that handles
  // its own gating (e.g. API routes).
  if (!user) return false

  // Today every signed-in user gets every feature. Tier B gating lands
  // in the Stripe / RBAC session — at that point this function flips to
  //
  //   if (TIER_B_FEATURES.has(feature)) return user.tier === 'PREMIUM'
  //
  // and the User model grows a `tier` field. The rest of the chart-viewer
  // code does not need to change.
  return true
}
