# Baking anti-tells — drafts that recur

Patterns that recur in Baking drafts often enough to be worth
catching proactively during self-critique. Maintained as a living
list — the Baking equivalent of `docs/common-issues.md` for the
shared cross-category list, and the analogue of
`docs/mindset-anti-tells.md` for Mindset.

**How this list is used:**

- Every Baking drafting worker reads this file at session start.
- The body-authoring self-critique pass (see `docs/baking-author.md`
  § "Self-critique pass") includes a step that checks each entry
  below against the draft and rewrites any matching line.
- When a worker spots a new pattern recurring 3+ times in its
  batch, it appends an entry at the end of the relevant section
  before the session hands off.
- When Rebecca spot-checks live bakes and finds a recurring issue,
  she adds an entry directly. The next batch picks it up.
- Where a pattern is deterministic (a banned phrase, a banned
  register-word), it should also be added to
  `packages/db/scripts/voice-check.ts` so the upload gate catches
  it without relying on self-critique. The Baking-specific
  voice-check extension is its own session — entries marked
  `[needs-voice-check]` are ready to land there.

Format per entry: a short rule, **Why**, **How to fix**. Severity
flag with the rule: `[block]` (rewrite mandatory), `[warn]`
(rewrite preferred but not required).

Seeded with the patterns the anchor-batch worker expected to see
+ patterns the cooking pipeline surfaced that translate to baking.
Will accrue more entries as pilot / bulk batches surface recurring
tells.

---

## Precision issues

