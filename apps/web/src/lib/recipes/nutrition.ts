/**
 * Recipe nutrition: per-100g ingredient facts in, an estimated per-serving
 * panel out. Pure functions, no DB or React, so the schema builder and the
 * visible panel share exactly one calculation.
 *
 * Source of the per-100g numbers is USDA FoodData Central (public domain),
 * stored on `Ingredient.nutritionalInfoPer100g`. Integrity rule, enforced
 * here: a recipe only gets nutrition when EVERY ingredient row resolves to a
 * gram weight AND carries calories. A single gap returns null for the whole
 * recipe — we never ship a figure built on missing data.
 */

/** Per-100g nutrient facts. All values are per 100 g of the ingredient. */
export interface IngredientNutrition {
  /** kcal per 100 g. Required — the gate nutrient. */
  kcal: number
  protein: number | null
  fat: number | null
  saturatedFat: number | null
  carbohydrate: number | null
  sugar: number | null
  fibre: number | null
  /** Sodium in milligrams per 100 g. */
  sodiumMg: number | null
  /**
   * Gram weight of one of a count / descriptive unit ("each", "clove",
   * "sprig"), when known. Lets "2 eggs" resolve to grams. Mass and volume
   * units don't need it (volume uses the ingredient's density).
   */
  gramsPerUnit?: Record<string, number>
}

/** Per-serving rollup. Any field can be null when an ingredient lacked it. */
export interface RecipeNutrition {
  calories: number
  protein: number | null
  fat: number | null
  saturatedFat: number | null
  carbohydrate: number | null
  sugar: number | null
  fibre: number | null
  sodiumMg: number | null
}

const NUTRIENT_KEYS = [
  'protein',
  'fat',
  'saturatedFat',
  'carbohydrate',
  'sugar',
  'fibre',
  'sodiumMg',
] as const

/**
 * Parse the loose Json on `Ingredient.nutritionalInfoPer100g` into a typed
 * record. Returns null when the blob has no usable `kcal` number, so callers
 * can treat "no data" and "bad data" the same way.
 */
export function parseIngredientNutrition(json: unknown): IngredientNutrition | null {
  if (!json || typeof json !== 'object') return null
  const obj = json as Record<string, unknown>
  const kcal = numberOrNull(obj.kcal)
  if (kcal == null) return null

  const out: IngredientNutrition = {
    kcal,
    protein: numberOrNull(obj.protein),
    fat: numberOrNull(obj.fat),
    saturatedFat: numberOrNull(obj.saturatedFat),
    carbohydrate: numberOrNull(obj.carbohydrate),
    sugar: numberOrNull(obj.sugar),
    fibre: numberOrNull(obj.fibre),
    sodiumMg: numberOrNull(obj.sodiumMg),
  }

  if (obj.gramsPerUnit && typeof obj.gramsPerUnit === 'object') {
    const map: Record<string, number> = {}
    for (const [k, v] of Object.entries(obj.gramsPerUnit as Record<string, unknown>)) {
      const n = numberOrNull(v)
      if (n != null && n > 0) map[k] = n
    }
    if (Object.keys(map).length > 0) out.gramsPerUnit = map
  }
  return out
}

// Millilitres per one of each volume unit. UK/metric teaspoon + tablespoon.
const ML_PER_UNIT: Record<string, number> = {
  ml: 1,
  l: 1000,
  tsp: 5,
  tbsp: 15,
  cup: 240,
}

const G_PER_MASS_UNIT: Record<string, number> = {
  g: 1,
  kg: 1000,
}

// Nominal gram weights for the vague "seasoning" amounts a recipe leaves to the
// cook: "salt to taste", "a pinch", "oil for greasing", "a handful of parsley".
// These are overwhelmingly low-calorie seasonings, so a small default gives a
// useful per-serving estimate without materially moving the headline figures
// (it's only ever a few calories, plus a rough sodium guess for salt). The
// panel is labelled an estimate. Used as a LAST resort, after the ingredient's
// own per-unit weights, and it's what mainstream recipe sites assume. A real
// per-unit weight on the ingredient always wins over these generic defaults.
const NOMINAL_UNIT_GRAMS: Record<string, number> = {
  'to taste': 1, season: 1, 'to season': 1, 'for seasoning': 1, seasoning: 1,
  'to serve': 1, 'to garnish': 1, 'to finish': 1,
  pinch: 0.4, 'small pinch': 0.2, 'good pinch': 0.6, 'large pinch': 0.8, pinches: 0.4,
  dash: 1, dashes: 1, splash: 5, glug: 12, knob: 12, drizzle: 5,
  grind: 0.2, grinds: 0.2, 'few grinds': 0.4, twist: 0.2,
  drop: 0.05, drops: 0.05, 'few drops': 0.2,
  'for dusting': 2, 'for greasing': 3, 'for frying': 10, 'for drizzling': 5,
  'for brushing': 3, 'for sprinkling': 2, 'for rolling': 5, 'for coating': 5,
  'for the tin': 3, 'for shallow frying': 15, 'for deep frying': 20,
  handful: 15, 'small handful': 8, 'large handful': 25,
}

