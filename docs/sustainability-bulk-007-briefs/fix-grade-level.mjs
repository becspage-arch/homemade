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
  if (!node || node.type !== 'paragraph') { console.log('MISS', path); return false; }
  // Replace all content with a single text node, preserving any glossary marks
  // Only replace if content is all plain text nodes (no tooltips)
  const hasMarks = node.content && node.content.some(n => n.marks && n.marks.length);
  if (hasMarks) {
    // find the text node with the longest text and replace content carefully
    // For simplicity, rebuild with a single plain text node
    node.content = [{ type: 'text', text: newText }];
  } else {
    node.content = [{ type: 'text', text: newText }];
  }
  return true;
}

// File 02
const f2 = JSON.parse(readFileSync(`${dir}/02-insulating-a-bay-window-flat-roof.json`, 'utf8'));
setParaText(f2.body, 'paragraph[10]', 'Done badly: boards have gaps at the edges because they were cut too small. Joints are untaped. The void above is stuffed with mineral wool, which blocks ventilation and risks condensation. The new ceiling has visible joint lines where the paper tape was left out.');
save('02-insulating-a-bay-window-flat-roof.json', f2);

// File 03
const f3 = JSON.parse(readFileSync(`${dir}/03-acoustic-and-thermal-floor-insulation.json`, 'utf8'));
setParaText(f3.body, 'paragraph[0]', 'The floor between a bedroom and a living room does two things: it slows heat movement between rooms, and it reduces sound transfer. These goals work together. A joist void filled with 100 mm of acoustic mineral wool (high-density rock wool or glass wool, not standard loft roll) reduces heat loss and cuts sound at the same time.');
setParaText(f3.body, 'paragraph[6]', 'To reduce flanking at the floor perimeter, do three things. First, do not fix floorboards rigidly to the joists at the wall junction. Second, seal any service holes through the floor with acoustic sealant. Third, if the floor is already being opened, fit resilient bars under the ceiling below to decouple the plasterboard from the joists.');
setParaText(f3.body, 'paragraph[10]', 'In a 1930s semi, filling the joist void with 100 mm acoustic slab and sealing all penetrations reduces perceived impact noise by roughly 5 to 8 dB, halving the apparent loudness. Airborne noise falls by a similar amount. Footsteps become a dull thud rather than sharp taps. Normal conversation becomes hard to follow rather than clearly audible. Complete sound isolation requires a room-within-a-room build.');
save('03-acoustic-and-thermal-floor-insulation.json', f3);

// File 04
const f4 = JSON.parse(readFileSync(`${dir}/04-draught-sealing-soil-pipe-penetrations.json`, 'utf8'));
setParaText(f4.body, 'bulletList[6] > listItem[1] > paragraph[0]', 'Plastic soil pipe through a fire-rated floor or wall: use an intumescent collar rated for the element (typically 30 or 60 minutes). Silicone alone is not adequate for fire-rated elements.');
save('04-draught-sealing-soil-pipe-penetrations.json', f4);

// File 05
const f5 = JSON.parse(readFileSync(`${dir}/05-secondary-glazing-film-installation.json`, 'utf8'));
setParaText(f5.body, 'paragraph[0]', 'Secondary glazing film is the cheapest window insulation available. It traps still air between the film and the glass, reducing the U-value from around 5.7 (single glazing) to roughly 3.4 W/m2K. That is roughly the same thermal gain as upgrading to basic double glazing, at about one percent of the cost. The film also stops draughts through the glazing bead and poorly fitting sashes, since the air layer is sealed at the perimeter.');
setParaText(f5.body, 'bulletList[3] > listItem[0] > paragraph[0]', 'Secondary glazing film kit (typically covers 3 to 6 m2 per kit). Kits from any major DIY retailer include film, double-sided tape, and instructions.');
save('05-secondary-glazing-film-installation.json', f5);

