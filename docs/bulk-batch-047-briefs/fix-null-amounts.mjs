import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const dir = 'C:/Users/Rebecca/Projects/code/homemade/docs/bulk-batch-047-briefs/';
const files = readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('fix-'));

// QUALITATIVE_UNIT_RE from shared.ts: pinch|sprig|sprigs|handful|splash|drizzle|knob|dash|grind|grinds|glug|squeeze|to taste|few|some|sprinkle
// MEASURED_UNIT_RE: g|kg|ml|l|tsp|tbsp|each|cup|oz|lb|clove|slice|can|tin|sheet|stick|stalk|rasher|fillet|bunch|head

function fixItem(item) {
  if (item.amount !== null && item.amount !== undefined) return item; // has amount - fine
  const unit = (item.unit || '').trim().toLowerCase();
  const prepNote = (item.prepNote || '').toLowerCase();
  const slug = item.ingredientSlug || '';
  
  // Already qualitative unit
  const qualitative = /^(pinch|sprig|sprigs|handful|splash|drizzle|knob|dash|grind|grinds|glug|squeeze|to taste|few|some|sprinkle)$/i;
  if (qualitative.test(item.unit || '')) return item;
  
  // Determine fix based on ingredient and prepNote context
  
  // Salt / fine seasoning "to taste" or similar
  if (slug.includes('salt') || slug === 'sea-salt-fine' || slug === 'salt-table') {
    if (prepNote.includes('no seasoning needed') || prepNote.includes('optional')) {
      // Remove from list entirely
      return null;
    }
    return { ...item, unit: 'pinch' };
  }
  
  // Black pepper / white pepper / cayenne / paprika garnish
  if (slug === 'black-pepper' || slug === 'black-pepper-ground' || slug === 'white-pepper') {
    return { ...item, unit: 'grind' };
  }
  if (slug === 'cayenne' || slug === 'paprika-sweet') {
    if (prepNote.includes('pinch') || prepNote.includes('garnish')) {
      return { ...item, unit: 'pinch' };
    }
    return { ...item, unit: 'pinch' };
  }
  
  // Nutmeg "a grating"
  if (slug === 'nutmeg') {
    return { ...item, unit: 'grind' };
  }
  
  // Chives / parsley garnish (small handful / to finish)
  if (slug === 'chives' || slug === 'parsley-flat' || slug === 'coriander-fresh') {
    if (prepNote.includes('to finish') || prepNote.includes('to serve') || prepNote.includes('to garnish') || prepNote.includes('handful')) {
      return { ...item, unit: 'handful' };
    }
    if (prepNote.includes('optional')) {
      return { ...item, unit: 'handful' };
    }
    // Fall through to give a sensible amount
    return { ...item, unit: 'handful' };
  }
  
  // Malt vinegar / ketchup / sauces "to serve"
  if (slug === 'malt-vinegar' || slug === 'ketchup' || slug === 'brown-sauce') {
    return { ...item, unit: 'splash' };
  }
  
  // Sunflower oil for frying
  if (slug === 'sunflower-oil' && prepNote.includes('frying')) {
    return { ...item, amount: 500, unit: 'ml' };
  }
  
  // Lettuce (a few leaves)
  if (slug === 'lettuce' && prepNote.includes('few')) {
    return { ...item, amount: 2, unit: 'each' };
  }
  
  // Generic fallback: if prepNote mentions "to taste" / "to serve" / "a pinch" / "to season"
  if (prepNote.includes('to taste') || prepNote.includes('to season')) {
    if (unit === 'g') return { ...item, unit: 'pinch' };
    if (unit === 'tsp') return { ...item, unit: 'pinch' };
    if (unit === 'ml') return { ...item, unit: 'splash' };
    return { ...item, unit: 'pinch' };
  }
  if (prepNote.includes('to serve') || prepNote.includes('to garnish') || prepNote.includes('to finish')) {
    if (unit === 'ml') return { ...item, unit: 'splash' };
    if (unit === 'g') return { ...item, unit: 'pinch' };
    return { ...item, unit: 'splash' };
  }
  if (prepNote.includes('a pinch') || prepNote.includes('a grating') || prepNote.includes('a small grating')) {
    return { ...item, unit: 'pinch' };
  }
  if (prepNote.includes('optional')) {
    if (unit === 'g') return { ...item, unit: 'handful' };
    return { ...item, unit: 'splash' };
  }
  
  // Unknown - log it
  console.log('UNHANDLED:', slug, 'unit:', unit, 'prepNote:', item.prepNote);
  return item;
}

let changed = 0;
for (const f of files) {
  const original = readFileSync(join(dir, f), 'utf8');
  const data = JSON.parse(original);
  
  // Find ingredientsList node in body
  let modified = false;
  const body = data.body;
  if (!body || !body.content) continue;
  
  for (const node of body.content) {
    if (node.type === 'ingredientsList' && Array.isArray(node.attrs?.items)) {
      const fixedItems = node.attrs.items.map(item => fixItem(item)).filter(Boolean);
      if (JSON.stringify(fixedItems) !== JSON.stringify(node.attrs.items)) {
        node.attrs.items = fixedItems;
        modified = true;
      }
    }
  }
  
  if (modified) {
    writeFileSync(join(dir, f), JSON.stringify(data, null, 2));
    changed++;
    console.log('Fixed:', f.replace('.json', ''));
  }
}
console.log('\nFixed', changed, 'files');
