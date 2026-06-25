/**
 * Nutrition coverage report. Mirrors apps/web/src/lib/recipes/nutrition.ts over
 * the live DB: how many cooking + baking recipes now render a per-serving
 * panel, and which still-missing ingredients block the most recipes (next-batch
 * priority). Read-only.
 *
 *   pnpm --filter "@homemade/db" exec tsx scripts/nutrition-coverage.ts
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let d = 0; d < 8; d++) { const c = resolve(dir, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(dir); if (p === dir) break; dir = p }
}
import { prisma, TutorialStatus, TutorialType } from '../src'

const ML: Record<string, number> = { ml: 1, l: 1000, tsp: 5, tbsp: 15, cup: 240 }
const MASS: Record<string, number> = { g: 1, kg: 1000 }

const NOMINAL: Record<string, number> = {
  'to taste': 1, season: 1, 'to season': 1, 'for seasoning': 1, seasoning: 1, 'to serve': 1, 'to garnish': 1, 'to finish': 1,
  pinch: 0.4, 'small pinch': 0.2, 'good pinch': 0.6, 'large pinch': 0.8, pinches: 0.4,
  dash: 1, dashes: 1, splash: 5, glug: 12, knob: 12, drizzle: 5,
  grind: 0.2, grinds: 0.2, 'few grinds': 0.4, twist: 0.2, drop: 0.05, drops: 0.05, 'few drops': 0.2,
  'for dusting': 2, 'for greasing': 3, 'for frying': 10, 'for drizzling': 5, 'for brushing': 3, 'for sprinkling': 2, 'for rolling': 5, 'for coating': 5,
  'for the tin': 3, 'for shallow frying': 15, 'for deep frying': 20, handful: 15, 'small handful': 8, 'large handful': 25,
}

function grams(amount: number | null, unit: string | null, density: number | null, n: Record<string, unknown> | null): number | null {
  const u = (unit ?? '').trim().toLowerCase()
  const has = amount != null && amount > 0
  if (has) {
    if (u in MASS) return amount! * MASS[u]!
    if (u in ML && density != null && density > 0) return amount! * ML[u]! * density
  }
  const gpu = n?.gramsPerUnit as Record<string, number> | undefined
  const per = gpu?.[u] ?? (u.endsWith('s') ? gpu?.[u.slice(0, -1)] : undefined) ?? (u === '' ? gpu?.each : undefined) ?? NOMINAL[u]
  if (per != null && per > 0) return (has ? amount! : 1) * per
  return null
}

async function main() {
  const recipes = await prisma.tutorial.findMany({
    where: { status: TutorialStatus.PUBLISHED, type: TutorialType.RECIPE, category: { slug: { in: ['cooking', 'baking'] } } },
    select: {
      slug: true, servings: true, category: { select: { slug: true } },
      recipeIngredients: { select: { amount: true, unit: true, ingredient: { select: { slug: true, name: true, densityGPerMl: true, nutritionalInfoPer100g: true } } } },
    },
  })

  let qualify = 0
  // Count, per still-missing-or-unconvertible ingredient, how many otherwise-
  // ready recipes it blocks (highest impact = best next-batch target).
  const blockers = new Map<string, { name: string; recipes: number }>()
  for (const r of recipes) {
    if (!r.servings || r.servings <= 0 || r.recipeIngredients.length === 0) continue
    const blocking: string[] = []
    for (const row of r.recipeIngredients) {
      const n = row.ingredient.nutritionalInfoPer100g as Record<string, unknown> | null
      const hasData = n != null && typeof n.kcal === 'number'
      const g = hasData ? grams(row.amount, row.unit, row.ingredient.densityGPerMl != null ? Number(row.ingredient.densityGPerMl) : null, n) : null
      if (g == null) blocking.push(row.ingredient.slug + (hasData ? ' (unit)' : ''))
    }
    if (blocking.length === 0) { qualify += 1; continue }
    // Only attribute when a single ingredient is the lone blocker — that's the
    // one whose data/unit fix would unlock this recipe.
    if (blocking.length === 1) {
      const key = blocking[0]!
      const slug = key.replace(' (unit)', '')
      const e = blockers.get(key) ?? { name: slug, recipes: 0 }
      e.recipes += 1
      blockers.set(key, e)
    }
  }

  console.log(`Cooking + baking recipes (with servings): ${recipes.filter(r => r.servings && r.servings > 0).length}`)
  console.log(`Now render a nutrition panel: ${qualify}`)
  console.log('\nTop lone-blockers (fixing one unlocks this many more recipes):')
  const top = [...blockers.entries()].sort((a, b) => b[1].recipes - a[1].recipes).slice(0, 40)
  for (const [key, v] of top) console.log(`${v.recipes}\t${key}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
