# Fibre Arts — Bulk 003 Report

**Date:** 2026-05-20  
**Category:** fibre-arts  
**Entries uploaded:** 44  
**Status:** PUBLISHED  

## Entry breakdown

| Sub-category    | Count | Types                          |
|-----------------|-------|--------------------------------|
| felting         | 15    | 8 PATTERN, 7 TECHNIQUE         |
| spinning        | 8     | 7 TECHNIQUE, 1 READING         |
| weaving         | 8     | 3 PATTERN, 4 TECHNIQUE, 1 READING |
| natural-dyeing  | 7     | 6 TECHNIQUE, 1 READING         |
| macrame         | 4     | 4 PATTERN                      |
| rug-making      | 2     | 2 TECHNIQUE                    |
| **Total**       | **44**|                                |

## Slugs published

### Felting (15)
- needle-felted-cactus-set
- needle-felted-owl
- wet-felted-wall-hanging
- needle-felted-fox
- cobweb-felt-technique
- resist-felting-a-slipper-form
- wet-felted-clutch-bag
- needle-felting-on-fabric
- wet-felted-brooch
- layered-colour-blending-wet-felting
- wet-felted-small-rug
- needle-felting-fine-detail
- needle-felted-whale
- needle-felted-landscape-triptych
- wet-felted-nuno-scarf-on-silk

### Spinning (8)
- chained-plying-wheel-technique
- scouring-a-raw-fleece
- spinning-art-yarn-thick-thin
- drum-carder-colour-blending
- andean-plying-technique
- spinning-flax-linen-top
- calculating-handspun-yardage
- spinning-cotton-on-supported-spindle

### Weaving (8)
- card-weaving-four-hole-basics
- clasped-weft-on-rigid-heddle
- tapestry-butterfly-bobbin
- frame-loom-tapestry-wall-hanging
- rigid-heddle-scarf-with-pickup
- four-shaft-twill-scarf
- colour-planning-for-weavers
- frame-loom-geometric-tapestry

### Natural dyeing (7)
- copper-mordant-after-bath
- dyeing-with-oak-galls
- dyeing-with-chamomile-yellow
- dyeing-with-indigo-on-cotton
- contact-printing-on-silk
- dyeing-with-blackberries
- natural-dye-mordant-overview

### Macrame (4)
- macrame-plant-hanger-simple
- macrame-wall-hanging-diamonds
- macrame-shelf-basic
- macrame-belt

### Rug-making (2)
- rya-knot-shaggy-texture
- locker-hook-rug-basics

## Voice-check results

| Outcome  | Count |
|----------|-------|
| Clean    | 29    |
| Warnings | 15    |
| Errors   | 0     |

**2 errors fixed before upload:**
1. `spinning-cotton-on-supported-spindle` — banned phrase "fundamentally" in excerpt (changed to "quite different")
2. `tapestry-butterfly-bobbin` — banned phrase pattern "a tapestry" caught "into a tapestry shed" in excerpt (changed to "into the tapestry shed")

**15 warnings (false positives, not fixed):**
- brand-trademark: "anchor" caught as brand name in macramé entries where it means "anchor cord" (the filler cord)
- brand-trademark: "target" caught as brand name in weaving entries where it means "target clasp-point"
- tricolon: three-item lists in excerpts and body (stylistically acceptable for technique-type entries)

**3 JSON issues fixed from pre-compaction session:**
- `frame-loom-tapestry-wall-hanging` — step heading string unterminated (trailing `'`)
- `tapestry-butterfly-bobbin` — two step headings with same issue
- `clasped-weft-on-rigid-heddle` — one step heading with same issue

## Tool slug substitutions made

Several tool slugs written in briefs did not match DB records. Corrected before upload:

| Brief slug       | DB slug used          |
|------------------|-----------------------|
| `floor-loom`     | `floor-loom-4-shaft`  |
| `dye-pot`        | `dye-pot-stainless`   |
| `kitchen-scales` | `digital-scales`      |
| `rubber-gloves`  | `dyeing-gloves-long`  |
| `scissors`       | `craft-scissors`      |
| `pickup-stick`   | removed (no DB record) |
| `metal-ring`     | removed (no DB record) |
| `wooden-dowel`   | removed (no DB record) |

## Running totals after this batch

| Sub-category   | Before | After |
|----------------|--------|-------|
| felting        | 26     | 41    |
| spinning       | 16     | 24    |
| weaving        | 17     | 25    |
| natural-dyeing | 10     | 17    |
| macrame        | 10     | 14    |
| rug-making     | 4      | 6     |
| **Total**      | **83** | **127** |
