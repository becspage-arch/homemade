# Garden / Foraging authoring

Canonical input for any worker session that drafts a tutorial under
`garden/foraging`. Wild food identification: UK hedgerow, woodland,
coastline. Absolute-beginner safety rules. Plants only; mushroom
foraging is its own separate scope.

## Status

`SubCategory.autopilotEnabled = true` for `garden/foraging`.

## Pre-read (MANDATORY)

- `docs/garden-author.md` umbrella.
- `docs/voice-spec-2026-05-21.md`, `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`, `docs/common-issues.md`.

## Scope (what belongs here)

- Hedgerow + woodland edible wild plants: wild garlic (ramsons), wood
  sorrel, three-cornered leek, jack-by-the-hedge, nettle, dandelion,
  wild fennel, wild marjoram, sweet cicely, salad burnet,
  primrose, violet.
- Hedgerow fruit: elderflower (May / June), elderberry (Aug / Sep),
  blackberry, sloe (blackthorn), hawthorn (haws), rowan (sorbus
  aucuparia berries), rosehip, crab apple, wild damson, bullace.
- Coastline plants: sea kale, samphire (marsh + rock — different
  species), sea aster, sea purslane, sea beet, alexanders.
- Beginner safety + ID guides: rule-of-three foraging confirmation,
  poisonous look-alikes, what to leave behind for wildlife.

## Scope (what does NOT belong here)

- Mushroom foraging — too high-stakes; pause for a dedicated worker
  with strict safety + identification expertise. Stub note in any
  draft that drifts into mushrooms: "Wild mushroom identification
  is out of scope for this guide; we cover cultivated mushrooms
  under `garden/mushroom-growing` and will commission a specialist
  wild-mushroom guide separately."
- Game / shellfish / fishing — not Garden.
- Cultivated escapes treated as foraged. State which is which.

## Sub-topic mix

- `harvesting` is the dominant sub-topic. "When + where + how to
  find + safety + identification" body shape.
- `variety-selection` for the related-species guides (three samphire
  species; multiple wild garlic family alliums; rowan vs sorbus
  varieties).
- `season-extension` collapses to "harvest window" guidance.
- Other sub-topics (sowing / pruning / pest-management) generally
  don't apply.

## Region-aware metadata

- `garden.plantingMonths` — left empty (foraging, not planting).
- `garden.harvestMonths` — the foraging window for the species.
- `garden.containerFriendly` — false.
- `garden.indoorFriendly` — false.
- `garden.regionsApplicable` — strict. UK hedgerow guides apply to
  UK + EU where species range overlaps; sea-foraging guides apply
  to the coastline they're written for. Do not pad.

## Critical techniques

- `rule-of-three-id-confirmation` (three independent ID features
  matching before eating)
- `poisonous-look-alike-comparison` (every guide names the most
  common toxic confusable)
- `foraging-legal-uk-summary` (the Wildlife and Countryside Act
  1981 + Theft Act 1968 summary: four Fs for hedgerow / common
  land: fruit, foliage, fungi, flowers, in moderation, for personal
  use; no uprooting; landowner permission for private land)
- `safe-quantity-rule-of-thirds` (take a third for yourself, leave
  a third for wildlife, leave a third for the plant to regenerate)
- `foraging-location-safety` (busy roads, dog-walking paths, sprayed
  edges to avoid)

`techniqueSlugs[]` extends with: `wild-garlic-id-vs-lily-of-valley`,
`wild-garlic-id-vs-autumn-crocus`, `elderflower-id-and-cordial-prep`,
`elderberry-cooking-mandatory`, `nettle-handling-and-cooking`,
`samphire-rock-vs-marsh-id`, `hawthorn-haw-processing`,
`rosehip-deseeding`, `sloe-frosting-before-gin`,
`alexanders-id-and-celery-substitute`.

## Materials master list

- **Tools:** wicker basket (lets pollen / seed disperse), pruning
  knife (Opinel No. 8 style; not affiliate framing), small secateurs,
  cloth bag (for soft fruit), gloves (nettle, blackthorn, sea
  buckthorn).
- **Field guide:** Richard Mabey, *Food for Free* (1972) is the
  foundational UK reference; cite, don't paraphrase. UK PD
  alternatives are limited.
- **App / camera:** photograph the find for confirmation before
  taking it. Don't list specific apps as authoritative ID.
- **Map / location notes:** sources for free-to-forage land
  (Ramblers, OS maps); no specific private locations.

## Output contract

`subCategorySlug: 'foraging'`. `type: 'GROWING_GUIDE'`. Garden block
per umbrella. `plantSlug` is the wild plant species (must exist in
the master table; many wild species may need adding to
`data/plants.ts` with a `wild: true` flag; flag in brief return if
missing).

## Body shape

Per umbrella. Foraging-specific notes:

- Opening paragraph names the plant in plain English + Latin
  binomial, places it (UK hedgerow / woodland / coast), states the
  season + ID features in 2 to 3 sentences.
