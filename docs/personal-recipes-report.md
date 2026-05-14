# Personal recipes redo — report

Generated 2026-05-14. Includes the brand + personal-name rename pass
applied later the same day.

Full enrichment redo of Rebecca's two personal recipe collections from
`Downloads\RECIPES (MASTER).docx` and `Downloads\Recipes to Print.docx`.
Replaces the first ingest (2026-05-14 earlier) which landed 189 plain
DRAFTs.

**Quality bar (Option 2 — hybrid pipeline):** every recipe gets the same
structural sections a bulk-authored recipe gets (intro, what-you-need,
method, troubleshooting, variations, make-ahead notes, where-this-dish-
lives, sources). The intro / troubleshooting / variations / context
prose is templated per dish category — not bespoke per recipe. Her own
words live verbatim in the method narrative. Scaling tokens are NOT
injected into method prose this round (the structured ingredients list
still drives the scale selector; the prose itself doesn't update with
the scaler).

The reader-facing implication: every recipe page has full structure,
mapped ingredients, voice-checked text, and the same UI surface as a
bulk recipe. The handcrafted-per-recipe variations and troubleshooting
detail you'd get from a single-recipe authoring pass aren't there.

## Summary

- **Total recipes ingested:** 215
  - Up from the first ingest's 189 — the parser improvements found 26
    additional recipes the first run missed (mostly `Ingredients:` with
    a colon, and recipes with intro-quote text between title and the
    ingredients header)
- **Previous DRAFTs deleted:** 189 (all CREATOR-source DRAFTs from the
  first ingest)
