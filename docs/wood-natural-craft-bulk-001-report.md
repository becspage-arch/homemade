# Wood-natural-craft bulk-001 — batch report (2026-05-19)

**40 entries PUBLISHED** across 6 sub-categories.

## Sub-category breakdown

| Sub-category | Count | Types |
|---|---|---|
| spoon-carving | 7 | PATTERN ×7 |
| whittling | 4 | PATTERN ×4 |
| green-woodwork | 6 | TECHNIQUE ×2, PATTERN ×5 (-1 TECHNIQUE = drawknife counted below) |
| basketry-willow | 7 | TECHNIQUE ×2, PATTERN ×5 |
| seasoned-wood | 4 | PATTERN ×4 |
| pyrography | 2 | TECHNIQUE ×1, PATTERN ×1 |
| (shared) | 10 | TECHNIQUE ×7, READING ×3 |

**Full type split:** PATTERN ×27, TECHNIQUE ×10, READING ×3

**Difficulty split:** BEGINNER ×22, INTERMEDIATE ×15, ADVANCED ×3

## Entries

### READING (3)
- `green-wood-vs-seasoned-wood` — foundational article
- `sharpening-a-sloyd-knife` — sharpening guide
- `food-safe-wood-finishes` — finish comparison

### TECHNIQUE (10)
- `push-cut-technique` (whittling, BEGINNER)
- `thumb-pivot-cut-technique` (whittling, BEGINNER)
- `stop-cut-technique` (whittling, BEGINNER)
- `riving-with-a-froe` (green-woodwork, INTERMEDIATE)
- `using-a-shaving-horse` (green-woodwork, BEGINNER)
- `randing-willow-basketry` (basketry-willow, BEGINNER)
- `waling-basketry-weave` (basketry-willow, INTERMEDIATE)
- `pyrography-design-transfer` (pyrography, BEGINNER)
- `kolrosing-technique` (spoon-carving, INTERMEDIATE)
- `drawknife-shaping-technique` (green-woodwork, INTERMEDIATE)

### PATTERN (27)
**Spoon-carving (7)**
- `whittled-sycamore-letter-opener` (BEGINNER, seasoned)
- `carved-sycamore-eating-spoon` (BEGINNER, green)
- `carved-cherry-serving-spoon` (INTERMEDIATE, green)
- `carved-birch-kuksa` (INTERMEDIATE, green)
- `carved-walnut-honey-spoon` (BEGINNER, seasoned)
- `carved-sycamore-salad-servers` (INTERMEDIATE, seasoned)
- `carved-ash-ladle` (ADVANCED, green)

**Whittling (4)**
- `whittled-lime-spatula` (BEGINNER, seasoned)
- `whittled-hazel-pot-stirrer` (BEGINNER, green)
- `whittled-ash-honey-dipper` (BEGINNER, seasoned)
- `chip-carved-beech-butter-dish` (INTERMEDIATE, seasoned)

**Green-woodwork (5)**
- `riven-hazel-mallet` (INTERMEDIATE)
- `riven-ash-axe-handle` (INTERMEDIATE)
- `coppice-hazel-dibber` (BEGINNER)
- `green-wood-stool-leg` (INTERMEDIATE)
- `riven-oak-shingles` (INTERMEDIATE)

**Basketry-willow (5)**
- `round-willow-basket-small` (BEGINNER)
- `willow-garden-trug` (INTERMEDIATE)
- `rush-woven-table-mat` (BEGINNER)
- `willow-hurdle-garden-panel` (INTERMEDIATE)
- `willow-obelisk-garden` (BEGINNER)
- `braided-rush-log-basket` (BEGINNER)

**Seasoned-wood (4)**
- `dovetail-pine-keepsake-box` (INTERMEDIATE)
- `carved-beech-bread-board` (BEGINNER)
- `mortise-tenon-oak-picture-frame` (INTERMEDIATE)
- `carved-sycamore-cheese-board` (BEGINNER)

**Pyrography (1)**
- `pyrography-first-burn-birch` (BEGINNER)

## Voice-check fixes

- **Safety infoPanel removal (27 files):** All PATTERN and TECHNIQUE entries had an infoPanel block with `tone: "warning"` and a safety-advice title. Voice-check rule `safety-block` rejects warning infoPanels with body > 25 words or a safety-advice title. All 27 removed.
- **Em-dash removal (5 files):** `carved-beech-bread-board`, `green-wood-vs-seasoned-wood`, `thumb-pivot-cut-technique`, `whittled-lime-spatula`, `food-safe-wood-finishes` (plus `riving-with-a-froe` in troubleshooter symptom text).
- **Banned phrases (4 files):** `genuinely` in `push-cut-technique`, `whittled-sycamore-letter-opener`, `food-safe-wood-finishes`; `essentially` in `whittled-sycamore-letter-opener`.
- **Medical-claim watchword `cures` (2 files):** `food-safe-wood-finishes` (×4 occurrences — replaced with "hardens" / "sets" / "drying time"), `mortise-tenon-oak-picture-frame` (×2).
- **Glossary coverage (3 files):** `push-cut` term registered but not used inline in `carved-sycamore-salad-servers` (fixed by adding glossaryTooltip to existing techniqueLink) and `carved-walnut-honey-spoon` (split plain text node); `waling` term not used inline in `willow-hurdle-garden-panel` (split plain text node).
- **riving-with-a-froe (2 errors):** Removed safety infoPanel "Axe and beetle safety" (74 words); renamed heading "Reading the grain before you start" → "Reading the grain".
- **food-safe-wood-finishes (2 warning infoPanels):** Bodies shortened from 74 and 60 words to 15 and 16 words.
- **Brand-name `target` (common noun):** `whittled-hazel-pot-stirrer` paragraph said "target thickness" — replaced with "finished thickness".

## Upload fixes

- **Missing tool slugs (4):** `hook-knife-deep`, `brace-and-bit`, `chisel-bench`, `mallet-carpenters` were not in the master tools table. Added to `packages/db/scripts/data/tools.ts` and re-seeded (4 created). Re-uploaded 4 files.
- **Files failed on first pass:** `carved-ash-ladle`, `carved-birch-kuksa`, `dovetail-pine-keepsake-box`, `mortise-tenon-oak-picture-frame`. All 4 succeeded on retry after tool re-seed.

## Final state

- 0 upload failures after retry
- Voice-check: 25 clean, 15 warnings-only (brand-trademark, tricolon, americanism), 0 blocks
- Wood-natural-craft: 0 → 40 PUBLISHED
