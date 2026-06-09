# Crochet garment authoring - worker prompt template

## Voice - MANDATORY pre-read

Before drafting any garment brief, read `docs/voice-spec-quick-reference.md`
end-to-end. The worked bad to good rewrites and the 10-point self-critique
in §5 are the bar every opening paragraph is measured against. If any
answer in §5 self-critique is "no", rewrite before running voice-check.

Also read `docs/crochet-author.md` for the shared crochet voice and the
per-type PATTERN structure. This file extends that template with the
specific structural and metadata requirements for sized garments.

---

## What this prompt is for

A garment is a finished wearable piece that is graded across multiple
body sizes: pullovers, cardigans, vests, tank tops, tunics, and dresses.
The reader's expectation is that the pattern fits a body, holds shape,
and reads the same in size XS and size 4XL.

This file is the canonical input for a worker session that drafts one
garment PATTERN. A worker drafts the prose, the structure, the metadata,
the per-size stitch counts, and the assembly instructions. A worker
NEVER generates the hero image; the image pipeline runs separately.

## How a drafting session uses this file

1. Reads this whole file, `docs/crochet-author.md`,
   `docs/voice-spec-quick-reference.md`, and `docs/crochet-anti-tells.md`.
2. Reads the brief it was handed.
3. Picks a construction shape (see § Construction selection).
4. Calls the grading library at
   `apps/web/src/lib/crochet/grading/grader.ts` to produce the per-size
   GradedPattern objects. Never hand-types stitch counts for a
   multi-size garment - the library is the source of truth.
5. Embeds the GradedPattern array in `crochet.sizesGraded` on the
   upload input.
6. Drafts the body following the structure in § Body structure.
7. Self-critiques against voice rules, the anti-tells file, and the
   in-file checklist below.
8. Writes the JSON to disk.

## Construction selection

The grading library covers five construction shapes. Pick the right one
for the silhouette and the skill the pattern targets.

- **TOP_DOWN_RAGLAN** - worked seamlessly from the neck down. Four
  raglan increase lines from neck to underarm. Sleeves picked up and
  worked down. Best for: relaxed pullovers, easy first-garment
  patterns, mid-skill cardigans. Avoid for: very fitted silhouettes or
  patterns where the shoulder line must sit on the natural shoulder.
- **TOP_DOWN_YOKE** - worked seamlessly from the neck down. Three
  increase rounds at 30 / 60 / 90 percent of yoke depth distribute
  stitches evenly. Sleeves picked up and worked down. Best for:
  colourwork yokes, lace yokes, stranded patterns where the design sits
  at the upper chest. Avoid for: highly fitted shapes.
- **BOTTOM_UP_SET_IN** - two body panels and two sleeves worked flat
  and seamed. Set-in sleeve cap shaping. Best for: tailored
  silhouettes, structured cardigans, vintage-style pullovers. Higher
  skill because armhole and sleeve cap shaping is the most complex of
  the five.
- **DROP_SHOULDER** - two body rectangles and two tapered sleeves
  seamed at the shoulders and sides. Shoulder seam sits well off the
  natural shoulder. Best for: oversized silhouettes, beginner-friendly
  first sweaters, modern relaxed styles.
- **SIDE_TO_SIDE** - one long rectangle worked from cuff to cuff with
  shaping for armholes and neckline mid-piece. Best for: shawl-collared
  jackets, cocoon-shape cardigans, drape-forward fabrics. Rare in
  modern patterns; reserved for design-led pieces.

## Calling the grading library

The worker imports `gradePattern` or `gradeAllSizes` and runs it once
per size the pattern offers.

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

The returned `GradedPattern[]` is what `crochet.sizesGraded` carries.

## Input contract

Standard `TutorialUploadInput` from `docs/crochet-author.md`, with
these specific requirements:

- `type: "PATTERN"`
- `subCategorySlug: "garments"`
- `crochet.shapeCategory: "GARMENT"`
- `crochet.construction` - one of `TOP_DOWN_SEAMLESS`,
  `BOTTOM_UP_SEAMLESS`, `SEAMED`, `ROW`, `OTHER` per the
  `CrochetConstruction` schema enum.
