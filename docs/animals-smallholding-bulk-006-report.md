# Animals & Smallholding — Bulk-006 Batch Report

**Date:** 2026-05-29
**Session type:** autopilot-queue-extra
**Model:** Claude Sonnet 4.6

## Entries published (10)

| # | Slug | Sub-category | Type | Difficulty |
|---|------|-------------|------|-----------|
| 01 | using-a-clearer-board-to-clear-a-super | bees | TECHNIQUE | INTERMEDIATE |
| 02 | fitting-fondant-for-the-winter-cluster | bees | TECHNIQUE | BEGINNER |
| 03 | diagnosing-coccidiosis-in-chicks | poultry | TECHNIQUE | INTERMEDIATE |
| 04 | using-a-broody-hen-to-hatch-eggs | poultry | TECHNIQUE | INTERMEDIATE |
| 05 | vaccinating-sheep-with-a-clostridial-vaccine | sheep-and-goats | TECHNIQUE | BEGINNER |
| 06 | housing-in-lamb-ewes-before-lambing | sheep-and-goats | TECHNIQUE | BEGINNER |
| 07 | castrating-male-piglets | pigs | TECHNIQUE | ADVANCED |
| 08 | nest-box-management-and-kit-checking | rabbits | TECHNIQUE | BEGINNER |
| 09 | installing-a-field-gate-for-livestock | smallholding-skills | TECHNIQUE | INTERMEDIATE |
| 10 | rat-control-on-a-smallholding | smallholding-skills | TECHNIQUE | BEGINNER |

All TECHNIQUE. BEGINNER ×6, INTERMEDIATE ×3, ADVANCED ×1.

## New tools seeded (3)

- `clearer-board` (Porter escape board)
- `crown-board` (inner cover / hive cover board)
- `vaccination-syringe` (5 ml livestock repeating syringe)

## Voice-check fixes

**Schema validation error (1):**
- Entry 04 had a populated `projectSchedule` field (TECHNIQUE type does not allow schedule). Cleared to `[]` before upload.

**Banned phrase "genuinely" (2 files):**
- Entry 04 excerpt: "A genuinely broody hen" → "A committed broody hen"
- Entry 08 body: "if it is genuinely chilled" → "if it is properly chilled"

**Medical-claim watchword (1):**
- Entry 09 troubleshooter: "before the concrete fully cures" → "before the concrete fully sets"

**Americanism (1):**
- Entry 03 body: "broiler houses" → "commercial poultry units"

**Grade-level rewrites (7 files — troubleshooter cause/fix fields and body paragraphs):**
- Entry 03: 5 locations — paragraph split (oocyst sentence), polysyllabic vocab ("coccidiosis/Eimeria" → "cocci strain"), semicolon chains split, troubleshooter cause simplified
- Entry 05: 3 locations — intro paragraph split at colostrum sentence, troubleshooter cause/fix rewrites (adjuvant, anaphylaxis terminology simplified)
- Entry 06: 4 locations — colostrum added to glossaryTerms and wrapped inline, troubleshooter cause/fix splits
- Entry 07: 3 locations — paragraph split (colostrum reference → "first-milk intake"), records paragraph simplified, troubleshooter fix split
- Entry 08: 1 location — troubleshooter cause split
- Entry 09: already clean after "cures" fix
- Entry 10: 2 locations — bait-station paragraph semicolons split, troubleshooter fix sentence restructured

## Acceptable warnings (non-blocking)

- Tricolon in entry 10 excerpt (rat control)
- Brand-trademark "Target" false-positive in entry 10 infoPanel (same pattern as previous batches — common noun)
- Unflagged-jargon `colostrum` in entries 05 and 06 (registered in glossaryTerms of entry 05 and now also 06; warnings fire on the plain-text check before the tooltip path — non-blocking)

## Anti-tell patterns this batch

`genuinely` appeared again (entries 04 and 08) — recurred from bulk-004/005. Both in body prose, not excerpts this time. Stock phrase "if it is genuinely X" is the vector for entry 08.

`cures` as a concrete/material verb (entry 09: concrete curing) triggered the medical-claim watchword — same pattern as wood-natural-craft bulk-005. The fix is always "sets" for concrete.

Grade-level in troubleshooter `cause` fields is the dominant recurring failure: short fragments with polysyllabic technical terms (e.g. "anaphylactic", "susceptibility", "environmental contamination") score above threshold because the sentence is short and the syllable-per-word ratio spikes. Fix: replace with plain-English equivalents.

## Counts

- Animals & smallholding: 141 → **151**
- All categories published: **4,267**
