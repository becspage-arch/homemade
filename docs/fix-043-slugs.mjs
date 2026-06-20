// Fix incorrect ingredient slugs in batch-043 chutney/pickle/ferment files
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const briefDir = join(__dirname, 'bulk-batch-043-briefs')

// Canonical slug corrections: wrong → correct
const SLUG_FIXES = {
  'salt': 'salt-table',
  'ground-cumin': 'cumin-ground',
  'ground-coriander': 'coriander-ground',
  'ground-turmeric': 'turmeric-ground',
  'ground-cinnamon': 'cinnamon-ground',
  'ground-allspice': 'allspice',
  'ground-ginger': 'ginger-ground',
  'black-peppercorns': 'peppercorns-black',
  'peppercorns': 'peppercorns-black',
  'red-cabbage': 'cabbage-red',
  'red-pepper': 'pepper-red',
  'brown-sugar': 'soft-brown-sugar',
  'tomatoes': 'tomato',
  'plum': 'plums',
  'carrots': 'carrot',
}

function fixIngredientSlugs(content) {
  if (!Array.isArray(content)) return content
  return content.map(node => {
    if (node.type === 'ingredientsList' && node.attrs?.items) {
      return {
        ...node,
        attrs: {
          ...node.attrs,
          items: node.attrs.items.map(item => ({
            ...item,
            ingredientSlug: SLUG_FIXES[item.ingredientSlug] ?? item.ingredientSlug,
          })),
        },
      }
    }
    if (Array.isArray(node.content)) {
      return { ...node, content: fixIngredientSlugs(node.content) }
    }
    return node
  })
}

// Only process files 21–35 (the failing ones)
const files = readdirSync(briefDir)
  .filter(f => f.endsWith('.json'))
  .sort()
  .filter(f => {
    const n = parseInt(f.split('-')[0], 10)
    return n >= 21 && n <= 35
  })

let changed = 0
for (const fn of files) {
  const filePath = join(briefDir, fn)
  const data = JSON.parse(readFileSync(filePath, 'utf8'))
  const before = JSON.stringify(data)

  data.body.content = fixIngredientSlugs(data.body.content)

  const after = JSON.stringify(data)
  if (before !== after) {
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
    console.log(`FIXED: ${fn}`)
    changed++
  } else {
    console.log(`SKIP: ${fn} (no changes)`)
  }
}

console.log(`\nDone: ${changed} files updated`)
