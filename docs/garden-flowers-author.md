# Garden / Flowers authoring

Canonical input for any worker session that drafts a tutorial under
`garden/flowers`. Edible flowers, cut-flower beds, companion-planting
workhorses, annuals + biennials + perennials, bulbs, climbers grown
for flower.

## Status

`SubCategory.autopilotEnabled = true` for `garden/flowers`.

## Pre-read (MANDATORY)

- `docs/garden-author.md` umbrella.
- `docs/voice-spec-2026-05-21.md`, `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`, `docs/common-issues.md`.

## Scope (what belongs here)

- Hardy annuals: calendula, cornflower, nigella, larkspur, ammi,
  cerinthe, godetia, candytuft, california poppy.
- Half-hardy annuals: cosmos, zinnia, sunflower, antirrhinum,
  nicotiana, rudbeckia (as annual), cleome.
- Biennials: foxglove, sweet william, wallflower, honesty, sweet
  rocket, evening primrose.
- Hardy perennials: hardy geranium, achillea, hollyhock, lupin,
  delphinium, peony, hardy salvia, echinacea, rudbeckia (as
  perennial), perennial aster, phlox, sedum, verbena bonariensis.
- Bulbs: daffodil, tulip, crocus, hyacinth, allium (ornamental),
  fritillary, snowdrop, bluebell (UK native cv only), dahlia, lily,
  iris, gladiolus.
- Climbers grown for flower: sweet pea, clematis, climbing rose,
  honeysuckle, jasmine, passion flower.
- Edible flowers (in this sub-cat when grown for the flower, not the
  herb): calendula, nasturtium, viola, borage, dianthus, rose petal,
  primrose, courgette flower.
- Companion-planting workhorses: marigold (French + African),
  nasturtium, calendula, phacelia.

## Scope (what does NOT belong here)

- Cut-flower-bed system design (layout, succession planning across
  the season) → `garden-design` (specialist stub).
- Wildflower meadow design with native species lists →
  `wildlife-gardening` (specialist stub).
- Pollinator-friendly plant lists → `wildlife-gardening`.

## Sub-topic mix

- `sowing` for hardy + half-hardy annuals (the canonical "from-seed"
  guide).
- `growing` for the full plant-to-bloom narrative.
- `pruning` for roses, clematis (Group 1 / 2 / 3 differ),
  hydrangea-treated-as-flower.
- `harvesting` (cutting) for cut-flower beds — when to cut, how to
  condition, vase life.
- `saving-seed` for hardy annuals (the cottage-garden tradition of
  self-sowing and saved seed).
- `pest-management` for plant-specific (blackspot on rose, lily
  beetle on lily, capsid bug on dahlia).
- `variety-selection` for rose (over 30,000 cultivars), sweet pea,
  dahlia, cosmos, sunflower.

## Region-aware metadata

- `garden.plantingMonths` — sowing window for annuals; planting
  window for perennials + bulbs (spring or autumn depending on the
  type).
- `garden.harvestMonths` — flowering window. For cut flowers the
  cropping window can be long with succession sowing.
- `garden.containerFriendly` — true for many bulbs, pelargonium,
  petunia, half-hardy annuals; mixed for perennials (size matters).
- `garden.indoorFriendly` — false in general; some bulbs force
  indoors (paperwhite, hyacinth).
- `garden.regionsApplicable` — leave null. The renderer derives
  applicable regions from the master species + the guide's hardiness
  metadata. Set `garden.regionsApplicableOverride` only when the
  derivation is wrong for this guide.
- `frostSensitivity`: hardy (most spring bulbs, hardy perennials,
  hardy annuals), half-hardy (cosmos, antirrhinum), tender (dahlia
  tuber after first frost; lift or mulch).

## Critical techniques

- `direct-sowing` (hardy annuals)
- `module-sowing` (half-hardy annuals)
- `pricking-out`
- `hardening-off-seedlings`
- `deadheading`
- `pinching-out` (cosmos, sweet pea, antirrhinum for branching)
- `staking` (delphinium, peony, dahlia, lily)
- `dividing-perennials`
- `bulb-planting-depth`

`techniqueSlugs[]` extends with: `chelsea-chop`,
`successional-sowing-cut-flower`, `growing-from-corm`,
`lifting-and-storing-dahlia-tuber`, `forcing-bulbs`,
`naturalising-bulbs`, `root-cuttings-perennial`,
`overwintering-tender-perennials`, `conditioning-cut-flowers`,
`buttoning-rose`, `rose-deadheading-old-vs-new`, `climber-tying-in`,
`clematis-group-1-pruning`, `clematis-group-2-pruning`,
`clematis-group-3-pruning`.

