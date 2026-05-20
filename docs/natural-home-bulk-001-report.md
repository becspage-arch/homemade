# Natural home bulk-001 batch report

**Date:** 2026-05-20  
**Session type:** autopilot-queue  
**Category:** natural-home  
**Total uploaded:** 40 PUBLISHED  
**Upload failures:** 0 (3 slug errors fixed before final upload pass)

---

## Sub-category distribution

| Sub-category | Count | Weight |
|---|---|---|
| beauty | 10 | 25% |
| soap | 8 | 20% |
| candles | 8 | 20% |
| cleaning | 8 | 20% |
| fragrance | 6 | 15% |

## Difficulty split

BEGINNER ×26, INTERMEDIATE ×11, ADVANCED ×3

## Entries by sub-category

### soap (8)
- melt-and-pour-lavender-soap (RECIPE, BEGINNER)
- castile-bar-soap (RECIPE, BEGINNER)
- marseille-soap (RECIPE, INTERMEDIATE)
- calendula-oat-soap (RECIPE, INTERMEDIATE)
- salt-bar-soap-coconut (RECIPE, INTERMEDIATE)
- goats-milk-honey-soap (RECIPE, INTERMEDIATE)
- peppermint-charcoal-soap (RECIPE, ADVANCED)
- hot-process-herbal-soap (RECIPE, ADVANCED)

### candles (8)
- soy-wax-jar-candle-lavender (RECIPE, BEGINNER)
- beeswax-pillar-candle (RECIPE, BEGINNER)
- soy-wax-jar-candle-citrus (RECIPE, BEGINNER)
- soy-tealights (RECIPE, BEGINNER)
- beeswax-taper-candles (RECIPE, BEGINNER)
- coconut-wax-jar-candle (RECIPE, BEGINNER)
- soy-botanical-candle (RECIPE, INTERMEDIATE)
- beeswax-honeycomb-sheet-candle (RECIPE, INTERMEDIATE)

### beauty (10)
- calendula-lip-balm (RECIPE, BEGINNER)
- rose-body-butter (RECIPE, BEGINNER)
- coffee-sugar-scrub (RECIPE, BEGINNER)
- bath-salts-lavender (RECIPE, BEGINNER)
- oat-honey-face-mask (RECIPE, BEGINNER)
- arnica-balm (RECIPE, INTERMEDIATE)
- basic-hand-cream-lotion (RECIPE, INTERMEDIATE)
- dry-oil-body-serum (RECIPE, INTERMEDIATE)
- deodorant-paste (RECIPE, INTERMEDIATE)
- bath-bombs-fizzing (RECIPE, ADVANCED)

### cleaning (8)
- all-purpose-surface-spray (RECIPE, BEGINNER)
- bicarbonate-scouring-paste (RECIPE, BEGINNER)
- glass-cleaner-spray (RECIPE, BEGINNER)
- laundry-soap-flakes (RECIPE, BEGINNER, title: "Natural laundry powder")
- dishwasher-powder (RECIPE, BEGINNER)
- toilet-cleaning-fizz-tabs (RECIPE, BEGINNER)
- mould-spray-tea-tree (RECIPE, BEGINNER)
- soft-floor-cleaner (RECIPE, BEGINNER, title: "Natural floor cleaner")

### fragrance (6)
- lavender-reed-diffuser (RECIPE, BEGINNER)
- lemon-verbena-room-spray (RECIPE, BEGINNER, title: "Citrus room spray")
- winter-spice-simmer-pot (RECIPE, BEGINNER, season: WINTER)
- lavender-moth-sachet (RECIPE, BEGINNER)
- solid-rose-perfume-balm (RECIPE, INTERMEDIATE)
- linen-water-spray (RECIPE, BEGINNER, title: "Lavender linen water")

---

## Voice-check fixes

### Safety heading removal (files 02–07, all soap LNaOH entries)

