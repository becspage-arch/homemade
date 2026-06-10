# Garden / Fruit authoring

Canonical input for any worker session that drafts a tutorial under
`garden/fruit`. Soft fruit (strawberry, raspberry, blackberry,
gooseberry, currants, blueberry), tree fruit (apple, pear, plum,
cherry, quince, fig, mulberry), vines (grape, kiwi), nuts (walnut,
hazel, cobnut), unusual fruit (medlar, chokeberry, sea buckthorn).

## Status

`SubCategory.autopilotEnabled = true` for `garden/fruit`.

## Pre-read (MANDATORY)

- `docs/garden-author.md` umbrella.
- `docs/voice-spec-2026-05-21.md`, `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`, `docs/common-issues.md`.

## Scope (what belongs here)

- Soft fruit: strawberry, raspberry (summer + autumn), blackberry,
  loganberry, tayberry, gooseberry, redcurrant, blackcurrant,
  whitecurrant, blueberry, cranberry.
- Tree fruit: apple, pear, plum, damson, gage, cherry (sweet + acid),
  quince, fig, mulberry, medlar, peach, apricot, nectarine.
- Vines: grape, kiwi, hardy kiwi.
- Nuts: walnut, hazel, cobnut, almond, sweet chestnut.

## Scope (what does NOT belong here)

- Citrus indoors → `indoor-gardening`.
- Strawberry propagation by runners as a stand-alone method →
  `propagation` (cross-link).
- Cross-plant disease guides (powdery mildew across multiple fruits)
  → `pest-disease-management`.

## Sub-topic mix

- `growing` carries most weight: the full bed-or-tree-to-fruit
  narrative.
- `pruning` is high-leverage for tree fruit, gooseberry, currants;
  every cordon / espalier / fan-trained guide is a pruning guide.
- `harvesting` is a short guide for fruit where the cue is non-obvious
  (when a quince is ready; when a pear should come off the tree).
- `pest-management` for the plant-specific (codling moth on apple,
  big bud mite on blackcurrant, vine weevil on strawberry).
- `variety-selection` is high-leverage on apple (over 2,500 cultivars
  worth knowing), pear, plum.

## Region-aware metadata

- `garden.plantingMonths` — for bare-root tree fruit and bushes, the
  dormant-season planting window (November to March in the UK).
  Container-grown can plant year-round; note both.
- `garden.harvestMonths` — UK fruiting window.
- `garden.containerFriendly` — true for strawberry, blueberry (in
  ericaceous), patio apple / pear / cherry on dwarf rootstock; false
  for full-size tree fruit.
- `garden.indoorFriendly` — false for all but the occasional fig in a
  conservatory.
- `garden.regionsApplicable` — leave null. The renderer derives from
  the master species + the guide's `hemisphere` / `climateZones` /
  `usdaHardinessZones` / `rhsHardinessZones` / `frostSensitivity`. Set
  `garden.regionsApplicableOverride` only when the derivation gets
  this specific cultivar wrong.
- Master `PlantVariety.usdaHardinessZone` / `koppenZone` carry the
  cultivar-specific bounds and feed the derivation.

## Critical techniques

- `choosing-rootstock`
- `planting-bare-root`
- `pruning-winter-tree-fruit`
- `pruning-summer-tree-fruit`
- `pollination-groups`
- `staking-young-tree`
- `mulching-fruit-bush`
- `netting-against-birds`

`techniqueSlugs[]` extends with: `espalier`, `cordon-training`,
`fan-training`, `step-over`, `summer-prune-restricted-form`,
`winter-prune-restricted-form`, `formative-prune-tree-fruit`,
`renovation-prune-old-tree`, `tip-bearing-vs-spur-bearing`,
`cane-fruit-tying-in`, `gooseberry-spurring`,
`blackcurrant-renewal-pruning`, `strawberry-runner-management`,
`grape-vine-cane-prune`, `grape-vine-spur-prune`,
`thinning-fruit-set`.

## Materials master list

- **Tools:** secateurs (bypass + anvil), long-arm loppers, pruning
  saw, pole pruner, fruit picker (long-handled basket), garden knife,
  budding / grafting knife.
- **Supports:** wires + vine eyes (for cordon / espalier / fan),
  bamboo canes, soft tie, tree stake, tree tie (with spacer), fruit
  cage.
