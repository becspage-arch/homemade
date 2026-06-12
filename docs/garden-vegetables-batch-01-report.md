# Garden Vegetables Batch 01 — Autopilot Report

**Session**: autopilot-queue-extra  
**Date**: 2026-06-13  
**Model**: claude-sonnet-4-6  
**Category**: garden / vegetables  
**Files**: packages/db/scripts/garden-vegetables-batch-01/ (40 JSON files)

---

## Summary

40 tutorials published to the garden/vegetables sub-category, taking the sub-category from 1 (anchor only) to 41 entries and the garden category total from 44 to 84.

---

## Entries

| Slug | Plant | Sub-topic | Difficulty |
|------|-------|-----------|------------|
| sowing-broad-beans | broad-bean | sowing | BEGINNER |
| sowing-peas | pea | sowing | BEGINNER |
| sowing-carrots | carrot | sowing | BEGINNER |
| sowing-parsnips | parsnip | sowing | BEGINNER |
| sowing-beetroot | beetroot | sowing | BEGINNER |
| sowing-lettuce | lettuce | sowing | BEGINNER |
| sowing-spinach | spinach | sowing | BEGINNER |
| sowing-radish | radish | sowing | BEGINNER |
| sowing-rocket | rocket | sowing | BEGINNER |
| sowing-leeks | leek | sowing | BEGINNER |
| growing-courgettes | courgette | growing | BEGINNER |
| growing-potatoes | potato | growing | BEGINNER |
| growing-garlic | garlic | growing | BEGINNER |
| growing-kale | kale | growing | BEGINNER |
| growing-onions | onion | growing | BEGINNER |
| growing-runner-beans | runner-bean | growing | BEGINNER |
| growing-cucumbers | cucumber | growing | INTERMEDIATE |
| growing-french-beans | french-bean | growing | BEGINNER |
| growing-broccoli | broccoli | growing | BEGINNER |
| growing-cabbage | cabbage | growing | BEGINNER |
| growing-aubergines | aubergine | growing | INTERMEDIATE |
| growing-sweet-peppers | sweet-pepper | growing | INTERMEDIATE |
| growing-squash | squash | growing | BEGINNER |
| growing-sweetcorn | sweetcorn | growing | INTERMEDIATE |
| growing-chard | chard | growing | BEGINNER |
| growing-asparagus | asparagus | growing | INTERMEDIATE |
| growing-globe-artichoke | globe-artichoke | growing | INTERMEDIATE |
| growing-rhubarb | rhubarb | growing | BEGINNER |
| growing-swede | swede | growing | BEGINNER |
| growing-turnips | turnip | growing | BEGINNER |
| harvesting-tomatoes | tomato | harvesting | BEGINNER |
| harvesting-garlic | garlic | harvesting | BEGINNER |
| harvesting-onions | onion | harvesting | BEGINNER |
| harvesting-potatoes | potato | harvesting | BEGINNER |
| harvesting-courgettes | courgette | harvesting | BEGINNER |
| tomato-variety-selection | tomato | variety-selection | BEGINNER |
| potato-variety-selection | potato | variety-selection | BEGINNER |
| bean-variety-selection | runner-bean | variety-selection | BEGINNER |
| cabbage-white-butterfly | cabbage | pest-management | BEGINNER |
| carrot-fly-prevention | carrot | pest-management | BEGINNER |

---

## Species seeded

9 new entries added to packages/db/data/plants.ts and seeded:
- aubergine (Solanum melongena)
- squash (Cucurbita maxima)
- sweetcorn (Zea mays)
- chard (Beta vulgaris var. cicla)
- asparagus (Asparagus officinalis)
- globe-artichoke (Cynara scolymus)
- rhubarb (Rheum x hybridum)
- swede (Brassica napus var. napobrassica)
- turnip (Brassica rapa var. rapa)

---

## Voice-check fixes

| File | Error type | Fix applied |
|------|-----------|-------------|
| sowing-broad-beans | glossary-coverage (overwintering) | Added glossaryTooltip on "overwinter" in opening para |
| sowing-peas | glossary-coverage (pea-inoculation) | Added rhizobium inoculation sentence with tooltip in aftercare |
| sowing-parsnips | glossary-coverage (parsnip-canker) | Added inline reference with tooltip in aftercare para |
| sowing-lettuce | glossary-coverage (tip-burn-lettuce) | Added glossaryTooltip on "tip-burn" in position/soil para |
| growing-courgettes | glossary-coverage (blossom-end-failure) | Added inline reference with tooltip in harvest para |
| growing-aubergines | grade-level (para 0, grade 15.6) | Rewrote opening paragraph to shorter plain sentences |
| growing-cucumbers | grade-level (troubleshooter fix items) | Simplified mildew fix sentence, replaced Phytoseiulus persimilis with plain "biological predator mite" |
| cabbage-white-butterfly | grade-level (para 8, grade 12.6) | Rewrote "next year" section into shorter sentences |
| tomato-variety-selection | grade-level (×3) + institutional-in-body (RHS) | Simplified 3 paragraphs; replaced "RHS AGM" with "Award of Garden Merit" throughout |
| bean-variety-selection | institutional-in-body (RHS ×2) | Replaced "RHS AGM" with "Award of Garden Merit" / "an Award of Garden Merit" |

---

## QC

- fixup-hero-fill.ts: 40/40 heroes filled (37 Unsplash, 3 Pexels)
- qc-fix.ts: 69 processed, 67 pass, 2 still_blocked (unfixable)

---

## Counts

- Garden total (published): 44 → 84
- Garden/vegetables (published): 1 → 41
