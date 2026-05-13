# Master tools list

Generated from `packages/db/scripts/data/tools.ts` — that file is the
source of truth, the database upsert reads it directly. Run
`pnpm --filter "@homemade/db" exec tsx scripts/generate-tools-master-md.ts`
to regenerate this view after editing.

Counts: 179 tools across 17 categories.

`isPurchasable: false` marks kitchen fixtures (oven, hob, sink) so the
Phase 7 marketplace can filter them out of the buy panel. `typicalPriceGbp`
is in pounds-and-pence; skip when uncertain — a missing price beats a wrong one.

## Knives

11 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Boning knife | `boning-knife` | — | yes | £25.00 | Flexible narrow blade for meat butchery. |
| Bread knife | `bread-knife` | serrated knife | yes | £25.00 | Long serrated blade. Also good for tomatoes. |
| Carving knife | `carving-knife` | slicing knife | yes | £30.00 | Long thin blade for roasts. |
| Chef's knife | `chefs-knife` | cook's knife, French knife, 8-inch knife | yes | £50.00 | 20 cm blade is the all-rounder. Most-used tool in the kitchen. |
| Cleaver | `cleaver` | Chinese chef's knife | yes | £35.00 | Heavy blade for breaking bones and crushing garlic with the side. |
| Filleting knife | `filleting-knife` | fish knife | yes | £25.00 | Thin flexible blade for fish. |
| Kitchen scissors | `kitchen-scissors` | kitchen shears, poultry shears | yes | £15.00 | For spatchcocking, snipping herbs, cutting bacon. |
| Mezzaluna | `mezzaluna` | rocking blade | yes | £20.00 | Curved blade for chopping herbs. |
| Oyster knife | `oyster-knife` | — | yes | £15.00 | Short stubby blade with a guard for shucking. |
| Paring knife | `paring-knife` | vegetable knife | yes | £15.00 | 8-10 cm blade. For peeling, trimming, and small precise cuts. |
| Santoku knife | `santoku-knife` | — | yes | £40.00 | Japanese all-rounder, shorter than a chef's knife. Granton edge stops food sticking. |

## Pans

16 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Cast-iron skillet | `cast-iron-skillet` | Lodge skillet, cast-iron frying pan | yes | £40.00 | Oven-safe to any temperature. Builds non-stick patina over time. |
| Crêpe pan | `crepe-pan` | crepe pan | yes | £30.00 | Shallow flat pan. Also for blini and dosa. |
| Fish kettle | `fish-kettle` | fish poacher | yes | £75.00 | For poaching a whole salmon. Borrow before you buy. |
| Frying pan, 26 cm | `frying-pan-26` | skillet, fry pan | yes | £35.00 | Default everyday pan. Non-stick or stainless. |
| Frying pan, 30 cm | `frying-pan-30` | large skillet | yes | £45.00 | For four-person fry-ups and stir-fries. |
| Griddle pan | `griddle-pan` | grill pan | yes | £35.00 | Ridged cast-iron for steak marks. UK "griddle" = US "grill pan". |
| Milk pan, 18 cm | `milk-pan` | saucepan with lid | yes | £25.00 | For sauces, eggs, melting butter. |
| Omelette pan | `omelette-pan` | — | yes | £30.00 | Curved sides, no lip. For folded omelettes. |
| Paella pan | `paella-pan` | paellera | yes | £45.00 | Wide shallow pan. Carbon steel or enamelled steel. |
| Roasting pan | `roasting-pan` | roasting tin | yes | £45.00 | Heavy-base metal tin for roast meats and tray dinners. |
| Sauté pan, 28 cm | `saute-pan` | saute pan | yes | £60.00 | Straight sides, lid, more capacity than a frying pan. For braises and one-pan dinners. |
| Small frying pan, 20 cm | `small-frying-pan` | egg pan | yes | £25.00 | For one-egg omelettes and pancakes. |
| Tagine | `tagine` | — | yes | £50.00 | Moroccan conical-lidded clay pot. The lid traps and returns moisture. |
| Tawa | `roti-pan` | roti pan, chapati pan | yes | £25.00 | Flat cast-iron or non-stick for Indian flatbreads. |
| Tortilla pan | `tortilla-pan` | comal | yes | £25.00 | Flat cast-iron pan for toasting tortillas. |
| Wok | `wok` | carbon-steel wok | yes | £35.00 | Carbon steel, flat bottom for UK hobs. Season before first use. |

