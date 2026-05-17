# Cooking bulk-batch-012 report

**Date:** 2026-05-17  
**Session type:** Parallel-burner loop (alongside autopilot-queue cron)  
**Model:** claude-sonnet-4-6  
**Starting count:** 527 PUBLISHED  
**Ending count:** 542 PUBLISHED  
**Batch size:** 15 recipes  

## Cuisine spread

| Cuisine | Count | Slugs |
|---|---:|---|
| middleEastern | 5 | hummus, cacik, shish-taouk, kofte-izmir, imam-bayildi |
| northAfrican | 4 | kefta-tagine, tagine-of-lamb-with-prunes-and-almonds, tagine-of-chicken-with-preserved-lemon-and-olives, couscous-with-chicken-and-chickpeas |
| greek | 2 | keftedes, moussaka |
| spanish | 1 | pollo-al-ajillo |
| easternEuropean | 3 | pierogi-ruskie, pierogi-z-miesem, chicken-kiev |

## Difficulty breakdown

| Difficulty | Count |
|---|---:|
| BEGINNER | 11 |
| INTERMEDIATE | 4 |

INTERMEDIATE: moussaka (multi-component layered bake), pierogi-ruskie (dough + filling + boil + fry), pierogi-z-miesem (same), chicken-kiev (pounding, sealing herb butter, coating).

## Voice-check

- **First pass clean:** 7 of 15 (imam-bayildi, kefta-tagine, tagine-of-lamb, tagine-of-chicken, couscous, moussaka, chicken-kiev initially; some passed after slug fixes)
- **Issues fixed:**
  - Em-dash parenthetical pairs (— X —) → parentheses in 8 files (hummus, shish-taouk, keftedes, pollo-al-ajillo, kefta-tagine, tagine-of-lamb, tagine-of-chicken, couscous, pierogi-ruskie, pierogi-z-miesem, chicken-kiev)
  - Banned phrase "genuinely" → removed in hummus, shish-taouk
  - Americanism "fall apart" → "break apart" in keftedes, kofte-izmir, kefta-tagine
  - servings-yield conflict (both `servings` and `yieldDescription` set) → set `yieldDescription: null` in keftedes, pierogi-ruskie, pierogi-z-miesem
- **All 15 uploaded at 0 errors, 0 warnings**

## Ingredient slug corrections

The following slugs were incorrect and corrected before upload:

| Wrong slug | Correct slug | Affected recipes |
|---|---|---|
| coriander-fresh | coriander | tagine-of-chicken, couscous |
| sour-cream | soured-cream | pierogi-ruskie, pierogi-z-miesem |
| mushrooms | mushrooms-porcini-dried | pierogi-z-miesem |
| breadcrumbs | breadcrumbs-dried | chicken-kiev |
| milk | whole-milk | moussaka |
| butter | unsalted-butter | moussaka, couscous, pierogi-ruskie, pierogi-z-miesem, chicken-kiev |
| baking-dish | rectangular-baking-tin | moussaka |
| whisk | whisk-balloon | moussaka |

## New glossary terms created

- **allspice** — created by shish-taouk upload. Definition: Caribbean/Central American dried berry with clove/cinnamon/nutmeg notes; cornerstone of Levantine cookery.
- **ajillo** — created by pollo-al-ajillo upload. Definition: Spanish diminutive of ajo (garlic); describes a cooking method where garlic is a principal flavour.

## Preserved lemon note

`preserved-lemon` has no ingredient slug in the DB. The `tagine-of-chicken-with-preserved-lemon-and-olives` recipe references it as plain text with a note in the recipe intro on sourcing ("available in most large supermarkets and North African or Middle Eastern shops"). The ingredient does not appear as a scaling token in the method. Flag for a future ingredient-seed session.

## Cumulative cooking cuisine distribution (post batch-012)

Based on pre-batch counts + batch additions:

| Cuisine | Approx count |
|---|---:|
| british | ~229 |
| american | ~57 |
| italian | ~52 |
| french | ~34 |
| angloIndian | ~21 |
| middleEastern | ~15 |
| greek | ~14 |
| easternEuropean | ~15 |
| caribbean | ~11 |
| northAfrican | ~15 |
| spanish | ~11 |

Under-represented v1 cuisines brought up significantly this batch. Next batch should continue with spanish (paella, gazpacho, tortilla española), more greek (spanakopita, souvlaki), and more easternEuropean (bigos, goulash, beef stroganoff).
