# Garden authoring (category index)

Updated 2026-06-10 by the garden pipeline-setup pass. The single
multi-discipline prompt that existed before this date covered eight
sub-topic axes (sowing / growing / harvesting / saving-seed / pruning /
pest-management / season-extension / variety-selection) inside nine
plant-family sub-cats; that umbrella is preserved as the shared
sub-topic reference, with 17 per-sub-cat author prompts on top so each
sub-cat can carry its own scope, materials, techniques, and self-critique.

The garden category now has 17 sub-categories. The autopilot routine
picks a sub-category from the enabled set and loads the matching
`docs/garden-<sub-cat-slug>-author.md` file as the master prompt for
the batch.

## Sub-categories and prompts

| Sub-cat slug | Scope | Author prompt | Autopilot |
|---|---|---|---|
| `vegetables` | Annual + perennial vegetables, raised beds, containers, allotment work | [garden-vegetables-author.md](garden-vegetables-author.md) | ENABLED |
| `fruit` | Soft fruit, tree fruit, vines, fruit cages, espalier + cordon | [garden-fruit-author.md](garden-fruit-author.md) | ENABLED |
| `herbs` | Culinary herbs (Mediterranean + tender), propagation, replacement cycles | [garden-herbs-author.md](garden-herbs-author.md) | ENABLED |
| `flowers` | Edible flowers, cut-flower beds, companion-planting workhorses, annuals + perennials | [garden-flowers-author.md](garden-flowers-author.md) | ENABLED |
| `permaculture` | Forest gardens, polycultures, no-dig, perennial vegetables, water harvesting | [garden-permaculture-author.md](garden-permaculture-author.md) | ENABLED |
| `microgreens` | Tray-grown seedlings, indoor year-round, high yield per square metre | [garden-microgreens-author.md](garden-microgreens-author.md) | ENABLED |
| `hydroponics` | Soilless growing systems (NFT, DWC, ebb-and-flow, Dutch buckets) | [garden-hydroponics-author.md](garden-hydroponics-author.md) | ENABLED |
| `mushroom-growing` | Oyster, shiitake, lion's mane on logs and bags | [garden-mushroom-growing-author.md](garden-mushroom-growing-author.md) | ENABLED |
| `foraging` | Wild food identification (UK hedgerow, woodland, coastline) | [garden-foraging-author.md](garden-foraging-author.md) | ENABLED |
| `soil-compost` | Soil testing, hot + cold composting, leaf mould, green manures, mulching, no-dig | [garden-soil-compost-author.md](garden-soil-compost-author.md) | ENABLED |
| `propagation` | Plant-agnostic method guides: sowing, cuttings, division, layering, simple grafting | [garden-propagation-author.md](garden-propagation-author.md) | ENABLED |
| `pest-disease-management` | Cross-plant IPM, beneficial insects, organic controls, pest + disease ID | [garden-pest-disease-management-author.md](garden-pest-disease-management-author.md) | ENABLED |
| `seasonal-care` | Month-by-month tasks, pruning windows, frost protection, winter maintenance | [garden-seasonal-care-author.md](garden-seasonal-care-author.md) | ENABLED |
| `tools-equipment` | Hand + power tools, maintenance, storage, sharpening, choosing kit | [garden-tools-equipment-author.md](garden-tools-equipment-author.md) | ENABLED |
| `indoor-gardening` | Houseplants, windowsill herbs, microgreen trays, sprouting, light-only growing | [garden-indoor-gardening-author.md](garden-indoor-gardening-author.md) | ENABLED |
| `garden-design` | Layout planning, plant combinations, garden rooms, hard landscaping basics | [garden-garden-design-author.md](garden-garden-design-author.md) | SPECIALIST STUB |
| `wildlife-gardening` | Pollinator gardens, habitat creation, native plants, bird-friendly | [garden-wildlife-gardening-author.md](garden-wildlife-gardening-author.md) | SPECIALIST STUB |

