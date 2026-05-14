// Convert parsed recipes into TipTap upload-tutorial briefs.
//
// Steps:
//   1. Load parsed recipes + master ingredients + master tools.
//   2. Dedupe by normalised title (prefer master for shared recipes).
//   3. For each unique recipe:
//        - Build ingredient line parser: extract amount, unit, name, prepNote.
//        - Map name to master ingredient slug (exact, alias, partial).
//        - Build a recipeTools[] array by scanning method text for tool keywords.
//        - Derive metadata: servings, prepMinutes, cookMinutes, temperatureCelsius,
//          cuisine, mealType, mood, dietaryFlags, freezable, batchable, etc.
//        - Generate TipTap JSON body with ingredientsList block + ordered-list method.
//   4. Write per-recipe brief JSON files + a `_mapping-report.json` with notes.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const BRIEFS_DIR = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/keen-kare-ac9dea/docs/personal-recipes-briefs'
const SCRIPT_DIR = 'C:/tmp/docx-tooling-script'

const parsed = JSON.parse(readFileSync(`${BRIEFS_DIR}/_parsed-recipes.json`, 'utf8'))
const ingredients = JSON.parse(readFileSync(`${SCRIPT_DIR}/ingredients-list.json`, 'utf8'))
const tools = JSON.parse(readFileSync(`${SCRIPT_DIR}/tools-list.json`, 'utf8'))

// ─── Build lookup tables ────────────────────────────────────────────────────

function norm(s) {
  return s.toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9' -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function singularise(s) {
  // Crude — but works for most ingredient names
  if (s.endsWith('ies')) return s.slice(0, -3) + 'y'
  if (s.endsWith('oes')) return s.slice(0, -2)
  if (s.endsWith('ches') || s.endsWith('shes') || s.endsWith('xes')) return s.slice(0, -2)
  if (s.endsWith('s') && !s.endsWith('ss') && !s.endsWith('us')) return s.slice(0, -1)
  return s
}

// Build ingredient lookup: normalised name → { slug, name, defaultUnit }
const ingByName = new Map()
function addIngredientName(key, entry) {
  const k = norm(key)
  if (!k) return
  if (!ingByName.has(k)) ingByName.set(k, entry)
  // also singularised
  const sing = singularise(k)
  if (sing !== k && !ingByName.has(sing)) ingByName.set(sing, entry)
}
for (const ing of ingredients) {
  const entry = { slug: ing.slug, name: ing.name, defaultUnit: ing.defaultUnit }
  addIngredientName(ing.name, entry)
  if (ing.pluralName) addIngredientName(ing.pluralName, entry)
  for (const a of ing.aliases) addIngredientName(a, entry)
}

