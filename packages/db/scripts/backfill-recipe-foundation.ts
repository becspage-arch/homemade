/**
 * phase_recipe_foundation_001 backfill.
 *
 * Idempotent. Two jobs against the EXISTING Ingredient ontology:
 *
 *   1. Seed `aisle` (from the existing free-text `category`) and a best-effort
 *      `densityGPerMl` (curated slug map + a narrow category fallback) so the
 *      render-time unit helper can convert grams ↔ cups and the future
 *      shopping-list worker can group by aisle. Only fills columns that are
 *      currently null, so a rerun never clobbers a hand-set value.
 *
 *   2. Project the legacy `Ingredient.commonSubstitutes` slug arrays into the
 *      richer `IngredientSubstitution` graph (ratio null + appropriateFor
 *      'any'; a later worker enriches ratio / flavourDelta). Upserts on the
 *      (main, alt) unique key, so reruns are safe and additive.
 *
 * Run:
 *   DOTENV_CONFIG_PATH=.env.credentials \
 *   pnpm --filter "@homemade/db" exec tsx scripts/backfill-recipe-foundation.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}

// ── category → aisle ────────────────────────────────────────────────────────
// The existing `category` field is a free string; this maps every value seen in
// the live table (and a few plausible extras) to an IngredientAisle. Anything
// unmapped falls through to OTHER.
const AISLE_BY_CATEGORY: Record<string, string> = {
  vegetable: 'PRODUCE',
  fruit: 'PRODUCE',
  herb: 'HERBS_SPICES',
  spice: 'HERBS_SPICES',
  meat: 'MEAT_FISH',
  fish: 'MEAT_FISH',
  seafood: 'MEAT_FISH',
  dairy: 'DAIRY',
  flour: 'PANTRY_BAKING',
  baking: 'PANTRY_BAKING',
  sweetener: 'PANTRY_BAKING',
  grain: 'PANTRY_DRY',
  pulse: 'PANTRY_DRY',
  nut: 'PANTRY_DRY',
  seed: 'PANTRY_DRY',
  oil: 'PANTRY_OIL',
  vinegar: 'PANTRY_CONDIMENT',
  condiment: 'PANTRY_CONDIMENT',
  alcohol: 'DRINK',
  other: 'OTHER',
}

// ── density g/ml ────────────────────────────────────────────────────────────
// Curated published densities for the highest-frequency cooking / baking
// ingredients, keyed by canonical slug. Values are g per ml (so cups × 1000 ×
// density / unit gives grams etc. - the render helper owns the maths).
const DENSITY_BY_SLUG: Record<string, number> = {
  // liquids ≈ water
  water: 1.0,
  'distilled-water': 1.0,
  milk: 1.03,
  'whole-milk': 1.03,
  'semi-skimmed-milk': 1.03,
  'skimmed-milk': 1.03,
  buttermilk: 1.03,
  'double-cream': 1.0,
  'single-cream': 1.01,
  'soured-cream': 1.0,
  yoghurt: 1.04,
  'greek-yoghurt': 1.05,
  'vegetable-stock': 1.0,
  'chicken-stock': 1.0,
  'beef-stock': 1.0,
  'fish-stock': 1.0,
  'lemon-juice': 1.03,
  'lime-juice': 1.03,
  'orange-juice': 1.04,
  'apple-juice': 1.04,
  'white-wine': 0.99,
  'red-wine': 0.99,
  'white-wine-vinegar': 1.01,
  'red-wine-vinegar': 1.01,
  'cider-vinegar': 1.01,
  'balsamic-vinegar': 1.05,
  'rice-vinegar': 1.01,
  'soy-sauce': 1.2,
  'fish-sauce': 1.2,
  'worcestershire-sauce': 1.1,
  // oils & fats
  'olive-oil': 0.92,
  'extra-virgin-olive-oil': 0.92,
  'vegetable-oil': 0.92,
  'sunflower-oil': 0.92,
  'rapeseed-oil': 0.92,
  'coconut-oil': 0.92,
  'sesame-oil': 0.92,
  butter: 0.96,
  'unsalted-butter': 0.96,
  'salted-butter': 0.96,
  ghee: 0.91,
  lard: 0.92,
  // flours & dry powders
  'plain-flour': 0.53,
  'self-raising-flour': 0.53,
  'strong-bread-flour': 0.53,
  'strong-white-bread-flour': 0.53,
  'wholemeal-flour': 0.55,
  '00-flour': 0.55,
  'rye-flour': 0.52,
  'spelt-flour': 0.52,
  'cornflour': 0.55,
  cornstarch: 0.55,
  'almond-flour': 0.42,
  'ground-almonds': 0.42,
  cocoa: 0.41,
  'cocoa-powder': 0.41,
  'icing-sugar': 0.56,
  'cornmeal': 0.6,
  'baking-powder': 0.9,
  'bicarbonate-of-soda': 0.92,
  // sugars & sweeteners
  'caster-sugar': 0.85,
  'granulated-sugar': 0.85,
  sugar: 0.85,
  'golden-caster-sugar': 0.85,
  'light-brown-sugar': 0.8,
  'dark-brown-sugar': 0.8,
  'soft-brown-sugar': 0.8,
  'demerara-sugar': 0.85,
  honey: 1.42,
  'maple-syrup': 1.33,
  'golden-syrup': 1.43,
  'agave-syrup': 1.37,
  treacle: 1.43,
  'black-treacle': 1.43,
  // grains, pulses, misc dry
  rice: 0.85,
  'basmati-rice': 0.85,
  'long-grain-rice': 0.85,
  'arborio-rice': 0.85,
  'rolled-oats': 0.41,
  'porridge-oats': 0.41,
  couscous: 0.72,
  'red-lentils': 0.85,
  salt: 1.2,
  'fine-sea-salt': 1.2,
  'table-salt': 1.2,
  'flaky-sea-salt': 0.7,
  // dairy thicks / spreads
  'cream-cheese': 1.0,
  mascarpone: 1.0,
  'creme-fraiche': 1.0,
  'peanut-butter': 1.08,
  'almond-butter': 1.08,
  tahini: 1.06,
  'tomato-puree': 1.1,
  'tomato-passata': 1.05,
  passata: 1.05,
}

// Narrow, safe category fallback - only where the whole category shares a
// density tightly enough that a default is better than no conversion at all.
const DENSITY_BY_CATEGORY: Record<string, number> = {
  flour: 0.53,
  oil: 0.92,
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const ingredients = await prisma.ingredient.findMany({
    select: {
      id: true,
      slug: true,
      category: true,
      aisle: true,
      densityGPerMl: true,
      commonSubstitutes: true,
    },
  })
  console.log(`[backfill] ${ingredients.length} ingredients loaded`)

  // ── Job 1: aisle + density ────────────────────────────────────────────────
  let aisleSet = 0
  let densitySet = 0
  for (const ing of ingredients) {
    const data: Record<string, unknown> = {}

    if (ing.aisle === null) {
      const aisle = AISLE_BY_CATEGORY[ing.category] ?? 'OTHER'
      data.aisle = aisle
      aisleSet += 1
    }

    if (ing.densityGPerMl === null) {
      const density =
        DENSITY_BY_SLUG[ing.slug] ?? DENSITY_BY_CATEGORY[ing.category] ?? null
      if (density !== null) {
        data.densityGPerMl = density
        densitySet += 1
      }
    }

    if (Object.keys(data).length > 0) {
      await prisma.ingredient.update({ where: { id: ing.id }, data })
    }
  }
  console.log(`[backfill] aisle set on ${aisleSet}, density set on ${densitySet}`)

  // ── Job 2: commonSubstitutes → IngredientSubstitution ────────────────────
  const bySlug = new Map(ingredients.map((i) => [i.slug, i.id]))
  let subRows = 0
  let unresolved = 0
  for (const ing of ingredients) {
    for (const subSlug of ing.commonSubstitutes) {
      const altId = bySlug.get(subSlug)
      if (!altId) { unresolved += 1; continue }
      if (altId === ing.id) continue // skip self-reference
      await prisma.ingredientSubstitution.upsert({
        where: {
          mainIngredientId_altIngredientId: {
            mainIngredientId: ing.id,
            altIngredientId: altId,
          },
        },
        create: {
          mainIngredientId: ing.id,
          altIngredientId: altId,
          appropriateFor: 'any',
        },
        update: {},
      })
      subRows += 1
    }
  }
  console.log(`[backfill] substitution rows upserted: ${subRows} (unresolved slugs skipped: ${unresolved})`)

  // ── Summary ───────────────────────────────────────────────────────────────
  const totalSubs = await prisma.ingredientSubstitution.count()
  const withAisle = await prisma.ingredient.count({ where: { NOT: { aisle: null } } })
  const withDensity = await prisma.ingredient.count({ where: { NOT: { densityGPerMl: null } } })
  console.log('\n[backfill] FINAL STATE')
  console.log('  ingredients with aisle    :', withAisle)
  console.log('  ingredients with density  :', withDensity)
  console.log('  IngredientSubstitution rows:', totalSubs)

  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
