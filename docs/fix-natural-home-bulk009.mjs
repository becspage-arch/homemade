/**
 * Fix natural-home bulk-009 brief files:
 * - Remap ingredient slugs (essential oils, wrong format slugs)
 * - Remap tool slugs
 * - Remove rattan-diffuser-reeds from ingredientsList (file 35 only)
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIR = join(__dirname, 'natural-home-bulk-009-briefs')

const ING_REMAP = {
  // Essential oils: {name}-essential-oil → essential-oil-{name}
  'bergamot-essential-oil': 'essential-oil-bergamot',
  'cedarwood-essential-oil': 'essential-oil-cedarwood',
  'citronella-essential-oil': 'essential-oil-citronella',
  'clary-sage-essential-oil': 'essential-oil-clary-sage',
  'eucalyptus-essential-oil': 'essential-oil-eucalyptus',
  'frankincense-essential-oil': 'essential-oil-frankincense',
  'lavender-essential-oil': 'essential-oil-lavender',
  'lemon-essential-oil': 'essential-oil-lemon',
  'neroli-essential-oil': 'essential-oil-neroli',
  'peppermint-essential-oil': 'essential-oil-peppermint',
  'pine-essential-oil': 'essential-oil-pine',
  'roman-chamomile-essential-oil': 'essential-oil-roman-chamomile',
  'rose-geranium-essential-oil': 'essential-oil-rose-geranium',
  'rosemary-essential-oil': 'essential-oil-rosemary',
  'sandalwood-essential-oil': 'essential-oil-sandalwood',
  'sweet-orange-essential-oil': 'essential-oil-sweet-orange',
  'tea-tree-essential-oil': 'essential-oil-tea-tree',
  // Other slug fixes
  'activated-charcoal-powder': 'activated-charcoal',
  'candle-wick-cdn12': 'candle-wick-pretabbed',
  'cedarwood-chips': 'cedar-shavings',
  'coarse-sea-salt': 'sea-salt-flakes',
  'cornstarch': 'cornflour',
  'dried-lavender-buds': 'dried-lavender-flowers',
  'fine-sea-salt': 'sea-salt-fine',
  'isopropyl-alcohol-99': 'isopropyl-alcohol',
  'kaolin-clay-white': 'kaolin-clay',
  'oat-flour-fine': 'oat-flour',
  'vegetable-glycerin': 'vegetable-glycerine',
  'white-kaolin-clay': 'kaolin-clay',
}

const TOOL_REMAP = {
  'amber-dropper-bottle-30ml': 'dropper-bottle-amber',
  'amber-dropper-bottle-50ml': 'dropper-bottle-50ml',
  'measuring-jug-500ml': 'measuring-jug',
  'reed-diffuser-bottle-100ml': 'reed-diffuser-bottle',
  'small-mixing-bowl': 'mixing-bowl-small',
  'spray-bottle-250ml': 'spray-bottle-amber-250ml',
  'stiff-scrubbing-brush': 'scrubbing-brush',
  'pillar-candle-mould-75mm': 'pillar-candle-mould-aluminium',
}

// Remove rattan-diffuser-reeds from ingredientsList (only a tool, not an ingredient)
const ING_REMOVE = new Set(['rattan-diffuser-reeds'])

function fixIngSlug(slug) {
  return ING_REMAP[slug] ?? slug
}

function fixToolSlug(slug) {
  return TOOL_REMAP[slug] ?? slug
}

function walkBody(node) {
  if (!node || typeof node !== 'object') return node
  if (Array.isArray(node)) return node.map(walkBody)
  if (node.type === 'ingredientsList' && node.attrs && Array.isArray(node.attrs.items)) {
    const fixed = node.attrs.items
      .filter(item => !ING_REMOVE.has(item?.ingredientSlug))
      .map(item => item?.ingredientSlug ? { ...item, ingredientSlug: fixIngSlug(item.ingredientSlug) } : item)
    return { ...node, attrs: { ...node.attrs, items: fixed } }
  }
  if (Array.isArray(node.content)) return { ...node, content: node.content.map(walkBody) }
  return node
}

let totalIngFixes = 0
let totalToolFixes = 0
let filesChanged = 0

const files = readdirSync(DIR).filter(f => f.endsWith('.json')).sort()
for (const file of files) {
  const path = join(DIR, file)
  const original = readFileSync(path, 'utf8')
  const data = JSON.parse(original)

  // Fix ingredientsList in body
  const newBody = walkBody(data.body)

  // Fix recipeTools
  const newTools = (data.recipeTools ?? []).map(t => {
    const fixed = fixToolSlug(t.slug)
    if (fixed !== t.slug) totalToolFixes++
    return { ...t, slug: fixed }
  })

  const newData = { ...data, body: newBody, recipeTools: newTools }
  const serialised = JSON.stringify(newData, null, 2)

  if (serialised !== original) {
    writeFileSync(path, serialised)
    filesChanged++
    console.log(`Fixed: ${file}`)
  }
}

console.log(`\nDone: ${filesChanged} files changed, ${totalToolFixes} tool slug fixes`)
