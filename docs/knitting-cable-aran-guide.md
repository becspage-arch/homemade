# Knitting cables and Aran — technique discipline guide

**Guide version:** 2 (K-4.1 author-prompt update — 2026-06-10). v1
shipped with K-1 pipeline-setup (2026-06-09). v2 adds the K-4.1
prose surfaces (compare-to-chart cadence, cable-needle alternatives,
"knit first stitch after the cross loosely") and HARDENS the
"cable panel gauge in body" requirement: when the discipline
includes CABLE_ARAN, the cable panel gauge in
`gaugeInPatternStitch` AND in body prose is a HARD requirement,
not soft. v2 also sets `knitting.recommendedSwatchSizeCm = 20`
on cabled patterns (cables need a 20 cm × 20 cm swatch; the
default 15 cm × 15 cm doesn't show the full cable repeat).

Reference guide for any project-shape author prompt that carries
`KnittingTechniqueDiscipline.CABLE_ARAN`. Not a standalone author
prompt — read this alongside the appropriate shape prompt
(`docs/knitting-hat-author.md`, `docs/knitting-mitt-glove-author.md`,
`docs/knitting-scarf-cowl-author.md`, etc.).

## Voice — MANDATORY pre-read

Read `docs/voice-spec-quick-reference.md`. Voice rules apply
unchanged.

## Scope

Cable knitting covers all techniques where stitches cross over
other stitches to form raised, twisting columns and rope-like
panels. Sub-disciplines included:

- **Aran knitting.** The classic Irish tradition of dense,
  panelled cabled jumpers and accessories. Heavy worsted to
  aran-weight wool.
- **Bavarian cable.** Travelling stitch tradition from southern
  Germany and Austria. Slip-stitched twists with strong
  diagonals.
- **Modern cable.** Contemporary designs in any weight.
- **Twined cabling.** Where the cable crosses are worked in
  twined-knitting style (rare; mostly Swedish).

## Cable notation

Standard knitting cable notation in `KnittingChartData.cables[]`:

- `C4F` — Cross 4 stitches, hold the first 2 in front. The
  rightmost 2 stitches cross over to the left visually.
- `C4B` — Cross 4 stitches, hold the first 2 in back. The
  leftmost 2 stitches cross over to the right visually.
- `C6F`, `C6B`, `C8F`, `C8B` — same logic with 6 or 8 stitches.
- `T2L`, `T2R` — Travelling stitch (twist) 2 stitches, left- or
  right-leaning. Used in Bavarian style.
- `T3L`, `T3R` — Same as T2 but spanning 3 stitches.

The K-2 chart renderer composes one crossing shape spanning
`endX - startX + 1` cells. Per `lib/knitting/renderer/types.ts`,
plain symbols beneath the crossing are ignored at render time —
the cable layout is the composite shape.

State the cable notation in the chart key.

## Cable needle vs. cable without

Two methods:

**With a cable needle (cn).**
1. Slip the hold-stitches onto the cn.
2. Hold the cn at front or back as the notation specifies.
3. Knit the next stitches from the left needle.
4. Knit the held stitches off the cn.

**Cable without a needle.**
1. Slip both groups of stitches off the left needle.
2. Re-arrange in the air (or with the right needle holding one
   group).
3. Slip back onto the left needle in the new order.
4. Knit across.

The cn method is forgiving. The without-cn method is faster
once practised but risks dropping a stitch. State which method
the pattern teaches in the body. Default to the cn method for
beginner-friendly patterns.

## Cable-needle alternatives

When the knitter is between tools, a cable needle isn't required.
The K-4.1 prompt surfaces these alternatives in body prose for
any cabled pattern that recommends the cable-needle method:

- **A chopstick** — wooden, smooth, slightly tapered. The taper
  helps recover dropped stitches.
- **A paperclip** — large paperclip, opened to a single bend.
  Best for narrow cables (C4F / C4B); awkward on wide cables.
- **A spare double-pointed needle (DPN)** — same diameter as the
  working needles. Best because the stitch sits cleanly.
- **A bobby pin** — small enough for fine cables, slightly
  springy.

State at least one alternative in the body for any cabled pattern
that recommends the cable-needle method. The maker won't always
have a dedicated cable needle in her bag.

## Knit the first stitch after the cross loosely

A K-4.1 body-prose surface for every cabled pattern:

The first stitch worked after a cable crossing is the visible
tension point. If the maker knits it at her usual tension, the
crossing pulls in and shows a small horizontal "tension scar"
across the cable. State plainly in the body: "Knit the first
stitch immediately after each cable cross slightly looser than
the rest of the row. The crossing pulls the working yarn back
under the stitches; the loose first stitch absorbs the tension
without showing." Once is enough; place this at the first cable
cross in the Pattern section.

## Compare to chart every cable round

A verification cadence the K-4.1 prompt surfaces in body prose:

After every cable round, hold the work up next to the chart and
compare visually before knitting on. Cables get reversed (C4F
read as C4B) more often than any other knitting error and the
visual confirmation catches it in one round, not ten rounds
later. State this plainly in the Pattern section.

## Stitch counts and gauge

Cables pull the fabric in.

- Cabled fabric runs narrower than its plain-stockinette stitch
  count would suggest — by 10 to 25% depending on density.
- Gauge swatch the cable pattern at 20 cm × 20 cm, not the
  default 15 cm × 15 cm. Cable panels need the larger swatch to
  show the full repeat. Populate
  `knitting.recommendedSwatchSizeCm = 20` on cabled patterns.
- HARD body requirement: when the discipline includes CABLE_ARAN,
  the cable panel gauge in `gaugeInPatternStitch` AND in body
  prose is a hard requirement, not soft. State both in the Gauge
  section. A cabled pattern without a cable-panel gauge is
  rejected by the K-4.1 prompt requirements.

## Reading cable charts

Per K-2's `KnittingChartData` shape:

- The grid carries plain symbols for non-cable cells (k, p,
  yo).
- Cable crossings populate `cables[]` with `startX`, `endX`,
  `y`, `crossDirection`, and `type` (e.g. "C4F").
- Reading direction:
  - Flat work, RS rows: right to left.
  - Flat work, WS rows: left to right.
  - In-the-round: every row right to left.

WS rows in flat cabled work are usually a plain "purl the purls,
knit the knits" — state this in the chart key.

## Travelling stitches (Bavarian)

A travelling stitch crosses a single knit-on-purl with one or
two adjacent stitches and "travels" diagonally across the
fabric over several rounds.

- T2L (or T2R): cross a single stitch over one neighbour.
- T3L (or T3R): cross a single stitch over two neighbours.

The K-2 renderer treats these as crossings spanning the
appropriate cell count. They render distinctly from cables.

State the travelling-stitch convention in the chart key.

## Aran patterns

Traditional Aran jumper structure (out of scope for K-4 — sweater
patterns wait for K-5 grading) but the panels are reusable on
scarves, cowls, hats, and blankets:

- **Honeycomb.** Cable-mirrored 4-by-4 cells producing the
  characteristic six-sided cell.
- **Trinity stitch / blackberry.** Make-3-in-1 / k3tog repeated
  in alternation.
- **Diamond and bobble.** Diamond cable with a bobble in the
  centre.
- **Tree of life.** Symmetric twist climbing in a Y shape.
- **Trellis or lattice.** Travelling crosses forming a diamond
  grid.
- **Cable rope.** Standard 4 or 6 stitch rope.

State the panels by name in the body where the pattern uses
named panels.

## Common cable faults

- Pulled-tight crossings: the first row after a cable crossing
  shows tension marks. Knit the first stitch after the crossing
  loosely.
- Twisted cables in the wrong direction: the front-or-back hold
  was swapped. Compare the work-in-progress to the chart
  visually after every cable round.
- Cable panel sags between crossings: gauge too loose for the
  yarn weight. Swatch first.
- Dropped held stitch when cabling without a needle: pick up the
  dropped stitch with a crochet hook in its column; transfer
  back to the left needle.

## Body voice for cable sections

- Lead with the chart, not the row count. "Round 1 of the
  cable chart" then mechanics.
- State the cable needle convention (with or without) in the
  orientation paragraph.
- State the pattern's stitch counts in `craftStitchSlugs` and
  abbreviations in `abbreviationsUsed`.
- Block cables with steam, not wet. Cables lose definition under
  weight when wet-blocked. State this in the Finishing section
  of the parent shape prompt.

## Cultural attribution

Acknowledge the tradition by name in the parent prompt's
orientation paragraph. Do not claim cultural authority. One
sentence is enough.

| Tradition | Region | Notes |
|---|---|---|
| Aran | Aran Islands, Ireland | Dense panelled jumper tradition. |
| Bavarian | Austria, southern Germany | Travelling stitch tradition. |
| Gansey | English east coast fishing villages | Dense knit-purl panels with light cabling. |
| Modern cable | Modern | Contemporary one-offs. |

Note on Aran origin myths: the "clan pattern" claim (each Aran
panel encoded a clan's identity) is a twentieth-century tourism
narrative, not historical. Treat the named panels (honeycomb,
tree of life, trellis) as standard motifs without family-clan
attribution.

## Sources

Acceptable historical sources:

- **Mary Thomas's Book of Knitting Patterns (1943)** — out of
  UK copyright.
- **Heinz Edgar Kiewe, *The Sacred History of Knitting* (1967)**
  — citation only; the romantic Aran clan-pattern narrative
  originates here and is not load-bearing fact.
- **Weldon's Practical Knitter** — Internet Archive.

Modern reference sources (cite, do not reproduce):

- **Alice Starmore, *Aran Knitting*** — definitive modern Aran
  reference.
- **Barbara Walker, *A Treasury of Knitting Patterns* (1968)** —
  out of US copyright pending; cite as secondary.
- **Annemor Sundbø, *Setesdal Sweaters*** — Norwegian cabled
  yokes.

## Self-critique additions

Add to the parent shape prompt's self-critique pass:

1. Cable notation matches the chart key.
2. Cable-needle convention (with or without) stated.
3. At least one cable-needle alternative named (chopstick / DPN
   / paperclip / bobby pin).
4. "Knit first stitch after the cross loosely" surfaced in body
   prose at first cable cross.
5. "Compare to chart every cable round" verification cadence
   surfaced in body prose.
6. Cable panel gauge captured in `gaugeInPatternStitch` AND in
   body prose. HARD requirement when discipline includes
   CABLE_ARAN.
7. `knitting.recommendedSwatchSizeCm` set to 20 on cabled
   patterns.
8. WS row convention stated in the chart key.
9. Block-with-steam stated in Finishing section.
10. No Aran clan-pattern attribution claims.
11. Cultural attribution respectful and bounded.
