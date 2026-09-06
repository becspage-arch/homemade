/**
 * Planner premium gating, read at the call site via `hasPremium` — the single
 * entitlement check the whole app shares. The split:
 *   - the project queue (add / order / status) is a FREE signed-in carrot,
 *     like saving and progress sync, so those routes only require sign-in;
 *   - keeping a stash is also free, so the pattern page and the library card
 *     can count a chart's palette against what the maker owns;
 *   - the planner view, the cross-project materials roll-up, and the PDF
 *     export are premium, so they call this first.
 *
 * This gates directly on the user's entitlement; it deliberately does NOT go
 * through the studio feature-flag wrapper, so the planner is premium the moment
 * it ships rather than waiting on a separate flag flip.
 */

import { hasPremium } from '@/lib/entitlements'
import type { User } from '@homemade/db'

/** Calm copy the planner's upgrade prompts share. */
export const PLANNER_GATE_COPY = {
  message: 'The project and materials planner is part of Homemade Premium.',
  rationale:
    'Premium works out the floss you need across everything in your queue, counts it against the skeins in your stash, and shows what is left to buy.',
} as const

export const PLANNER_EXPORT_GATE_COPY = {
  message: 'Downloading your plan is part of Homemade Premium.',
  rationale:
    'Premium saves your planner and shopping list as a clean PDF you can print and take to the shop.',
} as const

/** True when the maker may use the premium planner surfaces. */
export function canUsePlanner(user: User | null): boolean {
  return hasPremium(user)
}