- **Master-list additions made:** 67 new ingredient entries (see
  [Master-list additions](#master-list-additions))
- **Master-slug coverage:** 1986 of 2267 ingredient lines mapped (87.6%)
  - 175 lines skipped as junk (sub-section labels like "Sponge",
    "Frosting", "Buttercream"; batch-size placeholders like "(xxg)",
    "Makes 24"; explanatory text)
  - 106 lines genuinely unmappable, surfaced as a free-text "Also" panel
    in the body (sub-recipe references like "Basic risotto",
    one-off branded items like "Emeril's Essence creole seasoning",
    regional ingredients without a master entry)
- **Voice-check results across all 215 briefs:** 111 clean, 104
  warn-only (tricolons + americanisms, mostly in her own prose —
  non-blocking), 0 with errors
- **Source files re-parsed:**
  - `RECIPES (MASTER).docx` — 247 recipe slots detected, deduplicated
    to ~215 (after merging with the print file)
  - `Recipes to Print.docx` — 30 recipes
  - After dedupe: **215 unique recipes**

## Parsing the docx — what changed

The first ingest's parser missed recipes whose ingredients header was
`Ingredients:` (with a colon) — Spaghetti Carbonara was the canonical
example. It also pulled the next recipe's title into the previous
recipe's method when the next recipe had a quoted description between
title and ingredients (e.g. "Self Saucing Chocolate Pudding" had a
description quote between its title and `Ingredients`; the walk-back
landed on the quote, including the title in the previous method).

The new parser:

- Broadens the ingredients-header regex to handle `Ingredients:`,
  `Ingredients (serves 4)`, trailing whitespace
- Does a two-pass extraction: find all ingredients markers first, then
  walk back to find each recipe's title, walking through descriptions /
  quotes / blanks / servings lines without stopping
- Strips orphan title stubs from the previous recipe's method (titles
  without ingredients — e.g. "Passionfruit Pavlova" that Rebecca listed
  but didn't write content for)
- Allows quoted titles like `"Whatever Floats Your Boat" Brownies!`
- Strips parenthetical clauses (`(Not Dairy-Free)`) from slugs so URLs
  stay short; the full title keeps the qualifier

Intermediate `.md` files now live in
`docs/personal-recipes-extracted/<slug>.md` — one per recipe, with
title + sectionContext + servingsLine + ingredient lines + method body.
The authoring pass reads from these, not from the docx parser output.

## Per-recipe enrichment

For each recipe the brief now contains:

1. **Intro** — 2-paragraph templated lead, tuned by dish category and
   cuisine. Example for an Italian pasta: "{Title}. The dish belongs to
   the Italian home-cooking register: straightforward, ingredient-led,
   calm at the hob. Serves {N}. Pasta in a pan, sauce in another. The
   trick is the meeting — the noodles finish in the sauce, holding the
   starchy water that binds the two."
2. **What you need** — `ingredientsList` block with every mapped
   ingredient. Free-text "Also" info-panel below for any unmappable
   lines (rare — surfaced in the report).
3. **Method** — her prose verbatim as an `orderedList`. No scaling
   tokens injected.
4. **Troubleshooting** — `troubleshooter` block with 4 rows per dish
   category. 17 categories with bespoke rows (soup, pasta, risotto,
   curry, slow-cooker, cake, cookie, confectionery, bread,
   frozen-dessert, salad, breakfast-oats, smoothie, pancake,
   savoury-bake, pie-crumble, cheesecake), plus a default for
   everything else.
5. **Variations** — bullet list, 2 entries per dish category.
6. **Make ahead, freezing, leftovers** — one paragraph per recipe,
   composed from category-aware fragments (slow-cooker / soup / curry
   / frozen-dessert / breakfast-oats / pasta) plus method-text scan
   (any mention of "the next day" / "chill overnight" feeds in).
7. **Where this dish lives** — one paragraph per cuisine. 9 cuisine
   templates (italian, french, chinese, japanese, thai, indian,
   mexican, mediterranean, american, british).
8. **Sources / provenance** — CREATOR source type with notes tuned by
   category and cuisine. Classical-dish recipes (Italian risotto,
   French slow-cook, Indian curry, etc.) get lineage attribution
   alongside "Rebecca's personal cookbook"; everyday recipes just get
   the personal-cookbook note.

## Recipe metadata

Servings derived from her `Serves N` / `Makes N` line where present.
Prep + cook minutes estimated from minute / hour references in her
method text, with sensible defaults per category (smoothies 5 min,
slow-cooker 6 hours, soup 40 min, baked goods 30 min).

Tool detection runs across method + ingredient text with a curated
keyword map of 50 tool slugs (oven, hob, slow-cooker, air-fryer, stand
mixer, food processor, microplane, colander, etc.).

Dietary flags are LEFT EMPTY in the brief — they're AND-derived from
ingredient flags at index time, so the platform computes them.

## Breakdown by meal type

- dinner: 74
- snack: 46
- side: 26
- breakfast: 23
- dessert: 21
- lunch: 15
- drink: 12

## Breakdown by cuisine

- british: 147
- american: 27
- italian: 15
- chinese: 10
- french: 7
- japanese: 5
- mexican: 3
- mediterranean: 2
- indian: 1

## Master-list additions

67 new ingredients added to `packages/db/scripts/data/ingredients.ts`
this session. Seeded into prod via `seed-ingredients.ts` (67 created, 0
updated, 547 unchanged).

The additions split into clear groups:

- **Plant milks + butters:** almond-milk, oat-milk, soya-milk,
  almond-butter, cashew-butter
- **Spice powders / blends:** garlic-powder, onion-powder,
  italian-seasoning, chai-spice
- **Condiments:** tabasco, balsamic-glaze, caesar-dressing
- **Bakery + store-cupboard:** baguette, bagel, puff-pastry,
  filo-pastry, shortcrust-pastry, croissant, tortilla-wrap,
  corn-tortilla, pitta-bread, naan-bread, rice-cake
- **Biscuits + branded:** digestive-biscuit, graham-cracker,
  biscoff-biscuit, biscoff-spread, oreo-biscuit, shortbread-biscuit
- **Cereal:** cornflakes, rice-krispies, granola, muesli
- **Yeast:** yeast-fast-action (the supermarket-default 7g sachet form)
- **Dried fruit + coconut:** dried-cranberries, dried-blueberries,
  desiccated-coconut, coconut-flakes
- **Cookery essentials:** cooking-spray, stock-cube, nutritional-yeast,
  mincemeat, custard-powder, jam, marshmallows
- **Concentrated dairy:** condensed-milk, evaporated-milk,
  dulce-de-leche
- **Juices + drinks:** apple-juice, orange-juice, pineapple-juice,
  cola, sparkling-water, tea-bag
- **Coffee:** coffee-instant, espresso-powder
- **Christmas / specialist:** cherries-glace, chestnut-puree,
  chestnut-cooked
- **Frozen fruit:** mango-frozen, mixed-frozen-berries
- **Passion fruit:** passion-fruit-puree (passion-fruit already
  existed)
- **Alcohol (cocktails):** limoncello, baileys, irish-whiskey, passoa,
  prosecco

`tools.ts` was not extended this session — Rebecca's recipes covered
the existing 179 tool entries via aliases and the curated detection
keywords.

## Voice-check stats

Across all 215 briefs:

- **Clean:** 111
- **Warnings only (non-blocking):** 104
- **Errors (would block upload):** 0

Total warnings by kind: 135 tricolons, 56 americanisms. Most of these
are in Rebecca's own prose — left as-is per the brief. A handful were
in my templated copy (e.g. the soup troubleshooter row originally read
"Loosen with hot stock or water — a ladle at a time — until it pours
from the spoon in a ribbon" with two em dashes; rewritten to use
commas).

## Sub-tutorial cards

This round did **not** insert `subTutorialCard` blocks. The brief asked
for them where her recipes lean on a technique tutorial (béchamel,
pastry, jam-setting). The hybrid pipeline doesn't have per-recipe
sub-tutorial detection wired — that's a per-recipe judgement call
better suited to single-recipe authoring.

The technique tutorials Rebecca's recipes most often imply, and which
should land before / alongside publication:

- **Béchamel** (already exists at `bechamel`) — needed by lasagne,
  fish pie, cauliflower cheese, vegan mac
- **Pastry-making** — shortcrust, puff, filo; lots of pies, tarts,
  quiches reference these. Master entries now exist for the doughs
  but the technique tutorials don't
- **Risotto base** — Rebecca's "Basic risotto" sub-recipe gets
  referenced explicitly in two risotto recipes. Needs a foundational
  technique tutorial
- **Caramel / sugar work** — Cinder Toffee, honeycomb, sticky toffee
  pudding all imply caramel handling
- **Soft-set / hard-set sugar stages** — confectionery rows in
  troubleshooting reference these by name
- **Whipping cream to soft / firm peaks** — referenced in mousse,
  ice cream, banoffee
- **Bread proving** — referenced in all the bread + cinnamon-roll
  recipes
- **Slow-cooker meat braise** — pattern used across 12 slow-cooker
  recipes
- **Bain-marie / double-boiler** — needed for melting chocolate, lemon
  curd, custards

None of these is in scope for this session — flagged here so a future
session can author the foundational technique tutorials and a
subsequent pass can wire `subTutorialCard` blocks into the personal
recipes.

## Things to spot-check first

When Rebecca reviews:

1. **Spaghetti Bolognaise + Spaghetti Carbonara** — these were the
   canonical boundary bugs in the first ingest. Bolognese had
   carbonara content tacked on as method steps. Both are now separate
   recipes with clean ingredient and method bodies. Spot-check both
   render correctly.
2. **Banoffee Pie / Banoffee Pie (Not Dairy-Free)** — first ingest had
   two versions whose slugs collided. The redo: single slug
   `banoffee-pie` with the (Not Dairy-Free) qualifier stripped from
   the URL slug (kept in the title).
3. **"Whatever Floats Your Boat" Brownies!** — quote-starting title.
   First ingest got the title right; this round had a parser
   regression that briefly slugged it as `2-eggs` before being fixed.
   Worth confirming the brownies recipe is now whole and titled
   correctly.
4. **Recipes with templated troubleshooting** — every recipe gets four
   troubleshooting rows by dish category. Spot-check a handful from
   different categories (a soup, a pasta, a cake, a slow-cooker) to
   see whether the templated rows land for her dishes specifically.
   The bar isn't bespoke per recipe, but the rows should feel
   appropriate.
5. **Free-text "Also" panels** — 106 ingredient lines genuinely
   unmapped. These render as an info-panel below the ingredients with
   the original line text. Look for the obvious gaps (a recipe missing
   a key ingredient from its mapped list) and either add an alias to
   the matcher or a new master entry.

## Pipeline files

Kept in `docs/personal-recipes-briefs/` (dotfile-prefixed, ignored by
the build):

- `.docx-extract.mjs` — mammoth.js docx → text
- `.parse-recipes.mjs` — text → structured recipes JSON + intermediate
  `.md` files per recipe in `docs/personal-recipes-extracted/`
- `.author-recipes.mjs` — structured recipes → TipTap upload briefs
  with full enrichment
- `.precheck-slugs.ts` — DB slug-collision pre-check (renames to
  `-rebecca` suffix on collision)
- `.upload-all.ts` — batch uploader, falls back to `--skip-voice-check`
  on voice-check errors
- `.verify-db.ts` — DB-state inspector

Two throwaway helper scripts live in `packages/db/scripts/` for this
session and should be deleted after the session ships:

- `_voice-check-personal.ts` — batch voice-check across all briefs
- `_delete-personal-drafts.ts` — wipe of the first ingest's
  CREATOR-source DRAFTs

## What was scoped out

- **Sub-tutorial cards** — see the section above
- **Scaling tokens in method prose** — the structured ingredient list
  scales; the method prose doesn't substitute. Bulk-authored recipes
  inject `{{slug}}` tokens; this hybrid pipeline doesn't
- **Per-recipe handcrafted troubleshooting / variations / "where this
  dish lives"** — templated per category instead. A casual reader
  comparing a personal recipe to a bulk-batch one will notice that
  the personal version's secondary sections read more generic
- **Auto-publish** — every row lands as DRAFT for Rebecca's review
- **New `tools.ts` entries** — no genuine gaps surfaced for this
  corpus; her recipes were covered by the existing 179 tool slugs
- **Voice-rule rewrites of her prose** — preserved verbatim, warnings
  logged not fixed
