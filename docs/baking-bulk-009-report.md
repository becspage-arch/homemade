# Baking bulk-009 batch report

**Date:** 2026-05-18  
**Model:** claude-sonnet-4-6  
**Batch:** bulk-009 (autopilot-queue)  
**Status uploaded:** PUBLISHED

---

## Entry count by sub-category

| Sub-category | Count |
|---|---|
| bread | 15 |
| cakes | 10 |
| biscuits | 10 |
| scones | 5 |
| **Total** | **40** |

Difficulty split: ~20 BEGINNER / ~18 INTERMEDIATE / 2 ADVANCED.

---

## Notable entries

**Bread (15):** cottage-loaf, bloomer, brioche-burger-buns, hot-dog-buns, dinner-rolls-pull-apart, six-strand-challah, bagels-new-york-style, crumpets, english-muffins, chelsea-buns, cinnamon-rolls-american, focaccia-rosemary-and-sea-salt, ciabatta, pretzel-rolls, shokupan. Covers the full everyday-bread spectrum from plain white loaves through enriched doughs (brioche, challah, cinnamon rolls, shokupan tangzhong method) to specialist prep (pretzel bicarbonate bath, bagel boiling).

**Cakes (10):** victoria-sponge-with-buttercream (foundational), coffee-and-walnut-cake, carrot-cake, tea-loaf, lemon-and-poppyseed-cake, olive-oil-cake (glutenFree), orange-and-almond-cake (glutenFree), marble-loaf, simnel-cake (season SPRING), genoa-cake. Two gluten-free entries (almond/olive-oil base). Simnel cake is the only WINTER/SPRING seasonal entry.

**Biscuits (10):** shortbread-all-butter-rounds (foundational), digestives (foundational), ginger-nuts, custard-creams, bourbon-biscuits, florentines (glutenFree), gingerbread-men, lebkuchen (season WINTER), brownies-fudgy, brownies-cakey. Two foundational entries. Brownies placed in biscuits (no traybake sub-category). Florentines are gluten-free (all fruit/nut/chocolate, no flour).

**Scones (5):** plain-scones (foundational), fruit-scones, cheese-scones, rock-cakes, fat-rascals. All BEGINNER. Cheese scones use english-mustard-powder. Rock cakes use the drop-scone method (no rolling or cutting). Fat rascals include the Yorkshire glazed-cherry-and-almond face decoration.

---

## Voice-check summary

All 40 files passed voice-check (exit code 0 or 1) after fixes. No upload was blocked.

**Errors found and fixed (exit code 2 → fixed before upload):**

The dominant failure mode was em-dash pairs (two em-dashes in one paragraph or sentence), which the voice-check rejects. Affected 17 files across two patterns:

1. **Paired em-dashes used as parentheses** (`— description —`): 14 files. All fixed by replacing with `(description)` or removing the second em-dash.
   - `bagels-new-york-style.json` — body paragraph (not dry parchment)
   - `brioche-burger-buns.json` — excerpt (brioche ratio)
   - `brownies-fudgy.json` — body paragraph[0] (ribbon stage description) + paragraph[6] (cooling)
   - `cinnamon-rolls-american.json` — excerpt (enriched dough ingredients list)
   - `crumpets.json` — body paragraph[0] (crumpet holes)
   - `custard-creams.json` — body paragraph[0] (roll to 3 mm)
   - `digestives.json` — body paragraph[0] (rolling thin)
   - `dinner-rolls-pull-apart.json` — body paragraph[0] (modest enrichment)
   - `english-muffins.json` — body paragraph[8] (no oil needed)
   - `fat-rascals.json` — body paragraph[0] (cherry eyes and almond teeth)
   - `florentines.json` — body paragraph[0] (chocolate setting timing)
   - `olive-oil-cake.json` — body paragraph[0] (oil description)
   - `pretzel-rolls.json` — body paragraph[0] (baked soda bath description)
   - `six-strand-challah.json` — body paragraph[0] (glaze applied twice)

2. **Two separate em-dash clauses in one paragraph** (different sentences): 3 files. Fixed by converting one em-dash to a colon, full stop, or semicolon.
   - `focaccia-rosemary-and-sea-salt.json` — body paragraph[0] (em-dash → colon)
   - `lemon-and-poppyseed-cake.json` — body paragraph[6] (em-dash → full stop)
   - `shortbread-all-butter-rounds.json` — body paragraph[6] (em-dash → semicolon)

**Root cause:** The intro paragraph pattern — where the glossary tooltip mark splits the paragraph into multiple text nodes — tends to accumulate em-dashes across node boundaries that aren't visible as a single string during authoring. The voice-check correctly catches these in the combined paragraph text.

**Warnings (exit code 1, uploadable):**

Several files produced tricolon warnings (three parallel items in a heading — "Mix, roll, and bake" style headings). All were accepted by the upload script.

---

## Upload results

| Result  | Count |
|---------|-------|
| CREATED | ~37   |
| UPDATED | ~3    |
| FAILED  | 0     |

3 entries showed explicit UPDATE markers (category path or existing publishedAt shown in upload output): cinnamon-rolls-american, dinner-rolls-pull-apart, focaccia-rosemary-and-sea-salt.

**Baking total after batch-009:** 422 published entries

---

## New glossary terms introduced

`bagel-boil`, `windowpane-test-bloomer`, `bulk-fermentation-cottage`, `chelsea-bun-spiral`, `tangzhong` (already existed — shokupan), `focaccia-dimpling` (already existed), `baked-soda-bath`, `crumpet-holes`, `fork-splitting`, `challah-pareve`, `enriched-dough-brioche`, `creaming-method` (already existed — victoria-sponge), `coffee-essence`, `oil-based-cake`, `tea-soak`, `drizzle-technique`, `almond-flour-baking`, `whole-boiled-orange` (already existed), `marbling-technique`, `eleven-apostles`, `glace-cherry-rinse`, `shortening-effect`, `scone-rubbing-in`, `plumping-dried-fruit`, `mustard-in-cheese-baking`, `drop-scone-method`, `fat-rascal-face`, `docking-biscuits`, `custard-powder-biscuit`, `ginger-nut-snap`, `royal-icing-gingerbread`, `sugar-glaze-lebkuchen`, `brownie-ribbon-stage`, `fudgy-vs-cakey-brownie`, `florentine-chocolate-scoring`, `stretch-and-fold` (already existed — ciabatta), `sandwich-biscuit` (already existed — bourbon-biscuits).

---

## Anti-tells to document

**Em-dash pairs in intro paragraphs** is recurring across all baking batches (also documented in bulk-005 and bulk-006 reports). The intro paragraph is the highest-risk location because the glossary tooltip mark splits text nodes, making paired dashes less visible during authoring. Already documented in `docs/baking-anti-tells.md`.

No new pattern appeared 3+ times in this batch that is not already documented.
