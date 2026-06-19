# Baking bulk-029 report

Date: 2026-06-19
Batch: baking / bulk-029

## Sub-category breakdown (40 total)

| Sub-category | Count | Slugs |
|---|---:|---|
| biscuits | 6 | lebkuchen, pfeffernusse, polvorones-spanish, shrewsbury-biscuits, stroopwafels, viennese-whirls |
| bread | 7 | hokkaido-milk-bread, malted-brown-loaf, pain-de-campagne, seeded-spelt-tin-loaf, tiger-bread-dutch-crunch, vollkornbrot-dense-rye, yemenite-kubaneh |
| cake-decorating | 3 | cake-stencilling-technique, fault-line-cake-technique, geode-cake-technique |
| cakes | 8 | almond-and-cherry-cake, coffee-walnut-traybake, dundee-cake, earl-grey-tea-cake, hazelnut-meringue-layer-cake, marmalade-loaf-cake, pear-and-almond-cake, tres-leches-cake |
| pastries | 6 | fregolata, kouign-amann, pain-au-chocolat, paris-brest, saint-honore-gateau, sfogliatelle-ricotta |
| pies | 5 | leek-and-bacon-tart, pecan-pie, steak-and-ale-pie, summer-berry-tart-creme-patissiere, treacle-tart |
| scones | 4 | oat-and-pecan-scones, sourdough-discard-scones, spelt-and-honey-scones, stilton-and-walnut-scones |
| sweets-confectionery | 1 | honeycomb-cinder-toffee |

Types: RECIPE x37, TECHNIQUE x3

## Pipeline fixes applied

**Voice-check grade-level fixes (2 files):**
- paris-brest: `body.content[20] listItem[2]` (pastry cream cooking step) broken into 6 shorter sentences (grade 14.8 → below 12.0)
- saint-honore-gateau: `body.content[0]` intro paragraph split from 1 sentence into 3 (grade 14.0 → below 12.0)

**Voice-check americanism fix (1 file):**
- paris-brest: "fall from the spoon" → "drop from the spoon"

**ingredientsList format conversion (11 files):**
Files authored with `content[ingredient]` structure instead of required `attrs.items[]`:
hokkaido-milk-bread, malted-brown-loaf, oat-and-pecan-scones, pain-de-campagne,
seeded-spelt-tin-loaf, sourdough-discard-scones, spelt-and-honey-scones,
stilton-and-walnut-scones, tiger-bread-dutch-crunch, vollkornbrot-dense-rye, yemenite-kubaneh.
All 11 converted to `attrs.items[]` format.

**Ingredient slug corrections (applied across all affected files):**
- `egg` → `eggs`
- `salt` → `salt-table`
- `fine-sea-salt` → `sea-salt-fine` (5 files)
- `dried-yeast` → `yeast-dried` (3 files)
- `strong-white-bread-flour` → `strong-bread-flour` (2 files)
- `flaked-almonds` → `almonds-flaked` (3 files)
- `orange-zest` → `orange` (3 files)
- `lemon-zest` → `lemon` (2 files)
- `carrots` → `carrot`, `onions` → `onion`, `pears` → `pear`
- `instant-coffee` → `coffee-instant`
- `beef-stock` → `stock-beef`
- `ale` → `beer`
- `cinnamon` → `cinnamon-ground` (2 files)
- `candied-peel` → `mixed-peel`
- `gelatine` → `gelatine-leaves`
- `cloves-ground` → `cloves`
- `leeks` → `leek`, `earl-grey-tea` → `tea-black`
- `mixed-berries` → `mixed-frozen-berries`
- `breadcrumbs` → `breadcrumbs-fresh`
- `wafer-circles` removed from lebkuchen (no master table equivalent for oblaten)

**Multi-section ingredientsList fix (2 files):**
saint-honore-gateau and sfogliatelle-ricotta have multiple ingredient sections.
Second pass required to fix all blocks, not just the first.

**Voice warnings (non-blocking, uploaded as PUBLISHED):**
- hokkaido-milk-bread: brand "Target" retained
- lebkuchen, pain-au-chocolat, sfogliatelle-ricotta, vollkornbrot-dense-rye: tricolons retained
- sfogliatelle-ricotta: brand "Flake" in ingredient prepNote retained

## QC result

Post-publish QC: 40/40 batch-029 entries PASS.

Hero images: 38 entries filled by hero-fill script.
- unsplash: 24, pexels: 14, failed: 0

## Common-issues.md updates

Two new entries added:
- `ingredientsList block format: content[] instead of attrs.items[]` (11 recurrences)
- `Standard baking ingredient slug corrections` (consolidated mapping table)

## Baking count

1,012 PUBLISHED after batch-029 completes.
