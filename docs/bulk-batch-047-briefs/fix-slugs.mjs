import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const dir = 'C:/Users/Rebecca/Projects/code/homemade/docs/bulk-batch-047-briefs/';

const INGREDIENT_MAP = {
  'amchur-powder': 'amchur',
  'breadcrumbs': 'breadcrumbs-dried',
  'bread-brown': 'bread',
  'cabbage': 'cabbage-white',
  'chicken-thighs': 'chicken-thigh',
  'cold-water': 'water',
  'cooked-ham': 'ham-cooked',
  'cooked-prawns': 'prawns-cooked',
  'dried-mixed-spice': 'mixed-spice',
  'dried-oregano': 'oregano-dried',
  'flaked-almonds': 'almonds-flaked',
  'flat-leaf-parsley': 'parsley-flat',
  'fresh-coriander': 'coriander-fresh',
  'fresh-thyme': 'thyme-fresh',
  'frozen-peas': 'peas-frozen',
  'garlic-cloves': 'garlic',
  'green-chilli': 'chilli-green',
  'green-pepper': 'pepper-green',
  'ground-coriander': 'coriander-ground',
  'ground-cumin': 'cumin-ground',
  'ground-mace': 'mace-ground',
  'instant-yeast': 'yeast-fast-action',
  'kashmiri-chilli-powder': 'chilli-powder',
  'lamb-neck-chops': 'lamb-neck',
  'mackerel-fillet': 'mackerel-fillets',
  'oats-rolled': 'rolled-oats',
  'panko-breadcrumbs': 'breadcrumbs-panko',
  'pork-sausages': 'sausages-pork',
  'red-pepper': 'pepper-red',
  'savoy-cabbage': 'cabbage-savoy',
  'shredded-suet': 'suet-shredded',
  'spring-onions': 'spring-onion',
  'strong-white-flour': 'strong-bread-flour',
  'tinned-sweetcorn': 'sweetcorn-tinned',
  'tinned-tuna': 'tuna-tinned',
  'tomatoes-tinned': 'tinned-tomatoes',
  'yogurt-natural': 'plain-yoghurt',
};

const TOOL_MAP = {
  'casserole-dish-large': 'dutch-oven',
  'baking-dish-rectangular': 'rectangular-baking-tin',
  'heavy-frying-pan': 'frying-pan-30',
};

function fixSlugs(obj, filename) {
  if (Array.isArray(obj)) {
    return obj.map(item => fixSlugs(item, filename));
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'ingredientSlug' && typeof value === 'string') {
        const fixed = INGREDIENT_MAP[value];
        if (fixed) {
          result[key] = fixed;
        } else {
          result[key] = value;
        }
      } else if (key === 'slug' && typeof value === 'string') {
        // Could be recipeTools slug or glossaryTerms slug or other slug
        // Only fix tool slugs that match our tool map
        const fixedTool = TOOL_MAP[value];
        if (fixedTool) {
          result[key] = fixedTool;
        } else {
          result[key] = value;
        }
      } else if (key === 'text' && typeof value === 'string') {
        // Fix scaling tokens in body text {{slug}}
        let text = value;
        for (const [wrong, correct] of Object.entries(INGREDIENT_MAP)) {
          text = text.replaceAll(`{{${wrong}}}`, `{{${correct}}}`);
        }
        result[key] = text;
      } else if (typeof value === 'object') {
        result[key] = fixSlugs(value, filename);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
  return obj;
}

const files = readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('fix-'));
let changed = 0;

for (const f of files) {
  const original = readFileSync(join(dir, f), 'utf8');
  const data = JSON.parse(original);
  const fixed = fixSlugs(data, f);
  const fixedStr = JSON.stringify(fixed, null, 2);
  if (fixedStr !== original) {
    writeFileSync(join(dir, f), fixedStr);
    changed++;
    // Show what was fixed
    for (const [wrong, correct] of Object.entries({...INGREDIENT_MAP, ...TOOL_MAP})) {
      if (original.includes(wrong) && fixedStr.includes(correct)) {
        const count = (original.match(new RegExp(wrong, 'g')) || []).length;
        if (count > 0) process.stdout.write(`${f}: ${wrong} → ${correct} (${count}x)\n`);
      }
    }
  }
}

console.log(`\nFixed ${changed} files.`);
