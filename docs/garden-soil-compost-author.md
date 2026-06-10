# Garden / Soil and compost authoring

Canonical input for any worker session that drafts a tutorial under
`garden/soil-compost`. Soil testing (pH, nutrient, texture), hot and
cold composting, leaf mould, green manures, mulching, no-dig bed
maintenance. The cross-cutting fertility sub-cat.

## Status

`SubCategory.autopilotEnabled = true` for `garden/soil-compost`.

## Pre-read (MANDATORY)

- `docs/garden-author.md` umbrella.
- `docs/voice-spec-2026-05-21.md`, `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`, `docs/common-issues.md`.

## Scope (what belongs here)

- Soil testing: pH (kit + meter + lab), NPK + trace nutrient (lab
  test), texture (jar test, ribbon test).
- Composting: hot pile (Berkeley method, 18-day style), cool pile
  (the gradual heap), bokashi (anaerobic fermenter), worm bin
  (vermicomposting), trench composting, Hugelkultur (cross-link to
  permaculture).
- Leaf mould: collection, holding, two-year cycle.
- Green manures: field bean, phacelia, mustard, vetch, clover,
  buckwheat. Sowing windows, dig-in cadence.
- Mulching: woodchip, bark, straw, compost, leaf mould, gravel,
  living mulch.
- Soil amendment: lime (calcium carbonate, dolomitic), gypsum, sulfur,
  rock phosphate, kelp meal, biochar (with care; not all biochar
  is created equal).
- No-dig bed ongoing fertility management.
- Container compost: peat-free multi-purpose, John-Innes loam mixes.

## Scope (what does NOT belong here)

- Permaculture system design (forest garden, polyculture) →
  `permaculture`.
- Plant-specific feed schedules (tomato feed cadence) → the
  plant's sub-cat guide.
- Comfrey + nettle teas as system → `permaculture`.

## Sub-topic mix

- `growing` for system-level guides (starting a hot heap; managing a
  worm bin year-round; running a 4-year green-manure rotation).
- `season-extension` collapses to "what to do this month" entries;
  cross-link to `seasonal-care`.
- `variety-selection` for green manure choice.
- Other sub-topics (sowing / harvesting / pruning / pest-management)
  generally don't apply directly.

## Region-aware metadata

- `garden.plantingMonths` — sowing windows for green manures;
  composting can start any month but autumn-built piles do most
  of their work in the following spring.
- `garden.harvestMonths` — "finished compost" windows (hot heap 6
  to 12 weeks; cool heap 6 to 12 months; leaf mould 1 to 2 years).
- `garden.containerFriendly` — false for system-level guides;
  composting is land-based or system-based.
- `garden.indoorFriendly` — true for worm bin, bokashi; false for
  pile-based composting.
- `garden.regionsApplicable` — broad. Compost biology is universal;
  schedules adjust by season.

## Critical techniques

- `soil-testing-pH`
- `soil-testing-nutrients`
- `soil-jar-test-texture`
- `hot-composting-c-n-ratio`
- `hot-composting-turn-cadence`
- `cool-composting-build`
- `leaf-mould-making`
- `green-manure-dig-in`
- `mulching-deep`
- `lime-application-rate-calculation`

`techniqueSlugs[]` extends with: `compost-turning-three-bin-system`,
`bokashi-ferment-and-bury`, `worm-bin-build`, `worm-bin-feeding`,
`worm-bin-harvest`, `trench-composting`, `compost-tea-aerated`,
`compost-tea-non-aerated`, `biochar-charging`,
`woodchip-mulch-nitrogen-tie-up-avoidance`,
`gravel-mulch-mediterranean-bed`, `living-mulch-clover-understory`,
`green-manure-sow-autumn-overwinter`, `green-manure-sow-spring-quick`,
`succession-cover-cropping`.

## Materials master list

- **Tools:** garden fork, rake, compost turner (corkscrew style or
  pitchfork), wheelbarrow, sieve (12 mm + 6 mm), pH meter / pH test
  kit, soil thermometer (compost thermometer 60 cm probe).
- **Compost containers:** wooden pallet bin, plastic dalek bin,
  three-bin wooden system, hot-composter (insulated unit), worm bin
  (single-tier or stacking).
- **Inputs:** brown carbon (cardboard, straw, dry leaves, sawdust),
  green nitrogen (grass clippings, kitchen scraps, fresh garden
  prunings, comfrey, manure), water source.
- **Amendments:** dolomitic limestone, agricultural sulfur, rock
  phosphate, kelp meal, biochar (sourced + charged), molasses (for
  aerated compost tea).
- **Mulch:** woodchip (council / arborist; aged 6 months minimum
  for surface mulch), bark chip, straw bale (wheat, barley), spent
  mushroom compost (alkaline so not for ericaceous), municipal
  compost.

