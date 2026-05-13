/**
 * Idempotent upsert of the master ingredient list from
 * `packages/db/scripts/data/ingredients.ts` into the Ingredient table.
 *
 * Re-runs cleanly: created / updated / unchanged counts are reported at the end.
 * Validates every entry against the type literals before any DB writes — so a
 * typo in a category or unit fails up-front, not halfway through.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-ingredients.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-ingredients.ts --dry-run
 *
 * Reads DATABASE_URL from `.env.credentials` walking up from this file (same
 * pattern as `seed-cooking-taxonomy.ts`).
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Walk up from this file looking for .env.credentials. Covers both the
// main-repo layout and the worktree layout (.env.credentials lives at the
// main repo root, not inside the worktree). `override: true` because some
// shells pre-set keys to empty values and dotenv won't replace them otherwise.
const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

import { INGREDIENTS } from './data/ingredients.js'
import type { IngredientSeed } from './data/types.js'

const VALID_CATEGORIES = new Set([
  'flour', 'dairy', 'meat', 'fish', 'vegetable', 'fruit', 'herb', 'spice',
  'condiment', 'baking', 'pulse', 'grain', 'nut', 'seed', 'oil', 'sweetener',
  'alcohol', 'other',
])

const VALID_UNITS = new Set([
  'g', 'kg', 'ml', 'l', 'each', 'tbsp', 'tsp', 'cup', 'pinch',
  'clove', 'sprig', 'leaf', 'sheet', 'slice', 'bunch', 'handful',
])

const VALID_DIETARY_FLAGS = new Set([
  'vegetarian', 'vegan', 'glutenFree', 'dairyFree', 'nutFree', 'halal', 'kosher',
])

const VALID_ALLERGENS = new Set([
  'gluten', 'crustaceans', 'eggs', 'fish', 'peanuts', 'soybeans', 'milk',
  'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs',
])

const VALID_STORAGE = new Set(['fridge', 'freezer', 'cupboard', 'cool-dark'])

function validate(rows: IngredientSeed[]): void {
  const seen = new Set<string>()
  const knownSlugs = new Set(rows.map((r) => r.slug))
  const errors: string[] = []

  for (const row of rows) {
    if (seen.has(row.slug)) errors.push(`duplicate slug: ${row.slug}`)
    seen.add(row.slug)

    if (!/^[a-z0-9-]+$/.test(row.slug)) {
      errors.push(`invalid slug shape (must be lower-kebab): ${row.slug}`)
    }

    if (!VALID_CATEGORIES.has(row.category)) {
      errors.push(`${row.slug}: invalid category "${row.category}"`)
    }
    if (!VALID_UNITS.has(row.defaultUnit)) {
      errors.push(`${row.slug}: invalid defaultUnit "${row.defaultUnit}"`)
    }

    for (const f of row.dietaryFlags) {
      if (!VALID_DIETARY_FLAGS.has(f)) {
        errors.push(`${row.slug}: invalid dietaryFlag "${f}"`)
      }
    }

    if (row.isAllergen && !row.allergenType) {
      errors.push(`${row.slug}: isAllergen true but allergenType missing`)
    }
    if (row.allergenType && !VALID_ALLERGENS.has(row.allergenType)) {
      errors.push(`${row.slug}: invalid allergenType "${row.allergenType}"`)
    }

    if (row.storage && !VALID_STORAGE.has(row.storage)) {
      errors.push(`${row.slug}: invalid storage "${row.storage}"`)
    }

    for (const sub of row.commonSubstitutes) {
      if (!knownSlugs.has(sub)) {
        errors.push(`${row.slug}: commonSubstitute "${sub}" not in master list`)
      }
    }
  }

  if (errors.length > 0) {
    console.error('[seed-ingredients] validation failed:')
    for (const e of errors) console.error('  -', e)
    process.exit(2)
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')

  validate(INGREDIENTS)
  console.log(
    `[seed-ingredients] ${INGREDIENTS.length} entries validated${dryRun ? ' (dry-run)' : ''}`,
  )

  if (dryRun) {
    const byCategory = new Map<string, number>()
    for (const row of INGREDIENTS) {
      byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + 1)
    }
    for (const [cat, n] of [...byCategory.entries()].sort()) {
      console.log(`  ${cat.padEnd(12)} ${n}`)
    }
    return
  }

  const { prisma } = await import('../src/index.js')

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const row of INGREDIENTS) {
    const existing = await prisma.ingredient.findUnique({ where: { slug: row.slug } })

    const data = {
      slug: row.slug,
      name: row.name,
      pluralName: row.pluralName ?? null,
      category: row.category,
      defaultUnit: row.defaultUnit,
      dietaryFlags: row.dietaryFlags,
      commonSubstitutes: row.commonSubstitutes,
      aliases: row.aliases,
      notes: row.notes ?? null,
      isStaple: row.isStaple,
      isAllergen: row.isAllergen,
      allergenType: row.allergenType ?? null,
      seasonality: row.seasonality ?? [],
      shelfLifeDays: row.shelfLifeDays ?? null,
      storage: row.storage ?? null,
    }

    if (!existing) {
      await prisma.ingredient.create({ data })
      created++
      continue
    }

    const fieldsEqual =
      existing.name === data.name &&
      existing.pluralName === data.pluralName &&
      existing.category === data.category &&
      existing.defaultUnit === data.defaultUnit &&
      JSON.stringify(existing.dietaryFlags) === JSON.stringify(data.dietaryFlags) &&
      JSON.stringify(existing.commonSubstitutes) === JSON.stringify(data.commonSubstitutes) &&
      JSON.stringify(existing.aliases) === JSON.stringify(data.aliases) &&
      existing.notes === data.notes &&
      existing.isStaple === data.isStaple &&
      existing.isAllergen === data.isAllergen &&
      existing.allergenType === data.allergenType &&
      JSON.stringify(existing.seasonality) === JSON.stringify(data.seasonality) &&
      existing.shelfLifeDays === data.shelfLifeDays &&
      existing.storage === data.storage

    if (fieldsEqual) {
      unchanged++
      continue
    }

    await prisma.ingredient.update({ where: { slug: row.slug }, data })
    updated++
  }

  console.log(
    `[seed-ingredients] done: ${created} created, ${updated} updated, ${unchanged} unchanged`,
  )

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed-ingredients] failed:', err)
  process.exit(1)
})
