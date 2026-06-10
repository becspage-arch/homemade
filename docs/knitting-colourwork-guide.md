# Knitting colourwork — technique discipline guide

**Guide version:** 2 (K-4.1 author-prompt update — 2026-06-10). v1
shipped with K-1 pipeline-setup (2026-06-09). v2 adds the K-4.1
prose surfaces (float-catch cadence, magic-loop vs DPN for stranded,
"the back looks messy and that's OK") + the
`knitting.dominantColour` schema field which colourwork patterns
now populate.

Reference guide for any project-shape author prompt that carries
`KnittingTechniqueDiscipline.COLOURWORK`. Not a standalone author
prompt — read this alongside the appropriate shape prompt
(`docs/knitting-hat-author.md`,
`docs/knitting-mitt-glove-author.md`, etc.).

## Voice — MANDATORY pre-read

Read `docs/voice-spec-quick-reference.md`. Voice rules apply
unchanged.

## Scope

Colourwork covers all knitting techniques that hold more than one
yarn at a time or change yarn within a row to produce a coloured
design. Sub-disciplines included:

- **Fair Isle (stranded colourwork).** Two-colour rows, both yarns
  carried across the back of the work. Classic Shetland and
  Scandinavian.
- **Bohus knitting.** Multi-colour stranded with purl-stitch
  accents on the right side. Mid-twentieth-century Swedish.
- **Intarsia.** Separate yarn bobbins per colour block, twisted
  at the colour change. Picture knitting, large colour blocks.
- **Mosaic knitting.** Two-colour but only one yarn per row, the
  pattern created by slipped stitches. No floats.
- **Sanquhar two-colour.** Scottish two-colour patterns worked
  on gloves and stockings.
- **Latvian, Komi, Selbu.** Regional stranded mitten traditions.
- **Twined knitting (tvåändsstickning).** Swedish double-strand
  technique, both yarns twisting on each stitch.

## Chart conventions

Charts render through `apps/web/src/lib/knitting/renderer/` per
K-2's locked `KnittingChartData` shape.

For colourwork charts:

- Each grid cell's `s` field is the symbol slug; the palette
  resolves the slug to a colour. A blank cell defaults to the
  pattern's main colour ("MC").
- For two-colour stranded work, use the registered colour stitch
  symbols (`stitch-colour-mc`, `stitch-colour-cc`, etc.). When the
  pattern has a unique colour count, populate
  `KnittingChartData.palette[]` with the symbol-to-hex mapping.
- The K-2 renderer requires colourwork cells to use
  `forceSymbolSlug` when the cell already carries a stitch like
  k1 or p1 — colourwork takes priority over knit/purl symbol in
  the cell render. See
  `memory/feedback_studio_renderer_patterns.md` (knitting
  colourwork forceSymbolSlug rule).

Reading direction (per K-2):
- Flat work, RS rows: right to left.
- Flat work, WS rows: left to right.
- In-the-round: every row right to left.

## Two-handed knitting

Carrying both yarns at the same time is the standard technique.
Continental in the left hand and English in the right is the most
common combination — one of the two methods has to suit the
non-dominant hand for tension not to drift.

For one-handed knitters, two methods:
1. Strand-flip — drop one yarn, pick up the other, knit a few
   stitches, swap back. Slower but accessible.
2. Stitch markers between every pattern repeat so the tension
   resets at the marker.

State the recommended method in the body.

## Dominant colour

In stranded work the colour carried below the other in the float
shows slightly more in the finished fabric. The "dominant" colour
is the one carried underneath. For Selbu and Sanquhar mittens the
foreground colour is held below; for Fair Isle yokes the
background colour is held below so the pattern stands out
crisply.

Two rules:
- Pick a dominance convention at the start and keep it for the
  whole piece.
- If the pattern's dominance breaks halfway through, the colour
  shift is visible — even on machine wash.

State the dominance choice in the body AND populate
`knitting.dominantColour` with `"MC"`, `"CC1"`, or `"CC2"` per
the K-4.1 schema. The Studio's render of the chart key surfaces
the dominance flag automatically when the schema field is set.

## Float tension

Floats are the strands of yarn carried behind unworked stitches.

- Standard rule: catch the float every 4 to 5 stitches on the
  back so loops don't catch on jewellery and fingers. The K-4.1
  prompt surfaces this rule in body prose for every stranded
  pattern, not just as a footnote — the cadence is what stops
  finger-snags after the piece is finished.
- Tension: floats stretched too tight pucker the front of the
  work; too loose and they sag inside a garment. Catch the float
  with a "ladder back" on a longer run — see Annichen Sibbern
  Bøhn's notes.

State a float guideline in the body where the design has runs
longer than 5 stitches. Include the "catch every 4 to 5 stitches"
rule in body prose at first appearance of stranded colourwork in
the Pattern section.

## The back looks messy and that's OK

A reassurance the K-4.1 prompt surfaces in body prose for every
stranded pattern:

