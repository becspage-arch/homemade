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

/**
 * Whether a piece of content is premium-gated — the single cross-craft,
 * cross-category rule. Content is premium when EITHER it carries the explicit
 * `premium` flag (creator content, premium-tier patterns) OR it is
 * independent-designer content (any designer that is not the Homemade house
 * designer — the separate library that funds the designer revenue share).
 *
 * Every craft and category consults this so the line never drifts: a crochet /
 * cross-stitch / knitting / needlework / sewing pattern passes `{ premium,
 * designer }`; a cooking / baking recipe passes just `{ premium }` (no
 * designer relation, so the flag alone decides — for library recipes the flag
 * is derived from whether the recipe is creator content rather than house
 * content). The pattern page preview, the grid badge, the Studio, and the
 * print/download routes all read the same answer.
 *
 * NOTE: printing / downloading is a *universal* premium action regardless of
 * this — gate those on `hasPremium` directly, not on `isPremiumContent`.
 */
export interface PremiumContentFields {
  premium?: boolean | null
  designer?: { isHouseDesigner?: boolean | null } | null
}

/** Independent-designer / creator content = any non-house designer. */
export function isIndependentDesignerContent(
  content: Pick<PremiumContentFields, 'designer'> | null | undefined,
): boolean {
  return Boolean(content?.designer && content.designer.isHouseDesigner === false)
}

export function isPremiumContent(content: PremiumContentFields | null | undefined): boolean {
  if (!content) return false
  return Boolean(content.premium) || isIndependentDesignerContent(content)
}

/** Does this viewer get full (non-preview) access to this content? */
export function canAccessPremiumContent(
  user: PremiumEntitlementFields | null | undefined,
  content: PremiumContentFields | null | undefined,
): boolean {
  return !isPremiumContent(content) || hasPremium(user)
}
