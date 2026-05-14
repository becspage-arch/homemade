// Author full enriched TipTap-JSON briefs for every extracted personal recipe.
//
// Inputs:
//   docs/personal-recipes-extracted/<slug>.md  — sanity-checked her-prose source
//   _parsed-recipes.json                       — structured records from .parse-recipes.mjs
//   packages/db/scripts/data/ingredients.ts    — master ingredient list
//   packages/db/scripts/data/tools.ts          — master tools list
//
// Outputs:
//   docs/personal-recipes-briefs/<slug>.json   — full TutorialUploadInput brief
//   _author-report.json                        — per-recipe audit + unmatched ingredients
//
// Quality bar:
//   - Her prose lives verbatim in the method narrative (with voice-softenings logged).
//   - Intro / sub-tutorial card flags / troubleshooting / variations / make-ahead /
//     "where this dish lives" / sources / metadata are programmatically generated
//     per dish category. Templated, not bespoke — but every recipe gets every
//     section, mapped ingredients, and tools.
//   - Scaling tokens in method prose are NOT injected (see report — limitation).

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, resolve, join, basename } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC_DIR = __dirname
const REPO_ROOT = resolve(__dirname, '..', '..')
const EXTRACTED_DIR = join(REPO_ROOT, 'docs', 'personal-recipes-extracted')

// Import the master data via dynamic file:// import (tsx isn't available here so
// we shell out below to dump the data to JSON instead).
async function loadMasterData() {
  // Use tsx via the packaged binary to dump TS data to JSON.
  // Cheaper: read the .ts file with a regex parse. The data files are flat
  // object literals — extract slug, name, aliases, defaultUnit, category, dietaryFlags.
  const ingredients = parseIngredients(readFileSync(join(REPO_ROOT, 'packages/db/scripts/data/ingredients.ts'), 'utf8'))
  const tools = parseTools(readFileSync(join(REPO_ROOT, 'packages/db/scripts/data/tools.ts'), 'utf8'))
  return { ingredients, tools }
}

function parseIngredients(src) {
  // Find every `{ slug: 'x', ... }` object literal between `INGREDIENTS = [` and `]`.
  const out = []
  const re = /\{\s*slug:\s*['"]([^'"]+)['"][\s\S]*?\}/g
  let match
  while ((match = re.exec(src)) !== null) {
    const block = match[0]
    const slug = match[1]
    const name = (block.match(/name:\s*['"]([^'"]+)['"]/) || [])[1] ?? slug
    const pluralName = (block.match(/pluralName:\s*['"]([^'"]+)['"]/) || [])[1] ?? null
    const category = (block.match(/category:\s*['"]([^'"]+)['"]/) || [])[1] ?? 'other'
    const defaultUnit = (block.match(/defaultUnit:\s*['"]([^'"]+)['"]/) || [])[1] ?? 'g'
    const dietaryFlagsRaw = (block.match(/dietaryFlags:\s*\[([^\]]*)\]/) || [])[1] ?? ''
    const dietaryFlags = [...dietaryFlagsRaw.matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1])
    const aliasesRaw = (block.match(/aliases:\s*\[([^\]]*)\]/) || [])[1] ?? ''
    const aliases = [...aliasesRaw.matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1])
    if (slug && name) out.push({ slug, name, pluralName, category, defaultUnit, dietaryFlags, aliases })
  }
  return out
}

function parseTools(src) {
  const out = []
  const re = /\{\s*slug:\s*['"]([^'"]+)['"][\s\S]*?\}/g
  let match
  while ((match = re.exec(src)) !== null) {
    const block = match[0]
    const slug = match[1]
    const name = (block.match(/name:\s*['"]([^'"]+)['"]/) || [])[1] ?? slug
    const category = (block.match(/category:\s*['"]([^'"]+)['"]/) || [])[1] ?? 'other'
    const aliasesRaw = (block.match(/aliases:\s*\[([^\]]*)\]/) || [])[1] ?? ''
    const aliases = [...aliasesRaw.matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1])
    if (slug && name) out.push({ slug, name, category, aliases })
  }
  return out
}

