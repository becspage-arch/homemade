/**
 * Premium gating wrappers for the Pattern Studio.
 *
 * v1 ships every feature for free — every gate below returns `allowed: true`
 * until the config flag flips. The wrappers exist now so future phases
 * never have to refactor: flipping `STUDIO_PREMIUM_GATING_ENABLED` to
 * true plus a per-user `isPremium` check is all it takes.
 *
 * Gate inventory (per spec Part 10):
 *   PHOTO_TO_CHART          — turning a photo into a pattern
 *   MULTI_PATTERN_SAVE      — saving more than 1 pattern to My Patterns
 *   BRAND_SWAP              — DMC ↔ Anchor ↔ Madeira reassignment
 *   CROSS_DEVICE_SYNC       — server-side progress sync
 *   FABRIC_ABOVE_18CT       — fabric counts above 18ct
 *   PALETTE_ABOVE_24        — pattern colour count above 24
 *   CUSTOM_PAPER_SIZES      — Letter / Legal / A3 PDF export
 *   PUBLIC_SUBMISSION       — submitting a pattern to the public library
 *
 * The renderer surfaces a gated feature as a soft inline block (NOT a
 * popup modal): calm explanation + a single "Upgrade to Homemade
 * Premium" CTA. No urgency tactics, no scarcity language.
 */

export const STUDIO_PREMIUM_GATING_ENABLED = false

export type StudioGateFeature =
  | 'PHOTO_TO_CHART'
  | 'MULTI_PATTERN_SAVE'
  | 'BRAND_SWAP'
  | 'CROSS_DEVICE_SYNC'
  | 'FABRIC_ABOVE_18CT'
  | 'PALETTE_ABOVE_24'
  | 'CUSTOM_PAPER_SIZES'
  | 'PUBLIC_SUBMISSION'

interface UserContext {
  signedIn: boolean
  isPremium?: boolean
  ownedPatternCount?: number
}

export interface GateResult {
  allowed: boolean
  feature: StudioGateFeature
  /** Short, calm sentence the upgrade block uses as its lead. */
  message: string
  /** A second sentence positioning the value (one sentence, no jargon). */
  rationale: string
}

const COPY: Record<StudioGateFeature, { message: string; rationale: string }> = {
  PHOTO_TO_CHART: {
    message: 'Photo-to-chart is a Homemade Premium feature.',
    rationale: 'Premium turns any photo into a stitchable pattern, palette-mapped to DMC, Anchor, or Madeira.',
  },
  MULTI_PATTERN_SAVE: {
    message: 'Save more than one pattern with Homemade Premium.',
    rationale: 'Premium gives you unlimited saved patterns plus cross-device progress sync.',
  },
  BRAND_SWAP: {
    message: 'Brand swapping is a Homemade Premium feature.',
    rationale: 'Premium swaps your pattern between DMC, Anchor, and Madeira with one click.',
  },
  CROSS_DEVICE_SYNC: {
    message: 'Cross-device progress sync is a Homemade Premium feature.',
    rationale: 'Premium keeps your stitched cells in sync across phone, tablet, and desktop.',
  },
  FABRIC_ABOVE_18CT: {
    message: 'High-count fabrics need Homemade Premium.',
    rationale: 'Premium unlocks 22, 25, and 28-count fabrics for finer stitching.',
  },
  PALETTE_ABOVE_24: {
    message: 'Palettes over 24 colours need Homemade Premium.',
    rationale: 'Premium unlocks rich-colour patterns up to 80 floss colours.',
  },
  CUSTOM_PAPER_SIZES: {
    message: 'Custom paper sizes need Homemade Premium.',
    rationale: 'Premium adds Letter, Legal, and A3 PDF exports alongside the standard A4.',
  },
  PUBLIC_SUBMISSION: {
    message: 'Submitting to the public library is a Homemade Premium feature.',
    rationale: 'Premium opens the path to publish your patterns to the Homemade library and start earning credits.',
  },
}

export function checkStudioGate(feature: StudioGateFeature, user: UserContext): GateResult {
  if (!STUDIO_PREMIUM_GATING_ENABLED) {
    return { allowed: true, feature, message: '', rationale: '' }
  }
  if (user.isPremium) {
    return { allowed: true, feature, message: '', rationale: '' }
  }
  // Per-feature business rules — applied only when gating is on.
  if (feature === 'MULTI_PATTERN_SAVE' && (user.ownedPatternCount ?? 0) === 0) {
    return { allowed: true, feature, message: '', rationale: '' }
  }
  const copy = COPY[feature]
  return { allowed: false, feature, message: copy.message, rationale: copy.rationale }
}
