/**
 * Derive `regionsApplicable`, primary-region copy, and month-translation
 * for garden tutorials at render time.
 *
 * Replaces the author-set `Tutorial.regionsApplicable` array with a
 * computed answer drawn from three sources of truth:
 *
 *   - The tutorial's hardiness + climate metadata (`climateZones`,
 *     `usdaHardinessZones`, `rhsHardinessZones`, `frostSensitivity`,
 *     `growingMonthsByHemisphere`).
 *   - The master species row (`Species.usdaHardinessZone`,
 *     `koppenZone` if/when populated, `hemisphere` inferred from
 *     hardiness).
 *   - The user's coarse location (country code) which resolves against
 *     the `CountryClimate` lookup table for hemisphere + default Köppen
 *     + USDA / RHS zones.
 *
 * Authors leave `regionsApplicable` null in the upload JSON. The single
 * override case is `regionsApplicableOverride`, used when the derived
 * answer is wrong (e.g. an heirloom variety adapted outside the species'
 * normal hardiness range).
 *
 * Per [[feedback_premium_translation_is_free]] all month translation
 * and "Where this works best" composition stay free for every user —
 * there is no premium gate on this output. Postcode-personalized frost
 * alerts (which depend on per-user saved state) are the premium offer;
 * coarse derivation is free.
 *
 * Pure function, server-renderable. No side-effects, no I/O.
 */

const NORTHERN_MONTHS: readonly string[] = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

const MONTH_INDEX_BY_NAME: Map<string, number> = new Map(
  NORTHERN_MONTHS.map((name, index) => [name, index]),
)

const COUNTRY_GROUP_LABELS: Record<string, string> = {
  'UK': 'the United Kingdom',
  'UK_NEUROPE': 'the UK and Northern Europe',
  'EU_TEMPERATE': 'temperate Europe',
  'EU_MEDITERRANEAN': 'Mediterranean Europe',
  'US_NORTH': 'the northern United States',
  'US_SOUTH': 'the southern United States',
  'US': 'the United States',
  'CANADA': 'Canada',
  'AU_NZ': 'Australia and New Zealand',
  'SOUTHERN_AFRICA': 'southern Africa',
}

export interface GardenRegionDerivationTutorial {
  /** 'N' | 'S'. Hemisphere the schedule is written for. */
  hemisphere: string | null
  /** 'hardy' | 'half-hardy' | 'tender' | null. */
  frostSensitivity: string | null
  /** JSON map { N: ['feb', 'mar'], S: ['aug', 'sep'] } when set. */
  growingMonthsByHemisphere: Record<string, string[]> | null
  /** Köppen codes the tutorial is written for (['Cfb']). */
  climateZones: string[]
  /** USDA zones the schedule works for ([7, 8, 9]). */
  usdaHardinessZones: number[]
  /** RHS zones ('H4', 'H5'…). */
  rhsHardinessZones: string[]
  /** Author-written planting months ('march', 'april', ...). */
  plantingMonths: string[]
  /** Author-written harvest months. */
  harvestMonths: string[]
  /**
   * Author-set override. When non-empty, the derived `applicableRegions`
   * is ignored and these strings are used verbatim. Surfaces the existing
   * `Tutorial.regionsApplicable` column for backwards compatibility — the
   * 4 PUBLISHED tutorials carry legacy values here.
   */
  regionsApplicableOverride: string[] | null
}

export interface GardenRegionDerivationSpecies {
  /** USDA zones the species tolerates ('5', '8b'). */
  usdaHardinessZone: string[]
  /** RHS zones the species tolerates ('H4', 'H5'). */
  rhsHardinessZone: string[]
}

export interface GardenRegionDerivationUser {
  /** ISO 3166-1 alpha-2 country code, when known. */
  country: string | null
  /** 'N' | 'S' resolved from country. */
  hemisphere: string | null
}

export interface GardenRegionDerivation {
  /**
   * Country-group identifiers the schedule should cover. Plain strings
   * matching the keys in COUNTRY_GROUP_LABELS — friendly labels are
   * composed lower down.
   */
  applicableRegions: string[]
  /**
   * Human-readable label for the primary region the schedule is written
   * for. Composed from `applicableRegions[0]` or from the user-context
   * when nothing better is available.
   */
  primaryRegionWrittenFor: string
  /**
   * Plain-English description of the other regions where the schedule
   * works. Empty string when there's nothing useful to say.
   */
  alsoGrowsIn: string
  /** Planting months adjusted to the user's hemisphere when needed. */
  translatedPlantingMonths: string[]
  /** Harvest months adjusted to the user's hemisphere when needed. */
  translatedHarvestMonths: string[]
  /** True when the renderer should translate body month tokens silently. */
  needsHemisphereTranslation: boolean
}

