const fs = require('fs');
const base = 'C:/Users/Rebecca/Projects/code/homemade/docs/sustainability-bulk-006-briefs/';

function readJson(f) { return JSON.parse(fs.readFileSync(base + f, 'utf8')); }
function writeJson(f, d) { fs.writeFileSync(base + f, JSON.stringify(d, null, 2), 'utf8'); }
function tt(termSlug, text) { return { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }], text }; }
function tx(text) { return { type: 'text', text }; }
function stripMark(content, termSlug) {
  if (!content) return;
  for (let i = 0; i < content.length; i++) {
    const node = content[i];
    if (node.marks) {
      node.marks = node.marks.filter(m => !(m.type === 'glossaryTooltip' && m.attrs && m.attrs.termSlug === termSlug));
      if (node.marks.length === 0) delete node.marks;
    }
    if (node.content) stripMark(node.content, termSlug);
  }
}

// ── FILE 33: battery-recycling-and-disposal ──
let d33 = readJson('33-battery-recycling-and-disposal.json');
let b33 = d33.body.content;
b33[0].content = [
  tt('battery-directive', 'Battery Directive'),
  tx(' requires UK retailers selling more than 32 kg of batteries per year to take back used batteries free of charge. This means almost every supermarket and hardware shop has a collection point. Despite this, WRAP estimates only 45 percent of portable batteries are returned for recycling. The other 55 percent go to landfill illegally.')
];
b33[3].content[2].content[0].content = [
  tx('Rechargeable lithium-ion packs (phone, laptop, power tool): take to an HWRC or a major electronics retailer. Do not post damaged packs. Royal Mail bans lithium batteries above certain watt-hour limits by post, and prohibits damaged cells entirely.')
];
b33[3].content[3].content[0].content = [
  tx('Vehicle and UPS '),
  tt('lead-acid-battery', 'lead-acid batteries'),
  tx(': take to the HWRC hazardous waste bay, or return to a motor factor when buying a replacement. A 10-litre bucket is a safe way to transport a sealed battery that may be leaking.')
];
b33[3].content[4].content[0].content = [
  tx('E-bike and e-scooter batteries: most manufacturers must take these back under the Battery Directive. Contact the manufacturer or the original retailer for a return label or a drop-off point.')
];
b33[5].content = [
  tx('The best way to cut battery waste is to switch from single-use alkaline to rechargeable NiMH batteries in high-drain devices such as remote controls, clocks, and torches. One rechargeable AA replaces around 500 alkaline batteries over its 10-year life. NiMH batteries work the same as alkaline in most devices and cost far less per unit of stored energy over their lifetime.')
];
b33[9].content = [
  tx('Used batteries sit in a kitchen drawer for two years and are eventually binned because a trip to the HWRC is inconvenient. A swollen laptop battery goes in the black bin and the compactor punctures it, causing a fire in the vehicle. Both are illegal under the Batteries Regulations.')
];
writeJson('33-battery-recycling-and-disposal.json', d33);
console.log('33 done');

// ── FILE 34: hazardous-household-waste-disposal ──
let d34 = readJson('34-hazardous-household-waste-disposal.json');
let b34 = d34.body.content;
b34[5].content = [
  tx('Surplus paint is the biggest source of household hazardous waste. UK households hold an estimated 50 million litres of unused paint at any time. To avoid accumulation, buy only what you need (use an online paint calculator), choose water-based over oil-based where possible, and donate leftovers as soon as a project is done. The same applies to '),
  tt('pesticide-disposal', 'pesticides'),
  tx(': buy only enough for one season rather than stockpiling, and the disposal problem disappears.')
];
b34[9].content = [
  tx('A broken fluorescent tube is wrapped in newspaper and put in the general waste, releasing mercury vapour in the bin store. Half a tin of oil-based paint is poured down the kitchen sink; the binder solidifies in the P-trap and needs a plumber to clear. A corroding pesticide container goes in the wheelie bin because the HWRC is judged too far away. All three are illegal under UK environmental regulations.')
];
b34[3].content[2].content[0].content = [
  tt('pesticide-disposal', 'Pesticides, herbicides, and rodenticides'),
  tx(': take to the HWRC hazardous bay in original sealed containers with labels intact. The label tells the HWRC operator which treatment stream to use. Unlabelled containers are refused at some sites.')
];
writeJson('34-hazardous-household-waste-disposal.json', d34);
console.log('34 done');

