# Knitting lace authoring — two-axis routing wrapper

**Prompt version:** 2 (K-4.1 author-prompt update — 2026-06-10). v1
shipped with K-1 pipeline-setup (2026-06-09). v2 inherits the K-4.1
cross-cutting requirements + Persona stuck-check from the picked
project-shape prompt; the lace-specific additions live in
`docs/knitting-lace-guide.md` v2.

This prompt fires when the autopilot picks the `lace`
sub-category for the knitting category. It is a routing wrapper,
not a standalone author prompt — lace is a technique discipline
that applies across project shapes (shawls primarily, plus
scarves, cowls, blankets, accessories) rather than a finished
shape on its own.

## Two-axis routing

A lace fire pulls in two prompts:

1. **A project-shape author prompt.** Pick one of:
   - `docs/knitting-shawl-wrap-author.md` (most common — lace
     lives here by tradition)
   - `docs/knitting-scarf-cowl-author.md`
   - `docs/knitting-blanket-author.md` (for heirloom and
     christening blankets)
   - `docs/knitting-accessory-other-author.md` (for bookmarks,
     small lace pieces)

   Pick the shape with the smallest published lace-tagged count.
   Tie-break in alphabetical order. Bias toward `shawl-wrap` on
   the first few fires until the dataset has a baseline.

2. **The lace discipline guide.**
   `docs/knitting-lace-guide.md` — discipline-specific reference
   for Shetland, Estonian (Haapsalu), Russian Orenburg, Faroese,
   Spanish, modern hand-dyed lace.

## How the brief slots together

The brief follows the picked project-shape's input contract with
two additions:

- `techniqueDisciplines` includes `LACE`.
- The brief notes which lace tradition the pattern draws on
  (Shetland, Estonian nupp, Orenburg, Faroese, modern) so the
  body's cultural attribution and chart conventions match.

The body follows the project-shape's body structure with these
changes:

- The orientation paragraph names the lace tradition.
- Lifelines are recommended in the body.
- The pattern includes a `chartData` block — lace without a chart
  is hard to follow.
- The chart key documents reading direction, WS-row convention,
  and any `no-stitch` cells.
- The Finishing section walks through wet-blocking with wires
  and pins.
- `gaugeText` is taken blocked.

## Voice + image + glossary rules

Identical to the picked project-shape's prompt. Lace guide adds
discipline-specific rules without overriding.

## Cultural attribution

Acknowledge the lace tradition by name in the orientation
paragraph. One sentence. Do not claim cultural authority.

## Self-critique

Run the picked project-shape's self-critique pass AND the lace
guide's self-critique additions.
