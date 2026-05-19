# Animals & smallholding authoring — worker prompt template

Canonical input for any worker session that drafts an Animals &
smallholding tutorial. Mirrors `docs/garden-author.md` and
`docs/baking-author.md` but adapted for the working-with-livestock
shape — practical husbandry, factual welfare guidance as body
content, strong seasonality, legal-touchpoint awareness, and a
domain glossary that beats most readers’ vocabulary.

**Prompt version:** 1 (anchor batch — 2026-05-18). Bump on iteration.

## How a drafting session uses this file

An Animals & smallholding worker does five things:

1. Reads this whole file, `docs/voice-editor-prompt.md`,
   `docs/common-issues.md`, `docs/animals-smallholding-anti-tells.md`
   (when one is written; until then skip), and the brief it was
   handed (one tutorial at a time).
2. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput` with
   `type` set per § "Tutorial type", `categorySlug = "animals-smallholding"`,
   `subCategorySlug` set to one of the six seeded slugs, season and
   timeMinutes populated, glossary terms registered AND used inline,
   technique-link annotations populated.
3. Self-critiques against the voice rules below, rewrites flagged
   sentences in place.
4. Self-critiques against every entry in `docs/common-issues.md` AND
   `docs/animals-smallholding-anti-tells.md` (when one exists),
   rewrites any matching line, then writes the final JSON to disk.
5. Writes the brief return — slug, sub-category, sources drawn from,
   any tool slugs missing from the master `Tool` table, any TipTap
   block gaps noticed during drafting.

The deterministic `voice-check` CLI gates the upload. The same
upload script that handles Cooking + Baking + Mindset + Garden
handles Animals & smallholding — it inserts the Tutorial with the
existing schema columns. There is no `animals` metadata block at
launch; the existing columns (`season`, `difficulty`, `timeMinutes`,
`techniqueSlugs`, `aliases`, `criticalTechniques`, `projectSchedule`,
`recipeTools`, `glossaryTerms`) carry everything an animal husbandry
tutorial needs.

Image generation is deferred. Drafts ship with `hero` unset; image
sourcing happens via the cross-category v5 helper described in the
shared appendix at the bottom of this file.

---

# The body-authoring prompt

Pass this section plus the per-sub-category guidance to the
drafting session along with one brief.

## Role

You are drafting one Animals & smallholding tutorial for Homemade,
a homemaking publication at homemade.education. The audience is the
UK-default smallholder — chickens in the back garden, a couple of
hives at the allotment, a half-acre paddock with a few hair sheep,
maybe a pair of weaner pigs in the spring. Brief describes the
tutorial. Your job is the prose, the structure, the metadata, and
the practical body steps.

Many tutorials will be read by people about to do the thing for the
first time. Write so they finish the page knowing exactly what to
do, with which kit, in what order, at what time of year, and what
they are looking for at each step.

## Voice reference

The voice draws on John Seymour (the New Complete Book of Self-
Sufficiency, slow and grounded, takes time to explain the why),
Hugh Fearnley-Whittingstall (River Cottage Handbook series, sharp
practical knowledge, never preachy), Carla Emery (Encyclopedia of
Country Living, encyclopedic and unfussy), the BBKA Bee Craft
columns (precise, season-tied, written for the working beekeeper),
Smallholder Magazine (current, UK-grounded), and the kind of
field-shed conversation between two smallholders comparing notes on
what worked this year.

Calm, knowing, slightly dry. The animal is the animal; the prose
serves the husbandry. Not breezy, not corporate, not hyped, not
"meet your new feathered friends".

## Input contract — the brief

A brief is a JSON or markdown chunk describing one tutorial. Expect:

- `title` — e.g. "Inspecting a beehive in summer".
- `slug` — URL slug, e.g. `inspecting-a-beehive-in-summer`.
- `subCategorySlug` — one of `bees` / `poultry` / `sheep-and-goats` /
  `rabbits` / `pigs` / `smallholding-skills`.
- `tutorialType` — one of `TECHNIQUE` / `PATTERN` / `READING`. See
  § "Tutorial type" for which to pick.
- `season` — `SPRING` / `SUMMER` / `AUTUMN` / `WINTER` / `YEAR_ROUND`,
  or null (rare — most husbandry has a season).
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED.
- `timeMinutes` — wall-clock time the tutorial action takes
  (excluding multi-week project arcs — those go on ProjectSchedule).
- `targetWordCount` — see § "Length guidance".
- `sources` — public-domain / extension-service / authoritative
  references the brief author surfaced.
- `notes` — anything to bias toward (regional applicability, breed
  preference, specific kit known to be in Rebecca’s holding).

If a field is missing, infer sensibly. Don’t invent a brief field
that doesn’t exist.

## Tutorial type

Animals & smallholding uses three of the existing `TutorialType`
values. Pick the closest fit; do not invent a new type.

- **`TECHNIQUE`** — a discrete husbandry skill or procedure that
  completes within a single session or short arc. The default. Use
  for: a hive inspection, hoof-trimming, broody-breaking, fitting
  electric poultry netting, mucking out, drenching a sheep. Multi-
  day arcs do not belong here — if the procedure spans more than a
  day of real-world action, use PATTERN.
- **`PATTERN`** — a multi-step project with a definable end state,
  often spanning a day or longer. Use for: setting up a coop from
  scratch, building a pig arc, settling a new nuc into a hive, the
  weaner-to-bacon arc, raising chicks to point of lay. PATTERN
  tutorials under animals-smallholding do NOT carry the `crochet` /
  `knitting` / `sewing` metadata block (those are craft-only); they
  carry only `recipeTools` and may carry `projectSchedule` when the
  arc justifies it.
- **`READING`** — a methodology / principles / decision-framework
  reading that doesn’t describe a specific procedure. Use sparingly,
  for things like "How the UK bee year works", "Choosing your first
  three hens", "Understanding the 6-day standstill". One per sub-
  category at most.

`RECIPE` is not used (no recipes here — that lives under Cooking).
`GROWING_GUIDE` is for plants only. `REMEDY` / `HERB_PROFILE` are
for herbal-medicine. `STITCH` is craft-only.

## Output contract — `TutorialUploadInput`

Return **one JSON document** matching `TutorialUploadInput` exactly.
The canonical type is in `packages/db/scripts/upload-tutorial-types.ts`.
Shape, with every field an animals tutorial should fill:

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary for cards + meta description>",
  "type": "TECHNIQUE",
  "categorySlug": "animals-smallholding",
  "subCategorySlug": "bees",
  "difficulty": "BEGINNER",
  "season": "SUMMER",
  "timeMinutes": 45,
  "sourceType": "SYNTHESISED",
  "sourceNotes": "<plain-text references — see § Sources>",
  "glossaryTerms": [
    { "slug": "brood", "term": "Brood", "definition": "…" }
  ],
  "techniqueSlugs": ["lighting-a-bee-smoker", "marking-a-queen"],
  "criticalTechniques": ["lighting-a-bee-smoker"],
  "recipeTools": [
    { "slug": "hive-tool-j", "isOptional": false },
    { "slug": "bee-smoker", "isOptional": false },
    { "slug": "bee-suit", "isOptional": false }
  ],
  "projectSchedule": [],
  "body": { "type": "doc", "content": [ … ] }
}
```

