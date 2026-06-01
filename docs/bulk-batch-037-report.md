# Cooking — bulk-batch-037 — report

**Date:** 2026-06-01
**Category:** cooking
**Batch:** 037
**Entries uploaded:** 40 RECIPE PUBLISHED (all 40 confirmed PUBLISHED in DB)
**Net new PUBLISHED (cooking):** 1,234 → 1,241 (+7 net; 33 were upserts of existing records)

## Slice

Mediterranean sweep: Greek (20) + Spanish (20).

**Greek (01-20):** moussaka, spanakopita, pastitsio, stifado, kleftiko, tzatziki, taramasalata, tirokafteri, saganaki, avgolemono-soup, greek-salad, gigantes-plaki, briam, souvlaki-pork, gyros-chicken, greek-roast-lamb, lemon-potatoes, keftedes, soutzoukakia, octopus-red-wine

**Spanish (21-40):** tortilla-espanola, gazpacho-andaluz, salmorejo, patatas-bravas, pan-con-tomate, gambas-al-ajillo, chorizo-al-vino-tinto, chorizo-butter-bean-stew, pisto-manchego, albondigas-en-salsa, pollo-al-ajillo, paella-valenciana, paella-de-marisco, paella-vegetariana, croquetas-de-jamon, calamares-a-la-romana, pulpo-a-la-gallega, romesco-sauce, fabada-asturiana, pimientos-de-padron

## Voice-check summary

Pre-fixes required:
- **Systematic glossaryTerms slug fix** — 13 files used `"termSlug"` as the field name in `glossaryTerms[]` array items instead of `"slug"`. Fixed by automated script before upload. The `glossaryTooltip` mark `attrs.termSlug` was correct throughout.
- **Banned phrase "genuinely"** — 2 files (pan-con-tomate, avgolemono-soup). Replaced with "properly".
- **Em-dashes in excerpt/sourceNotes** — 2 files (briam, paella-vegetariana). Replaced with parentheses.
- **Grade-level errors** — 2 files (paella-vegetariana, pulpo-a-la-gallega). Opening paragraphs simplified.

Final result: all 40 files 0 errors before upload.

## Hero fill

40 heroes sourced (23 Unsplash, 17 Pexels, 0 failed). Relevance queue written to `docs/image-relevance-queue-cooking-bulk-037.json`.

## QC auto-fix

4 tutorials processed by qc-fix, 4 passed, 0 still blocked.

## Counts

Cooking: 1,234 → 1,241 (+7 net, 33 upserts of existing records; all 40 PUBLISHED confirmed in DB)
All categories: 6,432 → 6,439
