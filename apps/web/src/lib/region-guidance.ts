/**
 * Region guidance composer — turns a tutorial's technical climate fields
 * into the friendly "Where this works best" card OR signals that the
 * renderer should silently customise the body to the user's location.
 *
 * Phase location_climate_paper_001.
 *
 * Authors never write the guidance English — they fill in the structured
 * fields (climateZones, hemisphere, frostSensitivity, primaryRegionWrittenFor,
 * alsoGrowsIn). This module composes the right English from those fields.
 *
 * Decision tree:
 *
 *   1. Tutorial has no region metadata at all
 *      → mode='none'. Renderer emits nothing.
 *
 *   2. Tutorial has region metadata, user has no location set
 *      → mode='card'. Renderer shows the collapsible
 *        "Where this works best" card.
 *
 *   3. Tutorial has region metadata, user has location set
 *      → mode='silent'. Renderer hides the card and (in a follow-up
 *        worker) rewrites month tokens + frost-date copy to match the
 *        user's hemisphere / last-frost date.
 *
 * Per the project clarification (2026-06-03): everyone gets the silent
 * customisation when their location is set; the friendly card is what
 * shows when location is unset, regardless of plan tier. Premium gating
 * is a future config flag, not built-in renderer logic.
 */

export interface RegionGuidanceTutorial {
  hemisphere: string | null
  climateZones: string[]
  primaryRegionWrittenFor: string | null
  alsoGrowsIn: string | null
  frostSensitivity: string | null
  dayLengthSensitive: boolean
}

export interface RegionGuidanceUser {
  homeCountryCode: string | null
  hemisphere: string | null
  koppenZone: string | null
}

export type RegionGuidanceMode = 'none' | 'card' | 'silent'

export interface RegionGuidanceCardProps {
  /** Single-line summary shown when the disclosure is collapsed. */
  collapsedSummary: string
  /** Line one of the expanded body. */
  bestForLine: string
  /** Line two of the expanded body. */
  alsoWorksLine: string
  /** Line three of the expanded body. */
  trickierLine: string
  /** Lines of the "how to adjust" list — verbatim copy from the brief. */
  adjustmentBullets: string[]
  /** Final closing line, including the frost-date pointer. */
  frostHint: string
}

/**
 * Lightweight banner shown above the body in silent mode when the
 * reader's hemisphere doesn't match the tutorial's. Sits in for the
 * full body-prose rewrite (Feb-Mar → Aug-Sep) until the author-side
 * month-token convention is locked in a follow-up worker.
 */
export interface RegionGuidanceSilentBanner {
  message: string
}

export interface RegionGuidance {
  mode: RegionGuidanceMode
  card?: RegionGuidanceCardProps
  silentBanner?: RegionGuidanceSilentBanner
}

/**
 * Default fallback strings for tutorials that have some climate metadata
 * but haven't filled in primaryRegionWrittenFor / alsoGrowsIn. The
 * backfill script ensures every GROWING_GUIDE row has these set, so
 * the fallbacks here only ever hit for non-gardening tutorials that
 * gained climate metadata later.
 */
const DEFAULT_PRIMARY_REGION = 'UK & Northern Europe'
const DEFAULT_ALSO_GROWS_IN =
  'most of the US, Canada, Australia, New Zealand, South Africa, parts of Japan'

const TRICKIER_LINE = 'Trickier in the tropics, true desert, and very high altitude.'

const ADJUSTMENT_BULLETS: readonly string[] = [
  'US and Canada: similar months, but the south runs a few weeks ahead of the UK and the north runs a few weeks behind. When in doubt, use your local last-frost date.',
  "Australia, New Zealand, South Africa: it's the opposite season. When we say March, read September. When we say October, read April.",
  'Mediterranean or hot-dry climates (southern Europe, California, Texas, much of Australia): start a few weeks earlier and add shade or water in the strongest summer sun.',
  'Cold or short-season climates (Scandinavia, much of Canada, northern US, Highland Scotland): start a few weeks later, and wait for your last frost before putting tender plants outside.',
]

const FROST_HINT =
  "Don't know your frost date? Search '[your town] last frost date' to find the date after which it's safe to plant anything tender outside."

/**
 * Compose region guidance for a tutorial / user pair.
 *
 * Pure function, server-renderable. No side-effects.
 */
export function composeRegionGuidance(
  tutorial: RegionGuidanceTutorial,
  user: RegionGuidanceUser | null,
): RegionGuidance {
  const hasRegionMetadata =
    (tutorial.climateZones && tutorial.climateZones.length > 0) ||
    Boolean(tutorial.primaryRegionWrittenFor) ||
    Boolean(tutorial.hemisphere)

  if (!hasRegionMetadata) {
    return { mode: 'none' }
  }

  const userHasLocation =
    Boolean(user?.homeCountryCode) ||
    Boolean(user?.hemisphere) ||
    Boolean(user?.koppenZone)

  if (userHasLocation) {
    // Silent customisation. The body-rewrite (Feb-Mar → Aug-Sep) ships
    // in a follow-up worker once the author convention for month tokens
    // is locked. For now we hide the card, and emit a one-line banner
    // when the reader's hemisphere doesn't match the tutorial's so the
    // months still make sense.
    const tutorialHemisphere = tutorial.hemisphere ?? null
    const userHemisphere = user?.hemisphere ?? null
    if (
      tutorialHemisphere &&
      userHemisphere &&
      tutorialHemisphere !== userHemisphere
    ) {
      const fromLabel =
        tutorialHemisphere === 'N' ? 'the northern hemisphere' : 'the southern hemisphere'
      return {
        mode: 'silent',
        silentBanner: {
          message: `Months in this guide are written for ${fromLabel}. For your hemisphere, shift each month six months forward (March becomes September, October becomes April).`,
        },
      }
    }
    return { mode: 'silent' }
  }

  const primary = tutorial.primaryRegionWrittenFor?.trim() || DEFAULT_PRIMARY_REGION
  const also = tutorial.alsoGrowsIn?.trim() || DEFAULT_ALSO_GROWS_IN

  return {
    mode: 'card',
    card: {
      collapsedSummary: `Written for ${primary}. Tap to see how to adjust if you're elsewhere.`,
      bestForLine: `Best for: ${primary}.`,
      alsoWorksLine: `Also works well in: ${also}.`,
      trickierLine: TRICKIER_LINE,
      adjustmentBullets: [...ADJUSTMENT_BULLETS],
      frostHint: FROST_HINT,
    },
  }
}
