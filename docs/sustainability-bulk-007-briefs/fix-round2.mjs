import { readFileSync, writeFileSync } from 'fs';
const dir = 'docs/sustainability-bulk-007-briefs';
const save = (name, data) => { writeFileSync(`${dir}/${name}`, JSON.stringify(data, null, 2)); console.log('saved:', name); };

function navigate(body, path) {
  const parts = path.split(' > ');
  let node = body;
  for (const p of parts) {
    const m = p.match(/\w+\[(\d+)\]/);
    if (!m || !node.content) return null;
    node = node.content[parseInt(m[1])];
    if (!node) return null;
  }
  return node;
}

function setParaText(body, path, newText) {
  const node = navigate(body, path);
  if (!node || node.type !== 'paragraph') { console.log('MISS:', path); return false; }
  node.content = [{ type: 'text', text: newText }];
  return true;
}

// Case-insensitive wrap of first occurrence; preserves original casing in text node
function wrapFirstOccurrence(body, searchText, termSlug) {
  let done = false;
  function walk(arr) {
    if (done || !Array.isArray(arr)) return;
    for (let i = 0; i < arr.length; i++) {
      const node = arr[i];
      if (done) break;
      if (node.type === 'text' && node.text && !node.marks) {
        const idx = node.text.toLowerCase().indexOf(searchText.toLowerCase());
        if (idx !== -1) {
          const matchText = node.text.slice(idx, idx + searchText.length);
          const before = node.text.slice(0, idx);
          const after = node.text.slice(idx + searchText.length);
          const tooltipNode = { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text: matchText };
          const replacements = [];
          if (before) replacements.push({ type: 'text', text: before });
          replacements.push(tooltipNode);
          if (after) replacements.push({ type: 'text', text: after });
          arr.splice(i, 1, ...replacements);
          done = true;
          return;
        }
      }
      if (node.content) walk(node.content);
    }
  }
  walk(body.content);
  return done;
}

function removeGlossaryTerm(data, slug) {
  data.glossaryTerms = data.glossaryTerms.filter(t => t.slug !== slug);
}

// ===== GRADE-LEVEL + GLOSSARY FIXES =====

// File 09: grade-level fix + glossary wrapping (single save)
const f9 = JSON.parse(readFileSync(`${dir}/09-kneeler-wall-insulation-chalet-bungalow.json`, 'utf8'));
setParaText(f9.body, 'orderedList[3] > listItem[0] > paragraph[0]',
  'Rafter slope: fill between the rafters with insulation. Fit a thin board at the rafter face to cut heat lost through the timber.');
const done9a = wrapFirstOccurrence(f9.body, 'kneeler wall', 'kneeler-wall');
const done9b = wrapFirstOccurrence(f9.body, 'cold triangle', 'cold-triangle');
console.log('09 kneeler-wall:', done9a, '| cold-triangle:', done9b);
save('09-kneeler-wall-insulation-chalet-bungalow.json', f9);

// File 13: grade-level fix + glossary wrapping (single save)
const f13 = JSON.parse(readFileSync(`${dir}/13-heat-battery-for-solar-storage.json`, 'utf8'));
setParaText(f13.body, 'bulletList[7] > listItem[1] > paragraph[0]',
  'Your tariff includes cheap overnight rates (Agile or Economy 7). Your home uses a lot of heat: for example, a semi or large house with poor insulation.');
const done13 = wrapFirstOccurrence(f13.body, 'heat battery', 'heat-battery');
console.log('13 heat-battery:', done13);
save('13-heat-battery-for-solar-storage.json', f13);

// File 20: grade-level fix only (no glossary terms)
const f20 = JSON.parse(readFileSync(`${dir}/20-cardboard-as-compost-carbon-source.json`, 'utf8'));
setParaText(f20.body, 'bulletList[4] > listItem[0] > paragraph[0]',
  'Wax-coated card and heavily printed card (some pizza boxes, glossy outer packaging): wax and ink slow rot and may leave tiny plastic pieces in the compost.');
setParaText(f20.body, 'bulletList[4] > listItem[1] > paragraph[0]',
  'Plastic-laminated card (Tetrapak cartons, frozen-food boxes): the plastic film does not rot down. It leaves bits of plastic in the compost.');
save('20-cardboard-as-compost-carbon-source.json', f20);

// File 34: grade-level fix only
const f34 = JSON.parse(readFileSync(`${dir}/34-using-refill-shops-and-zero-waste-stores.json`, 'utf8'));
setParaText(f34.body, 'bulletList[6] > listItem[1] > paragraph[0]',
  'Washing-up liquid and cleaner: buy refill concentrates. These often cost the same as branded bottles and save a plastic bottle each time.');
save('34-using-refill-shops-and-zero-waste-stores.json', f34);

// File 38: grade-level fix only
const f38 = JSON.parse(readFileSync(`${dir}/38-off-grid-load-calculation-worksheet.json`, 'utf8'));
setParaText(f38.body, 'paragraph[2]',
  'For each item, write down three things: the wattage, how many hours it runs per day in winter, and whether it can be switched off in bad weather.');
save('38-off-grid-load-calculation-worksheet.json', f38);

// ===== GLOSSARY-ONLY FIXES =====