// Generic-name fallback aliases. Rebecca writes "butter" not "salted butter",
// "milk" not "whole milk", "salt" not "table salt" etc. Map the generic terms
// to a sensible default slug per home-cookery convention.
const GENERIC_FALLBACKS = {
  'butter': 'salted-butter',
  'salt': 'salt-table',
  'pepper': 'black-pepper',
  'black pepper': 'black-pepper',
  'ground pepper': 'black-pepper',
  'freshly ground pepper': 'black-pepper',
  'freshly ground black pepper': 'black-pepper',
  'kosher salt': 'kosher-salt',
  'sea salt': 'sea-salt-fine',
  'fine salt': 'sea-salt-fine',
  'celtic sea salt': 'sea-salt-fine',
  'milk': 'whole-milk',
  'flour': 'plain-flour',
  'all-purpose flour': 'plain-flour',
  'cinnamon': 'cinnamon-ground',
  'ground cinnamon': 'cinnamon-ground',
  'paprika': 'paprika-sweet',
  'vanilla': 'vanilla-extract',
  'vanilla essence': 'vanilla-extract',
  'sugar': 'caster-sugar',
  'white sugar': 'granulated-sugar',
  'brown sugar': 'light-brown-sugar',
  'dark brown sugar': 'dark-brown-sugar',
  'light brown sugar': 'light-brown-sugar',
  'icing sugar': 'icing-sugar',
  'powdered sugar': 'icing-sugar',
  'cocoa': 'cocoa-powder',
  'cocoa powder': 'cocoa-powder',
  'cacao powder': 'cocoa-powder',
  'oil': 'olive-oil',
  'cooking oil': 'olive-oil',
  'vegetable oil': 'vegetable-oil',
  'olive oil': 'olive-oil',
  'extra virgin olive oil': 'extra-virgin-olive-oil',
  'sesame oil': 'sesame-oil',
  'soy sauce': 'soy-sauce-light',
  'light soy sauce': 'soy-sauce-light',
  'dark soy sauce': 'soy-sauce-dark',
  'tamari': 'tamari',
  'cheese': 'cheddar',
  'cheddar': 'cheddar',
  'cheddar cheese': 'cheddar',
  'parmesan': 'parmesan',
  'parmesan cheese': 'parmesan',
  'mozzarella': 'mozzarella',
  'mozzarella cheese': 'mozzarella',
  'cream cheese': 'cream-cheese',
  'goats cheese': 'goats-cheese',
  "goat's cheese": 'goats-cheese',
  'feta': 'feta',
  'feta cheese': 'feta',
  'eggs': 'eggs',
  'egg': 'eggs',
  'egg yolk': 'egg-yolks',
  'egg yolks': 'egg-yolks',
  'egg white': 'egg-whites',
  'egg whites': 'egg-whites',
  'chicken': 'chicken-breast',
  'chicken breast': 'chicken-breast',
  'chicken breasts': 'chicken-breast',
  'boneless chicken breasts': 'chicken-breast',
  'chicken thigh': 'chicken-thigh',
  'chicken thighs': 'chicken-thigh',
  'chicken drumsticks': 'chicken-drumstick',
  'chicken wings': 'chicken-wings',
  'bacon': 'streaky-bacon',
  'streaky bacon': 'streaky-bacon',
  'back bacon': 'back-bacon',
  'rashers of bacon': 'streaky-bacon',
  'beef mince': 'beef-mince',
  'minced beef': 'beef-mince',
  'ground beef': 'beef-mince',
  'pork mince': 'pork-mince',
  'lamb mince': 'lamb-mince',
  'mushroom': 'mushrooms-chestnut',
  'mushrooms': 'mushrooms-chestnut',
  'chestnut mushrooms': 'mushrooms-chestnut',
  'button mushrooms': 'mushrooms-button',
  'baby spinach': 'baby-spinach',
  'spinach': 'spinach',
  'rocket': 'rocket',
  'arugula': 'rocket',
  'tomatoes': 'tomato',
  'tomato': 'tomato',
  'cherry tomatoes': 'cherry-tomatoes',
  'red onion': 'red-onion',
  'spring onion': 'spring-onion',
  'spring onions': 'spring-onion',
  'green onion': 'spring-onion',
  'green onions': 'spring-onion',
  'onion': 'onion',
  'onions': 'onion',
  'garlic': 'garlic',
  'garlic clove': 'garlic',
  'cloves of garlic': 'garlic',
  'garlic cloves': 'garlic',
  'parsley': 'parsley',
  'fresh parsley': 'parsley',
  'basil': 'basil',
  'fresh basil': 'basil',
  'thyme': 'thyme',
  'fresh thyme': 'thyme',
  'dried thyme': 'thyme',
  'rosemary': 'rosemary',
  'fresh rosemary': 'rosemary',
  'dried rosemary': 'rosemary',
  'oregano': 'oregano-dried',
  'dried oregano': 'oregano-dried',
  'chives': 'chives',
  'fresh chives': 'chives',
  'coriander': 'coriander-fresh',
  'fresh coriander': 'coriander-fresh',
  'ground coriander': 'coriander-ground',
  'cilantro': 'coriander-fresh',
  'cumin': 'cumin-ground',
  'ground cumin': 'cumin-ground',
  'turmeric': 'turmeric',
  'cayenne': 'cayenne',
  'cayenne pepper': 'cayenne',
  'red pepper flakes': 'chilli-flakes',
  'chilli flakes': 'chilli-flakes',
  'chili flakes': 'chilli-flakes',
  'crushed red pepper flakes': 'chilli-flakes',
  'chilli powder': 'chilli-powder',
  'chili powder': 'chilli-powder',
  'mild chilli powder': 'chilli-powder',
  'garlic powder': 'garlic-powder',
  'onion powder': 'onion-powder',
  'mustard powder': 'english-mustard-powder',
  'english mustard': 'english-mustard',
  'dijon mustard': 'dijon-mustard',
  'wholegrain mustard': 'wholegrain-mustard',
  'treacle': 'black-treacle',
  'black treacle': 'black-treacle',
  'molasses': 'black-treacle',
  'cream': 'double-cream',
  'thick cream': 'double-cream',
  'pouring cream': 'single-cream',
  'lemon': 'lemon',
  'lemon juice': 'lemon',
  'lime': 'lime',
  'apple': 'apple',
  'apples': 'apple',
  'pear': 'pear',
  'pears': 'pear',
  'avocado': 'avocado',
  'banana': 'banana',
  'bananas': 'banana',
  'oats': 'porridge-oats',
  'rolled oats': 'porridge-oats',
  'porridge oats': 'porridge-oats',
  'old-fashioned oats': 'porridge-oats',
  'oatmeal': 'porridge-oats',
  'chia seeds': 'chia-seeds',
  'sesame seeds': 'sesame-seeds',
  'walnuts': 'walnuts',
  'almonds': 'almonds',
  'pine nuts': 'pine-nuts',
  'beef stock': 'beef-stock',
  'chicken stock': 'chicken-stock',
  'vegetable stock': 'vegetable-stock',
  'chicken broth': 'chicken-stock',
  'beef broth': 'beef-stock',
  'vegetable broth': 'vegetable-stock',
  'low-sodium chicken broth': 'chicken-stock',
  'heavy cream': 'double-cream',
  'double cream': 'double-cream',
  'single cream': 'single-cream',
  'whipping cream': 'whipping-cream',
  'sour cream': 'soured-cream',
  'soured cream': 'soured-cream',
  'creme fraiche': 'creme-fraiche',
  'crème fraîche': 'creme-fraiche',
  'yoghurt': 'plain-yoghurt',
  'yogurt': 'plain-yoghurt',
  'greek yoghurt': 'greek-yoghurt',
  'greek yogurt': 'greek-yoghurt',
  'red wine': 'red-wine',
  'white wine': 'white-wine',
  'dry white wine': 'white-wine',
  'red burgundy wine': 'red-wine',
  'lentils': 'lentils-green',
  'green lentils': 'lentils-green',
  'red lentils': 'lentils-red',
  'arborio rice': 'arborio-rice',
  'basmati rice': 'basmati-rice',
  'rice': 'basmati-rice',
  'pasta': 'pasta-dried',
  'dried pasta': 'pasta-dried',
  'fresh pasta': 'pasta-fresh',
  'penne': 'pasta-dried',
  'penne pasta': 'pasta-dried',
  'linguine': 'pasta-dried',
  'linguine pasta': 'pasta-dried',
  'spaghetti': 'pasta-dried',
  'spaghetti pasta': 'pasta-dried',
  'tagliatelle': 'pasta-dried',
  'tagliatelle pasta': 'pasta-dried',
  'fettuccine': 'pasta-dried',
  'fettuccine pasta': 'pasta-dried',
  'rigatoni': 'pasta-dried',
  'macaroni': 'pasta-dried',
  'lasagne sheets': 'lasagne-sheets',
  'lasagna sheets': 'lasagne-sheets',
  'bay leaf': 'bay-leaves',
  'bay leaves': 'bay-leaves',
  'nutmeg': 'nutmeg-ground',
  'ground nutmeg': 'nutmeg-ground',
  'whole nutmeg': 'nutmeg-whole',
  'chicken bouillon': 'chicken-stock',
  'beef bouillon': 'beef-stock',
  'vegetable bouillon': 'vegetable-stock',
  'maple syrup': 'maple-syrup',
  'honey': 'honey',
  'worcestershire sauce': 'worcestershire-sauce',
  'tomato passata': 'passata',
  'passata': 'passata',
  'tinned tomatoes': 'tomatoes-tinned',
  'canned tomatoes': 'tomatoes-tinned',
  'chopped tomatoes': 'tomatoes-tinned',
  'tomato paste': 'tomato-puree',
  'tomato puree': 'tomato-puree',
  'tomato purée': 'tomato-puree',
  'breadcrumbs': 'breadcrumbs',
  'panko breadcrumbs': 'breadcrumbs-panko',
  'panko': 'breadcrumbs-panko',
  'flour tortilla': 'tortilla-flour',
  'flour tortillas': 'tortilla-flour',
  'tortilla': 'tortilla-corn',
  'tortilla wraps': 'tortilla-flour',
  'baking powder': 'baking-powder',
  'bicarbonate of soda': 'bicarbonate-of-soda',
  'baking soda': 'bicarbonate-of-soda',
  'cornstarch': 'cornflour',
  'cornflour': 'cornflour',
  'vinegar': 'white-wine-vinegar',
  'apple cider vinegar': 'apple-cider-vinegar',
  'balsamic vinegar': 'balsamic-vinegar',
  'white wine vinegar': 'white-wine-vinegar',
  'red wine vinegar': 'red-wine-vinegar',
  'salmon': 'salmon-fillet',
  'salmon fillets': 'salmon-fillet',
  'sea bass': 'sea-bass',
  'cod': 'cod-fillet',
  'cod fillet': 'cod-fillet',
  'tuna': 'tuna-steak',
  'tinned tuna': 'tuna-tinned',
  'canned tuna': 'tuna-tinned',
  'prawn': 'prawns-raw',
  'prawns': 'prawns-raw',
  'raw prawns': 'prawns-raw',
  'cooked prawns': 'prawns-cooked',
  'shrimp': 'prawns-raw',
  'shrimps': 'prawns-raw',
  'parma ham': 'prosciutto',
  'serrano ham': 'serrano-ham',
  'white wine': 'white-wine-dry',
  'dry white wine': 'white-wine-dry',
  'red wine': 'red-wine',
  'gammon': 'gammon',
  'pancetta': 'pancetta',
  'chorizo': 'chorizo',
  'sausages': 'sausages-pork',
  'pork sausages': 'sausages-pork',
  'panko breadcrumbs': 'panko',
  'breadcrumbs': 'breadcrumbs-dried',
  'plain yoghurt': 'plain-yoghurt',
  'natural yoghurt': 'plain-yoghurt',
  'pasta water': 'water',
  'water': 'water',
  'tortilla': 'tortilla-flour',
  'tortilla wraps': 'tortilla-flour',
  'flour tortilla': 'tortilla-flour',
  'flour tortillas': 'tortilla-flour',
}

