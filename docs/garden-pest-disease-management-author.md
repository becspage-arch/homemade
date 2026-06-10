# Garden / Pest and disease management authoring

Canonical input for any worker session that drafts a tutorial under
`garden/pest-disease-management`. Cross-plant integrated pest
management (IPM): beneficial insects, organic controls, common pest
identification, plant disease identification. Methods that work
across plant families.

## Status

`SubCategory.autopilotEnabled = true` for `garden/pest-disease-management`.

## Pre-read (MANDATORY)

- `docs/garden-author.md` umbrella.
- `docs/voice-spec-2026-05-21.md`, `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`, `docs/common-issues.md`.

## Scope (what belongs here)

- Cross-plant pest profiles: aphid (blackfly, greenfly,
  cabbage-aphid), slug + snail, vine weevil, sciarid (fungus gnat),
  red spider mite, whitefly, thrips, leaf miner, sawfly, scale,
  mealybug.
- Cross-plant disease profiles: powdery mildew, downy mildew, grey
  mould (Botrytis), damping off, blight (late blight on
  tomato + potato; early blight on tomato), rust (multiple host
  species), club root, white rot (allium), canker, scab (apple,
  pear), brown rot (stone fruit), honey fungus.
- IPM principles: prevention, monitoring, threshold-based action,
  biological + cultural + physical + chemical (last resort).
- Beneficial insects: ladybird (aphid), lacewing (aphid + thrip),
  hoverfly (aphid), parasitoid wasps (Encarsia formosa for
  whitefly), Phytoseiulus persimilis (red spider mite), nematodes
  (slug, vine weevil, fungus gnat), ground beetles (slug + snail
  predator).
- Physical controls: netting (carrot fly, butterfly), fleece (frost +
  flea beetle), cloche, barriers (copper tape, wool pellet, grit
  ring).
- Cultural controls: crop rotation, resistant varieties, companion
  planting (with citation), succession sowing to dodge peak pest
  windows, plant hygiene (remove infected material).
- Conventional controls: named active ingredients (factual mention,
  not endorsement). Pyrethrum, neem (some formulations not licensed
  in UK; state), copper sulphate, lime sulphur.

## Scope (what does NOT belong here)

- Plant-specific pest sections inside a plant guide
  (vegetable / fruit / flower sub-cat guides each have their own
  "What can go wrong" H2). Cross-link to this sub-cat for the
  broader IPM context.
- Wildlife habitat creation → `wildlife-gardening` (stub).
- Slug-and-snail-control system inside no-dig → `permaculture` or
  this sub-cat depending on emphasis.

## Sub-topic mix

- `pest-management` is the dominant sub-topic. Pest- or disease-
  centred body shape.
- `growing` for IPM system guides ("setting up an IPM monitoring
  routine for a polytunnel").
- `variety-selection` for resistant-variety roundups.

## Region-aware metadata

- `garden.plantingMonths` — empty (no planting in a pest guide).
- `garden.harvestMonths` — empty.
- `garden.containerFriendly` — null.
- `garden.indoorFriendly` — true for greenhouse / polytunnel /
  houseplant pest guides; false for outdoor-only pests.
- `garden.regionsApplicable` — leave null. The renderer derives
  from the master species + the guide's hardiness metadata. Set
  `garden.regionsApplicableOverride` when the pest is region-
  restricted in a way the species derivation can't capture (e.g.
  Colorado beetle, which is excluded from UK but present across
  continental Europe + the US).
- `frostSensitivity` (master Plant) doesn't apply.

## Critical techniques

- `pest-id-rule-of-three` (life stage + plant damage pattern +
  habitat — three independent signs to identify before treating)
- `ipm-monitoring-yellow-trap`
- `ipm-monitoring-blue-trap`
- `companion-planting-cited-evidence`
- `crop-rotation-4-bed-system`
- `nematode-application-soil`
- `release-beneficial-on-schedule`
- `physical-barrier-net-mesh-size`
- `fleece-vs-flea-beetle`
- `slug-pellet-iron-phosphate-vs-metaldehyde-banned`

`techniqueSlugs[]` extends with: `aphid-id-by-host-plant`,
`aphid-control-soft-soap-spray`, `aphid-control-ladybird-release`,
`slug-control-beer-trap`, `slug-control-wool-pellet`,
`slug-control-nematode-phasmarhabditis`, `vine-weevil-larva-id`,
`vine-weevil-adult-trap`, `vine-weevil-nematode-treatment`,
`whitefly-encarsia-release`, `whitefly-yellow-trap`,
`red-spider-mite-phytoseiulus-release`,
`powdery-mildew-prevention-spacing-watering`,
`powdery-mildew-treatment-milk-spray`,
`grey-mould-prevention-airflow`, `damping-off-prevention`,
`late-blight-prevention-airflow-resistant-variety`,
`rust-management-host-specificity`,
`club-root-prevention-lime-rotation`,
`honey-fungus-id-rhizomorphs`, `honey-fungus-management-resistant-trees`.

## Materials master list

- **Monitoring:** yellow sticky trap (aphid + whitefly + thrip),
  blue sticky trap (thrip), pheromone trap (codling moth, plum moth,
  carrot fly).
- **Barriers + netting:** insect-proof netting (mesh size matters —
  2 mm for carrot fly, 7 mm for butterfly), fleece, copper tape, wool
  pellet, grit, eggshell.
