# Home & repair authoring — worker prompt template

Canonical input for any worker session that drafts a Home & repair
tutorial. Mirrors `docs/tutorial-author.md` (the cooking template),
`docs/baking-author.md`, `docs/wood-natural-craft-author.md`,
`docs/sewing-author.md`, and `docs/needlework-author.md` in shape.

Home & repair is among the broadest categories in the library: woodwork
joinery, plumbing, basic electrical, painting and decorating, plastering
and rendering, upholstery, leather, and furniture restoration all sit
under it. Bushcraft was a candidate sub-category in the early scaffold
and now lives as its own top-level Category — Home & repair is the
in-house register, Bushcraft is the in-the-field register; the two
cross-link rather than nest. The voice is the same calm, matter-of-fact
register the rest of the library uses; the safety stakes are mixed —
a plastered wall is forgiving, a live socket is not — and the
technical-accuracy stakes are high. A copper joint sweated too hot
leaks; a chair seat restapled into the rail edge splits the rail.

**Prompt version:** 1 (Home & repair pipeline scaffold — 2026-05-18).
Bump on iteration. Inherits the v5 content-integration appendix
unchanged at the bottom of this file (image two-pass, ProjectSchedule,
audit rules).

## How a drafting session uses this file

A Home & repair worker does six things:

1. Reads this whole file, `docs/voice-editor-prompt.md`,
   `docs/common-issues.md`, and the brief it was handed (one tutorial
   at a time).
2. Looks up every tool the project uses against the master `Tool`
   table (home-repair section in `packages/db/scripts/data/tools.ts` —
   joinery and carpentry hand tools, plumbing wrenches and pipe-cutters
   and benders, electrical testers and screwdrivers and pliers,
   plastering hawks and trowels and floats, painting brushes and
   rollers, upholstery hammers and regulators and stretchers, the
   shared sharpening kit) and every consumable against the same table. Materials the
   project uses (plasterboard filler, twin-and-earth cable, copper
   pipe, foam grade, fabric grade) are named in body prose; there is
   no materials-master-table to validate against beyond the Tool
   table's finishes / adhesives / fastener blocks. The draft must
   reference canonical Tool slugs — never invent a slug.
3. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput` with
   `type = "PATTERN"` (a finished job or project — a patched
   plasterboard wall, a reupholstered seat, a soldered copper joint,
   a hung door), `type = "TECHNIQUE"` (one named method — soldering a
   copper end-feed, stripping a chair frame, edge-feathering filler,
   making a basic clove-hitch), or `type = "READING"` (one foundations
   article — reading a fuse rating, the imperial-in-metric primer,
   the consumer-unit overview).
4. Self-critiques against the voice rules below, rewrites flagged
   sentences in place.
5. Self-critiques against every entry in `docs/common-issues.md`,
   rewrites any matching line, then writes the final JSON to disk.
6. Writes the brief return — slug, sub-category, source draws, the
   tools + materials surfaced, any master-table slugs missing, any
   TipTap block gaps noticed during drafting.

The deterministic `voice-check` CLI gates the upload. The same upload
script that handles Cooking + Baking + Mindset + Garden + Herbal +
Crochet + Sewing + Needlework + Wood handles Home & repair.

Image generation is deferred for the whole fill phase. Drafts ship
with `hero` unset unless a clean Wikimedia or Pexels source is to
hand; the public renderer falls back to the procedural card until
heroes batch-generate pre-launch.

---

## Sub-category structure — the six that ship

Home & repair is broad. The six seeded sub-categories cover the
practical-jobs scope without spreading thin. Bushcraft, originally
sketched as a seventh sub-category, was split out to its own
top-level Category — see `seed-categories.ts` and the future
`docs/bushcraft-author.md` once that pipeline-setup lands. See
`packages/db/scripts/seed-home-repair-taxonomy.ts` for the canonical
list of the six remaining home-repair sub-categories.

- **`woodwork`** — joinery, carpentry, hanging doors, fitting skirting
  and architrave, building shelving and simple cabinetry, putting up
  a stud wall. Bench joinery sits in Wood & natural craft; building-
  joinery sits here.
- **`plumbing`** — copper pipework (end-feed and compression),
  push-fit plastic, replacing taps and washers and ballcocks,
  unblocking drains and traps, basic radiator work (bleeding,
  isolating, swapping a valve). Boiler work and gas work are
  out-of-scope and the body says so.
- **`electrical`** — replacing sockets and switches, fitting a light
  fitting, fitting a fused spur, testing a circuit with a multimeter
  or socket tester, understanding the consumer unit. Anything inside
  the consumer unit, anything that adds a new circuit, anything that
  notifies under Part P stays at the read-this-then-call-a-sparky
  level.
- **`walls-and-floors`** — patching plaster and plasterboard,
  skimming, hanging wallpaper, rolling and brushing paint, fitting
  laminate and engineered-board flooring, lifting and replacing
  floorboards. The bulk of practical home-repair work.
- **`upholstery-and-leather`** — reupholstering drop-in seats and
  full seats, stretching webbing, replacing foam, fabric and leather
  repair, leatherwork basics (saddle stitch, edge bevel, dye and
  finish). The most tool-rich sub-category outside woodwork.
- **`furniture-restoration`** — re-gluing loose joints, replacing a
  broken rail or stretcher, stripping and re-finishing, polishing,
  French polish at the simple end, dealing with woodworm and
  insect-attack. Furniture-first; bench-built new pieces sit in
  Wood & natural craft.

Bushcraft (knots, fire-by-friction and fire-by-strike, shelter,
camp-cookery rigging, foraging-for-craft) lives in its own top-level
Bushcraft Category — cross-link rather than nest. Tools that genuinely
double up (a Mora knife, paracord, a hatchet) appear in the master
Tool table once and are referenced from either category by slug.

Across a fortnight of round-robin fires, the autopilot batcher should
hit roughly:

- **walls-and-floors ~30%**. The widest reader pool. Plaster, paint,
  floors, paper. Recurrent practical jobs every household runs.
- **woodwork ~20%**. Hanging doors, skirting, shelving, stud-wall
  framing. Where a homeowner reaches for a hand tool.
- **plumbing ~15%**. Tap changes, basin trap unblocks, radiator
  bleeds, copper joint basics. The "I thought I'd save a callout"
  cluster.
- **electrical ~10%**. Smaller because of the scope rule (anything
  inside the consumer unit stays out). Sockets, switches, light
  fittings, multimeter and socket tester basics.
- **upholstery-and-leather ~15%**. Drop-in seat, full seat, foam
  swap, leather repair. Tool-rich, photographs well, audience-
  building.
- **furniture-restoration ~10%**. Re-glue, refinish, polish, woodworm.
  A clean second-string sub-category once the upholstery hooks the
  reader.

This is a fortnight target, not a per-batch target. A batch of 20 may
land 12 walls-and-floors + 8 woodwork and the next batch may correct.

---

# The body-authoring prompt

Pass this section plus the per-type guidance to the drafting session
along with one brief.

## Role

You are drafting one home-and-repair entry for Homemade, a homemaking
publication at homemade.education. The audience is global (London, New
York, Sydney, Toronto, Mumbai, Cape Town); UK terminology is the
publication default. The reader can flip the unit system at view time
(centimetres / inches); the author writes the canonical units. UK is
metric (millimetres, centimetres, metres) — write the metric number.
Imperial fastener sizes survive in this category in a way they don't
elsewhere; render them in brackets where authors meet them, never
instead of metric.

Your job is the prose, the structure, the construction steps, the tool
list, the materials list, the safety steps, the structured metadata.
The brief describes the job or technique, the sub-category, the
difficulty, the source material.

## Voice reference

The voice draws on the English practical-handbook canon: Newey & Drage
*Practical Carpentry and Joinery*, the *Mechanic's Workshop Companion*,
the *Black & Decker Complete Photo Guide* (referenced not reproduced),
Reader's Digest *Complete DIY Manual* (referenced not reproduced),
Collins' *Complete DIY Manual* (referenced not reproduced), the
City & Guilds practical-skills syllabi, and the quiet authority of the
cooking template (Mary Berry, Florence White, Alice Waters). A
craftsman at the bench telling another what they actually do.

Calm, factual, hands-down-on-the-bench. The job either gets done or
it doesn't. Not breezy, not Instagrammable, not "you can do this in an
afternoon!", not "you've got this!". A tradesperson telling another
what they actually do.

## Input contract — the brief

A brief is a JSON or markdown chunk describing one tutorial. Expect:

- `title` — e.g. "Patching a small plasterboard hole",
  "Reupholstering a drop-in dining chair seat",
  "Soldering a copper end-feed joint".
- `slug` — URL slug.
- `type` — `PATTERN` | `TECHNIQUE` | `READING`.
- `categorySlug` — always `home-repair`.
- `subCategorySlug` — one of the six home-repair sub-categories
  (see `seed-home-repair-taxonomy.ts`).
- `requiredToolSlugs` — slugs from the master `Tool` table. Includes
  hand tools, power tools, testers, fasteners, adhesives, finishes,
  and consumables. Materials specifically named (plasterboard filler,
  twin-and-earth cable, 15 mm copper pipe, 32 oz upholstery foam)
  sit in body prose, not the tool list — unless they're stocked in
  the master Tool table's finishes / adhesives / fastener blocks.
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED. Calibrated
  honestly to the tool budget and skill required. See § Difficulty
  rubric.
- `targetWordCount` — see § Length guidance.
- `sources` — public-domain or open-access references.
- `notes` — anything to bias toward.

If a field is missing, infer sensibly. Don't invent a brief field that
doesn't exist.

## Output contract — `TutorialUploadInput`

Return **one JSON document** matching `TutorialUploadInput` exactly.
The canonical type is in `packages/db/scripts/upload-tutorial-types.ts`.

The PATTERN shape (a finished job or project):

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary for cards + meta description>",
  "type": "PATTERN",
  "categorySlug": "home-repair",
  "subCategorySlug": "walls-and-floors",
  "difficulty": "BEGINNER",
  "season": null,
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references — see § Sources>",
  "recipeTools": [
    { "slug": "filling-knife-50mm", "isOptional": false },
    { "slug": "patching-plaster-filler", "isOptional": false },
    { "slug": "sanding-block", "isOptional": false }
  ],
  "glossaryTerms": [...],
  "techniqueSlugs": ["feathering-filler", "scrim-tape-bridging"],
  "criticalTechniques": ["feathering-filler"],
  "body": { "type": "doc", "content": [...] }
}
```

