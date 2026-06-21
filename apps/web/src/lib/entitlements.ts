/**
 * Premium entitlement — the single source of truth for "is this user premium".
 *
 * `hasPremium(user)` is the one check every gate consults: Studio on premium
 * content, all printing / downloading, the cooking + baking planning suite,
 * create-your-own, and designer content. It reads `User.premiumActive`, the
 * boolean the admin user page toggles today and Stripe billing (Session F)
 * will populate from webhooks alongside `premiumSince` / `premiumUntil`.
 *
 * `premiumUntil` is honoured defensively: if billing ever sets it and the date
 * has passed, the user is treated as lapsed even if `premiumActive` wasn't
 * flipped back yet. Until Session F wires it, `premiumUntil` is null and the
 * check is simply `premiumActive`.
 *
 * Pure function with no server-only imports, so it's safe to call from server
 * components, route handlers, server actions, and (with the fields passed in)
 * client code too.
 */

export interface PremiumEntitlementFields {
  premiumActive?: boolean | null
  premiumUntil?: Date | null
}

export function hasPremium(user: PremiumEntitlementFields | null | undefined): boolean {
  if (!user) return false
  if (!user.premiumActive) return false
  if (user.premiumUntil && user.premiumUntil.getTime() < Date.now()) return false
  return true
}
