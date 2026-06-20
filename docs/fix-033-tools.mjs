import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DIR = 'C:/Users/Rebecca/Projects/code/homemade/docs/baking-bulk-033-briefs';

// Remap near-duplicate tool slugs to canonical DB slugs
const TOOL_SLUG_MAP = {
  'wire-rack': 'cooling-rack',
  'parchment-paper': 'baking-paper',
  'silicone-mat': 'baking-mat',
  'spatula-silicone': 'silicone-spatula',
  'palette-knife-straight': 'palette-knife',
  'turntable-cake': 'cake-turntable',
  'tart-tin-23cm': 'tart-tin',
  'loaf-tin-900g': 'loaf-tin',
  'large-frying-pan': 'frying-pan-30',
  'blender': 'blender-jug',
  'cake-tin-18cm-round': 'round-cake-tin-20',
  'cake-tin-20cm-round': 'round-cake-tin-20',
  'cake-tin-22cm-round': 'round-cake-tin-23',
};

const files = readdirSync(DIR).filter(f => f.endsWith('.json')).sort();

for (const file of files) {
  const path = join(DIR, file);
  const data = JSON.parse(readFileSync(path, 'utf8'));

  if (Array.isArray(data.recipeTools)) {
    data.recipeTools = data.recipeTools.map(t => ({
      ...t,
      slug: TOOL_SLUG_MAP[t.slug] ?? t.slug,
    }));
    // Deduplicate (two tins might remap to the same slug)
    const seen = new Set();
    data.recipeTools = data.recipeTools.filter(t => {
      if (seen.has(t.slug)) return false;
      seen.add(t.slug);
      return true;
    });
  }

  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`Fixed tools: ${file}`);
}

console.log(`\nDone — remapped tools in ${files.length} briefs.`);