- **Soil + feed:** balanced general-purpose fertiliser, sulphate of
  potash (for fruiting), ericaceous compost (blueberry, cranberry),
  well-rotted manure, mulch (bark or straw or compost).
- **Protection:** bird netting, fleece (for blossom frost), pheromone
  trap (codling moth, plum moth), grease band (winter moth).

## Output contract

`subCategorySlug: 'fruit'`, `type: 'GROWING_GUIDE'`. `garden.plantSlug`
from the master table. The fruit rootstock note (where applicable)
appears in body prose; the master `PlantVariety` row carries the
cultivar-rootstock pairing where it matters.

## Body shape

Per umbrella. Fruit-specific notes:

- Tree fruit growing guides MUST state rootstock options in the
  "Choosing a position" H2. M27 (very dwarf) versus M9 (dwarf) versus
  MM106 (semi-vigorous) versus M25 (full standard) for apple changes
  every downstream decision (spacing, support, productive years).
- Pruning guides separate winter (formative + structural) from summer
  (restricting growth on cordon / espalier / fan).
- `troubleshooter` covers the plant's top failures: brown rot,
  scab, canker, sawfly, codling moth, no-fruit-set, biennial bearing.
- Cross-link to `pollination-groups` reading when the variety needs
  a pollinator partner.

## Voice rules (fruit-specific additions)

- **Rootstock matters.** Don't write "apple tree" without naming the
  rootstock category. The reader buying an apple needs the rootstock
  to size the garden.
- **Pollination groups: name them.** Apple / pear / plum / cherry
  pollination groups are real horticultural data; the renderer can
  surface a pollinator partner from the master table when both are
  named.
- **No "homegrown tastes better than shop" comparisons.** State what
  the fruit tastes like.
- **Pruning specifics, not "give it a tidy".** State which wood to
  cut, which to leave.
- **Heritage variety provenance with care.** Many heritage apple
  varieties are local-named; cite the county or NCCPG / Brogdale
  reference rather than vague "heritage".

## Sources (fruit tilt)

- **RHS fruit pages** for current variety recommendations.
- **Joan Morgan, *The New Book of Apples* (1993)** is current — cite,
  don't paraphrase.
- **Brogdale / National Fruit Collection records** for heritage
  variety provenance.
- **Mrs Beeton § fruit garden** for historical context.
- **Gertrude Jekyll's writing on the walled fruit garden** for
  cordon / espalier traditions.
- **Pre-1928 RHS Journal** for variety history.
- **USDA cooperative extension fruit pages** for US schedules.

## Length guidance

| Sub-topic | Word count |
|---|---|
| Variety profile (single cultivar) | 600 to 900 |
| Pruning guide (cane fruit, gooseberry, single tree form) | 1,000 to 1,500 |
| Full growing guide on a primary fruit (apple, pear, strawberry, raspberry) | 1,800 to 3,000 |

## Self-critique pass (fruit additions)

1. Rootstock named in tree-fruit growing guides.
2. Pollination group named on apple / pear / plum / cherry guides.
3. Pruning specifics, not vague "tidy up".
4. Variety-selection guide has 3 to 5 named varieties + one paragraph
   "what to avoid".
5. Pest guide closes with "Prevention next year" H2.

## Worked example (compact)

```json
{
  "slug": "growing-blackcurrants",
  "title": "Growing blackcurrants",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "fruit",
  "difficulty": "BEGINNER",
  "garden": {
    "plantSlug": "blackcurrant",
    "subTopic": "growing",
    "plantingMonths": ["november", "december", "january", "february", "march"],
    "harvestMonths": ["july", "august"],
    "containerFriendly": false,
    "indoorFriendly": false
  },
  "techniqueSlugs": ["planting-bare-root", "blackcurrant-renewal-pruning", "netting-against-birds", "mulching-fruit-bush"],
  "criticalTechniques": ["planting-bare-root", "blackcurrant-renewal-pruning"]
}
```

## Image policy

NEVER generate images. Image worker sources verified hero photography
per `feedback_image_strategy.md`.

## See also

- `docs/garden-author.md` umbrella.
- `docs/garden-propagation-author.md` for runner / cutting propagation
  cross-links.
- `docs/garden-pest-disease-management-author.md` for cross-fruit
  diseases.
- `docs/garden-seasonal-care-author.md` for the winter-pruning
  calendar.
