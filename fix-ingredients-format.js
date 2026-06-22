/**
 * Fix-up for files that used the wrong ingredientsList format:
 *   Wrong:  { "type": "ingredientsList", "content": [ { "type": "ingredient", "attrs": { "slug": ..., "quantity": ..., "unit": ..., "note": ... } } ] }
 *   Right:  { "type": "ingredientsList", "attrs": { "defaultServings": 4, "items": [ { "ingredientSlug": ..., "amount": ..., "unit": ..., "prepNote": ..., "isOptional": false, "groupLabel": null } ] } }
 */
const fs = require('fs')
const path = require('path')

const DIR = process.argv[2]
if (!DIR) { console.error('Usage: node fix-ingredients-format.js <batch-dir>'); process.exit(1) }

function fixNode(node, servings) {
  if (node.type === 'ingredientsList' && node.content && Array.isArray(node.content)) {
    // Wrong format — convert
    const items = node.content
      .filter(c => c.type === 'ingredient' && c.attrs)
      .map(c => ({
        ingredientSlug: c.attrs.slug || c.attrs.ingredientSlug || '',
        amount: c.attrs.quantity ?? c.attrs.amount ?? null,
        unit: c.attrs.unit || null,
        prepNote: c.attrs.note ?? c.attrs.prepNote ?? null,
        isOptional: c.attrs.isOptional ?? false,
        groupLabel: c.attrs.groupLabel ?? null,
      }))
    node.attrs = { defaultServings: servings || 4, items }
    delete node.content
    return true
  }
  let changed = false
  if (node.content) {
    for (const child of node.content) {
      if (fixNode(child, servings)) changed = true
    }
  }
  return changed
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort()
let fixed = 0

for (const file of files) {
  const fp = path.join(DIR, file)
  const d = JSON.parse(fs.readFileSync(fp, 'utf-8'))
  const servings = d.recipe?.servings || 4
  if (fixNode(d.body, servings)) {
    fs.writeFileSync(fp, JSON.stringify(d, null, 2) + '\n')
    fixed++
    console.log(`Fixed: ${file}`)
  }
}

console.log(`Done. ${fixed} files converted.`)