## Pots

10 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Bamboo steamer | `bamboo-steamer` | — | yes | £20.00 | Sits over a wok or saucepan. For dim sum. |
| Casserole dish | `dutch-oven` | Dutch oven, Le Creuset, cocotte | yes | £150 | Enamelled cast iron, 24-28 cm. Oven-and-hob for braises, stews, no-knead bread. The most useful single purchase. |
| Jam pan | `jam-pan` | preserving pan, maslin pan | yes | £55.00 | Wide unlined copper or steel. Wide surface helps water evaporate fast for a set. |
| Pressure cooker | `pressure-cooker` | — | yes | £60.00 | Stove-top or electric. Cuts long-cook times by two-thirds. |
| Pudding basin | `pudding-basin` | Mason Cash basin, steam-pudding bowl | yes | £15.00 | For steamed puddings — Christmas pudding, jam roly-poly. |
| Saucepan, 18 cm | `medium-saucepan` | — | yes | £30.00 |  |
| Saucepan, 22 cm | `large-saucepan` | large pot | yes | £40.00 | The workhorse 4-litre pot for stews and rice. |
| Small saucepan, 16 cm | `small-saucepan` | — | yes | £25.00 |  |
| Steamer pot | `steamer-pot` | multi-tier steamer | yes | £35.00 | Stacking tier for veg, fish, dumplings. |
| Stockpot, 8 L | `stockpot` | — | yes | £55.00 | For stock, pasta, and big-batch soups. |

## Ovens and ancillary

7 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Fan oven | `fan-oven` | convection oven | fixture | — | Default UK oven. Cooks ~20°C cooler than conventional at the same setting. |
| Grill | `grill` | broiler | fixture | — | UK "grill" = US "broiler" — the top element. UK "BBQ" = US "grill". |
| Hob | `hob` | stove, cooktop | fixture | — | Gas, electric, or induction. |
| Oven | `oven` | — | fixture | — | Fan or conventional. Recipes are written for fan unless stated. |
| Pizza oven | `pizza-oven` | Ooni, Roccbox | yes | £300 | Hits 500°C+. For proper Neapolitan-style pizza. |
| Pizza steel | `pizza-steel` | — | yes | £80.00 | Better heat-retention than stone. Six-millimetre steel slab. |
| Pizza stone | `pizza-stone` | baking stone | yes | £35.00 | Preheat for an hour at full whack for a crisp base. |

## Mixers and whisks

6 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Balloon whisk | `whisk-balloon` | — | yes | £10.00 | For whipping by hand and emulsifying dressings. |
| Dough hook attachment | `dough-hook` | — | yes | £25.00 | Stand-mixer attachment for kneading bread. |
| Flat whisk | `whisk-flat` | roux whisk | yes | £12.00 | Reaches the corners of a pan for sauces and gravies. |
| Hand mixer | `hand-mixer` | hand-held electric whisk | yes | £35.00 | For whipping cream and small batters when the stand mixer's overkill. |
| Paddle attachment | `paddle-attachment` | K-beater | yes | £25.00 | For creaming butter and sugar in a stand mixer. |
| Stand mixer | `stand-mixer` | KitchenAid, Kenwood Chef | yes | £350 | KitchenAid or Kenwood for bread, cake, meringue, sausages. |

## Processors and blenders

