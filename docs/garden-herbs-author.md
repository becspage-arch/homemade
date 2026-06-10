# Garden / Herbs authoring

Canonical input for any worker session that drafts a tutorial under
`garden/herbs`. Culinary herbs only: Mediterranean perennials
(rosemary, thyme, sage, oregano, marjoram, lavender for culinary use),
tender annuals (basil, coriander, dill, chervil, summer savory),
hardy biennials (parsley, chervil), perennial soft herbs (mint,
chives, lemon balm, lovage, tarragon).

## Status

`SubCategory.autopilotEnabled = true` for `garden/herbs`.

## Pre-read (MANDATORY)

- `docs/garden-author.md` umbrella.
- `docs/voice-spec-2026-05-21.md`, `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`, `docs/common-issues.md`.

## Scope (what belongs here)

- Mediterranean perennial herbs: rosemary, thyme (English, lemon,
  creeping), sage (common, purple, tricolor, pineapple), oregano,
  marjoram, winter savory, bay, hyssop, lavender.
- Tender annual herbs: basil (Genovese, Greek, Thai, lemon),
  coriander, dill, chervil, summer savory.
- Hardy biennials: parsley (flat-leaf + curly), chervil.
- Perennial soft herbs: chives, garlic chives, mint (spearmint,
  peppermint, apple mint, Moroccan), lemon balm, lemon verbena,
  lovage, French + Russian tarragon, sweet cicely, sorrel, salad
  burnet.

## Scope (what does NOT belong here)

- Medicinal preparations, dosage, therapeutic claims → Herbal
  category. Cross-link with `subTutorialCard`.
- Microgreen versions of herbs (basil micro) → `microgreens`.
- Indoor windowsill herb collections → `indoor-gardening`
  (cross-link).
- Foraged wild herbs (wild garlic, wild mint) → `foraging`.

## Sub-topic mix

- `growing` carries most reader weight (the full plant-to-pinch
  narrative).
- `pruning` is high-leverage for woody Mediterranean herbs (lavender,
  rosemary, sage, thyme): the canonical "cut back hard in spring, do
  not cut into old wood" guide.
- `harvesting` is short and specific (cut basil from the top, mint
  from the bottom).
- `saving-seed` is high-leverage for the annuals (coriander, dill,
  basil come true from saved seed) and the biennials (parsley,
  chervil).
- `variety-selection` for basil (over a dozen named cultivars),
  thyme (lemon, creeping, common), mint (spearmint vs peppermint).

## Region-aware metadata

- `garden.plantingMonths` — for Mediterranean perennials, the spring
  planting + autumn cuttings windows. For tender annuals, the indoor-
  start + plant-out windows.
- `garden.harvestMonths` — many herbs harvest year-round once
  established (Mediterranean perennials, evergreen herbs). State the
  best windows for cropping (before flowering for soft herbs;
  any time for woody perennials).
- `garden.containerFriendly` — TRUE for almost every herb. Pot culture
  suits drainage-loving Mediterraneans and contains the spread of
  mint.
- `garden.indoorFriendly` — true for windowsill basil, parsley,
  chives; false for woody Mediterraneans (need outdoor light + cold
  dormancy).
- `garden.regionsApplicable` — `['UK']` default. Mediterranean herbs
  travel well to `EU`, `US_NORTH` (with winter protection), `AU_NZ`.
- `frostSensitivity` (master): hardy (rosemary, sage, thyme, mint,
  chives), half-hardy (lavender outdoors in cold UK), tender (basil,
  coriander, lemon verbena).

## Critical techniques

- `taking-cuttings-semi-ripe` (rosemary, sage, thyme, lavender)
- `direct-sowing` (coriander, dill)
- `module-sowing` (basil, parsley)
- `pricking-out`
- `watering-shallow-frequent` (basil) vs
  `watering-deep-infrequent` (Mediterranean)
- `pinching-out` (basil tip pinch)
- `winter-mulching-mediterranean-herbs`
- `dividing-perennial-clumps` (chives, mint, lemon balm)

`techniqueSlugs[]` extends with: `bolting-prevention`,
`succession-sowing-soft-herbs`, `bay-as-standard-tree`,
`overwintering-mediterranean-herbs`, `gravel-mulch-mediterranean`,
`mint-containment`, `seed-collection-umbellifer`,
`hardening-off-tender-herbs`.

