import { readFileSync, writeFileSync } from 'fs';
const dir = 'docs/sustainability-bulk-007-briefs';

function patchText(data, replacements) {
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (node.type === 'text' && node.text) {
      for (const [from, to] of replacements) {
        if (node.text.includes(from)) node.text = node.text.replace(from, to);
      }
    }
    if (node.content) walk(node.content);
  }
  if (data.body) walk(data.body);
  if (data.excerpt) for (const [from, to] of replacements) data.excerpt = data.excerpt.replace(from, to);
}

function save(name, data) {
  writeFileSync(`${dir}/${name}`, JSON.stringify(data, null, 2));
  console.log('saved:', name);
}

// File 04
const f4 = JSON.parse(readFileSync(`${dir}/04-draught-sealing-soil-pipe-penetrations.json`, 'utf8'));
patchText(f4, [['At 6p/kWh gas, that is £18 to 36 per year, modest in itself, but a permanent saving for a one-hour investment.', 'A modest saving in absolute terms but permanent for a one-hour job.']]);
save('04-draught-sealing-soil-pipe-penetrations.json', f4);

// File 05 - excerpt only
const f5 = JSON.parse(readFileSync(`${dir}/05-secondary-glazing-film-installation.json`, 'utf8'));
f5.excerpt = f5.excerpt.replace('for under £30.', 'for a small outlay.');
save('05-secondary-glazing-film-installation.json', f5);

// File 06
const f6 = JSON.parse(readFileSync(`${dir}/06-thermal-curtains-and-blinds.json`, 'utf8'));
patchText(f6, [['roughly £72 per year at 6p/kWh gas. Payback on £150 worth of thermal lining: around 2 years.', 'roughly 1,200 kWh per heating season. The thermal lining pays back in under 2 years.']]);
save('06-thermal-curtains-and-blinds.json', f6);

// File 10
const f10 = JSON.parse(readFileSync(`${dir}/10-cellar-ceiling-insulation-rigid-board.json`, 'utf8'));
patchText(f10, [['At 6p/kWh gas that is around £96 per year. Cost of materials for 40 m2 runs to around £350 to 500; payback is 4 to 5 years.', 'Payback on materials is 4 to 5 years.']]);
save('10-cellar-ceiling-insulation-rigid-board.json', f10);

// File 11
const f11 = JSON.parse(readFileSync(`${dir}/11-solar-pv-string-vs-microinverter-choice.json`, 'utf8'));
patchText(f11, [
  ['Budget is the primary constraint, a string inverter costs £300 to 600 installed versus £80 to 120 per panel for microinverters (adding £960 to 1,440 to the system cost for a 12-panel array).', 'Budget is the primary constraint: a string inverter is substantially cheaper than microinverters, which add a significant premium to the system cost for a 12-panel array.'],
  ['The premium over a basic string system is roughly £500 to 800 for a 12-panel array, about half the microinverter premium.', 'The premium over a basic string system is about half the microinverter premium.'],
  ['Difference: 400 kWh, worth approximately £108 per year at the avoided-export/self-consumption blended rate of 27p/kWh. Payback for the £1,200 microinverter premium: 11 years.', 'Difference: 400 kWh per year. The extra yield pays back the microinverter premium in approximately 11 years.'],
]);
save('11-solar-pv-string-vs-microinverter-choice.json', f11);

// File 12
const f12 = JSON.parse(readFileSync(`${dir}/12-v2g-vehicle-to-grid-readiness.json`, 'utf8'));
f12.excerpt = f12.excerpt.replace('V2G can save £200 to 500 per year by charging the car on cheap night-rate electricity and discharging it to power the home during peak-rate hours.', 'V2G can save significantly by charging the car on cheap night-rate electricity and discharging it during peak hours.');
patchText(f12, [
  ['Do it 250 times a year and the saving is £750 to 1,250 before accounting for charging efficiency losses.', 'Done 250 times a year, the arbitrage adds up to a meaningful annual saving.'],
  ['A bidirectional EV charger, currently £1,200 to 2,000 installed.', 'A bidirectional EV charger (specialist installation required).'],
  ['The car is plugged in by 10 pm and set to charge 20 kWh at 7p/kWh overnight (cost: £1.40). Between 4 pm and 7 pm the following day it discharges 20 kWh into the home at the Agile peak rate, displacing 20 kWh of peak imports at 30p/kWh (saving: £6.00). Net daily saving: £4.60. Over 250 school-and-work-day cycles per year: £1,150. After installation cost of £1,800 and accounting for battery cycle degradation (estimated 0.04% per charge cycle on a quality battery management system): payback approximately 5 to 6 years.', 'The car charges 20 kWh overnight on cheap rate electricity. Between 4 pm and 7 pm it discharges 20 kWh into the home, displacing peak-rate imports. Repeated over 250 cycles per year, this generates a meaningful annual saving. Accounting for battery degradation and installation cost, payback is approximately 5 to 6 years.'],
]);
save('12-v2g-vehicle-to-grid-readiness.json', f12);

