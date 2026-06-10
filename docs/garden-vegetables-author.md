# Garden / Vegetables authoring

Canonical input for any worker session that drafts a tutorial under
`garden/vegetables`. Vegetables is the largest plant-family sub-cat:
beans, brassicas, alliums, roots, salads, fruiting vegetables (tomato,
courgette, cucumber, pepper, aubergine), squash, sweetcorn, perennial
vegetables (asparagus, rhubarb, globe artichoke).

## Status

`SubCategory.autopilotEnabled = true` for `garden/vegetables`. The
autopilot routine picks vegetables on its sub-cat round-robin and
loads this prompt as the master for the batch.

## Pre-read (MANDATORY)

- `docs/garden-author.md` (umbrella) — shared sub-topic body shapes,
  voice rules, output contract, sources.
- `docs/voice-spec-2026-05-21.md` and
  `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`, `docs/common-issues.md`.

## Scope (what belongs here)

- Annual vegetables: tomato, courgette, cucumber, pepper, aubergine,
  bean (broad, French, runner), pea, sweetcorn, brassicas (cabbage,
  cauliflower, broccoli, Brussels sprout, kale, kohl rabi), alliums
  (onion, shallot, garlic, leek), roots (carrot, parsnip, beetroot,
  turnip, swede, radish), salads (lettuce, rocket, salad mix, chicory,
  endive), spinach, chard, squash, pumpkin.
- Perennial vegetables: asparagus, rhubarb, globe artichoke,
  Jerusalem artichoke, perennial kale, sea kale.

## Scope (what does NOT belong here)

- Herbs (parsley is a herb here despite culinary overlap).
- Fruit (strawberry, raspberry, blueberry).
- Plant-agnostic propagation method guides → `propagation`.
- Plant-agnostic pest/disease guides → `pest-disease-management`.
- Seasonal task lists across multiple plants → `seasonal-care`.

## Sub-topic mix

Vegetables guides spread across all eight sub-topic axes from the
umbrella (`sowing` / `growing` / `harvesting` / `saving-seed` /
`pruning` / `pest-management` / `season-extension` /
`variety-selection`). Weight by reader value:

- `sowing` and `growing` carry most reader weight (the canonical
  "how to grow X from seed to plate" guide).
- `harvesting` is its own short guide for crops where the cue is
  non-obvious (when an onion is ready; when sweetcorn is ripe).
- `pest-management` is per-pest-per-plant when the pest is plant-
  specific (cabbage white on brassicas, carrot fly on carrot). Cross-
  plant pest guides go to `pest-disease-management`.
- `variety-selection` is high-leverage for tomato, pepper, bean,
  squash, potato; lower for one-variety crops.

## Region-aware metadata

Populate the `garden` block per the umbrella's contract. For
vegetables specifically:

- `garden.plantingMonths` — the UK indoor + outdoor sowing window
  combined unless the body splits them.
- `garden.harvestMonths` — UK cropping window.
- `garden.containerFriendly` — true for tomato, pepper, courgette in
  large pots; false for sweetcorn, brassicas at scale, parsnip.
- `garden.indoorFriendly` — true for windowsill salads, microleaf
  versions of brassicas. False for the headline crop (tomato outdoors
  in fruit; brassicas need scale).
- `garden.regionsApplicable` — `['UK']` default. Add `EU` for similar
  oceanic-temperate climates; `US_NORTH` (Pacific NW, New England),
  `US_SOUTH` (mid-Atlantic, southern US); `AU_NZ` and `ZA` only when
  the schedule body explicitly handles hemisphere flip.

`frostSensitivity` (master Plant column when wired) divides the
schedule: hardy crops (parsnip, leek, kale) tolerate UK winter; half-
hardy (lettuce, pea) need cold-frame or fleece; tender (tomato,
courgette, bean, pepper) need indoor start + last-frost protection.

## Critical techniques

The must-know prerequisites for any vegetables guide:

- `reading-a-seed-packet`
- `sowing-depth`
- `spacing-fundamentals`
- `hardening-off-seedlings`
- `pricking-out`
- `watering-deep-infrequent`
- `frost-protection-fleece`
- `crop-rotation`

`techniqueSlugs[]` per-tutorial pulls from the broader list:
`succession-sowing`, `direct-sowing`, `module-sowing`, `potting-on`,
`thinning`, `earthing-up` (potato, leek), `pinching-out` (tomato side-
shoots), `staking`, `mulching`, `companion-planting`,
`organic-pest-control-hand-picking`, `organic-pest-control-netting`,
`organic-pest-control-biological`, `succession-planting`, `chitting`
(potato), `green-manure`, `cover-cropping`.

## Materials master list

- **Tools:** trowel, dibber, hori-hori, hand fork, rake, seed-tray,
  module-tray, propagator (cold + heated), watering can (rose + fine
  rose), hoe (Dutch + draw + onion), secateurs, gardening gloves.
- **Containers:** seed trays, modules (24 / 40 cell), pots (7 cm,
  9 cm, 12.5 cm, 1 L, 7 L), grow bags, fabric pots, raised bed.