## Materials master list

- **Tools:** scissors, snips, secateurs, dibber, narrow trowel.
- **Containers:** terracotta pots (25 cm for Mediterraneans for
  drainage), modules, herb planter (long shallow tray for parsley /
  chives / basil), windowsill tray.
- **Soil + feed:** loam-based potting compost (John Innes No. 2 style;
  no brand pin) for Mediterraneans, multi-purpose for soft herbs,
  horticultural grit for drainage. Low feed for Mediterraneans (rich
  soil dilutes oils).
- **Protection:** cloche or cold frame for early basil, fleece for
  borderline-hardy lavender in cold UK winters.

## Output contract

`subCategorySlug: 'herbs'`. `type: 'GROWING_GUIDE'`. Garden block per
umbrella.

## Body shape

Per umbrella. Herbs-specific notes:

- Opening paragraph names the herb, places it (Mediterranean / tender
  / hardy soft), states the schedule shape and how it gets used in
  the kitchen.
- The "Choosing a position" H2 carries the drainage discussion for
  Mediterraneans. Wet feet kills more rosemary than cold.
- The "Through the season" H2 covers pinching for basil (top
  pinching = bushier plant), bolting for coriander (long-day-induced
  bolting in summer; succession sow).
- `troubleshooter` covers the top failures: leggy basil, bolting
  coriander, woody chives (need division), winter death of rosemary
  from waterlogging, mint runner invasion.

## Voice rules (herbs-specific additions)

- **No "kitchen herb garden transformation" register.**
- **Drainage discussion mandatory** for Mediterranean herbs. State
  the consequence of wet feet, not just "well-drained soil".
- **Mint goes in a pot** unless the body explicitly says otherwise.
  Containment is a structural decision, not a footnote.
- **No therapeutic claims.** Even rosemary, sage, lavender (which
  cross with Herbal). Stop at the kitchen. Cross-link to Herbal for
  medicinal uses.
- **Latin binomial on first use** when the common name is ambiguous
  (lemon thyme vs lemon-scented thyme).
- **Variety profiles include culinary use.** Genovese basil (pesto),
  Greek basil (small leaves, intense flavour, low border).

## Sources (herbs tilt)

- **RHS herb pages** for current authority.
- **Joy Larkcom on herbs** (Grow Your Own Vegetables has a herb
  section).
- **Mrs Earle § culinary herbs** for historical garden context.
- **Gerard's Herball (1597), Culpeper's Complete Herbal (1653)** —
  cite with care: historical, not medical authority. The cooking-
  garden references in those texts are useful; treat any medicinal
  text as Herbal-category source material.
- **Pre-1928 RHS Journal**.

## Length guidance

| Sub-topic | Word count |
|---|---|
| Single-variety profile | 600 to 900 |
| Growing or pruning guide on a single herb | 1,000 to 1,500 |
| Full growing guide on a primary herb (basil, rosemary, parsley, mint) | 1,800 to 2,500 |

## Self-critique pass (herbs additions)

1. Drainage discussion present on Mediterranean herb guides.
2. Mint containment named on mint guides.
3. No therapeutic claims; medicinal use cross-linked to Herbal
   rather than asserted.
4. Pinching cadence stated on basil; bolting prevention stated on
   coriander.
5. `containerFriendly: true` for almost every herb (verify edge cases).

## Worked example (compact)

```json
{
  "slug": "growing-basil-from-seed",
  "title": "Growing basil from seed",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "herbs",
  "difficulty": "BEGINNER",
  "garden": {
    "plantSlug": "basil",
    "subTopic": "sowing",
    "plantingMonths": ["march", "april", "may", "june"],
    "containerFriendly": true,
    "indoorFriendly": true,
    "regionsApplicable": ["UK", "EU", "US_NORTH"]
  },
  "techniqueSlugs": ["module-sowing", "pricking-out", "pinching-out", "hardening-off-seedlings"],
  "criticalTechniques": ["pinching-out"]
}
```

## Image policy

NEVER generate images. Image worker sources verified hero per
`feedback_image_strategy.md`.

## See also

- `docs/garden-author.md` umbrella.
- `docs/garden-propagation-author.md` for stand-alone cuttings method.
- `docs/garden-indoor-gardening-author.md` for windowsill herb
  collections.