// Validate fallback slugs exist; drop ones that don't.
const validIngredientSlugs = new Set(ingredients.map(i => i.slug))
for (const [key, slug] of Object.entries(GENERIC_FALLBACKS)) {
  if (!validIngredientSlugs.has(slug)) {
    // Try a close match
    const close = ingredients.find(i => i.slug.includes(slug) || slug.includes(i.slug))
    if (close) {
      // Replace with the closest
      GENERIC_FALLBACKS[key] = close.slug
    } else {
      delete GENERIC_FALLBACKS[key]
    }
  }
}
// Now add the validated fallbacks to ingByName
for (const [name, slug] of Object.entries(GENERIC_FALLBACKS)) {
  const ing = ingredients.find(i => i.slug === slug)
  if (!ing) continue
  addIngredientName(name, { slug: ing.slug, name: ing.name, defaultUnit: ing.defaultUnit })
}

// Tool lookup: normalised name → { slug, name }
const toolByName = new Map()
function addToolName(key, entry) {
  const k = norm(key)
  if (!k) return
  if (!toolByName.has(k)) toolByName.set(k, entry)
  const sing = singularise(k)
  if (sing !== k && !toolByName.has(sing)) toolByName.set(sing, entry)
}
for (const tool of tools) {
  const entry = { slug: tool.slug, name: tool.name }
  addToolName(tool.name, entry)
  if (tool.pluralName) addToolName(tool.pluralName, entry)
  for (const a of tool.aliases) addToolName(a, entry)
}

// ─── Ingredient line parser ─────────────────────────────────────────────────

// Units we recognise — both UK and US. Order matters: longer first.
const UNITS = [
  // Weight
  { token: 'kilograms', canon: 'kg' }, { token: 'kilogram', canon: 'kg' },
  { token: 'kg', canon: 'kg' }, { token: 'kgs', canon: 'kg' },
  { token: 'grams', canon: 'g' }, { token: 'gram', canon: 'g' },
  { token: 'gms', canon: 'g' }, { token: 'gm', canon: 'g' }, { token: 'g', canon: 'g' },
  { token: 'pounds', canon: 'lb' }, { token: 'pound', canon: 'lb' },
  { token: 'lbs', canon: 'lb' }, { token: 'lb', canon: 'lb' },
  { token: 'ounces', canon: 'oz' }, { token: 'ounce', canon: 'oz' },
  { token: 'oz', canon: 'oz' },
  // Volume
  { token: 'tablespoons', canon: 'tbsp' }, { token: 'tablespoon', canon: 'tbsp' },
  { token: 'tbsp', canon: 'tbsp' }, { token: 'tbsps', canon: 'tbsp' },
  { token: 'tbs', canon: 'tbsp' }, { token: 'tb', canon: 'tbsp' },
  { token: 'teaspoons', canon: 'tsp' }, { token: 'teaspoon', canon: 'tsp' },
  { token: 'tsp', canon: 'tsp' }, { token: 'tsps', canon: 'tsp' },
  { token: 'litres', canon: 'l' }, { token: 'litre', canon: 'l' },
  { token: 'liters', canon: 'l' }, { token: 'liter', canon: 'l' }, { token: 'l', canon: 'l' },
  { token: 'millilitres', canon: 'ml' }, { token: 'millilitre', canon: 'ml' },
  { token: 'milliliters', canon: 'ml' }, { token: 'ml', canon: 'ml' },
  { token: 'cups', canon: 'cup' }, { token: 'cup', canon: 'cup' },
  { token: 'pints', canon: 'pint' }, { token: 'pint', canon: 'pint' },
  { token: 'fluid ounces', canon: 'fl oz' }, { token: 'fluid ounce', canon: 'fl oz' },
  { token: 'fl oz', canon: 'fl oz' }, { token: 'fl. oz', canon: 'fl oz' },
  // Countable
  { token: 'cloves', canon: 'clove' }, { token: 'clove', canon: 'clove' },
  { token: 'slices', canon: 'slice' }, { token: 'slice', canon: 'slice' },
  { token: 'rashers', canon: 'rasher' }, { token: 'rasher', canon: 'rasher' },
  { token: 'sprigs', canon: 'sprig' }, { token: 'sprig', canon: 'sprig' },
  { token: 'leaves', canon: 'leaf' }, { token: 'leaf', canon: 'leaf' },
  { token: 'sheets', canon: 'sheet' }, { token: 'sheet', canon: 'sheet' },
  { token: 'bunches', canon: 'bunch' }, { token: 'bunch', canon: 'bunch' },
  { token: 'handfuls', canon: 'handful' }, { token: 'handful', canon: 'handful' },
  { token: 'pinches', canon: 'pinch' }, { token: 'pinch', canon: 'pinch' },
  { token: 'sticks', canon: 'stick' }, { token: 'stick', canon: 'stick' },
  { token: 'heads', canon: 'each' }, { token: 'head', canon: 'each' },
]

