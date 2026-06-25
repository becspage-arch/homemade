/**
 * Idempotent upsert of per-100g nutrition onto the Ingredient table from
 * `data/ingredient-nutrition.ts` (USDA FoodData Central, public domain).
 *
 * Writes `Ingredient.nutritionalInfoPer100g` as:
 *   { kcal, protein, fat, saturatedFat, carbohydrate, sugar, fibre, sodiumMg,
 *     gramsPerUnit?, source: 'USDA FoodData Central', fdcId? }
 *
 * Re-runs cleanly. A slug with no matching Ingredient is reported and skipped,
 * never created. Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-ingredient-nutrition.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-ingredient-nutrition.ts --dry-run
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); found = true; break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwd = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwd)) loadEnv({ path: cwd, override: true })
  }
}

import { prisma, type Prisma } from '../src'
import { INGREDIENT_NUTRITION } from './data/ingredient-nutrition.js'
import type { IngredientNutritionSeed } from './data/types.js'

const SOURCE = 'USDA FoodData Central'

function toJson(row: IngredientNutritionSeed): Record<string, unknown> {
  const json: Record<string, unknown> = { kcal: row.kcal }
  if (row.protein != null) json.protein = row.protein
  if (row.fat != null) json.fat = row.fat
  if (row.saturatedFat != null) json.saturatedFat = row.saturatedFat
  if (row.carbohydrate != null) json.carbohydrate = row.carbohydrate
  if (row.sugar != null) json.sugar = row.sugar
  if (row.fibre != null) json.fibre = row.fibre
  if (row.sodiumMg != null) json.sodiumMg = row.sodiumMg
  if (row.gramsPerUnit) json.gramsPerUnit = row.gramsPerUnit
  json.source = SOURCE
  if (row.fdcId != null) json.fdcId = row.fdcId
  return json
}

function validate(rows: IngredientNutritionSeed[]): void {
  const seen = new Set<string>()
  const errors: string[] = []
  for (const row of rows) {
    if (seen.has(row.slug)) errors.push(`duplicate slug: ${row.slug}`)
    seen.add(row.slug)
    if (!Number.isFinite(row.kcal) || row.kcal < 0) errors.push(`${row.slug}: bad kcal`)
    const fields: Array<[string, number | undefined]> = [
      ['protein', row.protein], ['fat', row.fat], ['saturatedFat', row.saturatedFat],
      ['carbohydrate', row.carbohydrate], ['sugar', row.sugar], ['fibre', row.fibre],
      ['sodiumMg', row.sodiumMg],
    ]
    for (const [name, v] of fields) {
      if (v != null && (!Number.isFinite(v) || v < 0)) errors.push(`${row.slug}: bad ${name}`)
    }
  }
  if (errors.length) {
    console.error('Validation failed:')
    for (const e of errors) console.error('  - ' + e)
    process.exit(1)
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  validate(INGREDIENT_NUTRITION)

  const slugs = INGREDIENT_NUTRITION.map((r) => r.slug)
  const existing = await prisma.ingredient.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, nutritionalInfoPer100g: true },
  })
  const bySlug = new Map(existing.map((e) => [e.slug, e]))

  let created = 0
  let updated = 0
  let unchanged = 0
  const missing: string[] = []

  for (const row of INGREDIENT_NUTRITION) {
    const ing = bySlug.get(row.slug)
    if (!ing) { missing.push(row.slug); continue }
    const next = toJson(row)
    const prev = ing.nutritionalInfoPer100g
    const same = prev != null && JSON.stringify(prev) === JSON.stringify(next)
    if (same) { unchanged += 1; continue }
    if (prev == null) created += 1
    else updated += 1
    if (!dryRun) {
      await prisma.ingredient.update({
        where: { id: ing.id },
        data: { nutritionalInfoPer100g: next as Prisma.InputJsonValue },
      })
    }
  }

  console.log(`${dryRun ? '[dry-run] ' : ''}nutrition seed complete`)
  console.log(`  records in batch: ${INGREDIENT_NUTRITION.length}`)
  console.log(`  newly populated:  ${created}`)
  console.log(`  updated:          ${updated}`)
  console.log(`  unchanged:        ${unchanged}`)
  if (missing.length) console.log(`  MISSING ingredient rows (skipped): ${missing.join(', ')}`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
