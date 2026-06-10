# Garden / Microgreens authoring

Canonical input for any worker session that drafts a tutorial under
`garden/microgreens`. Tray-grown seedlings cut at the cotyledon-to-
first-true-leaf stage. Indoor, year-round, high yield per square
metre. A reliable beginner-to-grow + culinary-leverage crop.

## Status

`SubCategory.autopilotEnabled = true` for `garden/microgreens`.

## Pre-read (MANDATORY)

- `docs/garden-author.md` umbrella.
- `docs/voice-spec-2026-05-21.md`, `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`, `docs/common-issues.md`.

## Scope (what belongs here)

- Brassica microgreens: broccoli, kale, mustard, radish, rocket,
  cabbage, kohl rabi.
- Allium microgreens: leek, onion, chive (slower; longer cycle).
- Pea + sunflower shoots (the "salad-shoot" subset).
- Herb microgreens: basil, coriander, dill, fennel, chervil
  (slower).
- Beet + chard microgreens.
- Buckwheat shoots.
- Radish + mustard families for fast cycles.
- Wheatgrass + barleygrass (juiced, not eaten whole; cross-link to
  Herbal for medicinal claims).

## Scope (what does NOT belong here)

- Sprouts (mung, alfalfa, lentil — grown in a jar, no soil, eaten at
  the cotyledon stage with seed-coat attached) → `indoor-gardening`.
- Salad-leaf cut-and-come-again (lettuce, rocket, salad mix grown to
  baby-leaf stage) → `vegetables`.
- Foraged wild salads (wild garlic shoots, three-cornered leek) →
  `foraging`.
- Therapeutic claims on wheatgrass juice or microgreen nutrient
  density beyond standard food-science statement → Herbal (no health
  claims here).

## Sub-topic mix

- `growing` carries most weight. Microgreens are tray-grown 7 to 21
  day cycles; the whole guide fits in one body.
- `sowing` for crop-specific sowing density (radish dense vs
  coriander spread).
- `harvesting` for the cut stage (cotyledon expanded, first true
  leaf forming, scissors across the tray).
- `variety-selection` for which microgreens give the best flavour /
  yield / colour combinations (rainbow microgreen trays).

## Region-aware metadata

- `garden.plantingMonths` — year-round indoor; populate with all
  twelve months on most guides.
- `garden.harvestMonths` — also year-round; populate all twelve.
- `garden.containerFriendly` — true (tray is the container).
- `garden.indoorFriendly` — true. Microgreens are an indoor crop.
- `garden.regionsApplicable` — universal; light + warmth are
  controllable indoors. Populate `['UK', 'EU', 'US_NORTH', 'US_SOUTH',
  'AU_NZ', 'ZA']` honestly because the schedule does work everywhere.
- `frostSensitivity`: not relevant (indoor).
- `dayLengthSensitive`: false in general; supplementary lighting
  (LED grow light) carries through dark UK winters.

## Critical techniques

- `sowing-microgreen-tray`
- `microgreen-blackout-stack` (the pressed-tray-on-top method to
  trigger straight stems)
- `bottom-watering`
- `microgreen-cutting-with-scissors`
- `tray-rinse-between-cycles`
- `damping-off-prevention-microgreen`

`techniqueSlugs[]` extends with: `pre-soak-large-seed` (pea,
sunflower), `seed-rinse-pre-sow`, `microgreen-medium-coir`,
`microgreen-medium-compost`, `microgreen-medium-hemp-mat`,
`microgreen-grow-light-led`, `microgreen-flush-and-go-cycle`,
`microgreen-tray-stack-rotation`.

## Materials master list

- **Trays:** seed trays (with + without drainage holes for stacking);
  a typical microgreen kit uses 1010 trays (10 inch by 10 inch, or
  25 cm by 25 cm; cite the UK metric measurement as canonical).
- **Growing medium:** coir block (rehydrated), seed compost, hemp
  microgreen mat, jute pad.
- **Seed:** untreated, microgreen-grade where possible (no fungicide
  coating). Standard vegetable seed works for many crops; pea +
  sunflower shoot seed is sold separately.
- **Light:** windowsill (south-facing in UK winter is borderline),
  LED grow light (full-spectrum, 25 to 50 W per tray).
