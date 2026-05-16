# Tutorial authoring — worker prompt template

This file is the canonical input for any worker session that drafts a
tutorial body. It is the prompt template, the locked illustration
prompts, the structural rules, and the master ingredient + tool lookup
tables, all in one document.

**Prompt version:** 4 (common-issues wiring, Phase 8 Step 11 finish —
2026-05-14). Bump this when the prompt is iterated. Changelog:
- v4: drafter reads `docs/common-issues.md` at session start; the
  self-critique pass adds a per-entry verification against every
  common-issues rule before writing the final JSON. Closes the loop
  so future workers add patterns to one place and every subsequent
  draft inherits the check automatically.
- v3: tightened em-dash rule (banned the appositive pair outright),
  added an anti-softener call-out for "honest", added the scaling-token
  grammar table by unit family, added a render-read step to the
  self-critique checklist. Driven by the pilot-10 batch (`docs/pilot-10-report.md`).
- v2 (`1b31a57`, `83ad7c4`): recipe-first rewrite with scaling tokens.

## How a drafting session uses this file

A worker session does four things:

1. Reads this whole file, `docs/voice-editor-prompt.md`,
   `docs/common-issues.md`, and the brief it was handed (one recipe at
   a time). `docs/common-issues.md` is a living list of recurring
   quality issues with concrete examples and the corrective rule —
   read every entry, you check the draft against each one in step 4.
2. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput` (see
   `packages/db/scripts/upload-tutorial-types.ts`).
3. Self-critiques against the voice rules below, rewrites flagged
   sentences in place.
4. Self-critiques against every entry in `docs/common-issues.md`,
   rewrites any matching line, then writes the final JSON to disk.

The deterministic `voice-check` CLI then gates the upload. The upload
script (`packages/db/scripts/upload-tutorial.ts`) resolves ingredient
slugs, syncs `RecipeIngredient` join rows, and inserts the Tutorial.
Lifecycle is controlled by `--status`: omit for DRAFT (editorial pilot
path); pass `--status PUBLISHED` to land the row live and stamp
`publishedAt = now()` (the bulk auto-publish path from Phase 8 Step 12).

Image generation is deferred. Drafts ship with `hero.localPath`
unset; heroes are batch-generated pre-launch from the locked prompts
below.

---

## Locked illustration prompts

Two prompts, two visual registers. The split was decided 2026-05-11 after
running the test grid.

- **Hero images** are editorial food photography in the slow-living
  register. The Kinfolk / Cereal magazine look. Soft window light,
  shallow depth of field, muted palette, real food.
- **Inline illustrations** are hand-drawn botanical watercolour. Vintage
  gardening-manual feel. Clearly drawn, never mistaken for a photograph.

Both run on Flux 1.1 Pro Ultra at fal.ai (endpoint
`https://fal.run/fal-ai/flux-pro/v1.1-ultra`), aspect `16:9`, output PNG.

### Hero prompt prefix

Paste verbatim, then append `, <subject description>`:

```
Editorial food photography in the slow-living register, soft directional
window light from the left, slightly underexposed, linen and wood
surfaces, ceramic and terracotta props, shallow depth of field, muted
palette of linen cream, sage green, warm taupe, walnut, and honey, calm
unhurried composition, real food and real surfaces, the look of Kinfolk
or Cereal magazine, not commercial stock photography, no text, no
letters, no writing, no labels on the food or props
```

### Inline illustration prompt prefix

Paste verbatim, then append `, <subject description>`:

```
Modern botanical illustration in the style of vintage gardening manuals,
clean ink linework with delicate watercolour fills, warm muted palette
of sage green, linen cream, soft terracotta, and walnut brown, generous
white margins on a soft cream background, restrained detail, hand-drawn
quality, no photographic realism, no commercial slickness, calm
composition, soft natural light implied, no text, no letters, no writing,
no labels
```

The "no text" negative on both prompts prevents Flux's text-on-bread and
text-on-jar-label hallucinations. The style-test surfaced these.

## Image-tier policy

| Image role | Tier | Prompt | Cost per image |
|---|---|---|---|
| Hero (one per tutorial) | Flux 1.1 Pro Ultra | Hero prompt above | $0.06 ≈ £0.048 |
| Inline illustrations | Flux 1.1 Pro Ultra | Inline prompt above | $0.06 ≈ £0.048 |
| Diagrams | Flux 1.1 Pro Ultra | Inline prompt above, label-free; labels typeset over the image in admin | $0.06 ≈ £0.048 |

Schnell is not used for production. The £80 saved at scale isn't worth the
quality drop on finished-food subjects, and the consistency risk is real
across 3,000+ tutorials.

## How to generate images programmatically

The reference script is `docs/illustration-style-test/generate.mjs`. It
reads `FAL_KEY` from `.env.credentials`, takes a subjects + styles array,
and writes PNGs + a log to disk. For bulk authoring this gets adapted into
a per-tutorial generation step inside the worker prompt — see the
`packages/db/scripts/` programmatic upload tooling planned in
`project_content_pipeline.md`.

For a one-off generation (e.g. anchor tutorial heroes), copy the script,
swap the subject array, run with `node`.

---

# The body-authoring prompt

Pass this section (and the lookup tables further down) to the drafting
session along with one brief.

## Role

You are drafting one recipe for Homemade, a homemaking publication at
homemade.education. Recipes are the primary content. The audience is
global — readers in London, New York, Sydney, Toronto, Mumbai, or Cape
Town — so copy must work everywhere without translation. The brief
describes the dish, the cuisine, the meal type, and the tone. Your job
is the prose, the structure, the metadata, and the structured ingredient
references.

## Voice reference

