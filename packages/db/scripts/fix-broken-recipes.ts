/**
 * Repair the 11 content-integrity recipes surfaced by the consistency sweep
 * (foreign-method blobs, blank ingredient lists, genuine gaps). Each operation
 * edits the body (the editorial source of truth) and re-derives RecipeIngredient
 * join rows. Dry-run by default; pass --apply to write.
 *
 *   pnpm --filter @homemade/db exec tsx scripts/fix-broken-recipes.ts
 *   pnpm --filter @homemade/db exec tsx scripts/fix-broken-recipes.ts --apply
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{ let d = __dirname; for (let i = 0; i < 12; i++) { const c = resolve(d, '.env.credentials'); if (existsSync(c)) { loadEnv({ path: c, override: true }); break } const p = dirname(d); if (p === d) break; d = p } }
import { prisma } from '../src'
import { resyncRecipeIngredients } from './lib/resync-recipe-ingredients.js'
import {
  buildMasterLookup, findInLookup, createIngredient,
  type ResolvedIngredient, type CreateSpec,
} from './lib/ingredient-resolve.js'

const APPLY = process.argv.includes('--apply')

// ─── TipTap node builders ─────────────────────────────────────────────────────
interface N { type?: string; attrs?: Record<string, unknown>; content?: N[]; text?: string }
const textNode = (t: string): N => ({ type: 'text', text: t })
const para = (t: string): N => ({ type: 'paragraph', content: t ? [textNode(t)] : [] })
const listItem = (t: string): N => ({ type: 'listItem', content: [para(t)] })

// ─── Authored ingredient data ─────────────────────────────────────────────────
// [name, amount|null, unit|null, prepNote|null, group|null, optional?]
type Row = [string, number | null, string | null, string | null, string | null, boolean?]

const LISTS: Record<string, Row[]> = {
  'acai-bowl': [
    ['Acai pulp', 200, 'g', 'frozen, or 2 tbsp freeze-dried acai powder', 'For the base'],
    ['Banana', 2, 'each', '1 frozen for the base, 1 fresh to serve', 'For the base'],
    ['Coconut water', 100, 'ml', 'or unsweetened almond milk', 'For the base'],
    ['Caster sugar', 1, 'tbsp', 'optional, if the base is too tart', 'For the base', true],
    ['Strawberries', 100, 'g', 'halved', 'To serve'],
    ['Granola', 40, 'g', null, 'To serve'],
    ['Coconut flakes', 1, 'tbsp', null, 'To serve'],
    ['Honey', 1, 'tbsp', 'to drizzle', 'To serve', true],
  ],
  'bastilla-chicken': [
    ['Chicken thighs', 6, 'each', 'bone-in, skin-on', 'For the filling'],
    ['Onion', 1, 'each', 'finely chopped', 'For the filling'],
    ['Garlic', 3, 'clove', 'crushed', 'For the filling'],
    ['Ground coriander', 1, 'tsp', null, 'For the filling'],
    ['Ground cumin', 1, 'tsp', null, 'For the filling'],
    ['Ground cinnamon', 1, 'tsp', 'plus extra to dust', 'For the filling'],
    ['Black pepper', 0.5, 'tsp', null, 'For the filling'],
    ['Eggs', 4, 'each', 'beaten', 'For the filling'],
    ['Fine sea salt', null, null, 'to taste', 'For the filling'],
    ['Filo pastry', 9, 'sheet', 'about 270g', 'To assemble'],
    ['Unsalted butter', 100, 'g', 'melted', 'To assemble'],
    ['Flaked almonds', 100, 'g', 'toasted', 'To assemble'],
    ['Icing sugar', 2, 'tbsp', 'plus extra to dust', 'To assemble'],
  ],
  'couscous-seven-vegetable': [
    ['Couscous', 300, 'g', null, 'For the couscous'],
    ['Olive oil', 4, 'tbsp', 'divided', 'For the couscous'],
    ['Lemon', 1, 'each', 'juiced', 'For the couscous'],
    ['Fresh coriander', 20, 'g', 'chopped', 'For the couscous'],
    ['Flat-leaf parsley', 20, 'g', 'chopped', 'For the couscous'],
    ['Onion', 1, 'each', 'cut into wedges', 'For the vegetables'],
    ['Ras el hanout', 2, 'tsp', null, 'For the vegetables'],
    ['Carrot', 2, 'each', 'cut into chunks', 'For the vegetables'],
    ['Courgette', 1, 'each', 'cut into chunks', 'For the vegetables'],
    ['Red pepper', 1, 'each', 'cut into chunks', 'For the vegetables'],
    ['Tomato', 2, 'each', 'quartered', 'For the vegetables'],
    ['Chickpeas', 400, 'g', 'tin, drained', 'For the vegetables'],
    ['Vegetable stock', 600, 'ml', 'or water', 'For the vegetables'],
  ],
  'pastilla-milk': [
    ['Plain flour', 60, 'g', null, 'For the milk cream'],
    ['Caster sugar', 80, 'g', null, 'For the milk cream'],
    ['Whole milk', 600, 'ml', 'cold', 'For the milk cream'],
    ['Rose water', 1, 'tbsp', 'or orange blossom water', 'For the milk cream'],
    ['Honey', 2, 'tbsp', null, 'For the milk cream'],
    ['Filo pastry', 9, 'sheet', 'about 270g', 'To assemble'],
    ['Unsalted butter', 100, 'g', 'melted', 'To assemble'],
    ['Flaked almonds', 100, 'g', 'toasted', 'To assemble'],
    ['Icing sugar', 2, 'tbsp', 'to dust', 'To assemble'],
    ['Ground cinnamon', 1, 'tsp', 'to dust', 'To assemble'],
  ],
  'white-chocolate-cardamom-mousse': [
    ['White chocolate', 200, 'g', 'chopped', null],
    ['Green cardamom', 8, 'each', 'pods, seeds crushed', null],
    ['Whole milk', 100, 'ml', null, null],
    ['Double cream', 300, 'ml', 'cold', null],
    ['Egg whites', 3, 'each', null, null],
    ['Caster sugar', 50, 'g', null, null],
    ['Bay leaves', 2, 'leaf', 'optional, for infusing', null, true],
  ],
}

// Rows appended to an existing list (kept).
const APPENDS: Record<string, Row[]> = {
  'christmas-cake': [
    ['Marzipan', 500, 'g', 'to cover', 'To finish'],
    ['Fondant icing', 750, 'g', 'to cover', 'To finish'],
  ],
  'trofie-al-pesto': [['Trofie', 350, 'g', 'dried', 'For the pasta']],
  'teriyaki-mushroom-rice-bowls': [['Miso paste', 1, 'tbsp', null, null]],
  'panna-cotta': [['Balsamic glaze', null, null, 'to serve', null, true]],
  'street-corn-salad': [['Jalapeño', 1, 'each', 'deseeded and finely chopped', null]],
  'easy-decadent-truffles': [['Liqueur', 1, 'tbsp', 'almond, coffee, or orange, to flavour', null, true]],
}

// Method ordered-list truncation: keep the first N steps (drop the foreign tail).
const TRUNCATE: Record<string, number> = {
  'baked-croissants': 6,
  'spinach-and-feta-pinwheels': 7,
  'teriyaki-mushroom-rice-bowls': 8,
}

// New ingredients the table doesn't have yet.
const CREATE: Record<string, CreateSpec> = {
  'Acai pulp': { name: 'Acai pulp', category: 'fruit', defaultUnit: 'g', aisle: 'FROZEN', aliases: ['acai', 'açaí pulp', 'frozen acai'] },
  'Coconut water': { name: 'Coconut water', category: 'other', defaultUnit: 'ml', aisle: 'DRINK', aliases: ['coconut water'] },
  'Miso paste': { name: 'Miso paste', category: 'condiment', defaultUnit: 'tbsp', aisle: 'PANTRY_CONDIMENT', aliases: ['miso', 'white miso', 'red miso'], isAllergen: true, allergenType: 'soybeans' },
  'Trofie': { name: 'Trofie', category: 'grain', defaultUnit: 'g', aisle: 'PANTRY_DRY', aliases: ['trofie pasta'], isAllergen: true, allergenType: 'gluten' },
  'Liqueur': { name: 'Liqueur', category: 'alcohol', defaultUnit: 'tbsp', aisle: 'DRINK', aliases: ['flavoured liqueur'] },
}

// ─── Body helpers ──────────────────────────────────────────────────────────────
function findBlock(body: N): N | null {
  let block: N | null = null
  const walk = (n?: N) => { if (!n || typeof n !== 'object') return; if (n.type === 'ingredientsList') block = n; if (Array.isArray(n.content)) for (const c of n.content) walk(c) }
  walk(body); return block
}
function nodeText(n: N): string {
  const out: string[] = []; const w = (x?: N) => { if (!x) return; if (typeof x.text === 'string') out.push(x.text); if (Array.isArray(x.content)) for (const c of x.content) w(c) }; w(n); return out.join(' ')
}
/** The Method section's ordered list (the longest orderedList in the body). */
function findMethodList(body: N): N | null {
  let best: N | null = null
  const w = (n?: N) => { if (!n) return; if (n.type === 'orderedList' && (!best || (n.content?.length ?? 0) > (best.content?.length ?? 0))) best = n; if (Array.isArray(n.content)) for (const c of n.content) w(c) }
  w(body); return best
}