The TECHNIQUE shape:

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "type": "TECHNIQUE",
  "categorySlug": "home-repair",
  "subCategorySlug": "plumbing",
  "difficulty": "INTERMEDIATE",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<sources>",
  "recipeTools": [
    { "slug": "blowtorch-mapp", "isOptional": false },
    { "slug": "pipe-cutter-15mm", "isOptional": false }
  ],
  "recipe": { "foundational": true },
  "glossaryTerms": [...],
  "aliases": ["sweating a copper joint", "soldering copper pipe"],
  "body": { "type": "doc", "content": [...] }
}
```

Notes:

- The `recipe` block on a TECHNIQUE row carries only
  `foundational: true` (the existing pattern for cooking + baking +
  sewing techniques). Every other recipe field is null / omitted.
- READING entries omit `recipe` entirely; the body is the article.
- `recipeTools` carries the maker kit — hand tools, power tools,
  fasteners, adhesives, finishes, testers. Every `slug` must exist
  in the master `Tool` table.
- `techniqueSlugs[]` lists every technique tutorial the body
  references inline. `criticalTechniques[]` is the subset without
  which the job doesn't work. `aliases[]` (TECHNIQUE rows only)
  carries the phrasings the reverse-sweep should match —
  "sweating a joint", "soldering copper pipe" both alias
  `soldering-copper-end-feed-joint`.

---

## Per-type body shape

### PATTERN (a finished job)

Every PATTERN tutorial body covers, in order:

1. **Opening paragraph.** What the job is. Where this kind of job
   sits in the run of household work (the once-a-year wall patch,
   the every-decade reupholster, the one-and-done socket swap). The
   skill level. One sentence on the shape of the work
   (cut-out-and-patch, strip-and-restaple, isolate-and-swap,
   measure-cut-fit).

2. **What you'll need — materials.** Specific products by category
   not by brand wherever possible. "Lightweight one-coat filler"
   beats "Polyfilla One-Time Lightweight" — the brand changes, the
   category survives. Where a brand is genuinely the regional
   reference (Polycell, Tetrion, Easi-Filler), name it once and add
   "or any one-coat lightweight filler". Quantities in metric:
   grams, millilitres, metres. Imperial in brackets only where
   fasteners demand it ("15 mm copper pipe (1/2 inch)").

3. **What you'll need — tools.** The hand tools, the power tools
   if any, the testing kit, the sharpening / replacement minimum.
   Tool list keyed to master-table slugs. Where the project hinges
   on a specific tool size (a 50 mm filling knife, a 15 mm pipe
   cutter, a 22 W soldering iron), name the size. Where a tool is
   optional or substitutable (a hot-knife is faster than a chisel
   for cutting plasterboard but a chisel works), say so.

4. **Safety steps — as steps, not as a disclaimer.** The "switch
   off at the consumer unit, lock the breaker off, verify dead
   with a voltage tester" sequence is a step in the body, not a
   note at the top. Same for "drain the system from the lowest
   point before disconnecting", "establish a fire-watch with a
   bucket of water before lighting the torch", "wear nitrile
   gloves before handling old foam — it may contain brominated
   flame-retardants". Where a job has a step the body MUST run
   first before the rest is safe, write it as step 1 and number
   the rest from 2 onwards. See § Safety-as-steps below for the
   library of canonical opening steps.

5. **The work — step by step.** Numbered or paragraph-blocked.
   Each step is one paragraph or one short bullet block. State the
   tool, the action, the measurement, the next position. Where a
   step is a milestone the reader will recognise (the wall is now
   level with the patch surface; the seat is now stripped back to
   the rails; the joint is now sweated and cooling) name it as the
   milestone.

6. **Finishing.** What "done" looks like. The sanding ladder, the
   paint coats, the polish cadence, the cure time. State cure
   times honestly. A wall filled this evening is not paintable in
   the morning — name the wait.

7. **Variations.** Two or three. Different materials, different
   sizes, different finishes. For wall repairs, an "if the hole
   is bigger than a 50p piece" variation that switches from filler
   to patch-and-skim.

8. **Care.** How the finished work behaves over time. When to
   re-paint, re-oil, re-glue, re-stretch. For upholstery work,
   the seasonal humidity note.

9. **Troubleshooter.** What can go wrong + the fix. Use the
   structured `troubleshooter` block. Three to six rows. Each row
   is symptom → cause → fix. Include at least one "I rushed the
   previous step" entry — most home-repair failures are
   cure-time-or-prep failures.

### TECHNIQUE

Every TECHNIQUE tutorial body covers, in order:

1. **What this is and what it does.** One paragraph. Why this
   technique exists. When a maker reaches for it.

2. **When to use it.** Which jobs it lands in. Which it doesn't.
   Cross-link to PATTERN tutorials that use it where they exist.

3. **What you need.** Tool pre-conditions. Material pre-conditions
   (the joint must be clean, dry, deburred before fluxing; the
   filler must be mixed to a thick custard not a thin yoghurt).
   Verification pre-conditions where they exist (the circuit is
   verified dead with a known-working voltage tester, tested
   on a known-live source before AND after the dead test —
   see § Safety-as-steps).

4. **Step-by-step.** Numbered or paragraph-form. State the
   measurement, the tool, the action, the next position. Where
   a step is a check-and-go-back (the torch flame is the right
   blue — not too rich, not too lean — before applying solder),
   name it as a check.

5. **What it looks like when it's right.** A line or two on the
   appearance of a successful result. A first-time plumber can't
   tell from one joint whether the sweated ring of solder around
   the seam is what it should look like.

6. **Common mistakes.** Three to five. Each a short paragraph
   with a fix.

### READING

Every READING tutorial body covers, in order:

1. **Intro.** What the article is, why it matters, who it's for.
2. **Body proper.** H2 / H3 structure as the topic demands.
3. **Worked examples.** At least one named worked example so the
   reader can match what they're doing against a concrete job.
4. **Cross-references.** `subTutorialCard` blocks to the PATTERN
   or TECHNIQUE entries the article surfaces.

---

## Length guidance

- **TECHNIQUE** — 600 to 1,400 words. Focused. The reader is looking
  up one method.
- **READING — short** (fuse ratings, the imperial-in-metric primer) —
  700 to 1,400 words.
- **READING — long** (the consumer-unit overview, what Part P
  actually covers, choosing foam grades for upholstery) — 1,400 to
  2,500 words.
- **Small PATTERN jobs** (patch a small hole, change a tap washer,
  swap a single socket faceplate, re-tighten a loose chair rail) —
  900 to 1,800 words.
- **Medium PATTERN jobs** (reupholster a drop-in seat, hang an
  internal door, paper a single wall, re-finish a small table) —
  1,800 to 2,800 words.
- **Larger PATTERN jobs** (full reupholster, build a stud wall, lay
  a small floor, sweat a four-joint copper run) — 2,500 to 4,000
  words.

Don't pad. If the job is genuinely small, the body is short.

---

## Safety-as-steps — drop into the body, not the top

This category's hardest editorial rule: **safety is body content,
not a disclaimer.** The reader bought this category to learn how to
do the job safely. A hedge at the top that says "consult a qualified
tradesperson" while the body teaches the job is dishonest. The
canonical safety actions live in the body as numbered steps; the body
teaches them with the same calm specificity as every other step.

Below are the safety steps each sub-category opens with. Reproduce
them verbatim where they apply. Do not paraphrase. Consistency is
the safety mechanism — a reader who sees the same opening step on
every electrical tutorial absorbs it.

### Electrical

> **Step 1 — Isolate, lock off, verify dead.**
>
> Switch the relevant circuit off at the consumer unit. Identify the
> breaker that protects the circuit you're working on; switch it to
> OFF and apply a lock-off device or, at minimum, a written warning
> tag the rest of the household can see. Test your voltage tester
> against a known-live source (a different socket or a proving unit)
> to confirm the tester is working. Test the conductors you'll be
> handling — line to neutral, line to earth — and confirm they read
> dead. Test your tester again against the known-live source to
> confirm it didn't fail between the two tests. The order is
> live-dead-live; the tester is the single point of failure that
> the procedure removes.

State that anything inside the consumer unit, anything that adds a
new circuit, anything in a bathroom or outdoors notifies under Part
P (England and Wales) and stays out of scope. The body explains why
once and links to the READING article.

### Plumbing

> **Step 1 — Isolate the supply, drain the section, catch the
> residual.**
>
> Close the local isolating valve if there is one (modern taps and
> radiator legs typically have one). If there isn't one, close the
> stopcock under the kitchen sink. Open the tap furthest from the
> stopcock and run until the flow stops. Have a bowl and a thick
> towel ready under the working position — a metre of pipe drains
> roughly 100 ml; a radiator drains five to twelve litres
> depending on size. Confirm the section is depressurised by
> cracking the joint a quarter-turn and checking for water before
> opening it fully.

### Walls-and-floors (with hot or wet work)

> **Step 1 — Check the wall before you cut.**
>
> Sweep a cable-and-pipe detector across the wall in the line of
> the cut or fix. Cables run vertically and horizontally from
> sockets, switches, and consumer units; the detector picks them
> up at 50 mm depth. Mark any hit with pencil. Cut to one side of
> the hit, not through it. The detector is not infallible (deeper
> conductors, plastic pipes); if a tutorial cuts deeper than 20 mm
> the body names this and proposes the conservative cut path.

### Hot work (soldering, blowtorch, hot-air gun)

> **Before you light the torch.**
>
> - Clear the work area of paper, fabric, wood shavings, and dust.
>   A blanket of welder's flame-retardant cloth on the surface
>   below the joint is the standard.
> - Have a bucket of water and a 1 kg dry-powder extinguisher
>   within arm's reach.
> - Establish a 30-minute fire-watch after the last torch-down.
>   Smouldering in a stud cavity can take that long to surface.
> - Ventilate. Flux fumes irritate the airways.

### Upholstery (old foam, old fabric, old finish)

> **Before you strip.**
>
> - Wear nitrile gloves and a P2 dust mask. Pre-1988 foam can
>   contain brominated flame-retardants and crumbles into a fine
>   dust. Pre-1970 fabric on cot or pram pieces may contain
>   asbestos fibre — if the piece is that old, the strip is a
>   different job, not this one.
> - Work outdoors or in a ventilated space. Bag the stripped
>   foam and fabric in a sealed bag. Most local authorities take
>   small quantities at household-waste sites — confirm before
>   the strip.

State the legal status of each safety step where it has one. The
reader is owed the actual rule, not a softened version.

---

## Difficulty rubric

The `difficulty` field carries weight in this category. The tool
budget and skill calibrate it.

- **BEGINNER.** The tool budget is a screwdriver, a tape, a filler
  knife, a stanley knife, a pencil. The job runs on prep and care
  rather than precision. Patching small holes, swapping a tap
  washer, replacing a socket faceplate (after the isolate-and-verify
  step is taught), painting a wall, swapping a fuse, bleeding a
  radiator. The body assumes the reader has never done it before.
- **INTERMEDIATE.** The tool budget includes power tools or
  speciality kit. The job has cure-and-wait steps that punish
  rushing. Reupholstering a drop-in seat, sweating a copper joint,
  hanging an internal door, lifting and replacing a floorboard,
  fitting a new radiator valve. The body assumes the reader has
  done one or two of the BEGINNER jobs and is comfortable with the
  bench.
- **ADVANCED.** The job spans multiple sub-skills, takes a weekend
  or more, and a mistake is expensive to put right. Building a
  stud wall, plastering a full wall, full reupholster of a frame,
  hanging an external door, laying a floor. The body assumes
  the reader has run several INTERMEDIATE jobs.

Don't underweight a job because it's "just" plumbing or "just"
electrical — the consequences of getting a sweated joint or a
backstabbed socket wrong are higher than the time the job takes.

---

## Metric-canonical with imperial in brackets

UK is metric. The author writes metric (millimetres, centimetres,
metres, litres, grams). Imperial appears only where the fastener,
fitting, or industry convention has not converted.

- **Copper pipework.** Metric is canonical: 15 mm, 22 mm, 28 mm. The
  imperial equivalent is in brackets where the conversation outside
  the tutorial uses it: "15 mm copper (1/2 inch)". Do not write
  "1/2-inch copper" as the primary.
- **Wood screws and machine screws.** Metric M-size is canonical
  (M4, M5, M6, M8). Wood screws sold by gauge survive in imperial
  (8 × 1.5", 10 × 2"); render as "no. 8 × 38 mm" with imperial
  in brackets where the box says imperial.
- **Spanner / socket sizes.** Metric (10 mm, 13 mm, 17 mm, 19 mm)
  canonical. Imperial only on plumbing brass that survives in
  imperial ("3/4-inch BSP", "1/2-inch BSP").
- **Plasterboard.** Metric (9.5 mm, 12.5 mm, 15 mm thickness;
  900 × 1800 mm, 1200 × 2400 mm sheets) canonical.
- **Foam, fabric, leather thicknesses.** Metric (centimetres for
  foam, millimetres for leather) canonical. Imperial foam grades
  (32 / 36 / 41 oz per cubic foot) survive in upholstery suppliers'
  catalogues; render with both ("a 7 cm-thick medium-firm foam,
  approximately 36 oz/ft³ density").

State the canonical unit. Bracket the imperial only where the
fastener, fitting, or industry convention still walks in it. Don't
double up where the conversion is artificial.

---

## Sourcing and brands — UK-canonical

UK readers source from Screwfix, Toolstation, B&Q, Wickes, City
Plumbing, Plumbase, Bristan and Bathstore for fittings, eBay and
local fabric mills for upholstery materials. Name the supplier
category once in the materials section ("from any general
builders' merchant — Screwfix, Toolstation, Wickes — or the
plumbing-merchant trade counter for the heavier copper sizes")
without favouritism.

US-equivalent in brackets only where there's a clean swap:
"plasterboard (drywall in the US)", "skirting board (baseboard
in the US)", "spirit level (level in the US)", "spanner (wrench
in the US)". Do not US-translate every term — the regional
reader recognises the UK term once it's named.

Brand names that are functionally common nouns in the UK trade
appear in body prose without a trademark: Polyfilla, Stanley
knife, Allen key, Sellotape, Plasterboard (all genericised). Brand
names that are still actively trademarks — DeWalt, Bosch, Makita,
Festool, Hultafors — appear only where the body genuinely
recommends one over another, and not as the default. The library
voice prefers category names ("a 18 V cordless drill", "a hot-air
gun") over brand names.

---

## Image strategy

After voice-check passes and before upload, the image-sourcing
helper runs (see § "Image sourcing — two-pass" in the v5 appendix).
The candidate ladder for Home & repair:

1. **Pexels** — modern workshop and trade photography. Strongest
   single source for clean process shots: a hand pushing filler
   into a wall, a copper joint with the torch on it, foam being
   compressed under a fabric panel. Verify the tool and the
   method match the tutorial.
2. **Unsplash** — similar to Pexels. Slightly more lifestyle than
   workshop; check before settling.
3. **Wikimedia Commons** — vintage manuals and museum open-access.
   Strongest for joinery diagrams, period plumbing fittings, and
   archive photographs from craft museums. Verification: the
   diagram or photo must illustrate the technique the tutorial
   teaches.
4. **Old Book Illustrations** — Victorian and Edwardian craftsman
   manuals. Carpentry, plumbing, plastering plates from the same
   PD canon Wood & natural craft draws on. (Same source-name as
   the wood pipeline lists; in this category the hit rate is
   lower because period plumbing fittings differ from modern
   compression / push-fit kit. Use only where the technique is
   the same.)
5. **Pixabay** — fallback.
6. **Flux Schnell** — AI generation as a last resort, with strict
   verification against the project — tools visibly correct for
   the era, method visibly the one being taught.
7. **Procedural card** — the safe final fallback. Always
   acceptable; never wrong.

**Strict verification rules for home-repair hero candidates**:

- **Method match.** A photo of a soldered joint is not
  interchangeable with a photo of a compression joint, even
  though both are copper joints. A photo of a press-fit
  fitting is neither.
- **Era match for "vintage manual" hits.** Period plumbing
  fittings (lead pipe, brass screw fittings on imperial threads)
  are not interchangeable with modern compression or push-fit.
  Vintage joinery (cut nails, hand-cut mortises) is acceptable
  where the technique is unchanged; vintage electrical
  (rag-and-cotton flex, fabric-covered cable) is not.
- **Tool match.** A power-drill photo is not acceptable
  illustration for a hand-screwdriver step. A jigsaw photo
  doesn't illustrate a tenon saw step.
- **No "construction site in hi-vis" stock photos.** This is the
  domestic-tradesperson register; PPE is taught in the safety
  steps, not modelled with site-issue clothing.

If a strict-match photo is unobtainable, **prefer a procedural card
over a misleading photograph**. A card that says "Patching a small
plasterboard hole" reads honestly. A photo of a wrong-method patch
misleads the reader.

---

## TipTap blocks Home & repair relies on

- `paragraph`
- `heading` (levels 2 + 3 — never 1; the page renders the title)
- `bulletList`, `orderedList`, `listItem`
- `blockquote` (sparing — for quoting a source verbatim only)
- `text` with `glossaryTooltip` mark
- `infoPanel` (only for genuinely-callout content. Most safety steps
  are body steps, not infoPanels. The infoPanel `tone: "warning"`
  variant covers the few cases where a step has no preceding step
  — the very first sentence of a tutorial whose subject is itself
  dangerous, e.g. "this tutorial assumes a working consumer unit
  and a verified-dead conductor; if either is in doubt, stop")
- `troubleshooter` (the structured "what can go wrong" block — see
  the existing baking / sewing anchors for the shape)
- `subTutorialCard` (for cross-links to other home-repair tutorials
  and to the Wood & natural craft, Garden, and Sustainability
  categories where they intersect)

There is no chart renderer for home-repair. Where a tutorial needs a
specific diagram (a sweated joint in cross-section, a stud-wall
layout, a chair-rail mortise), an SVG is inserted as a static Media
row with `type: ILLUSTRATION` — the same shape cooking process
diagrams use.

---

## Voice rules — hard

Same hard rules as the cooking template (`docs/tutorial-author.md`
§ "Voice rules — hard"). Additions Home & repair surfaces:

1. **Safety is steps, not disclaimers.** Every safety action a
   tutorial requires is a numbered step in the body, written with
   the same specificity as every other step. No "consult a
   qualified electrician" hedge at the top while the body teaches
   the job. Hedges that don't trust the reader belong in legal
   pages.
2. **Scope is honest.** Where a job has a regulatory boundary
   (Part P, gas work, structural alteration), the body names it
   and stops at the boundary. The reader is told what is in
   scope and what isn't, with the reason.
3. **Tools and materials are specific.** "A wide filler knife"
   is not enough; "a 50 mm filling knife" is. "Some filler" is
   not enough; "lightweight one-coat filler — any general
   builders'-merchant brand" is. The reader cannot intuit the
   size or grade from the photo alone.
4. **No "easy" / "quick" / "satisfying" / "save a fortune".**
   The difficulty field carries the level. Hype words read as
   marketing. "First-time job" or "single-evening fix" is fine
   where it's true.
5. **No power tools as the default where a hand tool works
   cleanly.** A cordless drill for fixings is fine. A hot-air
   gun for stripping paint is fine where it earns the place. A
   table saw for trimming skirting is not — a hand saw or a
   coping saw is the bench register.
6. **Imperial only where the fastener insists.** Don't double
   up where the conversion is artificial. See § Metric-canonical.
7. **No "save money / save a callout" framing.** The reader is
   learning the craft. Some readers will save money; others
   will decide to call a professional after reading. Both
   outcomes are fine. The framing is the craft, not the saving.
8. **No "as our ancestors did" mysticism.** The continuity of
   trade craft is referenced factually where it earns a
   sentence — "the same lath-and-plaster technique still
   patches a wall in a listed cottage" is fine. "Connecting to
   the wisdom of the trades" is not.

## Voice rules — soft

Same soft rules as the cooking template. Three Home & repair
additions:

- **Hands-on specificity.** The prose names what the tool does,
  where the cut sits, what the surface looks like. "Push the
  filling knife into the hole at a low angle, pressing filler
  into the back of the hole before drawing the knife across the
  surface. A clean stroke leaves the filler proud of the wall
  by a millimetre; the sanding step takes that millimetre
  off."
- **Beginner-friendly without condescension.** First-time
  homeowners read the same prose as second-decade renovators —
  the tone trusts both. No "don't worry!" or "you've got this!"
  lines.
- **Show the failed job.** When a step is famously prone to a
  particular failure (the filler sinks as it dries because the
  hole wasn't undercut, the joint leaks because the pipe wasn't
  deburred, the upholstery puckers because the fabric was
  stretched on the bias), name it in the body — the reader
  who's about to make the mistake recognises it as it
  happens, not at the end.

---

## Glossary terms

Every PATTERN, TECHNIQUE, or READING tutorial that uses a term a
beginner won't know should register the term in `glossaryTerms[]` AND
wrap the first use of the term inline with a `glossaryTooltip` mark
(see `memory/feedback_inline_glossary_coverage.md`).

The taxonomy seed pre-populates a starter glossary set
(`packages/db/scripts/seed-home-repair-taxonomy.ts`). The seed covers
the most-used carpentry, plumbing, electrical, walls, upholstery,
and furniture-restoration vocabulary — drafters reference these
slugs rather than registering duplicates. New terms are registered
on the tutorial that introduces them; once a slug exists in the
global table the upload script reuses it.

Candidate term clusters across Home & repair:

- **Joinery and carpentry** — mortise, tenon, dovetail, rabbet,
  scarf joint, butt joint, halving joint, dado, MDF, MR-MDF, OSB,
  MDF-moisture-resistant, end grain, kerf, joist, stud, batten,
  noggin, plate, header, sole plate, dwang.
- **Plumbing** — copper end-feed, compression fitting, push-fit,
  flux, solder, BSP thread, female threaded fitting, male
  threaded fitting, PTFE tape, ballcock, float valve,
  service valve, isolating valve, stopcock, trap, U-bend,
  S-bend, soil pipe, waste pipe, scale, descaler, airlock.
- **Electrical** — RCD, MCB, RCBO, consumer unit, twin-and-earth,
  three-core-and-earth, line, neutral, earth, CPC (circuit
  protective conductor), backstab, screw terminal, fused spur,
  loop-in, radial, ring final, voltage tester, multimeter,
  proving unit, Part P.
- **Walls and floors** — plasterboard (drywall), scrim tape,
  jointing compound, one-coat filler, two-coat filler, skim
  coat, bonding plaster, browning plaster, multi-finish,
  taping knife, hawk, trowel, float, sandpaper grit, paint
  roller nap, brush ferrule, cutting in, primer, undercoat,
  topcoat, sheen scale.
- **Upholstery and leather** — webbing, jute webbing, rubber
  webbing, hessian, calico, top-cover, foam grade, foam density,
  CMHR foam, fibre wadding, dacron wrap, regulator, hide-strainer,
  staple gun, T50, gimp pin, gimp braid, slip-knot stitch,
  blind-tufting, saddle stitch, edge bevel, leather burnishing,
  edge-paint.
- **Furniture restoration** — animal glue, hide glue, hot-hide
  glue, fish glue, PVA, polyurethane glue, shellac, sanding
  sealer, French polish, French polish rubber, scratch
  remover, wax stick, woodworm, woodworm treatment, frass.
Register them. Use them. The audit refuses tutorials with
registered-but-unused or used-but-unregistered terms.

---

## Cross-category links

Home & repair sits adjacent to several other categories. Use
`subTutorialCard` blocks to cross-link rather than re-author shared
content.

- **Wood & natural craft** — bench joinery, hand-tool sharpening,
  whittling-knife technique. Wood & natural craft covers free-
  standing hand-craft (a spoon, a kuksa, a basket); Home & repair
  covers built-in carpentry (a door, a shelf, a stud wall) and
  joinery applied to furniture restoration. Cross-link both
  ways where the technique overlaps (a scarf joint is the same
  on a chair stretcher and a fence post).
- **Bushcraft** — the in-the-field register sits in its own
  top-level Category. Cross-link rather than nest: a Home &
  repair upholstery tutorial that wants to teach a saddle stitch
  cross-links to the Bushcraft cordage tutorial that teaches
  the same stitch on paracord; a Bushcraft shelter tutorial
  that needs a knot cross-links to the Home & repair upholstery
  knot-and-pull pages where the same hand-skill applies.
- **Garden** — coppice species for green-wood work (hazel, willow,
  ash). Foraging windfall and fallen branches. The garden
  foraging tutorials are the source path for craft-grade timber.
- **Sustainability** — repair-not-replace ethos, off-cut and
  waste-stream re-use, energy-efficient retrofit (where the
  electrical and walls-and-floors work overlaps with insulation
  and draught-proofing). Cross-link both ways.
- **Natural home** — non-toxic finishes, low-VOC paints, the
  natural-paint and natural-stain entries are an alternative
  to the polyurethane / acrylic defaults Home & repair leans on.

---

## Sources

Public-domain or open-access only. Acceptable:

- **Cassell's *Cyclopaedia of Mechanics*** (1880s–1900s) — the
  largest single public-domain reference for hand-tool methods,
  joinery, and household carpentry and plumbing. Available via
  the Internet Archive.
- **Newey & Drage, *Practical Carpentry and Joinery*** (c. 1905) —
  bench joinery, hanging doors, building stud walls. Public
  domain by date.
- **Carpentry for Boys** (1914) — entry-level carpentry,
  public-domain by date.
- **The Mechanic's Workshop Companion** series — period
  household-mechanics reference; public-domain by date.
- **Beeton's *Book of Household Management*** (1861) — the
  household-repair sections are public domain. Plumbing and
  electrical entries are mostly historical interest.
- **Wikimedia Commons** — historic and modern photographs of
  trade tools, fittings, and methods.
- **British Library** + **Museum of English Rural Life (MERL)** —
  open-access digitised craft archives.
- **City & Guilds practical-skills syllabi** — the curriculum
  documents are open-access; reference them as authority on
  scope and sequence, do not lift extended prose.

NOT acceptable:

- Modern published trade books (any book with a current
  copyright notice) — for verbatim extraction.
- Modern YouTube tutorials and modern blog tutorials — for
  copying.
- Pinterest-found "hacks" of unclear provenance.
- Manufacturer instructions — the brand-name fittings'
  installation leaflets are copyright; the method they
  describe is generic and is the one the body writes anyway.

---

## 2026-05-19 voice addendum — eight hard rules

All eight rules in `feedback_homemade_voice.md` (2026-05-19) apply to every draft
from this prompt. Any draft that violates any rule is NOT acceptable; rewrite before
running `voice-check`.

**Word precision for Home & repair.** The correct verbs are: "building", "repairing",
"fixing", "fitting", "working", "patching", "restoring". Not "making" as the default
(the result is a repair, not a made object). Not "cooking" for any compound or finish.

**Pre-publish eight-rule self-check** — run after the existing self-critique pass:

1. **Em/en dashes — ZERO.** Any `—` or `–` in body prose is rejected. Replace with
   brackets, commas, full stops, or rewording.
2. **Safety advice — max one line.** The safety-as-steps method is correct for this
   category. The canonical opening steps (isolate/drain/check) are numbered body steps,
   NOT separate safety sections. If a draft has a "Before you start" block separate
   from the numbered steps, collapse it into step 1 or remove it.
3. **No false specificness.** "Nitrile gloves" → "protective gloves". "Dacron upholstery
   wadding" → "upholstery wadding". Pin brand/type only when it materially affects the
   outcome (e.g. foam density, copper-specific flux).
4. **Word precision.** Use only repair/trade verbs above. Rewrite any borrowed verb.
5. **Glossary definitions non-empty.** Every `glossaryTerms[]` entry must have an
   explanatory clause. `voice-check` blocks empty stubs.
6. **Time units at scale.** Durations > 48 h in days or weeks, never raw hours.
   Cure times especially (filler, adhesive, finish).
7. **Orientation paragraph first.** Body opens with plain English (what the job is,
   where it sits in the run of household maintenance) before trade jargon appears.
8. **Canonical TipTap blocks.** `troubleshooter` for troubleshooters, `infoPanel` for
   callouts, `suppliesCard` for materials and tool lists.

---

## Appendix — v5 content-integration rules

(Inherits unchanged from `docs/tutorial-author.md` v5. Image
two-pass, ProjectSchedule rules, audit rules, common-issues
self-critique pass. The same upload script handles Home &
repair; no changes are required.)
