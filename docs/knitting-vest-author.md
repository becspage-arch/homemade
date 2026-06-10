# Knitting vest authoring

Per-shape author prompt for `subCategorySlug: "vest"`. Read
`docs/knitting-author.md` first and `docs/knitting-sweater-cardigan-
author.md` second — most of the construction guidance applies
unchanged. Vests are sleeveless garments, so vest-specific drafting
covers only the differences.

**Prompt version:** 1 (K-5, 2026-06-10). Replaces the stub that
deferred vest authoring to the grading library.

## Construction shapes

Three shapes are useful for vests. Pick one per pattern:

- `TOP_DOWN_YOKE` with `garmentType: 'VEST'` — Fair Isle yoke
  vests. Pass the yoke options unchanged; the library skips the
  sleeve picks at the underarm.
- `BOTTOM_UP_SET_IN` with `garmentType: 'VEST'` — set-in armhole
  vest, sewn from flat panels. The most tailored vest shape; the
  armhole bind-off shapes the silhouette.
- `DROP_SHOULDER` with `garmentType: 'VEST'` — tabard or
  sleeveless tunic. The body rectangles are worked straight with
  no armhole shaping.

`SIDE_TO_SIDE` is theoretically possible but rare for vests; the
yarn requirement for a side-to-side vest matches a side-to-side
cardigan and rarely sits in the casual-vest aesthetic. Skip unless
the brief specifies it.

`gradeGarment` returns `yarnRequiredGrams` and `yarnRequiredYards`
that already account for `garmentType: 'VEST'` — the sleeve term
in the yarn estimator is dropped.

## Grading library — call this

Same call shape as the sweater prompt. Pass `garmentType: 'VEST'`:

```ts
import { gradeAllSizes } from '@/lib/knitting/grading/garment-grader'

const sizesGraded = gradeAllSizes(SIZES, {
  constructionShape: 'BOTTOM_UP_SET_IN',
  gauge: { stitchesPer10cm: 22, rowsPer10cm: 30 },
  easePreset: 'NEGATIVE_2',
  garmentType: 'VEST',
  options: { yarnWeightCategory: 3 },
})
```

Vests typically use **negative or zero ease** at the bust because
they sit close to the body for the layering use case. The default
ease preset for vests is `NEGATIVE_2` or `ZERO`. Override only when
the silhouette warrants positive ease (oversized layering vest,
boxy aran tabard).

The seven locked K-5 sweater grading keys still populate on each
size; `sleeveLength`, `sleeveCapDepth`, `upperArmCircumference`,
`wristCircumference`, and `sleeveCuffCircumference` carry through
unchanged from the size charts even though no sleeve is knit. This
keeps the schema shape stable and lets the schematic renderer draw
the armhole opening to scale.

## Per-type body shape

Same nine sections as the sweater prompt, with two adjustments:

3. **Sizing** — H2. The size table. Vests grade closer to the body
   than sweaters; the V-neck or crew-neck opening matters more.
   Include `neckCircumference` and `armholeDepth` in the table even
   when other key columns drop off, because the wearer cares most
   about the neckline and armhole fit on a sleeveless garment.

5. **Pattern** — H2. Subdivide:
   - Body sections (Hem / Front / Back / Yoke increases / Armhole).
   - Armhole shaping is the key section; treat it with the
     attention the sleeve cap gets on a pullover.
   - **No sleeve sections.** The Pattern body finishes with the
     neckline and armhole edgings, not the sleeve.
   - `### Common faults` H3 lists 2-4 vest-specific failure modes.

The Materials and Gauge sections shrink because the sleeve yarn
column comes off the requirement: a women M aran vest runs ~250-
350 g vs the sweater's 400-500 g.

## Armhole edging

Vests carry armhole edging (typically 2x2 rib or i-cord) picked up
around the armhole opening after the body finishes. State the
pickup rate in the Finishing section:

> Around each armhole, pick up 2 stitches every 3 rows along the
> straight edge and 1 stitch per stitch along the bound-off curve,
> then work the edging for [N] rounds.

The K-2 chart engine handles ribbed edging samples if the pattern
uses a complex rib.

## Neckline shape

Vests get one of three necklines:

- **V-neck.** Centre stitch is divided at the start of the yoke;
  paired decreases work each side over the yoke depth. Lock the V
  position in the pattern body: at row N of the yoke, divide and
  decrease.
- **Crew neck.** Standard pullover neckline; the centre stitches
  bind off and the shoulder shaping continues around. The neckline
  edging is identical to the sweater prompt's approach.
- **Square neck.** The centre is bound off straight across at the
  start of the yoke; the side stitches work straight to the
  shoulder. Less common; useful for masculine tabard styling.

Name the neckline in the Intro paragraph alongside the construction
direction. The schematic renderer reads the neckline shape from the
pattern metadata; populate the right field on the upload input so
the parametric schematic draws correctly.

## K-4.1 cross-cutting requirements

Same seven requirements; sweater-specific applications still apply.
Two vest-specific notes:

- **Stitch count check-ins** — at minimum 5 entries: after hem cast-
  on, after waist shaping (if any), before armhole bind-off, after
  armhole bind-off + side decreases, at shoulder cast-off.
- **Common faults H3** — typical vest failure modes:
  - Armhole bind-off too aggressive producing a tight armhole that
    rides up.
  - V-neck decreases land too far below the neckline producing a
    plunging V.
  - Armhole edging picks up too few stitches producing a flared
    armhole.
  - Side seams pucker because the front and back panels grade with
    different row counts.

## Schema fields populated

Same fields as the sweater prompt. Differences:

- `yardageBySize` ranges sit ~30% lower than sweaters at the same
  size + gauge.
- `craftTechniqueTags` typically includes `flat-construction` for
  set-in vests and `in-the-round` for yoke vests; rarely both.
- `dominantColour` typically null (most vests are single-colour;
  Fair Isle yoke vests are the exception).

## Persona stuck-check

Same three readers from the sweater prompt. Vest-specific notes:

- **Beginner reader (k / p / m1 / k2tog / ssk):** a first vest is a
  reasonable first sweater-shape project because the sleeves come
  off the critical path. Flag where the prose pretends it's harder
  than it is.
- **Intermediate reader:** flag where the armhole bind-off rate is
  wrong, the V-neck decreases land off, the neckline edging
  pickup rate is unstated.
- **Master reader:** flag where the bottom-up set-in panels don't
  grade symmetrically across front and back, where the shoulder
  shaping omits short rows for slope, where the armhole edging
  isn't worked in pattern.

## Sources

Same as the sweater prompt; one additional vest-relevant PD
source:

- **Beeton's Book of Needlework (1870)** — covers Victorian
  waistcoat construction (the period word for "vest" in UK English).
  Useful for square-neck and tabard drafting.

## Common faults — vest (H3 inside Pattern body)

1. **Armhole bind-off too aggressive.** Binding off too many
   stitches at the start of the armhole produces a tight opening
   that rides up. Reduce the bind-off and add 1 stitch per side per
   row decreases instead.
2. **V-neck decreases too low.** The first V-neck decrease lands
   below the natural cleavage point. Recheck the row count to the
   first decrease against the yoke depth.
3. **Armhole edging flares.** The pickup rate is too generous;
   reduce by 10-15% and re-block.
4. **Side seams pucker.** Bottom-up set-in front and back panels
   grade with subtly different shoulder shaping. Recheck that the
   front and back finish at the same row count before sewing
   shoulder seams.
