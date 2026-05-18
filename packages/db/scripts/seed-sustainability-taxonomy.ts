/**
 * One-off seed for the Sustainability taxonomy.
 *
 * Inserts (or no-ops on conflict):
 *
 *   Category   sustainability                       "Sustainability"
 *   SubCat     composting                           "Composting"                        (under sustainability)
 *   SubCat     water                                "Water"                             (under sustainability)
 *   SubCat     solar-and-energy                     "Solar & energy"                    (under sustainability)
 *   SubCat     insulation-and-draughtproofing       "Insulation & draughtproofing"      (under sustainability)
 *   SubCat     waste-reduction                      "Waste reduction"                   (under sustainability)
 *   SubCat     off-grid                             "Off-grid"                          (under sustainability)
 *
 *   GlossaryTerm × ~55 — sustainability-specific terms (kWh, U-value,
 *     payback, MCS, SEG, EPC, Part L, hot vs cold compost, leachate,
 *     greywater, etc.) scoped to the sustainability Category.
 *
 *   Tool × ~12 — common sustainability tools (compost thermometer,
 *     moisture meter, foam-strip gun, draught excluder roll, etc.).
 *     Inserted under the master Tool table with category 'other' — the
 *     existing VALID_CATEGORIES list is cooking-shaped; expanding it
 *     is a separate change.
 *
 * Category itself was seeded earlier by `seed-categories.ts`. This
 * script is idempotent and slug-keyed; it never re-creates the
 * category and never touches `pipelineStatus`. The READY flip lives
 * in `flip-sustainability-ready.ts` and is run as a separate
 * auditable step after the rest of the pipeline scaffolding is
 * committed and deployed green.
 *
 * Garden glossary overlap — composting / mulching / NPK overlap with
 * the garden category. This seed leaves any existing garden-scoped
 * term alone (the upload-tutorial pathway also never overwrites). The
 * shared terms are re-listed below with a `categoryId: sustainability`
 * scope so a sustainability tutorial that wraps "leachate" links to a
 * sustainability-scoped definition; if the garden seed has already
 * claimed the slug the seed reports the conflict and leaves the row
 * in garden's scope (the renderer accepts category-scoped or global).
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-sustainability-taxonomy.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-sustainability-taxonomy.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

interface SubCatSpec {
  slug: string
  name: string
  description: string
  order: number
}

const SUB_CATEGORIES: SubCatSpec[] = [
  {
    slug: 'composting',
    name: 'Composting',
    description:
      'Hot and cold composting, bokashi, wormeries, leaf mould, three-bin systems, troubleshooting wet / dry / slow piles.',
    order: 10,
  },
  {
    slug: 'water',
    name: 'Water',
    description:
      'Rainwater harvesting, greywater reuse, drip irrigation, swales, water-butt installation, low-flow fittings, leak detection.',
    order: 20,
  },
  {
    slug: 'solar-and-energy',
    name: 'Solar & energy',
    description:
      'Solar PV, solar thermal, battery storage, heat pumps, immersion diverters, smart-tariff timing, energy-monitor reading.',
    order: 30,
  },
  {
    slug: 'insulation-and-draughtproofing',
    name: 'Insulation & draughtproofing',
    description:
      'Loft, cavity-wall, internal and external solid-wall insulation, suspended-floor insulation, draught-stripping, secondary glazing.',
    order: 40,
  },
  {
    slug: 'waste-reduction',
    name: 'Waste reduction',
    description:
      'Refusing single-use, repairing rather than replacing, sorting kerbside recycling correctly, household audits, plastic-free swaps that actually save material.',
    order: 50,
  },
  {
    slug: 'off-grid',
    name: 'Off-grid',
    description:
      'Compost toilets, wood stoves, twelve-volt systems, rainwater-only supply, off-grid electrical sizing, planning-permission realities.',
    order: 60,
  },
]

// ────────────────────────────────────────────────────────────────────────────
// Pre-populated glossary. ~55 terms the author prompt will assume exist —
// kWh / kWp / U-value / payback / hot vs cold compost / MCS / SEG / Part L
// / draught-stripping / suspended floor / leachate, etc.
//
// Definitions are short tooltip-shape (one to two sentences). Longer body
// text goes in dedicated entries when those land. UK-canonical phrasing
// with US/EU swaps in brackets where the term differs.
//
// The upload-tutorial pathway will auto-create any glossary term referenced
// inline that isn't pre-seeded — this list just covers the terms that
// appear in 3+ tutorials so the definition is consistent the first time
// each appears.
// ────────────────────────────────────────────────────────────────────────────

interface GlossarySpec {
  slug: string
  term: string
  definition: string
}

const GLOSSARY_TERMS: GlossarySpec[] = [
  // Energy units
  {
    slug: 'kwh',
    term: 'kWh',
    definition:
      'Kilowatt-hour. The unit of energy your electricity meter counts. One kWh runs a 1000 W appliance for an hour, or a 100 W appliance for ten hours.',
  },
  {
    slug: 'kwp',
    term: 'kWp',
    definition:
      'Kilowatt-peak. The headline output a solar array reaches in noon-summer test conditions (1000 W/m² irradiance, 25°C panel temperature). UK arrays produce 800–1100 kWh per kWp per year in practice.',
  },
  {
    slug: 'kw',
    term: 'kW',
    definition:
      'Kilowatt. A rate of energy use or output (not a quantity). A 7 kW heat pump produces heat at 7 kW; a 7 kW EV charger draws power at 7 kW.',
  },
  {
    slug: 'mw',
    term: 'MW',
    definition:
      'Megawatt. A thousand kilowatts. Grid-scale generation and demand are usually quoted in MW or GW; a single household sits in the kW range.',
  },
  {
    slug: 'watt',
    term: 'Watt',
    definition:
      'The base SI unit of power. 1000 W = 1 kW. Appliance plates carry the wattage; the kettle pulls 2200–3000 W while it boils, the LED bulb pulls 8 W while it lights the room.',
  },

  // Thermal performance
  {
    slug: 'u-value',
    term: 'U-value',
    definition:
      'Thermal transmittance. The watts of heat that flow through one square metre of building fabric per degree of temperature difference (W/m²·K). Lower is better; uninsulated solid brick is ~2.1, current Part L new-build wall target is 0.18.',
  },
  {
    slug: 'r-value',
    term: 'R-value',
    definition:
      'Thermal resistance. The inverse of U-value (m²·K/W). Higher is better. Common on US insulation packaging; UK packaging usually quotes lambda + depth instead.',
  },
  {
    slug: 'lambda-value',
    term: 'Lambda value',
    definition:
      'Thermal conductivity (W/m·K). The intrinsic property of an insulation material — mineral wool 0.035–0.044, PIR boards 0.022–0.024, sheep wool 0.038–0.040. Combined with depth, gives the achieved U-value.',
  },
  {
    slug: 'thermal-bridge',
    term: 'Thermal bridge',
    definition:
      'A localised gap or break in the insulation envelope where heat short-circuits the resistance — a steel lintel through a brick wall, a window reveal, a junction between insulated wall and uninsulated floor.',
  },
  {
    slug: 'thermal-mass',
    term: 'Thermal mass',
    definition:
      'A building element that stores and slowly releases heat — solid masonry, stone floors, water tanks. High thermal mass smooths internal temperature swings and works with passive solar gain.',
  },

  // Building regulations + standards
  {
    slug: 'part-l',
    term: 'Part L',
    definition:
      'The Building Regulations chapter (England + Wales) covering conservation of fuel and power. Sets minimum U-values for retrofitted and new fabric. Updated 2022; the 2025 update tightens further.',
  },
  {
    slug: 'epc',
    term: 'EPC',
    definition:
      'Energy Performance Certificate. Required when a UK property is sold or rented. Bands A (most efficient) to G (least). Improvement recommendations on the back; the model is conservative on retrofit savings.',
  },
  {
    slug: 'mcs',
    term: 'MCS',
    definition:
      'Microgeneration Certification Scheme. UK quality standard installer certification for solar, heat pump, biomass, and small wind installations. MCS-certified installation is required for SEG payments and most renewable grants.',
  },
  {
    slug: 'seg',
    term: 'SEG',
    definition:
      'Smart Export Guarantee. The UK scheme that replaced the Feed-in Tariff in 2020. Licensed electricity suppliers must offer an export tariff for solar PV; rates vary by supplier (3p–15p/kWh in 2026).',
  },
  {
    slug: 'pas-2035',
    term: 'PAS 2035',
    definition:
      'British standard for the energy retrofit of existing domestic buildings. Required where public funding (ECO, BUS) pays for the work. Drives the whole-house assessment + ventilation review.',
  },
  {
    slug: 'bus',
    term: 'BUS',
    definition:
      'Boiler Upgrade Scheme. UK grant (£7500 in 2026) toward an air-source or ground-source heat pump replacing a fossil-fuel boiler. England + Wales only; Scotland uses Home Energy Scotland Loan + Grant.',
  },

  // Solar + electrical
  {
    slug: 'solar-pv',
    term: 'Solar PV',
    definition:
      'Photovoltaic solar panels — generate DC electricity from sunlight, inverted to AC for the household supply. Distinct from solar thermal (which heats water).',
  },
  {
    slug: 'solar-thermal',
    term: 'Solar thermal',
    definition:
      'Solar collectors that heat water directly, usually for domestic hot water via a coil in a twin-coil cylinder. Higher per-m² thermal efficiency than PV but only useful for hot water.',
  },
  {
    slug: 'inverter',
    term: 'Inverter',
    definition:
      'Converts the DC output of solar panels (or a battery) into AC compatible with the household supply and the grid. String inverter (one per array) and micro-inverter (one per panel) are the two common types.',
  },
  {
    slug: 'immersion-diverter',
    term: 'Immersion diverter',
    definition:
      'A device that detects excess solar PV export and redirects it into the hot-water cylinder immersion heater instead of sending it to the grid. Brands include MyEnergi Eddi, Solar iBoost. Pays back fastest on cylinders with a south-facing array.',
  },
  {
    slug: 'battery-storage',
    term: 'Battery storage',
    definition:
      'A household battery (typically 5–15 kWh) that stores excess solar or off-peak grid electricity for use later. UK-typical chemistry is lithium iron phosphate (LFP); cycle life 6000+ at 80% depth of discharge.',
  },

  // Heat pumps
  {
    slug: 'heat-pump',
    term: 'Heat pump',
    definition:
      'A heating system that moves heat from one place to another using a refrigerant cycle, instead of generating it by burning fuel. Air-source (ASHP) is the common UK retrofit; ground-source (GSHP) needs land for a loop or borehole.',
  },
  {
    slug: 'cop',
    term: 'COP',
    definition:
      'Coefficient of Performance. The instantaneous ratio of heat output to electricity input for a heat pump. A COP of 3.5 means 3.5 kW of heat for every 1 kW of electricity. Falls as outside temperature drops.',
  },
  {
    slug: 'scop',
    term: 'SCOP',
    definition:
      'Seasonal Coefficient of Performance. Average COP across a heating season. UK air-source heat pumps achieve SCOP 3.0–4.0 depending on system design and emitter sizing.',
  },
  {
    slug: 'flow-temperature',
    term: 'Flow temperature',
    definition:
      'The temperature of the water leaving the heat pump or boiler into the radiators or underfloor circuit. Heat pumps run efficiently at 35–45°C flow; gas boilers default to 70–80°C and can be turned down to similar levels for efficiency.',
  },

  // Insulation specifics
  {
    slug: 'cavity-wall-insulation',
    term: 'Cavity wall insulation',
    definition:
      'Insulation blown or injected into the air gap between the two leaves of a cavity-wall house (post-1930s UK construction). Common materials: blown mineral wool, EPS beads, urea-formaldehyde foam (historic, problematic).',
  },
  {
    slug: 'solid-wall-insulation',
    term: 'Solid wall insulation',
    definition:
      'Insulation added inside or outside a solid-wall house (pre-1930s UK construction, no cavity). Internal wall insulation (IWI) reduces room size by 60–100 mm per wall; external wall insulation (EWI) changes the facade.',
  },
  {
    slug: 'suspended-floor',
    term: 'Suspended floor',
    definition:
      'A timber floor raised above a ventilated air space (rather than concrete slab). Common in pre-1960s UK homes. Insulated from underneath with mineral wool, sheep wool, or PIR boards held in netting between joists.',
  },
  {
    slug: 'draught-stripping',
    term: 'Draught stripping',
    definition:
      'Self-adhesive foam, brush, or rubber strips applied to the meeting surfaces of doors, windows, lofts, and floor gaps to stop air infiltration. The fastest-payback retrofit; a £20 kit cuts measurable heat loss in any uninsulated room.',
  },
  {
    slug: 'mineral-wool',
    term: 'Mineral wool',
    definition:
      'Stone-fibre or glass-fibre insulation, supplied as batts or rolls. Loft-default in the UK. Lambda 0.035–0.044. Itchy to handle; wear gloves, sleeves, and a dust mask.',
  },
  {
    slug: 'sheep-wool-insulation',
    term: 'Sheep wool insulation',
    definition:
      'Insulation made from washed sheep fleece. Lambda 0.038–0.040. Hygroscopic — absorbs and releases moisture, buffering interstitial humidity. More expensive per m² than mineral wool but easier to handle and natural-fibre.',
  },
  {
    slug: 'pir-board',
    term: 'PIR board',
    definition:
      'Polyisocyanurate rigid insulation board, foil-faced. Lambda 0.022–0.024 — the thinnest insulation per U-value of any common product. Used where depth is constrained (rafters, floor build-up).',
  },
  {
    slug: 'vapour-control-layer',
    term: 'Vapour control layer',
    definition:
      'A polythene or membrane layer on the warm side of insulation that limits humid indoor air diffusing into the cooler structure (where it would condense). Required on most internal wall insulation; tape every joint.',
  },

  // Composting
  {
    slug: 'hot-compost',
    term: 'Hot compost',
    definition:
      'A composting method that reaches 55–65°C internally via a balanced C:N mix, sufficient mass (minimum ~1 m³), moisture, and aeration. Kills weed seeds and pathogens; finished compost in 6–12 weeks.',
  },
  {
    slug: 'cold-compost',
    term: 'Cold compost',
    definition:
      'Composting that proceeds at ambient temperature without active heat. Slower (12+ months) and won\'t kill weed seeds, but tolerates random additions and doesn\'t need a critical mass.',
  },
  {
    slug: 'cn-ratio',
    term: 'C:N ratio',
    definition:
      'Carbon-to-nitrogen ratio. The balance that drives a compost pile. ~25:1 to 30:1 by mass is the working target. Browns (dry leaves, cardboard, straw) carry the carbon; greens (grass, kitchen scraps, manure) carry the nitrogen.',
  },
  {
    slug: 'browns-and-greens',
    term: 'Browns and greens',
    definition:
      'The kitchen-and-garden shorthand for composting inputs. Browns = dry, carbon-rich (cardboard, straw, autumn leaves). Greens = wet, nitrogen-rich (grass clippings, vegetable scraps, fresh prunings). Roughly two parts browns to one part greens by volume.',
  },
  {
    slug: 'leachate',
    term: 'Leachate',
    definition:
      'The dark liquid that drains from a wet compost pile or a wormery. Useful diluted as a feed (1:10 with water) but indicates the pile is too wet if it pours out continuously; add browns.',
  },
  {
    slug: 'bokashi',
    term: 'Bokashi',
    definition:
      'An anaerobic composting method using a bran inoculated with lactobacillus, in a sealed bucket with a tap. Pickles kitchen waste (including meat and dairy) in 2 weeks; the result is buried or added to a conventional heap to finish.',
  },
  {
    slug: 'wormery',
    term: 'Wormery',
    definition:
      'A stacked-tray composting system using composting worms (Eisenia fetida, tiger worms) to process kitchen scraps into worm castings and liquid feed. Year-round indoor or sheltered outdoor.',
  },
  {
    slug: 'leaf-mould',
    term: 'Leaf mould',
    definition:
      'Compost made exclusively from autumn leaves, broken down by fungi over 1–2 years rather than the bacteria of a conventional heap. Low in nutrients but an excellent soil conditioner and seed-compost ingredient.',
  },

  // Water
  {
    slug: 'rainwater-harvesting',
    term: 'Rainwater harvesting',
    definition:
      'Capturing roof runoff (typically into a water butt or below-ground tank) for garden, toilet flush, or laundry use. UK roofs collect roughly 0.85 × annual rainfall × roof area in litres per year.',
  },
  {
    slug: 'greywater',
    term: 'Greywater',
    definition:
      'Lightly-used household water from showers, baths, and washing machines (excluding toilet — that\'s blackwater). Reusable with minimal treatment for garden irrigation; reusable with significant treatment for toilet flush.',
  },
  {
    slug: 'water-butt',
    term: 'Water butt',
    definition:
      'A plastic or wooden barrel (typically 100–250 litres) collecting roof runoff via a diverter on the downpipe. The starter rainwater-harvesting installation; pays for itself the first dry summer.',
  },
  {
    slug: 'drip-irrigation',
    term: 'Drip irrigation',
    definition:
      'Slow point-release watering via perforated tubing or individual emitters. Uses ~30–50% less water than overhead sprinklers and keeps foliage dry, reducing disease pressure.',
  },
  {
    slug: 'swale',
    term: 'Swale',
    definition:
      'A shallow on-contour ditch (typically with a berm on the downhill side) that slows and infiltrates rainwater runoff. Permaculture earthwork; reduces erosion and recharges soil moisture.',
  },

  // Carbon
  {
    slug: 'embodied-carbon',
    term: 'Embodied carbon',
    definition:
      'The greenhouse-gas emissions from manufacturing, transporting, and installing a product — separate from the carbon emissions of running it. A heat pump\'s embodied carbon is repaid by avoided gas-boiler emissions over ~2 years.',
  },
  {
    slug: 'operational-carbon',
    term: 'Operational carbon',
    definition:
      'The greenhouse-gas emissions from running a building or device — heating, cooling, lighting, hot water. Distinct from embodied carbon (manufacture). UK domestic operational carbon falls year-on-year as the grid decarbonises.',
  },
  {
    slug: 'grid-carbon-intensity',
    term: 'Grid carbon intensity',
    definition:
      'Grams of CO₂ released per kWh of electricity from the grid. UK average has fallen from ~500 g/kWh in 2012 to ~150 g/kWh in 2025 as coal and gas were replaced by wind, solar, and nuclear. Tracks live at carbonintensity.org.uk.',
  },

  // Economics
  {
    slug: 'payback-period',
    term: 'Payback period',
    definition:
      'The number of years for the annual saving from an upgrade to recoup the upfront cost. A £400 draught-proofing kit saving £80/year on heating pays back in 5 years; a £12,000 ASHP saving £600/year pays back in 20.',
  },
  {
    slug: 'lifetime-saving',
    term: 'Lifetime saving',
    definition:
      'Total saving over the expected operating lifetime of the upgrade (not just the payback period). Solar PV with 25-year inverter-replacement schedule saves the panel-lifetime difference between generation cost and grid-import cost.',
  },

  // Waste + materials
  {
    slug: 'embodied-water',
    term: 'Embodied water',
    definition:
      'The water consumed during manufacture of a product (cotton t-shirt ~2700 litres, beef burger ~1700 litres, beer pint ~75 litres). Distinct from operational water (the amount used by the consumer).',
  },
  {
    slug: 'circular-economy',
    term: 'Circular economy',
    definition:
      'An economic model in which materials are kept in use through repair, refurbishment, remanufacture, and recycling, rather than discarded after one use. Contrasts with the linear take-make-dispose model.',
  },
  {
    slug: 'kerbside-recycling',
    term: 'Kerbside recycling',
    definition:
      'Council-collected household recycling. UK rules vary by local authority — most accept paper, card, hard plastics 1+2, steel and aluminium cans, and glass; few accept soft plastics, polystyrene, or plastics 3–7.',
  },
]

// ────────────────────────────────────────────────────────────────────────────
// Pre-populated tools. The master Tool table's VALID_CATEGORIES list is
// cooking-shaped (knife / pan / pot / oven / etc.). Sustainability tools
// don't fit cleanly — categorise as 'other' for now. A future widening of
// VALID_CATEGORIES can re-tag these without backfilling the slugs.
//
// Slugs follow the master-table conventions: lower-kebab, descriptive,
// avoid brand names. typicalPriceGbp is in pennies (per the master Tool
// schema in `data/tools.ts`).
// ────────────────────────────────────────────────────────────────────────────

interface SustToolSpec {
  slug: string
  name: string
  category: 'other'
  notes: string
  typicalPriceGbp?: number // pennies
}

const SUSTAINABILITY_TOOLS: SustToolSpec[] = [
  {
    slug: 'compost-thermometer',
    name: 'Compost thermometer',
    category: 'other',
    notes:
      'Long-probe (40–60 cm) dial thermometer for monitoring the internal temperature of a hot-compost heap. Reads 0–80°C.',
    typicalPriceGbp: 2500,
  },
  {
    slug: 'compost-aerator',
    name: 'Compost aerator',
    category: 'other',
    notes:
      'A corkscrew or winged tool pushed and twisted into a compost heap to add air without unstacking. Helps anaerobic / slow piles restart.',
    typicalPriceGbp: 1800,
  },
  {
    slug: 'soil-moisture-meter',
    name: 'Soil moisture meter',
    category: 'other',
    notes:
      'Hand-held probe meter that reads soil moisture as a number or wet/dry/moist band. Sustainability use: checking insulation cavities and suspended-floor void humidity. Cheap (~£10) but indicative-only.',
    typicalPriceGbp: 1200,
  },
  {
    slug: 'humidity-meter',
    name: 'Humidity meter',
    category: 'other',
    notes:
      'Hygrometer reading relative humidity (%RH) in a room. Used to track condensation risk in retrofitted insulation projects. Target indoor range 40–60%RH.',
    typicalPriceGbp: 1500,
  },
  {
    slug: 'thermal-imaging-camera',
    name: 'Thermal imaging camera',
    category: 'other',
    notes:
      'Phone-attached or stand-alone infrared camera that visualises surface temperature differences. Detects thermal bridges, missing insulation, draughts. £200+ entry; hire for ~£50/day.',
    typicalPriceGbp: 25000,
  },
  {
    slug: 'energy-monitor-clamp',
    name: 'Energy monitor (clamp)',
    category: 'other',
    notes:
      'A clamp on the meter tails reads household electrical demand in real time, transmitting to a base unit or phone app. Reveals always-on baseload; finds the ghost-load appliance.',
    typicalPriceGbp: 4500,
  },
  {
    slug: 'foam-strip-gun',
    name: 'Expanding foam gun',
    category: 'other',
    notes:
      'Refillable foam-dispenser gun for low-expansion polyurethane foam. Better control than the disposable trigger-can; the same foam, applied with finer beads.',
    typicalPriceGbp: 2800,
  },
  {
    slug: 'draught-excluder-strip',
    name: 'Draught excluder strip',
    category: 'other',
    notes:
      'Self-adhesive foam, rubber, or brush strip for sealing door and window gaps. Sold by the metre; 5–10 m typically does a draughty terrace.',
    typicalPriceGbp: 800,
  },
  {
    slug: 'letterbox-brush-strip',
    name: 'Letterbox brush strip',
    category: 'other',
    notes:
      'A nylon-brush insert that fits behind a letterbox plate to seal the slot against draughts while still allowing post. Screw-fit; one part for most UK letterbox sizes.',
    typicalPriceGbp: 1200,
  },
  {
    slug: 'silicone-sealant-gun',
    name: 'Silicone sealant gun',
    category: 'other',
    notes:
      'Cartridge gun for silicone or acrylic sealant cartridges. Sealing window frames, wall junctions, and pipe penetrations in retrofit insulation projects.',
    typicalPriceGbp: 1200,
  },
  {
    slug: 'rainwater-diverter-kit',
    name: 'Rainwater diverter kit',
    category: 'other',
    notes:
      'A diverter that clamps to a round or square downpipe and feeds collected rainwater into a butt via a side outlet. Includes overflow shut-off when the butt is full.',
    typicalPriceGbp: 2200,
  },
  {
    slug: 'tap-flow-restrictor',
    name: 'Tap flow restrictor',
    category: 'other',
    notes:
      'A small insert that screws into a tap aerator and limits flow to a stated rate (typically 4–6 L/min, vs an unrestricted 12–15 L/min). Halves water use at hand basins without affecting feel.',
    typicalPriceGbp: 600,
  },
  // Shared construction tools — referenced by sustainability builds (the
  // three-bin compost system, draught-stripping installs) and by future
  // home-repair tutorials. Seeded here as the first sustainability /
  // home-repair pipeline; later seeds can no-op on the existing rows.
  {
    slug: 'tape-measure',
    name: 'Tape measure',
    category: 'other',
    notes:
      'Retractable steel-blade measure, typically 5 m or 8 m. The single most-used tool in any retrofit or build project; carry one of each scale (a 3 m for small work, an 8 m for room sizing).',
    typicalPriceGbp: 1200,
  },
  {
    slug: 'cordless-drill',
    name: 'Cordless drill',
    category: 'other',
    notes:
      'Battery-powered combi drill with hammer-drill function. 18 V is the working standard for retrofit work; the 12 V class handles light-duty assembly. Buy a battery platform you can extend (impact driver, jigsaw, sander on the same battery).',
    typicalPriceGbp: 12000,
  },
  {
    slug: 'handsaw',
    name: 'Handsaw',
    category: 'other',
    notes:
      'A 450–500 mm panel saw with hardpoint teeth. The general-purpose timber saw for builds where a power saw would be overkill. Modern hardpoint-tooth saws are not resharpenable; replace when blunt.',
    typicalPriceGbp: 1500,
  },
]

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  const sustainability = await prisma.category.findUnique({
    where: { slug: 'sustainability' },
  })
  if (!sustainability) {
    console.error(
      '[seed] sustainability category not found. Run seed-categories.ts first.',
    )
    process.exit(2)
  }
  console.log(`[seed] sustainability → ${sustainability.id}`)

  // ─── Sub-categories ────────────────────────────────────────────────────
  let subCreated = 0
  let subUnchanged = 0

  for (const spec of SUB_CATEGORIES) {
    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: sustainability.id, slug: spec.slug } },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create] sustainability/${spec.slug}`)
      } else {
        const sub = await prisma.subCategory.create({
          data: {
            slug: spec.slug,
            name: spec.name,
            description: spec.description,
            order: spec.order,
            categoryId: sustainability.id,
          },
        })
        console.log(`[seed] sustainability/${spec.slug} → ${sub.id}`)
      }
      subCreated += 1
      continue
    }
    subUnchanged += 1
  }

  // ─── Glossary terms ────────────────────────────────────────────────────
  let glossaryCreated = 0
  let glossaryUnchanged = 0
  let glossaryConflict = 0

  for (const spec of GLOSSARY_TERMS) {
    const existing = await prisma.glossaryTerm.findUnique({
      where: { slug: spec.slug },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create] glossary:${spec.slug}`)
      } else {
        await prisma.glossaryTerm.create({
          data: {
            slug: spec.slug,
            term: spec.term,
            definition: spec.definition,
            categoryId: sustainability.id,
          },
        })
        console.log(`[seed] glossary:${spec.slug}`)
      }
      glossaryCreated += 1
      continue
    }

    if (existing.categoryId && existing.categoryId !== sustainability.id) {
      // Term already claimed by another category (likely garden — composting
      // shares terms). Leave the existing scope untouched; the renderer
      // accepts either category-scoped or global definitions.
      console.log(
        `  [conflict] glossary:${spec.slug} already scoped to category ${existing.categoryId} — leaving as-is`,
      )
      glossaryConflict += 1
      continue
    }
    glossaryUnchanged += 1
  }

  // ─── Tools ─────────────────────────────────────────────────────────────
  let toolCreated = 0
  let toolUnchanged = 0

  for (const spec of SUSTAINABILITY_TOOLS) {
    const existing = await prisma.tool.findUnique({
      where: { slug: spec.slug },
    })

    if (!existing) {
      if (DRY_RUN) {
        console.log(`  [would create] tool:${spec.slug}`)
      } else {
        await prisma.tool.create({
          data: {
            slug: spec.slug,
            name: spec.name,
            category: spec.category,
            notes: spec.notes,
            typicalPriceGbp: spec.typicalPriceGbp ?? null,
          },
        })
        console.log(`[seed] tool:${spec.slug}`)
      }
      toolCreated += 1
      continue
    }
    toolUnchanged += 1
  }

  console.log(
    `\n[seed] sustainability-taxonomy: ` +
      `subs created=${subCreated} unchanged=${subUnchanged} total=${SUB_CATEGORIES.length}` +
      ` | glossary created=${glossaryCreated} unchanged=${glossaryUnchanged} conflict=${glossaryConflict} total=${GLOSSARY_TERMS.length}` +
      ` | tools created=${toolCreated} unchanged=${toolUnchanged} total=${SUSTAINABILITY_TOOLS.length}` +
      `${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
