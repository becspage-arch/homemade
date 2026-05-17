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
]