/**
 * Convert an authored ingredient amount to grams, or null when it can't be
 * done faithfully. Mass units convert directly; volume units need the
 * ingredient's density; count / descriptive units take a per-unit gram weight
 * from the nutrition record; and vague seasoning units fall back to a small
 * nominal weight (so "salt to taste" doesn't block the whole recipe).
 */
export function amountToGrams(
  amount: number | null,
  unit: string | null,
  opts: { densityGPerMl: number | null; gramsPerUnit?: Record<string, number> },
): number | null {
  const u = (unit ?? '').trim().toLowerCase()
  const hasAmount = amount != null && Number.isFinite(amount) && amount > 0

  // Mass + volume need a real number to scale.
  if (hasAmount) {
    if (u in G_PER_MASS_UNIT) return amount! * G_PER_MASS_UNIT[u]!
    if (u in ML_PER_UNIT && opts.densityGPerMl != null && opts.densityGPerMl > 0) {
      return amount! * ML_PER_UNIT[u]! * opts.densityGPerMl
    }
  }

  // Per-unit weight. Covers count / descriptive units ("each", "clove",
  // "sprig", "slice"), a spoon weight for densityless ground spices, and the
  // generic seasoning nominals. Recipes write the unit both singular and
  // plural ("clove" / "cloves"), so a plural also matches its singular key.
  // The count defaults to 1 when the recipe gave no number ("a pinch", "to
  // taste") — those units always carry an implied "some".
  const map = opts.gramsPerUnit
  const per =
    map?.[u] ??
    (u.endsWith('s') ? map?.[u.slice(0, -1)] : undefined) ??
    (u === '' ? map?.each : undefined) ??
    NOMINAL_UNIT_GRAMS[u]
  if (per != null && per > 0) {
    const count = hasAmount ? amount! : 1
    return count * per
  }
  return null
}

export interface NutritionRow {
  amount: number | null
  unit: string | null
  densityGPerMl: number | null
  nutrition: IngredientNutrition | null
}

/**
 * Sum the rows into a per-serving estimate, or null when the recipe isn't
 * eligible: no servings, or any row that lacks nutrition data or can't be
 * resolved to grams. Calories are always present in an eligible result; the
 * other fields are null unless EVERY row supplied them.
 */
export function computeRecipeNutrition(
  rows: NutritionRow[],
  servings: number | null,
): RecipeNutrition | null {
  if (!servings || servings <= 0 || rows.length === 0) return null

  let calories = 0
  // Track per-nutrient running totals plus whether every row had the nutrient.
  const totals: Record<string, number> = {}
  const complete: Record<string, boolean> = {}
  for (const key of NUTRIENT_KEYS) {
    totals[key] = 0
    complete[key] = true
  }

  for (const row of rows) {
    if (!row.nutrition) return null
    const grams = amountToGrams(row.amount, row.unit, {
      densityGPerMl: row.densityGPerMl,
      gramsPerUnit: row.nutrition.gramsPerUnit,
    })
    if (grams == null) return null

    const factor = grams / 100
    calories += row.nutrition.kcal * factor

    for (const key of NUTRIENT_KEYS) {
      const v = row.nutrition[key]
      if (v == null) complete[key] = false
      else totals[key]! += v * factor
    }
  }

  const perServing = (total: number) => total / servings

  return {
    calories: round(perServing(calories), 0),
    protein: complete.protein ? round(perServing(totals.protein!), 1) : null,
    fat: complete.fat ? round(perServing(totals.fat!), 1) : null,
    saturatedFat: complete.saturatedFat ? round(perServing(totals.saturatedFat!), 1) : null,
    carbohydrate: complete.carbohydrate ? round(perServing(totals.carbohydrate!), 1) : null,
    sugar: complete.sugar ? round(perServing(totals.sugar!), 1) : null,
    fibre: complete.fibre ? round(perServing(totals.fibre!), 1) : null,
    sodiumMg: complete.sodiumMg ? round(perServing(totals.sodiumMg!), 0) : null,
  }
}

function numberOrNull(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  return null
}

function round(value: number, dp: number): number {
  const f = 10 ** dp
  return Math.round(value * f) / f
}