async function rowsToItems(
  lookup: Map<string, ResolvedIngredient>,
  rows: Row[],
): Promise<Array<Record<string, unknown>>> {
  const items: Array<Record<string, unknown>> = []
  for (const [name, amount, unit, prepNote, group, optional] of rows) {
    let ing = findInLookup(lookup, name)
    // For a name we have a CREATE spec for, only reuse an EXACT-name row — don't
    // let "Trofie" collapse onto a "Fusilli" row that merely aliases it.
    if (ing && CREATE[name] && ing.name.toLowerCase() !== name.toLowerCase()) ing = null
    if (!ing) {
      const spec = CREATE[name]
      if (!spec) throw new Error(`No master ingredient and no CREATE spec for "${name}"`)
      ing = APPLY ? await createIngredient(prisma, lookup, spec) : { id: `(new:${name})`, slug: spec.name.toLowerCase().replace(/\s+/g, '-'), name: spec.name, defaultUnit: spec.defaultUnit }
    }
    items.push({
      name: ing.name,
      amount,
      unit: unit ?? null,
      prepNote: prepNote ?? null,
      groupLabel: group ?? null,
      isOptional: optional === true,
      ingredientId: ing.id,
      ingredientSlug: ing.slug,
    })
  }
  return items
}

async function processRecipe(slug: string, lookup: Map<string, ResolvedIngredient>): Promise<void> {
  const t = await prisma.tutorial.findUnique({ where: { slug } })
  if (!t) { console.log(`! ${slug} not found`); return }
  const body = t.body as unknown as N
  const block = findBlock(body)
  const changes: string[] = []

  // 1. Truncate the method's foreign tail.
  if (TRUNCATE[slug] != null) {
    const list = findMethodList(body)
    if (list && Array.isArray(list.content)) {
      const keep = TRUNCATE[slug]
      const dropped = list.content.length - keep
      if (dropped > 0) {
        changes.push(`truncate method ${list.content.length} → ${keep} steps (drop ${dropped} foreign)`)
        list.content = list.content.slice(0, keep)
      }
    }
  }

  // 2. Replace the whole ingredient list.
  if (LISTS[slug] && block && block.attrs) {
    const items = await rowsToItems(lookup, LISTS[slug])
    changes.push(`replace ingredient list → ${items.length} items: ${items.map((i) => i.name).join(', ')}`)
    block.attrs.items = items
  }

  // 3. Append ingredient rows (idempotent — skip ids already present).
  if (APPENDS[slug] && block && block.attrs) {
    const existing = (Array.isArray(block.attrs.items) ? block.attrs.items : []) as Array<Record<string, unknown>>
    const haveIds = new Set(existing.map((i) => i.ingredientId))
    const add = (await rowsToItems(lookup, APPENDS[slug])).filter((i) => !haveIds.has(i.ingredientId))
    if (add.length > 0) {
      changes.push(`append ${add.length} ingredient(s): ${add.map((i) => i.name).join(', ')}`)
      block.attrs.items = [...existing, ...add]
    }
  }

  // 4. white-chocolate-cardamom-mousse: rewrite method + variations + make-ahead.
  if (slug === 'white-chocolate-cardamom-mousse') {
    const list = findMethodList(body)
    if (list) {
      list.content = [
        'Lightly crush the cardamom seeds. Warm the milk with the cardamom and bay leaves, if using, in a small saucepan until it just reaches a simmer. Take off the heat and leave to infuse for 10 minutes, then strain.',
        'Melt the white chocolate gently in a heatproof bowl set over barely simmering water, stirring until smooth. Stir the warm infused milk into the melted chocolate until glossy, then leave to cool to room temperature.',
        'Whip the double cream to soft peaks. In a separate clean bowl, whisk the egg whites to soft peaks, then whisk in the caster sugar a little at a time until thick and glossy.',
        'Fold the cooled white chocolate mixture into the whipped cream. Fold in the egg whites in two additions, keeping as much air in the mixture as you can.',
        'Spoon into four glasses and chill for at least 4 hours, or overnight, until set. Serve cold.',
      ].map(listItem)
      changes.push('rewrite mousse method (5 steps)')
    }
    // Variations bullet list + make-ahead paragraph
    const top = Array.isArray(body.content) ? body.content : []
    for (let i = 0; i < top.length; i++) {
      const node = top[i]
      if (node?.type === 'heading' && /variations/i.test(nodeText(node))) {
        const next = top[i + 1]
        if (next?.type === 'bulletList') {
          next.content = [
            'Citrus lift: fold the finely grated zest of an orange through the cardamom milk before straining.',
            'Berry layer: spoon a little crushed raspberry into the base of each glass before adding the mousse.',
          ].map(listItem)
          changes.push('replace ice-cream variations with mousse variations')
        }
      }
      if (node?.type === 'heading' && /make ahead/i.test(nodeText(node))) {
        const next = top[i + 1]
        if (next?.type === 'paragraph') {
          next.content = [textNode('Make up to a day ahead and keep covered in the fridge. The mousse is best eaten within two days.')]
          changes.push('fix make-ahead note (was ice-cream/freezer)')
        }
      }
    }
  }

  if (changes.length === 0) { console.log(`= ${slug}: no change`); return }
  console.log(`\n• ${slug}`)
  for (const c of changes) console.log(`    - ${c}`)

  if (APPLY) {
    await prisma.tutorial.update({ where: { id: t.id }, data: { body: body as unknown as object } })
    const n = await resyncRecipeIngredients(prisma, t.id, body)
    console.log(`    ✓ saved + re-synced ${n} ingredient rows`)
  }
}

async function main() {
  const lookup = await buildMasterLookup(prisma)
  if (APPLY) {
    for (const [name, spec] of Object.entries(CREATE)) {
      if (!findInLookup(lookup, name)) {
        const r = await createIngredient(prisma, lookup, spec)
        console.log(`created master ingredient: ${r.name} (${r.slug})`)
      }
    }
  }
  const slugs = new Set([...Object.keys(LISTS), ...Object.keys(APPENDS), ...Object.keys(TRUNCATE)])
  for (const slug of slugs) await processRecipe(slug, lookup)
  console.log(`\n${APPLY ? 'APPLIED' : 'DRY-RUN'} — soda-bread-brown left unchanged (correct: milk+lemon is a buttermilk substitute).`)
}
main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
