/**
 * Dish-type classification pass (phase_dish_type_001).
 *
 * Classifies EVERY published cooking + baking recipe:
 *   - subCategoryId  → its dish-type home shelf (cooking only; baking already
 *                      has every row shelved, left untouched).
 *   - familiarCanon  → true when the title/excerpt matches the UK/US household
 *                      canon (food-canon.ts).
 *   - mood[]         → canonical cross-cutting collection values ADDED (deduped,
 *                      never stripping existing) so the collection rails light up.
 *   - cuisine        → normalised to a single canonical slug for clean world shelves.
 *
 * Deterministic, title-led (recipe titles are highly descriptive). Word-boundary
 * matching avoids false positives (no "pie" in "pieces"). A cooking recipe that
 * matches no dish keyword falls back by mealType so EVERY recipe lands on a shelf.
 *
 * `--apply` writes; default is a dry-run that prints the distribution.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let dir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}
import { prisma } from '../src'
import { dishTypesForCategory, type DishCategory } from '../prisma/dish-type-vocabulary'
import { canonMatch } from '../prisma/food-canon'

const APPLY = process.argv.includes('--apply')

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
function wordHit(hay: string, needle: string): boolean {
  // word-boundary match; needle may contain spaces / & / -
  return new RegExp(`(^|[^a-z0-9])${escapeRegex(needle)}([^a-z0-9]|$)`, 'i').test(hay)
}

// Order cooking shelves so the dish FORM wins (a "fish pie" is a pie, not fish;
// a "fish curry" is a curry). Earlier = checked first.
const COOKING_ORDER = [
  'pasta', 'curries', 'pies-bakes', 'stews-casseroles', 'stir-fries', 'roasts',
  'soups', 'salads', 'breakfast-brunch', 'sandwiches-burgers', 'grills-bbq',
  'rice-grains', 'fish-seafood', 'puddings-desserts', 'snacks-dips', 'sides-veg',
  'sauces', 'preserves', 'everyday-dinners',
]

function cookingShelf(title: string, excerpt: string | null, mealType: string | null): string {
  const hay = `${title} ${excerpt ?? ''}`.toLowerCase()
  const types = dishTypesForCategory('cooking')
  const bySlug = new Map(types.map((t) => [t.slug, t]))
  for (const slug of COOKING_ORDER) {
    const t = bySlug.get(slug)
    if (!t) continue
    const needles = [t.name.toLowerCase(), ...(t.aliases ?? [])]
    if (needles.some((n) => wordHit(hay, n))) return slug
  }
  // Fallback by mealType so nothing is left unshelved.
  switch ((mealType ?? '').toLowerCase()) {
    case 'breakfast': case 'brunch': return 'breakfast-brunch'
    case 'side': return 'sides-veg'
    case 'snack': case 'starter': return 'snacks-dips'
    case 'drink': return 'snacks-dips'
    case 'dessert': return 'puddings-desserts'
    case 'condiment': case 'sauce': return 'sauces'
    default: return 'everyday-dinners'
  }
}

// ── cuisine normalisation ─────────────────────────────────────────────────────
const CUISINE_ALIAS: Record<string, string> = {
  'indian-anglo': 'anglo-indian', 'british-indian': 'anglo-indian', 'angloindian': 'anglo-indian',
  'south-american': 'latin-american', 'latin-american': 'latin-american',
  'eastern-european': 'eastern-european', 'central-european': 'european', 'central-asian': 'central-asian',
  'middle-eastern': 'middle-eastern', 'north-african': 'north-african', 'west-african': 'west-african',
  'east-african': 'east-african', 'south-asian': 'south-asian',
  'new-zealand': 'new-zealand', 'global': 'international', 'fusion': 'international', 'asian': 'asian',
}
function normCuisine(raw: string | null): string | null {
  if (!raw) return null
  let s = raw.trim()
  if (!s) return null
  // camelCase → hyphen (middleEastern → middle-eastern)
  s = s.replace(/([a-z])([A-Z])/g, '$1-$2')
  s = s.toLowerCase().replace(/[\s_]+/g, '-').replace(/-+/g, '-')
  return CUISINE_ALIAS[s] ?? s
}

// ── canonical collection moods (added, not replacing) ─────────────────────────
const COMFORT_DISHTYPES = new Set(['pies-bakes', 'stews-casseroles', 'roasts', 'soups', 'pasta'])
const FAKEAWAY_CUISINES = new Set(['chinese', 'indian', 'thai', 'anglo-indian', 'japanese', 'korean', 'vietnamese'])

function hasAny(mood: string[], vals: string[]): boolean {
  const set = new Set(mood.map((m) => m.toLowerCase()))
  return vals.some((v) => set.has(v.toLowerCase()))
}

function collectionMoods(opts: {
  title: string; excerpt: string | null; mood: string[]; cuisine: string | null;
  dishType: string; totalMinutes: number | null; familiar: boolean
}): string[] {
  const hay = `${opts.title} ${opts.excerpt ?? ''}`.toLowerCase()
  const out = new Set<string>()
  // comfort food
  if (hasAny(opts.mood, ['comfortfood', 'comfort', 'comforting', 'comfort-food', 'cosy', 'hearty', 'nostalgic', 'indulgent', 'rich']) || COMFORT_DISHTYPES.has(opts.dishType))
    out.add('comfortFood')
  // quick weeknight
  if (hasAny(opts.mood, ['weeknight', 'weekday', 'midweek', 'quick', 'quickwin', 'quickdinner', 'quickmeals', 'easywin', 'loweffort', 'midweekmeal', 'weekdaydinner', 'weekdaymeal', 'fast']) || (opts.totalMinutes != null && opts.totalMinutes <= 35))
    out.add('weeknight')
  // family favourites
  if (hasAny(opts.mood, ['kidfriendly', 'kid-friendly', 'family', 'crowdpleaser', 'crowd-pleaser']) || (opts.familiar && ['pasta', 'everyday-dinners', 'pies-bakes', 'sandwiches-burgers', 'cakes', 'biscuits'].includes(opts.dishType)))
    out.add('family')
  // one-pot
  if (wordHit(hay, 'one pot') || wordHit(hay, 'one-pot') || wordHit(hay, 'one pan') || wordHit(hay, 'one-pan') || wordHit(hay, 'traybake') || wordHit(hay, 'tray bake') || wordHit(hay, 'sheet pan') || wordHit(hay, 'slow cooker') || wordHit(hay, 'slow-cooker') || opts.dishType === 'stews-casseroles')
    out.add('onePot')
  // takeaway favourites
  if (wordHit(hay, 'takeaway') || wordHit(hay, 'fakeaway') || (['curries', 'stir-fries'].includes(opts.dishType) && FAKEAWAY_CUISINES.has(opts.cuisine ?? '')) || wordHit(hay, 'fish and chips') || wordHit(hay, 'fried chicken') || wordHit(hay, 'pizza') || wordHit(hay, 'kebab'))
    out.add('fakeaway')
  // batch & freezer
  if (hasAny(opts.mood, ['freezerfriendly', 'freezer', 'batch', 'batchcook', 'batch-cook', 'batchable', 'batch-cooking', 'mealprep', 'meal-prep', 'makeahead', 'make-ahead', 'makesahead', 'pantrymeals']))
    out.add('freezerFriendly')
  // party & sharing
  if (hasAny(opts.mood, ['party', 'entertaining', 'sharing', 'dinner-party', 'dinnerparty', 'partyfood', 'feedacrowd', 'celebration', 'celebratory', 'showstopper', 'showstopper']))
    out.add('party')
  // lighter & healthy
  if (hasAny(opts.mood, ['healthy', 'light', 'lightandfresh', 'healthyeating', 'plant-based', 'fresh', 'refreshing', 'summery', 'springeating', 'summereating']))
    out.add('healthy')
  return [...out]
}

const CARD = {
  id: true, title: true, excerpt: true, cuisine: true, mealType: true,
  mood: true, subCategoryId: true, totalMinutes: true,
} as const

async function main() {
  const summary: Record<string, { total: number; shelves: Record<string, number>; canon: number; moods: Record<string, number>; cuisineChanged: number }> = {}
  const updates: { id: string; data: Record<string, unknown> }[] = []

  for (const slug of ['cooking', 'baking'] as DishCategory[]) {
    const category = await prisma.category.findUnique({ where: { slug }, select: { id: true } })
    if (!category) continue
    const shelves = dishTypesForCategory(slug)
    const shelfRows = await prisma.subCategory.findMany({ where: { categoryId: category.id }, select: { id: true, slug: true } })
    const shelfId = new Map(shelfRows.map((s) => [s.slug, s.id]))

    const recipes = await prisma.tutorial.findMany({
      where: { categoryId: category.id, status: 'PUBLISHED' },
      select: { ...CARD, subCategory: { select: { slug: true } } },
    })
    const s = { total: recipes.length, shelves: {} as Record<string, number>, canon: 0, moods: {} as Record<string, number>, cuisineChanged: 0 }

    for (const r of recipes) {
      // dish-type shelf
      let shelfSlug: string
      if (slug === 'baking') {
        // already shelved — keep, only fill if somehow null
        shelfSlug = r.subCategory?.slug ?? 'cakes'
      } else {
        shelfSlug = cookingShelf(r.title, r.excerpt, r.mealType)
      }
      s.shelves[shelfSlug] = (s.shelves[shelfSlug] ?? 0) + 1

      const familiar = canonMatch(r.title, r.excerpt, slug) !== null
      if (familiar) s.canon++

      const newCuisine = normCuisine(r.cuisine)
      const cuisineChanged = newCuisine !== r.cuisine
      if (cuisineChanged) s.cuisineChanged++

      const colMoods = collectionMoods({
        title: r.title, excerpt: r.excerpt, mood: r.mood, cuisine: newCuisine,
        dishType: shelfSlug, totalMinutes: r.totalMinutes, familiar,
      })
      for (const m of colMoods) s.moods[m] = (s.moods[m] ?? 0) + 1
      const mergedMood = [...new Set([...r.mood, ...colMoods])]

      const data: Record<string, unknown> = { familiarCanon: familiar }
      if (slug === 'cooking') {
        const sid = shelfId.get(shelfSlug)
        if (sid && sid !== r.subCategoryId) data.subCategoryId = sid
      }
      if (cuisineChanged) data.cuisine = newCuisine
      if (mergedMood.length !== r.mood.length) data.mood = mergedMood
      updates.push({ id: r.id, data })
    }
    summary[slug] = s
  }

  console.log('\n===== DRY-RUN SUMMARY =====')
  for (const [cat, s] of Object.entries(summary)) {
    console.log(`\n## ${cat}: ${s.total} recipes`)
    console.log(`  familiarCanon = true: ${s.canon}`)
    console.log(`  cuisine normalised: ${s.cuisineChanged}`)
    console.log('  shelves:')
    for (const [k, v] of Object.entries(s.shelves).sort((a, b) => b[1] - a[1])) console.log(`    ${k}: ${v}`)
    console.log('  collection moods:')
    for (const [k, v] of Object.entries(s.moods).sort((a, b) => b[1] - a[1])) console.log(`    ${k}: ${v}`)
  }
  console.log(`\nTotal rows with at least one change: ${updates.filter((u) => Object.keys(u.data).length > 0).length}`)

  if (APPLY) {
    console.log('\n=== APPLYING ===')
    let done = 0
    const toApply = updates.filter((u) => Object.keys(u.data).length > 0)
    const CHUNK = 25
    for (let i = 0; i < toApply.length; i += CHUNK) {
      const batch = toApply.slice(i, i + CHUNK)
      await Promise.all(batch.map((u) => prisma.tutorial.update({ where: { id: u.id }, data: u.data })))
      done += batch.length
      if (done % 250 === 0 || done === toApply.length) console.log(`  applied ${done}/${toApply.length}`)
    }
    console.log('=== DONE ===')
  } else {
    console.log('\n(dry-run — pass --apply to write)')
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
