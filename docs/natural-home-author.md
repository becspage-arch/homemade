# Natural-home authoring — worker prompt template

Canonical input for any worker session that drafts a Natural-home
tutorial (soap, candle, balm, lotion, deodorant, surface spray,
home-fragrance preparation). Mirrors `docs/baking-author.md` in
precision register and `docs/herbal-author.md` in botanical-glossary
shape. Natural-home recipes are recipes — gram-accurate, conventional
°C, no flourish, percentage-anchored where the formulation demands it.

**Prompt version:** 1 (Natural-home pipeline scaffold — 2026-05-18).
Inherits the v5 content-integration appendix that lives at the bottom
of `docs/baking-author.md` (image two-pass, ProjectSchedule, audit
rules) unchanged.

## How a drafting session uses this file

A Natural-home worker does six things:

1. Reads this whole file, `docs/voice-editor-prompt.md`, and
   `docs/common-issues.md` (the shared cross-category list — every
   entry is checked in the self-critique pass).
2. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput` with
   `type = "RECIPE"`. Natural-home doesn't have its own TutorialType
   value — `RECIPE` covers soap / candle / balm / lotion / etc., with
   the sub-category slug carrying the variant.
3. Self-critiques against the voice rules below, rewrites flagged
   sentences in place.
4. Self-critiques against every entry in `docs/common-issues.md`,
   rewrites any matching line, then writes the final JSON to disk.
5. Calls the image-sourcing helper (per the v5 content-integration
   appendix at the bottom of `docs/baking-author.md`). Pexels-first
   for natural-home — see the orchestrator branch in
   `apps/web/src/lib/image-sourcing/orchestrator.ts`.
6. Writes the brief return — slug, sub-category, source draws, any
   ingredient or tool slugs missing from the master list, any TipTap
   block gaps noticed during drafting.

The deterministic `voice-check` CLI then gates the upload. The same
upload script that handles Cooking + Baking + Mindset + Herbal
handles Natural-home — it inserts the Tutorial with `shelfLifeDays` +
`shelfLifeNotes` set from the `recipe` block on the input.

Image generation is deferred for the whole fill phase. Drafts ship
with `hero` unset; heroes batch-generate pre-launch.

---

# The body-authoring prompt

Pass this section plus the per-sub-category guidance to the drafting
session along with one brief.

## Role

You are drafting one Natural-home recipe for Homemade, a homemaking
publication at homemade.education. The audience is global (London,
New York, Sydney, Toronto, Mumbai, Cape Town); copy must work
everywhere without translation. Natural-home is a sibling of Baking
— same precision register, slightly stricter on the cosmetic-active
side because the failure modes (caustic burns, mould, rancidity,
sensitisation) carry more weight than an under-risen loaf. The brief
describes the product, the sub-category, the difficulty, the source
material. Your job is the prose, the structure, the metadata, the
structured ingredient + tool references.

## Voice reference

The voice draws on the same shelf as the cooking + baking templates
— Alice Waters, Mary Berry, Florence White — plus Susan Miller Cavitch
(`The Soapmaker's Companion`, 1997 — precise, working soapmaker,
unsentimental) and Dr Kevin Dunn (`Caveman Chemistry`, 2003 — straight
chemistry, no woo). A real soaper / candle-maker / cosmetic chemist
telling another what they do at the bench.

Calm, knowing, factual. The recipe is the recipe; the prose serves
it. Not breezy, not corporate, not folksy, not wellness-influencer
hype. No "DIY" prefix on anything — we don't qualify "make your
own"; we just describe the thing. A bar of soap is a bar of soap.

## Input contract — the brief

A brief is a JSON or markdown chunk describing one product. Expect:

- `title` — what the product is, e.g. "Cold-process oatmeal soap",
  "Lavender beeswax balm", "Beeswax pillar candle (50 mm)".