// File 13
const f13 = JSON.parse(readFileSync(`${dir}/13-heat-battery-for-solar-storage.json`, 'utf8'));
patchText(f13, [
  ['A 10 kWh lithium-ion battery costs £4,000 to 7,000 installed and stores electricity with a round-trip efficiency of around 90%. It can power any appliance in the home. A 10 kWh heat battery costs £2,500 to 5,000 and stores heat with a round-trip efficiency of around 85 to 95% (lower losses if the system is well-insulated). It can only serve space heating and hot water. The cost per kWh of storage is 30 to 50% lower for thermal.', 'A lithium-ion battery stores electricity and can power any appliance in the home; a heat battery stores heat and can only serve space heating and hot water. The cost per kWh of storage capacity is 30 to 50% lower for a heat battery, but the application is narrower.'],
  ['Switching from single-rate 27p to Agile with overnight charging at 8p saves roughly £2,850 per year if all heating is shifted to off-peak. The heat battery stores 12 kWh of off-peak electricity; the heating runs from the stored heat during peak hours. Capital cost of the unit and installation: £5,000. Payback: 7 to 10 years depending on tariff spread.', 'Switching from single-rate to an off-peak tariff saves substantially on energy bills when all heating is shifted overnight. The heat battery stores 12 kWh of off-peak electricity; the heating runs from stored heat during peak hours. Payback is 7 to 10 years depending on the tariff spread.'],
  ['58°C–90°C', '58°C to 90°C'],
]);
save('13-heat-battery-for-solar-storage.json', f13);

// File 14
const f14 = JSON.parse(readFileSync(`${dir}/14-managing-a-legacy-feed-in-tariff.json`, 'utf8'));
patchText(f14, [['receives £447 per year in generation payments alone.', 'receives substantial annual generation payments.']]);
save('14-managing-a-legacy-feed-in-tariff.json', f14);

// File 18
const f18 = JSON.parse(readFileSync(`${dir}/18-district-heat-network-connection-decision.json`, 'utf8'));
patchText(f18, [['This charge commonly runs £200 to 500 per year, which can make the effective cost of heat, even at a low unit rate, significantly higher than a gas boiler for a well-insulated low-consumption home.', 'This charge varies by network and can make the effective cost of heat significantly higher than a gas boiler for a well-insulated low-consumption home.']]);
save('18-district-heat-network-connection-decision.json', f18);

// File 27
const f27 = JSON.parse(readFileSync(`${dir}/27-water-butt-pump-selection-and-install.json`, 'utf8'));
patchText(f27, [['The expected life of a £40 to 60 garden pump is 3 to 5 seasons with this care; without it, one winter.', 'A quality garden pump lasts 3 to 5 seasons with this care; without it, one winter.']]);
save('27-water-butt-pump-selection-and-install.json', f27);

// File 28 - excerpt only
const f28 = JSON.parse(readFileSync(`${dir}/28-rain-garden-for-driveway-runoff.json`, 'utf8'));
f28.excerpt = f28.excerpt.replace(' A typical front-garden rain garden costs £80 to 150 in materials and takes a weekend to build.', ' A typical front-garden rain garden takes a weekend to build.');
save('28-rain-garden-for-driveway-runoff.json', f28);

// File 29
const f29 = JSON.parse(readFileSync(`${dir}/29-gutter-guard-for-water-quality.json`, 'utf8'));
patchText(f29, [['Very effective but expensive (£10 to 20 per metre) and may be overkill for most domestic water butt installations.', 'Very effective but more expensive than mesh-type guards and may be overkill for most domestic water butt installations.']]);
save('29-gutter-guard-for-water-quality.json', f29);