- `crochet.constructionDirection` - one of `TOP_DOWN`, `BOTTOM_UP`,
  `SIDE_TO_SIDE`, `MULTI_PIECE`, `SINGLE_PIECE` per the
  `ConstructionDirection` schema enum added by
  `phase_crochet_autopilot_foundation_001`. Map from the grading
  library's `constructionShape` value: `TOP_DOWN_RAGLAN` and
  `TOP_DOWN_YOKE` both map to `TOP_DOWN`; `BOTTOM_UP_SET_IN` and
  `DROP_SHOULDER` both map to `BOTTOM_UP`; `SIDE_TO_SIDE` maps to
  itself.
- `crochet.gradingNotes` - free-text notes a downstream grader would
  want, e.g. how to add an extra size between L and XL, or what to
  change for a longer body length.
- `crochet.primaryYarnWeightSlug` - required.
- `crochet.primaryHookSlug` - required, must fit the yarn weight per
  the standard table (the QC rule `hook-yarn-weight-mismatch` enforces).
- `crochet.gaugeText` - required.
- `crochet.finishedSizeText` - required.
- `crochet.sizesGraded` - required, populated by the grading library.
- `crochet.yardageBySize` - required, derived from
  `sizesGraded[i].yarnRequiredGrams`.
- `crochet.craftStitchSlugs` - every stitch used in the pattern.
- `techniqueSlugs` + `criticalTechniques` + `aliases` - populated per
  pipeline-setup standards. Garments need at minimum:
  `crochet-gauge-swatching`, `crochet-blocking`, plus any
  construction-specific techniques (e.g. `crochet-raglan-increase`,
  `crochet-set-in-sleeve-shaping`).

## Body structure

A garment PATTERN body lays out:

1. **Intro** - one paragraph. Name the silhouette in plain English
   (relaxed top-down raglan pullover, tailored set-in cardigan).
   State the yarn weight + hook + gauge in one sentence. Name the
   size range. End with the one sentence that answers what this
   garment is for in someone's wardrobe.
2. **Sizing** - H2 "Sizing". A short paragraph explaining how the
   pattern is graded and how to pick a size. Direct the reader to
   the finished bust column of the size table. Fitted patterns
   pick the size whose finished bust matches their body bust; loose
   patterns pick the size whose finished bust is 10-15 cm above
   body bust. Reference the ease preset by label.
3. **What you need** - `suppliesCard` block with yarn weight slug
   + total grams (use the largest size's `yarnRequiredGrams` for
   the headline number, list per-size yardage below), hook size,
   tapestry needle, scissors, stitch markers, blocking mat + pins,
   measuring tape.
4. **Gauge** - H2 "Gauge". Quote the `gaugeText` verbatim, then a
   sentence on how to swatch (10 × 10 cm square in the main stitch,
   blocked exactly as the finished garment will be blocked).
5. **Size table** - H2 "Size table". A table block listing every
   size on its own row with finished bust, finished body length,
   finished sleeve length, finished upper arm, and yarn requirement.
   Numbers come straight from the GradedPattern objects.
6. **Stitches used** - H2 "Stitches used". Every entry in
   `craftStitchSlugs` with UK + US abbreviations.
7. **Construction notes** - H2 "Construction notes". One short
   paragraph explaining how the garment is built (top-down seamless,
   bottom-up seamed, etc). Reference the visible features the reader
   sees (raglan lines, yoke increases, sewn sleeves).
8. **Pattern** - H2 "Pattern". The row-by-row or round-by-round
   instructions, per size. Use the assemblyInstructions.steps from
   the GradedPattern as the spine. For sections that differ by size
   (cast on, increase intervals), use brackets: e.g. "Chain 96
   (108, 120, 132, 144) and join in the round." UK abbreviations
   default.
