# paper-word bulk-006 report

**Date**: 2026-05-29  
**Category**: paper-word  
**Batch**: bulk-006  
**Entries authored**: 40  
**Status**: All 40 PUBLISHED  
**Model**: claude-sonnet-4-6 (Sonnet)  
**Category total after batch**: 233 published (target 800)

## Sub-category distribution

| Sub-category | Count |
|---|---|
| bookbinding | 10 |
| calligraphy | 8 |
| papermaking | 6 |
| marbling | 4 |
| journalling-craft | 6 |
| papercutting | 2 |
| zines | 2 |
| scrapbooking | 2 |

## Entry list

| # | Slug | Type | Difficulty |
|---|---|---|---|
| 01 | drum-leaf-album | PATTERN | INTERMEDIATE |
| 02 | flutter-book | PATTERN | BEGINNER |
| 03 | hand-fitted-marbled-endpapers | TECHNIQUE | INTERMEDIATE |
| 04 | book-spine-reback | TECHNIQUE | INTERMEDIATE |
| 05 | making-a-clamshell-box | PATTERN | INTERMEDIATE |
| 06 | limp-binding-with-vellum-wrappers | PATTERN | ADVANCED |
| 07 | waxing-bookbinding-thread | TECHNIQUE | BEGINNER |
| 08 | full-cloth-case-binding | PATTERN | INTERMEDIATE |
| 09 | double-fan-adhesive-binding | TECHNIQUE | INTERMEDIATE |
| 10 | trimming-text-block-by-hand | TECHNIQUE | INTERMEDIATE |
| 11 | versal-capital-letterforms | TECHNIQUE | INTERMEDIATE |
| 12 | copperplate-flourishing | TECHNIQUE | ADVANCED |
| 13 | foundational-capital-hand | TECHNIQUE | BEGINNER |
| 14 | italic-capitals-chancery-hand | TECHNIQUE | INTERMEDIATE |
| 15 | large-scale-poster-lettering | TECHNIQUE | BEGINNER |
| 16 | spencerian-business-hand | TECHNIQUE | INTERMEDIATE |
| 17 | roman-carved-letter-proportions | READING | INTERMEDIATE |
| 18 | gum-arabic-and-ink-consistency | TECHNIQUE | BEGINNER |
| 19 | abaca-fibre-sheet-forming | TECHNIQUE | INTERMEDIATE |
| 20 | watermark-making-with-wire | TECHNIQUE | INTERMEDIATE |
| 21 | blending-coloured-pulps | TECHNIQUE | BEGINNER |
| 22 | deckle-edge-and-waterleaf | TECHNIQUE | BEGINNER |
| 23 | kozo-paper-for-bookbinding | READING | INTERMEDIATE |
| 24 | pressed-botanical-inclusions | TECHNIQUE | INTERMEDIATE |
| 25 | oil-on-water-marbling | TECHNIQUE | INTERMEDIATE |
| 26 | spanish-wave-marbling | TECHNIQUE | INTERMEDIATE |
| 27 | agate-stone-marbling | TECHNIQUE | INTERMEDIATE |
| 28 | suminagashi-ink-preparation | TECHNIQUE | BEGINNER |
| 29 | index-and-key-page-design | TECHNIQUE | BEGINNER |
| 30 | sewn-booklet-refill-for-journal | PATTERN | INTERMEDIATE |
| 31 | hand-cut-tabs-and-dividers | TECHNIQUE | BEGINNER |
| 32 | art-journal-gesso-ground | TECHNIQUE | BEGINNER |
| 33 | silhouette-portrait-cutting | TECHNIQUE | INTERMEDIATE |
| 34 | kirigami-simple-pop-up | TECHNIQUE | BEGINNER |
| 35 | stab-sewn-zine | TECHNIQUE | BEGINNER |
| 36 | zine-editorial-grid | READING | BEGINNER |
| 37 | distress-ink-background-technique | TECHNIQUE | BEGINNER |
| 38 | shadow-box-scrapbook-page | TECHNIQUE | INTERMEDIATE |
| 39 | origami-preliminary-base | TECHNIQUE | BEGINNER |
| 40 | origami-samurai-hat | PATTERN | BEGINNER |

## Tools additions

10 new tool slugs added to `packages/db/scripts/data/tools.ts` and seeded:

- `gum-arabic` — Gum arabic (liquid) — calligraphy ink viscosity
- `abaca-fibre` — Abaca fibre (prepared) — long-fibre papermaking
- `gesso-white` — White gesso — art journal ground
- `foam-adhesive-dots` — Foam adhesive dots — scrapbooking dimension
- `palette-knife-small` — Palette knife (small) — gesso texture
- `bulldog-clips` — Bulldog clips — zine binding
- `ink-pad-distress` — Distress ink pad — scrapbooking backgrounds
- `blending-tool-foam` — Foam blending tool — ink blending
- `heat-embossing-tool` — Heat embossing tool — craft heat drying
- `pencil` — Pencil (HB) — marking and guide-line work

## Voice-check results

- All 40 entries: 0 errors after fixes
- Fixes required: termSlug attr format (all entries); em-dash rewrites (4 entries); grade-level rewrites (12 entries); year-in-body removal (1 entry); missing glossary inline wraps (3 entries); JSON syntax fix (1 entry)

## QC notes

- Session continued from compacted context; previous session wrote entries 01–30
- `flutter-book.json` passes with 2 warnings (Americanism "fall") — warnings do not block upload
- `silhouette-portrait-cutting.json` passes with 1 warning (tricolon) — warnings do not block upload