7 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Food processor | `food-processor` | Magimix, Cuisinart | yes | £180 | For pastry, pesto, hummus, breadcrumbs. |
| High-powered blender | `high-powered-blender` | Vitamix, NutriBullet | yes | £450 | For ultra-smooth purées and nut butter. |
| Jug blender | `blender-jug` | stand blender | yes | £60.00 | For soups, smoothies, dressings. |
| Mini chopper | `mini-chopper` | small food processor | yes | £35.00 | For small jobs — chopping shallots, blitzing herbs, grinding spices. |
| Pestle and mortar | `pestle-and-mortar` | mortar and pestle | yes | £25.00 | For crushing spices, garlic paste, pesto. Heavy stone wins. |
| Spice grinder | `spice-grinder` | electric coffee grinder | yes | £25.00 | Cheap electric coffee grinder reserved for spices. |
| Stick blender | `stick-blender` | immersion blender, hand blender | yes | £35.00 | For blending in the pan — soups, mayo, smoothies. |

## Measuring and decorating

10 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Cake turntable | `turntable` | revolving cake stand | yes | £30.00 | For decorating layered cakes. |
| Cook's tape | `cooks-tape` | masking tape | yes | £4.00 | Label every container in the fridge with date and content. |
| Icing smoother | `icing-smoother` | cake scraper | yes | £10.00 |  |
| Measuring cups | `measuring-cups` | — | yes | £8.00 | For US recipes. UK recipes default to weight. |
| Measuring jug, 1 L | `measuring-jug` | — | yes | £8.00 | Pyrex glass with metric and imperial. |
| Measuring spoons | `measuring-spoons` | — | yes | £6.00 |  |
| Piping bag | `piping-bag` | pastry bag | yes | £8.00 |  |
| Piping tips | `piping-tips` | piping nozzles | yes | £15.00 |  |
| Ruler | `ruler` | — | yes | £5.00 | For pastry, rolled dough, evenly sliced biscuits. |
| Spirit level | `spirit-level` | — | yes | £8.00 | For levelling a cake batter before icing. |

## Bowls

6 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Heatproof metal bowl | `metal-bowl` | stainless steel bowl | yes | £15.00 | Sits over a pan of simmering water for melting chocolate and bain-marie work. |
| Mixing bowl, large | `mixing-bowl-large` | Mason Cash bowl | yes | £25.00 | Earthenware. ~28 cm diameter for bread doughs and big batters. |
| Mixing bowl, medium | `mixing-bowl-medium` | — | yes | £15.00 |  |
| Mixing bowl, small | `mixing-bowl-small` | prep bowl | yes | £10.00 |  |
| Salad bowl | `salad-bowl` | — | yes | £35.00 |  |
| Stacking bowl set | `mixing-bowl-set` | nesting bowls | yes | £35.00 | A set of three or four in graduated sizes saves cupboard space. |

## Trays and racks

10 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Baking tray | `baking-tray` | baking sheet, rimmed sheet pan | yes | £15.00 | Default for tray bakes, roast vegetables, biscuits. |
| Cooling rack | `cooling-rack` | wire rack | yes | £12.00 | For cakes, biscuits, fried food. |
| Grill tray | `grill-tray` | broiler pan | yes | £15.00 | For under the grill — slotted top, drip tray beneath. |
| Half-sheet tray | `half-sheet-tray` | — | yes | £20.00 | US standard size, ~33×46 cm. Fits a UK oven. |
| Pizza peel | `pizza-peel` | — | yes | £25.00 | Wooden or aluminium. For sliding pizzas onto a hot stone. |
| Roasting rack | `roasting-rack` | V-rack | yes | £20.00 | Lifts a roast out of its fat for an evenly browned base. |
| Serving platter | `serving-platter` | — | yes | £30.00 |  |
| Silicone baking mat | `baking-mat` | Silpat | yes | £15.00 | Replaces baking paper for biscuits and roasting. |
| Trivet | `trivet` | pot stand | yes | £10.00 | For setting hot pans on the table or worktop. |
| Wire oven rack | `oven-rack` | — | yes | £15.00 | For cooling and for resting roasts above a tray. |

