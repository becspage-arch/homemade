# Recipe ingredients repair — 2026-05-28

Backfilling structured ingredients on the 391 recipes that shipped from the
2026-05-14 → 2026-05-20 baking + cooking pipeline with empty
`ingredientsList` blocks. Companion to publish-gate commit `2b0590d`.

## Summary

- Started: 2026-05-28
- Recipes processed: 83 / 391
- Repaired: 83
- Skipped: 0
- Deferred: 0
- New master ingredient slugs added: 10 (baking-beans, lemon-curd, lemonade,
  quark, mixed-dried-fruit, andouille-sausage, ham-cooked, stock-lamb,
  tea-black, tagliatelle)
- Total RecipeIngredient rows written: 793 (5 smoke + 750 chunk-1 batch)

## Per-recipe log

### Smoke batch (1–5)
- baking/afghans-biscuits — OK (10 items, 2 blocks)
- baking/almond-flourless-cake — OK (9 items)
- baking/amaretti-crisp — OK (5 items)
- baking/american-apple-pie — OK (13 items, group-labelled)
- baking/angel-food-cake — OK (6 items)

