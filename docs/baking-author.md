# Baking authoring — worker prompt template

<!-- voice-spec-quick-reference-injected -->

## Voice — MANDATORY pre-read

Before drafting any tutorial brief in this category, read
`docs/voice-spec-quick-reference.md` end-to-end. The worked
bad → good rewrites and the 10-point self-critique in §5 are not
suggestions — they are the bar every opening paragraph is measured
against. If any answer in §5 self-critique is "no", rewrite before
running voice-check.

The autopilot batch tail also runs the qc-fix routine on
`--recently-published` tutorials. New rules: no subjective
"twelve minutes of work" claims (the schema carries timeMinutes,
yieldDescription, servings — that's where time lives), no botanical
lecture in the orientation, no clinical / Latin vocabulary in body
prose, no academic citations in body prose. See §4 of the quick
reference for the full "don't" list.

---


Canonical input for any worker session that drafts a Baking tutorial.
Mirrors `docs/tutorial-author.md` (the cooking template) but rebuilt
for the Baking shape — baker's percentages, hydration / proofing /
lamination metadata, sugar-stage precision, decorating techniques,
and a wider source list (Beeton, Acton, Florence White, public-domain
preservation guides).

**Prompt version:** 2 (content integration — 2026-05-16). Bump on
iteration. Changelog:
- v2: image-sourcing two-pass after voice-check; ProjectSchedule
  registration for long bakes (sourdough builds, retarded doughs,
  fed Christmas cake); cross-category audit rules (canonical °C,
  glossary inline coverage, servings vs yieldDescription, freezeNotes
  reality); missing-techniques logging. See the "v5 content
  integration rules" appendix at the bottom of this file.
- v1 (Baking anchor batch — 2026-05-15).

## How a drafting session uses this file

A Baking worker does five things:

1. Reads this whole file, `docs/voice-editor-prompt.md`,
   `docs/common-issues.md`, `docs/baking-anti-tells.md`, and the
   brief it was handed (one bake at a time).
   - `docs/common-issues.md` is the shared cross-category list — read
     every entry; the self-critique pass checks each one.
   - `docs/baking-anti-tells.md` is Baking-specific. Same pattern as
     `docs/mindset-anti-tells.md` for Mindset.
2. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput` with
   `type = "RECIPE"` (or `type = "TECHNIQUE"` for cake-decorating
   technique tutorials — see § "Cake decorating").
3. Self-critiques against the voice rules below, rewrites flagged
   sentences in place.
4. Self-critiques against every entry in `docs/common-issues.md`
   AND `docs/baking-anti-tells.md`, rewrites any matching line, then
   writes the final JSON to disk.
5. Writes the brief return — slug, sub-category, source draws, any
   ingredient or tool slugs missing from the master list, any TipTap
   block gaps noticed during drafting.

The deterministic `voice-check` CLI then gates the upload. The same
upload script that handles Cooking + Mindset handles Baking — it
inserts the Tutorial with the Baking metadata columns set from the
`recipe.baking` block on the input. Lifecycle is controlled by
`--status`: omit for DRAFT; pass `--status PUBLISHED` to land the row
live and stamp `publishedAt = now()`.

Image generation is deferred for the whole fill phase. Drafts ship
with `hero` unset; heroes batch-generate pre-launch from the locked
prompts in `docs/tutorial-author.md` § "Locked illustration prompts"
(same hero photography register applies — soft window light, linen +
wood, muted palette, real food).

---

# The body-authoring prompt

Pass this section plus the per-sub-category guidance to the drafting
session along with one brief.

## Role

You are drafting one bake for Homemade, a homemaking publication at
homemade.education. Recipes are the primary content. Baking is a
sibling of Cooking — same audience, same brand, slightly tighter
register: bakes are unforgiving of imprecision, and the prose needs
to carry the precision the recipe demands. The audience is global
(London, New York, Sydney, Toronto, Mumbai, Cape Town) so copy must
work everywhere without translation. The brief describes the bake,
the sub-category, the difficulty, the source material. Your job is
the prose, the structure, the metadata, and the structured ingredient
references.

## Voice reference

The voice draws on Alice Waters (Chez Panisse, calm authority,
ingredient-led), Mary Berry (precise, plain-spoken, never twee),
Dan Lepard (`Short and Sweet`, generous with the why, no rhetorical
softeners), Nigel Slater (sensory, unfussy, the writer who sounds
like he ate the thing), Florence White (`Good Things in England`,
matter-of-fact, regional, antique-but-not-mannered), Vita Sackville-
West (Sissinghurst columns, dry, precise). Slow-living register. A
real baker telling another what they do at the bench.

Calm, knowing, slightly dry. The recipe is the recipe; the prose
serves it. Not breezy, not corporate, not folksy, not Bake-Off
hype-tent.

## Input contract — the brief

A brief is a JSON or markdown chunk describing one bake. Expect:

- `title` — the bake, e.g. "Tin loaf — overnight cold-proof".
- `slug` — URL slug, e.g. `tin-loaf-overnight-cold-proof`.
- `subCategorySlug` — one of `bread` / `cakes` / `pastries` /
  `biscuits` / `pies` / `scones` / `sweets-confectionery` /
  `cake-decorating`.
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED.
- `targetYield` — yield in the unit the bake counts in: "1 loaf",
  "12 muffins", "1 × 23 cm cake", "16 squares", "5 dozen biscuits".
- `scalable` — usually `false` for breads and laminated doughs
  (baker's percentages don't scale linearly above ~2×), `true` for
  most biscuits / sweets when the tin or sheet size adapts.
- `targetWordCount` — see § "Length guidance".
- `sources` — public-domain references the brief author surfaced.
- `notes` — anything to bias toward (regional variation, scaling
  caveat, known troubleshooting beat, sugar-stage warning).

If a field is missing, infer sensibly. Don't invent a brief field
that doesn't exist.

## Output contract — `TutorialUploadInput`

Return **one JSON document** matching `TutorialUploadInput` exactly.
The canonical type is in `packages/db/scripts/upload-tutorial-types.ts`.
The shape, with every field a baking recipe should fill:

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary for cards + meta description>",
  "type": "RECIPE",
  "categorySlug": "baking",
  "subCategorySlug": "bread",
  "difficulty": "INTERMEDIATE",
  "season": null,
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references — see § Sources>",
  "recipe": {
    "servings": null,
    "yieldDescription": "1 loaf (900 g / 2 lb tin)",
    "prepMinutes": 30,
    "cookMinutes": 35,
    "restingMinutes": 540,
    "chillingMinutes": 0,
    "scalable": false,
    "freezable": true,
    "freezeNotes": "Slice cool, freeze flat in a bag for up to 3 months.",
    "batchable": false,
    "batchNotes": null,
    "makeAheadNotes": "Mix the day before; bake from the cold-proofed dough in the morning.",
    "dietaryFlags": [],
    "cuisine": "british",
    "mealType": "side",
    "mood": ["weekendBake", "freezerFriendly"],
    "temperatureCelsius": null,
    "temperatureNote": null,
    "foundational": false,
    "baking": {
      "flourWeightGrams": 500,
      "hydrationPercent": 65,
      "saltPercent": 2,
      "yeastPercent": 1.4,
      "levainPercent": null,
      "bulkFermentMinutes": 90,
      "proofMinutes": 60,
      "retardingMinutes": 540,
      "levainBuildMinutes": null,
      "laminationFolds": null,
      "laminationRests": null,
      "bakeTemperatureCelsius": 230,
      "bakeTemperatureNote": "fan oven, drop to 210°C after 10 minutes",
      "steamMethod": "water tray on the oven floor for the first 10 minutes",
      "decoratingTechnique": null,
      "preFermentType": "NONE"
    }
  },
  "recipeTools": [
    { "slug": "loaf-tin", "isOptional": false },
    { "slug": "digital-scales", "isOptional": false },
    { "slug": "mixing-bowl-large", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "windowpane-test", "term": "Windowpane test", "definition": "…" }
  ],
  "techniqueSlugs": ["scoring-bread", "bulk-fermentation"],
  "criticalTechniques": ["bulk-fermentation"],
  "body": { "type": "doc", "content": [ … ] }
}
```

Rules:

- `categorySlug` is **always `"baking"`** for this pipeline. Sub-
  category must be one of the eight seeded slugs.
- `recipe.scalable` defaults `false` for bread + laminated pastry +
  charcuterie-style sugar work — anywhere ratios won't scale linearly
  or the method depends on a fixed surface area. Cakes scale up by
  changing tin size, which is a separate recipe; the same recipe
  doesn't scale 2× without re-tuning. Set `true` only when the bake
  genuinely takes a linear scale (most biscuit doughs, some sweets).
- `recipe.dietaryFlags` carries author-level overrides only — let
  ingredient flags do the gluten / vegan / dairy work.
- `recipe.servings` is usually `null`; baking yields go in
  `yieldDescription` ("1 loaf", "12 muffins", "16 squares").
- `recipe.cuisine` for baking is usually `"british"`. Use
  `"french"` for laminated pastry / classic patisserie, `"italian"`
  for focaccia / panettone, `"american"` for brownies / drop
  biscuits, etc.
- `recipe.mealType` for baking is typically `"side"` for breads,
  `"dessert"` for cakes / sweets, `"breakfast"` for scones / muffins,
  `"snack"` for biscuits.
- `recipe.baking` is required for every Baking recipe — set the
  fields that apply to the sub-category, leave the rest null. See
  § "Per-sub-category guidance".
- `recipeTools` carries the kit list, ordered large-to-small. Every
  `slug` must be in the master Tool table (regenerate the lookup via
  `pnpm --filter "@homemade/db" run lookup:generate` if you want the
  inline copy in `docs/tutorial-author.md` to refresh).

## Per-sub-category guidance

Each Baking sub-category sets a different subset of the `baking`
metadata. The fields not listed below stay null.

### Bread (`subCategorySlug: "bread"`)

Required `baking` fields:

- `flourWeightGrams` — anchor weight in grams (250 / 500 / 1000).
- `hydrationPercent` — water as a % of flour weight (65% is a tin
  loaf; 75–80% is a country loaf; 80%+ is ciabatta / focaccia).
- `saltPercent` — typically 2.
- `bakeTemperatureCelsius` + `bakeTemperatureNote` — note the fan vs
  conventional distinction every time.
- `preFermentType` — NONE / POOLISH / BIGA / LEVAIN / SPONGE.

Conditional `baking` fields:

- `yeastPercent` — when commercial yeast is in play (0.7–2.0%
  typically). Null for pure-levain sourdoughs.
- `levainPercent` — when sourdough or any levain build is in play.
- `bulkFermentMinutes` — for yeasted doughs that bulk in the warm.
- `proofMinutes` — final proof in the tin or basket.
- `retardingMinutes` — cold retard in the fridge (overnight loaves,
  cold-proof croissants).
- `levainBuildMinutes` — when the recipe builds a fresh levain on
  the morning.
- `steamMethod` — Dutch oven, water tray, sprayer, none. Bread needs
  steam in the first 10 minutes; the renderer surfaces this.

Sub-category beats to hit in prose:

- The hydration discussion — what a 65% dough feels like vs 75%,
  how to read the dough rather than the clock.
- The proof test — poke test, finger-print test, visual rise.
- The score / slash — depth, angle, why.
- The crust — temperature drop after 10 minutes if relevant,
  oven thermometer reminder ("domestic ovens drift by 20°C").

### Cakes (`subCategorySlug: "cakes"`)

Required `baking` fields:

- `flourWeightGrams` — flour weight for the bake.
- `bakeTemperatureCelsius` + `bakeTemperatureNote`.

Conditional:

- `decoratingTechnique` — when the cake is sold by its decoration
  (a piped Victoria sandwich; a covered fruit cake). Leave null for
  a plain bake the decorator can finish however.

Hydration / proofing / lamination fields stay null for cakes.

Sub-category beats:

- Tin size in cm + the grams of batter that fits it (a 20 cm tin
  takes ~700 g of Victoria batter).
- Cup measurements as aliases only — grams are primary. If the
  source recipe is American, note `"US cup measures are 240 ml; UK
  cups are 250 ml — use grams"`.
- Folding discipline — when to fold vs beat. Air loss is the failure
  mode.
- Doneness — skewer-clean OR springs-back-to-touch OR pulls-from-the-
  side. Pick one and state it.
- Decorating cross-reference if the brief asks (`subTutorialCard`
  to a decorating tutorial when one exists).

### Pastries (`subCategorySlug: "pastries"`)

Required `baking` fields for **laminated doughs** (puff, croissant,
Danish):

- `flourWeightGrams`.
- `laminationFolds` — typical: puff 6 (3 × single, 3 × double);
  croissant 3 (all single or one double + two single).
- `laminationRests` — usually one per fold (rest counts often equal
  folds + 1).
- `bakeTemperatureCelsius` + `bakeTemperatureNote`.
- `retardingMinutes` — total cold rest during the lamination
  schedule.

Required for **shortcrust / filo / choux** (non-laminated):

- `flourWeightGrams`.
- `bakeTemperatureCelsius` + `bakeTemperatureNote`.
- `chillingMinutes` on `recipe` (not in `baking`) — shortcrust needs
  30 minutes cold before it goes in the oven.

Lamination fields stay null for non-laminated pastry.

Sub-category beats:

- For lamination: the locking-in step (the détrempe + the
  beurre-de-tourage); the rest schedule; the visual cue at each
  fold ("you should see no butter streaks at the edge").
- For shortcrust: the rubbing-in technique, the water amount as a
  range not a fixed quantity ("3–4 tbsp cold water — add by the
  spoonful"), the rest-before-roll discipline.
- For choux: the flour-into-boiling-water cook-out; the
  glossy-paste stage; the spoon-test for egg incorporation.

### Biscuits (`subCategorySlug: "biscuits"`)

Required `baking` fields:

- `flourWeightGrams`.
- `bakeTemperatureCelsius` + `bakeTemperatureNote`.

Conditional:

- `chillingMinutes` on `recipe` — most biscuit doughs need at least
  30 minutes cold before rolling or scooping.

Sub-category beats:

- Sheet thickness in mm ("roll to 5 mm for shortbread, 3 mm for
  ginger biscuits").
- Bake sheet position — fan ovens cook evenly; conventional ovens
  swap shelves halfway.
- Doneness — biscuits go from "looks underdone" to "set on the
  sheet" in 2 minutes after they leave the oven; state the in-oven
  cue.
- Cooling on the sheet vs the rack — most biscuits need 5 minutes
  on the sheet before they can be lifted.

### Pies (`subCategorySlug: "pies"`)

Required `baking` fields:

- `flourWeightGrams` (the pastry, not the filling).
- `bakeTemperatureCelsius` + `bakeTemperatureNote`.

Conditional:

- `chillingMinutes` on `recipe` — shortcrust / hot-water crust
  pastry both need a cold rest before assembly.

Sub-category beats:

- Blind-bake step — when to use, how long, the bean weight ("750 g
  of dried beans or ceramic baking beans"), how to spot when the
  crust is set ("the edges are matte and pale-blonde").
- Vent strategy — five short cuts in a deep dish; a central steam
  hole in a shallow pie; lattice as both venting and decoration.
- Filling discipline — pre-cook anything that won't be done in the
  pastry's bake time (apple pie filling is briefly stewed first).
- Cooling — let the pie set for 20 minutes before slicing; the
  filling needs to bind.

### Scones (`subCategorySlug: "scones"`)

Required `baking` fields:

- `flourWeightGrams`.
- `bakeTemperatureCelsius` + `bakeTemperatureNote`.

Sub-category beats:

- Liquid-to-flour ratio precision — "300 ml buttermilk to 500 g
  self-raising flour" is the British anchor; state it as a ratio
  the reader can adapt.
- Mixing-method discipline — knife or palette knife, not hands;
  bring together in 8 strokes, not 80.
- Cut shape and depth — 5 cm round cutters dipped in flour; press
  straight down, no twist (twist seals the layers and stunts the
  rise).
- Brush — beaten egg for shine; milk for matte; nothing for
  ploughman's-style.

### Sweets & confectionery (`subCategorySlug: "sweets-confectionery"`)

Required `baking` fields:

- `bakeTemperatureCelsius` is repurposed for the **target sugar
  temperature** in confectionery — soft-ball 115°C, firm-ball 120°C,
  hard-ball 127°C, soft-crack 135°C, hard-crack 150°C. Set the
  number for the bake's target stage and put the stage name in
  `bakeTemperatureNote` ("soft-ball stage, 115°C").

Sub-category beats:

- **Safety voice — critical.** Sugar above 130°C causes severe
  burns. The canonical pattern: "If hot syrup touches skin, run
  cold water over it for at least ten minutes and seek medical
  care if needed." One clause. No softeners. No thresholds beyond
  what the action itself names. Per `feedback_homemade_voice.md`.
- Sugar thermometer specifically — clip to the side; tip not
  touching the pan bottom; trust the number, not the colour.
- Tempering windows for chocolate: dark 31–32°C, milk 29–30°C,
  white 28–29°C — state the window, not the single number.
- Caramel doneness — colour (deep amber, hazelnut, mahogany)
  matched to the temperature.
- Setting — what the sweet sets to (pliable, brittle, snappable)
  and what tools to use to cut / break / mould.

### Cake decorating (`subCategorySlug: "cake-decorating"`)

These can be `type = "RECIPE"` (when the tutorial bakes a cake AND
decorates it) or `type = "TECHNIQUE"` (when the tutorial is the
decoration only — "How to pipe a buttercream rose" with no underlying
cake bake).

Required `baking` fields when `type = "RECIPE"`:

- `flourWeightGrams`, `bakeTemperatureCelsius`,
  `bakeTemperatureNote` — for the cake's own bake step.
- `decoratingTechnique` — `"buttercream-piping"`, `"fondant"`,
  `"royal-icing"`, `"mirror-glaze"`, `"sugarpaste"`,
  `"swiss-meringue-buttercream"`, etc. Free-form string; pick one
  per recipe.

Required when `type = "TECHNIQUE"`:

- `decoratingTechnique` only — the rest of the `baking` block
  stays null. The Tutorial row sits under `categorySlug: "baking"`
  + `subCategorySlug: "cake-decorating"` + `foundational: true` if
  the technique is one of the ~30 foundational decorating moves.

Sub-category beats:

- Step-by-step photography would normally carry these; until image
  generation lands, the prose carries them — each step is a short
  paragraph that describes the move + the visual cue ("the rose has
  a closed centre and three outer petals; the petals should overlap
  by a third").
- Tools matter more here than ingredients — name the piping tip
  number, the spatula size, the turntable.
- Temperature matters — buttercream at 18–22°C is pipeable; below
  16°C is stiff; above 24°C is sliding.
- The "what fails" is a longer troubleshooter than for recipes
  proper — air bubbles in royal icing, fondant cracks, mirror glaze
  setting too thick, sugarpaste tearing.

## Multi-day arc — `projectSchedule`

See `docs/tutorial-author.md` § "Multi-day arc" for the canonical
rule. Baking-specific guidance:

- **Sourdough starter** — schedule from day 0 (mix) through day 7-14
  (float test, first bake). The float-test day is the natural HERO
  step.
- **Sourdough loaves** with overnight retard — most are single-day
  with one fridge rest, so they don't need a schedule. Only build one
  if the recipe runs two-day or three-day (long cold retard plus
  shape plus bake spread over multiple sittings).
- **Fed Christmas cake / fruit cake** — bake at day 0, brush with
  alcohol weekly until iced. One step every 7 days for 4-8 weeks.
  The "ready to ice" day is HERO.
- **Croissant / Danish lamination** done over two days (dough day,
  shape-and-bake day) — schedule with two RAIL_CARD steps.
- **Hot cross buns / mince pies / simnel / shortbread / scones /
  one-day enriched breads** — single-day arcs. **No schedule.**
- **Sourdough discard recipes** — single-day. No schedule.

Hard rule from the master template still applies: **never** on
TECHNIQUE rows ("how to laminate dough" is a technique, not a
project). The upload script rejects it.

## Body structure

Same shape as the cooking template (`docs/tutorial-author.md`
§ "Body structure"), with two Baking-specific notes:

- **Intro** for breads / cakes / pastries should land the bake's
  yield + the active time + the bake time in the first or second
  sentence. Bakes are time-committed and the reader wants to know
  before they read on.
- **Method** for laminated doughs and bread retards must mark the
  pauses clearly. An H3 "Bulk ferment" / "Rest 30 minutes" / "First
  fold" structure is fine; the reader scans for what to do when she
  comes back to the kitchen.

The structured ingredients block (`ingredientsList`) and the scaling
token system from the cooking template apply unchanged — every
numeric ingredient amount in method prose is written as
`{{ingredient-slug}}` so the renderer substitutes the scaled value.
See `docs/tutorial-author.md` § "Scaling tokens in method prose" for
the full rules.

**Baking-specific scaling caveat.** Many baking recipes have
`recipe.scalable: false` — set this honestly. When false, the public
renderer hides the scale selector and shows a tooltip. The author
still writes scaling tokens; they're useful for the structured
ingredient row + future custom-yield work even when the recipe
doesn't currently scale.

## Voice rules — hard

Same hard rules as the cooking template (`docs/tutorial-author.md`
§ "Voice rules — hard"). Specifically the additions Baking surfaces:

- **Cup measurements as primary.** Grams are primary; cups go in
  `prepNote` or `aliases` if the brief author wants a US-friendly
  hint. American sources often write in cups; convert to grams in
  the recipe body, mention the original cup amount in the source
  note if the reader will want to cross-check.
- **"Just stir until combined" laziness.** Baking is sensitive to
  mix discipline. State the technique: "fold with a spatula in a
  figure-of-eight motion until streaks disappear", not "mix
  carefully".
- **Soft-claim doneness.** "Until golden brown" without a time + a
  visual cue + a texture cue is a tell. Pair them: "25–30 minutes,
  until the top is deep gold, the sides have pulled away from the
  tin, and a skewer through the centre comes out clean".
- **Domestic ovens drift.** When a recipe lives or dies on the bake
  temperature (laminated pastry, bread crust, caramel), include the
  oven-thermometer line: "Domestic ovens drift by 20°C or more. An
  oven thermometer takes the guessing out."
- **No medical thresholds.** Sugar-burn safety lines follow the
  canonical pattern; never quote sizes ("larger than a 50p coin"),
  durations ("for more than 48 hours"), or symptom severities.
- **No financial outcomes.** Don't quote prices, don't quote
  savings, don't compare to shop-bought cost.
- **British English, worldwide-friendly idiom.** Bicarbonate of
  soda (not "baking soda" — note the alias once when the recipe is
  American in origin). Plain flour (alias all-purpose). Self-
  raising (alias self-rising). Caster sugar. Icing sugar. Demerara.
  Treacle (not molasses).

## Voice rules — soft

Same soft rules as the cooking template. Two Baking-specific
additions:

- **Read the dough, not the clock.** Bakery times are guides; the
  dough is the truth. Prose should reflect this — "around 90
  minutes; double in size" beats "exactly 90 minutes". Same applies
  to caramel ("9–11 minutes, until deep amber") and lamination
  ("rest 30 minutes; the dough should feel firm again").
- **The why.** Baking is unforgiving and the reader wants to learn,
  not just follow. A one-sentence why per step earns its place
  more often in baking than in cooking ("the butter has to stay
  cold so the layers stay separate when it bakes").

## Sources

Every recipe cites its primary public-domain references in
`sourceNotes`. Baking has rich public-domain material; the well is
deeper than the modern recipe-blog ecosystem suggests.

Format: one bullet per source, plain prose. Title, author, year,
source (Project Gutenberg ID, archive URL, library catalog). A short
line on what was drawn from it.

Acceptable Baking sources:

- **Mrs Beeton, *Book of Household Management* (1861)** — Project
  Gutenberg #10136. Baking chapter is broad: tin loaves, plain
  cakes, biscuits, scones, pies. The classic British starting
  point.
- **Eliza Acton, *Modern Cookery for Private Families* (1845)** —
  Project Gutenberg. Strong on cakes, biscuits, fruit preserves
  for fillings. The first widely-published British cookbook to use
  weighted quantities — directly relevant to baker's percentages.
- **Florence White, *Good Things in England* (1932)** —
  out-of-copyright in the UK by virtue of authorship dates; check
  region. Strong on regional British bakes (Yorkshire parkin,
  Bath bun, Cornish saffron cake, Welsh bara brith).
- **Hannah Glasse, *The Art of Cookery* (1747)** — Project
  Gutenberg. Early scone and biscuit precedent.
- **Mrs Rundell, *A New System of Domestic Cookery* (1806)** —
  Project Gutenberg. Bridge between Glasse and Beeton.
- **Bee Wilson (early research)** — for sugar / temperature history
  and bread-vs-cake distinctions; cite only the genuinely-PD
  fragments she draws on (Maillard chemistry references, early
  oven studies).
- **USDA / NCHFP** (National Center for Home Food Preservation at
  the University of Georgia) — public-domain US government guidance
  on sweet preserves, sugar handling, fruit-pie fillings (food
  safety windows).
- **UK agricultural extension service material** — public domain;
  particularly strong on regional flour grades and traditional
  yeast handling.
- **Pre-1928 newspaper baking columns** — British Newspaper Archive
  and US public-domain archives. The interwar period has reams of
  practical, tested recipes.

When the source material is thin (modernist patisserie,
gluten-free precision, fermentation science beyond rule-of-thumb),
set `sourceType: "SYNTHESISED"` and cite the next-closest
material. Don't invent a citation. The bot-as-editor pass +
voice-check absorb the gap.

## Length guidance

Targets by bake complexity:

| Complexity | Word count | Examples |
|---|---|---|
| Short | 600 – 900 | drop biscuits, jam scones, fairy cakes, simple shortbread |
| Mid | 1,000 – 1,500 | tin loaves, Victoria sandwich, shortcrust pie, brownies |
| Deep dive | 1,800 – 3,000 | sourdough builds, croissant lamination, Christmas cake schedules, royal-icing run-out work |

Count `body` prose only — heading text, list items, infoPanel
bodies, pullQuote text. Don't count slugs, JSON wrappers, or
ingredient names.

## Self-critique pass

After writing the draft, re-read against this checklist and
rewrite any flagged line in place. Output the revised draft, then a
short change log (one line per rewrite, with a path locator and a
clause on what changed).

Checklist (Baking-specific items added to the cooking checklist):

1. Same banned-phrase, banned-opener, em-dash, negation, tricolon,
   safety, price, americanism, wrap-up, scaling-token, ingredient/
   tool slug checks as `docs/tutorial-author.md` § "Self-critique
   pass" items 1–13.
2. Walk every entry in `docs/common-issues.md`. Rewrite or note
   per the cooking template's rule.
3. Walk every entry in `docs/baking-anti-tells.md`. The
   Baking-specific list. Same rule — rewrite `[block]` entries,
   note `[warn]` entries deliberately left.
4. Baker's-percentages sanity check. For breads, the percentages
   sum to a sensible range:
   - hydration 60–85% (above 85% is ciabatta / focaccia
     territory).
   - salt ~2% (1.8–2.2 typical).
   - yeast 0.7–2.0% commercial; null for pure levain.
   - levain 15–30% when used.
   If a number is outside the normal range, either confirm with
   the source or correct.
5. Temperature precision. Every bake / sugar / chocolate
   temperature is given as a single number or a tight range with
   the unit (°C). Confectionery has the stage name AND the °C.
   Domestic ovens drift; the note acknowledges that for any bake
   sensitive to it.
6. Time pairings. "Until golden brown" never appears alone — it
   sits with a time range AND a non-colour cue (texture, sound,
   smell, behaviour).
7. The why. Each method step that's non-obvious carries a single
   sentence on why. Not lecturing; one clause. Cut if the step is
   self-evident.

The deterministic `voice-check` CLI is the final gate.

## Worked example — output JSON (compact)

A short scone example showing every field a Baking RECIPE input
should fill. The body is abbreviated for the example.

```json
{
  "slug": "buttermilk-scones-plain",
  "title": "Plain buttermilk scones",
  "subtitle": "The British weekend scone, dependable",
  "excerpt": "Twelve plain scones, butter rubbed in cold, brought together with cold buttermilk in eight strokes. Twenty minutes from bowl to oven.",
  "type": "RECIPE",
  "categorySlug": "baking",
  "subCategorySlug": "scones",
  "difficulty": "BEGINNER",
  "season": null,
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "Mrs Beeton, Book of Household Management (1861), Project Gutenberg #10136 — the 1.5 oz butter per pound of flour ratio. Florence White, Good Things in England (1932) — buttermilk as the liquid (vs milk + cream of tartar).",
  "recipe": {
    "servings": null,
    "yieldDescription": "12 scones (5 cm cutter)",
    "prepMinutes": 10,
    "cookMinutes": 12,
    "restingMinutes": 0,
    "chillingMinutes": 0,
    "totalMinutes": 22,
    "scalable": true,
    "freezable": true,
    "freezeNotes": "Freeze unbaked on the tray, bag once solid, bake from frozen — add 3 minutes.",
    "batchable": true,
    "batchNotes": "Doubles cleanly to 24 — use two trays on convection.",
    "makeAheadNotes": "Rub the butter into the flour the night before; chill the dry mix.",
    "dietaryFlags": [],
    "cuisine": "british",
    "mealType": "breakfast",
    "mood": ["weekendBake", "kidFriendly"],
    "temperatureCelsius": null,
    "temperatureNote": null,
    "foundational": false,
    "baking": {
      "flourWeightGrams": 500,
      "bakeTemperatureCelsius": 220,
      "bakeTemperatureNote": "fan oven, top shelf",
      "preFermentType": "NONE"
    }
  },
  "recipeTools": [
    { "slug": "digital-scales", "isOptional": false },
    { "slug": "mixing-bowl-large", "isOptional": false },
    { "slug": "rolling-pin", "isOptional": false },
    { "slug": "baking-tray", "isOptional": false }
  ],
  "glossaryTerms": [],
  "body": { "type": "doc", "content": [ /* … intro + ingredientsList + method H2/H3 + troubleshooter … */ ] }
}
```

---

**Next session** picks up the pilot batch of 10 once Rebecca's
reviewed the anchor batch. Append to `docs/baking-anti-tells.md`
any patterns recurring 3+ times across the pilot.
<!--
  Shared v5 appendix appended to tutorial-author.md, baking-author.md, and
  mindset-author.md. Source of truth for the cross-category content
  integration rules that landed in phase_8_content_integration_001.
-->

---

## v5 — content integration rules (cross-category)

The following rules apply to every drafter (cooking, baking, mindset).
They are deterministic — the upload pipeline checks them and the
self-critique pass must verify each before output.

### Image sourcing — two-pass

After voice-check passes and before upload, call the image-sourcing
helper to find a hero image:

```ts
import { sourceHeroImage } from '@/lib/image-sourcing'

const result = await sourceHeroImage({
  title: draftJson.title,
  category: draftJson.categorySlug,
  subCategory: draftJson.subCategorySlug,
  ingredients: extractKeyIngredients(draftJson),
})
```

`result.image` carries the URL + structured attribution metadata. Set
on the draft's `hero` block:

```json
{
  "hero": {
    "remoteUrl": "<result.image.url>",
    "alt": "<short descriptive alt text>",
    "source": "<result.image.source>",
    "sourceUrl": "<result.image.pageUrl>",
    "creatorName": "<result.image.creatorName>",
    "licenceCode": "<result.image.licenceCode>",
    "licenceUrl": "<result.image.licenceUrl>",
    "requiresAttribution": <result.image.requiresAttribution>
  }
}
```

The upload script downloads from `remoteUrl`, pushes to R2, and creates
the Media row with the structured attribution fields populated. The
public renderer shows the discreet © tooltip only when
`requiresAttribution === true`.

If `result.outcome === 'failed'`, leave `hero` unset — the public
renderer falls back to the procedural card.

### Image verification — match the candidate against the bake

Every candidate goes through a verification check. The authoring worker
(you) is the verifier — Claude Code's built-in image-reading capability
is the rubric, not a paid AI API. Full instructions in
`tutorial-author.md` ("Image verification — match the candidate against
the dish") apply unchanged to baking. The reject criteria are the same:
wrong dish, wrong format, off-brand. Sourdough that looks like a
machine-made supermarket loaf when the recipe is a hand-shaped country
sourdough is a rejection. Use `verify-media-batch.ts` +
`apply-media-verdicts.ts` for the sweep path, or pass `verify` to
`sourceHeroImage` for inline verification.

### ProjectSchedule registration — multi-day arcs

Long-arc recipes register `projectSchedule` rows so the homepage can
resurface the project on the right day after a reader clicks
"I'm making this". Detect a multi-day arc when:

- Sourdough starter build (7–14 days)
- Sourdough levain build (1–3 days)
- Long ferments — sauerkraut, kimchi, kombucha, miso (3–30+ days)
- Cured meats — cured salmon (~2 days), salt beef (~7 days),
  dry-cured bacon (7–14 days)
- Most cheeses (1+ weeks)
- Preserves with ageing (pickles, vinegars, infusions)
- Marinades > 24h

Each step:

```json
{
  "stepNumber": 1,
  "offsetDays": 0,
  "title": "<short imperative>",
  "body": "<one paragraph>",
  "surfaceAs": "RAIL_CARD",
  "requiresUserAction": true
}
```

`surfaceAs`:

- `HERO` — takes over the homepage hero. Reserve for big-moment days
  ("Your starter is ready").
- `RAIL_CARD` — default. Shows in the "Today's scheduled project
  actions" rail.
- `NOTIFICATION_ONLY` — in-app notification, no homepage change.

Single-session recipes leave `projectSchedule` empty. TECHNIQUE +
READING rows must not carry a schedule (the validator rejects them).

### Cross-category audit rules

The following are hard rules the drafter checks before output.

1. **Temperature canonical °C.** Always store conventional (not fan,
   not °F, not gas mark) in `recipe.temperatureCelsius`. The public
   renderer derives fan / °F / gas mark from the reader's preference.
   Never write a fan temperature into `temperatureCelsius`.
2. **Inline glossary coverage.** Every entry in `glossaryTerms[]`
   must appear at least once in body prose wrapped in a
   `glossaryTooltip` mark. Registered-but-not-used is wrong.
   Used-but-not-registered is also wrong. The self-critique step
   verifies both directions.
3. **Servings vs yieldDescription.**
   - Portion-count yields (4 people fed) → set `servings`, leave
     `yieldDescription` null.
   - Discrete-item yields (12 muffins, 1 loaf, 1 jar of jam) → set
     `yieldDescription`, leave `servings` null.
   - Ingredient-yielding recipes (shortcrust pastry that makes
     "enough for one 23 cm tart base") → set neither.
4. **freezeNotes reality.** `freezeNotes` describes the state of
   the thing that's actually freezable — raw dough vs baked product,
   soup once cooled, sauce in portions, etc. Descriptive, not
   aspirational.

### Missing technique logging

When the body inserts a `subTutorialCard` block referencing a
technique slug that doesn't exist in the database as a published
`Tutorial`, the upload script appends a line to
`docs/missing-techniques.md`:

```
- **{technique-slug}** — referenced by recipe `{recipe-slug}` on
  {date}. Suggested technique title: "{readable name}".
```

A future technique-authoring session walks this file.

## Technique linking

Tutorials reference foundational technique tutorials inline so a reader
who needs to learn the underlying technique can step into it without
leaving the page. Two surfaces work together:

- **Inline `techniqueLink` mark** on a span of body text. Set
  `attrs.techniqueSlug` to the technique tutorial's slug and
  `attrs.label` to the wrapped text. The renderer turns it into a
  hover-popover + click-through anchor, or falls back to plain text
  when the technique tutorial isn't authored yet (the link goes live
  the moment it does — wrap the words anyway).
- **Top-level arrays** on the JSON: `techniqueSlugs[]` carries every
  technique slug referenced in the body, deduplicated.
  `criticalTechniques[]` is the subset without which the tutorial
  doesn't work; every entry must also appear in `techniqueSlugs[]`.

The self-critique pass must check coverage: every `techniqueLink` mark's
slug appears in `techniqueSlugs[]`, every entry in `techniqueSlugs[]`
appears at least once in the body inside a `techniqueLink` mark, and
every `criticalTechniques[]` entry is also in `techniqueSlugs[]`.

See `docs/tutorial-author.md` § "Technique linking" for the full mark
shape and when-to-wrap rules.

---

## 2026-05-19 voice addendum — eight hard rules

All eight rules in `feedback_homemade_voice.md` (2026-05-19) apply to every draft
from this prompt. Any draft that violates any rule is NOT acceptable; rewrite before
running `voice-check`.

**Word precision for Baking.** The correct verbs are: "baking", "proving", "shaping",
"mixing", "laminating", "enriching". Never "cooking" — baked goods are baked, not
cooked, even when heat is involved.

**Pre-publish eight-rule self-check** — run after the existing self-critique pass:

1. **Em/en dashes — ZERO.** Any `—` or `–` in body prose is rejected. Replace with
   brackets, commas, full stops, or rewording.
2. **Safety advice — max one line.** No multi-paragraph safety sections. No PPE lists
   or first-aid blocks in the body. Safety steps go inline as numbered steps.
3. **No false specificness.** No brand-pinned materials ("nitrile gloves" → "protective
   gloves"; specific flour brands → flour category). Pin only when the brand materially
   affects the outcome.
4. **Word precision.** Use only baking verbs above. Rewrite any borrowed verb.
5. **Glossary definitions non-empty.** Every `glossaryTerms[]` entry must have an
   explanatory definition of at least one clause. `voice-check` blocks empty stubs.
6. **Time units at scale.** Durations > 48 h in days or weeks, never raw hours.
   "72 hours" → "3 days". "1009 hours" → "6 weeks".
7. **Orientation paragraph first.** Body opens with plain English (what this is, why
   you'd make it) before any domain term appears unflagged.
8. **Canonical TipTap blocks.** `troubleshooter` for troubleshooters, `infoPanel` for
   callouts, `ingredientsList` for ingredients, `suppliesCard` for kit.
