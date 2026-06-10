# Garden / Garden design authoring (specialist stub)

`SubCategory.autopilotEnabled = false` for `garden/garden-design`.

## Why the autopilot does NOT author here

Garden design is layout planning, plant combination, garden rooms,
hard landscaping basics, cottage / formal / modern stylistic
traditions. The judgement that lifts a garden-design guide is
aesthetic, contextual, and tied to a specific plot: what works in a
narrow London courtyard does not work on a Yorkshire moor or a
Norfolk-flat half-acre. The aesthetic call is also subjective in ways
the other Garden sub-cats are not — vegetable spacing is not a matter
of taste, but planting a cottage border vs a hot border is. Autopilot
authoring produces drafts that are competent but generic and risk
landing as "stock garden design advice" without the specificity that
makes design content useful.

The remaining gap is also a research one. Each named style (English
cottage; Sissinghurst-room; Beth Chatto right-plant-right-place; Tom
Stuart-Smith modernist matrix; Piet Oudolf prairie / new
perennial) carries decades of attribution that needs careful
sourcing, and the named-designer plantings are mostly in copyright.

## What the future specialist worker will do

When the time is right, a dedicated worker will commission this
sub-cat with:

1. A small set of 10 to 20 design-style pillars (English cottage,
   Sissinghurst-room, modern dry garden, new perennial, Japanese
   moss, Mediterranean dry, urban courtyard, rooftop, balcony,
   shady).
2. Plant-combination palettes per style, drawn from public-domain
   plantings (Gertrude Jekyll, William Robinson, Vita Sackville-
   West where columns are out of copyright) and cited contemporary
   plantings (Beth Chatto, Christopher Lloyd, Piet Oudolf, Tom
   Stuart-Smith) where cited not paraphrased.
3. Hard-landscaping primers (paths, walls, levels) cross-linked to
   `home-repair` for the construction side.
4. Plot-shape-specific layout guides (long thin garden; corner
   plot; sloping plot; courtyard).
5. Rebecca specs the AI-managed flow herself when the time comes,
   per `feedback_designer_onboarding_timing.md`.

The author-prompt for the dedicated worker will mirror the umbrella
voice rules with garden-design-specific additions:

- **No "transform your garden" register.**
- **No assertion of stylistic authority** that Homemade does not
  have. Style writers (Vita, Jekyll, Lloyd, Don) are cited not
  paraphrased.
- **Plot context named.** Every design guide places the plot first
  (size, soil, aspect, region).
- **No "Pinterest-board" framing.**
- **Plant palettes verified against the master `PlantVariety` table.**
- **Hard-landscaping is high-stakes** (drainage failure, retaining-
  wall failure) — cross-link to `home-repair` for the construction
  and reference building regulations where relevant.

## Status until the specialist worker fires

`Category.garden.pipelineStatus = READY` (the parent flips).
`SubCategory.garden-design.autopilotEnabled = false`. Autopilot
round-robin skips this sub-cat when picking. Any draft tutorial
referencing `subCategorySlug: 'garden-design'` from another worker
session is held in DRAFT pending Rebecca review.

## See also

- `docs/garden-author.md` umbrella.
- `feedback_designer_onboarding_timing.md` for the broader timing
  rule.
- `docs/garden-flowers-author.md` for plant-specific cut-flower bed
  guidance (the closest current home for design-adjacent flower
  content).
- `home-repair` category for the hard-landscaping construction
  side.