## Materials master list

- **Tools:** secateurs (cut-flower-rated bypass), florist scissors,
  dibber, hori-hori, snips, narrow trowel.
- **Containers:** seed trays, modules, terracotta pots (bulbs +
  pelargonium), long planter (annuals).
- **Supports:** birch / hazel pea sticks, bamboo canes, brushwood,
  grow-through grid, peony hoop, delphinium stake, plant ring,
  trellis, obelisk.
- **Soil + feed:** multi-purpose peat-free for annuals, loam-based
  (No. 3) for long-term containers, ericaceous for camellia / azalea,
  bone meal at planting for bulbs, sulphate of potash for flowering.
- **Protection:** fleece for tender perennial overwinter, mulch for
  dahlia tuber.

## Output contract

`subCategorySlug: 'flowers'`. `type: 'GROWING_GUIDE'`. Garden block
per umbrella.

## Body shape

Per umbrella. Flowers-specific notes:

- Opening paragraph names the flower, places it (cottage / cut-flower
  bed / border / container / pollinator workhorse), states the
  schedule.
- The "Through the season" H2 covers deadheading cadence (most
  annuals + many perennials want regular deadhead).
- The "What can go wrong" troubleshooter covers the plant's top
  failures (slug damage on dahlia, blackspot on rose, mildew on
  delphinium, capsid on aster).
- For edible flowers, add a short H3 under "Harvest" naming the
  culinary use (calendula petal in salad; nasturtium leaf + flower;
  courgette flower stuffed or fried).

## Voice rules (flowers-specific additions)

- **Cottage-garden register without sentimentality.** Factual: which
  flower, when, how to make it bloom longer.
- **Cut-flower discipline.** State the cut stage (most flowers cut
  half-open; sweet pea cut tight bud; sunflower cut wide open).
- **Rose pruning vocabulary precise.** Hybrid tea, floribunda,
  climbing, rambler, shrub each prune differently. Name the rose
  type.
- **Clematis groups named.** Group 1 (early flowering, prune after
  flowering), Group 2 (large-flowered, light prune), Group 3 (late
  flowering, hard prune in spring). Don't write "prune clematis"
  without the group.
- **Edible-flower caveat:** name the edible flower's safety (e.g.
  "petal only, not the centre"; "not for anyone allergic to
  Asteraceae"). One line only.
- **No "showstopper".** Replace with the factual claim ("4-foot
  stems" / "10 cm bloom" / "scented in the evening").

## Sources (flowers tilt)

- **RHS perennials, annuals, bulbs pages.**
- **Gertrude Jekyll** for English flower-garden writing.
- **Vita Sackville-West** for design + variety insight (Sissinghurst
  columns).
- **William Robinson, *The English Flower Garden*** for the modern
  mixed border tradition.
- **Christopher Lloyd, *The Well-Tempered Garden*** (cite, don't
  paraphrase — 1970s onwards).
- **Pre-1928 RHS Journal** for old roses + heritage cultivars.
- **Royal National Rose Society archives** (where PD).

## Length guidance

| Sub-topic | Word count |
|---|---|
| Single-variety profile | 600 to 900 |
| Sowing or pruning guide | 1,000 to 1,500 |
| Full growing guide on a primary flower (rose, dahlia, sweet pea, cosmos) | 1,800 to 3,000 |

## Self-critique pass (flowers additions)

1. Rose type named on rose pruning guides.
2. Clematis group named on clematis pruning guides.
3. Cut stage named on cut-flower guides.
4. Edible flowers have a one-line safety caveat where the part of
   the flower matters.
5. No "showstopper" or hype register.

## Worked example (compact)

```json
{
  "slug": "growing-cosmos-from-seed",
  "title": "Growing cosmos from seed",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "flowers",
  "difficulty": "BEGINNER",
  "garden": {
    "plantSlug": "cosmos",
    "subTopic": "sowing",
    "plantingMonths": ["march", "april", "may"],
    "harvestMonths": ["july", "august", "september", "october"],
    "containerFriendly": true,
    "indoorFriendly": false
  },
  "techniqueSlugs": ["module-sowing", "pricking-out", "hardening-off-seedlings", "pinching-out", "deadheading"],
  "criticalTechniques": ["pinching-out", "deadheading"]
}
```

## Image policy

NEVER generate images. Image worker sources verified hero per
`feedback_image_strategy.md`.

## See also

- `docs/garden-author.md` umbrella.
- `docs/garden-propagation-author.md`.
- `docs/garden-pest-disease-management-author.md`.
- `docs/garden-wildlife-gardening-author.md` for pollinator-focused
  flower content (currently stub).
