# Garden / Wildlife gardening authoring (specialist stub)

`SubCategory.autopilotEnabled = false` for `garden/wildlife-gardening`.

## Why the autopilot does NOT author here

Wildlife gardening is region-specific in a way most Garden sub-cats
are not. A pollinator-friendly plant list for the UK is wrong for the
US (different native bees, different blooming windows), wrong for
Australia (different native pollinator species + native plant
biosecurity), wrong for South Africa (different fynbos + savanna
species, different alien-invasive plant lists). The same applies to
bird-friendly planting, hedgehog highway construction (UK-specific
species), and pond ecosystem design.

Generic "wildlife gardening" drafts authored without
region-specific species lists land as vague or as actively wrong (a
plant on a UK pollinator-friendly list may be invasive in California
or eastern Australia). The research burden — verifying species
status by region — is heavy enough that a dedicated worker with
the regional plant + invertebrate references can do it cleanly,
where autopilot would short-cut.

## What the future specialist worker will do

When the time is right, a dedicated worker will commission this
sub-cat with:

1. UK-default pollinator-friendly plant lists, sourced from RHS
   Plants for Pollinators + Wildlife Trusts + Butterfly Conservation
   data, every plant verified non-invasive in the UK.
2. Native + naturalised UK plant lists separated cleanly.
3. Habitat-creation guides: hedgehog highway (UK-specific —
   13 cm by 13 cm hole in fence), bird box (RSPB-spec dimensions
   per species), bee hotel (solitary-bee specific, with
   maintenance), pond (size + depth + edge + plant selection),
   log pile, leaf-litter zone, dead-wood standing tree.
4. Beneficial-insect plant lists for IPM cross-link
   (`pest-disease-management` ↔ this sub-cat).
5. Bird-feeding seasonal guidance (winter heavy, breeding-season
   protein, autumn fruit-bearing shrubs for natural feed).
6. Pond guides with safety + maintenance (drowning risk where
   children, seasonal cleanout, fish-vs-amphibian trade-off).
7. Wildflower meadow + perennial native border guides.
8. Where a US / AU / NZ / ZA version is commissioned, a separate
   regional sub-guide is authored, not added as a flag on the UK
   guide.

The author-prompt for the dedicated worker will mirror the umbrella
voice rules with wildlife-gardening-specific additions:

- **Region-strict.** UK-default; other regions get their own
  guides.
- **Native vs non-native verified per region.** Don't list a plant
  as wildlife-friendly without checking its status in the region
  the guide is written for.
- **No invasive-species recommendation.** Buddleia is on the UK
  pollinator list and is also on Defra's invasive-non-native
  species watch-list — name the trade-off; in many other regions
  the plant is more strongly listed.
- **Plant Latin binomial mandatory.** Common names cross-confuse
  too easily for wildlife guides.
- **Wildlife claims grounded.** "Plant lavender for bees" is
  partly right (some bees, not all); cite RHS Plants for
  Pollinators data where applicable.
- **No nostalgic / sentimental register.** "Bringing wildlife into
  your garden" is fine as plain English. "Make your garden a
  sanctuary for our wild friends" is sentimental.
- **Habitat construction with safety lines** (pond drowning risk;
  bee-hotel maintenance; bird-box placement out of cat reach;
  hedgehog hole into known-safe neighbour-garden).
- **No "saving the bees" hype.** State what the action does
  ("planting catmint adds a season-long nectar source for honeybees
  and several solitary species") and let the reader make the
  contribution they want.

## Status until the specialist worker fires

`Category.garden.pipelineStatus = READY` (the parent flips).
`SubCategory.wildlife-gardening.autopilotEnabled = false`. Autopilot
round-robin skips this sub-cat when picking. Any draft tutorial
referencing `subCategorySlug: 'wildlife-gardening'` from another
worker session is held in DRAFT pending Rebecca review.

## See also

- `docs/garden-author.md` umbrella.
- `feedback_designer_onboarding_timing.md`.
- `docs/garden-pest-disease-management-author.md` for beneficial-
  insect IPM cross-link.
- `docs/garden-flowers-author.md` for nectar-bearing flower content
  that overlaps.
- `docs/garden-permaculture-author.md` for habitat-rich permaculture
  systems.