/**
 * Compose the derived region answer.
 *
 * Default behaviour: take the tutorial's hemisphere as the primary
 * region; expand to other temperate / mediterranean / continental
 * regions from the species' hardiness range; translate planting and
 * harvest months when the user is in the opposite hemisphere.
 */
export function deriveGardenRegions(input: {
  tutorial: GardenRegionDerivationTutorial
  species: GardenRegionDerivationSpecies
  user: GardenRegionDerivationUser | null
}): GardenRegionDerivation {
  const { tutorial, species, user } = input

  if (
    tutorial.regionsApplicableOverride &&
    tutorial.regionsApplicableOverride.length > 0
  ) {
    return composeOverride(tutorial, user)
  }

  const tutorialHemisphere = (tutorial.hemisphere ?? 'N') as 'N' | 'S'
  const userHemisphere = (user?.hemisphere ?? null) as 'N' | 'S' | null
  const needsTranslation =
    userHemisphere !== null && userHemisphere !== tutorialHemisphere

  const applicableRegions = composeApplicableRegions({
    tutorial,
    species,
  })

  const primaryRegionWrittenFor = composePrimaryRegion({
    applicableRegions,
    tutorialHemisphere,
  })

  const alsoGrowsIn = composeAlsoGrowsIn({
    applicableRegions,
  })

  const translatedPlantingMonths = needsTranslation
    ? translateMonths({
        months: tutorial.plantingMonths,
        fromHemisphere: tutorialHemisphere,
        toHemisphere: userHemisphere,
        growingMonthsByHemisphere: tutorial.growingMonthsByHemisphere,
        kind: 'planting',
      })
    : [...tutorial.plantingMonths]

  const translatedHarvestMonths = needsTranslation
    ? translateMonths({
        months: tutorial.harvestMonths,
        fromHemisphere: tutorialHemisphere,
        toHemisphere: userHemisphere,
        growingMonthsByHemisphere: tutorial.growingMonthsByHemisphere,
        kind: 'harvest',
      })
    : [...tutorial.harvestMonths]

  return {
    applicableRegions,
    primaryRegionWrittenFor,
    alsoGrowsIn,
    translatedPlantingMonths,
    translatedHarvestMonths,
    needsHemisphereTranslation: needsTranslation,
  }
}

function composeApplicableRegions(input: {
  tutorial: GardenRegionDerivationTutorial
  species: GardenRegionDerivationSpecies
}): string[] {
  const { tutorial, species } = input
  const out: string[] = []

  const tutorialHemisphere = tutorial.hemisphere ?? 'N'
  const climateZones = new Set(tutorial.climateZones ?? [])
  const usdaZones = new Set([
    ...(tutorial.usdaHardinessZones ?? []).map((z) => String(z)),
    ...(species.usdaHardinessZone ?? []),
  ])
  const rhsZones = new Set([
    ...(tutorial.rhsHardinessZones ?? []),
    ...(species.rhsHardinessZone ?? []),
  ])

  if (tutorialHemisphere === 'N') {
    if (climateZones.has('Cfb') || rhsZones.has('H4') || rhsZones.has('H5')) {
      out.push('UK_NEUROPE')
    }
    const usdaNorth = ['3', '4', '5', '6'].some((z) => usdaZones.has(z))
    const usdaSouth = ['7', '8', '9', '10'].some((z) => usdaZones.has(z))
    if (usdaNorth) out.push('US_NORTH')
    if (usdaSouth) out.push('US_SOUTH')
    if (['3', '4', '5'].some((z) => usdaZones.has(z))) out.push('CANADA')
    if (climateZones.has('Csa') || climateZones.has('Csb')) {
      out.push('EU_MEDITERRANEAN')
    }
  } else {
    out.push('AU_NZ')
    if (rhsZones.has('H5') || rhsZones.has('H4')) {
      out.push('SOUTHERN_AFRICA')
    }
  }

  if (out.length === 0) {
    out.push(tutorialHemisphere === 'N' ? 'UK_NEUROPE' : 'AU_NZ')
  }

  return out
}

function composePrimaryRegion(input: {
  applicableRegions: string[]
  tutorialHemisphere: 'N' | 'S'
}): string {
  const first = input.applicableRegions[0]
  if (first) {
    const label = COUNTRY_GROUP_LABELS[first]
    if (label) return label
  }
  return (
    (input.tutorialHemisphere === 'N'
      ? COUNTRY_GROUP_LABELS.UK_NEUROPE
      : COUNTRY_GROUP_LABELS.AU_NZ) ?? 'temperate regions'
  )
}