The back of stranded colourwork looks messier than the front.
Floats criss-cross. Catches show. The knitter holding the work
in progress will see the messy back and worry the piece is
ruined. State plainly in the body that the back of stranded work
isn't expected to look tidy — only the front needs to. A neat
back is a fine ambition for the maker who learns to weave floats
as she goes, but a tidy back is not the bar for a finished piece.

## Magic loop vs DPN for stranded

State which in-the-round method the pattern is written for, and
why. For stranded colourwork:

- **Magic loop** suits the maker who already owns one long
  circular needle and wants one tool for all in-the-round sizes.
  The pull-through at the halfway point can pull stranded floats
  tight at the changeover. Loosen the float before the pull
  through to avoid a vertical pucker line down the piece.
- **DPN (double-pointed needles)** suits the traditional Selbu /
  Sanquhar / Fair Isle reader. The float tension stays even
  because there's no mid-round pull-through. The downside is
  managing four or five needles in stranded colourwork.
- **Two circulars** is an alternative; tension stays even but the
  needle juggling adds time.

State the recommended method in the orientation paragraph and
name the trade-off plainly.

## Intarsia mechanics

- One bobbin per colour block.
- At each colour change on the back of the work, twist the old
  yarn around the new (pick up the new from under the old) so
  the colours lock at the boundary.
- WS rows: same twist, opposite direction.
- Intarsia in the round is technically possible (intarsia-in-the-
  round with travelling yarn) but rarely the cleanest choice. For
  in-the-round colourwork the default is stranded.

## Mosaic mechanics

- Two-colour, one row at a time.
- The non-working colour drops to the back; slipped stitches
  carry the contrast forward.
- No floats — the slipped-stitch fabric is the same thickness as
  plain knitting.
- Mosaic charts read top to bottom and right to left; each chart
  row works two physical rows of knitting (one in each colour).

## Twined knitting

- Two strands of the same yarn (or two yarns) twined at every
  stitch.
- Produces a dense, hard-wearing fabric used historically for
  gloves and mittens in Sweden.
- Twined purl rounds produce raised horizontal lines.

## Body voice for colourwork sections

- Lead with what the maker sees on the chart, not what they hold
  in their hands. "Round 1 of the chart" then mechanics.
- Specify dominance and float-catch convention in plain
  sentences. No hedging.
- Block colourwork hard. The pattern locks and floats settle on
  the first block. State this in the Finishing section of the
  parent shape prompt.

## Common faults

- Puckered fronts: floats too tight, often at long runs. Fix
  with a looser carry or a ladder back.
- Patchy colour: dominance broken mid-piece. Fix on next piece;
  on the current piece, block hard and live with it.
- Strand bleed: hand-dyed colour bled into adjacent stitches on
  blocking. Sourced from non-superwash hand-dyed. Pre-wash the
  skeins separately for repeat use.

## Cultural attribution

Acknowledge the tradition by name in the parent prompt's
orientation paragraph. Do not claim cultural authority. One
sentence is enough.

| Tradition | Region | Notes |
|---|---|---|
| Fair Isle | Shetland | Two-colour bands with peerie motifs. Yoke + jumper. |
| Bohus | Sweden | Multi-colour stranded + purl accents. Sweater + yoke. |
| Selbu | Norway | Two-colour mitten, eight-pointed star motif. |
| Sanquhar | Scotland (Dumfriesshire) | Two-colour glove + stocking. |
| Latvian | Latvia | Wedding mittens, hundreds of motifs. |
| Komi | Komi Republic, Russia | Two-colour stranded mitten + sock. |
| Twined | Sweden (Dalarna) | Two-strand twisted technique. |
| Orenburg | Russia | Lace-stranded shawls. |
| Estonian Roosimine | Estonia | Inlaid float technique. |

## Sources

Acceptable historical sources:

- **Annichen Sibbern Bøhn, *Norwegian Knitting Designs* (1929)**
  — out of Norwegian copyright. Reference only; do not reproduce
  charts.
- **Mary Thomas's Knitting Book (1938)** — out of UK copyright.
- **Weldon's Practical Knitter** — Internet Archive.

Modern reference sources (cite, do not reproduce):

- **Alice Starmore** — Shetland and Fair Isle.
- **Beth Brown-Reinsel, *Knitting Ganseys*** — for stranded yoke
  technique.
- **Nancy Bush** — Estonian, Latvian, Lithuanian.
- **Marianne Isager** — Bohus.

## Self-critique additions

Add to the parent shape prompt's self-critique pass:

1. Dominance convention stated in body AND
   `knitting.dominantColour` populated.
2. Float-carry convention stated, including the "catch every 4 to
   5 stitches" rule in body prose.
3. "The back looks messy and that's OK" reassurance present.
4. Magic loop vs DPN trade-off named in orientation paragraph.
5. Chart symbol slugs are colourwork symbols (`forceSymbolSlug`
   where needed).
6. Palette entries match the symbol slugs used.
7. Two-handed instruction included where the pattern carries two
   yarns at once.
8. Cultural attribution respectful and bounded.
