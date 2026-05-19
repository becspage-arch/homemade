# Fibre arts bulk-001 batch report

**Date:** 2026-05-19  
**Session type:** autopilot-queue  
**Entries published:** 41 (all CREATED)  
**Upload failures:** 0

---

## Sub-category breakdown

| Sub-category   | Count | Types                                              |
|----------------|-------|----------------------------------------------------|
| felting        | 13    | TECHNIQUE ×8, PATTERN ×4, READING ×1              |
| spinning       | 8     | TECHNIQUE ×7, READING ×1                          |
| weaving        | 8     | TECHNIQUE ×3, PATTERN ×3, READING ×2              |
| natural-dyeing | 6     | TECHNIQUE ×6                                      |
| macramé        | 4     | TECHNIQUE ×4                                      |
| rug-making     | 2     | TECHNIQUE ×1, PATTERN ×1                          |
| **Total**      | **41**|                                                   |

---

## Difficulty mix

- BEGINNER: 33
- INTERMEDIATE: 8
- ADVANCED: 0

---

## Slugs published

### Felting (13)
- `needle-felting-a-base-shape` (TECHNIQUE)
- `needle-felted-robin` (PATTERN)
- `needle-felted-flower-corsage` (PATTERN)
- `needle-felted-landscape-panel` (PATTERN)
- `felting-needle-safety-and-selection` (READING)
- `how-to-choose-wool-for-felting` (TECHNIQUE)
- `wet-felting-a-flat-panel` (TECHNIQUE)
- `wet-felted-merino-bowl` (TECHNIQUE)
- `wet-felted-pebble-set` (PATTERN)
- `nuno-felting-a-silk-scarf` (TECHNIQUE)
- `felting-over-a-resist` (TECHNIQUE)
- `felted-merino-slippers` (PATTERN)
- `wet-felted-hat-on-a-hat-block` (TECHNIQUE)

### Spinning (8)
- `spinning-on-a-top-whorl-drop-spindle` (TECHNIQUE)
- `plying-a-two-ply-yarn-on-a-spindle` (TECHNIQUE)
- `carding-fleece-into-rolags` (TECHNIQUE)
- `the-short-forward-draw` (TECHNIQUE)
- `setting-the-twist-skeining-and-finishing` (TECHNIQUE)
- `spinning-a-dk-yarn-on-the-wheel` (TECHNIQUE)
- `the-long-draw-on-a-spinning-wheel` (TECHNIQUE)
- `how-to-choose-a-spinning-wheel` (READING)

### Weaving (8)
- `warping-a-frame-loom` (TECHNIQUE)
- `woven-coaster-set-plain-weave` (PATTERN)
- `warping-a-rigid-heddle-loom` (TECHNIQUE)
- `twill-weave-on-a-rigid-heddle` (TECHNIQUE)
- `tapestry-weave-diamond-pattern` (PATTERN)
- `inkle-woven-belt` (PATTERN)
- `how-to-read-a-weaving-draft` (READING)
- `overshot-weave-basics` (READING)

### Natural dyeing (6)
- `alum-pre-mordant-for-wool` (TECHNIQUE)
- `dyeing-with-onion-skins` (TECHNIQUE)
- `dyeing-with-weld-for-yellow` (TECHNIQUE, SUMMER)
- `dyeing-with-madder-for-red` (TECHNIQUE)
- `indigo-vat-dyeing-basics` (TECHNIQUE)
- `eco-printing-with-leaves` (TECHNIQUE, AUTUMN)

### Macramé (4)
- `larks-head-knot-macrame` (TECHNIQUE)
- `square-knot-macrame` (TECHNIQUE)
- `double-half-hitch-macrame` (TECHNIQUE)
- `overhand-knot-macrame` (TECHNIQUE)

### Rug-making (2)
- `traditional-rug-hooking-basics` (TECHNIQUE)
- `simple-latch-hook-rug` (PATTERN)

---

## Special node types used

- `weavingDraft` blocks: `how-to-read-a-weaving-draft` (plain weave 2-shaft example), `overshot-weave-basics` (4-shaft overshot draft)
- `macrameKnot` blocks: `larks-head-knot-macrame` (standard + reverse), `square-knot-macrame`, `double-half-hitch-macrame`, `overhand-knot-macrame` (single + gathering variant)

---

## Voice-check fix log

Two drafting context windows. Voice-check run after each.

**Round 1 fixes (batch-applied via Node.js):**
- Em-dashes in step headings: "Step N — Description" pattern across all 41 files → "Step N: Description". 132 replacements across 31 files.
- Safety infoPanel body > 25 words: 14 warning infoPanels condensed to ≤25 words.
- Glossary coverage (square-knot-macrame): tooltip for "working-cord" removed — term was not in that entry's glossaryTerms.

**Round 2 fixes (targeted per-file):**
- `inkle-woven-belt`: "a tapestry needle" → "a blunt darning needle" (banned phrase "a tapestry" substring)
- `woven-coaster-set-plain-weave`: "with a tapestry needle" → "using a blunt needle" (same)
- `tapestry-weave-diamond-pattern`: "using a tapestry needle" → "using a blunt needle" (same)
- `needle-felted-robin`: "genuinely round and dense" → "round and dense" (banned phrase "genuinely")
- `needle-felting-a-base-shape`: added "rolag" inline with glossaryTooltip mark to intro paragraph (term registered but unused)
- `warping-a-frame-loom`: added "weft" inline with glossaryTooltip mark to Step 2 paragraph (term registered but unused)

**Final voice-check result:** 25 clean, 16 warnings-only, 0 errors.

---

## Library count

Fibre arts: 0 → 41 PUBLISHED (first batch — category now exceeds the 10-entry visibility threshold).
