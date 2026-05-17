# Baking bulk-006 — autopilot report

**Date:** 2026-05-18  
**Session type:** autopilot-queue (resumed across two context windows)  
**Entries published:** 40  
**Baking total:** 308 → 348

---

## Sub-category breakdown

| Sub-category | Count |
|---|---|
| cakes | 19 |
| bread | 7 |
| biscuits | 6 |
| pies | 3 |
| pastries | 3 |
| scones | 2 |
| **Total** | **40** |

## Difficulty split

Approximately 20 BEGINNER / 18 INTERMEDIATE / 2 ADVANCED.

ADVANCED entries: `pithivier-almond`, `galette-des-rois`.

---

## Entries published

**Bread (7):** soda-bread-white, bara-brith, banana-bread-vegan, pumpkin-bread-american, focaccia-tomato-olive, english-muffins-griddle, hot-cross-buns-chocolate

**Cakes (19):** french-apple-cake, marble-cake, no-bake-lemon-cheesecake, no-bake-chocolate-cheesecake, date-squares, blondies, flapjacks-golden-syrup, tiffin, rocky-road-slice, lemon-blueberry-traybake, cherry-bakewell-traybake, sticky-toffee-pudding-cake, devils-food-cake, swiss-roll-jam-cream, lemon-meringue-roulade, baked-vanilla-cheesecake, banoffee-cheesecake, lemon-drizzle-cake, snowball-cookies

**Biscuits (6):** chocolate-chip-cookies, digestives-wholemeal, easter-biscuits-currant, biscotti-almond, cornish-fairings, snowball-cookies

**Pies (3):** american-apple-pie, manchester-tart, raspberry-frangipane-tart

**Pastries (3):** apple-turnovers-puff, pithivier-almond, galette-des-rois

**Scones (2):** fruit-scones-sultana, cheese-scones-cheddar

---

## Voice-check fixes applied

### 1. `attrs.slug` → `attrs.termSlug` (all 40 files)

Root cause: every `glossaryTooltip` mark in the batch used `"attrs": { "slug": "..." }` but `voice-check-lib.ts` reads `mark.attrs.termSlug`. All 40 files failed glossary-coverage with "registered but never used inline." Fixed via a PowerShell bulk replace across the entire briefs directory.

### 2. BOM stripped (all 40 files)

The PowerShell replacement wrote files as UTF-8 with BOM. `voice-check.ts` uses Node's `JSON.parse` which chokes on the BOM preamble byte. Rewritten with `UTF8Encoding($false)`.

### 3. Malformed content arrays (8 session-1 files)

Files: banoffee-cheesecake, basic-white-sandwich-loaf, blondies, chocolate-chip-cookies, cornish-fairings, digestives-wholemeal, flapjacks-golden-syrup, tiffin.

Cause: in paragraphs with an inline glossaryTooltip, the content was written as a single malformed object with embedded sub-objects rather than three separate array elements. Each was rewritten as the correct three-element array:
```json
[
  { "type": "text", "text": "...prefix " },
  { "type": "text", "marks": [{ "type": "glossaryTooltip", "attrs": { "termSlug": "..." } }], "text": "term" },
  { "type": "text", "text": " suffix..." }
]
```

### 4. Em-dash pairs (22 files)

Files with 2+ em-dashes in one paragraph (mostly `sourceNotes`, a few body paragraphs):
- Bibliography entries using `— note` format: replaced with colon (`: note`)
- Parenthetical appositives `X — detail — Y`: converted to `X (detail) Y`
- Body prose mid-sentence pairs (bara-brith, focaccia, hot-cross-buns, lemon-drizzle, rocky-road, sticky-toffee): converted to parentheses

---

## Tricolon warnings (not blocking)

5 files had tricolon warnings (warnings only, do not block upload): cheese-scones-cheddar, focaccia-tomato-olive, galette-des-rois, hot-cross-buns-chocolate, pithivier-almond. Left as-is per the warnings-don't-block policy.

---

## Notes for future batches

- **Pre-scan for `attrs.slug` vs `attrs.termSlug`** before running voice-check — this class of error is invisible until the coverage check runs.
- **Pre-scan for em-dash pairs in sourceNotes** before voice-check (as recommended after bulk-002). The bibliography `— note` pattern is a recurring failure mode.
- **Content array format**: when drafting inline glossaryTooltip marks, always write 3 separate objects in the content array; never embed sub-objects inside a single text node's braces.
