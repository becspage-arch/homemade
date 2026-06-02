# Cooking — bulk-batch-039 — report

**Date:** 2026-06-02
**Category:** cooking
**Batch:** 039
**Model:** claude-sonnet-4-6
**Entries uploaded:** 40 PUBLISHED (40 uploaded, all confirmed PUBLISHED in DB)
**Net new PUBLISHED (cooking):** 1,276 → 1,295 (+19 net; 21 were upserts of existing records)

## Slice

American cuisine sweep: diner classics, American mains, and Southern/Cajun/Creole.

**Diner classics (10 entries — 01–10):** cheeseburger, reuben, grilled-cheese-sandwich, blt, sloppy-joe, buttermilk-pancakes, eggs-benedict, meatloaf, pot-roast, mac-and-cheese-baked

**American mains (10 entries — 11–20):** chicken-pot-pie, texas-red-chili, beef-stroganoff, fried-chicken, jambalaya, prawn-and-grits, pulled-pork, gumbo, cornbread, collard-greens

**Southern/Cajun/Creole + more mains (20 entries — 21–40):** red-beans-and-rice, nashville-hot-chicken, swedish-meatballs, stovetop-mac-and-cheese, stuffed-peppers, biscuits-and-gravy, chicken-and-dumplings, dirty-rice, hoppin-john, smothered-pork-chops, salisbury-steak, deviled-eggs, pimento-cheese, fried-green-tomatoes, white-chicken-chili, chicken-and-rice-casserole, hash-browns, club-sandwich, green-bean-casserole, stuffed-cabbage-rolls

## Voice-check fixes

Pre-upload fixes required across the batch:

- **Grade-level errors** — 26 files had paragraphs (mostly "Where this dish lives" sections) scoring above grade 12. Simplified vocabulary, shortened sentences, split compound clauses.
- **Americanism "shrimp"** — file 16 (shrimp-and-grits) title, excerpt, body, and sourceNotes changed to "prawn"; slug changed to `prawn-and-grits`.
- **Banned phrase "essentially"** — files 22 (nashville-hot-chicken) sourceNotes and 27 (chicken-and-dumplings). Replaced.
- **Brand trademark WARN "Chipotle"** — files 05, 12, 24, 35 used "chipotle" in variations/body. Changed to "dried chipotle chilli" or "chipotle paste" where the ingredient was meant. Warnings only (not blocks), accepted where the context was clearly the ingredient.

Final result: all 40 files 0 errors before upload.

## Hero fill

40 heroes sourced (30 Unsplash, 9 Pexels, 1 Flux Schnell, 0 failed). Relevance queue written to `docs/image-relevance-queue-cooking-bulk-039.json`.

## QC fix

Post-publish qc-fix: 32 auto-fixed, 8 still blocked (handed to hourly qc-fix-batch).

## Ingredient notes

- No missing ingredients. All slugs resolved against master lookup.
- `prawn-and-grits` uses `prawns-raw` for the prawn ingredient (correct).
- `biscuits-and-gravy` uses `sausage-meat` for the country sausage.
- `cornbread` uses `polenta` as the cornmeal equivalent (canonical slug).

## Counts

Cooking: 1,276 → 1,295 (+19 net, 21 upserts; all 40 PUBLISHED confirmed in DB)
