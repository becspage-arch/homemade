import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DIR = 'C:/Users/Rebecca/Projects/code/homemade/docs/baking-bulk-033-briefs';

const DIETARY_FLAG_MAP = {
  vegetarian: 'VEGETARIAN',
  vegan: 'VEGAN',
  glutenFree: 'GLUTEN_FREE',
  glutenfree: 'GLUTEN_FREE',
  dairyFree: 'DAIRY_FREE',
  dairyfree: 'DAIRY_FREE',
  nutFree: 'NUT_FREE',
  nutfree: 'NUT_FREE',
  eggFree: 'EGG_FREE',
  eggfree: 'EGG_FREE',
};

// Fix ingredient slugs that differ from DB canonical form
const SLUG_MAP = {
  'eggs-large': 'eggs',
};

// Fix unit values
const UNIT_MAP = {
  each: 'large',  // eggs use "large" not "each"
};

function normaliseDietaryFlags(flags) {
  if (!Array.isArray(flags)) return flags;
  return flags.map(f => {
    if (/^[A-Z_]+$/.test(f)) return f; // already uppercase
    return DIETARY_FLAG_MAP[f] || f.toUpperCase();
  });
}

function convertNode(node) {
  if (!node || typeof node !== 'object') return node;

  // Convert bulletList with attrs.type="ingredientsList" → ingredientsList node
  if (
    node.type === 'bulletList' &&
    node.attrs?.type === 'ingredientsList' &&
    Array.isArray(node.content)
  ) {
    const items = [];
    for (const listItem of node.content) {
      const para = listItem?.content?.[0];
      const textNode = para?.content?.[0];
      if (!textNode) continue;
      const mark = textNode.marks?.find(m => m.type === 'ingredient');
      if (!mark) continue;
      const rawSlug = mark.attrs.ingredientSlug;
      const rawUnit = mark.attrs.unit;
      items.push({
        ingredientSlug: SLUG_MAP[rawSlug] ?? rawSlug,
        amount: mark.attrs.quantity ?? null,
        unit: UNIT_MAP[rawUnit] ?? rawUnit,
        prepNote: mark.attrs.prepNote ?? null,
        isOptional: false,
      });
    }
    return { type: 'ingredientsList', attrs: { items } };
  }

  if (Array.isArray(node.content)) {
    return { ...node, content: node.content.map(convertNode) };
  }
  return node;
}

const files = readdirSync(DIR).filter(f => f.endsWith('.json')).sort();

for (const file of files) {
  const path = join(DIR, file);
  const data = JSON.parse(readFileSync(path, 'utf8'));

  if (data.body) {
    data.body = convertNode(data.body);
  }

  if (data.recipe?.dietaryFlags) {
    data.recipe.dietaryFlags = normaliseDietaryFlags(data.recipe.dietaryFlags);
  }

  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`Converted: ${file}`);
}

console.log(`\nDone — converted ${files.length} briefs.`);
