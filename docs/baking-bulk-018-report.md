# Baking bulk-018 — batch report

**Date:** 2026-05-29
**Session:** autopilot-queue (primary routine)
**Model running:** Claude Sonnet 4.6 (claude-sonnet-4-6)
**Status:** 40 entries PUBLISHED
**Category count:** Baking 659 → 699

---

## Entries published

| # | Slug | Sub-category | Difficulty |
|---|------|--------------|-----------|
| 01 | cornbread-american | bread | BEGINNER |
| 02 | malt-loaf | bread | BEGINNER |
| 03 | rye-crispbread-swedish | bread | BEGINNER |
| 04 | milk-loaf-japanese-shokupan | bread | INTERMEDIATE |
| 05 | bagels-plain | bread | INTERMEDIATE |
| 06 | potato-farls-irish | bread | BEGINNER |
| 07 | tiger-bread-roll | bread | INTERMEDIATE |
| 08 | pumpernickel | bread | INTERMEDIATE |
| 09 | malted-bloomer | bread | INTERMEDIATE |
| 10 | caraway-rye-bread | bread | INTERMEDIATE |
| 11 | lemon-drizzle-traybake | cakes | BEGINNER |
| 12 | seed-cake | cakes | BEGINNER |
| 13 | parkin | cakes | BEGINNER |
| 14 | clementine-polenta-cake | cakes | BEGINNER |
| 15 | buttermilk-cake | cakes | INTERMEDIATE |
| 16 | yoghurt-cake | cakes | BEGINNER |
| 17 | almond-cake-spanish | cakes | BEGINNER |
| 18 | cannoli-siciliani | pastries | ADVANCED |
| 19 | churros-traditional | pastries | INTERMEDIATE |
| 20 | rugelach-cream-cheese | pastries | INTERMEDIATE |
| 21 | borek-cheese-spinach | pastries | INTERMEDIATE |
| 22 | choux-buns | pastries | INTERMEDIATE |
| 23 | apple-turnover | pastries | BEGINNER |
| 24 | almond-croissants | pastries | INTERMEDIATE |
| 25 | biscotti-almond-cranberry | biscuits | BEGINNER |
| 26 | amaretti-morbidi | biscuits | BEGINNER |
| 27 | lace-biscuits-oat | biscuits | INTERMEDIATE |
| 28 | jam-drops | biscuits | BEGINNER |
| 29 | alfajores | biscuits | INTERMEDIATE |
| 30 | kourambiedes | biscuits | BEGINNER |
| 31 | banoffee-pie | pies | BEGINNER |
| 32 | pork-pie-traditional | pies | ADVANCED |
| 33 | egg-custard-tart | pies | INTERMEDIATE |
| 34 | frangipane-raspberry-tart | pies | INTERMEDIATE |
| 35 | cheese-and-chive-scones | scones | BEGINNER |
| 36 | cream-scones-devonshire | scones | BEGINNER |
| 37 | nougat-italian-soft | sweets-confectionery | ADVANCED |
| 38 | praline-almond-french | sweets-confectionery | INTERMEDIATE |
| 39 | butter-toffee-pulled | sweets-confectionery | ADVANCED |
| 40 | barley-sugar-boiled | sweets-confectionery | INTERMEDIATE |

## Difficulty mix

- BEGINNER: 18
- INTERMEDIATE: 18
- ADVANCED: 4 (cannoli-siciliani, pork-pie-traditional, nougat-italian-soft, butter-toffee-pulled)

## Sub-category coverage

| Sub-category | bulk-018 |
|---|---|
| bread | 10 |
| cakes | 7 |
| pastries | 7 |
| biscuits | 6 |
| pies | 4 |
| sweets-confectionery | 4 |
| scones | 2 |

Note: kourambiedes planned under pastries was reclassified to biscuits on authoring (correct classification for an almond shortbread drop).

---

## Voice-check errors and fixes

1 error across 1 file.

| File | Error | Fix |
|------|-------|-----|
| butter-toffee-pulled | `banned-phrase: "genuinely"` at body paragraph 0 | "is genuinely hot" → "is very hot throughout handling" |

---

## Upload fixes

1 fix applied before re-upload:

- **`egg` → `eggs` slug (21 files)** — the master ingredient table uses the plural slug `eggs` (not `egg`). First upload attempt surfaced the mismatch on `cornbread-american`; a batch `sed` corrected all 21 affected files before the full upload run. `egg-yolks` and `egg-whites` were unaffected (different string pattern).

0 upload failures. 0 entries dropped.

---

## Hand-off

Baking 659 → 699. Forty entries across all seven main sub-categories with an even BEGINNER/INTERMEDIATE split and four ADVANCED confectionery and pastry entries. One ingredient slug pattern (`egg` → `eggs`) added as a known fix — applies to any future batch that uses whole eggs.
