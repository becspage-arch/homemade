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
  | 'SEWING_PERSONALISATION'
  | 'SEWING_PERSONALISATION_LAYERED_PDF'
  | 'SEWING_HACK_COMPOSER'
  | 'SEWING_PATTERN_COMBINATION'

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
  SEWING_PERSONALISATION: {
    message:
      'Personalising a sewing pattern to your exact measurements is part of Homemade Premium.',
    rationale:
      'You can keep using the showcase patterns at standard sizing for free, or upgrade to grade any design to your saved measurements.',
  },
  SEWING_PERSONALISATION_LAYERED_PDF: {
    message:
      'The layered PDF download is part of Homemade Premium.',
    rationale:
      'Premium nests your size alongside the adjacent standard sizes on a single PDF so you can grade between sizes for a closer fit.',
  },
  SEWING_HACK_COMPOSER: {
    message:
      'The visual hack composer is part of Homemade Premium.',
    rationale:
      'Premium lets you lengthen, shorten, swap sleeves, change necklines, and add pockets to a design without drafting from scratch.',
  },
  SEWING_PATTERN_COMBINATION: {
    message:
      'Combining two patterns into one is part of Homemade Premium.',
    rationale:
      'Premium lets you take the sleeve from one design and the body from another so the finished pattern fits your idea, not a single template.',
  },
}

/**
 * Read the gate's display copy without consulting the feature flag.
 * Stub routes that always show the copy (e.g. hack composer "Coming soon")
 * use this so the user sees the gate rationale even before
 * STUDIO_PREMIUM_GATING_ENABLED flips on.
 */
export function getStudioGateCopy(feature: StudioGateFeature): {
  message: string
  rationale: string
} {
  return COPY[feature]
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
