# Garden anti-tells — drafts that recur

Patterns that recur in Garden growing-guide drafts often enough to
be worth catching proactively during self-critique. Maintained as a
living list — the Garden equivalent of `docs/baking-anti-tells.md`
and `docs/mindset-anti-tells.md`.

**How this list is used:**

- Every Garden drafting worker reads this file at session start.
- The body-authoring self-critique pass (see `docs/garden-author.md`
  § "Self-critique pass") includes a step that checks each entry
  below against the draft and rewrites any matching line.
- When a worker spots a new pattern recurring 3+ times in its batch,
  it appends an entry at the end of the relevant section before the
  session hands off.
- When Rebecca spot-checks live guides and finds a recurring issue,
  she adds an entry directly. The next batch picks it up.
- Where a pattern is deterministic (a banned phrase, a banned
  register-word), it should also be added to
  `packages/db/scripts/voice-check.ts` so the upload gate catches
  it without relying on self-critique. The Garden-specific
  voice-check extension is its own session — entries marked
  `[needs-voice-check]` are ready to land there.

Format per entry: a short rule, **Why**, **How to fix**. Severity
flag with the rule: `[block]` (rewrite mandatory), `[warn]` (rewrite
preferred but not required).

Seeded with the patterns the anchor-batch worker expected to see
plus the patterns the cooking and baking pipelines surfaced that
translate to garden writing. Will accrue more entries as pilot /
bulk batches surface recurring tells.

---

## Voice issues

- **Therapeutic-claim creep on medicinal-adjacent plants** `[block]` `[needs-voice-check]`
  Pattern: a calendula / chamomile / lavender / rosemary growing
  guide that slides into "calendula soothes inflammation" or
  "chamomile helps with sleep". Garden tutorials cover *growing*;
  any health claim belongs in the Herbal category, where it gets
  the safety framing it needs.
  **Why:** Homemade isn't medical advice. A growing-guide reader
  arrives wanting to grow the plant; a therapeutic claim in body
  prose is both off-topic and a legal risk.
  **How to fix:** Stop at the plant. "Calendula petals are used in
  cosmetic and culinary preparations" is the limit. Cross-link to
  the Herbal entry with a `subTutorialCard` when the user is likely
  to want the medicinal side; let that surface carry the claim, the
  dose, and the safety frame.

- **"Easy to grow" without conditions** `[block]`
  Pattern: a sentence asserting a plant is easy without the
  qualifying conditions. "Strawberries are easy to grow." "Tomatoes
  are easy for beginners." The claim is meaningless without the
  conditions (drainage, sun, frost protection, soil pH).
  **Why:** A beginner who plants without the conditions fails and
  blames the plant. The conditions are the recipe.
  **How to fix:** State the conditions, or drop the claim.
  "Strawberries are an easy first fruit if the bed drains well and
  the plants get six hours of direct sun." Better still: skip the
  "easy" framing and lead with the conditions.

- **Bake-Off-equivalent hype register** `[warn]`
  Pattern: "thriving garden", "showstopper blooms", "the best
  tomatoes you'll ever taste", "next-level", "transform your plot",
  "you won't believe". The Pinterest-and-Insta register the audience
  finds tiring.
  **Why:** Homemade is slow-living, not aspirational lifestyle
  content. The plant is the plant; the prose is calm.
  **How to fix:** State what the plant does. "A reliable cropping
  bush that yields 3-5 kg in a good year." Specific, dry, useful.

