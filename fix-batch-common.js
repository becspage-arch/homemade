/**
 * Common fix script for any cooking sprint batch.
 * Usage: node fix-batch-common.js <batch-dir>
 *
 * Fixes:
 * 1. glossaryTerms: rename 'label' -> 'term'
 * 2. Ingredient slug remaps
 * 3. Tool slug remaps
 * 4. Strip glossaryTerms entries not used inline (and remove orphan tooltip marks)
 */

const fs = require('fs')
const path = require('path')

const DIR = process.argv[2]
if (!DIR) { console.error('Usage: node fix-batch-common.js <batch-dir>'); process.exit(1) }

const INGR_REMAP = {
  // Spring onions
  'spring-onions': 'spring-onion',
  // Peanuts
  'peanuts-roasted': 'peanuts',
  // Bean sprouts
  'beansprouts': 'bean-sprouts',
  // Prawns
  'raw-prawns': 'prawns-raw',
  // Pork belly
  'pork-belly-skin-on': 'pork-belly',
  // Fish
  'white-fish-fillet': 'cod-fillet',
  // Shrimp paste
  'shrimp-paste': 'fish-sauce',
  // Rice
  'glutinous-rice': 'short-grain-rice',
  'rice-noodles-flat': 'noodles-rice',
  'rice-vermicelli': 'noodles-rice',
  // Yoghurt
  'natural-yoghurt': 'plain-yoghurt',
  // Herbs
  'mint-fresh': 'mint',
  'coriander-leaves': 'coriander-fresh',
  'parsley-fresh': 'parsley-flat',
  // Nuts
  'flaked-almonds': 'almonds-flaked',
  'cashew-nuts': 'cashews',
  // Chilli
  'chilli-yellow': 'chilli-green',
  // Legumes
  'tinned-chickpeas': 'chickpeas-tinned',
  'dried-chickpeas': 'chickpeas-dried',
  // Aromatics
  'bay-leaf': 'bay-leaves',
  'black-peppercorns': 'peppercorns-black',
  // Veg
  'frozen-peas': 'peas-frozen',
  // Butter
  'butter': 'unsalted-butter',
  // Peppers
  'red-pepper': 'pepper-red',
  'green-pepper': 'pepper-green',
  'yellow-pepper': 'pepper-yellow',
  // Spices
  'paprika': 'paprika-sweet',
  'smoked-paprika': 'paprika-smoked',
  // Breadcrumbs
  'breadcrumbs': 'breadcrumbs-dried',
  // Stocks
  'beef-stock': 'stock-beef',
  'fish-stock': 'stock-fish',
  'chicken-stock': 'chicken-stock', // valid already
  // Mushrooms
  'mushrooms': 'mushrooms-chestnut',
  // Wine
  'white-wine': 'white-wine-dry',
  // Legumes
  'haricot-beans-tinned': 'haricot-beans',
  'kidney-beans-tinned': 'kidney-beans',
  // Sausage
  'toulouse-sausages': 'sausages-pork',
  // Veal
  'veal-pieces': 'veal-shoulder',
  // Herbs
  'basil-fresh': 'basil',
  // Spices
  'allspice-ground': 'allspice',
  // Veg
  'cabbage': 'cabbage-white',
  // Remove these (no slug, salt handled below)
  // Beef braising steak
  'beef-braising-steak': 'beef-shin',
  // Sugar (slug is caster-sugar not sugar-caster)
  'sugar-caster': 'caster-sugar',
  'sugar-light-brown': 'light-brown-sugar',
  'sugar-palm': 'caster-sugar',
  // Tomatoes (slug is tomato not tomatoes)
  'tomatoes': 'tomato',
  'tomato-paste': 'tomato-puree',
  // Lime juice (no lime-juice slug; use lime)
  'lime-juice': 'lime',
  // Chicken (slug is chicken-thigh not chicken-thighs)
  'chicken-thighs': 'chicken-thigh',
  // Coffee
  'coffee-ground': 'ground-coffee',
  // Tapioca (slug is tapioca-flour not tapioca-starch)
  'tapioca-starch': 'tapioca-flour',
  // Daikon (no slug; map to radish as nearest substitute)
  'daikon': 'radish',
  // Coconut water (no slug; use coconut-milk)
  'coconut-water': 'coconut-milk',
  // Beef bones (no slug; remove — handled in INGR_REMOVE below)
  // Rice paper wrappers (no slug — remove from ingredients)
  // Olive oil (slug is extra-virgin-olive-oil not olive-oil-extra-virgin)
  'olive-oil-extra-virgin': 'extra-virgin-olive-oil',
  // Chilli (dried-chilli not chilli-dried)
  'chilli-dried': 'dried-chilli',
  // Potato (singular slug)
  'potatoes': 'potato',
  // Radicchio (no slug; nearest is cabbage-red)
  'radicchio': 'cabbage-red',
  // Fennel bulb (slug is fennel not fennel-bulb)
  'fennel-bulb': 'fennel',
  // Marsala (slug is fortified-marsala not marsala-wine)
  'marsala-wine': 'fortified-marsala',
  // Candied peel (slug is mixed-peel not candied-peel)
  'candied-peel': 'mixed-peel',
  // Sage (slug is sage not fresh-sage)
  'fresh-sage': 'sage',
  // Pistachios (need to check — likely pistachios)
  'pistachios': 'pistachios',
  // Rabbit (slug is rabbit not rabbit-whole)
  'rabbit-whole': 'rabbit',
  // Sea bass (slug is sea-bass not sea-bass-fillets)
  'sea-bass-fillets': 'sea-bass',
  // Mustard slugs
  'mustard-dijon': 'dijon-mustard',
  'mustard-wholegrain': 'wholegrain-mustard',
  // Smoked bacon (slug is lardons or smoked-lardons)
  'smoked-bacon': 'lardons',
  // Sour cream (slug is soured-cream)
  'sour-cream': 'soured-cream',
  // Dried mushrooms
  'mushrooms-dried': 'mushrooms-porcini-dried',
  // Beetroot (singular slug)
  'beetroot-raw': 'beetroot',
  'beetroot-cooked': 'beetroot',
  // Cherries (tinned)
  'cherries-tinned': 'cherries',
  // Black-eyed peas (slug is black-eyed-beans)
  'black-eyed-peas': 'black-eyed-beans',
  // Dried mixed fruit (slug is mixed-dried-fruit)
  'dried-mixed-fruit': 'mixed-dried-fruit',
  // Treacle (slug is black-treacle)
  'treacle': 'black-treacle',
  // Rum
  'rum': 'rum-dark',
  // Cornmeal (slug is polenta)
  'cornmeal': 'polenta',
  // Barberries (no slug; use dried cranberries/currants as nearest)
  'barberries': 'currants',
  // Japanese dashi (no dashi-stock slug; use chicken-stock as neutral base)
  'dashi-stock': 'chicken-stock',
  // Miso (no generic miso-paste; use miso-white)
  'miso-paste': 'miso-white',
  // Shiitake (slug is mushrooms-shiitake not shiitake-mushrooms)
  'shiitake-mushrooms': 'mushrooms-shiitake',
  // Bamboo shoots (slug is bamboo-shoots not bamboo-shoots-tinned)
  'bamboo-shoots-tinned': 'bamboo-shoots',
}

