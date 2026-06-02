# Fibre-arts bulk-014 batch report
**Date:** 2026-06-02
**Model:** claude-sonnet-4-6
**Category:** fibre-arts
**Entries published:** 40 (476 → 516)

## Sub-category breakdown

| Sub-category   | Before | Added | After |
|----------------|--------|-------|-------|
| felting        | 143    | 12    | 155   |
| spinning       | 96     | 8     | 104   |
| weaving        | 94     | 8     | 102   |
| natural-dyeing | 69     | 6     | 75    |
| macramé        | 49     | 4     | 53    |
| rug-making     | 25     | 2     | 27    |
| **Total**      | **476**| **40**| **516**|

## Entries

### Felting (12)
- needle-felted-seal (BEGINNER PATTERN)
- needle-felted-bat (BEGINNER PATTERN, AUTUMN)
- needle-felted-newt (BEGINNER PATTERN)
- needle-felted-pony (INTERMEDIATE PATTERN)
- needle-felted-stag-beetle (INTERMEDIATE PATTERN)
- needle-felted-peacock (INTERMEDIATE PATTERN)
- wet-felted-oven-glove (INTERMEDIATE PATTERN)
- wet-felted-water-bottle-carrier (INTERMEDIATE PATTERN)
- wet-felted-pot-stand (BEGINNER PATTERN)
- felting-gradient-roving-blend (INTERMEDIATE TECHNIQUE)
- nuno-felted-pocket-wrap (INTERMEDIATE PATTERN)
- felting-with-fine-merino-tops (BEGINNER TECHNIQUE)

### Spinning (8)
- spinning-rambouillet-wool (INTERMEDIATE TECHNIQUE)
- spinning-a-cabled-yarn (ADVANCED TECHNIQUE)
- spinning-masham-wool (INTERMEDIATE TECHNIQUE)
- spinning-border-leicester-wool (INTERMEDIATE TECHNIQUE)
- spinning-silk-caps (ADVANCED TECHNIQUE)
- spinning-from-cloud-batt (BEGINNER TECHNIQUE)
- washing-and-blocking-a-handspun-skein (BEGINNER TECHNIQUE)
- spinning-for-tapestry-weft (INTERMEDIATE TECHNIQUE)

### Weaving (8)
- woven-market-bag-rigid-heddle (BEGINNER PATTERN)
- inkle-woven-bookmark-set (BEGINNER PATTERN)
- four-shaft-point-twill-sampler (INTERMEDIATE TECHNIQUE)
- tapestry-eccentric-weft-technique (INTERMEDIATE TECHNIQUE)
- woven-hand-towel-floor-loom (INTERMEDIATE PATTERN)
- woven-window-warp-hanging (BEGINNER PATTERN)
- four-shaft-rosepath-weave (INTERMEDIATE TECHNIQUE)
- rigid-heddle-painted-warp-scarf (INTERMEDIATE PATTERN)

### Natural dyeing (6)
- dyeing-with-dock-leaves (BEGINNER TECHNIQUE)
- dyeing-with-fennel (BEGINNER TECHNIQUE, SUMMER)
- dyeing-with-bog-myrtle (INTERMEDIATE TECHNIQUE, SUMMER)
- dyeing-with-comfrey-leaves (BEGINNER TECHNIQUE)
- dyeing-with-hollyhock (BEGINNER TECHNIQUE, SUMMER)
- iron-water-mordant-method (INTERMEDIATE TECHNIQUE)

### Macramé (4)
- macrame-market-bag (BEGINNER PATTERN)
- macrame-necklace-set (BEGINNER PATTERN)
- macrame-wall-pocket-organiser (INTERMEDIATE PATTERN)
- macrame-ladder-shelf (INTERMEDIATE PATTERN)

### Rug-making (2)
- hooked-rug-landscape-panel (INTERMEDIATE PATTERN)
- rag-rug-coiled-on-frame-loom (BEGINNER PATTERN)

## Voice-check summary
- 32 files exit 0 (clean)
- 8 files exit 1 (warnings only, all accepted):
  - needle-felted-pony — tricolon warning
  - needle-felted-stag-beetle — tricolon warning (opening paragraph list)
  - dyeing-with-bog-myrtle — tricolon warning (mordant list)
  - dyeing-with-comfrey-leaves — tricolon warning
  - dyeing-with-dock-leaves — tricolon warning
  - dyeing-with-fennel — tricolon warning
  - dyeing-with-hollyhock — safety-block warning (infoPanel body)
  - felting-with-fine-merino-tops — tricolon warning (excerpt)
- 0 hard errors at upload

## Voice-check fixes applied during authoring
Multiple grade-level errors in opening paragraphs and troubleshooter text — simplified sentence structure and vocabulary across 9 entries (spinning-border-leicester-wool, spinning-masham-wool, four-shaft-rosepath-weave, hooked-rug-landscape-panel, dyeing-with-hollyhock, felting-with-fine-merino-tops, needle-felted-stag-beetle, rigid-heddle-painted-warp-scarf, woven-market-bag-rigid-heddle).

Banned phrase "a tapestry" in tapestry-eccentric-weft-technique — changed "a tapestry weaver" to "tapestry weavers".

JSON structure errors in heading text strings (trailing apostrophe pattern) — bulk-repaired via script before voice-check.

## Hero fill result
- pexels: 38
- unsplash: 1
- wikimedia: 1
- flux-schnell: 0
- failed: 0

## QC result
- 40 processed, 39 pass, 1 still_blocked
- 0 upload failures
- rag-rug-coiled-on-frame-loom: grade-level-strict block; qc-fix could not auto-resolve; hourly fix-batch routine will pick up on next fire

## Notes
- 16 new glossary terms created (first appearances across these categories: gradient, merino-tops, micron-count, point-threading, rosepath, tabby-binding, cabled-yarn, lustre-wool, matte-finish, cloud-batt, pre-drafting, woollen-yarn, dual-coat-fleece, silk-caps, degumming, painted-warp, and others)
- Relevance queue written to packages/db/docs/image-relevance-queue-fibre-arts-bulk-014.json
- Tool slugs inkle-loom and tapestry-needle are referenced in briefs; if upload rejected tool-not-found errors, check master Tool table
- Natural dyeing cross-link subTutorialCards deferred per authoring prompt convention for missing Garden tutorials
