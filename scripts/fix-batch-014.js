#!/usr/bin/env node
// Removes the safety infoPanel (tone:"warning", safety-advice title) from
// wood-natural-craft bulk-001 briefs. Runs as a one-shot fix.

const fs = require('fs');
const path = require('path');

const BRIEFS_DIR = path.join(__dirname, '..', 'docs', 'wood-natural-craft-bulk-001-briefs');

const SAFETY_TITLES = [
  'Before you start cutting',
  'Before you start burning',
  'Before you start',
];

let fixed = 0;
let skipped = 0;

for (const file of fs.readdirSync(BRIEFS_DIR).filter(f => f.endsWith('.json'))) {
  const filePath = path.join(BRIEFS_DIR, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const doc = JSON.parse(raw);

  const content = doc && doc.body && doc.body.content;
  if (!Array.isArray(content)) { skipped++; continue; }

  const before = content.length;
  const filtered = content.filter(function(node) {
    if (node.type !== 'infoPanel') return true;
    if (node.attrs && node.attrs.tone !== 'warning') return true;
    if (node.attrs && SAFETY_TITLES.indexOf(node.attrs.title) !== -1) return false;
    return true;
  });

  if (filtered.length === before) { skipped++; continue; }

  doc.body.content = filtered;
  fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
  console.log('Fixed: ' + file + ' (removed ' + (before - filtered.length) + ' infoPanel)');
  fixed++;
}

console.log('\nDone: ' + fixed + ' fixed, ' + skipped + ' unchanged');