// ── FILE 36: glass-recycling-and-reuse ──
let d36 = readJson('36-glass-recycling-and-reuse.json');
let b36 = d36.body.content;
b36[0].content = [
  tx('Glass bottles and jars can be recycled without losing quality, making them one of the most valuable items in a household recycling bin. '),
  tt('container-glass', 'Container glass'),
  tx(' is sorted by colour and sent to bottle furnaces to be melted down for new bottles and jars. The rule for households is simple: bottles and jars go in the recycling; everything else goes elsewhere.')
];
b36[5].content = [
  tx('Glass jars can be reused for years before recycling. A 500 ml jam jar works as a food storage vessel, fermentation container, or drinking glass for 5 to 10 years. Buying food in glass rather than plastic, where the jar has a practical second use, avoids buying new storage containers. One reused jam jar replaces the equivalent of 8 to 12 plastic containers over its useful life.')
];
b36[7].content = [
  tx('All food and drink bottles and jars go straight into the kerbside recycling bin, rinsed, lids removed. A set of 20 reused jam jars and pasta sauce jars stores dry goods, fermentation projects, and homemade preserves. When two drinking glasses broke, they were wrapped in newspaper, labelled (glass: not for recycling bin), and taken to the HWRC. A broken mirror from a renovation was similarly taken to the HWRC glass bay rather than the bottle bank.')
];
writeJson('36-glass-recycling-and-reuse.json', d36);
console.log('36 done');

// ── FILE 37: furniture-repair-decision ──
let d37 = readJson('37-furniture-repair-decision.json');
let b37 = d37.body.content;
b37[0].content = [
  tx('Most furniture that ends up in skips or at the HWRC fails because of one repairable fault: a broken joint, worn upholstery fabric, a damaged veneer, or missing hardware. The frame itself, often solid wood, is sound and worth more than the cost of a new piece of similar quality. The repair decision starts with the frame, not the visible damage.')
];
b37[3].content[1].content[0].content = [
  tx('Look for structural wood defects. Cracks along the grain in legs or stretchers covering more than 30 percent of the cross-section are a failure risk that cannot be reliably repaired in load-bearing parts. Surface cracks in non-structural areas such as tabletops or panel backs can be filled.')
];
b37[3].content[3].content[0].content = [
  tx('Apply the economic test: if the repair costs less than 70 percent of a new piece of similar quality, it is worth doing. Include materials plus labour, or materials plus your time. For pieces with sentimental value, this test does not apply.')
];
b37[9].content = [
  tx('A sound oak sideboard with a damaged veneer panel goes to the HWRC because it looks past repair. Fixing it would have taken 30 minutes and 3 pounds of iron-on veneer tape. A sofa with a good frame but worn fabric is replaced rather than reupholstered. The household assumed reupholstery cost more than a new sofa; a local quote would have been 280 pounds against 450 pounds for the cheapest equivalent new sofa.')
];
writeJson('37-furniture-repair-decision.json', d37);
console.log('37 done');

// ── FILE 38: small-wind-turbine-decision ──
let d38 = readJson('38-small-wind-turbine-decision.json');
let b38 = d38.body.content;
b38[5].content[1].content[0].content = [
  tx('Consider the effect on neighbours. Turbine noise at 35 to 43 dB at 40 m is usually below background noise at rural sites, but can be heard in quiet conditions. '),
  tt('permitted-development-wind', 'Permitted development'),
  tx(' sets a minimum setback, but neighbours within 200 m may still object on noise or visual grounds during the prior approval process.')
];
writeJson('38-small-wind-turbine-decision.json', d38);
console.log('38 done');

// ── FILE 39: gravity-fed-spring-water-supply ──
let d39 = readJson('39-gravity-fed-spring-water-supply.json');
let b39 = d39.body.content;
b39[0].content = [
  tx('A gravity-fed spring supply needs no pumping or electricity once installed. Water flows continuously with no recurring fuel or chemical costs. The main challenge is protecting the '),
  tt('spring-box', 'spring box'),
  tx(' from contamination and treating the water adequately before use. A supply that fails a microbiological test is a health risk and will attract enforcement action from the local authority.')
];
b39[3].content[2].content[0].content = [
  tx('Protect the catchment area uphill of the spring: no septic tanks, no manure spreading, no pesticides, and no vehicle access within 50 m upslope. Identify any pollution sources in the upslope catchment. One contamination event (a fuel spill, an animal carcass) can take the supply out of action for weeks.')
];
writeJson('39-gravity-fed-spring-water-supply.json', d39);
console.log('39 done');

// ── FILE 40: root-cellar-food-storage ──
let d40 = readJson('40-root-cellar-food-storage.json');
let b40 = d40.body.content;
const earthsText = "The earth’s ";
b40[0].content = [
  tx(earthsText),
  tt('thermal-mass', 'thermal mass'),
  tx(' keeps underground temperatures stable throughout the year. Below 1 m in the UK, ground temperature stays between 4 and 15 degrees Celsius regardless of the season above. A root cellar uses this stable zone to store food with no mechanical refrigeration. The key challenges are controlling humidity, limiting '),
  tt('ethylene-gas', 'ethylene gas'),
  tx(', and ensuring the space stays cold enough for temperature-sensitive crops.')
];
stripMark(b40, 'spade');
writeJson('40-root-cellar-food-storage.json', d40);
console.log('40 done');
