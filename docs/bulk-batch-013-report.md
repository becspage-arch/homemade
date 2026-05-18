# Cooking bulk-batch-013 report

**Date:** 2026-05-18  
**Session type:** Autopilot-queue cron (context-resumed continuation)  
**Model:** claude-sonnet-4-6  
**Starting count:** 542 PUBLISHED  
**Ending count:** 582 PUBLISHED  
**Batch size:** 40 recipes  

## Cuisine spread

| Cuisine | Count | Slugs |
|---|---:|---|
| british | 40 | all entries |

Theme: classical and traditional British cooking. Gravies, sauces, condiments, pies, braises, stews, broths, offal, pork, fish, Christmas accompaniments, regional dishes.

## Difficulty breakdown

| Difficulty | Count |
|---|---:|
| BEGINNER | 36 |
| INTERMEDIATE | 4 |

INTERMEDIATE: steak-and-kidney-pie (hot-water crust pastry), steak-and-mushroom-pie (puff pastry lid + braised filling), oxtail-stew (4-hour braise requiring careful fat skimming), roast-rack-of-lamb (precise temperature/timing).

## Voice-check

- **First pass clean:** ~12 of 40
- **Issues fixed before final upload:**
  - Em-dash parenthetical pairs (— X —) → parentheses or rewritten in 15 files: onion-gravy, mint-sauce, boulangere-potatoes, red-wine-gravy, chicken-and-leek-pie, vegan-cottage-pie, welsh-cawl, cock-a-leekie, goujons, scampi, devilled-mackerel, chestnut-and-sausagemeat-stuffing, roast-spatchcock-chicken, pigs-in-blankets, stovies
  - Banned phrase "genuinely" → fixed in onion-gravy, potted-shrimp
  - Banned phrase "essentially" → fixed in horseradish-cream, gammon-with-parsley-sauce, potted-shrimp
  - servings-yield conflict (both `servings` and `yieldDescription` set) → nulled `yieldDescription` for portion-count recipes (apple-sauce, horseradish-cream); nulled `servings` for discrete-item recipes (devilled-eggs, potted-shrimp, pigs-in-blankets, glamorgan-sausages)
  - Season values lowercase → uppercased in mint-sauce, apple-sauce, braised-red-cabbage, beef-and-guinness-stew, honey-roast-carrots-and-parsnips, oxtail-stew, scotch-broth, welsh-cawl
- **All 40 uploaded at 0 errors (warnings only, non-blocking)**

## New ingredients seeded (batch-013 additions)

31 new ingredients added to `packages/db/scripts/data/ingredients.ts` and seeded:

| Slug | Name | Category |
|---|---|---|
| braising-steak | Braising steak | meat |
| oxtail | Oxtail | meat |
| pork-chop | Pork chop | meat |
| rack-of-lamb | Rack of lamb | meat |
| whole-chicken | Whole chicken | meat |
| lamb-kidneys | Lamb kidneys | meat |
| calves-liver | Calves' liver | meat |
| gammon-joint | Gammon joint | meat |
| gammon-steak | Gammon steak | meat |
| sausagemeat | Pork sausagemeat | meat |
| chipolata-sausages | Chipolata sausages | meat |
| leftover-roast-beef | Leftover roast beef | meat |
| langoustine-tails | Langoustine tails | fish |
| brown-shrimp | Brown shrimp | fish |
| mackerel-fillets | Mackerel fillets | fish |
| caerphilly-cheese | Caerphilly cheese | dairy |
| lentils-red | Red lentils | pulse |
| apple | Apple | fruit |
| lemon-juice | Lemon juice | fruit |
| smoked-paprika | Smoked paprika | spice |
| cayenne-pepper | Cayenne pepper | spice |
| mace-ground | Ground mace | spice |
| mustard-powder | Mustard powder | spice |
| nutmeg | Nutmeg | spice |
| peppercorns-black | Black peppercorns | spice |
| breadcrumbs-panko | Panko breadcrumbs | grain |
| breadcrumbs-fresh | Fresh breadcrumbs | grain |
| bread-white | White bread | grain |
| guinness | Guinness | alcohol |
| dry-cider | Dry cider | alcohol |
| dry-white-wine | Dry white wine | alcohol |

## Tool slug corrections

| Wrong slug used in draft | Correct slug in DB | Affected recipes |
|---|---|---|
| frying-pan | frying-pan-26 | devilled-kidneys, liver-and-onions, pork-chops-with-cider-and-apples, pork-chops-with-mustard-cream-sauce, goujons, scampi, glamorgan-sausages |
| roasting-tin | roasting-pan | roast-rack-of-lamb, roast-spatchcock-chicken, pigs-in-blankets |
| kitchen-shears | kitchen-scissors | roast-spatchcock-chicken |

## Ingredient slug corrections

| Wrong slug | Correct slug | Affected recipe |
|---|---|---|
| chestnuts-cooked | chestnut-cooked | chestnut-and-sausagemeat-stuffing |

## Notable recipes

- **Welsh cawl** — national dish of Wales, two-course tradition documented in Bobby Freeman's First Catch Your Peacock (1980)
- **Cock-a-leekie** — Scottish broth documented from the sixteenth century, prune option preserved per historical record
- **Potted shrimp** — Hannah Glasse 1747; Morecambe Bay provenance; "shrimp" retained as the correct British name for Crangon crangon (voice checker flagged it as Americanism but it is the standard British term)
- **Devilled kidneys** — Victorian breakfast dish; practically extinct in modern British cooking; good gateway recipe for offal
- **Glamorgan sausages** — Welsh vegetarian sausages made with Caerphilly, breadcrumbs, and leek; added caerphilly-cheese to ingredient master

## Cumulative cooking cuisine distribution (post batch-013)

| Cuisine | Approx count |
|---|---:|
| british | ~269 |
| american | ~57 |
| italian | ~52 |
| french | ~34 |
| angloIndian | ~21 |
| middleEastern | ~15 |
| greek | ~14 |
| easternEuropean | ~15 |
| caribbean | ~11 |
| northAfrican | ~15 |
| spanish | ~11 |

British cuisine is now heavily represented. Next cooking batch should target under-represented v1 cuisines: spanish (paella, gazpacho, tortilla española), greek (spanakopita, souvlaki), easternEuropean (bigos, goulash, beef stroganoff), or french (classics not yet covered).
