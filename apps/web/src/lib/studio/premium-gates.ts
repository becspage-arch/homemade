/**
 * Premium gating wrappers for the Pattern Studio.
 *
 * Now that the entitlement primitive exists (`hasPremium` reading
 * `User.premiumActive`), the surviving gates here are the ones that genuinely
 * stay premium under the locked model. The free-tier gates that contradicted
 * "the free Studio is the full product" — multi-pattern save, brand swap,
 * fabric counts, palette size, custom paper sizes, cross-device sync — have
 * been removed (sync is a free signed-in carrot; the rest are free on screen,
 * with only printing/downloading premium via the universal print/download
 * gate in `@/components/premium`).
 *
 * Surviving gate inventory:
 *   PHOTO_TO_CHART          — create-your-own (photo → stitchable chart)
 *   CROCHET_*               — crochet create-your-own (photo to tapestry, the
 *                             amigurumi designer, and designing from an idea).
 *                             Enforced with `hasPremium` + PremiumOverlay at the
 *                             call site the same way cross-stitch's is; the copy
 *                             lives here so every craft's gate reads alike.
 *   KNITTING_CUSTOM_FIT     — regrading a knitting pattern to the maker's own
 *                             measurements and swatch gauge. Every standard
 *                             size stays free on screen; only the maker's own
 *                             size is premium, so the gate sits on the output,
 *                             not on typing the measurements in.
 *   KNITTING_IDEA_TO_PATTERN — knitting's create-your-own, the twin of
 *                             CROCHET_IDEA_TO_PATTERN. Copy lives here ready
 *                             for the surface that will use it.
 *   PUBLIC_SUBMISSION       — designer-side, funds the revenue share
 *   SEWING_*                — sewing personalisation / hack composer (handled
 *                             in the sewing category's own sign-off pass)
 *
 * Cross-stitch print/download + photo-to-chart enforcement reads `hasPremium`
 * directly at the call site (server routes + Studio shell). This module stays
 * the mechanism the sewing surfaces already consume; flipping
 * STUDIO_PREMIUM_GATING_ENABLED is left to the sewing sign-off so it doesn't
 * activate sewing's gates early.
 *
 * The renderer surfaces a gated feature as a soft inline block (NOT a popup
 * modal): calm explanation + a single "Upgrade to Homemade Premium" CTA. No
 * urgency tactics, no scarcity language.
 */

export const STUDIO_PREMIUM_GATING_ENABLED = false

export type StudioGateFeature =
  | 'PHOTO_TO_CHART'
  | 'IDEA_TO_CHART'
  | 'CROCHET_PHOTO_TO_TAPESTRY'
  | 'CROCHET_AMIGURUMI_DESIGNER'
  | 'CROCHET_IDEA_TO_PATTERN'
  | 'KNITTING_CUSTOM_FIT'
  | 'KNITTING_IDEA_TO_PATTERN'
  | 'PUBLIC_SUBMISSION'
  | 'SEWING_PERSONALISATION'
  | 'SEWING_PERSONALISATION_LAYERED_PDF'
  | 'SEWING_HACK_COMPOSER'
  | 'SEWING_PATTERN_COMBINATION'

interface UserContext {
  signedIn: boolean
  isPremium?: boolean
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
  IDEA_TO_CHART: {
    message: 'Designing a pattern from an idea is a Homemade Premium feature.',
    rationale: 'Premium draws your idea, lets you regenerate until you love it, then turns it into your own stitchable chart.',
  },
  CROCHET_PHOTO_TO_TAPESTRY: {
    message: 'Turning a photo into a tapestry pattern is a Homemade Premium feature.',
    rationale:
      'Premium reads your photo into a grid of coloured stitches, names the yarns, and writes the rows out for you.',
  },
  CROCHET_AMIGURUMI_DESIGNER: {
    message: 'The amigurumi designer is a Homemade Premium feature.',
    rationale:
      'Premium lets you pick the creature, the size and the yarns, then writes the round-by-round pattern and makes a photo of the finished piece.',
  },
  CROCHET_IDEA_TO_PATTERN: {
    message: 'Designing a crochet pattern from a description is a Homemade Premium feature.',
    rationale:
      'Premium talks the idea through with you, then writes a pattern whose every stitch has been checked before you cast on.',
  },
  KNITTING_CUSTOM_FIT: {
    message: 'Fitting a knitting pattern to your own measurements is a Homemade Premium feature.',
    rationale:
      'Every standard size is free to work on screen. Premium reworks the whole pattern to your measurements and your swatch gauge, so the stitch counts are yours.',
  },
  KNITTING_IDEA_TO_PATTERN: {
    message: 'Designing a knitting pattern from a description is a Homemade Premium feature.',
    rationale:
      'Premium talks the idea through with you, then writes a pattern whose every stitch has been checked before you cast on.',
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
  const copy = COPY[feature]
  return { allowed: false, feature, message: copy.message, rationale: copy.rationale }
}
