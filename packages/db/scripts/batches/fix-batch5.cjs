// fix-batch5.cjs
// Remap ingredient slugs and tool slugs that don't exist in the master tables
// to equivalent slugs that do exist.

const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'sprint-worker-1');

// Ingredient slug remaps: missing -> existing equivalent
const INGREDIENT_REMAPS = {
  'olive-oil-extra-virgin': 'extra-virgin-olive-oil',
  'tipo-00-flour': '00-flour',
  'basil-fresh': 'basil',
  'chilli-dried-flakes': 'chilli-flakes',
  'parmigiano-reggiano': 'parmesan',
  'tinned-tuna': 'tuna-tinned',
  'artichoke-hearts-tinned': 'artichoke-hearts',
  'chestnuts-cooked': 'chestnut-cooked',
  'prosciutto-crudo': 'prosciutto',
  'parma-ham': 'prosciutto',
  'red-wine-dry': 'red-wine',
  'chilli-fresh-red': 'chilli-red',
  'red-pepper': 'pepper-red',
  'instant-yeast': 'yeast-fast-action',
  'tomatoes': 'tomato',
};

// Tool slug remaps: missing -> existing equivalent
const TOOL_REMAPS = {
  'large-frying-pan': 'frying-pan-30',
};

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
let totalChanged = 0;

for (const filename of files) {
  const fpath = path.join(dir, filename);
  const data = JSON.parse(fs.readFileSync(fpath, 'utf8'));
  let changed = false;

  // Remap ingredient slugs in body ingredientsList nodes
  function walkBody(node) {
    if (!node) return;
    if (node.type === 'ingredientsList' && node.attrs && Array.isArray(node.attrs.items)) {
      for (const item of node.attrs.items) {
        if (item.ingredientSlug && INGREDIENT_REMAPS[item.ingredientSlug]) {
          const old = item.ingredientSlug;
          item.ingredientSlug = INGREDIENT_REMAPS[item.ingredientSlug];
          console.log(`  ${filename}: ingredient ${old} -> ${item.ingredientSlug}`);
          changed = true;
        }
      }
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) walkBody(child);
    }
  }

  if (data.body) walkBody(data.body);

  // Remap tool slugs
  if (Array.isArray(data.recipeTools)) {
    for (const tool of data.recipeTools) {
      if (tool.slug && TOOL_REMAPS[tool.slug]) {
        const old = tool.slug;
        tool.slug = TOOL_REMAPS[tool.slug];
        console.log(`  ${filename}: tool ${old} -> ${tool.slug}`);
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(fpath, JSON.stringify(data, null, 2));
    totalChanged++;
  }
}

console.log(`Done. ${totalChanged} files changed.`);
