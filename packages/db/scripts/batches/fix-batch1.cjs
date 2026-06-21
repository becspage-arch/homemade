const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'sprint-worker-1');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

// Replace em-dashes in all text nodes
function fixEmDash(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach(fixEmDash); return; }
  if (node.type === 'text' && typeof node.text === 'string') {
    node.text = node.text.replace(/ — /g, ': ');
  }
  for (const v of Object.values(node)) if (typeof v === 'object') fixEmDash(v);
}

// Find and mark the first occurrence of a term in the body
function addGlossaryTooltip(body, termSlug, searchStr) {
  const lower = searchStr.toLowerCase();
  function walk(node) {
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) { for (const i of node) { if (walk(i)) return true; } return false; }
    if (!node.content) return false;
    for (let i = 0; i < node.content.length; i++) {
      const child = node.content[i];
      if (child.type === 'text' && typeof child.text === 'string') {
        const alreadyMarked = child.marks && child.marks.some(m => m.type === 'glossaryTooltip' && m.attrs && m.attrs.termSlug === termSlug);
        if (!alreadyMarked) {
          const idx = child.text.toLowerCase().indexOf(lower);
          if (idx >= 0) {
            const before = child.text.slice(0, idx);
            const match = child.text.slice(idx, idx + lower.length);
            const after = child.text.slice(idx + lower.length);
            const existingMarks = (child.marks || []).filter(m => m.type !== 'glossaryTooltip');
            const newNodes = [];
            if (before) newNodes.push({ type: 'text', text: before, ...(existingMarks.length ? { marks: existingMarks } : {}) });
            newNodes.push({ type: 'text', text: match, marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }] });
            if (after) newNodes.push({ type: 'text', text: after, ...(existingMarks.length ? { marks: existingMarks } : {}) });
            node.content.splice(i, 1, ...newNodes);
            return true;
          }
        }
      }
      if (walk(child)) return true;
    }
    return false;
  }
  return walk(body);
}

// Term slug -> search string (what to look for in prose)
const TERM_SEARCH = {
  'poaching': 'poach',
  'searing': 'sear',
  'duxelles': 'duxelles',
  'braising': 'brais',
  'guanciale': 'guanciale',
  'ragu': 'rag',
  'tempering-eggs': 'temper',
  'pasta-water': 'pasta water',
  'gluten': 'gluten',
  'pizza-stone': 'pizza stone',
  'crimping': 'crimp',
  'suet-pastry': 'suet',
  'deglaze': 'deglaz',
  'bechamel': null,      // remove — not mentioned in body
  'blind-baking': null,  // remove — not applicable
};

let totalFixed = 0, totalWarnings = 0;

for (const f of files) {
  const fp = path.join(dir, f);
  const raw = fs.readFileSync(fp, 'utf8');
  let obj;
  try { obj = JSON.parse(raw); } catch(e) { console.log('PARSE ERROR ' + f); continue; }

  fixEmDash(obj.body);

  const glossTerms = obj.glossaryTerms || [];
  const keepTerms = [];
  for (const gt of glossTerms) {
    const override = TERM_SEARCH[gt.slug];
    if (override === null) {
      // explicitly remove this term
      console.log(f + ': REMOVING term [' + gt.slug + '] (not in prose)');
      continue;
    }
    const searchStr = override || gt.term;
    const found = addGlossaryTooltip(obj.body, gt.slug, searchStr);
    if (!found) {
      console.log(f + ': WARNING could not find "' + searchStr + '" for term [' + gt.slug + '] — removing');
      totalWarnings++;
    } else {
      keepTerms.push(gt);
    }
  }
  obj.glossaryTerms = keepTerms;

  fs.writeFileSync(fp, JSON.stringify(obj, null, 2));
  totalFixed++;
}

console.log('\nDone. Fixed ' + totalFixed + ' files. Warnings: ' + totalWarnings);
