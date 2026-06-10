# Knitting sock authoring

Per-shape author prompt for `subCategorySlug: "sock"`. Read
`docs/knitting-author.md` first — the role, voice spec, charts,
upload contract, eight-rule self-check, and the v5 cross-category
appendix apply. This file covers the sock-specific deltas.

**Prompt version:** 1 (K-5, 2026-06-10). Replaces the stub that
deferred sock authoring to the sock-grading library.

## Construction direction

Two directions are supported. Pick one per pattern and state it
in the Intro paragraph with a one-clause justification (K-4.1
cross-cutting requirement #4):

- `CUFF_DOWN` — historical default. Cast on at the cuff, work the
  leg, the heel, the foot, the toe; graft. Easy to try on as you
  go; the most common choice for beginners.
- `TOE_UP` — Judy's Magic cast-on at the toe; increases to foot,
  then heel, leg, cuff. Stretchy cast-off at the cuff. Useful when
  the knitter wants to use exactly the yarn she has — the cuff is
  the last section so the leg can stretch to fit.

## Heel style

Four heel styles. Pick one per pattern; the library supports all
four with both construction directions:

- `FLAP_AND_GUSSET` — traditional. Heel flap of slipped-stitch
  fabric, heel turn with paired short-row decreases, gusset
  decreases back to foot stitch count. Most durable; survives
  wear at the heel because of the slipped-stitch density.
- `SHORT_ROW_GERMAN` — German short-row method. Fast, stretchy.
  The "double stitch" wraps resolve cleanly. Easiest of the short-
  row variants to learn.
- `SHORT_ROW_JAPANESE` — pin-and-lift method. Cleanest stitch
  surface of the three short-row variants; slower to work.
- `SHORT_ROW_DUTCH` — traditional wrap-and-turn. Classic look;
  the steepest learning curve because the wraps must be picked up
  and worked.
- `AFTERTHOUGHT` — peasant heel. Knit the sock as one tube with a
  waste-yarn marker; remove the marker after the toe is grafted,
  pick up the live stitches, and work a small toe-shape heel cup.
  Useful for self-striping yarns where flap-and-gusset breaks the
  stripe sequence.

## Sock-grading library — call this

Do not write per-size stitch counts by hand. Call the K-5 sock
library:

```ts
import {
  gradeAllFootSizes,
  type SockConstruction,
  type SockHeelStyle,
} from '@/lib/knitting/sock/sock-grader'

const SIZES = [
  'W_5UK_38EU_7US', 'W_6UK_39EU_8US', 'W_7UK_40EU_9US',
  'W_8UK_41EU_10US', 'W_9UK_42EU_11US',
]

const sizesGraded = gradeAllFootSizes(SIZES, {
  construction: 'CUFF_DOWN',
  heelStyle: 'FLAP_AND_GUSSET',
  gauge: { stitchesPer10cm: 32, rowsPer10cm: 44 },
  options: {
    yarnWeightCategory: 1,  // fingering — the standard sock yarn
    legLengthCm: 18,         // crew height; bump to 40 for knee-high
    footEaseCm: -2,          // negative ease for snug fit
  },
})
```

Each entry on `sizesGraded` carries:

- `startingStitchCount` — cuff cast-on (cuff-down) or magic cast-on
  total (toe-up).
- `legStitchCount` — stitches around the leg (also = foot stitch
  count after gusset decreases).
- `footStitchCount`, `heelTurnStitchCount`, `gussetPeakStitchCount`,
  `toeStitchCount`.
- Row counts: `cuffRibRows`, `legRows`, `heelFlapRows`,
  `heelTurnRows`, `gussetRows`, `footRows`, `toeRows`.
- `finishedMeasurements`: foot length, foot circumference, ankle
  circumference, leg length.
- `yarnRequiredGrams` and `yarnRequiredYards`.
- `assemblyInstructions.steps` — ordered plain-English steps with
  the per-size numbers filled in.

Foot sizes match the standard UK / EU / US shoe charts in
`sock-sizes.ts`. The slug carries all three numbering systems
(`W_6UK_39EU_8US`) so the displayed label is unambiguous in any
region.

## Per-type body shape

Socks use `type: "PATTERN"`. Body lays out:

1. **Intro** — one paragraph. What the sock is (crew / knee-high /
   ankle), the construction direction, the heel style, the time on
   the needles. State why the construction was chosen.
2. **Materials** — H2. Yarn weight class (fingering is standard;
   sport for hiking socks, DK for heavy boot socks), fibre
   suggestion (high-twist wool with nylon; merino is too soft for
   sock wear without reinforcement), total grams per pair. Needles
   by mm canonical (2.25-2.75 mm for fingering socks). Notions:
   waste yarn for the heel placeholder if `AFTERTHOUGHT`, darning
   needle for grafting.
3. **Sizing** — H2. The size table. Foot length, foot
   circumference, ankle circumference, leg length per size. The
   wearer measures her own foot length end-to-end and matches it
   to the closest size; the size circle (K-4.1 cross-cutting
   requirement #1) lands here.
4. **Gauge** — H2 "Gauge". State the gauge value AND the concrete
   numeric consequence of being off (K-4.1 cross-cutting requirement
   #2). For socks: "33 sts vs 32 sts per 10 cm at gauge finishes a
   women's UK 6 sock 1 cm narrow — the sock bites at the foot."
5. **Abbreviations** — H2 using a `suppliesCard` glossary.
6. **Pattern** — H2. Row by row, in working order. Subdivide with
   H3 by section:
   - **Cuff** (cuff-down) or **Toe** (toe-up).
   - **Leg** (cuff-down) or **Foot** (toe-up).
   - **Heel** — the heel turn section is the heart of the pattern;
     give it room. Cite the heel style by name in the H3.
   - **Foot** (cuff-down) or **Leg** (toe-up).
   - **Toe** (cuff-down) or **Cuff** (toe-up).
   - **Finishing** — graft the toe with Kitchener stitch (cuff-down)
     or cast off with a stretchy bind-off (toe-up).
   - `### Common faults` H3 with 2-4 named sock failure modes.

   State the long-tail cast-on tail formula AND a worked number for
   the largest size for cuff-down construction (K-4.1 #3). Toe-up
   construction uses Judy's Magic cast-on which doesn't need a tail
   calculation — note "no tail length to calculate" in the cast-on
   instruction.

   Embed at least three stitch-count check-ins (K-4.1 #5):
   - After heel turn (heel-turn stitch count).
   - After gusset decreases (for flap-and-gusset) or after heel
     completion (for short-row + afterthought).
   - At the toe before grafting.

7. **Finishing** — H2. Toe graft (cuff-down) or cuff cast-off
   (toe-up). Reinforcement at the heel if the yarn is plain wool
   (run a single strand of nylon thread through the heel-flap
   slip-stitches; not a brand recommendation, just a yarn-blend
   suggestion).
8. **Variations** — H2 (optional). Knee-high (longer leg, calf
   shaping), ankle socks (shorter leg, no cuff), reinforced toe.
9. **Sources** — `sourceNotes`.

Length: 1,500-2,200 words for sock PATTERN bodies. Socks run
shorter than sweaters because the shape is smaller; the heel
turn deserves the extra rows.

## K-4.1 cross-cutting requirements — sock-specific

1. **Circle your size** — measure foot length, match to closest
   size, circle the column.
2. **Concrete consequence of gauge** — quote the numeric impact
   in cm of foot circumference at the standard women UK 6 fit.
3. **Cast-on tail length** — for cuff-down (long-tail cast-on):
   `tail_cm ≈ (needleCircumferenceMm × stitchCount) / 10 + 15`.
   Worked number: women UK 6, 64-stitch cast-on, 2.5 mm needles
   ≈ (2.5 × 64) / 10 + 15 = 31 cm. Skip for toe-up (Judy's Magic
   cast-on uses both ends of a single strand from the centre).
4. **Construction direction WHY** — Intro paragraph names the
   direction and justifies. Examples: "Cuff-down so the
   knitter can try the sock on as the foot grows" or "Toe-up
   so the leg can stretch to use whatever yarn remains."
5. **Stitch count check-ins** — at minimum: after heel turn,
   after gusset (FLAP_AND_GUSSET) or after heel completion
   (others), at toe graft.
6. **No external visuals** — the K-2 chart engine handles every
   chartable stitch; the K-4.2 PD diagram library covers heel
   turn illustrations. Do not write "see video."
7. **Common faults H3** — typical sock failure modes:
   - Heel bite (foot circumference too tight).
   - Heel sag (heel turn stitch count too low for the foot).
   - Gusset ladder (the gusset pickup stitches twist and produce a
     visible ladder line down each side of the foot).
   - Toe lump (toe graft tension mismatched to the foot stitches).

## Persona stuck-check

Same three readers; sock-specific notes:

- **Beginner reader (k / p / k2tog only, has not turned a heel):**
  the heel turn is the first significant skill jump. Flag every
  step where the prose assumes a heel-turn shape the reader has
  not built. Cite a PD reference she can look up if the wrap-and-
  turn is opaque on first reading.
- **Intermediate reader (has knit one or two sock pairs, knows
  flap-and-gusset, learning short-row variants):** flag where the
  short-row pickup is unstated, where the gusset pickup rate is
  wrong, where the toe shaping rate is off.
- **Master reader (Cookie A / Anna Zilboorg / Nancy Bush
  literature in their head):** flag where the heel-flap slipped-
  stitch pattern doesn't match the convention (slip on RS, knit on
  WS; the inverse produces a fragile flap), where the toe shaping
  doesn't end on a multiple of 4, where the cuff ribbing pulls in
  too tight.

## Schema fields populated

The `knitting` block:

- `sizesGraded` — `gradeAllFootSizes` output.
- `yardageBySize` — derived from `yarnRequiredYards`.
- `stitchCountCheckpoints` — populate from the H3 check-in entries.
- `needleBySection` — `[{ section: 'cuff', needleMm: 2.25 },
  { section: 'leg', needleMm: 2.5 }, { section: 'foot',
  needleMm: 2.5 }]` for a typical fingering crew sock.
- `lifelinePoints` — empty array for plain socks; populated when
  the leg carries a lace or cable pattern with chart repeats
  worth a lifeline.
- `errataVersion` — `"1.0.0"`.
- `errataLog` — `[]`.
- `dominantColour` — null on plain socks; `"MC"` / `"CC1"` on
  colourwork or self-striping marled socks.
- `recommendedSwatchSizeCm` — 10 (smaller than garments — socks
  knit on small needles in the round; a 15 cm flat swatch
  misrepresents the in-the-round gauge).
- `constructionDirection` — `TOP_DOWN_IN_THE_ROUND` for cuff-
  down, `BOTTOM_UP_IN_THE_ROUND` for toe-up.
- `techniqueSlugs` — every technique referenced: long-tail
  cast-on (or Judy's Magic for toe-up), heel turn variant,
  Kitchener stitch (cuff-down) or Jeny's surprisingly stretchy
  bind-off (toe-up).
- `criticalTechniques` — heel turn variant + grafting method.
- `craftStitchSlugs` — knitting-prefixed slugs only
  (`knitting-knit`, `knitting-purl`, `knitting-k2tog`,
  `knitting-ssk`, `knitting-slip-stitch`).
- `craftTechniqueTags` — `in-the-round`, `magic-loop` if the
  pattern uses magic loop, `kitchener` for cuff-down,
  `short-rows` for short-row heels.

## Voice rules — sock-specific additions

- **Do not pretend the heel turn is easy.** A first heel turn is
  a meaningful learning step. State the skill ask explicitly.
- **Do not pin yarn brands.** Sock yarn is the most brand-pinned
  category in knitting; resist. Specify fibre blend + weight only:
  "high-twist wool sock yarn with nylon" not "Lang Yarns
  Jawoll."
- **State the time per pair.** Sock knitting is the train-and-tea-
  break project. A women UK 6 fingering pair runs ~25-35 hours of
  knitting.
- **Do not promise comfort.** The pattern delivers the construction;
  the wearer decides whether the sock is comfortable. Comfort
  depends on fibre + tension + foot shape, none of which the
  pattern controls.

## Sources

Same posture as `knitting-author.md`. Sock-specific PD references:

- **Weldon's Practical Knitter (Victorian)** — covers cuff-down
  flap-and-gusset, knee-high stocking construction, ankle sock,
  baby bootees. Public domain.
- **Beeton's Book of Needlework (1870)** — covers period sock and
  stocking construction including reinforced heels. Public domain.
- **Mary Thomas's Knitting Book (1938)** — Thomas died 1948,
  out of UK / EU copyright. Covers Dutch heel, French heel, short-
  row variants.
- **Nancy Bush, Folk Socks (1994)** — in copyright. Paraphrase
  the methodology; cite the tradition (Estonian, Norwegian,
  Latvian) rather than the author's named interpretation.

When PD material is thin, set `sourceType: "SYNTHESISED"` and cite
the next-closest material.

## Common faults — sock (H3 inside Pattern body)

1. **Heel bite.** The sock pulls down at the ankle and bites
   across the top of the foot. Cause: foot circumference too
   tight. Solution: knit the next size up at the same gauge, or
   reduce foot ease from -2 cm to -1 cm.
2. **Heel sag.** The heel cup is too shallow and the sock drops
   below the heel bone. Cause: heel-turn stitch count too low.
   Solution: lengthen the heel flap by 4-6 rows before turning.
3. **Gusset ladder.** A visible vertical line of looser stitches
   runs down each side of the foot from the gusset pickup.
   Cause: the picked-up gusset stitches twist. Solution: pick up
   through the back loop and knit the first gusset round through
   the back loop.
4. **Toe lump.** The grafted toe forms a ridge across the foot.
   Cause: Kitchener tension mismatched to the foot stitches.
   Solution: pull the grafting yarn snug after every stitch
   pair; the graft should disappear into the row.
