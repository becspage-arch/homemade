const fs = require('fs');
const dir = 'C:/Users/Rebecca/Projects/code/homemade/docs/pottery-ceramics-bulk-004-briefs';

function load(f) { return JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8')); }
function save(f, d) { fs.writeFileSync(dir + '/' + f, JSON.stringify(d, null, 2), 'utf8'); }

// Replace all en-dashes and em-dashes in a text string with appropriate alternatives
function fixDashes(text) {
  // Range dash (number–number): replace with hyphen
  text = text.replace(/(\d)–(\d)/g, '$1-$2');
  text = text.replace(/(\d)—(\d)/g, '$1-$2');
  // Prose em-dash patterns: handled manually below
  return text;
}

// File 12: grade-level at bulletList[13] listItem[1]
{
  const d = load('12-sgraffito-line-work-tile.json');
  const n = d.body.content[13].content[1].content[0].content[0];
  n.text = 'Scratch a diamond repeat pattern instead of botanical line-work, for a more geometric tile.';
  save('12-sgraffito-line-work-tile.json', d);
  console.log('12: fixed bulletList[13] listItem[1]');
}

// File 25: paragraph[8] - em-dash prose + en-dash range
{
  const d = load('25-throwing-a-vase-with-narrow-neck.json');
  const n = d.body.content[8].content[0];
  n.text = n.text
    .replace('neck will start — approximately 30 mm below the rim', 'neck will start, approximately 30 mm below the rim')
    .replace(/(\d)–(\d)/g, '$1-$2')
    .replace(/(\d)—(\d)/g, '$1-$2');
  save('25-throwing-a-vase-with-narrow-neck.json', d);
  console.log('25: fixed paragraph[8]');
}

// File 26: paragraph[6] en-dash + paragraph[8] em-dash
{
  const d = load('26-throwing-a-shallow-open-bowl.json');
  // paragraph[6] has multiple nodes, node[2] has the en-dash
  const n6 = d.body.content[6].content[2];
  n6.text = n6.text.replace(/(\d)–(\d)/g, '$1-$2').replace(/(\d)—(\d)/g, '$1-$2');
  // paragraph[8] single node
  const n8 = d.body.content[8].content[0];
  n8.text = n8.text
    .replace('one or two passes only — a shallow bowl does not benefit from many thin pulls.', 'one or two passes only. A shallow bowl does not benefit from many thin pulls.')
    .replace('only – a shallow bowl does not benefit from many thin pulls.', 'only. A shallow bowl does not benefit from many thin pulls.');
  save('26-throwing-a-shallow-open-bowl.json', d);
  console.log('26: fixed p6 + p8');
}

// File 27: paragraph[6] en-dash in range
{
  const d = load('27-throwing-a-tea-bowl.json');
  // paragraph[6] has multiple nodes - find node with the en-dash
  d.body.content[6].content.forEach(n => {
    if (n.text) n.text = n.text.replace(/(\d)–(\d)/g, '$1-$2').replace(/(\d)—(\d)/g, '$1-$2');
  });
  save('27-throwing-a-tea-bowl.json', d);
  console.log('27: fixed p6 en-dash');
}

// File 28: paragraph[4] em-dash
{
  const d = load('28-throwing-a-set-of-matching-espresso-cups.json');
  const n = d.body.content[4].content[0];
  n.text = n.text
    .replace('same weight — 250 g is a good starting point', 'same weight: 250 g is a good starting point')
    .replace('same weight – 250 g is a good starting point', 'same weight: 250 g is a good starting point');
  save('28-throwing-a-set-of-matching-espresso-cups.json', d);
  console.log('28: fixed paragraph[4]');
}

// File 30: paragraphs [4], [6], [8] - all en-dashes in ranges
{
  const d = load('30-throwing-a-lidded-honey-pot.json');
  // p4 node[0]
  d.body.content[4].content[0].text = d.body.content[4].content[0].text.replace(/(\d)–(\d)/g, '$1-$2').replace(/(\d)—(\d)/g, '$1-$2');
  // p6 node[0]
  d.body.content[6].content[0].text = d.body.content[6].content[0].text.replace(/(\d)–(\d)/g, '$1-$2').replace(/(\d)—(\d)/g, '$1-$2');
  // p8 - scan all nodes
  d.body.content[8].content.forEach(n => {
    if (n.text) n.text = n.text.replace(/(\d)–(\d)/g, '$1-$2').replace(/(\d)—(\d)/g, '$1-$2');
  });
  save('30-throwing-a-lidded-honey-pot.json', d);
  console.log('30: fixed p4+p6+p8 en-dashes');
}

// File 31: paragraph[8] en-dash
{
  const d = load('31-iron-oxide-wash-on-bisqueware.json');
  d.body.content[8].content[0].text = d.body.content[8].content[0].text.replace(/(\d)–(\d)/g, '$1-$2').replace(/(\d)—(\d)/g, '$1-$2');
  save('31-iron-oxide-wash-on-bisqueware.json', d);
  console.log('31: fixed paragraph[8]');
}

// File 35: paragraph[6] en-dash
{
  const d = load('35-glaze-trailing-on-a-flat-stoneware-plate.json');
  d.body.content[6].content[0].text = d.body.content[6].content[0].text.replace(/(\d)–(\d)/g, '$1-$2').replace(/(\d)—(\d)/g, '$1-$2');
  save('35-glaze-trailing-on-a-flat-stoneware-plate.json', d);
  console.log('35: fixed paragraph[6]');
}

// Global pass: fix any remaining en-dashes (U+2013) in ranges across all files
// (belt-and-suspenders to catch any that were missed)
const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
let globalFixed = 0;
for (const f of allFiles) {
  const content = fs.readFileSync(dir + '/' + f, 'utf8');
  // Check for en-dashes between digits (numeric ranges)
  const fixed = content.replace(/(\d)–(\d)/g, '$1-$2');
  if (fixed !== content) {
    fs.writeFileSync(dir + '/' + f, fixed, 'utf8');
    console.log('Global en-dash fix: ' + f);
    globalFixed++;
  }
}
console.log('Global en-dash fix applied to ' + globalFixed + ' additional files');

// Validate all
let valid = true;
for (const f of allFiles) {
  try { JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8')); }
  catch(e) { console.log('INVALID JSON: ' + f + ' ' + e.message); valid = false; }
}
if (valid) console.log('All 40 files valid JSON.');
