# Pottery & ceramics bulk-001 report

**Date:** 2026-05-20  
**Session type:** Autopilot-queue (round-robin pick)  
**Category:** Pottery & ceramics  
**Status:** 40 entries PUBLISHED

## Summary

40 tutorials drafted and published across 3 sub-categories. Entire batch is the no-equipment track (air-dry clay, paper clay, and polymer clay) — no kiln, no wheel. Clay bodies: `air-dry-clay` (files 01-23, 32-40), `paper-clay-air-dry` (files 01, 20-23), `polymer-clay` (files 24-31). 13 foundational TECHNIQUEs (rolling, coiling, joining, drying stages, reclaiming, moulding, sgraffito, slip trailing, stamping, carving, marbling, painting, sprig moulding) plus 27 PATTERNs.

## Sub-category breakdown

| Sub-category | Count | Type split |
|---|---|---|
| clay-fundamentals | 7 | TECHNIQUE ×7 |
| hand-building-no-equipment | 26 | PATTERN ×26 |
| surface-decoration | 7 | TECHNIQUE ×6, PATTERN ×1 |

**Difficulty:** BEGINNER ×34, INTERMEDIATE ×6  
**Types:** PATTERN ×27, TECHNIQUE ×13

## Voice-check fixes required

### File corruption — opening `{` removed from all 40 files

A PowerShell BOM-removal script run after the em-dash fix (`Set-Content -Encoding UTF8`) introduced a UTF-8 BOM (EF BB BF), and the subsequent BOM-removal pass using `[System.IO.File]::WriteAllText` on all files accidentally removed the opening `{` from every file. Confirmed by hex dump: files started with `0a 20 20 22 73 6c 75 67 22` instead of `7b 0a`. Fixed by re-prepending `{` to all 40 files using PowerShell with UTF-8-no-BOM encoding (`New-Object System.Text.UTF8Encoding $false`).

### JSON malformed heading quotes — 6 files

Files 35-40 had heading `content` nodes with `' }]` instead of `" }]` — a single-quote was substituted for the closing double-quote on the text string. Fixed by string replacement on the 6 affected files.

### Banned phrase — file 01

`rolling-a-clay-slab`: troubleshooter fix used "genuinely dry" → replaced with "too dry to knead without crumbling".

### Safety-block heading — file 07

`coil-pot-bowl-air-dry-clay`: h2 heading "Before you start: make slurry" removed; content merged into the "Building the bowl" section as Step 1 (h3), subsequent steps renumbered 2-6.

### Warning infoPanel too long — files 10, 17, 24

- `pinch-pot-tea-light-holder` (file 10): 36-word warning → 13 words ("Use tea lights only; walls must be at least 8 mm thick throughout.")
- `slab-cup-air-dry-clay` (file 17): 34-word warning → 14 words ("Air-dry clay is porous and not food-safe; use this cup for dry items only.")
- `polymer-clay-bead-set` (file 24): 58-word warning → 17 words ("Verify the actual oven temperature with a thermometer before baking; polymer clay burns above 175°C.")

## Upload

All 40 files uploaded as `PUBLISHED` via `upload-tutorial.ts --status PUBLISHED`. No upload failures. No new tool slugs needed. New glossary terms created: slab, guide-rails, coil, coil-building, score-and-slip, slip, wet-clay, greenware, reclaim, slop, drape-mould, hump-mould, slurry, paper-clay, polymer-clay, curing, millefiori, reducing, sgraffito, slip-trailing, stamping, incised, relief-carving, sprig, score-and-slip, leather-hard, bone-dry.

## Files

