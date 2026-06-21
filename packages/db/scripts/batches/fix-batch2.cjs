const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'sprint-worker-1');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

// Walk all text nodes and apply a transform
function walkText(node, fn) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach(n => walkText(n, fn)); return; }
  if (node.type === 'text' && typeof node.text === 'string') {
    node.text = fn(node.text);
  }
  for (const v of Object.values(node)) if (typeof v === 'object') walkText(v, fn);
}

// Walk ALL string values (including non-text-node fields like excerpt, sourceNotes, troubleshooter attrs)
function walkAllStrings(obj, fn) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) { obj.forEach(v => walkAllStrings(v, fn)); return; }
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') obj[k] = fn(v);
    else if (typeof v === 'object') walkAllStrings(v, fn);
  }
}

function fixEnDashRanges(s) {
  // Replace N–M (en-dash between numbers) with "N to M"
  return s.replace(/(\d+(?:\.\d+)?)–(\d+(?:\.\d+)?)/g, '$1 to $2');
}

function fixBannedWords(s) {
  return s
    .replace(/\bgenuinely\b/g, 'properly')
    .replace(/\bessentially\b/g, 'mainly')
    .replace(/\bfundamentally\b/g, 'directly')
    .replace(/\bstove\b/g, 'hob')
    .replace(/\bfall\b(?= apart| off| out| through| away| on | in | to )/g, 'autumn')
    // "fall apart" → "come apart" but only in the verdure-alla-griglia context
    .replace(/Onion wedges fall apart on the griddle/, 'Onion wedges come apart on the griddle')
    .replace(/\b72 hours\b/g, '3 days')
    .replace(/\b72 hour\b/g, '3-day');
}

// Fix "Flake the tuna" → "Break the tuna into flakes" (brand name collision)
function fixFlake(s) {
  return s.replace(/^Flake\b/, 'Break').replace(/\bFlake the tuna\b/g, 'Break the tuna into flakes');
}

// Fix Mrs Beeton in body: move reference to be inline as historical figure with gloss
// The line is: "Mrs Beeton's 1861 Book of Household Management..." - rephrase without the name
function fixBeeton(s) {
  return s
    .replace(/Mrs Beeton's 1861 Book of Household Management/g, 'the 1861 cookbook Book of Household Management')
    .replace(/Mrs Beeton/g, 'Isabella Beeton (1836 to 1865), the Victorian household writer,');
}

for (const f of files) {
  const fpath = path.join(dir, f);
  const data = JSON.parse(fs.readFileSync(fpath, 'utf8'));
  let changed = false;

  // Fix servings + yieldDescription conflict
  if (data.recipe && data.recipe.servings !== null && data.recipe.yieldDescription !== null && data.recipe.yieldDescription !== undefined) {
    // For dough recipe, null servings and keep yieldDescription
    if (f.includes('dough')) {
      data.recipe.servings = null;
    } else {
      // For everything else, null yieldDescription and keep servings
      data.recipe.yieldDescription = null;
    }
    changed = true;
    console.log(f + ': fixed servings/yieldDescription conflict');
  }

  // Apply string transforms to all string fields
  const before = JSON.stringify(data);
  walkAllStrings(data, s => fixEnDashRanges(fixBannedWords(fixFlake(fixBeeton(s)))));
  const after = JSON.stringify(data);
  if (before !== after) changed = true;

  if (changed) {
    fs.writeFileSync(fpath, JSON.stringify(data, null, 2));
    console.log(f + ': saved');
  }
}
console.log('Done');
