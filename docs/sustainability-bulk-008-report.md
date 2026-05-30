# Sustainability bulk-008 — batch report

**Date:** 2026-05-30
**Status:** 40 PUBLISHED

## Sub-category breakdown

| Sub-category | Count |
|---|---|
| insulation-and-draughtproofing | 10 |
| solar-and-energy | 8 |
| composting | 8 |
| water | 6 |
| waste-reduction | 5 |
| off-grid | 3 |
| **Total** | **40** |

## New tools seeded (11)

- `stanley-knife` — Stanley knife / utility knife
- `screwdriver` — Screwdriver (general)
- `straightedge` — Straightedge (1 m)
- `panel-saw` — Panel saw
- `paintbrush` — Paintbrush (general)
- `pipe-cutter` — Pipe cutter (15-22 mm)
- `drill` — Drill (cordless)
- `submersible-pump` — Submersible pump
- `pipe-lagging` — Pipe lagging (foam)
- `multimeter` — Multimeter
- `battery-hydrometer` — Battery hydrometer

Seeded via `seed-tools.ts`: 11 created, 0 updated, 778 unchanged.

## Voice-check issues and fixes

Several files required fixes before upload:

- **grade-level** (paragraphs ≥12.0): affected files 05, 12, 14, 16, 17, 32, 33, 36, 37, 40. Root cause: the standalone voice-check script checks each text node of a multi-node paragraph independently; the upload-embedded voice-check concatenates all text nodes before grading. Paragraphs with glossaryTooltip marks that individually scored <12.0 could still fail on the combined text. Fixes applied by simplifying sentence structure across the concatenated text.
- **em-dash-paragraph**: file 17 had an em-dash in a paragraph node. Replaced with a plain space.
- **price-mention**: no files had literal £ values in body/excerpt after authoring-time guidelines were followed.

## Hero images

All 40 heroes filled via `fixup-hero-fill.ts`:
- unsplash: 27
- pexels: 12
- flux-schnell: 1
- failed: 0

## Post-publish QC

Run: `qc-fix.ts --recently-published --since "2 hours ago" --auto-fix`
- processed: 122, pass: 97, still_blocked: 25 (pre-existing)
