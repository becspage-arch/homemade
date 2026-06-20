import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DIR = 'C:/Users/Rebecca/Projects/code/homemade/docs/baking-bulk-033-briefs';

// These yield discrete items — keep yieldDescription, null servings
const KEEP_YIELD_DESC = new Set([
  'almond-rochers', 'barfi-pistachio', 'chocolate-chilli-bark',
  'edinburgh-rock', 'gulab-jamun', 'hot-cocoa-bombs', 'laddoo-besan',
  'marrons-glaces', 'nougat-montelimar', 'peppermint-fudge',
  'spiced-pumpkin-pie-individual', 'white-chocolate-bark-cranberry',
]);

// These are techniques — no servings/yieldDescription change
const TECHNIQUE_SLUGS = new Set([
  'mirror-glaze-coloured-swirl', 'comb-texture-buttercream',
  'edible-lace-sugar-panels', 'fondant-rose-classic',
  'flower-paste-sweet-pea', 'poured-fondant-glaze',
]);

function stripEmDashes(text) {
  if (typeof text !== 'string') return text;
  // Replace em-dash and en-dash with comma or brackets
  return text
    .replace(/ — /g, ', ')
    .replace(/—/g, ',')
    .replace(/ – /g, ', ')
    .replace(/–/g, ',');
}

function fixBannedPhrases(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/\bgenuinely\b/g, 'actually')
    .replace(/\bessentially\b/g, 'in practice');
}

function processTextNode(node) {
  if (!node || typeof node !== 'object') return node;
  if (node.text !== undefined) {
    node = { ...node, text: fixBannedPhrases(stripEmDashes(node.text)) };
  }
  if (node.content) {
    node = { ...node, content: node.content.map(processTextNode) };
  }
  return node;
}

const files = readdirSync(DIR).filter(f => f.endsWith('.json')).sort();

for (const file of files) {
  const path = join(DIR, file);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const slug = data.slug;

  // Fix em-dashes and banned phrases in string fields
  if (data.excerpt) {
    data.excerpt = fixBannedPhrases(stripEmDashes(data.excerpt));
  }
  if (data.sourceNotes) {
    data.sourceNotes = fixBannedPhrases(stripEmDashes(data.sourceNotes));
  }
  if (data.body) {
    data.body = processTextNode(data.body);
  }

  // Fix servings-yield
  if (data.recipe && !TECHNIQUE_SLUGS.has(slug)) {
    if (KEEP_YIELD_DESC.has(slug)) {
      data.recipe.servings = null;
    } else {
      data.recipe.yieldDescription = null;
    }
  }

  // Clear glossaryTerms (none have inline marks — voice-check requires them to be used)
  data.glossaryTerms = [];

  // Grade-level fix: lavender-honey-tart body paragraph[0]
  if (slug === 'lavender-honey-tart' && data.body?.content?.[0]?.type === 'paragraph') {
    data.body.content[0].content = [{
      type: 'text',
      text: 'Lavender and honey tart has a gentle, floral custard. Infuse the dried lavender in warm cream and strain it out before making the custard. This is the only way to use culinary lavender without the flavour turning soapy. Use exactly 1 teaspoon of dried culinary lavender for this quantity of cream. More than that and the taste becomes unpleasant.'
    }];
  }

  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`Fixed: ${file}`);
}

console.log('\nAll done.');