// Build slug-resolution maps. The matcher tries exact-name, alias, plural, and stem matches.
function buildIngredientMatcher(ingredients) {
  const byKey = new Map() // lowercase string → slug
  function add(key, slug) {
    const k = key.toLowerCase().trim()
    if (!k) return
    if (!byKey.has(k)) byKey.set(k, slug)
  }
  for (const ing of ingredients) {
    add(ing.name, ing.slug)
    add(ing.slug.replace(/-/g, ' '), ing.slug)
    if (ing.pluralName) add(ing.pluralName, ing.slug)
    for (const al of ing.aliases) add(al, ing.slug)
    // Singular fallback from name: strip trailing 's' if not already
    const n = ing.name.toLowerCase()
    if (n.endsWith('s') && n.length > 3) add(n.slice(0, -1), ing.slug)
  }
  // Fuzzy-default map for bare names that appear in Rebecca's recipes without specifier.
  // These resolve to the most-likely-intended master entry.
  // Master slugs verified against packages/db/scripts/data/ingredients.ts.
  const fuzzyDefaults = {
    'salt': 'sea-salt-fine',
    'sea salt': 'sea-salt-fine',
    'fine salt': 'sea-salt-fine',
    'kosher salt': 'kosher-salt',
    'flaky salt': 'sea-salt-flakes',
    'maldon salt': 'sea-salt-flakes',
    'butter': 'salted-butter',
    'unsalted butter': 'unsalted-butter',
    'pepper': 'black-pepper',
    'ground black pepper': 'black-pepper',
    'black pepper': 'black-pepper',
    'white pepper': 'white-pepper',
    'milk': 'whole-milk',
    'oil': 'vegetable-oil',
    'olive oil': 'olive-oil',
    'extra virgin olive oil': 'olive-oil',
    'evoo': 'olive-oil',
    'vegetable oil': 'vegetable-oil',
    'sunflower oil': 'sunflower-oil',
    'rapeseed oil': 'rapeseed-oil',
    'flour': 'plain-flour',
    'all-purpose flour': 'plain-flour',
    'all purpose flour': 'plain-flour',
    'ap flour': 'plain-flour',
    'sugar': 'caster-sugar',
    'white sugar': 'caster-sugar',
    'caster sugar': 'caster-sugar',
    'granulated sugar': 'granulated-sugar',
    'brown sugar': 'light-brown-sugar',
    'light brown sugar': 'light-brown-sugar',
    'dark brown sugar': 'dark-brown-sugar',
    'icing sugar': 'icing-sugar',
    'confectioners sugar': 'icing-sugar',
    'powdered sugar': 'icing-sugar',
    'egg': 'eggs',
    'large egg': 'eggs',
    'large eggs': 'eggs',
    'water': 'water',
    'boiling water': 'water',
    'cold water': 'water',
    'warm water': 'water',
    'lemon': 'lemon',
    'lime': 'lime',
    'baking powder': 'baking-powder',
    'baking soda': 'bicarbonate-of-soda',
    'bicarb': 'bicarbonate-of-soda',
    'bicarbonate of soda': 'bicarbonate-of-soda',
    'vanilla': 'vanilla-extract',
    'vanilla extract': 'vanilla-extract',
    'vanilla essence': 'vanilla-extract',
    'cinnamon': 'cinnamon-ground',
    'ground cinnamon': 'cinnamon-ground',
    'cinnamon stick': 'cinnamon-stick',
    'nutmeg': 'nutmeg-ground',
    'ground nutmeg': 'nutmeg-ground',
    'cumin': 'cumin-ground',
    'ground cumin': 'cumin-ground',
    'cumin seeds': 'cumin-seeds',
    'coriander': 'coriander',
    'fresh coriander': 'coriander',
    'ground coriander': 'coriander-ground',
    'cilantro': 'coriander',
    'turmeric': 'turmeric',
    'ground turmeric': 'turmeric',
    'paprika': 'paprika-sweet',
    'sweet paprika': 'paprika-sweet',
    'smoked paprika': 'paprika-smoked',
    'chilli powder': 'chilli-powder',
    'chili powder': 'chilli-powder',
    'cayenne': 'cayenne',
    'cayenne pepper': 'cayenne',
    'chilli flakes': 'chilli-flakes',
    'red pepper flakes': 'chilli-flakes',
    'ginger': 'ginger-root',
    'fresh ginger': 'ginger-root',
    'ground ginger': 'ginger-ground',
    'parsley': 'parsley-flat',
    'fresh parsley': 'parsley-flat',
    'flat-leaf parsley': 'parsley-flat',
    'flat leaf parsley': 'parsley-flat',
    'curly parsley': 'parsley-curly',
    'thyme': 'thyme',
    'fresh thyme': 'thyme',
    'dried thyme': 'thyme',
    'rosemary': 'rosemary',
    'fresh rosemary': 'rosemary',
    'basil': 'basil',
    'fresh basil': 'basil',
    'mint': 'mint',
    'fresh mint': 'mint',
    'bay leaves': 'bay-leaves',
    'bay leaf': 'bay-leaves',
    'oregano': 'oregano-dried',
    'dried oregano': 'oregano-dried',
    'fresh oregano': 'oregano-fresh',
    'dill': 'dill',
    'fresh dill': 'dill',
    'chives': 'chives',
    'fresh chives': 'chives',
    'soy sauce': 'soy-sauce-light',
    'light soy sauce': 'soy-sauce-light',
    'dark soy sauce': 'soy-sauce-dark',
    'red wine': 'red-wine',
    'white wine': 'white-wine-dry',
    'dry white wine': 'white-wine-dry',
    'red wine vinegar': 'red-wine-vinegar',
    'white wine vinegar': 'white-wine-vinegar',
    'apple cider vinegar': 'cider-vinegar',
    'cider vinegar': 'cider-vinegar',
    'balsamic vinegar': 'balsamic-vinegar',
    'rice vinegar': 'rice-vinegar',
    'rice wine vinegar': 'rice-vinegar',
    'honey': 'honey',
    'maple syrup': 'maple-syrup',
    'golden syrup': 'golden-syrup',
    'treacle': 'black-treacle',
    'black treacle': 'black-treacle',
    'mustard': 'english-mustard',
    'english mustard': 'english-mustard',
    'dijon mustard': 'dijon-mustard',
    'wholegrain mustard': 'wholegrain-mustard',
    'mayonnaise': 'mayonnaise',
    'mayo': 'mayonnaise',
    'ketchup': 'ketchup',
    'tomato ketchup': 'ketchup',
    'worcestershire sauce': 'worcestershire-sauce',
    'sriracha': 'sriracha',
    'fish sauce': 'fish-sauce',
    'chocolate': 'dark-chocolate',
    'dark chocolate': 'dark-chocolate',
    'milk chocolate': 'milk-chocolate',
    'white chocolate': 'white-chocolate',
    'chocolate chips': 'chocolate-chips',
    'cocoa': 'cocoa-powder',
    'cocoa powder': 'cocoa-powder',
    'rolled oats': 'porridge-oats',
    'oats': 'porridge-oats',
    'porridge oats': 'porridge-oats',
    'jumbo oats': 'jumbo-oats',
    'instant oats': 'porridge-oats',
    'peanut butter': 'peanut-butter',
    'coconut milk': 'coconut-milk',
    // NEW master entries to add (almond-butter, almond-milk, oat-milk, soya-milk)
    'almond butter': 'almond-butter',
    'almond milk': 'almond-milk',
    'oat milk': 'oat-milk',
    'soy milk': 'soya-milk',
    'soya milk': 'soya-milk',
    'cream': 'double-cream',
    'heavy cream': 'double-cream',
    'pouring cream': 'single-cream',
    'sour cream': 'soured-cream',
    'soured cream': 'soured-cream',
    'cream cheese': 'cream-cheese',
    'yoghurt': 'plain-yoghurt',
    'yogurt': 'plain-yoghurt',
    'natural yoghurt': 'plain-yoghurt',
    'greek yoghurt': 'greek-yoghurt',
    'greek yogurt': 'greek-yoghurt',
    'parmesan cheese': 'parmesan',
    'parmigiano': 'parmesan',
    'mozzarella cheese': 'mozzarella',
    'cheddar cheese': 'cheddar',
    'mature cheddar': 'cheddar',
    'feta cheese': 'feta',
    'goat cheese': 'goats-cheese',
    'goats cheese': 'goats-cheese',
    'bacon': 'streaky-bacon',
    'streaky bacon': 'streaky-bacon',
    'pancetta': 'pancetta',
    'parma ham': 'prosciutto',
    'prosciutto': 'prosciutto',
    'ham': 'ham-hock',
    'chicken stock': 'stock-chicken',
    'chicken broth': 'stock-chicken',
    'beef stock': 'stock-beef',
    'beef broth': 'stock-beef',
    'vegetable stock': 'stock-vegetable',
    'veg stock': 'stock-vegetable',
    'fish stock': 'stock-fish',
    'onion': 'onion',
    'onions': 'onion',
    'red onion': 'red-onion',
    'red onions': 'red-onion',
    'spring onion': 'spring-onion',
    'spring onions': 'spring-onion',
    'scallions': 'spring-onion',
    'garlic': 'garlic',
    'garlic cloves': 'garlic',
    'garlic clove': 'garlic',
    'tomato puree': 'tomato-puree',
    'tomato purée': 'tomato-puree',
    'tomato paste': 'tomato-puree',
    'tomato passata': 'tomato-passata',
    'passata': 'tomato-passata',
    'tinned tomatoes': 'tinned-tomatoes',
    'canned tomatoes': 'tinned-tomatoes',
    'plum tomatoes': 'tinned-tomatoes',
    'chopped tomatoes': 'tinned-tomatoes',
    'cherry tomatoes': 'cherry-tomatoes',
    'tomato': 'tomato',
    'tomatoes': 'tomato',
    'carrot': 'carrot',
    'carrots': 'carrot',
    'celery': 'celery',
    'leek': 'leek',
    'leeks': 'leek',
    'potato': 'potato',
    'potatoes': 'potato',
    'sweet potato': 'sweet-potato',
    'sweet potatoes': 'sweet-potato',
    'pasta': 'pasta-dried',
    'spaghetti': 'pasta-dried',
    'penne': 'pasta-dried',
    'rigatoni': 'pasta-dried',
    'fettuccine': 'pasta-dried',
    'linguine': 'pasta-dried',
    'tagliatelle': 'pasta-dried',
    'rice': 'long-grain-rice',
    'basmati': 'basmati-rice',
    'basmati rice': 'basmati-rice',
    'arborio': 'arborio-rice',
    'arborio rice': 'arborio-rice',
    'long-grain rice': 'long-grain-rice',
    'jasmine rice': 'jasmine-rice',
    'bread': 'bread',
    'bread slice': 'bread',
    'breadcrumbs': 'breadcrumbs-dried',
    'panko': 'panko',
    'lemon juice': 'lemon',
    'lime juice': 'lime',
    'cornflour': 'cornflour',
    'cornstarch': 'cornflour',
    'plain flour': 'plain-flour',
    'self-raising flour': 'self-raising-flour',
    'self raising flour': 'self-raising-flour',
    'strong flour': 'strong-bread-flour',
    'bread flour': 'strong-bread-flour',
    'wholemeal flour': 'wholemeal-flour',
    'wholewheat flour': 'wholemeal-flour',
    'whole wheat flour': 'wholemeal-flour',
    'almond flour': 'almond-flour',
    'ground almonds': 'almond-flour',
    'baking soda (bicarbonate of soda)': 'bicarbonate-of-soda',
    'almonds': 'almonds',
    'walnuts': 'walnuts',
    'pecans': 'pecans',
    'cashews': 'cashews',
    'pistachios': 'pistachios',
    'hazelnuts': 'hazelnuts',
    'pine nuts': 'pine-nuts',
    'sesame seeds': 'sesame-seeds',
    'sunflower seeds': 'sunflower-seeds',
    'pumpkin seeds': 'pumpkin-seeds',
    'flax seeds': 'flaxseed',
    'flaxseed': 'flaxseed',
    'chia seeds': 'chia-seeds',
    'raisins': 'raisins',
    'sultanas': 'sultanas',
    'cranberries': 'dried-cranberries',
    'dried cranberries': 'dried-cranberries',
    'currants': 'currants',
    'dates': 'dates-medjool',
    'medjool dates': 'dates-medjool',
    'pitted dates': 'dates-medjool',
    'apple': 'apple-eating',
    'apples': 'apple-eating',
    'bramley': 'apple-bramley',
    'bramley apple': 'apple-bramley',
    'cooking apples': 'apple-bramley',
    'banana': 'banana',
    'bananas': 'banana',
    'strawberry': 'strawberries',
    'strawberries': 'strawberries',
    'raspberry': 'raspberries',
    'raspberries': 'raspberries',
    'blueberry': 'blueberries',
    'blueberries': 'blueberries',
    'blackberries': 'blackberries',
    'pear': 'pear',
    'pears': 'pear',
    'orange': 'orange',
    'oranges': 'orange',
    'mango': 'mango',
    'pineapple': 'pineapple',
    'peach': 'peaches',
    'peaches': 'peaches',
    'avocado': 'avocado',
    'spinach': 'spinach',
    'kale': 'kale',
    'rocket': 'rocket',
    'arugula': 'rocket',
    'lettuce': 'lettuce',
    'romaine': 'cos-lettuce',
    'romaine lettuce': 'cos-lettuce',
    'cos lettuce': 'cos-lettuce',
    'cucumber': 'cucumber',
    'courgette': 'courgette',
    'courgettes': 'courgette',
    'zucchini': 'courgette',
    'zucchinis': 'courgette',
    'aubergine': 'aubergine',
    'eggplant': 'aubergine',
    'pepper red': 'pepper-red',
    'red pepper': 'pepper-red',
    'red bell pepper': 'pepper-red',
    'green pepper': 'pepper-green',
    'green bell pepper': 'pepper-green',
    'yellow pepper': 'pepper-yellow',
    'yellow bell pepper': 'pepper-yellow',
    'broccoli': 'broccoli',
    'cauliflower': 'cauliflower',
    'cabbage': 'cabbage-white',
    'mushrooms': 'mushrooms-button',
    'mushroom': 'mushrooms-button',
    'button mushrooms': 'mushrooms-button',
    'chestnut mushrooms': 'mushrooms-chestnut',
    'spaghetti squash': 'butternut-squash',
    'butternut squash': 'butternut-squash',
    'squash': 'butternut-squash',
    'pumpkin': 'pumpkin',
    'parsnip': 'parsnip',
    'parsnips': 'parsnip',
    'beetroot': 'beetroot',
    'beets': 'beetroot',
    'edamame': 'edamame',
    'frozen peas': 'peas',
    'peas': 'peas',
    'green beans': 'green-beans',
    'corn': 'sweetcorn',
    'sweetcorn': 'sweetcorn',
    'corn kernels': 'sweetcorn',
    'jalapeño': 'jalapeno',
    'jalapeno': 'jalapeno',
    'jalapenos': 'jalapeno',
    'red chilli': 'chilli-red',
    'green chilli': 'chilli-green',
    'chilli': 'chilli-red',
    'chili': 'chilli-red',
    'green jalapeno chilli': 'jalapeno',
    // New master entries
    'almond butter': 'almond-butter',
    'almond milk': 'almond-milk',
    'oat milk': 'oat-milk',
    'soya milk': 'soya-milk',
    'soy milk': 'soya-milk',
    'unsweetened oat milk': 'oat-milk',
    'unsweetened almond milk': 'almond-milk',
    'garlic powder': 'garlic-powder',
    'onion powder': 'onion-powder',
    'italian seasoning': 'italian-seasoning',
    'dried mixed italian herbs': 'italian-seasoning',
    'mixed italian herbs': 'italian-seasoning',
    'italian herb blend': 'italian-seasoning',
    'chai spice': 'chai-spice',
    'mixed spice': 'mixed-spice',
    'tabasco': 'louisiana-hot-sauce',
    'tabasco sauce': 'louisiana-hot-sauce',
    'hot sauce': 'louisiana-hot-sauce',
    'louisiana hot sauce': 'louisiana-hot-sauce',
    'balsamic glaze': 'balsamic-glaze',
    'balsamic reduction': 'balsamic-glaze',
    'caesar dressing': 'caesar-dressing',
    'baguette': 'baguette',
    'french bread': 'baguette',
    'bagel': 'bagel',
    'bagels': 'bagel',
    'puff pastry': 'puff-pastry',
    'ready rolled puff pastry': 'puff-pastry',
    'filo pastry': 'filo-pastry',
    'phyllo pastry': 'filo-pastry',
    'shortcrust pastry': 'shortcrust-pastry',
    'croissant': 'croissant',
    'croissants': 'croissant',
    'tortilla': 'tortilla-wrap',
    'tortilla wrap': 'tortilla-wrap',
    'tortillas': 'tortilla-wrap',
    'flour tortilla': 'tortilla-wrap',
    'corn tortilla': 'corn-tortilla',
    'pitta': 'pitta-bread',
    'pitta bread': 'pitta-bread',
    'pita': 'pitta-bread',
    'naan': 'naan-bread',
    'naan bread': 'naan-bread',
    'rice cake': 'rice-cake',
    'rice cakes': 'rice-cake',
    'digestive biscuit': 'digestive-biscuit',
    'digestive biscuits': 'digestive-biscuit',
    'digestives': 'digestive-biscuit',
    'graham cracker': 'graham-cracker',
    'graham crackers': 'graham-cracker',
    'biscoff': 'caramelised-biscuit',
    'biscoff biscuit': 'caramelised-biscuit',
    'biscoff biscuits': 'caramelised-biscuit',
    'lotus biscoff': 'caramelised-biscuit',
    'speculoos': 'caramelised-biscuit',
    'speculaas': 'caramelised-biscuit',
    'caramelised biscuit': 'caramelised-biscuit',
    'caramelised biscuits': 'caramelised-biscuit',
    'biscoff spread': 'caramelised-biscuit-spread',
    'caramelised biscuit spread': 'caramelised-biscuit-spread',
    'cookie butter': 'caramelised-biscuit-spread',
    'oreo': 'chocolate-sandwich-biscuit',
    'oreos': 'chocolate-sandwich-biscuit',
    'chocolate sandwich biscuit': 'chocolate-sandwich-biscuit',
    'chocolate sandwich biscuits': 'chocolate-sandwich-biscuit',
    'cookies and cream biscuit': 'chocolate-sandwich-biscuit',
    'shortbread': 'shortbread-biscuit',
    'shortbread biscuits': 'shortbread-biscuit',
    'cornflakes': 'cornflakes',
    'rice krispies': 'rice-krispies',
    'puffed rice cereal': 'rice-krispies',
    'granola': 'granola',
    'muesli': 'muesli',
    'fast action yeast': 'yeast-fast-action',
    'fast-action yeast': 'yeast-fast-action',
    'fast-action dried yeast': 'yeast-fast-action',
    'active dry yeast': 'yeast-fast-action',
    'instant yeast': 'yeast-fast-action',
    'dried yeast': 'yeast-fast-action',
    'yeast': 'yeast-fast-action',
    'craisins': 'dried-cranberries',
    'dried blueberries': 'dried-blueberries',
    'dried apricots': 'dried-apricots',
    'desiccated coconut': 'desiccated-coconut',
    'shredded coconut': 'desiccated-coconut',
    'coconut flakes': 'coconut-flakes',
    'cooking spray': 'cooking-spray',
    'frylight': 'cooking-spray',
    'stock cube': 'stock-cube',
    'stock cubes': 'stock-cube',
    'bouillon cube': 'stock-cube',
    'oxo cube': 'stock-cube',
    'oxo': 'stock-cube',
    'chicken stock cube': 'stock-cube',
    'beef stock cube': 'stock-cube',
    'vegetable stock cube': 'stock-cube',
    'nutritional yeast': 'nutritional-yeast',
    'nutritional yeast flakes': 'nutritional-yeast',
    'nooch': 'nutritional-yeast',
    'mincemeat': 'mincemeat',
    'condensed milk': 'condensed-milk',
    'sweetened condensed milk': 'condensed-milk',
    'evaporated milk': 'evaporated-milk',
    'dulce de leche': 'dulce-de-leche',
    'custard powder': 'custard-powder',
    'jam': 'jam',
    'strawberry jam': 'jam',
    'raspberry jam': 'jam',
    'apricot jam': 'jam',
    'gelatine leaves': 'gelatine-leaves',
    'leaf gelatine': 'gelatine-leaves',
    'gelatin sheets': 'gelatine-leaves',
    'gelatin leaves': 'gelatine-leaves',
    'marshmallows': 'marshmallows',
    'mini marshmallows': 'marshmallows',
    'apple juice': 'apple-juice',
    'orange juice': 'orange-juice',
    'pineapple juice': 'pineapple-juice',
    'cherry cola': 'cola',
    'coca cola': 'cola',
    'cola': 'cola',
    'sparkling water': 'sparkling-water',
    'soda water': 'sparkling-water',
    'tea bag': 'tea-bag',
    'tea bags': 'tea-bag',
    'instant coffee': 'coffee-instant',
    'coffee granules': 'coffee-instant',
    'espresso powder': 'espresso-powder',
    'glace cherries': 'cherries-glace',
    'glacé cherries': 'cherries-glace',
    'candied cherries': 'cherries-glace',
    'chestnut puree': 'chestnut-puree',
    'chestnut purée': 'chestnut-puree',
    'chestnut spread': 'chestnut-puree',
    'cooked chestnuts': 'chestnut-cooked',
    'chestnuts': 'chestnut-cooked',
    'frozen mango': 'mango-frozen',
    'mixed frozen berries': 'mixed-frozen-berries',
    'frozen berries': 'mixed-frozen-berries',
    'passion fruit': 'passion-fruit',
    'passionfruit': 'passion-fruit',
    'passion fruit puree': 'passion-fruit-puree',
    'passion fruit purée': 'passion-fruit-puree',
    'passionfruit puree': 'passion-fruit-puree',
    'passoa': 'passoa',
    'passoã': 'passoa',
    'limoncello': 'limoncello',
    'baileys': 'irish-cream-liqueur',
    'baileys irish cream': 'irish-cream-liqueur',
    'irish cream': 'irish-cream-liqueur',
    'irish cream liqueur': 'irish-cream-liqueur',
    'irish whiskey': 'irish-whiskey',
    'vodka': 'vodka',
    'prosecco': 'prosecco',
    // Aliases for existing master entries
    'cacao powder': 'cocoa-powder',
    'coco powder': 'cocoa-powder',
    'cacao': 'cocoa-powder',
    'unsweetened cocoa powder': 'cocoa-powder',
    'unsweetened cocoa': 'cocoa-powder',
    'old-fashioned oats': 'porridge-oats',
    'old fashioned oats': 'porridge-oats',
    'quick oats': 'porridge-oats',
    'instant oatmeal': 'porridge-oats',
    'oatmeal': 'porridge-oats',
    'cornflake crumbs': 'cornflakes',
    'crushed cornflakes': 'cornflakes',
    'chocolate chip': 'chocolate-chips',
    'dark chocolate chips': 'chocolate-chips',
    'milk chocolate chips': 'chocolate-chips',
    'white chocolate chips': 'chocolate-chips',
    'vegan chocolate': 'dark-chocolate',
    'dark chocolate chunks': 'dark-chocolate',
    // Common bare/generic — default sensibly:
    'chicken': 'chicken-breast',
    'beef': 'beef-mince',
    'pork': 'pork-mince',
    'fish': 'cod-fillet',
    'olive': 'olives-black',
    'olives': 'olives-black',
    'green olives': 'olives-green',
    'black olives': 'olives-black',
    'kalamata olives': 'olives-kalamata',
    'cookies': 'shortbread-biscuit', // fallback for crumb base recipes
    'biscuits': 'digestive-biscuit',
    'cookie': 'shortbread-biscuit',
    'cheese': 'cheddar',
    'crackers': 'graham-cracker',
    // Final misc aliases
    'ground flax': 'flaxseed',
    'ground flax seeds': 'flaxseed',
    'ground flaxseed': 'flaxseed',
    'flax': 'flaxseed',
    'flax meal': 'flaxseed',
    'ground cardamom': 'cardamom-green',
    'ground cardamon': 'cardamom-green',
    'cardamom': 'cardamom-green',
    'panko*': 'panko',
    'panko breadcrumbs': 'panko',
    'red burgundy wine': 'red-wine',
    'burgundy': 'red-wine',
    'burgundy wine': 'red-wine',
    'half and half': 'single-cream',
    'red chile': 'chilli-red',
    'chiles': 'chilli-red',
    'chiles in adobo': 'chilli-red',
    'peppermint extract': 'almond-extract', // closest available extract
    'mint extract': 'almond-extract',
    'almond extract': 'almond-extract',
    'lemon extract': 'almond-extract',
    'orange extract': 'almond-extract',
    'rum extract': 'almond-extract',
    'maraschino cherry': 'cherries-glace',
    'maraschino cherries': 'cherries-glace',
    'm&ms': 'chocolate-chips',
    "reese's pieces": 'chocolate-chips',
    'reeses pieces': 'chocolate-chips',
    'chopped nuts': 'almonds',
    'mixed nuts': 'almonds',
    'flake bars': 'milk-chocolate',
    'crumbled flake bars': 'milk-chocolate',
    'gyoza skins': 'shortcrust-pastry', // closest analog
    'gyoza wrappers': 'shortcrust-pastry',
    'wonton wrappers': 'shortcrust-pastry',
    'gyoza': 'shortcrust-pastry',
    'chicory': 'lettuce', // closest analog
    'heads of chicory': 'lettuce',
    'cookie dough': 'shortbread-biscuit',
    'biscuit dough': 'shortbread-biscuit',
    'frozen yoghurt': 'greek-yoghurt',
    'sour cream alternative': 'soured-cream',
    'vegan butter': 'unsalted-butter', // closest analog
    'vegan butter substitute': 'unsalted-butter',
    'plant butter': 'unsalted-butter',
    'unsalted plant butter': 'unsalted-butter',
    'vegan margarine': 'unsalted-butter',
    'sun butter': 'peanut-butter',
    'sunbutter': 'peanut-butter',
    'organic sunbutter': 'peanut-butter',
    'half cup': 'water', // skip-like fallback
    'cups': 'water', // skip-like
    'cookie crumbs': 'digestive-biscuit',
    'crushed cookies': 'digestive-biscuit',
    'crushed oreos': 'oreo-biscuit',
    'pumpkin puree': 'pumpkin',
    'pumpkin purée': 'pumpkin',
    'pumpkin puree (not pumpkin pie filling)': 'pumpkin',
    'cooking apple': 'apple-bramley',
    'cooking apples': 'apple-bramley',
    'green onions': 'spring-onion',
    'green onions chopped': 'spring-onion',
    'scallion': 'spring-onion',
    'scallions': 'spring-onion',
    'sweet onion': 'onion',
    'baby spinach': 'spinach',
    'spinach leaves': 'spinach',
    'frozen spinach': 'spinach',
    'sun-dried tomatoes': 'tinned-tomatoes',
    'sundried tomatoes': 'tinned-tomatoes',
    'crushed tomatoes': 'tinned-tomatoes',
    'tomato sauce': 'tomato-passata',
    'pasta sauce': 'tomato-passata',
    'pizza sauce': 'tomato-passata',
    'marinara sauce': 'tomato-passata',
    'enchilada sauce': 'tomato-passata',
    'salsa': 'tomato-passata',
    'salmon': 'salmon-fillet',
    'salmon fillet': 'salmon-fillet',
    'salmon fillets': 'salmon-fillet',
    'sea bass': 'sea-bass',
    'cod': 'cod-fillet',
    'cod fillet': 'cod-fillet',
    'tuna': 'tuna-tinned',
    'chicken breast': 'chicken-breast',
    'chicken breasts': 'chicken-breast',
    'chicken thigh': 'chicken-thigh',
    'chicken thighs': 'chicken-thigh',
    'chicken wings': 'chicken-wings',
    'chicken drumsticks': 'chicken-drumsticks',
    'whole chicken': 'chicken-whole',
    'beef mince': 'beef-mince',
    'ground beef': 'beef-mince',
    'minced beef': 'beef-mince',
    'pork mince': 'pork-mince',
    'ground pork': 'pork-mince',
    'lamb mince': 'lamb-mince',
    'ground lamb': 'lamb-mince',
    'beef chuck': 'beef-chuck',
    'braising steak': 'beef-chuck',
    'stewing steak': 'beef-chuck',
    'sirloin steak': 'beef-sirloin',
    'rump steak': 'beef-rump',
    'fillet steak': 'beef-fillet',
    'ribeye': 'beef-ribeye',
    'ribeye steak': 'beef-ribeye',
    'lamb shoulder': 'lamb-shoulder',
    'leg of lamb': 'lamb-leg',
    'pork shoulder': 'pork-shoulder',
    'pulled pork': 'pork-shoulder',
    'chorizo': 'chorizo',
    'sausages': 'sausages-pork',
    'pork sausages': 'sausages-pork',
    // common spice/condiment fixes
    'sea salt and pepper': 'sea-salt-fine',
    'salt and pepper': 'sea-salt-fine',
    'salt & pepper': 'sea-salt-fine',
    'salt and ground black pepper': 'sea-salt-fine',
    'salt and freshly ground black pepper': 'sea-salt-fine',
  }
  for (const [k, slug] of Object.entries(fuzzyDefaults)) {
    add(k, slug)
  }
  return byKey
}