// Fraction → decimal
function parseFraction(s) {
  if (!s) return null
  s = s.replace(/¼/g, '1/4').replace(/½/g, '1/2').replace(/¾/g, '3/4')
       .replace(/⅓/g, '1/3').replace(/⅔/g, '2/3').replace(/⅛/g, '1/8')
       .replace(/⅜/g, '3/8').replace(/⅝/g, '5/8').replace(/⅞/g, '7/8')
  // Pattern: "1 1/2" or "1.5" or "1/2" or "1"
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3])
  const frac = s.match(/^(\d+)\/(\d+)$/)
  if (frac) return Number(frac[1]) / Number(frac[2])
  const num = s.match(/^(\d+(?:\.\d+)?)$/)
  if (num) return Number(num[1])
  // Range: "1-2" → take low
  const range = s.match(/^(\d+(?:\.\d+)?)[\s]*[-–][\s]*(\d+(?:\.\d+)?)$/)
  if (range) return Number(range[1])
  return null
}

// Parse an ingredient line: return { amount, unit, name, prepNote, isOptional, originalLine, skip }
function parseIngredientLine(rawLine) {
  let line = rawLine.trim()
  // Strip leading "- " or bullet
  line = line.replace(/^[-*•]\s+/, '')
  // Strip leading orphan fractions like "/4 teaspoon salt" (parser scrap)
  line = line.replace(/^\/\d+\s+/, '')

  // Skip non-ingredient lines that slipped through
  if (!line) return { skip: true, originalLine: rawLine }
  if (/^Serves\s+\d/i.test(line) || /^Servings:/i.test(line)) return { skip: true, originalLine: rawLine }
  if (/^Yield/i.test(line) || /^Makes\s+\d/i.test(line)) return { skip: true, originalLine: rawLine }
  if (/^For garnish/i.test(line) || /^Optional garnish/i.test(line)) return { skip: true, originalLine: rawLine }
  if (/^Optional /i.test(line) && !/^Optional ingredient/i.test(line)) {
    // "Optional spinach or rocket..." — these are sometimes ingredients, sometimes notes.
    // Keep as a free-text line. Don't skip.
  }

  const isOptional = /\(optional\)|\boptional\b/i.test(line)
  if (isOptional) line = line.replace(/\s*\(optional\)|,?\s+optional\b/gi, '').trim()

  // Pull out prep note. Heuristic: split at a comma whose right-side starts with
  // a typical prep-verb / state word; otherwise keep the whole line together.
  let prepNote = null
  let main = line

  // "to taste" at end
  if (/to taste/i.test(line)) {
    const m = line.match(/^(.*?),?\s+to taste\b\s*$/i)
    if (m) { prepNote = 'to taste'; main = m[1] }
  } else {
    // Find a comma where the right side is a prep clause
    // (starts with "chopped" / "diced" / "sliced" / "grated" / "crushed" / etc.)
    const PREP_STARTERS = /\b(chopped|diced|sliced|grated|crushed|minced|finely|roughly|coarsely|thinly|thickly|cut|cubed|halved|quartered|peeled|seeded|cored|deseeded|stoned|de-seeded|de-stoned|drained|rinsed|softened|melted|cooled|warmed|heated|toasted|trimmed|deboned|skinned|whisked|beaten|whipped|broken|smashed|pounded|ground|shredded|crumbled|cut into|sliced into|cut in|cubed into|to garnish|for|optional|or to taste|or more)/i
    // Look for first comma whose right side matches a prep starter
    let pos = 0
    while (pos < line.length) {
      const cIdx = line.indexOf(',', pos)
      if (cIdx === -1) break
      const right = line.slice(cIdx + 1).trim()
      if (PREP_STARTERS.test(right)) {
        prepNote = right
        main = line.slice(0, cIdx).trim()
        break
      }
      pos = cIdx + 1
    }
  }

  // Now parse "amount unit name" from `main`
  // Special-case "salt and pepper" with no amount
  if (/^(?:kosher )?(salt and (?:freshly )?(?:ground )?(?:black )?pepper|salt and pepper|sea salt and ground black pepper)$/i.test(main)) {
    return {
      amount: null,
      unit: null,
      nameRaw: 'salt and pepper',
      prepNote: prepNote || 'to taste',
      isOptional,
      originalLine: rawLine,
    }
  }

  // Strip leading numeric tokens — supports "1 1/2", "1/2", "1.5", "1-2", "1 to 2"
  // Fraction-first so "1/4 teaspoon" doesn't eat just the "1".
  const numRe = /^(\d+\/\d+|\d+(?:\s+\d+\/\d+)?(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞])(?:\s*[-–to]+\s*\d+(?:\.\d+)?)?/u
  let amount = null
  let m = main.match(numRe)
  if (m) {
    amount = parseFraction(m[0].split(/[-–]|to/)[0].trim())
    main = main.slice(m[0].length).trim()
  } else {
    // Mixed-fraction-only ("½ ", "¼ ")
    const fr = main.match(/^([¼½¾⅓⅔⅛⅜⅝⅞])\s+/)
    if (fr) { amount = parseFraction(fr[1]); main = main.slice(fr[0].length).trim() }
  }

  // Parse unit — match longest from UNITS array
  let unit = null
  const lower = main.toLowerCase()
  for (const u of UNITS) {
    // Word-boundary match at start
    const re = new RegExp('^' + u.token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b\\.?\\s*', 'i')
    if (re.test(lower)) {
      unit = u.canon
      main = main.replace(re, '').trim()
      break
    }
  }

  // Strip "of " filler ("a pinch of salt", "1 clove of garlic")
  main = main.replace(/^of\s+/i, '').trim()

  // Strip parenthetical aside: "1 (12-oz) jar passata" — strip the size-in-parens
  main = main.replace(/^\([^)]+\)\s*/, '').trim()
  // Strip trailing parens: "olive oil (extra virgin)"
  const trailingParen = main.match(/\s*\(([^)]+)\)\s*$/)
  if (trailingParen) {
    if (prepNote) prepNote = `${prepNote}, ${trailingParen[1].trim()}`
    else prepNote = trailingParen[1].trim()
    main = main.slice(0, trailingParen.index).trim()
  }

  // Strip "size descriptors" at start: "large", "small", "medium"
  // We'll keep them as prep notes
  const sizeMatch = main.match(/^(large|small|medium|big|tiny|extra-large|jumbo)\s+/i)
  if (sizeMatch) {
    if (prepNote) prepNote = `${sizeMatch[1].toLowerCase()}, ${prepNote}`
    else prepNote = sizeMatch[1].toLowerCase()
    main = main.slice(sizeMatch[0].length).trim()
  }

  // Strip pre-noun adjectives like "boneless, skinless" — they trip lookup.
  // Pattern: leading "adjective1, adjective2 noun..."
  const PRE_ADJECTIVES = /^((?:boneless|skinless|seedless|stoneless|fat-free|low-fat|full-fat|free-range|organic|wild|farmed|cured|smoked|grass-fed|grain-fed|salted|unsalted|sweet|sour|fresh|frozen|dried|canned|tinned|whole|skimmed|semi-skimmed)(?:[,\s]+(?:boneless|skinless|seedless|stoneless|fat-free|low-fat|full-fat|free-range|organic|wild|farmed|cured|smoked|grass-fed|grain-fed|salted|unsalted|sweet|sour|fresh|frozen|dried|canned|tinned|whole|skimmed|semi-skimmed))*[,\s]+)/i
  const preMatch = main.match(PRE_ADJECTIVES)
  if (preMatch) {
    const adj = preMatch[1].replace(/[,\s]+$/, '').trim()
    if (prepNote) prepNote = `${adj}, ${prepNote}`
    else prepNote = adj
    main = main.slice(preMatch[0].length).trim()
  }

  // Strip "fresh" / "dried" at start
  // — but keep for ingredient name matching (e.g. "fresh basil" → basil)
  // Leave as part of the name first; if it fails to match, retry without prefix

  // The remaining `main` is the ingredient name.
  return {
    amount,
    unit,
    nameRaw: main,
    prepNote,
    isOptional,
    originalLine: rawLine,
  }
}

