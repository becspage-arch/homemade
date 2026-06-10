# Garden / Mushroom growing authoring

Canonical input for any worker session that drafts a tutorial under
`garden/mushroom-growing`. Edible fungi: oyster (Pleurotus ostreatus,
P. eryngii, P. citrinopileatus), shiitake (Lentinula edodes), lion's
mane (Hericium erinaceus), wine cap (Stropharia rugosoannulata),
chestnut (Pholiota adiposa), reishi (cite Herbal for medicinal use).
On logs, bags, straw, woodchip.

## Status

`SubCategory.autopilotEnabled = true` for `garden/mushroom-growing`.

## Pre-read (MANDATORY)

- `docs/garden-author.md` umbrella.
- `docs/voice-spec-2026-05-21.md`, `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`, `docs/common-issues.md`.

## Scope (what belongs here)

- Log cultivation: shiitake on oak / beech / sweet chestnut log
  (drill + plug spawn + wax-seal method).
- Outdoor woodchip beds: wine cap, oyster.
- Indoor / outhouse bag cultivation: oyster on supplemented straw or
  sawdust bag.
- Fruiting-block kits: ready-made bag, condition + harvest.
- Substrate preparation: straw pasteurisation, sawdust supplementation.
- Spawn handling: grain spawn, sawdust spawn, plug spawn.

## Scope (what does NOT belong here)

- Wild mushroom foraging → `foraging`.
- Therapeutic mushroom claims (lion's mane cognitive, reishi
  immune-modulator) → Herbal. Cross-link.
- Truffle cultivation: too specialised / niche; leave to a dedicated
  worker if interest emerges.
- Hallucinogenic mushroom cultivation. Out of scope (illegal in
  most jurisdictions).

## Sub-topic mix

- `growing` for full setup-to-harvest guides per species on per
  substrate.
- `harvesting` for fruiting-cue guides.
- `season-extension` for cold-spawn shock cycles + temperature-
  controlled indoor cultivation.
- `variety-selection` for strain choice (cold-tolerant vs warm-
  tolerant oyster strains).

## Region-aware metadata

- `garden.plantingMonths` — log inoculation in spring (March to
  early May in the UK, when sap is rising but before leaf-out
  competition); woodchip bed in autumn or spring; bags year-round
  indoors.
- `garden.harvestMonths` — varies by species + climate; outdoor
  oyster fruits in cool-wet windows (autumn, spring); wine cap
  fruits summer through autumn; bag cultivation year-round indoors.
- `garden.containerFriendly` — true for bag cultivation; false for
  log + woodchip.
- `garden.indoorFriendly` — true for bag / kit; false for log
  cultivation (needs outdoor shade + humidity).
- `garden.regionsApplicable` — temperate widely. Adjust spawn
  strains for warm climates.

## Critical techniques

- `log-selection-fresh-cut`
- `log-inoculation-drill-and-plug`
- `wax-seal-mushroom-log`
- `straw-pasteurisation`
- `sawdust-supplementation`
- `bag-inoculation-sterile`
- `fruiting-conditions-temperature-humidity`
- `harvest-cut-at-base`
- `mushroom-id-verification` (for home-grown — verify the strain is
  what was inoculated)

`techniqueSlugs[]` extends with: `cold-shock-fruiting-trigger`,
`humidity-tent-fruiting-chamber`, `air-exchange-co2-fruiting`,
`fruiting-block-rehydration`, `spawn-run-temperature`,
`pin-formation-cue`, `contamination-detection-trichoderma`,
`contamination-detection-cobweb`, `contamination-detection-green-mould`.

## Materials master list

- **Spawn:** plug spawn (for log), grain spawn (for bag + bed), sawdust
  spawn (for bag + bed). UK suppliers: Ann Miller's Speciality
  Mushrooms (Aberdeenshire), Gourmet Woodland Mushrooms (Devon),
  Mycelium Emporium. Name without affiliate framing.
- **Log:** freshly-felled hardwood (oak, beech, sweet chestnut,
  willow, hornbeam). 1 m sections, 10 to 20 cm diameter, bark intact.
- **Substrate:** straw (wheat, barley), sawdust (hardwood), woodchip
  (hardwood, no treated timber), bran (supplement for sawdust bag).
- **Tools:** 12 mm spade bit, drill (corded for log work), cheese-
  wax or beeswax, double-boiler for wax, pressure cooker (sterile
  bag work), spray bottle.
- **Containment:** breathable mushroom bag with filter patch, plastic
  tote (humidity tent), shade-cloth (log cultivation).

## Output contract