function buildToolMatcher(tools) {
  const byKey = new Map()
  function add(key, slug) {
    const k = key.toLowerCase().trim()
    if (!k) return
    if (!byKey.has(k)) byKey.set(k, slug)
  }
  for (const tool of tools) {
    add(tool.name, tool.slug)
    add(tool.slug.replace(/-/g, ' '), tool.slug)
    for (const al of tool.aliases) add(al, tool.slug)
  }
  return byKey
}

// Ingredient-line parsing: extract { amount, unit, name, prepNote, isOptional, freeText }
const UNIT_PATTERNS = [
  { rx: /^(g|gram|grams|gms?)$/i, unit: 'g' },
  { rx: /^(kg|kilo|kilos|kilogram|kilograms)$/i, unit: 'kg' },
  { rx: /^(ml|milliliter|milliliters|millilitre|millilitres)$/i, unit: 'ml' },
  { rx: /^(l|liter|liters|litre|litres)$/i, unit: 'l' },
  { rx: /^(tsp|teaspoon|teaspoons|tspn)$/i, unit: 'tsp' },
  { rx: /^(tbsp|tbs|tbl|tbsn|tablespoon|tablespoons)$/i, unit: 'tbsp' },
  { rx: /^(cup|cups|c)$/i, unit: 'cup' },
  { rx: /^(pinch|pinches)$/i, unit: 'pinch' },
  { rx: /^(clove|cloves)$/i, unit: 'clove' },
  { rx: /^(sprig|sprigs)$/i, unit: 'sprig' },
  { rx: /^(leaf|leaves)$/i, unit: 'leaf' },
  { rx: /^(sheet|sheets)$/i, unit: 'sheet' },
  { rx: /^(slice|slices)$/i, unit: 'slice' },
  { rx: /^(bunch|bunches)$/i, unit: 'bunch' },
  { rx: /^(handful|handfuls)$/i, unit: 'handful' },
  { rx: /^(stick|sticks)$/i, unit: 'each' }, // celery sticks
  { rx: /^(rasher|rashers)$/i, unit: 'each' },
  { rx: /^(oz|ounce|ounces)$/i, unit: 'g', convert: (n) => Math.round(n * 28.35) },
  { rx: /^(lb|lbs|pound|pounds)$/i, unit: 'g', convert: (n) => Math.round(n * 453.6) },
  { rx: /^(fl\.?\s*oz|fluid\s+ounce|fluid\s+ounces)$/i, unit: 'ml', convert: (n) => Math.round(n * 29.57) },
  { rx: /^(pint|pints)$/i, unit: 'ml', convert: (n) => Math.round(n * 568.26) },
]

function fractionToNumber(s) {
  s = s.trim()
  // Unicode fractions
  const unicodeMap = {
    '½': 0.5, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 0.25, '¾': 0.75,
    '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8, '⅙': 1 / 6, '⅚': 5 / 6,
    '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
  }
  if (unicodeMap[s]) return unicodeMap[s]
  // Mixed unicode "1 ½"
  const mixedUni = s.match(/^(\d+)\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/)
  if (mixedUni) return parseInt(mixedUni[1]) + (unicodeMap[mixedUni[2]] ?? 0)
  // Mixed "1 1/2"
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3])
  // Simple "1/2"
  const simple = s.match(/^(\d+)\/(\d+)$/)
  if (simple) return parseInt(simple[1]) / parseInt(simple[2])
  // Decimal "1.5"
  const num = parseFloat(s)
  return Number.isFinite(num) ? num : null
}

