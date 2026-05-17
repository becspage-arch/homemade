# Sewing pipeline — anchor batch report

**Session:** `phase_sewing_pipeline_001` — pipeline scaffold + anchor batch.
**Date:** 2026-05-17.
**Model:** Opus (pipeline-setup + anchor batch per `feedback_model_choice.md`).

## What landed

Five DRAFT anchor briefs in `docs/sewing-anchor-briefs/`:

| # | Slug | Type | Sub-category | Project shape | Difficulty |
|---|------|------|--------------|---------------|------------|
| 1 | `french-seam` | TECHNIQUE | techniques | — | BEGINNER |
| 2 | `gathering-with-thread-tension` | TECHNIQUE | techniques | — | BEGINNER |
| 3 | `gardeners-apron-with-pockets` | PATTERN | aprons-pinafores | panel-construction | BEGINNER |
| 4 | `drawstring-tote-bag` | PATTERN | bags-storage | rectangle | BEGINNER |
| 5 | `envelope-back-cushion-cover` | PATTERN | homewares-soft-furnishing | rectangle | BEGINNER |

Two TECHNIQUE foundations + three PATTERN projects. The two techniques
(French seam, gathering) are referenced by name in the project bodies
that follow; the three projects span the three biggest sub-category
buckets in the launch list (aprons, bags, homewares).

All five are DRAFT, not uploaded. The briefs sit as JSON ready for
the upload-tutorial.ts script to ingest once the migration applies
and the master tables seed.

## Schema landed

`packages/db/prisma/migrations/20260624000000_phase_sewing_pipeline_001/migration.sql`:

- New `PATTERN` value on the `TutorialType` enum.
- New `Fabric` master table — slug-keyed, weight category, fibre
  content, drape, gsm, suitableFor tags, browse category, notes.
- New `SewingNotion` master table — slug-keyed, category, notes.
- Eight new nullable columns on `Tutorial`:
  - `craftType` (shared discriminator across craft pipelines)
  - `projectShape` (rectangle / gathered-rectangle / panel-construction
    / circle / from-measurements / unconstructed)
  - `requiredFabricTypes` (String[] of Fabric slugs)
  - `requiredNotions` (String[] of SewingNotion slugs)
  - `sewingMethod` (hand-sewn / machine / mixed)
  - `fabricYardageMetres` (Float?)
  - `finishedDimensionsCm` (Json?)
  - `bodyMeasurementsRequired` (String[])
- Six new indexes on `Tutorial` (craftType, type+craftType,
  type+projectShape, type+sewingMethod, requiredFabricTypes GIN,
  requiredNotions GIN).

The Prisma schema mirrors the SQL — `Fabric` + `SewingNotion` models
appended at the bottom, Tutorial fields inserted alongside the existing
Herbal block, TutorialType enum extended with `PATTERN`.

## Master tables seeded

`packages/db/scripts/data/fabrics.ts` — 30 fabric entries:

- Light wovens (10): cotton lawn, cotton poplin, quilting cotton,
  calico (UK), cotton muslin (UK), light linen, medium linen, heavy
  linen, silk habotai, silk satin.
- Medium + heavy wovens (8): cotton drill, cotton twill, cotton
  canvas, denim, polycotton, hessian, ripstop nylon, oilcloth.
- Knits (3): cotton jersey, polyester fleece, terry cloth.
- Interfacing + lining + batting (9): fusible interfacing (light +
  medium), sew-in interfacing, curtain lining, blackout curtain
  lining, cotton batting, polyester batting, wool batting, fusible
  web (in the notions list, technically).

`packages/db/scripts/data/sewing-notions.ts` — 25+ notion entries
across thread (5), elastic (4), binding + trim (6), closures (8),
fasteners (4), cord (1), stuffing (3), interfacing-style fusible web (1).

UK terminology throughout. No brand names. The seed scripts validate
fibre / category / weight against literal-union vocabularies before any
DB writes.

## Sub-categories seeded

`packages/db/scripts/seed-sewing-taxonomy.ts` flips
`Category.pipelineStatus` for `sewing` from NOT_READY → READY and seeds
15 sub-categories under the existing sewing Category:

1. techniques
2. aprons-pinafores
3. bags-storage
4. homewares-soft-furnishing
5. curtains-blinds
6. baby-children
7. soft-toys
8. kitchen-table-linens
9. mending-visible-mending
10. quilting
11. reusable-household
12. christmas-seasonal
13. simple-clothing-rectangles
14. accessories-small-projects
15. pet-items

The round-robin autopilot picks Sewing up on its next fire once this
ships and the migrations apply.

## Documentation

- `docs/sewing-author.md` v1 — full authoring prompt. Per-type body
  shape for PATTERN + TECHNIQUE. UK-defaults section. Locked scope
  rule (no fitted-garment patterns at launch). Pattern shape
  vocabulary. Voice rules specific to Sewing (pressing is a step,
  seam allowance stated, right side / wrong side, hand-sewn
  alternatives, heritage-craft attribution). Public-domain source
  list. Image strategy (stricter verification rubric for finished
  items, procedural-card acceptable for techniques, no charts).
