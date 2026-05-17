/**
 * Master craft-material list — single source of truth for `CraftMaterial`.
 *
 * Pottery is the first craft pipeline to land here. Future jewellery /
 * paper / wood-finishing pipelines will widen the `craft` vocabulary and
 * append rows without forking the table.
 *
 * Seeded via `packages/db/scripts/seed-craft-materials.ts` (idempotent
 * upsert).
 *
 * The single most important field is `trainedEnvironmentOnly`. Silica
 * dust is a chronic-irreversible hazard (silicosis is not curable). Heavy-
 * metal raw oxides at studio quantity require respirator-grade PPE and a
 * dedicated mixing space that does not share air with food prep. The
 * pottery authoring prompt forbids no-equipment-track tutorials from
 * referencing rows with this flag set; the upload script rejects them.
 *
 * Brand names are deliberately omitted (Gerstley borate is named after a
 * defunct mine and is included as a generic; pre-mixed glazes are named
 * by chemistry rather than by Mayco / Amaco / Spectrum / Botz). Lead-
 * bearing recipes are not included in any form, even with a "do not use"
 * caveat — see the pottery authoring prompt.
 */

import type { CraftMaterialSeed } from './types.js'

export const CRAFT_MATERIALS: CraftMaterialSeed[] = [
  // ───────────────────────────────────────────────────────────────────────
  // Glaze raw materials — kiln-fired chemistry building blocks. Almost
  // every row in this group is trainedEnvironmentOnly = true because the
  // raw silicate dust burden is the chronic hazard. Frits are the
  // exception: pre-vitrified into a stable glass and milled, they bypass
  // most of the dust risk.
  // ───────────────────────────────────────────────────────────────────────
  {
    slug: 'silica',
    name: 'Silica (flint)',
    craft: 'pottery',
    category: 'glaze-raw',
    trainedEnvironmentOnly: true,
    hazardNotes:
      'Crystalline silica dust causes silicosis, an irreversible lung disease. Mix wet whenever possible; wear a P100 respirator any time the dry powder is open. Never sweep — wet-mop only. Studio quantity belongs in a sealed cupboard.',
    notes:
      'The glass-former in almost every fired glaze. Forms the silicate network the alumina and fluxes attach to. Adjusting silica adjusts the durability and the thermal expansion of the finished glaze.',
  },
  {
    slug: 'kaolin',
    name: 'Kaolin (china clay)',
    craft: 'pottery',
    category: 'glaze-raw',
    trainedEnvironmentOnly: true,
    hazardNotes:
      'Fine clay dust contains silica fines. Mix wet; respirator on for dry handling. Cleanup wet-only.',
    notes:
      'Primary clay used as the alumina-and-silica carrier in glazes. Keeps glaze in suspension in the bucket and contributes opacity to the fired surface. EPK and Tile 6 are common refined kaolins; the slug here is the chemistry, not the brand.',
  },
  {
    slug: 'feldspar-potash',
    name: 'Potash feldspar',
    craft: 'pottery',
    category: 'glaze-raw',
    trainedEnvironmentOnly: true,
    hazardNotes:
      'Silicate dust hazard as with all raw glaze powders. Respirator + wet-cleanup mandatory.',
    notes:
      'The high-temperature flux in stoneware and porcelain glazes. Custer (USA) and G-200 (USA) are the named potash feldspars; UK suppliers stock equivalents under generic names. Provides the K2O / Al2O3 / SiO2 backbone of most cone 6-10 glazes.',
  },
  {
    slug: 'feldspar-soda',
    name: 'Soda feldspar',
    craft: 'pottery',
    category: 'glaze-raw',
    trainedEnvironmentOnly: true,
    hazardNotes: 'Silicate dust hazard. Respirator + wet-cleanup mandatory.',
    notes:
      'Sodium-rich feldspar. Slightly lower melting point than potash feldspar; more thermal-expansion than potash, so glazes adjusted toward soda craze more easily. Useful in blends where potash alone runs short of flux.',
  },
  {
    slug: 'gerstley-borate',
    name: 'Gerstley borate (or substitute)',
    craft: 'pottery',
    category: 'glaze-raw',
    trainedEnvironmentOnly: true,
    hazardNotes:
      'Borate dust irritates the lungs. Respirator on for dry handling.',
    notes:
      'Sodium-calcium borate, the most common low- and mid-fire flux in studio glazes. The historical source mine is closed; supply varies, and many studios substitute Gillespie borate or a frit blend. Provides melt at cone 06 - 6 where feldspars alone would not flux.',
  },
  {
    slug: 'whiting',
    name: 'Whiting (calcium carbonate)',
    craft: 'pottery',
    category: 'glaze-raw',
    trainedEnvironmentOnly: false,
    notes:
      'Powdered limestone — the standard calcium source in mid-fire and high-fire glazes. Decomposes around 825°C, releasing CO2 and leaving CaO as a flux. Low chronic toxicity at handling quantity; still wear a dust mask, but a P100 is not required.',
  },
  {
    slug: 'wollastonite',
    name: 'Wollastonite',
    craft: 'pottery',
    category: 'glaze-raw',
    trainedEnvironmentOnly: true,
    hazardNotes:
      'Acicular (needle-shaped) particles. P100 respirator mandatory; the needles lodge in lung tissue similarly to asbestos at long exposure.',
    notes:
      'Calcium silicate, used as an alternative calcium source in glazes that want the calcium without the CO2 release of whiting. Useful where pinholing from whiting decomposition is a problem.',
  },
  {
    slug: 'talc',
    name: 'Talc',
    craft: 'pottery',
    category: 'glaze-raw',
    trainedEnvironmentOnly: true,
    hazardNotes:
      'Talc dust may contain trace asbestiform minerals depending on the mine. Use ceramic-grade talc certified asbestos-free; respirator on for dry handling.',
    notes:
      'Magnesium silicate. Lowers thermal expansion in low-fire whiteware bodies and softens stoneware glazes. Common in commercial cone 06 whiteware clay bodies and in mid-fire matte glazes.',
  },
  {
    slug: 'dolomite',
    name: 'Dolomite',
    craft: 'pottery',
    category: 'glaze-raw',
    trainedEnvironmentOnly: true,
    hazardNotes: 'Silicate dust hazard. Respirator + wet-cleanup mandatory.',
    notes:
      'Calcium-magnesium carbonate. The standard source of magnesium in mid- and high-fire glazes; gives the soft buttery matte surface of many cone 6 - 10 dolomite mattes.',
  },
  {
    slug: 'lithium-carbonate',
    name: 'Lithium carbonate',
    craft: 'pottery',
    category: 'glaze-raw',
    trainedEnvironmentOnly: true,
    hazardNotes:
      'Lithium carbonate is toxic if ingested and a respiratory irritant. Respirator on; never near food prep.',
    notes:
      'Strong flux used in low-fire and mid-fire glazes where a powerful melt is needed at modest temperature. Used sparingly because of cost and toxicity.',
  },
  {
    slug: 'bentonite',
    name: 'Bentonite',
    craft: 'pottery',
    category: 'glaze-raw',
    trainedEnvironmentOnly: false,
    notes:
      'Highly plastic colloidal clay added to glaze slops at 1-2% to keep heavy materials in suspension. Also added to clay bodies for plasticity. Wear a dust mask when weighing dry; not on the trained-environment-only list because handling quantity is small and toxicity is low.',
  },
  {
    slug: 'frit-3124',
    name: 'Frit 3124',
    craft: 'pottery',
    category: 'glaze-raw',
    trainedEnvironmentOnly: false,
    notes:
      'Pre-vitrified glass milled to a powder. Calcium-borate-silicate frit, the low-fire workhorse at cone 06 - 04. Bypasses most of the raw-material handling hazard because the chemistry is locked into a glass before it reaches the studio.',
  },
  {
    slug: 'frit-3134',
    name: 'Frit 3134',
    craft: 'pottery',
    category: 'glaze-raw',
    trainedEnvironmentOnly: false,
    notes:
      'Lead-free calcium-borate-silicate frit with no alumina. Common in low-fire majolica and slip glazes; the high-alkali version of frit 3124 for transparent low-fire surfaces.',
  },
  {
    slug: 'frit-3195',
    name: 'Frit 3195',
    craft: 'pottery',
    category: 'glaze-raw',
    trainedEnvironmentOnly: false,
    notes:
      'Boron frit balanced for cone 04 - 6 transparent glazes. Higher silica content than 3124, so glazes built around it are more durable on finished tableware.',
  },

  // ───────────────────────────────────────────────────────────────────────
  // Glaze colourants — oxides and stains. Heavy-metal oxides at studio
  // quantity (cobalt, copper, manganese, chromium, nickel) are trained-
  // environment only. Iron oxides and rutile have low chronic toxicity at
  // handling quantity and are flagged false.
  // ───────────────────────────────────────────────────────────────────────
  {
    slug: 'cobalt-carbonate',
    name: 'Cobalt carbonate',
    craft: 'pottery',
    category: 'glaze-colourant',
    trainedEnvironmentOnly: true,
    hazardNotes:
      'Cobalt is a sensitiser; repeated skin / lung exposure causes hypersensitivity. Wear gloves and a respirator. Never use unfired raw cobalt brushwork on a food-contact surface.',
    notes:
      'The classical blue at all firing temperatures. Strong — 0.5-2% in a glaze gives saturated cobalt blue. Goes purple under high magnesium fluxes; greens with iron co-additions.',
  },
  {
    slug: 'copper-carbonate',
    name: 'Copper carbonate',
    craft: 'pottery',
    category: 'glaze-colourant',
    trainedEnvironmentOnly: true,
    hazardNotes:
      'Copper is toxic if ingested. Never apply raw to a food-contact surface; fired into a stable glaze it is safe, but tested food-safety is required for tableware. Wear gloves + respirator when handling raw.',
    notes:
      'Greens in oxidation, reds in reduction. Volatile at high temperatures — can migrate from one pot to another inside the kiln and discolour neighbours. Used at 1-5% in oxidation glazes.',
  },
  {
    slug: 'iron-oxide-red',
    name: 'Red iron oxide',
    craft: 'pottery',
    category: 'glaze-colourant',
    trainedEnvironmentOnly: false,
    notes:
      'The most-used colourant. Tans, browns, blacks, celadon greens in reduction, deep blacks at saturation. Low chronic toxicity at handling quantity — wear a standard dust mask only. The default colourant for the beginner palette.',
  },
  {
    slug: 'iron-oxide-yellow',
    name: 'Yellow iron oxide',
    craft: 'pottery',
    category: 'glaze-colourant',
    trainedEnvironmentOnly: false,
    notes:
      'Hydrated iron oxide that loses water on firing and behaves the same as red iron oxide in the fired glaze. Different working colour in the bucket so the studio knows which oxide is which when weighing.',
  },
  {
    slug: 'manganese-dioxide',
    name: 'Manganese dioxide',
    craft: 'pottery',
    category: 'glaze-colourant',
    trainedEnvironmentOnly: true,
    hazardNotes:
      'Chronic manganese inhalation causes manganism, a Parkinson-like neurological condition. P100 respirator mandatory; never near food prep.',
    notes:
      'Browns, purples, blacks. Used sparingly because of the chronic neurological risk. Granulated manganese (larger crystals) flecks dark spots through the fired glaze.',
  },
  {
    slug: 'chromium-oxide',
    name: 'Chromium oxide',
    craft: 'pottery',
    category: 'glaze-colourant',
    trainedEnvironmentOnly: true,
    hazardNotes:
      'Chromium VI (the soluble form) is carcinogenic. Studio-quality chromium oxide is the III form, much less hazardous, but P100 respirator + gloves are still required for raw handling.',
    notes:
      'Greens. With tin produces pinks and chrome-tin red. Stable at all studio temperatures.',
  },
  {
    slug: 'rutile',
    name: 'Rutile',
    craft: 'pottery',
    category: 'glaze-colourant',
    trainedEnvironmentOnly: false,
    notes:
      'Titanium dioxide with iron impurity. Used at 2-10% for soft yellow-brown opacity and the variegated "rutile blue" surface in cone 6+ glazes. Low chronic toxicity at handling quantity.',
  },
  {
    slug: 'nickel-oxide',
    name: 'Nickel oxide',
    craft: 'pottery',
    category: 'glaze-colourant',
    trainedEnvironmentOnly: true,
    hazardNotes:
      'Nickel is a known carcinogen at chronic exposure. P100 respirator + gloves mandatory; avoid skin contact.',
    notes:
      'Grey-greens, soft yellows; modifier in iron-rich glazes for warmer earth tones. Used sparingly — 0.5-2% — because of the chronic hazard.',
  },

  // ───────────────────────────────────────────────────────────────────────
  // Slip + engobe + resist — applied to greenware or bisque before
  // glazing. Low handling hazard at these working quantities.
  // ───────────────────────────────────────────────────────────────────────
  {
    slug: 'porcelain-slip',
    name: 'Porcelain slip',
    craft: 'pottery',
    category: 'clay-tool-attached',
    trainedEnvironmentOnly: false,
    notes:
      'White porcelain slurry brushed or trailed onto coloured stoneware for contrast. Used for mishima inlay (slip pressed into carved lines), sgraffito (slip carved through), and slip-trailed surface decoration. Mix from porcelain dry-clay scrap.',
  },
  {
    slug: 'coloured-slip-red',
    name: 'Red slip',
    craft: 'pottery',
    category: 'clay-tool-attached',
    trainedEnvironmentOnly: false,
    notes:
      'Earthenware slip coloured with red iron oxide (6-10% by dry weight). The classical Mediterranean / Cypriot decoration slip.',
  },
  {
    slug: 'coloured-slip-black',
    name: 'Black slip',
    craft: 'pottery',
    category: 'clay-tool-attached',
    trainedEnvironmentOnly: false,
    notes:
      'Slip coloured with red iron oxide + manganese dioxide + cobalt to a near-black at firing. Used for Greek-style figure decoration and mishima line inlay.',
  },
  {
    slug: 'coloured-slip-white',
    name: 'White slip',
    craft: 'pottery',
    category: 'clay-tool-attached',
    trainedEnvironmentOnly: false,
    notes:
      'Refined white slip — kaolin and ball clay base — brushed over red earthenware to lighten the surface before colour decoration. The medieval slipware ground.',
  },
  {
    slug: 'coloured-slip-blue',
    name: 'Blue slip',
    craft: 'pottery',
    category: 'clay-tool-attached',
    trainedEnvironmentOnly: false,
    notes:
      'White slip base + 0.5-1% cobalt carbonate. Cobalt is mixed into the slip rather than handled at the brushing stage, lowering raw-cobalt exposure for the surface decorator.',
  },
  {
    slug: 'coloured-slip-green',
    name: 'Green slip',
    craft: 'pottery',
    category: 'clay-tool-attached',
    trainedEnvironmentOnly: false,
    notes:
      'White slip base + chromium oxide or copper carbonate at 2-3% for a sage to mid-green at cone 06 - 6.',
  },
  {
    slug: 'terra-sigillata-red',
    name: 'Terra sigillata, red',
    craft: 'pottery',
    category: 'clay-tool-attached',
    trainedEnvironmentOnly: false,
    notes:
      'Ultra-fine red-iron-bearing clay slip refined by repeated settling. Burnished while leather-hard, it fires to a soft satin sheen without a glaze. The classical Roman + Greek surface.',
  },
  {
    slug: 'terra-sigillata-white',
    name: 'Terra sigillata, white',
    craft: 'pottery',
    category: 'clay-tool-attached',
    trainedEnvironmentOnly: false,
    notes:
      'Refined kaolin terra sigillata. Burnishes to a pale satin sheen. The unglazed surface for pre-firing burnish + smoke / pit-fired work.',
  },
  {
    slug: 'wax-resist',
    name: 'Wax resist',
    craft: 'pottery',
    category: 'clay-tool-attached',
    trainedEnvironmentOnly: false,
    notes:
      'Water-based wax emulsion brushed onto bisque before glazing to mask areas the glaze should not stick to (foot rings, decorative bands). Burns out in the glaze firing.',
  },
  {
    slug: 'latex-resist',
    name: 'Latex resist',
    craft: 'pottery',
    category: 'clay-tool-attached',
    trainedEnvironmentOnly: false,
    notes:
      'Liquid latex brushed on, peeled off after glazing for crisp negative-space decoration. Stronger than wax for thick resists; cannot be fired in place — must be peeled before firing.',
  },

  // ───────────────────────────────────────────────────────────────────────
  // Pre-mixed commercial glazes — for the no-equipment / classroom-style
  // tutorials. No trained-environment flag; safe for home use straight
  // out of the bucket / jar.
  // ───────────────────────────────────────────────────────────────────────
  {
    slug: 'low-fire-glaze-pre-mixed',
    name: 'Pre-mixed low-fire glaze',
    craft: 'pottery',
    category: 'glaze-premixed',
    trainedEnvironmentOnly: false,
    notes:
      'Commercial pre-mixed dipping or brushing glaze for cone 06 - 04. Sold in 500 ml - 4 L pots. Food-safe certified varieties exist; the studio or supplier should specify per colour.',
  },
  {
    slug: 'mid-fire-glaze-pre-mixed',
    name: 'Pre-mixed mid-fire glaze',
    craft: 'pottery',
    category: 'glaze-premixed',
    trainedEnvironmentOnly: false,
    notes:
      'Commercial pre-mixed glaze for cone 6 stoneware firings. The home-friendly route to glaze without weighing raw materials. Brush three coats; dipping versions ship at the right specific gravity in the bucket.',
  },
  {
    slug: 'majolica-glaze-pre-mixed',
    name: 'Pre-mixed majolica glaze',
    craft: 'pottery',
    category: 'glaze-premixed',
    trainedEnvironmentOnly: false,
    notes:
      'Low-fire opaque white tin-bearing glaze applied to bisque white earthenware, then decorated with under-glaze oxides before firing. The classical Italian / Spanish surface; tin oxide is the opacifier.',
  },
  {
    slug: 'underglaze-pre-mixed',
    name: 'Pre-mixed underglaze',
    craft: 'pottery',
    category: 'underglaze',
    trainedEnvironmentOnly: false,
    notes:
      'Commercial under-glaze in saturated colours, sold in 60-500 ml jars. Brush onto greenware or bisque before glazing. The home-friendly painting surface — no raw oxide handling required.',
  },

  // ───────────────────────────────────────────────────────────────────────
  // Kiln furniture — non-clay materials that go in the kiln.
  // ───────────────────────────────────────────────────────────────────────
  {
    slug: 'kiln-wash',
    name: 'Kiln wash',
    craft: 'pottery',
    category: 'kiln-furniture',
    trainedEnvironmentOnly: false,
    notes:
      'Refractory mix (alumina hydrate + EPK kaolin + silica) brushed onto kiln shelves to stop drips of glaze sticking. Re-coat after every firing where a glaze runner has been lifted off.',
  },
  {
    slug: 'stilts-low-fire',
    name: 'Low-fire stilts',
    craft: 'pottery',
    category: 'kiln-furniture',
    trainedEnvironmentOnly: false,
    notes:
      'Refractory tripods that hold a low-fire glazed piece off the kiln shelf so the glaze can run to the foot without sticking. Only for low-fire (cone 06 - 04) — stoneware temperatures collapse the stilt and ruin the shelf.',
  },

  // ───────────────────────────────────────────────────────────────────────
  // FIBRE ARTS — wool roving, prepared fibre, warp threads, dye plants,
  // mordants, felting aids, macramé cords, rug yarns. Added with the
  // fibre-arts pipeline scaffold (phase_fibre_arts_pipeline_setup).
  //
  // The single most important field for the fibre-arts rows is the
  // `trainedEnvironmentOnly` flag on the **mordants**. Iron and copper
  // sulphate at studio quantity require long gloves, ventilation, and
  // dedicated dye-work space; the dyeing prompt drops the safety
  // preamble verbatim into every dyeing body. Plant-dye rows have
  // `category: 'dye-plant'` and cross-link the Garden Plant table for
  // the growing-and-harvesting tutorial.
  // ───────────────────────────────────────────────────────────────────────

  // ─── Wool roving — by breed. The basic raw material for spinning,
  //     felting, and many weaving wefts. All untrained-OK (no chronic
  //     hazard at hand-spinning quantity; wool dust is an irritant for
  //     sensitive lungs, surfaced in the prompt's safety preamble).
  {
    slug: 'wool-roving-merino',
    name: 'Wool roving, Merino',
    craft: 'fibre-arts',
    category: 'fibre-roving',
    trainedEnvironmentOnly: false,
    notes:
      'Fine, soft, short-stapled roving (typically 64s-80s grade). The default felting roving and the easiest fibre for new spinners on the wheel. Felts readily — useful for wet felting, less useful for next-to-skin spun yarn that needs to resist felting in the wash.',
  },
  {
    slug: 'wool-roving-romney',
    name: 'Wool roving, Romney',
    craft: 'fibre-arts',
    category: 'fibre-roving',
    trainedEnvironmentOnly: false,
    notes:
      'Long-stapled English Romney roving (~48s grade). Lustrous, hard-wearing, less felt-prone than Merino. Good rug yarn, good outerwear yarn. The classical British medium-wool fibre.',
  },
  {
    slug: 'wool-roving-bfl',
    name: 'Wool roving, Bluefaced Leicester (BFL)',
    craft: 'fibre-arts',
    category: 'fibre-roving',
    trainedEnvironmentOnly: false,
    notes:
      'Long-stapled lustrous fine roving (~56s grade) from the Bluefaced Leicester sheep. Drafts smoothly on the wheel; takes dye beautifully. A favourite handspinning fibre.',
  },
  {
    slug: 'wool-roving-shetland',
    name: 'Wool roving, Shetland',
    craft: 'fibre-arts',
    category: 'fibre-roving',
    trainedEnvironmentOnly: false,
    notes:
      'Short-to-medium stapled fine wool (~56s-60s grade) in the natural Shetland fleece colours (moorit, fawn, grey, mioget, white). Spins fine; underpins Fair Isle and Shetland lace knitting traditions.',
  },
  {
    slug: 'wool-roving-corriedale',
    name: 'Wool roving, Corriedale',
    craft: 'fibre-arts',
    category: 'fibre-roving',
    trainedEnvironmentOnly: false,
    notes:
      'Medium-stapled medium-fine roving (~58s grade) from the New-Zealand-developed Corriedale sheep. Versatile workhorse fibre — spins well, felts well, drafts smoothly for new spinners.',
  },

  // ─── Other animal + plant fibres — prepared forms.
  {
    slug: 'pre-felt-batt',
    name: 'Pre-felt batt',
    craft: 'fibre-arts',
    category: 'fibre-prepared',
    trainedEnvironmentOnly: false,
    notes:
      'Wool that has been lightly felted into a flat batt — partially shrunk and stable enough to cut into shapes, but not fully fulled. The base layer for nuno felting and pictorial wet-felted work.',
  },
  {
    slug: 'mohair-locks',
    name: 'Mohair locks',
    craft: 'fibre-arts',
    category: 'fibre-prepared',
    trainedEnvironmentOnly: false,
    notes:
      'Curly silky locks shorn from Angora goats. Decorative for needle-felted hair / fur / fleece textures; spun straight for lustrous singles.',
  },
  {
    slug: 'alpaca-top',
    name: 'Alpaca top',
    craft: 'fibre-arts',
    category: 'fibre-roving',
    trainedEnvironmentOnly: false,
    notes:
      'Combed alpaca top — fibres aligned in parallel for worsted spinning. Slick, dense, warm; less elastic than wool, so often blended with wool for memory.',
  },
  {
    slug: 'silk-hankies',
    name: 'Silk hankies (mawata)',
    craft: 'fibre-arts',
    category: 'fibre-prepared',
    trainedEnvironmentOnly: false,
    notes:
      'Stretched-out silk cocoons laid in stacked squares. Pulled apart to spin or knit directly from the hankie. Lustrous, strong, takes dye richly.',
  },
  {
    slug: 'linen-weaving-warp',
    name: 'Linen weaving warp thread',
    craft: 'fibre-arts',
    category: 'warp-thread',
    trainedEnvironmentOnly: false,
    notes:
      'Strong, low-stretch warp thread spun from flax fibre. The classical warp for tabby weaving; less elastic than cotton so needs careful, even tensioning during beaming.',
  },
  {
    slug: 'cotton-weaving-warp',
    name: 'Cotton weaving warp thread (8/2, 10/2)',
    craft: 'fibre-arts',
    category: 'warp-thread',
    trainedEnvironmentOnly: false,
    notes:
      'Mercerised cotton warp thread in the standard handweaving sizes (8/2 medium, 10/2 fine). Strong, washable, takes dye well. The all-purpose warp for tabby, twill, overshot, rosepath.',
  },

  // ─── Dye plants — the working fibre-arts list. Each row cross-links
  //     a Plant table entry in Garden for the growing + harvesting
  //     tutorial; the dye-plant row here is the fibre-arts-facing
  //     "this much dried material gives this much colour" reference.
  {
    slug: 'dye-plant-weld',
    name: 'Weld (dried)',
    craft: 'fibre-arts',
    category: 'dye-plant',
    trainedEnvironmentOnly: false,
    notes:
      'Reseda luteola — the classical European yellow dye. Bright, fast yellow on alum-mordanted wool. Cross-link the Garden weld-growing tutorial for the source.',
  },
  {
    slug: 'dye-plant-madder',
    name: 'Madder root (dried)',
    craft: 'fibre-arts',
    category: 'dye-plant',
    trainedEnvironmentOnly: false,
    notes:
      'Rubia tinctorum — the classical European red. Orange-red on alum-mordanted wool; brick / brown shifts with iron after-bath. The roots are harvested at three to four years; cross-link the Garden madder tutorial.',
  },
  {
    slug: 'dye-plant-woad',
    name: 'Woad leaves (dried)',
    craft: 'fibre-arts',
    category: 'dye-plant',
    trainedEnvironmentOnly: false,
    notes:
      'Isatis tinctoria — the European blue, predecessor to indigo. Works via the same indigotin chemistry as Indigofera tinctoria but at lower yield. Vat-dyed (no mordant needed); see indigo for the vat method.',
  },
  {
    slug: 'dye-plant-indigo',
    name: 'Indigo (dried, powdered)',
    craft: 'fibre-arts',
    category: 'dye-plant',
    trainedEnvironmentOnly: false,
    notes:
      'Indigofera tinctoria — the tropical blue. Pre-powdered natural indigo, vat-reduced before dyeing. The blue runs deeper than woad and at higher concentration. No mordant needed; the chemistry is reductive vat dyeing.',
  },
  {
    slug: 'dye-plant-walnut-hulls',
    name: 'Walnut hulls (dried)',
    craft: 'fibre-arts',
    category: 'dye-plant',
    trainedEnvironmentOnly: false,
    notes:
      'Juglans regia hulls — high in juglone tannin. Substantive brown dye on wool with no mordant; iron after-bath deepens to a dark grey-black. Harvest the green outer husks before they fall in autumn.',
  },
  {
    slug: 'dye-plant-onion-skins',
    name: 'Onion skins (dried)',
    craft: 'fibre-arts',
    category: 'dye-plant',
    trainedEnvironmentOnly: false,
    notes:
      'The papery outer skins from yellow (or red) onions. Strong yellow-gold on alum-mordanted wool; copper-gold with iron after-bath. A kitchen-byproduct dye that gives substantial colour with no specialist source.',
  },
  {
    slug: 'dye-plant-oak-galls',
    name: 'Oak galls (dried, ground)',
    craft: 'fibre-arts',
    category: 'dye-plant',
    trainedEnvironmentOnly: false,
    notes:
      'High-tannin growths from Quercus species. Used as a tannin pre-mordant on cellulose fibres (cotton, linen) before alum, or with iron as a black ink / dye on wool.',
  },
  {
    slug: 'dye-plant-logwood',
    name: 'Logwood chips (dried)',
    craft: 'fibre-arts',
    category: 'dye-plant',
    trainedEnvironmentOnly: false,
    notes:
      'Haematoxylum campechianum heartwood. Purples and deep blacks on alum-mordanted wool; varies dramatically with mordant and pH. Historically the European "black" dye for naval uniforms.',
  },

  // ─── Mordants. Alum is the safe everyday mordant; iron and copper
  //     sulphate are trained-environment-only at studio quantity
  //     (long gloves, dedicated space, ventilation).
  {
    slug: 'mordant-alum-potash',
    name: 'Alum (potash, KAl(SO4)2·12H2O)',
    craft: 'fibre-arts',
    category: 'mordant',
    trainedEnvironmentOnly: false,
    notes:
      'Potassium aluminium sulphate — the everyday mordant for natural dyeing on wool. Used at 10-15% of fibre weight. Low chronic toxicity at handling quantity; still wear gloves and avoid breathing the powder. The starter mordant for every dyeing pipeline.',
  },
  {
    slug: 'mordant-alum-acetate',
    name: 'Alum acetate',
    craft: 'fibre-arts',
    category: 'mordant',
    trainedEnvironmentOnly: false,
    notes:
      'Aluminium acetate — the everyday mordant for cellulose fibres (cotton, linen, hemp). Lower-temperature mordant than potash alum; the cellulose-fibre dyer\'s alum.',
  },
  {
    slug: 'mordant-iron-sulphate',
    name: 'Iron sulphate (ferrous sulphate)',
    craft: 'fibre-arts',
    category: 'mordant',
    trainedEnvironmentOnly: true,
    hazardNotes:
      'Iron sulphate at studio quantity is a respiratory + skin irritant. Long gloves to mid-forearm mandatory; ventilate the workspace. Iron after-baths "sadden" colours toward grey-brown — small additions only (1-2% of fibre weight). Never returned to food prep utensils. Wastewater: small home quantities down a foul drain only — never into a storm drain, stream, or compost heap.',
    notes:
      'After-bath modifier that shifts plant-dye colours toward darker greys, olives, and browns. The classical iron-sad after-bath. Use sparingly — over-mordanting with iron weakens wool fibre over time.',
  },
  {
    slug: 'mordant-copper-sulphate',
    name: 'Copper sulphate',
    craft: 'fibre-arts',
    category: 'mordant',
    trainedEnvironmentOnly: true,
    hazardNotes:
      'Copper sulphate is toxic if ingested and a skin / lung irritant. Long gloves + ventilation + dedicated copper-only utensils mandatory. Never use copper sulphate in a pot that will later see food. Wastewater: small home quantities down a foul drain only — never into a storm drain, stream, or compost heap.',
    notes:
      'After-bath modifier that shifts plant-dye colours toward warmer greens and golds. Less aggressive than iron on fibre, but the same wastewater disposal rules apply. Used sparingly.',
  },
  {
    slug: 'mordant-cream-of-tartar',
    name: 'Cream of tartar',
    craft: 'fibre-arts',
    category: 'mordant',
    trainedEnvironmentOnly: false,
    notes:
      'Potassium bitartrate — added to alum mordant baths at 5-7% of fibre weight to brighten the resulting colour and keep wool soft. Food-safe (the same product as the kitchen-cupboard ingredient), but once mixed with alum the bath is no longer food-grade.',
  },
  {
    slug: 'mordant-soda-ash',
    name: 'Soda ash (sodium carbonate)',
    craft: 'fibre-arts',
    category: 'mordant',
    trainedEnvironmentOnly: false,
    notes:
      'Alkali used in scouring fibre before dyeing (raising pH of the wash bath) and in indigo vat construction. Wear gloves; avoid eye contact. Not a mordant in the classical sense, but lives in this category as a chemistry-modifying salt.',
  },

  // ─── Felting + nuno aids — soaps, sizes, gentle surfactants.
  {
    slug: 'olive-oil-soap',
    name: 'Olive-oil soap (felting)',
    craft: 'fibre-arts',
    category: 'felting-aid',
    trainedEnvironmentOnly: false,
    notes:
      'Mild olive-oil bar soap (Aleppo, castile, or equivalent). The traditional wet-felting soap — gentler on the fibre than dish detergent and effective at raising the surface scales for felting. Rub the bar across the wet roving or grate into hot water to make a soapy bath.',
  },
  {
    slug: 'carrageenan-fibre-arts',
    name: 'Carrageenan (nuno-felting + marbling)',
    craft: 'fibre-arts',
    category: 'felting-aid',
    trainedEnvironmentOnly: false,
    notes:
      'Seaweed-derived gel used as a size in nuno felting (to slow the felt-set on silk) and in paper-marbling (Paper & word category overlap). The same dry powder serves both; mix with cold water and let it hydrate overnight before use.',
  },

  // ─── Macramé cords — by working diameter + fibre.
  {
    slug: 'macrame-cord-cotton-3mm',
    name: 'Macramé cord, cotton, 3 mm',
    craft: 'fibre-arts',
    category: 'macrame-cord',
    trainedEnvironmentOnly: false,
    notes:
      'Single-twist or 3-ply cotton macramé cord at 3 mm working diameter. The everyday cord for small plant hangers and wall hangings. Soft, fringes easily.',
  },
  {
    slug: 'macrame-cord-cotton-5mm',
    name: 'Macramé cord, cotton, 5 mm',
    craft: 'fibre-arts',
    category: 'macrame-cord',
    trainedEnvironmentOnly: false,
    notes:
      'Heavier 5 mm cotton macramé cord. Holds knot shape with more presence; suits larger wall hangings + heavier plant hangers. Knots up faster than 3 mm at the cost of fringing softness.',
  },
  {
    slug: 'macrame-cord-jute',
    name: 'Macramé cord, jute',
    craft: 'fibre-arts',
    category: 'macrame-cord',
    trainedEnvironmentOnly: false,
    notes:
      'Coarse natural-fibre cord at 4-6 mm. Holds knots tightly; sheds fibre as you work. The garden-and-utility macramé cord — plant hangers that will live outdoors do better in jute than cotton.',
  },
  {
    slug: 'macrame-cord-hemp',
    name: 'Macramé cord, hemp',
    craft: 'fibre-arts',
    category: 'macrame-cord',
    trainedEnvironmentOnly: false,
    notes:
      'Fine-to-medium hemp cord at 1-3 mm. Smaller-scale macramé — jewellery and friendship-bracelet work. Stiffer than cotton; holds intricate patterns clearly.',
  },
  {
    slug: 'macrame-cord-linen',
    name: 'Macramé cord, linen',
    craft: 'fibre-arts',
    category: 'macrame-cord',
    trainedEnvironmentOnly: false,
    notes:
      'Linen cord at 2-4 mm. Smooth, low-stretch, takes natural dye well. The cord for the heirloom-quality wall hanging that should last decades.',
  },

  // ─── Rug yarns — bundles and pre-cut.
  {
    slug: 'rug-yarn-wool-strips',
    name: 'Rug-hooking wool strips',
    craft: 'fibre-arts',
    category: 'rug-yarn',
    trainedEnvironmentOnly: false,
    notes:
      'Wool fabric cut into 6 mm strips for traditional rug hooking. Recycled wool fabric (old suit lengths, blankets) is the historical material; commercial pre-cut strips also available in dyed colours.',
  },
  {
    slug: 'rug-yarn-latch-hook-bundles',
    name: 'Latch-hook yarn bundles',
    craft: 'fibre-arts',
    category: 'rug-yarn',
    trainedEnvironmentOnly: false,
    notes:
      'Pre-cut yarn pieces (typically 6 cm acrylic or wool, sold in colour packs) for latch-hook rugs. The kit-rug-making material; one bundle ties one row of knots.',
  },
  {
    slug: 'rug-yarn-hooking-wool',
    name: 'Hooking wool yarn',
    craft: 'fibre-arts',
    category: 'rug-yarn',
    trainedEnvironmentOnly: false,
    notes:
      'Robust 3- or 4-ply wool yarn intended for punch-needle and traditional rug-hooking work. Heavier than knitting yarn; takes wear and abrasion in floor use.',
  },
  {
    slug: 'rug-yarn-rag-strips',
    name: 'Rag-rug fabric strips',
    craft: 'fibre-arts',
    category: 'rug-yarn',
    trainedEnvironmentOnly: false,
    notes:
      'Strip-cut cotton or linen fabric (from old sheets, shirts, dresses) at 10-15 mm width. The rag-rug material — re-use of worn cloth into a hard-wearing floor textile.',
  },
]
