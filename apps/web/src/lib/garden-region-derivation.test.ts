// deriveGardenRegions test suite.
//
// Runnable as a tsx script. Validates the derivation helper against
// representative tutorial / species / user combinations, including the
// shape of the 4 PUBLISHED garden tutorials carried at 2026-06-10.

import assert from 'node:assert/strict'
import {
  deriveGardenRegions,
  formatMonthRange,
  REGION_LABELS,
} from './garden-region-derivation'

type PassFail = { name: string; passed: boolean; detail?: string }
const results: PassFail[] = []

function record(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({
      name,
      passed: false,
      detail: err instanceof Error ? err.message : String(err),
    })
  }
}

// ─── Shaped on the PUBLISHED tomato tutorial ──────────────────────────────

const TOMATO_TUTORIAL = {
  hemisphere: 'N',
  frostSensitivity: 'tender',
  growingMonthsByHemisphere: null,
  climateZones: ['Cfb'],
  usdaHardinessZones: [7, 8, 9] as number[],
  rhsHardinessZones: ['H4'],
  plantingMonths: ['february', 'march', 'april', 'may'],
  harvestMonths: ['july', 'august', 'september', 'october'],
  regionsApplicableOverride: null,
}

const TOMATO_SPECIES = {
  usdaHardinessZone: [],
  rhsHardinessZone: ['H1c', 'H2'],
}

record('UK user reading UK-tomato: same hemisphere, no translation', () => {
  const result = deriveGardenRegions({
    tutorial: TOMATO_TUTORIAL,
    species: TOMATO_SPECIES,
    user: { country: 'GB', hemisphere: 'N' },
  })
  assert.equal(result.needsHemisphereTranslation, false)
  assert.deepEqual(result.translatedPlantingMonths, [
    'february',
    'march',
    'april',
    'may',
  ])
  assert.ok(result.applicableRegions.includes('UK_NEUROPE'))
})

record('AU user reading UK-tomato: hemisphere translation kicks in', () => {
  const result = deriveGardenRegions({
    tutorial: TOMATO_TUTORIAL,
    species: TOMATO_SPECIES,
    user: { country: 'AU', hemisphere: 'S' },
  })
  assert.equal(result.needsHemisphereTranslation, true)
  // Feb (1) → Aug (7); Mar (2) → Sep (8); Apr (3) → Oct (9); May (4) → Nov (10).
  assert.deepEqual(result.translatedPlantingMonths, [
    'august',
    'september',
    'october',
    'november',
  ])
  // Jul (6) → Jan (0); Aug (7) → Feb (1); Sep (8) → Mar (2); Oct (9) → Apr (3).
  assert.deepEqual(result.translatedHarvestMonths, [
    'january',
    'february',
    'march',
    'april',
  ])
})

record('US user reading UK-tomato: same hemisphere, primary region UK', () => {
  const result = deriveGardenRegions({
    tutorial: TOMATO_TUTORIAL,
    species: TOMATO_SPECIES,
    user: { country: 'US', hemisphere: 'N' },
  })
  assert.equal(result.needsHemisphereTranslation, false)
  assert.equal(result.primaryRegionWrittenFor, REGION_LABELS.UK_NEUROPE)
})

// ─── Override path ─────────────────────────────────────────────────────────

record('Override array short-circuits derivation', () => {
  const result = deriveGardenRegions({
    tutorial: {
      ...TOMATO_TUTORIAL,
      regionsApplicableOverride: ['UK', 'EU_TEMPERATE'],
    },
    species: TOMATO_SPECIES,
    user: { country: 'GB', hemisphere: 'N' },
  })
  assert.deepEqual(result.applicableRegions, ['UK', 'EU_TEMPERATE'])
  assert.equal(result.primaryRegionWrittenFor, REGION_LABELS.UK)
})

// ─── Anonymous user ────────────────────────────────────────────────────────

record('Anonymous user gets default primary region', () => {
  const result = deriveGardenRegions({
    tutorial: TOMATO_TUTORIAL,
    species: TOMATO_SPECIES,
    user: null,
  })
  assert.equal(result.needsHemisphereTranslation, false)
  assert.ok(result.primaryRegionWrittenFor.length > 0)
})

// ─── growingMonthsByHemisphere preference ──────────────────────────────────

record('growingMonthsByHemisphere overrides naive +6 month flip', () => {
  const result = deriveGardenRegions({
    tutorial: {
      ...TOMATO_TUTORIAL,
      growingMonthsByHemisphere: {
        N: ['february', 'march'],
        S: ['october', 'november'],
      },
    },
    species: TOMATO_SPECIES,
    user: { country: 'AU', hemisphere: 'S' },
  })
  assert.deepEqual(result.translatedPlantingMonths, ['october', 'november'])
})

// ─── Southern-hemisphere tutorial ──────────────────────────────────────────

record('Southern tutorial for AU reader: no translation', () => {
  const result = deriveGardenRegions({
    tutorial: {
      ...TOMATO_TUTORIAL,
      hemisphere: 'S',
      plantingMonths: ['august', 'september'],
      harvestMonths: ['january', 'february'],
    },
    species: TOMATO_SPECIES,
    user: { country: 'AU', hemisphere: 'S' },
  })
  assert.equal(result.needsHemisphereTranslation, false)
  assert.ok(result.applicableRegions.includes('AU_NZ'))
})

// ─── formatMonthRange ──────────────────────────────────────────────────────

record('formatMonthRange contiguous: march to may', () => {
  assert.equal(formatMonthRange(['march', 'april', 'may']), 'march to may')
})

record('formatMonthRange single: july', () => {
  assert.equal(formatMonthRange(['july']), 'july')
})

record('formatMonthRange empty: empty string', () => {
  assert.equal(formatMonthRange([]), '')
})

record('formatMonthRange split ranges: two ranges joined by "and"', () => {
  assert.equal(
    formatMonthRange(['september', 'october', 'november', 'february', 'march']),
    'february to march and september to november',
  )
})

// ─── Report ────────────────────────────────────────────────────────────────

const failed = results.filter((r) => !r.passed)
for (const r of results) {
  const tick = r.passed ? 'PASS' : 'FAIL'
  console.log(`${tick}: ${r.name}`)
  if (!r.passed && r.detail) console.log(`     ${r.detail}`)
}
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length > 0) process.exit(1)
