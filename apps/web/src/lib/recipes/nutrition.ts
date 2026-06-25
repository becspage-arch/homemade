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

/**
 * Convert an authored ingredient amount to grams, or null when it can't be
 * done faithfully. Mass units convert directly; volume units need the
 * ingredient's density; count / descriptive units need a per-unit gram weight
 * from the nutrition record.
 */
export function amountToGrams(
  amount: number | null,
  unit: string | null,
  opts: { densityGPerMl: number | null; gramsPerUnit?: Record<string, number> },
): number | null {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return null
  const u = (unit ?? '').trim().toLowerCase()

  if (u in G_PER_MASS_UNIT) return amount * G_PER_MASS_UNIT[u]!

  if (u in ML_PER_UNIT) {
    if (opts.densityGPerMl == null || opts.densityGPerMl <= 0) return null
    return amount * ML_PER_UNIT[u]! * opts.densityGPerMl
  }

  // Count / descriptive units ("each", "clove", "sprig", "pinch", "handful",
  // "slice", "leaf", "sheet", "bunch") — only convertible with a per-unit weight.
  const per = opts.gramsPerUnit?.[u] ?? (u === '' ? opts.gramsPerUnit?.each : undefined)
  if (per != null && per > 0) return amount * per
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
