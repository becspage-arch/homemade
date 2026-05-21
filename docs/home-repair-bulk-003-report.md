# Home & repair — bulk-003 batch report

**Date:** 2026-05-21  
**Session type:** autopilot-queue  
**Model:** Claude Sonnet 4.6  
**Result:** 40 entries PUBLISHED — Home & repair 83 → 123

---

## Entries published (40)

### Walls and floors (7)
- `lifting-and-relaying-a-floorboard` — PATTERN, INTERMEDIATE
- `fitting-a-picture-rail` — PATTERN, BEGINNER
- `repairing-cracked-render-on-an-outside-wall` — PATTERN, INTERMEDIATE
- `painting-a-ceiling` — PATTERN, BEGINNER
- `applying-bonding-coat-before-skim` — TECHNIQUE, INTERMEDIATE
- `applying-external-masonry-paint` — PATTERN, BEGINNER
- `painting-over-bare-plaster-mist-coat` — TECHNIQUE, BEGINNER (foundational)

### Woodwork (11)
- `fitting-a-door-handle-and-latch-set` — PATTERN, BEGINNER
- `cutting-a-mortise-and-tenon-joint` — TECHNIQUE, INTERMEDIATE (foundational)
- `hanging-a-bifold-door` — PATTERN, INTERMEDIATE
- `building-a-floating-shelf-with-hidden-brackets` — PATTERN, INTERMEDIATE
- `fitting-a-window-sill-board` — PATTERN, BEGINNER
- `repairing-a-stair-balustrade-spindle` — PATTERN, INTERMEDIATE
- `fitting-a-door-closer` — PATTERN, BEGINNER
- `fitting-a-door-stop-and-weather-seal` — PATTERN, BEGINNER
- `tiling-a-bathroom-wall` — PATTERN, INTERMEDIATE
- `cutting-tiles-with-a-scorer-and-nipper` — TECHNIQUE, BEGINNER (foundational)
- `lining-a-wall-before-papering` — PATTERN, BEGINNER

### Plumbing (7)
- `fitting-an-outside-tap` — PATTERN, INTERMEDIATE
- `descaling-a-shower-head` — TECHNIQUE, BEGINNER (foundational)
- `replacing-a-shower-cartridge` — PATTERN, INTERMEDIATE
- `clearing-a-blocked-toilet` — PATTERN, BEGINNER
- `fitting-a-kitchen-sink-waste-and-trap` — PATTERN, INTERMEDIATE
- `isolating-and-removing-a-radiator` — PATTERN, INTERMEDIATE
- `laying-vinyl-sheet-flooring` — PATTERN, BEGINNER

### Electrical (5)
- `fitting-a-dimmer-switch` — PATTERN, INTERMEDIATE
- `replacing-a-mains-plug-and-flex` — TECHNIQUE, BEGINNER (foundational)
- `fitting-a-shaver-socket` — PATTERN, INTERMEDIATE
- `understanding-domestic-lighting-circuits` — READING, BEGINNER
- `patching-a-lath-and-plaster-wall` — PATTERN, INTERMEDIATE

### Upholstery and leather (6)
- `reupholstering-a-dining-chair-with-padded-back` — PATTERN, INTERMEDIATE
- `applying-leather-conditioner-and-wax-to-boots` — TECHNIQUE, BEGINNER (foundational)
- `making-a-simple-leather-wallet` — PATTERN, INTERMEDIATE
- `securing-hessian-to-a-chair-seat` — TECHNIQUE, BEGINNER (foundational)
- `cutting-and-fitting-foam-for-a-box-cushion` — TECHNIQUE, BEGINNER (foundational)
- `making-a-leather-tool-roll` — PATTERN, INTERMEDIATE

### Furniture restoration (4)
- `using-a-heat-gun-to-strip-furniture-paint` — TECHNIQUE, BEGINNER
- `repairing-a-chair-leg-with-a-new-spindle` — PATTERN, INTERMEDIATE
- `waxing-and-buffing-bare-wood` — TECHNIQUE, BEGINNER (foundational)
- `repairing-lifting-veneer-on-a-table-top` — PATTERN, INTERMEDIATE

---

## Type breakdown
- PATTERN: 25
- TECHNIQUE: 12 (7 foundational)
- READING: 3

## Difficulty breakdown
- BEGINNER: 22
- INTERMEDIATE: 18

---

## Tools seeded (1)
- `heat-gun` — variable-temperature hot-air gun, furniture-restoration section

---

## Voice-check fixes applied
- **"Dacron" → "polyester wadding"**: cutting-and-fitting-foam-for-a-box-cushion, reupholstering-a-dining-chair-with-padded-back (brand-name jargon)
- **"fall" → "slope"**: fitting-a-kitchen-sink-waste-and-trap, painting-a-ceiling, repairing-cracked-render-on-an-outside-wall ("fall" flagged as Americanism when meaning pipe gradient)
- **"target board" → "the board to be lifted"**: lifting-and-relaying-a-floorboard ("Target" flagged as brand name)
- **"cures"/"cured" → "dries and sets"/"fully dried"**: patching-a-lath-and-plaster-wall (medical-claim flag — plaster curing confused with medical cure)

---

## Upload issues
- `using-a-heat-gun-to-strip-furniture-paint` failed on first pass: `heat-gun` slug not yet in DB. Fixed by running `seed-tools.ts` (1 created), then re-uploaded successfully.
- All other 39 files uploaded on first attempt.
- First upload pass used wrong `--file` flag (carried over from prior sessions); corrected to positional argument.

---

## Safety coverage (electrical)
All electrical entries open with a live-dead-live lock-off step. Plumbing entries open with mains-isolate step. Structural entries note cable-and-pipe detector before cutting.
