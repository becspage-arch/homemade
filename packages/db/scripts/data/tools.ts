/**
 * Master tools list — single source of truth.
 *
 * Seeded via `packages/db/scripts/seed-tools.ts` (idempotent upsert).
 * Human-readable view: `docs/tools-master.md` is generated from this file
 * by `packages/db/scripts/generate-tools-master-md.ts`. Edit here,
 * regenerate the markdown.
 *
 * UK naming convention. `aliases` carries US names and common brand-as-noun
 * shortcuts so search still finds "KitchenAid" → "stand mixer" and
 * "Dutch oven" → "casserole".
 *
 * `typicalPriceGbp` is in pennies (£25 → 2500). Skip when uncertain — the
 * Phase 7 marketplace sorts by it later, but a wrong number is worse than
 * no number. `isPurchasable` is false only for fixtures that come with the
 * kitchen (oven, hob, sink) — Phase 7 filters those out of the buy panel.
 */

import type { ToolSeed } from './types.js'

export const TOOLS: ToolSeed[] = [
  // ────────────────────────────────────────────────────────────────────────
  // KNIFE (~10)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'chefs-knife', name: 'Chef\'s knife', category: 'knife', aliases: ['cook\'s knife', 'French knife', '8-inch knife'], isPurchasable: true, typicalPriceGbp: 5000, notes: '20 cm blade is the all-rounder. Most-used tool in the kitchen.' },
  { slug: 'paring-knife', name: 'Paring knife', category: 'knife', aliases: ['vegetable knife'], isPurchasable: true, typicalPriceGbp: 1500, notes: '8-10 cm blade. For peeling, trimming, and small precise cuts.' },
  { slug: 'bread-knife', name: 'Bread knife', category: 'knife', aliases: ['serrated knife'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Long serrated blade. Also good for tomatoes.' },
  { slug: 'carving-knife', name: 'Carving knife', category: 'knife', aliases: ['slicing knife'], isPurchasable: true, typicalPriceGbp: 3000, notes: 'Long thin blade for roasts.' },
  { slug: 'boning-knife', name: 'Boning knife', category: 'knife', aliases: [], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Flexible narrow blade for meat butchery.' },
  { slug: 'filleting-knife', name: 'Filleting knife', category: 'knife', aliases: ['fish knife'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Thin flexible blade for fish.' },
  { slug: 'santoku-knife', name: 'Santoku knife', category: 'knife', aliases: [], isPurchasable: true, typicalPriceGbp: 4000, notes: 'Japanese all-rounder, shorter than a chef\'s knife. Granton edge stops food sticking.' },
  { slug: 'cleaver', name: 'Cleaver', category: 'knife', aliases: ['Chinese chef\'s knife'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Heavy blade for breaking bones and crushing garlic with the side.' },
  { slug: 'mezzaluna', name: 'Mezzaluna', category: 'knife', aliases: ['rocking blade'], isPurchasable: true, typicalPriceGbp: 2000, notes: 'Curved blade for chopping herbs.' },
  { slug: 'oyster-knife', name: 'Oyster knife', category: 'knife', aliases: [], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Short stubby blade with a guard for shucking.' },
  { slug: 'kitchen-scissors', name: 'Kitchen scissors', category: 'knife', aliases: ['kitchen shears', 'poultry shears'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'For spatchcocking, snipping herbs, cutting bacon.' },

  // ────────────────────────────────────────────────────────────────────────
  // PAN (~16)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'frying-pan-26', name: 'Frying pan, 26 cm', category: 'pan', aliases: ['skillet', 'fry pan'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Default everyday pan. Non-stick or stainless.' },
  { slug: 'frying-pan-30', name: 'Frying pan, 30 cm', category: 'pan', aliases: ['large skillet'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'For four-person fry-ups and stir-fries.' },
  { slug: 'small-frying-pan', name: 'Small frying pan, 20 cm', category: 'pan', aliases: ['egg pan'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'For one-egg omelettes and pancakes.' },
  { slug: 'cast-iron-skillet', name: 'Cast-iron skillet', category: 'pan', aliases: ['Lodge skillet', 'cast-iron frying pan'], isPurchasable: true, typicalPriceGbp: 4000, notes: 'Oven-safe to any temperature. Builds non-stick patina over time.' },
  { slug: 'saute-pan', name: 'Sauté pan, 28 cm', category: 'pan', aliases: ['saute pan'], isPurchasable: true, typicalPriceGbp: 6000, notes: 'Straight sides, lid, more capacity than a frying pan. For braises and one-pan dinners.' },
  { slug: 'wok', name: 'Wok', category: 'pan', aliases: ['carbon-steel wok'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Carbon steel, flat bottom for UK hobs. Season before first use.' },
  { slug: 'griddle-pan', name: 'Griddle pan', category: 'pan', aliases: ['grill pan'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Ridged cast-iron for steak marks. UK "griddle" = US "grill pan".' },
  { slug: 'crepe-pan', name: 'Crêpe pan', category: 'pan', aliases: ['crepe pan'], isPurchasable: true, typicalPriceGbp: 3000, notes: 'Shallow flat pan. Also for blini and dosa.' },
  { slug: 'paella-pan', name: 'Paella pan', category: 'pan', aliases: ['paellera'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Wide shallow pan. Carbon steel or enamelled steel.' },
  { slug: 'tagine', name: 'Tagine', category: 'pan', aliases: [], isPurchasable: true, typicalPriceGbp: 5000, notes: 'Moroccan conical-lidded clay pot. The lid traps and returns moisture.' },
  { slug: 'roasting-pan', name: 'Roasting pan', category: 'pan', aliases: ['roasting tin'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Heavy-base metal tin for roast meats and tray dinners.' },
  { slug: 'omelette-pan', name: 'Omelette pan', category: 'pan', aliases: [], isPurchasable: true, typicalPriceGbp: 3000, notes: 'Curved sides, no lip. For folded omelettes.' },
  { slug: 'tortilla-pan', name: 'Tortilla pan', category: 'pan', aliases: ['comal'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Flat cast-iron pan for toasting tortillas.' },
  { slug: 'roti-pan', name: 'Tawa', category: 'pan', aliases: ['roti pan', 'chapati pan'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Flat cast-iron or non-stick for Indian flatbreads.' },
  { slug: 'fish-kettle', name: 'Fish kettle', category: 'pan', aliases: ['fish poacher'], isPurchasable: true, typicalPriceGbp: 7500, notes: 'For poaching a whole salmon. Borrow before you buy.' },
  { slug: 'milk-pan', name: 'Milk pan, 18 cm', category: 'pan', aliases: ['saucepan with lid'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'For sauces, eggs, melting butter.' },

  // ────────────────────────────────────────────────────────────────────────
  // POT (~10)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'stockpot', name: 'Stockpot, 8 L', category: 'pot', aliases: [], isPurchasable: true, typicalPriceGbp: 5500, notes: 'For stock, pasta, and big-batch soups.' },
  { slug: 'large-saucepan', name: 'Saucepan, 22 cm', category: 'pot', aliases: ['large pot'], isPurchasable: true, typicalPriceGbp: 4000, notes: 'The workhorse 4-litre pot for stews and rice.' },
  { slug: 'medium-saucepan', name: 'Saucepan, 18 cm', category: 'pot', aliases: [], isPurchasable: true, typicalPriceGbp: 3000 },
  { slug: 'small-saucepan', name: 'Small saucepan, 16 cm', category: 'pot', aliases: [], isPurchasable: true, typicalPriceGbp: 2500 },
  { slug: 'dutch-oven', name: 'Casserole dish', category: 'pot', aliases: ['Dutch oven', 'Le Creuset', 'cocotte'], isPurchasable: true, typicalPriceGbp: 15000, notes: 'Enamelled cast iron, 24-28 cm. Oven-and-hob for braises, stews, no-knead bread. The most useful single purchase.' },
  { slug: 'pressure-cooker', name: 'Pressure cooker', category: 'pot', aliases: [], isPurchasable: true, typicalPriceGbp: 6000, notes: 'Stove-top or electric. Cuts long-cook times by two-thirds.' },
  { slug: 'jam-pan', name: 'Jam pan', category: 'pot', aliases: ['preserving pan', 'maslin pan'], isPurchasable: true, typicalPriceGbp: 5500, notes: 'Wide unlined copper or steel. Wide surface helps water evaporate fast for a set.' },
  { slug: 'steamer-pot', name: 'Steamer pot', category: 'pot', aliases: ['multi-tier steamer'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Stacking tier for veg, fish, dumplings.' },
  { slug: 'bamboo-steamer', name: 'Bamboo steamer', category: 'pot', aliases: [], isPurchasable: true, typicalPriceGbp: 2000, notes: 'Sits over a wok or saucepan. For dim sum.' },
  { slug: 'pudding-basin', name: 'Pudding basin', category: 'pot', aliases: ['Mason Cash basin', 'steam-pudding bowl'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'For steamed puddings — Christmas pudding, jam roly-poly.' },
  { slug: 'ramekins', name: 'Ramekins', category: 'pot', aliases: ['ramekin'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Small individual ceramic dishes. For baked eggs, soufflés, and crème brûlée.' },

  // ────────────────────────────────────────────────────────────────────────
  // OVEN (~6) — fixtures + ancillary
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'oven', name: 'Oven', category: 'oven', aliases: [], isPurchasable: false, notes: 'Fan or conventional. Recipes are written for fan unless stated.' },
  { slug: 'fan-oven', name: 'Fan oven', category: 'oven', aliases: ['convection oven'], isPurchasable: false, notes: 'Default UK oven. Cooks ~20°C cooler than conventional at the same setting.' },
  { slug: 'hob', name: 'Hob', category: 'oven', aliases: ['stove', 'cooktop'], isPurchasable: false, notes: 'Gas, electric, or induction.' },
  { slug: 'grill', name: 'Grill', category: 'oven', aliases: ['broiler'], isPurchasable: false, notes: 'UK "grill" = US "broiler" — the top element. UK "BBQ" = US "grill".' },
  { slug: 'pizza-stone', name: 'Pizza stone', category: 'oven', aliases: ['baking stone'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Preheat for an hour at full whack for a crisp base.' },
  { slug: 'pizza-steel', name: 'Pizza steel', category: 'oven', aliases: [], isPurchasable: true, typicalPriceGbp: 8000, notes: 'Better heat-retention than stone. Six-millimetre steel slab.' },
  { slug: 'pizza-oven', name: 'Pizza oven', category: 'oven', aliases: ['Ooni', 'Roccbox'], isPurchasable: true, typicalPriceGbp: 30000, notes: 'Hits 500°C+. For proper Neapolitan-style pizza.' },

  // ────────────────────────────────────────────────────────────────────────
  // MIXER (~6)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'stand-mixer', name: 'Stand mixer', category: 'mixer', aliases: ['KitchenAid', 'Kenwood Chef'], isPurchasable: true, typicalPriceGbp: 35000, notes: 'KitchenAid or Kenwood for bread, cake, meringue, sausages.' },
  { slug: 'hand-mixer', name: 'Hand mixer', category: 'mixer', aliases: ['hand-held electric whisk'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'For whipping cream and small batters when the stand mixer\'s overkill.' },
  { slug: 'whisk-balloon', name: 'Balloon whisk', category: 'mixer', aliases: [], isPurchasable: true, typicalPriceGbp: 1000, notes: 'For whipping by hand and emulsifying dressings.' },
  { slug: 'whisk-flat', name: 'Flat whisk', category: 'mixer', aliases: ['roux whisk'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Reaches the corners of a pan for sauces and gravies.' },
  { slug: 'dough-hook', name: 'Dough hook attachment', category: 'mixer', aliases: [], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Stand-mixer attachment for kneading bread.' },
  { slug: 'paddle-attachment', name: 'Paddle attachment', category: 'mixer', aliases: ['K-beater'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'For creaming butter and sugar in a stand mixer.' },

  // ────────────────────────────────────────────────────────────────────────
  // PROCESSOR (~7)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'food-processor', name: 'Food processor', category: 'processor', aliases: ['Magimix', 'Cuisinart'], isPurchasable: true, typicalPriceGbp: 18000, notes: 'For pastry, pesto, hummus, breadcrumbs.' },
  { slug: 'mini-chopper', name: 'Mini chopper', category: 'processor', aliases: ['small food processor'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'For small jobs — chopping shallots, blitzing herbs, grinding spices.' },
  { slug: 'blender-jug', name: 'Jug blender', category: 'processor', aliases: ['stand blender'], isPurchasable: true, typicalPriceGbp: 6000, notes: 'For soups, smoothies, dressings.' },
  { slug: 'high-powered-blender', name: 'High-powered blender', category: 'processor', aliases: ['Vitamix', 'NutriBullet'], isPurchasable: true, typicalPriceGbp: 45000, notes: 'For ultra-smooth purées and nut butter.' },
  { slug: 'stick-blender', name: 'Stick blender', category: 'processor', aliases: ['immersion blender', 'hand blender'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'For blending in the pan — soups, mayo, smoothies.' },
  { slug: 'spice-grinder', name: 'Spice grinder', category: 'processor', aliases: ['electric coffee grinder'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Cheap electric coffee grinder reserved for spices.' },
  { slug: 'pestle-and-mortar', name: 'Pestle and mortar', category: 'processor', aliases: ['mortar and pestle'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'For crushing spices, garlic paste, pesto. Heavy stone wins.' },

  // ────────────────────────────────────────────────────────────────────────
  // MEASURING (~10)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'measuring-jug', name: 'Measuring jug, 1 L', category: 'measuring', aliases: [], isPurchasable: true, typicalPriceGbp: 800, notes: 'Pyrex glass with metric and imperial.' },
  { slug: 'measuring-spoons', name: 'Measuring spoons', pluralName: 'measuring spoons', category: 'measuring', aliases: [], isPurchasable: true, typicalPriceGbp: 600 },
  { slug: 'measuring-cups', name: 'Measuring cups', pluralName: 'measuring cups', category: 'measuring', aliases: [], isPurchasable: true, typicalPriceGbp: 800, notes: 'For US recipes. UK recipes default to weight.' },
  { slug: 'ruler', name: 'Ruler', category: 'measuring', aliases: [], isPurchasable: true, typicalPriceGbp: 500, notes: 'For pastry, rolled dough, evenly sliced biscuits.' },
  { slug: 'cooks-tape', name: 'Cook\'s tape', category: 'measuring', aliases: ['masking tape'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Label every container in the fridge with date and content.' },
  { slug: 'spirit-level', name: 'Spirit level', category: 'measuring', aliases: [], isPurchasable: true, typicalPriceGbp: 800, notes: 'For levelling a cake batter before icing.' },
  { slug: 'piping-bag', name: 'Piping bag', category: 'measuring', aliases: ['pastry bag'], isPurchasable: true, typicalPriceGbp: 800 },
  { slug: 'piping-tips', name: 'Piping tips', pluralName: 'piping tips', category: 'measuring', aliases: ['piping nozzles'], isPurchasable: true, typicalPriceGbp: 1500 },
  { slug: 'icing-smoother', name: 'Icing smoother', category: 'measuring', aliases: ['cake scraper'], isPurchasable: true, typicalPriceGbp: 1000 },
  { slug: 'turntable', name: 'Cake turntable', category: 'measuring', aliases: ['revolving cake stand'], isPurchasable: true, typicalPriceGbp: 3000, notes: 'For decorating layered cakes.' },
  { slug: 'cake-turntable', name: 'Cake turntable', category: 'measuring', aliases: ['revolving cake stand', 'decorating turntable'], isPurchasable: true, typicalPriceGbp: 3000, notes: 'Rotating stand for smoothing fondant and buttercream on layered cakes.' },
  { slug: 'cake-smoother', name: 'Cake smoother', category: 'measuring', aliases: ['fondant smoother', 'icing smoother'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Flat-faced paddle for smoothing fondant to a polished finish.' },

  // ────────────────────────────────────────────────────────────────────────
  // BOWL (~6)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'mixing-bowl-large', name: 'Mixing bowl, large', category: 'bowl', aliases: ['Mason Cash bowl'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Earthenware. ~28 cm diameter for bread doughs and big batters.' },
  { slug: 'mixing-bowl-medium', name: 'Mixing bowl, medium', category: 'bowl', aliases: [], isPurchasable: true, typicalPriceGbp: 1500 },
  { slug: 'mixing-bowl-small', name: 'Mixing bowl, small', category: 'bowl', aliases: ['prep bowl'], isPurchasable: true, typicalPriceGbp: 1000 },
  { slug: 'mixing-bowl-set', name: 'Stacking bowl set', category: 'bowl', aliases: ['nesting bowls'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'A set of three or four in graduated sizes saves cupboard space.' },
  { slug: 'metal-bowl', name: 'Heatproof metal bowl', category: 'bowl', aliases: ['stainless steel bowl'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Sits over a pan of simmering water for melting chocolate and bain-marie work.' },
  { slug: 'salad-bowl', name: 'Salad bowl', category: 'bowl', aliases: [], isPurchasable: true, typicalPriceGbp: 3500 },

  // ────────────────────────────────────────────────────────────────────────
  // TRAY (~10)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'baking-tray', name: 'Baking tray', category: 'tray', aliases: ['baking sheet', 'rimmed sheet pan'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Default for tray bakes, roast vegetables, biscuits.' },
  { slug: 'half-sheet-tray', name: 'Half-sheet tray', category: 'tray', aliases: [], isPurchasable: true, typicalPriceGbp: 2000, notes: 'US standard size, ~33×46 cm. Fits a UK oven.' },
  { slug: 'cooling-rack', name: 'Cooling rack', category: 'tray', aliases: ['wire rack'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'For cakes, biscuits, fried food.' },
  { slug: 'trivet', name: 'Trivet', category: 'tray', aliases: ['pot stand'], isPurchasable: true, typicalPriceGbp: 1000, notes: 'For setting hot pans on the table or worktop.' },
  { slug: 'grill-tray', name: 'Grill tray', category: 'tray', aliases: ['broiler pan'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'For under the grill — slotted top, drip tray beneath.' },
  { slug: 'oven-rack', name: 'Wire oven rack', category: 'tray', aliases: [], isPurchasable: true, typicalPriceGbp: 1500, notes: 'For cooling and for resting roasts above a tray.' },
  { slug: 'roasting-rack', name: 'Roasting rack', category: 'tray', aliases: ['V-rack'], isPurchasable: true, typicalPriceGbp: 2000, notes: 'Lifts a roast out of its fat for an evenly browned base.' },
  { slug: 'pizza-peel', name: 'Pizza peel', category: 'tray', aliases: [], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Wooden or aluminium. For sliding pizzas onto a hot stone.' },
  { slug: 'serving-platter', name: 'Serving platter', category: 'tray', aliases: [], isPurchasable: true, typicalPriceGbp: 3000 },
  { slug: 'baking-mat', name: 'Silicone baking mat', category: 'tray', aliases: ['Silpat'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Replaces baking paper for biscuits and roasting.' },

  // ────────────────────────────────────────────────────────────────────────
  // TIN (~15)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'loaf-tin', name: 'Loaf tin, 2 lb', category: 'tin', aliases: ['bread pan'], isPurchasable: true, typicalPriceGbp: 1500, notes: '900 g / 2 lb is the British standard.' },
  { slug: 'loaf-tin-small', name: 'Loaf tin, 1 lb', category: 'tin', aliases: [], isPurchasable: true, typicalPriceGbp: 1200 },
  { slug: 'round-cake-tin-20', name: 'Round cake tin, 20 cm', category: 'tin', aliases: [], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Loose-bottomed. Workhorse for sponge cakes.' },
  { slug: 'round-cake-tin-23', name: 'Round cake tin, 23 cm', category: 'tin', aliases: [], isPurchasable: true, typicalPriceGbp: 1800 },
  { slug: 'sandwich-tin', name: 'Sandwich tin, 20 cm', category: 'tin', aliases: ['layer cake pan'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Pair for a Victoria sponge.' },
  { slug: 'springform-tin', name: 'Springform tin, 23 cm', category: 'tin', aliases: ['springform pan'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Clip-side release for cheesecake and pavlova.' },
  { slug: 'square-cake-tin', name: 'Square cake tin, 20 cm', category: 'tin', aliases: ['brownie pan'], isPurchasable: true, typicalPriceGbp: 1800, notes: 'For brownies, traybakes, fudge.' },
  { slug: 'rectangular-baking-tin', name: 'Rectangular baking tin', category: 'tin', aliases: ['traybake tin'], isPurchasable: true, typicalPriceGbp: 2000, notes: '~30×20 cm. For lasagne, traybakes, flapjacks.' },
  { slug: 'tart-tin', name: 'Tart tin, 23 cm', category: 'tin', aliases: ['flan tin'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Loose-bottomed, fluted edge.' },
  { slug: 'pie-dish', name: 'Pie dish', category: 'tin', aliases: ['pie plate'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Enamelled or ceramic. ~23 cm.' },
  { slug: 'bun-tin', name: 'Bun tin, 12-hole', category: 'tin', aliases: ['patty tin', 'fairy cake tin'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Shallow 12-hole tin for mince pies, jam tarts, and fairy cakes. Shallower than a muffin tin.' },
  { slug: 'muffin-tin', name: 'Muffin tin, 12-hole', category: 'tin', aliases: ['cupcake tin'], isPurchasable: true, typicalPriceGbp: 1500 },
  { slug: 'mini-muffin-tin', name: 'Mini muffin tin', category: 'tin', aliases: [], isPurchasable: true, typicalPriceGbp: 1200, notes: 'For canapés, mini quiches, financiers.' },
  { slug: 'madeleine-tin', name: 'Madeleine tin', category: 'tin', aliases: ['madeleine pan'], isPurchasable: true, typicalPriceGbp: 2000, notes: 'Shell-shaped indents.' },
  { slug: 'yorkshire-pudding-tin', name: 'Yorkshire pudding tin', category: 'tin', aliases: ['popover pan'], isPurchasable: true, typicalPriceGbp: 1500, notes: '4-hole or 12-hole. Deep cups for tall puds.' },
  { slug: 'bundt-tin', name: 'Bundt tin', category: 'tin', aliases: ['bundt pan'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Fluted ring mould. Grease every crevice.' },
  { slug: 'kugelhopf-tin', name: 'Kugelhopf tin', category: 'tin', aliases: [], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Tall fluted ring for Alsatian and Austrian yeast cakes.' },
  { slug: 'savarin-tin', name: 'Savarin tin', category: 'tin', aliases: ['ring mould'], isPurchasable: true, typicalPriceGbp: 1800 },
  { slug: 'terrine-tin', name: 'Terrine mould', category: 'tin', aliases: [], isPurchasable: true, typicalPriceGbp: 4000, notes: 'For pâté and terrine. Cast-iron with a lid is best.' },

  // ────────────────────────────────────────────────────────────────────────
  // BOARD (~4)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'chopping-board', name: 'Chopping board', category: 'board', aliases: ['cutting board'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Wood for veg and bread; plastic for raw meat (or a designated wooden one washed hot).' },
  { slug: 'chopping-board-large', name: 'Large chopping board', category: 'board', aliases: ['butcher block'], isPurchasable: true, typicalPriceGbp: 5000, notes: 'End-grain wood blocks save knife edges and clean up well.' },
  { slug: 'pastry-board', name: 'Pastry board', category: 'board', aliases: ['marble pastry slab'], isPurchasable: true, typicalPriceGbp: 4000, notes: 'Marble stays cool — keeps butter from melting into the flour.' },
  { slug: 'bench-scraper', name: 'Bench scraper', category: 'board', aliases: ['dough scraper'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Plastic for dough, metal for the work surface.' },

  // ────────────────────────────────────────────────────────────────────────
  // UTENSIL (~25)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'skewers', name: 'Skewers', category: 'utensil', aliases: ['metal skewers', 'wooden skewers', 'kebab skewers'], isPurchasable: true, typicalPriceGbp: 500, notes: 'Metal skewers are reusable and conduct heat to the centre of the meat. Wooden skewers need soaking in water for 30 minutes before use to prevent scorching.' },
  { slug: 'wooden-spoon', name: 'Wooden spoon', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 500 },
  { slug: 'silicone-spatula', name: 'Silicone spatula', category: 'utensil', aliases: ['rubber spatula', 'scraper'], isPurchasable: true, typicalPriceGbp: 800, notes: 'For folding and scraping bowls clean.' },
  { slug: 'fish-slice', name: 'Fish slice', category: 'utensil', aliases: ['turner', 'spatula'], isPurchasable: true, typicalPriceGbp: 800, notes: 'UK fish slice = US turner.' },
  { slug: 'spatula', name: 'Spatula', category: 'utensil', aliases: ['turner', 'flipper'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Flat metal or plastic blade for flipping and pressing food in a pan.' },
  { slug: 'slotted-spoon', name: 'Slotted spoon', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 800 },
  { slug: 'ladle', name: 'Ladle', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 1000, notes: 'For soup and risotto stock.' },
  { slug: 'soup-ladle-small', name: 'Small ladle', category: 'utensil', aliases: ['gravy ladle'], isPurchasable: true, typicalPriceGbp: 800 },
  { slug: 'tongs', name: 'Tongs', pluralName: 'tongs', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 1000, notes: 'Spring-loaded. For flipping bacon, lifting pasta, plating.' },
  { slug: 'pasta-server', name: 'Pasta server', category: 'utensil', aliases: ['spaghetti spoon'], isPurchasable: true, typicalPriceGbp: 800 },
  { slug: 'spider-strainer', name: 'Spider strainer', category: 'utensil', aliases: ['Asian skimmer'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'For lifting fried food and noodles out of liquid.' },
  { slug: 'rolling-pin', name: 'Rolling pin', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Heavy hardwood. French (tapered, no handles) gives better feel.' },
  { slug: 'pastry-brush', name: 'Pastry brush', category: 'utensil', aliases: ['basting brush'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Silicone is easier to wash; natural bristle holds more glaze.' },
  { slug: 'colander', name: 'Colander', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 1500 },
  { slug: 'sieve', name: 'Sieve', category: 'utensil', aliases: ['fine-mesh sieve', 'strainer'], isPurchasable: true, typicalPriceGbp: 1000, notes: 'For sifting flour and straining custards.' },
  { slug: 'fine-mesh-sieve', name: 'Fine-mesh sieve', category: 'utensil', aliases: ['chinois'], isPurchasable: true, typicalPriceGbp: 2000, notes: 'For ultra-smooth sauces and purées.' },
  { slug: 'box-grater', name: 'Box grater', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Four-sided. For cheese, vegetables, citrus zest.' },
  { slug: 'microplane', name: 'Microplane', category: 'utensil', aliases: ['fine grater', 'rasp grater'], isPurchasable: true, typicalPriceGbp: 2000, notes: 'For zest, parmesan, nutmeg, garlic.' },
  { slug: 'peeler-y', name: 'Y-peeler', category: 'utensil', aliases: ['vegetable peeler'], isPurchasable: true, typicalPriceGbp: 600, notes: 'Faster and more comfortable than a straight peeler.' },
  { slug: 'julienne-peeler', name: 'Julienne peeler', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 800, notes: 'Cuts long thin matchsticks of carrot, courgette.' },
  { slug: 'mandoline', name: 'Mandoline', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 3500, notes: 'For uniform slicing. Use the safety guard — every time.' },
  { slug: 'ricer', name: 'Potato ricer', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 2500, notes: 'For lump-free mash and proper gnocchi.' },
  { slug: 'masher', name: 'Potato masher', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 1000 },
  { slug: 'lemon-squeezer', name: 'Lemon squeezer', category: 'utensil', aliases: ['citrus reamer'], isPurchasable: true, typicalPriceGbp: 1000 },
  { slug: 'citrus-juicer-mexican', name: 'Mexican lemon press', category: 'utensil', aliases: ['hand citrus press'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Squeezes lemons and limes pip-free.' },
  { slug: 'corkscrew', name: 'Corkscrew', category: 'utensil', aliases: ['wine opener'], isPurchasable: true, typicalPriceGbp: 1000 },
  { slug: 'bottle-opener', name: 'Bottle opener', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 500 },
  { slug: 'tin-opener', name: 'Tin opener', category: 'utensil', aliases: ['can opener'], isPurchasable: true, typicalPriceGbp: 1000 },
  { slug: 'garlic-press', name: 'Garlic press', category: 'utensil', aliases: ['garlic crusher'], isPurchasable: true, typicalPriceGbp: 1500 },
  { slug: 'pepper-mill', name: 'Pepper mill', category: 'utensil', aliases: ['pepper grinder'], isPurchasable: true, typicalPriceGbp: 2500 },
  { slug: 'salt-grinder', name: 'Salt grinder', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 2000 },
  { slug: 'meat-mallet', name: 'Meat mallet', category: 'utensil', aliases: ['meat tenderiser'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'For bashing chicken to even thickness and tenderising tough cuts.' },
  { slug: 'kitchen-twine', name: 'Kitchen twine', category: 'utensil', aliases: ['butcher\'s string', 'cooking string'], isPurchasable: true, typicalPriceGbp: 500, notes: 'For tying roasts and bouquet garni.' },
  { slug: 'fish-tweezers', name: 'Fish tweezers', pluralName: 'fish tweezers', category: 'utensil', aliases: ['fish pin-bone tweezers'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'For pulling pin bones from salmon and trout fillets.' },
  { slug: 'icing-spatula', name: 'Icing spatula', category: 'utensil', aliases: ['palette knife', 'offset spatula'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'For lifting biscuits and smoothing icing.' },
  { slug: 'piping-nozzle-star', name: 'Star piping nozzle', category: 'utensil', aliases: ['open star nozzle', '1M nozzle', 'star tip'], isPurchasable: true, typicalPriceGbp: 500, notes: 'Open star opening. For rosette swirls and shells on cakes and cupcakes.' },
  { slug: 'piping-nozzle-petal', name: 'Petal piping nozzle', category: 'utensil', aliases: ['rose nozzle', 'Wilton 104', 'petal tip'], isPurchasable: true, typicalPriceGbp: 500, notes: 'Teardrop-shaped opening for building layered buttercream roses.' },
  { slug: 'flower-nail', name: 'Flower nail', category: 'utensil', aliases: ['piping nail', 'rose nail'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Rotating metal nail used as a platform when building piped sugar flowers.' },
  { slug: 'kitchen-torch', name: 'Kitchen torch', category: 'utensil', aliases: ['blowtorch', 'crème brûlée torch', 'chef\'s torch'], isPurchasable: true, typicalPriceGbp: 2000, notes: 'For bruléeing meringue tops and caramelising sugar.' },
  { slug: 'apple-corer', name: 'Apple corer', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 800 },
  { slug: 'cherry-pitter', name: 'Cherry pitter', category: 'utensil', aliases: ['cherry stoner', 'olive pitter'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Also works for olives.' },
  { slug: 'pasta-machine', name: 'Pasta machine', category: 'utensil', aliases: ['pasta roller'], isPurchasable: true, typicalPriceGbp: 5500, notes: 'Atlas 150 is the standard. Hand-cranked.' },
  { slug: 'ravioli-stamp', name: 'Ravioli stamp', category: 'utensil', aliases: ['pastry cutter'], isPurchasable: true, typicalPriceGbp: 800 },
  { slug: 'biscuit-cutters', name: 'Biscuit cutters', pluralName: 'biscuit cutters', category: 'utensil', aliases: ['cookie cutters'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'A graduated set covers most jobs.' },

  // ────────────────────────────────────────────────────────────────────────
  // APPLIANCE (~10)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'air-fryer', name: 'Air fryer', category: 'appliance', aliases: ['Ninja', 'Tefal ActiFry'], isPurchasable: true, typicalPriceGbp: 12000, notes: '4-litre or dual-drawer. Effectively a small convection oven.' },
  { slug: 'slow-cooker', name: 'Slow cooker', category: 'appliance', aliases: ['Crock-Pot'], isPurchasable: true, typicalPriceGbp: 3500, notes: '3.5 L or 6 L. Set in the morning, eat in the evening.' },
  { slug: 'instant-pot', name: 'Instant Pot', category: 'appliance', aliases: ['multi-cooker', 'electric pressure cooker'], isPurchasable: true, typicalPriceGbp: 10000, notes: 'Pressure cooker, slow cooker, rice cooker, yoghurt maker in one box.' },
  { slug: 'rice-cooker', name: 'Rice cooker', category: 'appliance', aliases: [], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Set-and-forget. Indispensable if you eat rice often.' },
  { slug: 'bread-maker', name: 'Bread maker', category: 'appliance', aliases: ['breadmaker'], isPurchasable: true, typicalPriceGbp: 8000 },
  { slug: 'sous-vide-circulator', name: 'Sous-vide circulator', category: 'appliance', aliases: ['immersion circulator', 'Anova'], isPurchasable: true, typicalPriceGbp: 12000, notes: 'Clip to a stockpot. Controls water temperature to the degree.' },
  { slug: 'ice-cream-maker', name: 'Ice cream maker', category: 'appliance', aliases: [], isPurchasable: true, typicalPriceGbp: 6500, notes: 'Pre-freeze bowl style is cheap and reliable.' },
  { slug: 'dehydrator', name: 'Dehydrator', category: 'appliance', aliases: [], isPurchasable: true, typicalPriceGbp: 8000, notes: 'For jerky, fruit leather, dried herbs.' },
  { slug: 'kettle', name: 'Kettle', category: 'appliance', aliases: ['electric kettle'], isPurchasable: true, typicalPriceGbp: 3500 },
  { slug: 'toaster', name: 'Toaster', category: 'appliance', aliases: [], isPurchasable: true, typicalPriceGbp: 4500 },
  { slug: 'microwave', name: 'Microwave', category: 'appliance', aliases: [], isPurchasable: true, typicalPriceGbp: 8000 },

  // ────────────────────────────────────────────────────────────────────────
  // ELECTRICAL (~6)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'induction-hob', name: 'Induction hob', category: 'electrical', aliases: ['induction cooktop'], isPurchasable: true, typicalPriceGbp: 30000, notes: 'Faster heat-up and finer control than gas or electric coil.' },
  { slug: 'griddle-electric', name: 'Electric griddle', category: 'electrical', aliases: [], isPurchasable: true, typicalPriceGbp: 6500 },
  { slug: 'deep-fryer', name: 'Deep fryer', category: 'electrical', aliases: [], isPurchasable: true, typicalPriceGbp: 8000, notes: 'Easier than deep-frying in a saucepan. Temperature control is the win.' },
  { slug: 'sandwich-toaster', name: 'Sandwich toaster', category: 'electrical', aliases: ['toastie maker', 'panini press'], isPurchasable: true, typicalPriceGbp: 3000 },
  { slug: 'waffle-iron', name: 'Waffle iron', category: 'electrical', aliases: ['waffle maker'], isPurchasable: true, typicalPriceGbp: 4500 },
  { slug: 'stand-blender', name: 'Smoothie blender', category: 'electrical', aliases: ['NutriBullet'], isPurchasable: true, typicalPriceGbp: 5000 },

  // ────────────────────────────────────────────────────────────────────────
  // THERMOMETER (~4)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'instant-read-thermometer', name: 'Instant-read thermometer', category: 'thermometer', aliases: ['Thermapen', 'meat thermometer'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'For meat, bread, deep-frying, custard. Thermapen is the standard.' },
  { slug: 'probe-thermometer', name: 'Probe thermometer', category: 'thermometer', aliases: ['leave-in thermometer'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Sits in the joint with a wired probe leading outside the oven.' },
  { slug: 'sugar-thermometer', name: 'Sugar thermometer', category: 'thermometer', aliases: ['jam thermometer', 'candy thermometer'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'For jam, caramel, sugar work — reads up to 200°C+.' },
  { slug: 'oven-thermometer', name: 'Oven thermometer', category: 'thermometer', aliases: [], isPurchasable: true, typicalPriceGbp: 1000, notes: 'Worth checking — most home ovens run 20°C either side of the dial.' },

  // ────────────────────────────────────────────────────────────────────────
  // SCALE (~2)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'digital-scales', name: 'Digital scales', pluralName: 'digital scales', category: 'scale', aliases: ['kitchen scales'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Default precision: 1 g. Tare to zero between ingredients.' },
  { slug: 'precision-scales', name: 'Precision scales', pluralName: 'precision scales', category: 'scale', aliases: ['gram scales'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'For yeast, spices, salt — reads to 0.1 g.' },

  // ────────────────────────────────────────────────────────────────────────
  // OTHER (~8)
  // ────────────────────────────────────────────────────────────────────────
  { slug: 'sink', name: 'Sink', category: 'other', aliases: [], isPurchasable: false, notes: 'Kitchen fixture.' },
  { slug: 'tea-towel', name: 'Tea towel', category: 'other', aliases: ['dish towel'], isPurchasable: true, typicalPriceGbp: 800 },
  { slug: 'oven-gloves', name: 'Oven gloves', pluralName: 'oven gloves', category: 'other', aliases: ['oven mitts'], isPurchasable: true, typicalPriceGbp: 1200 },
  { slug: 'apron', name: 'Apron', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 2000 },
  { slug: 'cling-film', name: 'Cling film', category: 'other', aliases: ['plastic wrap', 'Saran wrap'], isPurchasable: true, typicalPriceGbp: 200 },
  { slug: 'foil', name: 'Aluminium foil', category: 'other', aliases: ['tinfoil'], isPurchasable: true, typicalPriceGbp: 200 },
  { slug: 'baking-paper', name: 'Baking paper', category: 'other', aliases: ['parchment paper', 'greaseproof paper'], isPurchasable: true, typicalPriceGbp: 250, notes: 'Greaseproof and baking parchment are not interchangeable — baking parchment is non-stick coated.' },
  { slug: 'muslin-cloth', name: 'Muslin cloth', category: 'other', aliases: ['cheesecloth'], isPurchasable: true, typicalPriceGbp: 800, notes: 'For straining stock, hanging soft cheeses, bouquet garni.' },
  { slug: 'jam-jars', name: 'Jam jars', pluralName: 'jam jars', category: 'other', aliases: ['preserving jars'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Sterilise in a 140°C oven for 15 minutes before filling.' },
  { slug: 'kilner-jar', name: 'Kilner jar', category: 'other', aliases: ['Mason jar', 'ball jar'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Clip-top for ferments and pickles.' },
  { slug: 'spray-bottle', name: 'Spray bottle', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 500, notes: 'For misting bread doughs in the oven for a crustier loaf.' },
  { slug: 'banneton', name: 'Banneton', category: 'other', aliases: ['proving basket', 'brotform'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'For proving sourdough. Linen-lined to stop sticking.' },
  { slug: 'baking-beans', name: 'Baking beans', pluralName: 'baking beans', category: 'other', aliases: ['pie weights'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Ceramic or metal. For blind-baking pastry. Dried rice or chickpeas work too.' },

  // ── Herbal-medicine pipeline (phase_herbal_pipeline_scaffold).
  // Apothecary kit for tinctures, infusions, decoctions, oils, salves.
  { slug: 'teapot', name: 'Teapot', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Any teapot with a lid. The lid matters for infusions — it keeps the volatile oils in.' },
  { slug: 'tea-infuser', name: 'Tea infuser', category: 'utensil', aliases: ['tea ball', 'tea strainer'], isPurchasable: true, typicalPriceGbp: 600, notes: 'Mesh basket or ball that holds loose-leaf herbs inside a cup or pot.' },
  { slug: 'double-boiler', name: 'Double boiler', category: 'pot', aliases: ['bain-marie'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'For melting chocolate, warming oils, infused-oil maceration. Or rig one from a heatproof bowl over a pan of simmering water.' },
  { slug: 'dropper-bottle-amber', name: 'Amber dropper bottle, 30 ml', category: 'other', aliases: ['tincture bottle'], isPurchasable: true, typicalPriceGbp: 300, notes: 'Dark glass with pipette dropper. For tinctures and oils — light degrades the actives.' },
  { slug: 'salve-tin', name: 'Salve tin, 30-60 ml', category: 'other', aliases: ['lip-balm tin', 'cosmetic tin'], isPurchasable: true, typicalPriceGbp: 200, notes: 'Small tin or jar with screw lid for finished salves and balms.' },
  { slug: 'thermometer-probe', name: 'Probe thermometer', category: 'measuring', aliases: ['digital thermometer'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'For oil maceration (hold at 60-65°C), candy work, meat. Avoid the cheap analogue dials.' },
  { slug: 'funnel-small', name: 'Funnel, small', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 400, notes: 'For decanting tinctures and oils into bottles.' },
  { slug: 'maceration-jar', name: 'Maceration jar', category: 'other', aliases: ['large kilner jar'], isPurchasable: true, typicalPriceGbp: 1200, notes: '500 ml-1 L glass jar with a tight lid, for 4-6-week tincture and oil macerations.' },

  // ── Crochet pipeline (phase_crochet_pipeline_scaffold).
  // Yarn-craft basics. Hooks live in the master CrochetHook table as
  // their own size-specific rows; the generic "crochet hook" entry here
  // is the catch-all when a pattern doesn't specify a hook size.
  { slug: 'crochet-hook', name: 'Crochet hook', category: 'other', aliases: ['hook'], isPurchasable: true, typicalPriceGbp: 400, notes: 'A single hook. Most British patterns name a metric size (e.g. 4 mm); see the CrochetHook reference for the full UK/US/JP conversion table.' },
  { slug: 'tapestry-needle', name: 'Tapestry needle', category: 'other', aliases: ['darning needle', 'yarn needle', 'wool needle'], isPurchasable: true, typicalPriceGbp: 300, notes: 'Blunt large-eyed needle for sewing in yarn ends and joining motifs. A pack of three sizes covers everything from 4-ply to chunky.' },
  { slug: 'stitch-marker', name: 'Stitch marker', pluralName: 'stitch markers', category: 'other', aliases: ['locking stitch marker'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Locking or split-ring markers for keeping track of round starts, repeats, and increases. A handful is enough — a paperclip works in a pinch.' },
  { slug: 'craft-scissors', name: 'Craft scissors', pluralName: 'scissors', category: 'knife', aliases: ['snips', 'embroidery scissors'], isPurchasable: true, typicalPriceGbp: 600, notes: 'Sharp small scissors kept off the kitchen knife block. Used for clean yarn cuts when sewing in ends.' },
  { slug: 'blocking-mat', name: 'Blocking mat', category: 'other', aliases: ['foam mat', 'blocking board'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Foam tiles (or a folded towel) for pinning damp finished crochet to shape. A child\'s soft-play tile substitutes well.' },
  { slug: 'blocking-pins', name: 'Blocking pins', pluralName: 'blocking pins', category: 'other', aliases: ['T-pins', 'lace pins'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Rust-proof T-pins or lace pins for pinning damp pieces to a blocking mat. Standard sewing pins corrode and stain the yarn.' },
  { slug: 'measuring-tape-soft', name: 'Soft measuring tape', category: 'measuring', aliases: ['dressmaker\'s tape', 'tailor\'s tape'], isPurchasable: true, typicalPriceGbp: 300, notes: 'Flexible 150 cm tape for measuring gauge, finished pieces, and bodies for garments.' },
  { slug: 'row-counter', name: 'Row counter', category: 'other', aliases: ['stitch counter', 'click counter'], isPurchasable: true, typicalPriceGbp: 500, notes: 'Mechanical click counter that sits on the hook handle, or a free phone app. For keeping count on long pattern repeats.' },

  // ── Needlework pipeline (phase_needlework_pipeline_scaffold).
  // Cross-stitch + needlepoint + tatting + lacemaking kit. Tapestry
  // needles ship in size-specific rows so a pattern can reference the
  // exact needle the cloth count expects; the generic `tapestry-needle`
  // entry above stays for crochet's catch-all use.
  { slug: 'embroidery-hoop-4', name: 'Embroidery hoop, 4 inch', category: 'other', aliases: ['10 cm hoop'], isPurchasable: true, typicalPriceGbp: 400, notes: '10 cm wooden or plastic hoop. For small motifs, single repeat samples, and finishing-up close work. Two-piece with a screw at the top.' },
  { slug: 'embroidery-hoop-5', name: 'Embroidery hoop, 5 inch', category: 'other', aliases: ['13 cm hoop'], isPurchasable: true, typicalPriceGbp: 500, notes: '13 cm hoop. The convenient handheld size for small charts and learner samples.' },
  { slug: 'embroidery-hoop-6', name: 'Embroidery hoop, 6 inch', category: 'other', aliases: ['15 cm hoop'], isPurchasable: true, typicalPriceGbp: 600, notes: '15 cm hoop. The default for medium cross-stitch charts and embroidery sampler work.' },
  { slug: 'embroidery-hoop-8', name: 'Embroidery hoop, 8 inch', category: 'other', aliases: ['20 cm hoop'], isPurchasable: true, typicalPriceGbp: 800, notes: '20 cm hoop. For larger charts; rest on a hoop stand or hold against a table edge for two-handed stitching.' },
  { slug: 'embroidery-hoop-10', name: 'Embroidery hoop, 10 inch', category: 'other', aliases: ['25 cm hoop'], isPurchasable: true, typicalPriceGbp: 1000, notes: '25 cm hoop. About the largest practical handheld size. For sampler-scale work and pieces displayed in the hoop as a finished frame.' },
  { slug: 'scroll-frame', name: 'Scroll frame', category: 'other', aliases: ['embroidery frame', 'roller frame'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Adjustable rectangular frame with side rails. The cloth attaches to top and bottom rollers; large charts scroll through. Holds tension flatter than a hoop on long projects.' },
  { slug: 'tapestry-needle-18', name: 'Tapestry needle, size 18', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 200, notes: 'Blunt large-eyed needle, size 18 — the largest of the common tapestry sizes. For 6-count Penelope canvas and tapestry-wool needlepoint.' },
  { slug: 'tapestry-needle-20', name: 'Tapestry needle, size 20', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 200, notes: 'Tapestry needle size 20. For 8 – 10-count canvas needlepoint.' },
  { slug: 'tapestry-needle-22', name: 'Tapestry needle, size 22', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 200, notes: 'Tapestry needle size 22. For 11-count Aida cross-stitch.' },
  { slug: 'tapestry-needle-24', name: 'Tapestry needle, size 24', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 200, notes: 'Tapestry needle size 24. The default cross-stitch needle — for 14-count and 16-count Aida and 28-count evenweave / linen.' },
  { slug: 'tapestry-needle-26', name: 'Tapestry needle, size 26', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 200, notes: 'Tapestry needle size 26. For 18-count Aida and 32-count evenweave / linen.' },
  { slug: 'tapestry-needle-28', name: 'Tapestry needle, size 28', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 200, notes: 'Tapestry needle size 28 — the finest of the common tapestry sizes. For 36 – 40-count linen and miniature work.' },
  { slug: 'embroidery-needle-5', name: 'Embroidery needle, size 5', category: 'other', aliases: ['sharps 5'], isPurchasable: true, typicalPriceGbp: 200, notes: 'Sharp pointed needle, size 5 — the larger of the common sharps. For bold surface embroidery with all six strands of stranded cotton.' },
  { slug: 'embroidery-needle-7', name: 'Embroidery needle, size 7', category: 'other', aliases: ['sharps 7'], isPurchasable: true, typicalPriceGbp: 200, notes: 'Sharp pointed needle, size 7. The middle size for surface embroidery with two to four strands of stranded cotton.' },
  { slug: 'embroidery-needle-10', name: 'Embroidery needle, size 10', category: 'other', aliases: ['sharps 10'], isPurchasable: true, typicalPriceGbp: 200, notes: 'Fine sharp pointed needle, size 10. For one-strand detail work and bead embroidery.' },
  { slug: 'tatting-shuttle', name: 'Tatting shuttle', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 600, notes: 'Small flat boat-shaped tool that holds the wound tatting thread. Shuttle tatting is the older method; one shuttle for plain work, two for joined motifs.' },
  { slug: 'tatting-needle-5', name: 'Tatting needle, size 5', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 300, notes: 'Long straight blunt needle for needle tatting — an alternative method to shuttle tatting. Size 5 takes a thicker thread (sizes 10 – 20). Carries the thread through formed knots rather than catching them as in shuttle tatting.' },
  { slug: 'tatting-needle-7', name: 'Tatting needle, size 7', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 300, notes: 'Tatting needle size 7 — finer, for tatting threads sizes 40 – 80.' },
  { slug: 'lace-bobbins', name: 'Lace bobbins', pluralName: 'lace bobbins', category: 'other', aliases: ['bobbin pair'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Set of weighted bobbins (traditionally wood with a spangled bead loop) that the lace-maker manipulates over the pillow. Pattern names the bobbin count; a starter set of 12 covers narrow edgings.' },
  { slug: 'lace-pillow', name: 'Lace pillow', category: 'other', aliases: ['cookie pillow', 'bolster pillow'], isPurchasable: true, typicalPriceGbp: 5000, notes: 'Firm rounded pillow that holds the pricked pattern + pins + working lace. Cookie shape for flat work, bolster shape for traditional Honiton + Bedfordshire. Often hand-stuffed with chopped straw or cork.' },
  { slug: 'lace-pricker', name: 'Lace pricker', category: 'other', aliases: ['pricking pin'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Fine needle held in a wooden handle, for pricking pin-holes through the pattern card before bobbin work begins. The pin-holes mark where the lace-maker sets a pin during stitching.' },
  { slug: 'needle-minder', name: 'Needle minder magnet', category: 'other', aliases: ['needle magnet', 'parking magnet'], isPurchasable: true, typicalPriceGbp: 600, notes: 'Two-piece magnet — one half on the front of the cloth, one behind — that parks the needle safely between stitches. Replaces loose-needle hazards on furniture, especially around children and pets.' },
  { slug: 'embroidery-scissors', name: 'Embroidery scissors', pluralName: 'embroidery scissors', category: 'knife', aliases: ['stork scissors', 'snips', 'thread scissors'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Small sharp-pointed surgical-style scissors, often shaped as storks. Dedicated cloth-and-thread use; the points get into a single-strand miss-stitch without snagging the ground. Keep capped or sheathed when not in use.' },
  { slug: 'magnifier-loupe', name: 'Magnifier loupe', category: 'other', aliases: ['magnifying glass', 'stand magnifier', 'clip-on magnifier'], isPurchasable: true, typicalPriceGbp: 2000, notes: 'Hands-free magnifier on a clip or stand, sometimes with an integrated lamp. Reduces eye fatigue on 28-count + linens and miniature work. Drape over the cloth between you and the work.' },
  { slug: 'daylight-task-lamp', name: 'Daylight task lamp', category: 'other', aliases: ['craft lamp', 'sewing lamp'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Adjustable LED lamp with a 5,000 – 6,500 K daylight-balanced bulb. Reads thread colours accurately and reduces eye strain through long sessions. Worth the spend after a year of squinting under a yellow lamp.' },

  // ── Wood & natural craft pipeline (phase_wood_natural_craft_pipeline_setup).
  // The largest single tool batch in the master Tool table to date. Covers
  // whittling + spoon-carving knives, gouges, chisels, axes, drawknives,
  // spokeshaves, green-wood specifics, measuring + marking, sharpening,
  // pyrography, basketry, finishes, and abrasives. Wood species themselves
  // are named in body prose rather than registered — there is no species
  // master table for this category, and the upload script does not
  // validate species names. Finishes + abrasives sit here so a tutorial's
  // `recipeTools` can reference them alongside the cutting kit.

  // Knives — the whittling + spoon-carving + chip-carving cutting set.
  { slug: 'sloyd-knife', name: 'Sloyd knife', category: 'knife', aliases: ['Swedish carving knife', 'whittling knife'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Short straight-bladed knife with a stout handle; the Swedish school-craft standard. 75 – 85 mm blade, scandi grind, hard steel. The single most-used wood-craft knife.' },
  { slug: 'hook-knife-small', name: 'Hook knife, small', category: 'knife', aliases: ['spoon knife small', 'crook knife small'], isPurchasable: true, typicalPriceGbp: 3000, notes: 'Tight-radius hooked blade for small spoon bowls, kuksa interiors, and tight hollowing. Right-handed and left-handed variants — buy for the hand that holds the knife.' },
  { slug: 'hook-knife-medium', name: 'Hook knife, medium', category: 'knife', aliases: ['spoon knife medium', 'crook knife medium'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Medium-radius hooked blade for the everyday eating-spoon bowl. The all-rounder of the three sizes. Right- and left-handed.' },
  { slug: 'hook-knife-large', name: 'Hook knife, large', category: 'knife', aliases: ['spoon knife large', 'crook knife large', 'bowl knife'], isPurchasable: true, typicalPriceGbp: 4000, notes: 'Wide-radius hooked blade for cooking spoons, ladles, and shallow bowls. Right- and left-handed.' },
  { slug: 'marking-knife', name: 'Marking knife', category: 'knife', aliases: ['striking knife'], isPurchasable: true, typicalPriceGbp: 1800, notes: 'Single-bevel knife for scoring precise lines across seasoned-wood joinery work. The bevel sits away from the line being marked. Dovetail layout, mortise-and-tenon shoulders.' },
  { slug: 'twca-cam', name: 'Twca cam', category: 'knife', aliases: ['Welsh spoon knife', 'curved drawknife'], isPurchasable: true, typicalPriceGbp: 5500, notes: 'Welsh two-handled curved spoon-carving knife. Pulled across the work like a drawknife but cuts on the curve. For bowls and ladles too large for a hook knife.' },
  { slug: 'detail-knife', name: 'Detail knife', category: 'knife', aliases: ['fine carving knife'], isPurchasable: true, typicalPriceGbp: 2200, notes: 'Narrow short-bladed knife for fine detail — eyes, feathers, lettering. 35 – 50 mm blade.' },
  { slug: 'chip-carving-knife', name: 'Chip-carving knife', category: 'knife', aliases: [], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Wide flat blade ground to a 65° point. For the three-cut chip-carving fundamentals. Held with the thumb on the spine for control.' },

  // Gouges — sweep numbers follow the Sheffield list. Sweep × size grid
  // kept tight: one representative size per common sweep, plus a couple of
  // size variants on the bowl-carving sweeps. Authors who need a specific
  // size not listed here register it as a follow-up in the brief.
  { slug: 'gouge-sweep-3-12mm', name: 'Gouge, No. 3 sweep, 12 mm', category: 'other', aliases: ['shallow gouge 12 mm'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Shallow-sweep gouge for surface relief and gentle hollowing. The smoothing gouge after deeper-sweep roughing.' },
  { slug: 'gouge-sweep-5-12mm', name: 'Gouge, No. 5 sweep, 12 mm', category: 'other', aliases: ['medium gouge 12 mm'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Medium-sweep gouge for relief carving and shallow hollowing. The most-used carving gouge.' },
  { slug: 'gouge-sweep-7-12mm', name: 'Gouge, No. 7 sweep, 12 mm', category: 'other', aliases: ['deep gouge 12 mm'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Deep-sweep gouge for hollowing spoon bowls and small relief cuts. Pairs with a No. 3 for smoothing the inside of the cut.' },
  { slug: 'gouge-sweep-7-20mm', name: 'Gouge, No. 7 sweep, 20 mm', category: 'other', aliases: ['deep gouge 20 mm'], isPurchasable: true, typicalPriceGbp: 5500, notes: 'Wider No. 7 for larger bowl interiors and trough work.' },
  { slug: 'gouge-sweep-9-12mm', name: 'Gouge, No. 9 sweep, 12 mm', category: 'other', aliases: ['deep U gouge 12 mm'], isPurchasable: true, typicalPriceGbp: 4800, notes: 'Deep-U sweep for tight hollowing and channel work.' },
  { slug: 'gouge-sweep-11-6mm', name: 'Gouge, No. 11 sweep, 6 mm', category: 'other', aliases: ['veiner 6 mm'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Veiner — almost-closed U sweep. For shallow channels in relief carving and fine detail furrows.' },
  { slug: 'spoon-gouge-12mm', name: 'Spoon gouge, 12 mm', category: 'other', aliases: ['bent gouge 12 mm'], isPurchasable: true, typicalPriceGbp: 5500, notes: 'Bent shaft with the cutting edge curved upward — reaches into deep bowls where a straight gouge bottoms out. The kuksa-interior tool.' },
  { slug: 'fishtail-gouge-12mm', name: 'Fishtail gouge, 12 mm', category: 'other', aliases: ['fishtail 12 mm'], isPurchasable: true, typicalPriceGbp: 5000, notes: 'Tapered shaft widening to the cutting edge — reaches into corners where a straight-shaft gouge fouls.' },
  { slug: 'v-tool-60', name: 'V-tool, 60°', category: 'other', aliases: ['parting tool 60'], isPurchasable: true, typicalPriceGbp: 4000, notes: 'V-shaped cutting edge at 60°. For outlining relief work, lettering, and decorative borders.' },
  { slug: 'v-tool-90', name: 'V-tool, 90°', category: 'other', aliases: ['parting tool 90'], isPurchasable: true, typicalPriceGbp: 4000, notes: 'V-tool at 90° — wider, shallower channel than the 60°. For broader decorative borders.' },

  // Chisels — joinery + edge work on seasoned stock.
  { slug: 'firmer-chisel-12mm', name: 'Firmer chisel, 12 mm', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 3000, notes: 'Square-sided general-purpose chisel, 12 mm. Heavier than a bevel-edge — for chopping mortises by hand and paring across the grain.' },
  { slug: 'firmer-chisel-25mm', name: 'Firmer chisel, 25 mm', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Wide firmer chisel for paring across large flat areas and chopping wide mortises.' },
  { slug: 'bevel-edge-chisel-6mm', name: 'Bevel-edge chisel, 6 mm', category: 'other', aliases: ['paring chisel 6 mm'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Narrow bevel-edge for cleaning tight dovetail corners. The dovetail starter.' },
  { slug: 'bevel-edge-chisel-12mm', name: 'Bevel-edge chisel, 12 mm', category: 'other', aliases: ['paring chisel 12 mm'], isPurchasable: true, typicalPriceGbp: 2800, notes: 'The default joinery chisel. Bevelled sides clear the corners on dovetails and lap joints.' },
  { slug: 'bevel-edge-chisel-25mm', name: 'Bevel-edge chisel, 25 mm', category: 'other', aliases: ['paring chisel 25 mm'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Wide bevel-edge for paring flat surfaces and skimming end-grain.' },
  { slug: 'mortise-chisel-9mm', name: 'Mortise chisel, 9 mm', category: 'other', aliases: ['pigsticker 9 mm'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Heavy-section chisel for chopping mortises. The thick blade levers chips out without flexing. 9 mm is the household-furniture default.' },
  { slug: 'skew-chisel-12mm', name: 'Skew chisel, 12 mm', category: 'other', aliases: ['corner chisel'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Angled cutting edge for cleaning tight corners and end-grain transitions. The clean-up chisel.' },

  // Axes — green-woodwork rough shaping + riving.
  { slug: 'carving-axe', name: 'Carving axe', category: 'other', aliases: ['Hultafors axe', 'Gransfors carving axe', 'spoon axe'], isPurchasable: true, typicalPriceGbp: 9500, notes: 'Short-handled axe with a curved bit, ground convex for slicing rather than splitting. The rough-shape-the-blank tool for spoon-carving and treen. Hultafors and Gränsfors are the reference patterns.' },
  { slug: 'splitting-axe', name: 'Splitting axe', category: 'other', aliases: ['splitting maul'], isPurchasable: true, typicalPriceGbp: 6500, notes: 'Wedge-bit axe for cleaving billets along the grain. A maul (axe + sledge in one) is heavier still — for stubborn green stock.' },
  { slug: 'broad-axe', name: 'Broad axe', category: 'other', aliases: ['hewing axe'], isPurchasable: true, typicalPriceGbp: 12000, notes: 'Wide single-bevel bit for hewing a flat face on a round log. The traditional method for squaring up timber-frame beams. Heavy specialist tool — borrow before buying.' },
  { slug: 'side-axe', name: 'Side axe', category: 'other', aliases: ['hand axe'], isPurchasable: true, typicalPriceGbp: 7500, notes: 'Single-bevel one-hand axe for clean side-cuts on smaller stock. The handle offset means the knuckles clear the work.' },
  { slug: 'hatchet-small', name: 'Hatchet, small', category: 'other', aliases: ['kindling hatchet'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Small two-bevel hatchet, 35 – 45 cm handle, for general rough work and splitting kindling-sized stock. The most accessible first axe.' },

  // Drawknives, scorps, spokeshaves — two-handed shaping tools.
  { slug: 'drawknife-straight', name: 'Drawknife, straight', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 7500, notes: 'Two-handled blade pulled toward the body along the workpiece. 200 – 250 mm blade. The green-woodwork rough-shaping tool: chair stiles, mallets, blank refinement. Used at the shaving horse.' },
  { slug: 'drawknife-curved', name: 'Drawknife, curved', category: 'other', aliases: ['hollow drawknife'], isPurchasable: true, typicalPriceGbp: 8500, notes: 'Drawknife with a concave cutting edge for shaping convex surfaces and chair-seat undersides.' },
  { slug: 'inshave', name: 'Inshave', category: 'other', aliases: ['scorp'], isPurchasable: true, typicalPriceGbp: 9500, notes: 'Curved two-handled blade for hollowing bowls and saddle-seat chairs. Cuts on the pull. The chair-seat tool.' },
  { slug: 'spokeshave-flat', name: 'Spokeshave, flat-bottomed', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Small two-handled plane for shaping convex curves and refining edges. The spokeshave standard.' },
  { slug: 'spokeshave-round', name: 'Spokeshave, round-bottomed', category: 'other', aliases: ['concave spokeshave'], isPurchasable: true, typicalPriceGbp: 5500, notes: 'Round-bottom sole for working concave curves where a flat spokeshave bridges the curve and cannot reach.' },
  { slug: 'travisher', name: 'Travisher', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 8500, notes: 'Small concave spokeshave for refining the bowl-back of a chair seat or kuksa interior after roughing with an inshave or hook knife.' },

  // Green-wood specifics — riving + bench gear.
  { slug: 'froe', name: 'Froe', category: 'other', aliases: ['riving froe', 'cleaving froe'], isPurchasable: true, typicalPriceGbp: 5500, notes: 'Wedge-shaped blade with a vertical handle, driven into the end-grain of a billet with a beetle to split it along the grain. The riven-blank starting tool.' },
  { slug: 'beetle-mallet', name: 'Beetle', category: 'other', aliases: ['club', 'wooden mallet', 'maul'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Heavy wooden club for driving a froe. Traditionally turned from a single piece of beech or hornbeam. Made (not bought) by most green-woodworkers — the first project for a new shaving horse.' },
  { slug: 'splitting-wedges', name: 'Splitting wedges', pluralName: 'splitting wedges', category: 'other', aliases: ['gluts', 'wedges'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Steel or seasoned-hardwood wedges for opening splits started by the froe. Use in pairs to walk a split down a long billet.' },
  { slug: 'shaving-horse', name: 'Shaving horse', category: 'other', aliases: ['shave horse', 'bodger horse'], isPurchasable: true, typicalPriceGbp: 18000, notes: 'Foot-pedalled bench that clamps the workpiece for two-handed drawknife and spokeshave work. The English bodger pattern is the reference. Most makers build their own — buy if making one is the bottleneck.' },
  { slug: 'pole-lathe', name: 'Pole lathe', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 25000, notes: 'Treadle-driven lathe powered by a springy pole overhead, traditionally outdoor-set in a coppice. For chair legs, stretchers, and turned tool handles. Specialist — borrow or visit a coppice-craft course before buying.' },
  { slug: 'side-axe-block', name: 'Side-axe block', category: 'other', aliases: ['hewing block', 'chopping block'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Heavy seasoned end-grain block, knee-high, that takes the workpiece during side-axe rough-shaping. Replaces a beam-end-of-a-stump for indoor work.' },
  { slug: 'billhook-yorkshire', name: 'Billhook, Yorkshire pattern', category: 'other', aliases: ['Yorkshire hook'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Heavy curved single-bevel blade with a forward-curving point. The Yorkshire pattern is the heaviest of the regional patterns — for stout hazel and coppice work.' },
  { slug: 'billhook-devon', name: 'Billhook, Devon pattern', category: 'other', aliases: ['Devon hook'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Lighter than the Yorkshire pattern, with a longer point. The hedge-laying default in the south-west.' },
  { slug: 'billhook-kent', name: 'Billhook, Kent pattern', category: 'other', aliases: ['Kent hook'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Long blade, deeply curved at the tip. The Kent hedge-laying and orchard-coppicing pattern.' },

  // Measuring + marking — joinery accuracy.
  { slug: 'combination-square', name: 'Combination square', category: 'measuring', aliases: ['combo square'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Sliding head on a graduated rule. 90°, 45°, depth-gauge, marking-gauge in one. The joinery accuracy reference.' },
  { slug: 'sliding-bevel', name: 'Sliding bevel', category: 'measuring', aliases: ['bevel gauge', 'T-bevel'], isPurchasable: true, typicalPriceGbp: 2200, notes: 'Adjustable blade on a stock — for setting and transferring any angle. The dovetail-layout standard.' },
  { slug: 'marking-gauge', name: 'Marking gauge', category: 'measuring', aliases: ['mortise gauge'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Wooden fence sliding on a beam with a steel pin or wheel. Scores a parallel line for joinery layout. Mortise variant has twin pins for both shoulders of a mortise at once.' },
  { slug: 'dividers-pair', name: 'Dividers', pluralName: 'dividers', category: 'measuring', aliases: ['pair of dividers', 'compass'], isPurchasable: true, typicalPriceGbp: 1800, notes: 'Two-leg metal compass for stepping off equal distances along a workpiece — dovetail spacing, repeating decorative motifs.' },
  { slug: 'calipers', name: 'Calipers', pluralName: 'calipers', category: 'measuring', aliases: ['Vernier calipers', 'digital calipers'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Sliding jaws for measuring thickness, internal diameter, and external diameter. Digital reads to 0.1 mm; Vernier reads to 0.05 mm. For checking wall thickness on bowls and kuksas as you carve.' },

  // Sharpening — the maintenance kit. Edge management is non-negotiable.
  { slug: 'japanese-waterstone-1000', name: 'Japanese waterstone, 1000 grit', category: 'other', aliases: ['medium waterstone'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Soak-and-cut waterstone for re-establishing an edge after a chip. The everyday sharpening grit.' },
  { slug: 'japanese-waterstone-4000', name: 'Japanese waterstone, 4000 grit', category: 'other', aliases: ['fine waterstone'], isPurchasable: true, typicalPriceGbp: 5500, notes: 'Fine waterstone for refining the edge after the 1000-grit. Builds a slurry that polishes as it cuts.' },
  { slug: 'japanese-waterstone-8000', name: 'Japanese waterstone, 8000 grit', category: 'other', aliases: ['polishing waterstone'], isPurchasable: true, typicalPriceGbp: 7500, notes: 'Polishing waterstone — the final stone before stropping. Takes the edge to a near-mirror finish that will shave hair off the back of the forearm.' },
  { slug: 'oilstone-india', name: 'India combination oilstone', category: 'other', aliases: ['combination oilstone', 'India stone'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Aluminium-oxide oilstone with coarse on one face and fine on the other. The traditional one-stone solution; not as fast as waterstones but tolerates rougher handling and doesn\'t need soaking.' },
  { slug: 'leather-strop', name: 'Leather strop', category: 'other', aliases: ['stropping leather'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Leather strap (mounted on a paddle or loose) charged with abrasive compound, for maintaining a sharp edge between sharpenings. Strop every fifteen minutes of carving. Greatly extends time between sharpenings.' },
  { slug: 'slipstones-set', name: 'Slipstones, set', pluralName: 'slipstones', category: 'other', aliases: ['gouge slipstones'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Profiled small stones for sharpening the inside curve of gouges and V-tools. A starter set covers the common sweeps.' },

  // Pyrography — burner + tip kit.
  { slug: 'pyrography-solid-tip-burner', name: 'Pyrography solid-tip burner', category: 'electrical', aliases: ['entry pyrography', 'soldering-iron burner'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Soldering-iron-style burner with interchangeable solid brass tips. Slow to heat and slow to change temperature; the affordable starting tool. Tips screw in cold and take a few minutes to come to working heat.' },
  { slug: 'pyrography-nichrome-wire-burner', name: 'Pyrography nichrome-wire burner', category: 'electrical', aliases: ['professional pyrography', 'wire-tip pyrography'], isPurchasable: true, typicalPriceGbp: 12000, notes: 'Variable-temperature burner with interchangeable nichrome-wire tips. Heats and cools quickly, dials in temperature precisely. The serious-work tool — far more controllable than a solid-tip.' },
  { slug: 'pyrography-tip-shading', name: 'Pyrography shading tip', category: 'electrical', aliases: ['shader tip', 'spoon-point shading tip'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Wide curved tip for shading large areas. Held with the spine flat to the surface for soft shading or on edge for harder strokes.' },
  { slug: 'pyrography-tip-writing', name: 'Pyrography writing tip', category: 'electrical', aliases: ['writing point', 'fine-line tip'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Fine point for outline drawing and lettering. The default tip for design transfer.' },
  { slug: 'pyrography-tip-calligraphy', name: 'Pyrography calligraphy nib', category: 'electrical', aliases: ['calligraphy tip', 'flat-edge nib'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Flat angled nib that lays down thick-and-thin strokes like a calligraphy pen. For decorative lettering and ornamental work.' },
  { slug: 'pyrography-tip-ball-stylus', name: 'Pyrography ball stylus', category: 'electrical', aliases: ['ball tip'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Spherical tip for dotwork (pointillism) and curve work. The detail-shading complement to the writing tip.' },
  { slug: 'pyrography-cooling-stand', name: 'Pyrography cooling stand', category: 'other', aliases: ['burner stand', 'pen stand'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Metal cradle on a heavy base that holds the burner pen between strokes. Non-negotiable — a pyrography pen does not go on the bench surface or onto fabric.' },

  // Basketry — willow + rush + reed kit.
  { slug: 'bodkin', name: 'Bodkin', category: 'other', aliases: ['basketry bodkin'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Pointed steel rod with a wooden handle, for opening up a path through the weave to insert a new stake or to pack down a row. The basketry equivalent of an awl.' },
  { slug: 'rapping-iron', name: 'Rapping iron', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Heavy curved iron bar used to beat down rows of weaving to compact them. The willow-basket density is set by how hard the maker raps each row.' },
  { slug: 'secateurs', name: 'Secateurs', pluralName: 'secateurs', category: 'other', aliases: ['pruning shears', 'secaters'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'By-pass secateurs for trimming willow rods and weaving ends. Felco and Niwaki are the reference brands; the cheaper alternatives blunt within a season of willow work.' },
  { slug: 'soaking-trough', name: 'Soaking trough', category: 'other', aliases: ['willow soaking tank'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Long shallow trough (a galvanised cattle-water trough is the traditional substitute) for soaking willow rods before weaving. One week soak for one year of dry storage, roughly.' },

  // Wood finishes — food-safe and non-food. Cure-time honesty on every row.
  { slug: 'wood-finish-raw-linseed-oil', name: 'Raw linseed oil (wood finish)', category: 'other', aliases: ['flax oil finish'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Food-safe drying oil. Apply liberally, let soak for an hour, wipe off the surplus. Cure for two weeks before food contact. Slow-curing; non-toxic. The traditional treen finish. Distinct from boiled linseed oil (BLO) — which is not food-safe.' },
  { slug: 'wood-finish-walnut-oil', name: 'Walnut oil (wood finish)', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1800, notes: 'Food-safe drying oil that cures harder than raw linseed. Tree-nut allergen — declare clearly on any finished piece that is sold or gifted. Two-week cure for full food-safety.' },
  { slug: 'wood-finish-pure-tung-oil', name: 'Pure tung oil', category: 'other', aliases: ['tung-nut oil'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Hardest of the drying oils. Three- to four-week cure for full hardness, but the most durable food-safe surface. Apply three thin coats with a wipe between. "Pure" — not the polymerised / solvent-blended bottles labelled "tung oil finish".' },
  { slug: 'wood-finish-board-butter', name: 'Board butter', category: 'other', aliases: ['cutting-board conditioner', 'wax-and-oil paste'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Beeswax-and-food-grade-mineral-oil paste. The standard chopping-board finish. Re-applied monthly. Not a curing finish — a barrier-and-conditioner. Apply with a soft cloth, let stand twenty minutes, buff off.' },
  { slug: 'wood-finish-boiled-linseed-oil', name: 'Boiled linseed oil (BLO)', category: 'other', aliases: ['BLO'], isPurchasable: true, typicalPriceGbp: 1000, notes: 'Linseed oil with metallic driers added — cures faster than raw. Never food-safe. WARNING: oil-soaked rags can spontaneously combust as the oil cures. Spread used rags flat to dry outdoors, or drown them in water and bag.' },
  { slug: 'wood-finish-danish-oil', name: 'Danish oil', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Linseed + tung + solvent + resin blend. Quick-curing, easy-to-apply, builds a soft satin finish. Not food-safe. Three thin coats; light sand between coats two and three.' },
  { slug: 'wood-finish-shellac', name: 'Shellac', category: 'other', aliases: ['French polish'], isPurchasable: true, typicalPriceGbp: 2000, notes: 'Alcohol-based resin solution that builds a surface film. Reversible with denatured alcohol — the traditional furniture-restoration finish. Comes as flakes (mix fresh) or pre-mixed; the flakes keep longer.' },
  { slug: 'wood-finish-polyurethane', name: 'Polyurethane', category: 'other', aliases: ['poly varnish'], isPurchasable: true, typicalPriceGbp: 1800, notes: 'Modern film finish. Hard, water-resistant, not reversible. Oil-based (slower-curing, warmer tone) and water-based (faster-curing, clearer) variants. The garden-furniture default.' },

  // Abrasives — sanding ladder + scrapers + steel wool.
  { slug: 'sandpaper-80', name: 'Sandpaper, 80 grit', category: 'other', aliases: ['coarse sandpaper'], isPurchasable: true, typicalPriceGbp: 100, notes: 'Coarse abrasive for shaping and removing tool marks. Aluminium-oxide is the workshop standard.' },
  { slug: 'sandpaper-120', name: 'Sandpaper, 120 grit', category: 'other', aliases: ['medium sandpaper'], isPurchasable: true, typicalPriceGbp: 100, notes: 'Medium grit — the bridge between shaping and surface-refining.' },
  { slug: 'sandpaper-180', name: 'Sandpaper, 180 grit', category: 'other', aliases: ['fine sandpaper'], isPurchasable: true, typicalPriceGbp: 100, notes: 'Fine grit — the surface ready for finishing oil on most projects.' },
  { slug: 'sandpaper-240', name: 'Sandpaper, 240 grit', category: 'other', aliases: ['very fine sandpaper'], isPurchasable: true, typicalPriceGbp: 100, notes: 'Very-fine grit — between finishing coats and for very smooth-touch pieces.' },
  { slug: 'sandpaper-320', name: 'Sandpaper, 320 grit', category: 'other', aliases: ['extra-fine sandpaper'], isPurchasable: true, typicalPriceGbp: 100, notes: 'Extra-fine — for between-coats sanding on shellac and oil-finished furniture.' },
  { slug: 'sandpaper-400', name: 'Sandpaper, 400 grit', category: 'other', aliases: ['polishing sandpaper'], isPurchasable: true, typicalPriceGbp: 100, notes: 'Polishing grit — between coats of harder finishes and for the final pre-strop on a sharp edge.' },
  { slug: 'sandpaper-600', name: 'Sandpaper, 600 grit', category: 'other', aliases: ['fine polishing sandpaper'], isPurchasable: true, typicalPriceGbp: 150, notes: 'Wet-or-dry abrasive for final polishing of high-gloss finishes.' },
  { slug: 'card-scraper', name: 'Card scraper', category: 'other', aliases: ['cabinet scraper'], isPurchasable: true, typicalPriceGbp: 1000, notes: 'Thin steel rectangle with a burnished edge that cuts a fine shaving rather than abrading. Leaves a glassy surface on dense hardwoods that sandpaper can\'t match. The cabinet-maker\'s finishing tool.' },
  { slug: 'steel-wool-000', name: 'Steel wool, 000', category: 'other', aliases: ['fine steel wool'], isPurchasable: true, typicalPriceGbp: 300, notes: 'Fine steel wool for cutting back between coats of shellac and varnish and polishing oil finishes to a soft sheen.' },
  { slug: 'steel-wool-0000', name: 'Steel wool, 0000', category: 'other', aliases: ['extra-fine steel wool'], isPurchasable: true, typicalPriceGbp: 350, notes: 'Extra-fine steel wool — the finest grade. For final-finish cutback and rust removal without scratching. Never use on oak with iron-stain-sensitive finishes.' },
  // ── Pottery & ceramics pipeline (phase_pottery_pipeline_001).
  // Hand-building, throwing, trimming, surface decoration, glazing,
  // firing, and safety. Clay bodies + glaze raw materials live in
  // separate masters (ClayBody, CraftMaterial); this set is the
  // tool-side kit. Studio-only items (electric kiln, potter's wheel)
  // are marked isPurchasable: true with a typicalPriceGbp anchor so
  // the future buy panel can sort them sensibly, but the authoring
  // prompt also treats them as the equipment-barrier flag.
  //
  // Hand-building
  { slug: 'wooden-rib', name: 'Wooden rib', category: 'other', aliases: ['rib tool'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Smooth-edged wooden rib for shaping walls, smoothing slabs, and compressing rims. Pear or beech is the standard wood. A set of three or four assorted shapes covers most situations.' },
  { slug: 'metal-rib', name: 'Metal rib', category: 'other', aliases: ['kidney rib'], isPurchasable: true, typicalPriceGbp: 500, notes: 'Stainless steel kidney or square rib. Sharper edge than wood; trims thrown walls, finishes leather-hard surfaces, scrapes slab joins level.' },
  { slug: 'loop-tool', name: 'Loop tool', category: 'other', aliases: ['kemper loop tool', 'trimming loop'], isPurchasable: true, typicalPriceGbp: 600, notes: 'Wire-loop carving and trimming tool. The standard tool for trimming foot rings on the wheel and for carving away leather-hard clay.' },
  { slug: 'needle-tool', name: 'Needle tool', category: 'other', aliases: ['pin tool', 'fettling needle'], isPurchasable: true, typicalPriceGbp: 400, notes: 'A wooden handle with a thin steel needle. Trims the rim of a thrown pot to level, scores joining surfaces, pops air bubbles. The single most-used tool at the wheel.' },
  { slug: 'fettling-knife', name: 'Fettling knife', category: 'knife', aliases: ['potter\'s knife'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Long thin flexible blade for trimming greenware seams, paring slab edges, and cutting clay slabs cleanly.' },
  { slug: 'pottery-sponge', name: 'Pottery sponge', category: 'other', aliases: ['throwing sponge'], isPurchasable: true, typicalPriceGbp: 300, notes: 'Natural sea sponge for the wheel — squeezes out water in a controlled drip and conforms to curved surfaces. Synthetic sponges are too stiff for fine work.' },
  { slug: 'pottery-chamois', name: 'Pottery chamois', category: 'other', aliases: ['leather rim chamois'], isPurchasable: true, typicalPriceGbp: 400, notes: 'A soft leather strip folded over the rim of a thrown pot to compress and smooth. The finishing move on the thrown rim before cutting from the bat.' },
  { slug: 'pottery-calipers', name: 'Pottery calipers', pluralName: 'calipers', category: 'measuring', aliases: ['callipers', 'lid calipers'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Sprung-arm callipers for transferring an inside diameter (pot rim) to an outside diameter (lid). Essential for any lidded form.' },
  { slug: 'wire-cutter', name: 'Wire cutter', category: 'other', aliases: ['cut-off wire', 'cheese wire'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Twisted-steel wire with wooden handles. Cuts a finished pot off the wheel bat; slices fresh clay blocks from the bag; trims slabs.' },
  { slug: 'pottery-rolling-pin', name: 'Pottery rolling pin', category: 'other', aliases: ['slab rolling pin'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Heavy wooden rolling pin for rolling slabs by hand. Dedicated to clay — do not share with the kitchen rolling pin. A pair of slab guides (wooden rails) gives even thickness.' },
  { slug: 'slab-roller', name: 'Slab roller', category: 'appliance', aliases: [], isPurchasable: true, typicalPriceGbp: 60000, notes: 'Studio-scale machine for rolling large clay slabs to a controlled thickness. Optional — a rolling pin and slab guides do the same work at small scale.' },
  { slug: 'wooden-board', name: 'Wooden board', category: 'board', aliases: ['ware board'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Plywood or pine board for carrying wet work, drying greenware to leather-hard, and protecting the table surface. A handful of boards covers most studio days.' },
  { slug: 'plaster-bat', name: 'Plaster bat', category: 'other', aliases: ['plaster slab'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Plaster slab that absorbs water from clay. Use for drying slips down to a workable consistency or for stiffening a too-wet slab. Cast at home from pottery plaster.' },
  { slug: 'drape-mould-bowl', name: 'Drape mould (bowl)', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 2000, notes: 'Plaster or biscuit-fired ceramic dome shape that a clay slab drapes over to form a bowl. The standard slab-bowl technique.' },
  { slug: 'sprig-mould', name: 'Sprig mould', category: 'other', aliases: ['press mould'], isPurchasable: true, typicalPriceGbp: 1000, notes: 'Small plaster mould for pressing decorative clay sprigs (Wedgwood-style relief decoration). Casts repeatable motifs.' },
  { slug: 'pottery-stamp', name: 'Pottery stamp', category: 'other', aliases: ['clay stamp'], isPurchasable: true, typicalPriceGbp: 500, notes: 'Clay-friendly stamp — bisque-fired, carved hardwood, or commercial rubber — for impressing repeating decoration into soft clay.' },

  // Throwing — wheel-dependent
  { slug: 'potters-wheel-electric', name: 'Electric potter\'s wheel', category: 'electrical', aliases: ['potter\'s wheel', 'pottery wheel'], isPurchasable: true, typicalPriceGbp: 80000, notes: 'Foot-pedal-controlled motorised wheel for throwing pots. Studio fixture. Used in roughly 30% of pottery tutorials — the no-equipment track tutorials work without one.' },
  { slug: 'potters-wheel-kick', name: 'Kick wheel', category: 'other', aliases: ['treadle wheel'], isPurchasable: true, typicalPriceGbp: 60000, notes: 'Foot-driven wheel with a heavy flywheel. Studio fixture. Quieter and more controllable than electric; used in some teaching studios and by traditional potters.' },
  { slug: 'wheel-bat', name: 'Wheel bat', category: 'other', aliases: ['throwing bat'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Removable disc that screws or pins to the wheel head. The pot is thrown on the bat, then the whole bat is lifted off and the pot dries in place. Plywood, plaster, or composite.' },
  { slug: 'throwing-stick', name: 'Throwing stick', category: 'other', aliases: ['rib stick', 'bottle bender'], isPurchasable: true, typicalPriceGbp: 1000, notes: 'Long wooden tool for shaping the inside of tall narrow forms (bottles, vases) where the hand cannot reach.' },
  { slug: 'splash-pan', name: 'Splash pan', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Plastic basin that catches water and slurry off the spinning wheel head. Usually built into the wheel.' },
  { slug: 'banding-wheel', name: 'Banding wheel', category: 'other', aliases: ['decorating wheel', 'turntable'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Hand-spun cast-iron or aluminium turntable for decorating and trimming. Slower and more controllable than the powered wheel; the standard surface for sgraffito, slip-trailing, brushwork, and lid-fitting.' },
  { slug: 'foot-ring-chuck', name: 'Foot-ring chuck', category: 'other', aliases: ['trimming chuck'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'A bisque-fired or thrown clay collar that holds an inverted pot off the wheel head during foot-ring trimming. Custom-made per pot family.' },

  // Surface decoration
  { slug: 'sgraffito-tool', name: 'Sgraffito tool', category: 'other', aliases: ['linoleum cutter', 'carving tool'], isPurchasable: true, typicalPriceGbp: 600, notes: 'Fine-tipped carving tool for sgraffito (scratching through a slip layer to reveal contrasting clay underneath). Linoleum cutters, dental picks, and dedicated sgraffito tools all work.' },
  { slug: 'slip-trailer', name: 'Slip trailer', category: 'other', aliases: ['rubber bulb', 'slip bottle'], isPurchasable: true, typicalPriceGbp: 500, notes: 'Rubber bulb or plastic squeeze bottle for laying down a controlled line of slip on a leather-hard surface. The traditional bird-shaped slip trailer is a clay decanter; a plastic ketchup bottle is the studio cheat.' },
  { slug: 'pottery-brush-mop', name: 'Pottery brush, mop', category: 'other', aliases: ['glaze mop'], isPurchasable: true, typicalPriceGbp: 1000, notes: 'Soft full-bellied brush for laying down even glaze coats and broad slip washes. Goat or pony hair; synthetic equivalents work.' },
  { slug: 'pottery-brush-liner', name: 'Pottery brush, liner', category: 'other', aliases: ['liner brush', 'detail brush'], isPurchasable: true, typicalPriceGbp: 600, notes: 'Fine pointed brush for line decoration, brushwork, and detail under-glaze painting.' },
  { slug: 'pottery-brush-hake', name: 'Pottery brush, hake', category: 'other', aliases: ['hake brush'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Wide flat goat-hair Japanese brush. For broad even glaze application and slip wash backgrounds.' },

  // Glazing
  { slug: 'glaze-tongs', name: 'Glaze tongs', pluralName: 'glaze tongs', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Sprung steel tongs for dipping bisqueware into a glaze bucket. Leave three small tong marks on the pot which are touched up with a brush after.' },
  { slug: 'glaze-bucket', name: 'Glaze bucket', category: 'other', aliases: ['dipping bucket'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Wide-mouthed plastic bucket — 2-5 L for small work, 10-25 L for studio dipping. Glaze settles fast; stir or hand-mix before every session.' },
  { slug: 'glaze-sieve', name: 'Glaze sieve', category: 'other', aliases: ['lawn sieve'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Stainless steel mesh sieve (60 / 80 / 100 mesh) for screening lumps out of mixed glaze. Mesh number is holes-per-inch — finer for smooth glazes, coarser for textured ones.' },
  { slug: 'hydrometer', name: 'Glaze hydrometer', category: 'measuring', aliases: ['specific-gravity meter'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Floating glass tube that reads the specific gravity of a mixed glaze (typically 1.40 - 1.55 for dipping). Without it, dipping glazes vary thickness from day to day as water evaporates.' },
  { slug: 'glaze-whisk', name: 'Glaze whisk', category: 'utensil', aliases: ['drill mixer', 'paint mixer'], isPurchasable: true, typicalPriceGbp: 1000, notes: 'Cage whisk on a drill, or a hand whisk, to fold settled glaze back into suspension. Mix before every dipping or brushing session.' },
  { slug: 'ball-mill', name: 'Ball mill', category: 'appliance', aliases: [], isPurchasable: true, typicalPriceGbp: 30000, notes: 'Rotating jar with porcelain or steel balls that grinds glaze materials to a finer particle size. Studio-scale only; most home and small studios skip it.' },

  // Firing — kiln-required
  { slug: 'electric-kiln-small', name: 'Electric kiln, small', category: 'appliance', aliases: ['top-loader kiln', 'studio kiln'], isPurchasable: true, typicalPriceGbp: 120000, notes: 'Domestic-scale top-loading electric kiln (around 0.1 m³ chamber). Fires to cone 6 - 10 on UK 13 A or 30 A circuits depending on size. The most common path into kiln firing for home studios.' },
  { slug: 'electric-kiln-medium', name: 'Electric kiln, medium', category: 'appliance', aliases: [], isPurchasable: true, typicalPriceGbp: 200000, notes: 'Larger top-loader (around 0.3 m³). Three-phase or 32 A single-phase. Holds a full week of throwing in one firing.' },
  { slug: 'pyrometric-cone', name: 'Pyrometric cone', category: 'other', aliases: ['cone'], isPurchasable: true, typicalPriceGbp: 200, notes: 'Slow-melting refractory cone that bends when its target heat-work is reached. Stack three (one cool, one target, one warning) on the kiln shelf as a witness firing. Cone 06 / 04 / 6 / 10 cover most studio temperatures.' },
  { slug: 'pyrometer', name: 'Pyrometer with thermocouple', category: 'thermometer', aliases: ['kiln thermocouple'], isPurchasable: true, typicalPriceGbp: 8000, notes: 'Digital readout from a type-K thermocouple inside the kiln. Reads temperature directly; pyrometric cones read heat-work (temperature over time), so most studios use both.' },
  { slug: 'kiln-shelf', name: 'Kiln shelf', category: 'other', aliases: ['cordierite shelf'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Refractory shelf that the work sits on inside the kiln. Cordierite for cone 6 - 10 electric firing; silicon carbide for the heavier studio work. Coat with kiln wash before every use.' },
  { slug: 'kiln-post', name: 'Kiln post', category: 'other', aliases: ['kiln furniture post'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Refractory post that supports a kiln shelf. Sets the shelf height; sized in 25-200 mm steps. A handful of each size covers most loading patterns.' },

  // Safety
  { slug: 'n95-mask', name: 'N95 mask', category: 'other', aliases: ['dust mask', 'P2 mask'], isPurchasable: true, typicalPriceGbp: 500, notes: 'Disposable particulate respirator. The minimum for any clay or glaze handling. Replace whenever it gets damp or visibly soiled.' },
  { slug: 'p100-respirator', name: 'P100 respirator', category: 'other', aliases: ['half-face respirator', 'silica mask'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Reusable half-face mask with replaceable P100 cartridges. Required for raw silica, kaolin, feldspar, heavy-metal oxide handling. Fit-test before relying on the seal.' },
  { slug: 'studio-apron', name: 'Studio apron', category: 'other', aliases: ['pottery apron'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Heavy cotton or canvas apron dedicated to studio use. Washed separately from kitchen and household laundry to keep clay dust out of the rest of the house.' },
  { slug: 'mixing-bucket-dedicated', name: 'Mixing bucket (dedicated)', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 600, notes: 'A plastic bucket reserved for clay or glaze mixing — never shared with food, paint, or household cleaning. Label clearly and store in the studio.' },
  { slug: 'wet-cleanup-kit', name: 'Wet cleanup kit', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Sponge, bucket, and dedicated mop for studio wet-mopping. Dry sweeping aerosols silica dust; the only safe cleanup is wet.' },
  { slug: 'fire-extinguisher-a', name: 'Fire extinguisher, Class A', category: 'other', aliases: ['fire extinguisher'], isPurchasable: true, typicalPriceGbp: 4000, notes: 'Class A extinguisher (water or foam) within reach of the kiln area. The kiln itself rarely catches fire, but the studio around it (rags, wood ware boards) can.' },

  // ── Paper & word pipeline (phase_paper_word_pipeline_scaffold).
  // Tools + consumable materials for bookbinding, calligraphy, papermaking,
  // marbling, papercutting, origami, journalling-craft, zines, scrapbooking.
  // The `Tool` table doubles as the supplies registry for craft categories
  // (per the herbal + crochet precedents); papers, inks, threads, adhesives
  // all live here alongside the hard tools.

  // Papers
  { slug: 'cartridge-paper-90', name: 'Cartridge paper, 90 gsm', category: 'other', aliases: ['drawing paper'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Lightweight cartridge for sketching and journalling spreads. Too light for ink-and-wash without buckling.' },
  { slug: 'cartridge-paper-130', name: 'Cartridge paper, 130 gsm', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1000, notes: 'The all-round home-studio paper for calligraphy practice, journalling, and bullet-journal pages.' },
  { slug: 'cartridge-paper-220', name: 'Cartridge paper, 220 gsm', category: 'other', aliases: ['heavyweight cartridge'], isPurchasable: true, typicalPriceGbp: 1400, notes: 'Heavy cartridge for finished calligraphy work and book signatures that take ink without bleed-through.' },
  { slug: 'watercolour-paper-coldpress', name: 'Watercolour paper, cold-press (NOT)', category: 'other', aliases: ['NOT paper'], isPurchasable: true, typicalPriceGbp: 1800, notes: 'Cold-press, mildly textured. 200-300 gsm range. The default watercolour-paper surface; "NOT" = "not hot-pressed".' },
  { slug: 'watercolour-paper-hotpress', name: 'Watercolour paper, hot-press', category: 'other', aliases: ['HP paper'], isPurchasable: true, typicalPriceGbp: 2000, notes: 'Smooth surface; better for calligraphy with watercolour or gouache than cold-press.' },
  { slug: 'tracing-paper', name: 'Tracing paper', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 600, notes: 'For transferring letterforms onto a finished sheet, and as a hand-guard under the pen.' },
  { slug: 'vellum-paper', name: 'Vellum paper', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Translucent paper (not the animal-skin vellum). For overlay pages and decorative wraps.' },
  { slug: 'washi-kozo', name: 'Washi — kozo', category: 'other', aliases: ['kozo paper', 'mulberry paper'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Long-fibre Japanese paper from paper-mulberry bark. The strongest of the three traditional washi fibres; the default for restoration mending and Japanese stab-binding endpapers.' },
  { slug: 'washi-gampi', name: 'Washi — gampi', category: 'other', aliases: ['gampi paper'], isPurchasable: true, typicalPriceGbp: 1800, notes: 'Fine, lustrous Japanese paper from the gampi shrub. Sized naturally; takes ink without bleed.' },
  { slug: 'washi-mitsumata', name: 'Washi — mitsumata', category: 'other', aliases: ['mitsumata paper'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Soft, absorbent Japanese paper from the mitsumata shrub. Warm-toned; used for printmaking and book pages.' },
  { slug: 'bookbinding-board-1-5mm', name: 'Bookbinding board, 1.5 mm', category: 'other', aliases: ['grey board, 1.5 mm'], isPurchasable: true, typicalPriceGbp: 600, notes: 'Light-weight binders board for pamphlet covers and smaller-format journals.' },
  { slug: 'bookbinding-board-2mm', name: 'Bookbinding board, 2 mm', category: 'other', aliases: ['grey board, 2 mm'], isPurchasable: true, typicalPriceGbp: 800, notes: 'The standard binders-board weight for A5 and A6 case-bound books.' },
  { slug: 'bookbinding-board-3mm', name: 'Bookbinding board, 3 mm', category: 'other', aliases: ['grey board, 3 mm'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Heavy binders board for large-format and long-life bindings.' },
  { slug: 'endpaper-stock', name: 'Endpaper stock', category: 'other', aliases: ['endsheets'], isPurchasable: true, typicalPriceGbp: 700, notes: 'A heavier sheet (~120-140 gsm) for the first and last folded pair of a case-bound book. Marbled paper, plain coloured stock, or matched cartridge.' },
  { slug: 'marbling-paper-alum', name: 'Marbling paper, alum-mordanted', category: 'other', aliases: ['mordanted paper'], isPurchasable: true, typicalPriceGbp: 500, notes: 'Paper pre-sized with alum to receive the marbled pattern. Sized at home with a sponge or roller; commercial pre-mordanted sheets also exist.' },

  // Inks + writing fluids
  { slug: 'sumi-ink', name: 'Sumi ink', category: 'other', aliases: ['Japanese ink', 'bokuju'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Pine-soot or lampblack ink in liquid bottled form. The default ink for suminagashi marbling and East-Asian-tradition calligraphy.' },
  { slug: 'walnut-ink', name: 'Walnut ink', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 800, notes: 'Warm-brown natural ink made from walnut husks. Period-appropriate for Italic and Spencerian; less waterproof than carbon inks.' },
  { slug: 'iron-gall-ink', name: 'Iron-gall ink (modern formulation)', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Tannin-iron ink in a modern non-corrosive blend. The historical iron-gall ink ate through period manuscripts; modern formulations are buffered. For dip-pen work on sized paper.' },
  { slug: 'calligraphy-gouache', name: 'Calligraphy gouache', category: 'other', aliases: ['designers gouache'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'For pointed-pen colour work — thinned with distilled water to ink consistency. Stays in the nib better than acrylic.' },
  { slug: 'gum-sandarac', name: 'Gum sandarac', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1000, notes: 'Powdered tree resin dusted on paper to prevent ink bleed on absorbent surfaces. Period-appropriate paper-prep for calligraphy.' },

  // Adhesives
  { slug: 'pva-acid-free', name: 'PVA, acid-free', category: 'other', aliases: ['archival PVA'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Polyvinyl-acetate adhesive in an acid-free formulation. The default bookbinding adhesive for long-life work.' },
  { slug: 'pva-regular', name: 'PVA, regular', category: 'other', aliases: ['white glue'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Standard PVA for non-archival journals and zines. School-grade is fine for casual work.' },
  { slug: 'wheat-paste', name: 'Wheat-paste (cooked)', category: 'other', aliases: ['flour paste'], isPurchasable: true, typicalPriceGbp: 0, notes: 'Cooked at home from flour + water. Reversible, archival when made cleanly. The traditional bookbinding adhesive in the Japanese stab-binding and conservation traditions.' },
  { slug: 'methyl-cellulose', name: 'Methyl cellulose', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 800, notes: 'Powder mixed with water to a brushable paste. Acid-free, reversible, slow-tack — preferred for conservation work.' },
  { slug: 'japanese-rice-paste', name: 'Japanese rice paste', category: 'other', aliases: ['nori paste'], isPurchasable: true, typicalPriceGbp: 700, notes: 'Cooked rice-starch paste. The traditional washi-mending adhesive.' },

  // Marbling materials
  { slug: 'carrageenan', name: 'Carrageenan (marbling size)', category: 'other', aliases: ['Irish moss'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Seaweed-derived gel that thickens the water in a marbling tray. The viscous "size" that holds the pigments on the surface for combing.' },
  { slug: 'alum-potash', name: 'Alum, potash (mordant)', category: 'other', aliases: ['potassium aluminium sulphate'], isPurchasable: true, typicalPriceGbp: 600, notes: 'The mordant brushed onto paper before marbling. Holds the pigment onto the sheet once lifted from the size.' },
  { slug: 'marbling-acrylic-liquid', name: 'Marbling acrylic, liquid', category: 'other', aliases: ['Boku-undo', 'liquid acrylic'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Pre-thinned liquid acrylic for carrageenan-bath marbling.' },
  { slug: 'ox-gall', name: 'Ox-gall (marbling)', category: 'other', aliases: ['surfactant'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Surfactant added drop-by-drop to marbling pigments to control spread on the size. Traditional formulation.' },
  { slug: 'oil-marbling-turpentine', name: 'Turpentine + linseed oil (marbling thinner)', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1000, notes: 'For oil-on-water marbling only. Always work ventilated; dispose of solvent-soaked rags in a sealed tin.' },

  // Threads + bookbinding fittings
  { slug: 'bookbinding-thread-linen', name: 'Bookbinding thread, linen (waxed)', category: 'other', aliases: ['waxed linen'], isPurchasable: true, typicalPriceGbp: 600, notes: 'Strong, low-stretch waxed linen thread. The default for sewing signatures together in case-bound books. 4-cord is the workhorse weight.' },
  { slug: 'beeswax-block', name: 'Beeswax block', category: 'other', aliases: ['thread wax'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Pure beeswax block for waxing un-waxed thread before sewing. Run the thread through twice — wax stops the thread fraying.' },
  { slug: 'book-cloth', name: 'Book cloth', category: 'other', aliases: ['buckram'], isPurchasable: true, typicalPriceGbp: 1800, notes: 'Cotton or linen cloth backed with starch or paper for case binding. Buckram is the heavy-duty variant for long-life work.' },
  { slug: 'cotton-tape-headband', name: 'Cotton tape (headband)', category: 'other', aliases: ['headband cloth'], isPurchasable: true, typicalPriceGbp: 500, notes: 'Stripe-woven cotton tape glued at the head and tail of a case-bound spine. Decorative and structural.' },

  // Origami papers
  { slug: 'kami-15cm', name: 'Kami origami paper, 15 cm', category: 'other', aliases: ['origami paper'], isPurchasable: true, typicalPriceGbp: 500, notes: 'The standard origami paper — thin, coloured one side and white the other, 15×15 cm. The default for most folded models.' },
  { slug: 'kami-20cm', name: 'Kami origami paper, 20 cm', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 700, notes: 'Larger kami for models with many layers, where the 15 cm sheet would get too thick.' },
  { slug: 'origami-washi', name: 'Origami washi', category: 'other', aliases: ['washi origami paper'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Long-fibre Japanese paper sold in origami squares. Holds creases sharply, takes wet-folding.' },
  { slug: 'origami-foil-backed', name: 'Foil-backed origami paper', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 800, notes: 'Thin paper bonded to a thin foil. Holds shape well; good for sculptural models. Doesn\'t soften with wet-folding.' },
  { slug: 'origami-duo-paper', name: 'Duo origami paper', category: 'other', aliases: ['two-sided origami paper'], isPurchasable: true, typicalPriceGbp: 700, notes: 'Coloured on both sides — different colours each side. For models where both faces show in the final figure.' },

  // Cutting tools
  { slug: 'craft-knife', name: 'Craft knife', category: 'knife', aliases: ['X-Acto knife', 'scalpel'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Pen-style precision knife (X-Acto No. 1 or similar) with replaceable No. 11 blades. The default cutting tool for paper crafts. Always work on a cutting mat.' },
  { slug: 'craft-knife-blades-11', name: 'Craft knife blades, No. 11', pluralName: 'craft knife blades', category: 'knife', aliases: ['No. 11 blades', 'X-Acto blades'], isPurchasable: true, typicalPriceGbp: 600, notes: 'Pointed straight-edge blades for the standard craft knife. Change at the first sign of dulling — blunt blades skid and cause injuries.' },
  { slug: 'scalpel-10a', name: 'Scalpel, 10A', category: 'knife', aliases: ['surgical scalpel'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Surgical-style scalpel with detachable blades. Finer than a craft knife for intricate papercutting (scherenschnitte, jianzhi).' },
  { slug: 'cutting-mat-a4', name: 'Self-healing cutting mat, A4', category: 'board', aliases: ['cutting mat A4'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'A4 self-healing mat for craft-knife work and rotary cutting. Grid markings help line up cuts.' },
  { slug: 'cutting-mat-a3', name: 'Self-healing cutting mat, A3', category: 'board', aliases: ['cutting mat A3'], isPurchasable: true, typicalPriceGbp: 2200, notes: 'A3 self-healing mat — the all-purpose home-studio size. Big enough for bookbinding cover boards.' },
  { slug: 'cutting-mat-a2', name: 'Self-healing cutting mat, A2', category: 'board', aliases: ['cutting mat A2'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'A2 self-healing mat for large-format papermaking and double-A4 bookbinding work.' },
  { slug: 'metal-ruler-15cm', name: 'Metal ruler, 15 cm', category: 'measuring', aliases: ['stainless ruler, 15 cm'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Short metal ruler for fine cutting. Cork-backed types stay put on paper.' },
  { slug: 'metal-ruler-30cm', name: 'Metal ruler, 30 cm', category: 'measuring', aliases: ['stainless ruler, 30 cm'], isPurchasable: true, typicalPriceGbp: 600, notes: '30 cm metal ruler — the workhorse for paper-craft cutting. Use as the cutting edge for the craft knife.' },
  { slug: 'metal-ruler-60cm', name: 'Metal ruler, 60 cm', category: 'measuring', aliases: ['steel rule, 60 cm'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Long metal rule for trimming book block edges and large-format papermaking work.' },
  { slug: 'board-cutter-guillotine', name: 'Board cutter / guillotine (optional)', category: 'board', aliases: ['paper cutter', 'guillotine cutter'], isPurchasable: true, typicalPriceGbp: 8000, notes: 'Lever-arm or rotary-blade board cutter. Optional — a sharp craft knife and steel rule do the same job for home-scale work.' },
  { slug: 'hole-punch-single', name: 'Hole punch, single', category: 'other', aliases: ['paper punch'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Single-hole punch for piercing sewing stations in lightweight bindings.' },

  // Folding tools
  { slug: 'bone-folder', name: 'Bone folder', category: 'other', aliases: ['folder'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Smooth burnishing tool, traditionally cattle bone, now also Teflon. The bookbinder\'s most-used tool — for scoring folds, burnishing creases, smoothing covers.' },
  { slug: 'teflon-folder', name: 'Teflon folder', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Plastic folder less likely than cattle bone to mark dark or coloured papers. Slightly flexible.' },
  { slug: 'japanese-folding-bone', name: 'Japanese folding bone', category: 'other', aliases: ['hera'], isPurchasable: true, typicalPriceGbp: 900, notes: 'Slim, tapered folder for sharp creases on washi and other thin papers.' },
  { slug: 'scoring-tool', name: 'Scoring tool', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 600, notes: 'Blunt-pointed tool for scoring fold lines on card and heavy paper. A dry ballpoint or the back of a craft-knife blade also works.' },

  // Calligraphy tools
  { slug: 'nib-mitchell-roundhand-0', name: 'Mitchell Roundhand nib, 0 (broadest)', category: 'utensil', aliases: ['Mitchell 0'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Broad-edge dip-pen nib in the largest of the Mitchell Roundhand series. For large display calligraphy.' },
  { slug: 'nib-mitchell-roundhand-3', name: 'Mitchell Roundhand nib, 3 (medium)', category: 'utensil', aliases: ['Mitchell 3'], isPurchasable: true, typicalPriceGbp: 300, notes: 'Mid-range Mitchell Roundhand broad-edge nib. The default for Foundational practice at ~4 nib-widths x-height.' },
  { slug: 'nib-mitchell-roundhand-6', name: 'Mitchell Roundhand nib, 6 (finest)', category: 'utensil', aliases: ['Mitchell 6'], isPurchasable: true, typicalPriceGbp: 300, notes: 'Finest of the Mitchell Roundhand broad-edge series. For small text and exemplar work.' },
  { slug: 'nib-brause-bandzug', name: 'Brause Bandzug nib', category: 'utensil', aliases: ['Bandzug'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Stiff broad-edge nib favoured for German hands and harder pressure work. Wider series than Mitchell.' },
  { slug: 'nib-nikko-g', name: 'Nikko G nib', category: 'utensil', aliases: ['Nikko-G', 'manga nib'], isPurchasable: true, typicalPriceGbp: 300, notes: 'Stiff pointed nib — easier to control than vintage pointed nibs. The default modern Copperplate / Spencerian practice nib.' },
  { slug: 'nib-hunt-101', name: 'Hunt 101 nib', category: 'utensil', aliases: ['Hunt Imperial 101'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Highly flexible pointed nib for advanced Copperplate and Spencerian work. Steeper learning curve than the Nikko G.' },
  { slug: 'nib-gillott-303', name: 'Gillott 303 nib', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 400, notes: 'Very fine, very flexible pointed nib for fine Copperplate. Period-style; less forgiving than Hunt 101.' },
  { slug: 'nib-brause-ef66', name: 'Brause EF66 nib', category: 'utensil', aliases: ['EF66'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Very fine pointed nib for tight Copperplate hairlines. Holds a lot of ink for its size.' },
  { slug: 'oblique-pen-holder', name: 'Oblique pen holder', category: 'utensil', aliases: ['oblique holder'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Pen holder with a side-mounted flange. The conventional Copperplate / Spencerian holder for right-handed writers — the flange angles the nib to ~55° from the baseline.' },
  { slug: 'straight-pen-holder', name: 'Straight pen holder', category: 'utensil', aliases: ['holder'], isPurchasable: true, typicalPriceGbp: 500, notes: 'Plain wooden pen holder for broad-edge nibs and brush pens.' },
  { slug: 'brush-pen', name: 'Brush pen', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 500, notes: 'Cartridge brush pen for warm-up exercises and brush-formed Roman capitals. Not the same as a felt-tip "brush marker" — this is a true brush tip.' },
  { slug: 'fude-brush', name: 'Fude brush', category: 'utensil', aliases: ['Japanese brush', 'shodo brush'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Japanese brush in the shodo tradition. For East-Asian calligraphy and brush-formed Roman capitals.' },

  // Bookbinding tools
  { slug: 'bookbinding-awl', name: 'Bookbinding awl', category: 'other', aliases: ['piercing awl', 'pricking awl'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Sharp metal point in a wooden handle for piercing sewing stations through a folded signature. Hold vertical; cradle the signature in a piercing jig.' },
  { slug: 'bookbinding-needle', name: 'Bookbinding needle', pluralName: 'bookbinding needles', category: 'other', aliases: ['blunt needle', 'binders needle'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Blunt-tip needle large enough to take 4-cord linen thread. Pierces only where the awl has already made a hole — the awl does the cutting; the needle carries the thread.' },
  { slug: 'book-press', name: 'Book press / nipping press', category: 'other', aliases: ['nipping press'], isPurchasable: true, typicalPriceGbp: 6000, notes: 'Cast-iron or steel nipping press for compressing freshly sewn text blocks and gluing cases. A DIY plywood-and-bolts version works for home-scale binding.' },
  { slug: 'finishing-press', name: 'Finishing press', category: 'other', aliases: ['lying press'], isPurchasable: true, typicalPriceGbp: 8000, notes: 'Wooden press that holds a book by its spine while the edges are trimmed, rounded, or decorated.' },
  { slug: 'plough-cutter', name: 'Plough (board cutter)', category: 'other', aliases: ['bookbinder\'s plough'], isPurchasable: true, typicalPriceGbp: 12000, notes: 'Hand-cranked blade carriage that runs along a finishing press to trim a text-block\'s foredge. Advanced equipment — most home binders trim with a knife and rule.' },
  { slug: 'headband-form', name: 'Headband form', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 800, notes: 'A core (rolled paper, leather, or cane) sewn over with coloured silks to make a decorative headband at the spine top and bottom.' },

  // Marbling tools
  { slug: 'marbling-tray', name: 'Marbling tray', category: 'tray', aliases: ['marbling bath'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Shallow tray, at least the size of the largest paper you intend to marble. A clean food-storage tub serves at home-scale.' },
  { slug: 'marbling-stylus', name: 'Marbling stylus', category: 'utensil', aliases: ['turkey-baster nib', 'marbling pick'], isPurchasable: true, typicalPriceGbp: 500, notes: 'A pointed implement for drawing patterns in the size — a turkey-baster-nibbed dropper, a long darning needle, or a wooden skewer.' },
  { slug: 'marbling-comb', name: 'Marbling comb', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1200, notes: 'A wooden bar with evenly spaced pins or nails. For combing repeating patterns (nonpareil, bouquet) into laid colours. Easy to DIY from a wooden batten and finishing nails.' },
  { slug: 'eyedropper', name: 'Eyedropper / pipette', category: 'measuring', aliases: ['pipette'], isPurchasable: true, typicalPriceGbp: 300, notes: 'Glass or plastic dropper for adding pigment drops to a marbling tray. One per colour to avoid contamination.' },

  // Papermaking tools
  { slug: 'paper-mould-deckle-a5', name: 'Paper mould + deckle, A5', category: 'other', aliases: ['mould and deckle, A5'], isPurchasable: true, typicalPriceGbp: 4000, notes: 'Wooden frame (the mould) with a fine mesh, plus a matching upper frame (the deckle) that defines the sheet edge. A5 size for small-format papermaking.' },
  { slug: 'paper-mould-deckle-a4', name: 'Paper mould + deckle, A4', category: 'other', aliases: ['mould and deckle, A4'], isPurchasable: true, typicalPriceGbp: 5500, notes: 'A4 mould + deckle. The default size for home-studio sheet forming.' },
  { slug: 'paper-mould-deckle-a3', name: 'Paper mould + deckle, A3', category: 'other', aliases: ['mould and deckle, A3'], isPurchasable: true, typicalPriceGbp: 8000, notes: 'A3 mould + deckle. Wide enough for the longer face of a folded A4 sheet (so two A5 pages per sheet).' },
  { slug: 'couching-cloth', name: 'Couching cloth', pluralName: 'couching cloths', category: 'other', aliases: ['j-cloth', 'felt couch'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Non-fluffing absorbent cloth — wool felt, kitchen J-cloth, or a tight-weave linen — that the freshly pulled sheet is laid onto for pressing.' },
  { slug: 'papermaking-blender', name: 'Papermaking blender (dedicated)', category: 'appliance', aliases: ['pulp blender'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'A dedicated kitchen blender reserved for pulping paper fibre. Don\'t use a kitchen blender that\'s also for food — paper fibres aren\'t food-safe to ingest.' },
  { slug: 'papermaking-press-boards', name: 'Press boards', pluralName: 'press boards', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1500, notes: 'A pair of plywood boards (8 mm or thicker) used to press a stack of couched sheets between heavy weights to expel water. The traditional sheet-pressing setup.' },
  { slug: 'papermaking-sponge', name: 'Papermaking sponge', category: 'utensil', aliases: [], isPurchasable: true, typicalPriceGbp: 300, notes: 'Soft household sponge for blotting water from a couched sheet before lifting the mould.' },
  { slug: 'papermaking-vat', name: 'Papermaking vat', category: 'other', aliases: ['pulp vat'], isPurchasable: true, typicalPriceGbp: 2000, notes: 'A wide, low-sided tub that holds the dilute pulp slurry the sheet is pulled from. Storage box, washing-up bowl, or dedicated trough — needs to be wider than the mould.' },

  // Origami tools
  { slug: 'origami-bone-folder-mini', name: 'Mini bone folder (origami)', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 500, notes: 'Smaller bone folder for sharpening creases in folded origami models. The full-size bookbinder\'s folder works too.' },

  // ── Fibre arts pipeline (phase_fibre_arts_pipeline_setup).
  // Spinning, weaving, felting, dyeing, macramé, rug-making toolkits.
  // Materials (wool roving, mordants, dye plants) live in the master
  // CraftMaterial table under `craft = "fibre-arts"`; the tools below
  // are the durable maker kit.

  // Spinning — spindles, wheels, niddy-noddies, fibre-prep tools.
  { slug: 'drop-spindle-top-whorl', name: 'Drop spindle, top-whorl', category: 'other', aliases: ['top-whorl spindle'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Lightweight wooden spindle with the whorl above the shaft. The default first-spindle for most learners; spins fine yarn well.' },
  { slug: 'drop-spindle-bottom-whorl', name: 'Drop spindle, bottom-whorl', category: 'other', aliases: ['bottom-whorl spindle'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Spindle with the whorl below the shaft. Heavier whorl gives more spin momentum; suits longer-draw spinning.' },
  { slug: 'supported-spindle', name: 'Supported spindle', category: 'other', aliases: ['Tibetan spindle', 'tahkli'], isPurchasable: true, typicalPriceGbp: 2000, notes: 'Spindle that rests in a small bowl while spinning. The default for very fine, short-staple fibres (cotton, cashmere); also the cultural-traditional spindle across Andean + Tibetan + Indian textile communities.' },
  { slug: 'spinning-wheel-saxony', name: 'Saxony spinning wheel', category: 'other', aliases: ['horizontal spinning wheel'], isPurchasable: true, typicalPriceGbp: 60000, notes: 'Horizontal-orifice wheel with a single drive band. The classical Western spinning wheel. Substantial investment; works with bobbin-led, flyer-led, or double-drive setups.' },
  { slug: 'spinning-wheel-castle', name: 'Castle spinning wheel', category: 'other', aliases: ['upright spinning wheel'], isPurchasable: true, typicalPriceGbp: 50000, notes: 'Vertical-orifice wheel — the flyer sits above the wheel. Compact footprint compared with the Saxony.' },
  { slug: 'spinning-wheel-e-spinner', name: 'E-spinner (electric spinning wheel)', category: 'electrical', aliases: ['electric spinner'], isPurchasable: true, typicalPriceGbp: 50000, notes: 'Battery- or mains-powered spinner with motorised flyer. Useful for spinners with treadling-fatigue issues; works the same as a treadle wheel for the draftee.' },
  { slug: 'niddy-noddy', name: 'Niddy-noddy', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 2000, notes: 'Wooden H-frame for winding finished singles or ply off the bobbin into a hank of a known circumference (usually 1.5 m). The wpi-and-yardage measuring tool.' },
  { slug: 'swift', name: 'Yarn swift', category: 'other', aliases: ['umbrella swift'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Adjustable wooden frame that holds a hank of yarn open while it is wound into a ball or cake. Clamps to a table edge.' },
  { slug: 'ball-winder', name: 'Ball winder', category: 'other', aliases: ['yarn winder'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Hand-cranked winder that turns a hank (held on a swift) into a centre-pull cake.' },
  { slug: 'hand-cards', name: 'Hand cards', pluralName: 'hand cards', category: 'other', aliases: ['carders'], isPurchasable: true, typicalPriceGbp: 4000, notes: 'A pair of paddle-shaped wire-toothed cards for opening up clean fleece into a rolag ready for spinning. The starter fibre-prep tool.' },
  { slug: 'drum-carder', name: 'Drum carder', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 25000, notes: 'Hand-cranked drum carder for larger fibre-prep volumes. Two licker drums covered with carding cloth; produces a wide batt rather than rolags.' },
  { slug: 'blending-board', name: 'Blending board', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 8000, notes: 'Flat carding-cloth-covered board for laying coloured fibres in stripes and rolling off rolags. The artist-spinner\'s palette tool.' },
  { slug: 'hackle', name: 'Hackle (spinning)', category: 'other', aliases: ['fibre hackle'], isPurchasable: true, typicalPriceGbp: 6000, notes: 'Forest of long upright steel teeth in a wooden base. Strips combed fibre off into top — parallel-fibre preparation for worsted spinning.' },
  { slug: 'wool-combs', name: 'Wool combs', pluralName: 'wool combs', category: 'other', aliases: ['English combs', 'mini combs'], isPurchasable: true, typicalPriceGbp: 8000, notes: 'Two-row or four-row long-tooth combs for worsted fibre prep. Held in pairs; one combs onto the other to align staples and strip short fibres + vegetable matter.' },

  // Weaving — looms, shuttles, reeds, warping aids.
  { slug: 'frame-loom', name: 'Frame loom (weaving)', category: 'other', aliases: ['tapestry frame loom', 'lap loom'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Simple stretched-warp frame for tapestry weaving. The starter weaving setup — works flat on a table or held in the lap. No moving parts; sheds opened by a shed stick.' },
  { slug: 'rigid-heddle-loom', name: 'Rigid heddle loom', category: 'other', aliases: ['rigid heddle'], isPurchasable: true, typicalPriceGbp: 18000, notes: 'Compact loom with a single rigid heddle (combined heddle + reed). Two sheds, plain weave and pick-up patterns. The best intermediate step between frame loom and floor loom.' },
  { slug: 'floor-loom-4-shaft', name: 'Four-shaft floor loom', category: 'other', aliases: ['four-harness loom', 'jack loom'], isPurchasable: true, typicalPriceGbp: 80000, notes: 'Treadle-and-shaft floor loom. Four shafts give 14 distinct weave structures from straight-draw threadings alone; jack-action looms are the home-studio standard.' },
  { slug: 'tapestry-loom-upright', name: 'Upright tapestry loom', category: 'other', aliases: ['high-warp tapestry loom'], isPurchasable: true, typicalPriceGbp: 20000, notes: 'Vertical-warp loom for tapestry weaving. Larger than the frame loom; freestanding floor frame. Aubusson-style tapestry tradition.' },
  { slug: 'inkle-loom', name: 'Inkle loom', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 7000, notes: 'Compact narrow-band loom for warp-faced bands. Wooden pegs route the warp through a single set of string heddles; suits belts, straps, trims.' },
  { slug: 'tablet-weaving-cards', name: 'Tablet-weaving cards', pluralName: 'tablet-weaving cards', category: 'other', aliases: ['cards', 'tablets'], isPurchasable: true, typicalPriceGbp: 600, notes: 'Square cards (typically 30-40 of them) threaded at the four corners; turning the deck changes the shed. The card-weaving setup; pair with an inkle loom or two C-clamps and a doorway.' },
  { slug: 'tapestry-shuttle', name: 'Tapestry shuttle', category: 'other', aliases: ['butterfly shuttle'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Small flat shuttle (or hand-wound butterfly) for laying single picks of tapestry weft into a small area.' },
  { slug: 'boat-shuttle', name: 'Boat shuttle', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1800, notes: 'Floor-loom shuttle carrying a small bobbin (quill) of weft. Throws cleanly across the warp; the standard four-shaft shuttle.' },
  { slug: 'stick-shuttle', name: 'Stick shuttle', category: 'other', aliases: ['flat shuttle'], isPurchasable: true, typicalPriceGbp: 600, notes: 'Long flat shuttle wound with weft along its length. The default rigid-heddle shuttle.' },
  { slug: 'end-feed-shuttle', name: 'End-feed shuttle', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Floor-loom shuttle that feeds weft from the end of a pirn (rather than from a centre quill). Constant tension across the pick; favoured for fine weaving.' },
  { slug: 'weaving-reed', name: 'Weaving reed', category: 'other', aliases: ['weaving comb', 'rigid heddle reed'], isPurchasable: true, typicalPriceGbp: 4000, notes: 'Metal-toothed bar that sets the warp sett (threads per cm) and beats the weft into the cloth. Floor looms use interchangeable reeds (8-, 10-, 12-, 15-dent per inch); rigid-heddle reeds combine heddle + reed in one piece.' },
  { slug: 'weaving-heddles', name: 'Weaving heddles', pluralName: 'weaving heddles', category: 'other', aliases: ['string heddles', 'metal heddles'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Loops of wire or string with an eye in the middle, mounted on a shaft. Each warp thread passes through one heddle; the shaft lifts the heddles on demand to open the shed.' },
  { slug: 'raddle', name: 'Raddle', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 3500, notes: 'Toothed bar clamped to the back beam during warping. Spreads the warp at the right sett before beaming.' },
  { slug: 'warping-board', name: 'Warping board', category: 'other', aliases: ['warping mill'], isPurchasable: true, typicalPriceGbp: 6000, notes: 'Pegged board (or rotating mill) for measuring out the warp threads at a known length before dressing the loom.' },
  { slug: 'tapestry-comb', name: 'Tapestry comb', category: 'other', aliases: ['beater'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Hand-held weighted comb for beating tapestry weft down firmly between picks. The frame-loom + upright-loom beater.' },

  // Felting — needles, mats, soaps, palm fitters.
  { slug: 'felting-needles-36', name: 'Felting needles, size 36 (coarse)', pluralName: 'felting needles', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 500, notes: 'Coarse barbed needle for initial shape-building in needle felting. Pack of five — needles break easily on hard cores.' },
  { slug: 'felting-needles-38', name: 'Felting needles, size 38 (medium)', pluralName: 'felting needles', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 500, notes: 'Medium-gauge barbed needle for general needle-felting work. The all-rounder; size 38 triangular is the most-used needle.' },
  { slug: 'felting-needles-40', name: 'Felting needles, size 40 (fine)', pluralName: 'felting needles', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 500, notes: 'Fine barbed needle for surface detail and finishing in needle felting. Less aggressive than 36/38; smoother finish.' },
  { slug: 'felting-mat', name: 'Felting mat (foam pad)', category: 'other', aliases: ['felting pad', 'foam felting block'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Dense foam block (or burlap-covered cushion) that catches the needle on the underside of the work. The needle-felter\'s anvil.' },
  { slug: 'palm-fitter-felting', name: 'Palm fitter (felting)', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 600, notes: 'Padded leather palm-shield worn while wet-felting to protect the palm during long rubbing sessions. Optional but eases longer felt-rolling.' },
  { slug: 'bamboo-rolling-mat', name: 'Bamboo rolling mat', category: 'other', aliases: ['felting rolling mat'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Bamboo or reed slat mat used to roll wet-felted layouts into a sausage and felt by rolling. Larger version of a sushi mat.' },
  { slug: 'olive-oil-soap-felting', name: 'Olive-oil soap bar (felting)', category: 'other', aliases: ['Aleppo soap', 'castile bar'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Mild olive-oil soap bar rubbed across the surface to soap the wet roving. The traditional wet-felting soap — gentler on fibre than detergent.' },
  { slug: 'felting-net', name: 'Felting net', category: 'other', aliases: ['tulle (felting)'], isPurchasable: true, typicalPriceGbp: 300, notes: 'Fine mesh laid over the wet roving before rubbing — stops the surface from disturbing while you work the fibres together. Tulle or a nylon curtain offcut both work.' },

  // Dyeing — pots, thermometers, gloves (dedicated to dye-work only).
  { slug: 'dye-pot-stainless', name: 'Dye-pot, stainless steel (dedicated)', category: 'pot', aliases: ['dye pot'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Large stainless-steel pot reserved for dye work only — once it has held mordant, it never returns to food use. 6-10 L capacity covers most home batches.' },
  { slug: 'dye-pot-enamelled', name: 'Dye-pot, enamelled steel (dedicated)', category: 'pot', aliases: [], isPurchasable: true, typicalPriceGbp: 4000, notes: 'Enamelled-steel pot — inert in the dye-bath, easy to clean. Same dedicated-use rule as the stainless variant.' },
  { slug: 'dye-thermometer', name: 'Dye-pot thermometer (dedicated)', category: 'thermometer', aliases: [], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Probe thermometer reserved for dye work. Reads 0-100°C; never returned to food use.' },
  { slug: 'ph-strips', name: 'pH strips', pluralName: 'pH strips', category: 'measuring', aliases: ['pH paper'], isPurchasable: true, typicalPriceGbp: 600, notes: 'Strip-test pH indicator papers (0-14 range). For checking indigo-vat reduction and dye-bath alkalinity. Cheap, single-use, fine for home-scale.' },
  { slug: 'dyeing-gloves-long', name: 'Long rubber gloves (dyeing)', pluralName: 'long rubber gloves', category: 'other', aliases: ['gauntlet gloves'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Long-cuff rubber or nitrile gloves to mid-forearm — mandatory for iron and copper mordant work. Standard washing-up gloves are too short for safe lifting from a hot dye-pot.' },
  { slug: 'dyeing-apron', name: 'Apron (dyeing-dedicated)', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 2000, notes: 'Apron reserved for dye work — will stain. Heavy cotton or canvas; full-front coverage.' },
  { slug: 'mordant-jar', name: 'Mordant storage jar', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 600, notes: 'Sealed glass jar for storing leftover mordant baths between dye sessions. Label clearly; keep away from food storage; never re-use the jar for food.' },
  { slug: 'indigo-vat', name: 'Indigo vat (large bucket)', category: 'other', aliases: ['fermentation vat'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'A 10-15 L lidded plastic or ceramic bucket for an indigo reduction vat. Dedicated — once the vat is going, it stays that way for weeks at a time.' },
  { slug: 'eco-print-bundling-cord', name: 'Eco-print bundling cord', category: 'other', aliases: ['bundling string'], isPurchasable: true, typicalPriceGbp: 200, notes: 'Natural-fibre cord (cotton or jute) used to bind eco-print bundles tightly before steaming. Synthetic cords can interfere with the plant transfer.' },

  // Macramé — boards, pins, cord measures.
  { slug: 'macrame-board', name: 'Macramé board', category: 'other', aliases: ['knotting board'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Stiff foam-board or cork-board with grid markings for pinning macramé work in progress. A4-A3 size for plant-hanger / small wall-hanging work.' },
  { slug: 'macrame-t-pins', name: 'T-pins, macramé', pluralName: 'T-pins', category: 'other', aliases: ['blocking T-pins'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Rust-resistant T-pins for anchoring cords to the macramé board. The same pins also serve for blocking finished pieces.' },
  { slug: 'macrame-clipboard', name: 'Clipboard (macramé starter)', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 500, notes: 'A heavy-duty clipboard as a starter macramé work-holder. Clip the bundle of cords at the top; knot downward.' },
  { slug: 'cord-measuring-tape', name: 'Cord measuring tape (macramé)', category: 'measuring', aliases: [], isPurchasable: true, typicalPriceGbp: 300, notes: 'A long soft tape (3 m or more) for measuring cut lengths of macramé cord. Most plant hangers need 4-5 m of cord per strand.' },
  { slug: 'macrame-fringe-comb', name: 'Macramé fringe comb', category: 'other', aliases: ['cord comb'], isPurchasable: true, typicalPriceGbp: 400, notes: 'Stiff comb (or a cheap pet-grooming slicker brush) for unbraiding and fluffing macramé cord ends into a soft fringe.' },

  // Rug-making — hooks, frames, backing aids.
  { slug: 'rug-hook', name: 'Rug hook (traditional)', category: 'other', aliases: ['traditional rug hook'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Hand-held barbed hook (or hooked needle in a wooden handle) for pulling wool strips up through a backing fabric. The traditional UK / North American rug-hooking tool.' },
  { slug: 'latch-hook', name: 'Latch hook', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 600, notes: 'Hook with a sprung latch that closes around the yarn for knot-locked rug rows. The classic kit-rug-making tool; works with pre-cut yarn pieces and rug canvas.' },
  { slug: 'rug-punch-needle', name: 'Punch needle (rug-making)', category: 'other', aliases: ['rug punch'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Hollow-shaft needle that pushes yarn through monks-cloth backing in loops. Faster than traditional hooking; the modern "punch-needle rug" tool.' },
  { slug: 'rug-frame', name: 'Rug frame (gripper-edge)', category: 'other', aliases: ['hooking frame'], isPurchasable: true, typicalPriceGbp: 6000, notes: 'Wooden frame with carding-cloth strips along the inside edges that grip the backing fabric taut while you hook. Stand or table-mounted versions exist.' },
  { slug: 'monks-cloth', name: 'Monks-cloth (rug backing)', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Coarse-weave cotton fabric used as backing for punch-needle and modern hooked rugs. Sold by the metre at ~150 cm wide.' },
  { slug: 'rug-canvas', name: 'Rug canvas (latch-hook)', category: 'other', aliases: ['latch-hook canvas'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Open-weave stiff canvas for latch-hook rugs. 3.3 holes per inch is the standard scale; comes pre-cut or off-the-roll.' },
  { slug: 'rag-rug-strip-cutter', name: 'Rag-rug strip cutter', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Rotary cutter with parallel blades that cuts a length of fabric into evenly wide strips for rag-rug making. Sets up for 6-10-12 mm strip widths.' },
  { slug: 'locker-hook', name: 'Locker hook', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 1800, notes: 'Hook-and-eye tool (hook on one end, large needle eye on the other) for locker-hook rugs — pull loops through backing, then thread a locking strand through them to secure.' },
  { slug: 'rug-binding-tape', name: 'Rug binding tape', category: 'other', aliases: [], isPurchasable: true, typicalPriceGbp: 600, notes: 'Heavy cotton tape sewn around the perimeter of a finished rug to bind the cut edge of the backing. 25-50 mm wide; sold by the metre.' },

  // ──────────────────────────────────────────────────────────────────────────
  // Animals & smallholding — beekeeping
  // ──────────────────────────────────────────────────────────────────────────
  { slug: 'hive-tool-j', name: 'Hive tool, J-type', category: 'other', aliases: ['j-hook hive tool'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Flat steel pry-bar with a J-shaped hook at one end for lifting frames clear of the brood chamber. Standard issue for UK beekeepers; the single most-used piece of hive kit.' },
  { slug: 'hive-tool-standard', name: 'Hive tool, flat', category: 'other', aliases: ['frame lifter'], isPurchasable: true, typicalPriceGbp: 900, notes: 'Plain flat hive tool — pry one end, scraper the other. Cheaper and slightly slower than the J-type for lifting frames.' },
  { slug: 'bee-smoker', name: 'Bee smoker', category: 'other', aliases: ['smoker'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Stainless steel canister with a bellows that burns smouldering fuel (hessian, wood chips, pine needles) to calm bees during an inspection. Larger sizes hold a charge for a full apiary visit.' },
  { slug: 'smoker-fuel', name: 'Smoker fuel', pluralName: 'smoker fuel', category: 'other', aliases: ['hessian', 'pine needles'], isPurchasable: true, typicalPriceGbp: 500, notes: 'Untreated hessian, pine needles, dried herbs, or compressed wood-fibre pellets. Burns slowly and cool — never use creosote-treated material or scented fire-lighters.' },
  { slug: 'bee-suit', name: 'Bee suit, full', category: 'other', aliases: ['beekeeper suit', 'apiarist suit'], isPurchasable: true, typicalPriceGbp: 8500, notes: 'Full-length cotton or polycotton suit with integrated veil. The standard beginner kit — full-zip front, elasticated cuffs, ventilated mesh veil.' },
  { slug: 'bee-veil', name: 'Bee veil', category: 'other', aliases: ['hood veil'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Mesh hood for protecting the face and neck during a hive inspection. A veil-only kit (with a long-sleeved shirt) is acceptable for short summer inspections in experienced hands; new beekeepers wear a full suit.' },
  { slug: 'bee-gloves', name: 'Bee gloves', pluralName: 'bee gloves', category: 'other', aliases: ['beekeeping gauntlets'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Long-cuff leather or nitrile gloves with elasticated forearm gauntlets. Leather is the traditional choice; nitrile is easier to wash and discourages bees from working onto the cuff.' },
  { slug: 'bee-brush', name: 'Bee brush', category: 'other', aliases: ['frame brush'], isPurchasable: true, typicalPriceGbp: 600, notes: 'Soft long-bristled brush for sweeping bees off a frame before lifting it clear of the box. Always brush gently upwards — bees panic when brushed onto themselves.' },
  { slug: 'queen-marking-cage', name: 'Queen marking cage', category: 'other', aliases: ['crown of thorns', 'queen catcher'], isPurchasable: true, typicalPriceGbp: 800, notes: 'A short plastic tube with a plunger and fine mesh, used to hold the queen still against a comb for marking with a coloured pen.' },
  { slug: 'queen-marking-pen', name: 'Queen marking pen', category: 'other', aliases: ['posca pen'], isPurchasable: true, typicalPriceGbp: 350, notes: 'Water-based paint pen in the international queen-marking colour for the year (blue / white / yellow / red / green on a 5-year cycle). One dot on the thorax.' },
  { slug: 'hive-feeder-rapid', name: 'Hive feeder, rapid', category: 'other', aliases: ['miller feeder', 'top feeder'], isPurchasable: true, typicalPriceGbp: 1800, notes: 'A square or round plastic top-feeder that sits above the crown board and holds 2-5 L of sugar syrup. Used for autumn feeding and emergency spring feeds.' },
  { slug: 'hive-feeder-contact', name: 'Hive feeder, contact (round)', category: 'other', aliases: ['ashforth feeder', 'bucket feeder'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Inverted bucket with a small perforated lid that delivers syrup by surface tension. Cheap and effective in mild weather; less practical in cold conditions than a rapid feeder.' },
  { slug: 'varroa-mite-board', name: 'Varroa mite board', category: 'other', aliases: ['mite tray', 'varroa floor insert'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'A removable corflute tray that slides under an open-mesh floor to count fallen mites. Leave in for 7 days, count, divide by 7 for the daily mite drop.' },
  { slug: 'honey-extractor-tangential', name: 'Honey extractor, tangential', category: 'appliance', aliases: ['hand extractor', '4-frame extractor'], isPurchasable: true, typicalPriceGbp: 25000, notes: 'A hand-cranked or motorised centrifugal drum that spins honey out of uncapped frames. 4-frame tangential is the standard hobbyist size; flips frames halfway through to spin both sides.' },

  // ──────────────────────────────────────────────────────────────────────────
  // Animals & smallholding — poultry
  // ──────────────────────────────────────────────────────────────────────────
  { slug: 'chicken-feeder', name: 'Chicken feeder, treadle', category: 'other', aliases: ['treadle feeder', 'rat-proof feeder'], isPurchasable: true, typicalPriceGbp: 6500, notes: 'Galvanised steel feeder with a hinged lid the hen steps on to open — keeps rats and wild birds out of the layer pellets. The most theft-resistant feeder design for an open-run flock.' },
  { slug: 'chicken-feeder-hanging', name: 'Chicken feeder, hanging', category: 'other', aliases: ['gravity feeder'], isPurchasable: true, typicalPriceGbp: 2000, notes: 'Plastic or galvanised gravity-fed tube and pan, hung at chicken-breast height. Cheap and simple; not rat-proof, so use inside a closed coop or lift overnight.' },
  { slug: 'chicken-drinker-bucket', name: 'Chicken drinker, automatic bucket', category: 'other', aliases: ['nipple drinker bucket'], isPurchasable: true, typicalPriceGbp: 2500, notes: 'Sealed 5-10 L bucket with horizontal nipple drinkers in the side. Stays clean, refills weekly, freezes far less readily than an open trough.' },
  { slug: 'chicken-drinker-gravity', name: 'Chicken drinker, gravity', category: 'other', aliases: ['gravity drinker', 'standpipe drinker'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Plastic or galvanised gravity drinker — open trough refilled from an inverted reservoir. Easy to clean; gets fouled with bedding faster than nipple drinkers.' },
  { slug: 'nesting-box-rollaway', name: 'Nesting box, rollaway', category: 'other', aliases: ['rollaway nest'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Sloped-floor nest box that rolls each egg into a protected tray once laid — keeps eggs clean and stops egg-eating habits. One box per 3-4 hens.' },
  { slug: 'nesting-box-standard', name: 'Nesting box, standard', category: 'other', aliases: ['nest box'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'Enclosed darkened cubicle, around 30 × 30 × 30 cm, lined with clean straw or wood shavings. One box per 3-4 hens.' },
  { slug: 'coop-perch', name: 'Coop perch', category: 'other', aliases: ['roost', 'roosting bar'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Round-edged horizontal hardwood bar, around 40 mm diameter, fixed at least 60 cm off the floor. Allow 25-30 cm of perch length per bird.' },
  { slug: 'pop-hole-auto-opener', name: 'Pop-hole automatic opener', category: 'other', aliases: ['auto coop door', 'pop hole opener'], isPurchasable: true, typicalPriceGbp: 12000, notes: 'Battery or mains-powered light-sensor or timer that opens the coop pop-hole at dawn and closes it at dusk. The single biggest reducer of fox losses for working-hours owners.' },
  { slug: 'dust-bath-box', name: 'Dust-bath box', category: 'other', aliases: ['dust bath'], isPurchasable: true, typicalPriceGbp: 1500, notes: 'A shallow open-topped box (or repurposed cat-litter tray), filled with dry earth, wood ash, and a handful of diatomaceous earth. Keeps lice and mites in check.' },
  { slug: 'chicken-grit-feeder', name: 'Grit feeder', category: 'other', aliases: ['oyster shell feeder'], isPurchasable: true, typicalPriceGbp: 800, notes: 'Small wall-mounted or hanging trough offering insoluble grit and crushed oyster shell free-choice. Separate from layer feed so birds self-regulate.' },
  { slug: 'leg-band-numbered', name: 'Leg band, numbered', pluralName: 'leg bands', category: 'other', aliases: ['poultry leg ring'], isPurchasable: true, typicalPriceGbp: 100, notes: 'Coloured or numbered plastic spiral band fitted to a chicken’s leg for identification. Used to track individual layers, hatch batches, or who-laid-what during a trial.' },
  { slug: 'broody-coop', name: 'Broody coop', category: 'other', aliases: ['anti-broody crate', 'broody breaker'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'A small wire-floored cage used to break the broody hormone cycle — the cool airflow under the hen disrupts the body-temperature trigger. Three days is usually enough.' },
  { slug: 'chick-brooder-heat-plate', name: 'Chick brooder, heat plate', category: 'electrical', aliases: ['brooder plate', 'electric hen'], isPurchasable: true, typicalPriceGbp: 5500, notes: 'A low-wattage heated plate on adjustable legs that chicks shelter under as they would a broody hen. Far safer than a hanging heat-lamp; lower fire risk, mimics natural rhythm.' },

  // ──────────────────────────────────────────────────────────────────────────
  // Animals & smallholding — sheep, goats, and pigs
  // ──────────────────────────────────────────────────────────────────────────
  { slug: 'hoof-trimmer-sheep', name: 'Hoof trimmer, sheep', category: 'other', aliases: ['foot shears', 'hoof shears'], isPurchasable: true, typicalPriceGbp: 2200, notes: 'Sharp-tipped sprung shears for paring sheep and goat hooves back to level. Replace or sharpen often; blunt shears slip.' },
  { slug: 'drenching-gun', name: 'Drenching gun', category: 'measuring', aliases: ['drench gun', 'dosing gun'], isPurchasable: true, typicalPriceGbp: 3000, notes: 'A graduated trigger-fed dosing gun for delivering oral wormers and supplements over the back of the tongue. Calibrate against the printed dose-rate before each batch.' },
  { slug: 'shepherds-crook', name: 'Shepherd’s crook', category: 'other', aliases: ['crook', 'leg crook', 'neck crook'], isPurchasable: true, typicalPriceGbp: 4500, notes: 'Long-shafted wooden or aluminium staff with a curved head sized to catch a sheep’s neck or hind leg. Traditional UK shepherding tool still in working use.' },
  { slug: 'hand-shears', name: 'Hand shears, sheep', pluralName: 'hand shears', category: 'other', aliases: ['blade shears'], isPurchasable: true, typicalPriceGbp: 4000, notes: 'Spring-action steel blade shears for hand-shearing a small flock. Slower than electric clippers but quiet and gentle; favoured for primitives and rare breeds.' },
  { slug: 'electric-sheep-clippers', name: 'Electric sheep clippers', pluralName: 'electric sheep clippers', category: 'electrical', aliases: ['shearing machine', 'shearing handpiece'], isPurchasable: true, typicalPriceGbp: 28000, notes: 'Mains or 12 V handpiece with comb-and-cutter clipper head designed for shearing fleece. Heavier than dog clippers; takes a sharpened comb every few sheep.' },
  { slug: 'lambing-lubricant', name: 'Lambing lubricant', category: 'other', aliases: ['obstetric gel'], isPurchasable: true, typicalPriceGbp: 1200, notes: 'Pre-thickened obstetric gel used to lubricate the hand during an assisted lambing or kidding. Standard kit alongside long arm-length gloves.' },
  { slug: 'iodine-spray-navel', name: 'Iodine navel spray', category: 'other', aliases: ['navel iodine', 'tincture of iodine 7%'], isPurchasable: true, typicalPriceGbp: 700, notes: 'A small spray bottle of 7% strong iodine applied to a newborn lamb, kid, or calf’s navel within the first hour of life to stop joint-ill bacteria entering through the cord.' },
  { slug: 'pig-board', name: 'Pig board', category: 'board', aliases: ['driving board', 'sorting board'], isPurchasable: true, typicalPriceGbp: 3500, notes: 'A rectangular plywood or HDPE board (around 80 × 60 cm) used to steer a pig in the direction the handler wants. Pigs go where they cannot see; the board blocks the wrong direction.' },
  { slug: 'pig-arc', name: 'Pig arc', category: 'other', aliases: ['pig ark', 'a-frame shelter'], isPurchasable: true, typicalPriceGbp: 35000, notes: 'A galvanised-steel A-frame shelter for outdoor pigs — sized for 2-3 weaners or a single sow. Tip-resistant, hose-clean, weatherproof. The standard small-holder housing.' },
  { slug: 'electric-fence-energiser', name: 'Electric-fence energiser', category: 'electrical', aliases: ['fencer unit', 'electric fencer'], isPurchasable: true, typicalPriceGbp: 9500, notes: 'A mains or battery-powered pulse generator that energises an electric fence line. Match the joule rating to the perimeter length and the stock (poultry netting needs ~0.3 J; pig fencing 1-2 J).' },
  { slug: 'electric-poultry-netting', name: 'Electric poultry netting', category: 'other', aliases: ['electric chicken netting', 'electric fox netting'], isPurchasable: true, typicalPriceGbp: 10000, notes: '50 m run of 112 cm-tall electrified plastic mesh, used to enclose free-range poultry against foxes and badgers. Sets up in 20 minutes; rotates with the flock.' },
]