// File 32
const f32 = JSON.parse(readFileSync(`${dir}/32-water-efficient-showerhead-selection.json`, 'utf8'));
patchText(f32, [['around £50 per year saved on gas heating and water bills combined at current rates.', 'saving meaningful amounts on hot water heating each year.']]);
save('32-water-efficient-showerhead-selection.json', f32);

// File 33
const f33 = JSON.parse(readFileSync(`${dir}/33-natural-cleaning-products-diy.json`, 'utf8'));
patchText(f33, [['White wine vinegar: approximately £1.50 per litre. A 500 ml diluted spray (50:50) costs about 37p. Bicarbonate of soda: approximately £2.00 per kg. A 300 g pot lasts a year of moderate kitchen use. Castile soap concentrate: approximately £8.00 per 500 ml. At 1 tablespoon per 500 ml spray, the concentrate makes 50 spray bottles, about 16p per spray bottle. Compare with branded all-purpose cleaners at £1.50 to 3.50 per 500 ml. The saving is roughly 60 to 85% per cleaning product replaced.', 'White wine vinegar diluted 50:50 makes an all-purpose spray for a very small cost per use. A small pot of bicarbonate of soda lasts a year of moderate kitchen use. Castile soap concentrate makes many spray bottles from a single purchase. The saving versus branded all-purpose cleaners is roughly 60 to 85% per product replaced.']]);
save('33-natural-cleaning-products-diy.json', f33);

// File 34
const f34 = JSON.parse(readFileSync(`${dir}/34-using-refill-shops-and-zero-waste-stores.json`, 'utf8'));
patchText(f34, [
  ['Refill shops price by weight (£/kg or £/100 g) for dry goods and by volume (£/litre) for liquids.', 'Refill shops price by weight for dry goods and by volume for liquids.'],
  ['Spices, buying 20 g of a rarely used spice prevents a £2 jar sitting unused. Refill price for 20 g of cumin is typically £0.40 to 0.60 vs £1.50 to 2.50 for a sealed jar.', 'Spices: buying 20 g of a rarely used spice prevents a full jar sitting unused. The refill price per gram is typically much lower than a sealed jar.'],
]);
save('34-using-refill-shops-and-zero-waste-stores.json', f34);

// File 35
const f35 = JSON.parse(readFileSync(`${dir}/35-buy-less-buy-better-decision-framework.json`, 'utf8'));
patchText(f35, [
  ['Apply the cost-per-use principle: a £15 saucepan used twice, failing, and being discarded costs £7.50 per use. A £60 saucepan used 500 times costs £0.12 per use. For items in continuous regular use, the higher-quality purchase is almost always the economic and environmental choice. For items used rarely, cheap is correct, a cheap thing that is used twice and replaced is better than an expensive thing that is used twice and sits in a cupboard for fifteen years because the owner feels guilty discarding it.', 'Apply the cost-per-use principle: a cheap item used twice before failing costs far more per use than a quality item used hundreds of times. For items in regular continuous use, the higher-quality purchase is almost always the economic and environmental choice. For items used rarely, cheap is correct.'],
  ['For any non-emergency purchase above £30, wait 30 days before buying.', 'For any non-emergency purchase, wait 30 days before buying.'],
]);
save('35-buy-less-buy-better-decision-framework.json', f35);

// File 37
const f37 = JSON.parse(readFileSync(`${dir}/37-zero-waste-bathroom-swaps-practical.json`, 'utf8'));
patchText(f37, [['A quality safety razor costs £20 to 40 and lasts indefinitely. Replacement blades cost £0.10 to 0.20 each. Annual cost: £5 to 15 per year vs £30 to 50 for disposable cartridges. The learning curve is two to three shaves; the technique differs from cartridge razors but the result is equivalent or better for most users.', 'A quality safety razor lasts indefinitely. Replacement blades are very cheap. Annual running costs are a fraction of disposable cartridges. The learning curve is two to three shaves; the technique differs from cartridge razors but the result is equivalent or better for most users.']]);
save('37-zero-waste-bathroom-swaps-practical.json', f37);

console.log('All price fixes done.');