// File 03: remove impact-sound (not in body); wrap airborne-sound
const f3 = JSON.parse(readFileSync(`${dir}/03-acoustic-and-thermal-floor-insulation.json`, 'utf8'));
removeGlossaryTerm(f3, 'impact-sound');
const done3 = wrapFirstOccurrence(f3.body, 'airborne sound', 'airborne-sound');
console.log('03 airborne-sound:', done3);
save('03-acoustic-and-thermal-floor-insulation.json', f3);

// File 04: wrap intumescent-collar
const f4 = JSON.parse(readFileSync(`${dir}/04-draught-sealing-soil-pipe-penetrations.json`, 'utf8'));
const done4 = wrapFirstOccurrence(f4.body, 'intumescent collar', 'intumescent-collar');
console.log('04 intumescent-collar:', done4);
save('04-draught-sealing-soil-pipe-penetrations.json', f4);

// File 05: wrap u-value (text has 'U-value')
const f5 = JSON.parse(readFileSync(`${dir}/05-secondary-glazing-film-installation.json`, 'utf8'));
const done5 = wrapFirstOccurrence(f5.body, 'U-value', 'u-value');
console.log('05 u-value:', done5);
save('05-secondary-glazing-film-installation.json', f5);

// File 11: wrap microinverter, power-optimiser
const f11 = JSON.parse(readFileSync(`${dir}/11-solar-pv-string-vs-microinverter-choice.json`, 'utf8'));
const done11a = wrapFirstOccurrence(f11.body, 'microinverter', 'microinverter');
const done11b = wrapFirstOccurrence(f11.body, 'power optimiser', 'power-optimiser');
console.log('11 microinverter:', done11a, '| power-optimiser:', done11b);
save('11-solar-pv-string-vs-microinverter-choice.json', f11);

// File 12: wrap v2h
const f12 = JSON.parse(readFileSync(`${dir}/12-v2g-vehicle-to-grid-readiness.json`, 'utf8'));
const done12 = wrapFirstOccurrence(f12.body, 'V2H', 'v2h');
console.log('12 v2h:', done12);
save('12-v2g-vehicle-to-grid-readiness.json', f12);

// File 18: wrap standing-charge
const f18 = JSON.parse(readFileSync(`${dir}/18-district-heat-network-connection-decision.json`, 'utf8'));
const done18 = wrapFirstOccurrence(f18.body, 'standing charge', 'standing-charge');
console.log('18 standing-charge:', done18);
save('18-district-heat-network-connection-decision.json', f18);

// File 19: wrap compost-tea then aacted-compost-tea
const f19 = JSON.parse(readFileSync(`${dir}/19-compost-tea-aerated-vs-simple-method.json`, 'utf8'));
const done19a = wrapFirstOccurrence(f19.body, 'compost tea', 'compost-tea');
const done19b = wrapFirstOccurrence(f19.body, 'Aerated compost tea (ACT)', 'aacted-compost-tea');
console.log('19 compost-tea:', done19a, '| aacted-compost-tea:', done19b);
save('19-compost-tea-aerated-vs-simple-method.json', f19);

// File 26: wrap deep-litter
const f26 = JSON.parse(readFileSync(`${dir}/26-deep-litter-composting-chicken-run.json`, 'utf8'));
const done26 = wrapFirstOccurrence(f26.body, 'deep litter', 'deep-litter');
console.log('26 deep-litter:', done26);
save('26-deep-litter-composting-chicken-run.json', f26);

// File 28: wrap rain-garden
const f28 = JSON.parse(readFileSync(`${dir}/28-rain-garden-for-driveway-runoff.json`, 'utf8'));
const done28 = wrapFirstOccurrence(f28.body, 'rain garden', 'rain-garden');
console.log('28 rain-garden:', done28);
save('28-rain-garden-for-driveway-runoff.json', f28);

// File 30: wrap runoff-coefficient
const f30 = JSON.parse(readFileSync(`${dir}/30-rainwater-roof-area-yield-calculation.json`, 'utf8'));
const done30 = wrapFirstOccurrence(f30.body, 'runoff coefficient', 'runoff-coefficient');
console.log('30 runoff-coefficient:', done30);
save('30-rainwater-roof-area-yield-calculation.json', f30);

// File 31: wrap calmed-inlet and floating-filter
const f31 = JSON.parse(readFileSync(`${dir}/31-underground-cistern-maintenance.json`, 'utf8'));
const done31a = wrapFirstOccurrence(f31.body, 'calmed inlet', 'calmed-inlet');
const done31b = wrapFirstOccurrence(f31.body, 'floating filter', 'floating-filter');
console.log('31 calmed-inlet:', done31a, '| floating-filter:', done31b);
save('31-underground-cistern-maintenance.json', f31);

// File 39: wrap composting-toilet
const f39 = JSON.parse(readFileSync(`${dir}/39-composting-toilet-annual-maintenance.json`, 'utf8'));
const done39 = wrapFirstOccurrence(f39.body, 'composting toilet', 'composting-toilet');
console.log('39 composting-toilet:', done39);
save('39-composting-toilet-annual-maintenance.json', f39);

// File 40: wrap lpg
const f40 = JSON.parse(readFileSync(`${dir}/40-lpg-backup-heating-for-off-grid.json`, 'utf8'));
const done40 = wrapFirstOccurrence(f40.body, 'LPG', 'lpg');
console.log('40 lpg:', done40);
save('40-lpg-backup-heating-for-off-grid.json', f40);

console.log('Round 2 fixes done.');
