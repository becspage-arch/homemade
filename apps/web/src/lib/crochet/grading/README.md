# Crochet grading library

Generates per-size stitch counts, row counts, yarn requirements, and
assembly instructions for crocheted garments. Pure functions, no side
effects, no database dependency.

## Usage from an author prompt

```ts
import { gradeAllSizes } from '@/lib/crochet/grading/grader'

const sizes = gradeAllSizes(
  ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  {
 constructionShape: 'TOP_DOWN_RAGLAN',
 gauge: { stitchesPer10cm: 14, rowsPer10cm: 15 },
 easePreset: 'POSITIVE_8',
 garmentType: 'PULLOVER',
 options: { yarnWeightCategory: 4 },
  },
)
```

Each entry in the returned array is a `GradedPattern` with:

- `hemStitches`, `bustStitches`, `underarmStitches`, `sleeveCuffStitches`,
  `sleeveBicepStitches`, `neckStitches` - stitch counts at the key
  points of the construction.
- `bodyLengthRows`, `sleeveLengthRows`, `yokeDepthRows`,
  `yokeIncreaseRows` - row counts.
- `yarnRequiredGrams`, `yarnRequiredYards` - yarn requirement
  estimate.
- `finishedMeasurements` - the actual finished circumferences and
  lengths in cm.
- `assemblyInstructions` - ordered plain-English steps for working
  the pattern, with the per-size numbers already filled in.

Embed the array in `Tutorial.crochetPattern.sizesGraded` on the
upload input.

## Adding a new construction shape

1. Create `construction-shapes/<your-shape>.ts`. Export a single
 function that takes `{ size, gauge, easePreset, garmentType,
 options? }` and returns a `GradedPattern`.
2. Update `ConstructionShape` in `types.ts` to include the new
 shape name.
3. Add the routing case to `grader.ts`.
4. Add reference patterns and verifier tests in `grader.test.ts`.

Each shape module imports `getBodyMeasurements`, `applyEase`,
`estimateYarn`, and any helpers it needs. The pattern is:

```ts
const body = getBodyMeasurements(input.size)
const bustCm = applyEase(body.bust, input.easePreset)
const stitchesPerCm = input.gauge.stitchesPer10cm / 10
const bustStitches = roundEvenly(bustCm * stitchesPerCm)
// ...compute the rest from body measurements + gauge...
const yarn = estimateYarn({ ... }, opts.yarnWeightCategory ?? 4)
return { /* GradedPattern */ }
```

## Running the tests

```
npx tsx src/lib/crochet/grading/grader.test.ts
```

The suite compares library output against ten reference patterns from
freely-published designers (Drops Design and pre-1980s pattern books)
and runs the verifier across the full women / men / kids / baby size
ranges for each construction shape.

## Tolerances

The library targets:

- Stitch counts within 5% of a published pattern at the same gauge +
  ease (when ease assumptions are documented).
- Yarn requirements within 15% of published pattern figures.
- Cross-size grading smooth: no jumps over 30% bust growth between
  adjacent sizes.

Published patterns vary by designer convention (some use heavier
shoulder shaping, some use shorter armhole depth, some round to
nearest 4 stitches not 2). Closeness across many patterns confirms
the library models the standard formulas correctly.