- "ID features" H2 (in place of "Choosing a position" for foraging
  guides): visual cues (leaf shape, vein pattern, flower form,
  stem section), tactile / scent cues (crush a leaf — does it smell
  like garlic?), habitat (under deciduous shade in damp woodland;
  on chalk downland; in salt-spray range).
- "Poisonous look-alikes" H2: name the most common toxic confusable,
  the distinguishing features, the consequence if confused.
- "When + how to harvest" H2: window in the calendar, method (cut
  with knife, snap with hand, secateurs), what to leave behind.
- "What to do straight after" H2: storage (most wild greens last
  hours not days), processing (nettle cook before eating; elderberry
  cook before eating; sloe freeze before processing).
- "Legal + ethical" H2: a short, factual summary of UK foraging law
  (Wildlife and Countryside Act 1981; landowner permission for
  private land; Sites of Special Scientific Interest carry tighter
  rules), and an ethical line on leaving enough.
- `troubleshooter` covers ID + post-harvest failures: wrong
  species (the rule-of-three + ID-features signpost), stomach upset
  from undercooked nettle or elderberry, allergy first-time-try
  caution.

## Voice rules (foraging-specific additions)

- **Safety is structural, not a decoration.** The rule-of-three
  inline; the poisonous-look-alike H2 mandatory; the cook-first
  warning on nettle + elderberry inline as steps. One line each,
  per the safety-max-one-line rule, but multiple steps where the
  plant warrants.
- **Identification before eating, always.** The opening paragraph
  carries the line "verify your identification before eating; if in
  doubt, do not eat." One inline line.
- **No survivalist register.** No "live off the land", "free food",
  "save money on groceries". Wild food is a small seasonal
  supplement, not a livelihood.
- **No claims of nutritional superiority** over cultivated.
- **No rare-species harvesting.** Don't write a guide that
  encourages foraging of any species on the Red Data List or in
  ASNW (ancient semi-natural woodland) habitats. Bluebell bulb,
  ramson root, autumn crocus, butcher's broom — leave alone.
- **Wild garlic is the headline ID-vs-toxic guide.** It looks like
  lily of the valley and like autumn crocus (both poisonous); every
  wild garlic guide must walk through the distinguishing features.
- **No therapeutic claims.** Foraged plant in food only here; any
  medicinal use cross-links to Herbal.

## Sources (foraging tilt)

- **Richard Mabey, *Food for Free* (1972)** — foundational UK
  reference (in copyright; cite).
- **John Wright, *The Forager's Calendar* (2019)** — current UK
  reference (in copyright; cite).
- **RHS plant pages** for confirmation of edibility + safety.
- **Botanical Society of Britain and Ireland (BSBI) species
  accounts** for ID detail.
- **UK Forestry Commission woodland pages**.
- **National Trust + Wildlife Trusts foraging guidance** for
  reserve-specific rules.
- **Pre-1928 botanical floras** for ID; **Gerard's Herball** as
  historical context only (not for safety).

## Length guidance

| Sub-topic | Word count |
|---|---|
| Single-species short guide | 800 to 1,200 |
| Single-species with cooking notes | 1,200 to 1,800 |
| Multi-species seasonal guide (hedgerow autumn fruit) | 1,500 to 2,500 |

## Self-critique pass (foraging additions)

1. Rule-of-three ID confirmation appears inline (opening or
   ID features H2).
2. Poisonous look-alikes H2 present with named confusable.
3. UK foraging law summary present.
4. No claims of nutritional / cost-saving superiority.
5. No rare-species harvesting encouraged.
6. Cook-first warning on nettle, elderberry, sloe, hawthorn haw.
7. No therapeutic claims (any medicinal cross-link only).
8. Latin binomial on first species mention.

## Worked example (compact)

```json
{
  "slug": "foraging-wild-garlic-uk",
  "title": "Foraging wild garlic in the UK",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "foraging",
  "difficulty": "BEGINNER",
  "garden": {
    "plantSlug": "wild-garlic",
    "subTopic": "harvesting",
    "harvestMonths": ["march", "april", "may"],
    "containerFriendly": false,
    "indoorFriendly": false,
    "regionsApplicable": ["UK", "EU"]
  },
  "techniqueSlugs": ["rule-of-three-id-confirmation", "wild-garlic-id-vs-lily-of-valley", "wild-garlic-id-vs-autumn-crocus", "foraging-legal-uk-summary", "safe-quantity-rule-of-thirds"],
  "criticalTechniques": ["rule-of-three-id-confirmation", "wild-garlic-id-vs-lily-of-valley"]
}
```

## Image policy

NEVER generate images. Image worker sources verified hero per
`feedback_image_strategy.md`. Stricter than other sub-cats: hero
must show the species in habitat with the distinguishing features
visible. Verified against the Latin binomial.

## See also

- `docs/garden-author.md` umbrella.
- `docs/garden-mushroom-growing-author.md` (NOT mushroom foraging;
  cultivated mushrooms only).
- Herbal category for medicinal use of foraged plants.