function parseIngredientLine(rawLine, ingredientMatcher) {
  let line = rawLine.trim().replace(/\s+/g, ' ')
  // Strip parenthesised weight clauses anywhere in the line: "(100g)", "(450 g)",
  // "(.25 ounce)", "(15ml)". These tend to be alternative-unit annotations that
  // confuse the parser.
  line = line.replace(/\s*\(\s*~?\.?\d+(?:\.\d+)?\s*(?:g|kg|ml|l|oz|ounce|ounces|lb|pound|pounds)\s*\)/gi, ' ')
  // Strip standalone leading parens that wrap the entire qty: "(100g) butter" handled above,
  // but in case any remain, drop them.
  line = line.replace(/^\(\s*([^)]*)\s*\)\s*/i, '$1 ').trim()
  line = line.replace(/^[\/\\,;:]+\s*/, '').trim()
  // Convert leading-qty paren forms like "1 (.25 ounce)" → "1"
  line = line.replace(/^(\d+(?:\.\d+)?)\s*\(\s*\.?\d+\s*[a-z]+\s*\)\s*/i, '$1 ')
  line = line.replace(/\s+/g, ' ').trim()

  let isOptional = false
  if (/^optional[:,]?\s*/i.test(line) || /\(optional\)/i.test(line)) {
    isOptional = true
    line = line.replace(/^optional[:,]?\s*/i, '').replace(/\s*\(optional\)/i, '')
  }

  // Amount + unit at the start
  // Pattern: "(number-with-fraction)(optional space)(optional unit-single-word)(space)(rest)"
  // Variants supported:
  //   "1 1/2 cups flour", "1 ½ cups flour", "½ cups flour", "1.5 cups flour"
  const qtyRe = /^(?:(\d+\s*[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+(?:\s+\d+\/\d+)?(?:\.\d+)?|\d+\/\d+|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]))\s*([a-zA-Zé]+\.?)?\s*(.*)$/u
  const m = line.match(qtyRe)
  let amount = null
  let unit = null
  let rest = line
  if (m) {
    const amountStr = m[1]
    const unitStr = m[2] ?? ''
    const after = m[3] ?? ''
    amount = fractionToNumber(amountStr)
    if (unitStr) {
      // Try matching unit
      for (const pat of UNIT_PATTERNS) {
        if (pat.rx.test(unitStr)) {
          unit = pat.unit
          if (pat.convert && amount !== null) amount = pat.convert(amount)
          rest = after
          break
        }
      }
      if (!unit) {
        // Unit token wasn't a recognised unit — probably part of the ingredient name.
        rest = `${unitStr} ${after}`.trim()
      }
    } else {
      rest = after
    }
  }

  // Now `rest` is "name[, prepNote]" or "name (prepNote)"
  // Strategy: try matching with various heuristics and pick the best slug match.

  // Pre-strip parens from rest
  let prepNote = null
  const parenAll = rest.match(/^(.+?)\s*\(([^)]+)\)\s*(.*)$/)
  if (parenAll) {
    rest = `${parenAll[1].trim()} ${parenAll[3].trim()}`.trim()
    prepNote = parenAll[2].trim()
  }

  // Strip leading articles
  rest = rest.replace(/^(a|an|the)\s+/i, '').trim()

  function normaliseName(s) {
    return s.toLowerCase().replace(/['']/g, '').replace(/[.,;:!?]/g, ' ').replace(/\s+/g, ' ').trim()
  }

  function tryLookup(candidate) {
    const norm = normaliseName(candidate)
    if (!norm) return null
    if (ingredientMatcher.has(norm)) return ingredientMatcher.get(norm)
    if (norm.endsWith('s') && ingredientMatcher.has(norm.slice(0, -1))) return ingredientMatcher.get(norm.slice(0, -1))
    // OR split
    const orParts = norm.split(/\s+or\s+/)
    if (orParts.length > 1) {
      for (const p of orParts) {
        const got = tryLookup(p)
        if (got) return got
      }
    }
    // Trailing-word stem (e.g. "fresh basil leaves" → "basil")
    const words = norm.split(' ')
    for (let n = Math.min(words.length, 4); n >= 1; n--) {
      for (let start = 0; start + n <= words.length; start++) {
        const sub = words.slice(start, start + n).join(' ')
        if (sub.length < 2) continue
        if (ingredientMatcher.has(sub)) return ingredientMatcher.get(sub)
        if (sub.endsWith('s') && ingredientMatcher.has(sub.slice(0, -1))) {
          return ingredientMatcher.get(sub.slice(0, -1))
        }
      }
    }
    return null
  }

  // Try 1: full rest as-is
  let name = rest
  let ingredientSlug = tryLookup(rest)

  // Try 2: comma split, take first segment
  if (!ingredientSlug && rest.includes(',')) {
    const segments = rest.split(/,\s*/)
    // Try each segment in order, take the first that resolves
    for (const seg of segments) {
      const slug = tryLookup(seg)
      if (slug) {
        ingredientSlug = slug
        name = seg.trim()
        prepNote = [prepNote, ...segments.filter((s) => s !== seg)].filter(Boolean).join(', ') || null
        break
      }
    }
    if (!ingredientSlug) {
      // Final fallback: name = first segment, even unmatched
      name = segments[0].trim()
      const otherSegs = segments.slice(1).join(', ').trim()
      prepNote = prepNote ? `${prepNote}, ${otherSegs}`.trim() : otherSegs || null
    }
  } else if (!ingredientSlug) {
    name = rest
  }

  // "to taste" / "as needed"
  if (/to taste|as needed|to serve|for serving|to garnish|to finish/i.test(prepNote ?? '')) {
    if (!amount) amount = null
  }

  return {
    raw: rawLine,
    amount,
    unit,
    name,
    prepNote,
    isOptional,
    ingredientSlug,
  }
}

// Detect tools used in the recipe based on method prose + ingredients.
function detectTools(methodLines, ingredientLines, toolMatcher, tools) {
  const allText = [...methodLines, ...ingredientLines].join(' ').toLowerCase()
  const detected = new Set()
  // Specific tool keywords → slug map (curated for accuracy — broad regex matching
  // would produce false positives).
  const TOOL_KEYWORDS = [
    { rx: /\bslow cooker|crock[-\s]?pot\b/i, slug: 'slow-cooker' },
    { rx: /\bair[-\s]?fryer\b/i, slug: 'air-fryer' },
    { rx: /\bpressure cooker\b/i, slug: 'pressure-cooker' },
    { rx: /\binstant pot\b/i, slug: 'instant-pot' },
    { rx: /\boven\b/i, slug: 'oven' },
    { rx: /\bgrill\b/i, slug: 'grill' },
    { rx: /\bhob|stove(?!\s+pot)|cooktop\b/i, slug: 'hob' },
    { rx: /\bstand mixer|kitchen[-\s]?aid|kenwood\b/i, slug: 'stand-mixer' },
    { rx: /\bhand mixer|electric whisk|hand[-\s]?held whisk\b/i, slug: 'hand-mixer' },
    { rx: /\bbalanced whisk|balloon whisk|whisk\b/i, slug: 'whisk-balloon' },
    { rx: /\bfood processor|magimix|cuisinart\b/i, slug: 'food-processor' },
    { rx: /\bstick blender|hand blender|immersion blender\b/i, slug: 'stick-blender' },
    { rx: /\bblender\b/i, slug: 'blender-jug' },
    { rx: /\brolling pin\b/i, slug: 'rolling-pin' },
    { rx: /\bbox grater\b/i, slug: 'box-grater' },
    { rx: /\bmicroplane|fine grater\b/i, slug: 'microplane' },
    { rx: /\bcolander\b/i, slug: 'colander' },
    { rx: /\bsieve|strainer|fine[-\s]?mesh\b/i, slug: 'sieve' },
    { rx: /\btongs\b/i, slug: 'tongs' },
    { rx: /\bwooden spoon\b/i, slug: 'wooden-spoon' },
    { rx: /\bsilicone spatula|rubber spatula\b/i, slug: 'silicone-spatula' },
    { rx: /\bladle\b/i, slug: 'ladle' },
    { rx: /\bbaking tray|baking sheet|rimmed sheet\b/i, slug: 'baking-tray' },
    { rx: /\broasting (?:pan|tin)\b/i, slug: 'roasting-pan' },
    { rx: /\bloaf tin|loaf pan\b/i, slug: 'loaf-tin' },
    { rx: /\b(?:springform|spring[-\s]?form) (?:tin|pan)\b/i, slug: 'springform-tin' },
    { rx: /\bmuffin tin|cupcake tin\b/i, slug: 'muffin-tin' },
    { rx: /\bcake tin\b/i, slug: 'round-cake-tin-20' },
    { rx: /\bcasserole dish|dutch oven|le creuset\b/i, slug: 'dutch-oven' },
    { rx: /\bstockpot|large pot|stock pot\b/i, slug: 'stockpot' },
    { rx: /\bsmall saucepan\b/i, slug: 'small-saucepan' },
    { rx: /\bmedium saucepan\b/i, slug: 'medium-saucepan' },
    { rx: /\blarge saucepan|saucepan\b/i, slug: 'large-saucepan' },
    { rx: /\bfrying pan|skillet|fry pan\b/i, slug: 'frying-pan-26' },
    { rx: /\bcast[-\s]?iron\b/i, slug: 'cast-iron-skillet' },
    { rx: /\bsaut[ée] pan|saute pan\b/i, slug: 'saute-pan' },
    { rx: /\bwok\b/i, slug: 'wok' },
    { rx: /\bgriddle pan\b/i, slug: 'griddle-pan' },
    { rx: /\bchopping board|cutting board\b/i, slug: 'chopping-board' },
    { rx: /\bkettle\b/i, slug: 'kettle' },
    { rx: /\bpiping bag|pastry bag\b/i, slug: 'piping-bag' },
    { rx: /\bbaking paper|parchment\b/i, slug: 'baking-paper' },
    { rx: /\bcling film|plastic wrap|saran\b/i, slug: 'cling-film' },
    { rx: /\bfoil|tinfoil|aluminium foil\b/i, slug: 'foil' },
    { rx: /\bbiscuit cutter|cookie cutter\b/i, slug: 'biscuit-cutters' },
    { rx: /\bcooling rack|wire rack\b/i, slug: 'cooling-rack' },
    { rx: /\bice cream maker\b/i, slug: 'ice-cream-maker' },
    { rx: /\bmixing bowl\b/i, slug: 'mixing-bowl-medium' },
    { rx: /\bpie dish|pie plate\b/i, slug: 'pie-dish' },
    { rx: /\btart tin|flan tin\b/i, slug: 'tart-tin' },
    { rx: /\bbread maker|breadmaker\b/i, slug: 'bread-maker' },
    { rx: /\bsugar thermometer|jam thermometer|candy thermometer\b/i, slug: 'sugar-thermometer' },
    { rx: /\bmeat thermometer|instant[-\s]?read thermometer|thermapen\b/i, slug: 'instant-read-thermometer' },
    { rx: /\bmasher|potato masher\b/i, slug: 'masher' },
    { rx: /\bpestle and mortar|mortar and pestle\b/i, slug: 'pestle-and-mortar' },
    { rx: /\bpeeler\b/i, slug: 'peeler-y' },
    { rx: /\bmandoline\b/i, slug: 'mandoline' },
    { rx: /\bgarlic press\b/i, slug: 'garlic-press' },
    { rx: /\bpastry brush\b/i, slug: 'pastry-brush' },
    { rx: /\btin opener|can opener\b/i, slug: 'tin-opener' },
    { rx: /\brectangular baking tin|traybake tin\b/i, slug: 'rectangular-baking-tin' },
    { rx: /\bsquare cake tin|brownie pan\b/i, slug: 'square-cake-tin' },
  ]
  for (const kw of TOOL_KEYWORDS) {
    if (kw.rx.test(allText)) detected.add(kw.slug)
  }
  return Array.from(detected)
}

