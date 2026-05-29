/**
 * Bulk fixes for sustainability BLOCK tutorials — grade-level-strict and voice-violations.
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

const SLUG_FIXES: [string, string, string][] = [
  // ── airtightness-survey-smoke-pencil ─────────────────────────────────────────
  ['airtightness-survey-smoke-pencil',
    'For a numeric before-and-after measurement, airtightness testing with a blower door gives a quantified result. It is not needed for a domestic draught-sealing job. But it is the only way to measure improvement objectively; energy assessors offer the service.',
    'For a measured before-and-after result, a blower door test gives exact numbers. It is not needed for a home draught job. But it is the only way to check if the work made a real difference; energy assessors offer the test.'],

  // ── anaerobic-digestion-at-home ───────────────────────────────────────────────
  ['anaerobic-digestion-at-home',
    'Purpose-designed domestic digesters include properly tested seals, pressure relief valves, and burner units. A DIY barrel system requires careful attention to gas-tightness, pressure, and burner matching. If in any doubt about gas-system construction, buy a commercial unit rather than building from scratch.',
    'Purpose-built home digesters have tested seals, pressure relief valves, and burner units. A DIY barrel needs care with gas-tightness, pressure, and burner fit. If in any doubt about the gas system, buy a commercial unit rather than building one.'],

  ['anaerobic-digestion-at-home',
    'Use the aquarium pump to agitate the slurry once per day by recirculating the headspace gas through the slurry. This prevents a surface crust from blocking gas release and keeps the bacterial population evenly distributed.',
    'Use the aquarium pump to stir the slurry once a day by cycling the headspace gas back through it. This stops a crust forming on the surface and keeps the bacteria spread through the mix.'],

  // ── basement-and-cellar-insulation ────────────────────────────────────────────
  ['basement-and-cellar-insulation',
    'Damp treatment is almost always worth doing with a professional unless the cause is clearly surface condensation. Structural retaining walls should not be lined without advice. Any basement conversion that adds habitable floor area may require building regulations approval.',
    'Damp treatment is almost always a job for a pro unless the cause is surface condensation. Do not line structural retaining walls without advice. Any basement conversion that adds living space may need building approval.'],

  // ── battery-recycling-and-disposal ───────────────────────────────────────────
  ['battery-recycling-and-disposal',
    'A swollen, punctured, or physically damaged lithium battery should be placed in a sealed metal container and taken to an HWRC as soon as possible. Do not transport it in a bag with other flammable materials. Lithium battery fires caused by thermal runaway cannot be extinguished with water and require a class D or sand-based extinguishing agent.',
    'A swollen, punctured, or damaged lithium battery should go in a sealed metal box and be taken to an HWRC as soon as possible. Do not carry it with other flammable items. Lithium battery fires from thermal runaway cannot be put out with water and need a class D or sand-based agent.'],

  // ── buying-secondhand-for-quality ─────────────────────────────────────────────
  ['buying-secondhand-for-quality',
    'Vinted, eBay, and Facebook Marketplace for clothing and household items. Local Facebook Marketplace for furniture and tools (collection avoids shipping costs and lets you inspect before committing).',
    'Vinted, eBay, and Facebook Marketplace for clothes and household items. Local Facebook Marketplace for furniture and tools; collecting in person avoids postage and lets you check before buying.'],

  ['buying-secondhand-for-quality',
    'Le Creuset',
    'a cast-iron casserole'],

  ['buying-secondhand-for-quality',
    'Lodge',
    'a cast-iron skillet'],

  // ── choosing-between-solar-pv-and-solar-thermal ──────────────────────────────
  ['choosing-between-solar-pv-and-solar-thermal',
    'Already have a system installed with a compatible twin-coil cylinder.',
    'Already have a system fitted with a twin-coil cylinder.'],

  ['choosing-between-solar-pv-and-solar-thermal',
    'Solar thermal requires a twin-coil cylinder and often a controller, pump, and expansion vessel. PV requires fewer ancillary components.',
    'Solar thermal needs a twin-coil cylinder and often a controller, pump, and expansion vessel. PV needs fewer extra parts.'],

  // ── choosing-eco-cleaning-products ───────────────────────────────────────────
  ['choosing-eco-cleaning-products',
    'General surface cleaner: diluted concentrate for worktops, bathroom surfaces, and sinks.',
    'General surface cleaner: a diluted concentrate for worktops, baths, and sinks.'],

  // ── compost-activators ────────────────────────────────────────────────────────
  ['compost-activators',
    'Adding finished compost to a new heap introduces a diverse microbial community and is the most reliably effective microbial activator. Any mature compost from a healthy heap contains billions of bacteria and fungi per gram. A handful spread through the new heap layers is more effective than a packet of commercial microbial powder.',
    'Adding finished compost to a new heap brings in a wide range of bacteria and fungi and is the most reliable way to kick-start it. Any mature compost from a healthy heap holds billions of microbes per gram. A handful spread through the new heap layers works better than a packet of shop-bought microbial powder.'],

  ['compost-activators',
    'Adding rock dust or minerals: these may improve finished compost quality but do not speed up decomposition.',
    'Adding rock dust or minerals: these may improve the finished compost but do not speed up the rot.'],

  // ── compostable-packaging-reality ────────────────────────────────────────────
  ['compostable-packaging-reality',
    'No certification mark: no regulatory claim. The word compostable without a certification mark is an unsubstantiated claim under the Green Claims Code and should be treated as unverified.',
    'No cert mark: no valid claim. The word compostable without a cert mark is an unverified claim under the Green Claims Code.'],

  // ── composting-toilet-decision-guide ────────────────────────────────────────
  ['composting-toilet-decision-guide',
    'A composting toilet handles human waste without mains water or a drain connection. It uses aerobic decomposition with a carbon bulking material to reduce waste volume by about 90% over 6 to 12 months. The system suits outbuildings, cabins, and remote sites where drainage installation is impractical. The primary constraints are maintenance requirements, regulatory compliance, and what to do with the processed output.',
    'A composting toilet handles human waste without mains water or a drain. It uses aerobic breakdown with a carbon bulking material to cut waste volume by about 90% over 6 to 12 months. The system suits outbuildings, cabins, and remote sites where fitting drainage is not worth it. The main limits are upkeep, meeting the rules, and what to do with the end product.'],

  // ── conservatory-roof-replacement-decision ───────────────────────────────────
  ['conservatory-roof-replacement-decision',
    'If the conservatory is used mainly in summer: upgraded glazing stops the worst overheating at lower cost.',
    'If the conservatory is used mainly in summer: better glazing stops the worst heat build-up for less cost.'],

  // ── cooking-oil-and-fat-disposal ─────────────────────────────────────────────
  ['cooking-oil-and-fat-disposal',
    'saponification',
    'the soap-making reaction'],

  // ── demand-response-smart-tariff ──────────────────────────────────────────────
  ['demand-response-smart-tariff',
    'Simple two-rate tariffs: suited to households with electric storage heating or EV charging that can all run overnight. The overnight cheap rate is fixed and predictable. Dynamic 30-minute tariffs: suited to households with a battery or automation that can track the variable rate. Rates occasionally go negative during periods of surplus renewable generation. If you have no battery and no automation. Dynamic tariffs carry the risk of accidentally leaving high-consumption loads on during expensive periods.',
    'Simple two-rate tariffs: suited to homes with storage heaters or an EV that can charge overnight. The off-peak rate is fixed and easy to plan around. Dynamic 30-minute tariffs: suited to homes with a battery or smart controls that can follow the live rate. Rates can go negative when the grid has too much renewable power. If you have no battery and no smart controls. Dynamic tariffs risk leaving heavy loads on at peak price by mistake.'],

  // ── electronic-waste-recycling ────────────────────────────────────────────────
  ['electronic-waste-recycling',
    'Even devices with no trade-in value can usually be returned to the manufacturer for recycling.',
    'Even devices with no trade-in value can usually be sent back to the maker for recycling.'],

  ['electronic-waste-recycling',
    'Community Repaint and Computer Aid International collect working devices. Charity shops accept working small appliances. The Restart Project runs repair cafes where volunteers help fix broken electronics. A device that is repaired or reused rather than recycled retains its embedded material value and delays the energy cost of manufacturing a replacement.',
    'Community Repaint and Computer Aid International both run local drop-in schemes where you can hand in kit. Charity shops also take small appliances if they still work. The Restart Project runs repair cafes where volunteers help fix broken electronics. A device that is repaired or reused keeps its built-in value and saves the energy cost of making a new one.'],

  // ── ev-charger-decision-guide ─────────────────────────────────────────────────
  ['ev-charger-decision-guide',
    'A solar-integrated smart charger measures surplus generation via a CT clamp and dynamically adjusts the charge rate to consume exactly the surplus rather than importing from the grid. This requires a minimum surplus of around 1.4 kW to activate the boost mode. Below that threshold, the car charges at the minimum rate or waits. In practice, solar-boosted EV charging contributes most in summer afternoons when generation exceeds household demand.',
    'A solar-linked smart charger reads surplus output via a CT clamp and adjusts the charge rate to use that surplus rather than drawing from the grid. This needs a minimum surplus of around 1.4 kW to activate boost mode. Below that, the car charges at the minimum rate or waits. In practice, EV solar charging helps most on summer afternoons when the panels make more than the house needs.'],

  // ── flat-roof-insulation-options ──────────────────────────────────────────────
  ['flat-roof-insulation-options',
    'Re-covering a typical domestic extension roof: warm deck is correct. If the existing covering needs replacing, the Building Regulations require U-value improvement. PIR above the deck is the most cost-effective route.',
    'Re-covering a home extension roof: warm deck is the right call. If the cover needs replacing, the rules require a U-value upgrade. PIR above the deck is the most cost-effective route.'],

  // ── gravity-fed-spring-water-supply ──────────────────────────────────────────
  ['gravity-fed-spring-water-supply',
    ' from contamination and treating the water adequately before use. A supply that fails a microbiological test is a health risk and will attract enforcement action from the local authority.',
    ' from contamination and treating the water before use. A supply that fails a water test is a health risk and can trigger enforcement by the local authority.'],

  ['gravity-fed-spring-water-supply',
    ' serving any premises other than a single domestic dwelling must be registered with and risk-assessed by the local authority environmental health team. The local authority has powers to require improvements if the supply does not meet drinking water standards. Contact the local authority\'s environmental health department before commissioning a new private supply to confirm the regulatory requirements for your specific situation.',
    ' serving any property other than a single home must be logged and checked by the local authority. The council can require upgrades if the supply fails water quality tests. Contact environmental health at your local council before starting a new private supply.'],

  ['gravity-fed-spring-water-supply',
    'Test the treated water annually at minimum using an accredited laboratory. Basic microbiological testing costs 30 to 60 pounds per sample. Test after any nearby land use change, flood event, or unusually high turbidity. Local authority environmental health can advise on the appropriate test parameter set for the site\'s specific risk profile.',
    'Test the treated water at least once a year using an approved lab. Basic bacterial testing costs 30 to 60 pounds per sample. Test again after any nearby land use change, flood, or high turbidity. Your local environmental health team can advise on the right tests for your site.'],

  // ── greywater-reed-bed ────────────────────────────────────────────────────────
  ['greywater-reed-bed',
    'Greywater reuse systems in England require building regulations compliance and may require planning permission. Check with your local planning authority before installation. Never connect toilet waste to a greywater system.',
    'Greywater systems in England need building approval and may need planning consent. Check with your local council before starting the work. Never connect toilet waste to a greywater system.'],

  ['greywater-reed-bed',
    'Standard household detergents pass through a reed bed and are present in low concentrations in the outlet. For ornamental garden irrigation this is acceptable. If the outlet water will reach edible crops, use phosphate-free, biodegradable soap products in the source bathroom. Products marketed for grey water reuse systems are formulated specifically for this purpose and are available from most hardware retailers.',
    'Standard household detergents pass through a reed bed and come out at low levels. For ornamental garden use this is fine. If the outlet water will reach edible crops, use phosphate-free biodegradable soap in the source bathroom. Products sold for greywater systems are made for this purpose and are stocked at most hardware shops.'],

  // ── ground-mounted-solar-pv ───────────────────────────────────────────────────
  ['ground-mounted-solar-pv',
    'Systems above 3.68 kW single-phase require a G98 or G99 application to your distribution network operator before export is permitted. Electrical installation must be carried out or certified by a Part P registered electrician. Panels and inverters must be on the MCS product list for MCS certification and access to the Smart Export Guarantee.',
    'Above 3.68 kW, you need prior grid approval. Most systems use a G98 form; only those above 16 kW need the G99 process. Your local DNO handles both. All electrical work must be done or signed off by a Part P electrician. Panels and inverters must be MCS-listed for the Smart Export Guarantee.'],

  // ── hazardous-household-waste-disposal ───────────────────────────────────────
  ['hazardous-household-waste-disposal',
    ' ends up in general waste because householders do not know that a free disposal route exists at their local HWRC. The HWRC hazardous bay accepts most categories without charge and without requiring prior booking in most local authorities. The barrier is awareness, not access.',
    ' ends up in bins because most people do not know that free disposal is available at their local HWRC. The HWRC hazardous bay takes most items at no charge and needs no prior booking. The barrier is awareness, not access.'],

  // ── household-waste-audit ─────────────────────────────────────────────────────
  ['household-waste-audit',
    'Every item that leaves the kitchen or living space goes into one of the four categories before it enters the bin. Do not count the recycling bin separately: audit everything that the household generates.',
    'Every item that leaves the kitchen or living space goes into one of the four groups before it enters the bin. Do not count the recycling bin separately: audit everything the household throws out.'],

  ['household-waste-audit',
    'High packaging waste: identify the three or four product types generating the most packaging. Switching to a loose or bulk alternative for those items typically reduces packaging weight by 30 to 50 percent for that category.',
    'High packaging waste: find the three or four product types making the most packaging. Switching to a loose or bulk option for those items typically cuts packaging weight by 30 to 50 percent.'],

  // ── hugelkultur-raised-bed ────────────────────────────────────────────────────
  ['hugelkultur-raised-bed',
    'Plant nitrogen-fixing species in the first year: beans, peas, clover, or comfrey as a companion to other crops. These supplement the available nitrogen while the ',
    'Grow nitrogen-fixing crops in the first year: beans, peas, clover, or comfrey with other crops. These add to the available nitrogen while the '],

  // ── insulation-and-ventilation-together ──────────────────────────────────────
  ['insulation-and-ventilation-together',
    'Condensation on cold window glass in winter, particularly in bedrooms overnight. Some condensation on single-glazed windows is normal in cold weather. Sustained condensation on double-glazing suggests high moisture loads and poor extract.',
    'Condensation on cold window glass in winter, mainly in bedrooms overnight. Some condensation on single-glazed windows is normal in cold weather. Ongoing condensation on double-glazing means high moisture and poor extract.'],

  // ── internal-wall-insulation-how-to-choose ───────────────────────────────────
  ['internal-wall-insulation-how-to-choose',
    'Planning: external insulation needs consent on listed buildings and in conservation areas. Internal insulation does not.',
    'Planning: external insulation needs consent on listed buildings and in conservation areas. Internal insulation does not need consent.'],

  // ── inverter-types-for-solar-pv ──────────────────────────────────────────────
  ['inverter-types-for-solar-pv',
    'Typical output recovery vs unoptimised: 5 to 25 percent, depending on shading.',
    'Typical output gain over an unoptimised system: 5 to 25 percent, depending on shade.'],

  // ── library-of-things ────────────────────────────────────────────────────────
  ['library-of-things',
    'Garden equipment: lawn scarifiers, stump grinders, electric hedge trimmers, turf cutters.',
    'Garden equipment: lawn scarifiers, stump grinders, and hedge trimmers.'],

  ['library-of-things',
    'Party and event equipment: folding tables, chairs, gazebos, urns, projectors.',
    'Party and event equipment: folding tables, chairs, and gazebos.'],

  ['library-of-things',
    'Household: steam cleaners, carpet cleaners, dehumidifiers, and kitchen gadgets used only once or twice a year.',
    'Household: steam cleaners, carpet cleaners, and dehumidifiers.'],

  // ── loft-conversion-insulation-options ───────────────────────────────────────
  ['loft-conversion-insulation-options',
    'A warm roof configuration keeps the structural timber warm. The ventilation gap above the insulation is still required to drain any moisture that reaches the space below the covering. A vapour control layer below the between-rafter insulation reduces moisture movement from the interior.',
    'A warm roof keeps the structural timber warm. A ventilation gap above the insulation is still needed to drain any moisture below the covering. A vapour control layer below the rafter insulation cuts moisture movement from inside.'],

  // ── mains-drip-irrigation-with-timer ─────────────────────────────────────────
  ['mains-drip-irrigation-with-timer',
    'Drip emitters require a minimum of 0.5 bar to operate correctly. If the mains dynamic pressure is below 1.5 bar, use pressure-compensating emitters specifically rated for low-pressure operation. Soaker hoses perform adequately from 0.5 bar upward. For mains above 3.5 bar, fit a ',
    'Drip emitters need at least 0.5 bar to work. If the mains pressure is below 1.5 bar, use low-pressure emitters rated for that range. Soaker hoses work fine from 0.5 bar upward. For mains above 3.5 bar, fit a '],

  // ── mvhr-decision-guide ───────────────────────────────────────────────────────
  ['mvhr-decision-guide',
    'The system was installed in a leaky 1970s semi without prior airtightness work. The fans run continuously but most ventilation air enters through gaps in the walls and windows rather than through the supply grilles. Heat recovery efficiency is effectively near zero because the extracted air is replaced by cold infiltration rather than by the conditioned supply air. The electricity bill for the fans adds to the energy cost rather than offsetting it.',
    'The system was installed in a leaky 1970s semi without any airtightness work first. The fans run all the time but most air enters through gaps in the walls and windows rather than the supply grilles. Heat recovery is near zero because cold air leaks in rather than the warm supply air. The fan electricity adds to the energy bill rather than cutting it.'],

  // ── off-grid-power-monitoring ─────────────────────────────────────────────────
  ['off-grid-power-monitoring',
    'Track charge over a season: a battery that never hits 100 percent after a full sunny day is either ageing or the panels cannot cover the load.',
    'Track charge over a season: a battery that never hits 100 percent after a full sunny day is either ageing or the panels are too small for the load.'],

  // ── planning-permission-off-grid ──────────────────────────────────────────────
  ['planning-permission-off-grid',
    ' rights cover most energy and water installations. No planning application is needed for these. Building regulations are separate and still apply even if no planning permission is required.',
    ' rights cover most energy and water systems. No planning application is needed for these. Building rules still apply even without planning consent.'],

  ['planning-permission-off-grid',
    'Article 4 directions: some local authorities have removed permitted development rights in certain areas. Check with the local planning authority if unsure.',
    'Article 4 directions: some councils have removed permitted development rights in certain areas. Check with your local planning office if unsure.'],

  // ── rainwater-for-toilet-flushing ────────────────────────────────────────────
  ['rainwater-for-toilet-flushing',
    'A mains backup float valve in the tank tops up automatically if the rainwater level falls below the pump minimum.',
    'A mains backup float valve tops up the tank automatically if the rainwater level drops below the pump minimum.'],

  ['rainwater-for-toilet-flushing',
    'Connecting rainwater to the internal plumbing requires notification to the water company under the Water Supply Regulations 1999. The rainwater circuit must not connect to the mains supply. All non-potable pipework must be clearly labelled at every point.',
    'Connecting rainwater to the internal plumbing requires notice to the water company under the Water Supply Regulations 1999. The rainwater circuit must not link to the mains. All non-drinking pipework must be clearly labelled at every point.'],

  // ── rainwater-harvesting-underground-tank ────────────────────────────────────
  ['rainwater-harvesting-underground-tank',
    'First-flush diverter: diverts the first 1-2 mm of rain from each event (which carries the most roof contamination from bird droppings and atmospheric deposits) away from the tank. Automatically resets after a dry period.',
    'First-flush diverter: sends the first 1-2 mm of rain from each event away from the tank. This is the dirtiest water, carrying roof dust, bird droppings, and airborne particles. Resets on its own after a dry spell.'],

  ['rainwater-harvesting-underground-tank',
    'An underground rainwater harvesting system for toilet flushing must comply with the Water Supply Regulations 1999 to prevent cross-connection with the mains supply. The non-potable supply pipe must be labelled and clearly differentiated from the drinking water pipework. The system requires a type AA air gap between the mains backup supply and the tank to prevent backflow. Most systems are permitted development if they are for toilet flushing and garden use only.',
    'An underground rainwater system for toilet flushing must comply with the Water Supply Regulations 1999 to stop cross-connection with the mains. The non-drinking pipe must be labelled and kept clearly apart from the drinking water pipes. The system needs a type AA air gap between the mains backup and the tank to stop backflow. Most systems are permitted development if used for toilet flushing and garden watering only.'],

  // ── reading-an-in-home-display ───────────────────────────────────────────────
  ['reading-an-in-home-display',
    'The IHD shows current consumption in two ways: instantaneous power draw in watts and estimated spend in pence per hour or pounds per day. The real-time wattage reading is the more useful: it lets you find out what individual appliances draw by turning them on and off and watching the reading change.',
    'The IHD shows live use in two ways: power draw in watts and estimated spend in pence per hour or pounds per day. The wattage reading is the more useful one: turn appliances on and off and watch the number change to see what each one draws.'],

  // ── right-to-repair-electronics ──────────────────────────────────────────────
  ['right-to-repair-electronics',
    'A smartphone battery that holds less than 80% of its original charge typically needs replacement after 2-3 years of normal use. Battery health can be checked in Settings on iPhone; Android battery health apps give similar information. Replacement batteries for most current smartphones are available from iFixit or specialist phone parts suppliers. Most guides rate battery replacement 4-6 difficulty on a 10-point scale: it requires care but not specialist training.',
    'A phone battery that holds less than 80% of its charge typically needs replacing after 2-3 years of normal use. Battery health can be checked in Settings on iPhone; Android health apps give the same information. Replacement batteries for most phones are available from iFixit or specialist parts shops. Most guides rate battery replacement 4-6 on a 10-point scale: it needs care but not specialist training.'],

  ['right-to-repair-electronics',
    'Repair Cafes. Volunteer-run events in libraries and community centres. Skilled volunteers help repair electronics, clothing, and household items. Repair Cafe International\'s website lists events by location.',
    'Repair Cafes. Volunteer-run events in libraries and community halls. Skilled volunteers help fix electronics, clothing, and household items. Repair Cafe International lists events by location on its website.'],

  // ── root-cellar-food-storage ──────────────────────────────────────────────────
  ['root-cellar-food-storage',
    'A traditional above-ground straw-insulated clamp is a lower-cost alternative to a built root cellar for potato and root vegetable storage in climates where ground temperature is enough. Clamps require only straw and soil and cost almost nothing. They are less suitable for apples, preserves, or extended storage beyond March. A root cellar is the right solution where the household produces much volumes of multiple storage crops or needs year-round access.',
    'A straw-insulated clamp above ground is a cheaper option than a built root cellar for potato and root vegetable storage. Clamps need only straw and soil and cost almost nothing. They are less suitable for apples, preserves, or storage past March. A root cellar is the right choice where the household grows large amounts of multiple storage crops or needs year-round access.'],

  // ── secondary-glazing-bay-window ─────────────────────────────────────────────
  ['secondary-glazing-bay-window',
    'Secondary glazing on the inside face of a window does not alter the external appearance and does not require planning permission in most cases. Check with your local authority if the property is listed or in a conservation area with specific conditions on internal alterations.',
    'Secondary glazing on the inside of a window does not change the external look and does not need planning consent in most cases. Check with your local council if the property is listed or in a conservation area with specific rules on internal changes.'],

  // ── sieving-and-storing-finished-compost ─────────────────────────────────────
  ['sieving-and-storing-finished-compost',
    'Material that does not pass through the sieve is not wasted. Return it to the active compost heap as a starter culture: it already contains microorganisms and will accelerate decomposition of the new material. Do not store oversize material separately; it dries out and loses its biological activity.',
    'Material that does not pass through the sieve is not wasted. Return it to the active heap as a starter: it already holds microbes and will speed up breakdown of the new material. Do not store oversize material separately; it dries out and loses its biological activity.'],

  // ── solar-diverter-vs-battery ────────────────────────────────────────────────
  ['solar-diverter-vs-battery',
    'An immersion diverter and a battery are not mutually exclusive. The optimal strategy is to charge the battery first, then divert any remaining surplus to the immersion heater. This maximises ',
    'An immersion diverter and a battery can work together. The best approach is to charge the battery first, then send any surplus to the immersion heater. This gets the most from '],

  // ── solar-immersion-diverter-guide ───────────────────────────────────────────
  ['solar-immersion-diverter-guide',
    'Wiring any device to a consumer unit is notifiable work under Part P. A Part P registered electrician must do the job and issue a Building Regulations Compliance Certificate. An unregistered install may not be covered by your buildings insurance and may void the diverter warranty.',
    'Wiring any device to a consumer unit is notifiable work under Part P. A Part P electrician must do the job and issue a Building Regulations Compliance Certificate. An unregistered install may not be covered by buildings insurance and may void the warranty.'],

  // ── solar-panel-cleaning-and-maintenance ─────────────────────────────────────
  ['solar-panel-cleaning-and-maintenance',
    'When monitoring shows output is below the expected level for the season, consistently.',
    'When monitoring shows output is consistently below the expected level for the season.'],

  // ── thermal-bridging-explained ────────────────────────────────────────────────
  ['thermal-bridging-explained',
    'Repeating bridges: regularly-spaced elements penetrating the insulation. Timber joists in a floor, rafters in a roof, studs in a wall. These are accounted for by correcting the U-value calculation, not by the insulation-only U-value. A 15% stud fraction in a timber-framed wall typically raises the corrected U-value by 10-15% above the insulation-only figure.',
    'Repeating bridges: elements that pass through the insulation at regular spacing. Timber joists in a floor, rafters in a roof, studs in a wall. These are dealt with by correcting the U-value calculation, not by the plain insulation figure. A 15% stud fraction in a timber-framed wall typically raises the corrected U-value by 10-15%.'],

  // ── three-bin-hot-compost-system ─────────────────────────────────────────────
  ['three-bin-hot-compost-system',
    'One cubic metre of finished compost applied to 50 m2 of garden bed at 20 mm depth replaces about 10 bags of bought compost and provides around 3-5 kg of available nitrogen. A three-bin system running continuously produces 3-4 m3 of compost per year from a household with a medium-sized garden.',
    'One cubic metre of finished compost spread at 20 mm over 50 m2 replaces about 10 bags of bought compost and gives around 3-5 kg of usable nitrogen. A three-bin system running through the year produces 3-4 m3 of compost from a household with a medium-sized garden.'],

  // ── understanding-grid-carbon-intensity ──────────────────────────────────────
  ['understanding-grid-carbon-intensity',
    'Solar: reduces midday demand in summer, reducing gas generation needed during peak daytime hours.',
    'Solar: cuts midday demand in summer, reducing the gas generation needed at peak daytime hours.'],

  // ── understanding-house-water-pressure ───────────────────────────────────────
  ['understanding-house-water-pressure',
    'Water hammer noise: banging pipes when taps or appliances close suddenly is a symptom of high flow velocity caused by excess pressure.',
    'Water hammer noise: banging pipes when taps or appliances close fast is a sign of high flow speed caused by too much pressure.'],

  // ── understanding-the-cn-ratio ───────────────────────────────────────────────
  ['understanding-the-cn-ratio',
    'The C:N ratio is about chemistry; particle size is about surface area. A sheet of cardboard at 400:1 decomposes slowly: it is carbon-rich and its surface area per gram is tiny compared to shredded cardboard. Shredding, chopping, or mowing over leaves before composting cuts breakdown time by 50-75% no matter C:N ratio, because it increases the surface available to microbial attack.',
    'C:N is about chemistry; particle size is about how much surface a microbe can reach. A sheet of cardboard at 400:1 breaks down slowly: it is carbon-rich and its surface per gram is tiny next to shredded cardboard. Shredding or chopping cuts breakdown time by 50-75%. Particle size matters as much as C:N ratio. More surface area means more contact for bacteria.'],

  // ── washing-machine-water-efficiency ─────────────────────────────────────────
  ['washing-machine-water-efficiency',
    'Pre-soaking heavily soiled items in a bucket for 30-60 minutes before washing reduces the need for multiple cycles or high-temperature cycles. The pre-soak water can be added to a compost heap or to a planted bed (if it contains a small amount of standard detergent at low concentration). This is not necessary for lightly soiled everyday laundry.',
    'Pre-soaking heavily soiled items in a bucket for 30-60 minutes before washing cuts the need for extra cycles or high-temperature runs. The soak water can go on a compost heap or planted bed if it holds only a small amount of detergent. This is not needed for lightly soiled everyday laundry.'],

  // ── water-efficient-garden-design ────────────────────────────────────────────
  ['water-efficient-garden-design',
    'The highest water demand in most UK gardens comes from lawns, annual bedding, and vegetable crops.',
    'The highest water demand in most UK gardens comes from lawns and annual bedding.'],

  ['water-efficient-garden-design',
    ' alternatives. Lavender, alliums, salvias, and achillea all do well in dry UK summers once established. Replace annual bedding with self-seeding species such as Verbena bonariensis.',
    ' alternatives. Lavender, alliums, salvias, and achillea all thrive in dry UK summers. Swap annual bedding for self-seeding plants; they come back without replanting.'],

  ['water-efficient-garden-design',
    ' to group plants by water need. Place salad crops, courgettes, and other high-demand vegetables together in one bed where irrigation can be targeted. Place drought-tolerant perennials and herbs in a separate bed that needs no irrigation after establishment.',
    ' to group plants by water need. Place salad crops and other high-demand vegetables in one bed where you can target irrigation. Place drought-tolerant perennials and herbs in a separate bed that needs no watering after they settle in.'],

  // ── water-meter-installation-decision ────────────────────────────────────────
  ['water-meter-installation-decision',
    'A meter is likely to save money if the number of people in the home is fewer than the number of bedrooms. A single person in a three-bedroom house will almost certainly be below the unmetered allowance. Two adults in a one-bedroom flat will probably pay more on a meter: consumption is high relative to the rateable value of a small property.',
    'A meter is likely to save money if the number of people in the home is less than the number of bedrooms. A single person in a three-bedroom house will almost certainly use less than the unmetered allowance. Two adults in a one-bedroom flat will probably pay more on a meter: their use is high for such a small property.'],

  ['water-meter-installation-decision',
    'Ofwat and the Consumer Council for Water consistently find that metered households use 10-15 percent less water than unmetered ones. The meter makes consumption visible and links it to cost. Fixing a dripping tap becomes financially motivated as well as environmentally motivated.',
    'Ofwat and the Consumer Council for Water find that metered homes use 10-15 percent less water than unmetered ones. The meter makes use visible and links it to cost. Fixing a dripping tap becomes financially as well as environmentally worth doing.'],

  // ── windrow-composting ────────────────────────────────────────────────────────
  ['windrow-composting',
    'A compost thermometer with at least a 300 mm probe to reach the core of the heap and read the internal temperature accurately.',
    'A compost thermometer with at least a 300 mm probe to reach the core of the heap and read the internal temperature.'],

  // ── wood-stove-installation-decision-guide ────────────────────────────────────
  ['wood-stove-installation-decision-guide',
    'Installing a wood stove is notifiable work under Part J of the Building Regulations. You can use a HETAS-registered installer or apply to the local authority before work starts. With the HETAS route, the installer self-certifies and issues a completion certificate.',
    'Installing a wood stove is notifiable work under Part J of the Building Regulations. You can use a HETAS-registered fitter or apply to the local council before work starts. With the HETAS route, the fitter self-certifies and issues a completion certificate.'],
]

function applyStringReplace(body: unknown, fromText: string, toText: string): { body: unknown; count: number } {
  let count = 0
  function walk(v: unknown): unknown {
    if (typeof v === 'string') {
      if (v.includes(fromText)) { count++; return (v as string).replaceAll(fromText, toText) }
      return v
    }
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) { out[k] = walk(val) }
      return out
    }
    return v
  }
  return { body: walk(body), count }
}

async function main() {
  let totalFixed = 0
  const grouped = new Map<string, [string, string][]>()
  for (const [slug, from, to] of SLUG_FIXES) {
    if (!grouped.has(slug)) grouped.set(slug, [])
    grouped.get(slug)!.push([from, to])
  }

  for (const [slug, pairs] of grouped) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true, revisedFrom: true } })
    if (!t) { console.log('NOT FOUND: ' + slug); continue }

    let body = t.body
    let changed = false
    const applied: string[] = []
    const missed: string[] = []

    for (const [from, to] of pairs) {
      const { body: newBody, count } = applyStringReplace(body, from, to)
      if (count > 0) { body = newBody; changed = true; applied.push(from.slice(0, 40) + '...') }
      else { missed.push(from.slice(0, 60)) }
    }

    if (changed) {
      await prisma.tutorial.update({
        where: { id: t.id },
        data: { body: body as any, voiceRetrofittedAt: new Date(), revisedFrom: t.revisedFrom ?? t.body },
      })
      totalFixed++
      console.log('Fixed: ' + slug + ' (' + applied.length + ' replacements)')
    } else {
      console.log('MISS:  ' + slug)
    }
    if (missed.length) {
      for (const m of missed) console.log('  MISS: ' + m)
    }
  }

  console.log('\nTotal fixed: ' + totalFixed)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