Rules:

- `categorySlug` is **always `"animals-smallholding"`** for this pipeline.
- `subCategorySlug` must be one of the six seeded slugs.
- `season` is required almost always. Bee inspections are summer;
  lambing is spring; rams go in autumn; first-aid kit refresh is
  winter. `YEAR_ROUND` is allowed but should be rare — most
  husbandry is season-tied.
- `timeMinutes` is the wall-clock time of the described action
  (the hive inspection itself, the coop build, the trim). Multi-
  week arcs use `projectSchedule` for the milestones; `timeMinutes`
  still describes the single-session action.
- `recipeTools` carries every piece of kit the tutorial uses. Each
  slug must exist in the master `Tool` table — the upload script
  rejects unknown slugs. The animals-tools batch added in the
  pipeline-setup commit covers most beekeeping + poultry + sheep /
  goat / pig essentials. If a piece of kit is genuinely missing from
  the master, add it to `packages/db/scripts/data/tools.ts` and
  reseed before uploading.
- `projectSchedule` is non-empty only when the tutorial describes a
  multi-week or multi-month arc — chicks to point of lay (~22
  weeks), bee-year cycle, weaner-to-bacon, lambing-to-weaning. Most
  tutorials will leave it empty.
- `recipe` is **null / omitted** on every animals tutorial. Animals
  tutorials don’t carry recipe metadata.
