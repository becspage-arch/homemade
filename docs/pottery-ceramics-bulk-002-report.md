# Pottery & Ceramics — bulk-002 batch report

**Date:** 2026-05-21  
**Session type:** Autopilot worker  
**Model:** Sonnet 4.6  
**Status:** COMPLETE — 40 entries PUBLISHED

---

## Entries published (40)

| # | Slug | Sub-category | Difficulty |
|---|------|-------------|------------|
| 01 | wedging-clay-for-hand-building | hand-building | BEGINNER |
| 02 | making-clay-slip-and-slurry | hand-building | BEGINNER |
| 03 | testing-clay-dryness-by-colour-and-touch | hand-building | BEGINNER |
| 04 | making-a-hump-mould-for-bowls | hand-building | BEGINNER |
| 05 | pinch-pot-bowl-air-dry-clay | hand-building-no-equipment | BEGINNER |
| 06 | coil-pot-paper-clay-vase | hand-building-no-equipment | BEGINNER |
| 07 | slab-oval-soap-dish | hand-building | BEGINNER |
| 08 | slab-picture-frame-clay | hand-building | BEGINNER |
| 09 | coil-built-herb-pot-trio | hand-building-no-equipment | BEGINNER |
| 10 | slab-tray-with-folded-rim | hand-building | BEGINNER |
| 11 | pinch-and-coil-handled-mug-air-dry | hand-building-no-equipment | BEGINNER |
| 12 | polymer-clay-geometric-pendant | polymer-clay | BEGINNER |
| 13 | polymer-clay-marble-effect-coasters | hand-building-no-equipment | BEGINNER |
| 14 | polymer-clay-flower-cane-earrings | polymer-clay | INTERMEDIATE |
| 15 | polymer-clay-textured-bangle | polymer-clay | BEGINNER |
| 16 | paper-clay-hanging-wall-stars | hand-building-no-equipment | BEGINNER |
| 17 | paper-clay-lidded-box | hand-building-no-equipment | INTERMEDIATE |
| 18 | coil-built-tall-amphora-jar | hand-building | INTERMEDIATE |
| 19 | slab-built-oval-planter | hand-building | INTERMEDIATE |
| 20 | applying-pva-sealer-and-varnish | finishing | BEGINNER |
| 21 | decorating-polymer-clay-with-alcohol-inks | polymer-clay | BEGINNER |
| 22 | mishima-inlay-on-air-dry-clay | surface-decoration | INTERMEDIATE |
| 23 | clay-texture-roller-technique | surface-decoration | BEGINNER |
| 24 | sgraffito-abstract-tile | surface-decoration | BEGINNER |
| 25 | slip-decorated-coaster-set | surface-decoration | BEGINNER |
| 26 | underglaze-painting-on-bisqueware-no-kiln | glazing | BEGINNER |
| 27 | polymer-clay-face-bead | polymer-clay | INTERMEDIATE |
| 28 | paper-clay-moon-mobile | hand-building-no-equipment | BEGINNER |
| 29 | centring-half-kilo-of-stoneware | throwing | BEGINNER |
| 30 | opening-a-thrown-mound | throwing | BEGINNER |
| 31 | pulling-a-cylinder-wall | throwing | BEGINNER |
| 32 | trimming-a-foot-ring-on-the-wheel | throwing | INTERMEDIATE |
| 33 | attaching-a-pulled-handle | throwing | INTERMEDIATE |
| 34 | bisque-firing-schedule-cone-06 | kiln-work | BEGINNER |
| 35 | applying-wax-resist-for-glaze-decoration | glazing | BEGINNER |
| 36 | thrown-bowl-smooth-stoneware | throwing | BEGINNER |
| 37 | thrown-mug-smooth-stoneware | throwing | INTERMEDIATE |
| 38 | dipping-glaze-on-a-bisque-bowl | glazing | INTERMEDIATE |
| 39 | brushed-underglaze-decoration-on-bisqueware | glazing | BEGINNER |
| 40 | layered-glaze-dip-two-colour-effect | glazing | INTERMEDIATE |

---

## Voice-check fixes applied

All 40 files passed voice-check with 0 errors before upload. Issues found and fixed:

- **Em-dashes (—):** Replaced throughout with semicolons, colons, commas, or parentheses. Heavy in files 17–35 (the authoring session used em-dashes liberally). Files 29–35 averaged 6–8 fixes each.
- **Invalid JSON (trailing commas):** Files 13 and 38 had trailing commas in glossaryTerms arrays. Fixed.
- **Glossary coverage:**
  - File 22: `mishima` registered but never used inline — added glossaryTooltip mark.
  - File 23: `leather-hard` used inline with tooltip but not declared — added to glossaryTerms.
  - File 36: `pulling` registered but never used inline — added glossaryTooltip mark.
  - Files 38 and 40: `crawling` declared but only appears in troubleshooter plain-text strings (marks not supported there) — removed from glossaryTerms.
- **Em-dash in glossary definitions:** Fixed in files 36, 37, 38, 40.
- **projectSchedule schema:** Files 36 and 37 used `step`/`label`/`notes` instead of `stepNumber`/`offsetDays`/`title`/`body`. Fixed with appropriate offsets (0, 1, 7, 14 days for throw/trim/bisque/glaze).

---

## Warnings (not fixed — all false positives or low priority)

- `tricolon`: Several files flag three-item lists in excerpt or body. All are genuine lists, not padding.
- `brand-trademark "Target"`: Flags the word "target" as an adjective (e.g. "target clay slab", "target surface"). Not a brand reference.
- `brand-trademark "Flake"`: Flags "flake" in a general context. Not a brand reference.
- `americanism "fall"`: Flags "fall off" (= detach). Not the season.