`subCategorySlug: 'mushroom-growing'`. `type: 'GROWING_GUIDE'`. Garden
block per umbrella. `garden.plantSlug` is the mushroom species slug
and is required (mushroom-growing is a species-keyed sub-cat). The
slug must resolve against a `Species` row whose `kingdom` is `FUNGI`
(the Species table — renamed from PlantVariety in
`phase_species_kingdom_001` — carries a kingdom discriminator so
mushroom rows sit beside plants without conflating at the
kingdom-level filter). If the species isn't yet in
`packages/db/scripts/data/plants.ts`, add it there with
`kingdom: 'FUNGI'` and reseed before uploading; flag in brief return
if missing.

## Body shape

Per umbrella. Mushroom-growing-specific notes:

- Opening paragraph names the species, places it (log / bed / bag),
  states the cycle length (3 to 12 months log inoculation to fruit;
  3 to 6 weeks bag) in plain English.
- "Choosing a position" H2: shade, humidity, air movement, log /
  bed placement.
- "Setting up" H2: substrate preparation, inoculation method,
  containment.
- "Through the season" (or "Through the cycle") H2: spawn run,
  fruiting trigger, fruiting body harvest.
- `troubleshooter` covers cycle failures: contamination
  (trichoderma green mould, cobweb white mould), no spawn run
  (substrate too wet / too dry / too cold), no fruiting (no
  temperature shift / low humidity / too much CO2 indoors).

## Voice rules (mushroom-growing-specific additions)

- **Identification before eating, always.** Even on home-grown
  mushrooms, the safety line "verify before eating — what you grow
  should look exactly like the species you inoculated; discard
  anything that grew unexpectedly" appears as one inline line
  (per the safety-max-one-line rule).
- **No therapeutic claims.** Lion's mane and reishi have folk
  medicinal traditions; cross-link to Herbal for the medicinal
  side. Growing guide stops at the fruiting body.
- **Latin binomials on first use.** Mushroom common names overlap
  (multiple species called "oyster mushroom"); binomial removes
  ambiguity.
- **Hardwood named.** Oak, beech, sweet chestnut, willow, hornbeam
  are usable. Conifer (pine, spruce, fir) doesn't work for shiitake
  or oyster. State which hardwood the guide is for.
- **No cannabis-style "grow tent" register** (the indoor / fruiting
  tent crossover is sometimes adjacent in retail; keep voice clean).
- **UK supplier names** are factual mentions (Ann Miller's, Gourmet
  Woodland) without affiliate framing.

## Sources (mushroom-growing tilt)

- **Paul Stamets, *Growing Gourmet and Medicinal Mushrooms* (1993)**
  is the foundational text; cite, don't paraphrase. Carries
  medicinal claims that we cross-link to Herbal, not assert.
- **Tradd Cotter, *Organic Mushroom Farming and Mycoremediation*
  (2014)** for current methods.
- **University of Vermont mushroom extension material** (open access,
  US PD).
- **RHS pages on growing mushrooms** (limited).
- **Pre-1928 mycology texts** for historical context only.

Mushroom cultivation as a home-grower category is recent in the UK.
Most guides will lean on contemporary cited sources rather than
public-domain.

## Length guidance

| Sub-topic | Word count |
|---|---|
| Bag / kit guide (3 weeks setup to harvest) | 800 to 1,200 |
| Single-species log cultivation | 1,500 to 2,200 |
| Multi-species woodchip bed system | 1,800 to 2,500 |

## Self-critique pass (mushroom-growing additions)

1. Latin binomial used on first species mention.
2. Identification-before-eating line present.
3. Hardwood species named (where log + bed cultivation).
4. No therapeutic claims; medicinal use cross-linked to Herbal.
5. Cycle length stated in opening (3 months log, 3 weeks bag, etc).
6. Contamination signs named in troubleshooter.
7. No cannabis-grow-tent register.

## Worked example (compact)

```json
{
  "slug": "growing-oyster-mushrooms-on-straw",
  "title": "Growing oyster mushrooms on straw",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "mushroom-growing",
  "difficulty": "INTERMEDIATE",
  "garden": {
    "plantSlug": "oyster-mushroom",
    "subTopic": "growing",
    "plantingMonths": ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
    "harvestMonths": ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
    "containerFriendly": true,
    "indoorFriendly": true,
    "regionsApplicable": ["UK", "EU", "US_NORTH", "US_SOUTH", "AU_NZ", "ZA"]
  },
  "techniqueSlugs": ["straw-pasteurisation", "bag-inoculation-sterile", "fruiting-conditions-temperature-humidity", "harvest-cut-at-base"],
  "criticalTechniques": ["straw-pasteurisation", "fruiting-conditions-temperature-humidity"]
}
```

## Image policy

NEVER generate images. Image worker sources verified hero per
`feedback_image_strategy.md`. Special care: mushroom hero images
must match the named species + cultivation method; mistakes here
are higher-stakes than other garden crops.

## See also

- `docs/garden-author.md` umbrella.
- `docs/garden-foraging-author.md` for wild mushroom guides
  (different scope: ID + safety, no cultivation).
- Herbal category for medicinal mushroom claims.