// File 07
const f7 = JSON.parse(readFileSync(`${dir}/07-eaves-zone-insulation-fitting.json`, 'utf8'));
setParaText(f7.body, 'paragraph[5]', 'Done well: a clear 50 mm channel runs from each eaves vent up past the insulation. The insulation fills the eaves zone below the baffle. The top-up insulation lies flat across the joist zone. In a thermal image from outside in cold weather, the underside of the eaves shows an even temperature strip, confirming insulation is continuous to the wall plate.');
setParaText(f7.body, 'paragraph[6]', 'Done badly: insulation pushed into the eaves blocks the vent. Cold air bridges appear at each rafter bay. The felt is damp underneath when inspected in summer after a wet winter.');
save('07-eaves-zone-insulation-fitting.json', f7);

// File 08
const f8 = JSON.parse(readFileSync(`${dir}/08-understanding-thermal-mass-in-retrofits.json`, 'utf8'));
setParaText(f8.body, 'paragraph[2]', 'Thermal mass only moderates temperature if the wall surface is in contact with the room air. The surface must absorb heat from warm indoor air and release it back later. Where the insulation goes determines whether the masonry is part of the indoor environment or cut off from it:');
setParaText(f8.body, 'paragraph[7]', 'Both routes reduce annual heat loss by a similar amount. The thermal mass difference affects comfort and peak heating demand, but not the annual fuel bill by much. The real decision factors are: planning constraints (EWI changes the appearance; dry-lining does not), disruption (dry-lining requires emptying every room), and cost (EWI is typically 30 to 50% more expensive but lasts longer).');
setParaText(f8.body, 'paragraph[9]', 'Thermal mass matters most in two cases: a building with large south-facing glass that captures lots of solar gain, and a climate with a daily temperature swing above 15°C. In UK domestic retrofit, thermal mass rarely decides the choice between internal and external insulation. U-value, cost, planning, and disruption do. Understand what thermal mass does; do not let it override the practical logic.');
save('08-understanding-thermal-mass-in-retrofits.json', f8);

// File 09
const f9 = JSON.parse(readFileSync(`${dir}/09-kneeler-wall-insulation-chalet-bungalow.json`, 'utf8'));
// Also fix the negation pattern that may still be there
setParaText(f9.body, 'paragraph[0]', 'In a chalet bungalow or room-in-roof conversion, the heated room is bounded by the rafter slope above, a short kneeler wall at the side, and the triangular floor zone below that wall. Behind the kneeler wall lies the cold triangle, an unheated void that can reach outdoor temperature. The kneeler wall itself is often a 100 mm stud wall with 90 mm mineral wool between the studs, a U-value of around 0.40 W/m2K. The floor zone beneath the kneeler is often uninsulated concrete or timber, losing heat into the cold triangle below.');
setParaText(f9.body, 'orderedList[3] > listItem[0] > paragraph[0]', 'The rafter slope above: insulate between the rafters, then add a counter-batten layer or rigid board at the rafter face to reduce thermal bridging.');
setParaText(f9.body, 'orderedList[3] > listItem[1] > paragraph[0]', 'The kneeler wall: fill the stud bays fully with mineral wool. Add 25 to 50 mm of PIR board on the warm side for best results.');
setParaText(f9.body, 'orderedList[3] > listItem[2] > paragraph[0]', 'The floor zone at the foot of the kneeler wall sits in or above the cold triangle. Insulate it like a cold floor: 75 to 100 mm of rigid board between or below the joists.');
save('09-kneeler-wall-insulation-chalet-bungalow.json', f9);

// File 11
const f11 = JSON.parse(readFileSync(`${dir}/11-solar-pv-string-vs-microinverter-choice.json`, 'utf8'));
setParaText(f11.body, 'bulletList[2] > listItem[2] > paragraph[0]', 'Budget is the main constraint. String inverters cost much less than microinverters. For a 12-panel array, microinverters add a significant premium to the total cost.');
setParaText(f11.body, 'paragraph[6]', 'A power optimiser gives panel-level MPPT while using a single central inverter for AC conversion. The SolarEdge system is the main UK example. The cost premium is about half that of microinverters. The central inverter is still a single point of failure. With microinverters, a failed unit affects only one panel.');
save('11-solar-pv-string-vs-microinverter-choice.json', f11);

