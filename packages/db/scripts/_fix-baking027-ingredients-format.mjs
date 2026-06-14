/**
 * Convert baking-bulk-027 RECIPE files from old ingredientsList content[] format
 * to the current attrs.items[] format expected by upload-tutorial.
 *
 * Old:  ingredientsList { attrs: { servings }, content: [ ingredient { attrs: { slug, amount, unit, display, prepNote } } ] }
 * New:  ingredientsList { attrs: { defaultServings, items: [ { ingredientSlug, amount, unit, prepNote, isOptional, groupLabel } ] } }
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const briefsDir = join(__dirname, '../../../docs/baking-bulk-027-briefs')

const TARGETS = [
  'blackberry-pie-double-crust.json',
  'candied-lemon-peel.json',
  'christmas-cake-fruit-nut-top.json',
  'dulce-de-leche-homemade.json',
  'ginger-loaf-crystallised-ginger.json',
  'macaron-pistachio.json',
  'macaron-raspberry.json',
  'rhubarb-pie-double-crust.json',
  'rum-truffles.json',
  'salted-caramel-truffles.json',
]

function convertNode(node) {
  if (!node || typeof node !== 'object') return node
  if (Array.isArray(node)) return node.map(convertNode)

  if (node.type === 'ingredientsList' && Array.isArray(node.content)) {
    // Old format — convert
    const servings = node.attrs?.servings ?? node.attrs?.defaultServings ?? null
    const items = (node.content || [])
      .filter(n => n.type === 'ingredient')
      .map(n => ({
        ingredientSlug: n.attrs?.slug ?? null,
        amount: n.attrs?.amount ?? null,
        unit: n.attrs?.unit ?? null,
        prepNote: n.attrs?.prepNote ?? null,
        isOptional: n.attrs?.isOptional ?? false,
        groupLabel: n.attrs?.groupLabel ?? null,
      }))
    return {
      type: 'ingredientsList',
      attrs: { defaultServings: servings, items },
    }
  }

  const out = {}
  for (const [k, v] of Object.entries(node)) {
    out[k] = convertNode(v)
  }
  return out
}

let fixed = 0
let skipped = 0

for (const fn of TARGETS) {
  const fp = join(briefsDir, fn)
  const raw = readFileSync(fp, 'utf8')
  const doc = JSON.parse(raw)

  const converted = convertNode(doc)
  const newRaw = JSON.stringify(converted, null, 2) + '\n'

  if (newRaw === raw) {
    console.log(`SKIP (no change): ${fn}`)
    skipped++
  } else {
    writeFileSync(fp, newRaw)
    console.log(`FIXED: ${fn}`)
    fixed++
  }
}

console.log(`\nDone: ${fixed} fixed, ${skipped} skipped`)
