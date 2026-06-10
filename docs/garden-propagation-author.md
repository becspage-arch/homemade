# Garden / Propagation authoring

Canonical input for any worker session that drafts a tutorial under
`garden/propagation`. Plant-agnostic propagation method guides: seed
sowing, cuttings (softwood, semi-ripe, hardwood, root), division,
layering, simple grafting. Methods that work across plant families.

## Status

`SubCategory.autopilotEnabled = true` for `garden/propagation`.

## Pre-read (MANDATORY)

- `docs/garden-author.md` umbrella.
- `docs/voice-spec-2026-05-21.md`, `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`, `docs/common-issues.md`.

## Scope (what belongs here)

- Seed propagation methods: direct sowing, module sowing, broadcast
  sowing, station sowing, fluid sowing, pre-germination (chitting,
  pre-soaking, stratification, scarification).
- Cuttings: softwood (June, fast-growing tip), semi-ripe (August,
  partly hardened wood), hardwood (autumn / winter, dormant wood),
  root cuttings (winter, lifting and slicing tap-roots), leaf
  cuttings (begonia, streptocarpus, African violet).
- Division: clump division (perennials), root-ball division (chives,
  hemerocallis, hosta), runner division (strawberry, raspberry sucker).
- Layering: simple layer (clematis, magnolia), tip layer (blackberry,
  loganberry), serpentine layer (long-stem climbers), air layer
  (tropical houseplants).
- Grafting basics: whip-and-tongue (apple, pear), cleft graft,
  budding (T-budding, chip-budding).
- Seed saving + storage methods (cross-link to `vegetables` /
  `flowers` / `herbs` for plant-specific saving).
- Aftercare to transplant: damping-off prevention, pricking out,
  potting on, hardening off.

## Scope (what does NOT belong here)

- Plant-specific "growing X from seed" guides → the plant's sub-cat
  (e.g. `growing-tomatoes-from-seed` in `vegetables`).
- Mushroom inoculation → `mushroom-growing`.
- Microgreen tray sowing → `microgreens`.

## Sub-topic mix

- `sowing` for seed propagation methods.
- `growing` for the broader propagation method (a softwood cuttings
  guide, an air-layering guide).
- `saving-seed` for seed handling methods that apply across plants.
- `season-extension` collapses to "the right time of year for this
  method" guidance.

## Region-aware metadata

- `garden.plantingMonths` — the propagation window for the method
  (e.g. softwood June; semi-ripe August; hardwood October to
  January). State in UK months; the renderer translates for
  Southern Hemisphere.
- `garden.harvestMonths` — empty unless the method yields a
  finished plant in a known window.
- `garden.containerFriendly` — true for most propagation methods
  (modules, trays, pots).
- `garden.indoorFriendly` — true for indoor-start methods.
- `garden.regionsApplicable` — leave null. The renderer derives
  from the master species + the guide's hardiness metadata; the
  derivation also handles hemisphere translation for timing.

## Critical techniques

- `module-sowing`
- `direct-sowing`
- `taking-cuttings-softwood`
- `taking-cuttings-semi-ripe`
- `taking-cuttings-hardwood`
- `taking-cuttings-root`
- `dividing-perennial-clumps`
- `layering-simple`
- `hardening-off-seedlings`
- `pricking-out`

`techniqueSlugs[]` extends with: `seed-stratification-cold`,
`seed-stratification-warm`, `seed-scarification-nick`,
`seed-scarification-soak`, `pre-soaking-seed`, `chitting-potato`,
`fluid-sowing`, `station-sowing`, `damping-off-prevention-fungicide-free`,
`rooting-hormone-use-and-skip`, `mist-bench-setup`,
`heated-propagator-temperature-by-family`,
`whip-and-tongue-graft`, `t-budding`, `chip-budding`,
`air-layering-houseplant`, `serpentine-layering-vine`,
`storing-saved-seed-paper-envelope`, `viability-test-paper-towel`.

## Materials master list

- **Tools:** sharp knife (Stanley / scalpel for cuttings; budding
  knife for grafting), secateurs, propagation razor, dibber, narrow
  trowel, sieve.
- **Containers:** seed tray, modules (24 / 40 / 60 cell), 9 cm pots,
  1 L pots, 7 cm cuttings pot, propagator (cold + heated).
- **Medium:** seed compost (low-nutrient, fine-textured), 50 / 50
  perlite-compost cuttings mix, sharp sand, vermiculite, sphagnum
  moss (air layer), coir.
- **Hormone:** rooting hormone (where helpful; many cuttings strike
  without it — say which). Liquid, gel, powder.