Fifteen sub-cats are enabled for autopilot authoring. Two
(`garden-design`, `wildlife-gardening`) are stubs that explain why a
dedicated specialist worker is needed before autopilot fires against
them. Their `SubCategory.autopilotEnabled` rows are set to false; the
autopilot routine skips them when picking a sub-cat target.

## How the autopilot routine uses this

When the round-robin queue picks garden as the target category, the
routine:

1. Reads `SubCategory.autopilotEnabled = true AND categoryId =
   <garden>`.
2. Picks one enabled sub-cat. The pick strategy is round-robin within
   the category (least-recently-authored sub-cat first), broken by
   ordering on `SubCategory.order`.
3. Loads `docs/garden-<sub-cat-slug>-author.md` as the master prompt
   for the batch.
4. Runs the batch as it does for any other category.

Each per-sub-cat prompt is self-contained. The brief author and worker
session do not need to read this index; the autopilot routine resolves
the right file.

## Voice spec

All 17 prompts reference `docs/voice-spec-2026-05-21.md` (the growing-
guide register at §3.6 where present, or the closest applicable
section), plus `docs/voice-spec-quick-reference.md` 10-point
self-critique in §5.

Voice draws on Vita Sackville-West (precise, regional), Christopher
Lloyd (sharp where it helps), Monty Don (calm, practical, never twee),
Joy Larkcom (the kitchen-garden authority), Beth Chatto (right plant,
right place), Mary Berry's register applied to growing. Slow-living,
factual, useful. No Pinterest hype. No "transform your plot" framing.

## Image policy

NEVER generate images in the authoring path. The dedicated image worker
sources hero imagery from public-domain archives (RHS herbarium plates,
Wikimedia Commons botanical, Project Gutenberg garden books, USDA / RHS
PD photography) per `feedback_image_strategy.md`. Each per-sub-cat
prompt restates this.

## Region-aware authoring (canonical metadata)

Garden tutorials are written once and read globally. The renderer
composes the "Where this works best" card from structured metadata at
render time; the author does not write region-specific prose.

Authors populate the existing `garden` block on
`TutorialUploadInput`:

- `garden.plantSlug` — required. Must exist in `PlantVariety`.
- `garden.subTopic` — one of `sowing` / `growing` / `harvesting` /
  `saving-seed` / `pruning` / `pest-management` / `season-extension` /
  `variety-selection`.
- `garden.plantingMonths` / `garden.harvestMonths` — lower-case month
  arrays for the UK schedule (canonical).
- `garden.containerFriendly` / `garden.indoorFriendly` — booleans /
  null.
- `garden.regionsApplicable` — defaults to `['UK']`. Add `EU` /
  `US_NORTH` / `US_SOUTH` / `AU_NZ` / `ZA` only where the schedule
  genuinely applies.

The Tutorial table also carries deeper region columns wired up by
`phase_location_climate_paper_001`: `hemisphere`, `climateZones[]`
(Köppen, e.g. `['Cfb']` for oceanic UK), `usdaHardinessZones[]`,
`rhsHardinessZones[]`, `growingMonthsByHemisphere` (Json),
`frostSensitivity` (`hardy` / `half-hardy` / `tender`),
`dayLengthSensitive`, `primaryRegionWrittenFor` (human-readable, e.g.
`'UK and Northern Europe'`), `alsoGrowsIn` (human-readable). These
fields are populated by the upload pipeline from the master
`PlantVariety` row when the upload input wires them in (separate
worker); for now authors carry the schedule honestly in the body and
in `regionsApplicable`.

