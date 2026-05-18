# Cooking bulk-025 — batch report

**Date:** 2026-05-18  
**Theme:** Caribbean cuisine — Jamaican, Trinidadian, Cuban/Hispanic Caribbean  
**Status:** 40 entries PUBLISHED  
**Cooking total:** 929 → 969

---

## Slugs

### Jamaican (17)
brown-stew-chicken, callaloo-stew, curry-chicken-jamaican, curry-goat-jamaican, escovitch-fish, festival-dumplings, fried-plantain, jamaican-beef-patties, jamaican-fish-tea, jerk-chicken, jerk-fish, jerk-pork-shoulder, oxtail-and-butter-beans, pepperpot-soup, rice-and-peas, saltfish-fritters, stew-peas-jamaican

### Trinidadian (12)
corn-soup-trinidadian, curry-chicken-trinidadian, curry-duck-trinidadian, curry-goat-trinidadian, dhalpuri-roti, doubles-trinidadian, fry-bake-trinidadian, macaroni-pie-trinidadian, mango-chow, pelau-beef, pelau-chicken, trini-tomato-choka

### Cuban / Hispanic Caribbean (11)
arroz-con-pollo-caribbean, cuban-black-beans, cuban-garlic-mojo-chicken, cuban-sandwich, lechon-asado, mofongo-puerto-rican, moros-y-cristianos, picadillo-cuban, ropa-vieja, tostones, vaca-frita

---

## Fixes applied during voice-check and upload

**Em-dash pairs → parentheses / commas / colons (28 instances across 20 body/excerpt files)**  
All paired em-dash constructions (`— phrase —`) replaced. Most common patterns: ingredient lists set off by dashes, glosses of dish names in body text.

**Em-dash pairs in sourceNotes (8 files)**  
Voice checker validates sourceNotes too. Fixed in: cuban-garlic-mojo-chicken, jamaican-beef-patties, moros-y-cristianos, ropa-vieja, vaca-frita, and others.

**Banned phrase "genuinely" → "very" (1 file)**  
jerk-chicken.json troubleshooter item cause text.

**Season enum `AUTUMN_WINTER` → `AUTUMN` (1 file)**  
pepperpot-soup.json — AUTUMN_WINTER is not in the Season enum. Valid values: SPRING, SUMMER, AUTUMN, WINTER, YEAR_ROUND.

**servings/yieldDescription conflict (6 files)**  
Files with discrete-item yields (patties, rotis, doubles, fry bakes, festival dumplings, fritters) must use `yieldDescription` only — set `servings: null`. Affected: jamaican-beef-patties, dhalpuri-roti, doubles-trinidadian, fry-bake-trinidadian, festival-dumplings, saltfish-fritters.

---

## Notes

- Green plantain unavailable in UK: banana (green, unripe cooking banana) used as substitute in tostones and mofongo-puerto-rican. Notes prominent in both sourceNotes and body.
- Shadow beni (culantro) unavailable in UK: fresh coriander used as substitute throughout Trinidadian green seasoning recipes.
- Sour orange (naranja agria) unavailable: orange juice + lime juice combination used in all Cuban mojo recipes (lechon-asado, cuban-garlic-mojo-chicken). Flagged in sourceNotes.
- Goat unavailable in most UK supermarkets: lamb neck used as substitute in curry-goat-trinidadian; lamb shoulder in curry-goat-jamaican.
- Salt cod (bacalao) used as conceptual reference in saltfish-fritters; cod fillet used as body ingredient with extensive note.
- Pepperpot-soup is distinct from the Guyanese cassareep-based pepperpot — noted in sourceNotes.

---

## Common issues (for future batches)

- `AUTUMN_WINTER` is not a valid Season enum value — use AUTUMN for autumn/winter recipes
- For discrete-item yields (dumplings, patties, fritters, etc.): set `servings: null` and use `yieldDescription` only
- sourceNotes are validated by the voice checker — em-dash pairs must be fixed there too, not just in body text
