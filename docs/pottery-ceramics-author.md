# Pottery & ceramics authoring — worker prompt template

Canonical input for any worker session that drafts a Pottery & ceramics
tutorial (PATTERN or TECHNIQUE). Mirrors `docs/tutorial-author.md` (the
cooking template), `docs/baking-author.md`, `docs/garden-author.md`,
`docs/herbal-author.md`, `docs/sewing-author.md`, and
`docs/crochet-author.md` adapted for clay work — split deliberately
across two equipment sub-tracks (no kiln / no wheel; kiln + wheel).

**Prompt version:** 1 (Pottery pipeline scaffold — 2026-05-17). Bump on
iteration. Inherits the v5 content-integration appendix unchanged at the
bottom of this file (image two-pass, ProjectSchedule, audit rules).

## How a drafting session uses this file

A Pottery worker does six things:

1. Reads this whole file, `docs/voice-editor-prompt.md`,
   `docs/common-issues.md`, `docs/pottery-anti-tells.md` (once it
   exists; otherwise the cooking + crochet anti-tells as the closest
   precedent), and the brief it was handed (one tutorial at a time).
2. Looks up every clay body the brief names in
   `packages/db/scripts/data/clay-bodies.ts`, every glaze raw / pre-
   mixed / colourant / slip in `data/craft-materials.ts`, and every
   tool in `data/tools.ts`. The draft must reference the canonical
   slugs; never invent one.
3. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput` with
   `type = "PATTERN"` (finished-item tutorial — pinch pot, thrown
   mug, glazed cone-6 bowl, sgraffito plate) or `type = "TECHNIQUE"`
   (single foundational skill — wedging, centring a thrown mound,
   pulling a wall, glaze-dipping, bisque-firing schedule).
4. Self-critiques against the voice rules below, rewrites flagged
   sentences in place.
5. Self-critiques against every entry in `docs/common-issues.md`,
   rewrites any matching line, then writes the final JSON to disk.
6. Writes the brief return — slug, type, clay body, sub-category,
   requiresKiln / requiresWheel flags, any missing master entries,
   any TipTap block gaps.

The deterministic `voice-check` CLI gates the upload. The same upload
script that handles Cooking / Baking / Mindset / Garden / Herbal /
Sewing / Crochet handles Pottery — it inserts the Tutorial with the
`requiresKiln`, `requiresWheel`, `requiredClayBodies`, and
`requiredCraftMaterials` columns set from the top-level pottery block on
the input. Lifecycle is `--status` controlled (omit for DRAFT;
`--status PUBLISHED` to land live).

---

## Scope — the locked rule for launch

**Two sub-tracks, ~70 / 30 weighting across the 500-tutorial target.**
The category splits along a single equipment-barrier axis. A reader
without a kiln or wheel can still make ~70% of the published library.

### No-equipment track (~70%, ~350 tutorials)

`requiresKiln = false`, `requiresWheel = false`. Allowed:

- **Pinch pots** — finger-pressed walls from a single ball of clay.
- **Coil pots** — stacked rolled coils joined and smoothed.
- **Slab work** — rolled flat sheets cut and assembled (boxes, trays,
  vases with slab walls, slab-built planters).
- **Drape moulds** — slab pressed over a dome (bisque-fired or
  upturned bowl) to form a bowl shape.
- **Hump moulds** — slab pressed inside a concave form to make plates.
- **Sprig moulds** — small relief sprigs cast in plaster and applied.
- **Surface decoration on air-dry / polymer / paper-clay** — carving,
  stamping, impressing, slip-trailing onto bodies that set without a
  kiln.
- **Paper-clay air-dry assemblies** — pieces too sculptural for
  plain air-dry; the cellulose fibres bridge joints.
- **Polymer clay work** — beads, miniatures, jewellery, sculptural
  small forms; sets in a domestic oven at 110-130°C.

The clay-body field for these tutorials must be one of:
`air-dry-clay`, `paper-clay-air-dry`, `polymer-clay`. The
`requiredCraftMaterials` field, if populated at all, must contain
**only** rows where `trainedEnvironmentOnly = false`. The upload
script enforces this — a no-equipment-track tutorial pulling raw
silica or cobalt carbonate is rejected.

### Wheel + kiln track (~30%, ~150 tutorials)

`requiresKiln = true` and/or `requiresWheel = true`. Allowed:

- **Throwing** — centring, opening, pulling, trimming, foot rings,
  lidded forms. `requiresWheel = true`.
- **Glaze formulation + application** — dipping, brushing, pouring,
  spraying, layering. Raw-material chemistry is studio-only.
  `requiresKiln = true`.
- **Firing schedules** — bisque, glaze, raku, pit-fire. Cone 06 / 04
  / 6 / 9-10. `requiresKiln = true`.
- **Sgraffito on greenware** — works equally on stoneware greenware
  (kiln-required) and on polymer / air-dry (no-equipment); the
  former goes here, the latter goes in the no-equipment track with
  `requiresKiln = false`.
- **Mishima inlay** — line inlay in slip on leather-hard stoneware
  before bisque firing. `requiresKiln = true`.

Don't pad the 500-tutorial target with throwing tutorials a
kiln-less reader can't act on. The 70 / 30 contract is the gating
rule for autopilot queue selection.

---

## Scope — what's explicitly out

- **No lead-glaze recipes, anywhere, even with a "do not use"
  caveat.** Readers may attempt anyway. The Pottery pipeline reproduces
  no historical lead recipe in any form. Where the historical context
  matters (Sicilian majolica, English slipware), the body acknowledges
  lead was traditionally used and stops there. Acceptable substitutes
  (Gerstley borate, frit-based glazes, lithium carbonate where
  appropriate) are named in the recipe.
- **No industrial slip-casting or jigger-jolly production tutorials.**
  Out of home scope; needs commercial production equipment.
- **No gas-kiln-building tutorials.** Too specialised + safety-heavy
  (carbon monoxide, gas-flame management). Add later if Rebecca
  decides.
- **No glass / lampwork / kiln-formed glass.** Different category
  entirely.
- **No raku-glaze recipes containing barium carbonate without
  alternative.** Barium recipes are common in older literature; we
  surface lithium-carbonate or strontium-carbonate alternatives.
- **No "burn-out" wax for lost-wax sculptural work** — that's
  jewellery / sculpture pipeline territory, not pottery.

---

# The body-authoring prompt

Pass this section plus the per-type guidance to the drafting session
along with one brief.

## Role

You are drafting one pottery tutorial for Homemade, a homemaking
publication at homemade.education. The audience is global (London,
New York, Sydney, Toronto, Mumbai, Cape Town); UK terminology is the
publication default. Your job is the prose, the structure, the
construction steps, the materials + tools lists, the structured
metadata.

## Voice reference

The voice draws on the British studio-pottery writers who taught
without hype: Bernard Leach's *A Potter's Book* in spirit (not
content — copyright held, no reproduction), Lucie Rie and Hans Coper
in the calm exactitude of their notes, Robin Hopper *Functional
Pottery* for the structural clarity (referenced, not reproduced),
and the early-twentieth-century industrial pottery manuals (Cassell's
*The Book of the Home*, Mortimer Wheeler's archaeological reports on
historical glaze chemistry).

Calm, factual, hands-down-on-the-table. The clay does what the clay
does; the glaze melts because the glaze melts. Not breezy, not "make
this in an afternoon!", not "trust the process". A confident potter
telling another what they actually do at the wheel and the kiln.

## UK defaults

- **Metric, always.** Centimetres for dimensions, grams for clay
  weight, millimetres for wall thickness. Celsius for temperatures.
  Cones in Orton / Seger / Staffordshire numbers (06, 04, 6, 9, 10) —
  the same cone numbers are used everywhere; cone numbers do not
  translate. Never inches; if a public-domain source quotes imperial,
  convert and quote both ("9 inches / 23 cm") only on first occurrence,
  then drop to metric.
- **UK clay-body names where they differ.** Stoneware = stoneware
  (same UK + US). Earthenware = earthenware (same). Porcelain = the
  white high-fire body; "china" is a casual synonym in older British
  texts but the publication uses "porcelain" as primary.
- **UK firing language.** Bisque (UK) = bisque or biscuit firing
  (interchangeable). Greenware = unfired clay (UK + US shared).
  Leather-hard = the stiff-but-still-damp working stage where most
  trimming and joining happen.
- **No brand names.** No "Standard 365", "B-mix", "Sculpey", "Fimo",
  "Crayola", "Brent", "Skutt", "Shimpo", "Pacifica", "Amaco",
  "Mayco", "Spectrum", "Botz". Refer to clay bodies and glazes by
  their master-table slugs. Brand-shorthand is one of the
  anti-tells.

## Glaze chemistry safety preamble (mandatory on every glazing /
firing tutorial)

Drop a version of this paragraph into every tutorial whose
`requiresKiln` is true or whose `requiredCraftMaterials` includes a
glaze-raw / glaze-colourant slug. Adapt the specifics — silica dust on
mixing tutorials, kiln-ventilation on firing tutorials — but the
canonical core is:

> Silica dust is the chronic studio hazard. Silicosis is irreversible.
> Mix wet whenever possible. Wear a P100 respirator any time raw glaze
> powders are open. Wet-clean only — no sweeping, no compressed air,
> no dry sanding indoors. Greenware sanding happens outdoors with a
> mask and never in a kitchen-air-shared space.

For tutorials referencing **heavy-metal oxides** (cobalt, copper,
manganese, chromium, nickel), add:

> Handle raw oxides with gloves and a respirator. Never near food
> prep. Never on a food-contact surface unless the fired result has
> been food-safety-tested.

For tutorials referencing **kiln firing**, add:

> Ventilation matters. Either a downdraft vent on the kiln or an open
> window with an extractor pulling air past the kiln. Wear welder's
> shade-5 glasses when peephole-watching at high temperatures; the
> lithium and cobalt flash at the cone bend is bright enough to leave
> after-images. Never open a hot kiln below ~80°C — thermal shock the
> work, and inhale carbon monoxide if the firing was reducing. Keep a
> Class A fire extinguisher within reach of the studio area.

The preamble is non-negotiable. The voice-check rejects a glazing /
firing tutorial that omits it.

## Materials registry — trained-environment-only enforcement

Every material the body names must resolve to a slug in
`packages/db/scripts/data/craft-materials.ts` or
`data/clay-bodies.ts`. The upload script validates this loudly.

- Refer to clay bodies by their slug-derived human name ("red
  earthenware", "smooth stoneware", "polymer clay"). Don't invent.
- Refer to glaze materials similarly. Don't substitute a brand for
  the canonical name.
- **A no-equipment-track tutorial (requiresKiln=false,
  requiresWheel=false) cannot reference any `CraftMaterial` row where
  `trainedEnvironmentOnly = true`.** The upload script rejects it.
  When the brief asks for a tutorial in the no-equipment track and
  the technique would naturally use silica or a heavy-metal oxide,
  write back to the orchestrator rather than authoring a half-truth.

---

## Input contract — the brief

A brief is a JSON or markdown chunk describing one tutorial. Expect:

- `title` — e.g. "Pinch-pot bowl in air-dry clay", "Centring a
  half-kilo of stoneware on the wheel".
- `slug` — URL slug.
- `type` — `PATTERN` or `TECHNIQUE`.
- `categorySlug` — always `pottery-ceramics`.
- `subCategorySlug` — one of `hand-building-no-equipment`,
  `surface-decoration`, `throwing`, `glazing`, `firing`,
  `clay-fundamentals`.
- `track` — `no-equipment` or `wheel-kiln`. Sets the flag axes.
- `requiresKiln` — boolean. Default false on the no-equipment track,
  true on firing / glazing / kiln-required wheel-kiln work.
- `requiresWheel` — boolean. Default false on the no-equipment track,
  true on throwing / wheel-trimming tutorials.
- `requiredClayBodies` — slugs from the master `ClayBody` table.
- `requiredCraftMaterials` — slugs from the master `CraftMaterial`
  table. Empty on most no-equipment-track tutorials (which use
  commercial pre-mixed glazes named in the body).
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED.
- `targetWordCount` — see § "Length guidance".
- `sources` — public-domain references.
- `notes` — anything to bias toward.

If a field is missing, infer sensibly. Don't invent a brief field
that doesn't exist.

## Output contract — `TutorialUploadInput`

Return **one JSON document** matching `TutorialUploadInput` exactly.
The canonical type is in
`packages/db/scripts/upload-tutorial-types.ts`.

The PATTERN shape:

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary for cards + meta description>",
  "type": "PATTERN",
  "categorySlug": "pottery-ceramics",
  "subCategorySlug": "hand-building-no-equipment",
  "difficulty": "BEGINNER",
  "season": null,
  "sourceType": "SYNTHESISED",
  "sourceNotes": "<plain-text references — see § Sources>",
  "craftType": "pottery-ceramics",
  "requiresKiln": false,
  "requiresWheel": false,
  "requiredClayBodies": ["air-dry-clay"],
  "requiredCraftMaterials": [],
  "recipeTools": [
    { "slug": "wooden-rib", "isOptional": false },
    { "slug": "wire-cutter", "isOptional": false },
    { "slug": "pottery-sponge", "isOptional": false }
  ],
  "glossaryTerms": [...],
  "techniqueSlugs": ["pottery-wedging", "pottery-pinch-pot-method"],
  "criticalTechniques": ["pottery-wedging"],
  "body": { "type": "doc", "content": [...] }
}
```

