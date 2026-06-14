/**
 * Render-time unit + temperature helpers for recipes.
 *
 * Canonical storage is always conventional (non-fan) °C, grams and millilitres
 * per the locked temperature/units rule. Nothing here re-authors content; every
 * function takes the canonical value plus the reader's preference and returns a
 * display string. The conversion table mirrors `feedback_temperature_and_units`
 * exactly so the renderer and that memo never drift.
 *
 * Pure module - no DB, no `server-only` - so client components (the cooking-mode
 * reader, the scale chip) and server components both import it.
 */

export type OvenPreference = 'FAN_C' | 'CONVENTIONAL_C' | 'FAHRENHEIT' | 'GAS_MARK'
export type WeightPreference = 'METRIC' | 'IMPERIAL'
export type VolumePreference = 'METRIC' | 'IMPERIAL_UK' | 'IMPERIAL_US'

export interface UnitPreferences {
  oven: OvenPreference
  weight: WeightPreference
  volume: VolumePreference
}

/**
 * Fill any unset preference from the request locale, per the locked defaults:
 * en-GB → fan °C + grams + UK cups; en-US → °F + (imperial) + US cups;
 * everywhere else → metric. A logged-in user's saved enums always win over the
 * locale guess; pass them as the first three args (null = not set).
 */
export function resolveUnitPreferences(
  saved: {
    oven?: OvenPreference | null
    weight?: WeightPreference | null
    volume?: VolumePreference | null
  },
  acceptLanguage?: string | null,
): UnitPreferences {
  const lang = (acceptLanguage ?? '').toLowerCase()
  const isUS = lang.includes('en-us') || lang.startsWith('en-us')
  const isGB = lang.includes('en-gb')

  const localeOven: OvenPreference = isUS ? 'FAHRENHEIT' : isGB ? 'FAN_C' : 'CONVENTIONAL_C'
  const localeWeight: WeightPreference = isUS ? 'IMPERIAL' : 'METRIC'
  const localeVolume: VolumePreference = isUS ? 'IMPERIAL_US' : isGB ? 'METRIC' : 'METRIC'

  return {
    oven: saved.oven ?? localeOven,
    weight: saved.weight ?? localeWeight,
    volume: saved.volume ?? localeVolume,
  }
}

// ── Temperature ─────────────────────────────────────────────────────────────

const GAS_MARK_BANDS: Array<{ celsius: number; mark: string }> = [
  { celsius: 120, mark: '1/2' },
  { celsius: 140, mark: '1' },
  { celsius: 150, mark: '2' },
  { celsius: 160, mark: '3' },
  { celsius: 180, mark: '4' },
  { celsius: 190, mark: '5' },
  { celsius: 200, mark: '6' },
  { celsius: 220, mark: '7' },
  { celsius: 230, mark: '8' },
  { celsius: 240, mark: '9' },
]

function nearestGasMark(conventionalC: number): string {
  let bestMark = '4'
  let bestDelta = Infinity
  for (const band of GAS_MARK_BANDS) {
    const delta = Math.abs(conventionalC - band.celsius)
    if (delta < bestDelta) { bestMark = band.mark; bestDelta = delta }
  }
  return bestMark
}

/**
 * Format a conventional °C oven temperature for the reader's OvenPreference.
 * Returns e.g. "180°C", "160°C fan", "350°F", "Gas 4".
 */
export function formatTemperature(
  conventionalCelsius: number,
  preference: OvenPreference,
): string {
  switch (preference) {
    case 'CONVENTIONAL_C':
      return `${Math.round(conventionalCelsius)}°C`
    case 'FAN_C':
      return `${Math.round(conventionalCelsius - 20)}°C fan`
    case 'FAHRENHEIT': {
      const f = Math.round((conventionalCelsius * 9) / 5 + 32)
      return `${Math.round(f / 5) * 5}°F`
    }
    case 'GAS_MARK':
      return `Gas ${nearestGasMark(conventionalCelsius)}`
  }
}

// ── Weight ──────────────────────────────────────────────────────────────────

const MASS_UNITS = new Set(['g', 'gram', 'grams', 'kg', 'kilo', 'kilos'])

function gramsFrom(amount: number, unit: string): number {
  const u = unit.toLowerCase()
  if (u === 'kg' || u === 'kilo' || u === 'kilos') return amount * 1000
  return amount
}

/** Format a gram weight per the WeightPreference. Metric stays g / kg; imperial
 *  switches to oz / lb (oz = g × 0.035274, rounded to one decimal). */
export function formatWeight(grams: number, preference: WeightPreference): string {
  if (preference === 'METRIC') {
    if (grams >= 1000) return `${trim(grams / 1000)} kg`
    return `${trim(grams)} g`
  }
  const oz = grams * 0.035274
  if (oz >= 16) {
    const lb = Math.floor(oz / 16)
    const rem = round1(oz - lb * 16)
    return rem > 0 ? `${lb} lb ${rem} oz` : `${lb} lb`
  }
  return `${round1(oz)} oz`
}

// ── Volume ──────────────────────────────────────────────────────────────────

const VOLUME_UNITS = new Set(['ml', 'millilitre', 'millilitres', 'l', 'litre', 'litres'])

function mlFrom(amount: number, unit: string): number {
  const u = unit.toLowerCase()
  if (u === 'l' || u === 'litre' || u === 'litres') return amount * 1000
  return amount
}