// ─── Match ingredient name to master slug ───────────────────────────────────

function lookupIngredient(rawName) {
  if (!rawName) return null
  const n = norm(rawName)
  if (!n) return null

  // Try direct exact
  if (ingByName.has(n)) return ingByName.get(n)
  // Singularised exact
  const sing = singularise(n)
  if (ingByName.has(sing)) return ingByName.get(sing)
  // Strip leading qualifiers
  const stripped = n.replace(/^(fresh |dried |ground |minced |chopped |sliced |crushed |whole |raw |cooked |frozen |canned |tinned |free range |organic |smoked |unsalted |salted )+/, '').trim()
  if (stripped !== n) {
    if (ingByName.has(stripped)) return ingByName.get(stripped)
    const ss = singularise(stripped)
    if (ingByName.has(ss)) return ingByName.get(ss)
  }
  // Try longest-prefix match by walking the words
  const tokens = stripped.split(' ').filter(Boolean)
  // From longest sub-phrase down to single word
  for (let len = tokens.length; len >= 1; len--) {
    for (let start = 0; start + len <= tokens.length; start++) {
      const phrase = tokens.slice(start, start + len).join(' ')
      if (ingByName.has(phrase)) return ingByName.get(phrase)
      const sp = singularise(phrase)
      if (ingByName.has(sp)) return ingByName.get(sp)
    }
  }
  return null
}

function lookupTool(rawName) {
  if (!rawName) return null
  const n = norm(rawName)
  if (!n) return null
  if (toolByName.has(n)) return toolByName.get(n)
  const sing = singularise(n)
  if (toolByName.has(sing)) return toolByName.get(sing)
  const tokens = n.split(' ').filter(Boolean)
  for (let len = tokens.length; len >= 1; len--) {
    for (let start = 0; start + len <= tokens.length; start++) {
      const phrase = tokens.slice(start, start + len).join(' ')
      if (toolByName.has(phrase)) return toolByName.get(phrase)
      const sp = singularise(phrase)
      if (toolByName.has(sp)) return toolByName.get(sp)
    }
  }
  return null
}

// ─── Tool detection from method text ────────────────────────────────────────

const TOOL_KEYWORDS = [
  { keyword: /\bair[- ]fryer\b/i, slug: 'air-fryer' },
  { keyword: /\bslow cooker\b|\bcrock[- ]pot\b/i, slug: 'slow-cooker' },
  { keyword: /\bpressure cooker\b|\binstant pot\b/i, slug: 'pressure-cooker' },
  { keyword: /\bfood processor\b/i, slug: 'food-processor' },
  { keyword: /\bstand mixer\b|\bkitchenaid\b/i, slug: 'stand-mixer' },
  { keyword: /\bhand mixer\b|\belectric whisk\b/i, slug: 'hand-mixer' },
  { keyword: /\bimmersion blender\b|\bhand blender\b|\bstick blender\b/i, slug: 'stick-blender' },
  { keyword: /\bblender\b/i, slug: 'blender' },
  { keyword: /\bskillet\b|\bfrying pan\b/i, slug: 'frying-pan' },
  { keyword: /\bsaute pan\b|\bsauté pan\b/i, slug: 'saute-pan' },
  { keyword: /\bdutch oven\b|\bcasserole dish\b|\bcasserole\b/i, slug: 'casserole-dish' },
  { keyword: /\bsaucepan\b/i, slug: 'small-saucepan' },
  { keyword: /\bstockpot\b|\blarge pot\b/i, slug: 'stockpot' },
  { keyword: /\bbaking sheet\b|\bbaking tray\b|\bsheet pan\b/i, slug: 'baking-sheet' },
  { keyword: /\bbaking dish\b|\bcasserole dish\b|\boven dish\b/i, slug: 'casserole-dish' },
  { keyword: /\bloaf tin\b|\bloaf pan\b/i, slug: 'loaf-tin' },
  { keyword: /\bcake tin\b|\bcake pan\b|\bsandwich tin\b|\bspringform\b/i, slug: 'cake-tin-round' },
  { keyword: /\bmuffin tin\b|\bcupcake tin\b/i, slug: 'muffin-tin' },
  { keyword: /\bmixing bowl\b/i, slug: 'mixing-bowl-medium' },
  { keyword: /\bwhisk\b/i, slug: 'whisk-balloon' },
  { keyword: /\bwooden spoon\b/i, slug: 'wooden-spoon' },
  { keyword: /\bspatula\b/i, slug: 'spatula' },
  { keyword: /\bsieve\b|\bstrainer\b/i, slug: 'sieve' },
  { keyword: /\bcolander\b/i, slug: 'colander' },
  { keyword: /\brolling pin\b/i, slug: 'rolling-pin' },
  { keyword: /\btongs\b/i, slug: 'tongs' },
  { keyword: /\bgrater\b/i, slug: 'box-grater' },
  { keyword: /\bmicroplane\b|\bzester\b/i, slug: 'microplane' },
  { keyword: /\bchopping board\b|\bcutting board\b/i, slug: 'chopping-board' },
  { keyword: /\boven\b/i, slug: 'oven' },
  { keyword: /\bhob\b|\bstovetop\b|\bstove\b/i, slug: 'hob' },
  { keyword: /\bkettle\b/i, slug: 'kettle' },
  { keyword: /\bmeat thermometer\b|\binstant[- ]read thermometer\b|\bprobe thermometer\b/i, slug: 'instant-read-thermometer' },
  { keyword: /\bpiping bag\b/i, slug: 'piping-bag' },
  { keyword: /\bring mould\b|\bdough cutter\b|\bdough cutters\b/i, slug: 'dough-scraper' },
  { keyword: /\bgriddle pan\b/i, slug: 'griddle-pan' },
]

