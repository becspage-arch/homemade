# Natural-home bulk-010 — batch report

**Date:** 2026-06-01  
**Batch:** 010  
**Status:** 40 uploaded PUBLISHED; 4 subsequently blocked by post-upload QC (hourly qc-fix-batch will handle)  
**Published count:** 331 → 367  

---

## Slice

40 entries across all five sub-categories:

| Sub-category | Count | Entries |
|---|---:|---|
| `soap` | 8 | Avocado & green clay CP, Chocolate CP, Sweet orange & cedarwood CP, Sunflower & oat CP, Shaving soap puck (KOH), Frankincense & cedarwood CP, Red wine CP, Unscented sensitive CP |
| `candles` | 8 | Bergamot & vetiver soy, Peppermint & eucalyptus soy, Beeswax votives, Sandalwood & cedarwood soy, Lavender & pine soy, Beeswax pillar frankincense, Coconut wax lime & bergamot, Clary sage & orange soy |
| `beauty` | 10 | Frankincense & rosehip face serum, Witch hazel & rose toner, Hemp seed face oil, Argan & rosemary hair oil, Epsom & juniper muscle soak, Niacinamide toning serum, Argan & shea facial lotion, Cedarwood & sandalwood beard oil, Vetiver & sea salt body scrub, Lavender & lime lip balm |
| `cleaning` | 7 | Silver polishing paste, Oven cleaner paste, Grout cleaning paste, Citric acid descaler, Beeswax leather conditioner, Wool wash liquid, Washing soda stain spray |
| `fragrance` | 7 | Bergamot & vetiver reed diffuser, Frankincense & cedarwood room spray, Neroli & lime wax melts, Patchouli & bergamot linen spray, Pine & juniper solid perfume, Cedarwood & vetiver cologne balm, Sweet orange & patchouli room spray |

---

## Voice-check summary

Voice-check run at upload time. All 40 passed (0 blocking errors); entries with warnings only were accepted.

**Common issues caught during self-critique and fixed before upload:**
- `medical-claim: "cures"` — the verb "cures" (third-person singular of "to cure") triggers the medical-claim watchword in soap tutorial bodies and excerpts; replaced with "matures", "hardens", or "sets" throughout all soap entries.
- `raw-hours` — "72 hours" in two soap entries; replaced with "2 to 3 days".
- `grade-level-strict` — 13 introductory paragraphs across cleaning, fragrance, and beauty entries exceeded the grade-12 threshold; simplified sentence structure and vocabulary.
- `clinical-vocab: "anhydrous"` — appeared in three entries without glossaryTooltip; fixed by adding tooltips or replacing with "water-free".
- `clinical-vocab: "anti-inflammatory"` — removed from argan-shea-facial-lotion intro and replaced with "calms mild redness".

**Post-upload QC (5 still_blocked — hourly qc-fix-batch handles):**
- frankincense-rosehip-face-serum: voice-violation
- hemp-seed-face-oil: voice-violation
- patchouli-bergamot-linen-spray: grade-level-strict
- shaving-soap-puck: voice-violation
- vetiver-sea-salt-body-scrub: voice-violation

---

## Hero fill

40/40 heroes filled from Pexels (39) + Unsplash (1). Relevance queue written to `docs/image-relevance-queue-natural-home-bulk-010.json`.

---

## Notes

- **New in batch 010:** First shaving soap puck entry (KOH-based soft soap, ADVANCED — different format from the batch-007 shaving stick). First beeswax votive candle entry. First coconut wax jar candle entry. First solid perfume cologne entries.
- **Ingredient slugs newly used:** `essential-oil-juniper-berry`, `essential-oil-pine`, `essential-oil-sweet-orange`, `essential-oil-clary-sage`, `essential-oil-vetiver`, `essential-oil-neroli`, `essential-oil-lime`, `essential-oil-sandalwood`, `red-wine`, `niacinamide`, `hemp-seed-oil`, `aloe-vera-juice`, `arrowroot-powder`, `epsom-salts`, `cream-of-tartar`, `dipropylene-glycol`, `coconut-wax`, `potassium-hydroxide`.
- No new ingredient or tool slugs needed (all confirmed against master table before authoring).