9. **Schematic** - H2 "Schematic". A `craftChart` block (or static
   inline SVG if the chart engine doesn't render it) showing the
   finished garment outline with per-size measurements labelled.
10. **Finishing** - H2 "Finishing". Sewing seams (for seamed
    constructions), weaving in ends, blocking. Reference the
    canonical blocking method for the named fibre.
11. **Care** - H2 "Care". Wash + dry instructions per the fibre.
12. **What to try next** - short H2. Two or three suggestions:
    a different size, a different ease, a different yarn weight,
    or a sibling pattern in a different construction shape.

## Self-critique before write

Before writing the JSON, run through this list. If any answer is "no",
fix the body before saving.

- Does the intro avoid marketing language ("perfect for", "ideal for",
  "stunning")?
- Does the intro avoid em dashes?
- Does the sizing paragraph explain how to choose a size in concrete
  terms, not vague encouragement?
- Are the per-size numbers in the body identical to the GradedPattern
  values in `sizesGraded`?
- Are UK abbreviations the default, with US in brackets where the
  convention conflicts?
- Does every entry in `glossaryTerms[]` appear in the body as an
  inline `glossaryTooltip` mark with the matching `termSlug`?
- Does every entry in `craftStitchSlugs` exist in the master `Stitch`
  table?
- Is the hero unset? (Hero is the image pipeline's job.)
- Does the body avoid academic register words (codicological,
  manuscript tradition, extant examples, etc per the qc-audit rule)?
- Does the body avoid soft-medical / efficacy claims?
- Does the gauge swatching instruction tell the reader to swatch in
  the main stitch and to block exactly as the garment will be
  blocked?

## Construction-shape examples

Use these as voice anchors when drafting the intro.

**TOP_DOWN_RAGLAN, relaxed pullover, aran weight:**
> A relaxed pullover worked top-down in aran-weight yarn. The yoke
> shapes itself out as you go from neckline to underarm, four raglan
> lines opening the body as the stitch count grows. From the underarm
> down it works in the round straight to the hem, then each sleeve
> picks up from the held stitches and works to the cuff. No seams.
> Graded XS through 4XL with a relaxed fit; sizing on the bust.

**TOP_DOWN_YOKE, colourwork pullover, DK:**
> A circular-yoke pullover worked top-down in DK. The yoke runs three
> increase rounds at the third points of its depth, opening the
> stitch count for a smooth round shape that sits well over the
> shoulders. The colourwork band sits across the yoke between rounds
> 10 and 25. From the underarm down the body works straight; sleeves
> pick up from the held stitches and work to the cuff.

**BOTTOM_UP_SET_IN, tailored cardigan, aran:**
> A tailored cardigan worked bottom-up in aran-weight yarn, set-in
> sleeves, button band picked up after seaming. The body panels work
> flat from hem to underarm, then shape the armhole with paired
> decreases. Sleeves work from cuff up with paired increases to bicep,
> then a shaped cap that sets into the armhole. Pieces seam together
> at shoulders, sides, sleeves; the button band picks up around the
> centre front opening last.

**DROP_SHOULDER, oversized pullover, chunky:**
> An oversized pullover worked bottom-up in chunky yarn. Two body
> rectangles work straight from hem to shoulder; sleeves taper from
> cuff to a wide opening that meets the body's straight edge. The
> shoulder line sits well off the natural shoulder. Quick to make,
> generous fit, no shaping more complex than a straight rectangle
> and a tapered tube.

## Scope - out (HARD lines)

- DO NOT hand-type stitch counts. Call the grading library.
- DO NOT generate the hero image.
- DO NOT use em dashes, en dashes, or marketing register.
- DO NOT publish a pattern with `crochet.sizesGraded === null`.
  Garments are sized by definition.
- DO NOT use academic register words listed in qc-audit's
  ACADEMIC_REGISTER_WORDS table.
- DO NOT use soft-medical claims on a pattern.
- DO NOT skip the gauge swatching instruction.

## What QC rules will check

A garment PATTERN runs through `packages/db/scripts/qc-audit.ts` at
the publish gate. The crochet-specific rules that apply:

- `garment-grading-inconsistency` - verifier flags any cross-size
  jumps that exceed tolerance.
- `garment-stitch-count-vs-measurement-mismatch` - hemStitches at
  the stated gauge must match the finished bust to within 1.5 cm.
- `garment-yardage-implausible` - yarnRequiredGrams over surface
  area must fall in the plausible range.
- `hook-yarn-weight-mismatch` - hook mm size must fit the yarn weight
  per the standard table.
- `gauge-out-of-range` - gauge stated must fall in the plausible
  range for the yarn weight.

All five are BLOCK severity. A pattern that trips any of them does
not pass the publish gate.