| # | Slug | Sub-category | Type | Difficulty |
|---|---|---|---|---|
| 01 | rolling-a-clay-slab | clay-fundamentals | TECHNIQUE | BEGINNER |
| 02 | rolling-clay-coils | clay-fundamentals | TECHNIQUE | BEGINNER |
| 03 | joining-clay-score-and-slip | clay-fundamentals | TECHNIQUE | BEGINNER |
| 04 | reading-clay-drying-stages | clay-fundamentals | TECHNIQUE | BEGINNER |
| 05 | reclaiming-air-dry-clay | clay-fundamentals | TECHNIQUE | BEGINNER |
| 06 | making-a-simple-drape-mould | clay-fundamentals | TECHNIQUE | BEGINNER |
| 07 | coil-pot-bowl-air-dry-clay | hand-building-no-equipment | PATTERN | BEGINNER |
| 08 | slab-box-with-lid-air-dry-clay | hand-building-no-equipment | PATTERN | BEGINNER |
| 09 | drape-moulded-bowl-air-dry-clay | hand-building-no-equipment | PATTERN | BEGINNER |
| 10 | pinch-pot-tea-light-holder | hand-building-no-equipment | PATTERN | BEGINNER |
| 11 | coil-built-planter-air-dry-clay | hand-building-no-equipment | PATTERN | INTERMEDIATE |
| 12 | slab-vase-air-dry-clay | hand-building-no-equipment | PATTERN | BEGINNER |
| 13 | hump-moulded-plate-air-dry-clay | hand-building-no-equipment | PATTERN | BEGINNER |
| 14 | flat-slab-wall-hanging | hand-building-no-equipment | PATTERN | BEGINNER |
| 15 | coil-and-pinch-combined-bowl | hand-building-no-equipment | PATTERN | BEGINNER |
| 16 | pinch-pot-ring-dish | hand-building-no-equipment | PATTERN | BEGINNER |
| 17 | slab-cup-air-dry-clay | hand-building-no-equipment | PATTERN | BEGINNER |
| 18 | slab-jewellery-dish | hand-building-no-equipment | PATTERN | BEGINNER |
| 19 | tall-coil-cylinder-vase | hand-building-no-equipment | PATTERN | INTERMEDIATE |
| 20 | paper-clay-sculptural-bird | hand-building-no-equipment | PATTERN | INTERMEDIATE |
| 21 | paper-clay-wall-tile | hand-building-no-equipment | PATTERN | BEGINNER |
| 22 | paper-clay-name-plaque | hand-building-no-equipment | PATTERN | BEGINNER |
| 23 | paper-clay-leaf-bowl | hand-building-no-equipment | PATTERN | BEGINNER |
| 24 | polymer-clay-bead-set | hand-building-no-equipment | PATTERN | BEGINNER |
| 25 | polymer-clay-leaf-pendant | hand-building-no-equipment | PATTERN | BEGINNER |
| 26 | polymer-clay-millefiori-cane | hand-building-no-equipment | PATTERN | INTERMEDIATE |
| 27 | polymer-clay-brooch | hand-building-no-equipment | PATTERN | BEGINNER |
| 28 | polymer-clay-teardrop-earrings | hand-building-no-equipment | PATTERN | BEGINNER |
| 29 | polymer-clay-miniature-succulent | hand-building-no-equipment | PATTERN | INTERMEDIATE |
| 30 | polymer-clay-buttons | hand-building-no-equipment | PATTERN | BEGINNER |
| 31 | polymer-clay-flower-hair-clip | hand-building-no-equipment | PATTERN | BEGINNER |
| 32 | sgraffito-on-air-dry-clay | surface-decoration | TECHNIQUE | BEGINNER |
| 33 | slip-trailing-on-air-dry-clay | surface-decoration | TECHNIQUE | BEGINNER |
| 34 | stamping-texture-into-clay | surface-decoration | TECHNIQUE | BEGINNER |
| 35 | carving-patterns-leather-hard-clay | surface-decoration | TECHNIQUE | BEGINNER |
| 36 | marbling-two-tone-air-dry-clay | clay-fundamentals | TECHNIQUE | BEGINNER |
| 37 | painting-air-dry-clay-acrylics | surface-decoration | TECHNIQUE | BEGINNER |
| 38 | sprig-moulding-technique | surface-decoration | TECHNIQUE | INTERMEDIATE |
| 39 | leaf-impression-tile-set | surface-decoration | PATTERN | BEGINNER |
| 40 | incised-name-sign-clay | hand-building-no-equipment | PATTERN | BEGINNER |
