/**
 * Fix the unmakeable placeholder amounts (≤1 g/ml) on bulk-food rows across the
 * corrupted import batch, tidy `amount: 0` "to taste" rows to null, and remove a
 * few genuine junk method steps. Only FLAGGED rows are touched (amount ≤ 1 g/ml
 * or 0), so correctly-authored rows are never overwritten. Dry-run by default.
 *
 *   pnpm --filter @homemade/db exec tsx scripts/fix-recipe-amounts.ts
 *   pnpm --filter @homemade/db exec tsx scripts/fix-recipe-amounts.ts --apply
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{ let d = __dirname; for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p } }
import { prisma } from '../src'
import { resyncRecipeIngredients } from './lib/resync-recipe-ingredients.js'

const APPLY = process.argv.includes('--apply')

// slug → { ingredientName: [amount, unit] }. Applied only to rows currently
// flagged (≤1 g/ml). All occurrences of a name in a recipe get the value.
type AU = [number, string]
const MAP: Record<string, Record<string, AU>> = {
  'ambrosia-salad': { Strawberries: [150, 'g'], Raspberries: [100, 'g'], Blueberries: [100, 'g'], 'Double cream': [200, 'ml'], 'Plain yoghurt': [150, 'g'] },
  'baked-meatballs': { 'Dried breadcrumbs': [50, 'g'] },
  'banana-oatmeal-smoothie': { 'Porridge oats': [60, 'g'] },
  'best-ever-banana-cake': { 'Salted butter': [115, 'g'], 'Cream cheese': [225, 'g'] },
  'best-salty-crunchy-kale-crisps': { Kale: [200, 'g'] },
  'boozy-irish-cream-cheesecake': { 'Dark chocolate': [100, 'g'] },
  'brownie-batter-bites': { 'Chocolate chips': [30, 'g'] },
  'cheddar-broccoli-rice-cups': { 'Plain flour': [30, 'g'], 'Salted butter': [30, 'g'], Cheddar: [100, 'g'] },
  'cheddar-rosemary-spiralized-potato-pancakes': { Cheddar: [100, 'g'] },
  'chicken-pesto-pasta-salad': { Basil: [15, 'g'] },
  'clean-eating-almond-butter-fudge': { 'Almond butter': [250, 'g'] },
  'clean-eating-no-bake-oatmeal-granola-bars': { 'Dried cranberries': [50, 'g'], 'Cocoa powder': [15, 'g'] },
  'cookies-and-cream-truffles': { 'White chocolate': [100, 'g'] },
  'creamy-bacon-and-mushroom-pasta': { 'Chicken stock': [150, 'ml'] },
  'double-chocolate-peppermint-cookies': { 'Granulated sugar': [100, 'g'], 'Chocolate chips': [100, 'g'] },
  'easiest-ever-slow-cooker-lasagna': { Ricotta: [250, 'g'], Water: [120, 'ml'] },
  'easy-decadent-truffles': { 'Cream cheese': [225, 'g'] },
  'extra-crispy-chicken-wraps': { 'Plain flour': [60, 'g'] },
  'fantastic-fish-pie': { 'Flat-leaf parsley': [10, 'g'] },
  'french-toast-casserole': { Blueberries: [100, 'g'], 'Icing sugar': [15, 'g'] },
  'french-toast-roll-ups': { 'Whole milk': [60, 'ml'] },
  'garlic-beef-bites-potatoes': { 'Beef stock': [120, 'ml'] },
  'garlic-butter-salmon-pasta': { Parmesan: [40, 'g'] },
  'homemade-cheese-bread': { 'Unsalted butter': [30, 'g'], 'Flat-leaf parsley': [10, 'g'], 'Salted butter': [30, 'g'] },
  'lemon-herb-roasted-potatoes': { 'Olive oil': [30, 'ml'] },
  'lentil-feta-salad': { 'Green lentils': [100, 'g'] },
  'millionaire-peach-salad': { Walnuts: [40, 'g'], Feta: [100, 'g'], Basil: [10, 'g'] },
  'oven-roasted-carrots-with-garlic-and-coriander': { 'Olive oil': [30, 'ml'] },
  'peanut-butter-banana-smoothie': { 'Greek yoghurt': [150, 'g'] },
  'pork-pie-hot-water-crust': { 'Ground mace': [1, 'tsp'] },
  'pumpkin-pie-thanksgiving': { Cloves: [1, 'tsp'] },
  'roast-lamb-leg': { 'Lamb leg': [1500, 'g'] },
  'roasted-squash-goats-cheese-salad': { 'Olive oil': [30, 'ml'] },
  'roasted-squash-pancetta-risotto': { Parmesan: [50, 'g'] },
  'seed-bar': { Jam: [60, 'g'] },
  'soft-and-chewy-oatmeal-raisin-cookies': { 'Porridge oats': [150, 'g'], 'Unsalted butter': [115, 'g'], 'Dark brown sugar': [100, 'g'], 'Granulated sugar': [50, 'g'] },
  'sour-gummies': { 'Caster sugar': [50, 'g'] },
  'spaghetti-bolognaise': { 'Tinned tomatoes': [800, 'g'] },
  'spinach-quiche': { 'Salted butter': [20, 'g'], Spinach: [200, 'g'], Cheddar: [100, 'g'] },
  'strawberry-banana-smoothie': { 'Almond milk': [250, 'ml'] },
  'strawberry-cheesecake-overnight-oats': { 'Greek yoghurt': [150, 'g'], 'Whole milk': [120, 'ml'], 'Porridge oats': [80, 'g'] },
  'street-corn-salad': { 'Olive oil': [15, 'ml'], 'Soured cream': [60, 'g'], Coriander: [10, 'g'] },
  'vegan-peanut-butter-cookies': { 'Caster sugar': [100, 'g'] },
  'whatever-floats-your-boat-brownies': { 'Salted butter': [115, 'g'], 'Cocoa powder': [40, 'g'], 'Plain flour': [100, 'g'], 'Chocolate chips': [50, 'g'], Raisins: [50, 'g'], 'Glacé cherries': [50, 'g'], Almonds: [50, 'g'], Marshmallows: [50, 'g'] },
  'world-s-best-cheesy-garlic-bread': { Parmesan: [50, 'g'], Mozzarella: [125, 'g'] },
}

// Spurious ingredient rows to delete (named in the list but never in the method).
const REMOVE_ROWS: Record<string, string[]> = {
  'irish-whiskey-truffles': ['Greek yoghurt'],
}

// Genuine junk method steps to drop (matched by content).
const JUNK_REMOVE: Record<string, RegExp[]> = {
  'street-corn-salad': [/ears corn,/i, /cup mayonnaise,/i, /cotija cheese,/i],
  'easy-decadent-truffles': [/^“these turned out/i, /^notes$/i],
  'mince-pie-cookies': [/^"crumbly and fragrant/i],
}

interface N { type?: string; attrs?: Record<string, unknown>; content?: N[]; text?: string }
function txt(n: N): string { const o: string[] = []; const w = (x?: N) => { if (!x) return; if (typeof x.text === 'string') o.push(x.text); if (Array.isArray(x.content)) for (const c of x.content) w(c) }; w(n); return o.join(' ') }
function findBlockItems(body: N): Array<Record<string, unknown>> | null {
  let items: Array<Record<string, unknown>> | null = null
  const w = (n?: N) => { if (!n) return; if (n.type === 'ingredientsList' && Array.isArray(n.attrs?.items)) items = n.attrs!.items as Array<Record<string, unknown>>; if (Array.isArray(n.content)) for (const c of n.content) w(c) }
  w(body); return items
}
function methodList(body: N): N | null {
  let best: N | null = null
  const w = (n?: N) => { if (!n) return; if (n.type === 'orderedList' && (!best || (n.content?.length ?? 0) > (best!.content?.length ?? 0))) best = n; if (Array.isArray(n.content)) for (const c of n.content) w(c) }
  w(body); return best
}
const isFlagged = (a: unknown, u: unknown): boolean => a === 0 || (typeof a === 'number' && a <= 1 && (u === 'g' || u === 'ml'))

async function main() {
  const slugs = new Set([...Object.keys(MAP), ...Object.keys(JUNK_REMOVE), ...Object.keys(REMOVE_ROWS)])
  let amtFixed = 0, junkDropped = 0, recipesTouched = 0

  for (const slug of slugs) {
    const t = await prisma.tutorial.findUnique({ where: { slug } })
    if (!t) { console.log(`! ${slug} not found`); continue }
    const body = t.body as unknown as N
    const changes: string[] = []

    const items = findBlockItems(body)
    if (items && REMOVE_ROWS[slug]) {
      const block = (() => { let b: N | null = null; const w = (n?: N) => { if (!n) return; if (n.type === 'ingredientsList') b = n; if (Array.isArray(n.content)) for (const c of n.content) w(c) }; w(body); return b })()
      if (block && Array.isArray((block as N).attrs?.items)) {
        const before = items.length
        const kept = items.filter((it) => !REMOVE_ROWS[slug].includes(typeof it.name === 'string' ? it.name : ''))
        if (kept.length < before) { changes.push(`remove spurious row(s): ${REMOVE_ROWS[slug].join(', ')}`); (block as N).attrs!.items = kept }
      }
    }
    if (items && MAP[slug]) {
      for (const it of items) {
        const name = typeof it.name === 'string' ? it.name : ''
        const au = MAP[slug][name]
        if (au && isFlagged(it.amount, it.unit)) {
          changes.push(`${name}: ${it.amount}${it.unit ?? ''} → ${au[0]} ${au[1]}`)
          it.amount = au[0]; it.unit = au[1]; amtFixed++
        }
      }
    }

    if (JUNK_REMOVE[slug]) {
      const list = methodList(body)
      if (list && Array.isArray(list.content)) {
        const before = list.content.length
        list.content = list.content.filter((li) => {
          const s = txt(li).trim()
          const drop = JUNK_REMOVE[slug].some((re) => re.test(s))
          if (drop) changes.push(`drop junk step: "${s.slice(0, 50)}"`)
          return !drop
        })
        junkDropped += before - list.content.length
      }
    }

    if (changes.length === 0) { console.log(`= ${slug}: no flagged rows matched`); continue }
    recipesTouched++
    console.log(`\n• ${slug}`)
    for (const c of changes) console.log(`    - ${c}`)
    if (APPLY) {
      await prisma.tutorial.update({ where: { id: t.id }, data: { body: body as unknown as object } })
      await resyncRecipeIngredients(prisma, t.id, body)
      console.log('    ✓ saved + re-synced')
    }
  }

  // Global tidy: amount 0 → null (to-taste rows render "to taste", not "0 to taste").
  let zeroFixed = 0, zeroRecipes = 0
  const all = await prisma.tutorial.findMany({ where: { status: 'PUBLISHED', type: 'RECIPE' }, select: { id: true, slug: true, body: true } })
  for (const r of all) {
    const body = r.body as unknown as N
    const items = findBlockItems(body)
    if (!items) continue
    let touched = false
    for (const it of items) if (it.amount === 0) { it.amount = null; zeroFixed++; touched = true }
    if (touched) {
      zeroRecipes++
      if (APPLY) { await prisma.tutorial.update({ where: { id: r.id }, data: { body: body as unknown as object } }); await resyncRecipeIngredients(prisma, r.id, body) }
    }
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'DRY-RUN'}: amounts fixed ${amtFixed}, junk steps dropped ${junkDropped}, recipes touched ${recipesTouched}; amount=0→null ${zeroFixed} rows in ${zeroRecipes} recipes`)
}
main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
