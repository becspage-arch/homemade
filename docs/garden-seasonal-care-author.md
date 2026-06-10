# Garden / Seasonal care authoring

Canonical input for any worker session that drafts a tutorial under
`garden/seasonal-care`. Month-by-month tasks, pruning windows,
planting calendars, frost protection, autumn clear-down, winter
maintenance. The cross-plant calendar sub-cat.

## Status

`SubCategory.autopilotEnabled = true` for `garden/seasonal-care`.

## Pre-read (MANDATORY)

- `docs/garden-author.md` umbrella.
- `docs/voice-spec-2026-05-21.md`, `docs/voice-spec-quick-reference.md`.
- `docs/garden-anti-tells.md`, `docs/common-issues.md`.

## Scope (what belongs here)

- Month-by-month task lists for the UK garden (12 monthly guides).
- Seasonal arc guides: "spring start-up", "autumn clear-down",
  "winter maintenance", "summer holding pattern".
- Frost calendars: when to start frost-tender plants indoors, when
  to plant out, when to expect last frost (UK averages by region),
  when to lift tender tubers (dahlia, canna).
- Pruning windows across plants: winter (apple, pear, roses, fruit
  bushes), spring (lavender, sage, evergreen herbs), summer
  (cordon / espalier / fan, soft-fruit tip-back), autumn (perennials
  for tidy bed; some gardeners leave for wildlife — name both).
- Greenhouse + polytunnel seasonal management: ventilation,
  shading, autumn clean-down, winter heat plan.
- Lawn calendar: feed cycles, scarify, aerate, autumn overseed.
- Tool seasonal maintenance overlap (cross-link to
  `tools-equipment`).

## Scope (what does NOT belong here)

- Plant-specific schedules (when to sow tomatoes) → the plant's
  sub-cat.
- Composting season cadence → `soil-compost`.
- Pest monitoring calendar → `pest-disease-management`.

## Sub-topic mix

- `season-extension` carries most weight in name (it's literally
  about season). But the body shape often blends multiple sub-topic
  axes (planting + pruning + harvesting in one monthly guide).
- `growing` for the broad-arc guides ("spring start-up").
- Use the closest sub-topic axis for the brief but expect the body
  to be a calendar-driven mix.

## Region-aware metadata

- `garden.plantingMonths` — for a monthly guide, the month itself.
- `garden.harvestMonths` — for a monthly guide, the month itself
  (because that month also has crops to lift / cut).
- `garden.containerFriendly` — null (not applicable at the calendar
  level).
- `garden.indoorFriendly` — false (most calendar guidance is
  outdoor).
- `garden.regionsApplicable` — leave null. The renderer derives
  applicable regions from the guide's hardiness metadata and
  silently translates months for opposite-hemisphere readers. Set
  `garden.regionsApplicableOverride` only when the UK-month
  calendar genuinely doesn't translate (most calendars do).
- `frostSensitivity` (master Plant): not relevant at this level.
- `dayLengthSensitive`: not relevant.

## Critical techniques

- `last-frost-date-uk-by-region`
- `first-frost-date-uk-by-region`
- `frost-protection-fleece`
- `frost-protection-cloche`
- `pruning-window-winter-tree-fruit`
- `pruning-window-spring-mediterranean-herbs`
- `pruning-window-summer-restricted-form`
- `lawn-feed-cycle-spring-autumn`
- `greenhouse-shading-summer`
- `greenhouse-clean-down-autumn`
- `lifting-and-storing-dahlia-tuber`

`techniqueSlugs[]` extends with: `succession-sowing-monthly-window`,
`hardening-off-timing-by-region`, `autumn-clear-down-leave-for-wildlife`,
`mulch-application-autumn`, `mulch-application-spring`,
`winter-wash-fruit-trees`, `greasebanding-fruit-trees-october`,
`bird-feeding-winter`, `bird-box-clean-spring`,
`pond-clear-down-autumn`, `pond-care-summer`, `frost-pocket-id`,
`microclimate-warm-wall`, `microclimate-cold-frame`.

## Materials master list

- **Frost-protection:** horticultural fleece (lightweight 17 g/m²
  for early sowing; heavyweight 30 g/m² for winter), cloche,
  cold frame, mini polytunnel hoops + cover.
- **Pruning:** secateurs (bypass + anvil), pruning saw, loppers,
  pole pruner (long-arm).
- **Greenhouse:** shade paint, shade netting, heated propagator,
  thermostat-controlled heater, max-min thermometer.
- **Calendar:** garden diary, RHS calendar, RHS app (factual mention).
- **Mulch:** stockpile of woodchip / leaf mould / compost ready for
  the autumn + spring mulch passes.

