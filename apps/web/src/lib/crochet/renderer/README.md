# Crochet finished-piece chart-engine renderer

Software-only SVG renderer that turns a `ChartDefinition` (crochet
`chartData`) into a finished-piece hero — yarn-shaped stitches in the
pattern's palette colours, accurate by construction. No AI image
generation.

## Why this exists

Pipeline B (Fal img2img from synthetic chart renders) was killed by the
locked image policy. The replacement is this renderer: deterministic,
free, and accurate because it works directly from the chart data.

Two callers use it:

- **Pattern heroes** — `CrochetPattern.heroMediaId` / `thumbnailMediaId`
  get populated by the at-scale runner script in
  `packages/db/scripts/render-crochet-motif-heroes.ts`.
- **Stitch swatch previews** — for `Stitch` rows where `chartSymbol` is
  null (joining methods) or where the bare chart glyph doesn't read as
  the finished stitch (textured stitches, specialty work). The runner
  at `packages/db/scripts/render-crochet-stitch-swatches.ts` populates
  `Stitch.previewMediaId`.

## Layout

```
apps/web/src/lib/crochet/renderer/
├── stitch-shapes/                — per-stitch SVG path definitions
│   ├── chain.ts
│   ├── slip-stitch.ts
│   ├── double-crochet-uk.ts
│   ├── half-treble.ts
│   ├── treble.ts
│   ├── double-treble.ts
│   ├── triple-treble.ts          (also quadruple)
│   ├── magic-ring.ts
│   ├── foundation-treble.ts
│   ├── loop-variants.ts          (flo, blo, third loop htr)
│   ├── bobble.ts
│   ├── popcorn.ts
│   ├── puff.ts
│   ├── shell.ts                  (shell + fan)
│   ├── clusters.ts               (treble cluster, granny cluster)
│   ├── decoratives.ts            (picot, V-st, crossed)
│   ├── post-stitches.ts          (front/back-post + waistcoat + star + ...)
│   ├── decreases.ts              (dc2tog, invisible-dec)
│   ├── specialty.ts              (Tunisian, broomstick, hairpin, crocodile,
│   │                              Solomon's knot, Irish motif, spider)
│   ├── joins.ts                  (join-as-you-go, sl st seam, whipstitch)
│   └── index.ts                  — registry + lookup
├── layout/
│   ├── round-layout.ts           — circular layout for in-the-round work
│   ├── row-layout.ts             — flat grid layout for row work + swatches
│   ├── motif-layout.ts           — square / hexagon corner-detection layout
│   └── increase-distribution.ts  — verifier-side round-progression check
├── palette/
│   └── apply-colours.ts          — default warm-naturals + helpers
├── output/
│   ├── svg-composer.ts           — assembles placements into final SVG
│   └── png-rasteriser.ts         — sharp-based SVG → PNG
├── render-pattern.ts             — main entry: chart → SVG + verdict
├── render-swatch.ts              — small-swatch entry for Stitch previews
├── verifier.ts                   — sanity checks (stitch count, bbox, unknowns)
├── types.ts                      — shared types
├── render-pattern.test.ts        — runnable test suite (tsx)
└── index.ts                      — barrel
```

## How rendering works

1. **Layout** decides where each stitch goes:
   - `round` charts: stitches sit on concentric rings, rotated to point
     outward. The motif detector first checks for 4-corner (square)
     or 6-corner (hexagon) chain groups — those use a polygon layout
     instead. Anything else is laid out as a circle.
   - `flat` charts: stitches sit on a rectangular grid, all pointing up.
     Right-side rows read right-to-left in working order.

2. **Stitch shapes** are normalised unit-space SVG paths drawn with the
   base at `(0, 0)` pointing up (top at `(0, -heightUnits)`). The
   layout supplies translate / rotate / scale per stitch.

3. **Colour** comes from the palette: a per-key explicit map (from the
   chart's `ChartStitch.colourKey`), with per-round defaults when no key
   is set. Default palette is warm naturals (terracotta, moss, cream,
   dusty rose, denim slate, honey, mushroom taupe, sage).

4. **Composer** stacks 3 strokes per stitch (rim + body + sheen) + an
   optional filled blob for bobble / popcorn / puff. The fabric
   background carries a subtle weave + drop-shadow under the work.

5. **Verifier** checks placement count vs chartData expansion, bounding
   box vs canvas, degenerate placements, unknown stitch symbols, and
   round-progression sanity.

## Adding a stitch shape

1. Add a file under `stitch-shapes/` with a `StitchShape` export.
2. Add the import + entry in `stitch-shapes/index.ts`.
3. Re-run the at-scale script — patterns referencing the new symbol now
   render in place of the unknown fallback.

## Running the tests

```
pnpm --filter "@homemade/web" exec tsx src/lib/crochet/renderer/render-pattern.test.ts
```

Tests cover: anchor render (granny three-round), each motif shape, three
stitch swatches, and edge cases (empty / single / large / unknown).

## What the renderer does NOT do

- No AI image generation. Heroes are software renders.
- No modification of `Pattern.chartData`. The runner reads chartData
  read-only; broken chartData is logged for manual review.
- No premium gating. House infrastructure, free.
- No cross-stitch / knitting work. Cross-stitch has its own chart engine
  at `apps/web/src/components/studio/chart/` and stays untouched. The
  knitting renderer reuses the same `craft-charts` working-chart engine
  for now.