6 soap files had a dedicated safety heading "Kit out and put on PPE" with a
following paragraph listing safety gear. Safety headings are banned; the agent
removed the heading node and the PPE paragraph from all 6 cold-process / hot-process
soap files (02-castile-bar-soap, 03-marseille-soap, 04-calendula-oat-soap,
05-salt-bar-soap-coconut, 06-goats-milk-honey-soap, 07-peppermint-charcoal-soap,
08-hot-process-herbal-soap). Safety instructions were retained inline in the
relevant method steps.

### Glossary coverage (files 01–22, multiple)

Multiple files had glossaryTerms entries that were never used inline with a
glossaryTooltip mark. Fixes:
- Files 01, 03, 04, 09, 10, 11, 12, 13, 15, 19: unused terms removed from
  glossaryTerms[].
- File 14 (coconut-wax-jar-candle): inline `glossaryTooltip` referenced
  `melt-point` but the term was not in glossaryTerms[]. Term added.

### Em-dash batch replacement (all 40 files)

Files 01–22 had scattered em-dash pairs (appositive pattern) fixed individually.
Files 28–40 had all em-dashes bulk-replaced with `; ` (or reworded as parentheticals)
via a Node.js script before voice-check. File 16 and 38 also needed the raw-hours
rule fix (see below). File 22 had a banned phrase fix (see below).

Total em-dash fixes: 40+ instances across the full batch.

### Raw-hours rule (files 16, 38)

Durations expressed in raw hours above 48 must be written in days or weeks:
- **beeswax-honeycomb-sheet-candle** (file 16): excerpt "40-50 hours" →
  "about 2 days of total burn time".
- **lavender-moth-sachet** (file 38): body text "72 hours" → "3 days".

### Banned phrase (file 22)

- **arnica-balm**: body prose "at the end of the day" → "before bed". The phrase
  "at the end of the day" is banned (idiomatic, not literal).

---

## Upload fixes (ingredient slug corrections)

Three files used ingredient slugs that did not exist in the master Ingredient table.
All were caught on the first upload attempt and fixed before re-upload.

| File | Wrong slug | Correct slug | Action |
|---|---|---|---|
| 05-salt-bar-soap-coconut | `salt` | `sea-salt-fine` | slug corrected in JSON |
| 20-bath-salts-lavender | `salt` | `epsom-salts` | slug corrected in JSON |
| 19-coffee-sugar-scrub | `coffee` | `ground-coffee` | new ingredient seeded; slug corrected |
| 19-coffee-sugar-scrub | `brown-sugar` | `light-brown-sugar` | slug corrected in JSON |
| 23-basic-hand-cream-lotion | `citric-acid` | `broad-spectrum-preservative` | new ingredient seeded; slug corrected |

---

## New ingredients seeded

Two new ingredients added to `packages/db/scripts/data/ingredients.ts` and
seeded via `seed-ingredients.ts`:

- **`broad-spectrum-preservative`** — broad-spectrum cosmetic preservative (Optiphen
  Plus or equivalent). Required for water-containing lotion formulas. At 1% of
  total batch weight, added to the cool-down phase below 40°C.
- **`ground-coffee`** — finely ground roast coffee for body scrubs. Used (spent)
  grounds from a cafetière or espresso machine work perfectly; the abrasive cellulose
  structure remains intact after extraction.

---

## Cosmetic formulation notes

Key formulation rules applied across this batch:

- **Anhydrous formulas** (no water): lip balm, body butter, balm, body serum,
  deodorant, solid perfume — no preservative needed, 6–12 month shelf life.
- **Water-containing formulas** (lotion, linen water, sprays with water): require
  a broad-spectrum preservative at 1% or an alcohol component (vodka at 10%+ as
  partial preservative). The basic-hand-cream-lotion uses Optiphen Plus.
- **All leave-on skin-contact formulas** include a patch-test note.

---

## Category count

Natural home: 0 → 40 PUBLISHED