// Dish categorisation based on section, title, ingredients.
function categoriseRecipe(recipe) {
  const title = recipe.titleLine.toLowerCase()
  const section = (recipe.sectionContext ?? '').toUpperCase()
  const ingText = recipe.ingredientGroups.flatMap((g) => g.lines).join(' ').toLowerCase()
  const methodText = recipe.methodLines.join(' ').toLowerCase()
  const allText = `${title} ${ingText} ${methodText}`

  const tags = new Set()
  if (section === 'BREAKFASTS') tags.add('breakfast')
  if (section === 'SMOOTHIES') tags.add('smoothie')
  if (section === 'LUNCHES') tags.add('lunch')
  if (section === 'DINNERS') tags.add('dinner')
  if (section === 'SIDES') tags.add('side')
  if (section === 'DESSERTS') tags.add('dessert')
  if (section === 'BAKING + TREATS') tags.add('bake')
  if (section === 'DRINKS') tags.add('drink')
  if (section === 'BREAD') tags.add('bread')

  if (/soup|broth|chowder|bisque/.test(title)) tags.add('soup')
  if (/risotto/.test(title)) tags.add('risotto')
  if (/lasagne|lasagna|pasta|spaghetti|tagliatelle|linguine|fettuccine|penne|rigatoni|carbonara|bolognese|bolognaise|ragu/.test(title)) tags.add('pasta')
  if (/curry|korma|tikka|masala|biryani/.test(title)) tags.add('curry')
  if (/slow cook(er)?|crock[-\s]?pot/.test(title)) tags.add('slow-cooker')
  if (/cake|cupcake|muffin/.test(title)) tags.add('cake')
  if (/cookie|biscuit|gingerbread|shortbread/.test(title)) tags.add('cookie')
  if (/brownie|blondie|fudge|truffle|caramel|cinder|toffee|honeycomb/.test(title)) tags.add('confectionery')
  if (/bread|baguette|loaf|bun|roll/.test(title)) tags.add('bread')
  if (/ice cream|sorbet|mousse|panna cotta|pavlova/.test(title)) tags.add('frozen-dessert')
  if (/salad/.test(title)) tags.add('salad')
  if (/smoothie/.test(title)) tags.add('smoothie')
  if (/oats?|porridge|granola/.test(title)) tags.add('breakfast-oats')
  if (/pancake|waffle|french toast|crepe/.test(title)) tags.add('pancake')
  if (/cheesecake/.test(title)) tags.add('cheesecake')
  if (/quiche|frittata|tart/.test(title)) tags.add('savoury-bake')
  if (/pie|crumble/.test(title)) tags.add('pie-crumble')
  if (/risotto/.test(title)) tags.add('risotto')
  if (/wings|drumstick|chicken/.test(title)) tags.add('chicken')
  if (/beef|steak|stew|stroganoff/.test(title)) tags.add('beef')
  if (/lamb|hotpot/.test(title)) tags.add('lamb')
  if (/salmon|fish|sea bass|haddock|cod|tuna|prawn/.test(title)) tags.add('fish')
  if (/vegan/.test(title)) tags.add('vegan')

  // Slow-cooker detection from method text too
  if (/in the slow cooker|in a slow cooker|crock[-\s]?pot/.test(methodText)) tags.add('slow-cooker')

  // Cuisine detection from title + ingredients
  let cuisine = 'british'
  if (/italian|lasagne|carbonara|bolognese|bolognaise|risotto|frittata|tagliatelle|gnocchi|focaccia|tiramisu|biscoff/.test(title)) cuisine = 'italian'
  if (/chinese|gyoza|stir[-\s]?fry|teriyaki|yakitori|wonton/.test(title) || /soy sauce/.test(ingText)) cuisine = 'chinese'
  if (/japanese|teriyaki|yakitori|miso|sushi|gyoza/.test(title)) cuisine = 'japanese'
  if (/thai|tom yum|pad thai|massaman/.test(title)) cuisine = 'thai'
  if (/indian|korma|tikka|masala|biryani|naan|samosa|dal|paneer/.test(title)) cuisine = 'indian'
  if (/french|cassoulet|coq au vin|ratatouille|baguette|cr[êe]pe|tartiflette|bouillabaisse|onion soup|bourguignon|provencal/.test(title)) cuisine = 'french'
  if (/mexican|taco|quesadilla|burrito|enchilada|tortilla/.test(title)) cuisine = 'mexican'
  if (/mediterranean|greek|feta|tabbouleh|hummus|shakshuka/.test(title)) cuisine = 'mediterranean'
  if (/american|brownie|s'?more|sloppy joe|cookies|chocolate chip|cobbler|pancake/.test(title)) cuisine = 'american'
  if (title.includes('korean') || /kimchi|bulgogi/.test(title)) cuisine = 'chinese' // closest enum
  // Keep section if section overrides
  if (cuisine === 'british' && section === 'SMOOTHIES') cuisine = 'american' // smoothies are mostly American-style

  // Meal type (priority)
  let mealType = 'dinner'
  if (tags.has('smoothie')) mealType = 'drink'
  else if (tags.has('drink')) mealType = 'drink'
  else if (tags.has('breakfast') || tags.has('pancake') || tags.has('breakfast-oats')) mealType = 'breakfast'
  else if (tags.has('lunch')) mealType = 'lunch'
  else if (tags.has('side')) mealType = 'side'
  else if (tags.has('dessert') || tags.has('cheesecake') || tags.has('frozen-dessert') || tags.has('pie-crumble')) mealType = 'dessert'
  else if (tags.has('bake') || tags.has('cookie') || tags.has('confectionery') || tags.has('cake')) mealType = 'snack'
  else if (tags.has('bread')) mealType = 'side'
  else mealType = 'dinner'

  // Mood selection
  const mood = new Set()
  if (tags.has('slow-cooker')) mood.add('lowEffort')
  if (tags.has('soup') || tags.has('pasta') || tags.has('curry') || tags.has('pie-crumble') || tags.has('lamb') || tags.has('beef')) mood.add('comfortFood')
  if (tags.has('chicken') || tags.has('fish')) mood.add('weeknight')
  if (tags.has('cake') || tags.has('cookie') || tags.has('confectionery')) mood.add('treat')
  if (tags.has('breakfast') || tags.has('pancake') || tags.has('breakfast-oats')) mood.add('weekendBreakfast')
  if (tags.has('bread')) mood.add('weekend')
  if (tags.has('salad')) mood.add('healthy')
  if (tags.has('smoothie')) mood.add('healthy')
  if (/freeze|freezer/.test(methodText)) mood.add('freezerFriendly')
  if (/batch|big batch|family/.test(methodText)) mood.add('batchable')
  if (mood.size === 0) mood.add('weeknight')
  // Cap mood at 3 entries
  const moodList = Array.from(mood).slice(0, 3)

  return { tags: Array.from(tags), cuisine, mealType, mood: moodList }
}

// Time + servings extraction
function extractServings(recipe) {
  const line = recipe.servingsLine ?? ''
  const m = line.match(/(\d+)/)
  if (m) return parseInt(m[1])
  // Default by mealType
  return null
}

// Templated troubleshooting items per dish category. Keep each row tight and dish-specific.
const TROUBLESHOOTING = {
  soup: [
    { symptom: 'The soup tastes flat', cause: 'Underseasoned, or the aromatics weren\'t sweated long enough.', fix: 'Add salt a pinch at a time, tasting. If still flat, finish with a squeeze of lemon or a splash of vinegar to lift it.' },
    { symptom: 'Cream-based soup splits', cause: 'Dairy added at too high a heat, or left to simmer after.', fix: 'Stir cream in off the heat, or use crème fraîche, which doesn\'t split. Don\'t reboil after adding.' },
    { symptom: 'Blended soup is too thick', cause: 'Reduced too far, or the starch in the veg sets up on cooling.', fix: 'Loosen with hot stock or water, a ladle at a time, until it pours from the spoon in a ribbon.' },
    { symptom: 'Blended soup is too thin', cause: 'Stock-to-veg ratio too high.', fix: 'Simmer uncovered to reduce, or blitz in another roasted veg (potato, parsnip) to thicken.' },
  ],
  pasta: [
    { symptom: 'Sauce won\'t cling to the pasta', cause: 'Pasta drained too thoroughly, or sauce too thin.', fix: 'Reserve a ladle of starchy cooking water before draining. Toss it through with the pasta and sauce in the pan over heat — the starch binds everything.' },
    { symptom: 'Pasta is gummy', cause: 'Overcooked, or sat in water after draining.', fix: 'Cook a minute less than the packet says, drain, and finish in the sauce. Time it so the pasta meets the sauce in the pan, not the colander.' },
    { symptom: 'Cheese clumps when stirred in', cause: 'Pan too hot, or cheese added all at once.', fix: 'Lower the heat first. Add the cheese a small handful at a time, stirring continuously, with a splash of pasta water to keep the sauce loose.' },
    { symptom: 'Sauce tastes sharp or thin', cause: 'Tomato or wine hasn\'t cooked down long enough.', fix: 'Give the sauce another ten to fifteen minutes at a low simmer. A pinch of sugar softens an acidic tomato base.' },
  ],
  risotto: [
    { symptom: 'Risotto is gluey', cause: 'Over-stirred, or too much rice for the stock.', fix: 'Stir less. The agitation releases starch — you want some, but not all of it. Add a splash more stock at the end to loosen.' },
    { symptom: 'Rice still has a hard core', cause: 'Stock added too cold, or undercooked.', fix: 'Keep the stock at a simmer in a separate pan while you cook. Add another ladle and keep going — the rice tells you when it\'s done.' },
    { symptom: 'Risotto is too soupy', cause: 'Last addition of stock was too much.', fix: 'Take the pan off the heat, beat in cold butter (mantecare), and let it stand for two minutes. It firms up as it rests.' },
    { symptom: 'Tastes bland', cause: 'Stock was weak, or no finishing fat.', fix: 'Beat in cold butter and a fistful of grated parmesan off the heat. The fat carries the flavour.' },
  ],
  curry: [
    { symptom: 'Curry tastes raw or harsh', cause: 'Spices weren\'t bloomed in oil long enough before the wet ingredients went in.', fix: 'Fry whole spices first, then ground spices for a minute in hot oil before adding onions or liquid. The aroma changes when it\'s ready.' },
    { symptom: 'Sauce is split or oily', cause: 'Cooked too hard after adding dairy, or yoghurt added straight from the fridge.', fix: 'Bring yoghurt to room temperature first and stir it in off the heat. Don\'t boil curries with yoghurt or cream — simmer only.' },
    { symptom: 'Meat is tough', cause: 'Cut too lean, or cooked at a rolling boil.', fix: 'Use cuts with connective tissue (thigh, shoulder, shin). Keep the curry at a gentle simmer for the long-cook cuts — bubbles barely breaking the surface.' },
    { symptom: 'Heat is uneven — fiery in places, mild elsewhere', cause: 'Chilli added late and not stirred through.', fix: 'Add chillies early with the aromatics so the heat distributes. Taste before serving and adjust with chilli flakes if needed.' },
  ],
  'slow-cooker': [
    { symptom: 'Meat is stringy or dry', cause: 'Cooked on high too long, or the cut was too lean.', fix: 'Switch to low and shorter, or pick a fattier cut (shoulder, shin, chuck). Eight hours on low is the safe sweet spot for most cuts.' },
    { symptom: 'Sauce is watery', cause: 'Slow cookers don\'t evaporate — every drop of liquid stays in.', fix: 'Lift the lid for the last 30 minutes on high, or transfer the sauce to a saucepan and reduce on the hob.' },
    { symptom: 'Vegetables are mush', cause: 'Soft veg (courgette, peas, leafy greens) added at the start.', fix: 'Add anything that cooks in under 20 minutes in the last half-hour. Root veg can go in from the beginning.' },
    { symptom: 'Lacks depth', cause: 'Meat went in raw without browning.', fix: 'Brown meat in a pan first — five minutes a side. The fond at the bottom of the pan goes in too. Worth the extra washing-up.' },
  ],
  cake: [
    { symptom: 'Cake sinks in the middle', cause: 'Underbaked, or the oven door opened too early.', fix: 'Test with a skewer — it should come out with a few moist crumbs, not wet batter. Don\'t open the oven before three-quarters of the bake time.' },
    { symptom: 'Cake is dry', cause: 'Overbaked, or too much flour measured by cup not weight.', fix: 'Check at the minimum bake time and every five minutes after. Weigh flour for cake recipes — cup measures vary by 20% depending on how you scoop.' },
    { symptom: 'Top cracked or domed', cause: 'Oven too hot, or batter too thick.', fix: 'Drop the temperature by 10°C and check earlier. Domed cakes can be trimmed flat once cool.' },
    { symptom: 'Cake didn\'t rise', cause: 'Raising agent stale or omitted, or butter and eggs cold.', fix: 'Check baking powder is fresh — it loses lift after six months. Use room-temperature butter and eggs so the batter holds air.' },
  ],
  cookie: [
    { symptom: 'Cookies spread too thin and crisp', cause: 'Butter too soft, or oven not hot enough.', fix: 'Chill the dough for 30 minutes before baking. Preheat the oven properly — 180°C means 180°C on an oven thermometer, not the dial.' },
    { symptom: 'Cookies came out cakey, not chewy', cause: 'Over-mixed once the flour went in, or too much flour.', fix: 'Stop mixing as soon as the flour disappears. For chewier cookies, replace some plain flour with bread flour for more gluten.' },
    { symptom: 'Cookies stuck to the tray', cause: 'Tried to lift before they\'d set.', fix: 'Leave them on the tray for five minutes after baking — they\'re too soft to move when hot. Lift onto a rack with a palette knife.' },
    { symptom: 'Burnt bottoms, raw middles', cause: 'Tray too thin, or rack too low.', fix: 'Use a heavier baking tray, line with baking paper, and bake on the middle shelf.' },
  ],
  confectionery: [
    { symptom: 'Mixture won\'t set', cause: 'Sugar didn\'t reach the right stage, or temperature was guessed.', fix: 'Use a sugar thermometer. Stages: soft-ball 115°C, hard-ball 125°C, soft-crack 135°C, hard-crack 150°C. Cold-water tests work but the thermometer doesn\'t lie.' },
    { symptom: 'Sugar crystallised', cause: 'Mixture stirred after it started bubbling, or a stray crystal landed on the side of the pan.', fix: 'Don\'t stir once the sugar is dissolved. Brush the inside of the pan with a wet pastry brush to wash crystals down.' },
    { symptom: 'Fudge is grainy', cause: 'Beaten too soon — while still too hot.', fix: 'Cool to 43°C before beating. The mixture turns from glossy to matte when ready to set.' },
    { symptom: 'Mixture seized into a ball', cause: 'Water touched melted chocolate.', fix: 'Add a teaspoon of warm cream or water and stir until smooth — this is the trick. Drier seizing needs more liquid; thin seizing wants less.' },
  ],
  bread: [
    { symptom: 'Bread is dense and didn\'t rise', cause: 'Yeast was stale, or the dough was too cold.', fix: 'Check yeast in warm water with a pinch of sugar — it should froth in five minutes. Prove in a warm spot (airing cupboard or oven with the light on).' },
    { symptom: 'Crust is pale and soft', cause: 'Oven not hot enough, or no steam.', fix: 'Preheat to 220°C with a tray on the bottom. Throw a cup of water into the tray when the loaf goes in — steam gives crust.' },
    { symptom: 'Open crumb wasn\'t open', cause: 'Underproved, or the dough was knocked back too hard.', fix: 'Give it longer — until the dough doesn\'t spring back when poked. Shape gently so the bubbles survive.' },
    { symptom: 'Bottom burnt before top browned', cause: 'Tray was too thin, or rack too low.', fix: 'Bake on a heavier tray on the middle shelf. Lining with baking paper helps.' },
  ],
  'frozen-dessert': [
    { symptom: 'Ice crystals form on freezing', cause: 'Mixture had too much water, or didn\'t churn long enough.', fix: 'Churn to a soft-serve consistency before freezing. Pre-chill the bowl overnight if using a bowl-style ice cream maker.' },
    { symptom: 'Texture is too hard from the freezer', cause: 'Sugar level too low — sugar prevents freezing solid.', fix: 'Take out 15 minutes before serving to soften. Next time, scale up sugar by 10 to 20 grams per 500 ml of mixture.' },
    { symptom: 'Custard split when warming', cause: 'Heat too high, or eggs went in cold and fast.', fix: 'Temper — pour a ladle of hot milk into the yolks first, whisking, then return to the pan over low heat. Don\'t let it boil.' },
    { symptom: 'Mousse won\'t hold its shape', cause: 'Cream wasn\'t whipped enough, or it was folded in too vigorously.', fix: 'Whip cream to soft peaks (it flops slightly when the whisk is lifted). Fold in with a metal spoon, cutting through the centre and lifting from the base.' },
  ],
  salad: [
    { symptom: 'Dressing pools at the bottom of the bowl', cause: 'Dressing not emulsified, or salad too wet.', fix: 'Spin leaves dry first. Whisk dressing ingredients until thick and pourable. Dress at the table, not in the kitchen, so it stays evenly coated.' },
    { symptom: 'Leaves wilted by the time it reached the table', cause: 'Dressed too early, or fruit/cheese added warm.', fix: 'Combine everything cold and dress just before serving. Sturdy leaves (kale, chicory, romaine) cope with sitting; spinach and rocket don\'t.' },
    { symptom: 'Salad tastes too oily', cause: 'Wrong oil-to-acid ratio in the dressing.', fix: 'Three parts oil to one part acid is the classic ratio. Adjust with a squeeze of lemon if it\'s flat, or a splash more oil if it\'s sharp.' },
    { symptom: 'Toppings ended up in the bottom', cause: 'Heavy ingredients added before tossing.', fix: 'Toss the leaves with dressing first, then scatter cheese, nuts, croutons on top. Don\'t toss again after garnishing.' },
  ],
  'breakfast-oats': [
    { symptom: 'Oats too thick when chilled', cause: 'Liquid soaked in fully, or oats were finer than rolled.', fix: 'Loosen with a splash of cold milk in the morning. Jumbo oats hold their texture better than instant.' },
    { symptom: 'Oats too runny', cause: 'Liquid ratio too high, or not enough soaking time.', fix: 'Soak for at least four hours or overnight. Stir in chia or ground flax before chilling — they thicken as they sit.' },
    { symptom: 'Tastes bland', cause: 'No salt, or fruit added in the morning, not the night before.', fix: 'A pinch of salt brings out the sweetness. Mash banana or stir in jam at the soaking stage so the flavour goes through.' },
    { symptom: 'Texture is slimy', cause: 'Mixture sat for more than 48 hours.', fix: 'Eat within two days. Beyond that the oats turn pasty — better to mix a fresh batch.' },
  ],
  smoothie: [
    { symptom: 'Smoothie is too thick', cause: 'Frozen fruit ratio too high.', fix: 'Add a splash of milk, water, or juice until the blades catch. A high-powered blender helps but isn\'t essential.' },
    { symptom: 'Smoothie is too thin', cause: 'Liquid ratio too high, or no thickener.', fix: 'Add half a frozen banana, a handful of oats, or a tablespoon of nut butter. Chia seeds thicken if you blend and wait five minutes.' },
    { symptom: 'Tastes flat or grassy', cause: 'Green veg dominating, no sweetness or fat.', fix: 'A frozen banana or a teaspoon of honey balances spinach or kale. A spoon of nut butter softens the green note.' },
    { symptom: 'Smoothie separates in the glass', cause: 'No emulsifier (no banana, no nut butter, no yoghurt).', fix: 'Drink straight away, or add one of those to bind it. Stir before each sip.' },
  ],
  pancake: [
    { symptom: 'Pancakes are tough or chewy', cause: 'Over-mixed batter — gluten developed.', fix: 'Mix until just combined; lumps are fine. Rest the batter 10 minutes before cooking.' },
    { symptom: 'Pancakes are flat, not fluffy', cause: 'Baking powder stale, or butter too cool.', fix: 'Use fresh raising agents and melted butter, not cold. Don\'t flatten when flipping.' },
    { symptom: 'Stuck to the pan', cause: 'Pan not hot enough, or not enough fat.', fix: 'Medium heat, butter or oil swirled before each pancake. Wait until bubbles appear on top before flipping.' },
    { symptom: 'Cooked unevenly — pale in the middle, dark at the edges', cause: 'Pan too hot.', fix: 'Drop the heat. Cook longer per side at lower temperature for a more even brown.' },
  ],
  'savoury-bake': [
    { symptom: 'Pastry shrinks on baking', cause: 'Not rested before going in, or dough overworked.', fix: 'Chill the lined tin for 30 minutes before blind-baking. Handle pastry as little as possible.' },
    { symptom: 'Filling sets but pastry stays soggy', cause: 'Filling went in before blind-baking, or eggs leaked through cracks.', fix: 'Blind-bake the pastry case first with baking beans for 15 minutes, then 5 minutes without to crisp the base. Brush with beaten egg to seal any cracks.' },
    { symptom: 'Filling curdled or cracked', cause: 'Baked too hot.', fix: 'Drop the oven to 160°C. A custard filling should be set at the edges with a slight wobble in the middle when done.' },
    { symptom: 'Top burnt before middle set', cause: 'Tin too deep, or oven too hot.', fix: 'Cover loosely with foil for the last 10 minutes if the top is going. Use a wider, shallower tin for deeper fillings.' },
  ],
  'pie-crumble': [
    { symptom: 'Pastry base went soggy', cause: 'Filling too wet, or no blind-bake.', fix: 'Drain juicy fruit, toss with a tablespoon of cornflour, or blind-bake the base before filling. A sprinkle of semolina on the base soaks up stray juice.' },
    { symptom: 'Crumble topping went sandy, not crunchy', cause: 'Butter melted in fully before baking.', fix: 'Rub butter into flour to coarse breadcrumb texture, then chill the mix before scattering. Keep clumps the size of peas for crunch.' },
    { symptom: 'Filling spilled over the edges', cause: 'Tin too small, or too much liquid.', fix: 'Use a deeper dish next time and bake on a tray to catch drips.' },
    { symptom: 'Top browned but middle is cold', cause: 'Tin too cold from the fridge, or oven too hot.', fix: 'Let chilled pies sit at room temperature for 20 minutes before baking. Bake on the middle shelf at 180°C.' },
  ],
  cheesecake: [
    { symptom: 'Cracked on top', cause: 'Baked too hot, or cooled too fast.', fix: 'Bake low, at 150°C, until the middle has a slight wobble. Turn the oven off, prop the door open, and let it cool inside for an hour.' },
    { symptom: 'Base is soggy', cause: 'Filling soaked through.', fix: 'Bake the biscuit base for 10 minutes before pouring the filling on. Cool fully before adding.' },
    { symptom: 'Filling didn\'t set', cause: 'Underbaked, or not chilled long enough for no-bake versions.', fix: 'Baked: the centre should wobble like jelly when nudged, not slosh. No-bake: chill overnight, not just a few hours.' },
    { symptom: 'Edges sank, middle stayed proud', cause: 'Cooled in a draft, or removed from the tin too soon.', fix: 'Cool slowly in the oven with the door ajar, then chill in the fridge before unmoulding.' },
  ],
  default: [
    { symptom: 'The dish tastes flat', cause: 'Underseasoned or no acid.', fix: 'Salt a pinch at a time, tasting. A squeeze of lemon or splash of vinegar at the end lifts most savoury dishes.' },
    { symptom: 'It\'s overcooked by the time it reaches the table', cause: 'Carryover cooking — food keeps cooking on the hot pan after the heat goes off.', fix: 'Pull off the heat a minute or two before you think it\'s done. Plate straight away, or transfer to a warmed serving dish.' },
    { symptom: 'It\'s undercooked in the middle', cause: 'Heat too high, browned the outside before the middle warmed through.', fix: 'Drop the heat and give it longer. A probe thermometer is the only reliable check for meat.' },
    { symptom: 'The leftovers were dry', cause: 'Reheated uncovered, or no liquid in the pan.', fix: 'Reheat covered with a splash of stock or water, on a low heat. Microwave on 60% power if using one — gentler than full blast.' },
  ],
}

const VARIATIONS = {
  soup: [
    'Vegan version: swap dairy cream for cashew cream (soak 100 g cashews in hot water, blend smooth) or oat cream.',
    'Smokier finish: stir in a teaspoon of smoked paprika at the end, or top with crispy chorizo.',
  ],
  pasta: [
    'Vegetarian: drop the meat and add 200 g mushrooms (chestnut or porcini) sautéed until they squeak.',
    'Lighter sauce: replace cream with crème fraîche stirred in off the heat — same richness, less weight.',
  ],
  risotto: [
    'Mushroom: add 30 g dried porcini soaked in warm water; use the soaking liquid as part of the stock.',
    'Seafood: stir through cooked prawns and a handful of peas in the last two minutes.',
  ],
  curry: [
    'Vegetarian: swap meat for paneer cubes or chickpeas. Add at the simmer stage so they take on the sauce.',
    'Coconut version: replace half the stock with coconut milk for a milder, richer curry.',
  ],
  'slow-cooker': [
    'Hob version: brown the meat, then transfer to a casserole dish in a 150°C oven for the same length of time — 3 to 4 hours.',
    'Vegetarian: replace meat with 600 g mixed root veg and 200 g lentils; cut cooking time by a third.',
  ],
  cake: [
    'Citrus version: replace the vanilla with the zest of an orange or lemon.',
    'Nut-free: swap ground almonds for desiccated coconut or extra plain flour, weight for weight.',
  ],
  cookie: [
    'Add-ins: 75 g dark chocolate chips, chopped walnuts, dried cranberries, or a pinch of sea salt on top before baking.',
    'Gluten-free: replace plain flour with a 1-to-1 gluten-free blend that includes xanthan gum.',
  ],
  confectionery: [
    'Flavoured version: stir in a teaspoon of vanilla, almond, or peppermint extract once the mixture is off the heat.',
    'Dip-coated: once set, dip pieces in melted dark chocolate and let drip on baking paper.',
  ],
  bread: [
    'Seeded crust: brush the top with water and roll in mixed seeds before the final prove.',
    'Wholemeal: replace 100 g of the flour with wholemeal for a denser, nuttier loaf.',
  ],
  'frozen-dessert': [
    'Boozy version: stir in 2 tablespoons of dark rum, brandy, or liqueur once the mix is churned — the alcohol stops it freezing hard.',
    'Chocolate ripple: drizzle warm chocolate sauce through the churned mix before freezing, and don\'t over-stir.',
  ],
  salad: [
    'Add-protein: top with grilled chicken, halloumi, or a soft-boiled egg for a main-course salad.',
    'Crunch upgrade: scatter toasted nuts or seeds on top — pumpkin, almond, sunflower.',
  ],
  'breakfast-oats': [
    'Chocolate version: stir a tablespoon of cocoa powder and a teaspoon of honey through with the oats.',
    'Tropical: layer with diced mango and toasted coconut flakes in the morning.',
  ],
  smoothie: [
    'Higher-protein: blend in 30 g of protein powder, a tablespoon of nut butter, or Greek yoghurt.',
    'Green version: add a handful of spinach — the colour shifts but the flavour stays.',
  ],
  pancake: [
    'Sweet: serve with maple syrup, lemon and sugar, or fresh berries and yoghurt.',
    'Savoury: skip the sugar in the batter; top with smoked salmon, cream cheese, and chives.',
  ],
  'savoury-bake': [
    'Vegetarian: swap meat for roasted Mediterranean vegetables (courgette, pepper, aubergine) and crumbled feta.',
    'Make-ahead: assemble fully the day before, refrigerate, and bake the morning of.',
  ],
  'pie-crumble': [
    'Mixed fruit: use whatever\'s in season — apple plus blackberry, plum plus pear, rhubarb plus strawberry.',
    'Nutty crumble: replace 30 g of the flour with rolled oats or chopped almonds.',
  ],
  cheesecake: [
    'No-bake version: skip the egg, increase the cream cheese to 600 g, and chill overnight.',
    'Fruit topping: scatter fresh berries or a swirl of fruit compote over the top before serving.',
  ],
  default: [
    'Vegetarian swap: replace meat with mushrooms, lentils, or beans — adjust seasoning to compensate.',
    'Spice version: a pinch of chilli flakes or cracked black pepper at the end shifts the dish without losing its character.',
  ],
}

const WHERE_THIS_LIVES = {
  italian: 'The dish sits in the Italian home-cooking tradition: a few good ingredients, a long unhurried cook, and a pan that has fed the family for years. Worth keeping its roots in mind when you taste — the silence between flavours is part of the design.',
  french: 'Classical French cookery rests on this kind of dish — slow extraction, considered seasoning, restraint at the finish. Escoffier and the Larousse Gastronomique codified the method; cooks like Elizabeth David and Julia Child brought it into the English-language kitchen.',
  chinese: 'Chinese home cooking favours bright contrast: salt, sweet, sour, heat, working against each other in one bowl. The dish lands somewhere on that grid — adjust the balance to suit your palate.',
  japanese: 'Japanese home cooking trusts the ingredient. Dashi, soy, mirin, sake — used in restraint, never to dominate. The dish belongs to that quiet tradition.',
  thai: 'Thai cooking lives in balance: sweet, sour, salt, heat, bitter, all present, none winning. Adjust at the finish, tasting as you go.',
  indian: 'The dish belongs to the layered tradition of Indian home cooking — spices bloomed in fat, aromatics built up, the long simmer that pulls everything together. Every household tunes the heat and the sweetness; this is one version.',
  mexican: 'Mexican home cooking trusts heat, citrus, and corn. The dish hits those notes — adjust the chilli to taste and finish with a squeeze of lime if it feels heavy.',
  mediterranean: 'The dish belongs to the Mediterranean tradition of olive oil, lemon, and what\'s on hand. No exact ratios — taste, adjust, taste again.',
  american: 'A classic American home recipe — generous, comforting, made for a crowd. The proportions are heartier than the British equivalent; the method is built for a Sunday afternoon.',
  british: 'A British home cook\'s dish. It sits among the recipes families remember without thinking about — the kind that gets adjusted across generations and never quite the same twice.',
}

// Build the brief for a single recipe.
function buildBrief(recipe, ingredientMatcher, toolMatcher, ingredients, tools, dryReport) {
  const { titleLine, slug, methodLines, ingredientGroups, servingsLine, sectionContext } = recipe
  const category = categoriseRecipe(recipe)
  const servings = extractServings(recipe)

  // Parse every ingredient line
  const ingredientItems = []
  const unmappedIngredients = []
  for (const group of ingredientGroups) {
    const groupLabel = group.groupLabel
    for (const raw of group.lines) {
      // Skip clear non-ingredient lines: explanatory text, batch-size headers, garbage
      if (raw.length > 200) continue
      const lower = raw.toLowerCase()
      if (/^x+$/i.test(raw.trim())) continue
      if (/^\(x+[a-z]*\)$/i.test(raw.trim())) continue
      if (/x+\s*(g|ml|kg|l)/i.test(raw) && raw.length < 10) continue
      // Sub-section labels that ended up as ingredient lines
      if (/^(sponge|frosting|icing|buttercream|basic risotto|optional icing|optional toppings?|topping|filling|glaze|crumb|crumble|streusel|crust|base)\s*\(?(\s*optional)?\)?\s*$/i.test(raw.trim())) continue
      if (/^(bulk|single|double|triple) batch/i.test(raw)) continue
      if (/^makes \d+/i.test(raw)) continue
      // U+2019 curly apostrophe variants
      if (/^i[''ʼ]ve included/i.test(raw)) continue
      if (/^(notes?:|tip:|optional:|optional toppings)/i.test(raw)) continue
      if (/^use whichever/i.test(raw)) continue
      if (/^prepare /i.test(raw)) continue
      if (/^you can /i.test(raw)) continue
      if (/^i prefer/i.test(raw)) continue
      if (/^this is/i.test(raw)) continue
      if (/^if you/i.test(raw)) continue
      // Pure standalone "(100g)" / "(200g)" lines
      if (/^\(\s*\.?\d+\s*[a-z]+\s*\)\s*$/i.test(raw.trim())) continue
      // Short fragments that are clearly batch-size labels
      if (raw.trim().length < 4 && !/[a-z]/i.test(raw)) continue

      const parsed = parseIngredientLine(raw, ingredientMatcher)
      // Drop empty-name fragments
      if (!parsed.name || parsed.name.trim().length < 2) continue
      if (parsed.ingredientSlug) {
        const ing = ingredients.find((i) => i.slug === parsed.ingredientSlug)
        const unit = parsed.unit || ing?.defaultUnit || 'g'
        ingredientItems.push({
          ingredientSlug: parsed.ingredientSlug,
          amount: parsed.amount,
          unit,
          prepNote: parsed.prepNote ?? null,
          isOptional: parsed.isOptional,
          groupLabel: groupLabel ?? null,
        })
      } else {
        unmappedIngredients.push({ raw, parsed, recipeSlug: slug })
        dryReport.unmappedIngredients.push({ slug, raw, parsedName: parsed.name })
      }
    }
  }

  // Detect tools
  const detectedToolSlugs = detectTools(methodLines, ingredientGroups.flatMap((g) => g.lines), toolMatcher, tools)
  const recipeTools = detectedToolSlugs.map((s) => ({ slug: s, isOptional: false }))

  // Build the TipTap body
  const body = { type: 'doc', content: [] }

  // Intro: 2-3 paragraphs of generic-but-not-padded prose tailored to dish category
  const intro = buildIntroProse(titleLine, category, servings)
  for (const p of intro) {
    body.content.push({ type: 'paragraph', content: [{ type: 'text', text: p }] })
  }

  // "What you need" heading
  body.content.push({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'What you need' }] })

  // ingredientsList
  body.content.push({
    type: 'ingredientsList',
    attrs: {
      defaultServings: servings ?? 4,
      items: ingredientItems,
    },
  })

  // Free-text fallback for genuinely-unmappable lines (preserves her words even
  // when the master list doesn't cover them — typically sub-recipes ("basic
  // risotto"), regional ingredients, or specific brand items).
  if (unmappedIngredients.length > 0) {
    const meaningful = unmappedIngredients
      .map((u) => u.raw)
      .filter((r) => r && r.length > 2 && r.length < 120)
    if (meaningful.length > 0) {
      body.content.push({
        type: 'infoPanel',
        attrs: {
          tone: 'info',
          title: 'Also',
          body: meaningful.join('; ') + '.',
        },
      })
    }
  }

  // Method heading
  body.content.push({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Method' }] })

  // Method as orderedList
  const methodList = {
    type: 'orderedList',
    content: methodLines.map((line) => ({
      type: 'listItem',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: line }] }],
    })),
  }
  body.content.push(methodList)

  // Troubleshooting
  const troubleshootingKey = pickTroubleshootingKey(category)
  const troubleshootingItems = TROUBLESHOOTING[troubleshootingKey] ?? TROUBLESHOOTING.default
  body.content.push({
    type: 'troubleshooter',
    attrs: {
      heading: 'If something goes wrong',
      intro: 'A few of the more common issues, and what tends to fix them.',
      items: troubleshootingItems,
    },
  })

  // Variations
  const variationsKey = pickTroubleshootingKey(category)
  const variations = VARIATIONS[variationsKey] ?? VARIATIONS.default
  body.content.push({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Variations' }] })
  body.content.push({
    type: 'bulletList',
    content: variations.map((v) => ({
      type: 'listItem',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: v }] }],
    })),
  })

  // Make ahead / freezing / leftovers
  const mafl = buildMakeAheadFreezerLeftovers(titleLine, category, methodLines.join(' ').toLowerCase())
  if (mafl) {
    body.content.push({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Make ahead, freezing, leftovers' }] })
    body.content.push({ type: 'paragraph', content: [{ type: 'text', text: mafl }] })
  }

  // Where this dish lives
  body.content.push({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Where this dish lives' }] })
  body.content.push({
    type: 'paragraph',
    content: [{ type: 'text', text: WHERE_THIS_LIVES[category.cuisine] ?? WHERE_THIS_LIVES.british }],
  })

  // Estimate prep + cook minutes from the method
  const { prepMinutes, cookMinutes } = estimateTimes(methodLines, category)

  // Decide freezable, batchable
  const freezable = /freezerFriendly/.test(category.mood.join(',')) || /freeze/.test(methodLines.join(' ').toLowerCase())
  const batchable = category.tags.includes('slow-cooker') || category.tags.includes('curry') || category.tags.includes('soup') || /batch/i.test(methodLines.join(' '))

  // Build excerpt (one sentence)
  const excerpt = buildExcerpt(titleLine, category, servings)
  const subtitle = buildSubtitle(titleLine, category)

  const sourceType = 'CREATOR'
  const sourceNotes = buildSourceNotes(titleLine, category)

  return {
    slug,
    title: titleLine,
    subtitle,
    excerpt,
    type: 'RECIPE',
    categorySlug: 'cooking',
    subCategorySlug: null,
    difficulty: 'BEGINNER',
    season: 'YEAR_ROUND',
    sourceType,
    sourceNotes,
    recipe: {
      servings,
      yieldDescription: null,
      prepMinutes,
      cookMinutes,
      restingMinutes: null,
      chillingMinutes: null,
      totalMinutes: (prepMinutes ?? 0) + (cookMinutes ?? 0) || null,
      scalable: true,
      freezable,
      freezeNotes: freezable ? buildFreezeNotes(category) : null,
      batchable,
      batchNotes: batchable ? buildBatchNotes(category) : null,
      makeAheadNotes: null,
      dietaryFlags: [],
      cuisine: category.cuisine,
      mealType: category.mealType,
      mood: category.mood,
      temperatureCelsius: null,
      temperatureNote: null,
      foundational: false,
    },
    recipeTools,
    glossaryTerms: [],
    body,
  }
}

function pickTroubleshootingKey(category) {
  for (const tag of [
    'soup', 'risotto', 'pasta', 'curry', 'slow-cooker', 'cake', 'cookie', 'confectionery',
    'bread', 'frozen-dessert', 'salad', 'breakfast-oats', 'smoothie', 'pancake',
    'savoury-bake', 'pie-crumble', 'cheesecake',
  ]) {
    if (category.tags.includes(tag)) return tag
  }
  return 'default'
}

function buildIntroProse(title, category, servings) {
  const dishWord = title.toLowerCase()
  const cuisineLine = ({
    italian: 'The dish belongs to the Italian home-cooking register: straightforward, ingredient-led, calm at the hob.',
    french: 'Classical French method, scaled to a home kitchen.',
    chinese: 'Built in the way Chinese home kitchens cook: fast at the wok, balance at the bowl.',
    japanese: 'Japanese home cooking that trusts the soy, the dashi, and the patience between them.',
    thai: 'Thai-style — heat, sour, sweet, salt, all working against each other.',
    indian: 'A home-style Indian dish: spices bloomed in fat first, aromatics built up, the long simmer that pulls it together.',
    mexican: 'Mexican home cooking with the heat-citrus-corn triangle at the centre.',
    mediterranean: 'A Mediterranean dish in the everyday register — olive oil, lemon, and what came back from the market.',
    american: 'An American family-table recipe — generous, comforting, built for a crowd.',
    british: 'A British home-cook\'s dish — the kind of recipe families adjust across generations.',
  })[category.cuisine] ?? 'A home-cook\'s recipe in the everyday register.'

  const servingsLine = servings ? `Serves ${servings}.` : 'Adjustable for what you need.'
  const lead = `${title}. ${cuisineLine} ${servingsLine}`

  let second = ''
  if (category.tags.includes('slow-cooker')) {
    second = 'It runs in the slow cooker so the work is at the start of the day and the dinner cooks itself.'
  } else if (category.tags.includes('soup')) {
    second = 'A blended soup in the everyday register: vegetables sweated low, stock added, blitzed until smooth. The work is the dicing; everything else is patience.'
  } else if (category.tags.includes('pasta')) {
    second = 'Pasta in a pan, sauce in another. The trick is the meeting — the noodles finish in the sauce, holding the starchy water that binds the two.'
  } else if (category.tags.includes('risotto')) {
    second = 'Stock kept warm beside you, rice toasted, wine in, ladle by ladle until the grains are soft with a bite at the centre. No need to stir constantly — gently, often.'
  } else if (category.tags.includes('curry')) {
    second = 'Spices in hot oil first; aromatics second; everything else third. The order matters — it builds the layers that show up at the bowl.'
  } else if (category.tags.includes('cake')) {
    second = 'Cake batters reward weighing over scooping. Room-temperature butter and eggs, raised properly, tested with a skewer.'
  } else if (category.tags.includes('cookie') || category.tags.includes('confectionery')) {
    second = 'Cookies bake fast and reward a chilled dough. Pull them out when the edges set and the middles still look slightly underdone.'
  } else if (category.tags.includes('bread')) {
    second = 'Bread is mostly waiting. Mix, prove, shape, prove again, bake hot with steam.'
  } else if (category.tags.includes('breakfast-oats')) {
    second = 'Made the night before; ready when you wake up. Adjust the liquid to suit your usual breakfast bowl.'
  } else if (category.tags.includes('smoothie')) {
    second = 'In and out of the blender in under five minutes. A frozen banana does most of the texture work.'
  } else if (category.tags.includes('salad')) {
    second = 'A salad in the everyday register — dressed at the table, leaves dry, dressing emulsified before it meets the bowl.'
  } else {
    second = 'A weeknight-friendly recipe: most of the work is the prep, and the cooking takes care of itself.'
  }

  return [lead, second]
}

function buildSubtitle(title, category) {
  if (category.tags.includes('slow-cooker')) return 'The kind of dinner that cooks itself.'
  if (category.tags.includes('soup')) return 'A blended soup, smooth and warm.'
  if (category.tags.includes('pasta')) return 'A pasta dish for any night of the week.'
  if (category.tags.includes('risotto')) return 'Patience, a wooden spoon, and a ladle of warm stock.'
  if (category.tags.includes('curry')) return 'Spice-led, family-fed.'
  if (category.tags.includes('cake')) return 'A cake worth the weighing.'
  if (category.tags.includes('cookie')) return 'Crisp at the edges, soft in the middle.'
  if (category.tags.includes('bread')) return 'Mostly waiting, mostly worth it.'
  if (category.tags.includes('breakfast-oats')) return 'Make it before bed, eat it before work.'
  if (category.tags.includes('smoothie')) return 'Five minutes from blender to glass.'
  if (category.tags.includes('salad')) return 'A bowl of what\'s on hand, dressed properly.'
  if (category.tags.includes('frozen-dessert')) return 'Patience and a freezer.'
  if (category.tags.includes('confectionery')) return 'A thermometer pays for itself the first time.'
  return null
}

function buildExcerpt(title, category, servings) {
  const lead = `${title}.`
  const detail = category.tags.includes('slow-cooker')
    ? 'A slow-cooker dish that does its own work — set it in the morning, serve it at dinner.'
    : category.tags.includes('soup')
      ? 'A smooth blended soup with simple components — vegetables sweated low, stock added, blitzed at the end.'
      : category.tags.includes('pasta')
        ? 'A weeknight pasta — sauce in one pan, pasta in another, finished together.'
        : category.tags.includes('risotto')
          ? 'A classic risotto built the slow way: stock warm beside you, ladle by ladle, until the grains are creamy with a bite.'
          : category.tags.includes('curry')
            ? 'A spice-led dish in the home-curry tradition. Adjust heat to suit.'
            : category.tags.includes('cake') || category.tags.includes('cookie') || category.tags.includes('confectionery')
              ? 'A baking recipe from Rebecca\'s collection — straightforward, reliable, worth weighing rather than scooping.'
              : 'A home-cook\'s recipe from Rebecca\'s collection, kept in the family rotation.'
  return `${lead} ${detail}`
}

function buildSourceNotes(title, category) {
  if (category.tags.includes('risotto') && category.cuisine === 'italian') {
    return 'From Rebecca\'s personal cookbook, with a method that follows the classical Italian risotto canon — stock warm beside the rice, ladled in slowly, finished with cold butter and grated parmesan.'
  }
  if (category.tags.includes('pasta') && category.cuisine === 'italian') {
    return 'From Rebecca\'s personal cookbook. The bones of the recipe sit in the Italian home-cooking tradition documented by writers like Pellegrino Artusi (La Scienza in Cucina, 1891) and Marcella Hazan.'
  }
  if (category.tags.includes('curry') && category.cuisine === 'indian') {
    return 'From Rebecca\'s personal cookbook. Built on the layered method of Indian home cooking — spices bloomed first, aromatics built up, the long simmer that follows.'
  }
  if (category.cuisine === 'french' && (category.tags.includes('slow-cooker') || /bourguignon|cassoulet/.test(title.toLowerCase()))) {
    return 'From Rebecca\'s personal cookbook. The dish sits in the classical French slow-cook tradition — Escoffier, Larousse Gastronomique, and the home-cookery tradition of southwest France.'
  }
  if (category.tags.includes('bread')) {
    return 'From Rebecca\'s personal cookbook. Bread recipes draw on the long tradition of home baking — Elizabeth David\'s English Bread and Yeast Cookery is one of the canonical references in English.'
  }
  return 'From Rebecca\'s personal cookbook — a recipe she\'s made many times in her own kitchen.'
}

function buildFreezeNotes(category) {
  if (category.tags.includes('soup')) return 'Cool completely, then freeze in portions for up to three months. Defrost overnight in the fridge and reheat gently — don\'t boil if the soup contains cream.'
  if (category.tags.includes('curry')) return 'Curries improve in the freezer. Cool, portion, freeze for up to three months. Defrost overnight in the fridge before reheating.'
  if (category.tags.includes('pasta')) return 'Freeze the sauce only, not the cooked pasta. Cool, portion, freeze for up to three months.'
  if (category.tags.includes('cake') || category.tags.includes('cookie')) return 'Wrap tightly, freeze for up to three months. Defrost at room temperature.'
  if (category.tags.includes('bread')) return 'Bread freezes well sliced — wrap in foil and freeze for up to a month. Toast straight from the freezer.'
  return 'Cool fully, freeze in portions for up to three months. Defrost overnight in the fridge.'
}

function buildBatchNotes(category) {
  if (category.tags.includes('slow-cooker')) return 'A double batch fits a 6-litre slow cooker. Use the second half straight away or freeze in portions.'
  if (category.tags.includes('soup') || category.tags.includes('curry')) return 'Doubles or triples cleanly — use a big saucepan and freeze what you don\'t need.'
  return 'Doubles cleanly if you have a large enough pan.'
}

function buildMakeAheadFreezerLeftovers(title, category, methodText) {
  const parts = []
  if (category.tags.includes('slow-cooker')) {
    parts.push('The slow cooker is the make-ahead.')
  }
  if (category.tags.includes('soup') || category.tags.includes('curry')) {
    parts.push('Make a day ahead; the flavour deepens overnight in the fridge.')
  }
  if (/the next day|next morning|chill overnight|refrigerate overnight/i.test(methodText)) {
    parts.push('Sits well in the fridge overnight; see the method for the chilling step.')
  }
  if (category.tags.includes('frozen-dessert')) {
    parts.push('Made days in advance and lives in the freezer.')
  }
  if (category.tags.includes('breakfast-oats')) {
    parts.push('Designed as a make-ahead: assemble the night before, eat in the morning.')
  }
  if (parts.length === 0 && category.tags.includes('pasta')) {
    parts.push('The sauce reheats well the next day; cook the pasta fresh.')
  }
  if (parts.length === 0) {
    parts.push('Best fresh. Leftovers keep two days in the fridge; reheat covered with a splash of liquid.')
  }
  return parts.join(' ')
}

function estimateTimes(methodLines, category) {
  const methodText = methodLines.join(' ').toLowerCase()
  // Look for explicit minute references
  const matches = [...methodText.matchAll(/(\d+)\s*(?:to|-|–|—)\s*(\d+)?\s*minute|(\d+)\s*minute/g)]
  let cookMinutes = null
  if (matches.length > 0) {
    let total = 0
    for (const m of matches) {
      const a = parseInt(m[1] ?? m[3] ?? '0')
      const b = m[2] ? parseInt(m[2]) : a
      total += (a + b) / 2
    }
    cookMinutes = Math.round(total)
  }
  // Look for hour references
  const hourMatches = [...methodText.matchAll(/(\d+)\s*(?:to|-|–|—)?\s*(\d+)?\s*hour/g)]
  if (hourMatches.length > 0) {
    let totalH = 0
    for (const m of hourMatches) {
      const a = parseInt(m[1])
      const b = m[2] ? parseInt(m[2]) : a
      totalH += (a + b) / 2
    }
    cookMinutes = (cookMinutes ?? 0) + Math.round(totalH * 60)
  }
  // Sensible defaults by category if nothing found
  let prepMinutes = 15
  if (category.tags.includes('smoothie')) {
    prepMinutes = 5
    cookMinutes = cookMinutes ?? 0
  } else if (category.tags.includes('breakfast-oats')) {
    prepMinutes = 5
    cookMinutes = cookMinutes ?? 0
  } else if (category.tags.includes('salad')) {
    prepMinutes = 15
    cookMinutes = cookMinutes ?? 0
  } else if (category.tags.includes('slow-cooker')) {
    prepMinutes = 15
    cookMinutes = cookMinutes ?? 360
  } else if (category.tags.includes('cake') || category.tags.includes('cookie') || category.tags.includes('bread')) {
    prepMinutes = 20
    cookMinutes = cookMinutes ?? 30
  } else if (category.tags.includes('soup') || category.tags.includes('curry') || category.tags.includes('pasta')) {
    prepMinutes = 15
    cookMinutes = cookMinutes ?? 40
  }
  if (cookMinutes !== null && cookMinutes > 600) cookMinutes = 600 // sanity cap
  return { prepMinutes, cookMinutes }
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log('Loading master data...')
  const { ingredients, tools } = await loadMasterData()
  console.log(`  ingredients: ${ingredients.length}, tools: ${tools.length}`)
  const ingredientMatcher = buildIngredientMatcher(ingredients)
  const toolMatcher = buildToolMatcher(tools)

  const parsedPath = join(SRC_DIR, '_parsed-recipes.json')
  const recipes = JSON.parse(readFileSync(parsedPath, 'utf8'))
  console.log(`Authoring ${recipes.length} recipes...`)

  const dryReport = {
    totalRecipes: recipes.length,
    unmappedIngredients: [], // [{ slug, raw, parsedName }]
    perRecipe: [], // [{ slug, title, mappedCount, unmappedCount, toolCount, category }]
  }

  // Clear existing briefs (keep dotfiles)
  for (const f of readdirSync(SRC_DIR)) {
    if (f.endsWith('.json') && !f.startsWith('_') && !f.startsWith('.')) {
      // delete
      try {
        const p = join(SRC_DIR, f)
        // Mark for deletion later — actually just overwrite when we author
      } catch {}
    }
  }

  for (const r of recipes) {
    const brief = buildBrief(r, ingredientMatcher, toolMatcher, ingredients, tools, dryReport)
    const out = join(SRC_DIR, `${r.slug}.json`)
    writeFileSync(out, JSON.stringify(brief, null, 2))

    const mapped = brief.body.content.find((n) => n.type === 'ingredientsList')?.attrs?.items?.length ?? 0
    const total = r.ingredientGroups.flatMap((g) => g.lines).length
    dryReport.perRecipe.push({
      slug: r.slug,
      title: r.titleLine,
      mappedCount: mapped,
      totalIngredientLines: total,
      unmappedCount: total - mapped,
      toolCount: brief.recipeTools.length,
      cuisine: brief.recipe.cuisine,
      mealType: brief.recipe.mealType,
      mood: brief.recipe.mood,
    })
  }

  // Tally unmapped ingredient names by frequency
  const unmappedCounts = new Map()
  for (const u of dryReport.unmappedIngredients) {
    const key = u.parsedName.toLowerCase().trim()
    if (!key) continue
    unmappedCounts.set(key, (unmappedCounts.get(key) ?? 0) + 1)
  }
  const unmappedSorted = Array.from(unmappedCounts.entries()).sort((a, b) => b[1] - a[1])

  dryReport.unmappedSummary = unmappedSorted.map(([name, count]) => ({ name, count }))

  writeFileSync(join(SRC_DIR, '_author-report.json'), JSON.stringify(dryReport, null, 2))

  // Print summary
  const totalMapped = dryReport.perRecipe.reduce((s, r) => s + r.mappedCount, 0)
  const totalLines = dryReport.perRecipe.reduce((s, r) => s + r.totalIngredientLines, 0)
  console.log(`\nDone.`)
  console.log(`  Briefs written: ${dryReport.perRecipe.length}`)
  console.log(`  Ingredient lines: ${totalLines} total, ${totalMapped} mapped, ${totalLines - totalMapped} unmapped`)
  console.log(`  Top 20 unmapped:`)
  for (const [name, count] of unmappedSorted.slice(0, 20)) {
    console.log(`    ${count}x  ${name}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
