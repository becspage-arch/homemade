# Baking bulk-003 — batch report

**Session:** parallel-burner loop, 2026-05-17  
**Model:** Sonnet  
**Uploaded:** 49 entries, all PUBLISHED  
**Sub-categories:** bread (21), cakes (20), scones (3), biscuits (5)

---

## Counts

| Sub-category | This batch | Cumulative |
|---|---:|---:|
| bread | 21 | 34 |
| cakes | 20 | 33 |
| scones | 3 | 15 |
| biscuits | 5 | 23 |
| pies | 0 | 19 |
| pastries | 0 | 20 |
| sweets-confectionery | 0 | 13 |
| cake-decorating | 0 | 5 |
| **Total** | **49** | **162** |

Library total: **158 PUBLISHED** (10 pilot + 50 bulk-001 + 50 bulk-002 + 49 bulk-003). Note: cumulative column includes pilot-10 and bulk-001/002 which span all sub-categories; per-sub counts above reflect post-bulk-003 state.

Difficulty breakdown: 21 BEGINNER / 24 INTERMEDIATE / 4 ADVANCED.

---

## Entries

### Bread (21)

- `wholemeal-sandwich-loaf` — INTERMEDIATE — foundational loaf
- `soft-white-rolls` — BEGINNER
- `challah-six-strand` — INTERMEDIATE — six-strand braid
- `bagels-new-york` — INTERMEDIATE — boiled and baked
- `babka-chocolate` — INTERMEDIATE — enriched, twisted
- `crumpets-yeasted` — INTERMEDIATE — griddle-cooked
- `dinner-rolls-pull-apart` — BEGINNER
- `bloomer-split-top` — INTERMEDIATE — scored free-form loaf
- `cardamom-buns-swedish` — INTERMEDIATE — enriched knots
- `cinnamon-rolls-american` — INTERMEDIATE — cream cheese iced
- `stollen-christmas` — INTERMEDIATE — season: WINTER, marzipan core
- `sourdough-sandwich-loaf` — INTERMEDIATE — preFermentType: LEVAIN
- `whole-wheat-sourdough` — INTERMEDIATE — preFermentType: LEVAIN, overnight retard
- `sourdough-discard-crackers` — BEGINNER — uses unfed starter
- `soda-bread-brown-wholemeal` — BEGINNER — cuisine: irish
- `courgette-lemon-loaf` — BEGINNER — quick loaf with lemon drizzle
- `date-and-walnut-loaf` — BEGINNER — boiling water method
- `cornbread-southern` — BEGINNER — cuisine: american, hot-tin method
- `pretzel-rolls-soft` — INTERMEDIATE — cuisine: german, bicarbonate dip
- `parker-house-rolls` — BEGINNER — cuisine: american, folded rolls
- `hot-cross-buns` — INTERMEDIATE — season: SPRING, spiced with dried fruit

### Cakes (20)

- `lemon-polenta-cake` — BEGINNER — gluten-free, lemon syrup
- `olive-oil-cake-italian` — BEGINNER — cuisine: italian
- `coffee-cake-american-streusel` — BEGINNER — cuisine: american, cinnamon streusel
- `apple-cake-german` — BEGINNER — season: AUTUMN, sunken fruit
- `dorset-apple-cake` — BEGINNER — season: AUTUMN, demerara crust
- `sticky-ginger-cake` — BEGINNER — season: AUTUMN, treacle-based
- `yorkshire-parkin` — BEGINNER — season: AUTUMN, must mature 3–7 days
- `madeira-cake` — BEGINNER — foundational, creaming method
- `banana-loaf-classic` — BEGINNER — foundational, 4 overripe bananas
- `boiled-fruit-cake` — BEGINNER — boiled-cake method
- `christmas-cake-aged` — INTERMEDIATE — season: WINTER, fed with kirsch
- `black-forest-cake` — INTERMEDIATE — cuisine: german, kirsch syrup soak
- `chocolate-fudge-cake` — INTERMEDIATE — fudge frosting
- `red-velvet-cake` — INTERMEDIATE — cuisine: american, cream cheese frosting
- `coffee-walnut-layer-cake` — BEGINNER — cuisine: british, coffee buttercream
- `pavlova-meringue` — INTERMEDIATE — slow-cool pavlova method
- `burnt-basque-cheesecake` — INTERMEDIATE — cuisine: spanish, 220°C caramelised top
- `no-bake-vanilla-cheesecake` — BEGINNER — cold-set, oat base
- `brownies-fudgy` — BEGINNER — foundational
- `salted-caramel-brownies` — INTERMEDIATE — caramel swirl

### Scones (3)

- `vegan-scones-coconut-oil` — BEGINNER — dietaryFlags: vegan, dairyFree
- `welsh-cakes-griddle` — BEGINNER — griddle-cooked, no oven
- `fat-rascals-yorkshire` — BEGINNER — cherry and almond topping

### Biscuits (5)

- `ginger-nuts-crunchy` — BEGINNER — foundational, snap biscuit
- `bourbon-biscuits-homemade` — BEGINNER — sandwich biscuit
- `oatmeal-raisin-cookies` — BEGINNER — cuisine: american, drop cookie
- `peanut-butter-cookies` — BEGINNER — cuisine: american, cross-hatch
- `amaretti-soft-italian` — BEGINNER — cuisine: italian, gluten-free, dairy-free

---

## Upload run

- **Run 1:** 36 created, 3 updated (hot-cross-buns, parker-house-rolls, peanut-butter-cookies were from a prior test upload), 13 failed.
- **Failures:** all em-dash pairs (2 em dashes in one paragraph/sentence) in excerpt, sourceNotes, or body text. One ingredient slug miss: `lemon-juice` not in master table (removed from no-bake-vanilla-cheesecake).
- **Run 2 (13 files):** 13 created, 0 failed.
- **Final:** 49/49 PUBLISHED.

## Anti-tell patterns (recurring, 3+ times)

- **Double em dash in excerpts:** 4 entries had "— phrase —" in the excerpt. Pattern: appositive phrases wrapped in em dashes. Fix: use commas or parentheses. Added to watch list.
- **Double em dash in sourceNotes:** 5 entries had "— clause —" constructions in public-domain citations. Pattern: inline parenthetical notes embedded mid-sentence. Fix: use parentheses.
- **Double em dash spanning multi-text-node paragraphs:** 2 entries had one em dash in a text node before a glossaryTooltip and another in the text node after. Voice checker concatenates the full paragraph. Fix: ensure the post-tooltip continuation text uses a semicolon or period rather than an em dash when the pre-tooltip text already carries one.