/** Format a millilitre volume per the VolumePreference. Metric stays ml / l;
 *  imperial uses cups (UK = ml ÷ 250, US = ml ÷ 240) for larger volumes and
 *  fluid ounces (ml × 0.033814) below a cup. */
export function formatVolume(ml: number, preference: VolumePreference): string {
  if (preference === 'METRIC') {
    if (ml >= 1000) return `${trim(ml / 1000)} l`
    return `${trim(ml)} ml`
  }
  const cupMl = preference === 'IMPERIAL_UK' ? 250 : 240
  if (ml >= cupMl) {
    return `${trim(round2(ml / cupMl))} cup${ml / cupMl >= 2 ? 's' : ''}`
  }
  return `${round1(ml * 0.033814)} fl oz`
}

// ── Spoons (pass through - standardised 15 ml / 5 ml) ────────────────────────

const PASS_THROUGH_UNITS = new Set([
  'tbsp', 'tablespoon', 'tablespoons',
  'tsp', 'teaspoon', 'teaspoons',
  'pinch', 'each', 'clove', 'cloves', 'sprig', 'sprigs', 'handful',
  'slice', 'slices', 'leaf', 'leaves', 'sheet', 'sheets', 'bunch',
])

/**
 * Format a single recipe ingredient quantity for the reader's preferences.
 * Mass units convert with WeightPreference; volume units with VolumePreference;
 * spoons and counts pass through. `densityGPerMl` (from the Ingredient row) is
 * the optional bridge: when the reader prefers volume but the amount is stored
 * by weight (or vice versa) and a density is known, the value is converted
 * across the mass/volume boundary before formatting. Returns just the
 * quantity + unit (e.g. "200 g", "1 cup", "2 tbsp"); the caller supplies the
 * ingredient name.
 */
export function formatIngredientQuantity(
  amount: number | null,
  unit: string | null,
  preferences: UnitPreferences,
  densityGPerMl?: number | null,
): string {
  if (amount === null) return unit && unit !== 'each' ? unit : ''
  const u = (unit ?? '').toLowerCase().trim()

  if (MASS_UNITS.has(u)) {
    const grams = gramsFrom(amount, u)
    // Cups-preferring reader (typically US) with a known ingredient density:
    // show the weight as a volume so a grams-authored recipe reads in cups.
    // Without a density we can't cross the boundary, so we fall back to weight.
    if (preferences.volume !== 'METRIC' && densityGPerMl) {
      return formatVolume(gramsToMl(grams, densityGPerMl), preferences.volume)
    }
    return formatWeight(grams, preferences.weight)
  }

  if (VOLUME_UNITS.has(u)) {
    const ml = mlFrom(amount, u)
    return formatVolume(ml, preferences.volume)
  }

  if (PASS_THROUGH_UNITS.has(u) || u === '') {
    const suffix = u && u !== 'each' ? ` ${pluraliseUnit(u, amount)}` : ''
    return `${trim(amount)}${suffix}`
  }

  // Unknown unit - render as authored.
  return `${trim(amount)} ${unit}`.trim()
}

// Countable units take a plural form when the amount is not 1. Mass / volume /
// spoon abbreviations stay invariant (cooking convention). Mirrors the map in
// the recipe scale-context so the list and the inline tokens read the same.
const PLURALISE: Record<string, string> = {
  clove: 'cloves',
  sprig: 'sprigs',
  leaf: 'leaves',
  sheet: 'sheets',
  slice: 'slices',
  bunch: 'bunches',
  handful: 'handfuls',
  pinch: 'pinches',
  stick: 'sticks',
  strip: 'strips',
  head: 'heads',
  rasher: 'rashers',
  fillet: 'fillets',
}

function pluraliseUnit(unit: string, amount: number): string {
  if (Math.abs(amount - 1) < 0.01) return unit
  return PLURALISE[unit] ?? unit
}

/** Convert a gram weight to millilitres given a density (g/ml). */
export function gramsToMl(grams: number, densityGPerMl: number): number {
  return densityGPerMl > 0 ? grams / densityGPerMl : grams
}

/** Convert a millilitre volume to grams given a density (g/ml). */
export function mlToGrams(ml: number, densityGPerMl: number): number {
  return ml * densityGPerMl
}

// ── Time ──────────────────────────────────────────────────────────────────--

/**
 * Format a duration in minutes. Default 'words' style ("1 hour 20 minutes");
 * 'digital' gives "1:20". Under an hour returns just minutes.
 */
export function formatTime(
  minutes: number,
  style: 'words' | 'digital' = 'words',
): string {
  if (minutes <= 0) return style === 'digital' ? '0:00' : '0 minutes'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60

  if (style === 'digital') {
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}` : `${m} min`
  }

  const parts: string[] = []
  if (h > 0) parts.push(`${h} hour${h > 1 ? 's' : ''}`)
  if (m > 0) parts.push(`${m} minute${m > 1 ? 's' : ''}`)
  return parts.join(' ')
}

// ── number formatting ─────────────────────────────────────────────────────--

function round1(n: number): number {
  return Math.round(n * 10) / 10
}
function round2(n: number): number {
  return Math.round(n * 100) / 100
}
/** Drop trailing zeros and render integers without a decimal point. */
function trim(n: number): string {
  if (Math.abs(n - Math.round(n)) < 0.001) return String(Math.round(n))
  return String(round2(n))
}
