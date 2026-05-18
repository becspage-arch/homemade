# Sustainability — pipeline-setup notes + open questions

Hand-off notes for the two DRAFT test tutorials shipped in
[2026-05-18 pipeline-setup session]. Self-critique, schema-field
recommendation, open questions for Rebecca to weigh in on.

The two drafts:

- [`packages/db/scripts/drafts/three-bin-hot-compost-system.json`](../packages/db/scripts/drafts/three-bin-hot-compost-system.json)
  — PATTERN under `composting`. Multi-month ProjectSchedule arc
  (turn day 14, turn day 28, harvest day 56–84).
- [`packages/db/scripts/drafts/calculating-loft-insulation-depth.json`](../packages/db/scripts/drafts/calculating-loft-insulation-depth.json)
  — TECHNIQUE under `insulation-and-draughtproofing`. Worked example
  shape; full calculation walked through for a 1970s Leeds semi.

Both saved as `status: DRAFT`. **Neither has a hero attached.** See
"Hero sourcing" below.

---

## Schema decisions

### Added: `Tutorial.approximateCostGbp Int?` + `Tutorial.paybackYears Int?`

Per `feedback_schema_all_fields_upfront.md` — both fields land now
rather than waiting for a backfill. Migration:
`20260626000000_phase_sustainability_pipeline_001`.

Rationale:

- Every solar / insulation / heat-pump / water-tank tutorial wants
  to surface a cost and (where relevant) a payback.
- Both columns drive plausible future filters: "show me cheap
  sustainability upgrades", "show me upgrades that pay back inside
  5 years". Both are sortable.
- Integer-£ (not pennies) because the granularity is
  order-of-magnitude — £40 draught kit, £8000 heat pump. Pennies
  would be false precision.
- Both nullable. Null on every existing row, on every non-
  sustainability category, and on sustainability rows where the
  question doesn't apply (composting, foraging-style reuse).

Test tutorials show both shapes:

- Compost build: `approximateCostGbp: 60, paybackYears: null` —
  cash outlay but no quantifiable financial payback.
- Loft insulation: `approximateCostGbp: 280, paybackYears: 4` —
  both populated, with the assumption stated in body prose.

Indexes: `(type, approximateCostGbp)` and `(type, paybackYears)`.

### NOT added: a new TutorialType value

The brief mentioned multiple shapes — TECHNIQUE / RECIPE / PROJECT
/ GUIDE — but `TutorialType` only carries RECIPE | TECHNIQUE |
PRACTICE | READING | GROWING_GUIDE | REMEDY | HERB_PROFILE | STITCH
| PATTERN. Sustainability content maps onto the existing values:

- **Build-a-thing projects** (three-bin compost, draught-shutter,
  rainwater diverter install) → **PATTERN**. Allows
  `projectSchedule`, matches the precedent
  ([`carved-lime-butter-knife.json`](../packages/db/scripts/drafts/carved-lime-butter-knife.json) — wood-craft PATTERN with multi-day
  schedule). The validator's PATTERN-dispatch only triggers crochet
  / knitting / sewing block checks, so a sustainability PATTERN
  skips them cleanly.
- **Decision / how-to reference** (calculating insulation, choosing
  a heat pump) → **TECHNIQUE**. Same shape used by cooking + wood
  + pottery foundational techniques. `recipe.foundational: true`
  surfaces the badge.

A future `SUSTAINABILITY_PROJECT` / `SUSTAINABILITY_GUIDE` pair may
earn its keep once we see 50+ tutorials' worth of content shape,
but it's premature now. Flagged as an open question below.

### NOT added: new Tool categories

The existing `VALID_CATEGORIES` allow-list in `seed-tools.ts` is
cooking-shaped (knife / pan / pot / oven / mixer / measuring etc.).
Sustainability tools don't fit cleanly. Two options were
considered:

1. Extend `VALID_CATEGORIES` with a `sustainability` category (or
   broader `electrical-tester`, `meter`, `weatherproofing` set).
2. Use `'other'` for every sustainability tool.

Went with option 2 for this session — keeps the change additive
and reversible. A future cross-category tool-taxonomy session can
widen the allow-list without backfilling slugs.

---

## What was seeded

### Subcategories (6)

```
composting
water
solar-and-energy
insulation-and-draughtproofing
waste-reduction
off-grid
```

Maps the category description in `seed-categories.ts` (updated this
session to match).

### Glossary terms (~55)

