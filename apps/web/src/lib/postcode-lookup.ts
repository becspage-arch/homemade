/**
 * Postcode → climate-zone lookup for the four priority postcode-having
 * countries: UK, US, CA, AU.
 *
 * Phase location_climate_paper_001 — MVP. Uses built-in approximation
 * tables keyed on the postcode prefix (UK area letters, US ZIP first
 * digit, CA Forward Sortation Area first letter, AU postcode first
 * digit). Full polygon lookups using licensed Met Office / USDA / BoM
 * / Plant Hardiness Canada data ship in a follow-up worker.
 *
 * The approximations cover the bulk of users correctly — a Londoner
 * gets the southeast England answer, a New Yorker gets the mid-Atlantic
 * USDA 7, a Melburnian gets the southern Victoria answer. Edge cases
 * (Highland Scotland vs Inverness postcode IV, west-coast Florida vs
 * panhandle, alpine Australia vs lowland) drift to the regional
 * average; the user can override in settings.
 *
 * All exported functions are pure and synchronous.
 */

export interface PostcodeClimateResult {
  /** Köppen-Geiger climate code, e.g. 'Cfb' (oceanic), 'Csa' (Med). */
  koppenZone: string
  /** 'N' | 'S'. */
  hemisphere: 'N' | 'S'
  /** USDA hardiness zone integer (1–13). Null when not applicable. */
  usdaHardinessZone: number | null
  /** RHS hardiness zone, UK-only. */
  rhsHardinessZone: string | null
  /** 'MM-DD' month-day. Null for frost-free regions. */
  lastFrostDate: string | null
  /** 'MM-DD' month-day. Null for frost-free regions. */
  firstFrostDate: string | null
  /** Country code (ISO 3166-1 alpha-2). */
  countryCode: 'GB' | 'US' | 'CA' | 'AU'
  /** Human-readable region label the lookup matched. */
  regionLabel: string
}

// ────────────────────────────────────────────────────────────────────
// UK — by postcode area (the leading 1-2 letters before the digits).
// Source: cross-referenced from RHS hardiness map + Met Office regional
// climate summaries. The area letter is a stronger signal than the
// whole outward code for climate; SW1 and SW20 are in the same band.
// ────────────────────────────────────────────────────────────────────

