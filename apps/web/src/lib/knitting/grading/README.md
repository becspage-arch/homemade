# Knitting grading library

Generates per-size stitch counts, row counts, yarn requirements, and
assembly instructions for knit garments. Pure functions, no side
effects, no database dependency. Sister of the crochet grading
library at `apps/web/src/lib/crochet/grading/`.

## Usage from an author prompt

```ts
import { gradeAllSizes } from '@/lib/knitting/grading/garment-grader'

const sizes = gradeAllSizes(
  ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  {
    constructionShape: 'TOP_DOWN_RAGLAN',
    gauge: { stitchesPer10cm: 20, rowsPer10cm: 28 },
    easePreset: 'POSITIVE_4',
    garmentType: 'PULLOVER',
    options: {
      yarnWeightCategory: 4,        // aran
      dominantFabric: 'STOCKINETTE',
    },
  },
)
```

Each entry in the returned array is a `GradedPattern` with:

- The seven locked K-5 sweater grading keys verbatim: `yokeDepth`,
  `neckCircumference`, `armholeDepth`, `sleeveCapDepth`,
  `upperArmCircumference`, `wristCircumference`,
  `sleeveCuffCircumference`.
- The K-3 / K-4.1 core keys: `bust`, `waist`, `hip`, `length`,
  `sleeveLength`, `shoulderWidth`.
- Stitch counts at the key working points: `hemStitchCount`,
  `bustStitchCount`, `underarmStitchCount`,
  `sleeveCuffStitchCount`, `sleeveBicepStitchCount`,
  `neckStitchCount`.
- Row counts: `bodyLengthRows`, `sleeveLengthRows`,
  `yokeDepthRows`, `yokeIncreaseRows`, `raglanIncreaseRows` (for
  raglan only).
- Yarn requirement: `yarnRequiredGrams`, `yarnRequiredYards`.
- `finishedMeasurements` — the worn measurements in cm.
- `assemblyInstructions.steps` — ordered plain-English steps with
  per-size numbers filled in.

Embed the array in `KnittingPattern.sizesGraded` on the upload
input. The shape matches the schema's `sizesGraded` JSON column
exactly and the K-4.3 `SchematicRenderer` `SizeRow` type, so the
parametric schematic renderer reads the same numbers without a
translation step.

## Construction shapes

Six shapes ship. Each shape's module sits under
`construction-shapes/<shape>.ts`:

- `TOP_DOWN_RAGLAN` — single piece, in the round, four raglan
  increase lines.
- `TOP_DOWN_YOKE` — single piece, in the round, three increase
  rounds at 30 / 60 / 90 percent yoke depth. German short rows
  lift the back neck.
- `BOTTOM_UP_SET_IN` — flat panels seamed at shoulders, set-in
  sleeves seamed to armholes.
- `DROP_SHOULDER` — flat rectangles, no armhole shaping.
- `SIDE_TO_SIDE` — single rectangle worked cuff to cuff.
- `CONTIGUOUS_SET_IN` — Susie Myers method; top-down with built-
  in set-in sleeve caps via shoulder saddle short-rows.

## Adding a new construction shape

1. Create `construction-shapes/<your-shape>.ts`. Export a single
   function that takes `{ size, gauge, easePreset, garmentType,
   options? }` and returns a `GradedPattern`.
2. Add the shape name to `ConstructionShape` in `types.ts`.
3. Add the routing case to `garment-grader.ts`.
4. Add reference patterns + verifier tests in
   `garment-grader.test.ts`.

Each shape module imports `getBodyMeasurements`, `applyEase`,
`estimateYarn`, `fabricAdjustmentsFor`, and the helpers from
`helpers.ts`. The pattern is:

```ts
const body = getBodyMeasurements(input.size)
const fab = fabricAdjustmentsFor(opts.dominantFabric ?? 'STOCKINETTE')
const bustCm = applyEase(body.bust, input.easePreset)
const bustStitchCount = roundEvenly(bustCm * stitchesPerCm * fab.bodyStitchMultiplier)
// ...
const yarnBase = estimateYarn({ ... }, opts.yarnWeightCategory ?? 4)
const yarn = {
  grams: Math.round(yarnBase.grams * fab.yarnMultiplier),
  yards: Math.round(yarnBase.yards * fab.yarnMultiplier),
}
return { /* GradedPattern */ }
```

## Dominant fabric

Eight fabric types are recognised: `STOCKINETTE`, `GARTER`,
`RIB_1X1`, `RIB_2X2`, `CABLE`, `LACE`, `BRIOCHE`,
`COLOURWORK_STRANDED`. Each carries a body-stitch multiplier
(non-1.0 only for CABLE and BRIOCHE where flat swatches under-
report pull-in), a yarn multiplier (COLOURWORK_STRANDED 1.7×,
BRIOCHE 2.0×, CABLE 1.15×), and a hem-stitch multiplier.

Default fabric varies per construction shape: `STOCKINETTE` for
raglan / yoke / set-in / drop-shoulder / side-to-side /
contiguous-set-in. Override in the call options when the body is
cabled or stranded colourwork.

## Running the tests

```
pnpm --filter @homemade/web exec tsx src/lib/knitting/grading/garment-grader.test.ts
```

The suite compares library output against ten reference patterns
from freely-published designers (Drops Design, PetiteKnit, Brooklyn
Tweed, indie pattern sources) and pre-1964 references (Elizabeth
Zimmermann, Mary Thomas), plus six cross-size monotonicity
verifications and seven spot checks. Exits non-zero on any
assertion failure.

## Tolerances

The library targets:

- Stitch counts within 15% of a published pattern at the same gauge
  + ease (when ease assumptions are documented).
- Yarn requirements within 15% of published pattern figures.
- Cross-size grading smooth: no jumps over 30% bust growth between
  adjacent sizes.

Published patterns vary by designer convention (some round to the
nearest 4 stitches not 2; some use heavier shoulder shaping; some
apply different short-row distributions to the yoke). Closeness
across many patterns confirms the library models the standard
formulas correctly rather than matching any one designer.