- **Supports:** bamboo canes, pea sticks, soft string, cane caps,
  netting (frost / butterfly / bird), fleece.
- **Soil + feed:** multi-purpose peat-free compost, seed compost,
  general-purpose fertiliser (no brand pin), tomato feed (potash-
  rich), liquid seaweed, well-rotted manure or garden compost.
- **Protection:** horticultural fleece, cloche, cold frame, mini
  polytunnel, slug barrier (copper tape, wool pellets).

## Output contract

Per umbrella. `categorySlug: 'garden'`, `subCategorySlug:
'vegetables'`, `type: 'GROWING_GUIDE'`. The `garden` block populated as
above.

## Body shape

Use the sub-topic body shape from the umbrella (§ Sub-topic axis).
Vegetables-specific notes:

- Opening paragraph: name the plant, place it (UK kitchen garden /
  allotment / raised bed / container), state the schedule shape
  ("indoor start in March, plant out late May, crop July to October")
  in plain English before any botanical detail.
- `suppliesCard` for tool + container + protection kit. Cap at the
  essentials; expand only if the plant warrants (tomato wants
  staking + feed + side-shoot tool).
- `troubleshooter` covers the plant's top 5 failure modes (damping
  off, leggy seedlings, blossom-end rot on tomato, splitting carrot,
  bolting lettuce).
- Cross-link with `subTutorialCard` to the propagation method
  (hardening off, pricking out) so the body doesn't restate.

## Voice rules (vegetables-specific additions)

- **No "supermarket" comparisons.** No "tastes nothing like
  supermarket". State what the plant tastes like, factually.
- **No "thriving" / "abundant" / "bumper crop"** unless the line is
  factual (a "bumper crop" framed as a number — 12 kg of tomato per
  plant in a good year — is fine).
- **Use the British vegetable name first.** Courgette (not zucchini),
  aubergine (not eggplant), swede (not rutabaga), beetroot (not just
  beet), spring onion (not green onion or scallion). Mention the US
  alias in surrounding prose so search resolves both.
- **F1 vs open-pollinated.** Be plain about which is which on
  variety-selection guides. F1 seed doesn't come true; open-pollinated
  does.

## Sources (vegetables tilt)

From the umbrella source list, lean on:

- **Joy Larkcom, *Grow Your Own Vegetables*** for current authority;
  cite, don't paraphrase.
- **Mrs Beeton § kitchen garden** for historical context on Victorian
  vegetable culture (much of the 19th-century kitchen garden practice
  is the source of modern allotment practice).
- **RHS vegetable pages** for variety-specific schedules.
- **USDA cooperative extension vegetable pages** for US schedules
  where the guide adds `US_NORTH` / `US_SOUTH`.
- **Pre-1928 garden journals (Royal Horticultural Society Journal)**
  for variety history.

## Length guidance

| Sub-topic | Word count |
|---|---|
| Short profile / single-axis | 600 to 900 |
| Sowing or harvesting guide on a mid-complexity vegetable | 1,000 to 1,500 |
| Full growing guide on a primary crop (tomato, potato, courgette, squash) | 1,800 to 3,000 |

## Self-critique pass (vegetables additions)

In addition to the umbrella checklist:

1. Plant name in the British form first; US alias surfaced in prose.
2. Schedule months align with `garden.plantingMonths` /
   `harvestMonths` arrays.
3. Variety guide names 3 to 5 named varieties with one factual line
   each + a one-paragraph "what to avoid".
4. Pest guide closes with "Prevention next year" H2.
5. Every `techniqueSlugs[]` entry wrapped inline at least once with a
   `techniqueLink` mark; `criticalTechniques[]` subset of
   `techniqueSlugs[]`.

## Worked example (compact)

```json
{
  "slug": "growing-courgettes",
  "title": "Growing courgettes",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "vegetables",
  "difficulty": "BEGINNER",
  "garden": {
    "plantSlug": "courgette",
    "subTopic": "growing",
    "plantingMonths": ["april", "may"],
    "harvestMonths": ["july", "august", "september", "october"],
    "containerFriendly": true,
    "indoorFriendly": false,
    "regionsApplicable": ["UK", "EU"]
  },
  "techniqueSlugs": ["hardening-off-seedlings", "module-sowing", "watering-deep-infrequent", "mulching"],
  "criticalTechniques": ["hardening-off-seedlings", "watering-deep-infrequent"]
}
```

## Image policy

NEVER generate images. The dedicated image worker sources hero
imagery from public-domain RHS plates, Wikimedia Commons botanical
illustrations, USDA PD photography, and verified gardener-shared CC0
photography per `feedback_image_strategy.md`.

## See also

- `docs/garden-author.md` umbrella.
- `docs/garden-anti-tells.md`.
- `docs/garden-propagation-author.md` for method-only propagation
  guides referenced via `subTutorialCard`.
- `docs/garden-pest-disease-management-author.md` for cross-plant pest
  guides.
- `docs/garden-seasonal-care-author.md` for month-by-month task lists.