const UK_AREAS: Record<string, PostcodeClimateResult> = (() => {
  const base = (region: string, opts: Partial<PostcodeClimateResult>): PostcodeClimateResult => ({
    koppenZone: 'Cfb',
    hemisphere: 'N',
    usdaHardinessZone: 8,
    rhsHardinessZone: 'H4',
    lastFrostDate: '05-15',
    firstFrostDate: '10-15',
    countryCode: 'GB',
    regionLabel: region,
    ...opts,
  })

  // Helper to mass-assign a single profile to a list of area codes.
  const out: Record<string, PostcodeClimateResult> = {}
  const apply = (codes: string[], profile: PostcodeClimateResult): void => {
    for (const c of codes) out[c] = profile
  }

  // Southeast England (mild, slightly drier) — RHS H4 / USDA 9.
  apply(
    ['SW', 'SE', 'W', 'WC', 'EC', 'E', 'N', 'NW', 'BR', 'CR', 'DA', 'EN', 'HA', 'IG', 'KT', 'RM', 'SM', 'TW', 'UB', 'WD',
     'GU', 'RH', 'TN', 'CT', 'ME', 'BN', 'PO', 'RG', 'SL', 'OX', 'HP', 'AL', 'WD', 'LU', 'SG', 'CB', 'CM', 'CO', 'IP'],
    base('Southeast England', { usdaHardinessZone: 9, rhsHardinessZone: 'H4' }),
  )

  // Southwest England + Channel coast (mildest, USDA 9-10, RHS H5 in pockets).
  apply(
    ['EX', 'PL', 'TQ', 'TR', 'BS', 'BA', 'DT', 'TA', 'SP', 'SN', 'GL'],
    base('Southwest England', { lastFrostDate: '04-30', usdaHardinessZone: 9, rhsHardinessZone: 'H5' }),
  )

  // Midlands (slightly colder, more continental).
  apply(
    ['B', 'CV', 'DY', 'WS', 'WV', 'ST', 'TF', 'NG', 'DE', 'LE', 'NN', 'PE', 'LN', 'S', 'WR', 'HR', 'SY'],
    base('Midlands', { usdaHardinessZone: 8, rhsHardinessZone: 'H4', lastFrostDate: '05-15' }),
  )

  // North England — Yorkshire / Lancashire / Cumbria.
  apply(
    ['LS', 'WF', 'HD', 'BD', 'HX', 'YO', 'HU', 'DN', 'HG', 'BB', 'PR', 'BL', 'BD', 'OL', 'M', 'WN', 'WA', 'CH', 'L', 'CW', 'SK',
     'DL', 'TS', 'DH', 'SR', 'NE', 'CA', 'LA'],
    base('Northern England', { usdaHardinessZone: 8, rhsHardinessZone: 'H4', lastFrostDate: '05-20', firstFrostDate: '10-10' }),
  )

  // Wales (oceanic, mild on coast).
  apply(
    ['CF', 'NP', 'SA', 'LD', 'LL', 'SY'],
    base('Wales', { usdaHardinessZone: 9, rhsHardinessZone: 'H4' }),
  )

  // Scotland — lowland.
  apply(
    ['EH', 'KY', 'FK', 'TD', 'ML', 'G', 'PA', 'KA', 'DG', 'DD'],
    base('Lowland Scotland', { usdaHardinessZone: 8, rhsHardinessZone: 'H4', lastFrostDate: '05-25', firstFrostDate: '10-05' }),
  )

  // Scotland — highlands (colder).
  apply(
    ['AB', 'IV', 'PH', 'KW', 'HS', 'ZE'],
    base('Highland Scotland', { usdaHardinessZone: 7, rhsHardinessZone: 'H5', lastFrostDate: '06-01', firstFrostDate: '09-25' }),
  )

  // Northern Ireland (oceanic, mild).
  apply(
    ['BT'],
    base('Northern Ireland', { usdaHardinessZone: 9, rhsHardinessZone: 'H4' }),
  )

  return out
})()

function lookupUK(postcode: string): PostcodeClimateResult | null {
  // UK outward code is the leading non-digit characters before the
  // first digit-then-anything pattern. SW1A 1AA → "SW", IV1 1AA → "IV".
  const match = /^([A-Z]{1,2})\d/.exec(postcode.toUpperCase().replace(/\s+/g, ''))
  if (!match) return null
  return UK_AREAS[match[1]!] ?? null
}

// ────────────────────────────────────────────────────────────────────
// US — by ZIP first digit. Source: USDA Plant Hardiness Zone Map
// regional averages cross-referenced with Köppen-Geiger classifications.
// First digit is a coarse but useful proxy: 0=NE, 1=Mid-Atl, 2=South,
// 3=Florida, 4=Midwest, 5=Northwest interior, 6=Plains, 7=Texas,
// 8=Mountain, 9=West Coast.
// ────────────────────────────────────────────────────────────────────

