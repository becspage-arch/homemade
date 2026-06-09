# Knitting brioche and double-knit authoring — two-axis routing wrapper

This prompt fires when the autopilot picks the
`brioche-doubleknit` sub-category for the knitting category. It is
a routing wrapper, not a standalone author prompt — brioche and
double-knit are technique disciplines that apply across project
shapes (scarves, cowls, hats, blankets, accessories).

## Two-axis routing

A brioche-doubleknit fire pulls in two prompts:

1. **A project-shape author prompt.** Pick one of:
   - `docs/knitting-scarf-cowl-author.md` (most common — brioche
     scarves and cowls are the typical entry-point)
   - `docs/knitting-hat-author.md`
   - `docs/knitting-blanket-author.md`
   - `docs/knitting-shawl-wrap-author.md`
   - `docs/knitting-accessory-other-author.md`

   Pick the shape with the smallest published brioche-tagged
   count. Tie-break in alphabetical order.

2. **The brioche / double-knit discipline guide.**
   `docs/knitting-brioche-doubleknit-guide.md` — discipline-
   specific reference for one-colour brioche, two-colour brioche,
   double-knit, Italian / German / Sloyd variants.

## How the brief slots together

The brief follows the picked project-shape's input contract with
two additions:

- `techniqueDisciplines` includes `BRIOCHE_DOUBLEKNIT`.
- The brief notes which technique variant (one-colour brioche,
  two-colour brioche, or double-knit).

The body follows the project-shape's body structure with these
changes:

- The orientation paragraph names the technique variant.
- The set-up row is walked through explicitly (single most common
  drop-out point).
- The pattern includes a `chartData` block with
  `KnittingChartType: 'BRIOCHE'`.
- Two-colour brioche walks through the pass-A pass-B convention.
- Brioche-specific gauge captured in `gaugeInPatternStitch`.

## Voice + image + glossary rules

Identical to the picked project-shape's prompt. The brioche /
double-knit guide adds discipline-specific rules.

## Cultural attribution

Acknowledge the brioche tradition by name where relevant (Italian
punto inglese, German patentmuster, Swedish Sloyd) in the
orientation paragraph. One sentence. Do not claim cultural
authority.

## Self-critique

Run the picked project-shape's self-critique pass AND the
brioche-doubleknit guide's self-critique additions.
