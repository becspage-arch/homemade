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
  { slug: 'eggs', kcal: 143, protein: 12.56, fat: 9.51, saturatedFat: 3.13, carbohydrate: 0.72, sugar: 0.37, fibre: 0, sodiumMg: 142, gramsPerUnit: { each: 50 }, fdcId: 748967 },

  // ── Oils ───────────────────────────────────────────────────────────────
  { slug: 'olive-oil', kcal: 884, protein: 0, fat: 100, saturatedFat: 13.81, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 2, fdcId: 171413 },
  { slug: 'extra-virgin-olive-oil', kcal: 884, protein: 0, fat: 100, saturatedFat: 13.81, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 2, fdcId: 171413 },
  { slug: 'sunflower-oil', kcal: 884, protein: 0, fat: 100, saturatedFat: 10.3, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 0, fdcId: 171026 },
  { slug: 'vegetable-oil', kcal: 884, protein: 0, fat: 100, saturatedFat: 14.0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 0, fdcId: 172336 },

  // ── Leaveners, salt & flavour ──────────────────────────────────────────
  { slug: 'baking-powder', kcal: 53, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 27.7, sugar: 0, fibre: 0.2, sodiumMg: 10600, fdcId: 168577 },
  { slug: 'bicarbonate-of-soda', kcal: 0, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 27360, fdcId: 175044 },
  { slug: 'table-salt', kcal: 0, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 38758, fdcId: 173468 },
  { slug: 'yeast-dried', kcal: 325, protein: 40.4, fat: 7.61, saturatedFat: 0.97, carbohydrate: 41.2, sugar: 0, fibre: 26.9, sodiumMg: 51, fdcId: 175039 },
  { slug: 'vanilla-extract', kcal: 288, protein: 0.06, fat: 0.06, saturatedFat: 0.01, carbohydrate: 12.65, sugar: 12.65, fibre: 0, sodiumMg: 9, fdcId: 172234 },

  // ── Water ──────────────────────────────────────────────────────────────
  { slug: 'water', kcal: 0, protein: 0, fat: 0, saturatedFat: 0, carbohydrate: 0, sugar: 0, fibre: 0, sodiumMg: 0, fdcId: 174158 },
]