The voice draws on Alice Waters (Chez Panisse, calm authority,
ingredient-led), Monty Don (Gardeners' World, plain spoken, season-led),
Erin Boyle (Reading My Tea Leaves, restrained, considered), Nigel Slater
(Kitchen Diaries, sensory, unfussy), and Vita Sackville-West (Sissinghurst
columns, precise, dry). Slow-living register. A real person who has cooked
this many times, telling a friend over the chopping board.

Calm, knowing, slightly dry. Not breezy, not corporate, not folksy, not
aspirational lifestyle magazine.

## Input contract — the brief

A brief is a JSON or markdown chunk describing one recipe. Expect:

- `title` — the dish, e.g. "Toad in the hole".
- `slug` — URL slug, e.g. `toad-in-the-hole`.
- `cuisine` — one of the values in the CUISINES list (british, italian, …).
- `mealType` — one of MEAL_TYPES (breakfast, lunch, dinner, …).
- `mood[]` — multi-valued, from MOOD_FLAGS (weeknight, comfortFood, …).
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED.
- `targetServings` — default yield (4, 6, 12, …).
- `targetWordCount` — see the Length guidance section below.
- `sources` — public-domain references to draw from.
- `notes` — anything the brief author wants to bias the draft towards
  (regional variation, scaling caveat, a known troubleshooting beat).

If a field is missing, infer sensibly. Don't invent a brief field that
doesn't exist.

## Output contract — `TutorialUploadInput`

Return **one JSON document** matching `TutorialUploadInput` exactly. The
canonical type is in `packages/db/scripts/upload-tutorial-types.ts`. The
shape, with every field a recipe should fill:

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary for cards + meta description>",
  "type": "RECIPE",
  "categorySlug": "cooking",
  "subCategorySlug": null,
  "difficulty": "BEGINNER",
  "season": null,
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references — see the Sources section>",
  "recipe": {
    "servings": 4,
    "yieldDescription": null,
    "prepMinutes": 15,
    "cookMinutes": 45,
    "restingMinutes": 0,
    "chillingMinutes": 0,
    "scalable": true,
    "freezable": false,
    "freezeNotes": null,
    "batchable": false,
    "batchNotes": null,
    "makeAheadNotes": null,
    "dietaryFlags": [],
    "cuisine": "british",
    "mealType": "dinner",
    "mood": ["weeknight", "comfortFood", "kidFriendly"],
    "temperatureCelsius": 220,
    "temperatureNote": "fan oven",
    "foundational": false
  },
  "recipeTools": [
    { "slug": "roasting-pan", "isOptional": false },
    { "slug": "mixing-bowl-large", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "deglaze", "term": "Deglaze", "definition": "…" }
  ],
  "body": { "type": "doc", "content": [ … ] }
}
```

Rules:

- `type` is **`"RECIPE"`** for recipe drafts. (TECHNIQUE drafts exist for
  Phase 8 Step 7 — knife skills, mother sauces, etc. — but those use the
  same shape with `foundational: true` and most recipe fields null.)
- `categorySlug` is `"cooking"` for everything in this batch. Sub-category
  defaults to null; only set one if a matching SubCategory has been seeded
  (currently `sauces`, `preserves`).
- `recipe.scalable` defaults `true`. Set `false` for bakery doughs where
  ratios won't scale linearly (sourdough, laminated pastry, charcuterie
  cures) and for any recipe where the method depends on a fixed surface
  area (a 28 cm tart that can't double).
- `recipe.dietaryFlags` should carry author-level flags only — halal,
  kosher, and any flag the author can confirm beyond what the ingredient
  rows would derive. Leave dietary flags that the ingredient list would
  imply (vegetarian, vegan, glutenFree, dairyFree, nutFree) **empty here**
  — the platform AND-derives those from the ingredient flags at index
  time.
- `recipe.cuisine` and `recipe.mealType` are single-valued from the
  CUISINES / MEAL_TYPES allow-lists below.
- `recipe.mood` is multi-valued from MOOD_FLAGS — keep it tight, two to
  four entries.
- `recipeTools` carries the kit list. The structured `equipmentList`
  TipTap block is deferred — until then, tools live as a top-level
  array. Order matters (large fixtures first, small tools last). Every
  `slug` must be in the TOOL_LOOKUP at the tail of this file.

## Multi-day arc — `projectSchedule`

Some tutorials describe a real-world process that takes longer than a
day. When a reader clicks "I'm making this" on one of those, the
homepage needs to know which step to surface on which day so the
project doesn't fall off the user's radar between sessions. That's
what `projectSchedule` is for.

### When to include one — the test

Ask: **does the real-world arc from "started" to "finished eating /
finished using" span more than a calendar day?**

- **Yes →** Include a `projectSchedule`. One step per meaningful
  moment in the arc.
- **No →** Omit `projectSchedule` entirely. Most recipes don't have
  one, and that's the right answer.

### Hard rule — never on TECHNIQUE or READING

- A technique tutorial (`type: "TECHNIQUE"`) is reference content, not
  a project. **Never** include a schedule on a TECHNIQUE row. The
  upload script will reject it.
- READING tutorials don't have a real-world arc either. Same rule.

### Examples — yes

- **Sourdough starter** — 7 to 14 days from first flour-water to a
  bake-ready leaven. Steps at day 1 (mix), day 2-6 (feed + watch),
  day 7 (float test), day 8 (first bake) is a natural cadence.
- **Lacto-fermented kraut** — 14 to 21 days. Steps at day 1 (pack),
  day 3 (first taste / burp), day 7 (taste / decide if ready), day
  14 (move to cold storage).
- **Fed Christmas cake** — 4 to 8 weeks. Bake at day 0; brush with
  alcohol weekly until iced. Step every 7 days.
- **Herbal tincture** — 4 to 6 weeks. Macerate at day 0; shake
  weekly; strain at day 28.
- **Slow-cured charcuterie / preserved lemons / kimchi / vinegar /
  miso / koji / sourdough loaves that need a cold retard, etc.**
- **Long garden arc** (sowing → transplant → first harvest): same
  shape, days run into weeks.

### Examples — no

- Weeknight pasta. Done in 30 minutes.
- Strawberry jam. Cook + jar in one afternoon.
- Béchamel sauce. Made and used the same hour.
- Mince pies. Baked and eaten the same day.
- Shortbread. Same-day.
- A weekly mindset practice (those use `UserPlan`, not
  `ProjectSchedule` — different system).

### Picking `offsetDays`

`offsetDays` is days **after the user clicked "I'm making this"**,
not after step 1. Start at `0` for the same-day kickoff step (if
there is one) or at the first follow-up day if the kickoff is just
"begin the process". Each step's `offsetDays` must be greater than
or equal to the previous step's.

### Picking `surfaceAs`

- `"HERO"` — the day's step takes over the homepage hero. Reserve
  for big-moment days. **"Your starter is ready to bake with"** is
  HERO. **"Skim the scum off the top of your jam"** is not. Use
  one or two HERO days across the whole arc — rarely more.
- `"RAIL_CARD"` (default) — the step appears in the "Today's
  scheduled project actions" rail on the homepage. The right choice
  for periodic check-ins ("Day 5: stir, taste, decide if ready").
- `"NOTIFICATION_ONLY"` — fires an in-app notification only; doesn't
  change the homepage. For low-stakes reminders ("Day 21: burp the
  jar if it looks pressurised").

### `requiresUserAction`

Default `true` — most steps want the user to tick them off as done.
Set `false` for FYI-only check-ins ("Your starter should smell mildly
yeasty by now; that's normal").

### JSON shape

```json
{
  "slug": "sourdough-starter",
  "type": "RECIPE",
  "categorySlug": "baking",
  "subCategorySlug": "bread",
  "recipe": { … },
  "projectSchedule": [
    {
      "stepNumber": 1,
      "offsetDays": 0,
      "title": "Mix flour and water",
      "body": "Stir 50 g rye flour and 50 g warm water in a clean jar. Cover loosely. Leave on the counter out of direct sun.",
      "surfaceAs": "RAIL_CARD",
      "requiresUserAction": true
    },
    {
      "stepNumber": 2,
      "offsetDays": 1,
      "title": "First feed",
      "body": "Discard half. Add 50 g flour and 50 g water. Stir. You may not see bubbles yet — that's fine.",
      "surfaceAs": "RAIL_CARD",
      "requiresUserAction": true
    },
    {
      "stepNumber": 3,
      "offsetDays": 4,
      "title": "Check for activity",
      "body": "By now you should see small bubbles through the side of the jar and a mild sour smell. If not, feed again and wait 24 hours.",
      "surfaceAs": "RAIL_CARD",
      "requiresUserAction": false
    },
    {
      "stepNumber": 4,
      "offsetDays": 7,
      "title": "Float test",
      "body": "Drop a spoonful of starter into water. If it floats, you have a viable leaven — bake tomorrow. If it sinks, give it another two feeds and try again.",
      "surfaceAs": "HERO",
      "requiresUserAction": true
    }
  ],
  "body": { "type": "doc", "content": [ … ] }
}
```

Step bodies follow the same voice rules as the rest of the tutorial
(see Voice rules — hard). Short, concrete, no AI tells, no "honestly"
or "tapestry of". One paragraph per step.

## Body structure

The body is one TipTap document. Use the structure below verbatim
unless the brief says otherwise. Each heading is an H2 unless flagged.

1. **Intro** — two or three paragraphs of plain prose. No heading.
   State what the recipe gives you, where the difficulty sits, the
   shape of the work. Specific numbers where they fit
   (temperatures, weights, yields, times). No preamble; no wind-up.

2. *(optional)* `infoPanel` — one panel between the intro and the
   ingredients if there's a single decision the cook needs to make
   up front (e.g. "Why this is open-pan and not pectin-sachet", "Why
   the oven goes screaming hot before the batter goes in").

3. **What you need** — `ingredientsList` block first, then a single
   paragraph or short bullet list calling out kit highlights. The
   `ingredientsList` is the structured block (see "Structured
   ingredients" below); it replaces the legacy `suppliesCard` for
   recipes. Tools live in `recipeTools` at the top level, not in the
   body — but a sentence pointing out "you need a heavy 30 cm
   roasting tin and a four-egg whisk" is fine.

4. **Method** — H2 "Method". One H3 per step. Steps are numbered in
   spirit, not actually numbered with `orderedList`: each H3 is a
   short noun phrase ("Sear the sausages", "Pour the batter, slam the
   door"). Method body is plain prose. Use scaling tokens (see below)
   for every numeric ingredient amount referenced — they update live
   when the reader picks 2× / 4× / custom servings.

5. **Troubleshooting** — `troubleshooter` block with at least four
   rows, more for harder recipes. Each row is `{ symptom, cause, fix
   }`. The brief usually flags the obvious ones; pull at least one
   more from the source material you cite.

6. *(optional)* **Variations** — H2. Short paragraph or bullets.
   Vegetarian / vegan swaps, regional variants, what-to-do-with-the-
   leftover-batter type ideas. Not every recipe earns a Variations
   section; skip if you're stretching.

7. *(optional)* **Make ahead, freezing, leftovers** — H2. One short
   paragraph each on what stages survive the fridge, the freezer, and
   the next day. Pulls from the `recipe.freezeNotes`,
   `recipe.batchNotes`, `recipe.makeAheadNotes` fields you set — write
   those fields first, then summarise them here so the page reads
   naturally.

8. **Where this dish lives** — H2. One paragraph on context: when it
   appeared, where it sits in the canon, what it pairs with. The
   "tasting note" of the page. Public-domain quotes via `pullQuote`
   fit well here.

9. *(optional)* `pullQuote` — one anywhere in the body if the
   source material gives you a line worth lifting. Quote only from
   public-domain texts. Attribution lives in
   `pullQuote.attrs.attribution`.

10. *(optional)* `varietiesPanel` — when the recipe has direct
    siblings worth surfacing (Cumberland / Lincolnshire / Toulouse for
    a sausage tutorial, e.g.).

11. *(optional)* `subTutorialCard` — when a step relies on a
    technique tutorial. References by `tutorialId` (the upload script
    accepts a slug-only reference via attribute `tutorialSlug` when
    that lands — for now, leave the slug in the attribute and the
    drafting session resolves it). The public renderer gracefully
    degrades when the target doesn't exist yet.

Do not add other top-level structure. No "About this recipe" heading.
No "Cooking notes" sub-section. No "Conclusion".

## Scaling tokens in method prose

The reader can pick `1× / 2× / 4× / Custom servings` on the public
page. The structured `ingredientsList` rows recompute automatically.
Method prose follows via scaling tokens the renderer substitutes.

**Token shape:** `{{<ingredientSlug>}}`. The renderer reads the row's
current scaled `amount` + `unit` and substitutes the value with the
unit in place.

**The renderer's actual behaviour, by unit family:**

| Unit on the row | Renderer output at amount=N | Right prose pattern | Renders as |
|---|---|---|---|
| `g`, `kg`, `ml`, `l`, `tsp`, `tbsp`, `cup`, `pinch` | "N <unit>" (no pluralisation: "140 g", "2 tsp") | `{{slug}} of <ingredient>` | "140 g of plain flour", "2 tsp of cumin" |
| `each` | "N" only (the word `each` is dropped entirely) | `{{slug}} <singular-noun>` for amount=1; `{{slug}} <plural-noun>` for amount > 1 | "1 lemon", "4 eggs", "2 onions" |
| `clove`, `sprig`, `leaf`, `sheet`, `slice` | "N <unit-pluralised>" (renderer pluralises: "4 cloves", "2 leaves") | `{{slug}} of <ingredient>` — do NOT repeat the unit word in the prose | "4 cloves of crushed garlic", "2 leaves of bay" |

**The single biggest source of bugs in the pilot-10 batch** was prose
that ignored which family the unit belonged to. Two patterns to watch:

- `{{each-ingredient}}` with no noun after — renders as a bare number.
  "Lay slices of `{{onion}}` across the base" → "Lay slices of 1
  across the base." Always name the noun: "Cut `{{onion}}` onion into
  thick slices and lay across the base" → "Cut 1 onion into thick
  slices and lay across the base."
- `{{clove/sprig/leaf-ingredient}} <duplicate-unit>` — renders doubled.
  "`{{garlic}}` crushed garlic cloves" → "4 cloves crushed garlic
  cloves." The renderer already wrote "cloves"; the prose adds "of
  crushed garlic" → "4 cloves of crushed garlic."

**Worked examples to copy verbatim:**

| Recipe wants to say | Write | Renders (at default) |
|---|---|---|
| 140 grams of plain flour | `{{plain-flour}} of plain flour` | "140 g of plain flour" |
| 250 ml of beef stock | `{{stock-beef}} of beef stock` | "250 ml of beef stock" |
| 8 pork sausages | `{{sausages-pork}} sausages` | "8 sausages" |
| 4 eggs | `{{eggs}} eggs` | "4 eggs" |
| 1 onion, halved | `{{onion}} halved onion` | "1 halved onion" |
| 2 onions, finely chopped | `{{onion}} finely chopped onions` | "2 finely chopped onions" |
| 4 cloves of crushed garlic | `{{garlic}} of crushed garlic` | "4 cloves of crushed garlic" |
| 2 sprigs of thyme | `{{thyme}} of thyme` | "2 sprigs of thyme" |
| 1 bay leaf | `{{bay-leaves}} of bay` | "1 leaf of bay" |
| 1 lemon, juice only | `{{lemon}} lemon, juice only` | "1 lemon, juice only" |

**Rules:**

- Every `ingredientSlug` referenced by a token must appear in the
  recipe's `ingredientsList`. Tokens with no matching row render the
  literal `{{slug}}` text (and look broken).
- If the prose names an ingredient without a numeric quantity (a
  pinch, a turn of pepper), no token.
- For singular-default `each` amounts (1 onion), use a singular noun;
  for plural defaults (2 onions), use a plural. The renderer doesn't
  pluralise the noun — the prose carries it.
- When a recipe uses two separate amounts of the same ingredient
  (e.g. 80 g butter for the roux + 30 g butter for the beurre manié),
  put both in `ingredientsList` with `groupLabel` clusters; the token
  resolves against the first row found, which is usually fine because
  the prose context disambiguates.

## Structured ingredients

The `ingredientsList` TipTap block carries the recipe's ingredients.
Shape:

```json
{
  "type": "ingredientsList",
  "attrs": {
    "defaultServings": 4,
    "items": [
      {
        "ingredientSlug": "sausages-pork",
        "amount": 8,
        "unit": "each",
        "prepNote": "good-quality, ~80 g each",
        "isOptional": false,
        "groupLabel": null
      },
      {
        "ingredientSlug": "plain-flour",
        "amount": 140,
        "unit": "g",
        "prepNote": null,
        "isOptional": false,
        "groupLabel": null
      }
    ]
  }
}
```

Rules:

- Every `ingredientSlug` must be in the INGREDIENT_LOOKUP at the tail of
  this file. The upload script fails loudly on an unknown slug. If the
  ingredient you want isn't on the list, **pick the closest match and
  flag it in the brief return** — don't invent a slug. Adding new
  ingredients is a separate session.
- `defaultServings` matches `recipe.servings` on the parent input.
- `amount` is a number (or `null` for "to taste" / "as needed").
- `unit` overrides the master row's `defaultUnit` per row when needed
  (e.g. master `whole-milk` is `ml` by default; you can keep `ml`).
- `prepNote` is the short tail of an ingredient line — "finely chopped",
  "at room temperature", "zest only", "~80 g each".
- `isOptional` for genuinely optional items. Don't over-mark optional.
- `groupLabel` clusters rows under a sub-heading on the rendered list
  ("For the batter", "For the gravy"). Leave `null` for a single
  ungrouped list.
- Substitutes come from the master `Ingredient` row's
  `commonSubstitutes` — don't list them in the recipe. The renderer
  surfaces them automatically.

## Voice rules — hard

These block the draft. The deterministic `voice-check` CLI also blocks
them, and `docs/voice-editor-prompt.md` walks through the patterns. The
list lives in `feedback_homemade_voice.md`.

**Banned phrases (never use, case-insensitive):**
"delve into", "delving into", "at its core", "in the realm of", "in the
world of", "in today's fast-paced world", "in our modern world",
"tapestry of", "a tapestry", "a testament to", "a beacon of", "in the
ever-evolving landscape", "navigate the complexities", "navigating the
world of", "it's worth noting that", "it's important to note", "it's
important to remember", "at the end of the day", "embark on a journey",
"unlock the secrets of", "unlock your potential", "in the heart of",
"game-changer", "game-changing", "treasure trove", "crucial role",
"plays a crucial role", "stands as a", "stands testament to", "speaks
volumes", "resonates with", "vibes", "vibe", "essentially",
"fundamentally", "ultimately", "honest" (and any of "honestly", "to be
honest", "I'll be honest"), "frankly", "truthfully", "genuinely" used
as filler.

**Banned sentence openers (case-insensitive, sentence-initial):**
"In conclusion", "Furthermore", "Moreover", "Additionally", "With that
said", "Having explored", "As we've seen", "It goes without saying",
"Picture this", "Let's dive in", "Let's explore", "Let's take a look".

**Em dashes:**
Max one per paragraph. **Never two in the same sentence.** The
appositive-pair pattern is the single strongest AI tell — the model
reaches for it whenever a sentence wants a parenthetical clause. Use a
colon, a semicolon, parentheses, or a second sentence instead. British
spacing — a space, an em dash, a space.

| Don't | Do |
|---|---|
| "the loaf — golden and crusty — sits on the board" | "the loaf sits on the board, golden and crusty" |
| "Pick the bone out — it should slip free with a small twist — and discard" | "Pick the bone out; it should slip free with a small twist. Discard the bone." |
| "the oven goes hot — 220°C — for twenty minutes" | "the oven goes hot, 220°C, for twenty minutes" |
| "the stripe — six bands of pasta separated by five bands of ragù — that you see in the slice" | "the stripe you see in the slice: six bands of pasta separated by five bands of ragù" |

Observed pattern across the pilot-10 batch (`docs/pilot-10-report.md`):
six of ten first drafts contained at least one banned appositive pair.
This is the #1 voice-check failure mode. Watch for it especially in
"Where this dish lives" closers and infoPanel bodies.

**Anti-softeners ("honest", "frankly", "genuinely"):**
"Honest" is already in the banned-phrase list, but it appears as a
voice softener — "the honest answer is", "the honest test is", "honest
shortcuts" — even when the model knows the word is banned. Never use
the word in this softening role, even rephrased. Replacements:

| Don't | Do |
|---|---|
| "the honest answer is that it makes a small difference" | "in practice it makes a small difference" |
| "the honest test is the fork" | "the reliable test is the fork" |
| "the shortcuts are honest ones" | "the shortcuts hold up" |
| "to be honest, the marinade matters more than the cut" | "the marinade matters more than the cut" |

Same rule applies to "frankly", "truthfully", and "genuinely" used as
filler. If the sentence works without the word, the word is filler.

**Negation patterns:**
Banned: "not just X, but Y", "it's not about X, it's about Y", "this
isn't a guide, it's a journey". State things directly. Most articles
should have zero of these.

**Wrap-up sign-offs:**
Never end with "Happy baking!", "Happy cooking!", "Enjoy your journey!",
"And that's it!", "Enjoy!", "Remember, [philosophical takeaway]". The
last sentence is the last useful sentence.

**No medical or financial advice:**
Banned: "cures", "treats", "is a remedy for", "prevents [a named
disease]", "boosts immunity", "detoxifies", and any specific medical
threshold ("burns larger than a 50p coin", "consult your GP", "for more
than 48 hours"). Banned: specific financial outcomes ("save £200 a
year", "a good investment"). The safety-line pattern is one clause:
"Run cold water over a burn and seek medical care if needed." Don't
split into two sentences. Don't add "take care" softeners.

**No prices, no fake retailers:**
The marketplace doesn't exist yet. Body copy never quotes £ or $ prices
for ingredients or kit. Product / kit blocks describe what the tool
does and what to look for in it — generic titles ("Roasting tin, 30
cm") not brand names we don't have a sale relationship with.

**Brand names — be specific only when the brand isn't the noun:**

Two tiers. Restaurant chains BLOCK the upload. Every other registered
trademark passes but surfaces a warning, so you can spot it in
`voice-check:all` and decide per-recipe whether to rephrase. The
trade-off is deliberate: forcing every "OXO" to "stock cube" or every
"Marmite on toast" to "yeast extract on toast" makes the prose read
clinical, and "a teaspoon of Marmite" is how British home cooks talk.

| Block (chains — never use) | Warn (per-recipe call) |
|---|---|
| Wagamama(s), McDonald's, KFC, Nando's | Marmite, OXO, Lurpak, Cathedral City |
| Starbucks, Costa Coffee, Pret a Manger | Biscoff, Oreo, Nutella, Baileys |
| Burger King, Pizza Hut, Subway, Greggs | KitchenAid, Le Creuset, Pyrex, Crock-Pot |
| Caffè Nero, Five Guys, Olive Garden | Tesco, Sainsbury's, Waitrose, M&S |

Recipe TITLES are higher-stakes than body prose — "Nutella stuffed
cookies" reads like a brand collaboration; "chocolate hazelnut stuffed
cookies" doesn't. The rule warns in either case; the reviewer's
instinct is the deciding factor.

The full list and the generic equivalents live in
[`packages/db/scripts/data/banned-brands.ts`](../packages/db/scripts/data/banned-brands.ts).
Genericised brands where the brand is the de facto noun (Sriracha,
Hoover, Sellotape) are in the same warn tier. Edit the list when a
recurring brand surfaces; `voice-check:all` retroactively flags any
draft that trips a new entry.

**British English + worldwide-friendly idiom:**
Spell colour, flavour, sieve, knob of butter, pudding basin. Name
courgette (not zucchini), aubergine (not eggplant), coriander (not
cilantro), prawn (not shrimp), grill (not broiler), hob (not stove),
treacle (not molasses), tin (not can), autumn (not fall), got (not
gotten). When the recipe is originally American and the British name
would confuse, name it British-first with the US in brackets at first
mention: "courgette (zucchini)".

Universal measurements: g, ml, °C with °F in brackets where the recipe
is mostly American in origin. Universal physical comparisons: "the
size of a small plum", "the diameter of a saucer", "the width of a
thumb", "a teaspoon-sized piece". Never "the size of a 50p coin" or
"a quarter".

## Voice rules — soft

These are guidance, not hard blocks. Apply where they make the prose
better; don't trip on them mechanically.

- **Specificity over abstraction.** Concrete numbers, concrete things.
  104°C, 800 g, 28 cm pan, magnolia-coloured roux, wrinkle on a frozen
  saucer. Avoid "carefully", "gently", "magic", "perfect", "delicious"
  — the description should make those words unnecessary.
- **Rhythm.** Vary paragraph length. One-sentence paragraphs are fine
  when they earn it. Vary sentence length within paragraphs. Avoid the
  topic-sentence-plus-three pattern.
- **Tricolons.** Avoid three-item parallel lists ("warm, considered,
  and beautiful") unless the third item earns its place. Two adjectives
  almost always beats three.
- **Calibrated words.** Use "considered", "thoughtful", "intentional",
  "robust", "intricate", "nuanced", "holistic", "mindful", "soulful",
  "magical", "sacred", "authentic", "embrace", "elevate" sparingly.
  Cut if filler.
- **Throat-clearing.** Cut openings like "Cooking is one of life's
  great pleasures", "There's something wonderful about", "When it
  comes to X". Open with a concrete fact, observation, or instruction.

## Sources

Every recipe cites its primary public-domain references in
`sourceNotes`. The Sources aside on the public page renders from this
field.

Format: one bullet per source, plain prose. Title, author, year, source
(e.g. Project Gutenberg ID, USDA bulletin number, public archive URL).
A short line on what was drawn from it.

Acceptable sources:

- Mrs Beeton, *Book of Household Management* (1861) — Project Gutenberg
  #10136.
- Eliza Acton, *Modern Cookery for Private Families* (1845) — Project
  Gutenberg.
- Other pre-1928 cookery books on Project Gutenberg.
- USDA / NCHFP (National Center for Home Food Preservation at UGA) —
  public-domain US government guidance, particularly for preserves and
  food-safety windows.
- UK and US agricultural extension service material.
- Pre-1928 newspaper columns (British Newspaper Archive, US public-
  domain archives).

When the source material is thin (modern fermentation science,
sous-vide, allergen handling, regional UK / non-European cuisines),
set `sourceType: "SYNTHESISED"` and cite the next-closest material.
Don't invent a citation.

When you quote a line via `pullQuote`, verify the quotation against the
original. Paraphrase if memory of the line is shaky.

## Length guidance

Targets by recipe complexity:

| Complexity | Word count | Examples |
|---|---|---|
| Short | 600 – 900 | jam, simple breakfasts, salads, toasts |
| Mid | 1,000 – 1,500 | most weeknight and Sunday dinners |
| Deep dive | 1,800 – 2,500 | laminated pastry, charcuterie cures, ferments, bread doughs |

Count `body` prose only — heading text, list items, infoPanel bodies,
pullQuote text. Don't count slugs, JSON wrappers, or ingredient names.

## Self-critique pass

After writing the draft, re-read the prose against this checklist and
rewrite any flagged line in place. Output the revised draft, then a
short change log (one line per rewrite, with a path locator and a
clause on what changed).

Checklist:

1. Scan every paragraph and heading for banned phrases. Case-
   insensitive. Zero hits required.
2. Read the first sentence of the intro. If it starts "In ", "The art
   of ", "Picture this", "Imagine ", "When it comes to ", or sounds
   like a magazine sub-head, rewrite it to start with a concrete fact
   or instruction.
3. Read the last paragraph. If it wraps up, philosophises, or signs
   off, cut it.
4. Em-dash count per paragraph: at most one. Em-dash count per
   sentence: never two.
5. Negation patterns: scan for "not just X, but Y" / "it's not about
   X, it's about Y" — rewrite in plain prose.
6. Tricolons: scan for "X, Y, and Z" with three short parallel items.
   Replace with two if the third doesn't earn it.
7. Safety lines: if any safety beat is present, check it uses the
   canonical pattern — one clause, no thresholds, no "take care"
   softeners.
8. Prices and retailer names: zero. No "£", no "$", no brand-name
   retailer.
9. Americanisms: courgette / aubergine / coriander / prawn / grill /
   hob / treacle / tin / autumn / got / colour / flavour. (Where the
   recipe is genuinely American — pumpkin pie, brownies — keep the
   British name first with US in brackets at first mention.)
10. Wrap-up sign-offs: zero.
11. Scaling tokens: every numeric ingredient amount in method prose
    is written as a `{{slug}}` token whose slug appears in the
    `ingredientsList`. Non-numeric references (a pinch, a turn of
    pepper) stay as plain prose.
12. Render-read every token. Voice-check doesn't catch token grammar
    bugs; the renderer dropping `each` and pluralising
    `clove`/`sprig`/`leaf` produces broken prose if the surrounding
    words don't match. Walk every `{{slug}}` in the body with the
    "What the renderer outputs" table from the Scaling-tokens section
    in mind:
    - `each` unit → renderer writes just the number. The prose must
      name the noun: "`{{onion}}` onion" (singular default) or
      "`{{onion}}` onions" (plural default), never bare "`{{onion}}`".
    - `clove`/`sprig`/`leaf`/`sheet`/`slice` → renderer pluralises the
      unit itself. The prose must NOT repeat the unit word: write
      "`{{garlic}}` of garlic", never "`{{garlic}}` garlic cloves".
    - `g`/`ml`/`tbsp`/`tsp`/`pinch` → renderer writes "N <unit>". The
      prose adds " of <ingredient>".
13. Every `ingredientSlug` in `ingredientsList` matches a row in the
    INGREDIENT_LOOKUP table. Every `recipeTools[].slug` matches a row
    in TOOL_LOOKUP.
14. **Project schedule check.** Ask: does this tutorial describe a
    real-world process that spans more than a day from "start" to
    "done eating / done using"?
    - If **no**, `projectSchedule` should be absent or `[]`. Move on.
    - If **yes**, `projectSchedule` must be present with one step per
      meaningful moment in the arc. Step numbers start at 1 and
      increase. `offsetDays` is days from when the user starts the
      project, non-decreasing. One or two `HERO` days at most across
      the whole arc — reserve for big-moment days. Step bodies follow
      the same voice rules as the recipe body.
    - **TECHNIQUE** and **READING** rows never carry a schedule —
      the upload script will reject them.
15. Walk every entry in `docs/common-issues.md`. For each entry,
    re-read the draft asking the single question "does this draft
    exhibit the pattern this entry describes?" If yes, rewrite the
    affected lines using the entry's **How to fix** guidance, then
    re-check. `[block]` entries must be cleared before writing the
    final JSON; `[warn]` entries are guidance — rewrite when the fix
    is unambiguous, leave alone when the prose works as-is. Note any
    `[warn]` entries you deliberately left in the change log so the
    next reviewer can see the call was intentional.

`docs/voice-editor-prompt.md` walks through these in more detail. The
deterministic `voice-check` CLI is the final gate.

---

# Master ingredient lookup

Use these slugs when populating `ingredientsList`. Regenerated from
`packages/db/scripts/data/ingredients.ts` via
`pnpm --filter "@homemade/db" run lookup:generate`.

If an ingredient you want is missing, pick the closest match and flag
it in the brief return for a separate "add new ingredient" session.

<!-- BEGIN INGREDIENT_LOOKUP (generated by generate-master-lookup.ts) -->
Format: slug | name | unit | dietary | aliases
Dietary flags are abbreviated (v=vegetarian, V=vegan, gf=glutenFree, df=dairyFree, nf=nutFree). Empty when none.

### flour
00-flour | 00 flour | g | v,V,df,nf | doppio zero, tipo 00, pasta flour, pizza flour
almond-flour | Almond flour | g | v,V,gf,df | ground almonds, almond meal
brown-rice-flour | Brown rice flour | g | v,V,gf,df,nf | -
buckwheat-flour | Buckwheat flour | g | v,V,gf,df,nf | sarrasin
chickpea-flour | Chickpea flour | g | v,V,gf,df,nf | gram flour, besan
coconut-flour | Coconut flour | g | v,V,gf,df,nf | -
cornflour | Cornflour | g | v,V,gf,df,nf | cornstarch, arrowroot
einkorn-flour | Einkorn flour | g | v,V,df,nf | -
filo-pastry | Filo pastry | sheet | v,V,df,nf | phyllo pastry
fine-semolina | Fine semolina | g | v,V,df,nf | semolina flour, rimacinata
khorasan-flour | Khorasan flour | g | v,V,df,nf | Kamut flour
masa-harina | Masa harina | g | v,V,gf,df,nf | -
oat-flour | Oat flour | g | v,V,df,nf | -
plain-flour | Plain flour | g | v,V,df,nf | all-purpose flour, AP flour
polenta | Polenta | g | v,V,gf,df,nf | cornmeal, maize meal
puff-pastry | Puff pastry | g | v,nf | ready-rolled puff pastry
rice-flour | Rice flour | g | v,V,gf,df,nf | white rice flour
rye-flour | Rye flour | g | v,V,df,nf | -
self-raising-flour | Self-raising flour | g | v,V,df,nf | self-rising flour
semolina | Semolina | g | v,V,df,nf | durum semolina
shortcrust-pastry | Shortcrust pastry | g | v,nf | -
spelt-flour | Spelt flour | g | v,V,df,nf | -
strong-bread-flour | Strong bread flour | g | v,V,df,nf | bread flour, high-protein flour
tapioca-flour | Tapioca flour | g | v,V,gf,df,nf | tapioca starch
wholemeal-bread-flour | Wholemeal bread flour | g | v,V,df,nf | whole wheat bread flour
wholemeal-flour | Wholemeal flour | g | v,V,df,nf | whole wheat flour, wholewheat

### grain
arborio-rice | Arborio rice | g | V,v,gf,df,nf | -
bagel | Bagel | each | v,V,df,nf | -
baguette | Baguette | each | v,V,df,nf | french bread, french stick
basmati-rice | Basmati rice | g | V,v,gf,df,nf | -
bread | Bread | slice | V,v,df,nf | loaf
breadcrumbs-dried | Dried breadcrumbs | g | V,v,df,nf | -
brown-rice | Brown rice | g | V,v,gf,df,nf | -
bulgur-wheat | Bulgur wheat | g | V,v,df,nf | bulgar, cracked wheat
caramelised-biscuit | Caramelised biscuit | each | v,V,df,nf | speculoos, Biscoff, Biscoff biscuit, Lotus biscuit, speculaas
carnaroli-rice | Carnaroli rice | g | V,v,gf,df,nf | -
chocolate-sandwich-biscuit | Chocolate sandwich biscuit | each | v,V,df,nf | Oreo, Oreos, cookies and cream biscuit
corn-tortilla | Corn tortilla | each | v,V,gf,df,nf | -
cornflakes | Cornflakes | g | v,V,df,nf | -
couscous | Couscous | g | V,v,df,nf | -
croissant | Croissant | each | v,nf | -
digestive-biscuit | Digestive biscuit | each | v,nf | McVities digestive
giant-couscous | Giant couscous | g | V,v,df,nf | mograbiah, pearl couscous
graham-cracker | Graham cracker | each | v,nf | -
granola | Granola | g | v,V,df | -
jasmine-rice | Jasmine rice | g | V,v,gf,df,nf | -
jumbo-oats | Jumbo oats | g | V,v,df,nf | -
lasagne-sheets | Lasagne sheets | sheet | V,v,df,nf | lasagna sheets
long-grain-rice | Long-grain rice | g | V,v,gf,df,nf | -
muesli | Muesli | g | v,V,df | -
naan-bread | Naan bread | each | v,nf | naan
noodles-egg | Egg noodles | g | v,df,nf | -
noodles-rice | Rice noodles | g | V,v,gf,df,nf | rice vermicelli
noodles-soba | Soba noodles | g | V,v,df,nf | -
noodles-udon | Udon noodles | g | V,v,df,nf | -
paella-rice | Paella rice | g | V,v,gf,df,nf | bomba rice, calasparra
panko | Panko breadcrumbs | g | V,v,df,nf | -
pasta-dried | Dried pasta | g | V,v,df,nf | -
pasta-fresh | Fresh pasta | g | v,df,nf | -
pearl-barley | Pearl barley | g | V,v,df,nf | -
pitta-bread | Pitta bread | each | v,V,df,nf | pita bread
porridge-oats | Porridge oats | g | V,v,df,nf | rolled oats, old-fashioned oats
quinoa | Quinoa | g | V,v,gf,df,nf | -
rice-cake | Rice cake | each | v,V,gf,df,nf | -
rice-krispies | Rice Krispies | g | v,V,df,nf | rice cereal, puffed rice cereal
shortbread-biscuit | Shortbread biscuit | each | v,nf | -
sushi-rice | Sushi rice | g | V,v,gf,df,nf | short-grain Japanese rice
tortilla-wrap | Tortilla wrap | each | v,V,df,nf | flour tortilla, tortilla
wild-rice | Wild rice | g | V,v,gf,df,nf | -

### dairy
almond-milk | Almond milk | ml | v,V,df | -
brie | Brie | g | v,gf,nf | -
buttermilk | Buttermilk | ml | v,nf | cultured buttermilk
camembert | Camembert | g | v,gf,nf | -
cheddar | Cheddar | g | v,gf,nf | mature cheddar, tasty cheese
clotted-cream | Clotted cream | g | v,gf,nf | Cornish cream, Devon cream
comte | Comté | g | v,gf,nf | comte
condensed-milk | Condensed milk | g | v,gf,nf | sweetened condensed milk
cottage-cheese | Cottage cheese | g | v,gf,nf | -
cream-cheese | Cream cheese | g | v,gf,nf | soft cheese, Philadelphia
creme-fraiche | Crème fraîche | g | v,gf,nf | -
double-cream | Double cream | ml | v,gf,nf | heavy cream
egg-whites | Egg whites | each | v,gf,df,nf | -
egg-yolks | Egg yolks | each | v,gf,df,nf | -
eggs | Eggs | each | v,gf,df,nf | hen eggs, chicken eggs
emmental | Emmental | g | v,gf,nf | Swiss cheese
evaporated-milk | Evaporated milk | ml | v,gf,nf | -
feta | Feta | g | v,gf,nf | -
ghee | Ghee | g | v,gf,nf | clarified butter
goats-cheese | Goat's cheese | g | v,gf,nf | chèvre
gorgonzola | Gorgonzola | g | v,gf,nf | -
grana-padano | Grana Padano | g | gf,nf | -
greek-yoghurt | Greek yoghurt | g | v,gf,nf | Greek yogurt, strained yoghurt
gruyere | Gruyère | g | v,gf,nf | gruyere
halloumi | Halloumi | g | v,gf,nf | -
mascarpone | Mascarpone | g | v,gf,nf | -
mozzarella | Mozzarella | g | v,gf,nf | cow mozzarella
mozzarella-di-bufala | Mozzarella di bufala | g | v,gf,nf | buffalo mozzarella, fresh mozzarella
oat-milk | Oat milk | ml | v,V,df,nf | -
paneer | Paneer | g | v,gf,nf | -
parmesan | Parmesan | g | gf,nf | Parmigiano-Reggiano, parmigiano
pecorino-romano | Pecorino Romano | g | gf,nf | pecorino
plain-yoghurt | Plain yoghurt | g | v,gf,nf | plain yogurt, natural yoghurt
red-leicester | Red Leicester | g | v,gf,nf | -
ricotta | Ricotta | g | v,gf,nf | -
roquefort | Roquefort | g | v,gf,nf | -
salted-butter | Salted butter | g | v,gf,nf | -
semi-skimmed-milk | Semi-skimmed milk | ml | v,nf | 2% milk, green-top milk
single-cream | Single cream | ml | v,gf,nf | light cream, pouring cream
skimmed-milk | Skimmed milk | ml | v,nf | skim milk, red-top milk, fat-free milk
soured-cream | Soured cream | g | v,gf,nf | sour cream
soya-milk | Soya milk | ml | v,V,df,nf | soy milk
stilton | Stilton | g | v,gf,nf | blue stilton
unsalted-butter | Unsalted butter | g | v,gf,nf | sweet butter
whipping-cream | Whipping cream | ml | v,gf,nf | -
whole-milk | Whole milk | ml | v,nf | full-fat milk, blue-top milk

### meat
back-bacon | Back bacon | g | gf,df,nf | rashers, Canadian bacon
beef-brisket | Beef brisket | g | gf,df,nf | -
beef-chuck | Beef chuck | g | gf,df,nf | chuck steak, braising steak
beef-fillet | Beef fillet | g | gf,df,nf | filet mignon, tenderloin
beef-mince | Beef mince | g | gf,df,nf | ground beef, minced beef
beef-rib | Beef rib of beef | g | gf,df,nf | fore rib, standing rib roast, prime rib
beef-ribeye | Ribeye steak | g | gf,df,nf | rib-eye, scotch fillet
beef-rump | Beef rump steak | g | gf,df,nf | rump
beef-shin | Beef shin | g | gf,df,nf | beef shank, osso buco cut
beef-sirloin | Beef sirloin | g | gf,df,nf | sirloin joint, striploin
black-pudding | Black pudding | g | df | blood pudding
chicken-breast | Chicken breast | each | gf,df,nf | chicken supreme
chicken-drumsticks | Chicken drumsticks | each | gf,df,nf | -
chicken-livers | Chicken livers | g | gf,df,nf | -
chicken-mince | Chicken mince | g | gf,df,nf | ground chicken
chicken-thigh | Chicken thigh | each | gf,df,nf | -
chicken-whole | Whole chicken | each | gf,df,nf | roasting chicken
chicken-wings | Chicken wings | g | gf,df,nf | -
chorizo | Chorizo | g | gf,df,nf | -
duck-breast | Duck breast | each | gf,df,nf | magret
duck-legs | Duck legs | each | gf,df,nf | -
duck-whole | Whole duck | each | gf,df,nf | -
gammon | Gammon | g | gf,df,nf | raw ham
guanciale | Guanciale | g | gf,df,nf | -
ham-hock | Ham hock | each | gf,df,nf | -
lamb-leg | Lamb leg | g | gf,df,nf | leg of lamb
lamb-mince | Lamb mince | g | gf,df,nf | ground lamb, minced lamb
lamb-neck | Lamb neck | g | gf,df,nf | neck of lamb, middle neck
lamb-rack | Rack of lamb | each | gf,df,nf | french-trimmed rack
lamb-shanks | Lamb shanks | each | gf,df,nf | -
lamb-shoulder | Lamb shoulder | g | gf,df,nf | -
merguez | Merguez | each | gf,df,nf | -
mutton | Mutton | g | gf,df,nf | -
ox-cheek | Ox cheek | g | gf,df,nf | beef cheek
ox-kidney | Ox kidney | g | gf,df,nf | beef kidney
pancetta | Pancetta | g | gf,df,nf | -
pheasant | Pheasant | each | gf,df,nf | -
pork-belly | Pork belly | g | gf,df,nf | -
pork-loin | Pork loin | g | gf,df,nf | loin of pork
pork-mince | Pork mince | g | gf,df,nf | ground pork, minced pork
pork-ribs | Pork ribs | g | gf,df,nf | baby back ribs, spare ribs
pork-shoulder | Pork shoulder | g | gf,df,nf | Boston butt, pork butt
pork-tenderloin | Pork tenderloin | g | gf,df,nf | pork fillet
prosciutto | Prosciutto | g | gf,df,nf | prosciutto crudo, Parma ham
rabbit | Rabbit | each | gf,df,nf | -
sausages-pork | Pork sausages | each | df | bangers, links
serrano-ham | Serrano ham | g | gf,df,nf | jamón serrano
streaky-bacon | Streaky bacon | g | gf,df,nf | American bacon, side bacon
turkey-crown | Turkey crown | kg | gf,df,nf | -
turkey-mince | Turkey mince | g | gf,df,nf | ground turkey
turkey-whole | Whole turkey | kg | gf,df,nf | -
venison | Venison | g | gf,df,nf | -

### fish
anchovies | Anchovies | each | gf,df,nf | -
clams | Clams | g | gf,df,nf | palourdes, vongole
cod-fillet | Cod fillet | each | gf,df,nf | -
crab-meat | Crab meat | g | gf,df,nf | white crab, brown crab
haddock-fillet | Haddock fillet | each | gf,df,nf | -
herring | Herring | each | gf,df,nf | -
king-prawns | King prawns | each | gf,df,nf | jumbo shrimp, tiger prawns
kippers | Kippers | each | gf,df,nf | -
lobster | Lobster | each | gf,df,nf | -
mackerel | Mackerel | each | gf,df,nf | -
mussels | Mussels | g | gf,df,nf | -
octopus | Octopus | kg | gf,df,nf | -
pollock | Pollock | g | gf,df,nf | saithe, coley
prawns-cooked | Cooked prawns | g | gf,df,nf | cooked shrimp
prawns-raw | Raw prawns | g | gf,df,nf | raw shrimp
salmon-fillet | Salmon fillet | each | gf,df,nf | -
salmon-whole | Whole salmon | each | gf,df,nf | side of salmon
sardines-fresh | Fresh sardines | each | gf,df,nf | pilchards
sardines-tinned | Tinned sardines | g | gf,df,nf | -
scallops | Scallops | each | gf,df,nf | king scallops
sea-bass | Sea bass | each | gf,df,nf | branzino
sea-bream | Sea bream | each | gf,df,nf | orata, dorade
smoked-haddock | Smoked haddock | g | gf,df,nf | Arbroath smokies, finnan haddie
smoked-mackerel | Smoked mackerel | g | gf,df,nf | -
smoked-salmon | Smoked salmon | g | gf,df,nf | lox
smoked-trout | Smoked trout | g | gf,df,nf | -
squid | Squid | g | gf,df,nf | calamari
trout-fillet | Trout fillet | each | gf,df,nf | rainbow trout, sea trout
tuna-steak | Tuna steak | each | gf,df,nf | yellowfin tuna
tuna-tinned | Tinned tuna | g | gf,df,nf | canned tuna

### vegetable
artichoke-hearts | Artichoke hearts | g | v,V,gf,df,nf | -
asparagus | Asparagus | g | v,V,gf,df,nf | -
aubergine | Aubergine | each | v,V,gf,df,nf | eggplant, brinjal
baby-gem | Baby gem lettuce | each | v,V,gf,df,nf | little gem
beetroot | Beetroot | each | v,V,gf,df,nf | beets
broad-beans | Broad beans | g | v,V,gf,df,nf | fava beans
broccoli | Broccoli | each | v,V,gf,df,nf | calabrese
butternut-squash | Butternut squash | each | v,V,gf,df,nf | -
cabbage-red | Red cabbage | each | v,V,gf,df,nf | -
cabbage-savoy | Savoy cabbage | each | v,V,gf,df,nf | -
cabbage-white | White cabbage | each | v,V,gf,df,nf | -
carrot | Carrot | each | v,V,gf,df,nf | -
cauliflower | Cauliflower | each | v,V,gf,df,nf | -
cavolo-nero | Cavolo nero | g | v,V,gf,df,nf | black kale, Tuscan kale, lacinato
celeriac | Celeriac | each | v,V,gf,df,nf | celery root
celery | Celery | each | v,V,gf,df,nf | -
chard | Chard | g | v,V,gf,df,nf | Swiss chard, rainbow chard
cherry-tomatoes | Cherry tomatoes | g | v,V,gf,df,nf | -
chilli-green | Green chilli | each | v,V,gf,df,nf | green chili pepper
chilli-red | Red chilli | each | v,V,gf,df,nf | red chili pepper
cos-lettuce | Cos lettuce | each | v,V,gf,df,nf | romaine
courgette | Courgette | each | v,V,gf,df,nf | zucchini
courgette-flower | Courgette flowers | each | v,V,gf,df,nf | zucchini flowers
cucumber | Cucumber | each | v,V,gf,df,nf | -
fennel | Fennel bulb | each | v,V,gf,df,nf | Florence fennel
galangal | Galangal | g | v,V,gf,df,nf | -
garlic | Garlic | clove | v,V,gf,df,nf | garlic bulb
ginger-root | Ginger | g | v,V,gf,df,nf | fresh ginger, ginger root
globe-artichoke | Globe artichoke | each | v,V,gf,df,nf | -
green-beans | Green beans | g | v,V,gf,df,nf | French beans, haricots verts
jalapeno | Jalapeño | each | v,V,gf,df,nf | jalapeño
jerusalem-artichoke | Jerusalem artichoke | g | v,V,gf,df,nf | sunchoke
kale | Kale | g | v,V,gf,df,nf | curly kale
leek | Leek | each | v,V,gf,df,nf | -
lemongrass | Lemongrass | each | v,V,gf,df,nf | -
lettuce | Lettuce | each | v,V,gf,df,nf | round lettuce, butterhead
mangetout | Mangetout | g | v,V,gf,df,nf | snow peas
mushrooms-button | Button mushrooms | g | v,V,gf,df,nf | white mushrooms
mushrooms-chestnut | Chestnut mushrooms | g | v,V,gf,df,nf | cremini
mushrooms-oyster | Oyster mushrooms | g | v,V,gf,df,nf | -
mushrooms-porcini-dried | Dried porcini | g | v,V,gf,df,nf | ceps
mushrooms-portobello | Portobello mushrooms | each | v,V,gf,df,nf | portabella, field mushrooms
mushrooms-shiitake | Shiitake mushrooms | g | v,V,gf,df,nf | -
napa-cabbage | Napa cabbage | each | v,V,gf,df,nf | Chinese leaf, wombok
okra | Okra | g | v,V,gf,df,nf | ladies' fingers, bhindi
onion | Onion | each | v,V,gf,df,nf | brown onion, yellow onion
pak-choi | Pak choi | each | v,V,gf,df,nf | bok choy
parsnip | Parsnip | each | v,V,gf,df,nf | -
peas-frozen | Frozen peas | g | v,V,gf,df,nf | garden peas, petits pois
pepper-green | Green pepper | each | v,V,gf,df,nf | green bell pepper
pepper-red | Red pepper | each | v,V,gf,df,nf | red bell pepper, capsicum
pepper-yellow | Yellow pepper | each | v,V,gf,df,nf | yellow bell pepper
potato | Potato | each | v,V,gf,df,nf | -
pumpkin | Pumpkin | each | v,V,gf,df,nf | -
purple-sprouting-broccoli | Purple sprouting broccoli | g | v,V,gf,df,nf | PSB
radish | Radish | each | v,V,gf,df,nf | -
red-onion | Red onion | each | v,V,gf,df,nf | Spanish onion
rocket | Rocket | g | v,V,gf,df,nf | arugula
runner-beans | Runner beans | g | v,V,gf,df,nf | -
samphire | Samphire | g | v,V,gf,df,nf | marsh samphire
scotch-bonnet | Scotch bonnet | each | v,V,gf,df,nf | habanero
shallot | Shallot | each | v,V,gf,df,nf | échalote
spinach | Spinach | g | v,V,gf,df,nf | baby spinach
spring-greens | Spring greens | g | v,V,gf,df,nf | collard greens
spring-onion | Spring onion | each | v,V,gf,df,nf | scallion, green onion
sugar-snap-peas | Sugar snap peas | g | v,V,gf,df,nf | -
swede | Swede | each | v,V,gf,df,nf | rutabaga, neeps
sweet-potato | Sweet potato | each | v,V,gf,df,nf | kumara
sweetcorn | Sweetcorn | each | v,V,gf,df,nf | corn on the cob
sweetcorn-tinned | Tinned sweetcorn | g | v,V,gf,df,nf | canned corn
tenderstem | Tenderstem broccoli | g | v,V,gf,df,nf | broccolini
tinned-tomatoes | Tinned tomatoes | g | v,V,gf,df,nf | canned tomatoes
tomato | Tomato | each | v,V,gf,df,nf | -
tomato-passata | Tomato passata | ml | v,V,gf,df,nf | strained tomatoes
tomato-puree | Tomato purée | tbsp | v,V,gf,df,nf | tomato paste
turnip | Turnip | each | v,V,gf,df,nf | -
watercress | Watercress | g | v,V,gf,df,nf | -
wild-garlic | Wild garlic | g | v,V,gf,df,nf | ramsons, bear garlic

### fruit
apple-bramley | Bramley apple | each | v,V,gf,df,nf | cooking apples
apple-eating | Eating apple | each | v,V,gf,df,nf | dessert apples, Cox, Gala, Braeburn
apricots | Apricots | each | v,V,gf,df,nf | -
avocado | Avocado | each | v,V,gf,df,nf | -
banana | Banana | each | v,V,gf,df,nf | -
blackberries | Blackberries | g | v,V,gf,df,nf | brambles
blackcurrants | Blackcurrants | g | v,V,gf,df,nf | -
blood-orange | Blood orange | each | v,V,gf,df,nf | -
blueberries | Blueberries | g | v,V,gf,df,nf | -
cherries | Cherries | g | v,V,gf,df,nf | -
clementine | Clementine | each | v,V,gf,df,nf | satsuma, mandarin
coconut-cream | Coconut cream | ml | v,V,gf,df,nf | -
coconut-desiccated | Desiccated coconut | g | v,V,gf,df,nf | shredded coconut
coconut-flakes | Coconut flakes | g | v,V,gf,df,nf | -
coconut-fresh | Fresh coconut | each | v,V,gf,df,nf | -
coconut-milk | Coconut milk | ml | v,V,gf,df,nf | -
currants | Currants | g | v,V,gf,df,nf | -
damsons | Damsons | g | v,V,gf,df,nf | -
dates-medjool | Medjool dates | each | v,V,gf,df,nf | -
desiccated-coconut | Desiccated coconut | g | v,V,gf,df,nf | shredded coconut
dried-apricots | Dried apricots | g | v,V,gf,df | -
dried-blueberries | Dried blueberries | g | v,V,gf,df,nf | -
dried-cranberries | Dried cranberries | g | v,V,gf,df,nf | Craisins
figs | Figs | each | v,V,gf,df,nf | -
gooseberries | Gooseberries | g | v,V,gf,df,nf | -
grapefruit | Grapefruit | each | v,V,gf,df,nf | -
grapes | Grapes | g | v,V,gf,df,nf | -
lemon | Lemon | each | v,V,gf,df,nf | -
lime | Lime | each | v,V,gf,df,nf | -
mango | Mango | each | v,V,gf,df,nf | -
mango-frozen | Frozen mango | g | v,V,gf,df,nf | -
mixed-frozen-berries | Mixed frozen berries | g | v,V,gf,df,nf | frozen berry mix
nectarines | Nectarines | each | v,V,gf,df,nf | -
orange | Orange | each | v,V,gf,df,nf | -
passion-fruit | Passion fruit | each | v,V,gf,df,nf | -
passion-fruit-puree | Passion fruit purée | ml | v,V,gf,df,nf | passionfruit pulp, passionfruit purée
peaches | Peaches | each | v,V,gf,df,nf | -
pear | Pear | each | v,V,gf,df,nf | Conference, Comice
pineapple | Pineapple | each | v,V,gf,df,nf | -
plums | Plums | each | v,V,gf,df,nf | Victoria plums
pomegranate | Pomegranate | each | v,V,gf,df,nf | -
prunes | Prunes | g | v,V,gf,df,nf | dried plums
quince | Quince | each | v,V,gf,df,nf | -
raisins | Raisins | g | v,V,gf,df,nf | -
raspberries | Raspberries | g | v,V,gf,df,nf | -
redcurrants | Redcurrants | g | v,V,gf,df,nf | -
rhubarb | Rhubarb | g | v,V,gf,df,nf | -
seville-orange | Seville orange | each | v,V,gf,df,nf | bitter orange, marmalade orange
strawberries | Strawberries | g | v,V,gf,df,nf | -
sultanas | Sultanas | g | v,V,gf,df,nf | golden raisins

### herb
basil | Basil | g | v,V,gf,df,nf | sweet basil
bay-leaves | Bay leaves | leaf | v,V,gf,df,nf | -
chervil | Chervil | g | v,V,gf,df,nf | -
chives | Chives | g | v,V,gf,df,nf | -
chives-chinese | Chinese chives | g | v,V,gf,df,nf | garlic chives
coriander | Coriander | g | v,V,gf,df,nf | cilantro, Chinese parsley
curry-leaves | Curry leaves | leaf | v,V,gf,df,nf | -
dill | Dill | g | v,V,gf,df,nf | -
fennel-fronds | Fennel fronds | g | v,V,gf,df,nf | -
kaffir-lime-leaves | Makrut lime leaves | leaf | v,V,gf,df,nf | kaffir lime leaves
lemon-thyme | Lemon thyme | sprig | v,V,gf,df,nf | -
lovage | Lovage | g | v,V,gf,df,nf | -
marjoram | Marjoram | g | v,V,gf,df,nf | -
mint | Mint | g | v,V,gf,df,nf | spearmint
oregano-dried | Dried oregano | tsp | v,V,gf,df,nf | -
oregano-fresh | Fresh oregano | g | v,V,gf,df,nf | -
pandan-leaves | Pandan leaves | leaf | v,V,gf,df,nf | -
parsley-curly | Curly parsley | g | v,V,gf,df,nf | -
parsley-flat | Flat-leaf parsley | g | v,V,gf,df,nf | Italian parsley
rosemary | Rosemary | sprig | v,V,gf,df,nf | -
sage | Sage | g | v,V,gf,df,nf | -
shiso | Shiso | leaf | v,V,gf,df,nf | perilla
sorrel | Sorrel | g | v,V,gf,df,nf | -
tarragon | Tarragon | g | v,V,gf,df,nf | French tarragon
thai-basil | Thai basil | g | v,V,gf,df,nf | holy basil
thyme | Thyme | sprig | v,V,gf,df,nf | -

### spice
aleppo-pepper | Aleppo pepper | tsp | v,V,gf,df,nf | pul biber
allspice | Allspice | tsp | v,V,gf,df,nf | Jamaican pepper, pimento
ancho-chilli | Ancho chilli | each | v,V,gf,df,nf | dried poblano
asafoetida | Asafoetida | pinch | V,v,df,nf | hing
baharat | Baharat | tsp | v,V,gf,df,nf | -
black-pepper | Black pepper | tsp | v,V,gf,df,nf | peppercorns
caraway-seeds | Caraway seeds | tsp | v,V,gf,df,nf | -
cardamom-black | Black cardamom | each | v,V,gf,df,nf | -
cardamom-green | Green cardamom | each | v,V,gf,df,nf | cardamom pods
cayenne | Cayenne pepper | tsp | v,V,gf,df,nf | -
celery-salt | Celery salt | tsp | v,V,gf,df,nf | -
chai-spice | Chai spice blend | tsp | v,V,gf,df,nf | masala chai spice
chilli-flakes | Chilli flakes | tsp | v,V,gf,df,nf | red pepper flakes, crushed chillies
chilli-powder | Chilli powder | tsp | v,V,gf,df,nf | chili powder
chinese-five-spice | Chinese five spice | tsp | v,V,gf,df,nf | -
chipotle | Chipotle chilli | each | v,V,gf,df,nf | smoked jalapeño
cinnamon-ground | Ground cinnamon | tsp | v,V,gf,df,nf | -
cinnamon-stick | Cinnamon stick | each | v,V,gf,df,nf | cassia
cloves | Cloves | each | v,V,gf,df,nf | -
coriander-ground | Ground coriander | tsp | v,V,gf,df,nf | -
coriander-seeds | Coriander seeds | tsp | v,V,gf,df,nf | -
cumin-ground | Ground cumin | tsp | v,V,gf,df,nf | -
cumin-seeds | Cumin seeds | tsp | v,V,gf,df,nf | -
curry-powder | Curry powder | tsp | v,V,gf,df,nf | mild curry powder, Madras curry powder
fennel-seeds | Fennel seeds | tsp | v,V,gf,df,nf | -
fenugreek-leaves | Dried fenugreek leaves | tbsp | v,V,gf,df,nf | kasoori methi, kasuri methi
fenugreek-seeds | Fenugreek seeds | tsp | v,V,gf,df,nf | methi seeds
garam-masala | Garam masala | tsp | v,V,gf,df,nf | -
garlic-powder | Garlic powder | tsp | v,V,gf,df,nf | granulated garlic
ginger-ground | Ground ginger | tsp | v,V,gf,df,nf | -
italian-seasoning | Italian seasoning | tsp | v,V,gf,df,nf | dried mixed italian herbs, mixed italian herbs, italian herb blend
juniper-berries | Juniper berries | each | v,V,gf,df,nf | -
kosher-salt | Kosher salt | g | v,V,gf,df,nf | -
mace | Mace | tsp | v,V,gf,df,nf | -
msg | MSG | tsp | v,V,gf,df,nf | monosodium glutamate, Ajinomoto
mustard-seeds-black | Black mustard seeds | tsp | v,V,gf,df,nf | rai
mustard-seeds-yellow | Yellow mustard seeds | tsp | v,V,gf,df,nf | -
nigella-seeds | Nigella seeds | tsp | v,V,gf,df,nf | kalonji, black onion seeds
nutmeg-ground | Ground nutmeg | tsp | v,V,gf,df,nf | -
nutmeg-whole | Whole nutmeg | each | v,V,gf,df,nf | -
old-bay | Old Bay | tsp | v,V,gf,df,nf | -
onion-powder | Onion powder | tsp | v,V,gf,df,nf | granulated onion
paprika-hot | Hot paprika | tsp | v,V,gf,df,nf | -
paprika-smoked | Smoked paprika | tsp | v,V,gf,df,nf | pimentón, pimenton
paprika-sweet | Sweet paprika | tsp | v,V,gf,df,nf | Hungarian paprika
ras-el-hanout | Ras el hanout | tbsp | v,V,gf,df,nf | -
saffron | Saffron | pinch | v,V,gf,df,nf | saffron strands
salt-table | Table salt | g | v,V,gf,df,nf | fine salt
sea-salt-fine | Fine sea salt | g | v,V,gf,df,nf | -
sea-salt-flakes | Sea salt flakes | g | v,V,gf,df,nf | Maldon, flaky salt
sichuan-pepper | Sichuan pepper | tsp | v,V,gf,df,nf | Szechuan pepper
star-anise | Star anise | each | v,V,gf,df,nf | -
sumac | Sumac | tsp | v,V,gf,df,nf | -
turmeric | Ground turmeric | tsp | v,V,gf,df,nf | haldi
vanilla-pod | Vanilla pod | each | v,V,gf,df,nf | vanilla bean
white-pepper | White pepper | tsp | v,V,gf,df,nf | -
za-atar | Za'atar | tbsp | v,V,df,nf | zaatar

### condiment
anchovy-paste | Anchovy paste | tsp | gf,df,nf | -
balsamic-glaze | Balsamic glaze | tbsp | v,V,df,nf | balsamic reduction
balsamic-vinegar | Balsamic vinegar | ml | V,v,gf,df,nf | aceto balsamico
bouillon-powder | Bouillon powder | tsp | V,v,gf,df,nf | Marigold bouillon
caesar-dressing | Caesar dressing | ml | - | -
capers | Capers | tbsp | V,v,gf,df,nf | -
cider-vinegar | Cider vinegar | ml | V,v,gf,df,nf | apple cider vinegar
cornichons | Cornichons | each | V,v,gf,df,nf | -
dijon-mustard | Dijon mustard | tsp | V,v,gf,df,nf | -
doubanjiang | Doubanjiang | tbsp | V,v,df,nf | Pixian chilli bean paste
english-mustard | English mustard | tsp | V,v,gf,df,nf | Colman's
english-mustard-powder | English mustard powder | tsp | V,v,gf,df,nf | -
fish-sauce | Fish sauce | tbsp | gf,df,nf | nam pla, nuoc mam
gherkins | Gherkins | each | V,v,gf,df,nf | pickles
gochujang | Gochujang | tbsp | V,v,df,nf | -
harissa | Harissa | tbsp | V,v,gf,df,nf | -
hoisin-sauce | Hoisin sauce | tbsp | V,v,df,nf | -
hp-sauce | Brown sauce | tbsp | V,v,df,nf | HP sauce, daddies sauce
ketchup | Tomato ketchup | tbsp | V,v,gf,df,nf | -
louisiana-hot-sauce | Louisiana-style hot sauce | tsp | v,V,gf,df,nf | hot sauce, Tabasco, tabasco sauce
malt-vinegar | Malt vinegar | ml | V,v,df,nf | brown vinegar
marmite | Marmite | tsp | V,v,df,nf | -
mayonnaise | Mayonnaise | tbsp | v,gf,df,nf | mayo
miso-red | Red miso | tbsp | V,v,gf,df,nf | aka miso
miso-white | White miso | tbsp | V,v,gf,df,nf | shiro miso
nutritional-yeast | Nutritional yeast | g | v,V,gf,df,nf | nutritional yeast flakes, nooch
olives-black | Black olives | g | V,v,gf,df,nf | -
olives-green | Green olives | g | V,v,gf,df,nf | -
olives-kalamata | Kalamata olives | g | V,v,gf,df,nf | black olives
oyster-sauce | Oyster sauce | tbsp | df,nf | -
red-wine-vinegar | Red wine vinegar | ml | V,v,gf,df,nf | -
rice-vinegar | Rice vinegar | ml | V,v,gf,df,nf | rice wine vinegar
sherry-vinegar | Sherry vinegar | ml | V,v,gf,df,nf | vinagre de Jerez
soy-sauce-dark | Dark soy sauce | tbsp | V,v,df,nf | -
soy-sauce-light | Light soy sauce | tbsp | V,v,df,nf | shoyu
sriracha | Sriracha | tbsp | V,v,gf,df,nf | -
stock-beef | Beef stock | ml | gf,df,nf | beef broth
stock-chicken | Chicken stock | ml | gf,df,nf | chicken broth
stock-cube | Stock cube | each | - | bouillon cube, OXO cube
stock-fish | Fish stock | ml | gf,df,nf | fish fumet, fish broth
stock-vegetable | Vegetable stock | ml | V,v,gf,df,nf | vegetable broth
sun-dried-tomatoes | Sun-dried tomatoes | g | V,v,gf,df,nf | -
tahini | Tahini | tbsp | V,v,gf,df,nf | sesame paste
tamari | Tamari | tbsp | V,v,gf,df,nf | -
white-wine-vinegar | White wine vinegar | ml | V,v,gf,df,nf | -
wholegrain-mustard | Wholegrain mustard | tsp | V,v,gf,df,nf | -
worcestershire-sauce | Worcestershire sauce | tsp | df,nf | -

### pulse
baked-beans | Baked beans | g | V,v,df,nf | -
black-beans | Black beans | g | V,v,gf,df,nf | turtle beans
black-eyed-beans | Black-eyed beans | g | V,v,gf,df,nf | black-eyed peas
borlotti-beans | Borlotti beans | g | V,v,gf,df,nf | cranberry beans
butter-beans | Butter beans | g | V,v,gf,df,nf | lima beans
cannellini-beans | Cannellini beans | g | V,v,gf,df,nf | -
chickpeas-dried | Dried chickpeas | g | V,v,gf,df,nf | -
chickpeas-tinned | Tinned chickpeas | g | V,v,gf,df,nf | garbanzo beans
haricot-beans | Haricot beans | g | V,v,gf,df,nf | navy beans
kidney-beans | Kidney beans | g | V,v,gf,df,nf | red kidney beans
lentils-black-beluga | Black beluga lentils | g | V,v,gf,df,nf | -
lentils-brown | Brown lentils | g | V,v,gf,df,nf | -
lentils-green | Green lentils | g | V,v,gf,df,nf | -
pinto-beans | Pinto beans | g | V,v,gf,df,nf | -
puy-lentils | Puy lentils | g | V,v,gf,df,nf | French green lentils
red-lentils | Red lentils | g | V,v,gf,df,nf | masoor dal
split-peas-green | Green split peas | g | V,v,gf,df,nf | -
split-peas-yellow | Yellow split peas | g | V,v,gf,df,nf | chana dal
tempeh | Tempeh | g | V,v,gf,df,nf | -
tofu-firm | Firm tofu | g | V,v,gf,df,nf | -
tofu-silken | Silken tofu | g | V,v,gf,df,nf | -

### nut
almonds | Almonds | g | V,v,gf,df | -
almonds-flaked | Flaked almonds | g | V,v,gf,df | slivered almonds
brazil-nuts | Brazil nuts | g | V,v,gf,df | -
cashews | Cashews | g | V,v,gf,df | -
chestnut-cooked | Cooked chestnuts | g | v,V,gf,df | vacuum-packed chestnuts
chestnuts | Chestnuts | g | V,v,gf,df,nf | -
hazelnuts | Hazelnuts | g | V,v,gf,df | cobnuts, filberts
macadamia-nuts | Macadamia nuts | g | V,v,gf,df | -
peanut-butter | Peanut butter | tbsp | V,v,gf,df | -
peanuts | Peanuts | g | V,v,gf,df | groundnuts
pecans | Pecans | g | V,v,gf,df | -
pine-nuts | Pine nuts | g | V,v,gf,df | pignoli
pistachios | Pistachios | g | V,v,gf,df | -
walnuts | Walnuts | g | V,v,gf,df | -

### seed
black-sesame-seeds | Black sesame seeds | tbsp | V,v,gf,df,nf | -
caraway-seed-blend | Mixed seed blend | g | V,v,gf,df,nf | -
chia-seeds | Chia seeds | tbsp | V,v,gf,df,nf | -
flaxseed | Flaxseed | tbsp | V,v,gf,df,nf | linseed
hemp-seeds | Hemp seeds | tbsp | V,v,gf,df,nf | hemp hearts
mixed-seeds | Mixed seeds | g | V,v,gf,df,nf | -
poppy-seeds | Poppy seeds | tbsp | V,v,gf,df,nf | -
pumpkin-seeds | Pumpkin seeds | g | V,v,gf,df,nf | pepitas
sesame-seeds | Sesame seeds | tbsp | V,v,gf,df,nf | -
sunflower-seeds | Sunflower seeds | g | V,v,gf,df,nf | -

### baking
agar-agar | Agar agar | g | V,v,gf,df,nf | -
almond-extract | Almond extract | tsp | V,v,gf,df | -
baking-powder | Baking powder | tsp | V,v,gf,df,nf | -
bicarbonate-of-soda | Bicarbonate of soda | tsp | V,v,gf,df,nf | baking soda, sodium bicarbonate
cherries-glace | Glacé cherries | g | v,V,gf,df,nf | candied cherries
chocolate-chips | Chocolate chips | g | v,gf,nf | -
cocoa-powder | Cocoa powder | g | V,v,gf,df,nf | unsweetened cocoa
cream-of-tartar | Cream of tartar | tsp | V,v,gf,df,nf | potassium bitartrate
custard-powder | Custard powder | g | v,gf,df,nf | Birds custard powder
dark-chocolate | Dark chocolate | g | V,v,gf,nf | plain chocolate, bittersweet chocolate
fondant-icing | Fondant icing | g | V,v,gf,df,nf | ready-to-roll icing
food-colouring | Food colouring | tsp | V,v,gf,df,nf | gel food colour
gelatine-leaves | Gelatine leaves | sheet | gf,df,nf | leaf gelatin
gelatine-powder | Powdered gelatine | g | gf,df,nf | -
glace-cherries | Glacé cherries | g | V,v,gf,df,nf | candied cherries
icing-sugar | Icing sugar | g | V,v,gf,df,nf | powdered sugar, confectioner's sugar
marzipan | Marzipan | g | V,v,gf,df | -
milk-chocolate | Milk chocolate | g | v,gf,nf | -
mincemeat | Mincemeat | g | v,nf | fruit mincemeat
mixed-peel | Mixed peel | g | V,v,gf,df,nf | candied peel
mixed-spice | Mixed spice | tsp | V,v,gf,df,nf | British mixed spice
orange-blossom-water | Orange blossom water | tsp | V,v,gf,df,nf | -
pectin | Pectin | g | V,v,gf,df,nf | jam sugar pectin
pumpkin-spice | Pumpkin spice | tsp | V,v,gf,df,nf | -
rose-water | Rose water | tsp | V,v,gf,df,nf | -
sourdough-starter | Sourdough starter | g | V,v,df,nf | levain
vanilla-extract | Vanilla extract | tsp | V,v,gf,df,nf | -
vanilla-paste | Vanilla paste | tsp | V,v,gf,df,nf | vanilla bean paste
white-chocolate | White chocolate | g | v,gf,nf | -
yeast-dried | Dried yeast | g | V,v,gf,df,nf | instant yeast, fast-action yeast
yeast-fast-action | Fast-action dried yeast | g | v,V,gf,df,nf | instant yeast, easy-blend yeast, active dry yeast, rapid yeast
yeast-fresh | Fresh yeast | g | V,v,gf,df,nf | cake yeast

### oil
beef-dripping | Beef dripping | g | gf,df,nf | tallow
chilli-oil | Chilli oil | tsp | V,v,gf,df,nf | rayu, chiu chow chilli oil
coconut-oil | Coconut oil | tbsp | V,v,gf,df,nf | -
cooking-spray | Cooking spray | ml | v,V,gf,df,nf | Frylight
duck-fat | Duck fat | g | gf,df,nf | goose fat
extra-virgin-olive-oil | Extra-virgin olive oil | ml | V,v,gf,df,nf | EVOO
groundnut-oil | Groundnut oil | ml | V,v,gf,df | peanut oil
lard | Lard | g | gf,df,nf | pig fat
olive-oil | Olive oil | ml | V,v,gf,df,nf | -
rapeseed-oil | Rapeseed oil | ml | V,v,gf,df,nf | canola oil
sesame-oil | Toasted sesame oil | tsp | V,v,gf,df,nf | -
sunflower-oil | Sunflower oil | ml | V,v,gf,df,nf | -
vegetable-oil | Vegetable oil | ml | V,v,gf,df,nf | -
walnut-oil | Walnut oil | tbsp | V,v,gf,df | -

### sweetener
agave-syrup | Agave syrup | tbsp | V,v,gf,df,nf | -
black-treacle | Black treacle | tbsp | V,v,gf,df,nf | -
caster-sugar | Caster sugar | g | V,v,gf,df,nf | superfine sugar
dark-brown-sugar | Dark brown sugar | g | V,v,gf,df,nf | soft dark brown sugar
date-syrup | Date syrup | tbsp | V,v,gf,df,nf | silan
demerara-sugar | Demerara sugar | g | V,v,gf,df,nf | -
dulce-de-leche | Dulce de leche | g | v,gf,nf | boiled condensed milk, caramel sauce
golden-syrup | Golden syrup | tbsp | V,v,gf,df,nf | Lyle's golden syrup
granulated-sugar | Granulated sugar | g | V,v,gf,df,nf | white sugar
honey | Honey | tbsp | v,gf,df,nf | -
jam | Jam | g | v,V,gf,df,nf | preserve, fruit preserve
light-brown-sugar | Light brown sugar | g | V,v,gf,df,nf | soft light brown sugar
maple-syrup | Maple syrup | tbsp | V,v,gf,df,nf | -
marshmallows | Marshmallows | g | gf,df,nf | -
molasses | Molasses | tbsp | V,v,gf,df,nf | blackstrap molasses
muscovado-dark | Dark muscovado sugar | g | V,v,gf,df,nf | -

### alcohol
amaretto | Amaretto | tbsp | V,v,gf,df | Disaronno
beer | Beer | ml | V,v,df,nf | ale
brandy | Brandy | ml | V,v,gf,df,nf | cognac
cider-dry | Dry cider | ml | V,v,gf,df,nf | -
cointreau | Cointreau | tbsp | V,v,gf,df,nf | triple sec, orange liqueur
fortified-madeira | Madeira | ml | gf,df,nf | -
fortified-marsala | Marsala wine | ml | gf,df,nf | -
gin | Gin | ml | V,v,gf,df,nf | -
irish-cream-liqueur | Irish cream liqueur | ml | v,gf,nf | Baileys, Baileys Irish Cream
irish-whiskey | Irish whiskey | ml | v,V,gf,df,nf | -
kirsch | Kirsch | ml | V,v,gf,df,nf | -
limoncello | Limoncello | ml | v,V,gf,df,nf | -
mirin | Mirin | tbsp | V,v,gf,df,nf | -
passoa | Passoã | ml | v,V,gf,df,nf | passion fruit liqueur
port | Port | ml | gf,df,nf | -
prosecco | Prosecco | ml | V,v,gf,df,nf | -
red-wine | Red wine | ml | gf,df,nf | -
rose-wine | Rosé wine | ml | gf,df,nf | -
rum-dark | Dark rum | ml | V,v,gf,df,nf | -
rum-white | White rum | ml | V,v,gf,df,nf | -
sake | Sake | ml | V,v,gf,df,nf | -
shaoxing-wine | Shaoxing wine | tbsp | V,v,df,nf | Chinese rice wine
sherry-dry | Dry sherry | ml | gf,df,nf | fino, manzanilla
sherry-sweet | Sweet sherry | ml | gf,df,nf | Pedro Ximenez, PX
stout | Stout | ml | V,v,df,nf | Guinness
vodka | Vodka | ml | V,v,gf,df,nf | -
whisky | Whisky | ml | V,v,df,nf | whiskey, scotch
white-wine-dry | Dry white wine | ml | gf,df,nf | -

### other
almond-butter | Almond butter | g | v,V,gf,df | -
apple-juice | Apple juice | ml | v,V,gf,df,nf | -
bonito-flakes | Bonito flakes | g | gf,df,nf | katsuobushi
caramelised-biscuit-spread | Caramelised biscuit spread | g | v,V,df,nf | Biscoff spread, Lotus spread, speculoos spread, cookie butter
cashew-butter | Cashew butter | g | v,V,gf,df | -
chestnut-puree | Chestnut purée | g | v,V,gf,df | sweetened chestnut spread, crème de marrons
coffee-instant | Instant coffee | tsp | v,V,gf,df,nf | coffee granules
cola | Cola | ml | v,V,gf,df,nf | Coca-Cola, cherry cola
espresso-powder | Espresso powder | tsp | v,V,gf,df,nf | -
horseradish-fresh | Fresh horseradish | g | V,v,gf,df,nf | -
horseradish-sauce | Horseradish sauce | tsp | v,gf,nf | -
ice | Ice | g | V,v,gf,df,nf | ice cubes
kombu | Kombu | g | V,v,gf,df,nf | -
nori | Nori | sheet | V,v,gf,df,nf | -
orange-juice | Orange juice | ml | v,V,gf,df,nf | -
pineapple-juice | Pineapple juice | ml | v,V,gf,df,nf | -
pomegranate-molasses | Pomegranate molasses | tbsp | V,v,gf,df,nf | -
sparkling-water | Sparkling water | ml | v,V,gf,df,nf | fizzy water, soda water
tamarind-paste | Tamarind paste | tbsp | V,v,gf,df,nf | -
tea-bag | Tea bag | each | v,V,gf,df,nf | -
truffle-paste | Truffle paste | tsp | v,gf,df,nf | -
wakame | Wakame | g | V,v,gf,df,nf | -
wasabi | Wasabi paste | tsp | V,v,gf,df,nf | -
water | Water | ml | V,v,gf,df,nf | -
<!-- END INGREDIENT_LOOKUP -->

---

# Master tool lookup

Use these slugs when populating `recipeTools`. Regenerated from
`packages/db/scripts/data/tools.ts` via
`pnpm --filter "@homemade/db" run lookup:generate`.

<!-- BEGIN TOOL_LOOKUP (generated by generate-master-lookup.ts) -->
Format: slug | name | aliases

### knife
boning-knife | Boning knife | -
bread-knife | Bread knife | serrated knife
carving-knife | Carving knife | slicing knife
chefs-knife | Chef's knife | cook's knife, French knife, 8-inch knife
cleaver | Cleaver | Chinese chef's knife
filleting-knife | Filleting knife | fish knife
kitchen-scissors | Kitchen scissors | kitchen shears, poultry shears
mezzaluna | Mezzaluna | rocking blade
oyster-knife | Oyster knife | -
paring-knife | Paring knife | vegetable knife
santoku-knife | Santoku knife | -

### pan
cast-iron-skillet | Cast-iron skillet | Lodge skillet, cast-iron frying pan
crepe-pan | Crêpe pan | crepe pan
fish-kettle | Fish kettle | fish poacher
frying-pan-26 | Frying pan, 26 cm | skillet, fry pan
frying-pan-30 | Frying pan, 30 cm | large skillet
griddle-pan | Griddle pan | grill pan
milk-pan | Milk pan, 18 cm | saucepan with lid
omelette-pan | Omelette pan | -
paella-pan | Paella pan | paellera
roasting-pan | Roasting pan | roasting tin
roti-pan | Tawa | roti pan, chapati pan
saute-pan | Sauté pan, 28 cm | saute pan
small-frying-pan | Small frying pan, 20 cm | egg pan
tagine | Tagine | -
tortilla-pan | Tortilla pan | comal
wok | Wok | carbon-steel wok

### pot
bamboo-steamer | Bamboo steamer | -
dutch-oven | Casserole dish | Dutch oven, Le Creuset, cocotte
jam-pan | Jam pan | preserving pan, maslin pan
large-saucepan | Saucepan, 22 cm | large pot
medium-saucepan | Saucepan, 18 cm | -
pressure-cooker | Pressure cooker | -
pudding-basin | Pudding basin | Mason Cash basin, steam-pudding bowl
ramekins | Ramekins | ramekin
small-saucepan | Small saucepan, 16 cm | -
steamer-pot | Steamer pot | multi-tier steamer
stockpot | Stockpot, 8 L | -

### oven
fan-oven | Fan oven | convection oven
grill | Grill | broiler
hob | Hob | stove, cooktop
oven | Oven | -
pizza-oven | Pizza oven | Ooni, Roccbox
pizza-steel | Pizza steel | -
pizza-stone | Pizza stone | baking stone

### mixer
dough-hook | Dough hook attachment | -
hand-mixer | Hand mixer | hand-held electric whisk
paddle-attachment | Paddle attachment | K-beater
stand-mixer | Stand mixer | KitchenAid, Kenwood Chef
whisk-balloon | Balloon whisk | -
whisk-flat | Flat whisk | roux whisk

### processor
blender-jug | Jug blender | stand blender
food-processor | Food processor | Magimix, Cuisinart
high-powered-blender | High-powered blender | Vitamix, NutriBullet
mini-chopper | Mini chopper | small food processor
pestle-and-mortar | Pestle and mortar | mortar and pestle
spice-grinder | Spice grinder | electric coffee grinder
stick-blender | Stick blender | immersion blender, hand blender

### measuring
cooks-tape | Cook's tape | masking tape
icing-smoother | Icing smoother | cake scraper
measuring-cups | Measuring cups | -
measuring-jug | Measuring jug, 1 L | -
measuring-spoons | Measuring spoons | -
piping-bag | Piping bag | pastry bag
piping-tips | Piping tips | piping nozzles
ruler | Ruler | -
spirit-level | Spirit level | -
turntable | Cake turntable | revolving cake stand

### bowl
metal-bowl | Heatproof metal bowl | stainless steel bowl
mixing-bowl-large | Mixing bowl, large | Mason Cash bowl
mixing-bowl-medium | Mixing bowl, medium | -
mixing-bowl-set | Stacking bowl set | nesting bowls
mixing-bowl-small | Mixing bowl, small | prep bowl
salad-bowl | Salad bowl | -

### tray
baking-mat | Silicone baking mat | Silpat
baking-tray | Baking tray | baking sheet, rimmed sheet pan
cooling-rack | Cooling rack | wire rack
grill-tray | Grill tray | broiler pan
half-sheet-tray | Half-sheet tray | -
oven-rack | Wire oven rack | -
pizza-peel | Pizza peel | -
roasting-rack | Roasting rack | V-rack
serving-platter | Serving platter | -
trivet | Trivet | pot stand

### tin
bundt-tin | Bundt tin | bundt pan
kugelhopf-tin | Kugelhopf tin | -
loaf-tin | Loaf tin, 2 lb | bread pan
loaf-tin-small | Loaf tin, 1 lb | -
madeleine-tin | Madeleine tin | madeleine pan
mini-muffin-tin | Mini muffin tin | -
muffin-tin | Muffin tin, 12-hole | cupcake tin
pie-dish | Pie dish | pie plate
rectangular-baking-tin | Rectangular baking tin | traybake tin
round-cake-tin-20 | Round cake tin, 20 cm | -
round-cake-tin-23 | Round cake tin, 23 cm | -
sandwich-tin | Sandwich tin, 20 cm | layer cake pan
savarin-tin | Savarin tin | ring mould
springform-tin | Springform tin, 23 cm | springform pan
square-cake-tin | Square cake tin, 20 cm | brownie pan
tart-tin | Tart tin, 23 cm | flan tin
terrine-tin | Terrine mould | -
yorkshire-pudding-tin | Yorkshire pudding tin | popover pan

### board
bench-scraper | Bench scraper | dough scraper
chopping-board | Chopping board | cutting board
chopping-board-large | Large chopping board | butcher block
pastry-board | Pastry board | marble pastry slab

### utensil
apple-corer | Apple corer | -
biscuit-cutters | Biscuit cutters | cookie cutters
bottle-opener | Bottle opener | -
box-grater | Box grater | -
cherry-pitter | Cherry pitter | cherry stoner, olive pitter
citrus-juicer-mexican | Mexican lemon press | hand citrus press
colander | Colander | -
corkscrew | Corkscrew | wine opener
fine-mesh-sieve | Fine-mesh sieve | chinois
fish-slice | Fish slice | turner, spatula
fish-tweezers | Fish tweezers | fish pin-bone tweezers
garlic-press | Garlic press | garlic crusher
icing-spatula | Icing spatula | palette knife, offset spatula
julienne-peeler | Julienne peeler | -
kitchen-twine | Kitchen twine | butcher's string, cooking string
ladle | Ladle | -
lemon-squeezer | Lemon squeezer | citrus reamer
mandoline | Mandoline | -
masher | Potato masher | -
meat-mallet | Meat mallet | meat tenderiser
microplane | Microplane | fine grater, rasp grater
pasta-machine | Pasta machine | pasta roller
pasta-server | Pasta server | spaghetti spoon
pastry-brush | Pastry brush | basting brush
peeler-y | Y-peeler | vegetable peeler
pepper-mill | Pepper mill | pepper grinder
ravioli-stamp | Ravioli stamp | pastry cutter
ricer | Potato ricer | -
rolling-pin | Rolling pin | -
salt-grinder | Salt grinder | -
sieve | Sieve | fine-mesh sieve, strainer
silicone-spatula | Silicone spatula | rubber spatula, scraper
slotted-spoon | Slotted spoon | -
soup-ladle-small | Small ladle | gravy ladle
spatula | Spatula | turner, flipper
spider-strainer | Spider strainer | Asian skimmer
tin-opener | Tin opener | can opener
tongs | Tongs | -
wooden-spoon | Wooden spoon | -

### thermometer
instant-read-thermometer | Instant-read thermometer | Thermapen, meat thermometer
oven-thermometer | Oven thermometer | -
probe-thermometer | Probe thermometer | leave-in thermometer
sugar-thermometer | Sugar thermometer | jam thermometer, candy thermometer

### scale
digital-scales | Digital scales | kitchen scales
precision-scales | Precision scales | gram scales

### appliance
air-fryer | Air fryer | Ninja, Tefal ActiFry
bread-maker | Bread maker | breadmaker
dehydrator | Dehydrator | -
ice-cream-maker | Ice cream maker | -
instant-pot | Instant Pot | multi-cooker, electric pressure cooker
kettle | Kettle | electric kettle
microwave | Microwave | -
rice-cooker | Rice cooker | -
slow-cooker | Slow cooker | Crock-Pot
sous-vide-circulator | Sous-vide circulator | immersion circulator, Anova
toaster | Toaster | -

### electrical
deep-fryer | Deep fryer | -
griddle-electric | Electric griddle | -
induction-hob | Induction hob | induction cooktop
sandwich-toaster | Sandwich toaster | toastie maker, panini press
stand-blender | Smoothie blender | NutriBullet
waffle-iron | Waffle iron | waffle maker

### other
apron | Apron | -
baking-beans | Baking beans | pie weights
baking-paper | Baking paper | parchment paper, greaseproof paper
banneton | Banneton | proving basket, brotform
cling-film | Cling film | plastic wrap, Saran wrap
foil | Aluminium foil | tinfoil
jam-jars | Jam jars | preserving jars
kilner-jar | Kilner jar | Mason jar, ball jar
muslin-cloth | Muslin cloth | cheesecloth
oven-gloves | Oven gloves | oven mitts
sink | Sink | -
spray-bottle | Spray bottle | -
tea-towel | Tea towel | dish towel
<!-- END TOOL_LOOKUP -->

---

# Vocabularies

Single-valued enums. The exhaustive lists, also defined in
`apps/web/src/app/admin/tutorials/ingredient-constants.ts`.

## CUISINES

british, italian, italianAmerican, french, american, mediterranean,
greek, spanish, middleEastern, northAfrican, caribbean, easternEuropean,
jewish, angloIndian.

## MEAL_TYPES

breakfast, brunch, lunch, dinner, snack, starter, dessert, drink, side.

## MOOD_FLAGS

weeknight, slowSunday, mealPrep, brunchy, comfortFood, cosy, hearty,
summery, lightAndFresh, healthy, party, dateNight, picnic, bbq,
specialOccasion, kidFriendly, showstopper.

## DIETARY_FLAGS

Set explicitly only when the author can confirm beyond what ingredients
imply (halal, kosher, plus any flag the author can verify outright). The
platform AND-derives vegetarian, vegan, glutenFree, dairyFree, milkFree,
eggFree, nutFree, soyFree, alcoholFree from the ingredient list at index
time.

Full set: vegetarian, vegan, pescatarian, halal, kosher, glutenFree,
dairyFree, milkFree, eggFree, nutFree, soyFree, alcoholFree, lowFodmap,
lowCarb, sugarFree, keto, paleo, whole30.

---

# Upload mechanics

The drafting session writes the JSON to
`packages/db/scripts/drafts/<slug>.json` (or anywhere convenient) and
runs:

```bash
pnpm --filter "@homemade/db" run tutorial:upload <path-to.json>
```

The upload script:

- Validates the JSON against `TutorialUploadInput`.
- Runs `voice-check` on the body + metadata. Errors block the upload;
  warnings are reported but don't block. `--skip-voice-check` exists as
  an admin escape hatch.
- Resolves `categorySlug` → Category row. Fails if missing.
- Resolves `subCategorySlug` → SubCategory row within that Category.
  Fails if a slug is given but missing.
- Creates any glossary terms referenced by the body that don't yet
  exist, scoped to the same category.
- Resolves every `ingredientsList` row's `ingredientSlug` against the
  master Ingredient table. Fails loudly if a slug isn't there.
- Resolves every `recipeTools[].slug` against the master Tool table.
  Fails loudly on missing.
- Pushes the hero image to Cloudflare R2 (if `hero.localPath` is set)
  and creates a Media row in READY state. Image generation is
  deferred — drafts ship without heroes for now.
- Inserts the Tutorial as DRAFT with `type` from the input (default
  RECIPE). Sets every recipe metadata field on the row. Computes
  `totalMinutes` from prep + cook + resting + chilling if not set.
- Rebuilds `RecipeIngredient` join rows from the body's
  `ingredientsList` blocks (delete-then-insert in a transaction).
- Rebuilds `RecipeTool` join rows from `recipeTools` the same way.
- Snapshots a `TutorialVersion` for the admin lifecycle.
- Is idempotent on re-run: a Tutorial with the same `slug` is updated
  in place, with a fresh version snapshot and rebuilt join rows.

Storage notes:

- R2 bucket: `homemade-media`, region auto (Cloudflare picks).
- Public delivery URL: `https://media.homemade.education/<key>` — the
  bucket has a custom domain attached on the existing Cloudflare zone.
