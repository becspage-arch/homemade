# Sustainability bulk-005 — session report

**Date:** 2026-05-29  
**Session type:** autopilot-queue  
**Model:** Claude Sonnet 4.6  
**Entries published:** 40  
**Count change:** Sustainability 160 → 200

---

## Sub-category breakdown

| Sub-category | Count | Slugs |
|---|---|---|
| insulation-and-draughtproofing | 10 | insulating-behind-radiators, draught-sealing-a-garage-door, using-a-thermal-imaging-camera, basement-and-cellar-insulation, foam-sealing-service-penetrations, conservatory-roof-replacement-decision, thermostatic-radiator-valve-fitting, roof-eaves-insulation-detail, party-wall-thermal-bypass, draught-proofing-stairs-and-hall |
| solar-and-energy | 8 | solar-panel-cleaning-and-maintenance, inverter-types-for-solar-pv, heat-loss-calculation-for-a-room, heat-pump-hot-water-cylinder-sizing, smart-meter-installation-guide, infrared-heating-panels, night-rate-electricity-and-load-shifting, solar-pv-roof-structural-check |
| composting | 8 | in-ground-compost-pit, pest-proofing-your-compost, biochar-in-compost, no-dig-composting-and-mulch, compost-for-container-growing, covering-a-compost-heap, reading-compost-moisture-by-touch, perennial-bed-top-dressing |
| water | 6 | water-butt-winterising, toilet-float-valve-adjustment, garden-irrigation-system-design, water-softener-decision-guide, fitting-a-garden-tap, rainwater-for-toilet-flushing |
| waste-reduction | 5 | household-waste-audit, buying-in-bulk-to-reduce-packaging, choosing-eco-cleaning-products, meal-planning-to-reduce-food-waste, clothing-and-textile-second-life |
| off-grid | 3 | off-grid-power-monitoring, emergency-backup-power, off-grid-cooking-options |

**Type:** TECHNIQUE ×33, PATTERN ×7  
**Difficulty:** BEGINNER ×28, INTERMEDIATE ×12

---

## Voice-check fixes

### Price-mention fixes (22 files)

First pass: all `£X` patterns in body text and excerpts triggered the `price-mention` rule (`/(£|\$|€|¥)\s?\d/`). Fixed with a bulk Node.js replacement script across all 40 files:
- `£X to £Y` → `X to Y pounds`
- `£X–£Y` → `X–Y pounds`
- Plain `£X` → `X pounds`
22 files were updated; 18 had no £ signs.

### Em-dash removals (5 files)

- **04 basement-and-cellar-insulation** — two headings: "Option 1: cold cellar — insulate the ceiling" and "Option 2: warm cellar — insulate the walls and floor". Fixed by replacing em-dash with parentheses.
- **07 thermostatic-radiator-valve-fitting** — two headings: "Fitting — head swap only" and "Fitting — full valve replacement". Shortened to "Head swap only" / "Full valve replacement".
- **21 biochar-in-compost** — two ordered-list items with "Method 1 —" and "Method 2 —" labels. Removed method prefix, kept the descriptive text.
- **25 reading-compost-moisture-by-touch** — "mid-depth — not the surface" → "mid-depth, not the surface".
- **37 clothing-and-textile-second-life** — bullet item with "not suitable for resale — heavily worn" → "not suitable for resale, such as heavily worn".

### Grade-level rewrites (multiple files)

Paragraphs failing Flesch-Kincaid grade > 12.0 were simplified. Strategy: split compound sentences, replace polysyllabic terms, remove subordinate clauses. Files affected: 04, 09, 11, 12, 14, 16, 20, 26, 32, 33, 34, 35, 38, 40.

### Banned-phrase fixes (2 files)

- **35 choosing-eco-cleaning-products** — "Disinfectant (only where genuinely needed..." → removed "genuinely".
- **37 clothing-and-textile-second-life** — excerpt "Items genuinely past repair..." → "Items past repair...".

---

## Upload

All 40 files uploaded in a single batch. 0 upload failures. 28 new glossary terms seeded.

---

## Tools seeded

None — all tool slugs in this batch were already in the DB from previous batches.
