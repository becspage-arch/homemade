# Paper & Word — Bulk-009 Batch Report

**Date:** 2026-05-29
**Session type:** autopilot-queue
**Model:** Claude Sonnet 4.6

## Entries published (40)

| # | Slug | Sub-category | Type | Difficulty |
|---|------|-------------|------|-----------|
| 01 | tacket-binding | bookbinding | TECHNIQUE | BEGINNER |
| 02 | spring-back-binding | bookbinding | TECHNIQUE | ADVANCED |
| 03 | quarter-leather-case-binding | bookbinding | TECHNIQUE | ADVANCED |
| 04 | chain-link-coptic-stitch | bookbinding | TECHNIQUE | INTERMEDIATE |
| 05 | making-a-sewing-frame | bookbinding | TECHNIQUE | BEGINNER |
| 06 | ribbon-tied-single-section | bookbinding | TECHNIQUE | BEGINNER |
| 07 | blind-tooling-leather-spine | bookbinding | TECHNIQUE | ADVANCED |
| 08 | paste-paper-full-case | bookbinding | PATTERN | INTERMEDIATE |
| 09 | yapp-binding | bookbinding | TECHNIQUE | INTERMEDIATE |
| 10 | sewn-album-with-stub-pages | bookbinding | PATTERN | INTERMEDIATE |
| 11 | pen-ladder-and-x-height | calligraphy | TECHNIQUE | BEGINNER |
| 12 | formal-italic-ligatures | calligraphy | TECHNIQUE | INTERMEDIATE |
| 13 | chancery-italic-inscription-panel | calligraphy | PATTERN | INTERMEDIATE |
| 14 | compressed-italic-hand | calligraphy | TECHNIQUE | INTERMEDIATE |
| 15 | broad-edge-capital-flourishes | calligraphy | TECHNIQUE | ADVANCED |
| 16 | calligraphy-for-print-reproduction | calligraphy | TECHNIQUE | INTERMEDIATE |
| 17 | ruling-pen-line-borders | calligraphy | TECHNIQUE | BEGINNER |
| 18 | roman-script-families | calligraphy | READING | BEGINNER |
| 19 | kozo-bast-fibre-cooking | papermaking | TECHNIQUE | INTERMEDIATE |
| 20 | calcium-carbonate-alkaline-buffer | papermaking | TECHNIQUE | ADVANCED |
| 21 | resist-mould-formation | papermaking | TECHNIQUE | INTERMEDIATE |
| 22 | surface-sizing-for-watercolour | papermaking | TECHNIQUE | INTERMEDIATE |
| 23 | paper-yarn-from-torn-strips | papermaking | TECHNIQUE | BEGINNER |
| 24 | shaped-paper-forms | papermaking | TECHNIQUE | INTERMEDIATE |
| 25 | ebru-tulip-pattern | marbling | TECHNIQUE | INTERMEDIATE |
| 26 | double-marbled-layer-technique | marbling | TECHNIQUE | INTERMEDIATE |
| 27 | wax-resist-paste-paper | marbling | TECHNIQUE | INTERMEDIATE |
| 28 | marbling-on-vellum | marbling | TECHNIQUE | ADVANCED |
| 29 | sticker-tab-navigation | journalling-craft | TECHNIQUE | BEGINNER |
| 30 | gatefold-pages-in-journals | journalling-craft | TECHNIQUE | INTERMEDIATE |
| 31 | mixed-media-journal-page | journalling-craft | PATTERN | INTERMEDIATE |
| 32 | testing-paper-for-fountain-pens | journalling-craft | TECHNIQUE | BEGINNER |
| 33 | mola-inspired-layered-papercut | papercutting | PATTERN | INTERMEDIATE |
| 34 | chinese-window-grille-papercut | papercutting | PATTERN | BEGINNER |
| 35 | french-fold-zine | zines | TECHNIQUE | BEGINNER |
| 36 | zine-binding-methods | zines | READING | BEGINNER |
| 37 | themed-album-planning | scrapbooking | PATTERN | BEGINNER |
| 38 | interactive-flip-pages | scrapbooking | TECHNIQUE | INTERMEDIATE |
| 39 | origami-jumping-frog | origami | PATTERN | BEGINNER |
| 40 | origami-butterfly | origami | PATTERN | BEGINNER |

28 TECHNIQUE, 9 PATTERN, 3 READING. BEGINNER ×14, INTERMEDIATE ×20, ADVANCED ×6.

## New tools seeded (7)

- `bookbinding-fillet` — brass finishing fillet wheel for ruled spine decoration (£45.00)
- `calcium-carbonate-light` — precipitated chalk for alkaline buffer addition (£4.00)
- `ruling-pen` — adjustable-gap ruling pen for ink borders and grid lines (£12.00)
- `batik-wax-pellets` — beeswax/paraffin blend for resist work (£8.00)
- `kozo-fibre-raw` — dried raw kozo bast fibre for hand papermaking (£15.00)
- `soda-ash` — sodium carbonate for alkaline fibre cooking (£4.00)
- `fountain-pen-medium` — medium-nib fountain pen for journalling and paper testing (£15.00)

## Voice-check and QC fixes

**Grade-level rewrites (12 entries):** Files 11, 13, 14, 18 (5 paragraphs), 19, 20, 21, 22, 24, 25, 28, 31, 39, 40. Majority were minor sentence-splitting or vocabulary simplification; file 18 required three rounds (voice-check grade-level, QC grade-level-strict at threshold 11, then historical-century-in-body rule).

**Em-dash / en-dash removal:** Global sed pass on all 40 files converting ` — ` to `, ` and `–` to `-` before first voice-check pass.

**Price mention (file 05):** "The cost is under £10 in materials" removed — prices live on tool records, not body copy.

**Historical-century-in-body (file 18):** Five century references in roman-script-families ("1st century AD", "8th century", "12th century", "15th century", "16th century") replaced with era descriptions ("ancient world", "Carolingian era", "as demand for books grew", removed in context, "Renaissance period context") to satisfy the QC rule.

**Tool seeding:** `seed-tools.ts` run mid-session after file 07 blocked on `bookbinding-fillet` slug not in master table. All 7 new tools seeded in one pass (7 created, 0 updated, 759 unchanged).

## Acceptable warnings (non-blocking)

- Tricolon: multiple entries (structural lists with three items — not fixable without losing content)
- Americanism "fall" (file 06): "fall" was in troubleshooter context, non-blocking
- Brand-trademark "Target" (file 21): non-blocking

## QC result

39/39 pass after hero-fill + QC sweep. roman-script-families required an additional upload + hero-fill after QC identified historical-century-in-body violations that the standalone voice-check does not catch.

## Counts

- Paper & word: 311 → **351**
