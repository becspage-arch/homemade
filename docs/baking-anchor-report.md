# Baking anchor batch report

Four Baking RECIPE DRAFTs landed against `/admin/tutorials`
filterable by `categorySlug=baking`. Each one covers a different
sub-category so Rebecca sees the end-to-end shape across the
Baking metadata fields before the pilot-10 batch fires.

## What's in the batch

| Slug | Title | Sub-category | Difficulty | Sources |
|---|---|---|---|---|
| `white-tin-loaf-overnight-cold-proof` | White tin loaf, overnight cold-proof | `bread` | INTERMEDIATE | Beeton 1861 + Acton 1845 + Florence White 1932 |
| `victoria-sandwich-classic` | Victoria sandwich, the classic | `cakes` | BEGINNER | Beeton 1861 + Acton 1845 |
| `shortcrust-pastry-blind-baked-case` | Shortcrust pastry, blind-baked | `pastries` | INTERMEDIATE | Beeton 1861 + Acton 1845 + Florence White 1932 |
| `plain-shortbread-fingers` | Plain shortbread fingers | `biscuits` | BEGINNER | Beeton 1861 + Florence White 1932 |

## Tutorial IDs (for admin access)

- Tin loaf: `cmp6ko8ge0002lgv4drriwx5z`
- Victoria sandwich: `cmp6kpkff0001r8v4iamwcis7`
- Shortcrust: `cmp6kqtl90000rsv4lo9sryxx`
- Shortbread: `cmp6krjgh0000ccv448kdyph7`

All four live as `DRAFT` under the `baking` Category. Visible at
`/admin/tutorials` filtered by `category=baking`.

## Baking metadata coverage across the batch

The four anchors collectively exercise every column the migration
adds. The grid below shows which fields each anchor populates.

| Field | Tin loaf | Victoria | Shortcrust | Shortbread |
|---|---|---|---|---|
| `flourWeightGrams` | 500 | 200 | 200 | 225 |
| `hydrationPercent` | 65 | — | — | — |
| `saltPercent` | 2 | — | — | — |
| `yeastPercent` | 1.4 | — | — | — |
| `levainPercent` | — | — | — | — |
| `bulkFermentMinutes` | 90 | — | — | — |
| `proofMinutes` | 60 | — | — | — |
| `retardingMinutes` | 540 | — | — | — |
| `levainBuildMinutes` | — | — | — | — |
| `laminationFolds` | — | — | — | — |
| `laminationRests` | — | — | — | — |
| `bakeTemperatureCelsius` | 230 | 180 | 190 | 160 |
| `bakeTemperatureNote` | "fan oven; drop to 210°C after 10 minutes" | "fan oven, middle shelf, both tins on the same shelf if there's room" | "fan oven, middle shelf" | "fan oven, middle shelf" |
| `steamMethod` | "water tray on the oven floor for the first 10 minutes" | — | — | — |
| `decoratingTechnique` | — | — | — | — |
| `preFermentType` | NONE | — | — | — |

`laminationFolds` / `laminationRests` / `decoratingTechnique` /
`levainBuildMinutes` / `levainPercent` aren't exercised by the
anchor batch. The pilot-10 should pick at least one laminated
pastry (a rough-puff lamination intro) and one sourdough levain
build to fill those gaps before bulk fill.

## Sources drawn from, per anchor

- **Tin loaf.** Beeton's 1861 tin-baked household loaf as the base
  template. Acton 1845 for the weighted-flour discipline (she was
  the first widely-read British cookery writer to put recipes on
  a scale). Florence White 1932 for the household-tin tradition
  continuing. The 65% hydration and the overnight cold proof are
  modern adaptations attributed in `sourceNotes`.
- **Victoria sandwich.** Beeton's 1861 "plain cakes" chapter for
  the four-quarters method; Acton 1845 for the earlier weighted
  British cake recipes. The name "Victoria" is post-1860s; the
  recipe predates it. Honest attribution per the
  `crediting-public-domain-bakes-to-modern-celebrity-bakers`
  anti-tell.
- **Shortcrust.** Beeton 1861 "Short Crust for Sweet Pastry" for
  the half-fat-to-flour proportion; Acton 1845 for the cold-water
  minimum + rest-before-roll discipline; Florence White 1932 for
  the blind-bake sequence with weighted paper.