## Output contract

`subCategorySlug: 'seasonal-care'`. `type: 'GROWING_GUIDE'`. Garden
block per umbrella. `garden.plantSlug` stays null / omitted —
seasonal-care is an activity-axis sub-cat and the upload validator
rejects a plantSlug here. Plant-specific month-by-month tasks (March
pea sowing, August tomato side-shoots) cross-link to the plant
sub-cats in body prose; no plant slug on the row.

## Body shape

Per umbrella with adaptations:

- Opening paragraph names the month or arc, places it (UK
  temperate / Zone 8 oceanic), states what the month is for ("March:
  the indoor sowing month") in plain English.
- "What to sow this month" H2: list with crops + condition (indoors
  in module / under cloche / direct in open ground).
- "What to plant out this month" H2: similar list.
- "What to harvest this month" H2.
- "What to prune this month" H2: with the pruning window cue for
  each plant.
- "What to do for the long term this month" H2: mulch, compost
  turn, structural work, tool maintenance.
- "Frost cue" callout if the month is frost-relevant.
- `troubleshooter` covers month-specific failures: late frost
  catching tender plants; surprise warm spell triggering early
  flowering; drought in May; first hard frost catching unlifted
  dahlias.

## Voice rules (seasonal-care-specific additions)

- **UK-month calendar is canonical.** Other regions translate by
  hemisphere flip or zone shift; the renderer will surface this
  when the location-aware fields are wired in.
- **No "perfect time" or "ideal moment".** State the cue ("when
  soil temperature reaches 8 °C", "after the last expected frost").
- **Last-frost dates are regional averages,** not promises. UK
  ranges from mid-April (south coast) to late May (north). State
  the range.
- **No "Bank Holiday weekend" markers** — local + outdated. State
  the month or the week.
- **No "easy autumn checklist" register.** Specific tasks with
  specific reasons.
- **Lawn care: no chemical-feed defaults.** Iron + organic feed
  cycles before reaching for combination-feed-weed-moss products.
- **Wildlife trade-off named** on autumn tidy guides. "Some
  gardeners leave seed heads for finches and hollow stems for
  overwintering insects; others tidy down for hygiene reasons. Both
  are defensible." Don't tell the reader they have to choose
  wildlife.

## Sources (seasonal-care tilt)

- **RHS monthly job lists** for UK current authority.
- **The Garden** (RHS magazine) for current month-by-month
  guidance.
- **Monty Don, *Down to Earth* and current Gardener's World monthly
  notes** (current and in copyright; cite).
- **Joy Larkcom, Vita Sackville-West, Christopher Lloyd** for
  historical / register-defining seasonal writing.
- **Mrs Loudon § kitchen-garden monthly chapters** for Victorian
  precedent.
- **Met Office UK frost-date averages** for regional last + first
  frost dates.

## Length guidance

| Sub-topic | Word count |
|---|---|
| Single-month UK garden calendar | 1,200 to 1,800 |
| Seasonal arc guide (autumn clear-down across the garden) | 1,800 to 2,500 |
| Annual planner reference | 2,500 to 3,500 |

## Self-critique pass (seasonal-care additions)

1. UK-month canonical; no padding to other regions.
2. Last-frost date as a regional range, not a single date.
3. Wildlife trade-off named on autumn tidy guides.
4. Cues stated as soil-temperature / day-length / frost-date, not
   "Bank Holiday weekend".
5. Pruning windows per plant cross-link to the plant's sub-cat for
   detail.
6. Specific reasons for each task, not a generic list.

## Worked example (compact)

```json
{
  "slug": "the-uk-garden-in-march",
  "title": "The UK garden in March",
  "type": "GROWING_GUIDE",
  "categorySlug": "garden",
  "subCategorySlug": "seasonal-care",
  "difficulty": "BEGINNER",
  "garden": {
    "subTopic": "season-extension",
    "plantingMonths": ["march"],
    "harvestMonths": ["march"],
    "containerFriendly": null,
    "indoorFriendly": false
  },
  "techniqueSlugs": ["last-frost-date-uk-by-region", "frost-protection-fleece", "succession-sowing-monthly-window", "mulch-application-spring"],
  "criticalTechniques": ["last-frost-date-uk-by-region"]
}
```

## Image policy

NEVER generate images. Image worker sources verified hero per
`feedback_image_strategy.md`. Calendar hero typically shows the
month's signature plant or garden state.

## See also

- `docs/garden-author.md` umbrella.
- All plant sub-cats for plant-specific schedules cross-linked
  here.
- `docs/garden-tools-equipment-author.md` for tool maintenance
  cycle.
