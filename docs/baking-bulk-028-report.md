# Baking bulk-028 report

Date: 2026-06-19
Batch: baking / bulk-028
Slot claimed: 14:47:27Z

## Sub-category breakdown (40 total)

| Sub-category | Count | Slugs |
|---|---:|---|
| bread | 8 | conchas-mexican, flour-tortillas-homemade, injera-ethiopian, kartoffelbrot-german, kulich-russian, lavash-armenian, mantou-steamed-plain, paratha-plain-griddle |
| cake-decorating | 8 | buttercream-basket-weave, chocolate-curls-shavings, chocolate-leaf-transfers, korean-flower-piping, naked-cake-technique, sugar-paste-rose, swiss-meringue-buttercream, tiered-cake-assembly |
| cakes | 8 | battenberg-cake, bolo-de-mel-madeira, charlotte-royale, dacquoise-hazelnut-disc, gateau-chocolat-pruneaux, quatre-quarts-french-pound, tarta-de-santiago, zuccotto-dome-cake |
| pastries | 6 | beigli-hungarian-walnut, colomba-di-pasqua, fleurons-puff-pastry, fraisier-patisserie, kouignettes-individual, tarte-tropezienne |
| pies | 4 | blackcurrant-plate-pie, flan-parisien, gypsy-tart-kentish, quiche-lorraine |
| sweets-confectionery | 4 | acid-drops-boiled-sweets, marzipan-fruits-moulded, peanut-butter-cups-dark, toffee-apples |
| scones | 2 | cheese-and-marmite-scones, sweet-potato-scones |

Types: RECIPE x32, TECHNIQUE x8

## Pipeline fixes applied

**ingredientsList field name corrections (all RECIPE files):**
- `slug` + `quantity` in ingredientsList items changed to `ingredientSlug` + `amount` (upload script reads `ingredientSlug` and `amount`; old field names caused null ingredient names and null amounts, triggering makeability block)
- `egg` slug changed to `eggs` (plural is the master table canonical form; does not affect `egg-yolks` or `egg-whites`)

**Tool slug fix:**
- `candy-thermometer` changed to `sugar-thermometer` (correct master table slug; "candy thermometer" and "jam thermometer" are registered aliases)

**TECHNIQUE troubleshooting requirement:**
- fleurons-puff-pastry: added `avoid letting egg run down the cut sides` (MISTAKES_RE needs `avoid`)
- korean-flower-piping: changed to `Avoid piping above 20 degrees Celsius` (same fix)
- tiered-cake-assembly: changed `If any stand proud, cut them slightly shorter` to `Avoid leaving any proud of the surface; trim them slightly shorter if needed`

**Grade-level fixes:**
- naked-cake-technique: broke long sentence (grade 16.5) into three shorter sentences

**Glossary coverage fix:**
- swiss-meringue-buttercream: body step 1 split into three text nodes so `bain-marie` is wrapped in a `glossaryTooltip` mark with `termSlug: "bain-marie-meringue"` (term registered but not used inline)

**Equipment detection fix:**
- blackcurrant-plate-pie: added "Using a rolling pin" to assembly step body text (EQUIPMENT_NOUN_RE reads body prose, not the recipeTools array)

**prose-prep-steps fix:**
- battenberg-cake: step 2 in "Baking the sponges" had three consecutive short imperatives (Add / Fold / Divide, each <= 8 words). Merged the first two into one sentence to break the run.

**body-missing-method fix:**
- chocolate-curls-shavings: all four technique sections were prose paragraphs with no orderedList and no method-type heading. Converted each section to an orderedList (3-4 items per section).

**Voice warnings (non-blocking, uploaded as PUBLISHED):**
- bolo-de-mel-madeira: voice-check warns "molasses" prefers "treacle"; ingredient slug `molasses` is valid in the master table; uploaded as PUBLISHED
- cheese-and-marmite-scones: voice-check warns "Marmite" is a brand trademark; standard British baking ingredient; uploaded as PUBLISHED
- chocolate-curls-shavings: voice-check warns tricolon in excerpt; accepted

## QC result

Post-publish QC (`--recently-published --since "3 hours ago"`):
- 43 candidates processed (includes 3 pre-existing crochet entries)
- 38 batch-028 entries: all PASS
- 2 batch-028 entries fixed manually and re-uploaded in this session: battenberg-cake (prose-prep-steps), chocolate-curls-shavings (body-missing-method)
- 3 pre-existing blocked entries (not batch-028): crochet-magic-ring, how-to-hold-a-crochet-hook, how-to-work-a-treble (all hero-missing)

Final state: 40/40 batch-028 entries PUBLISHED with clean QC.

## Baking count

990 PUBLISHED after batch-028 completes.
