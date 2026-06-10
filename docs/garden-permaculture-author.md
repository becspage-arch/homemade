# Garden / Permaculture authoring

Canonical input for any worker session that drafts a tutorial under
`garden/permaculture`. Forest gardens, polycultures, no-dig, sheet
mulching, perennial vegetables, water harvesting, swales, hugelkultur,
chop-and-drop. Design-based growing systems that minimise tillage and
external inputs.

## Status

`SubCategory.autopilotEnabled = true` for `garden/permaculture`.

## Pre-read (MANDATORY)

- `docs/garden-author.md` umbrella.
- `docs/voice-spec-2026-05-21.md`, `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`, `docs/common-issues.md`.

## Scope (what belongs here)

- Forest-garden layering (canopy, sub-canopy, shrub, herbaceous,
  ground cover, root, climber): how to assemble.
- Polycultures: pairing complementary plants (three sisters, oca +
  potato + dahlia tuber, tomato + basil + nasturtium).
- No-dig beds: setup, ongoing management, mulch sourcing.
- Sheet mulching (lasagne gardening): cardboard + compost layering
  to convert lawn to bed.
- Hugelkultur beds: buried-wood mounds.
- Swales + on-contour planting: catching and holding rainwater.
- Chop-and-drop: cutting green-manure crops in place.
- Perennial vegetable systems: Caucasian spinach, perennial kale
  (Daubenton), sea kale, perennial leek, Good King Henry, perennial
  onion, garlic mustard, wood sorrel.
- Comfrey + nettle teas: on-site liquid feed.
- Stacking functions: a plant doing two or more jobs (nitrogen-
  fixing + ground cover + bee plant).

## Scope (what does NOT belong here)

- Wildlife gardens (pollinator-focused, native species) →
  `wildlife-gardening` (stub).
- Garden design (aesthetic + plant combination) → `garden-design`
  (stub).
- Hot-composting method on its own → `soil-compost`.
- Pest beneficial insect systems → `pest-disease-management`.

## Sub-topic mix

- `growing` for system-as-a-whole guides (setting up a no-dig bed,
  building a forest garden in stages over years, designing a
  polyculture).
- `harvesting` for perennial-vegetable guides (when to cut sea kale,
  when to dig oca).
- `season-extension` for techniques that the system supports
  (microclimates around hugelkultur).
- `variety-selection` for perennial vegetable cultivars and forest-
  garden plant lists.

## Region-aware metadata

- `garden.plantingMonths` — varies wildly by system. Bed setup
  (sheet mulch, no-dig start) is best in autumn; planting into
  established systems is year-round depending on the plant.
- `garden.harvestMonths` — system harvest windows vary widely.
- `garden.containerFriendly` — false for system-level guides;
  permaculture is land-based.
- `garden.indoorFriendly` — false.
- `garden.regionsApplicable` — system principles travel well; the
  plant lists are region-specific. UK + EU default.

## Critical techniques

- `sheet-mulching`
- `no-dig-bed-setup`
- `no-dig-ongoing-mulch`
- `chop-and-drop`
- `green-manure`
- `comfrey-tea-making`
- `nettle-tea-making`
- `swale-on-contour`
- `hugelkultur-bed-building`
- `polyculture-bed-design`

`techniqueSlugs[]` extends with: `forest-garden-canopy-selection`,
`forest-garden-shrub-layer`, `forest-garden-ground-cover`,
`perennial-vegetable-establishment`, `three-sisters-planting`,
`oca-tuber-planting`, `comfrey-bocking-14-cuttings`,
`nitrogen-fixer-pairing`, `nurse-tree-planting`,
`leaf-mould-on-site-composting`.

## Materials master list

- **Tools:** broadfork, garden fork, mattock, no-dig hoe (oscillating
  / collinear), wheelbarrow, mulching rake.
- **Mulch + system materials:** cardboard (plain brown, no glossy
  print), straw, woodchip (council / arborist supply), compost
  (home-made or municipal), comfrey leaves, comfrey root crowns
  (Bocking 14), nettle stems, manure (well-rotted), green-manure
  seed (phacelia, mustard, field bean, vetch, clover, buckwheat).
- **No external feed inputs as default.** System produces its own
  fertility; mention this explicitly.

## Output contract

