# Baking bulk-004 — batch report

**Session:** parallel-burner loop, 2026-05-17  
**Model:** Sonnet  
**Uploaded:** 50 entries, all PUBLISHED  
**Sub-categories:** pies (7), pastries (8), biscuits (10), cakes (10), bread (7), scones (3), sweets-confectionery (5)

---

## Counts

| Sub-category | This batch | Cumulative |
|---|---:|---:|
| bread | 7 | 41 |
| cakes | 10 | 43 |
| scones | 3 | 18 |
| biscuits | 10 | 33 |
| pies | 7 | 26 |
| pastries | 8 | 28 |
| sweets-confectionery | 5 | 18 |
| cake-decorating | 0 | 5 |
| **Total** | **50** | **212** |

Library total: **208 PUBLISHED** (10 pilot + 50 bulk-001 + 50 bulk-002 + 49 bulk-003 + 50 bulk-004).

Difficulty breakdown: 17 BEGINNER / 31 INTERMEDIATE / 2 ADVANCED.

---

## Entries

### Scones / quickbreads (3)
- `cathead-biscuits-southern` — Southern cathead biscuits, lard-and-buttermilk, tall and split
- `cheddar-chive-american-biscuits` — Drop biscuits with cheddar and chive
- `singin-hinnies-griddle` — Northumbrian griddle scones with currants

### Biscuits (10)
- `shortbread-all-butter-rounds` — All-butter shortbread rounds (BEGINNER)
- `petticoat-tails-shortbread` — Scottish petticoat tails (BEGINNER)
- `garibaldi-biscuits` — Currant sandwich biscuits (BEGINNER)
- `chocolate-digestives` — Wholemeal digestives dipped in milk chocolate (BEGINNER)
- `easter-biscuits` — Somerset-style spiced Easter biscuits (BEGINNER)
- `cornish-fairings` — Crisp ginger biscuits with bicarbonate crackle (BEGINNER)
- `empire-biscuits` — Jam-filled shortbread with fondant glaze (INTERMEDIATE)
- `biscotti-chocolate-hazelnut` — Twice-baked chocolate and hazelnut biscotti (INTERMEDIATE)
- `brown-butter-chocolate-chip-cookies` — Browned-butter cookies (INTERMEDIATE)
- `speculaas-dutch-spiced` — Dutch spice biscuits, winter (INTERMEDIATE)

### Cakes (10)
- `victoria-sponge` — Classic all-in-one Victoria sponge, foundational (BEGINNER)
- `lemon-drizzle-loaf` — Lemon drizzle loaf with crisp icing (BEGINNER)
- `coconut-lime-traybake` — Coconut and lime traybake with drizzle (BEGINNER)
- `carrot-cake-cream-cheese` — Layer carrot cake with cream cheese frosting (INTERMEDIATE)
- `dundee-cake` — Classic Scottish fruit cake with almond crown (INTERMEDIATE)
- `swiss-roll-vanilla` — Fatless sponge Swiss roll with cream and jam (INTERMEDIATE)
- `battenberg-cake` — Pink-and-yellow Battenberg with marzipan (INTERMEDIATE)
- `almond-financiers` — Brown-butter French financiers (INTERMEDIATE)
- `devils-food-cake` — American dark chocolate layer cake (INTERMEDIATE)
- `sticky-toffee-pudding-cake` — Traybake sticky toffee pudding (INTERMEDIATE)

### Bread (7)
- `focaccia-herb-sea-salt` — Herb and sea salt focaccia (BEGINNER, vegan)
- `pita-bread-homemade` — Stovetop-blistered pita (BEGINNER, vegan)
- `brioche-enriched` — Classic enriched brioche loaf, overnight retard (INTERMEDIATE)
- `english-muffins-stovetop` — Griddle-cooked English muffins (INTERMEDIATE)
- `tiger-bread-dutch-crunch` — Rice-paste crackle-top loaf (INTERMEDIATE)
- `rye-bread-dark-scandinavian` — Dark Scandinavian rye sourdough (INTERMEDIATE, vegan)
- `milk-bread-japanese-shokupan` — Tangzhong Japanese milk bread (INTERMEDIATE)

### Pies (7)
- `treacle-tart` — Breadcrumb and golden-syrup tart (BEGINNER)
- `mince-pies-christmas` — Shortcrust mince pies, winter (BEGINNER)
- `lemon-meringue-pie` — Cornflour lemon curd under soft meringue (INTERMEDIATE)
- `apple-pie-traditional` — Deep double-crust Bramley apple pie, autumn (INTERMEDIATE)
- `quiche-lorraine` — Classic lardons and Gruyère custard tart (INTERMEDIATE)
- `custard-tart-british` — Baked egg custard in shortcrust case (INTERMEDIATE)
- `mississippi-mud-pie` — Dense chocolate brownie with marshmallows and ganache (INTERMEDIATE)

### Pastries (8)
- `profiteroles-cream-filled` — Choux buns with cream and chocolate sauce (INTERMEDIATE)
- `eclairs-chocolate` — Chocolate-glazed choux éclairs (INTERMEDIATE)
- `sausage-rolls-rough-puff` — Rough-puff sausage rolls (INTERMEDIATE)
- `vol-au-vents-mushroom` — Puff pastry cases with creamy mushroom filling (INTERMEDIATE)
- `spanakopita-spinach-feta` — Greek spinach and feta filo pie (INTERMEDIATE)
- `apple-strudel-filo` — Filo strudel with Bramley apple and cinnamon, autumn (INTERMEDIATE)
- `paris-brest-praline` — Choux ring with hazelnut praline cream (ADVANCED)
- `pithivier-almond-cream` — Puff pastry with almond cream, spiral scored (INTERMEDIATE)

### Sweets & confectionery (5)
- `fudge-vanilla-scottish` — Condensed milk fudge to soft-ball stage (INTERMEDIATE)
- `scottish-tablet-traditional` — Scottish tablet, crumbly and granular (INTERMEDIATE)
- `nougat-vanilla-almond` — Italian torrone with whole roasted almonds (ADVANCED)
- `marshmallows-homemade` — Gelatine marshmallows, vanilla (INTERMEDIATE)
- `rocky-road-chocolate` — No-bake chocolate traybake with marshmallows and cherries (BEGINNER)

---

## Voice-check: fixes on first run

Pattern: **em-dash appositive pairs in sourceNotes** — the dominant failure mode across all baking batches. 11 files affected (profiteroles, eclairs, vol-au-vents, fudge, marshmallows, mince-pies, nougat, paris-brest, pithivier, devils-food-cake, rye-bread). All fixed by converting `X — description — verb` constructions to `X, description, verb` form.

Additional fixes:
- `cornish-fairings` — "treats" flagged as medical-claim watchword in sourceNotes; changed to "confections sold at fairgrounds"
- `scottish-tablet-traditional` — em-dash pair in body paragraph[0] + pair in paragraph[7] (2 fixes)
- `marshmallows-homemade` — second em-dash pair in body paragraph[0] intro
- `speculaas-dutch-spiced` — banned phrase "essentially" in body; changed to "is a spiced shortbread"
- `rye-bread-dark-scandinavian` — em-dash pair in body paragraph[8] method step

No new ingredient slug misses. No new tool slug misses. No new anti-tells patterns identified.

---

## Skip list additions for batch-005

These 50 slugs must not be re-drafted. See `docs/baking-bulk-004-briefs/` for the full file list.
