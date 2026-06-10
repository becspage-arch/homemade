# Knitting sweater and cardigan authoring — STUB

**Status:** Stub. Authoring deferred to K-5.

**K-4.1 inheritance note (2026-06-10):** when K-5 lands the
grading library, the K-5 sweater + cardigan prompt inherits the
K-4.1 cross-cutting prompt requirements (circle your size,
concrete gauge consequence, cast-on tail formula, construction-
direction-WHY, stitch count check-ins, no external video / photo
dependencies, `### Common faults` H3, Persona stuck-check) AND
populates the K-4.1 schema fields (`stitchCountCheckpoints`,
`needleBySection`, `lifelinePoints` where lace yokes warrant,
`errataVersion`, `errataLog`, `dominantColour` for Fair Isle
yokes, `recommendedSwatchSizeCm = 20` for cabled sweaters). See
`docs/knitting-author.md` § "K-4.1 cross-cutting prompt
requirements" for the canonical list.

Sweater and cardigan authoring requires the knitting grading
library that K-5 ships. The grading library covers:

- Bust, waist, hip, length, sleeve length, shoulder width, neck
  opening per size across the full size range.
- Negative-ease vs. positive-ease per garment style.
- Yoke construction grading (Fair Isle yoke, raglan, set-in
  sleeve).
- Sleeve cap shaping for set-in-sleeve garments.
- Armhole depth + decrease patterns per body width.
- Cardigan front-band stitch counts + buttonhole spacing.

Until the library lands, the autopilot routine will not pick the
`sweater-cardigan` sub-cat. `SubCategory.autopilotEnabled = false`
gates this.

When K-5 ships the grading library at
`apps/web/src/lib/knitting/grading/`, this stub becomes a full
author prompt and `SubCategory.autopilotEnabled` flips to `true`.

## Why no interim version

The size-range maths is too sensitive to author by hand. A worker
without the grading library would produce patterns where the
size jumps are not consistent (e.g. M is 8 cm wider than S but L
is only 5 cm wider than M) — published patterns would need a
recall when the grading library lands.

The K-2 chart engine handles cabled, lace, brioche, and
colourwork sweater chart panels — that part of the contract is
already live. K-5 only needs to add the grading maths.

## Scope when K-5 lands

The K-5 follow-on will cover:

- Top-down raglan pullover (single piece, in-the-round).
- Bottom-up seamed pullover (front, back, sleeves seamed).
- Top-down circular yoke pullover (Fair Isle yoke, plain yoke).
- Top-down raglan cardigan (single piece, in-the-round; steeked
  or worked back-and-forth).
- Bottom-up seamed cardigan with set-in sleeves.
- Drop-shoulder pullover (simplest construction).
- Knit-in-pieces cardigan with separate front bands.

Each construction will reference this prompt + the appropriate
discipline guide
(`docs/knitting-colourwork-guide.md`,
`docs/knitting-lace-guide.md`,
`docs/knitting-cable-aran-guide.md`,
`docs/knitting-brioche-doubleknit-guide.md`,
`docs/knitting-specialty-guide.md`).

## Until K-5

Sweater + cardigan curation falls to a separate specialist
workstream. Pattern submissions for the public catalogue
(Tencel-light, Brooklyn Tweed, Pom Pom Quarterly) can be
catalogued by hand into `KnittingPattern` with grading data
populated from the original designer's grading. Do not generate
new sweater patterns until K-5.