`subCategorySlug: 'permaculture'`. `type: 'GROWING_GUIDE'`. Garden
block per umbrella. `plantSlug` is a representative plant from the
system being described (or a placeholder if the system is plant-
agnostic; in that case state the constraint clearly in `notes`).

## Body shape

Per umbrella. Permaculture-specific notes:

- Opening paragraph names the system, places it (UK garden / small
  plot / large land), states what the system delivers (lower input,
  more resilient, perennial fertility cycle) in plain English. No
  ideology in the opening.
- "Choosing a position" H2 covers site assessment: contour, sun,
  wind, water flow, existing fertility.
- Multi-step system setup uses `orderedList` H2s by stage (year 1 /
  year 2 / year 3 for forest garden; week 1 / month 1 / month 3 for
  no-dig).
- `troubleshooter` covers system failures: woodchip nitrogen tie-up
  (mulch under, not into soil), slugs in damp no-dig beds, perennial
  weed breakthrough through sheet mulch, sheet-mulch settling and
  weed reappearance.

## Voice rules (permaculture-specific additions)

- **No ideology register.** No "regenerative revolution", "soil is
  alive", "feed the soil not the plant". State the practice and the
  result. Some permaculture writing leans evangelical; ours doesn't.
- **No claims of carbon sequestration or yield superiority over
  conventional** without citation. Trials are mixed; say so.
- **System names: use British spelling.** Hugelkultur (the German
  loan is standard), polyculture (not poly-culture), no-dig (not
  no-till in UK).
- **Bill Mollison + David Holmgren are cited correctly.** Original
  Designers' Manual (1988) is in copyright; cite the page reference
  + Holmgren Permaculture Principles (2002) where applicable. Do not
  paraphrase the principles as authored content.
- **"Permaculture" is one trademarked-adjacent word.** The Permaculture
  Association (UK) holds standards; don't claim PDC (Permaculture
  Design Certificate) authority Homemade doesn't have.
- **Comfrey Bocking 14** is the sterile cultivar; non-sterile comfrey
  spreads aggressively. Name the cultivar.

## Sources (permaculture tilt)

- **RHS no-dig pages** for current UK position.
- **Charles Dowding's writing** is current and authoritative for UK
  no-dig — cite, don't paraphrase.
- **Martin Crawford, *Creating a Forest Garden* (2010)** is the UK
  reference; cite, don't paraphrase.
- **Mollison + Holmgren** as above, cited not paraphrased.
- **Patrick Whitefield's earlier UK permaculture writing** is in
  copyright; cite.
- **University extension (e.g. UMass Extension on
  agroforestry)** for trial data.
- **Pre-1928 USDA bulletins on cover-cropping** for historical
  precedent on green manures.

## Length guidance

| Sub-topic | Word count |
|---|---|
| Single-system short profile (chop-and-drop in 600 words) | 600 to 900 |
| System setup guide (no-dig start, sheet mulch start) | 1,200 to 1,800 |
| Multi-year system guide (forest garden establishment) | 2,400 to 3,500 |

## Self-critique pass (permaculture additions)

1. Opening paragraph free of ideology / revolutionary framing.
2. Claims of carbon / yield / soil-life cited or framed as contested.
3. Comfrey Bocking 14 named when comfrey is included.
4. Mollison / Holmgren cited not paraphrased.
5. System steps in `orderedList` with year / month markers where
   the system extends over time.

## Worked example (compact)

```json
{
  "slug": "starting-a-no-dig-bed",
  "title": "Starting a no-dig bed",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "permaculture",
  "difficulty": "BEGINNER",
  "garden": {
    "plantSlug": "salad-mix",
    "subTopic": "growing",
    "plantingMonths": ["october", "november", "march", "april"],
    "containerFriendly": false,
    "indoorFriendly": false,
    "regionsApplicable": ["UK", "EU", "US_NORTH"]
  },
  "techniqueSlugs": ["sheet-mulching", "no-dig-bed-setup", "no-dig-ongoing-mulch"],
  "criticalTechniques": ["sheet-mulching", "no-dig-ongoing-mulch"]
}
```

## Image policy

NEVER generate images. Image worker sources verified hero per
`feedback_image_strategy.md`.

## See also

- `docs/garden-author.md` umbrella.
- `docs/garden-soil-compost-author.md` for compost-method-only guides.
- `docs/garden-vegetables-author.md` for crops grown in the system.