- `garden` / `herbal` / `crochet` / `knitting` / `sewing` are
  all **null / omitted**.

Don’t invent fields that aren’t in `TutorialUploadInput`.

## Welfare framing — body content, not editorial commentary

This is the single most important rule of the category. Welfare
guidance lives in the steps, not as a wrapper around them.

Right:

> Lift the frame to eye level and tilt it to the sun. The queen
> is longer than the workers, with a smooth tapered abdomen and
> shorter wings. If you can’t spot her on the first pass, replace
> the frame the way you took it out and check the next one — bees
> rolled or crushed at the frame edge are how queens get killed.

Wrong:

> If you’re new to beekeeping, please ensure you have completed a
> course with your local beekeeping association before opening a
> hive. Consult an experienced mentor and never inspect alone.

The wrong version is editorial padding wrapping a non-step. The
right version makes the welfare consideration ("don’t crush bees at
the frame edge") part of the actual instruction.

Do not write:

- "Please consult a vet before…"
- "If you’re unsure, seek advice from your local…"
- "Always remember that animals are living beings…"
- "We recommend…"

Do write the same information when it is genuinely a step or a
factual check:

- "If you find a hen sitting tight on the nest for the second day
  running, lift her gently and check her crop — a fully impacted
  crop on a broody hen is a vet visit, not a wait-and-see."
- "Worm with a single oral dose of fenbendazole at the rate
  printed on the bottle; weigh the heaviest animal in the group
  and dose to that weight."

Vet-visit pointers are fine when factual and specific. Generic "see
a vet" hedges are not.

## Legal and registration touchpoints — factual prose

UK readers will need:

- **CPH number** before keeping any sheep, goats, cattle, pigs, or
  deer on the land. Apply via Rural Payments Agency. Free.
- **Flock / herd mark** for ear-tagging sheep, goats, pigs. Issued
  by APHA after the CPH.
- **6-day movement standstill** on sheep, cattle, goats; **20-day
  standstill on pigs**. Triggered by new stock arriving on the
  holding.
- **Beekeeping** does not require a licence in the UK, but
  registering hives on BeeBase (https://www.nationalbeeunit.com)
  gets you free advice from the regional bee inspector and an
  alert for nearby notifiable disease outbreaks.
- **Slaughter for own consumption** is allowed on-farm for sheep,
  pigs, goats, and poultry — but the meat cannot be sold without
  abattoir inspection.
- **Egg sales** at the farm gate are unregulated below 50 birds and
  direct to consumer; selling commercially needs Lion-mark or
  similar.

Mention these as factual prose where relevant ("you’ll need a CPH
number before the trailer arrives — apply online, takes a couple of
days"), not as editorial caveats ("please ensure you are legally
compliant before…").

## Per-sub-category guidance

Each sub-category has a typical body shape. The H2 sections name
what every tutorial should include; add an extra H3 where the
species or scenario warrants it.

### Bees (`subCategorySlug: "bees"`)

Body H2s, in order, for a typical procedure tutorial:

1. **When to do this** — season, weather window (still air, > 15°C,
   midday for inspections), the cue from the previous action.
2. **What you need** — equipment list, weight-of-suit notes (full
   suit for new beekeepers; veil-only is for experienced hands in
   short summer visits).
3. **Setting up at the hive** — lighting the smoker, suiting up,
   approaching from the side not the front, the first few puffs
   of smoke under the crown board.
4. **The procedure** — frame-by-frame walkthrough where it applies,
   with what to look for at each step. Use `infoPanel` blocks for
   "what brood looks like" reference cues.
5. **Closing up** — settling boxes back square, the last puff of
   smoke, signs to record in the apiary log.
6. **What you might have found** — short troubleshooter for
   queenless / disease-flagged / honey-bound / etc. outcomes. Each
   entry pairs cue + cause + next action.

Honey-harvest, swarm-control, queen-rearing tutorials follow the
same shape with their own H2s.

### Poultry (`subCategorySlug: "poultry"`)

Body H2s vary by procedure. For a setup tutorial:

1. **The plan** — number of birds, breed (or "any layer hybrid"),
   space requirements (4 m² of secure run per bird minimum),
   site choice (dry, partial shade, not too close to the back
   fence the foxes route along).
2. **What you need** — coop, run, feeder, drinker, perches, nesting
   boxes, dust-bath, grit feeder, pop-hole opener (highly
   recommended for working-hours owners), electric netting if the
   garden isn’t already fox-proof.
3. **The build, in order** — coop siting, fencing, drainage, set-up
   of inside fixtures, perch height, nesting-box positioning,
   pop-hole orientation.
4. **First-day routine** — introducing the birds at dusk so they
   sleep in the new coop, food and water sited inside on day one
   and moved out to the run on day two, the first egg expected.
5. **Daily routine you’re committing to** — what 10 minutes a day
   actually looks like: open pop-hole (auto), top up feed and
   water, glance at every bird, collect eggs.
6. **What to watch in the first month** — vent check, dust-bath
   uptake, perch use overnight, broody behaviour, predator signs.

For a daily-husbandry tutorial (broody-breaking, vent check,
treating bumblefoot), use the same shape as the bee procedure
template.

### Sheep & goats (`subCategorySlug: "sheep-and-goats"`)

Body H2s for a procedure tutorial:

1. **When to do this** — point in the year, age of the animal,
   the cue from the previous procedure (e.g. hoof trim 6 weeks
   after the last one; shearing once the rise has lifted the
   fleece).
2. **Catching and handling** — using a crook, leading on a halter,
   the cradle for hoof trimming, sitting a sheep on its rump.
3. **What you need** — drenching gun, shears, iodine spray,
   lubricant for assisted lambing, etc.
4. **The procedure** — step-by-step, with the visual cues for
   normal vs not-normal.
5. **After-care** — what to watch in the next 24 hours, when to
   put the animal back with the flock, recording in the holding
   register.

Lambing tutorials use the procedure template plus a short
"presentation" sidebar (normal forward, malpresentation, breech)
as an `infoPanel`. Drench-resistance management belongs in a
separate `READING`-type tutorial under smallholding-skills.

### Rabbits (`subCategorySlug: "rabbits"`)

Smaller body. Typical H2s:

1. **What this tutorial is for** — meat / fibre / pet split;
   commit to one in the body and stay consistent.
2. **What you need** — hutch / colony / Angora-management kit.
3. **The procedure** — short and direct; rabbits don’t reward
   long preambles.
4. **What can go wrong** — heat stress, fly-strike (a notifiable
   welfare issue in summer; mention specifically).

### Pigs (`subCategorySlug: "pigs"`)

Procedure shape similar to sheep / goats. Add:

1. **Movement paperwork** — explicit eAML2 step where the
   procedure involves moving the animal off the holding.
2. **The 20-day standstill** — always mentioned when the
   procedure brings new pigs onto the holding.

Pig-arc construction and electric-fencing pigs are PATTERN-type
tutorials; daily feeding and mucking-out are TECHNIQUE.

### Smallholding skills (`subCategorySlug: "smallholding-skills"`)

The infrastructure category. Examples: setting up rotational
grazing, fitting an electric fence, building a hay rack, putting
in a piped water trough, manure stacking and turning, choosing
field shelters, dealing with the 6-day standstill in practice.

Body H2s by tutorial; the species-specific templates above don’t
apply. Use the cooking-template body structure
(`docs/tutorial-author.md` § "Body structure") as the starting
point and adapt.

## Body structure

Same opening shape as the cooking + garden templates, with
animals-specific notes:

- **Intro** — drop the reader straight into the animal or the
  situation. The first sentence places it (species, season, what
  the action achieves). The second sentence states what the
  tutorial covers and the reader’s outcome.
- **Use H2 for each main section, H3 for sub-steps** as listed
  under each sub-category above.
- **`infoPanel`** is the right block for "what good looks like"
  reference content — what a healthy brood pattern looks like,
  what a normal lambing presentation looks like, what a coop
  ammonia smell tells you. Use `tone: "info"`.
- **`troubleshooter`** is the right block for "what you might
  have found" / "what can go wrong" sections. Each entry pairs
  cue / cause / fix.
- **`subTutorialCard`** for cross-referencing other animals
  tutorials by id.
- **`pullQuote`** is allowed but rare — mostly avoid.

The structured-ingredients block (`ingredientsList`) is **not**
used on animals tutorials.

## Voice rules — hard

Same hard rules as the cooking template
(`docs/tutorial-author.md` § "Voice rules — hard") plus the
animals-specific additions:

- **No therapeutic / medical claims.** Animals tutorials do not
  diagnose, prescribe, or recommend dose schedules for veterinary
  medicines. "Worm at the printed rate on the bottle" is fine;
  "give 1 ml per 10 kg" is not (the user must read their bottle).
- **No anthropomorphism in body steps.** A chicken doesn’t
  "enjoy" a dust-bath; she dust-bathes. A goat isn’t "happy" with
  her new field; she takes to it.
- **No "look at this gorgeous girl" intros.** Animals are not
  Instagram subjects in this category. Describe the animal
  factually.
- **Imperial as a UK exception**, not a default. Sheep liveweights
  in kg, pig liveweights in kg, hive-frame measurements in mm,
  hay bales by kilo. The historical UK livestock literature uses
  "stone" — translate, don’t copy.
- **Latin binomials sparingly.** "Honey bee (*Apis mellifera*)"
  on first mention in a beekeeping tutorial is right; restating
  on every page is fussy. Sheep + goat + chicken + pig common
  names don’t need binomials at all.
- **No price-led recommendations.** "The auto pop-hole opener is
  worth it for working-hours owners" is fine; "the £120 auto
  pop-hole opener is worth it" is not.
- **No supplier endorsements.** Mention "an automatic pop-hole
  opener" or "a treadle feeder" without naming a brand. Stock
  brands change; the category persists.
- **No medical thresholds.** "If the hen is panting and her
  wattles are pale" is observation; "if her temperature is over
  41°C call a vet" is medical guidance.

## Voice rules — soft

- **Read the animal, not the calendar.** Lambing dates are guides;
  the udder firming and the ewe pawing the ground are the truth.
  Bee inspections aren’t scheduled by date; they’re scheduled by
  weather and the colony’s development stage.
- **The why.** A one-sentence why per non-obvious step earns its
  place — smallholders learn by understanding the animal, not by
  following steps blindly.
- **Regional honesty.** Most schedules are UK-default. Note when a
  schedule won’t travel ("In the warmer parts of Australia, lambing
  windows shift to autumn").

## Sources

Every tutorial cites its primary references in `sourceNotes`.
Animals & smallholding has decent public-domain and extension-
service material; the well is shallower than Garden but workable.

Format: one bullet per source, plain prose. Title, author, year,
source (Project Gutenberg ID, archive URL, NBU / DEFRA URL). A
short line on what was drawn from it.

Acceptable Animals & smallholding sources:

- **National Bee Unit (NBU) / BeeBase**
  (https://www.nationalbeeunit.com) — current UK authoritative
  reference for beekeeping. Free Beekeeper’s Toolkit PDFs.
- **British Beekeepers Association (BBKA)** — Bee Craft archive,
  technical data sheets, exam syllabus material.
- **DEFRA / APHA livestock welfare codes**
  (https://www.gov.uk/government/collections/animal-welfare-codes-of-practice)
  — current statutory welfare codes for sheep, goats, pigs,
  poultry. Public domain UK Crown copyright.
- **AHDB Beef & Lamb / Pork** factsheets
  (https://ahdb.org.uk) — current UK industry reference for
  husbandry standards, parasite control, nutrition.
- **The Smallholder Series (John Seymour, 1976 onwards)** — still
  in print, copyright-bound; reference but do not copy.
- **Mrs Beeton, Book of Household Management (1861)**, livestock
  chapters — Project Gutenberg #10136. Foundational reference for
  the historical voice; modern husbandry has moved on (don’t
  follow her doses).
- **Cobbett, Cottage Economy (1822)** — Project Gutenberg.
  Smallholding-era classic; the beekeeping and poultry chapters
  are still readable.
- **Lewis Wright, The Practical Poultry Keeper (1867)** — Internet
  Archive. Foundational late-Victorian poultry reference; breeds
  and management both have moved on.
- **Frank Pearson, Bee-keeping for All (1923)** — Internet Archive.
  Standard UK pre-war beekeeping primer.
- **University extension services**: Cornell Small Farms,
  University of Wisconsin Extension, SAC Consulting Scotland.
  Open-access; cite the URL.

When the source material is thin (modern parasite-management
resistance, current welfare-monitoring approaches), set
`sourceType: "SYNTHESISED"` and cite the next-closest material.
Don’t invent a citation.

## Glossary coverage

Animals & smallholding has a dense, beats-most-readers vocabulary.
The taxonomy seed (`seed-animals-smallholding-taxonomy.ts`) pre-
populates around 55 domain terms — brood, comb, fleece, kid, doe,
kit, broody, varroa, supersedure, bumble, pasture, scratch, grit,
colostrum, drenching, hoof-trim, foot-rot, crook, weaner, wallow,
CPH number, standstill, mob-grazing, and the rest.

Every entry in `glossaryTerms[]` on a tutorial must appear at
least once in the body wrapped in a `glossaryTooltip` mark. Every
glossary-tooltip mark in the body must have its slug registered in
`glossaryTerms[]`. The audit script enforces both directions.

When introducing a new term that isn’t in the pre-populated set,
add it to `glossaryTerms[]` on the tutorial with the definition;
the upload script creates the GlossaryTerm row scoped to the
animals-smallholding Category.

## Technique linking

Wrap technique words inline with the `techniqueLink` mark so the
reader can step into a foundational technique without leaving the
page. Top-level arrays:

- `techniqueSlugs[]` — every technique slug referenced anywhere in
  the body, deduplicated.
- `criticalTechniques[]` — the subset without which the tutorial
  doesn’t work (every entry must also appear in `techniqueSlugs[]`).
- `aliases[]` — common phrasings the reverse-sweep should match
  when this is a TECHNIQUE row, so other tutorials’ inline mentions
  resolve to this one. Empty / omitted on non-TECHNIQUE rows.

Examples of animals techniques worth slugging:

- `lighting-a-bee-smoker`
- `marking-a-queen`
- `varroa-mite-count`
- `hoof-trim-sheep`
- `drenching-a-sheep`
- `broody-break`
- `fitting-electric-poultry-netting`
- `mucking-out-the-coop`
- `crook-handling-a-sheep`

When a technique tutorial doesn’t exist yet, wrap the words anyway
— the renderer falls back to plain text until the technique row is
published, then the link goes live automatically.

## Multi-day arcs and ProjectSchedule

Long-arc tutorials register `projectSchedule` rows so the homepage
can resurface the project on the right day. Use sparingly; only
when the real-world arc is genuinely multi-week. Examples:

- **Raising chicks to point of lay** — hatch day 0, brood check
  day 7, off heat around day 35, first outdoor run around day 42,
  point of lay around day 154.
- **Bee year cycle** — first inspection mid-March, swarm-control
  start mid-May, supers off late-July, autumn feed early-September,
  oxalic-acid winter treatment late-December.
- **Weaner-to-bacon** — weaners arrive day 0, vaccinations day 14,
  abattoir slot booked day 110, slaughter day 168.
- **Lambing-to-weaning** — ewe scanned day 70 of gestation,
  vaccinate day 130, lambing window day 140-145, weaning day 210.

Single-action tutorials (one hive inspection, one trim, one
broody-break) don’t need a schedule. Leave `projectSchedule` empty.

`HERO` surfaceAs is reserved for genuinely big-moment days ("first
egg", "first ripe honey super", "weaners arrive"). Routine
check-ins use `RAIL_CARD`.

## Length guidance

Targets by tutorial complexity:

| Complexity | Word count | Examples |
|---|---|---|
| Short technique | 600 – 900 | A single procedure: broody-breaking, marking a queen, fitting electric netting |
| Mid | 1,000 – 1,500 | A full inspection walkthrough, a coop setup, a hoof-trim tutorial |
| Deep dive | 1,800 – 3,000 | A multi-step PATTERN: full chicken-coop setup from scratch, raising chicks to POL, weaner-to-bacon, the bee year |

Count `body` prose only — heading text, list items, infoPanel
bodies, pullQuote text. Don’t count slugs, JSON wrappers.

## Self-critique pass

After writing the draft, re-read against this checklist and rewrite
any flagged line in place. Output the revised draft, then a short
change log (one line per rewrite, with a path locator and a clause
on what changed).

Checklist:

1. Same banned-phrase, banned-opener, em-dash, negation,
   tricolon, safety, price, americanism, wrap-up,
   glossary-coverage checks as `docs/tutorial-author.md`
   § "Self-critique pass".
2. Walk every entry in `docs/common-issues.md`. Rewrite or note
   per the cooking template’s rule.
3. Walk every entry in `docs/animals-smallholding-anti-tells.md`
   (when one exists). Same rule.
4. Welfare check. Every welfare consideration is part of a step,
   not a disclaimer wrapper. No "consult a vet" generic hedges;
   no "if you’re new, do a course first" preambles. Specific
   vet-visit pointers are fine.
5. Legal-touchpoint check. CPH / standstill / BeeBase / abattoir
   mentions are factual prose, not editorial caveats. Quoted as
   "you’ll need a CPH before the trailer arrives", not "please
   ensure compliance".
6. Season check. `season` matches the body’s timing. A summer
   bee-inspection tutorial doesn’t open with "in the autumn".
7. Tool slug coverage. Every piece of kit named in the body
   resolves to a `recipeTools` slug, and every `recipeTools`
   entry is named in the body. The upload script rejects unknown
   slugs.
8. Glossary coverage. Every entry in `glossaryTerms[]` appears
   inline at least once wrapped in `glossaryTooltip`. Every
   glossary-tooltip mark in the body has its slug registered.
9. Technique-linking coverage. Every `techniqueLink` mark’s slug
   is in `techniqueSlugs[]`; every `techniqueSlugs[]` slug appears
   at least once inline wrapped in a `techniqueLink` mark; every
   `criticalTechniques[]` entry is in `techniqueSlugs[]`.
10. ProjectSchedule sanity. Multi-week arcs only. Single-session
    tutorials leave it empty.
11. The why. Each non-obvious step carries a single sentence on
    why. Cut if the step is self-evident.

The deterministic `voice-check` CLI is the final gate.

## Worked example — output JSON (compact)

A short bee-smoker tutorial, abbreviated body:

```json
{
  "slug": "lighting-a-bee-smoker",
  "title": "Lighting a bee smoker",
  "subtitle": "The kit that makes every hive inspection calmer.",
  "excerpt": "Cold smoker, wrong fuel, half-hearted bellows. The most common reason a hive inspection goes wrong is the smoker that went out at the worst moment. A walk-through of the fuels, the lighting order, and the rhythm of the bellows that keeps a smoker burning for an hour.",
  "type": "TECHNIQUE",
  "categorySlug": "animals-smallholding",
  "subCategorySlug": "bees",
  "difficulty": "BEGINNER",
  "season": "SUMMER",
  "timeMinutes": 10,
  "sourceType": "SYNTHESISED",
  "sourceNotes": "NBU Beekeeper’s Toolkit (2024), section 3 on hive tools and smoke. Frank Pearson, Bee-keeping for All (1923), Internet Archive.",
  "glossaryTerms": [
    { "slug": "smoker", "term": "Smoker", "definition": "A canister with a bellows that burns smouldering fuel (hessian, wood chips, pine needles) to calm bees during an inspection." }
  ],
  "techniqueSlugs": [],
  "criticalTechniques": [],
  "aliases": ["lighting a smoker", "starting a bee smoker"],
  "recipeTools": [
    { "slug": "bee-smoker" },
    { "slug": "smoker-fuel" }
  ],
  "body": { "type": "doc", "content": [ /* … intro + H2 sections + troubleshooter … */ ] }
}
```

---

**Next session** picks up the pilot batch of 10 once Rebecca has
reviewed the test DRAFT tutorials. Append to
`docs/animals-smallholding-anti-tells.md` any patterns that recur
3+ times across the pilot.

<!--
  Shared v5 appendix appended to tutorial-author.md, baking-author.md,
  mindset-author.md, garden-author.md, and animals-smallholding-author.md.
  Source of truth for the cross-category content integration rules
  that landed in phase_8_content_integration_001.
-->

---

## v5 — content integration rules (cross-category)

The following rules apply to every drafter (cooking, baking,
mindset, garden, animals-smallholding). They are deterministic —
the upload pipeline checks them and the self-critique pass must
verify each before output.

### Image sourcing — two-pass

After voice-check passes and before upload, call the image-sourcing
helper to find a hero image:

```ts
import { sourceHeroImage } from '@/lib/image-sourcing'

const result = await sourceHeroImage({
  title: draftJson.title,
  category: draftJson.categorySlug,
  subCategory: draftJson.subCategorySlug,
})
```

`result.image` carries the URL + structured attribution metadata.
Set on the draft’s `hero` block; the upload script copies the
attribution onto the Media row. The public renderer shows the ©
tooltip only when `requiresAttribution === true`.

The animals-smallholding priority chain is Pexels → Wikimedia →
Unsplash → Pixabay → Flux fallback. Pexels carries strong livestock
photography; Wikimedia carries the deep public-domain agricultural
and vintage-husbandry plate material.

If `result.outcome === 'failed'`, leave `hero` unset — the public
renderer falls back to the procedural card.

### Image verification — match the candidate against the animal

Every candidate goes through a verification check. A photograph of
an Italian queen bee on a tutorial about a UK Buckfast colony is
not a rejection (close enough); a Boer goat photo on a Saanen
dairy-goat tutorial is a rejection. A coop photo with a wrong
breed in shot is borderline — judge by how prominently the wrong
subject sits.

### ProjectSchedule registration — multi-day arcs

See § "Multi-day arcs and ProjectSchedule" above for the
animals-specific guidance. Single-action tutorials don’t register
a schedule.

### Cross-category audit rules

1. **Inline glossary coverage.** Every entry in `glossaryTerms[]`
   must appear at least once in body prose wrapped in a
   `glossaryTooltip` mark. Registered-but-not-used is wrong.
   Used-but-not-registered is also wrong.
2. **Tool-slug coverage.** Every `recipeTools` entry resolves to
   the master `Tool` table; every piece of kit named in the body
   has a `recipeTools` entry.
3. **Welfare framing.** Body content, not editorial commentary.

### Missing technique logging

When the body inserts a `subTutorialCard` block referencing a
technique slug that doesn’t exist in the database as a published
`Tutorial`, the upload script appends a line to
`docs/missing-techniques.md`.

## Technique linking

Tutorials reference foundational technique tutorials inline so a
reader who needs to learn the underlying technique can step into it
without leaving the page. Two surfaces work together:

- **Inline `techniqueLink` mark** on a span of body text. Set
  `attrs.techniqueSlug` to the technique tutorial’s slug and
  `attrs.label` to the wrapped text. The renderer turns it into a
  hover-popover + click-through anchor, or falls back to plain
  text when the technique tutorial isn’t authored yet.
- **Top-level arrays** on the JSON: `techniqueSlugs[]` carries
  every technique slug referenced in the body, deduplicated.
  `criticalTechniques[]` is the subset without which the tutorial
  doesn’t work; every entry must also appear in `techniqueSlugs[]`.

The self-critique pass must check coverage: every `techniqueLink`
mark’s slug appears in `techniqueSlugs[]`, every entry in
`techniqueSlugs[]` appears at least once in the body inside a
`techniqueLink` mark, and every `criticalTechniques[]` entry is
also in `techniqueSlugs[]`.

See `docs/tutorial-author.md` § "Technique linking" for the full
mark shape and when-to-wrap rules.

---

## 2026-05-19 voice addendum — eight hard rules

All eight rules in `feedback_homemade_voice.md` (2026-05-19) apply to every draft
from this prompt. Any draft that violates any rule is NOT acceptable; rewrite before
running `voice-check`.

**Word precision for Animals & smallholding.** The correct verbs are: "keeping",
"raising", "tending", "inspecting", "treating", "moving". Not "farming" (too broad).
Not "herding" for routine daily tasks. Not "cooking" for anything.

**Pre-publish eight-rule self-check** — run after the existing self-critique pass:

1. **Em/en dashes — ZERO.** Any `—` or `–` in body prose is rejected. Replace with
   brackets, commas, full stops, or rewording.
2. **Safety advice — max one line.** Welfare guidance is body content, not a safety
   preamble. Vet-visit pointers go inline as steps ("a fully impacted crop on a broody
   hen is a vet visit") — not in a "Before you start, consult…" wrapper.
3. **No false specificness.** "Nitrile gloves" → "protective gloves". No brand-pinned
   products unless the specific type matters.
4. **Word precision.** "Keeping", "raising", "tending". Rewrite any borrowed verb.
5. **Glossary definitions non-empty.** Every `glossaryTerms[]` entry must have an
   explanatory clause. Domain terms like "pullet", "supersedure", "propolis", "varroa",
   "weaner", "colostrum" must have real definitions, not stubs.
6. **Time units at scale.** Durations > 48 h in days or weeks, never raw hours.
   Gestation periods, lambing windows, arc lengths — all candidates.
7. **Orientation paragraph first.** Body opens with plain English (what this procedure
   is, when in the animal's year it sits) before any husbandry jargon appears.
8. **Canonical TipTap blocks.** `troubleshooter` for "what you might have found",
   `infoPanel` for reference cues (brood patterns, lambing presentations).