// Slugs with no valid entry in the master table — remove the ingredient line
const INGR_REMOVE = new Set([
  'beef-bones',
  'rice-paper-wrappers',
  'red-bean-paste',
])

const TOOL_REMAP = {
  'saucepan': 'large-saucepan',
  'large-stockpot': 'stockpot',
  'large-frying-pan': 'frying-pan-30',
  'kitchen-thermometer': 'instant-read-thermometer',
  'large-steamer': 'steamer-pot',
  'large-deep-frying-pan': 'frying-pan-30',
  '23cm-x-33cm-baking-tin': 'rectangular-baking-tin',
  'skewer': 'skewers',
  'casserole-dish': 'dutch-oven',
  'large-baking-tray': 'baking-tray',
  'grill-pan': 'griddle-pan',
  'mortar-and-pestle': 'pestle-and-mortar',
  'large-pot': 'stockpot',
  'pot': 'large-saucepan',
  'kadai': 'wok',
  'karahi': 'wok',
  'tawa': 'griddle-pan',
}

// Replace em-dashes and en-dashes with a period (and collapse double periods)
// NOTE: do NOT trim — trailing/leading spaces in text nodes are meaningful
function fixDashesInText(s) {
  return s.replace(/[—–]/g, '.').replace(/\.\./g, '.')
}
function fixDashesInField(s) {
  return s.replace(/[—–]/g, '.').replace(/\.\./g, '.').trim()
}

