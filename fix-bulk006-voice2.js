const fs = require('fs');
const dir = 'C:/Users/Rebecca/Projects/code/homemade/docs/sustainability-bulk-006-briefs/';
function read(f) { return JSON.parse(fs.readFileSync(dir + f, 'utf8')); }
function write(f, d) { fs.writeFileSync(dir + f, JSON.stringify(d, null, 2), 'utf8'); }
function tt(termSlug, text) { return { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text }; }
function tx(text) { return { type: 'text', text }; }

// ── FILE 20: bulletList[3] listItem[0] — grade 12.1 ──
const d20 = read('20-composting-pet-waste.json');
d20.body.content[3].content[0].content[0].content = [
  tx('A digester unit: a purpose-made pet waste digester, or a 20-litre bucket with holes drilled into the lower half and the base cut out.')
];
write('20-composting-pet-waste.json', d20);
console.log('20 done');

// ── FILE 23: organic-matter and aggregate-stability not used inline ──
const d23 = read('23-composting-clay-soil-amendment.json');
const b23 = d23.body.content;
// organic-matter: in body[1] (infoPanel), para content[0].content[2]
b23[1].content[0].content[2] = tx(' to clay in typical garden quantities (a few buckets per square metre) fills the existing clay pores with fine grit and can make the drainage worse, not better. ');
b23[1].content[0].content.splice(3, 0,
  tt('organic-matter', 'Organic matter'),
  tx(' works at much lower concentrations because it acts through chemistry and biology rather than physical displacement.')
);
// aggregate-stability: in body[4] (infoPanel), para content[0].content[0]
b23[4].content[0].content = [
  tx('Working clay soil when it is waterlogged destroys the '),
  tt('aggregate-stability', 'aggregate structure'),
  tx(' that takes years to build. Digging wet clay smears and compacts the particles, sealing pores and making drainage worse. Wait until the soil passes the ribbon test: when you roll a small ball between palms it does not stick or leave wet marks on your hand before working it.')
];
write('23-composting-clay-soil-amendment.json', d23);
console.log('23 done');

// ── FILE 26: bulletList[3] listItem[3] — grade 12.8 ──
const d26 = read('26-anaerobic-digestion-at-home.json');
d26.body.content[3].content[3].content[0].content = [
  tx('A thermal cover to hold warmth in cold weather: old duvets, rigid foam board, or a second outer barrel packed with mineral wool.')
];
write('26-anaerobic-digestion-at-home.json', d26);
console.log('26 done');

// ── FILE 27: first-flush and downpipe-filter not used inline ──
const d27 = read('27-rainwater-first-flush-diverter.json');
const b27 = d27.body.content;
// first-flush: wrap in body[0].content[2] — split the text at "first-flush diverter"
b27[0].content[2] = tx(' and bacteria. A ');
b27[0].content.splice(3, 0,
  tt('first-flush', 'first-flush diverter'),
  tx(' intercepts the first 20 to 50 litres (based on roof area) and sends it to a soakaway or drain, letting only the cleaner rinse water into storage.')
);
// downpipe-filter: body[3] = bulletList, item[1]
b27[3].content[1].content[0].content = [
  tx('A '),
  tt('downpipe-filter', 'downpipe filter'),
  tx(' (optional): fitted above the diverter to catch leaves and coarse debris before the diverter chamber.')
];
write('27-rainwater-first-flush-diverter.json', d27);
console.log('27 done');

// ── FILE 28: treatment-train not used inline ──
const d28 = read('28-greywater-shower-recycling.json');
d28.body.content[8].content = [
  tx('The '),
  tt('treatment-train', 'treatment train'),
  tx(' in a compliant unit starts with a coarse filter to remove hair and soap, then settles in a tank so heavier particles sink, then passes through a UV lamp to kill bacteria, before being pumped to the WC cistern. Replace the UV lamp once a year (20 to 30 pounds). Clean the coarse filter monthly.')
];
write('28-greywater-shower-recycling.json', d28);
console.log('28 done');