function detectTools(methodText, ingredientText) {
  const text = (methodText + ' ' + ingredientText)
  const found = new Set()
  for (const t of TOOL_KEYWORDS) {
    if (t.keyword.test(text)) found.add(t.slug)
  }
  // Filter to slugs that actually exist in the master tools list
  const validSlugs = new Set(tools.map(t => t.slug))
  return [...found].filter(s => validSlugs.has(s))
}

// ─── Metadata derivation ────────────────────────────────────────────────────

function deriveServings(servingsLine, ingredientText) {
  if (servingsLine) {
    const m = servingsLine.match(/(\d+)(?:\s*[-–]\s*\d+)?/)
    if (m) return Number(m[1])
  }
  return null
}

function deriveTemperature(methodText) {
  // Look for Celsius first
  const cMatch = methodText.match(/(\d{2,3})\s*[°ºo]?\s*C\b/i)
  if (cMatch) return Number(cMatch[1])
  // Gas mark conversion
  const gasMatch = methodText.match(/[Gg]as (?:mark )?(\d)/)
  if (gasMatch) {
    const gas = Number(gasMatch[1])
    const gasToCelsius = { 1: 140, 2: 150, 3: 160, 4: 180, 5: 190, 6: 200, 7: 220, 8: 230, 9: 240 }
    return gasToCelsius[gas] ?? null
  }
  // Fahrenheit
  const fMatch = methodText.match(/(\d{3})\s*[°ºo]?\s*F\b/i)
  if (fMatch) {
    const f = Number(fMatch[1])
    return Math.round((f - 32) * 5 / 9 / 5) * 5  // round to nearest 5°C
  }
  return null
}

function deriveTimes(methodText) {
  // Parse minute / hour values from the method
  let prepMin = 0
  let cookMin = 0
  // simple: look for "cook for X mins", "bake for X mins", "fry for X mins" etc
  const cookMatches = methodText.matchAll(/(?:cook|bake|simmer|boil|fry|roast|broil|grill|sauté|saute|reduce)\s+(?:for|over)?\s*(\d+)\s*[-–]?\s*(?:to\s*\d+)?\s*(min|mins|minutes|hours|hour|hrs|hr|h)\b/gi)
  for (const m of cookMatches) {
    const n = Number(m[1])
    const u = m[2].toLowerCase()
    if (u.startsWith('h')) cookMin += n * 60
    else cookMin += n
  }
  // Hours-only patterns: "for 2 hours", "8 hours" (slow-cooker)
  const hrMatches = methodText.matchAll(/\bfor\s+(\d+)\s*[-–]?\s*\d*\s*hours?\b/gi)
  for (const m of hrMatches) cookMin += Number(m[1]) * 60

  // Cap cookMin to avoid wild over-counts (multiple "5 mins" steps summed)
  // Heuristic: take the maximum step time as the dominant time, not the sum,
  // since steps overlap or are intermediate (e.g., "boil for 5 min" inside a
  // longer recipe). For accuracy: use the longest single time we saw.
  let maxStep = 0
  for (const m of methodText.matchAll(/(\d+)\s*[-–]?\s*\d*\s*(min|mins|minutes|hours|hour|hrs|hr|h)\b/gi)) {
    const n = Number(m[1])
    const u = m[2].toLowerCase()
    const mins = u.startsWith('h') ? n * 60 : n
    if (mins > maxStep) maxStep = mins
  }
  cookMin = maxStep || cookMin || null

  prepMin = 10 // conservative default for a home recipe
  return { prepMinutes: prepMin, cookMinutes: cookMin }
}

// Cuisine classifier — keyword vote
const CUISINE_KEYWORDS = {
  italian: ['pasta', 'risotto', 'lasagn', 'spaghetti', 'tagliatelle', 'linguine', 'penne', 'parmesan', 'mozzarella', 'pesto', 'carbonara', 'bolognese', 'bolognaise', 'arborio', 'pancetta', 'parma ham', 'ricotta', 'mascarpone', 'gnocchi', 'gorgonzola'],
  french: ['bourguignon', 'au vin', 'à la', 'gratin', 'béchamel', 'crepes', 'baguette', 'cassoulet', 'ratatouille', 'pissaladière', 'pâté'],
  indian: ['curry', 'tikka', 'korma', 'biryani', 'masala', 'naan', 'tandoori', 'paneer', 'dahl', 'dal', 'garam masala', 'cumin', 'turmeric'],
  chinese: ['stir fry', 'stir-fry', 'soy sauce', 'sesame', 'wok', 'wonton', 'dim sum', 'chinese', 'broccoli and beef', 'beef and broccoli', 'ginger', 'gyoza'],
  japanese: ['teriyaki', 'yakitori', 'miso', 'soba', 'udon', 'sushi', 'tempura', 'sashimi', 'edamame', 'katsu'],
  thai: ['thai', 'tom yum', 'pad thai', 'lemongrass', 'galangal', 'fish sauce', 'coconut milk'],
  mexican: ['quesadilla', 'tortilla', 'guacamole', 'salsa', 'fajita', 'taco', 'enchilada', 'mexican', 'jalapeño', 'cilantro'],
  american: ['cornbread', 'sloppy joe', 'pulled pork', 'bbq', 'buffalo', 'cobb salad', 'caesar', 'pancakes', 'waffles', 'mac and cheese', 'meatloaf', 'cherry cola', 'graham', 'pumpkin pie'],
  british: ['shepherd\'s', 'cottage pie', 'roast', 'sunday roast', 'beef and ale', 'fish pie', 'ploughman', 'fish and chips', 'cornish', 'welsh', 'scotch', 'pud', 'sticky toffee', 'banoffee', 'crumble'],
  mediterranean: ['feta', 'olive', 'tahini', 'hummus', 'tzatziki', 'pita', 'falafel', 'shawarma', 'kofta', 'tabbouleh'],
  korean: ['korean', 'gochujang', 'kimchi', 'bulgogi'],
}

