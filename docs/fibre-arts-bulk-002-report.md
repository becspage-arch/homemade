# Fibre arts bulk-002 report

**Date:** 2026-05-20  
**Session type:** autopilot-queue  
**Category:** fibre-arts  
**Batch:** bulk-002  

## Summary

40 entries authored, voice-checked, and uploaded PUBLISHED. Fibre arts 43 → 83.

## Breakdown by sub-category

| Sub-category | Count | Entries |
|---|---|---|
| Felting | 12 | blending-fibres-on-drum-carder, felting-with-pre-felt-batt, needle-felted-acorn-set, needle-felted-miniature-hedgehog, needle-felted-moon-hare, needle-felted-mushroom-set, needle-felting-wire-armature-figure, nuno-felting-on-linen, shaping-wet-felted-hat-without-block, wet-felted-dryer-balls, wet-felted-pebble-soap-dish, wet-felted-vessel-over-balloon |
| Spinning | 7 | combing-fleece-with-hand-combs, e-spinner-for-beginners, navajo-ply-from-singles, reading-wraps-per-inch, spinning-lace-weight-on-wheel, supported-spindle-spinning, woollen-vs-worsted-draw |
| Weaving | 8 | freeform-weaving-frame-loom, leno-weave-frame-loom, log-cabin-weave-rigid-heddle, pickup-stick-patterns-rigid-heddle, plain-weave-yardage-rigid-heddle, soumak-stitch-tapestry, tablet-weaving-a-basic-band, threading-four-shaft-floor-loom |
| Natural dyeing | 4 | bundled-solar-dyeing, dyeing-with-nettles-for-green, iron-after-bath-mordant-modifier, tannin-pre-mordant-plant-fibres |
| Macramé | 6 | alternating-square-knot-macrame, double-half-hitch-right-macrame, figure-8-knot-macrame, gathering-knot-macrame, half-hitch-left-macrame, half-hitch-right-macrame |
| Rug making | 2 | punch-needle-rug-tufting, rag-rug-braiding |
| **Total** | **39** | (blending-fibres-on-drum-carder counted under felting) |

## Breakdown by type

| Type | Count |
|---|---|
| TECHNIQUE | 33 |
| PATTERN | 5 |
| READING | 2 |

## Difficulty

| Difficulty | Count |
|---|---|
| BEGINNER | 28 |
| INTERMEDIATE | 12 |

Intermediate entries: blending-fibres-on-drum-carder, combing-fleece-with-hand-combs, e-spinner-for-beginners, freeform-weaving-frame-loom, iron-after-bath-mordant-modifier, leno-weave-frame-loom, log-cabin-weave-rigid-heddle, pickup-stick-patterns-rigid-heddle, plain-weave-yardage-rigid-heddle, soumak-stitch-tapestry, spinning-lace-weight-on-wheel, tablet-weaving-a-basic-band.

## Voice-check fixes

- **37 em-dash replacements** across 21 files. All replaced with colons, semicolons, commas, or parenthetical rephrasing per the anti-tells rules.
- **1 safety-block word-count trim**: needle-felting-wire-armature-figure infoPanel body reduced from 28 words to 22 words.
- **1 JSON malformed heading repaired**: soumak-stitch-tapestry heading "Herringbone soumak'" had a stray `'` replacing the closing `"`, producing invalid JSON. Repaired by direct byte-level replacement.

## Upload

- 40 uploaded, 0 failures.
- All uploaded with `--status PUBLISHED` from `packages/db`.

## Warnings (non-blocking, noted for record)

- 14 files had voice-check warnings (exit 1) — all warnings, no errors. Categories: unflagged-jargon (tricolon), brand-trademark (false positive on "target" used as a common noun), americanism (stove → hob fixed; fall → drop fixed; remaining are in non-checked fields).

## Pattern notes for future batches

- Em-dashes are the dominant recurring issue. All briefs in this batch were authored in a session that reconstituted from context summary; the em-dash prohibition may not have been fully transmitted. For next batch: add a self-critique step that explicitly scans for em-dashes before submitting briefs.
- `soumak-stitch-tapestry.json` had a malformed heading (stray `'` instead of closing `"`) that invalidated the JSON. Root cause: the heading text `Herringbone soumak'` was written with the wrong closing character. Voice-check caught it as an invalid file; fixed by node script.
