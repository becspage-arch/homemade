# Crochet bulk-005 — Homeware Patterns

**Date:** 2026-06-13
**Session type:** Autopilot (autopilot-queue-extra)
**Category:** crochet / homewares
**Count:** 40 PATTERN tutorials PUBLISHED

## Breakdown by sub-group

| Group | Files | Difficulty | Hook(s) | Yarn |
|---|---|---|---|---|
| Plant hangers | 01–07 | BEGINNER–INTERMEDIATE | 4 mm, 5 mm, 10 mm | DK, aran, super-chunky |
| Hanging basket liner | 08 | INTERMEDIATE | 5 mm | Aran |
| Table runners | 09–14 | BEGINNER–INTERMEDIATE | 4 mm, 1.75 mm | DK, lace |
| Placemats | 15–20 | BEGINNER–INTERMEDIATE | 4 mm, 4.5 mm | DK |
| Rugs and mats | 21–26 | BEGINNER–INTERMEDIATE | 6 mm, 10 mm | Chunky, super-chunky |
| Eco / reusable | 27–33 | BEGINNER | 3 mm, 4 mm | Fingering, DK |
| Kitchen / utility | 34–40 | BEGINNER–INTERMEDIATE | 3 mm, 4 mm, 5 mm | Aran, DK, fingering |

## Difficulty split

| Level | Count |
|---|---:|
| BEGINNER | 24 |
| INTERMEDIATE | 16 |

## Voice-check fixes applied

- **Em-dash bulk-fix** (all 40 files): `—` replaced with commas, colons, periods, and semicolons as appropriate via `_fix-bulk005-em-dashes.mjs`
- **Tutorial 13** (bobble-dot-table-runner): bobble stitch description simplified to reduce Flesch-Kincaid grade below 12.0 threshold
- **Tutorial 28** (string-shopper-bag-small): "anchor stitch" → "connecting stitch" to remove Anchor brand false-positive

## Schema fixes during upload

- **recipeTools hook slugs**: size-specific `crochet-hook-X-Xmm` slugs replaced with generic `crochet-hook` (Tool table slug). The specific hook size is captured in `crochet.primaryHookSlug` (CrochetHook table) — matching the existing crochet phase-1 convention.
- **File 08**: `primaryYarnWeightSlug` corrected from `worsted` (not a valid slug) to `aran`.

## Post-upload QC

- `fixup-hero-fill.ts --category crochet`: 44 heroes found (36 Pexels + 8 Wikimedia) across all crochet candidates including bulk-005. FAL billing halt fired at entry 15 but did not affect bulk-005 entries.
- `qc-fix.ts`: 40/40 PASS, 0 still-blocked. Initial blocks were `hero-missing` (24) + `body-missing-method` (2); all cleared.

## Crochet library after this batch

- homewares: 194 → 234 PUBLISHED
- crochet total: 277 → 317 PUBLISHED
