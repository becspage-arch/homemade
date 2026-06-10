# Garden / Tools and equipment authoring

Canonical input for any worker session that drafts a tutorial under
`garden/tools-equipment`. Hand tools, power tools, maintenance,
storage, sharpening. Choosing kit, looking after it, when to upgrade.

## Status

`SubCategory.autopilotEnabled = true` for `garden/tools-equipment`.

## Pre-read (MANDATORY)

- `docs/garden-author.md` umbrella.
- `docs/voice-spec-2026-05-21.md`, `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`, `docs/common-issues.md`.

## Scope (what belongs here)

- Hand tools: spade (digging, border, lady's), garden fork, hand
  fork, trowel, dibber, hori-hori, hoe (Dutch / draw / onion /
  oscillating / collinear), rake (soil + leaf), secateurs (bypass,
  anvil, ratchet), long-arm loppers, pruning saw, garden knife,
  budding knife, scissors, snips.
- Power tools: hedge trimmer (electric / battery / petrol),
  lawnmower (rotary / cylinder / electric / battery / petrol),
  strimmer / brushcutter, leaf blower, chainsaw basics (safety only;
  full chainsaw work out of scope without arborist certification),
  shredder.
- Greenhouse + propagation: heated propagator, cold propagator,
  thermostat, grow light (LED), max-min thermometer, pH meter, EC
  meter (cross-link to `hydroponics`).
- Carrying + container: wheelbarrow, garden trug, kneeler, gardening
  gloves (rigger, rose, latex-coated).
- Watering: watering can (rose + fine rose), seep hose, drip
  irrigation, sprinkler, water butt, rainwater diverter, soak hose.
- Storage: shed, tool rack, tool wall, mower service stand.
- Maintenance: sharpening (whetstone, file), oiling, cleaning,
  sap removal, blade replacement.
- Choosing kit: what beginner needs (the 7 essentials), what to
  upgrade later, what to skip.

## Scope (what does NOT belong here)

- Tractors, large agricultural machinery → out of scope.
- Branded affiliate-style "best of" lists → not allowed under voice
  rules.
- Studio (chart / pattern) tools — not Garden.

## Sub-topic mix

- `growing` for system / kit guides ("the 7-tool starter kit",
  "setting up your tool shed").
- `season-extension` collapses to "tool of the season" guides
  (kit for spring sowing; kit for autumn pruning).
- `variety-selection` for "which secateurs", "which spade",
  comparison guides (no brand-pin endorsement).

## Region-aware metadata

- `garden.plantingMonths` — empty unless the tool's seasonal use
  matters (sharpening before pruning season is November).
- `garden.harvestMonths` — empty.
- `garden.containerFriendly` — null.
- `garden.indoorFriendly` — false for outdoor tools; true for
  greenhouse / propagation kit.
- `garden.regionsApplicable` — broad. Tool principles travel.

## Critical techniques

- `cleaning-tools-after-use`
- `sharpening-secateurs-with-whetstone`
- `sharpening-spade-with-file`
- `oiling-wood-handle-linseed`
- `lubricating-secateur-pivot`
- `lawnmower-blade-removal-and-sharpen`
- `chainsaw-chain-tension-check` (basic safety + maintenance only;
  full operating skill out of scope)
- `tool-storage-rust-prevention`

`techniqueSlugs[]` extends with: `secateur-bypass-vs-anvil-choice`,
`spade-handle-length-by-user-height`, `wheelbarrow-load-balance`,
`gloves-by-task`, `hori-hori-edge-maintenance`,
`pruning-saw-tooth-set`, `dutch-hoe-shaft-angle`,
`watering-can-rose-coarse-vs-fine`, `seep-hose-pressure-set`,
`grow-light-distance-by-crop`, `cold-frame-vent-management`,
`shed-organisation-zone-by-task`, `tool-budget-7-essentials`.

## Materials master list

- **Sharpening:** whetstone (combination 1000 / 6000 grit), file
  (12-inch mill file for spade; 6-inch needle file for
  secateurs), honing guide, oil for whetstone.
- **Maintenance:** light machine oil, raw linseed oil (handles),
  beeswax-and-linseed mix, wire brush (rust), white spirit (sap
  removal), penetrating oil (seized pivot).
- **PPE:** safety glasses (pruning), ear defenders (mower /
  strimmer), gloves (rigger / cut-resistant for power-tool work),
  steel-toe wellies, dust mask (potting compost — Legionella in
  bagged compost is a real safety note).
- **Hardware:** replacement secateur blade, mower blade, chainsaw
  chain, oil filter.

## Output contract

`subCategorySlug: 'tools-equipment'`. `type: 'GROWING_GUIDE'`. Garden
block per umbrella. `plantSlug` is a representative plant for any
tool-against-plant guide (secateurs comparison uses rose pruning as
the worked example) — note the constraint in the brief.

## Body shape

Per umbrella with adaptations:

- Opening paragraph names the tool / kit, places it (the UK garden
  shed / allotment box / windowsill rack), states the task it does
  in plain English.
- "Choosing the tool" H2 (in place of "Choosing a position"):
  factors that matter for the choice (handle length, blade type,
  weight, budget).
- "Setting up" H2 (where assembly / setup matters — propagator
  thermostat calibration, wheelbarrow inflation, drip irrigation
  zone planning).
- "Using" H2: how to use the tool well (cleanly + safely).
- "Maintaining" H2: cleaning cadence, sharpening cadence,
  storage method.
- `troubleshooter` covers tool failures: dull blade (sharpen),
  seized pivot (oil), rust spots (clean + oil), broken handle (re-
  helve or replace).

## Voice rules (tools-equipment-specific additions)

- **No brand-pin endorsement.** Mention brand only when the
  brand is generic identification (Felco for bypass secateurs;
  Wilkinson Sword for stainless tools; Opinel for knives) — factual,
  not affiliate-style.
- **Budget tier stated.** "Beginner kit fits inside £100; the
  upgrade-when-ready tier sits around £250; serious kit costs more
  but lasts a generation."
- **No "tool-snobbery" register.** Cheap tools work; expensive tools
  often last longer. State both.
- **No financial outcomes** (per the umbrella). Don't quote shop
  prices in the body. The budget tier above is a range, not a price.
- **Sharpening cadence specific.** "Sharpen secateurs every 50 to
  100 cuts in heavy use; before storage at end of season; whenever
  you feel them crushing rather than slicing."
- **PPE in one inline line** per tool. "Power-tool work uses ear
  defenders and safety glasses." Single line.
- **Legionella in bagged compost** is a real-world UK safety note
  — mention once on guides where bagged compost is opened indoors.
- **Tetanus is a real-world soil safety note** — mention once on
  guides where the reader is bare-handed in soil after a cut. Single
  line.

## Sources (tools-equipment tilt)

- **RHS tools + equipment pages** for current UK guidance.
- **Which? Gardening reviews** — cite as one independent voice
  (note: paywalled; cite a publicly-available summary or RHS
  equivalent).
- **Old UK gardening manuals (Mrs Loudon, Mrs Beeton)** for
  historical tool culture.
- **Sissinghurst tool inventory archives (where PD)** for
  historical tool comparison.
- **HSE garden tool safety guidance** (UK Health and Safety
  Executive for power-tool basics).

Most guides will lean on synthesised guidance with a small set of
cited references.

## Length guidance

| Sub-topic | Word count |
|---|---|
| Single-tool short guide (sharpening secateurs) | 600 to 900 |
| Multi-tool comparison guide (which spade for the UK clay garden) | 1,000 to 1,500 |
| Kit guide (the 7-tool starter; setting up the shed) | 1,500 to 2,500 |

## Self-critique pass (tools-equipment additions)

1. No brand-pin endorsement; brands as factual identification only.
2. Budget tier stated as a range, not a price.
3. No financial outcomes (no shop prices).
4. Sharpening cadence stated specifically.
5. PPE in one inline line per tool that needs it.
6. Legionella + tetanus safety lines present where applicable.
7. No tool-snobbery register.

## Worked example (compact)

```json
{
  "slug": "sharpening-secateurs",
  "title": "Sharpening secateurs (bypass and anvil)",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "tools-equipment",
  "difficulty": "BEGINNER",
  "garden": {
    "plantSlug": "rose",
    "subTopic": "growing",
    "containerFriendly": null,
    "indoorFriendly": false,
    "regionsApplicable": ["UK", "EU", "US_NORTH", "US_SOUTH", "AU_NZ", "ZA"]
  },
  "techniqueSlugs": ["sharpening-secateurs-with-whetstone", "lubricating-secateur-pivot", "cleaning-tools-after-use"],
  "criticalTechniques": ["sharpening-secateurs-with-whetstone"]
}
```

## Image policy

NEVER generate images. Image worker sources verified hero per
`feedback_image_strategy.md`. Tool comparison images may use
public-domain product illustrations after licence verification.

## See also

- `docs/garden-author.md` umbrella.
- `docs/garden-seasonal-care-author.md` for the maintenance cycle.
- `docs/garden-hydroponics-author.md` for grow-light + pH-meter
  choice in indoor systems.
