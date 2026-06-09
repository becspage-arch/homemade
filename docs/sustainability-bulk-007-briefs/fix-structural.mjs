import { readFileSync, writeFileSync } from 'fs';
const dir = 'docs/sustainability-bulk-007-briefs';
const save = (name, data) => { writeFileSync(`${dir}/${name}`, JSON.stringify(data, null, 2)); console.log('saved:', name); };

// File 02: rename 'Before you start' heading + fix 'cures' in orderedList[7][4]
const f2 = JSON.parse(readFileSync(`${dir}/02-insulating-a-bay-window-flat-roof.json`, 'utf8'));
const h5 = f2.body.content[5];
if (h5.type === 'heading') h5.content[0].text = 'Preparation checklist';
// Fix 'cures' in orderedList[7] listItem[4]
const ol7 = f2.body.content[7];
if (ol7 && ol7.type === 'orderedList' && ol7.content[4]) {
  const para = ol7.content[4].content[0];
  para.content.forEach(n => { if (n.text) n.text = n.text.replace(/cures/g, 'has set'); });
}
save('02-insulating-a-bay-window-flat-roof.json', f2);

// File 10: rename safety infoPanel title
const f10 = JSON.parse(readFileSync(`${dir}/10-cellar-ceiling-insulation-rigid-board.json`, 'utf8'));
for (const n of f10.body.content) {
  if (n.type === 'infoPanel' && n.attrs && n.attrs.title && n.attrs.title.includes('Before you start')) {
    n.attrs.title = 'Cutting and drilling check';
  }
}
save('10-cellar-ceiling-insulation-rigid-board.json', f10);

// File 09: fix negation pattern in para[0]
const f9 = JSON.parse(readFileSync(`${dir}/09-kneeler-wall-insulation-chalet-bungalow.json`, 'utf8'));
const p0 = f9.body.content[0];
if (p0.type === 'paragraph') {
  p0.content.forEach(n => {
    if (n.text) n.text = n.text.replace(
      'the heated room is bounded not just by the rafter slope above but by a short kneeler wall at the side and the triangular floor zone below that wall.',
      'the heated room is bounded by the rafter slope above, a short kneeler wall at the side, and the triangular floor zone below that wall.'
    );
  });
}
save('09-kneeler-wall-insulation-chalet-bungalow.json', f9);

// File 19: remove USDA from body para[9]
const f19 = JSON.parse(readFileSync(`${dir}/19-compost-tea-aerated-vs-simple-method.json`, 'utf8'));
const p9_19 = f19.body.content[9];
if (p9_19.type === 'paragraph') {
  p9_19.content.forEach(n => {
    if (n.text && n.text.includes('USDA')) {
      n.text = n.text.replace(
        'The USDA National Organic Program advises not applying compost tea to the edible parts of plants within 90 days of harvest if the source compost contained animal manures. For home compost made from kitchen waste and garden materials without animal manures, this restriction does not apply.',
        'Do not apply compost tea to the edible parts of plants within 90 days of harvest if the source compost contained animal manures. For home compost made from kitchen waste and garden materials only, this restriction does not apply.'
      );
    }
  });
}
save('19-compost-tea-aerated-vs-simple-method.json', f19);

// File 21: remove USDA from orderedList[5][1]
const f21 = JSON.parse(readFileSync(`${dir}/21-small-animal-manure-in-compost.json`, 'utf8'));
const ol5_21 = f21.body.content[5];
if (ol5_21 && ol5_21.type === 'orderedList' && ol5_21.content[1]) {
  ol5_21.content[1].content[0].content.forEach(n => {
    if (n.text && n.text.includes('USDA')) {
      n.text = n.text.replace('is the USDA standard for pathogen reduction in a hot heap.', 'meets the standard threshold for pathogen reduction in a hot heap.');
    }
  });
}
save('21-small-animal-manure-in-compost.json', f21);

// File 40: fix '235 hours' raw-hours
const f40 = JSON.parse(readFileSync(`${dir}/40-lpg-backup-heating-for-off-grid.json`, 'utf8'));
f40.body.content[0].content.forEach(n => {
  if (n.text && n.text.includes('235 hours')) {
    n.text = n.text.replace('enough to run a 5 kW space heater for 235 hours.', 'enough to run a 5 kW space heater for about 10 days.');
  }
});
save('40-lpg-backup-heating-for-off-grid.json', f40);

console.log('Structural fixes done.');