- **Grafting:** grafting wax, grafting tape, parafilm.
- **Cover:** clear plastic dome (humidity), fleece (cold frame),
  newspaper (germination dark).

## Output contract

`subCategorySlug: 'propagation'`. `type: 'GROWING_GUIDE'`. Garden
block per umbrella. `garden.plantSlug` stays null / omitted —
propagation is an activity-axis sub-cat and the upload validator
rejects a plantSlug here. If the method has a worked-example species
(softwood cuttings worked through with lavender), name the species
in body prose only.

## Body shape

Per umbrella. Propagation-specific notes:

- Opening paragraph names the method, places it (UK garden /
  windowsill / greenhouse / cold frame), states what plants the
  method suits (woody perennials for semi-ripe; tap-rooted perennials
  for root cuttings; clumping perennials for division), and the
  rough success rate ("strike rate 60 to 80 % in a good batch").
- "Choosing material" H2 (in place of "Choosing a position"): how
  to spot the right shoot / right time of year / right plant.
- "Setting up" H2: cuttings medium mix, tray + dome, hormone-or-
  not call.
- "Taking the cutting" or "Making the division" H2: numbered
  `orderedList` steps.
- "Aftercare" H2: humidity, watering, light, when to pot on,
  hardening off.
- `troubleshooter` covers method failures: rotted cuttings (too
  wet / too hot / too humid), failed strike (wrong wood stage /
  wrong time of year / hormone-needed-but-not-used), damping off,
  loss-on-transplant.

## Voice rules (propagation-specific additions)

- **Strike rate stated honestly.** Some methods (lavender semi-ripe)
  strike at 80 %+ for a beginner; others (rose hardwood) strike at
  20 to 40 %. Don't promise success.
- **Hormone-or-not stated.** Many cuttings strike without rooting
  hormone. State when it helps, when it doesn't.
- **Worked example plant named.** A softwood-cuttings guide that
  uses fuchsia as the worked example says so up front; the reader
  applying the method to another plant adjusts the wood stage.
- **No "miracle propagation" register.** No "any plant, any time, no
  problem". Method matches plant + time.
- **Seasonal windows specific.** "Take semi-ripe cuttings in August"
  beats "take semi-ripe cuttings in late summer". Give a month +
  cue.
- **Sterile work surface for sterile-medium methods** (orchid keiki,
  some grafting). State this in one inline line where it matters.

## Sources (propagation tilt)

- **RHS propagation pages** for current authority.
- **Alan Toogood, *Plant Propagation* (RHS / DK, 1999)** is the
  modern UK reference; cite, don't paraphrase.
- **Hartmann + Kester, *Plant Propagation: Principles and Practices*
  (multiple editions)** for the academic depth.
- **Pre-1928 RHS Journal** for historical propagation practice.
- **Mrs Loudon, Mrs Beeton** for kitchen-garden propagation context
  (limited).
- **USDA cooperative extension propagation material** for US trial
  data.

## Length guidance

| Sub-topic | Word count |
|---|---|
| Single-method short guide (chitting, pricking out) | 600 to 900 |
| Single-method full guide (softwood cuttings; root division) | 1,000 to 1,500 |
| Comprehensive guide (cuttings season-by-season; division across perennials) | 1,800 to 2,500 |

## Self-critique pass (propagation additions)

1. Strike rate stated honestly (where the method has measurable
   strike-rate data).
2. Hormone-or-not call made explicitly.
3. Seasonal windows in months with cue.
4. Worked example plant named.
5. No "miracle" register.
6. Aftercare H2 present (potting on, hardening off, transplant).

## Worked example (compact)

```json
{
  "slug": "taking-semi-ripe-cuttings",
  "title": "Taking semi-ripe cuttings (lavender, rosemary, sage)",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "propagation",
  "difficulty": "BEGINNER",
  "garden": {
    "subTopic": "growing",
    "plantingMonths": ["july", "august", "september"],
    "containerFriendly": true,
    "indoorFriendly": false
  },
  "techniqueSlugs": ["taking-cuttings-semi-ripe", "hardening-off-seedlings", "rooting-hormone-use-and-skip"],
  "criticalTechniques": ["taking-cuttings-semi-ripe"]
}
```

## Image policy

NEVER generate images. Image worker sources verified hero per
`feedback_image_strategy.md`. Cuttings diagrams may use public-
domain RHS / Alan Toogood-era illustrations after licence
verification.

## See also

- `docs/garden-author.md` umbrella.
- `docs/garden-vegetables-author.md`,
  `docs/garden-fruit-author.md`, `docs/garden-herbs-author.md`,
  `docs/garden-flowers-author.md` for plant-specific seed + cuttings
  guides that reference this sub-cat's methods.
