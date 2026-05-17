# Baking bulk-005 batch report

**Date:** 2026-05-17  
**Session:** parallel-burner loop (Sonnet)  
**Entries published:** 50 PUBLISHED  
**Baking total before:** 258 → **308**

---

## Sub-category breakdown

| Sub-category | Count |
|---|---|
| Bread | 7 |
| Cakes | 11 |
| Pastries | 11 |
| Pies | 5 |
| Scones | 5 |
| Biscuits | 7 |
| Sweets | 4 |

---

## Slugs published

angel-food-cake, apple-frangipane-tart, apple-galette-rough-puff, babka-cinnamon, baguette-homemade, bath-buns-sweet-yeasted, battenberg-cake, beer-bread, chiffon-cake, chocolate-swiss-roll, chouquettes-sugar-puffs, cornish-saffron-cake, devonshire-splits, dorset-knobs-biscuit, dundee-cake, florentines-chocolate, fougasse-herb, gateau-basque-cherry, genoa-cake-light-fruit, genoise-sponge-classic, iced-finger-buns, langues-de-chat, lemon-curd-tart, lemon-poppyseed-loaf, lemonade-scones-quick, lussekatter-swedish-saffron, macarons-raspberry, madeleines-lemon, mille-feuille-vanilla, multiseed-loaf, paris-brest, parkin-yorkshire, pastel-de-nata, pecan-bourbon-tart, pizzelle-italian-wafer, potato-scones-scottish, sfogliatelle-ricotta, simnel-cake-easter, sourdough-discard-crumpets, sourdough-focaccia, spelt-sourdough-loaf, squab-pie-west-country, stargazy-pie-cornish, stroopwafels-dutch-syrup, tea-loaf-overnight-fruit, treacle-ginger-tart, tuile-almond, walnut-coffee-cake, wholemeal-scones, yorkshire-curd-tart

---

## Issues fixed before upload

**Voice-check failures (22 files):**
- Em-dash appositive pairs `— X —` replaced with commas, parentheses, colons, or sentence rewrites. Concentrated in `sourceNotes` (multi-source citation chains written as `— Source Title — date`) and intro paragraphs around `glossaryTooltip` marks.
- Two files contained the banned phrase "essentially" — removed.
- All 50 files had `"attrs": { "slug": "…" }` in `glossaryTooltip` marks instead of `"attrs": { "termSlug": "…" }` — fixed in bulk via sed.

**Upload failures:**

1. **Wrong difficulty enum values (21 files):** Drafts used `EASY` and `HARD`, which are not valid Prisma enum values. The schema uses `BEGINNER / INTERMEDIATE / ADVANCED`. All `EASY` → `BEGINNER`, all `HARD` → `ADVANCED`. This affected 17 + 4 files respectively and is the largest single failure category in this batch.

2. **Invalid sourceType "ORIGINAL" (2 files):** `lemon-poppyseed-loaf` and `multiseed-loaf` used `"sourceType": "ORIGINAL"` which is not a valid enum value. Corrected to `"CLASSIC"` (classic precedent, cross-referenced across multiple sources) — both are well-documented British baking staples without a single canonical source.

3. **Missing tool slugs (2 files):**
   - `gateau-basque-cherry`: used `round-cake-tin-22` — no 22 cm tin in the master table; corrected to `round-cake-tin-23` (closest available).
   - `paris-brest`: used `electric-mixer` — no such slug; corrected to `hand-mixer`.

---

## Patterns observed (3+ occurrences this batch)

- **EASY / HARD difficulty values** — see entry added to `docs/baking-anti-tells.md` and `docs/common-issues.md`. The correct enum values are `BEGINNER / INTERMEDIATE / ADVANCED`. This should be caught in self-critique before upload.
- **`glossaryTooltip` `slug` vs `termSlug`** — already documented in `docs/baking-anti-tells.md`. All 50 files needed the bulk fix this session; the pattern is stable but re-emerges on new batches. The field name should be memorised or read from a known-good example before writing.

---

## Quality notes

No quality drift detected. Voice warnings were predominantly tricolons (expected) and one "fall" Americanism in the apple galette notes. Method prose was specific and correctly used scaling tokens throughout. Difficulty calibration was correct in intent (just wrong enum names): most BEGINNER recipes were genuinely accessible quick bakes; ADVANCED recipes (baguette, sfogliatelle, macarons, mille-feuille) correctly identified the technical difficulty.
