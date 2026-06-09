# Crochet garment authoring — worker prompt template

## Status — WAITING ON WORKER X2

Garment authoring requires the grading library that Worker X2 ships.
Until then, autopilot will NOT author garment patterns for crochet.
The `Category.crochet.autopilotContentTypesEnabled` array does not
include `GARMENT`, so the autopilot round-robin skips this content
type when it picks crochet.

This file is a placeholder for the full guidance Worker X2 will
land. When the grading library + sizing maths arrive at
`apps/web/src/lib/crochet/grading/`, X2 fleshes this file out with:

- Body structure for a graded crochet garment (top-down seamless,
  bottom-up seamless, motif-assembled jumper, cardigan).
- The size-grading table (XS / S / M / L / XL / 2X / 3X / 4X with
  bust / waist / hip / length / sleeve-length / shoulder-width).
- How the author populates `CrochetPattern.sizesGraded` from the
  grading library.
- Yardage estimation per size from a base count + a per-size
  multiplier.
- Construction-direction routing (`constructionDirection` ENUM:
  TOP_DOWN / BOTTOM_UP / SIDE_TO_SIDE / MOTIF_ASSEMBLED /
  MULTI_PIECE / SINGLE_PIECE).
- Schematic generation — labelled measurement diagram per
  finished piece, stored at `CrochetPattern.schematicMediaId`.
- Set-in-sleeve maths, raglan increase formulas, yoke depth
  calculations.
- Grader notes from the brief into `CrochetPattern.gradingNotes`.

The shared header (voice spec, image policy, glossary coverage,
materials master list) follows the same pattern as
`docs/crochet-technique-author.md`,
`docs/crochet-motif-author.md`, and
`docs/crochet-homeware-author.md`. X2 should copy that header
block into this file when it lands and append the garment-specific
guidance below.

Until X2 lands, do not draft any garment pattern from this
file. If the autopilot routine ever picks crochet and routes to
this prompt (it shouldn't — `autopilotContentTypesEnabled` keeps
GARMENT off), the worker reads this notice and halts with
`reason=CONTENT_TYPE_NOT_READY` rather than guessing the missing
guidance.

## When X2 lands

X2 ships:

1. `apps/web/src/lib/crochet/grading/` — TypeScript grading
   primitives (size-curve lookups, ease calculations, sleeve-cap
   maths, yoke depth).
2. The full body of this file, replacing this stub.
3. Adds `GARMENT` to `Category.crochet.autopilotContentTypesEnabled`
   via a one-off script:
   ```ts
   await prisma.category.update({
     where: { slug: 'crochet' },
     data: {
       autopilotContentTypesEnabled: {
         push: 'GARMENT',
       },
     },
   })
   ```
4. Verifies the autopilot routine picks GARMENT as a routing
   target on its next fire.

Until then, this file's existence is purely a marker that the X1
foundation expects garment authoring to slot in cleanly when X2
delivers the grading library.

## Prompt version

Version: 0 (X1 stub — 2026-06-09). Bump to 1 when X2 lands the
full guidance.
