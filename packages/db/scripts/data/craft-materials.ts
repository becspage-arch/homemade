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
]