- **Cup-measurement creep** `[block]` `[needs-voice-check]`
  Pattern: an `ingredientsList` row with `unit: "cup"` as the
  primary measure, or method prose that says "1 cup of flour" as
  the lead. Grams are the British baking standard and the renderer
  works in grams. Cups go in `prepNote` as an alias only ("250 g
  / about 2 cups") when the source recipe is American and the
  conversion is worth surfacing.
  **Why:** Cup volumes vary (UK 250 ml; US 240 ml; loosely-scooped
  flour by cup can be 100–160 g for the same "1 cup"). Baker's
  percentages depend on accurate flour weight; cup-as-primary
  introduces 30%+ swing on the actual hydration.
  **How to fix:** Set `unit: "g"` on the row; add the cup
  equivalent to `prepNote` if the source recipe is genuinely
  American ("250 g / 2 cups of plain flour"). Method prose uses
  the scaling token; the renderer outputs grams.

- **"Until golden brown" without time + non-colour cue** `[block]`
  Pattern: doneness lines that name only the colour. "Bake until
  golden brown." Domestic ovens vary by 20°C; one cook's golden is
  another's deep mahogany. A colour-only cue assumes the reader
  knows the bake, which defeats the tutorial.
  **Why:** Baking doneness is a triangulation of time + visual
  cue + texture or behaviour cue. Any one alone is unreliable.
  **How to fix:** Pair the colour with a time range AND a non-
  colour cue. "25–30 minutes; the top is deep gold, the sides have
  pulled away from the tin, and a skewer through the centre comes
  out clean." For breads: "30–35 minutes; the loaf sounds hollow
  when you tap the base, and an internal probe reads 96°C."

- **Missing critical-temperature precision** `[block]` `[needs-voice-check]`
  Pattern: sugar-stage or chocolate-tempering language that names
  the stage without the °C. "Cook to soft-ball stage." "Temper the
  chocolate." Without the number a reader can't follow.
  **Why:** Confectionery success depends on hitting a temperature
  window the eye can't read. The stage name is shorthand for the
  thermometer reading; both belong.
  **How to fix:** Pair the stage name and the °C. "Cook to
  soft-ball stage, 115°C." "Temper the dark chocolate by working
  it down to 28–29°C and bringing it back up to 31–32°C."
  Confectionery tutorials should also surface the safety line:
  "If hot syrup touches skin, run cold water over it for at least
  ten minutes and seek medical care if needed."

- **Vague hydration** `[warn]`
  Pattern: bread tutorials that describe the dough as "wet" or
  "soft" without a baker's percentage. The percentage is the
  precision the recipe wants; vague language hides the
  recipe-design decision.
  **Why:** Bread workers learn by hydration; the percentage tells
  them what the dough should feel like in the hand. "Wet dough"
  could be 70% or 85%; the rise and crumb diverge.
  **How to fix:** State the hydration in `baking.hydrationPercent`
  AND describe what that feels like in prose ("a 75% dough — soft
  and slightly tacky; it should leave the bowl in a sticky mass
  but pull off your fingers when you flick them"). The percentage
  on the row, the feel in the prose.

## Structural issues

- **Recipe-doubles-as-technique drift** `[block]`
  Pattern: a bread or pastry tutorial that forgets it's a recipe
  and becomes a methodology essay. The reader can't follow it
  because the steps are buried in explanation; the structured
  ingredients block has been replaced by a paragraph of "you'll
  need flour".
  **Why:** Baking attracts deep explanations. The audience wants
  both — but in the right order. Recipe structure first
  (ingredientsList, method H3s, time markers), the why woven in
  as one-sentence asides on each step. Long-form technique work
  belongs in `type: "TECHNIQUE"` tutorials with `foundational:
  true`.
  **How to fix:** Restore the recipe scaffold. Move
  general-principles prose into one or two `infoPanel` blocks at
  the top of the body. Each method H3 carries a step's actions
  first, the why second. If the tutorial is genuinely a
  technique deep-dive ("Bread hydration explained"), set
  `type: "TECHNIQUE"` and `foundational: true`; recipes that link
  to it use `subTutorialCard` to surface it from inside a step.

- **Lamination skip** `[block]`
  Pattern: a puff, croissant, or Danish recipe that names the
  number of folds without describing the fold structure, the
  rest schedule, or the visual cue at each fold. The lamination
  schedule is the recipe; skipping it produces a flat result the
  reader can't troubleshoot.
  **Why:** Laminated pastry succeeds or fails on the lamination.
  A reader who hasn't done it before doesn't know what "do six
  folds" means or how long to wait between them.
  **How to fix:** Each fold gets its own H3 step ("First single
  fold" / "First rest, 30 minutes" / "Second single fold" / …).
  State the fold type (single / book / double) and the rest
  length. Describe the visual cue at each fold: "you should see
  no butter streaks at the edge; the dough should feel firm
  again, not stretchy". Set `baking.laminationFolds` and
  `baking.laminationRests` to match the body.

- **Method without time markers** `[warn]`
  Pattern: a method that flows in continuous prose with no time
  markers, leaving the reader unsure where the pauses are.
  Particularly common in overnight loaves and laminated pastry.
  **Why:** Baking is paced. The reader needs to know when to
  walk away and what to come back to. Time markers anchor the
  rhythm of the bake.
  **How to fix:** Each pause gets its own H3 ("Bulk ferment, 90
  minutes" / "First fold" / "Cold retard, overnight"). The body
  prose under each H3 says what to do at the start of the pause
  and what the dough should look like when you come back.

## Voice issues

- **Bake-Off hype-tent register** `[warn]`
  Pattern: "soggy bottom", "showstopper", "the best [bake] you'll
  ever make", "blow your mind", "next-level", "you won't believe".
  The Bake-Off tent register the audience finds tiring outside
  the TV format.
  **Why:** Homemade is slow-living, not aspirational reality TV.
  The bake is the bake; the prose is calm.
  **How to fix:** State what the bake is. "A Victoria sandwich
  that holds its shape under jam." "A puff pastry that lifts to
  twelve clean layers." Specific, dry, useful.

- **Substitution hand-waving on tuned recipes** `[block]`
  Pattern: "use any flour" / "any sugar will do" / "any fat works"
  on a recipe that's baker's-percentages tuned, lamination-tuned,
  or sugar-stage tuned. The recipe will fail with the wrong
  substitution.
  **Why:** Baking substitutions are recipe-specific. Wholemeal
  for plain flour changes hydration. Brown sugar for caster
  changes moisture and Maillard. Margarine for butter changes
  lamination. The recipe knows; the substitution line should
  honour that.
  **How to fix:** Be specific. "Plain flour or 75% plain + 25%
  wholemeal — wholemeal needs an extra 30 ml of water per 100 g
  to keep the hydration." "Caster sugar, not granulated — caster
  dissolves into the butter; granulated leaves grit." When the
  recipe is genuinely flexible, say what flexes: "Salted or
  unsalted butter; reduce the added salt by ¼ tsp per 100 g if
  using salted."

- **No oven-thermometer reminder on temperature-sensitive bakes** `[warn]`
  Pattern: a laminated pastry, bread crust, or caramel recipe
  that gives a precise temperature without mentioning that
  domestic ovens drift. The reader's oven probably runs 10–30°C
  off the dial setting.
  **Why:** Domestic ovens are notoriously imprecise. A baking
  recipe that lives on its temperature should acknowledge the
  variable in the reader's kitchen.
  **How to fix:** Include the line at the top of the method or
  in an `infoPanel`: "Domestic ovens drift by 20°C or more. An
  oven thermometer takes the guessing out. If you find your bakes
  consistently over- or under-doing, that's the first place to
  look."

## Metadata issues

- **`recipe.scalable: true` on a recipe that doesn't scale** `[block]`
  Pattern: a bread or laminated pastry recipe left with the
  default `scalable: true`. Bread doesn't scale linearly above
  ~2× (proof times don't double; flour absorption changes).
  Laminated pastry doesn't scale (fold geometry changes). Cakes
  don't scale within a recipe (tin size changes the bake).
  **Why:** The public renderer surfaces a scale selector for
  `scalable: true` recipes. A reader who scales a non-scalable
  recipe will produce a bad result and blame the recipe.
  **How to fix:** Set `false` on bread + laminated pastry + cakes
  with specific tin sizes. Use `false` unless you're sure the
  bake takes a 2× linear scale (most biscuits do; most caramels
  do up to a pan-size limit).

- **`baking.preFermentType: "NONE"` not set on bread recipes** `[warn]`
  Pattern: a bread recipe that leaves `preFermentType` null when
  it should be `NONE`. Null is read as "field doesn't apply"; on
  bread it's a positive statement (no poolish, no biga, no
  levain). Future cataloguing and filter work depends on the
  difference.
  **Why:** The public filter "show me all straight-dough breads"
  reads `preFermentType = NONE`; null bread rows fall out of the
  filter.
  **How to fix:** On every bread row, set `preFermentType`
  explicitly. `NONE` for straight doughs; the specific enum value
  otherwise. On non-bread rows (cakes, biscuits, pastry, pies),
  leave it null.

## Source-attribution issues

- **Crediting a public-domain bake to a modern celebrity baker** `[block]`
  Pattern: a `sourceNotes` that credits a recipe to a modern
  named baker (Paul Hollywood, Mary Berry, Mary Cadogan) when the
  recipe is actually a centuries-old public-domain bake the
  modern baker has popularised. Crediting the modern source
  obscures the lineage and exposes Homemade to attribution
  challenges.
  **Why:** Honesty + safety. A Victoria sandwich is a public-
  domain bake going back to the 1860s; crediting it to Mary
  Berry is wrong on both counts. A modern interpretation is fine
  to mention separately — but the recipe's lineage cites the
  public-domain source.
  **How to fix:** Cite the historical source as the primary
  reference. Mention the modern populariser as a secondary line
  if relevant ("modern recipes after Mary Berry follow this
  pattern; the structure here is Beeton's"). Stick to genuinely
  public-domain references in `sourceNotes` for the primary
  citation.

- **Em-dash appositive pairs in `sourceNotes`** `[block]`
  Pattern: `sourceNotes` prose using an em-dash pair to offset a
  source name or clause: `"Mrs Beeton — the canonical Victorian
  source — documents…"` or `"the recipe here — a straight dough
  — follows Acton's method"`. The voice-check CLI treats any
  `— text —` pattern as an ERROR regardless of field.
  **Why:** The voice-check rule is applied across all string
  fields, including `sourceNotes`. A pair that would read
  naturally as prose in a book triggers a blocking error on
  upload.
  **How to fix:** Rewrite as colons or parentheses. `"Mrs Beeton
  (the canonical Victorian source) documents…"` or `"Mrs Beeton
  documents…: the cream bun section records…"`. Use
  `fix-emdash.js` on the brief before attempting an upload.

- **Season enum lowercase** `[block]`
  Pattern: `"season": "autumn"` or `"season": "winter"` —
  lowercase season values. Prisma rejects them at upload time
  with a validation error.
  **Why:** The Prisma `Season` enum is defined as
  `AUTUMN / WINTER / SPRING / SUMMER` (uppercase). JSON values
  must match exactly.
  **How to fix:** Use `AUTUMN`, `WINTER`, `SPRING`, `SUMMER` or
  `null`. Add to the brief template so the drafter never writes
  lowercase.

- **Wrong sub-category slug for confectionery** `[block]`
  Pattern: `"subCategorySlug": "confectionery"` on sweets and
  confectionery recipes. The upload script rejects it as unknown.
  **Why:** The seeded sub-category slug is `sweets-confectionery`,
  not `confectionery`. The `sweets-` prefix distinguishes it
  from a category-level slug.
  **How to fix:** Use `"subCategorySlug": "sweets-confectionery"`
  on all confectionery recipes. Look up the exact slug in
  `seed-baking-taxonomy.ts` when authoring any sub-category
  reference.

- **Guessing tool slugs** `[block]`
  Pattern: `recipeTools` entries with tool slugs that seem
  plausible (`"round-piping-nozzle"`, `"medium-saucepan"`,
  `"tart-tin-loose"`) but don't match the master table.
  The upload script rejects any unrecognised slug.
  **Why:** Tool slugs follow a specific naming convention that
  is not always predictable. `piping-nozzle-round` not
  `round-piping-nozzle`. `saucepan-medium` not
  `medium-saucepan`. The convention varies.
  **How to fix:** Always look up the exact slug in
  `packages/db/scripts/data/tools.ts` before writing a
  `recipeTools` entry. If the tool is genuinely new, add it to
  `tools.ts` and reseed before uploading.

- **Em-dash appositive pairs in `excerpt`** `[block]`
  Pattern: `"excerpt"` text using a pair of em dashes to offset
  an appositive phrase: `"Soft amaretti — the chewy Italian
  almond biscuit — made with…"`. Voice-check applies the
  em-dash-paragraph and em-dash-sentence rules to all string
  fields including `excerpt`.
  **Why:** Appositive phrases in em-dash pairs are a natural
  writing register but the voice-check rule limits each
  paragraph (and each sentence) to one em dash. The excerpt
  counts as a paragraph for these purposes.
  **How to fix:** Replace the em-dash pair with commas or
  parentheses: `"Soft amaretti, the chewy Italian almond
  biscuit, made with…"`. Use a single em dash only if the
  phrase genuinely needs the stronger pause.

- **Em-dash across multi-text-node body paragraphs** `[block]`
  Pattern: A body paragraph that contains a `glossaryTooltip`
  mark splits into three text nodes (pre-tooltip text,
  tooltip text, post-tooltip text). If the pre-tooltip text
  node already contains one em dash and the post-tooltip text
  node contains a second, the voice-checker concatenates all
  three and detects two em dashes in one paragraph.
  **Why:** The voice-check walks the full concatenated text of
  each paragraph, not individual text nodes. The glossary mark
  does not create a paragraph boundary, so both em dashes
  count against the same paragraph limit.
  **How to fix:** Ensure the post-tooltip continuation text uses
  a semicolon, period, or comma rather than an em dash when the
  pre-tooltip node already carries one. Review each method step
  that introduces a glossaryTooltip to check the surrounding
  punctuation.