Pre-loaded in [`seed-sustainability-taxonomy.ts`](../packages/db/scripts/seed-sustainability-taxonomy.ts) — energy
units (kWh, kWp, kW, MW, watt), thermal performance (U-value,
R-value, lambda, thermal bridge, thermal mass), regulation (Part L,
EPC, MCS, SEG, PAS 2035, BUS), solar (PV, thermal, inverter,
immersion diverter, battery), heat pumps (COP, SCOP, flow
temperature), insulation specifics (CWI, SWI, suspended floor,
draught stripping, mineral wool, sheep wool, PIR, VCL), composting
(hot, cold, C:N, browns/greens, leachate, bokashi, wormery, leaf
mould), water (rainwater harvesting, greywater, butt, drip
irrigation, swale), carbon (embodied, operational, grid intensity),
economics (payback, lifetime saving), waste (embodied water,
circular economy, kerbside).

Garden-overlap terms (`hot-compost`, `cn-ratio`, etc.) are seeded
with sustainability scope. If the garden seed has already claimed a
slug, the script logs a `[conflict]` and leaves the first claimant's
scope intact (the renderer accepts category-scoped or global
definitions).

### Tools (15)

Sustainability-specific: compost-thermometer, compost-aerator,
soil-moisture-meter, humidity-meter, thermal-imaging-camera,
energy-monitor-clamp, foam-strip-gun, draught-excluder-strip,
letterbox-brush-strip, silicone-sealant-gun, rainwater-diverter-kit,
tap-flow-restrictor.

Shared construction: tape-measure, cordless-drill, handsaw. Seeded
here because no prior pipeline added them, and future Home & repair
will need them too. All tagged `category: 'other'`.

---

## What's NOT done

- **`pipelineStatus` stays `NOT_READY`.** The flip script
  [`flip-sustainability-ready.ts`](../packages/db/scripts/flip-sustainability-ready.ts) exists but was deliberately
  not run. Autopilot will not pick sustainability up until you flip
  manually.
- **The taxonomy seed was not run.** The seed exists, dry-runs
  cleanly, but the actual DB write is yours to trigger when you're
  comfortable.
- **The two DRAFT test tutorials have no hero image.** See "Hero
  sourcing" below.
- **No category-specific anti-tells doc** (`docs/sustainability-anti-tells.md`)
  yet — that lands after the pilot batch of 10 surfaces recurring
  voice problems.
- **No deterministic voice-check extension.** The cross-category
  `voice-check` CLI runs the generic banned-phrase / em-dash /
  tricolon checks. The sustainability-specific lifestyle-aspirational
  scan + numbers-present check + assumption-stated check is in the
  author prompt's self-critique pass but not yet automated.

---

## Hero sourcing

Both test tutorial JSONs omit the `hero` block. The pre-existing
pottery-ceramics drafts ([`wedging-clay-spiral-method.json`](../packages/db/scripts/drafts/wedging-clay-spiral-method.json),
[`pinch-pot.json`](../packages/db/scripts/drafts/pinch-pot.json)) also omit hero; that's the established
shape for committed drafts. The hero gets sourced and attached when
the upload script runs the two-pass orchestrator on first upload.

For the compost tutorial, the orchestrator should reach for:

- Unsplash / Pexels first — there's plenty of practical-skills
  compost-bin photography.
- Wikimedia second — for the build-diagram-style hero if a real
  bin photo doesn't verify.

For the loft insulation tutorial:

- Wikimedia first is probably stronger — the technical-diagram
  shape suits this tutorial.
- Unsplash / Pexels second — a photo of a loft with rolls being
  laid would also work.

The orchestrator's verification step needs the right rejection
rules for sustainability — flagged as an open question.

---

## Open questions for Rebecca

1. **TutorialType expansion?** Use existing PATTERN / TECHNIQUE
   indefinitely, or add `SUSTAINABILITY_PROJECT` / `SUSTAINABILITY_GUIDE`
   once the pilot batch settles? Mild preference for sticking with
   the existing values — the validator already handles them cleanly
   and the PATTERN/TECHNIQUE split maps to projectSchedule/no-
   projectSchedule which is the actual functional distinction.

2. **Cost / payback granularity sufficient?** Both fields are `Int?`
   in whole £ / whole years. A future SaaS-payback-style tool might
   want decimal years (3.3 vs 4) or pound-and-pence. Sticking with
   integers for now because the inputs are order-of-magnitude
   anyway. Easy migration to `Float?` later if needed.

3. **Sustainability category description.** Updated this session to
   match the six subcategories. Old: "Solar, water reduction,
   composting, waste reduction, energy efficiency, and off-grid
   basics." New: "Composting, water, solar and energy, insulation
   and draughtproofing, waste reduction, and off-grid." Happy to
   tweak the wording if you'd phrase any of those subcat names
   differently.

