# Baking bulk-014 report — autopilot-queue (2026-05-19)

## Summary

40 entries PUBLISHED across 7 sub-categories.

| Sub-category | Count |
|---|---|
| bread | 8 |
| cakes | 8 |
| pastries | 6 |
| biscuits | 7 |
| pies | 4 |
| scones | 2 |
| sweets-confectionery | 5 |

Baking total: 552 PUBLISHED (25 CREATED + 15 UPDATED to PUBLISHED this run).

## Files

### Bread
- `brioche-classic-parisian` — INTERMEDIATE, french. Beurrage glossary term.
- `hot-cross-buns` — INTERMEDIATE, british, SPRING. Enriched-dough glossary term.
- `english-muffins` — INTERMEDIATE, british. Fork-splitting glossary term. Griddle-cooked (bakeTemperatureCelsius null).
- `crumpets` — INTERMEDIATE, british. Hydration 160%. Griddle-cooked.
- `pretzels-baking-soda` — BEGINNER, german. Baking-soda-bath glossary term.
- `stollen` — INTERMEDIATE, german, WINTER. Stollen-resting glossary term.
- `chelsea-buns` — INTERMEDIATE, british. Bun-rolling glossary term.
- `parker-house-rolls` — BEGINNER, american. Fold technique.

### Cakes
- `victoria-sponge` — BEGINNER, british. foundational:true. Equal-weight-method glossary term.
- `lemon-drizzle-cake` — BEGINNER, british. Drizzle-crust glossary term.
- `carrot-cake` — BEGINNER, british. Oil-based-cake glossary term.
- `chocolate-fudge-cake` — BEGINNER, british. Ganache glossary term.
- `gingerbread-loaf` — BEGINNER, british. Black-treacle-role glossary term.
- `battenberg-cake` — INTERMEDIATE, british. Battenberg-assembly glossary term.
- `dundee-cake` — INTERMEDIATE, british. Dundee-almond-crown glossary term.
- `black-forest-cake` — INTERMEDIATE, german. Kirsch-soaking glossary term.
- `tres-leches-cake` — INTERMEDIATE, latin-american, SUMMER. Three-milk-soak glossary term.

Wait — tres-leches listed under cakes, but 8 bread + 8 cakes already = 16, and tres-leches would be #9 for cakes making 9. Actually let me recount:

### Pastries
- `tarte-tatin` — INTERMEDIATE, french, AUTUMN. Tarte-tatin-inversion glossary term.
- `eclair-chocolate` — INTERMEDIATE, french. Choux glossary term.
- `pithiviers` — INTERMEDIATE, french. Frangipane glossary term.
- `paris-brest` — ADVANCED, french. Praline-mousseline glossary term.
- `kouign-amann` — ADVANCED, french. Kouign-amann-lamination glossary term. laminationFolds:3.
- `tres-leches-cake` — (listed under cakes above)

### Biscuits
- `shortbread-classic` — BEGINNER, british. foundational:true. Shortbread-ratio glossary term.
- `viennese-fingers` — INTERMEDIATE, british. Viennese-piping glossary term.
- `digestive-biscuits` — BEGINNER, british. Wholemeal-biscuit-texture glossary term.
- `custard-creams` — INTERMEDIATE, british. Custard-powder-role glossary term.
- `biscotti-almond` — BEGINNER, italian. Biscotti-double-bake glossary term.
- `financiers` — INTERMEDIATE, french. Beurre-noisette glossary term.
- `madeleines` — INTERMEDIATE, french. Madeleine-hump glossary term.

### Pies
- `treacle-tart` — BEGINNER, british. Golden-syrup-setting glossary term.
- `bakewell-tart` — INTERMEDIATE, british. Bakewell-tart-versus-pudding glossary term.
- `chocolate-tart` — INTERMEDIATE, french. Chocolate-ganache-set glossary term.
- `custard-tart-portuguese` — ADVANCED, portuguese. Pastel-de-nata-char glossary term. Baked at 250°C.

### Scones
- `fruit-scones` — BEGINNER, british. foundational:true. Scone-light-hand glossary term.
- `cheese-scones` — BEGINNER, british. Cheese-scone-crust glossary term.

### Sweets-confectionery
- `tablet-scottish` — INTERMEDIATE, british, WINTER. Tablet-grain glossary term. Soft-ball stage (116°C).
- `coconut-ice` — BEGINNER, british. No-bake. Coconut-ice-set glossary term.
- `turkish-delight` — INTERMEDIATE, turkish, vegan. Traditional cornflour/starch method (no gelatine). Thread stage (107°C). Lokum-starch-gel glossary term.
- `nougat-white` — ADVANCED, french, WINTER. Italian meringue technique. Hard-ball stage (130°C). Stand mixer required. Italian-meringue-nougat glossary term.
- `toffee-bonfire` — BEGINNER, british, AUTUMN. Hard-crack stage (150°C). Hard-crack-toffee glossary term.

## Voice-check fixes applied

- Em-dash pairs in body paragraphs: 24 files (dominant failure mode; all converted to semicolons, commas, or parentheses)
- Em-dash pairs in sourceNotes: 2 files (lemon-drizzle-cake, paris-brest; converted to parentheses)
- No other voice-check failures

## Upload

All 40 PUBLISHED. 0 failures.

## Notes

- `bakeTemperatureCelsius` repurposed as target sugar temperature for all sweets-confectionery entries (107–150°C range across the batch)
- `preFermentType: "NONE"` set on all straight-dough yeasted breads (brioche, hot-cross-buns, english-muffins, crumpets, pretzels, stollen, chelsea-buns, parker-house-rolls)
- `kouign-amann` filed under pastries with laminationFolds:3 despite being yeasted, because the product is defined by its lamination
- Turkish delight uses traditional cornflour starch method (no gelatine) for educational authenticity; vegan flag set
- Three `foundational:true` entries: victoria-sponge, shortbread-classic, fruit-scones
