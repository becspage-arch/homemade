import { readFileSync, writeFileSync } from 'fs';
const dir = 'docs/sustainability-bulk-007-briefs';
const save = (name, data) => { writeFileSync(`${dir}/${name}`, JSON.stringify(data, null, 2)); console.log('saved:', name); };

// Remove unused glossary terms
function removeGlossaryTerm(data, slug) {
  data.glossaryTerms = data.glossaryTerms.filter(t => t.slug !== slug);
}

// Wrap first occurrence of termText in a text node with glossaryTooltip mark
function wrapFirstOccurrence(body, termText, termSlug) {
  // Walk content arrays looking for text nodes containing termText
  let done = false;
  function walk(arr) {
    if (done || !Array.isArray(arr)) return;
    for (let i = 0; i < arr.length; i++) {
      const node = arr[i];
      if (done) break;
      if (node.type === 'text' && node.text && node.text.includes(termText) && !node.marks) {
        const idx = node.text.indexOf(termText);
        const before = node.text.slice(0, idx);
        const after = node.text.slice(idx + termText.length);
        const tooltipNode = { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text: termText };
        const replacements = [];
        if (before) replacements.push({ type: 'text', text: before });
        replacements.push(tooltipNode);
        if (after) replacements.push({ type: 'text', text: after });
        arr.splice(i, 1, ...replacements);
        done = true;
        return;
      }
      if (node.content) walk(node.content);
    }
  }
  walk(body.content);
  return done;
}

// --- File 08: remove thermal-admittance ---
const f8 = JSON.parse(readFileSync(`${dir}/08-understanding-thermal-mass-in-retrofits.json`, 'utf8'));
removeGlossaryTerm(f8, 'thermal-admittance');
save('08-understanding-thermal-mass-in-retrofits.json', f8);

// --- File 11: wrap Microinverter ---
const f11 = JSON.parse(readFileSync(`${dir}/11-solar-pv-string-vs-microinverter-choice.json`, 'utf8'));
// Find first 'microinverter' (lowercase) in body
let done11 = wrapFirstOccurrence(f11.body, 'microinverters', 'microinverter');
if (!done11) done11 = wrapFirstOccurrence(f11.body, 'microinverter', 'microinverter');
console.log('11 microinverter wrapped:', done11);
save('11-solar-pv-string-vs-microinverter-choice.json', f11);

// --- File 12: wrap V2H ---
const f12 = JSON.parse(readFileSync(`${dir}/12-v2g-vehicle-to-grid-readiness.json`, 'utf8'));
const done12 = wrapFirstOccurrence(f12.body, 'V2H', 'v2h');
console.log('12 V2H wrapped:', done12);
save('12-v2g-vehicle-to-grid-readiness.json', f12);

// --- File 13: wrap Phase-change material, remove coefficient-of-performance ---
const f13 = JSON.parse(readFileSync(`${dir}/13-heat-battery-for-solar-storage.json`, 'utf8'));
removeGlossaryTerm(f13, 'coefficient-of-performance');
const done13 = wrapFirstOccurrence(f13.body, 'Phase-change material', 'phase-change-material');
console.log('13 Phase-change material wrapped:', done13);
save('13-heat-battery-for-solar-storage.json', f13);

// --- File 19: wrap Compost tea and Aerated compost tea ---
const f19 = JSON.parse(readFileSync(`${dir}/19-compost-tea-aerated-vs-simple-method.json`, 'utf8'));
const done19a = wrapFirstOccurrence(f19.body, 'Aerated compost tea (ACT)', 'aacted-compost-tea');
const done19b = wrapFirstOccurrence(f19.body, 'compost tea', 'compost-tea');
console.log('19 ACT wrapped:', done19a, '| compost tea wrapped:', done19b);
save('19-compost-tea-aerated-vs-simple-method.json', f19);

// --- File 23: remove compost-maturity and cress-germination-test ---
const f23 = JSON.parse(readFileSync(`${dir}/23-assessing-finished-compost-quality.json`, 'utf8'));
removeGlossaryTerm(f23, 'compost-maturity');
removeGlossaryTerm(f23, 'cress-germination-test');
save('23-assessing-finished-compost-quality.json', f23);

// --- File 25: wrap C:N ratio ---
const f25 = JSON.parse(readFileSync(`${dir}/25-seaweed-as-compost-additive.json`, 'utf8'));
const done25 = wrapFirstOccurrence(f25.body, 'C:N ratio', 'cn-ratio');
console.log('25 C:N ratio wrapped:', done25);
save('25-seaweed-as-compost-additive.json', f25);

// --- File 28: remove sustainable-drainage ---
const f28 = JSON.parse(readFileSync(`${dir}/28-rain-garden-for-driveway-runoff.json`, 'utf8'));
removeGlossaryTerm(f28, 'sustainable-drainage');
save('28-rain-garden-for-driveway-runoff.json', f28);

// --- File 32: wrap Flow rate, remove aerating-showerhead ---
const f32 = JSON.parse(readFileSync(`${dir}/32-water-efficient-showerhead-selection.json`, 'utf8'));
removeGlossaryTerm(f32, 'aerating-showerhead');
const done32 = wrapFirstOccurrence(f32.body, 'flow rate', 'flow-rate');
console.log('32 flow rate wrapped:', done32);
save('32-water-efficient-showerhead-selection.json', f32);

// --- File 40: wrap LPG ---
const f40 = JSON.parse(readFileSync(`${dir}/40-lpg-backup-heating-for-off-grid.json`, 'utf8'));
const done40 = wrapFirstOccurrence(f40.body, 'LPG', 'lpg');
console.log('40 LPG wrapped:', done40);
save('40-lpg-backup-heating-for-off-grid.json', f40);

console.log('Glossary fixes done.');
