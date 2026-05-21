# Wood & natural craft bulk-004 — batch report

**Date:** 2026-05-21  
**Session:** autopilot-queue  
**Status:** 40 entries PUBLISHED  
**Category count:** Wood-natural-craft 120 → 160

---

## Entries published

### Spoon-carving (7 PATTERN + 1 READING = 8 entries)

| # | Slug | Type | Difficulty |
|---|------|------|-----------|
| 01 | carved-birch-serving-fork | PATTERN | BEGINNER |
| 02 | carved-beech-mustard-spoon | PATTERN | BEGINNER |
| 03 | carved-hazel-preserve-spoon | PATTERN | BEGINNER |
| 04 | carved-oak-mixing-spoon | PATTERN | INTERMEDIATE |
| 05 | carved-sycamore-tea-caddy-spoon | PATTERN | BEGINNER |
| 06 | carved-cherry-dessert-server | PATTERN | INTERMEDIATE |
| 07 | spoon-blank-drying-guide | READING | BEGINNER |
| 40 | wood-finishing-oils-compared | READING | BEGINNER |

### Whittling (4 PATTERN + 1 TECHNIQUE = 5 entries)

| # | Slug | Type | Difficulty |
|---|------|------|-----------|
| 08 | whittled-oak-letter-seal | PATTERN | BEGINNER |
| 09 | whittled-birch-hair-comb | PATTERN | BEGINNER |
| 10 | whittled-sycamore-cocktail-pick | PATTERN | BEGINNER |
| 11 | chip-carved-beech-mirror-frame | PATTERN | INTERMEDIATE |
| 12 | wood-spirit-relief-carving | TECHNIQUE | ADVANCED |
| 39 | carved-hawthorn-walking-stick | PATTERN | INTERMEDIATE |

### Green woodwork (5 PATTERN + 2 TECHNIQUE = 7 entries)

| # | Slug | Type | Difficulty |
|---|------|------|-----------|
| 13 | riven-ash-chair-rung | PATTERN | INTERMEDIATE |
| 14 | green-oak-tool-tote | PATTERN | INTERMEDIATE |
| 15 | riven-cherry-mallet | PATTERN | INTERMEDIATE |
| 16 | coppice-willow-withy-ties | PATTERN | BEGINNER |
| 17 | green-ash-roughing-a-spoon-blank | TECHNIQUE | BEGINNER |
| 18 | pole-lathe-drive-centre-use | TECHNIQUE | INTERMEDIATE |
| 19 | green-woodwork-moisture-testing | READING | BEGINNER |

### Basketry-willow (5 PATTERN + 1 TECHNIQUE = 6 entries)

| # | Slug | Type | Difficulty |
|---|------|------|-----------|
| 20 | willow-laundry-basket | PATTERN | INTERMEDIATE |
| 21 | rush-plait-table-runner | PATTERN | BEGINNER |
| 22 | willow-plant-pot-sleeve | PATTERN | BEGINNER |
| 23 | willow-fruit-bowl | PATTERN | INTERMEDIATE |
| 24 | hazel-pea-sticks | PATTERN | BEGINNER |
| 25 | willow-fishing-creel | PATTERN | ADVANCED |
| 26 | rush-chair-back-panel | PATTERN | INTERMEDIATE |

### Seasoned wood (5 PATTERN + 2 TECHNIQUE = 7 entries)

| # | Slug | Type | Difficulty |
|---|------|------|-----------|
| 27 | cherry-hand-mirror-frame | PATTERN | INTERMEDIATE |
| 28 | pine-display-box-sliding-lid | PATTERN | BEGINNER |
| 29 | oak-serving-board-through-tenon | PATTERN | INTERMEDIATE |
| 30 | beech-bread-bin | PATTERN | ADVANCED |
| 31 | walnut-pencil-box | PATTERN | BEGINNER |
| 32 | ash-serving-tray | PATTERN | INTERMEDIATE |
| 33 | through-tenon-wedge-technique | TECHNIQUE | INTERMEDIATE |
| 34 | fitting-wooden-lids-technique | TECHNIQUE | INTERMEDIATE |

