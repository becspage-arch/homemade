# Baking bulk-032 batch report
**Date:** 2026-06-19  
**Session:** autopilot-queue  
**Published:** 40 entries (baking 1088 → 1128)

## Sub-category breakdown

| Sub-category | Count | Types |
|---|---|---|
| cake-decorating | 7 | TECHNIQUE ×7 |
| sweets-confectionery | 8 | RECIPE ×8 |
| pies | 8 | RECIPE ×8 |
| pastries | 7 | RECIPE ×7 |
| cakes | 7 | RECIPE ×7 |
| biscuits | 3 | RECIPE ×3 |

**Total:** TECHNIQUE ×7, RECIPE ×33

## Entries

**cake-decorating:** brushed-embroidery-royal-icing, gum-paste-hydrangea, russian-piping-buttercream, hand-painted-cake, crystallised-flower-petals, fondant-bow-ribbon, chocolate-sail-shards

**sweets-confectionery:** white-chocolate-truffles, peppermint-patties, praline-chocolate-squares, pate-de-fruit-strawberry, candied-violets, sugared-almonds, champagne-truffles, butterscotch-fudge

**pies:** nectarine-frangipane-tart, plum-galette-almond, grape-clafoutis, blackcurrant-and-cream-tart, cherry-almond-tart, caramel-custard-tart, chocolate-espresso-tart, coconut-custard-tart

**pastries:** eclairs-coffee, profiteroles-salted-caramel, strudel-pear-chocolate, palmiers-parmesan-sage, tarte-fine-aux-pommes, chocolate-walnut-baklava, faworki-angel-wings

**cakes:** blackberry-and-apple-cake, pineapple-and-coconut-cake, white-chocolate-raspberry-cake, rhubarb-and-custard-cake, peach-and-almond-loaf-cake, brown-butter-hazelnut-gateau, lavender-and-honey-cake

**biscuits:** chocolate-hazelnut-cookies, almond-and-cherry-cookies, lemon-thyme-shortbread

## New ingredients seeded (6)

- `champagne` — alcohol; for confectionery and desserts, brut style
- `violet-flowers` — other; edible/crystallised use; shelf 2 days, fridge
- `dried-sour-cherries` — fruit; dried tart cherries; shelf 365 days
- `ground-hazelnuts` — nut; allergen (nuts); shelf 90 days
- `dried-culinary-lavender` — herb; food-grade; shelf 365 days
- `espresso` — other; brewed shot; shelf 1 day, fridge

## Voice-check fixes

**Em-dashes removed (7 files):**
- brushed-embroidery-royal-icing: "dampen a fine brush — moist, not dripping —" → "(moist, not dripping)"
- caramel-custard-tart: "in a slow, steady stream — it will bubble up strongly" → "; it will bubble up strongly"
- chocolate-hazelnut-cookies: "before transferring to a rack — the cookies firm up" → "; the cookies firm up"
- eclairs-coffee: two em-dashes — "bubbling — about 3 to 4 minutes" → ", about 3 to 4 minutes" and "shaken — you may not need" → "; you may not need"
- tarte-fine-aux-pommes: three em-dashes — "rectangle — either works" → "; either shape works"; "by hand — about 2 mm" → ", about 2 mm thick"; "to check — if the base" → "; if the base"

**Grade-level rewrites (2 files):**
- chocolate-walnut-baklava: opening paragraph grade 15.9 → split complex sentence into 3 short sentences
- palmiers-parmesan-sage: opening paragraph grade 13.6 → split rolling-technique description into 3 short sentences

## Ingredient slug canonicalisation (22 mappings, all 40 files)

Applied via batch sed:
`egg-yolk→egg-yolks`, `egg-white→egg-whites`, `cold-water→water`, `fine-sea-salt→sea-salt-fine`, `flaked-almonds→almonds-flaked`, `whole-almonds→almonds`, `cinnamon→cinnamon-ground`, `dried-breadcrumbs→breadcrumbs-dried`, `conference-pears→pear-conference`, `eating-apples→apple-eating`, `bramley-apple→apple-bramley`, `dried-sage→sage-dried`, `fresh-thyme→thyme-fresh`, `sour-cream→soured-cream`, `lemons→lemon`, `flaky-salt→salt-flakes`, `full-fat-coconut-milk→coconut-milk`, `ready-rolled-puff-pastry→puff-pastry`, `instant-espresso-powder→espresso-powder`, `seedless-grapes→grapes`, `golden-caster-sugar→caster-sugar`, `fresh-raspberries→raspberries`

## Tool slug fixes (3 files)

- faworki-angel-wings: `deep-sided-saucepan→large-saucepan`, `cooking-thermometer→thermometer-probe`
- lemon-thyme-shortbread: `round-cutter→biscuit-cutters`

## Post-publish QC

- `fixup-hero-fill.ts`: wikimedia 2, flux-schnell 3, failed 0
- `qc-fix.ts --recently-published --since "1 hour ago" --auto-fix`: processed 27, pass 27, still_blocked 0
