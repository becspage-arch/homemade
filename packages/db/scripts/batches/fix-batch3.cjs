const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'sprint-worker-1');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

function fixAllDashes(s) {
  // Replace em-dash (—) and en-dash (–) in prose contexts
  // Pattern: space-dash-space → colon-space
  return s
    .replace(/ — /g, ': ')
    .replace(/ – /g, ': ')
    // Leading dash: "— word" at start of phrase
    .replace(/^— /, ': ')
    // Trailing dash before comma/period
    .replace(/ —\./g, '.')
    .replace(/ —,/g, ',')
    // Any remaining isolated em-dash not between numbers
    .replace(/([a-zA-Z]) — ([a-zA-Z])/g, '$1: $2')
    .replace(/([a-zA-Z]) – ([a-zA-Z])/g, '$1: $2');
}

function walkAllStrings(obj, fn) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) { obj.forEach(v => walkAllStrings(v, fn)); return; }
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') obj[k] = fn(v);
    else if (typeof v === 'object') walkAllStrings(v, fn);
  }
}

let fixed = 0;
for (const f of files) {
  const fpath = path.join(dir, f);
  const data = JSON.parse(fs.readFileSync(fpath, 'utf8'));
  const before = JSON.stringify(data);
  walkAllStrings(data, fixAllDashes);
  const after = JSON.stringify(data);
  if (before !== after) {
    fs.writeFileSync(fpath, JSON.stringify(data, null, 2));
    console.log(f + ': fixed');
    fixed++;
  }
}
console.log('Done. Fixed ' + fixed + ' files.');
