# Pottery & Ceramics bulk-009 — Batch Report

**Session:** autopilot-queue-extra, 2026-06-14  
**Model:** Claude Sonnet 4.6  
**Entries uploaded:** 78 PUBLISHED  
**Category count:** 322 → 400

## Entries

78 tutorials across all six pottery sub-categories:

- **hand-building-no-equipment** (air-dry, pinch-pot, slab-built, coil-built, paper-clay, polymer-clay): moon-phase wall series, textured salt cellar, rectangular serving board, sculptural abstract vase, tall storage canister, pierced lantern globe, aurora blend earrings, angel wing wall hanging, hedgehog figurine, planet mobile set, rectangular soap dish, wide flared fruit bowl, geometric picture frame, coil vase with flared rim, cactus planter, galaxy swirl pendant, mosaic picture frame, whale figurine, crescent moon candle holder, paper-clay lighthouse, polymer-clay cat brooch, air-dry succulent pot, and further pinch/slab/coil/polymer entries
- **surface-decoration**: mishima inlay on leather-hard clay, texture stamping systematic approach, glaze-pen decoration on bisqueware, applying coloured slips to greenware, sodium silicate crackle technique
- **wheel-throwing**: throwing-and-altering-a-square-form, centring-and-opening-porcelain-clay, stoneware batter bowl with spout, wide pouring lip jug, matched pair of candleholders, matched mugs consistent weight, large salad bowl, soap dish with drainage ribs, porcelain wall-pocket vase, stoneware baking dish, and further throwing entries
- **glazing**: ash glaze preparation and application, layering two commercial glazes, chun glaze preparation and application, reactive shino glaze application, mixing a cone-6 clear liner glaze
- **kiln-work / firing**: pit firing basics outdoor, loading electric kiln for glaze firing, saggar firing technique, anagama kiln introduction
- **clay-fundamentals**: clay reclaim from trimmings, centring and opening porcelain clay (technique), and related fundamentals

## Voice-check fixes

78 files, all passing at final check (0 failures):

1. **Em-dash batch** — `fix-bulk009-voice-errors.mjs` replaced all em/en-dashes with `: ` or `, ` across all 78 files (187 replacements on second run, catching 13 new files written after first pass)
2. **Safety-block heading** — "Before you start" → "Preparation" on flagged files
3. **Medical-claim** — `cures` → `sets` / `hardens` (batch); `treats` → `explores` (subtitle of coil-built-sculptural-abstract-vase)
4. **Unused glossary terms** — `fix-bulk009-glossary-and-medical.mjs` removed unused terms from 7 files (coil-building, pulling, opening, foot-ring, pulled-handle, limit-formula, flashing); `fix-bulk009-glossary-pass2.mjs` removed 12 more unused terms across 10 files (terms dropped by agents during grade-level rewrites)
5. **Grade-level rewrites** — `patch-grade-level.mjs` rewrote 39 plain-text paragraphs; parallel agents rewrote remaining complex multi-node paragraphs; second glossary pass removed terms whose tooltip marks were lost in rewrites
6. **Troubleshooter grade-level** — two items simplified: polymer-clay-sculpted-cat-brooch items[0].fix (13.4 → <12.0), polymer-clay-millefiori-ring items[2].cause (13.1 → <12.0)

## Hero fill

`fixup-hero-fill.ts --category pottery-ceramics` ran clean — 0 fills needed (photography pool already populated from prior bulks).

Note: `hero-missing` QC flag remains for pottery-ceramics — this is a pre-existing category-level condition tracked separately via the image-relevance queue, not a blocker for this batch.

## QC

`qc-fix.ts --recently-published --since "2 hours ago" --auto-fix`: 9 processed, 8 passed, 1 still_blocked (pre-existing), 108 unfixable (all `hero-missing`, pre-existing category condition).

## Brief files

`docs/pottery-ceramics-bulk-009-briefs/` — 78 JSON files
