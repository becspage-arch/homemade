# Knitting sweater and cardigan authoring

Per-shape author prompt for `subCategorySlug: "sweater-cardigan"`.
Read `docs/knitting-author.md` first — the role, voice spec, charts,
upload contract, eight-rule self-check, and the v5 cross-category
appendix all apply. This file covers the sweater-and-cardigan deltas.

**Prompt version:** 1 (K-5, 2026-06-10). Replaces the stub that
deferred sweater authoring to the grading library.

## How a drafting session uses this file

A worker drafting a sweater or cardigan pattern:

1. Reads `docs/knitting-author.md`, this file, the appropriate
   discipline guide (`docs/knitting-colourwork-guide.md` for Fair
   Isle yokes, `docs/knitting-cable-aran-guide.md` for cabled
   sweaters, `docs/knitting-lace-guide.md` for lace yokes,
   `docs/knitting-brioche-doubleknit-guide.md` for brioche bodies),
   `docs/voice-spec-quick-reference.md`,
   `docs/knitting-anti-tells.md`, and the brief.
2. Picks the construction shape from the brief or chooses one that
   fits the silhouette and the brief's discipline.
3. Calls the K-5 grading library (see "Grading library — call this,
   do not hand-author the maths") to populate `sizesGraded`,
   `yardageBySize`, and the row counts.
4. Drafts the body as a `TutorialUploadInput` with
   `type: "PATTERN"` and a `knitting` block.
5. Self-critiques against the voice rules, the K-4.1 cross-cutting
   requirements, and the eight-rule check.
6. Writes the JSON to disk; the upload script + voice-check CLI
   gate publication.

## Construction shapes covered

The K-5 grading library at `apps/web/src/lib/knitting/grading/`
ships six construction shapes. Pick one per pattern:

- `TOP_DOWN_RAGLAN` — single piece, in the round. Four raglan
  increase lines, eight stitches added each increase round. Easiest
  seamless construction; tries on as you go.
- `TOP_DOWN_YOKE` — single piece, in the round. Three increase
  rounds at 30 / 60 / 90 percent yoke depth. The canonical Fair
  Isle / Bohus / Lopi construction.
- `BOTTOM_UP_SET_IN` — flat panels seamed at shoulders, set-in
  sleeves seamed to armholes. The most tailored construction;
  asks the most of the finisher.
- `DROP_SHOULDER` — two flat rectangles, no armhole shaping.
  The simplest sweater shape; useful for beginner patterns and
  for the oversized indie aesthetic.
- `SIDE_TO_SIDE` — one long rectangle worked cuff to cuff. Row
  direction becomes the design feature. Uncommon but useful for
  stripes and gradient yarns.
- `CONTIGUOUS_SET_IN` — Susie Myers method. Top-down with
  built-in set-in sleeve caps; seamless and tailored.

Each shape's `gradeGarment` output populates the seven locked
K-5 sweater grading keys verbatim on every size:

- `yokeDepth`
- `neckCircumference`
- `armholeDepth`
- `sleeveCapDepth`
- `upperArmCircumference`
- `wristCircumference`
- `sleeveCuffCircumference`

These match the schema's `KnittingPattern.sizesGraded` shape and
the K-4.3 `SchematicRenderer` `SizeRow` type so the parametric
schematic draws straight from your grading output.

## Grading library — call this, do not hand-author the maths

Do not write per-size stitch counts by hand. Call the K-5 grading
library:

```ts
import {
  gradeAllSizes,
  type ConstructionShape,
  type EasePreset,
} from '@/lib/knitting/grading/garment-grader'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const

const sizesGraded = gradeAllSizes(SIZES, {
  constructionShape: 'TOP_DOWN_RAGLAN',
  gauge: { stitchesPer10cm: 20, rowsPer10cm: 28 },
  easePreset: 'POSITIVE_4',
  garmentType: 'PULLOVER',
  options: {
    yarnWeightCategory: 4,        // aran
    dominantFabric: 'STOCKINETTE', // or CABLE / COLOURWORK_STRANDED / ...
  },
})
```

`sizesGraded` lands in the `knitting` block on the
`TutorialUploadInput`. The library output also gives you the
canonical row counts (`bodyLengthRows`, `sleeveLengthRows`,
`yokeDepthRows`) so the pattern body can quote a single source of
truth.

After grading, derive `yardageBySize` from `yarnRequiredYards`
on each row:

```ts
const yardageBySize = Object.fromEntries(
  sizesGraded.map(s => [s.size, s.yarnRequiredYards])
)
```

## Per-type body shape

Sweaters and cardigans both use `type: "PATTERN"`. The body lays
out:

1. **Intro** — one paragraph. What the sweater is, the construction
   in plain language, the skill band, the time on the needles. Name
   the construction direction AND say in one clause why it suits this
   piece (K-4.1 cross-cutting requirement #4).
2. **Materials** — H2. Yarn weight class, fibre suggestion, total
   grams range (from `yardageBySize`). Needles by mm canonical
   with UK / US in brackets, type + length. Notions (cable needle,
   stitch markers, waste yarn, darning needle, blocking pins).
   Use `suppliesCard`.
3. **Sizing** — H2. The size table. Instruct the knitter to
   **circle her size** before working anywhere else in the pattern
   (K-4.1 cross-cutting requirement #1). Quote bust, length, sleeve
   length, shoulder width, yoke depth, armhole depth, sleeve cap
   depth, upper arm circumference, wrist, sleeve cuff circumference
   per size — the seven locked K-5 keys plus the K-3/K-4.1 core
   keys.
4. **Gauge** — H2 "Gauge". State the gauge value AND the concrete
   numeric consequence of being off (K-4.1 cross-cutting requirement
   #2). "21 sts vs 20 sts per 10 cm at gauge finishes a 100 cm
   sweater 5 cm narrow." Do not write "the sweater will be the wrong
   size."
5. **Abbreviations** — H2 using a `suppliesCard` glossary.
6. **Pattern** — H2. Row by row, in working order. Subdivide with
   H3 by section (Neckband / Yoke increases / Body / Sleeves /
   Finishing). State the long-tail cast-on tail formula AND a worked
   number for the largest size (K-4.1 cross-cutting requirement #3).
   Embed at least two stitch-count check-ins after major shaping
   steps (after yoke increases, after armhole bind-off, after gusset
   pickup), mirrored in `knitting.stitchCountCheckpoints`.
   `### Common faults` H3 inside Pattern lists 2-4 named failure
   modes in prose.
7. **Finishing** — H2. Cast off in pattern, weave in ends, blocking
   instructions (wet-block or steam-block; state the time).
   Cardigans get button placement and buttonhole positioning here.
8. **Variations** — H2 (optional). Single paragraph per variation
   naming the gauge / yarn / construction change.
9. **Sources** — `sourceNotes`.

Length: 2,000–2,500 words for PATTERN bodies in this sub-cat.
Sweaters and cardigans run long because the row counts run long.

## Cardigan specifics

Cardigans differ from pullovers in three places. Cover each in
the body:

- **Front bands and button placement.** Cardigan front bands carry
  the buttonholes. Calculate buttonhole spacing across the body
  length so the buttonholes land at even intervals. State the
  number of buttons (typically 5-8 for a women's M cardigan) and
  the buttonhole placement formula in the Finishing section.
- **Steeking choice (yoke cardigans only).** Yoke cardigans worked
  in the round can be cut open after blocking (steeked) or worked
  flat from the start. Name the choice and the rationale. PD-only
  source for steeking technique: Elizabeth Zimmermann pre-1964,
  Mary Thomas.
- **Front overlap / collar.** Cardigans add 4-10 cm of front overlap
  for a button band or shawl collar. State the overlap allowance
  separately from the bust circumference so the schematic reads
  correctly.

For `gradeGarment` calls on cardigans, pass `garmentType:
'CARDIGAN'` — the library applies the appropriate front overlap on
side-to-side constructions.

## K-4.1 cross-cutting requirements (recap)

All seven cross-cutting requirements from `docs/knitting-author.md`
apply unchanged. Re-read them. The sweater-specific applications:

1. **Circle your size** — the Sizing H2 is where the instruction
   sits.
2. **Concrete consequence of gauge** — quote the numeric impact at
   bust circumference for the largest size in the pattern.
3. **Cast-on tail length** — for the long-tail cast-on at the
   neckband: `tail_cm ≈ (needleCircumferenceMm × stitchCount) / 10
   + 15`. Worked number: for the women XL neckband at 44 stitches on
   3.5 mm needles, tail ≈ (3.5 × 44) / 10 + 15 = 30 cm.
4. **Construction direction WHY** — your Intro paragraph names the
   construction and justifies the choice in one clause.
5. **Stitch count check-ins** — at minimum: after the neck cast-on
   (1 check-in), after each yoke increase round for yoke patterns
   or the raglan increase block (3 check-ins for yoke, 1 for
   raglan), at the underarm split (1 check-in), at the body cast-off
   (1 check-in), at sleeve bicep before tapering (1 check-in), at
   sleeve cuff (1 check-in). Populate `knitting.stitchCountCheckpoints`
   with the same data as JSON.
6. **No external visuals** — the K-2 chart engine handles every
   cable / lace / colourwork chart; the K-4.3 SchematicRenderer
   draws the parametric schematic; the K-4.2 PD diagram library
   covers technique illustrations. Do not write "see video" or "see
   photo" anywhere.
7. **Common faults H3** — typical failure modes for sweaters:
   incorrect yoke increase spacing producing visible ladder lines,
   sleeve cap too tall for the armhole, ribbing pulling in too
   tightly at the cuff, neckline ribbing flaring out, raglan line
   pulling diagonally.

## Persona stuck-check

After the draft, read it three times with three reader personae as
described in `docs/knitting-author.md`. Sweater-specific notes:

- **Beginner reader (k / p / m1 / k2tog / ssk):** flag steps where
  the pattern assumes she has worked an armhole, a yoke, or a
  sleeve cap before. The first sweater is a meaningful skill jump;
  the prose should not pretend it isn't.
- **Intermediate reader (one or two finished sweaters, learning
  charts + shaping):** flag where the chart legend is incomplete,
  where the increase order matters and the pattern doesn't say,
  where a row count check-in is missing at a structural turn.
- **Master reader (Walker / Bush / Miller / Zimmermann literature
  in their head):** flag where the construction violates a
  convention (top-down yoke without short rows at the back neck;
  set-in cardigan without front-shoulder shaping), where a stitch
  count miscalculates by 2-4 across the body, or where the
  finishing instructions omit a step a competent designer would
  always include.

Each flag carries a row reference and a one-line fix. Fix every
flag before voice-check.

## Schema fields populated

The `knitting` block on the upload input carries:

- `sizesGraded` — the `gradeAllSizes` output.
- `yardageBySize` — derived from `yarnRequiredYards`.
- `stitchCountCheckpoints` — populate from the H3 stitch-count
  check-in entries (each with `rowOrRound`, `expected: [int per
  size]`, `label`).
- `needleBySection` — populate when the pattern uses multiple needle
  sizes (smaller for neckband + cuffs, larger for body).
  Default: `[{ section: 'body', needleMm: 5 }, { section: 'ribbing',
  needleMm: 4 }]`.
- `lifelinePoints` — populate for any lace yoke or any pattern with
  chart repeats over 8 rows. Empty array otherwise.
- `errataVersion` — `"1.0.0"` on first publication.
- `errataLog` — `[]`.
- `dominantColour` — `"MC"` / `"CC1"` / `"CC2"` for colourwork
  yokes; null for single-colour patterns.
- `recommendedSwatchSizeCm` — `15` default, `20` for cabled
  sweaters.
- `constructionDirection` — matches the construction shape:
  `TOP_DOWN_IN_THE_ROUND` for raglan / yoke / contiguous,
  `BOTTOM_UP_FLAT` for set-in / drop-shoulder, `SIDE_TO_SIDE` for
  side-to-side.
- `techniqueSlugs` — every technique the body references (long-tail
  cast-on, German short rows, three-needle bind-off, Kitchener
  grafting, picking-up stitches around the armhole). Populate.
  `criticalTechniques` is the subset without which the pattern does
  not work.
- `craftStitchSlugs` — every knitting stitch the pattern uses,
  knitting-prefixed (`knitting-knit`, `knitting-purl`,
  `knitting-k2tog`, etc.). Look up in `data/stitches.ts` filtered
  to `craft: 'knitting'`.
- `craftTechniqueTags` — `in-the-round` / `flat-construction` /
  `colorwork` / `cabling` / `lacework` as appropriate.
- `glossaryTerms` — every term wrapped in a `glossaryTooltip` mark
  in body prose. Use `termSlug` (not `slug`) per the locked schema.

## Voice rules — sweater-specific additions

On top of the eight-rule self-check from `docs/knitting-author.md`:

- **Do not promise a beginner sweater.** A first-sweater pattern is
  an intermediate project. The intro names the skill band the
  pattern fits.
- **Do not undersell the time on the needles.** A women's M aran
  raglan pullover at 20 sts / 10 cm gauge runs ~250 hours of
  knitting. State the order of magnitude in the intro.
- **Do not gesture at a fashion outcome.** Do not write "the perfect
  layer for autumn" or "your new favourite jumper." The pattern
  ships the construction; the wearer decides the role.
- **State the construction in the intro.** "Worked top-down in one
  piece from a circular yoke" beats "constructed seamlessly."
  Plain English; the construction is the spine.

## Sources

Same posture as the parent `knitting-author.md` Sources list. For
sweater-specific drafting, three additional PD references:

- **Mary Thomas's Knitting Patterns Book (1943)** — out of UK / EU
  copyright (Thomas d. 1948). Covers raglan, set-in, drop-shoulder.
- **Elizabeth Zimmermann's Knitting Without Tears (1971)** — in
  copyright in many jurisdictions. Paraphrase the percentage
  system; do not reproduce the prose verbatim.
- **Weldon's Practical Knitter, volumes 1-5 (Victorian)** — public
  domain. Covers period sweater construction; useful for side-to-
  side and seamed drafting.

When PD material is thin, set `sourceType: "SYNTHESISED"` and cite
the next-closest material.

## Common faults — sweater (H3 inside Pattern body)

The `### Common faults` H3 inside the Pattern section names typical
failure modes in prose. For sweaters, the four most common:

1. **Yoke increase spacing produces a visible ladder.** The yoke
   increases land in the same column on each increase round and
   trace a vertical line up the body. Stagger the increase column
   by working a different stitch between increases on alternate
   rounds.
2. **Sleeve cap too tall for the armhole.** The sleeve cap rows
   exceed the armhole depth; the cap puckers when sewn in. Recheck
   `armholeDepth` against `sleeveCapDepth` in the grading output
   and reblock the cap.
3. **Neckline ribbing flares out.** The neckband stitch count is
   too high for the neckline diameter. Recount the pick-up rate
   and rip the neckband if the count is wrong.
4. **Raglan line pulls diagonally.** The increase rate is the same
   on each line but the body is taller than the sleeves by the
   armhole depth, so the raglan line angles. This is correct
   construction; the angle is the silhouette.