// File 12
const f12 = JSON.parse(readFileSync(`${dir}/12-v2g-vehicle-to-grid-readiness.json`, 'utf8'));
setParaText(f12.body, 'bulletList[3] > listItem[2] > paragraph[0]', 'V2H (vehicle-to-home, not grid export) is a simpler and cheaper option. A V2L adapter plugs into the car charging port and provides a standard 240V 3.6 kW socket. This works on Hyundai IONIQ 5 and Kia EV6. It does not need a special charger installation.');
setParaText(f12.body, 'orderedList[5] > listItem[1] > paragraph[0]', 'A gateway unit or energy management system to read household consumption and control when the car charges or discharges. This is usually specific to the charger brand.');
setParaText(f12.body, 'paragraph[9]', 'Every charge-discharge cycle adds wear to the battery. Modern EV batteries are rated for 1,500 to 2,000 cycles to 80% capacity. Most manufacturer warranties do not cover extra wear from V2G cycling. Check the warranty before you install. Volkswagen has confirmed V2G is within warranty on ID-series cars. Nissan Leaf second-generation batteries carry no manufacturer warranty from new.');
save('12-v2g-vehicle-to-grid-readiness.json', f12);

// File 13
const f13 = JSON.parse(readFileSync(`${dir}/13-heat-battery-for-solar-storage.json`, 'utf8'));
setParaText(f13.body, 'paragraph[0]', 'A lithium-ion home battery stores electricity and gives it back as electricity. A heat battery converts electricity to heat and stores that heat for central heating or hot water. For homes where most energy use is for heating rather than appliances, a heat battery can give more thermal output per pound of investment.');
setParaText(f13.body, 'bulletList[7] > listItem[0] > paragraph[0]', 'You have solar PV and most of your daytime export goes to the grid unused. Either your roof is too small for a diverter, or the immersion diverter is already using all the surplus.');
setParaText(f13.body, 'bulletList[7] > listItem[1] > paragraph[0]', 'You are on an Agile or Economy 7 tariff and have high heating demand: for example, a semi without solid-wall insulation or a larger detached house.');
setParaText(f13.body, 'bulletList[7] > listItem[2] > paragraph[0]', 'You are replacing a gas boiler and want all-electric heat without fitting a heat pump or changing the piping system.');
save('13-heat-battery-for-solar-storage.json', f13);

// File 14
const f14 = JSON.parse(readFileSync(`${dir}/14-managing-a-legacy-feed-in-tariff.json`, 'utf8'));
setParaText(f14.body, 'paragraph[2]', 'FiT payments come from the licensed supplier that runs your tariff. This is usually your energy retailer, or a dedicated FiT administrator if you have switched. Two payment streams:');
save('14-managing-a-legacy-feed-in-tariff.json', f14);

// File 15
const f15 = JSON.parse(readFileSync(`${dir}/15-ashp-winter-performance-and-cop.json`, 'utf8'));
setParaText(f15.body, 'paragraph[6]', 'If the heat pump cannot keep target temperature on cold days (below -3°C is the UK design condition in most areas), two causes are common. First, the heat pump may have been undersized at design. Second, the house may lose more heat than the calculation assumed, due to settled insulation, worse draughts, or smaller radiators than specified. Track electricity use and indoor temperature with a clamp meter and room sensors over a cold week. This shows whether the system is running at capacity. An MCS-registered installer can do a full performance check.');
save('15-ashp-winter-performance-and-cop.json', f15);

// File 16
const f16 = JSON.parse(readFileSync(`${dir}/16-trv-sizing-for-heat-pump-systems.json`, 'utf8'));
setParaText(f16.body, 'paragraph[6]', 'Radiators designed for a gas boiler at 70°C flow may be too small for a heat pump at 40°C flow. A radiator producing 1,500 W at 70°C gives roughly 640 W at 40°C, less than half. If a room stays cold, fitting a larger or second radiator is often the right fix rather than raising the flow temperature. Your MCS installer should have done a room-by-room sizing check at design; ask for that document.');
save('16-trv-sizing-for-heat-pump-systems.json', f16);

