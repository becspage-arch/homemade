# Baking bulk-031 report

Date: 2026-06-19
Batch: baking / bulk-031

## Notes

This batch resumed 40 briefs created by a previous fire that died before uploading. The previous fire had partially uploaded 17 entries; this fire uploaded the remaining 23 after fixing inline issues found during the real upload run.

Fixes applied to 6 briefs during this fire:
- barbari-iranian-flatbread, georgian-shoti: `sourceType: "DOCUMENTED"` → `"CLASSIC"` (DOCUMENTED is not a valid SourceType enum value)
- courgette-and-goat-cheese-tart, gooseberry-and-elderflower-tart: ingredient slug `cold-water` → `water` with prepNote `"ice cold"` (cold-water not in master table)
- crystallised-ginger-homemade: grade-level fix on coating step (single long sentence → 3 short sentences)
- gum-paste-peony: grade-level fixes already applied by linter; "anchor" as verb flagged as brand-trademark warn (false positive, accepted)

## Sub-category breakdown (40 total)

| Sub-category | Count | Slugs |
|---|---:|---|
| bread | 5 | barbari-iranian-flatbread, georgian-shoti, malted-rye-rolls, seeded-crispbreads-homemade, spelt-honey-rolls |
| biscuits | 6 | black-sesame-cookies, cardamom-sugar-cookies, lemon-sandwich-biscuits, maple-pecan-cookies, matcha-shortbread, spiced-molasses-cookies |
| cakes | 9 | chestnut-honey-cake, fig-and-almond-cake, flourless-walnut-cake, ginger-and-treacle-traybake, kladdkaka, maple-and-walnut-cake, pear-and-hazelnut-cake, rose-water-and-pistachio-cake, torta-della-nonna |
| pies | 6 | courgette-and-goat-cheese-tart, damson-plum-tart, fig-and-honey-tart, gooseberry-and-elderflower-tart, salted-honey-tart, spiced-pear-tart |
| sweets-confectionery | 8 | coffee-truffles, crystallised-ginger-homemade, earl-grey-truffles, fruit-leather-apple-cinnamon, halva-tahini-homemade, matcha-white-chocolate-bark, pistachio-nougat, raspberry-fudge |
| cake-decorating | 6 | buttercream-chrysanthemum-piping, gum-paste-peony, marbled-fondant-technique, meringue-mushrooms, palette-knife-textured-buttercream, smooth-buttercream-finish |

Types: RECIPE x34, TECHNIQUE x6

## Pipeline notes

**sourceType invalid value (2 files):**
- barbari-iranian-flatbread, georgian-shoti used `"DOCUMENTED"` which is not in the SourceType enum. Changed to `"CLASSIC"`. Suggest adding this to the authoring prompt's sourceType guidance.

**Ingredient slug: cold-water (2 files):**
- courgette-and-goat-cheese-tart, gooseberry-and-elderflower-tart used `cold-water` as ingredient slug. Not in master table. Changed to `water` with `prepNote: "ice cold"`.

**criticalTechniques / techniqueSlugs mismatch (1 file):**
- gooseberry-and-elderflower-tart had `blind-baking` in criticalTechniques but not in techniqueSlugs. Fixed by adding to techniqueSlugs.

## Voice-check summary

All 40 entries passed (after path and content fixes). One warning accepted: gum-paste-peony flagged "anchor" (verb) as Anchor butter brand trademark — false positive.

## QC tail

- Hero-fill: 40 heroes filled across two runs
- qc-fix: 104 processed, pass=104, still_blocked=0