- **Beneficial insect supply:** Encarsia formosa, Aphidius colemani,
  Phytoseiulus persimilis, Heterorhabditis bacteriophora (vine
  weevil nematode), Phasmarhabditis hermaphrodita (slug nematode).
  UK suppliers (Defenders Ltd, BCP Certis — factual mention).
- **Organic spray:** soft-soap solution (potassium soap), neem oil
  (where licensed; UK not for food crops as of 2026, state), milk
  spray (1:10 milk to water for mildew, contested), sulfur dust.
- **Conventional:** named active ingredients only on guides where
  the choice matters. Pyrethrum, deltamethrin, copper sulphate.
  Factual, never endorsement.

## Output contract

`subCategorySlug: 'pest-disease-management'`. `type: 'GROWING_GUIDE'`.
Garden block per umbrella. `garden.plantSlug` stays null / omitted —
pest-disease-management is an activity-axis sub-cat and the upload
validator rejects a plantSlug here. The pest's typical hosts are
named in body prose (broad-bean aphid, brassica whitefly) and
cross-link to the plant sub-cats; no plant slug on the row.

## Body shape

Use the `pest-management` sub-topic body shape from the umbrella with
adaptations:

- "The pest" or "The disease" H2: identification, life cycle, when
  it appears.
- "Symptoms on the plant" H2: what the reader sees first.
- "Organic controls" H2: physical, cultural, biological. With
  citation where evidence is contested.
- "Conventional controls" H2: named active ingredient. Factual
  mention, never endorsement. The "follow the manufacturer's
  instructions and observe the harvesting interval" line without
  specific days.
- "Prevention next year" H2: rotation, variety choice, soil
  preparation, biological-release timing.

## Voice rules (pest-disease-specific additions)

- **Evidence level on every claim.** Companion-planting,
  ladybird-release timing, biological-control efficacy: cite or
  frame as contested. Folklore claims are folklore-strength.
- **No "natural = safe".** Pyrethrum is "natural" (botanical) and
  also toxic to bees. State the trade-off.
- **No "chemical = bad" framing.** State the trade-off; let the
  reader decide.
- **Mesh size matters; state it.** Carrot fly needs 2 mm or less;
  cabbage white needs 7 mm or less. Generic "netting" is unhelpful.
- **Beneficial release timing matters.** Encarsia formosa needs 18 °C
  minimum; releasing in cold UK March doesn't work. State the
  threshold.
- **Banned active ingredients flagged.** Metaldehyde slug pellets
  banned UK 2022; state. Neem in food-crop use unlicensed UK.
- **No medical thresholds.** "Stomach upset if eaten" is the safety
  bar; no doses, no quantities.
- **One inline safety line max per topic.** "Pesticide handling
  follows the manufacturer's instructions and observes the harvest
  interval; mix outdoors away from pets and children." One line.

## Sources (pest-disease tilt)

- **RHS pest + disease pages** for current UK position.
- **Garden Organic (HDRA) pest + disease guidance**.
- **AHDB (Agriculture and Horticulture Development Board) plant
  pest research** for evidence-based positions.
- **UK Health and Safety Executive pesticide register** for current
  active ingredient legality.
- **University extension entomology + plant pathology pages**
  (Cornell, UMass, Penn State) for US PD trial data.
- **Pre-1928 horticultural literature** for historical pest
  identification (limited; modern molecular ID has changed many
  classifications).
- **Defra plant health pages** for notifiable pest information
  (Colorado beetle, oak processionary moth).

## Length guidance

| Sub-topic | Word count |
|---|---|
| Single-pest short guide | 600 to 900 |
| Single-pest or disease full guide | 1,000 to 1,500 |
| IPM system guide (greenhouse, polytunnel monitoring routine) | 1,800 to 2,500 |

## Self-critique pass (pest-disease additions)

1. Evidence level stated on every control claim.
2. Mesh size or release temperature named where it matters.
3. Banned-ingredient flag present on any pesticide guide that
   references active ingredients.
4. "Prevention next year" H2 present.
5. No "natural = safe" or "chemical = bad" framing.
6. Single safety line (per the umbrella max-one-line rule).
7. Companion-planting claims cited or framed as folklore.

## Worked example (compact)

```json
{
  "slug": "managing-aphids-organically",
  "title": "Managing aphids organically",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "pest-disease-management",
  "difficulty": "BEGINNER",
  "garden": {
    "subTopic": "pest-management",
    "containerFriendly": null,
    "indoorFriendly": false
  },
  "techniqueSlugs": ["aphid-id-by-host-plant", "aphid-control-soft-soap-spray", "aphid-control-ladybird-release", "ipm-monitoring-yellow-trap"],
  "criticalTechniques": ["aphid-id-by-host-plant", "aphid-control-soft-soap-spray"]
}
```

## Image policy

NEVER generate images. Image worker sources verified hero + close-up
pest ID images per `feedback_image_strategy.md`. Pest ID images are
verified against species + life-stage; mistakes here lead readers to
mistreat.

## See also

- `docs/garden-author.md` umbrella.
- Per-plant sub-cats (`vegetables`, `fruit`, `flowers`) for plant-
  specific pest sections that cross-link here.
- `docs/garden-seasonal-care-author.md` for the monitoring + release
  calendar.
- `docs/garden-wildlife-gardening-author.md` for habitat-led
  beneficial-insect support (currently stub).