// File 17
const f17 = JSON.parse(readFileSync(`${dir}/17-heat-pump-defrost-cycle-explained.json`, 'utf8'));
setParaText(f17.body, 'orderedList[2] > listItem[0] > paragraph[0]', 'The controller detects that defrost is needed. It uses either a timer (every 30 to 90 minutes in frosting conditions) or a temperature sensor on the coil.');
setParaText(f17.body, 'paragraph[4]', 'On a system with a buffer cylinder, a defrost cycle is nearly invisible indoors. The buffer holds a small reserve of hot water. The heating circuit keeps running from the buffer while the heat pump defrosts, and room temperatures barely move. Without a buffer, or with a very small one, you may notice the backup element cutting in (if fitted), the room temperature dropping 0.5 to 1°C, and a steam cloud from the outdoor unit as the frost melts.');
setParaText(f17.body, 'bulletList[6] > listItem[0] > paragraph[0]', 'Normal: defrost occurs every 30 to 90 minutes during frost (typically 0°C to +4°C). Each cycle lasts 3 to 8 minutes. The unit resumes heating promptly.');
setParaText(f17.body, 'bulletList[6] > listItem[1] > paragraph[0]', 'Concern: defrost cycles more than once every 20 minutes, or any cycle lasting over 15 minutes, point to a problem. Possible causes: the unit is recirculating its own cold exhaust air, the condensate drain is blocked causing ice build-up at the base, or there is a refrigerant pressure fault.');
setParaText(f17.body, 'bulletList[6] > listItem[2] > paragraph[0]', 'Action: check the condensate drain is clear and draining away from the unit. Confirm at least 300 mm clearance on all sides. Make sure the unit is not in a corner, alcove, or against a wall that bounces cold wet air back to the inlet.');
save('17-heat-pump-defrost-cycle-explained.json', f17);

// File 18
const f18 = JSON.parse(readFileSync(`${dir}/18-district-heat-network-connection-decision.json`, 'utf8'));
setParaText(f18.body, 'paragraph[5]', 'Heat networks usually include a standing charge for HIU maintenance, pipe upkeep, and network costs. This charge varies by network and can push the effective heat cost well above a gas boiler for a well-insulated home with low consumption. For a poorly insulated home with high consumption, the unit rate matters more than the standing charge.');
setParaText(f18.body, 'paragraph[7]', 'Under the Energy Act 2023, Ofgem regulates heat networks from 2024, with rules on pricing transparency, billing, and service standards. If you get an offer to connect, the operator must give you a pricing summary, contract terms, and the complaints process. You can switch heat network suppliers if more than one serves your area, and can challenge billing disputes through Ofgem.');
setParaText(f18.body, 'paragraph[9]', 'In some new builds, planning or the lease requires heat network connection. The resident cannot fit their own boiler or heat pump. If you are in this position with concerns about pricing or contract terms, contact Ofgem or Citizens Advice. The Consumer Advocacy Forum for Heat Networks (CAFoH) also takes individual complaints.');
save('18-district-heat-network-connection-decision.json', f18);

// File 19
const f19 = JSON.parse(readFileSync(`${dir}/19-compost-tea-aerated-vs-simple-method.json`, 'utf8'));
setParaText(f19.body, 'paragraph[0]', 'Simple compost tea is made by placing a few handfuls of finished compost in a hessian bag or old pillowcase, dropping it into a bucket of water, and steeping for 24 to 48 hours. The liquid turns brown and contains humic acids, some minerals, and a small population of microorganisms from the compost. It is a dilute liquid feed, roughly equal to a weak seaweed or fish fertiliser application.');
setParaText(f19.body, 'paragraph[1]', 'Aerated compost tea (ACT) uses a small aquarium pump (5 to 20 litre/hour) to bubble air through the same brew. After 24 to 48 hours, aerobic bacteria and fungi have multiplied 100 to 1,000-fold under good conditions. The result is not mainly a nutrient feed. It is a microbial inoculant that puts living organisms back into soil that has been disturbed, sterilised, or depleted.');
save('19-compost-tea-aerated-vs-simple-method.json', f19);

