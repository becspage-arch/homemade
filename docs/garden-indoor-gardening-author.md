# Garden / Indoor gardening authoring

Canonical input for any worker session that drafts a tutorial under
`garden/indoor-gardening`. Houseplants, windowsill herbs (the
indoor-only version), microgreen trays at the kit level, sprouts
(jar method), light-only growing rooms, propagation under lights.
Indoor-only methods that don't need outdoor space.

## Status

`SubCategory.autopilotEnabled = true` for `garden/indoor-gardening`.

## Pre-read (MANDATORY)

- `docs/garden-author.md` umbrella.
- `docs/voice-spec-2026-05-21.md`, `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`, `docs/common-issues.md`.

## Scope (what belongs here)

- Houseplants: pothos / devil's ivy, monstera, philodendron, spider
  plant, sansevieria, peace lily, ZZ plant, fiddle-leaf fig, rubber
  plant, parlour palm, asparagus fern, calathea / prayer plant,
  African violet, streptocarpus, begonia (rex + cane), pelargonium
  (indoor), orchid (Phalaenopsis as starter).
- Cacti + succulents indoors: jade, echeveria, haworthia, schlumbergera,
  Christmas / Easter cactus, lithops.
- Indoor edibles: windowsill basil, parsley, chives; microgreen
  trays at the kit level (cross-link to `microgreens` for full
  scope); sprouts (jar method).
- Indoor propagation: cuttings on a windowsill, leaf cuttings, water
  propagation, kokedama.
- Light-only growing rooms: LED-rack setups for year-round indoor
  food.
- Container + terrarium: closed terrarium, open succulent dish,
  bottle garden, vivarium-style.
- Indoor pests: fungus gnat, spider mite, mealybug, scale on
  houseplants (cross-link to `pest-disease-management`).

## Scope (what does NOT belong here)

- Hydroponic systems (recirculating reservoir + EC + pH) →
  `hydroponics`.
- Outdoor herb pots that come indoors over winter → `herbs`.
- Full microgreen system on an LED rack → `microgreens`.

## Sub-topic mix

- `growing` for full plant-care guides (how to look after a
  monstera; year-round African violet routine).
- `sowing` for indoor seed-starting methods.
- `variety-selection` for "best low-light houseplants",
  "houseplants for kids", "cat-safe houseplants".
- `pest-management` for the indoor pests.

## Region-aware metadata

- `garden.plantingMonths` — year-round indoor; populate all twelve.
- `garden.harvestMonths` — year-round.
- `garden.containerFriendly` — true (everything indoors is in a
  container).
- `garden.indoorFriendly` — true.
- `garden.regionsApplicable` — broad; populate all six regions
  honestly because indoor schedules really do work everywhere with
  the right light + temperature.
- `dayLengthSensitive`: relevant for short-day flowering houseplants
  (Christmas cactus, kalanchoe) — name in the body.

## Critical techniques

- `houseplant-light-by-window-orientation` (north / east / south /
  west)
- `houseplant-watering-by-finger-test`
- `houseplant-bottom-watering`
- `houseplant-feed-by-season` (growing season vs dormant)
- `houseplant-repotting-cadence`
- `cuttings-water-root-then-pot`
- `fungus-gnat-control-yellow-trap-and-dry-out`
- `terrarium-closed-vs-open-care`

`techniqueSlugs[]` extends with: `houseplant-quarantine-new-arrival`,
`houseplant-pest-inspection-monthly`,
`succulent-watering-soak-and-dry`,
`orchid-watering-ice-cube-myth-debunk`,
`orchid-light-east-window`,
`african-violet-bottom-water-wick`,
`monstera-aerial-root-management`,
`fiddle-leaf-fig-light-rotation`,
`sansevieria-low-light-tolerance`,
`peace-lily-droop-water-cue`,
`kokedama-moss-ball-make`,
`bottle-garden-closed-ecosystem`,
`led-grow-light-for-indoor-edibles`,
`sprout-jar-rinse-cycle`.

## Materials master list

- **Containers:** terracotta pot (porous; lets soil dry; favours
  succulents + Mediterraneans), plastic pot (retains moisture;
  favours tropicals), self-watering pot, cachepot (outer decorative
  with drained inner), glass jar (sprouts), terrarium globe / dome /
  cube.
- **Medium:** houseplant compost (peat-free multi-purpose with
  perlite), succulent / cactus compost (gritty, free-draining),
  orchid bark, sphagnum moss, vermiculite, perlite.
- **Light:** windowsill (state orientation), LED grow light (full-
  spectrum 6500 K for foliage, 3000 K for flowering), light meter
  (lux meter; budget option is a phone app).
- **Watering:** watering can (long spout), bottom-watering tray,
  capillary mat, self-watering reservoir, mister.
- **Pest:** yellow sticky trap (fungus gnat), nematode
  (Steinernema feltiae for fungus gnat), Encarsia formosa (where
  whitefly indoors), magnifier loupe (mite ID).