function deriveCuisine(titleAndMethod) {
  const lower = titleAndMethod.toLowerCase()
  const scores = {}
  for (const [cuisine, keywords] of Object.entries(CUISINE_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      if (lower.includes(kw)) score++
    }
    if (score > 0) scores[cuisine] = score
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  if (sorted.length === 0) return null
  return sorted[0][0]
}

// MealType derivation
function deriveMealType(sectionContext, titleAndMethod) {
  const s = (sectionContext || '').toUpperCase()
  if (s === 'BREAKFASTS' || s === 'SMOOTHIES') return 'breakfast'
  if (s === 'LUNCHES') return 'lunch'
  if (s === 'DINNERS') return 'dinner'
  if (s === 'SIDES') return 'side'
  if (s === 'DESSERTS') return 'dessert'
  if (s === 'BAKING + TREATS') return 'snack'
  if (s === 'DRINKS') return 'drink'
  if (s === 'BREAD') return 'side'
  // fallback by title keywords
  const t = titleAndMethod.toLowerCase()
  if (/\bpancakes?|waffles?|porridge|oats|overnight oats|granola|french toast|smoothie\b/i.test(t)) return 'breakfast'
  if (/\bsalad|sandwich|wrap|soup\b/i.test(t)) return 'lunch'
  if (/\bcake|cookie|brownie|truffle|fudge|biscuit|scone|tart\b/i.test(t)) return 'dessert'
  return 'dinner'
}

// Mood derivation
function deriveMood(titleAndMethod, sectionContext) {
  const t = titleAndMethod.toLowerCase()
  const mood = new Set()
  if (/\bweeknight|weekday|quick|easy|10 min|15 min|20 min|30 min\b/.test(t)) mood.add('weeknight')
  if (/\bcomfort|stew|hot pot|pie|gratin|cobbler|cottage pie|roast|risotto|mac.{0,3}cheese|cheesy\b/.test(t)) mood.add('comfortFood')
  if (/\bslow.cooker|slow.cook|braise/.test(t)) mood.add('comfortFood')
  if (/\bkid|family|easy weekn|child\b/.test(t)) mood.add('kidFriendly')
  if (/\bfreezer|freeze|make.ahead/.test(t)) mood.add('freezerFriendly')
  if (/\bhealthy|clean eating|protein|low.cal|low.fat/.test(t)) mood.add('healthy')
  if (/\bparty|christmas|easter|birthday|celebration\b/.test(t)) mood.add('party')
  if (/\bbatch|bulk|big.batch/.test(t)) mood.add('batchCook')
  if (/\bsunday|sunday roast\b/.test(t)) mood.add('comfortFood')
  if (sectionContext === 'BREAKFASTS' || sectionContext === 'SMOOTHIES') mood.add('weeknight')
  // Default: if it's a slow cooker, add comfortFood
  if (/\bslow cooker\b/i.test(t)) {
    mood.add('comfortFood')
    mood.add('batchCook')
  }
  return [...mood]
}

// Freezable / batchable
function deriveFreezable(methodText, ingredientText) {
  const t = methodText + ' ' + ingredientText
  if (/\bfreeze|freezer|frozen until\b/i.test(t)) return true
  return false
}

function deriveBatchable(methodText, sectionContext) {
  if (/\bslow cooker\b/i.test(methodText)) return true
  if (/\bbulk|batch|make ahead|meal prep|serves 6|serves 8|serves 10\b/i.test(methodText)) return true
  return false
}

// Dietary flags — conservative: only flag the obvious ones
function deriveDietaryFlags(ingredientLines, title) {
  // We do not set vegetarian/vegan/glutenFree/dairyFree here — the schema
  // AND-derives them from RecipeIngredient.ingredient.dietaryFlags at index time
  // per the migration. So we leave this empty; the index pass picks it up.
  // Only set author-level overrides like "halal" / "kosher" — which we don't
  // know here without explicit info.
  return []
}

// ─── Slug normaliser ────────────────────────────────────────────────────────

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/['']/g, '')
    .replace(/\bnot dairy free\b|\bnot dairy-free\b/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

// ─── Excerpt builder ────────────────────────────────────────────────────────

function buildExcerpt(title, ingredients, methodLines, servingsLine, cuisine, mealType) {
  // Build a card-friendly summary: title + servings + a short pull from the
  // method (preferring a sentence that describes the dish, not "Preheat the
  // oven"). Falls back to a generic line.
  let pull = ''
  for (const line of methodLines) {
    // Skip oven-preheat / pan-heat boilerplate
    if (/^(Preheat|Heat (the|a) (oven|pan|skillet|frying pan|hob)|Line a|Cover and|Spray|Grease|Bring (to|water))/i.test(line)) continue
    pull = line.split('. ')[0]
    break
  }
  if (!pull) pull = methodLines[0]?.split('. ')[0] ?? ''
  if (pull.length > 180) pull = pull.slice(0, 178).replace(/\s+\S*$/, '') + '…'

  let servingsText = ''
  if (servingsLine) {
    const m = servingsLine.match(/(\d+)/)
    if (m) servingsText = ` Serves ${m[1]}.`
  }

  const cuisineLabel = cuisine && cuisine !== 'british' ? `${cuisine.charAt(0).toUpperCase()}${cuisine.slice(1)} ` : ''
  const cleanPull = pull.replace(/\.\s*$/, '')
  return `${cuisineLabel}${mealType ?? 'recipe'} from Rebecca's collection.${servingsText}${cleanPull ? ' ' + cleanPull + '.' : ''}`
}

// ─── Dedupe recipes ─────────────────────────────────────────────────────────

const byKey = new Map()
function dedupeKey(title) {
  return title.toLowerCase()
    .normalize('NFKD')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\bnot dairy free\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
// Prefer master version when title appears in both (master is the comprehensive source)
const masterFirst = [...parsed].sort((a, b) => {
  if (a.source === b.source) return 0
  if (a.source === 'master') return -1
  return 1
})
for (const r of masterFirst) {
  const k = dedupeKey(r.titleLine)
  if (!byKey.has(k)) byKey.set(k, r)
}

const unique = [...byKey.values()]
console.log(`Unique recipes after dedupe: ${unique.length} (from ${parsed.length} pre-dedupe)`)

// ─── Build briefs ───────────────────────────────────────────────────────────

const briefs = []
const mappingReport = []

for (const r of unique) {
  const allIngLines = r.ingredientGroups.flatMap(g => g.lines)
  const ingredientText = allIngLines.join('\n')
  const methodText = r.methodLines.join('\n')
  const titleAndMethod = `${r.titleLine}\n${ingredientText}\n${methodText}`

  // Parse + map ingredients
  const ingredientsListItems = []
  const ingredientMappingNotes = []
  const unmappedIngredients = []

  for (const group of r.ingredientGroups) {
    const groupLabel = group.groupLabel
    for (const line of group.lines) {
      const parsed = parseIngredientLine(line)
      if (parsed.skip) continue
      const mapped = lookupIngredient(parsed.nameRaw)
      if (mapped) {
        // Build the ingredients-list row
        const row = {
          ingredientSlug: mapped.slug,
          amount: parsed.amount,
          unit: parsed.unit ?? mapped.defaultUnit,
          prepNote: parsed.prepNote,
          isOptional: parsed.isOptional,
          groupLabel: groupLabel,
        }
        ingredientsListItems.push(row)
      } else {
        // Unmapped — keep as free-text in the body
        ingredientsListItems.push({
          ingredientSlug: null,
          freeText: parsed.originalLine,
          amount: parsed.amount,
          unit: parsed.unit,
          prepNote: parsed.prepNote,
          isOptional: parsed.isOptional,
          groupLabel: groupLabel,
        })
        unmappedIngredients.push({ line: parsed.originalLine, name: parsed.nameRaw })
      }
    }
  }

  // Detect tools
  const toolSlugs = detectTools(methodText, ingredientText)

  // Derive metadata
  const servings = deriveServings(r.servingsLine, ingredientText)
  const temperatureCelsius = deriveTemperature(methodText)
  const times = deriveTimes(methodText)
  const cuisine = deriveCuisine(titleAndMethod) ?? 'british'
  const mealType = deriveMealType(r.sectionContext, r.titleLine)
  const mood = deriveMood(titleAndMethod, r.sectionContext)
  const freezable = deriveFreezable(methodText, ingredientText)
  const batchable = deriveBatchable(methodText, r.sectionContext)
  const dietaryFlags = deriveDietaryFlags(allIngLines, r.titleLine)
  const slug = slugify(r.titleLine)
  if (!slug) continue

  // Excerpt
  const excerpt = buildExcerpt(r.titleLine, allIngLines, r.methodLines, r.servingsLine, cuisine, mealType)

  // TipTap body construction — preserve Rebecca's prose
  const bodyContent = []

  // No intro paragraph — preserve her plain shape. Method goes straight after
  // the ingredient block.
  // Heading
  bodyContent.push({
    type: 'heading',
    attrs: { level: 2 },
    content: [{ type: 'text', text: 'What you need' }],
  })

  // IngredientsList block — only with mapped slugs
  const mappedItems = ingredientsListItems
    .filter(i => i.ingredientSlug)
    .map(i => ({
      ingredientSlug: i.ingredientSlug,
      amount: i.amount,
      unit: i.unit,
      prepNote: i.prepNote,
      isOptional: i.isOptional,
      groupLabel: i.groupLabel,
    }))

  if (mappedItems.length > 0) {
    bodyContent.push({
      type: 'ingredientsList',
      attrs: {
        defaultServings: servings ?? 4,
        items: mappedItems,
      },
    })
  }

  // Unmapped ingredients go in a free-text suppliesCard so they don't get lost.
  // — Actually use a bulleted list under "Other ingredients" heading.
  const unmappedRows = ingredientsListItems.filter(i => !i.ingredientSlug)
  if (unmappedRows.length > 0) {
    bodyContent.push({
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Also' }],
    })
    bodyContent.push({
      type: 'bulletList',
      content: unmappedRows.map(i => ({
        type: 'listItem',
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: i.freeText }],
        }],
      })),
    })
  }

  // Method heading
  bodyContent.push({
    type: 'heading',
    attrs: { level: 2 },
    content: [{ type: 'text', text: 'Method' }],
  })

  // Method as ordered list (each line = one step)
  // If the line is very long (paragraph-y), keep it as one item; otherwise simple.
  if (r.methodLines.length > 0) {
    bodyContent.push({
      type: 'orderedList',
      content: r.methodLines.map(line => ({
        type: 'listItem',
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: line }],
        }],
      })),
    })
  }

  // Trailing "Where this dish lives" / sources block — skipped per the rule
  // (don't invent provenance she didn't cite).

  const totalMin = (times.prepMinutes || 0) + (times.cookMinutes || 0)
  const brief = {
    slug,
    title: r.titleLine,
    subtitle: null,
    excerpt,
    type: 'RECIPE',
    categorySlug: 'cooking',
    subCategorySlug: null,
    difficulty: 'BEGINNER',
    season: 'YEAR_ROUND',
    sourceType: 'CREATOR',
    sourceNotes: "Rebecca's kitchen — a personal favourite from her collection.",
    recipe: {
      servings: servings ?? null,
      yieldDescription: null,
      prepMinutes: times.prepMinutes ?? null,
      cookMinutes: times.cookMinutes ?? null,
      restingMinutes: null,
      chillingMinutes: null,
      totalMinutes: totalMin > 0 ? totalMin : null,
      scalable: true,
      freezable,
      freezeNotes: null,
      batchable,
      batchNotes: null,
      makeAheadNotes: null,
      dietaryFlags,
      cuisine,
      mealType,
      mood,
      temperatureCelsius,
      temperatureNote: null,
      foundational: false,
    },
    recipeTools: toolSlugs.map(s => ({ slug: s, isOptional: false })),
    glossaryTerms: [],
    body: { type: 'doc', content: bodyContent },
  }

  briefs.push(brief)
  mappingReport.push({
    slug,
    title: r.titleLine,
    source: r.source,
    section: r.sectionContext,
    mappedCount: mappedItems.length,
    unmappedCount: unmappedRows.length,
    unmappedIngredients,
    toolsDetected: toolSlugs,
    cuisine,
    mealType,
    servings,
    temperatureCelsius,
    prepMinutes: times.prepMinutes,
    cookMinutes: times.cookMinutes,
  })

  // Write per-recipe brief
  writeFileSync(`${BRIEFS_DIR}/${slug}.json`, JSON.stringify(brief, null, 2))
}

writeFileSync(`${BRIEFS_DIR}/_mapping-report.json`, JSON.stringify(mappingReport, null, 2))
console.log(`Wrote ${briefs.length} briefs + _mapping-report.json`)
console.log(`Tool detection unique slugs: ${[...new Set(mappingReport.flatMap(m => m.toolsDetected))].length}`)
const totalUnmapped = mappingReport.reduce((s, m) => s + m.unmappedCount, 0)
console.log(`Total unmapped ingredient lines: ${totalUnmapped}`)
console.log(`Recipes with 0 mapped ingredients: ${mappingReport.filter(m => m.mappedCount === 0).length}`)
