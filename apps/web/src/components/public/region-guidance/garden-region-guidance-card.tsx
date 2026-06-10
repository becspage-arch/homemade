import type { ReactElement } from 'react'
import {
  deriveGardenRegions,
  formatMonthRange,
  type GardenRegionDerivationSpecies,
  type GardenRegionDerivationTutorial,
  type GardenRegionDerivationUser,
} from '@/lib/garden-region-derivation'

/**
 * Garden-specific "Where this works best" card.
 *
 * Composed from `deriveGardenRegions`. Free for every user per
 * [[feedback_premium_translation_is_free]] — no premium gate on month
 * translation or on the friendly hint copy.
 *
 * Visibility rules:
 *
 *   1. Same hemisphere AND user country matches the primary region:
 *      card hidden (the schedule already matches).
 *   2. Same hemisphere but different country / climate zone: card shows
 *      a friendly hint, no translation.
 *   3. Different hemisphere: card shows the translated months prominently.
 *   4. Anonymous user: card describes where it's written for and links
 *      out to general adjustment guidance.
 *
 * Server-rendered. Uses native `<details>` so it costs zero JS bytes
 * and is keyboard-accessible by default. The styling reuses the
 * existing `region-guidance-card` CSS class so the visual identity
 * stays consistent with the legacy card.
 */
export function GardenRegionGuidanceCard({
  tutorial,
  species,
  user,
}: {
  tutorial: GardenRegionDerivationTutorial
  species: GardenRegionDerivationSpecies
  user: GardenRegionDerivationUser | null
}): ReactElement | null {
  const derivation = deriveGardenRegions({ tutorial, species, user })

  const hasPlantingMonths = tutorial.plantingMonths.length > 0
  const hasHarvestMonths = tutorial.harvestMonths.length > 0
  const userIsAnonymous = !user

  if (derivation.needsHemisphereTranslation) {
    const sow = formatMonthRange(derivation.translatedPlantingMonths)
    const harvest = formatMonthRange(derivation.translatedHarvestMonths)
    return (
      <details
        className="region-guidance-card"
        data-testid="garden-region-guidance-card"
        data-mode="hemisphere-flip"
      >
        <summary>
          <span className="region-guidance-card-label">Where this works best</span>
          <span className="region-guidance-card-summary">
            Written for {derivation.primaryRegionWrittenFor}. Your hemisphere is opposite, so the schedule shifts.
          </span>
        </summary>
        <div className="region-guidance-card-body">
          <p>Written for {derivation.primaryRegionWrittenFor}.</p>
          {hasPlantingMonths && sow && (
            <p>For your hemisphere, sow {sow}.</p>
          )}
          {hasHarvestMonths && harvest && (
            <p>Harvest {harvest}.</p>
          )}
          <p>
            The months in the body are written for the original hemisphere. Read them as the same month six months on from your year.
          </p>
        </div>
      </details>
    )
  }

  if (userIsAnonymous) {
    return (
      <details
        className="region-guidance-card"
        data-testid="garden-region-guidance-card"
        data-mode="anonymous"
      >
        <summary>
          <span className="region-guidance-card-label">Where this works best</span>
          <span className="region-guidance-card-summary">
            Written for {derivation.primaryRegionWrittenFor}.
            {derivation.alsoGrowsIn ? ` Also grows in ${derivation.alsoGrowsIn}.` : ''}
          </span>
        </summary>
        <div className="region-guidance-card-body">
          <p>Best for {derivation.primaryRegionWrittenFor}.</p>
          {derivation.alsoGrowsIn && (
            <p>Also grows in {derivation.alsoGrowsIn}.</p>
          )}
          <p>
            Tell us where you garden to see the schedule for your location. Sign-in is free.
          </p>
        </div>
      </details>
    )
  }

  if (derivation.alsoGrowsIn) {
    return (
      <p
        className="region-guidance-silent-banner"
        data-testid="garden-region-guidance-banner"
      >
        Written for {derivation.primaryRegionWrittenFor}. Also grows in {derivation.alsoGrowsIn} on the same schedule.
      </p>
    )
  }

  return null
}
