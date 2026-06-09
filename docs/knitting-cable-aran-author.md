# Knitting cables and Aran authoring — two-axis routing wrapper

This prompt fires when the autopilot picks the `cable-aran`
sub-category for the knitting category. It is a routing wrapper,
not a standalone author prompt — cabling is a technique discipline
that applies across project shapes.

## Two-axis routing

A cable-aran fire pulls in two prompts:

1. **A project-shape author prompt.** Pick one of:
   - `docs/knitting-hat-author.md`
   - `docs/knitting-scarf-cowl-author.md`
   - `docs/knitting-mitt-glove-author.md`
   - `docs/knitting-blanket-author.md`
   - `docs/knitting-shawl-wrap-author.md` (cabled stoles only;
     cables on a triangular shawl is rare)
   - `docs/knitting-accessory-other-author.md` (cabled bag,
     headband)

   Pick the shape with the smallest published cable-tagged
   count. Tie-break in alphabetical order. Sweater + cardigan +
   vest shapes wait for K-5.

2. **The cables and Aran discipline guide.**
   `docs/knitting-cable-aran-guide.md` — discipline-specific
   reference for Aran (Irish), Bavarian travelling-stitch,
   modern cabling.

## How the brief slots together

The brief follows the picked project-shape's input contract with
two additions:

- `techniqueDisciplines` includes `CABLE_ARAN`.
- The brief notes which cabling tradition the pattern draws on.
- `castOnMethod` and the with-or-without cable-needle convention
  are stated.

The body follows the project-shape's body structure with these
changes:

- The orientation paragraph states the cable-needle convention.
- The pattern includes a `chartData` block with cable crossings
  populated in `KnittingChartData.cables[]`.
- Cable panel gauge is captured in `gaugeInPatternStitch`.
- The Finishing section recommends steam-blocking (not wet) so
  cable definition stays crisp.

## Voice + image + glossary rules

Identical to the picked project-shape's prompt. The cable-aran
guide adds discipline-specific rules.

## Cultural attribution

Acknowledge the cable tradition (Aran, Bavarian, Gansey) by
name in the orientation paragraph. One sentence. Do not claim
cultural authority. Do not repeat Aran clan-pattern myths —
they're twentieth-century tourism narrative, not historical
fact.

## Self-critique

Run the picked project-shape's self-critique pass AND the
cable-aran guide's self-critique additions.