const US_BY_FIRST_DIGIT: Record<string, PostcodeClimateResult> = {
  '0': { koppenZone: 'Dfa', hemisphere: 'N', usdaHardinessZone: 6, rhsHardinessZone: null, lastFrostDate: '05-15', firstFrostDate: '10-01', countryCode: 'US', regionLabel: 'New England + NY/NJ' },
  '1': { koppenZone: 'Dfa', hemisphere: 'N', usdaHardinessZone: 7, rhsHardinessZone: null, lastFrostDate: '04-25', firstFrostDate: '10-15', countryCode: 'US', regionLabel: 'Mid-Atlantic (PA/DE)' },
  '2': { koppenZone: 'Cfa', hemisphere: 'N', usdaHardinessZone: 7, rhsHardinessZone: null, lastFrostDate: '04-15', firstFrostDate: '10-25', countryCode: 'US', regionLabel: 'Mid-South (VA/NC/SC/GA)' },
  '3': { koppenZone: 'Cfa', hemisphere: 'N', usdaHardinessZone: 9, rhsHardinessZone: null, lastFrostDate: '03-01', firstFrostDate: '11-30', countryCode: 'US', regionLabel: 'Deep South / Florida' },
  '4': { koppenZone: 'Dfa', hemisphere: 'N', usdaHardinessZone: 6, rhsHardinessZone: null, lastFrostDate: '05-01', firstFrostDate: '10-10', countryCode: 'US', regionLabel: 'Midwest (OH/IN/MI/KY)' },
  '5': { koppenZone: 'Dfb', hemisphere: 'N', usdaHardinessZone: 5, rhsHardinessZone: null, lastFrostDate: '05-15', firstFrostDate: '09-30', countryCode: 'US', regionLabel: 'Upper Midwest (IA/MN/WI/MT)' },
  '6': { koppenZone: 'Dfa', hemisphere: 'N', usdaHardinessZone: 6, rhsHardinessZone: null, lastFrostDate: '04-25', firstFrostDate: '10-10', countryCode: 'US', regionLabel: 'Plains (IL/KS/NE/MO)' },
  '7': { koppenZone: 'Cfa', hemisphere: 'N', usdaHardinessZone: 8, rhsHardinessZone: null, lastFrostDate: '03-25', firstFrostDate: '11-15', countryCode: 'US', regionLabel: 'Texas + LA + AR + OK' },
  '8': { koppenZone: 'BSk', hemisphere: 'N', usdaHardinessZone: 6, rhsHardinessZone: null, lastFrostDate: '05-10', firstFrostDate: '10-05', countryCode: 'US', regionLabel: 'Mountain West (CO/UT/NM/AZ/NV/ID/WY)' },
  '9': { koppenZone: 'Csb', hemisphere: 'N', usdaHardinessZone: 9, rhsHardinessZone: null, lastFrostDate: '03-15', firstFrostDate: '11-15', countryCode: 'US', regionLabel: 'West Coast (CA/OR/WA + HI/AK overrides)' },
}

function lookupUS(postcode: string): PostcodeClimateResult | null {
  const clean = postcode.replace(/\s+/g, '').replace(/-.*$/, '')
  if (!/^\d{5}$/.test(clean)) return null
  return US_BY_FIRST_DIGIT[clean[0]!] ?? null
}

// ────────────────────────────────────────────────────────────────────
// Canada — Forward Sortation Area (first character is province, second
// is urban / rural). Source: Plant Hardiness Canada zone map regional
// averages.
// ────────────────────────────────────────────────────────────────────

