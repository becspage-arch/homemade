# Garden / Hydroponics authoring

Canonical input for any worker session that drafts a tutorial under
`garden/hydroponics`. Soilless growing systems: nutrient film
technique (NFT), deep water culture (DWC), ebb-and-flow (flood-and-
drain), Dutch buckets, wick systems, drip systems. Indoor and
greenhouse.

## Status

`SubCategory.autopilotEnabled = true` for `garden/hydroponics`.

## Pre-read (MANDATORY)

- `docs/garden-author.md` umbrella.
- `docs/voice-spec-2026-05-21.md`, `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`, `docs/common-issues.md`.

## Scope (what belongs here)

- System types: NFT (nutrient film channel), DWC (deep water culture
  air-stoned reservoir), ebb-and-flow (flood-and-drain table with
  pump-on-timer), Kratky (passive non-recirculating), Dutch bucket
  (drip-to-substrate-bucket), wick (passive capillary).
- Crop-in-system guides: leafy greens (lettuce, basil) in NFT or
  DWC; fruiting crops (tomato, cucumber, pepper) in Dutch bucket;
  strawberry in stacked vertical NFT.
- Nutrient management: EC + pH measurement, nutrient solution
  mixing (two-part), top-up vs flush-and-replace cycles.
- Substrate choice: rockwool, clay pebbles (LECA), coco coir,
  perlite, vermiculite.
- Lighting: HPS, LED, T5 fluorescent (legacy); PPFD basics.

## Scope (what does NOT belong here)

- Aquaponics (fish + plant integrated) — pause for a dedicated
  worker when scope is right; for now `notes` in the brief routes
  to a hydroponics-system guide if it covers the plant side, with
  a one-line caveat about fish.
- Indoor pot-and-soil houseplants → `indoor-gardening`.
- Outdoor field hydroponics (rare in UK) → general guide notes only.

## Sub-topic mix

- `growing` for full crop-in-system guides.
- `sowing` for starting seedlings in rockwool / coco plugs.
- `harvesting` for system-specific cutting (NFT lettuce harvest
  rotation).
- `variety-selection` for crops bred for hydroponics (greenhouse
  tomato, leaf lettuce cultivars).

## Region-aware metadata

- `garden.plantingMonths` — year-round indoor; populate all twelve.
- `garden.harvestMonths` — year-round.
- `garden.containerFriendly` — true (system is the container).
- `garden.indoorFriendly` — true.
- `garden.regionsApplicable` — leave null. Indoor hydroponics is
  region-independent and the renderer derives a wide applicability
  set from the master species + indoor / climate-neutral metadata.
- `dayLengthSensitive` — relevant; lettuce bolts under long days.
  Mention in guides for bolting-prone crops.

## Critical techniques

- `seedling-start-in-rockwool`
- `seedling-start-in-coco-plug`
- `nutrient-solution-mixing-two-part`
- `ec-measurement`
- `ph-measurement`
- `ph-adjustment`
- `reservoir-top-up`
- `reservoir-flush-and-replace`
- `system-cleaning-between-cycles`

`techniqueSlugs[]` extends with: `nft-channel-flow-rate`,
`dwc-air-stone-sizing`, `ebb-flow-timer-cycle`,
`dutch-bucket-emitter-flow`, `kratky-water-level-management`,
`grow-light-distance`, `ppfd-target-leafy`, `ppfd-target-fruiting`,
`co2-supplementation-greenhouse`, `pythium-prevention-hydroponic`,
`root-rot-hydroponic-treatment`.

## Materials master list

- **System hardware:** NFT channel (PVC), reservoir tank, submersible
  pump, air pump + air stone, water-resistant timer, tubing, fittings,
  Dutch buckets (5 gallon / 20 L), grow tray + reservoir for ebb-
  and-flow.
- **Substrate:** rockwool cubes (1.5 inch starter, 3 inch
  transplant), coco plug, clay pebbles (LECA), coco coir, perlite,
  vermiculite.
- **Nutrient solution:** two-part hydroponic nutrient (A + B; no
  brand pin in body — say "balanced two-part hydroponic nutrient"),
  pH up (potassium hydroxide), pH down (phosphoric acid).
- **Measurement:** EC pen, pH pen, thermometer (reservoir),
  hygrometer (ambient).
- **Lighting:** LED grow light (full-spectrum), HPS (legacy + heat),
  T5 fluorescent (seedlings).

