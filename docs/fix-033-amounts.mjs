import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DIR = 'C:/Users/Rebecca/Projects/code/homemade/docs/baking-bulk-033-briefs';

function fixNullAmounts(item) {
  if (item.amount !== null && item.amount !== undefined) return item;
  if (item.unit !== null && item.unit !== undefined) return item; // already has unit

  // Determine sensible amount + unit based on slug and prepNote
  const slug = (item.ingredientSlug || '').toLowerCase();
  const prepNote = (item.prepNote || '').toLowerCase();

  let amount = 1;
  let unit = 'tbsp';
  let isOptional = item.isOptional;

  if (/a pinch|pinch/.test(prepNote)) {
    amount = null;
    unit = 'pinch';
  } else if (/optional/.test(prepNote)) {
    isOptional = true;
    if (slug.includes('colour') || slug.includes('color') || slug.includes('food-colour')) {
      amount = 1; unit = 'tsp';
    } else if (slug.includes('dust') || slug.includes('lustre') || slug.includes('petal-dust')) {
      amount = null; unit = 'pinch';
    } else {
      amount = 1; unit = 'tsp';
    }
  } else if (slug.includes('icing-sugar') || slug === 'icing-sugar') {
    amount = 1; unit = 'tbsp';
    if (/for dusting|dusting/.test(prepNote)) isOptional = true;
  } else if (slug.includes('food-colour') || slug.includes('food-colouring') || slug.includes('food-coloring')) {
    amount = 1; unit = 'tsp';
  } else if (slug.includes('lustre') || slug.includes('petal-dust') || slug.includes('dust')) {
    amount = null; unit = 'pinch';
  } else if (slug.includes('rose-petals') || slug.includes('edible') || /to decorate|to garnish|to serve/.test(prepNote)) {
    amount = 1; unit = 'tbsp'; isOptional = true;
  } else {
    // Generic fallback: small amount
    amount = 1; unit = 'tbsp';
  }

  return { ...item, amount, unit, isOptional };
}

function fixBody(body) {
  if (!body || typeof body !== 'object') return body;
  if (body.type === 'ingredientsList' && Array.isArray(body.attrs?.items)) {
    return {
      ...body,
      attrs: {
        ...body.attrs,
        items: body.attrs.items.map(fixNullAmounts),
      },
    };
  }
  if (Array.isArray(body.content)) {
    return { ...body, content: body.content.map(fixBody) };
  }
  return body;
}

const files = readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
let fixed = 0;

for (const file of files) {
  const path = join(DIR, file);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  if (data.body) {
    const original = JSON.stringify(data.body);
    data.body = fixBody(data.body);
    if (JSON.stringify(data.body) !== original) {
      fixed++;
      console.log(`Fixed amounts: ${file}`);
    }
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

console.log(`\nDone — fixed null amounts in ${fixed} briefs.`);
