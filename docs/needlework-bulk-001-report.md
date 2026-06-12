# needlework / needlepoint — bulk-001 batch report

**Date:** 2026-06-12
**Sub-category:** needlepoint
**Batch:** bulk-001
**Tutorials published:** 40

## Breakdown by type

| Type | Count |
|------|-------|
| TECHNIQUE | 15 |
| READING | 5 |
| PATTERN | 20 |

## Difficulty spread

| Difficulty | Count |
|------------|-------|
| BEGINNER | 18 |
| INTERMEDIATE | 20 |
| ADVANCED | 2 |

## Source mix

| Source type | Count |
|-------------|-------|
| PUBLIC_DOMAIN | 22 |
| SYNTHESISED | 18 |

PUBLIC_DOMAIN sources: Weldon's Practical Needlework, Thérese de Dillmont Encyclopaedia of Needlework (1886), Caulfeild & Saward Dictionary of Needlework (1882), Mrs Beeton Book of Needlework (1870).

## Tutorial slugs

### TECHNIQUE (001–015)
- `needlepoint-continental-tent-stitch`
- `needlepoint-basketweave-tent-stitch`
- `needlepoint-half-cross-stitch`
- `needlepoint-straight-gobelin-stitch`
- `needlepoint-brick-stitch`
- `needlepoint-hungarian-stitch`
- `needlepoint-mosaic-stitch`
- `needlepoint-scotch-stitch`
- `needlepoint-cashmere-stitch`
- `needlepoint-bargello-wave`
- `needlepoint-rhodes-stitch`
- `needlepoint-algerian-eye-stitch`
- `needlepoint-smyrna-cross`
- `needlepoint-slanted-gobelin-stitch`
- `needlepoint-jacquard-stitch`

### READING (016–020)
- `needlepoint-choosing-canvas-count`
- `needlepoint-blocking-guide`
- `needlepoint-thread-canvas-guide`
- `needlepoint-mounting-framing-guide`
- `berlin-woolwork-introduction`

### PATTERN (021–040)
- `needlepoint-coaster-basketweave`
- `needlepoint-pincushion-scotch-stitch`
- `needlepoint-bookmark-bargello`
- `needlepoint-greek-key-border-panel`
- `needlepoint-floral-pincushion-continental`
- `needlepoint-berlin-rose-panel`
- `needlepoint-trivet-brick-stitch`
- `needlepoint-pansy-bookmark-petit-point`
- `needlepoint-box-lid-mosaic-stitch`
- `needlepoint-spectacle-case-cashmere`
- `needlepoint-cushion-hungarian-stitch`
- `needlepoint-berlin-parrot-panel`
- `needlepoint-doorstop-cover-tent-stitch`
- `needlepoint-first-sampler`
- `needlepoint-cushion-bargello-florentine`
- `needlepoint-fire-screen-panel`
- `needlepoint-panel-rhodes-stitch-geometric`
- `needlepoint-kneeler-cushion`
- `needlepoint-algerian-eye-panel`
- `needlepoint-advanced-sampler-eight-stitches`

## Voice-check results

All 40 files passed voice-check. Final pass: PASS 17, WARN-PASS 23, FAIL 0. The 23 WARN-PASS files carry the "Anchor" brand-trademark warning — a confirmed false positive (the brand blacklist targets the butter brand; the thread brand Anchor is correct usage here).

## Notable decisions

- PATTERN palette entries use the format `"DMC XXX / Anchor XXX: colour name"` (colon, not em-dash) so both brand codes appear together without the em-dash rule triggering.
- 18-count petit point file (028) uses stranded cotton and tapestry needle size 22 per the thread-to-canvas-guide rules.
- Kneeler (038) uses tapestry wool 2 strands on double-thread canvas, tapestry needle size 18 — correct for this heavy-duty construction.
- Berlin woolwork READING (020) references "library digital collections and the Internet Archive" without naming Project Gutenberg (institutional-name rule).
- Advanced PATTERN (036 fire screen, 25×30 cm on 12-count) is the largest and most complex project in the batch — flagged ADVANCED.
- SOURCE_TYPE PUBLIC_DOMAIN is assigned only to designs directly derived from named sources (Weldon's, de Dillmont, Caulfeild/Saward, Beeton). Original designs in period style are SYNTHESISED.

## Post-publish QC

`qc-fix.ts --recently-published --since "1 hour ago" --auto-fix`: 20 processed, 20 passed, 0 still blocked.
`fixup-hero-fill.ts --category needlework`: ran against 71 needlework candidates with no-hero entries.