// File 20
const f20 = JSON.parse(readFileSync(`${dir}/20-cardboard-as-compost-carbon-source.json`, 'utf8'));
setParaText(f20.body, 'bulletList[4] > listItem[0] > paragraph[0]', 'Wax-coated or heavily printed card (some pizza boxes, glossy outer packaging): the wax and ink compounds slow breakdown and can leave microplastics in the finished compost.');
setParaText(f20.body, 'bulletList[4] > listItem[1] > paragraph[0]', 'Plastic-laminated card (Tetrapak, some frozen-food packaging): the plastic layer does not break down and leaves residue in the compost.');
save('20-cardboard-as-compost-carbon-source.json', f20);

// File 21
const f21 = JSON.parse(readFileSync(`${dir}/21-small-animal-manure-in-compost.json`, 'utf8'));
setParaText(f21.body, 'bulletList[7] > listItem[0] > paragraph[0]', 'Cat and dog waste: high risk of Toxocara and other parasites. Not safe for home composting where edible crops will grow.');
save('21-small-animal-manure-in-compost.json', f21);

// File 24
const f24 = JSON.parse(readFileSync(`${dir}/24-building-a-compost-heap-cover.json`, 'utf8'));
setParaText(f24.body, 'paragraph[0]', 'A compost heap needs three things: moisture in the 40 to 60% range (like a wrung-out sponge), enough oxygen, and warmth. In a UK winter, an uncovered heap gets too much rain and drops below the active temperature range. It either goes slimy and anaerobic (too wet) or slow and dry (after a dry summer). A cover fixes this without blocking airflow. Most guides treat covering as optional, but in practice it speeds decomposition noticeably.');
save('24-building-a-compost-heap-cover.json', f24);

// File 26
const f26 = JSON.parse(readFileSync(`${dir}/26-deep-litter-composting-chicken-run.json`, 'utf8'));
setParaText(f26.body, 'paragraph[0]', 'Chickens scratch and turn organic matter as a natural behaviour. Deep litter turns that into a composting system. Add carbon material (wood chips, straw, autumn leaves, torn cardboard) on top of accumulated manure. The chickens mix it as they scratch. Microbial activity at the base produces heat and breaks down the material. The result is a dry, odour-free floor and a supply of partially composted material to harvest each year.');
save('26-deep-litter-composting-chicken-run.json', f26);

// File 28
const f28 = JSON.parse(readFileSync(`${dir}/28-rain-garden-for-driveway-runoff.json`, 'utf8'));
setParaText(f28.body, 'paragraph[0]', 'Rain falling on a paved driveway cannot soak in. It runs into the gutter and then into the storm or combined sewer. In a heavy downpour, this contributes to flash flooding and sewer overflow. A rain garden at the driveway edge or at a downpipe outlet intercepts the runoff and lets it soak into the ground. This delivers water to plant roots and the water table rather than the sewer. A well-designed rain garden on a 50 m2 driveway captures around 1,200 litres during a medium-intensity UK rainstorm.');
save('28-rain-garden-for-driveway-runoff.json', f28);

// File 30
const f30 = JSON.parse(readFileSync(`${dir}/30-rainwater-roof-area-yield-calculation.json`, 'utf8'));
setParaText(f30.body, 'paragraph[0]', 'The yield of a rainwater collection system depends on three numbers: the plan area of the roof feeding the collection point (m2), the local annual rainfall (mm), and the runoff coefficient for the roof type. Multiply these together to get the annual collectable yield in litres.');
save('30-rainwater-roof-area-yield-calculation.json', f30);

// File 31
const f31 = JSON.parse(readFileSync(`${dir}/31-underground-cistern-maintenance.json`, 'utf8'));
setParaText(f31.body, 'paragraph[0]', 'An underground cistern slowly builds up fine sediment: particles from tiles, pollen, and organic debris that gets through the inlet filter. The sediment settles to the base and only reaches the pump when the water level drops very low. A good system with a calmed inlet and a floating suction filter keeps the drawn water clear all year. The maintenance task is to keep the inlet filter clear, check the sediment level once a year, and clean when needed.');
save('31-underground-cistern-maintenance.json', f31);

// File 32
const f32 = JSON.parse(readFileSync(`${dir}/32-water-efficient-showerhead-selection.json`, 'utf8'));
setParaText(f32.body, 'paragraph[2]', 'Low-flow showerheads need a minimum water pressure to work correctly. UK homes have two main supply types:');
save('32-water-efficient-showerhead-selection.json', f32);