## Output contract

`subCategorySlug: 'soil-compost'`. `type: 'GROWING_GUIDE'`. Garden
block per umbrella. `garden.plantSlug` stays null / omitted —
soil-compost is an activity-axis sub-cat and the upload validator
rejects a plantSlug here. If a guide ties to one species (a clover
green-manure guide), name the species in body prose only.

## Body shape

Per umbrella. Soil-compost-specific notes:

- Opening paragraph names the system, places it (UK back garden /
  allotment / small space), states what the system delivers
  (finished compost in X weeks; soil pH adjustment; fertility cycle
  for the next season).
- "Setting up" H2 (replaces "Planting out") for system guides.
- "Through the season" H2: turn cadence (every 3 days for the
  18-day Berkeley method; once a month for cool composting; weekly
  feeding for worm bin), C:N ratio target (25 to 30:1 for hot
  composting).
- `troubleshooter` covers system failures: stinking anaerobic pile
  (too wet / too much green), pile that won't heat (too dry / too
  much brown / pile too small), worm bin fruit fly invasion (too
  wet / surface food), woodchip mulch nitrogen tie-up (mulch under,
  not into soil), green-manure dig-in timing miss.

## Voice rules (soil-compost-specific additions)

- **No "feed the soil not the plant" slogan.** The principle is
  fine; the slogan reads evangelical.
- **C:N ratio explicitly stated.** "Aim for 25 to 30 parts brown
  carbon to 1 part green nitrogen by volume." State the target
  range, not just the principle.
- **Compost temperature in Celsius.** Berkeley method targets 55 to
  65 °C; below 55 °C is "cool" composting; above 70 °C is at risk
  of beneficial-microbe death.
- **No "perfect compost" claims.** Cite trial data when claiming
  yield or fertility outcomes.
- **No raw-chicken-manure direct application.** Manure must be
  composted or rotted; raw poultry manure burns plants and carries
  pathogen risk. Name this when manure is in the materials list.
- **Biochar with care.** Biochar quality varies (feedstock,
  temperature, charging). State the "charge with nutrient before
  applying" rule.
- **No medicinal claims on compost tea.** Functional claim
  (suppressive against some pathogens, contested) only.

## Sources (soil-compost tilt)

- **Garden Organic (formerly HDRA) composting guidance** for UK
  current authority.
- **RHS composting pages**.
- **Cornell + UMass extension composting material** (open access,
  US PD).
- **Mary Appelhof, *Worms Eat My Garbage* (1982)** — foundational
  worm-bin reference; cite, don't paraphrase.
- **Charles Dowding's no-dig writing** for ongoing fertility cycle
  in no-dig beds.
- **Pre-1928 USDA bulletins on cover-cropping** for historical
  green manure data.
- **Mrs Loudon, Mrs Beeton** for historical kitchen-garden
  fertility practice (limited; mostly manure-based).

## Length guidance

| Sub-topic | Word count |
|---|---|
| Single-method short guide (jar test, pH test) | 600 to 900 |
| System setup guide (hot heap, worm bin, green-manure rotation) | 1,200 to 1,800 |
| Full reference (composting at-a-glance for the UK garden) | 2,000 to 3,000 |

## Self-critique pass (soil-compost additions)

1. C:N ratio target stated explicitly on hot-composting guides.
2. Compost temperature in Celsius on hot-composting guides.
3. Raw-manure-must-rot caveat present where manure is in materials.
4. Green-manure dig-in timing stated.
5. No "feed the soil not the plant" slogan.
6. Biochar charging step present if biochar is in materials.

## Worked example (compact)

```json
{
  "slug": "starting-a-hot-compost-pile",
  "title": "Starting a hot compost pile (the 18-day method)",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "soil-compost",
  "difficulty": "INTERMEDIATE",
  "garden": {
    "subTopic": "growing",
    "plantingMonths": ["march", "april", "may", "june", "july", "august", "september"],
    "containerFriendly": false,
    "indoorFriendly": false,
    "regionsApplicable": ["UK", "EU", "US_NORTH"]
  },
  "techniqueSlugs": ["hot-composting-c-n-ratio", "hot-composting-turn-cadence", "compost-turning-three-bin-system"],
  "criticalTechniques": ["hot-composting-c-n-ratio", "hot-composting-turn-cadence"]
}
```

## Image policy

NEVER generate images. Image worker sources verified hero per
`feedback_image_strategy.md`.

## See also

- `docs/garden-author.md` umbrella.
- `docs/garden-permaculture-author.md` for system-level fertility.
- `docs/garden-seasonal-care-author.md` for the month-by-month
  compost + mulch calendar.
