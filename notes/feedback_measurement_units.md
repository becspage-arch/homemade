---
name: measurement-units-cm-canonical-user-preference-picks-display
description: "Lock for length / dimension units across craft categories (knitting gauge, finished dimensions, body measurements, paper sizes). Canonical write is cm / mm. User preference picks cm or inches at render time. Same shape as the temperature + cooking unit rule."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8c388de1-e20d-4a69-99a1-a2c7fa389b60
---

Locked 2026-06-09 in the knitting deep-dive session. Surfaced when
Rebecca confirmed knitters should be able to switch between cm and
inches and to set their preference in their settings.

## The rule

**Centimetres (and millimetres for needle / hook sizes) are the
canonical unit on every craft pattern.** Authors write the cm
number into the schema column. The renderer derives the imperial
display at read time from the user's preference.

This is the same shape as [[feedback_temperature_and_units]]:
canonical write, derive-on-render, user preference picks display.

**Why:** the audience is global. UK + EU knitting culture works in
cm and mm. US knitting culture works in inches and US needle
numbers. Storing one canonical value per measurement lets the
platform serve every reader from the same row and lets the user
flip preferences without re-authoring content.

## How to apply when authoring

- **Gauge:** always written as "stitches per 10 cm, rows per 10 cm,
  blocked / unblocked." Imperial gauge ("per 4 inches") is the
  renderer's job, not the author's.
- **Finished dimensions:** cm in the schema column.
  `finishedSizeText` free-text may carry the cm phrasing the author
  wants; the renderer's hover tooltip shows the imperial equivalent.
- **Needle + hook sizes:** the master `KnittingNeedle` /
  `CrochetHook` rows already carry mm + UK + US + JP. Authors
  reference the mm slug; the renderer surfaces all conversions
  inline.
- **Body measurements (for graded garments):** cm in the schema.
  The garment grading library at `apps/web/src/lib/crochet/grading/`
  reads cm and outputs cm; the maker form lets the user enter in
  either unit and converts to cm on save.
- **Paper sizes:** A-series + US Letter / Legal + index card sizes
  are paper-class enums, not unit numbers. No conversion needed.

## How the renderer applies it

- User preference enum: `LengthPreference` (`METRIC` / `IMPERIAL`),
  to be added alongside the existing `OvenPreference` /
  `WeightPreference` / `VolumePreference` enums.
- Conversion: `cm × 0.393701`, rounded to nearest 0.25 inch for
  measurement display, nearest 0.5 inch for paper sizing.
- Anonymous users get the same `Accept-Language` default as the
  cooking units: `en-US` → imperial, every other locale → metric.
- Knitting gauge pill in the Studio info bar always shows both
  units on hover regardless of selection, so the reader can sanity-
  check the swatch.

## What this doesn't change

- The author still writes the gauge text in whatever phrasing reads
  best in prose. "Knit at a relaxed gauge of 18 sts and 24 rows
  over a 10 cm square, blocked" stays as written; the structured
  column captures the structured numbers separately.
- The voice-check CLI doesn't enforce this. It's authoring
  discipline + schema validation, not a deterministic gate.