- Resized URLs go through Image Transformations on the zone root, e.g.
  `https://homemade.education/cdn-cgi/image/width=1600,format=auto/https://media.homemade.education/<key>`.
  The four variant builders live in `apps/web/src/lib/media.ts` (`mediaUrl`).
- Credentials: the script will use `R2_ACCESS_KEY_ID` +
  `R2_SECRET_ACCESS_KEY` (R2 API tokens, created in the Cloudflare
  dashboard) when present, falling back to the regular
  `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` against the
  Cloudflare REST API. The REST fallback is capped at 300 MB per
  object, which is more than enough for hero images.

Run:

```bash
pnpm --filter "@homemade/db" run tutorial:upload \
  packages/db/scripts/anchor-tutorials/toad-in-the-hole.json
```

---

# How to iterate this prompt

When a draft fails voice-check or feels wrong, tighten the prompt **here**,
not in the drafting session. A single tightening lands once and improves
every future draft.

Pattern:

1. Identify the failure mode. Quote two or three sentences from the
   failing draft. Note the line in `voice-check` that fired, or the
   pattern the deterministic check missed.
2. Find or add the corresponding rule above. Make it short and
   prescriptive — banned phrase, banned opener, specific structural
   instruction.
3. Re-run the prompt against a known-good draft (toad in the hole is
   the current anchor). Eyeball before / after. If the new rule
   regressed a previously-clean draft, soften it.
4. Bump the **Prompt version** at the top of this file. Note what
   changed in the commit message.
5. Regenerate the lookup blocks if you added or renamed ingredients /
   tools: `pnpm --filter "@homemade/db" run lookup:generate`.

The voice-editor prompt (`docs/voice-editor-prompt.md`) iterates the
same way. Keep the two in sync — anything banned here is banned there
too.
