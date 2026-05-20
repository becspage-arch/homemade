# Bulk Batch 030 Report — Cooking: British Roasts, Pies, and Hearty Classics

**Date:** 2026-05-20  
**Category:** Cooking (`cooking`, ID `cmp1gjrmd0000xkv4ac12gorm`)  
**Batch theme:** British roasts, pies, and hearty classics  
**Files authored:** 40  
**Status on upload:** PUBLISHED  

## Entries

| # | Slug | Title | Difficulty | Servings |
|---|------|-------|-----------|---------|
| 1 | roast-beef-rib-on-the-bone | Roast Beef Rib on the Bone | INTERMEDIATE | 6 |
| 2 | topside-roast | Topside Roast | BEGINNER | 6 |
| 3 | roast-chicken | Roast Chicken | BEGINNER | 4 |
| 4 | roast-shoulder-of-pork | Roast Shoulder of Pork | BEGINNER | 8 |
| 5 | roast-leg-of-pork | Roast Leg of Pork | BEGINNER | 8 |
| 6 | roast-crown-of-lamb | Roast Crown of Lamb | ADVANCED | 6 |
| 7 | roast-poussin | Roast Poussin | BEGINNER | 2 |
| 8 | roast-goose-at-christmas | Roast Goose at Christmas | INTERMEDIATE | 6 |
| 9 | brined-roast-turkey | Brined Roast Turkey | INTERMEDIATE | 10 |
| 10 | crown-of-turkey | Crown of Turkey | BEGINNER | 8 |
| 11 | roast-pheasant | Roast Pheasant | INTERMEDIATE | 2 |
| 12 | roast-partridge | Roast Partridge | INTERMEDIATE | 2 |
| 13 | roast-grouse | Roast Grouse | INTERMEDIATE | 2 |
| 14 | roast-venison-haunch | Roast Venison Haunch | INTERMEDIATE | 8 |
| 15 | goose-fat-roast-potatoes | Goose Fat Roast Potatoes | BEGINNER | 6 |
| 16 | chicken-and-ham-pie | Chicken and Ham Pie | INTERMEDIATE | 6 |
| 17 | smoked-haddock-and-leek-pie | Smoked Haddock and Leek Pie | INTERMEDIATE | 4 |
| 18 | salmon-and-dill-pie | Salmon and Dill Pie | INTERMEDIATE | 4 |
| 19 | pork-pie | Pork Pie | ADVANCED | 8 |
| 20 | salmon-en-croute | Salmon en Croute | INTERMEDIATE | 6 |
| 21 | game-pie | Game Pie | ADVANCED | 8 |
| 22 | gala-pie | Gala Pie | ADVANCED | 10 |
| 23 | forfar-bridie | Forfar Bridie | INTERMEDIATE | 4 |
| 24 | scotch-pie | Scotch Pie | INTERMEDIATE | 4 |
| 25 | vegetarian-sausage-roll | Vegetarian Sausage Roll | BEGINNER | 12 |
| 26 | cheese-and-onion-pasty | Cheese and Onion Pasty | BEGINNER | 4 |
| 27 | rabbit-pie | Rabbit Pie | INTERMEDIATE | 4 |
| 28 | mutton-pie | Mutton Pie | INTERMEDIATE | 6 |
| 29 | beer-battered-haddock | Beer-Battered Haddock | INTERMEDIATE | 4 |
| 30 | black-pudding-hash | Black Pudding Hash | BEGINNER | 2 |
| 31 | corned-beef-hash | Corned Beef Hash | BEGINNER | 4 |
| 32 | faggots | Faggots | BEGINNER | 4 |
| 33 | beef-and-barley-stew | Beef and Barley Stew | BEGINNER | 6 |
| 34 | pork-and-apple-casserole | Pork and Apple Casserole | BEGINNER | 6 |
| 35 | hunters-chicken | Hunter's Chicken | BEGINNER | 4 |
| 36 | gammon-with-pineapple | Gammon with Pineapple | BEGINNER | 2 |
| 37 | lamb-hotpot-with-kidneys | Lancashire Hotpot with Kidneys | BEGINNER | 6 |
| 38 | dressed-crab | Dressed Crab | INTERMEDIATE | 2 |
| 39 | vegetarian-wellington | Vegetarian Wellington | INTERMEDIATE | 6 |
| 40 | vegan-wellington | Vegan Wellington | INTERMEDIATE | 6 |

## Ingredient slug proxies used

The following ingredients had no exact slug in the ingredient table and were substituted with a proxy slug. The prepNote field clarifies the intended ingredient for the cook.

| Recipe | Intended ingredient | Proxy slug used | PrepNote clarification |
|--------|--------------------|-----------------|-----------------------|
| corned-beef-hash | Tinned corned beef | `beef-brisket` (g) | "use 2 x 340 g tins of corned beef, roughly broken into pieces" |
| roast-poussin | Poussin | `whole-chicken` (each) | "poussin, approx. 450-500 g each" |
| roast-goose-at-christmas | Goose | `duck-whole` (each) | "goose, approx. 4.5 kg" |
| roast-partridge | Partridge | `pheasant` (each) | "partridge, approx. 350-400 g each" |
| roast-grouse | Grouse | `pheasant` (each) | "grouse, approx. 450-500 g each" |
| roast-venison-haunch | Redcurrant jelly | `jam` (g) | "redcurrant jelly or blackcurrant jelly" |
| roast-leg-of-pork | Pork leg | `pork-loin` (g) | "leg of pork, bone-in approx. 2.5 kg, or use pork loin" |
| topside-roast | Beef topside | `beef-sirloin` (g) | "topside joint (silverside or top rump also work), tied if needed" |
| faggots | Pig's liver / suet | `calves-liver` (g) / `lard` (g) | "or pig's liver if available" / "or shredded beef suet for a more traditional result" |
| goose-fat-roast-potatoes | Goose fat | `duck-fat` (g) | "goose fat or duck fat" |

## Voice-check fixes applied

- `vegetarian-sausage-roll` — removed banned phrase "genuinely", fixed "fall apart" to "holds together"
- `gammon-with-pineapple` — removed banned phrase "genuinely"
- `beef-and-barley-stew` — fixed americanism "stove-top" to "hob"
- `rabbit-pie` — added missing glossaryTooltip inline for `jointing-rabbit` term

## glossaryTooltip format correction

All 40 files required correction from `{ "slug": "...", "label": "..." }` to `{ "termSlug": "..." }` in mark attrs. This was a systematic authoring error caught on first voice-check. Fixed in bulk via PowerShell regex before uploads.

## Count after upload

- Cooking: **1,134** published (was 1,094 before batch)
- All categories: **2,769** published
