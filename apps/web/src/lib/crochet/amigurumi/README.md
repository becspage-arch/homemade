# Crochet amigurumi shape math library

Generates row-by-row patterns for parametric amigurumi shape primitives.
Pure functions, no side effects, no database dependency.

## Usage from an author prompt

```ts
import { sphere, pear, capsule, cone } from '@/lib/crochet/amigurumi/shape-math'

const GAUGE = { stitchesPer10cm: 24, rowsPer10cm: 28 }

const head = sphere({ diameterCm: 10, gauge: GAUGE, label: 'head' })
const body = pear({
  maxDiameterCm: 12, topDiameterCm: 8, heightCm: 14,
  gauge: GAUGE, label: 'body',
})
const armL = capsule({ diameterCm: 4, lengthCm: 8, gauge: GAUGE, label: 'arm-left' })
```

Each call returns an `AmigurumiPiece` with:

- `shape` - the primitive used.
- `finishedDimensionsCm` - the finished dimensions of the piece.
- `totalRounds` - number of rounds the piece works.
- `rowByRow` - array of `{ round, instructions, stitchCount }`
  records. The `instructions` field is a single-line plain-English
  instruction ready to render in the pattern body.
- `yarnRequiredGrams` - surface-area-based estimate.
- `stuffingNotes` - single-sentence stuffing guidance for the piece.

For multi-piece patterns, the author builds an `AssemblyInstructions`
object alongside the `pieces[]` array:

```ts
const assembly = {
  buildOrder: ['body', 'head', 'arm-left', 'arm-right'],
  joints: [
 { piecesJoined: ['head', 'body'], method: 'LADDER_STITCH',
 placement: 'top centre of body' },
 { piecesJoined: ['arm-left', 'body'], method: 'WHIP_STITCH',
 placement: 'upper left side of body' },
 { piecesJoined: ['arm-right', 'body'], method: 'WHIP_STITCH',
 placement: 'upper right side of body' },
  ],
  embellishments: ['stitched mouth in black yarn'],
  safetyEyePlacement: 'between rounds 8 and 9, 4 stitches apart',
}
```

The `joiner` module describes each join method in plain English:

```ts
import { describeJoin } from '@/lib/crochet/amigurumi/joiner'
const t = describeJoin('LADDER_STITCH')
// t.name, t.description, t.whenToUse
```

## Adding a new shape primitive

1. Create `shapes/<your-shape>.ts`. Export a single function that
 takes the shape's parameters plus a gauge and an optional label,
 and returns an `AmigurumiPiece`.
2. Update `AmigurumiShape` in `types.ts` to include the new shape
 name.
3. Add the routing case to `shape-math.ts` and the re-export.
4. Add smoke tests in `shape-math.test.ts` validating the row-by-row
 sequence closes cleanly.

Each shape module follows the same skeleton:

```ts
// 1. Compute stitch count at the widest point from circumference × gauge.
// 2. Build the rowByRow array round by round, tracking stitchCount.
// 3. Compute surface area for the yarn estimate.
// 4. Return the AmigurumiPiece.
```

## Running the tests

```
npx tsx src/lib/crochet/amigurumi/shape-math.test.ts
```

The suite verifies each primitive's stitch count progression, the
verifier's piece + assembly checks, the joiner descriptions, and a
typical small bear total-yardage sanity check.

## Tolerances

The library targets:

- Stitch count at the widest point within ±1 stitch of the geometric
  circumference (rounded to nearest multiple of 6 for clean 6-around
  increase patterns).
- Yarn requirements within 25% of published amigurumi patterns (more
  variance than garments because amigurumi tension varies more by
  maker).

Published amigurumi patterns rarely document the underlying shape
math; the library encodes the standard sphere / cylinder / cone
formulas that have circulated in amigurumi communities since the
mid-2000s.