- **Shortbread.** Beeton 1861 "Shortbread Cakes" + Florence White
  1932 for the Scottish lineage and the three-two-one proportion.
  The original is butter, sugar, flour — no egg yolk.

## Voice-check pass

All four drafts pass the deterministic `voice-check` gate (exit
codes 0 or 1; no errors after the self-critique rewrites landed).
Per-draft warning counts after the final pass:

| Slug | Errors | Warnings | Notes on warnings |
|---|---:|---:|---|
| `white-tin-loaf-overnight-cold-proof` | 0 | 2 | 2 tricolon warnings, both earning their place: "the flavour deepens, the crumb tightens slightly, and the gluten relaxes" describes three distinct things the overnight retard does; "modern ovens are hotter, modern yeasts work harder, and the fridge gives us a long flavour build" describes three real factors the recipe is adapting around. Per `docs/common-issues.md` § "Tricolons earn their place", left as-is. |
| `victoria-sandwich-classic` | 0 | 0 | Clean. |
| `shortcrust-pastry-blind-baked-case` | 0 | 3 | 3 tricolon warnings, all earning their place: "flatten the dough, wrap in cling film, and refrigerate" + heading "Roll, line, and chill again" + "tear a square…, crumple it into a ball, smooth it out, and press it" — each one is a sequence of distinct actions, not a rhetorical flourish. The recipe is short and a sequence of moves; tricolons read naturally here. |
| `plain-shortbread-fingers` | 0 | 1 | 1 tricolon warning on "three parts butter, two parts caster sugar, three parts flour" — the proportion itself. Cutting one item would falsify the recipe. Left. |

The first-draft voice-check round flagged six errors per draft on
average, all of them em-dash appositive pairs (in `sourceNotes`,
infoPanels, and method paragraphs). The self-critique pass missed
them all on the first pass; the deterministic gate caught them.
The pattern was identical to what `docs/common-issues.md` §
"Em-dash overuse, especially appositive pairs" + "Em-dash pairs
in sourceNotes" already flag — the Baking-specific self-critique
should weight those entries even harder. Adding to
`docs/baking-anti-tells.md` for the pilot-10 batch.

Two other false-positive-shaped warnings surfaced and were
rewritten rather than suppressed:

- **"Anchor" brand-trademark warning** on the word "anchor" used
  to mean the reference weight for a baker's percentages or
  egg-weight recipe. The voice-check rule trips on any case of
  "Anchor" because of the butter brand. Rewritten to "the
  reference weight" / "the flour weight" in both the bread and
  cake anchors. The Baking voice-check extension session should
  consider disambiguation — "anchor" + butter context vs
  "anchor" + measurement context — or move the entry to a
  whole-phrase match ("Anchor butter" rather than bare "Anchor").