- **Feed:** balanced houseplant liquid feed (NPK roughly 1:1:1),
  African violet feed (lower N, higher P + K for flowering), orchid
  feed (specific formulation).

## Output contract

`subCategorySlug: 'indoor-gardening'`. `type: 'GROWING_GUIDE'`.
Garden block per umbrella.

## Body shape

Per umbrella. Indoor-gardening-specific notes:

- Opening paragraph names the plant or method, places it (UK
  windowsill / spare room / north-facing flat / kitchen), states
  the care shape in plain English.
- "Choosing a position" H2: window orientation, light level (low /
  medium / bright indirect / bright direct), temperature range,
  humidity, away from radiators + draughts.
- "Setting up" H2: pot choice, soil mix, watering cadence
  established for the first weeks.
- "Through the season" H2: spring + summer growing season
  (feed + water more), autumn + winter dormant period (feed + water
  less, no fertilising on most houseplants from October to March
  in UK temperate).
- `troubleshooter` covers the indoor failures: yellow leaves (over-
  watering vs under-watering; check soil), leaf drop (cold draught,
  shock), brown crispy leaf tip (low humidity), no flowers (wrong
  light, no winter dormancy where the plant needs it), fungus
  gnat (over-watered top inch of soil), spider mite (low humidity +
  warm dry air).

## Voice rules (indoor-gardening-specific additions)

- **Window orientation explicit.** "North-facing windowsill" or
  "east-facing windowsill" gives the reader the light they need to
  match.
- **No "easy plant" without conditions.** Sansevieria is easy IF
  not over-watered. State the condition.
- **Cat-safe + pet-safe flagging.** Pothos, monstera, peace lily,
  philodendron are toxic to cats and dogs. State this on guides
  where the plant is a candidate. Single inline line.
- **No anthropomorphism.** "The plant tells you when it's thirsty"
  is fine as plain language. "The plant is happy" is hype. State
  what the plant does ("leaves droop slightly", "soil dries to 2 cm
  depth").
- **No "houseplant transformation" register.**
- **Watering cadence as range + cue,** not a fixed day. "Every 7
  to 14 days depending on indoor temperature and humidity; check
  the top 2 cm of soil with a finger and water only when it's just
  dry."
- **Orchid ice-cube myth named** where the orchid section appears.
  The myth is debunked; orchids prefer tepid water.
- **Sprouts safety:** rinse twice daily; discard if any off smell.
  One inline line.

## Sources (indoor-gardening tilt)

- **RHS houseplant pages** for current UK authority.
- **The Mistress of Spices** (no — that's a novel; not a source).
  **Ian Plumridge, *The House Plant Expert* (1978 onwards)** is a
  long-standing UK reference; cite, don't paraphrase.
- **Brooklyn Botanic Garden Handbooks** (some PD, some current).
- **University of Vermont houseplant extension material** (open
  access, US PD).
- **Pre-1928 indoor gardening writing** (Mrs Earle has windowsill
  notes) for historical context.

Houseplant care as a category has accelerated in the last decade
(social-media houseplant revival); most guides will set
`sourceType: "SYNTHESISED"` with a small set of cited references.

## Length guidance

| Sub-topic | Word count |
|---|---|
| Single-plant care guide (monstera, peace lily, succulent dish) | 800 to 1,200 |
| Multi-plant comparison guide (low-light houseplants; cat-safe houseplants) | 1,200 to 1,800 |
| System / room guide (LED indoor edible rack; full propagation room) | 1,500 to 2,500 |

## Self-critique pass (indoor-gardening additions)

1. Window orientation explicit on light guidance.
2. Cat-safe + pet-safe flag present where plant is toxic to common
   pets.
3. Watering cadence as range + cue, not fixed days.
4. Winter dormancy named for plants that need it.
5. Orchid ice-cube myth debunked where orchids appear.
6. Sprouts rinse + discard-on-smell line present on sprouts guides.
7. No anthropomorphism in voice.

## Worked example (compact)

```json
{
  "slug": "looking-after-a-monstera",
  "title": "Looking after a monstera (Swiss cheese plant)",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "indoor-gardening",
  "difficulty": "BEGINNER",
  "garden": {
    "plantSlug": "monstera",
    "subTopic": "growing",
    "plantingMonths": ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
    "containerFriendly": true,
    "indoorFriendly": true,
    "regionsApplicable": ["UK", "EU", "US_NORTH", "US_SOUTH", "AU_NZ", "ZA"]
  },
  "techniqueSlugs": ["houseplant-light-by-window-orientation", "houseplant-watering-by-finger-test", "houseplant-feed-by-season", "monstera-aerial-root-management"],
  "criticalTechniques": ["houseplant-watering-by-finger-test"]
}
```

## Image policy

NEVER generate images. Image worker sources verified hero per
`feedback_image_strategy.md`.

## See also

- `docs/garden-author.md` umbrella.
- `docs/garden-microgreens-author.md` for tray-grown indoor edible
  crops.
- `docs/garden-herbs-author.md` for windowsill herbs grown for
  cooking.
- `docs/garden-pest-disease-management-author.md` for indoor pests.
