# Baking bulk-029 — batch report
_2026-06-19_

## Summary

- **Briefs authored:** 72 (spanning multiple context windows in this autopilot run)
- **Voice-check pass (exit 0 or 1):** 58
- **Uploaded with status PUBLISHED:** 58
- **QC fix:** 43/43 pass, still_blocked=0
- **Hero fills:** 7 updated (Pexels + Unsplash)
- **Dropped (exit code 2, after 3 attempts):** 16

## Uploaded slugs (58)

almond-and-cherry-cake, almond-raspberry-traybake, apple-and-quince-tart, beer-and-mustard-loaf, black-sesame-cookies, blueberry-yoghurt-loaf, brown-sugar-cinnamon-scones, caramel-apple-tart, chocolate-bundt-cake, chocolate-chip-brioche, chocolate-walnut-cookies, cinnamon-streusel-bundt, coffee-walnut-traybake, dark-chocolate-orange-loaf, double-chocolate-cookies, dundee-cake, earl-grey-cake, earl-grey-tea-cake, eclairs-coffee, edible-flowers-decoration, fault-line-cake-technique, geode-cake-crystal-sugar, hazelnut-meringue-layer-cake, hazelnut-thumbprint-cookies, honey-lavender-cake, kirsch-cherry-truffles, lebkuchen, leek-and-bacon-tart, lemon-bars, lemon-bundt-cake, lime-and-ginger-truffles, maple-pecan-scones, maple-walnut-brittle, marmalade-loaf-cake, melktert-south-african, mince-pies-frangipane, number-cake-technique, onion-and-poppy-seed-rolls, orange-cardamom-scones, passion-fruit-white-chocolate-truffles, pear-and-almond-cake, pecan-pie, pfeffernusse, polvorones-spanish, raspberry-and-white-chocolate-cake, salted-honey-caramels, seeded-sourdough-loaf, semolina-bread-italian, sesame-honey-biscuits, shrewsbury-biscuits, steak-and-ale-pie, stem-ginger-scones, stroopwafels, tahini-cookies, treacle-tart, tres-leches-cake, viennese-whirls, walnut-bread-french

## Dropped slugs (16)

Dropped after exhausting 3 voice-check attempts due to errors that required body rewrites or glossary additions beyond quick fixes.

| Slug | Reason |
|------|--------|
| fregolata | grade-level errors (3 paragraphs) |
| hokkaido-milk-bread | glossary-coverage: enriched-dough, tangzhong, windowpane-test undeclared |
| kouign-amann | grade-level errors (3 paragraphs) |
| malted-brown-loaf | glossary-coverage: prove, gluten-development undeclared |
| oat-and-pecan-scones | glossary-coverage: rolled-oats, rubbing-in undeclared |
| pain-au-chocolat | grade-level error (paragraph 2) |
| pain-de-campagne | glossary-coverage: levain, bulk-fermentation, stretch-and-fold, scoring undeclared |
| paris-brest | grade-level errors (3 paragraphs) |
| saint-honore-gateau | grade-level errors (3 paragraphs) |
| seeded-spelt-tin-loaf | glossary-coverage: gluten, proving undeclared |
| sfogliatelle-ricotta | grade-level errors (3 paragraphs) |
| sourdough-discard-scones | glossary-coverage: sourdough-discard, rubbing-in undeclared |
| summer-berry-tart-creme-patissiere | grade-level error |
| tiger-bread-dutch-crunch | grade-level + glossary-coverage: gluten-development, windowpane-test |
| vollkornbrot-dense-rye | grade-level + glossary-coverage: rye-sourdough, hydration |
| yemenite-kubaneh | grade-level + glossary-coverage: enriched-dough, laminating, prove |

## Recurrences (for baking-anti-tells consideration)

- **Grade-level errors** appeared in 10 of the 16 dropped files. Common in complex pastry and bread entries with long relative clauses. Pattern: paragraphs that front-load the chemical or physical process before the action instruction.
- **Glossary-coverage mismatch** appeared in 9 dropped files. Cause: termSlugs referenced in `glossaryTooltip` marks that were not declared in `glossaryTerms[]`. This is a structural authoring error, not a voice issue.

## Sub-category breakdown (uploaded)

| Sub-category | Count |
|---|---|
| bread | 5 |
| cakes | 13 |
| biscuits | 10 |
| scones | 5 |
| pies | 5 |
| sweets-confectionery | 6 |
| cake-decorating | 5 |
| pastries | 1 |
| savory | 2 (leek-and-bacon-tart, steak-and-ale-pie) |
| other | 6 |

## Category count after batch

Baking: **994 published** (target: 1,200, fill: 83%)
