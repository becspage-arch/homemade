# paper-word bulk-002 — batch report

**Date:** 2026-05-20
**Model:** claude-sonnet-4-6
**Status:** 40 PUBLISHED

## Counts after upload

| Category | Published |
|---|---:|
| paper-word total | 82 |

## Slugs published this batch

### Bookbinding (10)
1. `pamphlet-stitch-notebook` — PATTERN BEGINNER
2. `signature-folding-and-piercing` — TECHNIQUE BEGINNER
3. `covering-boards-with-paper` — TECHNIQUE BEGINNER
4. `pasting-down-endpapers` — TECHNIQUE INTERMEDIATE
5. `concertina-sketchbook` — PATTERN BEGINNER
6. `japanese-stab-binding-kikko` — PATTERN INTERMEDIATE
7. `sewing-on-tapes` — TECHNIQUE INTERMEDIATE
8. `perfect-bound-notebook` — PATTERN INTERMEDIATE
9. `coptic-stitch-hardback` — PATTERN INTERMEDIATE
10. `raised-cord-binding` — PATTERN ADVANCED

### Calligraphy (8)
11. `uncial-lower-case-alphabet` — PATTERN BEGINNER
12. `italic-capital-letters` — PATTERN INTERMEDIATE
13. `preparing-a-dip-nib` — TECHNIQUE BEGINNER
14. `making-iron-gall-ink` — TECHNIQUE INTERMEDIATE
15. `copperplate-lower-case-alphabet` — PATTERN INTERMEDIATE
16. `spencerian-capital-letters` — PATTERN INTERMEDIATE
17. `flourishing-copperplate` — TECHNIQUE ADVANCED
18. `versal-letters-illuminated` — PATTERN INTERMEDIATE

### Papermaking (7)
19. `pressing-and-drying-handmade-sheets` — TECHNIQUE BEGINNER
20. `abaca-fibre-sheet-forming` — PATTERN INTERMEDIATE
21. `watermarks-on-the-mould` — TECHNIQUE INTERMEDIATE
22. `kozo-washi-sheet-forming` — PATTERN INTERMEDIATE
23. `pulp-painting-on-wet-sheets` — TECHNIQUE INTERMEDIATE
24. `making-a-cotton-rag-pulp` — TECHNIQUE BEGINNER

### Marbling (4)
25. `stone-pattern-marbling` — TECHNIQUE BEGINNER
26. `bouquet-combing-pattern` — TECHNIQUE INTERMEDIATE
27. `oil-on-water-marbling` — TECHNIQUE BEGINNER
28. `spanish-wave-marbling` — TECHNIQUE INTERMEDIATE

### Journalling craft (4)
29. `hand-lettered-journal-headers` — TECHNIQUE BEGINNER
30. `index-and-key-pages` — TECHNIQUE BEGINNER
31. `folded-envelopes-in-journals` — PATTERN BEGINNER
32. `watercolour-backgrounds-for-journal-pages` — TECHNIQUE BEGINNER

### Papercutting (2)
33. `silhouette-portrait-papercutting` — PATTERN BEGINNER
34. `six-pointed-snowflake-papercut` — PATTERN BEGINNER

### Zines (2)
35. `accordion-fold-zine` — PATTERN BEGINNER
36. `saddle-stapled-zine` — PATTERN BEGINNER

### Scrapbooking (2)
37. `double-page-scrapbook-spread` — TECHNIQUE BEGINNER
38. `ephemera-mounting-techniques` — TECHNIQUE BEGINNER

### Origami (2)
39. `waterbomb-base` — TECHNIQUE BEGINNER
40. `origami-samurai-hat` — PATTERN BEGINNER

## Voice-check results

- 32 clean (exit 0)
- 8 warnings only (exit 1): files 15, 20, 24, 28, and four fixed-then-clean
- 0 blocked on errors after fixes

Fixes applied:
- File 02: added `foredge` glossaryTooltip inline
- File 05: "stands as a" → "fans out as a"
- File 07: added `sewing-station` glossaryTooltip inline
- File 16: "essentially" removed
- File 27: em-dash in excerpt replaced with semicolon
- File 33: two em-dashes replaced with parentheses
- File 36: two em-dashes replaced with parentheses
- File 38: em-dashes in excerpt replaced with parentheses

Tool slug corrections (recipeTools only — suppliesCard text unchanged):
- `papermaking-mould-and-deckle` → `paper-mould-deckle-a4`
- `paper-beater` → `papermaking-blender`
- `fine-binding-wire`, `round-nose-pliers` → removed
- `wire-cutters` → `wire-cutter`
- `sewing-needle-large` → `bookbinding-needle`
- `squeeze-bottle`, `long-arm-stapler` → removed (not in master table)
- `carrageenan-size` → `carrageenan`
- `marbling-paints` → `marbling-acrylic-liquid`
- `marbling-eyedropper` → `eyedropper`
- `marbling-comb-fine` / `marbling-comb-wide` → `marbling-comb`
- `alum-solution` → `marbling-paper-alum`
- `oil-based-ink` → removed; `white-spirit` → `oil-marbling-turpentine`
- `brush-pen-fine` → `brush-pen`; `fine-liner-pen-03` → removed
- `pencil-hb`, `eraser`, `small-scissors-pointed`, `watercolour-pan-set`, `watercolour-brush-round-8`, `water-pot`, `masking-tape` → removed
- `origami-paper` → `kami-15cm`

## Recurring patterns (not yet at 3-threshold for anti-tells file)

- Tool slugs invented vs. master table: the marbling and journalling tools were completely new slugs not in tools.ts. Batch-003 should pre-check tool slugs against the master table before writing files.
- "stands as a" is a banned phrase — watch for in future batches.
- Em-dashes occasionally slipping into excerpts even with zero-em-dash rule enforced.
