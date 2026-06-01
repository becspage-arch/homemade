# Natural home bulk-009 — batch report

**Fired:** 2026-06-01  
**Session:** autopilot-queue  
**Model:** Claude Sonnet 4.6

## Result

40 entries PUBLISHED (291 → 331). 0 drops.

## Breakdown

| Sub-category | Count |
|---|---:|
| soap | 8 |
| candles | 8 |
| beauty | 10 |
| cleaning | 8 |
| fragrance | 6 |

RECIPE ×40. BEGINNER ×29, INTERMEDIATE ×10, ADVANCED ×1 (rose-oud-solid-perfume).

## Slug fixes (batch recovery)

This batch recovered 40 previously authored briefs (natural-home-bulk-009-briefs/) that had all failed to upload due to missing ingredient and tool slugs. Root cause: the authoring agent used `{name}-essential-oil` slug format while the master table uses `essential-oil-{name}`.

**Ingredient remaps (in body ingredientsList):**
- 17 essential oil slugs reversed: `lavender-essential-oil` → `essential-oil-lavender`, `eucalyptus-essential-oil` → `essential-oil-eucalyptus`, etc.
- `activated-charcoal-powder` → `activated-charcoal`
- `candle-wick-cdn12` → `candle-wick-pretabbed`
- `cedarwood-chips` → `cedar-shavings`
- `coarse-sea-salt` → `sea-salt-flakes`
- `cornstarch` → `cornflour`
- `dried-lavender-buds` → `dried-lavender-flowers`
- `fine-sea-salt` → `sea-salt-fine`
- `isopropyl-alcohol-99` → `isopropyl-alcohol`
- `kaolin-clay-white` / `white-kaolin-clay` → `kaolin-clay`
- `oat-flour-fine` → `oat-flour`
- `vegetable-glycerin` → `vegetable-glycerine`

**Tool remaps (in recipeTools):**
- `amber-dropper-bottle-30ml` → `dropper-bottle-amber`
- `amber-dropper-bottle-50ml` → `dropper-bottle-50ml`
- `measuring-jug-500ml` → `measuring-jug`
- `pillar-candle-mould-75mm` → `pillar-candle-mould-aluminium`
- `reed-diffuser-bottle-100ml` → `reed-diffuser-bottle`
- `small-mixing-bowl` → `mixing-bowl-small`
- `spray-bottle-250ml` → `spray-bottle-amber-250ml`
- `stiff-scrubbing-brush` → `scrubbing-brush`

Also: removed `rattan-diffuser-reeds` from ingredientsList in file 35 (it's a tool, not an ingredient).

## New seeds

**39 new ingredients:** beef-tallow, bayberry-wax, candle-wick-square4, chamomile-hydrosol, elderflower-hydrosol, emulsifying-wax-nf, cosmetic-liquid-colourant, dead-sea-mud, essential-oil-neroli, essential-oil-pine, fine-cornmeal, french-green-clay, hydrogen-peroxide-3-percent, kelp-powder, lavender-flower-powder, lemon-oil-mineral, liquid-castile-soap, optiphen-preservative, orange-zest-dried, rose-kaolin-clay, sea-salt, squalane, turmeric-infused-oil, unflavoured-gelatin, urea-cosmetic-grade, vetiver-root-pieces, wheatgerm-oil, witch-hazel-alcohol-free, apple-cider-vinegar-raw, fragrance-oil-magnolia-peony, fragrance-oil-tobacco-vanilla, fragrance-oil-sea-salt-driftwood, fragrance-oil-apple-cinnamon, fragrance-oil-neroli-ylang, fragrance-oil-lemon-verbena, fragrance-oil-bayberry, fragrance-oil-black-pepper-amber, fragrance-oil-rose, fragrance-oil-oud.

**21 new tools:** cream-pot-100ml, glass-beaker-50ml, glass-beaker-100ml, glass-beaker-150ml, glass-beaker-250ml, glass-beaker-500ml, glass-jar-30ml, glass-jar-60ml, glass-jar-200ml, glass-jar-250ml-sealed, glass-jar-300ml, glass-stirring-rod, ice-cube-tray-silicone, metal-tin-15ml, metal-tin-150ml, muslin-bags-drawstring, old-toothbrush, pump-bottle-100ml, rattan-diffuser-reeds, silicone-moulds-round, wick-rod.

## Voice-check

All 40 passed (0 errors). 9 entries had minor warnings (safety-block, tricolon) — all accepted.

## Hero fill

40/40 — 39 pexels, 1 flux-schnell, 0 failed.

## QC

119 processed, 119 pass, 0 still_blocked.

## Recurring pattern (anti-tell)

The natural-home authoring agent consistently uses `{name}-essential-oil` slug format but the master table uses `essential-oil-{name}`. Future natural-home batches must reverse this before upload. The fixer script `docs/fix-natural-home-bulk009.mjs` can serve as a template.
