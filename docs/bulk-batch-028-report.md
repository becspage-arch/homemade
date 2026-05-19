# Cooking bulk-028 batch report

**Date:** 2026-05-19  
**Session:** autopilot-queue (context-overflow recovery — two sessions)  
**Category:** Cooking  
**Count:** 40 recipes PUBLISHED  
**Cooking total:** 1,033 → 1,065 (32 net new; 8 were updates to slugs that pre-existed from earlier batches)

---

## Slugs published

### Italian (10)
- arancini
- bistecca-alla-fiorentina
- bucatini-amatriciana
- calzone
- caponata
- chicken-piccata
- osso-buco-alla-milanese
- parmigiana-di-melanzane
- pizza-margherita
- pizza-napoletana

### American / Cajun / Southern (7)
- chili-con-carne
- clam-chowder-new-england
- dirty-rice
- fried-chicken
- fried-green-tomatoes
- gumbo-chicken-andouille
- mac-and-cheese-baked

### British (7)
- devilled-kidneys
- macaroni-cheese
- roast-rack-of-lamb
- scotch-broth
- steak-and-kidney-pudding
- vegetarian-shepherds-pie
- welsh-cawl

### Middle Eastern (6)
- baba-ghanoush
- fesenjan
- hummus-with-warm-pita
- lamb-shawarma
- mujaddara
- pilaf-rice *(foundational, side)*

### North African (5)
- bastilla-chicken
- chicken-tagine
- harissa-chicken
- lamb-tagine
- moroccan-chicken-preserved-lemon

### Caribbean (2)
- curried-goat
- oxtail-stew-caribbean

### French (1)
- galette-de-sarrasin

### Mediterranean (1)
- imam-bayildi

### Eastern European (1)
- pierogi-ruskie

---

## Voice-check and upload fixes

### Invalid mood flags (14 files)
Previous-session drafts used vocabulary not in the MOOD_FLAGS enum:
- `"weekend"` → `"slowSunday"` (devilled-kidneys, bistecca-alla-fiorentina, caponata, clam-chowder-new-england, fried-chicken, fried-green-tomatoes, galette-de-sarrasin, gumbo-chicken-andouille, osso-buco-alla-milanese, parmigiana-di-melanzane, baba-ghanoush)
- `"dinnerParty"` → `"party"` (roast-rack-of-lamb, caponata, osso-buco-alla-milanese, parmigiana-di-melanzane, hummus-with-warm-pita, baba-ghanoush)
- `"batchCook"` → `"mealPrep"` (scotch-broth)

### Invalid cuisine casing (2 files)
- `"middleeastern"` → `"middleEastern"` (hummus-with-warm-pita, baba-ghanoush)

### Invalid tool slug (1 file)
- `baking-dish` → `roasting-tin` (imam-bayildi — not in master tools table)

### Banned phrase "genuinely" (4 instances, 3 files)
- `caponata` excerpt: "genuinely improves" → "improves significantly"
- `fried-green-tomatoes` body: "must be genuinely unripe" → "must be fully unripe"
- `fried-green-tomatoes` troubleshooter: "Use genuinely unripe" → "Use fully unripe"
- `imam-bayildi` troubleshooter: "genuinely thick and concentrated" → "properly thick and concentrated"

### Glossary terms registered but not used inline → cleared (8 files)
Registered glossaryTerms without matching inline `glossaryTooltip` marks. Resolved by clearing the array rather than adding complex mark structures to the TipTap JSON:
- caponata (agrodolce), gumbo-chicken-andouille (holy-trinity), macaroni-cheese (bechamel, roux), osso-buco-alla-milanese (gremolata), pizza-napoletana (cornicione, autolysis), roast-rack-of-lamb (french-trimmed), scotch-broth (brunoise), steak-and-kidney-pudding (suet-pastry)

### servings / yieldDescription conflict (2 files)
- galette-de-sarrasin: `yieldDescription` set alongside `servings` → set to `null`
- pierogi-ruskie: `yieldDescription` set alongside `servings` → set to `null`

### Em-dash pair rewrites (~28 files)
All `— Y —` appositive pairs replaced with `(Y)` or restructured as a colon/comma. Applied extensively across body paragraphs, excerpts, and sourceNotes in the prior session and carried forward here.

---

## Upload result

40 / 40 uploaded as PUBLISHED. 0 failures on final pass.

Note: the 40 briefs were drafted across two context-overflow sessions. The first session wrote 27 files; this session wrote the remaining 13 and fixed all voice errors across all 40 before uploading. The `imam-bayildi` upload failed on the first pass due to an invalid tool slug (`baking-dish`); fixed and re-uploaded.