- `docs/sewing-anti-tells.md` — 24 seeded entries across voice +
  register (3), unit precision + UK conventions (5), copyright +
  sourcing (3), construction precision (6), metadata + structural
  (5), source-attribution (2). UK terminology is heavily emphasised
  (calico vs muslin, zip vs zipper, press stud vs snap, eyelet vs
  grommet, EU vs US machine-needle sizing).

## Upload script extensions

`packages/db/scripts/upload-tutorial-types.ts`:

- `TutorialType` extended with `'PATTERN'`.
- New `ProjectShape`, `SewingMethod`, `BodyMeasurement` literal
  unions.
- New `SewingMetadata` interface with `craftType` ('sewing' for every
  entry), optional `projectShape`, optional fabric + notion slug
  arrays, optional method, yardage, finished dimensions JSON, and
  body measurements array.
- New `sewing` field on `TutorialUploadInput`.

`packages/db/scripts/upload-tutorial.ts`:

- New validation block: `sewing.requiredFabricSlugs` resolved against
  the master `Fabric` table; `sewing.requiredNotionSlugs` resolved
  against the master `SewingNotion` table. Both fail loudly on a
  missing slug, matching the herbal + garden master-slug pattern.
- New rows in the `sharedData` block mapping the `sewing` block to
  Tutorial's `craftType` / `projectShape` / `requiredFabricTypes` /
  `requiredNotions` / `sewingMethod` / `fabricYardageMetres` /
  `finishedDimensionsCm` / `bodyMeasurementsRequired` columns.

## UI literal-union widening

Same pattern as the Garden + Herbal scaffold:

- `apps/web/src/components/admin/tutorials/preview-pane.tsx` — added
  `'PATTERN'` to the type union.
- `apps/web/src/components/admin/tutorials/tutorial-form.tsx` — same.
- `apps/web/src/components/public/tutorial-chrome.tsx` — same.

The renderers themselves don't yet special-case PATTERN; they fall
through to the TECHNIQUE-shaped lean info-bar variant. A future
visual-design phase adds a Sewing-specific info bar with finished
dimensions, fabric yardage, and the project-shape pill — but for the
content-fill phase the lean variant is enough.

## Scope locked

The author docs and the anti-tells doc explicitly exclude:

1. **Fitted-garment patterns.** Anything requiring graded pattern
   pieces, set-in sleeves, princess seams, fitted bodices, curved
   trouser crotches, or other constructions that need a paper
   pattern. These route through a future tester + pattern-digitisation
   workstream.
2. **Modern designer pattern reproductions.** Copyright.
3. **Modern indie pattern brand references** (Closet Core, Tilly &
   the Buttons, etc.) by name or by line-by-line construction
   reproduction.

The `projectShape` field is the schema-level gate: only the six
documented values (rectangle / gathered-rectangle / panel-construction
/ circle / from-measurements / unconstructed) are accepted by the
author docs. Validation rejects fitted values.

## Sources cited across the anchors

The five anchors share the same canon:

- **Beeton's Book of Needlework** (1870) — Project Gutenberg etext
  #25640. Plain Sewing chapter for the French seam two-pass; Gathering
  and Setting in Sleeves for the parallel-row gather; Plain Bags for
  the channel construction; Aprons for the bib-and-waistband
  proportion; Cushions for the envelope back.
- **Weldon's Practical Needlework** — vols 4 and 5 (1887-88), Internet
  Archive. Seams chapter for the French-seam allowance ratios;
  Gathering for the bobbin-pull tension management.
- **WWII Make Do and Mend** (UK Board of Trade, 1943) — Crown
  Copyright expired. Furnishing Repairs for the envelope-back
  cushion construction; Shoe Bags and Laundry Bags for the
  drawstring tote proportions; aprons pamphlet for the construction
  order.
- **Singer Sewing Library** (1950s reprints, Internet Archive) — the
  modern machine-version overlays where the Victorian sources are
  hand-construction.

No modern source. No brand names. No copyright-creep.

## Open follow-ups

- Anchor briefs are JSON only — not yet uploaded. Once Rebecca
  reviews and Category flips to READY (the seed script does this
  automatically), upload via:
  ```
  pnpm --filter @homemade/db exec tsx scripts/upload-tutorial.ts \
    docs/sewing-anchor-briefs/*.json
  ```
- Image sourcing is deferred to the cross-category two-pass helper;
  each anchor ships with `hero` unset. The image-verification rubric
  in `docs/sewing-author.md` § Image strategy is stricter for craft
  finished items than for food — silhouette + era + fabric + closure
  + scale must match, not just "shows the category".
- A Sewing-specific public renderer (info bar with finished
  dimensions, fabric yardage pill, project-shape badge) is a future
  visual-design pass. Until then, PATTERN rows render through the
  lean TECHNIQUE info bar.
- A diagram-generator for TECHNIQUE pages is also a future workstream.
  Beeton's, Weldon's, and Britannica all carry hundreds of
  public-domain needlework plates that work as fallback diagrams in
  the meantime.

## Next session

Once this scaffold ships and the migrations apply, the next sewing
session is a bulk fill batch: 15-25 PATTERN + TECHNIQUE rows across
the under-represented sub-categories. The author docs and anti-tells
land here as the reference for that worker.
