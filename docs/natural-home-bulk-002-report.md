# Natural home bulk-002 — batch report

**Model:** claude-sonnet-4-6 (verify scheduled-tasks runner is honouring model frontmatter)
**Date:** 2026-05-21
**Session type:** autopilot-queue
**Category:** natural-home
**Batch:** bulk-002
**Count:** 40 entries PUBLISHED

## Sub-category breakdown

| Sub-category | Count | Slugs |
|---|---|---|
| soap | 8 | cold-process-lavender-soap, shea-butter-cold-process-soap, bastille-bar-soap, cocoa-butter-cold-process-soap, turmeric-honey-cold-process-soap, colloidal-oat-cold-process-soap, sweet-almond-geranium-soap, rosemary-mint-cold-process-soap |
| candles | 7 | soy-wax-jar-candle-vanilla, soy-wax-jar-candle-geranium, beeswax-scented-jar-candle, soy-wax-massage-candle, rolled-beeswax-advent-candles, soy-wax-jar-candle-citrus-spice, patio-citrus-candle |
| beauty | 11 | rose-geranium-face-balm, whipped-shea-body-butter, peppermint-foot-balm, rosehip-face-serum, kaolin-clay-face-mask, shower-steamers, tea-tree-spot-treatment, sugar-scrub-sweet-orange, peppermint-oat-foot-soak, face-toner-rosewater, coconut-oil-body-polish |
| cleaning | 8 | oven-cleaner-paste, laundry-stain-spray, natural-fabric-softener, shower-screen-cleaner, furniture-beeswax-polish, drain-cleaning-powder, kitchen-degreaser-spray, toilet-cleaning-powder |
| fragrance | 6 | rose-geranium-room-spray, sweet-orange-reed-diffuser, spring-simmer-pot, lavender-oat-drawer-sachets, peppermint-room-spray, citrus-solid-perfume |

**Difficulty:** BEGINNER ×40

## Ingredients seeded

1 new ingredient added to `packages/db/scripts/data/ingredients.ts` and seeded:
- `essential-oil-rosemary` — steam-distilled rosemary EO (Rosmarinus officinalis); inserted after `essential-oil-peppermint`

## Techniques

Soap files use `cold-process-soap-method` + `working-with-lye-safely` (criticalTechniques).
Beauty/cleaning files that use double-boiler: `double-boiler-method` (rose-geranium-face-balm, peppermint-foot-balm, furniture-beeswax-polish, citrus-solid-perfume).
Fragrance files: no technique slugs (all are simple combine-and-pour or no-heat methods).

## Voice-check fixes

**Errors fixed (ERRORs — blocking):**
- `medical-claim "cures"` in excerpt: all 7 cold-process soap files (02–08) used "Cures in 4-6 weeks." / "Cures in 6 weeks." — replaced with "Allow 4-6 weeks to harden before use." / "Allow 6 weeks to harden before use."
- `medical-claim "cures"` in body (file 02): "as it cures. Cure for at least 4 weeks" → "as it hardens. Allow at least 4 weeks"
- `banned-phrase "genuinely"` (file 08): "reads as genuinely functional" → "reads as functional"
- Fix applied via batch `sed` to all 40 files to correct `mark.attrs.slug` → `mark.attrs.termSlug` (glossaryTooltip) and `mark.attrs.slug` → `mark.attrs.techniqueSlug` (techniqueLink)

**Acceptable warnings (non-blocking):**
- `safety-block`: files 02, 03, 04, 06, 08 — soap files have a dedicated PPE/safety paragraph at body > paragraph[2] with goggles/gloves/ventilate keywords. Informational warning; safety information is appropriate for lye-handling soap recipes.
- `tricolon`: files 02, 27, 30, 33, 39 — minor stylistic warning; not changed.
- `brand-trademark "Target"` false positive: files 35, 39 — "Hold 20 cm from the target area" flagged as brand name. Clear false positive; not changed.

## Upload results

40/40 CREATED PUBLISHED. 0 failures.

## Natural home running total

Natural home: 40 (bulk-001) → **80 (bulk-001 + bulk-002)**