function composeAlsoGrowsIn(input: { applicableRegions: string[] }): string {
  const rest = input.applicableRegions.slice(1)
  if (rest.length === 0) return ''
  const labels: string[] = []
  for (const key of rest) {
    const label = COUNTRY_GROUP_LABELS[key]
    if (label) labels.push(label)
  }
  if (labels.length === 0) return ''
  if (labels.length === 1) return labels[0] ?? ''
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`
  const last = labels[labels.length - 1] ?? ''
  return `${labels.slice(0, -1).join(', ')}, and ${last}`
}

function composeOverride(
  tutorial: GardenRegionDerivationTutorial,
  user: GardenRegionDerivationUser | null,
): GardenRegionDerivation {
  const tutorialHemisphere = (tutorial.hemisphere ?? 'N') as 'N' | 'S'
  const userHemisphere = (user?.hemisphere ?? null) as 'N' | 'S' | null
  const needsTranslation =
    userHemisphere !== null && userHemisphere !== tutorialHemisphere

  const applicableRegions = tutorial.regionsApplicableOverride ?? []
  const firstKey = applicableRegions[0]
  const primaryLabel = firstKey ? COUNTRY_GROUP_LABELS[firstKey] : undefined
  return {
    applicableRegions,
    primaryRegionWrittenFor:
      primaryLabel ??
      ((tutorialHemisphere === 'N'
        ? COUNTRY_GROUP_LABELS.UK_NEUROPE
        : COUNTRY_GROUP_LABELS.AU_NZ) ?? 'temperate regions'),
    alsoGrowsIn: composeAlsoGrowsIn({ applicableRegions }),
    translatedPlantingMonths: needsTranslation
      ? translateMonths({
          months: tutorial.plantingMonths,
          fromHemisphere: tutorialHemisphere,
          toHemisphere: userHemisphere,
          growingMonthsByHemisphere: tutorial.growingMonthsByHemisphere,
          kind: 'planting',
        })
      : [...tutorial.plantingMonths],
    translatedHarvestMonths: needsTranslation
      ? translateMonths({
          months: tutorial.harvestMonths,
          fromHemisphere: tutorialHemisphere,
          toHemisphere: userHemisphere,
          growingMonthsByHemisphere: tutorial.growingMonthsByHemisphere,
          kind: 'harvest',
        })
      : [...tutorial.harvestMonths],
    needsHemisphereTranslation: needsTranslation,
  }
}

function translateMonths(input: {
  months: string[]
  fromHemisphere: 'N' | 'S'
  toHemisphere: 'N' | 'S'
  growingMonthsByHemisphere: Record<string, string[]> | null
  kind: 'planting' | 'harvest'
}): string[] {
  if (input.fromHemisphere === input.toHemisphere) {
    return [...input.months]
  }

  const explicit = input.growingMonthsByHemisphere?.[input.toHemisphere]
  if (Array.isArray(explicit) && explicit.length > 0) {
    return [...explicit]
  }

  const out: string[] = []
  for (const month of input.months) {
    const idx = MONTH_INDEX_BY_NAME.get(month)
    if (typeof idx !== 'number') continue
    const shifted = NORTHERN_MONTHS[(idx + 6) % 12]
    if (shifted) out.push(shifted)
  }
  return out
}

/**
 * Friendly month-range string for the "Where this works best" card.
 * "march to may" / "july" / "september to november and february to april".
 * Exported so the card can re-use the same formatting the renderer uses
 * inline.
 */
export function formatMonthRange(months: string[]): string {
  if (months.length === 0) return ''
  if (months.length === 1) return months[0] ?? ''

  const sortedIndexes: number[] = []
  for (const m of months) {
    const idx = MONTH_INDEX_BY_NAME.get(m)
    if (typeof idx === 'number') sortedIndexes.push(idx)
  }
  sortedIndexes.sort((a, b) => a - b)

  if (sortedIndexes.length === 0) return months.join(', ')

  const ranges: Array<[number, number]> = []
  const firstIdx = sortedIndexes[0]
  if (firstIdx === undefined) return ''
  let rangeStart = firstIdx
  let rangeEnd = firstIdx

  for (let i = 1; i < sortedIndexes.length; i++) {
    const current = sortedIndexes[i]
    if (current === undefined) continue
    if (current === rangeEnd + 1) {
      rangeEnd = current
    } else {
      ranges.push([rangeStart, rangeEnd])
      rangeStart = current
      rangeEnd = current
    }
  }
  ranges.push([rangeStart, rangeEnd])

  const labels = ranges.map(([start, end]) => {
    const startLabel = NORTHERN_MONTHS[start] ?? ''
    const endLabel = NORTHERN_MONTHS[end] ?? ''
    return start === end ? startLabel : `${startLabel} to ${endLabel}`
  })

  if (labels.length === 1) return labels[0] ?? ''
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`
  const last = labels[labels.length - 1] ?? ''
  return `${labels.slice(0, -1).join(', ')}, and ${last}`
}

export const REGION_LABELS = COUNTRY_GROUP_LABELS