const CA_BY_FSA_LETTER: Record<string, PostcodeClimateResult> = {
  A: { koppenZone: 'Dfb', hemisphere: 'N', usdaHardinessZone: 5, rhsHardinessZone: null, lastFrostDate: '06-05', firstFrostDate: '09-25', countryCode: 'CA', regionLabel: 'Newfoundland & Labrador' },
  B: { koppenZone: 'Dfb', hemisphere: 'N', usdaHardinessZone: 6, rhsHardinessZone: null, lastFrostDate: '05-25', firstFrostDate: '10-05', countryCode: 'CA', regionLabel: 'Nova Scotia' },
  C: { koppenZone: 'Dfb', hemisphere: 'N', usdaHardinessZone: 5, rhsHardinessZone: null, lastFrostDate: '05-30', firstFrostDate: '10-01', countryCode: 'CA', regionLabel: 'Prince Edward Island' },
  E: { koppenZone: 'Dfb', hemisphere: 'N', usdaHardinessZone: 5, rhsHardinessZone: null, lastFrostDate: '05-25', firstFrostDate: '09-30', countryCode: 'CA', regionLabel: 'New Brunswick' },
  G: { koppenZone: 'Dfb', hemisphere: 'N', usdaHardinessZone: 4, rhsHardinessZone: null, lastFrostDate: '06-01', firstFrostDate: '09-20', countryCode: 'CA', regionLabel: 'Eastern Quebec' },
  H: { koppenZone: 'Dfb', hemisphere: 'N', usdaHardinessZone: 5, rhsHardinessZone: null, lastFrostDate: '05-20', firstFrostDate: '10-05', countryCode: 'CA', regionLabel: 'Montreal' },
  J: { koppenZone: 'Dfb', hemisphere: 'N', usdaHardinessZone: 4, rhsHardinessZone: null, lastFrostDate: '05-30', firstFrostDate: '09-25', countryCode: 'CA', regionLabel: 'Western Quebec' },
  K: { koppenZone: 'Dfb', hemisphere: 'N', usdaHardinessZone: 5, rhsHardinessZone: null, lastFrostDate: '05-15', firstFrostDate: '10-05', countryCode: 'CA', regionLabel: 'Eastern Ontario (Ottawa)' },
  L: { koppenZone: 'Dfb', hemisphere: 'N', usdaHardinessZone: 6, rhsHardinessZone: null, lastFrostDate: '05-10', firstFrostDate: '10-10', countryCode: 'CA', regionLabel: 'Central Ontario (Hamilton/Niagara)' },
  M: { koppenZone: 'Dfb', hemisphere: 'N', usdaHardinessZone: 6, rhsHardinessZone: null, lastFrostDate: '05-09', firstFrostDate: '10-12', countryCode: 'CA', regionLabel: 'Toronto' },
  N: { koppenZone: 'Dfb', hemisphere: 'N', usdaHardinessZone: 6, rhsHardinessZone: null, lastFrostDate: '05-08', firstFrostDate: '10-15', countryCode: 'CA', regionLabel: 'Southwest Ontario' },
  P: { koppenZone: 'Dfb', hemisphere: 'N', usdaHardinessZone: 4, rhsHardinessZone: null, lastFrostDate: '05-30', firstFrostDate: '09-15', countryCode: 'CA', regionLabel: 'Northern Ontario' },
  R: { koppenZone: 'Dfb', hemisphere: 'N', usdaHardinessZone: 3, rhsHardinessZone: null, lastFrostDate: '05-25', firstFrostDate: '09-15', countryCode: 'CA', regionLabel: 'Manitoba' },
  S: { koppenZone: 'Dfb', hemisphere: 'N', usdaHardinessZone: 3, rhsHardinessZone: null, lastFrostDate: '05-22', firstFrostDate: '09-15', countryCode: 'CA', regionLabel: 'Saskatchewan' },
  T: { koppenZone: 'Dfc', hemisphere: 'N', usdaHardinessZone: 3, rhsHardinessZone: null, lastFrostDate: '05-25', firstFrostDate: '09-10', countryCode: 'CA', regionLabel: 'Alberta' },
  V: { koppenZone: 'Cfb', hemisphere: 'N', usdaHardinessZone: 8, rhsHardinessZone: null, lastFrostDate: '04-05', firstFrostDate: '11-05', countryCode: 'CA', regionLabel: 'British Columbia (coastal)' },
  X: { koppenZone: 'Dfc', hemisphere: 'N', usdaHardinessZone: 2, rhsHardinessZone: null, lastFrostDate: '06-15', firstFrostDate: '08-25', countryCode: 'CA', regionLabel: 'Northern Territories (NT/NU)' },
  Y: { koppenZone: 'Dfc', hemisphere: 'N', usdaHardinessZone: 2, rhsHardinessZone: null, lastFrostDate: '06-10', firstFrostDate: '08-30', countryCode: 'CA', regionLabel: 'Yukon' },
}

function lookupCA(postcode: string): PostcodeClimateResult | null {
  const first = postcode.toUpperCase().replace(/\s+/g, '').charAt(0)
  if (!first) return null
  return CA_BY_FSA_LETTER[first] ?? null
}

