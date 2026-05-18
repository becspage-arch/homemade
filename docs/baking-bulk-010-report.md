# Baking bulk-010 — batch report

**Date:** 2026-05-18  
**Batch:** baking-bulk-010  
**Total uploaded:** 40 PUBLISHED  
**Baking total:** 422 → 462

---

## Sub-category breakdown

| Sub-category | Count |
|---|---|
| pastries | 12 |
| bread | 7 |
| biscuits | 7 |
| pies | 8 |
| cakes | 5 |
| sweets-confectionery | 1 |
| **Total** | **40** |

## Entries

| Slug | Sub-category | Difficulty |
|---|---|---|
| amaretti-crisp | biscuits | INTERMEDIATE |
| apple-pie-dutch-streusel | pies | INTERMEDIATE |
| babka-savoury-cheese-herb | pastries | INTERMEDIATE |
| bagels-montreal-style | bread | INTERMEDIATE |
| baklava-pistachio | pastries | INTERMEDIATE |
| beignets-new-orleans | pastries | INTERMEDIATE |
| biscotti-chocolate-hazelnut | biscuits | BEGINNER |
| bombolone | pastries | INTERMEDIATE |
| borodinsky-rye | bread | ADVANCED |
| brioche-a-tete | bread | ADVANCED |
| brioche-nanterre | bread | INTERMEDIATE |
| brownies-cream-cheese-swirl | cakes | INTERMEDIATE |
| brownies-gluten-free | cakes | BEGINNER |
| churros-chocolate-sauce | pastries | INTERMEDIATE |
| cupcakes-red-velvet | cakes | INTERMEDIATE |
| danish-pastry-plain | pastries | ADVANCED |
| eccles-cakes | pastries | INTERMEDIATE |
| focaccia-onion-thyme | bread | BEGINNER |
| hello-dolly-bars | biscuits | BEGINNER |
| krumkake | biscuits | INTERMEDIATE |
| kunafa-cheese | pastries | INTERMEDIATE |
| lemon-baked-cheesecake | pies | INTERMEDIATE |
| loukoumades | sweets-confectionery | INTERMEDIATE |
| maamoul-date-pistachio | biscuits | INTERMEDIATE |
| macarons-pistachio | biscuits | ADVANCED |
| melomakarona | biscuits | INTERMEDIATE |
| mince-pie-traybake-frangipane | pies | INTERMEDIATE |
| mississippi-mud-pie | pies | INTERMEDIATE |
| pane-di-altamura | bread | ADVANCED |
| pastiera-napoletana | pies | ADVANCED |
| pfeffernusse | biscuits | BEGINNER |
| pumpernickel-loaf | bread | ADVANCED |
| ricotta-cheesecake-sicilian | pies | INTERMEDIATE |
| ring-doughnuts-classic | pastries | INTERMEDIATE |
| shoofly-pie | pies | INTERMEDIATE |
| sticky-toffee-traybake | cakes | BEGINNER |
| sufganiyot | pastries | INTERMEDIATE |
| tarte-au-chocolat | pies | INTERMEDIATE |
| tarte-aux-framboises | pies | INTERMEDIATE |
| vanilla-slice | pastries | INTERMEDIATE |

Difficulty mix: ~5 BEGINNER / ~28 INTERMEDIATE / ~7 ADVANCED.

## Notable entries

- **danish-pastry-plain** — foundational: true. 500g flour, 250g butter block, 3 single turns (27 layers), 3-stage prove. The laminated pastry base for croissants, pain au chocolat, and all Danish variants.
- **pastiera-napoletana** — ADVANCED. 48h mandatory rest post-assembly; grano cotto (a specific wheat variety) as an ingredient; orange blossom water + ricotta filling. Easter-only in Naples.
- **brioche-a-tete** — ADVANCED. 100% enriched with butter and eggs. Fluted brioche tins required; head-knot shaping technique. Individual portions.
- **borodinsky-rye** — ADVANCED. 60% dark rye, 40% wholemeal, rye sourdough starter, coriander seed crust. Long bake (75 minutes at 180°C). Full-day process.
- **baklava-pistachio** — filo + clarified butter, flourWeightGrams: 0 (uses pre-made filo). Rose water syrup. flourWeightGrams correctly set to 0 per the pattern for filo/kataifi entries.
- **kunafa-cheese** — kataifi pastry, mozzarella + ricotta, orange blossom syrup. Served hot and immediately. flourWeightGrams: 0. Inverted onto a platter just before serving.
- **macarons-pistachio** — ADVANCED. Pistachio frangipane filling + Italian meringue shells. Relies on aged egg whites + precise macronage. High failure rate.

## Voice-check fixes

Two rounds of fixes applied before upload:

**Round 1 — glossaryTooltip attr name (all 40 files)**  
All 40 briefs were authored with `"attrs": { "slug": "term-slug" }` but `voice-check-lib.ts` reads `mark.attrs.termSlug`. Bulk-fixed via:
```
perl -i -pe 's/"type": "glossaryTooltip", "attrs": \{ "slug":/"type": "glossaryTooltip", "attrs": { "termSlug":/g'
```
Applied to all 40 files. This is a recurring authoring error carried from the bulk-005 pattern — the template needs updating.

**Round 2 — em-dash pairs (14 files)**  
14 files had em-dash pairs (one em-dash used to open a parenthetical, a second to close it), which is a hard voice-check error. Fixed file by file using `sed -i` — replaced the second em-dash with a comma, semicolon, colon, or closing parenthesis depending on the sentence structure. Files affected: brioche-a-tete, brioche-nanterre, babka-savoury-cheese-herb, danish-pastry-plain, focaccia-onion-thyme, borodinsky-rye, lemon-baked-cheesecake (3 instances), ricotta-cheesecake-sicilian, macarons-pistachio, vanilla-slice, mississippi-mud-pie, pastiera-napoletana, churros-chocolate-sauce, kunafa-cheese.

## Upload fix

Prisma client regeneration required before upload. Schema had `shelfLifeDays` added but the client wasn't current — all 40 uploads failed with `Unknown argument 'shelfLifeDays'` until:
```
pnpm --filter @homemade/db exec prisma generate
```
After regeneration: Uploaded: 40 | Failed: 0.
