/**
 * Add measured ingredients that the method uses but the list omits.
 *
 * Reads the scan artefact (scan-ingredient-method-consistency.out.json), and for
 * each TIER-1 flag inserts the missing ingredient into the recipe body's
 * ingredientsList block with the amount/unit parsed from the step, links it to
 * the master Ingredient, and re-derives the RecipeIngredient join rows.
 *
 * Guardrails (skip + report rather than risk a wrong/duplicate row):
 *   - the master ingredient is already linked in the list (alias double-name)
 *   - a listed line already shares the ingredient's name/alias words
 *   - the mention is an "or" ALTERNATIVE (preceded by "or") — the primary is
 *     handled on its own line
 *   - the recipe is on the manual EXCLUDE list (structurally broken — surfaced)
 *
 * Dry-run by default; pass --apply to write.
 *   pnpm --filter @homemade/db exec tsx scripts/fix-ingredient-method-mismatches.ts
 *   pnpm --filter @homemade/db exec tsx scripts/fix-ingredient-method-mismatches.ts --apply
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let d = 0; d < 12; d++) {
    const c = resolve(dir, '.env.credentials')
    if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
    const p = dirname(dir); if (p === dir) break; dir = p
  }
}
import { prisma } from '../src'
import { norm, significantWords, stepText, listedItems } from '../src/recipe-consistency.js'
import { resyncRecipeIngredients } from './lib/resync-recipe-ingredients.js'

const APPLY = process.argv.includes('--apply')

// Recipes whose method is structurally broken — a whole DIFFERENT recipe's
// ingredient blob is pasted into the body, or the list is near-empty. Adding one
// row would not make them correct; these are surfaced for the owner, never
// auto-patched. (Empty-name lists are detected automatically as well.)
const EXCLUDE = new Set<string>([
  'acai-bowl',                      // 1 ingredient listed for a multi-component bowl
  'baked-croissants',               // a salad's ingredient blob pasted into the method
  'spinach-and-feta-pinwheels',     // method is a warm potato-salad recipe
  'teriyaki-mushroom-rice-bowls',   // method is a mushroom-pie/wellington recipe
  'white-chocolate-cardamom-mousse',// method is a dark-chocolate fridge-set recipe
  'soda-bread-brown',               // milk+lemon is a buttermilk SUBSTITUTE, not extra
  'easy-decadent-truffles',         // "orange" is a liqueur flavour, not the fruit
  'panna-cotta',                    // balsamic is a serving drizzle, not an ingredient
])

// Specific false-positive flags inside otherwise-fine recipes (slug → ingredient).
const SKIP_FLAG = new Set<string>([
  'trofie-al-pesto::Fusilli',   // method says trofie; pasta missing from list, not Fusilli
  'street-corn-salad::Jalapeño',// quantity belongs to the cilantro it followed
  'christmas-cake::Marzipan',   // "2 tbsp" is spirit; marzipan covering needs ~500g — surface
])

interface ScanFlag {
  tier: number
  ingredientId: string | null
  ingredientName: string
  amount: number | null
  unit: string | null
  snippet: string
}
interface ScanReport {
  id: string; slug: string; title: string; categorySlug: string
  listedCount: number; tier1: ScanFlag[]
}

interface N { type?: string; attrs?: Record<string, unknown>; content?: N[] }

function findBlock(body: N): N | null {
  let block: N | null = null
  const walk = (n?: N) => {
    if (!n || typeof n !== 'object') return
    if (n.type === 'ingredientsList') block = n
    if (Array.isArray(n.content)) for (const c of n.content) walk(c)
  }
  walk(body)
  return block
}

function mode(labels: (string | null)[]): string | null {
  const counts = new Map<string, number>()
  for (const l of labels) if (l) counts.set(l, (counts.get(l) ?? 0) + 1)
  let best: string | null = null; let n = 0
  for (const [l, c] of counts) if (c > n) { best = l; n = c }
  return best
}

async function main() {
  const scanPath = resolve(__dirname, 'scan-ingredient-method-consistency.out.json')
  const reports: ScanReport[] = JSON.parse(readFileSync(scanPath, 'utf8'))
  const t1 = reports.filter((r) => r.tier1.length > 0)

  const masterIds = [...new Set(t1.flatMap((r) => r.tier1.map((f) => f.ingredientId).filter(Boolean)))] as string[]
  const masters = await prisma.ingredient.findMany({
    where: { id: { in: masterIds } },
    select: { id: true, slug: true, name: true, pluralName: true, aliases: true, defaultUnit: true },
  })
  const masterById = new Map(masters.map((m) => [m.id, m]))

  let applied = 0, skipped = 0
  const skips: string[] = []
  const adds: string[] = []

  for (const rep of t1) {
    const t = await prisma.tutorial.findUnique({ where: { id: rep.id } })
    if (!t) continue
    const body = t.body as unknown as N
    const block = findBlock(body)
    if (!block || !block.attrs) { skips.push(`${rep.slug}: no ingredientsList block`); skipped += rep.tier1.length; continue }
    const items = (Array.isArray(block.attrs.items) ? block.attrs.items : []) as Array<Record<string, unknown>>
    const listed = listedItems(body)
    const listedIds = new Set(listed.map((l) => l.ingredientId).filter(Boolean))
    const listedWords = new Set<string>()
    for (const l of listed) for (const w of significantWords([l.name])) listedWords.add(w)
    const steps = stepText(body)
    const groupLabel = mode(items.map((i) => (typeof i.groupLabel === 'string' ? i.groupLabel : null)))

    const proposed: Array<Record<string, unknown>> = []
    const proposedIds = new Set<string>()
    const listedNames = listed.map((l) => l.name).join(', ')
    // Recipes whose ingredient lines have no stored names can't be coverage-
    // checked — a separate data anomaly. Skip + surface rather than guess.
    const namedCount = listed.filter((l) => l.name.trim().length > 0).length
    const emptyNameList = listed.length > 0 && namedCount / listed.length < 0.5

    for (const f of rep.tier1) {
      const tag = `${rep.slug}  +${f.amount ?? ''}${f.unit ?? ''} ${f.ingredientName}`
      if (EXCLUDE.has(rep.slug)) { skips.push(`${tag}  [EXCLUDED: broken/foreign method]`); skipped++; continue }
      if (emptyNameList) { skips.push(`${tag}  [EXCLUDED: ingredient lines have no names]`); skipped++; continue }
      if (SKIP_FLAG.has(`${rep.slug}::${f.ingredientName}`)) { skips.push(`${tag}  [skip: false positive]`); skipped++; continue }
      const m = f.ingredientId ? masterById.get(f.ingredientId) : null
      if (!m) { skips.push(`${tag}  [unresolved master]`); skipped++; continue }
      if (listedIds.has(m.id)) { skips.push(`${tag}  [already linked]`); skipped++; continue }
      if (proposedIds.has(m.id)) { skips.push(`${tag}  [duplicate mention]`); skipped++; continue }
      // (Coverage by listed name word + id is already applied in the scan's gap
      // finder; no extra master-word guard here — it over-matched on generic
      // words like "cosmetic" and wrongly skipped genuine gaps.)
      // "or" alternative? (mention preceded by "or")
      const reAlt = new RegExp(`\\bor\\s+(?:[a-z-]+\\s+){0,2}${norm(f.ingredientName).split(' ')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')
      if (reAlt.test(steps)) { skips.push(`${tag}  [\"or\" alternative]`); skipped++; continue }

      const optional = new RegExp(`${norm(f.ingredientName).split(' ')[0]}[^.]{0,40}\\b(if using|if you like|optional|to taste)\\b`, 'i').test(steps)
        || new RegExp(`\\b(if using|if you like|optional)\\b[^.]{0,40}${norm(f.ingredientName).split(' ')[0]}`, 'i').test(steps)
      const newItem: Record<string, unknown> = {
        name: m.name,
        unit: f.unit ?? null,
        amount: f.amount,
        prepNote: null,
        groupLabel,
        isOptional: optional,
        ingredientId: m.id,
        ingredientSlug: m.slug,
      }
      proposed.push(newItem)
      proposedIds.add(m.id)
      adds.push(`${tag}${optional ? '  (optional)' : ''}`)
    }

    if (proposed.length === 0) continue
    if (APPLY) {
      block.attrs.items = [...items, ...proposed]
      await prisma.tutorial.update({ where: { id: rep.id }, data: { body: body as unknown as object } })
      await resyncRecipeIngredients(prisma, rep.id, body)
      applied += proposed.length
    } else {
      console.log(`\n${rep.slug}  [listed: ${listedNames}]`)
      for (const p of proposed) console.log(`   + ${p.amount ?? ''}${p.unit ?? ''} ${p.name}${p.isOptional ? ' (optional)' : ''}`)
    }
  }

  console.log('\n─── SKIPPED ───')
  for (const s of skips) console.log('  -', s)
  console.log(`\n${APPLY ? 'APPLIED' : 'WOULD ADD'}: ${adds.length}   SKIPPED: ${skipped}`)
  if (APPLY) console.log(`Rows written across recipes: ${applied}`)
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
