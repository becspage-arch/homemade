# Crochet amigurumi authoring — worker prompt template

## Status — WAITING ON WORKER X2

Amigurumi authoring requires the shape math library that Worker X2
ships. Until then, autopilot will NOT author amigurumi patterns for
crochet. The `Category.crochet.autopilotContentTypesEnabled` array
does not include `AMIGURUMI`, so the autopilot round-robin skips this
content type when it picks crochet.

This file is a placeholder for the full guidance Worker X2 will
land. When the shape math library arrives at
`apps/web/src/lib/crochet/amigurumi/`, X2 fleshes this file out with:

- Body structure for an amigurumi pattern — multi-piece work with a
  parts list, per-part row-by-row instructions, an assembly
  sequence, and stuffing notes.
- The body-shape primitives (`BodyShape` ENUM: SPHERE / CYLINDER /
  CONE / OVAL / CAPSULE / PEAR / COMPOSITE / NONE) and the
  increase / decrease formulas for each primitive.
- How the author populates `CrochetPattern.pieces` (array of
  `{ pieceName, partType, rowByRow, finishedDimensions, stuffingNotes }`),
  `CrochetPattern.buildOrder` (the sequence of piece names), and
  `CrochetPattern.assemblyInstructions` (joining sequence + technique
  notes).
- The standard amigurumi techniques the body assumes the reader
  knows: magic ring, single-crochet in the round without joining,
  invisible decrease, fasten-off-and-thread-through-front-loops.
- Stuffing density guidance — firm vs soft, what changes about the
  finished shape, when to under-stuff.
- Eye / face-feature placement — safety eyes, embroidered eyes,
  felt-piece eyes; placement before or after stuffing.
- Joining methods — mattress stitch for limbs, whip stitch for
  small parts, doll-needle through the body for limbs that need
  to articulate.
- Yarn weight + fibre guidance — DK acrylic for washable toys, DK
  cotton for keepsakes, fingering for miniatures.
- Hook size relative to yarn weight — typically one or two hooks
  smaller than the yarn band recommends, to keep stuffing from
  showing through.

The shared header (voice spec, image policy, glossary coverage,
materials master list) follows the same pattern as the other
crochet author prompts. X2 should copy that header block into this
file when it lands and append the amigurumi-specific guidance below.

Until X2 lands, do not draft any amigurumi pattern from this file.
If the autopilot routine ever picks crochet and routes to this
prompt (it shouldn't — `autopilotContentTypesEnabled` keeps
AMIGURUMI off), the worker reads this notice and halts with
`reason=CONTENT_TYPE_NOT_READY`.

## When X2 lands

X2 ships:

1. `apps/web/src/lib/crochet/amigurumi/` — TypeScript shape math
   primitives (sphere-from-magic-ring stitch counts, cylinder
   sleeve maths, cone increase / decrease tables, oval and capsule
   formulas).
2. The full body of this file, replacing this stub.
3. Adds `AMIGURUMI` to
   `Category.crochet.autopilotContentTypesEnabled` via a one-off
   script:
   ```ts
   await prisma.category.update({
     where: { slug: 'crochet' },
     data: {
       autopilotContentTypesEnabled: {
         push: 'AMIGURUMI',
       },
     },
   })
   ```
4. Verifies the autopilot routine picks AMIGURUMI as a routing
   target on its next fire.

Until then, this file's existence is purely a marker that the X1
foundation expects amigurumi authoring to slot in cleanly when X2
delivers the shape math.

## Prompt version

Version: 0 (X1 stub — 2026-06-09). Bump to 1 when X2 lands the
full guidance.
