# Knitting brioche and double-knit — technique discipline guide

Reference guide for any project-shape author prompt that carries
`KnittingTechniqueDiscipline.BRIOCHE_DOUBLEKNIT`. Not a standalone
author prompt — read this alongside the appropriate shape prompt
(`docs/knitting-scarf-cowl-author.md`,
`docs/knitting-hat-author.md`, etc.).

## Voice — MANDATORY pre-read

Read `docs/voice-spec-quick-reference.md`. Voice rules apply
unchanged.

## Scope

Brioche and double-knit cover all techniques where the fabric is
worked with paired stitches that produce a thick, reversible,
often two-colour result. Sub-disciplines included:

- **One-colour brioche.** Single-colour fisherman's-rib variant.
  Worked with knit-and-yarn-over pairs and brioche stitches that
  knit through the previous row's yarn-over. Squishy and dense.
- **Two-colour brioche.** Same stitch family but worked with two
  colours, alternating which colour is "live" on each pass. The
  two sides of the fabric show opposite colour dominance.
- **Double-knit.** Two layers worked at the same time with
  alternating knit-purl pairs across the row. The two layers
  bond at colour changes. Reversible with mirror-image
  patterning.
- **Sloyd brioche, Italian brioche, German brioche.** Regional
  variations of the basic brioche family.

## Brioche notation

Brioche stitches have their own abbreviations distinct from plain
knit-purl:

- `brk` — Brioche knit. Knit the stitch together with its
  yarn-over from the previous row.
- `brp` — Brioche purl. Purl the stitch together with its
  yarn-over from the previous row.
- `sl1yo` — Slip 1, yarn over. Slip the next stitch purl-wise,
  bring the yarn over the needle. The yarn-over and the slipped
  stitch are then worked together as `brk` or `brp` on the next
  pass.
- `brkyobrk` — Brioche increase: brk, yo, brk into the same
  stitch.
- `brkrl` — Brioche right-leaning decrease.
- `brklsl` — Brioche left-leaning decrease.

State the brioche abbreviations in `abbreviationsUsed` and in
the chart key.

## Set-up rows

Brioche has a set-up row. Without it, the first proper round
fails because there's no yarn-over to knit through.

Standard set-up:
1. Cast on. Knit one row in main colour (or both colours for
   two-colour brioche).
2. Set-up row: *k1, sl1yo* across, ending with k1.
3. Begin the regular brioche stitch pattern.

State the set-up row plainly in the body. Brioche is the
technique where readers most often get stuck on the start.

## Two-colour brioche mechanics

In two-colour brioche each row is worked twice — once with each
colour — before moving to the next row.

Standard convention:
- Cast on with the main colour (MC).
- Set-up row in MC.
- Row 1, pass A: pick up contrast colour (CC), work brk and
  sl1yo across.
- Row 1, pass B: pick up MC, work sl1yo and brp across.
- Row 2, pass A: pick up CC.
- Row 2, pass B: pick up MC.

The yarn carries up the side; twist the unused yarn once every
few rows so it doesn't sag.

State the pass-A pass-B convention in the body.

## Brioche charts

Per K-2's `KnittingChartData` shape:

- Each grid cell carries a brioche symbol slug (`brk`, `brp`,
  `sl1yo`, `brkyobrk`).
- The chart type for brioche is `BRIOCHE` per
  `KnittingChartType`. The renderer uses two-colour notation
  with brk / brp markers when the chart is brioche-type.
- The palette resolves which symbol is in which colour. State
  the palette in the chart key.

Reading direction (per K-2):
- Flat work, RS rows: right to left.
- Flat work, WS rows: left to right.
- In-the-round: every row right to left.

State the WS-row convention in the chart key.

## Double-knit mechanics

Double-knit produces two layers worked at once.

Standard convention:
- Hold both colours.
- Each "stitch" in the chart represents one stitch on the front
  layer plus one stitch on the back layer.
- Front-layer colour: knit the front stitch in the front
  colour, purl the back stitch in the back colour. Both yarns
  in front of the needles for the knit and back for the purl —
  the yarns travel together with the colour change.

State the front-layer colour, back-layer colour, and the
"yarn-forward yarn-back" sequence in the body.

## Edge stitches

Double-knit and brioche both need edge stitches that join the
two layers — typically a slip stitch with both yarns held
together. Without the join the layers separate at the edge.

State the edge stitch convention in the body.

## Tension

Brioche pulls open vertically; the fabric is roughly half as
tall as a plain stockinette swatch.

- Cast on more stitches than a plain pattern would call for if
  the brioche is going on a fitted piece.
- State the brioche-specific gauge in
  `gaugeInPatternStitch` and the plain-stockinette gauge in
  `gaugeText`.
- Block flat to set the open structure; don't wet-block too hard
  or the squish disappears.

## Common faults

- Missed yarn-overs: a brk has no yarn-over to knit through.
  Rip back to the last completed row of brioche. Lifelines help.
- Lost stitch counts: the brk and brp work two strands as one
  but the count stays the same. Double-check at row ends.
- Colour bleed at the join in two-colour: untwisted yarns sag.
  Twist at the side every two to four rows.
- Pancake-tight edge stitches: edge stitches worked too tight
  curl the fabric. Loosen the slip stitches.

## Body voice for brioche / double-knit sections

- Lead with the set-up row. The set-up is the single most
  common drop-out point.
- State explicitly that brioche works each row twice in
  two-colour patterns. Many readers will be new to the
  pass-A pass-B structure.
- State the brioche abbreviations early; the notation is the
  blocker.
- Lifelines named in the body.

## Cultural attribution

Brioche traditions:

| Tradition | Region | Notes |
|---|---|---|
| Italian brioche (punto inglese) | Italy | Reversible "English stitch" historically used for hat brims. |
| German brioche (patentmuster) | Germany | "Patent stitch" identical family with slightly different notation. |
| Sloyd brioche | Sweden | School-taught Swedish craft tradition. |
| Modern double-knit | Modern | Twentieth-century technique; no single origin. |

Acknowledge the tradition by name in the parent prompt's
orientation paragraph where the design draws on it. Do not claim
cultural authority. One sentence.

## Sources

Acceptable historical sources:

- **Mary Thomas's Book of Knitting Patterns (1943)** — out of UK
  copyright. Holds early English-language brioche notation.
- **Weldon's Practical Knitter** — Internet Archive.

Modern reference sources (cite, do not reproduce):

- **Nancy Marchant, *Knitting Brioche*** — definitive modern
  brioche reference.
- **Lori Versaci, *Double Knitting*** — modern reversible
  double-knit reference.

## Self-critique additions

Add to the parent shape prompt's self-critique pass:

1. Set-up row stated plainly.
2. Brioche abbreviations in `abbreviationsUsed` and the chart
   key.
3. Two-colour pass-A pass-B convention stated where applicable.
4. Brioche gauge captured in `gaugeInPatternStitch`.
5. Edge stitch convention stated.
6. Lifelines named.
7. Cultural attribution respectful and bounded.
