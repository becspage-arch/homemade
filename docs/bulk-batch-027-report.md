# Cooking bulk-027 batch report

**Date:** 2026-05-19  
**Session:** autopilot-queue  
**Category:** Cooking  
**Count:** 40 recipes PUBLISHED  
**Cooking total:** 1,009 → 1,033 (briefs were previously drafted and partially uploaded by an aborted session; this run re-published all 40 cleanly)

---

## Slugs published

### French (14)
- boeuf-en-daube
- canard-aux-cerises
- carbonnade-flamande
- choucroute-garnie
- coquilles-saint-jacques
- lapin-a-la-moutarde
- magret-de-canard
- moules-a-la-creme
- poule-au-pot
- poulet-a-la-creme
- poulet-a-lestragon
- poulet-chasseur
- steak-tartare
- truite-aux-amandes

### Italian (7)
- cacio-e-pepe
- ossobuco-alla-milanese
- pasta-e-fagioli
- pollo-alla-cacciatore
- ribollita
- risotto-ai-funghi
- saltimbocca-alla-romana

### Spanish (9)
- arroz-caldoso-marisco
- cordero-al-chilindron
- espinacas-con-garbanzos
- huevos-a-la-flamenca
- merluza-en-salsa-verde
- migas-extremenas
- pinchitos-morunos
- pollo-en-pepitoria
- sopa-de-ajo

### Greek (10)
- bifteki
- grilled-octopus-greek
- gyros-pork
- kakavia
- lamb-fricassee-greek
- souvlaki-chicken
- souvlaki-lamb
- souvlaki-pork
- tiropita
- whole-grilled-bream-greek

---

## Voice-check fixes

### False-positive brand-trademark (2 files)
Both were "target" as a common noun (goal/aim), not the shop "Target":
- `huevos-a-la-flamenca`: `"The target is set whites and barely-liquid yolks"` → `"The aim is set whites and barely-liquid yolks"`
- `souvlaki-chicken`: `"the target internal temperature for chicken is 74°C"` → `"the correct internal temperature for chicken is 74°C"`

### False-positive americanism (1 file)
Same "fall apart" false positive as `placki-ziemniaczane` in batch-026:
- `merluza-en-salsa-verde`: `"Thin fillets fall apart during the swirling"` → `"Thin fillets break apart during the swirling"`

### Tricolon soft warnings (4 files — left as-is)
`cordero-al-chilindron`, `pasta-e-fagioli`, `pollo-alla-cacciatore`, `saltimbocca-alla-romana`: tricolon in sourceNotes or excerpt. All soft warnings; none impaired readability.

---

## Upload result

40 / 40 uploaded as PUBLISHED. 0 failures.

All 40 briefs had been drafted in a previous aborted session and were sitting untracked in `docs/bulk-batch-017-briefs/`. This run voice-checked them, fixed 3 false-positive warnings, and published all 40. Briefs moved to `docs/bulk-batch-027-briefs/`.