// ────────────────────────────────────────────────────────────────────
// Australia — by postcode first digit. Source: BoM climate atlas
// regional summaries. AU postcodes are 4 digits; the leading digit
// maps to state, finer regions need more digits but the leading digit
// is a good MVP starting point.
// ────────────────────────────────────────────────────────────────────

const AU_BY_FIRST_DIGIT: Record<string, PostcodeClimateResult> = {
  '0': { koppenZone: 'Aw', hemisphere: 'S', usdaHardinessZone: 12, rhsHardinessZone: null, lastFrostDate: null, firstFrostDate: null, countryCode: 'AU', regionLabel: 'Northern Territory + ACT' },
  '1': { koppenZone: 'Cfa', hemisphere: 'S', usdaHardinessZone: 10, rhsHardinessZone: null, lastFrostDate: '08-15', firstFrostDate: '06-15', countryCode: 'AU', regionLabel: 'NSW (Sydney metro)' },
  '2': { koppenZone: 'Cfa', hemisphere: 'S', usdaHardinessZone: 10, rhsHardinessZone: null, lastFrostDate: '08-15', firstFrostDate: '06-15', countryCode: 'AU', regionLabel: 'NSW + ACT' },
  '3': { koppenZone: 'Cfb', hemisphere: 'S', usdaHardinessZone: 9, rhsHardinessZone: null, lastFrostDate: '09-01', firstFrostDate: '06-01', countryCode: 'AU', regionLabel: 'Victoria' },
  '4': { koppenZone: 'Cfa', hemisphere: 'S', usdaHardinessZone: 11, rhsHardinessZone: null, lastFrostDate: '07-15', firstFrostDate: '07-15', countryCode: 'AU', regionLabel: 'Queensland' },
  '5': { koppenZone: 'Csa', hemisphere: 'S', usdaHardinessZone: 10, rhsHardinessZone: null, lastFrostDate: '08-15', firstFrostDate: '06-15', countryCode: 'AU', regionLabel: 'South Australia' },
  '6': { koppenZone: 'Csa', hemisphere: 'S', usdaHardinessZone: 10, rhsHardinessZone: null, lastFrostDate: '08-01', firstFrostDate: '06-15', countryCode: 'AU', regionLabel: 'Western Australia' },
  '7': { koppenZone: 'Cfb', hemisphere: 'S', usdaHardinessZone: 9, rhsHardinessZone: null, lastFrostDate: '10-01', firstFrostDate: '05-01', countryCode: 'AU', regionLabel: 'Tasmania' },
  '8': { koppenZone: 'Aw', hemisphere: 'S', usdaHardinessZone: 12, rhsHardinessZone: null, lastFrostDate: null, firstFrostDate: null, countryCode: 'AU', regionLabel: 'NT + WA tropics' },
  '9': { koppenZone: 'Aw', hemisphere: 'S', usdaHardinessZone: 12, rhsHardinessZone: null, lastFrostDate: null, firstFrostDate: null, countryCode: 'AU', regionLabel: 'NT + WA tropics' },
}

function lookupAU(postcode: string): PostcodeClimateResult | null {
  const clean = postcode.replace(/\s+/g, '')
  if (!/^\d{4}$/.test(clean)) return null
  return AU_BY_FIRST_DIGIT[clean[0]!] ?? null
}

/**
 * Resolve a (country, postcode) pair to climate metadata. Returns null
 * when the country isn't supported or the postcode shape doesn't match
 * the country's expected format.
 *
 * Supported countries: 'GB' (UK), 'US', 'CA', 'AU'.
 *
 * The caller is expected to fall back to the CountryClimate row when
 * this returns null.
 */
export function lookupPostcode(
  countryCode: string,
  postcode: string,
): PostcodeClimateResult | null {
  if (!postcode) return null
  const cc = countryCode.toUpperCase()
  switch (cc) {
    case 'GB':
    case 'UK':
      return lookupUK(postcode)
    case 'US':
      return lookupUS(postcode)
    case 'CA':
      return lookupCA(postcode)
    case 'AU':
      return lookupAU(postcode)
    default:
      return null
  }
}
