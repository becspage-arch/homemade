# Sustainability bulk-003 — batch report

**Date:** 2026-05-21  
**Session type:** autopilot-queue  
**Entries published:** 40  
**Sustainability total before:** 82  
**Sustainability total after:** 122

## Sub-category breakdown

- insulation-and-draughtproofing ×10: flat-roof-insulation-options, insulating-below-rafters-warm-roof, draught-proofing-floorboard-gaps, loft-conversion-insulation-options, garage-conversion-insulation, airtightness-survey-smoke-pencil, window-replacement-decision-guide, roof-light-draught-sealing, internal-wall-insulation-dry-lining, cold-pipe-insulation
- solar-and-energy ×8: time-of-use-tariff-guide, heating-controls-upgrade, reading-an-in-home-display, solar-pv-shading-assessment, heat-pump-flow-temperature, led-lighting-home-upgrade, clamp-meter-energy-monitoring, low-carbon-heating-options
- composting ×8: making-compost-tea, two-bay-compost-bin, turning-a-hot-compost-heap, kitchen-caddy-routine, composting-difficult-materials, sieving-and-storing-finished-compost, green-cone-food-digester, using-finished-compost-in-the-garden
- water ×6: dual-flush-toilet-valve-conversion, mini-swale-for-small-gardens, shower-water-use-reduction, slow-water-leak-detection, water-butt-elevated-stand, connecting-water-butt-to-greenhouse
- waste-reduction ×5: recyclability-labels-explained, food-waste-audit-one-week, buying-secondhand-for-quality, right-to-repair-electronics, buying-recycled-content-materials
- off-grid ×3: rocket-stove-principles, solar-shed-lighting-12v, greywater-constructed-wetland

## Type and difficulty

- TECHNIQUE ×25, PATTERN ×15
- BEGINNER ×32, INTERMEDIATE ×8 (flat-roof, loft-conversion, garage-conversion, internal-wall-insulation, solar-pv-shading, heat-pump-flow-temperature, mini-swale, greywater-wetland)

## Voice-check fixes

**Price-mention errors (files 01–18):** Removed installation cost figures from flat-roof-insulation-options (worked example paragraph + body), airtightness-survey-smoke-pencil, window-replacement-decision-guide, roof-light-draught-sealing, internal-wall-insulation-dry-lining, cold-pipe-insulation, time-of-use-tariff-guide, heating-controls-upgrade, reading-an-in-home-display, led-lighting-home-upgrade, clamp-meter-energy-monitoring, low-carbon-heating-options, heat-pump-flow-temperature. All replaced with kWh-based or percentage statements.

**Em-dash fixes (9 files):** making-compost-tea ("apply immediately — the bacteria" → ":"), two-bay-compost-bin (excerpt), turning-a-hot-compost-heap ("drops below 45°C — this indicates" → ", which"), kitchen-caddy-routine (excerpt), composting-difficult-materials ("does not break down in a home heap — avoid" → "; avoid it"), sieving-and-storing-finished-compost ("separately — it dries out" → "; it dries out"), dual-flush-toilet-valve-conversion ("do not overtighten — the rubber washer" → "; the rubber washer"), mini-swale-for-small-gardens ("small berm — this slows" → "small berm, which slows"), food-waste-audit-one-week (excerpt).

**Safety-block headings (2 files):** draught-proofing-floorboard-gaps ("Before you start" → "Airbricks: do not seal them"), right-to-repair-electronics ("Checking repairability before you start" → "Assessing repairability").

**Banned phrase (1 file):** composting-difficult-materials ("fundamentally" → "inherently").

**Unused glossary term removed (2 files):** insulating-below-rafters-warm-roof and loft-conversion-insulation-options both had a `cold-roof` glossary term registered but never used inline. Terms removed.

**Acceptable warnings (not errors):** brand-trademark false positives "target" (U-value targets), americanism false positives "stove" (rocket stove), "fall" (seasonal, connecting-water-butt-to-greenhouse), tricolon warnings (3 files). None block upload.

## New tools seeded (12)

garden-fork, spade, compost-sieve, bucket-10l, aquarium-pump, energy-monitor, kitchen-scales, drill-driver, saw-hand, adjustable-spanner, scraper-filling, vacuum-cleaner.

## Upload fixes

13 files initially failed with "recipeTools references slugs not in the master table" because the 12 tool slugs above were not yet seeded. Added entries to `packages/db/scripts/data/tools.ts` and ran `seed-tools.ts` (12 created, 706 unchanged). All 13 files re-uploaded successfully.

1 file (low-carbon-heating-options) had a residual price-mention error ("£10,000-18,000" in ASHP paragraph) that the first upload pass revealed. Fixed and re-uploaded.

**0 final upload failures.**