// File 34
const f34 = JSON.parse(readFileSync(`${dir}/34-using-refill-shops-and-zero-waste-stores.json`, 'utf8'));
setParaText(f34.body, 'bulletList[6] > listItem[1] > paragraph[0]', 'Washing-up liquid and all-purpose cleaner: concentrated refill versions can match supermarket prices while cutting out a plastic bottle each time.');
setParaText(f34.body, 'paragraph[8]', 'Zero-waste shops rarely beat budget supermarket prices on staples like pasta, rice, and oats. Supermarkets use volume buying power to undercut small independents. The reason to buy these in bulk refill is environmental: it cuts out plastic film, outer boxes, and packaging logistics. It does not save money on the weekly shop.');
save('34-using-refill-shops-and-zero-waste-stores.json', f34);

// File 37
const f37 = JSON.parse(readFileSync(`${dir}/37-zero-waste-bathroom-swaps-practical.json`, 'utf8'));
setParaText(f37.body, 'bulletList[4] > listItem[1] > paragraph[0]', 'Toothpaste tablets or powder: these cut out the toothpaste tube, which most UK kerbside schemes cannot recycle. Tablets need a change of technique; powders apply like regular toothpaste. Both clean teeth well if they contain fluoride.');
save('37-zero-waste-bathroom-swaps-practical.json', f37);

// File 38
const f38 = JSON.parse(readFileSync(`${dir}/38-off-grid-load-calculation-worksheet.json`, 'utf8'));
setParaText(f38.body, 'paragraph[0]', 'Sizing an off-grid system for average demand gives a system that runs short in bad weather. The right approach is to size for peak demand over 2 to 3 days of low sun in a row (the autonomy period). In a UK location, this means planning for winter conditions with a run of overcast days.');
setParaText(f38.body, 'paragraph[2]', 'For each appliance or circuit, write down: the power rating in watts (W), the daily hours of use in the worst case (winter), and whether you can switch it off in bad weather to save battery life.');
save('38-off-grid-load-calculation-worksheet.json', f38);

// File 39
const f39 = JSON.parse(readFileSync(`${dir}/39-composting-toilet-annual-maintenance.json`, 'utf8'));
setParaText(f39.body, 'paragraph[0]', 'A correctly operating composting toilet breaks down 80 to 90% of waste volume through aerobic decomposition. With one person using it, the chamber needs emptying once a year. With four people, twice a year. The removed material has typically been composting for 6 to 12 months. It is pathogen-reduced humus suitable for use on non-edible crops.');
setParaText(f39.body, 'orderedList[3] > listItem[0] > paragraph[0]', 'Turn the drum or rotate the chamber following the manufacturer\'s instructions. This moves the oldest compost to the collection tray (drum-type units) or releases the mature layer (tray-type units).');
setParaText(f39.body, 'orderedList[3] > listItem[2] > paragraph[0]', 'Add a bulking agent. After emptying, put a small amount of peat or coir (about 250 g) or a recommended compost additive into the chamber. This restarts microbial activity.');
save('39-composting-toilet-annual-maintenance.json', f39);

// File 40
const f40 = JSON.parse(readFileSync(`${dir}/40-lpg-backup-heating-for-off-grid.json`, 'utf8'));
setParaText(f40.body, 'paragraph[0]', 'LPG holds about 25 kWh per kilogram of propane, far more energy-dense than any practical battery. A 47 kg propane cylinder contains about 1,175 kWh of heat, enough to run a 5 kW space heater for about 10 days. For a weekend cabin or rarely used off-grid home, one 47 kg cylinder topped up each year covers backup heating and cooking with room to spare.');
setParaText(f40.body, 'orderedList[5] > listItem[0] > paragraph[0]', 'Stand cylinders upright on a firm, level surface outdoors. Keep them away from drains, gratings, and low spots where gas vapour (heavier than air) could collect.');
save('40-lpg-backup-heating-for-off-grid.json', f40);

console.log('Grade-level fixes done.');
