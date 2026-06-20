import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DIR = 'C:/Users/Rebecca/Projects/code/homemade/docs/baking-bulk-033-briefs';

// Maps brief-generated slugs to canonical DB slugs
const SLUG_MAP = {
  'food-colouring-gel': 'food-colouring',
  'fondant-block': 'fondant-icing',
  'fondant-rolled': 'rolled-fondant',
  'dried-edible-rose-petals': 'dried-rose-petals',
  'condensed-milk-sweetened': 'condensed-milk',
  'apricot-fresh': 'apricots',
  'armagnac': 'brandy',
  'blueberry-jam': 'blueberry-jam',   // now added to DB — keep as-is
  'chestnuts-fresh': 'chestnuts',
  'chilli-flakes-dried': 'chilli-flakes',
  'cloves-ground': 'cloves',
  'coconut-flakes-toasted': 'desiccated-coconut',
  'cranberries-fresh': 'cranberries',
  'cream-cheese-full-fat': 'cream-cheese',
  'flaxseed-ground': 'flaxseed',
  'mini-marshmallows': 'marshmallows',
  'peanut-butter-smooth': 'peanut-butter',
  'pistachios-raw': 'pistachios',
  'prunes-agen': 'prunes',
  'pumpkin-puree-tinned': 'pumpkin-puree',
  'semolina-coarse': 'semolina',
  'sesame-seeds-white': 'sesame-seeds',
  'sourdough-discard': 'sourdough-starter',
  'walnut-halves': 'walnuts',
};

function remapIngredients(items) {
  return items.map(item => {
    const mapped = SLUG_MAP[item.ingredientSlug];
    if (mapped && mapped !== item.ingredientSlug) {
      return { ...item, ingredientSlug: mapped };
    }
    return item;
  });
}

function fixBody(body) {
  if (!body || typeof body !== 'object') return body;
  if (body.type === 'ingredientsList' && Array.isArray(body.attrs?.items)) {
    return {
      ...body,
      attrs: { ...body.attrs, items: remapIngredients(body.attrs.items) },
    };
  }
  if (Array.isArray(body.content)) {
    return { ...body, content: body.content.map(fixBody) };
  }
  return body;
}

const files = readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
let fixedCount = 0;

for (const file of files) {
  const path = join(DIR, file);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  if (data.body) {
    const before = JSON.stringify(data.body);
    data.body = fixBody(data.body);
    if (JSON.stringify(data.body) !== before) {
      fixedCount++;
      console.log(`Remapped: ${file}`);
    }
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

console.log(`\nDone — remapped ingredient slugs in ${fixedCount} briefs.`);