- **Tools:** spray bottle (top-water at the seedling stage), kitchen
  scissors, sharp knife, salad spinner.

## Output contract

`subCategorySlug: 'microgreens'`. `type: 'GROWING_GUIDE'`. Garden
block per umbrella.

## Body shape

Per umbrella. Microgreens-specific notes:

- Opening paragraph names the microgreen, places it (windowsill /
  countertop / LED rack), states the cycle length (7 to 21 days) and
  the harvest method (scissors across the tray).
- "Choosing a position" H2: light source + ambient temperature.
- "Through the season" H2 collapses to a tray-cycle narrative: day
  0 sow, day 2 to 4 blackout, day 5 light, day 7 to 21 cut.
- `troubleshooter` covers tray failures: damping off, mould (high
  humidity, no airflow), uneven germination (dry tray edges,
  uneven sowing), leggy seedlings (insufficient light), bitter
  flavour (over-mature, harvest earlier).

## Voice rules (microgreens-specific additions)

- **No nutritional density claims** ("40 times more vitamin X").
  Studies vary; the claim is contested. State that microgreens are
  a fresh, flavour-dense, fast-cycle salad ingredient and stop
  there.
- **No wheatgrass-juice therapeutic claims.** Cross-link to Herbal
  if the reader wants the medicinal angle; the growing guide stops
  at "harvest at the second-leaf stage, juice within 24 hours of
  cutting."
- **Tray sizes in metric.** 25 cm by 25 cm is the canonical UK
  microgreen tray size; US 1010 (10 inch) is roughly equivalent.
  Mention the US alias once in prose.
- **No "superfood".** Word-precision rule applies.
- **Untreated seed matters.** Standard vegetable seed often carries
  a thiram or fungicide coating not safe for cotyledon-stage eating.
  Name this.

## Sources (microgreens tilt)

- **UMass Extension microgreens guides** (open-access, US extension).
- **Cornell + Penn State extension microgreens material**.
- **Royal Horticultural Society indoor growing pages**.
- **University trial data on microgreen-vs-mature-leaf nutrient
  comparisons** (cite, don't paraphrase as fact).
- **Pre-1928 garden journals** for historical salad-shoot precedent.

Microgreens as a named category is recent (post-1980 US); historical
sources will be thin and many guides will set `sourceType:
"SYNTHESISED"`.

## Length guidance

| Sub-topic | Word count |
|---|---|
| Single-crop microgreen guide (radish, broccoli, pea) | 800 to 1,200 |
| Multi-crop "rainbow tray" guide | 1,200 to 1,800 |
| System setup guide (LED rack, rotation schedule) | 1,500 to 2,200 |

## Self-critique pass (microgreens additions)

1. No nutritional-density "X times more" claims.
2. Untreated seed named on guides for crops where standard treated
   seed is common.
3. Tray sizes in metric first.
4. Damping off + mould named in troubleshooter on at least one
   "what can go wrong" entry per guide.
5. Cycle length stated (7 to 21 day range, or specific to the crop).

## Worked example (compact)

```json
{
  "slug": "growing-radish-microgreens",
  "title": "Growing radish microgreens",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "microgreens",
  "difficulty": "BEGINNER",
  "garden": {
    "plantSlug": "radish",
    "subTopic": "growing",
    "plantingMonths": ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
    "harvestMonths": ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
    "containerFriendly": true,
    "indoorFriendly": true,
    "regionsApplicable": ["UK", "EU", "US_NORTH", "US_SOUTH", "AU_NZ", "ZA"]
  },
  "techniqueSlugs": ["sowing-microgreen-tray", "microgreen-blackout-stack", "bottom-watering", "microgreen-cutting-with-scissors"],
  "criticalTechniques": ["microgreen-blackout-stack", "bottom-watering"]
}
```

## Image policy

NEVER generate images. Image worker sources verified hero per
`feedback_image_strategy.md`.

## See also

- `docs/garden-author.md` umbrella.
- `docs/garden-indoor-gardening-author.md` for sprouts (jar method)
  and other indoor-only crops.
- `docs/garden-vegetables-author.md` for baby-leaf and full-stage
  crops.