4. **Tool category widening.** Sustainability tools are all
   `category: 'other'` because the master Tool table's
   `VALID_CATEGORIES` is cooking-shaped. Do we want a separate
   pipeline-setup session to widen the allow-list (electrical-
   tester, meter, weatherproofing, garden-tool, retrofit-tool)
   before more pipelines pile rows into `'other'`? Not urgent.

5. **Image-sourcing rejection rules for sustainability.** The
   orchestrator's free-source chain is wired up
   ([`apps/web/src/lib/image-sourcing/orchestrator.ts`](../apps/web/src/lib/image-sourcing/orchestrator.ts)) but the
   verify-callback that rejects "smiling-family-with-solar-panels"
   stock photography in favour of installation-grade documentary
   photos isn't extended for sustainability yet. Worth a small
   follow-up session that audits the first 20 sustainability
   heroes after the first batch publishes.

6. **USDA as an image source?** The original brief mentioned USDA
   for composting / soil imagery, but USDA isn't wired into the
   orchestrator (the available free sources are Unsplash, Pexels,
   Wikimedia, Pixabay, Flux Schnell). USDA's public-domain image
   library would be a strong addition for composting + soil
   tutorials. Wiring a USDA search source is small but additive —
   flag as a separate pipeline addition, not gating sustainability
   launch.

7. **`approximateCostGbp` index pre-launch.** Added the
   `(type, approximateCostGbp)` and `(type, paybackYears)` indexes
   in the migration. Worth it now even with zero non-null rows? I
   think yes — adding the index later is cheap, but landing it now
   means the first query path is index-supported from day one.

8. **Sustainability-specific voice-check extension.** Worth
   building a deterministic CLI scan for the banned lifestyle-
   aspirational phrase list (`slow-living`, `small steps`,
   `every choice`, etc.) so authors can't ship a lifestyle-
   register draft accidentally. Not blocking the pipeline but
   worth its own small session.

---

## Self-critique on the test tutorials

### Three-bin compost (PATTERN)

- ProjectSchedule arc tests cleanly — three steps at offsets 14 /
  28 / 70 days, all RAIL_CARD except the harvest day which goes
  HERO. Demonstrates the multi-month-arc shape the brief asked
  for.
- Voice — practical-installer register throughout. No lifestyle
  language. Lead with numbers (1 m³ thermal mass, 55–65°C target,
  6 m³/year throughput). Names a failure mode in advance (heap
  not heating → almost always too few greens or too dry).
- Materials list is honest (HT-stamp-only pallet rule, never MB;
  no brand names; cost given as ~£60 in the column, not in body
  prose).
- Glossary coverage: 6 terms registered, all referenced inline
  via `glossaryTooltip` mark. `ht-stamp-pallet` is a new term
  (not in the pre-seed) and was inlined.
- Cost / payback: `60 / null`. Body explains why payback is NULL
  in the "What this saves" infoPanel.
- Tool slugs: compost-thermometer, compost-aerator, tape-measure,
  cordless-drill, handsaw, spirit-level. All seeded
  (spirit-level was already in the master Tool table; the rest
  ship with this seed).
- Length: ~2400 words. Within the medium-PATTERN band.

### Loft insulation calculation (TECHNIQUE)

- Decision / worked-example shape, no projectSchedule (TECHNIQUE
  rejects schedules at validation).
- Worked example is fully numerical — 6.5 × 7.5 m loft, 0.044
  lambda, 0.16 target U-value, 175 mm top-up, 7 packs, £280, 3.3
  years DIY payback.
- Voice — numbers-led throughout. Honest about what the calc
  doesn't cover (room-in-roof, vermiculite, damp lofts) and
  explicit "call a professional when..." section.
- Cost / payback: `280 / 4`. Assumptions stated in the
  infoPanel ("at the 2025/26 cap rate of 6 p/kWh").
- Glossary coverage: 7 terms registered, all referenced inline.
  Cross-references mineral wool, thermal bridge, U-value, lambda,
  Part L, EPC.
- No retailer / brand names. Generic mineral wool, generic pack
  dimensions, generic loft-leg description.
- Length: ~2200 words. Within the long-TECHNIQUE band.

### Both

- Source notes cite gov.uk Part L, Energy Saving Trust, Garden
  Organic / RHS, manufacturer technical data sheets as reference.
  No prose copied verbatim from any of them.
- The deterministic voice-check CLI hasn't been run (the test
  tutorials are intended for editorial review first); the
  self-critique pass against the author prompt's checklist is
  noted complete here in lieu.

---

## Hand-off summary

Pipeline-setup deliverables complete. Sustainability remains
`NOT_READY`; flip is yours when you've reviewed the two test
tutorials and the author prompt. Nothing has run against the
database from this session — the seed, the flip script, and the
test-tutorial uploads all sit committed and waiting.