**The renderer is doing the translation, not the author.** Authors
write the canonical UK / Köppen-Cfb / USDA-9 schedule. Premium users
see month auto-translation and frost-date warnings against their
location silently. Free users see the friendly card
("Best for UK and Northern Europe. Not in the UK? See how to adjust
your timing."). Either way the source is the same canonical metadata.

## Category-level pipeline-setup standards

Populated by the garden pipeline-setup pass (2026-06-10):

- `Category.garden.targetTutorialCount = 4000`. The honest upper bound
  across all 17 sub-cats at maturity.
- `Category.garden.techniqueSlugs[]` — every technique referenced
  across the 17 author prompts, consolidated.
- `Category.garden.criticalTechniques[]` — the must-know
  prerequisites.
- `Category.garden.aliases[]` — search synonyms used by the
  cross-category sweep (UK / US name swaps such as
  `courgette` ↔ `zucchini`).

See `packages/db/scripts/populate-garden-pipeline-setup.ts` for the
exact values seeded.

## Sub-topic axis (shared body shape across sub-cats)

Every growing-guide tutorial picks one of eight sub-topic axes via
`garden.subTopic`. Each axis has a shared body shape used by every
per-sub-cat prompt. The shapes are defined once below so per-sub-cat
prompts can reference them without repetition.

### `sowing`

Body H2s, in order:

1. **When to sow** — the planting window in months, the cue (last
   frost date / soil temperature / day length), and the indoor /
   outdoor split.
2. **Where to sow** — module / pot / open ground; soil temperature
   needed for germination; light at the seedling stage.
3. **Depth and spacing** — single number with the unit (mm or cm).
   Spacing for the final stand position, not the sowing position.
4. **Germination cues** — days to first leaves; first true-leaf cue;
   signs the seed has failed.
5. **Aftercare to transplant** — watering rhythm, pricking out,
   potting on, hardening off. Hardening off is its own short paragraph
   for any frost-tender plant.
6. **What can go wrong** — short troubleshooter (3 to 5 entries):
   damping off, leggy growth, refusal to germinate.

Populate `garden.plantingMonths`. Leave `harvestMonths` empty unless
the brief carries them.

### `growing`

Full plant-to-harvest narrative. Body H2s:

1. **Choosing a position** — sun / soil / shelter requirements.
   Reference the master `PlantVariety` row's `sunRequirement` and
   `soilType` rather than restating platitudes.
2. **Planting out** — when, spacing, depth, support if needed.
3. **Through the season** — watering rhythm, feeding cadence,
   pinching / training / earthing up.
4. **Harvest** — short signpost; cross-link to the dedicated
   harvesting guide if one exists (`subTutorialCard`).
5. **What can go wrong** — 5 to 8 entry troubleshooter.

Populate both `plantingMonths` (planting-out window) and `harvestMonths`
(cropping window).

### `harvesting`

Body H2s:

1. **When the plant is ready** — visual cue + tactile cue. Avoid
   colour-only cues; pair with texture / size / sound.
2. **How to harvest** — tool (secateurs vs hand-pick vs knife),
   technique, time of day if it matters.
3. **What to do straight after** — storage, fridge vs cupboard, how
   long the fresh harvest keeps.
4. **Yield expectations** — typical kg or count per plant; what's a
   good crop, what's a poor crop.
5. **Successional harvest, where applicable** — pick-and-come-again
   crops (lettuce, kale, courgette) get their own paragraph.

Populate `harvestMonths` only.

### `saving-seed`

Body H2s:

1. **Whether to save** — open-pollinated vs F1 hybrid. F1 seed doesn't
   come true; say so plainly.
2. **When to save** — months and maturity cue.
3. **How to save** — dry vs wet seed processing (tomatoes need
   fermentation; beans dry on the plant).
4. **Storage** — paper envelope, cool dry place, viability in years.
5. **Sowing next year** — pre-soak / scarify / stratify needs.

Populate `harvestMonths` with the seed-collection months.

### `pruning`

Body H2s:

1. **Why prune** — air, light, fruit yield, shape. Some plants don't
   need pruning; cut if the answer is vague.
2. **When to prune** — months. Tree fruit has a winter and a summer
   window; berries have a specific post-fruiting window.
3. **What to cut** — diseased / dead / crossing / inward-growing.
   Plant-specific.
4. **How to cut** — tool, angle, where on the shoot.
5. **What to leave alone** — fruiting wood, flower buds, anything the
   reader might cut by accident.

Populate `plantingMonths` with the pruning window (the renderer
relabels the calendar strip on pruning guides).

### `pest-management`

Body H2s:

1. **The pest** — identification: appearance, life cycle, when it
   appears.
2. **Symptoms on the plant** — what the reader sees before they see
   the pest itself.
3. **Organic controls** — physical (hand-picking, netting), cultural
   (companion-planting, crop rotation), biological (predators). Cite
   the evidence level.
4. **Conventional controls** — named active ingredient where relevant.
   Factual mention, never endorsement. Include the line "follow the
   manufacturer's instructions and observe the harvesting interval"
   without quoting specific days.
5. **Prevention next year** — what to do at the start of the next
   season to break the cycle.

### `season-extension`

Body H2s:

1. **What it extends** — start of season, end of season, both?
2. **The technique** — cloche / cold frame / fleece / polytunnel /
   greenhouse / heated propagator. One per guide.
3. **How to set it up** — placement, ventilation, timing.
4. **What to grow under it** — crops that benefit; crops that don't.
5. **When to remove it** — the cue (overnight temperature / risk of
   overheating / first sustained warm spell).

### `variety-selection`

Body H2s:

1. **Why variety matters for this plant** — shape of diversity
   (size / colour / cropping window / disease resistance / regional
   adaptation).
2. **The reliable starting points** — 3 to 5 named open-pollinated or
   long-established varieties. Public-domain / heritage varieties
   first.
3. **What to grow for what** — pairing variety to purpose (paste
   tomato vs salad tomato).
4. **What to avoid** — overhyped, expensive, or poorly-adapted
   varieties; one paragraph, factual.
5. **Where to buy seed / plants** — UK suppliers as the default;
   list-format with no affiliate-style language.

## Voice rules (apply across every sub-cat)

- **No therapeutic claims.** Garden tutorials cover growing. Any health
  claim about a medicinal-adjacent plant (calendula, chamomile,
  lavender, rosemary) belongs in the Herbal category. Cross-link with
  `subTutorialCard`.
- **British plant names + scientific alongside.** Common name first,
  Latin binomial in italics on first mention. US / regional names go
  in surrounding prose ("courgette, called zucchini in the US") so
  search resolves both.
- **Metric, always.** Spacing in cm, depth in mm or cm, height in cm
  or metres. Imperial as an alias in prose at most.
- **Conventional dates with regional caveat.** "Sow indoors from late
  February" is fine for a UK guide. Don't write "plant in May" without
  "in temperate UK".
- **No "easy" without conditions.** "Strawberries are an easy first
  fruit if the bed drains well and the plants get six hours of direct
  sun" is fine; "strawberries are easy" is not.
- **Companion-planting requires citation.** "Tomatoes love basil" is
  folklore-strength. State the evidence level.
- **No medical thresholds.** Even on pest-management guides. Pesticide
  safety lines stay non-specific.
- **No financial outcomes.** No shop prices, no "savings vs
  supermarket", no yield-in-pounds-saved.
- **No em dashes or en dashes anywhere.** Replace with brackets,
  commas, full stops, or rewording. The voice-check CLI blocks them.
- **Safety advice: max one line.** No multi-paragraph safety blocks.
- **No false specificness.** No brand-pinned compost or feed names
  unless critical. "General-purpose fertiliser" beats a brand name.
- **No "perfect for".** No "ideal for". No "fine for almost everyone".
- **Word precision.** Growing, sowing, planting, harvesting, pruning,
  saving (seed), thinning, transplanting. Not "cultivating" (too
  abstract).
- **Orientation paragraph first.** Body opens with plain English
  (what this is, why you'd do it, when in the year it sits) before any
  botanic or taxonomic term.
- **Canonical TipTap blocks.** `troubleshooter` for troubleshooters,
  `infoPanel` for callouts, `suppliesCard` for kit.
- **Every text leaf has `"type": "text"`.** The public renderer drops
  nodes that hit its default case.
- **`glossaryTooltip` marks use `attrs.termSlug`** — not `slug`. Wrong
  key makes voice-check report every term unused.
- **Inline glossary coverage.** Every entry in `glossaryTerms[]` must
  appear inline at least once wrapped in `glossaryTooltip`. Registered-
  but-not-used and used-but-not-registered are both wrong.
- **Time units at scale.** Durations longer than 48 hours in days or
  weeks, never raw hours.

## Output contract (`TutorialUploadInput`)

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary>",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "<one of the 17 slugs above>",
  "difficulty": "BEGINNER",
  "season": null,
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "garden": {
    "plantSlug": "<must exist in PlantVariety>",
    "subTopic": "<one of the 8 sub-topic axes>",
    "plantingMonths": ["february", "march"],
    "harvestMonths": ["july", "august"],
    "containerFriendly": true,
    "indoorFriendly": false,
    "regionsApplicable": ["UK", "EU"]
  },
  "glossaryTerms": [
    { "slug": "hardening-off", "term": "Hardening off", "definition": "..." }
  ],
  "techniqueSlugs": ["hardening-off-seedlings", "pricking-out"],
  "criticalTechniques": ["hardening-off-seedlings"],
  "body": { "type": "doc", "content": [] }
}
```

`type` is always `GROWING_GUIDE`. `recipe` is null / omitted. `sewing`,
`primaryHerb`, `mindset` blocks are null / omitted.

## Sources

Acceptable garden sources (the well is deep):

- **RHS plant database** (https://www.rhs.org.uk/plants/) for current
  UK-relevant plants. Cite, don't paraphrase verbatim.
- **Mrs Loudon, *The Lady's Country Companion* (1845)** — Project
  Gutenberg.
- **Mrs Beeton's *Book of Household Management* (1861)**, garden
  section.
- **Gertrude Jekyll, *Wood and Garden* (1899), *Home and Garden*
  (1900), *Roses for English Gardens* (1902)** — Project Gutenberg.
- **William Robinson, *The English Flower Garden*** — Project
  Gutenberg.
- **Mrs Earle, *Pot-Pourri from a Surrey Garden* (1897)** — Project
  Gutenberg.
- **Vita Sackville-West, *In Your Garden* columns (1947 to 1961)** —
  some columns out of UK copyright by author-death rule; check the
  specific column.
- **USDA agricultural extension service material** — public domain.
- **University extension services** (Cornell, UC Davis, RHS partners)
  — open-access.
- **Pre-1928 horticultural journals** — UK Journal of the Royal
  Horticultural Society, Garden Magazine archives.

When source material is thin (modern hybrid varieties, hydroponic
systems beyond rule-of-thumb, current disease research), set
`sourceType: "SYNTHESISED"` and cite the next-closest material. Don't
invent a citation.

## Length guidance

| Complexity | Word count |
|---|---|
| Short profile | 600 to 900 |
| Mid | 1,000 to 1,500 |
| Deep dive | 1,800 to 3,000 |

## Self-critique pass

1. Walk every banned-phrase / banned-opener / em-dash / safety / price /
   wrap-up / glossary-coverage check from this prompt and
   `docs/garden-anti-tells.md`.
2. Plant-slug sanity. `garden.plantSlug` resolves against
   `packages/db/scripts/data/plants.ts`.
3. Region check. `garden.regionsApplicable` includes `UK` always. Add
   only where the schedule genuinely applies.
4. Calendar sanity. The months in `plantingMonths` / `harvestMonths`
   align with the body prose.
5. Pest claims grounded. Companion-planting and pest-management claims
   have a citation or are framed as traditional / contested.
6. Eight-rule pre-publish check from
   `docs/voice-spec-quick-reference.md` §5.

The deterministic `voice-check` CLI is the final gate.

## Status

`Category.garden.pipelineStatus = READY` (2026-06-10). Per the
null-sort rule (NULLS FIRST on `lastAutopilotRunAt`), garden joins the
back of the rotation at the next fire and waits its turn.

## See also

- `docs/voice-spec-2026-05-21.md`.
- `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`.
- `docs/common-issues.md`.
- `feedback_homemade_voice.md`, `feedback_image_strategy.md`,
  `feedback_measurement_units.md`,
  `feedback_temperature_and_units.md`,
  `feedback_free_signin_carrots.md`,
  `feedback_glossary_tooltip_termslug.md`,
  `feedback_tiptap_text_node_type.md`.
