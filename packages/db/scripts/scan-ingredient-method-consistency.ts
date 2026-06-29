/**
 * scan-ingredient-method-consistency — READ-ONLY discovery pass.
 *
 * Finds published RECIPE tutorials whose METHOD STEPS use a measured ingredient
 * that is absent from the structured ingredientsList block (a reader can't shop
 * for it). The high-precision signal is a numeric food quantity in a step
 * ("Place 120g raisins…", "stir in 2 tbsp honey") naming something the list
 * omits — that pattern carries the real amount too, so the fix is exact.
 *
 *   TIER 1 (genuine, auto-fixable): quantity + food unit + ingredient phrase in
 *           a step, the phrase resolves to a master Ingredient, and neither that
 *           ingredient nor its words appear in any listed line. The amount/unit
 *           are parsed from the text.
 *   TIER 2 (review-only): a master ingredient phrase named in a step with NO
 *           quantity and not covered. Noisier (serving asides, texture words);
 *           surfaced as counts + a sample, never auto-fixed.
 *   UNUSED  (low-confidence): a listed ingredient whose name never appears
 *           anywhere in the prose.
 *
 * Output is a JSON artefact + a console summary; nothing is written to the DB.
 *
 * Run from the MAIN checkout:
 *   pnpm --filter @homemade/db exec tsx scripts/scan-ingredient-method-consistency.ts
 *   pnpm --filter @homemade/db exec tsx scripts/scan-ingredient-method-consistency.ts --slug rum-and-raisin-ice-cream
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'
import {
  stepText, fullProseText, listedItems, norm,
  significantWords, normWord,
  findMethodIngredientGaps, buildIngredientResolver, AMBIGUOUS,
} from '../src/recipe-consistency.js'

const args = process.argv.slice(2)
function arg(name: string): string | undefined {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const onlySlug = arg('slug')
const outPath = arg('out') ?? resolve(__dirname, 'scan-ingredient-method-consistency.out.json')

// ─── Master ingredient matcher (sweep-side; the gate is vocab-free) ────────────
interface MasterIng {
  id: string
  slug: string
  name: string
  defaultUnit: string
  category: string
  phrases: string[]
  res: RegExp[]
  words: string[]
}

function buildMatcher(phrasesRaw: string[]): RegExp[] {
  const res: RegExp[] = []
  for (const p of phrasesRaw) {
    const phrase = norm(p)
    if (phrase.length < 3) continue
    if (AMBIGUOUS.has(phrase)) continue
    const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    res.push(new RegExp(`(?<![a-z])${esc}(?:e?s)?(?![a-z])`, 'i'))
  }
  return res
}

function matchAny(res: RegExp[], haystack: string): boolean {
  for (const re of res) if (re.test(haystack)) return true
  return false
}

// Derived forms ("lemon juice", "egg yolks") are covered when the parent
// ("lemon", "egg") is listed.
const DERIVED_HEADS = new Set(['juice', 'zest', 'rind', 'peel', 'yolk', 'yolks', 'white', 'whites'])
// True "to taste" staples we never flag as a shopping gap.
const STAPLE_IGNORE = new Set([
  'salt', 'pepper', 'water', 'black pepper', 'white pepper', 'ground black pepper',
  'table salt', 'sea salt', 'flaky sea salt', 'salt and pepper', 'cold water',
  'boiling water', 'warm water', 'iced water',
])

interface Flag {
  tier: 1 | 2
  ingredientId: string | null
  ingredientName: string
  amount: number | null
  unit: string | null
  snippet: string
}
interface RecipeReport {
  id: string
  slug: string
  title: string
  categorySlug: string
  listedCount: number
  tier1: Flag[]
  tier2: Flag[]
  unused: Array<{ ingredientId: string; ingredientName: string }>
}

function snippetAround(text: string, idx: number, len: number): string {
  const start = Math.max(0, idx - 40)
  const end = Math.min(text.length, idx + len + 40)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

async function main(): Promise<void> {
  const ingredients = await prisma.ingredient.findMany({
    select: {
      id: true, slug: true, name: true, pluralName: true, aliases: true,
      defaultUnit: true, category: true,
    },
  })
  const master: MasterIng[] = ingredients.map((ing) => {
    const phrases = [ing.name, ing.pluralName ?? '', ...ing.aliases].filter(Boolean)
    return {
      id: ing.id, slug: ing.slug, name: ing.name,
      defaultUnit: ing.defaultUnit, category: ing.category,
      phrases: phrases.map(norm),
      res: buildMatcher(phrases),
      words: significantWords(phrases),
    }
  })
  const masterById = new Map(master.map((m) => [m.id, m]))
  // Shared resolver (identical to the gate's) so the sweep and the gate agree.
  const resolveId = buildIngredientResolver(ingredients)
  console.log(`Loaded ${master.length} master ingredients.`)

  const where: Record<string, unknown> = { status: 'PUBLISHED', type: 'RECIPE' }
  if (onlySlug) where.slug = onlySlug
  const recipesRaw = await prisma.tutorial.findMany({
    where,
    select: { id: true, slug: true, title: true, body: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })
  console.log(`Scanning ${recipesRaw.length} published recipes.\n`)

  // Resolve a captured phrase to a master ingredient via the shared resolver.
  function resolveIngredient(phrase: string): MasterIng | null {
    const id = resolveId(phrase)
    return id ? masterById.get(id) ?? null : null
  }

  const reports: RecipeReport[] = []
  for (const r of recipesRaw) {
    const categorySlug = r.category?.slug ?? ''
    const method = stepText(r.body)
    const prose = fullProseText(r.body)
    const listed = listedItems(r.body)
    const listedIds = new Set(listed.map((l) => l.ingredientId).filter(Boolean))
    const listedNameWords = new Set<string>()
    for (const l of listed) for (const w of significantWords([l.name])) listedNameWords.add(w)

    // Is a master ingredient covered by the list (linked, name overlap, parent)?
    function covered(ing: MasterIng): boolean {
      if (listedIds.has(ing.id)) return true
      // direct word overlap with a listed name
      for (const w of ing.words) if (listedNameWords.has(w)) return true
      // parent coverage for derived forms
      const nm = norm(ing.name).split(' ')
      if (nm.length >= 2 && DERIVED_HEADS.has(nm[nm.length - 1])) {
        const parent = nm.slice(0, -1)
        for (const w of parent) if (listedNameWords.has(normWord(w))) return true
      }
      return false
    }

    // ── TIER 1 — quantity-prefixed gaps (identical to what the gate enforces) ──
    const tier1: Flag[] = []
    const seen1 = new Set<string>()
    const gaps = findMethodIngredientGaps(r.body, {
      resolveIngredientId: (phrase) => resolveIngredient(phrase)?.id ?? null,
    })
    for (const gap of gaps) {
      const ing = resolveIngredient(gap.phrase)
      tier1.push({
        tier: 1,
        ingredientId: ing?.id ?? null,
        ingredientName: ing?.name ?? gap.phrase,
        amount: gap.amount,
        unit: gap.unit,
        // Snippet anchored at the QUANTITY match so the amount's true context shows.
        snippet: snippetAround(method, gap.index, gap.matchLen + gap.phrase.length + 4),
      })
      if (ing) seen1.add(ing.id)
    }

    // ── TIER 2 — vocab phrase in a step, no quantity, not covered ──
    const tier2: Flag[] = []
    const seen2 = new Set<string>()
    for (const ing of master) {
      if (ing.res.length === 0) continue
      if (seen1.has(ing.id)) continue
      if (covered(ing)) continue
      if (STAPLE_IGNORE.has(norm(ing.name))) continue
      const hit = ing.res.find((re) => re.test(method))
      if (!hit) continue
      if (seen2.has(ing.id)) continue
      seen2.add(ing.id)
      const m = method.match(hit)
      tier2.push({
        tier: 2,
        ingredientId: ing.id,
        ingredientName: ing.name,
        amount: null,
        unit: null,
        snippet: m && m.index != null ? snippetAround(method, m.index, m[0].length) : '',
      })
    }

    // ── UNUSED — listed but never mentioned in any prose ──
    const unused: Array<{ ingredientId: string; ingredientName: string }> = []
    for (const l of listed) {
      if (!l.ingredientId) continue
      const ing = master.find((m) => m.id === l.ingredientId)
      if (!ing || ing.words.length === 0) continue
      const used = ing.words.some((w) => {
        const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return new RegExp(`(?<![a-z])${esc}(?:e?s)?(?![a-z])`, 'i').test(prose)
      })
      if (!used) unused.push({ ingredientId: ing.id, ingredientName: l.name || ing.name })
    }

    if (tier1.length || tier2.length || unused.length) {
      reports.push({
        id: r.id, slug: r.slug, title: r.title, categorySlug,
        listedCount: listed.length, tier1, tier2, unused,
      })
    }
  }

  const withT1 = reports.filter((r) => r.tier1.length > 0)
  const t1total = reports.reduce((n, r) => n + r.tier1.length, 0)
  const t2total = reports.reduce((n, r) => n + r.tier2.length, 0)
  const withT2 = reports.filter((r) => r.tier2.length > 0)
  const unusedTotal = reports.reduce((n, r) => n + r.unused.length, 0)
  const withUnused = reports.filter((r) => r.unused.length > 0)

  writeFileSync(outPath, JSON.stringify(reports, null, 2))

  console.log('─── SUMMARY ───────────────────────────────────────────')
  console.log(`TIER 1 (measured ingredient missing — genuine, auto-fixable):`)
  console.log(`   recipes: ${withT1.length}   flags: ${t1total}`)
  console.log(`TIER 2 (unmeasured ingredient named in a step, not listed — review):`)
  console.log(`   recipes: ${withT2.length}   flags: ${t2total}`)
  console.log(`UNUSED (listed but never mentioned — low confidence):`)
  console.log(`   recipes: ${withUnused.length}   flags: ${unusedTotal}`)
  console.log(`Artefact: ${outPath}\n`)

  console.log('─── TIER 1 — measured ingredient missing from the list ───')
  for (const r of withT1) {
    console.log(`\n• ${r.slug}  [${r.categorySlug}]  (${r.listedCount} listed)`)
    for (const f of r.tier1) {
      const qty = f.amount != null ? `${f.amount}${f.unit ?? ''} ` : ''
      console.log(`    + ${qty}${f.ingredientName}  → "${f.snippet}"`)
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