## Output contract

`subCategorySlug: 'hydroponics'`. `type: 'GROWING_GUIDE'`. Garden
block per umbrella.

## Body shape

Per umbrella. Hydroponics-specific notes:

- Opening paragraph names the crop + system, places it (indoor
  cupboard / tent / greenhouse / spare room), states the system
  shape (recirculating reservoir / passive Kratky / drip-to-bucket)
  in plain English.
- "Choosing a position" H2: light, temperature, humidity, power
  access, water access, drainage.
- "Setting up" H2 (replaces "Planting out" for hydroponics):
  reservoir fill, nutrient mix, pH set, system circulation test.
- "Through the season" H2: nutrient top-up cadence, EC + pH check
  schedule, flush-and-replace cycle (typically every 7 to 14 days).
- `troubleshooter` covers system failures: pump failure (reservoir
  level alarm), pH drift, EC creep, root rot (Pythium), leaf
  chlorosis (specific nutrient deficiency signs), algae (light
  hitting reservoir water).

## Voice rules (hydroponics-specific additions)

- **No "soil-less = better than soil" framing.** Hydroponics is a
  different system with different trade-offs. State them.
- **No yield comparisons without citation.** Studies vary widely;
  small-scale hobbyist data is not industry data.
- **EC + pH units stated explicitly.** EC in mS/cm, pH on the
  standard 0 to 14 scale. State target ranges per crop.
- **No brand pinning for nutrient mixes.** "Balanced two-part
  hydroponic nutrient" is the canonical phrasing. List ingredient
  ratios where relevant (NPK 4-3-7 style for leafy greens).
- **Electrical safety in one line max.** "Hydroponics involves water
  and electricity. Power outlets sit above the reservoir; the system
  draws power through a residual-current device (RCD)." Single line,
  no multi-paragraph block.
- **No cannabis content.** Cannabis cultivation is in many
  jurisdictions illegal and is out of scope for Homemade. Other
  high-value indoor crops are fine to feature.
- **Reservoir change cadence stated as a range,** not a single
  number. "Flush and replace every 7 to 14 days, sooner if EC drift
  exceeds 0.3."

## Sources (hydroponics tilt)

- **Cornell Controlled Environment Agriculture (CEA) extension
  material** is the leading open-access US source.
- **University of Florida hydroponics extension**.
- **Royal Horticultural Society indoor growing pages** (UK).
- **Open-access controlled-environment journals** for trial data.

Hydroponics as a named home-grower category is recent; historical
sources will be thin. Most guides will set `sourceType:
"SYNTHESISED"` with a small set of extension-service citations.

## Length guidance

| Sub-topic | Word count |
|---|---|
| Single-crop-in-system guide (lettuce in DWC) | 1,000 to 1,500 |
| System setup guide (Kratky jar, DWC bucket) | 1,200 to 1,800 |
| Full guide on a complex system (NFT rack with multiple crops, Dutch bucket tomato) | 2,000 to 3,000 |

## Self-critique pass (hydroponics additions)

1. System type named explicitly in opening.
2. EC + pH targets stated per crop.
3. Nutrient described as "balanced two-part hydroponic nutrient"
   without brand pinning.
4. Electrical safety line present and capped at one line.
5. No cannabis content.
6. Reservoir replacement cadence as a range.

## Worked example (compact)

```json
{
  "slug": "growing-lettuce-in-deep-water-culture",
  "title": "Growing lettuce in deep water culture",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "hydroponics",
  "difficulty": "INTERMEDIATE",
  "garden": {
    "plantSlug": "lettuce",
    "subTopic": "growing",
    "plantingMonths": ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
    "harvestMonths": ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
    "containerFriendly": true,
    "indoorFriendly": true
  },
  "techniqueSlugs": ["seedling-start-in-rockwool", "nutrient-solution-mixing-two-part", "ec-measurement", "ph-measurement", "dwc-air-stone-sizing"],
  "criticalTechniques": ["nutrient-solution-mixing-two-part", "ph-measurement"]
}
```

## Image policy

NEVER generate images. Image worker sources verified hero per
`feedback_image_strategy.md`.

## See also

- `docs/garden-author.md` umbrella.
- `docs/garden-indoor-gardening-author.md`.
- `docs/garden-tools-equipment-author.md` for grow-light + pH-meter
  selection.
