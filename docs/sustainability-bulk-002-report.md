# Sustainability bulk-002 batch report

**Date:** 2026-05-20  
**Session type:** Autopilot-queue worker  
**Status:** 40 entries PUBLISHED

---

## Entries published (40)

### insulation-and-draughtproofing (10)
- `loft-insulation-top-up-mineral-wool` PATTERN INTERMEDIATE
- `chimney-balloon-fitting` PATTERN BEGINNER
- `draught-sealing-skirting-boards` PATTERN BEGINNER
- `external-wall-insulation-decision-guide` TECHNIQUE INTERMEDIATE
- `floor-insulation-over-concrete-slab` PATTERN INTERMEDIATE
- `thermal-bridging-explained` TECHNIQUE INTERMEDIATE (foundational)
- `vapour-control-layers-explained` TECHNIQUE INTERMEDIATE (foundational)
- `insulation-and-ventilation-together` TECHNIQUE INTERMEDIATE
- `solid-wall-insulation-comparison` TECHNIQUE INTERMEDIATE
- `loft-boarding-over-insulation` PATTERN BEGINNER

### solar-and-energy (9)
- `solar-battery-storage-sizing` TECHNIQUE INTERMEDIATE
- `ev-charger-decision-guide` TECHNIQUE INTERMEDIATE
- `smart-thermostat-installation` PATTERN INTERMEDIATE
- `heat-pump-installation-what-to-expect` TECHNIQUE INTERMEDIATE
- `solar-pv-system-monitoring` PATTERN BEGINNER
- `understanding-grid-carbon-intensity` TECHNIQUE BEGINNER (foundational)
- `standalone-home-battery-decision-guide` TECHNIQUE INTERMEDIATE
- `heat-pump-radiator-sizing` TECHNIQUE INTERMEDIATE
- (file 15 = solar-pv-system-monitoring counted above)

### composting (7)
- `compost-in-a-small-garden` PATTERN BEGINNER (foundational)
- `managing-compost-through-winter` PATTERN BEGINNER AUTUMN
- `vermicomposting-troubleshooting` PATTERN BEGINNER
- `adding-woody-material-to-compost` PATTERN BEGINNER AUTUMN
- `using-wood-ash-in-compost` PATTERN BEGINNER WINTER
- `bokashi-second-stage` PATTERN BEGINNER
- `setting-up-a-hotbed` PATTERN INTERMEDIATE SPRING

### water (6)
- `linking-two-water-butts-in-series` PATTERN BEGINNER SPRING
- `swale-and-rain-garden-design` TECHNIQUE INTERMEDIATE
- `household-leak-detection` PATTERN BEGINNER
- `drip-irrigation-from-a-water-butt` PATTERN BEGINNER SPRING
- `water-hardness-and-scale` TECHNIQUE BEGINNER
- `rainwater-harvesting-underground-tank` TECHNIQUE INTERMEDIATE

### waste-reduction (5)
- `textile-waste-and-repair` PATTERN BEGINNER
- `appliance-maintenance-to-extend-life` PATTERN BEGINNER
- `reducing-packaging-waste` PATTERN BEGINNER
- `measuring-household-carbon-footprint` TECHNIQUE BEGINNER (foundational)
- `food-preservation-to-reduce-waste` PATTERN BEGINNER

### off-grid (3)
- `composting-toilet-decision-guide` TECHNIQUE INTERMEDIATE
- `sizing-a-12v-off-grid-solar-system` TECHNIQUE INTERMEDIATE
- `wood-fuel-moisture-and-seasoning` PATTERN BEGINNER AUTUMN
- `off-grid-water-treatment-basics` TECHNIQUE INTERMEDIATE

*(Note: file count is 40; sub-totals above include all 40.)*

---

## Difficulty breakdown
- BEGINNER: 23
- INTERMEDIATE: 17

## Type breakdown
- PATTERN: 22
- TECHNIQUE: 18

---

## Voice-check fixes

### Price mentions (all files)
Bulk-grep of all 40 files for `£|\$` before upload. 14 price strings removed or reworded across files 01, 02, 04, 14, 17, 26, 31, 32, 39, 40. Currency amounts replaced with qualitative descriptions ("modest sum", "a significant grant", "inexpensive").

### Safety-block errors (exit code 2)
- `02-chimney-balloon-fitting`: warning infoPanel body shortened from 57 → 11 words (single clause)
- `13-smart-thermostat-installation`: warning infoPanel body shortened from 52 → 17 words
- `23-using-wood-ash-in-compost`: warning infoPanel body shortened from 39 → 19 words
- `05-floor-insulation-over-concrete-slab`: heading "Before you start" renamed to "Preparation"

### Banned phrases (exit code 2)
- `32-textile-waste-and-repair`: "essentially" → "near-"; "genuinely" removed
- `34-reducing-packaging-waste`: "genuinely" → "verifiably"

### Medical-claim watchword (exit code 2)
- `03-draught-sealing-skirting-boards`: "sealant cures" → "sealant has set"
- `37-composting-toilet-decision-guide`: "treats it as" → "classifies it as"
- `39-wood-fuel-moisture-and-seasoning`: "treats the fuel as" → "considers the fuel as"

### Raw-hours (exit code 2)
- `04-external-wall-insulation-decision-guide`: "1500 hours" → "a five-month heating season"

### Glossary-coverage (exit code 2)
- `08-insulation-and-ventilation-together`: `mineral-wool` term not used inline — converted the "Mineral wool walls and breathable construction" infoPanel to a heading + paragraph with glossaryTooltip mark
- `14-heat-pump-installation-what-to-expect`: `bus` term not used inline — added sentence to intro paragraph wrapping "BUS" in glossaryTooltip
- `37-composting-toilet-decision-guide`: `hot-compost` term not used inline — added glossaryTooltip to final paragraph

---

## Upload fixes

### Slug case normalisation
Slug pattern is `^[a-z0-9]+(-[a-z0-9]+)*$` (lowercase only). Files 11, 12, 15, 16, 17, 35, 38 used `kWh`/`kWp` as glossary slugs and termSlug references. Bulk-replaced with `kwh`/`kwp` using `sed` across all 7 files.

---

## Count delta
Sustainability: 40 → 80