## Tins and moulds

18 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Bundt tin | `bundt-tin` | bundt pan | yes | £25.00 | Fluted ring mould. Grease every crevice. |
| Kugelhopf tin | `kugelhopf-tin` | — | yes | £25.00 | Tall fluted ring for Alsatian and Austrian yeast cakes. |
| Loaf tin, 1 lb | `loaf-tin-small` | — | yes | £12.00 |  |
| Loaf tin, 2 lb | `loaf-tin` | bread pan | yes | £15.00 | 900 g / 2 lb is the British standard. |
| Madeleine tin | `madeleine-tin` | madeleine pan | yes | £20.00 | Shell-shaped indents. |
| Mini muffin tin | `mini-muffin-tin` | — | yes | £12.00 | For canapés, mini quiches, financiers. |
| Muffin tin, 12-hole | `muffin-tin` | cupcake tin | yes | £15.00 |  |
| Pie dish | `pie-dish` | pie plate | yes | £15.00 | Enamelled or ceramic. ~23 cm. |
| Rectangular baking tin | `rectangular-baking-tin` | traybake tin | yes | £20.00 | ~30×20 cm. For lasagne, traybakes, flapjacks. |
| Round cake tin, 20 cm | `round-cake-tin-20` | — | yes | £15.00 | Loose-bottomed. Workhorse for sponge cakes. |
| Round cake tin, 23 cm | `round-cake-tin-23` | — | yes | £18.00 |  |
| Sandwich tin, 20 cm | `sandwich-tin` | layer cake pan | yes | £15.00 | Pair for a Victoria sponge. |
| Savarin tin | `savarin-tin` | ring mould | yes | £18.00 |  |
| Springform tin, 23 cm | `springform-tin` | springform pan | yes | £25.00 | Clip-side release for cheesecake and pavlova. |
| Square cake tin, 20 cm | `square-cake-tin` | brownie pan | yes | £18.00 | For brownies, traybakes, fudge. |
| Tart tin, 23 cm | `tart-tin` | flan tin | yes | £15.00 | Loose-bottomed, fluted edge. |
| Terrine mould | `terrine-tin` | — | yes | £40.00 | For pâté and terrine. Cast-iron with a lid is best. |
| Yorkshire pudding tin | `yorkshire-pudding-tin` | popover pan | yes | £15.00 | 4-hole or 12-hole. Deep cups for tall puds. |

## Boards

4 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Bench scraper | `bench-scraper` | dough scraper | yes | £8.00 | Plastic for dough, metal for the work surface. |
| Chopping board | `chopping-board` | cutting board | yes | £25.00 | Wood for veg and bread; plastic for raw meat (or a designated wooden one washed hot). |
| Large chopping board | `chopping-board-large` | butcher block | yes | £50.00 | End-grain wood blocks save knife edges and clean up well. |
| Pastry board | `pastry-board` | marble pastry slab | yes | £40.00 | Marble stays cool — keeps butter from melting into the flour. |

## Utensils