function stripDashesInNode(node) {
  if (node.type === 'text' && node.text) {
    node.text = fixDashesInText(node.text)
  }
  if (node.type === 'troubleshooter' && node.attrs && node.attrs.items) {
    node.attrs.items = node.attrs.items.map(item => ({
      ...item,
      symptom: fixDashesInField(item.symptom || ''),
      cause: fixDashesInField(item.cause || ''),
      fix: fixDashesInField(item.fix || ''),
    }))
  }
  // Fix wrong troubleshooter item type name
  if (node.type === 'troubleshootItem') node.type = 'troubleshooterItem'
  if (node.content) node.content.forEach(stripDashesInNode)
}

// Ensure adjacent text nodes in paragraphs are separated by a space.
// flattenInline() in voice-check joins with '' so "sentence.Next" becomes one word.
function ensureTextNodeSpacing(node) {
  if ((node.type === 'paragraph' || node.type === 'listItem') && node.content) {
    for (let i = 0; i < node.content.length - 1; i++) {
      const curr = node.content[i]
      const next = node.content[i + 1]
      if (curr.type === 'text' && curr.text) {
        // If current text ends without a space and next node starts without a space, add space
        const endsNoSpace = !/\s$/.test(curr.text)
        const nextStartsNoSpace = next.type === 'text' ? !/^\s/.test(next.text || '') : true
        if (endsNoSpace && nextStartsNoSpace) {
          curr.text = curr.text + ' '
        }
      }
    }
  }
  if (node.content) node.content.forEach(ensureTextNodeSpacing)
}

function collectUsedTooltipSlugs(node, used) {
  if (node.marks) node.marks.forEach(m => {
    if (m.type === 'glossaryTooltip' && m.attrs && m.attrs.termSlug) used.add(m.attrs.termSlug)
  })
  if (node.content) node.content.forEach(n => collectUsedTooltipSlugs(n, used))
}

function removeOrphanTooltipMarks(node, keep) {
  if (node.marks) node.marks = node.marks.filter(m => m.type !== 'glossaryTooltip' || keep.has(m.attrs?.termSlug))
  if (node.content) node.content = node.content.map(n => removeOrphanTooltipMarks(n, keep))
  return node
}