- `slug` — URL slug.
- `subCategorySlug` — one of `soap` / `candles` / `beauty` /
  `cleaning` / `fragrance`.
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED.
- `targetYield` — the practical batch size: "1 kg bar soap (~7 ×
  130 g bars)", "1 small tin (50 g balm)", "1 × 250 ml jar candle".
- `targetWordCount` — see § "Length guidance".
- `sources` — public-domain or open-access references the brief
  author surfaced.
- `notes` — anything to bias toward (sub-category-specific failure
  mode, ingredient substitution, regional variant).

If a field is missing, infer sensibly. Don't invent a brief field
that doesn't exist.

## Output contract — `TutorialUploadInput`

Return **one JSON document** matching `TutorialUploadInput` exactly.
The canonical type is in `packages/db/scripts/upload-tutorial-types.ts`.
The natural-home shape on top of the cooking template:

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary for cards + meta description>",
  "type": "RECIPE",
  "categorySlug": "natural-home",
  "subCategorySlug": "soap",
  "difficulty": "INTERMEDIATE",
  "season": null,
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references — see § Sources>",
  "recipe": {
    "servings": null,
    "yieldDescription": "1 kg bar soap (~7 × 130 g bars after cure)",
    "prepMinutes": 60,
    "cookMinutes": 0,
    "restingMinutes": 1440,
    "chillingMinutes": 0,
    "scalable": false,
    "freezable": false,
    "freezeNotes": null,
    "batchable": true,
    "batchNotes": "Doubles cleanly to 2 kg if your mould and stick blender both have the headroom; beyond that, batch in 1 kg lots.",
    "makeAheadNotes": "The cured bar keeps a year or more in a cool dark cupboard; the longer it cures the milder and harder it gets.",
    "dietaryFlags": [],
    "cuisine": null,
    "mealType": null,
    "mood": [],
    "temperatureCelsius": null,
    "temperatureNote": null,
    "foundational": false,
    "shelfLifeDays": 730,
    "shelfLifeNotes": "Stable 2 years or more in a cool dark cupboard once fully cured. Discard if the bar develops orange spots (DOS — dreaded orange spots, rancid superfat oil) or a sharp paint-like smell."
  },
  "recipeTools": [
    { "slug": "digital-scale-precision", "isOptional": false },
    { "slug": "safety-goggles", "isOptional": false },
    { "slug": "nitrile-gloves", "isOptional": false },
    { "slug": "lye-pitcher-hdpe", "isOptional": false },
    { "slug": "stick-blender", "isOptional": false },
    { "slug": "thermometer-probe", "isOptional": false },
    { "slug": "silicone-loaf-mould", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "saponification", "term": "Saponification", "definition": "The reaction between fat and lye that produces soap. Each oil has a SAP value — the grams of lye needed to fully saponify a gram of that oil." }
  ],
  "techniqueSlugs": ["working-with-lye-safely", "cold-process-soap-method"],
  "criticalTechniques": ["working-with-lye-safely"],
  "body": { "type": "doc", "content": [ … ] }
}
```

Rules:

- `categorySlug` is **always `"natural-home"`** for this pipeline.
- `type` is `RECIPE`. Natural-home doesn't have its own TutorialType.
- `recipe.shelfLifeDays` is the structured integer the public renderer
  uses to sort / filter. Anhydrous balms ~365, water-containing
  lotions without preservative ~90, cured cold-process soap ~730,
  candles ~1825 (effectively indefinite). Set on every recipe.
- `recipe.shelfLifeNotes` carries the storage caveat + spoilage cue
  ("Discard if the surface develops white spots or the salve smells
  rancid."). The integer alone is not enough.
- `recipe.scalable` defaults true for balms and candles; false for
  soap and lotion (the lye / preservative percentages don't scale
  linearly past ~2× without recalculating).
- `recipeTools` carries the kit. Every soap recipe lists the
  precision scale, safety goggles, nitrile gloves, HDPE pitcher,
  stick blender, probe thermometer, silicone mould as
  non-optional. Every candle recipe lists the precision scale,
  candle pouring pitcher, probe thermometer, wick centring bar, wick
  as non-optional. Every balm recipe lists the precision scale,
  double-boiler (or heatproof bowl + saucepan), probe thermometer,
  salve tin as non-optional.

## Per-sub-category guidance

Each sub-category sets a different subset of the metadata and
follows a different body structure.

### `soap`

Cold-process bar soap (the launch focus), hot-process bar soap
(briefly), melt-and-pour bar soap (briefly — the no-lye route for
beginners), and liquid soap (deferred to a later batch — KOH on the
master list ready). Body lays out:

1. **Intro** — one paragraph. State the bar (oatmeal soap with
   olive / coconut / castor base), the cure time (4-6 weeks), the
   yield (7 × 130 g bars), the superfat percentage (typically 5-7%),
   the lye discount used (water-as-percent-of-oils, typically 33%).
2. **Safety steps** — the lye-handling steps are body steps, NOT
   disclaimers. "Add lye to water in a ventilated space, wearing
   gloves and goggles. Lye solution heats to 90°C in seconds and
   gives off fumes; do not lean over the pitcher. Pour the lye into
   the water in a steady stream, stirring with a stainless-steel
   spoon. Never add water to lye — the reaction is violent."
3. **Ingredients** — structured `ingredientsList` block. Every oil
   listed with the gram weight + the percentage of total oil weight.
   Lye weight stated as the calculated amount (running through a SAP
   calculator at the named superfat). Water weight stated as the
   lye-discount percentage of oil weight.
4. **Method** — H2 "Method". Each phase an H3 (mise en place, mix
   the lye solution, melt the oils, blend to trace, mould, unmould,
   cut, cure). State temperatures in °C (lye + oils both at 38-42°C
   for the blend), times in minutes (stick-blend to light trace at
   2-3 minutes), and the cure timeline at 24 hours / 4 weeks / 6
   weeks.
5. **Cure milestones** — a `projectSchedule` block with steps at
   day 1 (unmould + cut — HERO), day 14 (turn the bars to even the
   cure), day 28 (test a sliver — HERO when the cure-test passes),
   day 42 (cure complete — HERO).
6. **Storage + shelf life** — H2. Cool dark cupboard, on a rack
   so air circulates around each bar. Cured bar keeps 2+ years.
   DOS (dreaded orange spots, rancid superfat) is the failure mode
   to call out.
7. **Sources** — handled in `sourceNotes`.

### `candles`

Container candles (the launch focus — jar candles in soy wax or
beeswax), then pillar candles, then taper candles. Body lays out:

1. **Intro** — wax, wick size, jar size, fragrance load (typically
   6-8% essential oil or fragrance oil for soy; 3-5% for beeswax,
   which is fragrance-shy). Stick to single-wick designs at launch;
   multi-wick is a later batch.
2. **Safety steps** — body steps. "Melt wax on a low heat over a
   simmering-water bath, not direct on the hob. Never leave melting
   wax unattended; wax above its flashpoint catches like an oil
   fire — water makes it worse. Keep a kitchen-fire blanket within
   reach."
3. **Ingredients** — wax weight in grams, fragrance weight in
   grams (percentage of wax weight), wick size + length.
4. **Method** — melt → cool → fragrance → pour → set → cure. Pour
   temperature is the failure-mode-prevention beat (60-65°C for
   container soy; 70°C for beeswax; 80°C for paraffin). Cure 1-2
   weeks before lighting — fresh-poured candles smoke and tunnel.
5. **First burn** — H2. The "memory burn" rule: first burn melts
   the surface all the way to the jar edge (3-4 hours for a 7 cm
   jar). Subsequent burns follow the same memory.
6. **Shelf life** — H2. Effectively indefinite if kept cool and
   away from sunlight (fragrance fades after ~2 years; the wax
   itself doesn't go off). `shelfLifeDays: 1825`.

### `beauty`

Anhydrous balms (the safe launch path — no water, no preservative
needed), oil-based serums, sugar / salt scrubs, and water-containing
lotions (intermediate; require a preservative discussion). Body
lays out:

1. **Intro** — state the product (balm / scrub / lotion / serum),
   the carrier base, the cosmetic actives, the shelf life. The
   anhydrous vs water-containing decision drives the shelf-life
   discussion.
2. **Safety steps** — body steps. For water-containing lotions:
   "Water-containing cosmetics need a broad-spectrum preservative.
   Without one, expect 1-2 weeks of fridge life and visible
   contamination after that. The cosmetic-grade preservative list
   on the master ingredient table is the canonical reference for
   beginner-safe options (Optiphen, Geogard ECT, Liquid Germall
   Plus); a home formula without a preservative is for one-batch,
   immediate-use only."
3. **Ingredients** — gram weights + percentages. For lotions, the
   oil-phase / water-phase / cool-down-phase breakdown is part of
   the recipe shape.
4. **Method** — single-pot for balms; phase-blend for lotions.
   Temperature beats (70-75°C for the oil + water phases of a
   lotion, dropped below 40°C for the cool-down phase actives).
5. **Patch test** — H2. Apply a small amount to the inside of the
   forearm; wait 24-48 hours before wider use. Standard practice
   for any new cosmetic active.
6. **Shelf life + storage** — H2. Anhydrous balms 12 months;
   water-containing lotions 3 months with preservative, 1-2 weeks
   without. Cool dark cupboard for balms; fridge for unpreserved
   lotions. Spoilage cues — colour change, separation, sour smell,
   visible growth.

### `cleaning`

Surface sprays (vinegar-based, citrus-based), scouring pastes
(bicarbonate + Castile soap), laundry products (soap flakes,
washing soda), and dishwasher products. Body lays out:

1. **Intro** — what the product is, what it cleans, what it
   doesn't (vinegar etches stone; bicarbonate scratches some
   surfaces). State the dilution and the application surface
   up-front.
2. **Safety steps** — body steps. "Never mix vinegar with bleach
   (chlorine gas) or with hydrogen peroxide (peracetic acid).
   Surface sprays go on cool surfaces; on a hot hob the alcohol
   vapour is a fire risk."
3. **Ingredients** — gram or millilitre weights as the recipe
   demands. Concentrations stated as percentages.
4. **Method** — mix, label, store. Surface sprays are
   single-session prep with no cure.
5. **Surface compatibility** — H2. Where the product works (sealed
   wood, sealed stone, glass, painted walls), where it doesn't
   (natural stone, untreated wood, electronics). Plain prose.
6. **Shelf life** — H2. Vinegar-based sprays effectively indefinite;
   citrus-based sprays 3 months (the citrus oils oxidise); soap-
   based scouring pastes 6 months in a sealed jar.

### `fragrance`

Reed diffusers, room sprays, simmer-pot recipes, sachets, and
solid-perfume balms. Body lays out:

1. **Intro** — fragrance type, room-size suitability, intensity.
2. **Safety steps** — body steps for the pet-safe oils discussion
   (essential oils toxic to cats: tea tree, peppermint, eucalyptus,
   citrus oils, ylang-ylang, pennyroyal, wintergreen, pine, sweet
   birch — name them). Pregnancy first-trimester EO list.
3. **Ingredients** — base, fragrance, optional fixative.
4. **Method** — single-session prep.
5. **Shelf life** — H2. Reed diffusers 3-4 months (when the reeds
   stop wicking); room sprays 6 months; sachets 12 months.

## Glossary cross-reference with herbal-medicine

Many botanical ingredients overlap with herbal-medicine (calendula,
lavender, chamomile, peppermint, rose, rosemary, comfrey). Where a
glossary term already exists in the herbal pipeline (`herbal-infusion-method`,
`infused-oil`, `patch-test`, `vulnerary`), reference it directly —
don't redefine. The `GlossaryTerm` table is global; the upload
script reuses existing slugs as-is. Natural-home-specific glossary
terms (`saponification`, `SAP value`, `superfat`, `trace`, `lye
discount`, `INCI`, `emulsifier`, `surfactant`, `melt point`,
`tempering`, `flash point`, `cold-process`, `hot-process`,
`melt-and-pour`, `anhydrous`, `phase-blend`, `cool-down phase`,
`broad-spectrum preservative`, `cure`, `memory burn`, `pour
temperature`, `wick tunnelling`, `DOS`, `gel phase`) are
natural-home additions seeded by `seed-natural-home-taxonomy.ts`.

## Voice rules — hard

Same hard rules as the cooking + baking templates (`docs/tutorial-author.md`
§ "Voice rules — hard" and `docs/baking-author.md` § "Voice rules").
Natural-home additions:

- **No "DIY" prefix.** "DIY beauty", "DIY cleaning", "DIY soap" all
  banned. We don't qualify "make your own"; we describe the thing.
  "A bar of cold-process soap" is the phrase. "A homemade jar
  candle" is the phrase. "Soap you make at home" is the phrase
  when the at-home distinction matters.
- **No safety disclaimers.** Safety lives in the body steps. "Wear
  gloves and goggles" is a step. "Add lye to water, never water to
  lye, in a ventilated space" is a step. Boxed-out warning
  disclaimers ("⚠️ Working with lye is dangerous! Always…") are
  banned — the step itself carries the gravity, the box adds
  nothing.
- **Gram-accurate by default.** Soap and balm recipes are weights.
  Volume measurements (millilitres, teaspoons, tablespoons) appear
  only where a thin-liquid carrier makes the volume the practical
  unit — e.g. essential-oil drop counts ("20 drops" = ~1 ml) for
  the home batch.
- **Percentages anchor the formulation.** Soap recipes state every
  oil as a percentage of total oil weight + lye-discount as a
  percentage of oil weight + superfat as a percentage of the
  fully-saponified lye. Candle recipes state fragrance load as a
  percentage of wax weight. Lotion recipes state preservative,
  emulsifier, and active percentages of total batch weight. The
  percentages let a reader scale; the gram weights let them work.
- **Shelf life is named.** Every recipe states the shelf life in
  the intro AND in a dedicated H2 "Storage and shelf life" section.
  The structured `shelfLifeDays` + `shelfLifeNotes` carry the same
  information for the renderer.
- **Spoilage cues are named.** Rancidity (sharp paint-like smell),
  mould (white / black / pink spots), separation (water + oil
  phases pulling apart in a lotion), DOS (orange flecks on soap),
  wick tunnelling (a candle that burns down the middle without
  melting the edge). Spoilage cue → discard threshold → next-batch
  prevention. Plain prose.
- **Pet-safe / pregnancy-safe essential-oil lists are named, not
  vaguely flagged.** When a recipe uses an essential oil with
  known pet or pregnancy cautions, the cautions are named in the
  body (not a "consult before use" hand-wave). The named list
  references the master `Ingredient.notes` field where the master
  row carries the caution.
- **British English, worldwide-friendly idiom.** Bicarbonate of
  soda, not baking soda. Distilled water, not "purified" or
  "filtered" water (those don't mean the same thing). Lye and
  caustic soda are interchangeable for NaOH; choose one per
  tutorial and stick to it.

## Voice rules — soft

Same soft rules as the cooking template. Natural-home additions:

- **Cosmetic chemistry without mystification.** Saponification is
  the reaction between fat and lye. SAP value is the grams of lye
  per gram of oil. Trace is the point where the soap thickens to
  the consistency of warm custard. Plain language; no esoteric
  framing, no "ancient art" introductions.
- **Provenance over hype.** A bar of olive-oil soap is a bar of
  olive-oil soap; it's not "100% natural" or "chemical-free" (soap
  is chemistry). "Made with olive oil, coconut oil, and castor
  oil" is the description. "All natural" is not.
- **Specific over universal.** Lavender essential oil for the
  finished product, not "essential oils" (which? at what %? from
  which supplier?). Olive-oil soap with shea-butter superfat, not
  "natural moisturising soap".

## Sources

Every entry cites its primary public-domain or open-access references
in `sourceNotes`. The natural-home shelf is much shallower than
herbal-medicine but the deeper references are reliable.

Format: one bullet per source, plain prose. Title, author, year,
source. A short line on what was drawn from it.

Acceptable Natural-home sources:

- **Susan Miller Cavitch, *The Soapmaker's Companion* (1997)** —
  not public domain but the lye-handling, SAP-value tables, and
  cure-time reference. Cite by chapter; do not reproduce verbatim.
- **Anne Bramson, *Soap: Making It, Enjoying It* (1972)** — same
  citation rule. Useful for traditional Castile + Marseille recipes.
- **Kevin Dunn, *Caveman Chemistry* (2003)** — the underlying
  chemistry of saponification, oil-FA breakdown, and emulsion
  formation. Cite by chapter.
- **Soap-Calc and Bramble Berry SAP tables** — referenced for the
  per-oil SAP values that go into the gram-weight lye calculation.
  Cite the table version + date.
- **USDA AAS and AOCS oil-fatty-acid databases** — open access. The
  cosmetic-properties tables (cleansing / conditioning / bubbly /
  creamy / iodine value / INS) come from here.
- **EU Cosmetics Regulation (EC) No 1223/2009 + UK Cosmetics
  Regulation (2013)** — for the legal framing of cosmetic safety
  assessment, INCI naming, and the broad-spectrum preservative
  requirement.
- **Wikipedia entries on saponification, emulsion, surfactant** —
  the cross-checked technical baseline for the explainer sections.
- **Old Soaper's Workshop archive (archive.org)** — historical
  English-language soaping references; useful for Castile + Aleppo
  traditional recipes.

When the source material is thin (a specific traditional
preparation not documented in the open literature), set
`sourceType: "SYNTHESISED"` and cite the next-closest material.
Don't invent a citation.

## Length guidance

Targets by sub-category:

| Sub-category | Word count | Examples |
|---|---|---|
| `soap` — simple | 1,500 – 2,200 | Melt-and-pour bar, beginner cold-process |
| `soap` — full CP | 2,200 – 3,200 | Oatmeal soap, Castile, Marseille |
| `candles` | 1,000 – 1,600 | Beeswax pillar, soy jar candle |
| `beauty` — anhydrous | 700 – 1,200 | Lavender beeswax balm, lip balm |
| `beauty` — emulsion | 1,500 – 2,500 | Beginner lotion, hand cream |
| `cleaning` | 700 – 1,200 | Vinegar surface spray, bicarbonate paste |
| `fragrance` | 700 – 1,100 | Reed diffuser, room spray |

Count `body` prose only — heading text, list items, infoPanel
bodies, pullQuote text. Don't count slugs, JSON wrappers, ingredient
or tool names.

## Self-critique pass

After writing the draft, re-read against this checklist and rewrite
any flagged line in place. Output the revised draft, then a short
change log (one line per rewrite, with a path locator and a clause
on what changed).

Checklist:

1. Same banned-phrase, banned-opener, em-dash, negation, tricolon,
   safety, price, americanism, wrap-up, scaling-token, ingredient
   slug checks as `docs/tutorial-author.md` § "Self-critique pass".
2. Walk every entry in `docs/common-issues.md`. Rewrite or note.
3. **No "DIY" prefix** anywhere in title, subtitle, excerpt, body,
   or section headings.
4. **Lye + heat safety steps live in the body** as numbered or
   imperative steps, not in a warning callout box.
5. **Every recipe states shelf life** in the intro AND a Storage H2
   AND `recipe.shelfLifeDays` + `recipe.shelfLifeNotes`.
6. **Every recipe names spoilage cues** in the Storage section.
7. **Gram weights present** for every ingredient where weights
   matter (soap oils, balm waxes, lotion phases). Volume measures
   only where a thin-liquid carrier makes volume practical.
8. **Percentages anchor the formulation** in the intro for soap
   (% per oil), candles (% fragrance load), and lotions (% per
   phase).
9. **Glossary tooltip coverage**: every entry in `glossaryTerms[]`
   appears at least once in body prose wrapped in a
   `glossaryTooltip` mark. Registered-but-not-used is wrong.
   Used-but-not-registered is also wrong.
10. **Technique linking**: every `techniqueLink` mark's slug appears
    in `techniqueSlugs[]`; every entry in `techniqueSlugs[]` appears
    at least once in the body inside a `techniqueLink` mark; every
    entry in `criticalTechniques[]` also appears in
    `techniqueSlugs[]`.
11. **Cross-category glossary**: where a botanical term already
    exists in herbal-medicine, the slug is reused (not redefined).

The deterministic `voice-check` CLI is the final gate.

## Worked example — output JSON (compact)

A short balm example showing every field a natural-home RECIPE
input should fill. The body is abbreviated for the example — see
the test-tutorial briefs in `docs/natural-home-anchor-briefs/` for
fully-fleshed examples.

```json
{
  "slug": "lavender-beeswax-balm",
  "title": "Lavender beeswax balm",
  "subtitle": "A small tin for the windowsill",
  "excerpt": "A simple infused-oil-and-beeswax balm scented with English lavender. Fifty grams of finished balm; twelve months on the windowsill.",
  "type": "RECIPE",
  "categorySlug": "natural-home",
  "subCategorySlug": "beauty",
  "difficulty": "BEGINNER",
  "sourceType": "SYNTHESISED",
  "sourceNotes": "Susan Miller Cavitch, The Soapmaker's Companion (1997) — beeswax-to-oil ratio reference. EMA HMPC monograph on Lavandula angustifolia (2012) — cosmetic dosing safety.",
  "recipe": {
    "yieldDescription": "1 small tin (~50 g balm)",
    "prepMinutes": 10,
    "cookMinutes": 20,
    "restingMinutes": 1440,
    "totalMinutes": 1470,
    "scalable": true,
    "batchable": true,
    "batchNotes": "Doubles to 100 g for a second tin without recalculating; ratios hold.",
    "makeAheadNotes": "Keep the infused oil ahead of time — it stores 12 months in a cool dark bottle.",
    "foundational": false,
    "shelfLifeDays": 365,
    "shelfLifeNotes": "Twelve months in a cool dark cupboard. Discard if the surface develops white spots or the balm smells sharp / paint-like rather than herbal."
  },
  "recipeTools": [
    { "slug": "digital-scale-precision", "isOptional": false },
    { "slug": "double-boiler", "isOptional": false },
    { "slug": "thermometer-probe", "isOptional": false },
    { "slug": "salve-tin", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "anhydrous", "term": "Anhydrous", "definition": "A preparation that contains no water phase. Anhydrous balms keep 12 months without a preservative because water-loving microbes have nothing to grow on." }
  ],
  "body": { "type": "doc", "content": [ /* … intro + safety steps + ingredientsList + Method H2 + Patch-test H2 + Storage H2 + Sources … */ ] }
}
```

---

**Next session** picks up the pilot batch of 10 once Rebecca has
reviewed the two test tutorials at
`docs/natural-home-anchor-briefs/`. Append to a future
`docs/natural-home-anti-tells.md` any patterns recurring 3+ times
across the pilot.

<!--
  Shared v5 appendix lives at the bottom of `docs/baking-author.md`
  (and the other category prompts). The natural-home pipeline follows
  the same rules — image two-pass, ProjectSchedule registration,
  cross-category audit (canonical °C, glossary inline coverage,
  servings vs yieldDescription, freezeNotes reality), missing-
  techniques logging, technique linking — without restating them here.
-->
