# Herbal anchor batch — DRAFT report

Five anchor entries authored as part of `phase_herbal_pipeline_scaffold`
(2026-05-17). All five sit as JSON briefs in `docs/herbal-anchor-briefs/`
and have not yet been uploaded — the migration, the master tables, and
the seed scripts need to be applied first, and Rebecca's review on the
pipeline approach comes ahead of any DB writes.

## What landed

| Slug | Type | Sub-cat | Difficulty | Words (body) | Status |
|---|---|---|---|---|---|
| `peppermint-tea-for-indigestion` | REMEDY | digestive | BEGINNER | ~1,050 | DRAFT brief |
| `calendula-salve-for-skin` | REMEDY | skin | INTERMEDIATE | ~1,400 | DRAFT brief |
| `chamomile-profile` | HERB_PROFILE | materia-medica | BEGINNER | ~1,650 | DRAFT brief |
| `elderberry-profile` | HERB_PROFILE | materia-medica | BEGINNER | ~1,950 | DRAFT brief |
| `when-not-to-use-home-herbal-remedies` | READING | foundations | BEGINNER | ~1,100 | DRAFT brief |

Word counts are approximate (counted against the body prose, not the
JSON wrappers, ingredient names, or tool slugs).

## Spread

- **2 × HERB_PROFILE** — chamomile (THE western herbal canonical herb)
  and elderberry (cold-season, accessible). Both under
  `sub-categorySlug: "materia-medica"`.
- **2 × REMEDY** — peppermint tea (simple single-step infusion) and
  calendula salve (compound oil-then-salve, with a probe-thermometer
  beat to surface). The mix tests both ends of the difficulty curve
  the pipeline supports.
- **1 × READING** — "When NOT to use home herbal remedies", under
  `sub-categorySlug: "foundations"`. The article the publication
  recommends every herbal-section reader meets first. Drafted as the
  optional fifth from the worker brief — included because it lets the
  voice block surface in three places (REMEDY safety panel, HERB_PROFILE
  safety panel, READING body) and proves the `type === "READING"`
  path on a herbal entry (no `practice` block, no `recipe` block, no
  `herbal` block — just body).

## Sources cited

Each entry surfaces its primary references in `sourceNotes`:

- **peppermint-tea-for-indigestion** — Maud Grieve (1931) + EMA HMPC
  monograph on *Mentha × piperita folium* (2008).
- **calendula-salve-for-skin** — Maud Grieve (1931), King's American
  Dispensatory (Felter & Lloyd, 1898), EMA HMPC monograph on
  *Calendulae flos* (2008).
- **chamomile-profile** — Grieve, Culpeper (1652), King's American
  Dispensatory (1898), EMA HMPC monograph on *Matricaria flos*
  (2015), WHO Monograph on Selected Medicinal Plants Volume 1
  (1999).
- **elderberry-profile** — Grieve, Culpeper, EMA HMPC monograph on
  *Sambuci fructus* (2014), Cochrane and PubMed open-access reviews
  of elderberry-syrup clinical trials (2019, 2021).
- **when-not-to-use-home-herbal-remedies** — `SYNTHESISED` source
  type; the framing is the publication's own, drawing on NHS 111
  triage, British Red Cross first-aid public-domain guidance, EMA
  HMPC safety summaries, and the conservative public guidance of
  NIMH / AHG.

All public-domain or open-access. No modern celebrity-herbalist
attributions; per `herbal-anti-tells.md` § "Crediting a public-
domain remedy to a modern named herbalist" `[block]`, those are
secondary at best, never primary.

## Safety-block coverage

The five anchors between them surface every voice-rule the pipeline
relies on at least once:

- The canonical disclaimer ("Not medical advice…") — in every
  REMEDY and HERB_PROFILE safety `infoPanel(tone: "warning")`,
  plain prose, near the top of the body.
- Drug-interaction prose — peppermint reflux note (mild), calendula
  Asteraceae allergen, chamomile mild-sedative-potentiation,
  elderberry autoimmune + diabetes / cardiac note. The St John's
  wort drug-interaction shape (the multi-drug warning) will surface
  in a later anchor or pilot batch — none of the anchors here are
  for SJW.
- Pregnancy / breastfeeding / paediatric — every safety panel names
  the relevant stages with the master herb's flag in plain prose.
- "When NOT to use this remedy" — every REMEDY ends with the
  section, with red-flag text from the related `Condition` master
  row.
- Plant-identification responsibility — surfaced explicitly in
  elderberry-profile (the dwarf-elder / mountain-ash / nightshade
  lookalike trio) and noted in chamomile-profile (Matricaria vs
  scentless mayweed).
- "Natural means safe" undertone — actively avoided across all five
  anchors. The voice stays conservative.

## TipTap blocks used

Across the five anchors:

- `paragraph` — universal.
- `heading` (level 2 / 3) — section + sub-section structure.
- `infoPanel` (tone: `warning`) — the canonical safety block, used
  on every REMEDY and HERB_PROFILE.
- `ingredientsList` — used on both REMEDY anchors (peppermint,
  calendula).
- `glossaryTooltip` mark — used on the entries in `glossaryTerms[]`
  on the two REMEDY and the two HERB_PROFILE anchors (the READING
  carries no glossary terms — by design, it's foundational prose).
- `troubleshooter` — both REMEDY anchors carry one (peppermint
  3 items, calendula 4 items).
- `subTutorialCard` — not used in this anchor batch. The first
  cross-references will land in the pilot batch (calendula salve →
  calendula profile when the profile lands, elderberry profile →
  elderberry syrup when the syrup lands, etc.).

## TipTap block gaps to log

No new TipTap blocks needed for the anchor batch. The herbal
pipeline reuses every block the cooking and baking pipelines
already ship. If the pilot batch surfaces a gap (a `safetyTable`
or `interactionMatrix` block, perhaps), it will be noted in the
pilot report.

## Voice-check status

Voice-check has not been run on the anchor JSON yet. The deterministic
voice-check CLI gates uploads; until Rebecca approves the pipeline
shape and the migration is applied, the anchors sit as DRAFT briefs
on disk only. When the pilot batch lands, the herbal-specific
voice-check extension will be authored alongside (entries marked
`[needs-voice-check]` in `docs/herbal-anti-tells.md` are the
candidate rules to add).

Manual-eye-test self-critique against `docs/herbal-anti-tells.md`
has been done for every anchor:

- Therapeutic-claim verbs — none present. The strongest verb in any
  body is "supports". The traditional frame ("traditionally taken
  for…", "the action western herbalists draw on") carries the rest.
- Canonical disclaimer — present in every REMEDY + HERB_PROFILE,
  inside `infoPanel(tone: "warning")`, plain prose near the top of
  the body. The READING surfaces the disclaimer in its own paragraph
  near the top.
- Pregnancy / breastfeeding / paediatric — named per the master
  herb's flags in plain prose.
- Drug interactions — named per the master herb's `not-with-*`
  flags in plain prose. None of these anchors involve a herb with
  the full SJW-style interaction stack; that one will land in a
  later batch.
- Dosing — both REMEDY anchors name amount per dose, frequency, and
  course length.
- Storage — both REMEDY anchors name container, location, shelf
  life.
- Red flags — both REMEDY anchors carry "When NOT to use this
  remedy" sections with the master condition's `redFlagsRequireDoctor`
  text surfaced verbatim. The READING is the longest red-flag
  treatment in the batch.
- Em-dashes — every body uses em-dashes as terminal-clause introducers
  ("the kitchen norm — Maud Grieve calls it the wound-herb…"). No
  appositive em-dash pairs (`— text —`).
- Tricolons — none in the bodies. (The shared cross-category
  audit rule for tricolons is enforced by the deterministic
  voice-check; nothing here would trip it.)

## Master-table additions made

The anchor briefs reference ingredients and tools that didn't yet
exist in the master tables. Added to `data/ingredients.ts`:

- `dried-chamomile-flowers`
- `dried-peppermint-leaves`
- `dried-calendula-flowers`
- `dried-elderberries`
- `beeswax-pellets`
- `vodka-40-percent`

Added to `data/tools.ts`:

- `teapot`
- `tea-infuser`
- `double-boiler`
- `dropper-bottle-amber`
- `salve-tin`
- `thermometer-probe`
- `funnel-small`
- `maceration-jar`

All additions follow the same shape as the existing master rows.
`seed-ingredients.ts` and `seed-tools.ts` will pick them up on the
next idempotent run.

## What's next

1. Rebecca reviews the migration shape (`Herb` + `Condition` +
   `HerbConditionUse` + Tutorial columns + `TutorialType` enum
   additions) and the authoring prompt voice.
2. After review, the migration applies + the seed scripts run +
   the anchor batch uploads via `upload-batch.ts` against the five
   JSON briefs.
3. Rebecca sets the `herbal-medicine` Category's `pipelineStatus`
   to `READY` once she's signed off the anchor batch as live.
4. The pilot batch of 10 (mixed REMEDY / HERB_PROFILE across the
   sub-categories the anchors didn't cover — respiratory,
   nervous-system, immune-support, womens-health,
   mental-emotional, musculoskeletal) follows, with the herbal-
   specific voice-check extension authored alongside as
   `[needs-voice-check]` entries from `docs/herbal-anti-tells.md`
   land into `voice-check.ts`.

`BUILD_PROGRESS.md` Herbal row will be updated once Rebecca approves
the anchors as worth landing — the row currently says "not started",
which matches the current state of the live library.
