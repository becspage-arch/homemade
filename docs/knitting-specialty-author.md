# Knitting specialty authoring — two-axis routing wrapper

**Prompt version:** 2 (K-4.1 author-prompt update — 2026-06-10). v1
shipped with K-1 pipeline-setup (2026-06-09). v2 inherits the K-4.1
cross-cutting requirements + Persona stuck-check from the picked
project-shape prompt; the specialty-specific additions live in
`docs/knitting-specialty-guide.md` v2.

This prompt fires when the autopilot picks the `specialty`
sub-category for the knitting category. It is a routing wrapper,
not a standalone author prompt — specialty techniques (entrelac,
modular, mitred, magic loop, short rows, i-cord, steeking) apply
across project shapes.

## Two-axis routing

A specialty fire pulls in two prompts:

1. **A project-shape author prompt.** Pick one of:
   - `docs/knitting-blanket-author.md` (entrelac, mitred squares,
     log cabin live here)
   - `docs/knitting-scarf-cowl-author.md` (entrelac scarves)
   - `docs/knitting-shawl-wrap-author.md`
   - `docs/knitting-mitt-glove-author.md` (magic loop, short row
     thumb)
   - `docs/knitting-hat-author.md` (magic loop crown)
   - `docs/knitting-accessory-other-author.md`

   Pick the shape with the smallest published specialty-tagged
   count. Tie-break in alphabetical order.

2. **The specialty discipline guide.**
   `docs/knitting-specialty-guide.md` — discipline-specific
   reference for entrelac, modular knitting, magic loop, two-
   circulars, short rows (German, Japanese, wrap-and-turn),
   i-cord, provisional cast-on variants, steeking.

## How the brief slots together

The brief follows the picked project-shape's input contract with
two additions:

- `techniqueDisciplines` includes `SPECIALTY`.
- The brief names the specialty technique the pattern centres on
  (entrelac, mitred squares, magic loop, short row, etc.).

The body follows the project-shape's body structure with these
changes:

- The orientation paragraph names the specialty technique.
- The body walks through the technique step-by-step on first use.
- Where the technique has a named modern source (German short
  rows, Judy's Magic cast-on, Cat Bordhi's magic loop), credit
  is brief and in-line.

## Voice + image + glossary rules

Identical to the picked project-shape's prompt. The specialty
guide adds discipline-specific rules.

## Cultural attribution

Specialty techniques are mostly modern (twentieth-century)
inventions. Credit the named modern source briefly in the body
where relevant. Do not claim cultural authority.

## Self-critique

Run the picked project-shape's self-critique pass AND the
specialty guide's self-critique additions.
