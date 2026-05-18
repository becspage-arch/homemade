# Baking bulk-013 batch report

**Date:** 2026-05-18
**Session type:** Autopilot queue (scheduled hourly task) — continued across two context windows
**Model:** claude-sonnet-4-6

## Summary

| Metric | Value |
|---|---|
| Entries authored | 40 |
| Entries uploaded as PUBLISHED | 40 |
| Voice-check error files (total across both sessions) | ~25 |
| Voice-check fixes applied | ~38 (all em-dash pairs + 1 banned phrase) |
| Upload failures (first pass) | 0 |
| Baking total before | 534 |
| Baking total after | 574 |

## Sub-category distribution

| Sub-category | Added |
|---|---:|
| bread | 6 |
| cakes | 10 |
| biscuits | 9 |
| pies | 3 |
| scones | 4 |
| pastries | 2 |
| sweets-confectionery | 6 |
| **Total** | **40** |

## Entries authored

### Bread (6)
- `grissini-italian` — Roman breadsticks, INTERMEDIATE
- `knackebrod` — Swedish sourdough crispbread, INTERMEDIATE
- `pain-de-mie` — French sandwich loaf baked in covered tin, INTERMEDIATE
- `selkirk-bannock` — Scottish yeasted enriched loaf with sultanas, INTERMEDIATE
- `soda-farl` — Irish griddle-cooked soda bread, BEGINNER
- `staffordshire-oatcakes` — Griddle-cooked oat flatbreads, BEGINNER

### Cakes (10)
- `bread-and-butter-pudding` — Custard-soaked bread pudding, BEGINNER
- `christmas-pudding` — Steamed dried fruit pudding, INTERMEDIATE, WINTER
- `dobos-torte` — Seven-layer genoise with chocolate buttercream and caramel, ADVANCED
- `double-chocolate-muffins` — Bakery-style cocoa muffins with chocolate chips, BEGINNER
- `kladdkaka` — Swedish sticky chocolate cake, BEGINNER
- `morning-glory-muffins` — Carrot, apple, and coconut spiced muffins, BEGINNER
- `opera-cake` — French joconde sponge with coffee buttercream and ganache, ADVANCED
- `sachertorte` — Viennese chocolate cake with apricot and ganache, INTERMEDIATE
- `spotted-dick` — Steamed suet pudding with currants, BEGINNER
- `streuselkuchen` — German yeasted tray cake with cinnamon streusel, INTERMEDIATE

### Biscuits (9)
- `alfajores` — Argentinian dulce de leche sandwich biscuits, INTERMEDIATE
- `coconut-macaroons` — British chewy coconut mounds, BEGINNER, gluten-free
- `lace-cookies` — Thin oat lace biscuits, INTERMEDIATE
- `malted-milk-biscuits` — British malt-flavoured shortcake, BEGINNER
- `savoiardi` — Italian ladyfinger sponge fingers, INTERMEDIATE, foundational
- `scottish-oatcakes` — Crisp savoury oat crackers, BEGINNER
- `shrewsbury-biscuits` — English butter biscuits with lemon zest and currants, BEGINNER
- `vanillekipferl` — Austrian walnut crescents dusted in vanilla sugar, BEGINNER, WINTER
- `zimtsterne` — German cinnamon star meringue biscuits, INTERMEDIATE, WINTER, gluten-free

### Pies (3)
- `gooseberry-pie` — British double-crust gooseberry pie, INTERMEDIATE, SUMMER
- `strawberry-pie-fresh` — American fresh strawberry pie with cooked glaze, INTERMEDIATE, SUMMER
- `vinegar-pie` — American pioneer egg-and-vinegar custard pie, INTERMEDIATE

### Scones (4)
- `date-and-walnut-scones` — British scones with dates and walnuts, BEGINNER
- `oat-scones` — Scottish oat and flour scones, BEGINNER
- `potato-scones` — Scottish tattie scones, griddle-cooked, BEGINNER
- `pumpkin-scones` — Australian butternut squash scones, BEGINNER, AUTUMN

### Pastries (2)
- `rugelach` — Eastern European cream cheese crescent pastries, INTERMEDIATE
- `sfogliatelle` — Neapolitan shell pastries with ricotta filling, ADVANCED

### Sweets-confectionery (6)
- `caramel-popcorn` — Oven-dried caramel-coated popcorn with sea salt, INTERMEDIATE
- `chocolate-toffee-bark` — Dark chocolate with toffee shards and sea salt, INTERMEDIATE
- `crystallised-ginger` — Sugar-coated ginger pieces, INTERMEDIATE
- `mixed-nut-brittle` — Almond and peanut hard-crack brittle, INTERMEDIATE
- `pate-de-fruit-raspberry` — French raspberry fruit jellies, ADVANCED
- `sesame-halva` — Middle Eastern tahini halva, INTERMEDIATE, vegan

## Voice-check issues

The dominant failure mode across the batch was **em-dash pairs in `sourceNotes`** — the historical sourcing pattern `"formula — X, Y, Z — has remained unchanged"` produces two em dashes in one paragraph, violating the max-1-per-paragraph rule. This appeared in approximately 25 of 40 files.

A secondary cluster of em-dash pairs appeared in **body text** where parenthetical phrases used paired em dashes (e.g. `"schlagobers — whipped cream —"`, `"5 minutes — they are fragile while warm —"`).

Additionally, two files used `"essentially unchanged"` in sourceNotes, where `"essentially"` is a banned phrase.

| Category | Files affected | Fix applied |
|---|---:|---|
| sourceNotes `— description —` pairs | ~25 | Converted to `of description` or `(description)` |
| Body text `— phrase —` pairs | ~8 | Converted to parentheses or colon |
| Two separate em dashes in same method paragraph | 2 | Changed one to semicolon |
| Banned phrase "essentially" | 2 | Removed word |
| Excerpt `— contrast —` pair | 1 | Converted to `of…and` prose |

All errors were fixed before upload. Upload ran zero failures.

## Notable entries

- `savoiardi` — foundational: true; these are the base for tiramisu and charlottes
- `dobos-torte` and `opera-cake` — ADVANCED multi-component celebration cakes spanning full sessions
- `sfogliatelle` — ADVANCED; full rolling-and-coiling pastry technique with laminationRests: 2
- `pate-de-fruit-raspberry` — ADVANCED; pectin confection requiring precise 107°C gel point; no oven
- `sesame-halva` — vegan, dairyFree, glutenFree; soft-ball syrup technique

## Issues to add to common-issues.md / anti-tells

- **sourceNotes em-dash parentheticals** are the dominant batch failure. The formula `"subject — description of subject — verb"` produces a double em dash in what the voice-check treats as a single paragraph. Convert to `"subject of description verb"` or `"subject (description) verb"`.
- **"essentially"** is a banned word and appears in historical formula descriptions (`"has remained essentially unchanged"` → `"has remained unchanged"`).