- **Calendar provincialism** `[block]`
  Pattern: "Plant in May" / "Sow on Bank Holiday weekend" / "Start
  in spring" without a regional caveat. Bank Holiday is UK-specific
  and the schedule won't translate to the US or Australia. "Spring"
  is six months off between hemispheres.
  **Why:** The site is global. A frost-tender tomato schedule that
  works in temperate UK doesn't work for USDA-3, and a "plant in
  spring" line confuses the Southern-Hemisphere reader.
  **How to fix:** Use specific months (e.g. "late February to mid-
  April"). Reference the cue underneath (e.g. "soil temperature
  reaches 12°C", "after the last expected frost"). Populate
  `garden.regionsApplicable` honestly — `UK` always, others only
  where the schedule applies.

## Precision issues

- **Imperial unit slips** `[block]` `[needs-voice-check]`
  Pattern: spacing or depth in inches, height in feet, area in
  square yards. "Plant 18 inches apart" / "Trees reach 12 feet".
  **Why:** Homemade is metric-first. American extension service
  material is in inches / feet; conversion is the drafter's job.
  **How to fix:** Convert to cm or m. "Plant 45 cm apart." "Trees
  reach 4 metres." When the original is American and the conversion
  is worth surfacing, add the imperial alias once in prose: "45 cm
  — about 18 inches".

- **Modern-zone confusion** `[block]`
  Pattern: a sentence mixing RHS and USDA hardiness zones without
  marking which is which. "Hardy to zone 5" — RHS or USDA?
  **Why:** RHS uses H1a..H7 (UK); USDA uses 1..13 (US). They are
  not interchangeable and they don't translate by a fixed offset.
  **How to fix:** Name the system every time. "Hardy to RHS H5"
  or "Hardy to USDA zone 5". On the master `PlantVariety` row,
  populate both columns where confidence allows; leave empty rather
  than guess.

- **"Plant in well-drained soil" without explaining why** `[warn]`
  Pattern: a one-line drainage requirement on a plant where
  drainage is non-negotiable (rosemary, thyme, lavender, sage,
  Mediterranean herbs generally), with no follow-up explaining
  what wet feet do.
  **Why:** Drainage failure is the most common cause of
  Mediterranean-herb failure in UK gardens. The reader who lost a
  rosemary last winter needs to understand why.
  **How to fix:** Pair the requirement with the consequence and a
  practical fix. "Mediterranean herbs die in winter from wet feet,
  not cold. Plant on a raised mound or add a 5 cm gravel mulch at
  the base of the stem to keep crown moisture off the wood."

- **Vague "regular watering"** `[warn]`
  Pattern: "Water regularly" / "keep the soil moist" without a
  cadence or a soil-feel cue.
  **Why:** "Regularly" is unmeasurable. A tomato needs a litre per
  plant per day in July; a rosemary wants the soil to dry out
  between drinks.
  **How to fix:** State the cadence ("every two or three days
  through July and August in the UK") and the soil-feel cue ("the
  top 2 cm of soil should be just dry to the touch before you
  water again"). Better still: tie to the plant's water requirement
  on the master `PlantVariety` row (low / moderate / high).

## Structural issues

- **Companion-planting hand-waving** `[block]`
  Pattern: "Tomatoes love basil" / "Plant marigolds with anything"
  / "Three Sisters always works" stated as fact without a citation
  or a confidence frame.
  **Why:** Most companion-planting claims are folklore-strength.
  Some have evidence (marigolds suppressing root-knot nematode);
  most don't. Stating folklore as established fact is a
  credibility problem.
  **How to fix:** Frame the evidence level. "Traditional pairing;
  modern trials show inconsistent results." "RHS recommends as a
  pollinator-attracting underplanting." Cite the source in
  `sourceNotes` for any pairing presented as proven. If the
  pairing is decoration not science, say so.

- **Pest section without the prevention next year section** `[warn]`
  Pattern: a pest-management guide that names the pest, gives
  controls, but doesn't close with "what to do next year to break
  the cycle". The reader who lost the crop this season wants to
  know how to avoid the same next year.
  **Why:** Pests rotate with crops; prevention is a year-on-year
  game. A pest-management guide without the prevention beat is
  half the guide.
  **How to fix:** Add a short closing H2 — "Prevention next year"
  — listing the practical moves (rotation, crop choice, soil
  preparation, biological controls released early).

- **Variety-selection guide without the "what to avoid" section** `[warn]`
  Pattern: a variety-selection guide that lists three or five
  reliable starting points but doesn't say what to skip. The
  reader who's about to spend on seed wants both lists.
  **Why:** Reading-only positive reviews is hard work. A short
  "what to avoid" paragraph saves the reader money and time.
  **How to fix:** One factual paragraph at the end. Common reasons
  to avoid: overhyped (over-promised yield), expensive (no real
  advantage over a £2 seed packet), poorly adapted (USDA-only
  variety sold widely in UK).

## Metadata issues

- **`garden.regionsApplicable` padded** `[block]`
  Pattern: a UK-specific tomato sowing schedule with `["UK", "EU",
  "US_NORTH", "US_SOUTH", "AU_NZ", "ZA"]` flagged. The schedule
  doesn't apply to USDA-3 or to ZA Southern-Hemisphere.
  **Why:** The regions flag drives downstream renderer behaviour
  — the calendar shifts for Southern Hemisphere, the frost-date
  copy shifts for US-North. Padding the flag with regions where
  the schedule fails sends bad advice to those readers.
  **How to fix:** Be honest about which regions the schedule
  genuinely applies to. UK + EU for most British schedules. Add
  US_NORTH if the climate is similar (Pacific NW, New England).
  Don't add the Southern-Hemisphere flags unless the body explicitly
  handles the hemisphere flip.

- **Empty `garden.plantingMonths` / `harvestMonths` on a sowing or
  harvesting guide** `[block]`
  Pattern: a sowing-guide draft with `plantingMonths: []`, or a
  harvesting guide with `harvestMonths: []`. The renderer surfaces
  the calendar strip from these arrays — empty means no strip.
  **Why:** A growing-guide reader looks at the calendar before
  anything else. Empty arrays are a missing-data bug, not a
  deliberate choice.
  **How to fix:** Populate the array to match what the body
  prose says. Sowing guides set `plantingMonths`; harvesting
  guides set `harvestMonths`; growing guides set both.

- **`garden.plantSlug` for a plant not in the master table** `[block]`
  Pattern: a draft with a `plantSlug` that doesn't resolve against
  `packages/db/scripts/data/plants.ts`. The upload script rejects
  it.
  **Why:** The master `PlantVariety` table is the source of truth
  for plant metadata (hardiness, sun, water, soil). The growing
  guide references the row; an unknown slug means there's no row
  to reference.
  **How to fix:** Look up the exact slug in `data/plants.ts`. If
  the plant is genuinely missing, add it to `plants.ts`, run
  `pnpm --filter "@homemade/db" exec tsx scripts/seed-plants.ts`,
  and re-attempt the upload.

## Source-attribution issues

- **Crediting a public-domain plant practice to a modern named
  gardener** `[block]`
  Pattern: a `sourceNotes` that credits a generic gardening
  practice to a modern named writer (Monty Don, Sarah Raven, Joe
  Swift) when the practice is a centuries-old public-domain
  technique they have popularised. Crediting the modern source
  obscures the lineage and exposes Homemade to attribution
  challenges.
  **Why:** Honesty + safety. Pricking out, hardening off, and
  rotating brassicas are all public-domain practices. Crediting
  them to a modern populariser is wrong on both counts.
  **How to fix:** Cite the historical source as the primary
  reference. Mention the modern populariser as a secondary line if
  relevant ("modern UK gardening writers after Sarah Raven follow
  this pattern; the practice is older than the term"). Stick to
  genuinely public-domain references in `sourceNotes` for the
  primary citation.

- **Em-dash appositive pairs in `sourceNotes`** `[block]`
  Pattern: `sourceNotes` prose using an em-dash pair to offset a
  source name or clause: `"the RHS — long the canonical UK source —
  recommends…"`. The voice-check CLI treats any `— text —` pattern
  as an ERROR regardless of field.
  **Why:** The voice-check rule is applied across all string
  fields, including `sourceNotes`.
  **How to fix:** Rewrite as colons or parentheses. `"The RHS
  (long the canonical UK source) recommends…"`.

- **Wrong sub-category slug for the plant category** `[block]`
  Pattern: `"subCategorySlug": "veg"` or `"vegetable"` on
  vegetable guides; the seeded slug is `vegetables`. The upload
  script rejects unknown slugs.
  **Why:** Sub-category slugs are seeded explicitly; the script
  does no fuzzy matching.
  **How to fix:** Look up the slug in
  `packages/db/scripts/seed-garden-taxonomy.ts`. The nine garden
  sub-categories are `vegetables` / `fruit` / `herbs` /
  `flowers` / `permaculture` / `microgreens` / `hydroponics` /
  `mushroom-growing` / `foraging`.
