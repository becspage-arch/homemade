# Knitting colourwork authoring — two-axis routing wrapper

This prompt fires when the autopilot picks the `colourwork`
sub-category for the knitting category. It is a routing wrapper,
not a standalone author prompt — colourwork is a technique
discipline that applies across project shapes (hats, mitts,
scarves, shawls, blankets, accessories) rather than a finished
shape on its own.

## Two-axis routing

A colourwork fire pulls in two prompts:

1. **A project-shape author prompt.** Pick one of the six
   fully-guided shapes:
   - `docs/knitting-scarf-cowl-author.md`
   - `docs/knitting-hat-author.md`
   - `docs/knitting-mitt-glove-author.md`
   - `docs/knitting-shawl-wrap-author.md`
   - `docs/knitting-blanket-author.md`
   - `docs/knitting-accessory-other-author.md`

   Pick the one with the smallest published colourwork-tagged
   count in the database. Tie-break in alphabetical order. This
   levels coverage across project shapes within the colourwork
   discipline.

2. **The colourwork discipline guide.**
   `docs/knitting-colourwork-guide.md` — the discipline-specific
   reference for Fair Isle, Bohus, intarsia, mosaic, Latvian,
   Selbu, Sanquhar, Komi, twined.

## How the brief slots together

The brief follows the picked project-shape's input contract with
two additions:

- `techniqueDisciplines` includes `COLOURWORK`.
- The brief notes which colourwork sub-discipline the pattern
  draws on (Fair Isle, Bohus, intarsia, mosaic, etc.) so the
  body's cultural attribution and chart conventions match.

The body follows the project-shape's body structure with these
changes:

- The orientation paragraph names the colourwork tradition.
- The pattern includes a `chartData` block — colourwork without
  a chart is rare; the K-2 renderer handles colourwork charts
  per the locked contract.
- The chart key documents the palette, dominance, and float-carry
  convention.

## Voice + image + glossary rules

Identical to the picked project-shape's prompt. The shape prompt
is canonical for voice; the colourwork guide adds discipline-
specific rules without overriding.

## Cultural attribution

Acknowledge the colourwork tradition by name in the orientation
paragraph. One sentence. Do not claim cultural authority. See
the colourwork guide's "Cultural attribution" table for the
canonical tradition list.

## Self-critique

Run the picked project-shape's self-critique pass AND the
colourwork guide's self-critique additions.