function walkIngredients(node) {
  if (node.type === 'ingredientsList' && node.attrs && node.attrs.items) {
    // Remap slugs
    node.attrs.items.forEach(item => {
      if (INGR_REMAP[item.ingredientSlug]) item.ingredientSlug = INGR_REMAP[item.ingredientSlug]
    })
    // Remove items with no valid slug
    node.attrs.items = node.attrs.items.filter(item => !INGR_REMOVE.has(item.ingredientSlug))
  }
  if (node.content) node.content.forEach(walkIngredients)
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort()
let toolFixes = 0, ingrFixes = 0, labelFixes = 0, glossFixes = 0

for (const file of files) {
  const fp = path.join(DIR, file)
  const d = JSON.parse(fs.readFileSync(fp, 'utf-8'))
  let changed = false

  // Strip em-dashes from top-level string fields
  for (const field of ['excerpt', 'sourceNotes', 'subtitle']) {
    if (typeof d[field] === 'string' && /[—–]/.test(d[field])) {
      d[field] = fixDashesInField(d[field]); changed = true
    }
  }

  // Strip em-dashes from body nodes
  const bodyBefore = JSON.stringify(d.body)
  stripDashesInNode(d.body)
  // Ensure text node spacing so voice-check grade-level works correctly
  ensureTextNodeSpacing(d.body)
  if (JSON.stringify(d.body) !== bodyBefore) changed = true

  // Fix glossaryTerms: rename label->term
  if (d.glossaryTerms) {
    const before = JSON.stringify(d.glossaryTerms)
    d.glossaryTerms = d.glossaryTerms.map(t => {
      if (t.label !== undefined && t.term === undefined) {
        labelFixes++; changed = true
        const { label, ...rest } = t
        return { ...rest, term: label }
      }
      return t
    })
    // Remove terms without a 'term' field (still broken)
    d.glossaryTerms = d.glossaryTerms.filter(t => t.term !== undefined)
  }

  // Fix tool slugs
  if (d.recipeTools) {
    d.recipeTools = d.recipeTools.map(t => {
      if (TOOL_REMAP[t.slug]) { toolFixes++; changed = true; return { ...t, slug: TOOL_REMAP[t.slug] } }
      return t
    })
  }

  // Fix ingredient slugs
  const before = JSON.stringify(d.body)
  walkIngredients(d.body)
  if (JSON.stringify(d.body) !== before) { ingrFixes++; changed = true }

  // Strip glossaryTerms that are not used inline (and remove orphan tooltip marks)
  const usedSlugs = new Set()
  collectUsedTooltipSlugs(d.body, usedSlugs)
  const origLen = (d.glossaryTerms || []).length
  d.glossaryTerms = (d.glossaryTerms || []).filter(t => usedSlugs.has(t.slug))
  const keepSlugs = new Set((d.glossaryTerms || []).map(t => t.slug))
  d.body = removeOrphanTooltipMarks(d.body, keepSlugs)
  if (d.glossaryTerms.length !== origLen) { glossFixes += origLen - d.glossaryTerms.length; changed = true }

  // Fix invalid difficulty enum values (only BEGINNER, INTERMEDIATE, ADVANCED)
  const VALID_DIFFICULTIES = new Set(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  if (d.difficulty && !VALID_DIFFICULTIES.has(d.difficulty)) {
    d.difficulty = 'BEGINNER'; changed = true
  }

  // Fix invalid sourceType enum values (only TESTED, CLASSIC, SYNTHESISED, PUBLIC_DOMAIN, CREATOR)
  const VALID_SOURCE_TYPES = new Set(['TESTED', 'CLASSIC', 'SYNTHESISED', 'PUBLIC_DOMAIN', 'CREATOR'])
  if (d.sourceType && !VALID_SOURCE_TYPES.has(d.sourceType)) {
    // REGIONAL and FAMILY both map to CLASSIC
    d.sourceType = 'CLASSIC'; changed = true
  }

  // Clear invalid season values (only SUMMER/WINTER are valid enum values; others cause Prisma error)
  const validSeasons = new Set(['SUMMER', 'WINTER', null])
  if (!validSeasons.has(d.season)) { d.season = null; changed = true }

  if (changed) fs.writeFileSync(fp, JSON.stringify(d, null, 2) + '\n')
}

console.log(`Done. label->term: ${labelFixes}, tool fixes: ${toolFixes}, ingredient files fixed: ${ingrFixes}, glossary term removals: ${glossFixes}`)