- **"Target" brand-trademark warning** on the word "target"
  used to mean the doneness target. Rewritten ("an internal
  probe should read 96°C"; "pale gold is what you're after").

## TipTap-block gaps (for follow-up)

The anchor batch was authored with the existing eight TipTap
blocks plus `troubleshooter` (paragraph, heading, bulletList,
listItem, infoPanel, pullQuote, ingredientsList, troubleshooter,
plus standard text marks). No new blocks required for the four
anchors picked. Three patterns surfaced where a later
Baking-blocks session might want to address:

1. **Baker's percentages panel.** The tin loaf carries the
   hydration / salt / yeast / levain percentages in the
   structured metadata, but also has to repeat them in prose
   ("water at 65% of the flour weight, salt at 2%, yeast at
   1.4%") because the public renderer doesn't surface the
   metadata yet. A dedicated `bakersPercentagesPanel` block
   would pull the values from the metadata at render time so the
   prose can stop repeating them. Especially valuable across the
   ~600 bread tutorials Baking will eventually carry.
2. **Lamination schedule block.** Not exercised by the anchor
   batch (no puff / croissant / Danish anchor picked), but the
   pilot-10 should include a laminated pastry, and laminated
   pastry tutorials want a `laminationSchedule` block with slots
   for each fold + rest. The current H3-per-fold structure works
   but recurs identically across every laminated pastry
   tutorial; a dedicated block would simplify drafting and give
   the public renderer a clean schedule card.
3. **Sugar-stage panel.** Not exercised by the anchor batch (no
   sweets / confectionery anchor picked). When the first
   confectionery tutorial lands, a `sugarStagePanel` block with
   `targetStageName` + `targetCelsius` + safety-line slot would
   serve all the recipes consistently and surface the safety
   voice in the right register.

These are flagged for a follow-up Baking-blocks worker session.
The anchor batch shipped without them.

## What Rebecca should look at first

In order of importance:

1. **The tin loaf's overnight cold-proof timing.** The recipe
   anchors at 8–10 hours of cold retard, with up to 12 as the
   ceiling. The 540-minute (9 hour) figure in `retardingMinutes`
   is the midpoint. If your kitchen runs cooler or warmer than
   the recipe assumes, the ceiling might want to come down or up.
   Read the cold-retard step and the troubleshooter row on
   over-proofed loaves; flag anything that doesn't match how
   you'd write it.
2. **The Victoria sandwich's foundational status.** The recipe
   currently has `foundational: false`. A Victoria sandwich is
   probably the foundational British layer cake — if it should
   carry the foundational-technique badge alongside the recipe
   role, flip the flag. (Note: the `foundational` flag is per
   `project_content_pipeline.md` meant to mark the ~500–700 core
   reference techniques. Whether a recipe can also be
   foundational is a call.)
3. **Shortcrust as a foundational technique.** The shortcrust
   tutorial *is* set `foundational: true`. It's a recipe that
   produces a blind-baked case, but it's also the foundation
   for at least six other recipe types (treacle tart, quiche,
   custard tart, mince pies, jam tart, lemon tart). The
   structured "What fills this case" paragraph lists three
   filling outlines as examples; the intent is that those become
   their own recipes which `subTutorialCard`-reference this one.
   Check the framing reads right.
4. **Shortbread proportion language.** The recipe is written in
   the three-two-one form ("three parts butter, two parts caster
   sugar, three parts flour") which Florence White documents as
   the Scottish historic standard. Modern recipes sometimes give
   the form as 1-2-3 instead (sugar first). The recipe's
   three-two-one matches the lineage I read — confirm if you
   want it reversed.
5. **The sourceNotes register across all four.** Source-citation
   on Baking pulls from three to four named historical books per
   recipe. Read the `sourceNotes` strings as a set; the register
   should feel consistent across the four. If one reads
   academic and another reads casual, that's worth flagging for
   the pilot-10 prompt.

## Anti-tells seeded count

`docs/baking-anti-tells.md` ships with **11 seeded entries**
across four sections:

- **Precision issues (4 entries):** cup-measurement creep,
  "until golden brown" without time + non-colour cue, missing
  critical-temperature precision, vague hydration.
- **Structural issues (3 entries):** recipe-doubles-as-technique
  drift, lamination skip, method without time markers.
- **Voice issues (3 entries):** Bake-Off hype-tent register,
  substitution hand-waving on tuned recipes, no oven-thermometer
  reminder on temperature-sensitive bakes.
- **Metadata issues (2 entries):** `recipe.scalable: true` on a
  recipe that doesn't scale, `baking.preFermentType: "NONE"` not
  set on bread recipes.
- **Source-attribution issues (1 entry):** crediting a
  public-domain bake to a modern celebrity baker.

Three of the entries (cup-measurement creep, missing critical-
temperature precision, Bake-Off register) are flagged
`[needs-voice-check]` — they're deterministic enough that the
Baking voice-check extension worker should pick them up into
`voice-check-lib.ts` (separate session per the scope-out in this
brief).

## What was scoped out

Per the brief's hard scope:

- **No `voice-check.ts` edits.** Bulk cooking sessions are
  invoking it. Baking-specific deterministic bans
  (cup-measurement as primary, missing sugar-stage °C,
  Bake-Off hype) were captured in `docs/baking-anti-tells.md`
  for the drafting prompt's self-critique pass instead.
  Voice-check.ts changes are a follow-up session.
- **No new TipTap blocks.** Three block gaps flagged above for
  a Baking-blocks follow-up session.
- **No pilot-10 batch.** That's the next worker after Rebecca
  reviews the anchors.
- **No bulk fill.** Same — next-next worker.
- **No edits to cooking content** (recipe backlog, ingredient /
  tools master lists). Baking shares both with cooking; no gaps
  spotted that needed adding.
- **No edits to `apps/web/`, `apps/mobile/`, `infra/`.**
- **No `docs/social-strategy/` edits.**
- **No image generation.**
- **No `docs/baking-backlog.md`.** Deferred to a focused backlog
  session — the anchor batch + the authoring prompt + the
  anti-tells are enough scope for one session; backlog drafting
  is substantial work that wants its own.

## In-scope work that was needed beyond the brief

Two pieces of pipeline plumbing landed alongside the deliverables:

1. **`packages/db/scripts/upload-tutorial-types.ts` +
   `upload-tutorial.ts` extended** to accept a new `baking`
   block on `RecipeMetadata` carrying the 17 Baking-specific
   fields. The existing RECIPE / TECHNIQUE / PRACTICE / READING
   paths are unchanged — the change is purely additive. Without
   this, the schema (which now carries the Baking columns)
   couldn't be written from the upload script.
2. **`packages/db/scripts/seed-baking-taxonomy.ts`** added — a
   one-off seed for the `baking` Category row + the eight
   sub-category rows (bread, cakes, pastries, biscuits, pies,
   scones, sweets-confectionery, cake-decorating). The upload
   script never creates Categories, so this needed seeding
   before the anchors could land.

Both changes follow the existing pattern
(`seed-mindset-taxonomy.ts` and the Mindset `practice` block
are the precedents). Both are idempotent — re-running the seed
no-ops, re-running the upload updates in place.

## Master ingredient / tools coverage

Every ingredient slug used by the anchor batch
(`strong-bread-flour`, `plain-flour`, `self-raising-flour`,
`unsalted-butter`, `caster-sugar`, `icing-sugar`, `eggs`,
`baking-powder`, `vanilla-extract`, `yeast-dried`, `water`,
`sea-salt-fine`, `jam`) was already in the master ingredient
table from the Cooking seed.

Every tool slug used (`loaf-tin`, `mixing-bowl-large`,
`mixing-bowl-medium`, `digital-scales`, `bench-scraper`,
`oven-thermometer`, `round-cake-tin-20`, `hand-mixer`,
`whisk-balloon`, `cooling-rack`, `sieve`, `tart-tin`,
`rolling-pin`, `baking-paper`, `baking-beans`,
`square-cake-tin`, `wooden-spoon`) was already in the master
tool table from the Cooking seed.

No new master entity rows needed. Baking shares the cooking
master tables — the brief was right that no Baking-specific
seed is required at this scope.

## Next Baking session, in order

1. **Voice-check CLI extension for Baking bans.** Add the
   `[needs-voice-check]` patterns from
   `docs/baking-anti-tells.md` to `voice-check-lib.ts` as
   deterministic rules. Targets: cup-measurement-as-primary
   in `ingredientsList`, "until golden brown" alone (no time
   AND no non-colour cue paired), missing °C on sugar-stage
   stage names, Bake-Off hype-words ("soggy bottom",
   "showstopper", "next-level", "you won't believe").
2. **`docs/baking-backlog.md`** — a focused worker session to
   draft the ~3,000-entry baking backlog spanning the eight
   sub-categories, mirroring the shape of
   `docs/mindset-backlog.md`.
3. **Baking-blocks gap fill.** Decide whether to ship
   `bakersPercentagesPanel` / `laminationSchedule` /
   `sugarStagePanel` blocks before pilot-10 or after. Worker
   session if before.
4. **Pilot-10 batch with auto-publish flow.** Phase 8 Step 11–12
   pattern. Picks 10 bakes across sub-categories (including the
   laminated pastry and confectionery the anchors didn't
   cover), drafts them through the v1 prompt, voice-checks,
   auto-publishes.
5. **Bulk fill standing pattern** consuming
   `docs/baking-backlog.md` row by row.
6. **Public UI for Baking sub-categories.** Browse pages,
   sub-category routing, the baker's-percentages display, the
   lamination schedule renderer.

The anchor batch is the first concrete content in the Baking
section. Pilot-10 + bulk fill follow once Rebecca's reviewed
these four.
