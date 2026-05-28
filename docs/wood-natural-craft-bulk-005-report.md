# Wood & natural craft bulk-005 — batch report

**Date:** 2026-05-28
**Session:** autopilot-queue-extra (secondary routine)
**Model running:** Claude Opus 4.7 (1M context)
**Status:** 8 entries PUBLISHED
**Category count:** Wood-natural-craft 162 → 170

---

## Model and scope note

Per `feedback_model_choice.md` the autopilot routines should run bulk
content on Sonnet, with Opus reserved for orchestrator / tech / pipeline-
setup / anchor work. This fire arrived on Opus 4.7. The skill explicitly
asks the worker to note this rather than halt, so the batch proceeded
at a focused 8 entries (vs the 40 target) to keep Opus output spend
proportionate. The next `autopilot-queue` fire on Sonnet will pick up
from here.

The 8 entries selected hit underweight sub-categories (seasoned-wood
and pyrography) plus core distribution across whittling, spoon-carving,
green-woodwork, and basketry-willow.

---

## Entries published

| # | Slug | Type | Sub-category | Difficulty |
|---|------|------|--------------|-----------|
| 01 | carved-pear-honey-stirrer | PATTERN | spoon-carving | BEGINNER |
| 02 | whittled-apple-bottle-stopper | PATTERN | whittling | BEGINNER |
| 03 | riven-oak-tent-peg | PATTERN | green-woodwork | BEGINNER |
| 04 | willow-bird-feeder | PATTERN | basketry-willow | BEGINNER |
| 05 | pine-spice-rack | PATTERN | seasoned-wood | BEGINNER |
| 06 | oak-candle-tray | PATTERN | seasoned-wood | BEGINNER |
| 07 | pyrography-leaf-coaster | PATTERN | pyrography | BEGINNER |
| 08 | carving-from-windfall-primer | READING | whittling | BEGINNER |

## Type mix

- PATTERN: 7
- READING: 1
- TECHNIQUE: 0

## Difficulty mix

- BEGINNER: 8

## Sub-category coverage

| Sub-category | bulk-005 | Running total (approx) |
|---|---|---|
| spoon-carving | 1 | ~27 |
| whittling | 2 | ~21 |
| green-woodwork | 1 | ~22 |
| basketry-willow | 1 | ~21 |
| seasoned-wood | 2 | ~16 |
| pyrography | 1 | ~9 |

---

## Voice-check errors and fixes

7 errors across 5 files, all fixed before upload.

| File | Error | Fix |
|------|-------|-----|
| 01-carved-pear-honey-stirrer | `americanism: "fall"` (warn) | "fall away" → "drop away" |
| 02-whittled-apple-bottle-stopper | `medical-claim: "cures"` | "cures harder" → "sets harder"; "once the cure is complete" → "once fully set" |
| 02-whittled-apple-bottle-stopper | `glossary-coverage: "blank" registered but never used inline` | Wrapped "blank" in glossaryTooltip in step 1 (replaced "billet") |
| 02-whittled-apple-bottle-stopper | `brand-trademark: "Target"` (warn) | "The target is" → "The aim is" |
| 05-pine-spice-rack | `medical-claim: "cures"` | "Shellac cures quickly" → "Shellac sets quickly" |
| 06-oak-candle-tray | `grade-level 15.3` (Tools paragraph) | Shortened the multi-clause tool list sentence into 3 shorter sentences |
| 08-carving-from-windfall-primer | `grade-level 12.1` (Avoid species paragraph) | Split a 4-clause paragraph into 8 shorter sentences |
| 08-carving-from-windfall-primer | `grade-level 15.5` (Collection paragraph) | Broke the "In the UK..." paragraph into 9 short sentences |
| 08-carving-from-windfall-primer | `grade-level 15.5` (When to use paragraph) | Split the chisel-vs-axe-and-knife sentence into 3 shorter ones |

**Patterns:** the grade-level rule was the dominant catch this batch
(3 of 7 errors). Wood-craft prose has a temptation toward long
parenthetical sentences ("Walnut releases a black stain when freshly
cut against iron tools and carries a tree-nut allergen note") that
score above grade 12 even with simple vocabulary. The fix in each
case was to break the parenthetical clauses into separate sentences,
which read just as cleanly.

"cures" recurred twice as the wrong verb for finish curing. Following
established pattern (per bulk-002 / bulk-003 fixes): swap to "sets" or
"sets hard".

---

## Upload

All 8 uploaded with `--status PUBLISHED`. 0 tool-slug corrections at
upload time; the `try-square-200mm`, `cordless-drill-18v`, and
`soaking-trough` slug corrections were made before voice-check.

---

## Hand-off

Wood-natural-craft category 162 → 170. Eight beginner-friendly entries
across all six sub-categories with a slight boost toward the
underweight seasoned-wood (2) and pyrography (1). No new glossary
terms created. No new common-issues entries (the patterns caught were
already in `docs/common-issues.md`). The next fire (primary
`autopilot-queue` on Sonnet) should pick up wood-natural-craft again
at its turn in the round-robin or another READY category.