38 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Apple corer | `apple-corer` | — | yes | £8.00 |  |
| Biscuit cutters | `biscuit-cutters` | cookie cutters | yes | £15.00 | A graduated set covers most jobs. |
| Bottle opener | `bottle-opener` | — | yes | £5.00 |  |
| Box grater | `box-grater` | — | yes | £15.00 | Four-sided. For cheese, vegetables, citrus zest. |
| Cherry pitter | `cherry-pitter` | cherry stoner, olive pitter | yes | £12.00 | Also works for olives. |
| Colander | `colander` | — | yes | £15.00 |  |
| Corkscrew | `corkscrew` | wine opener | yes | £10.00 |  |
| Fine-mesh sieve | `fine-mesh-sieve` | chinois | yes | £20.00 | For ultra-smooth sauces and purées. |
| Fish slice | `fish-slice` | turner, spatula | yes | £8.00 | UK fish slice = US turner. |
| Fish tweezers | `fish-tweezers` | fish pin-bone tweezers | yes | £12.00 | For pulling pin bones from salmon and trout fillets. |
| Garlic press | `garlic-press` | garlic crusher | yes | £15.00 |  |
| Icing spatula | `icing-spatula` | palette knife, offset spatula | yes | £12.00 | For lifting biscuits and smoothing icing. |
| Julienne peeler | `julienne-peeler` | — | yes | £8.00 | Cuts long thin matchsticks of carrot, courgette. |
| Kitchen twine | `kitchen-twine` | butcher's string, cooking string | yes | £5.00 | For tying roasts and bouquet garni. |
| Ladle | `ladle` | — | yes | £10.00 | For soup and risotto stock. |
| Lemon squeezer | `lemon-squeezer` | citrus reamer | yes | £10.00 |  |
| Mandoline | `mandoline` | — | yes | £35.00 | For uniform slicing. Use the safety guard — every time. |
| Meat mallet | `meat-mallet` | meat tenderiser | yes | £15.00 | For bashing chicken to even thickness and tenderising tough cuts. |
| Mexican lemon press | `citrus-juicer-mexican` | hand citrus press | yes | £15.00 | Squeezes lemons and limes pip-free. |
| Microplane | `microplane` | fine grater, rasp grater | yes | £20.00 | For zest, parmesan, nutmeg, garlic. |
| Pasta machine | `pasta-machine` | pasta roller | yes | £55.00 | Atlas 150 is the standard. Hand-cranked. |
| Pasta server | `pasta-server` | spaghetti spoon | yes | £8.00 |  |
| Pastry brush | `pastry-brush` | basting brush | yes | £8.00 | Silicone is easier to wash; natural bristle holds more glaze. |
| Pepper mill | `pepper-mill` | pepper grinder | yes | £25.00 |  |
| Potato masher | `masher` | — | yes | £10.00 |  |
| Potato ricer | `ricer` | — | yes | £25.00 | For lump-free mash and proper gnocchi. |
| Ravioli stamp | `ravioli-stamp` | pastry cutter | yes | £8.00 |  |
| Rolling pin | `rolling-pin` | — | yes | £15.00 | Heavy hardwood. French (tapered, no handles) gives better feel. |
| Salt grinder | `salt-grinder` | — | yes | £20.00 |  |
| Sieve | `sieve` | fine-mesh sieve, strainer | yes | £10.00 | For sifting flour and straining custards. |
| Silicone spatula | `silicone-spatula` | rubber spatula, scraper | yes | £8.00 | For folding and scraping bowls clean. |
| Slotted spoon | `slotted-spoon` | — | yes | £8.00 |  |
| Small ladle | `soup-ladle-small` | gravy ladle | yes | £8.00 |  |
| Spider strainer | `spider-strainer` | Asian skimmer | yes | £12.00 | For lifting fried food and noodles out of liquid. |
| Tin opener | `tin-opener` | can opener | yes | £10.00 |  |
| Tongs | `tongs` | — | yes | £10.00 | Spring-loaded. For flipping bacon, lifting pasta, plating. |
| Wooden spoon | `wooden-spoon` | — | yes | £5.00 |  |
| Y-peeler | `peeler-y` | vegetable peeler | yes | £6.00 | Faster and more comfortable than a straight peeler. |

## Appliances

