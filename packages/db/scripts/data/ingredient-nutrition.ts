/**
 * Per-100g nutrition facts for the ingredient master list.
 *
 * Source: USDA FoodData Central / SR Legacy (public domain US government
 * data). Seeded onto `Ingredient.nutritionalInfoPer100g` by
 * `seed-ingredient-nutrition.ts` (idempotent). The per-serving estimate on a
 * recipe page only renders when EVERY ingredient it uses has a record here, so
 * accuracy beats coverage: a number we can't stand behind is left out, not
 * guessed. `fdcId` records the source food for traceability.
 *
 * This file is the FIRST BATCH — common cooking + baking staples. The
 * remaining ingredients are added in follow-up batches once these are
 * eyeballed for accuracy.
 *
 * Values are per 100 g. Sodium is in milligrams. `gramsPerUnit` only appears
 * where recipes give the amount by count ("2 eggs") rather than weight/volume.
 */

import type { IngredientNutritionSeed } from './types.js'

export const INGREDIENT_NUTRITION: IngredientNutritionSeed[] = [
  // ── Flours & starches ──────────────────────────────────────────────────
  { slug: 'plain-flour', kcal: 364, protein: 10.3, fat: 1.0, saturatedFat: 0.16, carbohydrate: 76.3, sugar: 0.27, fibre: 2.7, sodiumMg: 2, fdcId: 169761 },
  { slug: 'self-raising-flour', kcal: 354, protein: 9.9, fat: 1.0, saturatedFat: 0.15, carbohydrate: 74.2, sugar: 0.34, fibre: 2.7, sodiumMg: 1379, fdcId: 169760 },
  { slug: 'strong-bread-flour', kcal: 361, protein: 12.0, fat: 1.66, saturatedFat: 0.24, carbohydrate: 72.5, sugar: 0.31, fibre: 2.4, sodiumMg: 2, fdcId: 168894 },
  { slug: 'wholemeal-flour', kcal: 340, protein: 13.2, fat: 2.5, saturatedFat: 0.43, carbohydrate: 72.0, sugar: 0.41, fibre: 10.7, sodiumMg: 2, fdcId: 168944 },
  { slug: 'cornflour', kcal: 381, protein: 0.26, fat: 0.05, saturatedFat: 0.009, carbohydrate: 91.3, sugar: 0, fibre: 0.9, sodiumMg: 9, fdcId: 169698 },

  // ── Oats ───────────────────────────────────────────────────────────────
  { slug: 'rolled-oats', kcal: 389, protein: 16.9, fat: 6.9, saturatedFat: 1.22, carbohydrate: 66.3, sugar: 0.99, fibre: 10.6, sodiumMg: 2, fdcId: 169705 },
  { slug: 'porridge-oats', kcal: 389, protein: 16.9, fat: 6.9, saturatedFat: 1.22, carbohydrate: 66.3, sugar: 0.99, fibre: 10.6, sodiumMg: 2, fdcId: 169705 },
  { slug: 'jumbo-oats', kcal: 389, protein: 16.9, fat: 6.9, saturatedFat: 1.22, carbohydrate: 66.3, sugar: 0.99, fibre: 10.6, sodiumMg: 2, fdcId: 169705 },

  // ── Sugars & syrups ────────────────────────────────────────────────────
  { slug: 'caster-sugar', kcal: 387, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 100, sugar: 99.8, fibre: 0, sodiumMg: 1, fdcId: 169655 },
  { slug: 'granulated-sugar', kcal: 387, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 100, sugar: 99.8, fibre: 0, sodiumMg: 1, fdcId: 169655 },
  { slug: 'icing-sugar', kcal: 389, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 99.9, sugar: 97.8, fibre: 0, sodiumMg: 2, fdcId: 169656 },
  { slug: 'light-brown-sugar', kcal: 380, protein: 0.12, fat: 0, saturatedFat: 0, carbohydrate: 98.1, sugar: 97.0, fibre: 0, sodiumMg: 28, fdcId: 168833 },
  { slug: 'dark-brown-sugar', kcal: 380, protein: 0.12, fat: 0, saturatedFat: 0, carbohydrate: 98.1, sugar: 97.0, fibre: 0, sodiumMg: 28, fdcId: 168833 },
  { slug: 'honey', kcal: 304, protein: 0.3, fat: 0, saturatedFat: 0, carbohydrate: 82.4, sugar: 82.1, fibre: 0.2, sodiumMg: 4, fdcId: 169640 },
  { slug: 'black-treacle', kcal: 290, protein: 0, fat: 0.1, saturatedFat: 0.022, carbohydrate: 74.7, sugar: 74.7, fibre: 0, sodiumMg: 37, fdcId: 169652 },

  // ── Dairy, eggs & fats ─────────────────────────────────────────────────
  { slug: 'whole-milk', kcal: 61, protein: 3.15, fat: 3.25, saturatedFat: 1.87, carbohydrate: 4.78, sugar: 5.05, fibre: 0, sodiumMg: 43, fdcId: 746782 },
  { slug: 'semi-skimmed-milk', kcal: 50, protein: 3.36, fat: 1.97, saturatedFat: 1.26, carbohydrate: 4.8, sugar: 5.06, fibre: 0, sodiumMg: 47, fdcId: 746776 },
  { slug: 'double-cream', kcal: 340, protein: 2.84, fat: 36.08, saturatedFat: 23.03, carbohydrate: 2.84, sugar: 2.92, fibre: 0, sodiumMg: 27, fdcId: 170859 },
  { slug: 'cheddar', kcal: 403, protein: 24.9, fat: 33.1, saturatedFat: 18.9, carbohydrate: 1.28, sugar: 0.52, fibre: 0, sodiumMg: 653, fdcId: 328637 },
  { slug: 'unsalted-butter', kcal: 717, protein: 0.85, fat: 81.11, saturatedFat: 51.37, carbohydrate: 0.06, sugar: 0.06, fibre: 0, sodiumMg: 11, fdcId: 173430 },
  { slug: 'salted-butter', kcal: 717, protein: 0.85, fat: 81.11, saturatedFat: 51.37, carbohydrate: 0.06, sugar: 0.06, fibre: 0, sodiumMg: 643, fdcId: 173410 },
  { slug: 'eggs', kcal: 143, protein: 12.56, fat: 9.51, saturatedFat: 3.13, carbohydrate: 0.72, sugar: 0.37, fibre: 0, sodiumMg: 142, gramsPerUnit: { each: 50, large: 60, medium: 50, small: 45, whole: 50, item: 50 }, fdcId: 748967 },

  // ── Oils ───────────────────────────────────────────────────────────────
  { slug: 'olive-oil', kcal: 884, protein: 0, fat: 100, saturatedFat: 13.81, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 2, fdcId: 171413 },
  { slug: 'extra-virgin-olive-oil', kcal: 884, protein: 0, fat: 100, saturatedFat: 13.81, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 2, fdcId: 171413 },
  { slug: 'sunflower-oil', kcal: 884, protein: 0, fat: 100, saturatedFat: 10.3, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 0, fdcId: 171026 },
  { slug: 'vegetable-oil', kcal: 884, protein: 0, fat: 100, saturatedFat: 14.0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 0, fdcId: 172336 },

  // ── Leaveners, salt & flavour ──────────────────────────────────────────
  { slug: 'baking-powder', kcal: 53, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 27.7, sugar: 0, fibre: 0.2, sodiumMg: 10600, fdcId: 168577 },
  { slug: 'bicarbonate-of-soda', kcal: 0, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 27360, fdcId: 175044 },
  { slug: 'table-salt', kcal: 0, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 38758, gramsPerUnit: { pinch: 0.4 }, fdcId: 173468 },
  { slug: 'yeast-dried', kcal: 325, protein: 40.4, fat: 7.61, saturatedFat: 0.97, carbohydrate: 41.2, sugar: 0, fibre: 26.9, sodiumMg: 51, fdcId: 175039 },
  { slug: 'vanilla-extract', kcal: 288, protein: 0.06, fat: 0.06, saturatedFat: 0.01, carbohydrate: 12.65, sugar: 12.65, fibre: 0, sodiumMg: 9, fdcId: 172234 },

  // ── Water ──────────────────────────────────────────────────────────────
  { slug: 'water', kcal: 0, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 0, fdcId: 174158 },

  // ════════════════════════════════════════════════════════════════════════
  // BATCH 2 — highest-frequency cooking + baking ingredients (2026-06-25).
  // gramsPerUnit only where a per-unit weight is well-established. Stocks,
  // spice blends, and ambiguous whole-fruit "each" weights deliberately left
  // for a later pass / skipped rather than guessed.
  // ════════════════════════════════════════════════════════════════════════

  // ── Salt variants the recipes actually use ─────────────────────────────
  { slug: 'salt-table', kcal: 0, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 38758, gramsPerUnit: { pinch: 0.4 }, fdcId: 173468 },
  { slug: 'sea-salt-fine', kcal: 0, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 38758, gramsPerUnit: { pinch: 0.4 }, fdcId: 173468 },
  { slug: 'sea-salt-flakes', kcal: 0, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 38758, gramsPerUnit: { pinch: 0.4 }, fdcId: 173468 },
  { slug: 'salt-flakes', kcal: 0, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 38758, gramsPerUnit: { pinch: 0.4 }, fdcId: 173468 },

  // ── Alliums & common veg ───────────────────────────────────────────────
  { slug: 'garlic', kcal: 149, protein: 6.36, fat: 0.5, saturatedFat: 0.089, carbohydrate: 33.06, sugar: 1.0, fibre: 2.1, sodiumMg: 17, gramsPerUnit: { clove: 3, tsp: 3, tbsp: 9, head: 50, each: 3, whole: 3, 'whole head': 50 }, fdcId: 169230 },
  { slug: 'onion', kcal: 40, protein: 1.1, fat: 0.1, saturatedFat: 0.042, carbohydrate: 9.34, sugar: 4.24, fibre: 1.7, sodiumMg: 4, gramsPerUnit: { each: 150, large: 170, medium: 150, small: 110, whole: 150, piece: 150, cup: 160 }, fdcId: 170000 },
  { slug: 'spring-onion', kcal: 32, protein: 1.83, fat: 0.19, saturatedFat: 0.032, carbohydrate: 7.34, sugar: 2.33, fibre: 2.6, sodiumMg: 16, gramsPerUnit: { each: 15, whole: 15, stalk: 15, bunch: 50, medium: 15 }, fdcId: 170005 },
  { slug: 'carrot', kcal: 41, protein: 0.93, fat: 0.24, saturatedFat: 0.032, carbohydrate: 9.58, sugar: 4.74, fibre: 2.8, sodiumMg: 69, gramsPerUnit: { each: 61, whole: 61, medium: 61, large: 80, small: 50, cup: 128, piece: 61 }, fdcId: 170393 },
  { slug: 'potato', kcal: 77, protein: 2.05, fat: 0.09, saturatedFat: 0.026, carbohydrate: 17.47, sugar: 0.82, fibre: 2.1, sodiumMg: 6, gramsPerUnit: { each: 170 }, fdcId: 170026 },
  { slug: 'celery', kcal: 16, protein: 0.69, fat: 0.17, saturatedFat: 0.042, carbohydrate: 2.97, sugar: 1.34, fibre: 1.6, sodiumMg: 80, gramsPerUnit: { stick: 40, stalk: 40, each: 40 }, fdcId: 169988 },
  { slug: 'tomato', kcal: 18, protein: 0.88, fat: 0.2, saturatedFat: 0.028, carbohydrate: 3.89, sugar: 2.63, fibre: 1.2, sodiumMg: 5, gramsPerUnit: { each: 120, medium: 120, whole: 120, large: 180, piece: 120 }, fdcId: 170457 },
  { slug: 'pepper-red', kcal: 31, protein: 0.99, fat: 0.3, saturatedFat: 0.027, carbohydrate: 6.03, sugar: 4.2, fibre: 2.1, sodiumMg: 4, gramsPerUnit: { each: 120, large: 160, medium: 120, whole: 120, cup: 150 }, fdcId: 170108 },
  { slug: 'pepper-green', kcal: 20, protein: 0.86, fat: 0.17, saturatedFat: 0.058, carbohydrate: 4.64, sugar: 2.4, fibre: 1.7, sodiumMg: 3, gramsPerUnit: { each: 120 }, fdcId: 170427 },
  { slug: 'spinach', kcal: 23, protein: 2.86, fat: 0.39, saturatedFat: 0.063, carbohydrate: 3.63, sugar: 0.42, fibre: 2.2, sodiumMg: 79, fdcId: 168462 },

  // ── Tinned / concentrated tomato ───────────────────────────────────────
  { slug: 'tinned-tomatoes', kcal: 32, protein: 1.64, fat: 0.28, saturatedFat: 0.039, carbohydrate: 7.29, sugar: 4.4, fibre: 1.9, sodiumMg: 130, fdcId: 170459 },
  { slug: 'tomato-puree', kcal: 82, protein: 4.32, fat: 0.47, saturatedFat: 0.067, carbohydrate: 18.91, sugar: 12.21, fibre: 4.1, sodiumMg: 59, fdcId: 170460 },

  // ── Dairy & eggs ───────────────────────────────────────────────────────
  { slug: 'parmesan', kcal: 392, protein: 35.75, fat: 25.83, saturatedFat: 16.41, carbohydrate: 3.22, sugar: 0.8, fibre: 0, sodiumMg: 1529, fdcId: 170848 },
  { slug: 'soured-cream', kcal: 198, protein: 2.44, fat: 19.35, saturatedFat: 11.51, carbohydrate: 4.63, sugar: 3.5, fibre: 0, sodiumMg: 61, fdcId: 173441 },
  { slug: 'egg-yolks', kcal: 322, protein: 15.86, fat: 26.54, saturatedFat: 9.55, carbohydrate: 3.59, sugar: 0.56, fibre: 0, sodiumMg: 48, gramsPerUnit: { each: 18, large: 19, medium: 18 }, fdcId: 172183 },

  // ── Chocolate, cocoa & baking ──────────────────────────────────────────
  { slug: 'dark-chocolate', kcal: 598, protein: 7.79, fat: 42.63, saturatedFat: 24.49, carbohydrate: 45.9, sugar: 23.99, fibre: 10.9, sodiumMg: 20, fdcId: 170273 },
  { slug: 'cocoa-powder', kcal: 228, protein: 19.6, fat: 13.7, saturatedFat: 8.07, carbohydrate: 57.9, sugar: 1.75, fibre: 37, sodiumMg: 21, fdcId: 169593 },
  { slug: 'golden-syrup', kcal: 325, protein: 0.3, fat: 0, saturatedFat: 0, carbohydrate: 79, sugar: 79, fibre: 0, sodiumMg: 55 },
  { slug: 'yeast-fast-action', kcal: 325, protein: 40.4, fat: 7.61, saturatedFat: 0.97, carbohydrate: 41.2, sugar: 0, fibre: 26.9, sodiumMg: 51, fdcId: 175039 },

  // ── Oils & condiments (volume converts via stored density) ─────────────
  { slug: 'sesame-oil', kcal: 884, protein: 0, fat: 100, saturatedFat: 14.2, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 0, fdcId: 171031 },
  { slug: 'soy-sauce-light', kcal: 53, protein: 8.14, fat: 0.57, saturatedFat: 0.077, carbohydrate: 4.93, sugar: 0.4, fibre: 0.8, sodiumMg: 5493, fdcId: 174278 },
  { slug: 'worcestershire-sauce', kcal: 78, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 19.46, sugar: 10, fibre: 0, sodiumMg: 980, fdcId: 172242 },
  { slug: 'fish-sauce', kcal: 35, protein: 5.06, fat: 0.01, saturatedFat: 0.003, carbohydrate: 3.64, sugar: 3.64, fibre: 0, sodiumMg: 7851, fdcId: 174300 },
  { slug: 'dijon-mustard', kcal: 66, protein: 4.0, fat: 3.3, saturatedFat: 0.2, carbohydrate: 5.0, sugar: 1.0, fibre: 3.0, sodiumMg: 1120, fdcId: 1100501 },
  { slug: 'lemon-juice', kcal: 22, protein: 0.35, fat: 0.24, saturatedFat: 0.04, carbohydrate: 6.9, sugar: 2.52, fibre: 0.3, sodiumMg: 1, fdcId: 167747 },
  { slug: 'coconut-milk', kcal: 197, protein: 2.02, fat: 21.33, saturatedFat: 18.91, carbohydrate: 2.81, sugar: 0, fibre: 2.2, sodiumMg: 15, fdcId: 170173 },

  // ── Wine (volume converts via stored density) ──────────────────────────
  { slug: 'white-wine-dry', kcal: 82, protein: 0.07, fat: 0, saturatedFat: 0, carbohydrate: 2.6, sugar: 0.96, fibre: 0, sodiumMg: 7, fdcId: 174843 },
  { slug: 'dry-white-wine', kcal: 82, protein: 0.07, fat: 0, saturatedFat: 0, carbohydrate: 2.6, sugar: 0.96, fibre: 0, sodiumMg: 7, fdcId: 174843 },
  { slug: 'red-wine', kcal: 85, protein: 0.07, fat: 0, saturatedFat: 0, carbohydrate: 2.61, sugar: 0.62, fibre: 0, sodiumMg: 4, fdcId: 174848 },

  // ── Nuts & seeds ───────────────────────────────────────────────────────
  { slug: 'walnuts', kcal: 654, protein: 15.23, fat: 65.21, saturatedFat: 6.13, carbohydrate: 13.71, sugar: 2.61, fibre: 6.7, sodiumMg: 2, fdcId: 170187 },
  { slug: 'sesame-seeds', kcal: 573, protein: 17.73, fat: 49.67, saturatedFat: 6.96, carbohydrate: 23.45, sugar: 0.3, fibre: 11.8, sodiumMg: 11, gramsPerUnit: { tbsp: 9, tsp: 3 }, fdcId: 170150 },

  // ── Grains & pasta ─────────────────────────────────────────────────────
  { slug: 'pasta-dried', kcal: 371, protein: 13.04, fat: 1.51, saturatedFat: 0.277, carbohydrate: 74.67, sugar: 2.67, fibre: 3.2, sodiumMg: 6, fdcId: 168927 },
  { slug: 'long-grain-rice', kcal: 365, protein: 7.13, fat: 0.66, saturatedFat: 0.18, carbohydrate: 79.95, sugar: 0.12, fibre: 1.3, sodiumMg: 5, fdcId: 169756 },

  // ── Ginger (weight usage converts) ─────────────────────────────────────
  { slug: 'ginger-fresh', kcal: 80, protein: 1.82, fat: 0.75, saturatedFat: 0.203, carbohydrate: 17.77, sugar: 1.7, fibre: 2.0, sodiumMg: 13, gramsPerUnit: { thumb: 15, cm: 6, 'cm piece': 6, slice: 3, whole: 30, tbsp: 6, tsp: 2, piece: 15 }, fdcId: 169231 },
  { slug: 'ginger-root', kcal: 80, protein: 1.82, fat: 0.75, saturatedFat: 0.203, carbohydrate: 17.77, sugar: 1.7, fibre: 2.0, sodiumMg: 13, gramsPerUnit: { thumb: 15, cm: 6, 'cm piece': 6, slice: 3, whole: 30, tbsp: 6, tsp: 2, piece: 15 }, fdcId: 169231 },

  // ── Meat (weight usage converts) ───────────────────────────────────────
  { slug: 'chicken-breast', kcal: 120, protein: 22.5, fat: 2.62, saturatedFat: 0.56, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 45, gramsPerUnit: { each: 170, fillet: 170, whole: 170, breast: 170, piece: 170, medium: 170 }, fdcId: 171077 },
  { slug: 'chicken-thigh', kcal: 121, protein: 19.7, fat: 4.1, saturatedFat: 1.1, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 86, gramsPerUnit: { each: 120, thigh: 120, piece: 120, whole: 120 }, fdcId: 171066 },
  { slug: 'chicken-thighs-boneless', kcal: 121, protein: 19.7, fat: 4.1, saturatedFat: 1.1, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 86, gramsPerUnit: { each: 120, piece: 120 }, fdcId: 171066 },
  { slug: 'beef-mince', kcal: 254, protein: 17.17, fat: 20.0, saturatedFat: 7.6, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 66, fdcId: 174032 },
  { slug: 'pork-mince', kcal: 263, protein: 16.88, fat: 21.19, saturatedFat: 7.87, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 56, fdcId: 167909 },

  // ════════════════════════════════════════════════════════════════════════
  // BATCH 3 — next tier of cooking + baking ingredients (2026-06-25).
  // ════════════════════════════════════════════════════════════════════════

  // ── Cheese & dairy ─────────────────────────────────────────────────────
  { slug: 'cream-cheese', kcal: 342, protein: 5.93, fat: 34.24, saturatedFat: 19.29, carbohydrate: 5.52, sugar: 3.76, fibre: 0, sodiumMg: 321 },
  { slug: 'mozzarella', kcal: 300, protein: 22.17, fat: 22.35, saturatedFat: 13.15, carbohydrate: 2.19, sugar: 1.03, fibre: 0, sodiumMg: 627 },
  { slug: 'feta', kcal: 264, protein: 14.21, fat: 21.28, saturatedFat: 14.95, carbohydrate: 4.09, sugar: 4.09, fibre: 0, sodiumMg: 917 },
  { slug: 'ricotta', kcal: 174, protein: 11.26, fat: 12.98, saturatedFat: 8.29, carbohydrate: 3.04, sugar: 0.27, fibre: 0, sodiumMg: 84 },
  { slug: 'gruyere', kcal: 413, protein: 29.81, fat: 32.34, saturatedFat: 18.91, carbohydrate: 0.36, sugar: 0.36, fibre: 0, sodiumMg: 336 },
  { slug: 'buttermilk', kcal: 40, protein: 3.31, fat: 0.88, saturatedFat: 0.547, carbohydrate: 4.79, sugar: 4.79, fibre: 0, sodiumMg: 105 },
  { slug: 'greek-yoghurt', kcal: 97, protein: 9.0, fat: 5.0, saturatedFat: 3.21, carbohydrate: 3.98, sugar: 3.98, fibre: 0, sodiumMg: 35 },
  { slug: 'plain-yoghurt', kcal: 61, protein: 3.47, fat: 3.25, saturatedFat: 2.1, carbohydrate: 4.66, sugar: 4.66, fibre: 0, sodiumMg: 46 },
  { slug: 'condensed-milk', kcal: 321, protein: 7.91, fat: 8.7, saturatedFat: 5.486, carbohydrate: 54.4, sugar: 54.4, fibre: 0, sodiumMg: 127 },
  { slug: 'egg-whites', kcal: 52, protein: 10.9, fat: 0.17, saturatedFat: 0, carbohydrate: 0.73, sugar: 0.71, fibre: 0, sodiumMg: 166, gramsPerUnit: { each: 33, large: 36, medium: 33 } },

  // ── Fats & rich condiments ─────────────────────────────────────────────
  { slug: 'mayonnaise', kcal: 680, protein: 0.96, fat: 74.85, saturatedFat: 11.6, carbohydrate: 0.57, sugar: 0.5, fibre: 0, sodiumMg: 635 },
  { slug: 'ghee', kcal: 900, protein: 0, fat: 99.5, saturatedFat: 61.9, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 2 },
  { slug: 'lard', kcal: 902, protein: 0, fat: 100, saturatedFat: 39.2, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 0 },

  // ── Baking dry goods ───────────────────────────────────────────────────
  { slug: 'ground-almonds', kcal: 579, protein: 21.15, fat: 49.93, saturatedFat: 3.8, carbohydrate: 21.55, sugar: 4.35, fibre: 12.5, sodiumMg: 1 },
  { slug: 'almond-flour', kcal: 579, protein: 21.15, fat: 49.93, saturatedFat: 3.8, carbohydrate: 21.55, sugar: 4.35, fibre: 12.5, sodiumMg: 1 },
  { slug: 'almonds-flaked', kcal: 579, protein: 21.15, fat: 49.93, saturatedFat: 3.8, carbohydrate: 21.55, sugar: 4.35, fibre: 12.5, sodiumMg: 1 },
  { slug: 'breadcrumbs-dried', kcal: 395, protein: 13.35, fat: 5.3, saturatedFat: 1.2, carbohydrate: 71.98, sugar: 6.2, fibre: 4.5, sodiumMg: 732 },
  { slug: 'polenta', kcal: 362, protein: 8.12, fat: 3.59, saturatedFat: 0.5, carbohydrate: 76.85, sugar: 0.64, fibre: 7.3, sodiumMg: 35 },
  { slug: 'desiccated-coconut', kcal: 660, protein: 6.88, fat: 64.53, saturatedFat: 57.22, carbohydrate: 23.65, sugar: 7.35, fibre: 16.3, sodiumMg: 37 },

  // ── Rice ───────────────────────────────────────────────────────────────
  { slug: 'basmati-rice', kcal: 365, protein: 7.13, fat: 0.66, saturatedFat: 0.18, carbohydrate: 79.95, sugar: 0.12, fibre: 1.3, sodiumMg: 5 },
  { slug: 'arborio-rice', kcal: 365, protein: 7.13, fat: 0.66, saturatedFat: 0.18, carbohydrate: 79.95, sugar: 0.12, fibre: 1.3, sodiumMg: 5 },
  { slug: 'short-grain-rice', kcal: 365, protein: 7.13, fat: 0.66, saturatedFat: 0.18, carbohydrate: 79.95, sugar: 0.12, fibre: 1.3, sodiumMg: 5 },

  // ── Sugars & syrups ────────────────────────────────────────────────────
  { slug: 'soft-brown-sugar', kcal: 380, protein: 0.12, fat: 0, saturatedFat: 0, carbohydrate: 98.09, sugar: 97.02, fibre: 0, sodiumMg: 28 },
  { slug: 'demerara-sugar', kcal: 380, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 98.5, sugar: 97, fibre: 0, sodiumMg: 3 },
  { slug: 'maple-syrup', kcal: 260, protein: 0.04, fat: 0.06, saturatedFat: 0.012, carbohydrate: 67.04, sugar: 60.46, fibre: 0, sodiumMg: 12 },
  { slug: 'raspberry-jam', kcal: 250, protein: 0.38, fat: 0.07, saturatedFat: 0.01, carbohydrate: 65.77, sugar: 48.5, fibre: 1.1, sodiumMg: 32 },

  // ── Dried fruit ────────────────────────────────────────────────────────
  { slug: 'raisins', kcal: 299, protein: 3.07, fat: 0.46, saturatedFat: 0.058, carbohydrate: 79.18, sugar: 59.19, fibre: 3.7, sodiumMg: 11 },
  { slug: 'currants', kcal: 283, protein: 4.08, fat: 0.27, saturatedFat: 0.029, carbohydrate: 74.08, sugar: 67.28, fibre: 6.8, sodiumMg: 8 },
  { slug: 'mixed-peel', kcal: 314, protein: 0.3, fat: 0.1, saturatedFat: 0, carbohydrate: 82.8, sugar: 80, fibre: 3.0, sodiumMg: 30 },

  // ── Nuts & seeds ───────────────────────────────────────────────────────
  { slug: 'pistachios', kcal: 560, protein: 20.16, fat: 45.32, saturatedFat: 5.91, carbohydrate: 27.17, sugar: 7.66, fibre: 10.6, sodiumMg: 1 },
  { slug: 'pine-nuts', kcal: 673, protein: 13.69, fat: 68.37, saturatedFat: 4.9, carbohydrate: 13.08, sugar: 3.59, fibre: 3.7, sodiumMg: 2 },
  { slug: 'peanuts', kcal: 567, protein: 25.8, fat: 49.24, saturatedFat: 6.28, carbohydrate: 16.13, sugar: 4.72, fibre: 8.5, sodiumMg: 18 },

  // ── Veg ────────────────────────────────────────────────────────────────
  { slug: 'mushrooms-chestnut', kcal: 22, protein: 3.09, fat: 0.34, saturatedFat: 0.05, carbohydrate: 3.26, sugar: 1.98, fibre: 1.0, sodiumMg: 5 },
  { slug: 'chestnut-mushrooms', kcal: 22, protein: 3.09, fat: 0.34, saturatedFat: 0.05, carbohydrate: 3.26, sugar: 1.98, fibre: 1.0, sodiumMg: 5 },
  { slug: 'courgette', kcal: 17, protein: 1.21, fat: 0.32, saturatedFat: 0.084, carbohydrate: 3.11, sugar: 2.5, fibre: 1.0, sodiumMg: 8, gramsPerUnit: { each: 200 } },
  { slug: 'aubergine', kcal: 25, protein: 0.98, fat: 0.18, saturatedFat: 0.034, carbohydrate: 5.88, sugar: 3.53, fibre: 3.0, sodiumMg: 2, gramsPerUnit: { each: 250, medium: 250, large: 350, small: 180, whole: 250, piece: 250 } },
  { slug: 'cabbage-white', kcal: 25, protein: 1.28, fat: 0.1, saturatedFat: 0.013, carbohydrate: 5.8, sugar: 3.2, fibre: 2.5, sodiumMg: 18, gramsPerUnit: { head: 900, each: 900, 'large head': 1200, 'small head': 600 } },
  { slug: 'leek', kcal: 61, protein: 1.5, fat: 0.3, saturatedFat: 0.04, carbohydrate: 14.15, sugar: 3.9, fibre: 1.8, sodiumMg: 20, gramsPerUnit: { each: 90 } },
  { slug: 'shallot', kcal: 72, protein: 2.5, fat: 0.1, saturatedFat: 0.017, carbohydrate: 16.8, sugar: 7.87, fibre: 3.2, sodiumMg: 12, gramsPerUnit: { each: 30 } },
  { slug: 'shallots', kcal: 72, protein: 2.5, fat: 0.1, saturatedFat: 0.017, carbohydrate: 16.8, sugar: 7.87, fibre: 3.2, sodiumMg: 12, gramsPerUnit: { each: 30 } },
  { slug: 'red-onion', kcal: 40, protein: 1.1, fat: 0.1, saturatedFat: 0.042, carbohydrate: 9.34, sugar: 4.24, fibre: 1.7, sodiumMg: 4, gramsPerUnit: { each: 110 } },
  { slug: 'cucumber', kcal: 15, protein: 0.65, fat: 0.11, saturatedFat: 0.037, carbohydrate: 3.63, sugar: 1.67, fibre: 0.5, sodiumMg: 2, gramsPerUnit: { each: 300 } },
  { slug: 'peas-frozen', kcal: 77, protein: 5.22, fat: 0.4, saturatedFat: 0.071, carbohydrate: 13.7, sugar: 4.96, fibre: 5.1, sodiumMg: 72 },
  { slug: 'green-beans', kcal: 31, protein: 1.83, fat: 0.22, saturatedFat: 0.05, carbohydrate: 6.97, sugar: 3.26, fibre: 2.7, sodiumMg: 6 },
  { slug: 'bean-sprouts', kcal: 30, protein: 3.04, fat: 0.18, saturatedFat: 0.046, carbohydrate: 5.94, sugar: 4.13, fibre: 1.8, sodiumMg: 6 },
  { slug: 'cherry-tomatoes', kcal: 18, protein: 0.88, fat: 0.2, saturatedFat: 0.028, carbohydrate: 3.89, sugar: 2.63, fibre: 1.2, sodiumMg: 5 },
  { slug: 'potatoes-floury', kcal: 77, protein: 2.05, fat: 0.09, saturatedFat: 0.026, carbohydrate: 17.47, sugar: 0.82, fibre: 2.1, sodiumMg: 6, gramsPerUnit: { each: 170 } },
  { slug: 'strawberries', kcal: 32, protein: 0.67, fat: 0.3, saturatedFat: 0.015, carbohydrate: 7.68, sugar: 4.89, fibre: 2.0, sodiumMg: 1 },

  // ── Fruit ──────────────────────────────────────────────────────────────
  { slug: 'orange', kcal: 47, protein: 0.94, fat: 0.12, saturatedFat: 0.015, carbohydrate: 11.75, sugar: 9.35, fibre: 2.4, sodiumMg: 0, gramsPerUnit: { each: 130 } },
  { slug: 'apple-eating', kcal: 52, protein: 0.26, fat: 0.17, saturatedFat: 0.028, carbohydrate: 13.81, sugar: 10.39, fibre: 2.4, sodiumMg: 1, gramsPerUnit: { each: 180 } },
  { slug: 'avocado', kcal: 160, protein: 2.0, fat: 14.66, saturatedFat: 2.13, carbohydrate: 8.53, sugar: 0.66, fibre: 6.7, sodiumMg: 7, gramsPerUnit: { each: 150, large: 170, medium: 150, small: 110, whole: 150, piece: 150, cup: 160 } },

  // ── Meat & fish (weight usage converts) ────────────────────────────────
  { slug: 'lamb-shoulder', kcal: 257, protein: 16.56, fat: 20.79, saturatedFat: 8.83, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 63 },
  { slug: 'lamb-mince', kcal: 282, protein: 16.56, fat: 23.41, saturatedFat: 10.19, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 59 },
  { slug: 'beef-chuck', kcal: 217, protein: 18.6, fat: 15.4, saturatedFat: 6.1, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 66 },
  { slug: 'beef-sirloin', kcal: 201, protein: 21.6, fat: 12.7, saturatedFat: 4.9, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 53 },
  { slug: 'pork-shoulder', kcal: 211, protein: 17.8, fat: 15.0, saturatedFat: 5.3, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 61 },
  { slug: 'pork-belly', kcal: 518, protein: 9.34, fat: 53.01, saturatedFat: 19.33, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 32 },
  { slug: 'streaky-bacon', kcal: 393, protein: 12.6, fat: 37.0, saturatedFat: 12.3, carbohydrate: 1.3, sugar: 0, fibre: 0, sodiumMg: 662, gramsPerUnit: { rasher: 25, slice: 25 } },
  { slug: 'lardons', kcal: 393, protein: 12.6, fat: 37.0, saturatedFat: 12.3, carbohydrate: 1.3, sugar: 0, fibre: 0, sodiumMg: 662 },
  { slug: 'prawns-raw', kcal: 85, protein: 20.1, fat: 0.51, saturatedFat: 0.14, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 119 },
  { slug: 'king-prawns', kcal: 85, protein: 20.1, fat: 0.51, saturatedFat: 0.14, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 119 },
  { slug: 'cod-fillet', kcal: 82, protein: 17.81, fat: 0.67, saturatedFat: 0.13, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 54, gramsPerUnit: { each: 150, large: 170, medium: 150, small: 110, whole: 150, piece: 150, cup: 160 } },
  { slug: 'salmon-fillet', kcal: 208, protein: 20.42, fat: 13.42, saturatedFat: 3.05, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 59, gramsPerUnit: { each: 150, large: 170, medium: 150, small: 110, whole: 150, piece: 150, cup: 160 } },

  // ── Legumes ────────────────────────────────────────────────────────────
  { slug: 'chickpeas-tinned', kcal: 139, protein: 7.05, fat: 2.59, saturatedFat: 0.268, carbohydrate: 22.55, sugar: 3.76, fibre: 6.4, sodiumMg: 241 },

  // ── Condiments & vinegars (volume converts via stored density) ─────────
  { slug: 'white-wine-vinegar', kcal: 19, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0.27, sugar: 0.27, fibre: 0, sodiumMg: 8 },
  { slug: 'red-wine-vinegar', kcal: 19, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0.27, sugar: 0, fibre: 0, sodiumMg: 8 },
  { slug: 'cider-vinegar', kcal: 21, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0.93, sugar: 0.4, fibre: 0, sodiumMg: 5 },
  { slug: 'rice-vinegar', kcal: 18, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0.5, sugar: 0, fibre: 0, sodiumMg: 2 },
  { slug: 'soy-sauce-dark', kcal: 53, protein: 8.14, fat: 0.57, saturatedFat: 0.077, carbohydrate: 4.93, sugar: 0.4, fibre: 0.8, sodiumMg: 5493 },
  { slug: 'capers', kcal: 23, protein: 2.36, fat: 0.86, saturatedFat: 0.233, carbohydrate: 4.89, sugar: 0.41, fibre: 3.2, sodiumMg: 2964, gramsPerUnit: { tbsp: 9, tsp: 3 } },
  { slug: 'olives-black', kcal: 115, protein: 0.84, fat: 10.68, saturatedFat: 1.415, carbohydrate: 6.26, sugar: 0, fibre: 3.2, sodiumMg: 735 },
  { slug: 'almond-extract', kcal: 288, protein: 0.06, fat: 0.06, saturatedFat: 0.01, carbohydrate: 12.65, sugar: 12.65, fibre: 0, sodiumMg: 9 },

  // ── Pure spices (weight usage converts; tsp needs density) ─────────────
  { slug: 'nutmeg', kcal: 525, protein: 5.84, fat: 36.31, saturatedFat: 25.94, carbohydrate: 49.29, sugar: 28.49, fibre: 20.8, sodiumMg: 16, gramsPerUnit: { tsp: 2.2, tbsp: 6.6, pinch: 0.3, 'small pinch': 0.15, whole: 5, each: 5 } },
  { slug: 'nutmeg-ground', kcal: 525, protein: 5.84, fat: 36.31, saturatedFat: 25.94, carbohydrate: 49.29, sugar: 28.49, fibre: 20.8, sodiumMg: 16, gramsPerUnit: { tsp: 2.2, tbsp: 6.6, pinch: 0.3, 'small pinch': 0.15, whole: 5, each: 5 } },
  { slug: 'cumin-seeds', kcal: 375, protein: 17.81, fat: 22.27, saturatedFat: 1.535, carbohydrate: 44.24, sugar: 2.25, fibre: 10.5, sodiumMg: 168, gramsPerUnit: { tsp: 2.1, tbsp: 6.3 } },
  { slug: 'smoked-paprika', kcal: 282, protein: 14.14, fat: 12.89, saturatedFat: 2.14, carbohydrate: 53.99, sugar: 7.54, fibre: 34.9, sodiumMg: 68, gramsPerUnit: { tsp: 2.3, tbsp: 6.9 } },
  { slug: 'cayenne-pepper', kcal: 318, protein: 12.01, fat: 17.27, saturatedFat: 3.26, carbohydrate: 56.63, sugar: 10.24, fibre: 27.2, sodiumMg: 30, gramsPerUnit: { tsp: 1.8, tbsp: 5.4 } },
  { slug: 'garlic-powder', kcal: 331, protein: 16.55, fat: 0.73, saturatedFat: 0.249, carbohydrate: 72.73, sugar: 2.43, fibre: 9.0, sodiumMg: 60, gramsPerUnit: { tsp: 3.1, tbsp: 9.3 } },
  { slug: 'ginger-ground', kcal: 335, protein: 8.98, fat: 4.24, saturatedFat: 2.6, carbohydrate: 71.62, sugar: 3.39, fibre: 14.1, sodiumMg: 27, gramsPerUnit: { tsp: 1.8, tbsp: 5.4 } },
  { slug: 'turmeric-ground', kcal: 312, protein: 9.68, fat: 3.25, saturatedFat: 1.84, carbohydrate: 67.14, sugar: 3.21, fibre: 22.7, sodiumMg: 27, gramsPerUnit: { tsp: 3, tbsp: 9 } },
  { slug: 'cardamom-ground', kcal: 311, protein: 10.76, fat: 6.7, saturatedFat: 0.68, carbohydrate: 68.47, sugar: 0, fibre: 28.0, sodiumMg: 18, gramsPerUnit: { tsp: 2, tbsp: 6 } },
  { slug: 'mustard-seeds', kcal: 508, protein: 26.08, fat: 36.24, saturatedFat: 1.989, carbohydrate: 28.09, sugar: 6.79, fibre: 12.2, sodiumMg: 13 },
  { slug: 'saffron', kcal: 310, protein: 11.43, fat: 5.85, saturatedFat: 1.586, carbohydrate: 65.37, sugar: 0.45, fibre: 3.9, sodiumMg: 148, gramsPerUnit: { pinch: 0.07, tsp: 0.7, tbsp: 2.1 } },

  // ── Fresh herbs & chillies ─────────────────────────────────────────────
  { slug: 'coriander', kcal: 23, protein: 2.13, fat: 0.52, saturatedFat: 0.014, carbohydrate: 3.67, sugar: 0.87, fibre: 2.8, sodiumMg: 46 },
  { slug: 'mint', kcal: 70, protein: 3.75, fat: 0.94, saturatedFat: 0.246, carbohydrate: 14.89, sugar: 0, fibre: 8.0, sodiumMg: 30 },
  { slug: 'dill', kcal: 43, protein: 3.46, fat: 1.12, saturatedFat: 0.06, carbohydrate: 7.02, sugar: 0, fibre: 2.1, sodiumMg: 61 },
  { slug: 'chives', kcal: 30, protein: 3.27, fat: 0.73, saturatedFat: 0.146, carbohydrate: 4.35, sugar: 1.85, fibre: 2.5, sodiumMg: 3 },
  { slug: 'chilli-green', kcal: 40, protein: 1.87, fat: 0.44, saturatedFat: 0.044, carbohydrate: 8.81, sugar: 5.3, fibre: 1.5, sodiumMg: 9, gramsPerUnit: { each: 15, whole: 15, stalk: 15, bunch: 50, medium: 15 } },
  { slug: 'scotch-bonnet', kcal: 40, protein: 1.87, fat: 0.44, saturatedFat: 0.044, carbohydrate: 8.81, sugar: 5.3, fibre: 1.5, sodiumMg: 9, gramsPerUnit: { each: 10 } },

  // ════════════════════════════════════════════════════════════════════════
  // BATCH 4 — third tier + common ground spices (for weight usage) (2026-06-25).
  // ════════════════════════════════════════════════════════════════════════

  // ── Common ground spices (per 100g; tsp usage needs a density we don't set,
  //    so these mainly help recipes that weigh their spices) ───────────────
  { slug: 'black-pepper', kcal: 251, protein: 10.4, fat: 3.26, saturatedFat: 1.39, carbohydrate: 63.95, sugar: 0.64, fibre: 25.3, sodiumMg: 20, gramsPerUnit: { tsp: 2.3, tbsp: 6.9, pinch: 0.3, grind: 0.2 } },
  { slug: 'black-pepper-ground', kcal: 251, protein: 10.4, fat: 3.26, saturatedFat: 1.39, carbohydrate: 63.95, sugar: 0.64, fibre: 25.3, sodiumMg: 20, gramsPerUnit: { tsp: 2.3, tbsp: 6.9, pinch: 0.3, grind: 0.2 } },
  { slug: 'white-pepper', kcal: 296, protein: 10.4, fat: 2.12, saturatedFat: 0.626, carbohydrate: 68.61, sugar: 0.64, fibre: 26.2, sodiumMg: 5, gramsPerUnit: { tsp: 2.4, tbsp: 7.2, pinch: 0.3, grind: 0.2 } },
  { slug: 'cumin-ground', kcal: 375, protein: 17.81, fat: 22.27, saturatedFat: 1.535, carbohydrate: 44.24, sugar: 2.25, fibre: 10.5, sodiumMg: 168, gramsPerUnit: { tsp: 2.1, tbsp: 6.3 } },
  { slug: 'coriander-ground', kcal: 298, protein: 12.37, fat: 17.77, saturatedFat: 0.99, carbohydrate: 54.99, sugar: 0, fibre: 41.9, sodiumMg: 35, gramsPerUnit: { tsp: 1.8, tbsp: 5.4 } },
  { slug: 'cinnamon-ground', kcal: 247, protein: 3.99, fat: 1.24, saturatedFat: 0.345, carbohydrate: 80.59, sugar: 2.17, fibre: 53.1, sodiumMg: 10, gramsPerUnit: { tsp: 2.6, tbsp: 7.8 } },
  { slug: 'turmeric', kcal: 312, protein: 9.68, fat: 3.25, saturatedFat: 1.84, carbohydrate: 67.14, sugar: 3.21, fibre: 22.7, sodiumMg: 27, gramsPerUnit: { tsp: 3, tbsp: 9 } },
  { slug: 'paprika-sweet', kcal: 282, protein: 14.14, fat: 12.89, saturatedFat: 2.14, carbohydrate: 53.99, sugar: 7.54, fibre: 34.9, sodiumMg: 68, gramsPerUnit: { tsp: 2.3, tbsp: 6.9 } },
  { slug: 'paprika-hot', kcal: 282, protein: 14.14, fat: 12.89, saturatedFat: 2.14, carbohydrate: 53.99, sugar: 7.54, fibre: 34.9, sodiumMg: 68, gramsPerUnit: { tsp: 2.3, tbsp: 6.9 } },
  { slug: 'chilli-flakes', kcal: 282, protein: 13.46, fat: 14.28, saturatedFat: 2.48, carbohydrate: 49.7, sugar: 7.19, fibre: 34.8, sodiumMg: 30, gramsPerUnit: { tsp: 2, tbsp: 6 } },
  { slug: 'allspice', kcal: 263, protein: 6.09, fat: 8.69, saturatedFat: 2.55, carbohydrate: 72.12, sugar: 0, fibre: 21.6, sodiumMg: 77, gramsPerUnit: { tsp: 1.9, tbsp: 5.7 } },
  { slug: 'caraway-seeds', kcal: 333, protein: 19.77, fat: 14.59, saturatedFat: 0.62, carbohydrate: 49.9, sugar: 0.64, fibre: 38.0, sodiumMg: 17 },
  { slug: 'fennel-seeds', kcal: 345, protein: 15.8, fat: 14.87, saturatedFat: 0.48, carbohydrate: 52.29, sugar: 0, fibre: 39.8, sodiumMg: 88, gramsPerUnit: { tsp: 2, tbsp: 6 } },
  { slug: 'onion-powder', kcal: 341, protein: 10.41, fat: 1.04, saturatedFat: 0.176, carbohydrate: 79.12, sugar: 6.63, fibre: 15.2, sodiumMg: 73, gramsPerUnit: { tsp: 2.4, tbsp: 7.2 } },
  { slug: 'thyme-dried', kcal: 276, protein: 9.11, fat: 7.43, saturatedFat: 2.73, carbohydrate: 63.94, sugar: 1.71, fibre: 37.0, sodiumMg: 55, gramsPerUnit: { tsp: 1, tbsp: 3 } },
  { slug: 'curry-powder', kcal: 325, protein: 14.29, fat: 14.01, saturatedFat: 2.16, carbohydrate: 55.83, sugar: 2.76, fibre: 33.2, sodiumMg: 52, gramsPerUnit: { tsp: 2, tbsp: 6 } },
  // Bay leaves are usually fished out before serving, so their tiny weight adds
  // next to nothing — the point is to stop them blocking the whole panel.
  { slug: 'bay-leaves', kcal: 313, protein: 7.61, fat: 8.36, saturatedFat: 2.28, carbohydrate: 74.97, sugar: 0, fibre: 26.3, sodiumMg: 23, gramsPerUnit: { leaf: 0.6, leaves: 0.6, each: 0.6, whole: 0.6, piece: 0.6 } },

  // ── Flours & grains ────────────────────────────────────────────────────
  { slug: '00-flour', kcal: 364, protein: 10.3, fat: 1.0, saturatedFat: 0.16, carbohydrate: 76.3, sugar: 0.27, fibre: 2.7, sodiumMg: 2 },
  { slug: 'rye-flour', kcal: 325, protein: 8.37, fat: 1.52, saturatedFat: 0.176, carbohydrate: 75.43, sugar: 0.98, fibre: 11.8, sodiumMg: 1 },
  { slug: 'wholemeal-bread-flour', kcal: 340, protein: 13.2, fat: 2.5, saturatedFat: 0.43, carbohydrate: 72.0, sugar: 0.41, fibre: 10.7, sodiumMg: 2 },
  { slug: 'semolina', kcal: 360, protein: 12.68, fat: 1.05, saturatedFat: 0.15, carbohydrate: 72.83, sugar: 0, fibre: 3.9, sodiumMg: 1 },
  { slug: 'spaghetti', kcal: 371, protein: 13.04, fat: 1.51, saturatedFat: 0.277, carbohydrate: 74.67, sugar: 2.67, fibre: 3.2, sodiumMg: 6 },
  { slug: 'noodles-egg', kcal: 384, protein: 14.16, fat: 4.44, saturatedFat: 1.18, carbohydrate: 71.27, sugar: 1.88, fibre: 3.3, sodiumMg: 21 },
  { slug: 'noodles-rice', kcal: 364, protein: 5.95, fat: 0.56, saturatedFat: 0.15, carbohydrate: 80.18, sugar: 0, fibre: 1.6, sodiumMg: 182 },
  { slug: 'jasmine-rice', kcal: 365, protein: 7.13, fat: 0.66, saturatedFat: 0.18, carbohydrate: 79.95, sugar: 0.12, fibre: 1.3, sodiumMg: 5 },
  { slug: 'red-lentils', kcal: 352, protein: 24.63, fat: 1.06, saturatedFat: 0.154, carbohydrate: 63.35, sugar: 2.03, fibre: 10.7, sodiumMg: 6 },
  { slug: 'lentils-green', kcal: 352, protein: 24.63, fat: 1.06, saturatedFat: 0.154, carbohydrate: 63.35, sugar: 2.03, fibre: 10.7, sodiumMg: 6 },

  // ── Bread & crumbs ─────────────────────────────────────────────────────
  { slug: 'bread-white', kcal: 266, protein: 9.43, fat: 3.59, saturatedFat: 0.78, carbohydrate: 49.2, sugar: 5.34, fibre: 2.3, sodiumMg: 477, gramsPerUnit: { slice: 36, each: 36 } },
  { slug: 'white-bread', kcal: 266, protein: 9.43, fat: 3.59, saturatedFat: 0.78, carbohydrate: 49.2, sugar: 5.34, fibre: 2.3, sodiumMg: 477, gramsPerUnit: { slice: 36, each: 36 } },
  { slug: 'breadcrumbs-fresh', kcal: 266, protein: 9.43, fat: 3.59, saturatedFat: 0.78, carbohydrate: 49.2, sugar: 5.34, fibre: 2.3, sodiumMg: 477 },
  { slug: 'breadcrumbs-panko', kcal: 380, protein: 13.0, fat: 2.5, saturatedFat: 0.5, carbohydrate: 73.0, sugar: 5.0, fibre: 3.0, sodiumMg: 600 },
  { slug: 'panko', kcal: 380, protein: 13.0, fat: 2.5, saturatedFat: 0.5, carbohydrate: 73.0, sugar: 5.0, fibre: 3.0, sodiumMg: 600 },

  // ── Sugars, syrups & baking ────────────────────────────────────────────
  { slug: 'sultanas', kcal: 299, protein: 3.07, fat: 0.46, saturatedFat: 0.058, carbohydrate: 79.18, sugar: 59.19, fibre: 3.7, sodiumMg: 11 },
  { slug: 'chocolate-chips', kcal: 479, protein: 4.2, fat: 29.7, saturatedFat: 17.75, carbohydrate: 63.1, sugar: 54.5, fibre: 5.9, sodiumMg: 11 },
  { slug: 'white-chocolate', kcal: 539, protein: 5.87, fat: 32.09, saturatedFat: 19.46, carbohydrate: 59.24, sugar: 59.0, fibre: 0.2, sodiumMg: 90 },
  { slug: 'glace-cherries', kcal: 320, protein: 0.2, fat: 0.1, saturatedFat: 0, carbohydrate: 80.0, sugar: 78.0, fibre: 1.0, sodiumMg: 30 },
  { slug: 'apricot-jam', kcal: 250, protein: 0.37, fat: 0.07, saturatedFat: 0.01, carbohydrate: 65.79, sugar: 48.46, fibre: 1.0, sodiumMg: 32 },
  { slug: 'jam', kcal: 250, protein: 0.37, fat: 0.07, saturatedFat: 0.01, carbohydrate: 65.79, sugar: 48.46, fibre: 1.0, sodiumMg: 32 },
  { slug: 'dates-medjool', kcal: 277, protein: 1.81, fat: 0.15, saturatedFat: 0, carbohydrate: 74.97, sugar: 66.47, fibre: 6.7, sodiumMg: 1, gramsPerUnit: { each: 24 } },
  { slug: 'cream-of-tartar', kcal: 258, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 61.5, sugar: 0, fibre: 0.6, sodiumMg: 52 },

  // ── Nuts & seeds ───────────────────────────────────────────────────────
  { slug: 'hazelnuts', kcal: 628, protein: 14.95, fat: 60.75, saturatedFat: 4.464, carbohydrate: 16.7, sugar: 4.34, fibre: 9.7, sodiumMg: 0 },
  { slug: 'blanched-almonds', kcal: 579, protein: 21.15, fat: 49.93, saturatedFat: 3.8, carbohydrate: 21.55, sugar: 4.35, fibre: 12.5, sodiumMg: 1 },
  { slug: 'almonds', kcal: 579, protein: 21.15, fat: 49.93, saturatedFat: 3.8, carbohydrate: 21.55, sugar: 4.35, fibre: 12.5, sodiumMg: 1 },
  { slug: 'pecans', kcal: 691, protein: 9.17, fat: 71.97, saturatedFat: 6.18, carbohydrate: 13.86, sugar: 3.97, fibre: 9.6, sodiumMg: 0 },
  { slug: 'cashews', kcal: 553, protein: 18.22, fat: 43.85, saturatedFat: 7.78, carbohydrate: 30.19, sugar: 5.91, fibre: 3.3, sodiumMg: 12 },
  { slug: 'sunflower-seeds', kcal: 584, protein: 20.78, fat: 51.46, saturatedFat: 4.455, carbohydrate: 20.0, sugar: 2.62, fibre: 8.6, sodiumMg: 9 },

  // ── Fruit & veg ────────────────────────────────────────────────────────
  { slug: 'banana', kcal: 89, protein: 1.09, fat: 0.33, saturatedFat: 0.112, carbohydrate: 22.84, sugar: 12.23, fibre: 2.6, sodiumMg: 1, gramsPerUnit: { each: 118 } },
  { slug: 'raspberries', kcal: 52, protein: 1.2, fat: 0.65, saturatedFat: 0.019, carbohydrate: 11.94, sugar: 4.42, fibre: 6.5, sodiumMg: 1 },
  { slug: 'blueberries', kcal: 57, protein: 0.74, fat: 0.33, saturatedFat: 0.028, carbohydrate: 14.49, sugar: 9.96, fibre: 2.4, sodiumMg: 1 },
  { slug: 'apple', kcal: 52, protein: 0.26, fat: 0.17, saturatedFat: 0.028, carbohydrate: 13.81, sugar: 10.39, fibre: 2.4, sodiumMg: 1, gramsPerUnit: { each: 180 } },
  { slug: 'apple-bramley', kcal: 52, protein: 0.26, fat: 0.17, saturatedFat: 0.028, carbohydrate: 13.81, sugar: 10.39, fibre: 2.4, sodiumMg: 1, gramsPerUnit: { each: 200 } },
  { slug: 'pear', kcal: 57, protein: 0.36, fat: 0.14, saturatedFat: 0.022, carbohydrate: 15.23, sugar: 9.75, fibre: 3.1, sodiumMg: 1, gramsPerUnit: { each: 178 } },
  { slug: 'sweet-potato', kcal: 86, protein: 1.57, fat: 0.05, saturatedFat: 0.018, carbohydrate: 20.12, sugar: 4.18, fibre: 3.0, sodiumMg: 55, gramsPerUnit: { each: 130 } },
  { slug: 'broccoli', kcal: 34, protein: 2.82, fat: 0.37, saturatedFat: 0.039, carbohydrate: 6.64, sugar: 1.7, fibre: 2.6, sodiumMg: 33, gramsPerUnit: { each: 400, head: 400, whole: 400 } },
  { slug: 'butternut-squash', kcal: 45, protein: 1.0, fat: 0.1, saturatedFat: 0.021, carbohydrate: 11.69, sugar: 2.2, fibre: 2.0, sodiumMg: 4, gramsPerUnit: { each: 1000, large: 1200 } },
  { slug: 'cauliflower', kcal: 25, protein: 1.92, fat: 0.28, saturatedFat: 0.13, carbohydrate: 4.97, sugar: 1.91, fibre: 2.0, sodiumMg: 30, gramsPerUnit: { head: 600, each: 600, 'medium head': 600, 'large head': 800, 'small head': 400 } },
  { slug: 'parsnip', kcal: 75, protein: 1.2, fat: 0.3, saturatedFat: 0.052, carbohydrate: 17.99, sugar: 4.8, fibre: 4.9, sodiumMg: 10, gramsPerUnit: { each: 130 } },
  { slug: 'beetroot', kcal: 43, protein: 1.61, fat: 0.17, saturatedFat: 0.027, carbohydrate: 9.56, sugar: 6.76, fibre: 2.8, sodiumMg: 78, gramsPerUnit: { each: 82 } },
  { slug: 'rocket', kcal: 25, protein: 2.58, fat: 0.66, saturatedFat: 0.086, carbohydrate: 3.65, sugar: 2.05, fibre: 1.6, sodiumMg: 27 },
  { slug: 'cos-lettuce', kcal: 17, protein: 1.23, fat: 0.3, saturatedFat: 0.039, carbohydrate: 3.29, sugar: 1.19, fibre: 2.1, sodiumMg: 8, gramsPerUnit: { each: 300, head: 300, leaf: 10 } },
  { slug: 'rhubarb', kcal: 21, protein: 0.9, fat: 0.2, saturatedFat: 0.053, carbohydrate: 4.54, sugar: 1.1, fibre: 1.8, sodiumMg: 4 },
  { slug: 'spinach-frozen', kcal: 29, protein: 3.63, fat: 0.87, saturatedFat: 0.141, carbohydrate: 4.21, sugar: 0.43, fibre: 2.9, sodiumMg: 79 },
  { slug: 'jalapeno', kcal: 29, protein: 0.91, fat: 0.37, saturatedFat: 0.092, carbohydrate: 6.5, sugar: 4.12, fibre: 2.8, sodiumMg: 3, gramsPerUnit: { each: 14 } },

  // ── Fish & seafood ─────────────────────────────────────────────────────
  { slug: 'mussels', kcal: 86, protein: 11.9, fat: 2.24, saturatedFat: 0.425, carbohydrate: 3.69, sugar: 0, fibre: 0, sodiumMg: 286 },
  { slug: 'squid', kcal: 92, protein: 15.58, fat: 1.38, saturatedFat: 0.358, carbohydrate: 3.08, sugar: 0, fibre: 0, sodiumMg: 44 },
  { slug: 'tuna-tinned', kcal: 116, protein: 25.51, fat: 0.82, saturatedFat: 0.234, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 247 },
  { slug: 'anchovies', kcal: 210, protein: 28.89, fat: 9.71, saturatedFat: 2.2, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 3668, gramsPerUnit: { each: 4, fillet: 4 } },
  { slug: 'anchovy-fillets', kcal: 210, protein: 28.89, fat: 9.71, saturatedFat: 2.2, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 3668, gramsPerUnit: { each: 4, fillet: 4 } },

  // ── Meat & cured ───────────────────────────────────────────────────────
  { slug: 'beef-shin', kcal: 150, protein: 21.0, fat: 6.5, saturatedFat: 2.4, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 66 },
  { slug: 'beef-brisket', kcal: 251, protein: 17.0, fat: 20.0, saturatedFat: 8.0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 72 },
  { slug: 'pork-loin', kcal: 143, protein: 21.4, fat: 5.66, saturatedFat: 1.96, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 49 },
  { slug: 'chorizo', kcal: 455, protein: 24.1, fat: 38.27, saturatedFat: 14.4, carbohydrate: 1.86, sugar: 0, fibre: 0, sodiumMg: 1235 },
  { slug: 'pancetta', kcal: 458, protein: 15.0, fat: 42.0, saturatedFat: 15.0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 1300 },
  { slug: 'prosciutto', kcal: 250, protein: 26.0, fat: 16.0, saturatedFat: 5.5, carbohydrate: 0.3, sugar: 0, fibre: 0, sodiumMg: 2300 },
  { slug: 'back-bacon', kcal: 215, protein: 17.0, fat: 16.0, saturatedFat: 5.6, carbohydrate: 0.5, sugar: 0, fibre: 0, sodiumMg: 1400 },
  { slug: 'chicken-whole', kcal: 215, protein: 18.6, fat: 15.06, saturatedFat: 4.3, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 70, gramsPerUnit: { each: 1500, whole: 1500, small: 1300 } },
  { slug: 'chicken-wings', kcal: 222, protein: 18.33, fat: 15.97, saturatedFat: 4.5, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 82 },

  // ── Dairy ──────────────────────────────────────────────────────────────
  { slug: 'creme-fraiche', kcal: 292, protein: 2.4, fat: 30.0, saturatedFat: 20.0, carbohydrate: 3.0, sugar: 3.0, fibre: 0, sodiumMg: 30 },

  // ── Sauces, pastes & condiments (volume converts where density is set) ──
  { slug: 'ketchup', kcal: 101, protein: 1.04, fat: 0.1, saturatedFat: 0.014, carbohydrate: 27.4, sugar: 21.77, fibre: 0.3, sodiumMg: 907 },
  { slug: 'tomato-passata', kcal: 32, protein: 1.6, fat: 0.3, saturatedFat: 0.04, carbohydrate: 7.0, sugar: 4.0, fibre: 1.4, sodiumMg: 20 },
  { slug: 'tahini', kcal: 595, protein: 17.0, fat: 53.76, saturatedFat: 7.52, carbohydrate: 21.19, sugar: 0.49, fibre: 9.3, sodiumMg: 115 },
  { slug: 'peanut-butter', kcal: 588, protein: 25.09, fat: 50.39, saturatedFat: 10.33, carbohydrate: 19.56, sugar: 9.22, fibre: 6.0, sodiumMg: 17 },
  { slug: 'balsamic-vinegar', kcal: 88, protein: 0.49, fat: 0, saturatedFat: 0, carbohydrate: 17.03, sugar: 14.95, fibre: 0, sodiumMg: 23 },
  { slug: 'apple-cider-vinegar-raw', kcal: 21, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0.93, sugar: 0.4, fibre: 0, sodiumMg: 5 },
  { slug: 'english-mustard', kcal: 66, protein: 4.0, fat: 3.3, saturatedFat: 0.2, carbohydrate: 5.0, sugar: 1.0, fibre: 3.0, sodiumMg: 1120 },
  { slug: 'mustard-powder', kcal: 508, protein: 26.08, fat: 36.24, saturatedFat: 1.989, carbohydrate: 28.09, sugar: 6.79, fibre: 12.2, sodiumMg: 13 },
  { slug: 'oyster-sauce', kcal: 51, protein: 1.35, fat: 0.25, saturatedFat: 0, carbohydrate: 10.9, sugar: 1.5, fibre: 0.3, sodiumMg: 2730, gramsPerUnit: { tbsp: 18, ml: 1.15, tsp: 6 } },
  { slug: 'miso-white', kcal: 198, protein: 12.79, fat: 6.01, saturatedFat: 1.026, carbohydrate: 25.37, sugar: 6.2, fibre: 5.4, sodiumMg: 3728 },
  { slug: 'tamarind-paste', kcal: 239, protein: 2.8, fat: 0.6, saturatedFat: 0.272, carbohydrate: 62.5, sugar: 57.4, fibre: 5.1, sodiumMg: 28 },
  { slug: 'rose-water', kcal: 0, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 1 },
  { slug: 'orange-blossom-water', kcal: 0, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 1 },
  { slug: 'shaoxing-wine', kcal: 130, protein: 0.5, fat: 0, saturatedFat: 0, carbohydrate: 5.0, sugar: 1.5, fibre: 0, sodiumMg: 300 },

  // ── Tofu ───────────────────────────────────────────────────────────────
  { slug: 'tofu-firm', kcal: 144, protein: 15.78, fat: 8.72, saturatedFat: 1.26, carbohydrate: 2.78, sugar: 0.62, fibre: 2.3, sodiumMg: 14 },

  // ── Legumes (tinned) ───────────────────────────────────────────────────
  { slug: 'kidney-beans', kcal: 84, protein: 5.22, fat: 0.6, saturatedFat: 0.087, carbohydrate: 15.06, sugar: 0.55, fibre: 6.4, sodiumMg: 193 },
  { slug: 'cannellini-beans', kcal: 114, protein: 7.84, fat: 0.36, saturatedFat: 0.094, carbohydrate: 20.6, sugar: 0.3, fibre: 6.3, sodiumMg: 330 },
  { slug: 'black-beans', kcal: 91, protein: 6.0, fat: 0.3, saturatedFat: 0.08, carbohydrate: 16.6, sugar: 0.3, fibre: 6.4, sodiumMg: 331 },

  // ════════════════════════════════════════════════════════════════════════
  // BATCH 5 — top remaining lone-blockers from the coverage report (2026-06-25).
  // "each" for lemon/lime approximates the juice + zest a recipe actually uses.
  // ════════════════════════════════════════════════════════════════════════
  { slug: 'lemon', kcal: 29, protein: 1.1, fat: 0.3, saturatedFat: 0.039, carbohydrate: 9.32, sugar: 2.5, fibre: 2.8, sodiumMg: 2, gramsPerUnit: { each: 60, large: 70, medium: 60, whole: 60, item: 60, ml: 1, tsp: 5, tbsp: 15 } },
  { slug: 'lime', kcal: 30, protein: 0.7, fat: 0.2, saturatedFat: 0.02, carbohydrate: 10.54, sugar: 1.69, fibre: 2.8, sodiumMg: 2, gramsPerUnit: { each: 45, whole: 45, medium: 45, large: 55, tbsp: 15, tsp: 5, ml: 1 } },
  { slug: 'rapeseed-oil', kcal: 884, protein: 0, fat: 100, saturatedFat: 7.37, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 0 },
  { slug: 'milk-chocolate', kcal: 535, protein: 7.65, fat: 29.66, saturatedFat: 18.51, carbohydrate: 59.4, sugar: 51.5, fibre: 3.4, sodiumMg: 79 },
  { slug: 'cherries', kcal: 63, protein: 1.06, fat: 0.2, saturatedFat: 0.038, carbohydrate: 16.01, sugar: 12.82, fibre: 2.1, sodiumMg: 0 },
  { slug: 'mango', kcal: 60, protein: 0.82, fat: 0.38, saturatedFat: 0.092, carbohydrate: 14.98, sugar: 13.66, fibre: 1.6, sodiumMg: 1, gramsPerUnit: { each: 200 } },
  { slug: 'chia-seeds', kcal: 486, protein: 16.54, fat: 30.74, saturatedFat: 3.33, carbohydrate: 42.12, sugar: 0, fibre: 34.4, sodiumMg: 16 },
  { slug: 'digestive-biscuit', kcal: 471, protein: 6.7, fat: 20.9, saturatedFat: 9.5, carbohydrate: 63.0, sugar: 17.0, fibre: 3.4, sodiumMg: 540, gramsPerUnit: { each: 15, whole: 15, stalk: 15, bunch: 50, medium: 15 } },
  { slug: 'vanilla-pod', kcal: 288, protein: 0.06, fat: 0.06, saturatedFat: 0.01, carbohydrate: 12.65, sugar: 12.65, fibre: 0, sodiumMg: 9, gramsPerUnit: { each: 3 } },
  { slug: 'vanilla-paste', kcal: 288, protein: 0.06, fat: 0.06, saturatedFat: 0.01, carbohydrate: 12.65, sugar: 12.65, fibre: 0, sodiumMg: 9 },

  // ════════════════════════════════════════════════════════════════════════
  // BATCH 6 — fresh herbs, stocks, pastry, more fruit (2026-06-25). Fresh herbs
  // use fresh per-100g values with sprig / handful / bunch weights; they're
  // garnish-scale so the contribution is small. Stocks are made-up-stock
  // estimates (energy tiny; sodium is an estimate, as the panel says).
  // ════════════════════════════════════════════════════════════════════════

  // ── Fresh herbs ────────────────────────────────────────────────────────
  { slug: 'parsley-flat', kcal: 36, protein: 2.97, fat: 0.79, saturatedFat: 0.13, carbohydrate: 6.33, sugar: 0.85, fibre: 3.3, sodiumMg: 56, gramsPerUnit: { sprig: 1, tbsp: 4, tsp: 1.3, handful: 10, 'small handful': 6, 'large handful': 15, bunch: 30, 'small bunch': 15, 'large bunch': 45, cup: 60 } },
  { slug: 'parsley', kcal: 36, protein: 2.97, fat: 0.79, saturatedFat: 0.13, carbohydrate: 6.33, sugar: 0.85, fibre: 3.3, sodiumMg: 56, gramsPerUnit: { sprig: 1, tbsp: 4, tsp: 1.3, handful: 10, 'small handful': 6, 'large handful': 15, bunch: 30, 'small bunch': 15, 'large bunch': 45, cup: 60 } },
  { slug: 'basil', kcal: 23, protein: 3.15, fat: 0.64, saturatedFat: 0.041, carbohydrate: 2.65, sugar: 0.3, fibre: 1.6, sodiumMg: 4, gramsPerUnit: { leaf: 0.5, leaves: 0.5, tsp: 0.7, tbsp: 2, handful: 10, 'small handful': 6, 'large handful': 15, bunch: 25, 'small bunch': 15, 'large bunch': 40, cup: 24 } },
  { slug: 'thyme', kcal: 101, protein: 5.56, fat: 1.68, saturatedFat: 0.466, carbohydrate: 24.45, sugar: 0, fibre: 14.0, sodiumMg: 9, gramsPerUnit: { sprig: 1, tsp: 1, tbsp: 3, each: 1, bunch: 10 } },
  { slug: 'thyme-fresh', kcal: 101, protein: 5.56, fat: 1.68, saturatedFat: 0.466, carbohydrate: 24.45, sugar: 0, fibre: 14.0, sodiumMg: 9, gramsPerUnit: { sprig: 1, tsp: 1, tbsp: 3, each: 1, bunch: 10 } },
  { slug: 'rosemary', kcal: 131, protein: 3.31, fat: 5.86, saturatedFat: 2.84, carbohydrate: 20.7, sugar: 0, fibre: 14.1, sodiumMg: 26, gramsPerUnit: { sprig: 1.5, tsp: 1.2, tbsp: 3.6, each: 1.5 } },
  { slug: 'sage', kcal: 315, protein: 10.63, fat: 12.75, saturatedFat: 7.03, carbohydrate: 60.73, sugar: 1.71, fibre: 40.3, sodiumMg: 11, gramsPerUnit: { leaf: 0.4, leaves: 0.4, each: 0.4, tsp: 0.7, tbsp: 2, bunch: 15 } },

  // ── Stocks (made-up-stock estimate; volume converts via stored density) ─
  { slug: 'stock-chicken', kcal: 4, protein: 0.4, fat: 0.1, saturatedFat: 0.03, carbohydrate: 0.5, sugar: 0.2, fibre: 0, sodiumMg: 300 },
  { slug: 'chicken-stock', kcal: 4, protein: 0.4, fat: 0.1, saturatedFat: 0.03, carbohydrate: 0.5, sugar: 0.2, fibre: 0, sodiumMg: 300 },
  { slug: 'stock-beef', kcal: 4, protein: 0.5, fat: 0.1, saturatedFat: 0.03, carbohydrate: 0.3, sugar: 0.2, fibre: 0, sodiumMg: 300 },
  { slug: 'stock-vegetable', kcal: 4, protein: 0.2, fat: 0.05, saturatedFat: 0.01, carbohydrate: 0.6, sugar: 0.3, fibre: 0, sodiumMg: 280 },
  { slug: 'vegetable-stock', kcal: 4, protein: 0.2, fat: 0.05, saturatedFat: 0.01, carbohydrate: 0.6, sugar: 0.3, fibre: 0, sodiumMg: 280 },
  { slug: 'stock-fish', kcal: 4, protein: 0.5, fat: 0.1, saturatedFat: 0.03, carbohydrate: 0.2, sugar: 0.1, fibre: 0, sodiumMg: 290 },

  // ── Pastry (shop-bought estimate; weight usage converts) ───────────────
  { slug: 'shortcrust-pastry', kcal: 449, protein: 6.0, fat: 28.0, saturatedFat: 11.0, carbohydrate: 44.0, sugar: 1.0, fibre: 1.8, sodiumMg: 400 },
  { slug: 'puff-pastry', kcal: 558, protein: 7.3, fat: 38.0, saturatedFat: 15.0, carbohydrate: 45.7, sugar: 1.0, fibre: 1.5, sodiumMg: 320 },
  { slug: 'filo-pastry', kcal: 290, protein: 7.0, fat: 2.0, saturatedFat: 0.4, carbohydrate: 58.0, sugar: 1.0, fibre: 2.0, sodiumMg: 400, gramsPerUnit: { sheet: 18, each: 18 } },

  // ── Fruit ──────────────────────────────────────────────────────────────
  { slug: 'blackberries', kcal: 43, protein: 1.39, fat: 0.49, saturatedFat: 0.014, carbohydrate: 9.61, sugar: 4.88, fibre: 5.3, sodiumMg: 1 },
  { slug: 'plums', kcal: 46, protein: 0.7, fat: 0.28, saturatedFat: 0.017, carbohydrate: 11.42, sugar: 9.92, fibre: 1.4, sodiumMg: 0, gramsPerUnit: { each: 66 } },

  // ── Misc fills ─────────────────────────────────────────────────────────
  { slug: 'cinnamon-stick', kcal: 247, protein: 3.99, fat: 1.24, saturatedFat: 0.345, carbohydrate: 80.59, sugar: 2.17, fibre: 53.1, sodiumMg: 10, gramsPerUnit: { each: 2.5, stick: 2.5, piece: 2.5, 'small piece': 1.5, 'large piece': 4 } },
  { slug: 'bread', kcal: 266, protein: 9.43, fat: 3.59, saturatedFat: 0.78, carbohydrate: 49.2, sugar: 5.34, fibre: 2.3, sodiumMg: 477, gramsPerUnit: { slice: 36, each: 36 } },
  { slug: 'mixed-spice', kcal: 355, protein: 5.5, fat: 10.0, saturatedFat: 3.0, carbohydrate: 63.0, sugar: 4.0, fibre: 30.0, sodiumMg: 30, gramsPerUnit: { tsp: 2.3, tbsp: 6.9 } },
  { slug: 'cooking-spray', kcal: 884, protein: 0, fat: 100, saturatedFat: 15.0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 0 },

  // ════════════════════════════════════════════════════════════════════════
  // BATCH 7 — next coverage tier (2026-06-25).
  // ════════════════════════════════════════════════════════════════════════
  { slug: 'paprika-smoked', kcal: 282, protein: 14.14, fat: 12.89, saturatedFat: 2.14, carbohydrate: 53.99, sugar: 7.54, fibre: 34.9, sodiumMg: 68, gramsPerUnit: { tsp: 2.3, tbsp: 6.9 } },
  { slug: 'oregano-dried', kcal: 265, protein: 9.0, fat: 4.28, saturatedFat: 1.55, carbohydrate: 68.92, sugar: 4.09, fibre: 42.5, sodiumMg: 25, gramsPerUnit: { tsp: 1, tbsp: 3 } },
  { slug: 'cloves', kcal: 274, protein: 5.97, fat: 13.0, saturatedFat: 3.95, carbohydrate: 65.53, sugar: 2.38, fibre: 33.9, sodiumMg: 277, gramsPerUnit: { each: 0.06, whole: 0.06, tsp: 2.1, tbsp: 6.3 } },
  { slug: 'chilli-powder', kcal: 318, protein: 12.0, fat: 17.3, saturatedFat: 3.3, carbohydrate: 56.6, sugar: 10.2, fibre: 27.2, sodiumMg: 30, gramsPerUnit: { tsp: 2.3, tbsp: 6.9 } },
  { slug: 'cardamom-green', kcal: 311, protein: 10.76, fat: 6.7, saturatedFat: 0.68, carbohydrate: 68.47, sugar: 0, fibre: 28.0, sodiumMg: 18, gramsPerUnit: { each: 0.2, pod: 0.2, tsp: 2.0 } },
  { slug: 'mirin', kcal: 258, protein: 0.2, fat: 0, saturatedFat: 0, carbohydrate: 43.4, sugar: 26.0, fibre: 0, sodiumMg: 7, gramsPerUnit: { ml: 1.18, tbsp: 18, tsp: 6 } },
  { slug: 'sausages-pork', kcal: 297, protein: 16.5, fat: 25.0, saturatedFat: 8.4, carbohydrate: 1.5, sugar: 0, fibre: 0, sodiumMg: 790, gramsPerUnit: { each: 60, whole: 60, large: 75 } },
  { slug: 'bulgur-wheat', kcal: 342, protein: 12.29, fat: 1.33, saturatedFat: 0.231, carbohydrate: 75.87, sugar: 0.41, fibre: 18.3, sodiumMg: 17 },
  { slug: 'lasagne-sheets', kcal: 371, protein: 13.04, fat: 1.51, saturatedFat: 0.277, carbohydrate: 74.67, sugar: 2.67, fibre: 3.2, sodiumMg: 6, gramsPerUnit: { sheet: 18, each: 18 } },
  { slug: 'pecorino-romano', kcal: 387, protein: 31.8, fat: 26.94, saturatedFat: 17.5, carbohydrate: 3.6, sugar: 0.2, fibre: 0, sodiumMg: 1800 },
  { slug: 'tortilla-wrap', kcal: 297, protein: 8.0, fat: 7.5, saturatedFat: 1.8, carbohydrate: 49.0, sugar: 2.7, fibre: 3.0, sodiumMg: 650, gramsPerUnit: { each: 60, large: 72 } },
  { slug: 'corn-tortilla', kcal: 218, protein: 5.7, fat: 2.85, saturatedFat: 0.4, carbohydrate: 44.6, sugar: 1.0, fibre: 6.3, sodiumMg: 45, gramsPerUnit: { each: 25, large: 35 } },
  { slug: 'haricot-beans', kcal: 114, protein: 7.84, fat: 0.36, saturatedFat: 0.094, carbohydrate: 20.6, sugar: 0.3, fibre: 6.3, sodiumMg: 330 },
  { slug: 'mushrooms-porcini-dried', kcal: 296, protein: 27.0, fat: 3.0, saturatedFat: 0.5, carbohydrate: 60.0, sugar: 2.0, fibre: 12.0, sodiumMg: 30 },
  { slug: 'coffee-instant', kcal: 353, protein: 12.2, fat: 0.16, saturatedFat: 0.06, carbohydrate: 75.4, sugar: 0, fibre: 0, sodiumMg: 37, gramsPerUnit: { tsp: 2, tbsp: 6 } },
  { slug: 'espresso-powder', kcal: 353, protein: 12.2, fat: 0.16, saturatedFat: 0.06, carbohydrate: 75.4, sugar: 0, fibre: 0, sodiumMg: 37, gramsPerUnit: { tsp: 2, tbsp: 6 } },

  // ════════════════════════════════════════════════════════════════════════
  // BATCH 8 — long-tail coverage (2026-06-25). garam-masala / hot sauce are
  // blend estimates. sea-salt is the same NaCl as the culinary salts (its
  // catalogue label says "soap grade", but recipes reference it).
  // ════════════════════════════════════════════════════════════════════════
  { slug: 'garam-masala', kcal: 380, protein: 14.0, fat: 15.0, saturatedFat: 3.0, carbohydrate: 50.0, sugar: 3.0, fibre: 30.0, sodiumMg: 60, gramsPerUnit: { tsp: 2.5, tbsp: 7.5 } },
  { slug: 'sea-salt', kcal: 0, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 38758, gramsPerUnit: { pinch: 0.4 } },
  { slug: 'peppercorns-black', kcal: 251, protein: 10.4, fat: 3.26, saturatedFat: 1.39, carbohydrate: 63.95, sugar: 0.64, fibre: 25.3, sodiumMg: 20, gramsPerUnit: { each: 0.05, whole: 0.05, tsp: 2.3, tbsp: 6.9, pinch: 0.3 } },
  { slug: 'chilli-red', kcal: 40, protein: 1.87, fat: 0.44, saturatedFat: 0.044, carbohydrate: 8.81, sugar: 5.3, fibre: 1.5, sodiumMg: 9, gramsPerUnit: { each: 15, whole: 15, small: 8 } },
  { slug: 'coriander-fresh', kcal: 23, protein: 2.13, fat: 0.52, saturatedFat: 0.014, carbohydrate: 3.67, sugar: 0.87, fibre: 2.8, sodiumMg: 46, gramsPerUnit: { handful: 10, 'small handful': 6, 'large handful': 15, bunch: 25, 'small bunch': 15, 'large bunch': 40, tbsp: 4, each: 1 } },
  { slug: 'pitta-bread', kcal: 275, protein: 9.1, fat: 1.2, saturatedFat: 0.17, carbohydrate: 55.7, sugar: 1.6, fibre: 2.2, sodiumMg: 536, gramsPerUnit: { each: 60 } },
  { slug: 'black-olives', kcal: 115, protein: 0.84, fat: 10.68, saturatedFat: 1.415, carbohydrate: 6.26, sugar: 0, fibre: 3.2, sodiumMg: 735 },
  { slug: 'olives-green', kcal: 145, protein: 1.03, fat: 15.32, saturatedFat: 2.029, carbohydrate: 3.84, sugar: 0.54, fibre: 3.3, sodiumMg: 1556 },
  { slug: 'wholegrain-mustard', kcal: 140, protein: 8.0, fat: 9.0, saturatedFat: 0.5, carbohydrate: 9.0, sugar: 2.0, fibre: 5.0, sodiumMg: 1100 },
  { slug: 'puy-lentils', kcal: 352, protein: 24.63, fat: 1.06, saturatedFat: 0.154, carbohydrate: 63.35, sugar: 2.03, fibre: 10.7, sodiumMg: 6 },
  { slug: 'ham-cooked', kcal: 145, protein: 18.5, fat: 5.5, saturatedFat: 1.8, carbohydrate: 1.5, sugar: 1.5, fibre: 0, sodiumMg: 1200, gramsPerUnit: { slice: 25, each: 25 } },
  { slug: 'kale', kcal: 49, protein: 4.28, fat: 0.93, saturatedFat: 0.091, carbohydrate: 8.75, sugar: 2.26, fibre: 3.6, sodiumMg: 38 },
  { slug: 'veal-shoulder', kcal: 144, protein: 19.3, fat: 6.8, saturatedFat: 2.5, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 90 },
  { slug: 'louisiana-hot-sauce', kcal: 11, protein: 0.5, fat: 0.4, saturatedFat: 0.05, carbohydrate: 1.8, sugar: 1.0, fibre: 0.3, sodiumMg: 2640, gramsPerUnit: { tsp: 5, tbsp: 15, dash: 1, splash: 3 } },

  // ════════════════════════════════════════════════════════════════════════
  // BATCH 9 — long-tail proteins, spices & fills (2026-06-25).
  // ════════════════════════════════════════════════════════════════════════
  { slug: 'cayenne', kcal: 318, protein: 12.01, fat: 17.27, saturatedFat: 3.26, carbohydrate: 56.63, sugar: 10.24, fibre: 27.2, sodiumMg: 30, gramsPerUnit: { tsp: 1.8, tbsp: 5.4, pinch: 0.3 } },
  { slug: 'dried-chilli', kcal: 282, protein: 12.0, fat: 14.0, saturatedFat: 2.48, carbohydrate: 50.0, sugar: 7.0, fibre: 28.0, sodiumMg: 30, gramsPerUnit: { each: 2, whole: 2, tsp: 2, tbsp: 6, pinch: 0.3 } },
  { slug: 'palm-sugar', kcal: 380, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 94.0, sugar: 90.0, fibre: 0, sodiumMg: 30, gramsPerUnit: { tsp: 4, tbsp: 12 } },
  { slug: 'sake', kcal: 134, protein: 0.5, fat: 0, saturatedFat: 0, carbohydrate: 5.0, sugar: 0, fibre: 0, sodiumMg: 2, gramsPerUnit: { ml: 1, tbsp: 15, tsp: 5 } },
  { slug: 'clams', kcal: 86, protein: 14.67, fat: 1.95, saturatedFat: 0.187, carbohydrate: 3.57, sugar: 0, fibre: 0, sodiumMg: 1202 },
  { slug: 'sea-bass', kcal: 97, protein: 18.43, fat: 2.0, saturatedFat: 0.514, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 68, gramsPerUnit: { each: 150, fillet: 120 } },
  { slug: 'smoked-pork-sausage', kcal: 301, protein: 12.0, fat: 27.0, saturatedFat: 9.5, carbohydrate: 1.5, sugar: 0, fibre: 0, sodiumMg: 1000, gramsPerUnit: { each: 75 } },
  { slug: 'chicken-drumsticks', kcal: 172, protein: 18.0, fat: 11.0, saturatedFat: 2.9, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 86, gramsPerUnit: { each: 90, whole: 90 } },
  { slug: 'lamb-leg', kcal: 230, protein: 18.0, fat: 17.0, saturatedFat: 7.0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 65 },
  { slug: 'fenugreek-leaves', kcal: 300, protein: 23.0, fat: 6.0, saturatedFat: 1.4, carbohydrate: 58.0, sugar: 0, fibre: 33.0, sodiumMg: 76, gramsPerUnit: { tbsp: 2, tsp: 0.7, handful: 5, leaf: 0.1 } },
]
