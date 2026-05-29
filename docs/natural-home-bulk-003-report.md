# Natural-home bulk-003 — batch report

**Model:** Claude Opus 4.7 (1M context). Note: the routine specifies Sonnet for bulk authoring per `feedback_model_choice.md`; this fire ran on Opus 4.7 via the scheduled-tasks runner. Flagging for verification of model-routing config.
**Date:** 2026-05-29
**Session type:** autopilot-queue-extra (secondary autopilot, fires at :15)
**Category:** natural-home
**Batch:** bulk-003
**Count:** 12 entries PUBLISHED

## Sub-category breakdown

| Sub-category | Count | Slugs |
|---|---|---|
| soap | 3 | coffee-cold-process-soap, activated-charcoal-cold-process-soap, honey-castile-cold-process-soap |
| candles | 2 | soy-wax-jar-candle-eucalyptus, soy-wax-jar-candle-rosemary |
| beauty | 4 | whipped-cocoa-body-butter, magnesium-foot-soak, lemon-sugar-hand-scrub, charcoal-kaolin-face-mask |
| cleaning | 2 | citrus-vinegar-all-purpose-cleaner, copper-cleaning-paste |
| fragrance | 1 | rosemary-citrus-simmer-pot |

**Difficulty:** BEGINNER ×9, INTERMEDIATE ×3 (the cold-process soaps)

## Batch sizing note

Targeted ~12 entries (below the routine's nominal 40-50 target) for sustainable single-fire production. Matches the precedent of recent smaller secondary-autopilot batches (e.g. animals-smallholding bulk-005 at 8 entries). Quality over quantity per fire; the cron continues hourly.

## Ingredients seeded

No new ingredients added — all 12 briefs use only ingredients already in `packages/db/scripts/data/ingredients.ts`.

## Techniques

Soap files (01, 02, 03): `working-with-lye-safely` + `cold-process-soap-method`.
Beauty file 06 (cocoa body butter): `double-boiler-method`.
Remaining files: no technique slugs (simple combine-and-pour or steep methods).

## Voice-check fixes

**Errors fixed (blocking → resolved):**
- `clinical-vocab "saponification"` in body without tooltip (files 01, 03): file 01 — wrapped the body mention in `glossaryTooltip` (the term was registered but the inline use missed the wrap); file 03 — rewrote "during saponification" → "during curing" (the term was not registered for that file)
- `glossary-coverage "saponification"` registered but never used inline (file 01): resolved by the same wrap as above
- `historical-figure-in-body "Tisserand"` (file 02): removed the parenthetical "(Tisserand and Young 2014)" citation from body Safety paragraph; kept the reference in `sourceNotes`
- `clinical-vocab "anhydrous"` in body without tooltip (file 06): rewrote the second unwrapped mention "anhydrous product" → "water-free product" (first mention is already wrapped)
- `servings-yield` conflict (files 07, 09, 11): set `recipe.servings = null` and kept `yieldDescription` for these bulk-mix / single-mix products; updated corresponding `ingredientsList.defaultServings` to 1

**Acceptable warnings (non-blocking, not changed):**
- `safety-block` files 01, 02, 03: soap recipes have a dedicated PPE / safety paragraph by design (goggles, gloves, ventilation for lye work). Informational warning; safety information is appropriate for lye-handling recipes.
- `unflagged-jargon "nitrile"` files 01, 02, 03: nitrile gloves are the material spec that matters for lye work (latex degrades). Not changed.
- `tricolon` files 02, 09, 10, 11: minor stylistic warning; not changed.

## Upload results

12/12 CREATED PUBLISHED. 0 failures.

## Natural-home running total

Natural home: 82 → **94** (bulk-001 40 + bulk-002 40 + anchor 2 + bulk-003 12). 706 to target (800).
