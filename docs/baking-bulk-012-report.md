# Baking bulk-012 batch report

**Date:** 2026-05-18
**Session type:** Autopilot queue (scheduled hourly task)
**Model:** claude-sonnet-4-6

## Summary

| Metric | Value |
|---|---|
| Entries authored | 40 |
| Entries uploaded as PUBLISHED | 40 |
| Voice-check errors | 5 (all fixed before upload) |
| Upload failures (first pass) | 3 (sub-category slug, tool slug — all fixed) |
| Baking total before | 497 |
| Baking total after | 534 |
| Net new entries | +37 (3 were updates to pre-existing slugs) |

## Sub-category distribution (estimated)

| Sub-category | Before | Added | Approx. after |
|---|---:|---:|---:|
| bread | 102 | 6 | ~108 |
| cakes | 112 | 9 | ~121 |
| biscuits | 73 | 8 | ~81 |
| pies | 60 | 6 | ~66 |
| scones | 31 | 4 | ~35 |
| pastries | 53 | 3 | ~56 |
| cake-decorating | 27 | 2 | ~29 |
| sweets-confectionery | 41 | 2 | ~43 |

## Entries authored

### Bread (6)
- `dinner-rolls` — Pull-apart enriched dinner rolls, BEGINNER
- `challah-round` — Honey-enriched coiled challah crown, INTERMEDIATE, AUTUMN
- `cinnamon-rolls-scandinavian` — Knotted Scandinavian cinnamon buns, INTERMEDIATE
- `cardamom-buns` — Cardamom-dough knotted buns, INTERMEDIATE
- `soda-bread-brown` — Wholemeal soda bread, BEGINNER
- `banana-bread-classic` — Classic banana quick bread, BEGINNER

### Cakes (9)
- `coffee-walnut-cake` — Coffee and walnut sandwich cake, BEGINNER
- `victoria-sponge-buttercream` — Victoria sponge with buttercream, BEGINNER
- `tea-loaf-overnight` — Dried fruit loaf soaked overnight in tea, BEGINNER
- `christmas-cake` — Rich fruitcake with brandy feeds, INTERMEDIATE, WINTER
- `genoise` — Whole-egg foam sponge, INTERMEDIATE, foundational
- `swiss-roll` — Hot-roll sponge with jam, INTERMEDIATE
- `pavlova` — Meringue with marshmallow centre, INTERMEDIATE, SUMMER
- `sticky-toffee-cake` — Medjool date cake with toffee sauce, INTERMEDIATE, AUTUMN
- `lemon-poppyseed-cake` — Lemon drizzle with poppy seeds, BEGINNER, SPRING

### Biscuits (8)
- `hobnobs` — Oat and golden syrup biscuits, BEGINNER
- `gingerbread-biscuits` — Rolled cookie-cutter gingerbread, BEGINNER, WINTER
- `easter-biscuits` — Spiced currant biscuits with egg-white glaze, BEGINNER, SPRING
- `brandy-snaps` — Lace biscuits rolled on a spoon handle, INTERMEDIATE
- `stroopwafels` — Dutch waffle discs with caramel syrup, INTERMEDIATE
- `palmiers` — Puff pastry hearts caramelised in sugar, INTERMEDIATE
- `flapjacks` — Golden oat traybake, BEGINNER
- `cakey-brownies` — Chocolate traybake with set crumb, BEGINNER

### Pies (6)
- `key-lime-pie` — Biscuit base, condensed milk and lime filling, INTERMEDIATE, SUMMER
- `lemon-tart` — Pâte sucrée case with lemon custard, INTERMEDIATE, SPRING
- `apple-pie-double-crust` — Double shortcrust with Bramley filling, INTERMEDIATE, AUTUMN
- `mince-pies` — Sweet shortcrust individual cases, BEGINNER, WINTER
- `pumpkin-pie` — Blind-baked case with spiced pumpkin custard, INTERMEDIATE, AUTUMN
- `pecan-pie` — Blind-baked case with golden syrup and pecan filling, INTERMEDIATE

### Scones (4)
- `buttermilk-scones-plain` — Classic British buttermilk scones, BEGINNER
- `treacle-scones` — Dark Scottish scones with black treacle, BEGINNER
- `vegan-scones` — Plant butter and oat milk scones, BEGINNER, vegan
- `welsh-cakes` — Griddle-cooked spiced currant cakes, BEGINNER

### Pastries (3)
- `profiteroles` — Choux buns with cream and chocolate sauce, INTERMEDIATE
- `gougeres` — Savoury choux with Gruyère, INTERMEDIATE
- `croissants` — Full laminated yeasted pastry, ADVANCED

### Cake-decorating (2)
- `fondant-cake-covering` — Rolling and applying sugarpaste, INTERMEDIATE
- `royal-icing-flat` — Flat-coat royal icing for fruitcakes, INTERMEDIATE, WINTER

### Sweets-confectionery (2)
- `honeycomb` — Hard-crack caramel foamed with bicarbonate of soda, INTERMEDIATE
- `fudge-vanilla` — Beaten cream fudge to soft ball stage, INTERMEDIATE

## Voice-check issues

All 5 were em-dash pairs — two em dashes in one sentence, caught by `em-dash-paragraph` and `em-dash-sentence` rules:

| File | Location | Fix |
|---|---|---|
| `fudge-vanilla` | sourceNotes | Converted parenthetical em-dash pair to colon |
| `honeycomb` | body intro paragraph | Converted "— 150°C —" to "(150°C)" |
| `honeycomb` | method paragraph | Replaced two em dashes with paraphrase |
| `pumpkin-pie` | sourceNotes | Converted parenthetical em-dash pair to parentheses |
| `vegan-scones` | sourceNotes | Converted "The technique — ... — is identical" to colon |
| `welsh-cakes` | excerpt | Converted "Welsh cakes — picau ar y maen —" to parentheses |

## Upload errors

| File | Error | Fix |
|---|---|---|
| `fudge-vanilla` | `Sub-category "sweets" not found` | Changed to `sweets-confectionery` |
| `honeycomb` | `Sub-category "sweets" not found` | Changed to `sweets-confectionery` |
| `welsh-cakes` | `frying-pan` not in master tools table | Changed to `frying-pan-26` |

## Issues to add to common-issues.md

- Sub-category for baking sweets is `sweets-confectionery`, not `sweets`. This is a recurring trap (now 3rd occurrence across batches).
- Parenthetical em-dash pairs (— text —) reliably fail voice-check. Convert to parentheses or restructure to a colon.