11 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Air fryer | `air-fryer` | Ninja, Tefal ActiFry | yes | £120 | 4-litre or dual-drawer. Effectively a small convection oven. |
| Bread maker | `bread-maker` | breadmaker | yes | £80.00 |  |
| Dehydrator | `dehydrator` | — | yes | £80.00 | For jerky, fruit leather, dried herbs. |
| Ice cream maker | `ice-cream-maker` | — | yes | £65.00 | Pre-freeze bowl style is cheap and reliable. |
| Instant Pot | `instant-pot` | multi-cooker, electric pressure cooker | yes | £100 | Pressure cooker, slow cooker, rice cooker, yoghurt maker in one box. |
| Kettle | `kettle` | electric kettle | yes | £35.00 |  |
| Microwave | `microwave` | — | yes | £80.00 |  |
| Rice cooker | `rice-cooker` | — | yes | £45.00 | Set-and-forget. Indispensable if you eat rice often. |
| Slow cooker | `slow-cooker` | Crock-Pot | yes | £35.00 | 3.5 L or 6 L. Set in the morning, eat in the evening. |
| Sous-vide circulator | `sous-vide-circulator` | immersion circulator, Anova | yes | £120 | Clip to a stockpot. Controls water temperature to the degree. |
| Toaster | `toaster` | — | yes | £45.00 |  |

## Electricals

6 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Deep fryer | `deep-fryer` | — | yes | £80.00 | Easier than deep-frying in a saucepan. Temperature control is the win. |
| Electric griddle | `griddle-electric` | — | yes | £65.00 |  |
| Induction hob | `induction-hob` | induction cooktop | yes | £300 | Faster heat-up and finer control than gas or electric coil. |
| Sandwich toaster | `sandwich-toaster` | toastie maker, panini press | yes | £30.00 |  |
| Smoothie blender | `stand-blender` | NutriBullet | yes | £50.00 |  |
| Waffle iron | `waffle-iron` | waffle maker | yes | £45.00 |  |

## Thermometers

4 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Instant-read thermometer | `instant-read-thermometer` | Thermapen, meat thermometer | yes | £45.00 | For meat, bread, deep-frying, custard. Thermapen is the standard. |
| Oven thermometer | `oven-thermometer` | — | yes | £10.00 | Worth checking — most home ovens run 20°C either side of the dial. |
| Probe thermometer | `probe-thermometer` | leave-in thermometer | yes | £25.00 | Sits in the joint with a wired probe leading outside the oven. |
| Sugar thermometer | `sugar-thermometer` | jam thermometer, candy thermometer | yes | £15.00 | For jam, caramel, sugar work — reads up to 200°C+. |

## Scales

2 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Digital scales | `digital-scales` | kitchen scales | yes | £15.00 | Default precision: 1 g. Tare to zero between ingredients. |
| Precision scales | `precision-scales` | gram scales | yes | £25.00 | For yeast, spices, salt — reads to 0.1 g. |

## Other

13 entries.

| Name | Slug | Aliases | Buy | Typical price | Notes |
| --- | --- | --- | --- | --- | --- |
| Aluminium foil | `foil` | tinfoil | yes | £2.00 |  |
| Apron | `apron` | — | yes | £20.00 |  |
| Baking beans | `baking-beans` | pie weights | yes | £8.00 | Ceramic or metal. For blind-baking pastry. Dried rice or chickpeas work too. |
| Baking paper | `baking-paper` | parchment paper, greaseproof paper | yes | £2.50 | Greaseproof and baking parchment are not interchangeable — baking parchment is non-stick coated. |
| Banneton | `banneton` | proving basket, brotform | yes | £15.00 | For proving sourdough. Linen-lined to stop sticking. |
| Cling film | `cling-film` | plastic wrap, Saran wrap | yes | £2.00 |  |
| Jam jars | `jam-jars` | preserving jars | yes | £8.00 | Sterilise in a 140°C oven for 15 minutes before filling. |
| Kilner jar | `kilner-jar` | Mason jar, ball jar | yes | £8.00 | Clip-top for ferments and pickles. |
| Muslin cloth | `muslin-cloth` | cheesecloth | yes | £8.00 | For straining stock, hanging soft cheeses, bouquet garni. |
| Oven gloves | `oven-gloves` | oven mitts | yes | £12.00 |  |
| Sink | `sink` | — | fixture | — | Kitchen fixture. |
| Spray bottle | `spray-bottle` | — | yes | £5.00 | For misting bread doughs in the oven for a crustier loaf. |
| Tea towel | `tea-towel` | dish towel | yes | £8.00 |  |

