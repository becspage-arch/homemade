# Baking bulk-004b — batch report

**Date:** 2026-05-17  
**Model:** claude-sonnet-4-6  
**Status:** All 50 entries uploaded PUBLISHED  
**Baking total (PUBLISHED):** 258 (was 208 after bulk-004)

This is the continuation batch for baking bulk-004. The parallel batch (`baking-bulk-004-report.md`) covered cake-decorating, sweets, pies, pastries, bread, cakes. This batch covers the remaining sub-categories.

---

## What was written

50 entries across 7 sub-categories.

### Scones (3)
`cathead-biscuits-southern`, `cheddar-chive-biscuits`, `singin-hinnies`

### Biscuits (10)
`shortbread-rounds`, `petticoat-tails`, `empire-biscuits`, `garibaldi-biscuits`, `chocolate-digestives`, `speculaas`, `macaron-chocolate`, `nyc-cookies`, `sugar-cookies`, `madeleines`

### Cakes (10)
`victoria-sponge`, `orange-polenta-cake`, `chocolate-guinness-cake`, `lamington`, `buche-de-noel`, `cupcakes-vanilla`, `hazelnut-roulade`, `new-york-cheesecake`, `chocolate-sponge`, `carrot-walnut-cake`

### Sweets & confectionery (8)
`toffee-apples`, `coconut-ice`, `butterscotch`, `honeycomb-toffee`, `marzipan-fruits`, `chocolate-truffles`, `sesame-brittle`, `candied-walnuts`

### Bread (6)
`pikelets`, `hokkaido-milk-bread`, `sourdough-ciabatta`, `pain-de-campagne`, `vollkornbrot`, `bath-buns`

### Pastries (5)
`pain-aux-raisins`, `kouign-amann`, `paris-brest`, `eclairs-coffee`, `cream-puffs`

### Pies (8)
`treacle-tart-lattice`, `bakewell-pudding`, `chess-pie`, `apple-blackberry-pie`, `mince-pies-frangipane`, `tarte-aux-fraises`, `caramelised-onion-tart`, `free-form-galette`

---

## Fixes applied

- `carrot-walnut-cake.json` (pre-existing from bulk-003 range): inserted missing `sunflower-oil` ingredient entry; method prose referred to "200 ml neutral oil" inline without a scaling token or ingredientsList entry.

---

## Notable technical decisions

- **Hokkaido milk bread:** `preFermentType: "NONE"` — tangzhong is a hydration technique, not a pre-ferment. Documented in glossaryTerms and method prose only.
- **Vollkornbrot:** `bulkFermentMinutes: 720` (overnight rye ferment). `totalMinutes: 865`. German cuisine.
- **Paris-Brest / éclairs / cream puffs:** `preFermentType: null` (choux; no yeast).
- **Bakewell pudding:** traditional almond-egg-custard form (not frangipane tart). `dietaryFlags: ["glutenFree"]`.
- **Chess pie:** uses `polenta` slug (aliases cornmeal) and `cider-vinegar`.
- **Laminated pastries (pain-aux-raisins, kouign-amann):** `chillingMinutes` captures lamination resting time; `laminationFolds: 3`, `laminationRests: 3`.

---

## Voice check

All 50 briefs passed `voice-check.ts` without failures.

---

## Upload

50/50 uploaded `--status PUBLISHED`. No errors.