### Pyrography (2 PATTERN + 1 TECHNIQUE + 1 READING = 4 entries)

| # | Slug | Type | Difficulty |
|---|------|------|-----------|
| 35 | pyrography-mandala-panel | PATTERN | INTERMEDIATE |
| 36 | pyrography-dog-portrait | PATTERN | ADVANCED |
| 37 | pyrography-texture-techniques | TECHNIQUE | INTERMEDIATE |
| 38 | pyrography-starter-kit | READING | BEGINNER |

---

## Difficulty mix

- BEGINNER: 17
- INTERMEDIATE: 18
- ADVANCED: 5

## Type mix

- PATTERN: 31
- TECHNIQUE: 6
- READING: 3

---

## Voice-check errors and fixes

10 errors across 9 files — all fixed before upload.

| File | Error | Fix |
|------|-------|-----|
| 02-carved-beech-mustard-spoon | `glossary-coverage: "green-wood" registered but never used inline` | Wrapped "green" in glossaryTooltip in the care paragraph |
| 06-carved-cherry-dessert-server | `glossary-coverage: "push-cut" registered but never used inline` | Wrapped "push cuts" in glossaryTooltip in the method steps |
| 08-whittled-oak-letter-seal | `glossary-coverage: "blank" registered but never used inline` | Wrapped "blank" in glossaryTooltip in step text |
| 10-whittled-sycamore-cocktail-pick | `banned-phrase: "genuinely"` | Removed "genuinely" from excerpt phrase |
| 10-whittled-sycamore-cocktail-pick | `em-dash-paragraph: 1 em/en dash` | Renamed heading "Method — one pick" → "Method: one pick" |
| 11-chip-carved-beech-mirror-frame | `glossary-coverage: "push-cut" registered but never used inline` | Removed push-cut from glossaryTerms (chip carving doesn't use push-cuts; term was incorrectly registered) |
| 12-wood-spirit-relief-carving | `glossary-coverage: "push-cut" registered but never used inline` | Wrapped "push cuts" in glossaryTooltip in step 5 |
| 17-green-ash-roughing-a-spoon-blank | `glossary-coverage: "blank" registered but never used inline` | Wrapped "blank" in glossaryTooltip in step 4 |
| 18-pole-lathe-drive-centre-use | `glossary-coverage: "green-wood" registered but never used inline` | Wrapped "green" in glossaryTooltip in step 1 |
| 22-willow-plant-pot-sleeve | `glossary-coverage: "staking-up" registered but never used inline` | Split orderedList item 1 to prepend glossaryTooltip-wrapped "Staking up" |
| 23-willow-fruit-bowl | `glossary-coverage: "randing" registered but never used inline` | Wrapped "randing" in glossaryTooltip in variations bullet |
| 23-willow-fruit-bowl | `glossary-coverage: "staking-up" registered but never used inline` | Wrapped "Staking up" in glossaryTooltip in base section |

**Pattern:** 8 of 10 errors were glossary-coverage misses (term registered but not wrapped inline). The most common root cause: terms added to `glossaryTerms[]` for reference but the inline usage in the body text wasn't wrapped with a matching `glossaryTooltip` mark.

---

## Upload

All 40 uploaded with `--status PUBLISHED` in a single batch run. The batch script's failure-detection logic in the previous attempt was using `grep -qi "error\|failed\|fail"` which falsely matched content in the pnpm SSL warning output. Fixed by switching to detect success via `grep -q "\[upload-tutorial\] \(CREATED\|UPDATED\)"` instead.

0 tool-slug corrections needed — all slugs verified against `packages/db/scripts/data/tools.ts` during authoring.

---

## Sub-category coverage

| Sub-category | bulk-004 | Running total (approx) |
|---|---|---|
| spoon-carving | 8 | ~26 |
| whittling | 6 | ~19 |
| green-woodwork | 7 | ~21 |
| basketry-willow | 7 | ~20 |
| seasoned-wood | 8 | ~14 |
| pyrography | 4 | ~8 |
