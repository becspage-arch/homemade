# Fibre-arts bulk-015 batch report
**Date:** 2026-06-12
**Model:** claude-sonnet-4-6
**Category:** fibre-arts
**Routine:** autopilot-queue-extra (secondary, fires at :15 past)
**Entries published:** 39 (517 → 556)

## Sub-category breakdown

| Sub-category   | Before | Added | After |
|----------------|--------|-------|-------|
| felting        | 156    | 11    | 167   |
| spinning       | 104    | 8     | 112   |
| weaving        | 102    | 8     | 110   |
| natural-dyeing | 75     | 6     | 81    |
| macramé        | 53     | 4     | 57    |
| rug-making     | 27     | 2     | 29    |
| **Total**      | **517**| **39**| **556**|

## Entries

### Felting (11)
- needle-felted-adder (INTERMEDIATE PATTERN)
- needle-felted-alpaca (INTERMEDIATE PATTERN)
- needle-felted-bullfinch (BEGINNER PATTERN)
- needle-felted-chaffinch (BEGINNER PATTERN)
- needle-felted-harvest-mouse (BEGINNER PATTERN)
- needle-felted-highland-cow (INTERMEDIATE PATTERN)
- needle-felted-long-tailed-tit (BEGINNER PATTERN)
- wet-felted-bread-basket (INTERMEDIATE PATTERN)
- wet-felted-christmas-bauble-set (BEGINNER PATTERN, WINTER)
- wet-felted-desk-tidy (BEGINNER PATTERN)
- felting-with-silk-throwsters-waste (INTERMEDIATE TECHNIQUE)

### Spinning (8)
- spinning-bamboo-silk-blend (INTERMEDIATE TECHNIQUE)
- spinning-for-fair-isle (INTERMEDIATE TECHNIQUE)
- spinning-from-flicked-locks (BEGINNER TECHNIQUE)
- spinning-leicester-longwool (INTERMEDIATE TECHNIQUE)
- spinning-lincolnshire-longwool (INTERMEDIATE TECHNIQUE)
- spinning-rough-fell-wool (ADVANCED TECHNIQUE)
- spinning-ryeland-wool (INTERMEDIATE TECHNIQUE)
- spinning-with-dog-hair (ADVANCED TECHNIQUE)

### Weaving (8)
- double-heddle-rigid-heddle-weaving (INTERMEDIATE TECHNIQUE)
- four-shaft-overshot-star-and-rose (INTERMEDIATE TECHNIQUE)
- hemstitching-a-handwoven-piece (BEGINNER TECHNIQUE)
- inkle-woven-trim (BEGINNER TECHNIQUE)
- tapestry-shapes-and-outlines (INTERMEDIATE TECHNIQUE)
- woven-baby-blanket-four-shaft (INTERMEDIATE PATTERN)
- woven-clutch-bag-rigid-heddle (INTERMEDIATE PATTERN)
- woven-cotton-dishcloth-plain-weave (BEGINNER PATTERN)

### Natural dyeing (6)
- dyeing-with-brazilwood (INTERMEDIATE TECHNIQUE)
- dyeing-with-cutch-extract (INTERMEDIATE TECHNIQUE)
- dyeing-with-elder-leaves (BEGINNER TECHNIQUE)
- dyeing-with-hops (INTERMEDIATE TECHNIQUE)
- dyeing-with-sweet-woodruff (BEGINNER TECHNIQUE)
- mordanting-with-rhubarb-leaves (INTERMEDIATE TECHNIQUE)

### Macramé (4)
- macrame-beaded-wall-hanging (INTERMEDIATE PATTERN)
- macrame-dreamcatcher (BEGINNER PATTERN)
- macrame-feather-earrings (BEGINNER PATTERN)
- macrame-hammock-chair-swing (ADVANCED PATTERN)

### Rug-making (2)
- peg-loom-rug-basics (BEGINNER TECHNIQUE)
- punch-needle-cushion-front (INTERMEDIATE PATTERN)

## Pre-flight notes

Batch 015 briefs were previously drafted but never uploaded (no prior report or commit). The batch
re-run uploaded them cleanly; needle-felted-weasel was already PUBLISHED from a prior partial run
and was skipped.

## Voice-check summary

- tapestry-shapes-and-outlines: failed first upload with `glossary-coverage` hard error (weft term
  registered but not wrapped inline). Fixed by splitting the interlocking paragraph to add a
  `glossaryTooltip` mark on the first occurrence of "weft". Second upload: clean exit.
- All other 38 entries: uploaded without voice-check hard errors.
- No drops.

## Pre-upload tool slug fix

- 3 briefs referenced `tape-measure-soft` (not in master Tool table). Correct slug is
  `measuring-tape-soft`. Fixed in wet-felted-bread-basket, wet-felted-christmas-bauble-set,
  wet-felted-desk-tidy before upload.

## Hero fill result

- pexels: 37
- wikimedia: 1
- flux-schnell: 0
- failed: 1 (wet-felted-christmas-bauble-set — Flux billing halt triggered)
- Flux billing halt file written to docs/_flux-billing-halt.md; email sent to rebecca@homemade.education

## QC result

- 39 processed, 38 pass, 1 still_blocked
- grade-level-strict: 8 auto-fixed
- hero-missing: 1 still blocked (wet-felted-christmas-bauble-set) — hourly qc-fix-batch routine
  will retry once Flux billing is topped up

## Notes

- Relevance queue written to docs/image-relevance-queue-fibre-arts-bulk-015.json
- This fire came from `autopilot-queue-extra` (secondary routine)
- Natural dyeing entries: brazilwood + cutch-extract do not have Garden cross-links (traded
  historical dyes, not grown in the garden) — briefs note this explicitly
- Glossary coverage: weft tooltip fix added to tapestry-shapes-and-outlines
