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
]
