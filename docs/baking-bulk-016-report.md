# Baking bulk-016 batch report

**Date:** 2026-05-28  
**Session type:** autopilot-queue  
**Model:** Sonnet

## Counts

- 40 entries PUBLISHED
- Sub-categories: bread ×11, pastries ×13, biscuits ×9, pies ×4, cakes ×3
- Difficulty: BEGINNER ×15, INTERMEDIATE ×17, ADVANCED ×8
- Dietary: vegetarian throughout; vegan ×2 (vegan-flapjacks, banana-fritters), dairyFree ×3, glutenFree ×2 (gluten-free-chocolate-cake, gluten-free-chocolate-chip-cookies)
- Baking 592 → 632 PUBLISHED

## Slugs

bread: challah-round-rosh-hashanah, schiacciata-alluva, pane-pugliese, treacle-soda-bread, boston-brown-bread, sourdough-discard-waffles, pain-au-lait, welsh-oven-bottom-muffins, roggenbrot, taiwanese-pineapple-bun, krantz-cake

pastries: croquembouche, cherry-strudel, danish-pastry-raspberry, banbury-cake, baklava-almond, berliner-jam-doughnut, apple-fritters, banana-fritters, kataifi-birds-nest, paczki-polish-doughnut, doughnut-holes, zeppole-italian, funnel-cake

biscuits: peanut-butter-brownies, cookie-bars-chocolate-chip, dream-bars-toffee-coconut, vegan-flapjacks, cornish-biscuits-currant, gingerbread-house, iced-biscuits-decorated, gluten-free-chocolate-chip-cookies, chocolate-crackle-rice-krispie

pies: crostata-di-ricotta, crostata-di-nutella, apple-crumble-pie, hand-pies-sour-cherry

cakes: cassata-siciliana, wedding-fruit-cake, gluten-free-chocolate-cake

## Upload fixes required

**ingredientsList format (40 files):** The upload validator now checks `attrs.items[]` (not `content[]`). All 40 brief files used the old format. Converted via a Node.js script: `ingredientItem` children in `content[]` moved to `attrs.items[]` with `ingredientSlug` (renamed from `slug`), `isOptional: false`, `groupLabel: null` (or heading text for multi-section recipes). This is a new format requirement added after batch 015.

**Season enum uppercase (11 files):** Used lowercase `autumn`, `spring`, etc. Fixed to `AUTUMN`, `SPRING`, `WINTER`, `SUMMER` — the Prisma enum expects uppercase. Files: apple-crumble-pie, apple-fritters, cassata-siciliana, cherry-strudel, crostata-di-ricotta, gingerbread-house, hand-pies-sour-cherry, paczki-polish-doughnut, schiacciata-alluva, wedding-fruit-cake, zeppole-italian.

**Ingredient slugs (3 files):** `apples`→`apple` (apple-crumble-pie, apple-fritters), `bananas`→`banana` (banana-fritters).

## Voice-check fixes

**Grade-level errors (6 files):** Opening paragraphs above grade 12.0 blocked upload. Simplified by breaking compound sentences:
- baklava-almond (grade 14.1)
- cherry-strudel (grade 14.9)
- cassata-siciliana (grade 13.7)
- croquembouche (grade 12.2)
- crostata-di-ricotta (grade 12.5)
- gluten-free-chocolate-chip-cookies (grade 12.3)

**Warnings (non-blocking):** tricolon flags in ~10 files; "molasses" americanism in boston-brown-bread and wedding-fruit-cake (correct for the recipes); "Bird's" brand-trademark false positive in kataifi-birds-nest; "fall apart" americanism false positive in cookie-bars.

## Notable entries

- **roggenbrot** (ADVANCED, european) — 80% hydration, LEVAIN preFermentType, levainPercent: 30, levainBuildMinutes: 480. Dark rye loaf baked in a loaf tin. Represents the rye/sourdough end of the bread spectrum.
- **krantz-cake** (ADVANCED, middleEastern) — Rolled and twisted chocolate-filled enriched dough. laminationRests: null, but complex shaping technique.
- **cassata-siciliana** (ADVANCED, italian) — Two-day project: sponge + ricotta filling day one; marzipan + fondant glaze day two. Spring seasonal.
- **wedding-fruit-cake** (ADVANCED, british) — 3.5h bake at 150°C, winter seasonal, makeAhead months ahead. Largest cookMinutes in the batch (210).
- **gingerbread-house** (ADVANCED, european) — Royal icing mortar, decoratingTechnique: "royal icing and confectionery". Winter seasonal.
- **croquembouche** (ADVANCED, french) — Choux + crème pâtissière + caramel assembly. Glucose syrup, sugar thermometer.
- **paczki-polish-doughnut** (ADVANCED, european) — 5 egg yolks only, rum-dark, winter seasonal.
- **danish-pastry-raspberry** (ADVANCED, european) — laminationFolds: 3, laminationRests: 3. True laminated pastry with cream cheese filling.
- **cherry-strudel** (ADVANCED, european) — Hand-stretched strudel dough; summer seasonal.
- **sourdough-discard-waffles** — Uses sourdough discard; waffle-iron tool; bakeTemperatureCelsius: null.
- **boston-brown-bread** — Steamed in pudding basin; bakeTemperatureCelsius: null.
- **chocolate-crackle-rice-krispie** — No-bake; bakeTemperatureCelsius: null.

## 0 upload failures
