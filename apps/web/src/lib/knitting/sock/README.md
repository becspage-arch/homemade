# Knitting sock + foot math library

Generates per-foot-size stitch counts, row counts, yarn
requirements, and assembly instructions for knit socks. Pure
functions, no side effects, no database dependency. Sibling of the
garment grading library at `apps/web/src/lib/knitting/grading/`.

Socks have their own geometry — foot circumference and foot length
grade together but at different rates from garment bust + length,
heel construction and toe shaping respond to the in-the-round
working direction rather than to flat construction — so the sock
library lives separately.

## Usage from an author prompt

```ts
import { gradeAllFootSizes } from '@/lib/knitting/sock/sock-grader'

const sizes = gradeAllFootSizes(
  ['W_5UK_38EU_7US', 'W_6UK_39EU_8US', 'W_7UK_40EU_9US'],
  {
    construction: 'CUFF_DOWN',
    heelStyle: 'FLAP_AND_GUSSET',
    gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
    options: {
      yarnWeightCategory: 1,  // fingering
      legLengthCm: 18,         // crew height
      footEaseCm: -2,          // negative ease for snug fit
    },
  },
)
```

Each entry is a `SockGradedPattern` with:

- `startingStitchCount` — cuff cast-on for cuff-down or magic
  cast-on total for toe-up.
- `legStitchCount`, `footStitchCount`,
  `heelTurnStitchCount`, `gussetPeakStitchCount`,
  `toeStitchCount`.
- Row counts: `cuffRibRows`, `legRows`, `heelFlapRows`,
  `heelTurnRows`, `gussetRows`, `footRows`, `toeRows`.
- `finishedMeasurements` — foot length, foot circumference, ankle
  circumference, leg length, all in cm.
- `yarnRequiredGrams`, `yarnRequiredYards`.
- `assemblyInstructions.steps` — ordered plain-English steps with
  the per-size numbers filled in.

Embed the array in `KnittingPattern.sizesGraded` on the upload
input.

## Construction directions

Two directions:

- `CUFF_DOWN` — historical default. Cast on at cuff, work leg,
  heel, foot, toe, graft.
- `TOE_UP` — Judy's Magic cast-on at toe, increase to foot, work
  heel, leg, cuff, stretchy cast-off.

## Heel styles

Five styles. All five work with both construction directions:

- `FLAP_AND_GUSSET` — traditional. Heel flap + turn + gusset
  decreases. Most durable.
- `SHORT_ROW_GERMAN` — German short-row method. Fast, stretchy.
- `SHORT_ROW_JAPANESE` — pin-and-lift method. Cleanest surface.
- `SHORT_ROW_DUTCH` — traditional wrap-and-turn. Classic look.
- `AFTERTHOUGHT` — peasant heel. Waste-yarn placeholder; heel
  added after the toe is grafted. Best for self-striping yarns.

The heel maths is identical across the three short-row variants;
the difference is the wrapping mechanism. The library labels each
variant explicitly so the author prompt can describe the right
mechanism in the pattern body.

## Foot sizes

Sock sizes carry UK, EU, and US shoe-size numbers in a single slug
(`W_6UK_39EU_8US`) so the display label is unambiguous in any
region. Three age bands:

- `KIDS_*` — babies through older children, UK 5 / EU 22 up to
  UK 13 / EU 31.
- `YOUTH_2UK_34EU` — youth bridging size.
- `W_*` — women adult, UK 3 / EU 36 / US 5 up to UK 9 / EU 42 /
  US 11.
- `M_*` — men adult, UK 7 / EU 41 / US 8 up to UK 12 / EU 46 /
  US 13.

Each size carries foot length, foot circumference at the ball,
ankle circumference, and calf circumference. The calf number is
used only for knee-high socks.

## Yarn requirement

Socks knit at noticeably denser gauge than garments — high-twist
sock yarn at small needles for durability — so the per-cm-squared
consumption sits ~2.8× the garment rate. The sock library applies
this factor automatically; the caller passes only the CYC weight
category number.

## Adding a new heel style

1. Create `heel/<your-heel>.ts`. Export a function that takes
   `{ legStitchCount, gauge, ... }` and returns the heel-section
   counts.
2. Add the style to `SockHeelStyle` in `types.ts`.
3. Wire the switch case in both `construction/cuff-down.ts` and
   `construction/toe-up.ts`.
4. Add reference patterns in `sock-grader.test.ts`.

## Running the tests

```
pnpm --filter @homemade/web exec tsx src/lib/knitting/sock/sock-grader.test.ts
```

The suite compares library output against ten reference patterns
from freely-published sock designers (Drops Design free socks,
indie sock patterns, traditional Estonian and Gansey foundation
patterns), plus three cross-size monotonicity verifications and six
spot checks (yarn-weight scaling, leg-length effect, heel-style
verifier consistency).

## Tolerances

- Leg stitch counts within 15% of published patterns.
- Yarn requirements within 15% of published per-pair figures.
- Cross-size grading smooth: no jumps over 30%.
- `legStitchCount` always a multiple of 4 for clean 2x2 rib + heel
  split alignment.