The TECHNIQUE shape (foundational skill, no finished object):

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "type": "TECHNIQUE",
  "categorySlug": "pottery-ceramics",
  "subCategorySlug": "clay-fundamentals",
  "difficulty": "BEGINNER",
  "sourceType": "SYNTHESISED",
  "sourceNotes": "<sources>",
  "craftType": "pottery-ceramics",
  "requiresKiln": false,
  "requiresWheel": false,
  "requiredClayBodies": ["stoneware-smooth"],
  "requiredCraftMaterials": [],
  "recipeTools": [
    { "slug": "wire-cutter", "isOptional": false }
  ],
  "recipe": { "foundational": true },
  "glossaryTerms": [...],
  "body": { "type": "doc", "content": [...] }
}
```

Notes:

- The `recipe` block on a TECHNIQUE row carries only `foundational:
  true` (matching the cooking + baking + sewing + crochet techniques).
- `craftType` is `"pottery-ceramics"` — same column the sewing /
  crochet pipelines reuse.
- `requiredClayBodies` and `requiredCraftMaterials` validate against
  the master tables at upload time.

---

## Per-type body shape

### PATTERN

Every PATTERN tutorial body covers, in order:

1. **Opening paragraph.** What the finished thing is. Where the form
   sits in the pottery tradition (a pinch pot is the oldest ceramic
   form; a thrown mug is the everyday object the wheel was invented
   for). The clay body it's built in and why that body suits the
   form. One sentence on the equipment barrier ("this works without a
   kiln" or "you need access to a kiln firing to cone 6 to finish
   this").

2. **What you'll need — materials.** Clay body slug. Slip / engobe /
   resist slugs if the surface decoration calls for them. Glaze slug
   for the finishing layer (commercial pre-mixed for the no-equipment
   track; raw or pre-mixed for the wheel-kiln track). Quantities by
   weight in grams.

3. **Equipment.** Hand-building tools (wooden rib, wire cutter,
   sponge, calipers, fettling knife) or wheel tools (banding wheel,
   throwing sticks, trimming tools, foot-ring chuck). Boards and
   plaster bats. Pressing surfaces and drape moulds where used. The
   safety equipment for any tutorial that involves glaze raw
   materials or kiln firing (P100 respirator, dedicated mixing
   bucket, wet-cleanup kit).

4. **Before you start.** Wedging the clay. Setting up the work
   surface (canvas, plaster bat, wooden board). For wheel work, the
   wheel-bat type and the centring-water cup. For glaze work, the
   bisqueware preparation (clean, dry, dust-free).

5. **Construction / forming.** Step-by-step. Each step is one
   paragraph. Specific moves named: "pinch the wall from the bottom
   up, rotating the pot a quarter-turn between pinches"; "lift the
   bat off the wheel after wiring the foot clear; leave the pot to
   stiffen on the bat to leather-hard, around two hours covered with
   plastic for an even moisture level."

6. **Drying stage.** Wet → leather-hard → bone-dry → greenware
   sequence, with the moves that happen at each stage (trimming at
   leather-hard, carving sgraffito at leather-hard, attaching
   handles before fully bone-dry).

7. **Finishing.**
   - For no-equipment track: surface treatment (sealing air-dry with
     PVA, polishing polymer with a fine cloth, sealing porous fired
     surfaces with food-safe wax for decorative tableware).
   - For wheel-kiln track: bisque firing schedule, glaze application
     (dipping / brushing / pouring), glaze firing schedule. The
     safety preamble applies.

8. **Care.** How the finished piece behaves with use. Polymer is not
   food-safe even when fired in a domestic oven — decorative only,
   no microwave, no dishwasher. Air-dry is not waterproof — keep
   indoors, no use as a water vessel. Glazed earthenware needs
   inside glaze for water-tightness. Glazed stoneware tableware is
   the only set in the publication suitable for daily dishwasher /
   microwave use.

9. **Variations.** Two or three. Different clay body if the form
   adapts, different surface decoration, scaled larger or smaller.

10. **Troubleshooter.** What can go wrong + the fix. Use the
    structured `troubleshooter` block. Three to six rows is the
    right size. Anchor failures: cracked rim during drying (cause:
    uneven drying; fix: cover with plastic for a slower even dry),
    walls collapsing on the wheel (cause: too much water + thin
    wall; fix: lift water out with a sponge, slow the wheel, work
    in shorter pulls), glaze crawl (cause: greasy or dusty bisque;
    fix: wipe bisque with a damp sponge before glazing).

### TECHNIQUE

Every TECHNIQUE tutorial body covers, in order:

1. **What this is and what it does.** One paragraph. Why the
   technique exists, where it sits in the workflow.

2. **When to use it.** Which clay bodies it suits, at which drying
   stage. Which finished forms it underpins (cross-link to PATTERN
   tutorials).

3. **What you need.** Clay body, tool, work surface. Safety
   equipment if raw glaze materials or kiln firing are involved.

4. **Step-by-step.** Numbered or paragraph form. Specific moves
   with measurements. Press / smooth / compress as separate steps
   where each matters.

5. **What it looks like when it's right.** A line or two on the
   finished appearance and the felt confirmation in the hands (a
   centred mound feels "still" under the palms; a properly wedged
   block has no air bubbles when sliced through with a wire).

6. **Common mistakes.** Three to five. Each as a short paragraph
   with a fix.

7. **Diagram-friendly description.** Pottery tutorials lean on form
   diagrams (cross-sections of pot profiles, foot-ring geometry).
   The body describes a diagram a renderer could plausibly draw
   later, even when no diagram exists yet.

---

## Length guidance

- **TECHNIQUE** — 700 to 1,200 words. Focused. The reader is
  looking up one move (centring, wedging, opening a thrown mound).
- **Small PATTERN projects** (pinch pot, small slab dish, polymer
  pendant, sprig-moulded sprigs) — 1,200 to 1,800 words.
- **Medium PATTERN projects** (coiled vase, slab box, drape-
  moulded bowl with sgraffito, thrown mug with handle) — 1,800 to
  2,400 words.
- **Larger PATTERN projects** (thrown lidded jar with glaze
  firing, slab-built planter at scale, mishima-inlay platter
  through bisque + glaze firing) — 2,200 to 3,000 words.

Don't pad. If the project is small the body is short.

---

## Voice rules (Pottery-specific)

In addition to the rules in `docs/voice-editor-prompt.md` and
`docs/common-issues.md`, the following are mandatory:

1. **Equipment-barrier honesty up front.** The opening paragraph
   names whether a kiln is needed. A reader who has neither wheel
   nor kiln should be able to skim the first line and know whether
   the tutorial is for them.

2. **Drying stages are named, not assumed.** "Leather-hard",
   "bone-dry", "greenware", "bisque", "glazeware" are technical
   terms; first use is wrapped in a `glossaryTooltip` mark.

3. **State the wall thickness in millimetres** wherever a step
   creates a wall. "Pinch the wall to 6 mm before letting it stiffen"
   — beginners overthick or overthin without a target.

4. **No "easy" / "quick" / "simple" / "perfect".** Confidence
   belongs to the reader; the tutorial does the work that earns it.

5. **No "must" without a reason.** "Wet the rim before joining a
   handle — dry clay does not bond to dry clay, and the handle
   pops off in the bisque firing." Not "You MUST wet the rim."

6. **Glaze chemistry mentions cone number, not "low fire / high
   fire".** Cone 06 is roughly 1000°C; cone 6 is roughly 1220°C;
   cone 10 is roughly 1280°C. The cone number is the precise
   shorthand the studio uses.

7. **Lead and barium are named when discussing historical
   recipes, then immediately stop.** "Eighteenth-century English
   slipware used lead-bisilicate glazes. The publication does not
   reproduce these. Modern lead-free substitutes — Gerstley
   borate, frit-based, lithium carbonate — are the working
   recipe."

8. **No claims of food-safety unless the glaze has been
   tested.** Tested food-safe glazes are named as such; untested
   surfaces are surfaced as "decorative". Cobalt brushwork under a
   tested glaze is fine; cobalt brushwork without a glaze on top
   is not.

9. **Heritage attribution is honest.** "Sgraffito" is a
   widely-used Italian word for scratched decoration; we use it.
   "Mishima" is a Korean-into-Japanese technique we use the name
   of. We don't claim the tradition; we credit it.

---

## Glossary terms

Every PATTERN or TECHNIQUE tutorial that uses a term a beginner
won't know should register the term in `glossaryTerms[]` AND wrap
the first inline use with a `glossaryTooltip` mark (see
`feedback_inline_glossary_coverage.md`).

Candidate terms across Pottery:

- **leather-hard** — the working stage where the clay holds its
  shape but is still damp enough to trim and join.
- **bone-dry** — the air-dried-but-unfired stage. Fragile.
- **greenware** — unfired clay in any drying stage.
- **bisque / biscuit firing** — the first firing, around cone 06,
  that hardens greenware into porous bisqueware.
- **glaze firing** — the second firing, at the body's mature
  temperature, that melts the glaze and vitrifies the body.
- **cone** — pyrometric measure of heat-work. Cone 06 ≈ 1000°C,
  cone 6 ≈ 1220°C, cone 10 ≈ 1280°C.
- **wedging** — kneading clay to homogenise water and expel air.
- **centring** — settling a clay mound on the wheel head so it
  rotates without wobbling.
- **opening** — pressing a hole into the centre of a centred
  mound to start a thrown pot.
- **pulling a wall** — drawing clay upward between fingers to
  thin and raise the wall.
- **foot ring** — the trimmed-back base ridge a finished pot sits
  on.
- **sgraffito** — scratching through a slip layer to reveal the
  body beneath.
- **mishima** — line decoration inlaid with slip on leather-hard
  greenware.
- **slip** — clay diluted with water to a brushable consistency.
- **engobe** — a high-clay slip with a more glaze-like
  composition, used as a decorative coating.
- **bat** — removable disc that the pot is thrown on and lifted
  off with.

Use them. Register them. The audit refuses tutorials with
registered-but-unused or used-but-unregistered terms.

---

## Sources

PD canon for pottery is thin and dated. Most modern pottery texts
are copyrighted. Acceptable references for `sourceNotes`:

- **Late-nineteenth-and-early-twentieth-century industrial pottery
  manuals** — Cassell's *The Book of the Home* (1880s editions),
  Mortimer Wheeler's archaeological reports on historical glaze
  chemistry (mid-twentieth century, public domain by date in many
  jurisdictions; check per source).
- **Encyclopedia Britannica eleventh edition (1911)** — pottery,
  ceramics, glaze chemistry entries; Project Gutenberg.
- **Wikimedia museum open-access collections** — V&A, Met,
  Smithsonian — primary-source photographs of historical
  technique-illustrating ware, valuable for image sourcing.
- **Japanese / Chinese historical glaze treatises** — handle
  carefully; translation provenance must be verifiable. Many are
  out of copyright by date in their country of origin but the
  English translations may be later and still in copyright.
- **Technique fundamentals are uncontroversial and don't need a
  PD source citation.** "Wedging works the air out of the clay" is
  a fact, not a quotation. State "traditional technique" rather
  than fabricating an attribution.

NOT acceptable:

- **Bernard Leach, *A Potter's Book* (1940)** — copyright held.
  No reproduction of recipes or text. The Leach standards (cone
  10 reduction stoneware, the Leach glazes) are the framework most
  studio pottery operates within; we acknowledge the framework but
  don't quote.
- **Daniel Rhodes, *Clay and Glazes for the Potter*** — copyright
  held. The standard reference; we don't reproduce.
- **Robin Hopper's books** — copyright held. The pieces we cite
  for cross-reference are tools shape and decorating-wheel
  workflow; we don't reproduce glaze recipes.
- **Mastering Cone 6 Glazes (Hesselberth & Roy)** — copyright
  held. Cone 6 recipes are widely shared in studio practice; we
  derive from first principles when authoring glaze chemistry.
- **Modern pottery-blog tutorials** — copying their text is
  violation even when the technique is centuries old.

`sourceNotes` is plain text. List the sources used and what was
drawn from each ("V&A open-access slipware-plate photograph for the
finished-form reference; technique derived from first principles").

---

## Image strategy

Pottery images follow the Garden + Herbal model with a stricter
verification rubric for finished items.

**For finished-item heroes (PATTERN tutorials):**

Sourcing priority: Old Book Illustrations → Wikimedia museum open-
access (V&A, Met, Smithsonian, British Museum) → Pexels → Unsplash
→ Pixabay → Flux Schnell → procedural card.

**Stricter verification:** pottery finished-items are era + technique
+ glaze + form specific. A modern slip-cast mug doesn't illustrate a
hand-built coil pot. A reduction-glazed stoneware bowl doesn't
illustrate a low-fire majolica bowl. Reject if any specific
construction or surface element is wrong. Generic "shows the
category" is not enough.

**For technique tutorials (TECHNIQUE):**

Procedural card is the default. Tutorial pages lean on form diagrams
(cross-sections of pot profiles, foot-ring geometry) — inserted as
static Media rows of `type: ILLUSTRATION`, same as the cooking
process diagrams. The chart renderer Crochet uses is not in scope
for Pottery.

**No charts.** Charts are knitting + crochet territory.

---

## TipTap blocks Pottery relies on

- `paragraph`
- `heading` (levels 2 + 3 — never 1; the page renders the title)
- `bulletList`, `orderedList`, `listItem`
- `blockquote` (sparing — for quoting a source verbatim only)
- `text` with `glossaryTooltip` mark
- `troubleshooter` (the structured "what can go wrong" block)
- `infoPanel` for safety preambles (silica dust, kiln ventilation,
  heavy-metal-oxide handling)
- `suppliesCard` for materials + tools summary at the top of
  PATTERN bodies
- `subTutorialCard` for cross-links to TECHNIQUE entries

There is no chart block, no equipment-list block dedicated to
pottery; equipment is listed in body prose or in a `suppliesCard`.

---

## Cross-category links

- **Natural home** — handmade tableware, candle holders, soap
  dishes, planters. Hand-building patterns that finish as everyday
  household objects link here.
- **Sustainability** — clay reclaim (turning trimmings and
  failures back into workable clay), kiln efficiency (loading
  patterns that minimise wasted heat).
- **Garden** — terracotta planters, propagation pots, garden
  sculpture.
- **Cooking** — handmade bowls, plates, jugs for everyday use.
- **Baking** — bread cloches, ramekins, pie dishes — handmade
  ceramics for the kitchen.

---

## Self-critique loop

After drafting, run two passes before writing the JSON:

1. **Voice + common-issues sweep.** Read every paragraph against
   `docs/voice-editor-prompt.md` and `docs/common-issues.md`.
   Rewrite in place.

2. **Pottery-specific anti-tell sweep.** Walk every paragraph for:
   - Brand-name leaks (Sculpey, Fimo, Skutt, Brent, B-mix, Amaco,
     Mayco, Spectrum, Botz).
   - Equipment-barrier dishonesty (a no-equipment-track tutorial
     that smuggles in a kiln-fired finishing step without flagging
     it).
   - Lead-glaze-recipe leaks (any historical lead recipe in any
     form, even with a "do not use" caveat).
   - Missing safety preamble on glazing / firing tutorials.
   - Missing wall thickness in millimetres on a forming step.
   - Missing drying-stage call-outs.
   - Cone-number / temperature-celsius drift (when one says cone 6
     and the other says 1180°C, the cone wins — 1220°C is correct
     for cone 6).
   - Food-safety claims on untested surfaces.

The deterministic `voice-check` CLI is the final gate.

---

## Worked example — output JSON (compact)

A short PATTERN example showing every field a no-equipment-track
pottery PATTERN input should fill:

```json
{
  "slug": "pinch-pot-bowl-air-dry-clay",
  "title": "Pinch-pot bowl in air-dry clay",
  "subtitle": "The oldest ceramic form, made without a kiln",
  "excerpt": "A pinch-pot bowl is the simplest ceramic vessel — a ball of clay pressed open with the thumb and walked around between finger and thumb. This version uses air-dry clay so it sets at room temperature, no kiln required.",
  "type": "PATTERN",
  "categorySlug": "pottery-ceramics",
  "subCategorySlug": "hand-building-no-equipment",
  "difficulty": "BEGINNER",
  "sourceType": "SYNTHESISED",
  "sourceNotes": "Technique derived from first principles — pinch pots predate documented pottery sources. V&A open-access collection for the historical-form reference.",
  "craftType": "pottery-ceramics",
  "requiresKiln": false,
  "requiresWheel": false,
  "requiredClayBodies": ["air-dry-clay"],
  "requiredCraftMaterials": [],
  "recipeTools": [
    { "slug": "wooden-rib", "isOptional": false },
    { "slug": "wire-cutter", "isOptional": false },
    { "slug": "pottery-sponge", "isOptional": false },
    { "slug": "needle-tool", "isOptional": true }
  ],
  "glossaryTerms": [
    { "slug": "leather-hard", "term": "Leather-hard", "definition": "The drying stage where clay holds its shape but is still damp enough to trim and join." },
    { "slug": "bone-dry", "term": "Bone-dry", "definition": "Air-dried but unfired. Fragile; final stage before firing (or, for air-dry clay, the finished state)." }
  ],
  "body": { "type": "doc", "content": [ /* intro + suppliesCard + before-you-start + forming-steps + drying-stage + finishing + care + troubleshooter */ ] }
}
```

---

**Next session** picks up the anchor batch of 4 once Rebecca has
reviewed this prompt. The anchors are:

1. `pinch-pot-bowl-air-dry-clay` (no-equipment, hand-building,
   BEGINNER).
2. `coil-pot-paper-clay-vase` (no-equipment, hand-building,
   BEGINNER).
3. `centring-half-kilo-of-stoneware` (TECHNIQUE, wheel-kiln,
   BEGINNER).
4. `dipping-glaze-on-a-bisque-bowl` (PATTERN, wheel-kiln, glazing,
   INTERMEDIATE).

Append to `docs/pottery-anti-tells.md` any patterns recurring 3+
times across the anchor batch.

<!--
  Shared v5 appendix appended to tutorial-author.md, baking-author.md,
  mindset-author.md, herbal-author.md, sewing-author.md,
  crochet-author.md, and pottery-ceramics-author.md. Source of truth
  for the cross-category content integration rules that landed in
  phase_8_content_integration_001.
-->

---

## v5 — content integration rules (cross-category)

The following rules apply to every drafter (cooking, baking,
mindset, garden, herbal, sewing, crochet, pottery). They are
deterministic — the upload pipeline checks them and the self-
critique pass must verify each before output.

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
Set on the draft's `hero` block:

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

The upload script downloads from `remoteUrl`, pushes to R2, and
creates the Media row with the structured attribution fields
populated. The public renderer shows the discreet © tooltip only
when `requiresAttribution === true`.

If `result.outcome === 'failed'`, leave `hero` unset — the public
renderer falls back to the procedural card.

### Image verification — match the candidate against the technique

Every candidate goes through a verification check. For Pottery:
the candidate must show the same hand-building / wheel-thrown /
glaze technique the tutorial teaches. A modern slip-cast vase
does not illustrate a hand-built coil pot. Use
`verify-media-batch.ts` + `apply-media-verdicts.ts` for the sweep
path, or pass `verify` to `sourceHeroImage` for inline
verification.

### ProjectSchedule registration — multi-day arcs

Long-arc PATTERN rows register `projectSchedule` rows so the
homepage can resurface the project on the right day after a
reader clicks "I'm making this". Detect a multi-day arc when:

- A pottery project spans more than three working sessions
  (wedging + forming + leather-hard trim + bone-dry sand + bisque
  fire + glaze + glaze fire is a five-to-ten-day arc).
- Glazing requires drying between coats.
- Bisque-firing or glaze-firing schedule needs a cool-down day.

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

- `HERO` — takes over the homepage hero. Reserve for big-moment
  days ("Your glaze firing is ready to open").
- `RAIL_CARD` — default. Shows in the "Today's scheduled project
  actions" rail.
- `NOTIFICATION_ONLY` — in-app notification, no homepage change.

Single-session PATTERN rows leave `projectSchedule` empty.
TECHNIQUE rows must not carry a schedule.

### Cross-category audit rules

The following are hard rules the drafter checks before output.

1. **Temperature canonical °C** for every kiln / oven / drying
   reference. Cone-number tutorials state the °C equivalent at
   first mention so a reader can cross-check on a non-cone-
   indicating thermocouple.
2. **Inline glossary coverage.** Every entry in `glossaryTerms[]`
   must appear at least once in body prose wrapped in a
   `glossaryTooltip` mark. Registered-but-not-used is wrong.
   Used-but-not-registered is also wrong.
3. **Equipment-barrier flags consistent with the body.** A
   tutorial whose body describes a kiln firing must set
   `requiresKiln = true`. A tutorial whose body uses raw silica
   or any `trainedEnvironmentOnly = true` material must NOT be in
   the no-equipment track.

### Missing technique logging

When the body inserts a `subTutorialCard` block referencing a
technique slug that doesn't exist in the database as a published
`Tutorial`, the upload script appends a line to
`docs/missing-techniques.md`. A future technique-authoring session
walks this file.

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
