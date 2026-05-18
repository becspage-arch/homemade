# Common issues — drafts that recur

Patterns that recur in tutorial drafts often enough to be worth catching
proactively during self-critique. Maintained as a living list.

**How this list is used:**

- Every drafting worker reads this file at session start.
- The body-authoring self-critique pass (see `docs/tutorial-author.md`
  § "Self-critique pass") includes a step that checks each entry below
  against the draft and rewrites any matching line.
- When a worker spots a new pattern recurring 3+ times in its batch,
  it appends an entry at the end of the relevant section before the
  session hands off.
- When Rebecca spot-checks live tutorials and finds a recurring issue,
  she adds an entry directly. The next batch picks it up.
- Where a pattern is deterministic (e.g. a banned phrase), it should
  also be added to `packages/db/scripts/voice-check.ts` so the upload
  gate catches it without relying on self-critique.

Format per entry: a short rule, optional **Why** + **How to fix**.
Severity flag with the rule: `[block]` (rewrite mandatory),
`[warn]` (rewrite preferred but not required).

---

## Voice issues

- **Em-dash overuse, especially appositive pairs** `[block]`
  Pattern: `"X — Y — Z"` where the middle clause is a parenthetical
  aside. Most common single failure mode in the pilot-10 batch.
  **How to fix:** rewrite as a colon, a semicolon, or two separate
  sentences. Maximum one em-dash per paragraph; never two in one
  sentence.

- **"Honest" as a softener** `[block]`
  Pattern: `"the honest answer is"`, `"the honest test"`,
  `"the honest shortcuts"`. The word is banned per the voice rules,
  but the model uses it as an "I'm levelling with you" voice marker
  rather than an information word.
  **How to fix:** swap for `"in practice"`, `"the reliable test"`, or
  drop the qualifier entirely.

- **Restaurant chain names** `[block]`
  Pattern: a recipe titled or described around a restaurant chain —
  "Wagamamas chicken katsu curry", "Nando's-style chicken", "KFC
  copycat". Reads like passing off. Caught in the personal-recipes
  redo (May 2026); led to the brand-trademark rule.
  **How to fix:** rename to a generic style descriptor.
  Wagamamas → Japanese-style; Nando's → peri-peri-style; KFC →
  southern fried; Burger King → flame-grilled-style; Starbucks → 
  coffee-shop-style. Full list of blocked chains in
  [`packages/db/scripts/data/banned-brands.ts`](../packages/db/scripts/data/banned-brands.ts).

- **Other brand-trademark mentions** `[warn]`
  Pattern: branded food, kitchen equipment, or retailer names
  ("Marmite on toast", "in the Crock-Pot", "Lurpak butter", "from
  Tesco", "Biscoff", "Nutella stuffed cookies"). Warns rather than
  blocks — sometimes the brand is the de facto noun and rephrasing
  reads clinical ("Marmite on toast" reads naturally; "yeast extract
  on toast" doesn't). Reviewer decides per-recipe whether to keep or
  rephrase. Recipe TITLES are higher-stakes than body prose; a recipe
  named after a brand reads like a collaboration.
  **How to fix:** use the generic equivalent if rephrasing doesn't
  hurt the reading. Genericised brands (Sriracha, Hoover, Sellotape)
  almost always read fine as-is.

- **"Fundamentally" as an intensifier** `[block]`
  Pattern: `"changes the texture fundamentally"`, `"fundamentally about"`,
  `"fundamentally different"`. Catches as a vague intensifier per the voice
  rules; blocked by voice-check.
  **How to fix:** drop the intensifier entirely, or substitute a precise
  verb: `"transforms the texture entirely"`, `"is about"`, `"is distinct from"`.

- **"Genuinely" as an intensifier** `[block]`
  Pattern: `"genuinely golden"`, `"genuinely crisp"`, `"genuinely surprising"`.
  Banned per voice rules. Recurs in step prose and conclusions.
  **How to fix:** drop the intensifier, or use a specific equivalent:
  `"properly golden"`, `"properly crisp"`, `"more interesting than it looks"`.

- **"Treats" as a medical watchword false positive** `[warn]`
  Pattern: `"Escoffier treats it as axiomatic"`, `"the dish treats onions as
  the main event"` — non-medical usage of the word "treats" triggering
  the medical-claim watchword check.
  **How to fix:** replace the verb: `"Escoffier takes it as axiomatic"`,
  `"the dish uses onions as the main event"`. Or accept the flag with
  `--skip-voice-check` if the reviewer confirms it is non-medical.

- **Tricolons in intros and conclusions** `[warn]`
  Pattern: `"warm, considered, and beautiful"` style three-item
  parallel lists, especially at the start of the intro or the end of
  the "Where this dish lives" closer. The pilot-10 voice-check flagged
  9 of 10 drafts for this; bulk-batch-001 flagged 40+ instances across
  23 drafts. The warnings don't block.
  **How to fix:** leave alone unless a real reader complains. Tricolons
  read fine when the third item earns its place. Worker can rewrite
  proactively if the third item is obviously padding.
  **Hot spots from observed batches:** the `excerpt` field (200-char
  meta summary that wants to be punchy) and the closing-paragraph list
  of pairings. If the third item is "and X", trim where it doesn't add
  flavour. Recipes that are genuinely about three things (the British
  weekend's "beef, Yorkshire, gravy" / Italian's "guanciale, pecorino,
  pepper") can keep the tricolon — it earns its place.

- **Appositive em-dash pairs in step prose** `[block]`
  Sub-pattern of the em-dash rule. Specifically appears in **method
  H3 step paragraphs** when a step has a parenthetical timing or
  observation: `"cook for X minutes — until the Y catches — then turn
  and Z"`. The pilot-10 saw this; bulk-batch-001 saw 3 of 23 first
  drafts hit it. The v4 prompt's self-critique catches most, not all.
  **How to fix:** rewrite as `"cook for X minutes; the Y catches.
  Turn and Z."` or `"cook for X minutes until the Y catches, then
  turn and Z."` — both work, both keep the rhythm without the
  appositive pair.

- **Em-dash pairs in sourceNotes** `[block]`
  Voice-check validates **all text fields** including `sourceNotes`,
  not just body content. The model treats `sourceNotes` as a plain
  background note and commonly writes an appositive em-dash pair when
  describing the historical method or the dish variant — e.g.
  `"Pot roasting — browning a joint in a covered pot — is documented
  across..."`. This blocked two uploads in bulk-batch-001-resume.
  **How to fix:** rewrite as parentheses or split into two sentences.
  The rule is identical: never two em-dashes in one sentence, never
  more than one em-dash per paragraph.

## Structural issues

(empty initially — populated as workers spot recurring structural
patterns, e.g. closing paragraphs that wrap up, intros that lead with
generic claims rather than concrete facts, etc.)

## Metadata issues

- **Wrong difficulty enum values** `[block]`
  Pattern: `"difficulty": "EASY"` or `"difficulty": "HARD"` in a
  brief JSON file. Neither is a valid Prisma enum value. Uploads fail
  with `Invalid value for argument 'difficulty'. Expected Difficulty.`
  **Why:** The schema defines `Difficulty` as `BEGINNER | INTERMEDIATE
  | ADVANCED`. The common shorthand EASY and HARD have no schema
  equivalent. This hit 21 of 50 files in baking bulk-005.
  **How to fix:** Use only `BEGINNER`, `INTERMEDIATE`, or `ADVANCED`.
  Map: EASY → `BEGINNER`, HARD → `ADVANCED`.

- **Invalid sourceType "ORIGINAL"** `[block]`
  Pattern: `"sourceType": "ORIGINAL"` on a recipe without a named
  public-domain or external source. Uploads fail with a Prisma
  validation error on the `sourceType` field.
  **Why:** The valid enum values are `TESTED / CLASSIC / SYNTHESISED /
  PUBLIC_DOMAIN / CREATOR`. "ORIGINAL" is not defined.
  **How to fix:** For a recipe derived from British/classic baking
  tradition without a single canonical source, use `"CLASSIC"` (classic
  precedent, cross-referenced across multiple sources). For a recipe
  tested in the Homemade kitchen from scratch, use `"TESTED"`.

## Cross-category issues

- **Season enum must be UPPERCASE** `[block]`
  Pattern: `"season": "winter"` or `"season": "summer"`.
  **Why:** Prisma Season enum values are SPRING, SUMMER, AUTUMN, WINTER,
  YEAR_ROUND. Lowercase strings fail with `Invalid value for argument 'season'.`
  **How to fix:** Always write `"WINTER"`, `"SUMMER"`, `"SPRING"`, `"AUTUMN"`,
  `"YEAR_ROUND"` or `null`. Never lowercase.

- **`baking-dish` not a valid tool slug** `[block]`
  Pattern: `{ "slug": "baking-dish", ... }` in `recipeTools`.
  **Why:** No tool with this slug exists in the master table.
  **How to fix:** Use `rectangular-baking-tin` (~30×20 cm for casseroles and traybakes).

- **`kitchen-thermometer` not a valid tool slug** `[block]`
  Pattern: `{ "slug": "kitchen-thermometer", ... }` in `recipeTools`.
  **Why:** No tool with this slug exists in the master table.
  **How to fix:** Use `instant-read-thermometer` (the generic meat/probe thermometer).

- **`cast-iron-casserole` not a valid tool slug** `[block]`
  Pattern: `{ "slug": "cast-iron-casserole", ... }` in `recipeTools`.
  **Why:** No tool with this slug exists. The casserole dish is `dutch-oven`.
  **How to fix:** Use `dutch-oven` (aliases: Dutch oven, Le Creuset, cocotte).

- **`pie-dish-23cm` not a valid tool slug** `[block]`
  Pattern: `{ "slug": "pie-dish-23cm", ... }` in `recipeTools`.
  **Why:** The size suffix is not part of the slug.
  **How to fix:** Use `pie-dish`.

- **Baking sweets sub-category slug is `sweets-confectionery`** `[block]`
  Pattern: `"subCategorySlug": "sweets"` on a baking sweets/confectionery entry.
  **Why:** The sub-category for baking sweets was created as `sweets-confectionery`
  (not `sweets`). This mismatch has blocked uploads in at least 3 batches (bulk-001,
  bulk-012, likely others).
  **How to fix:** Always use `"subCategorySlug": "sweets-confectionery"` for baking
  confectionery entries (fudge, honeycomb, toffee, marzipan, etc.).

- **`frying-pan` not a valid tool slug** `[block]`
  Pattern: `{ "slug": "frying-pan", ... }` in `recipeTools`.
  **Why:** The master tool slugs include a size suffix: `frying-pan-26` (26 cm, default),
  `frying-pan-30` (large, 30 cm), `small-frying-pan` (20 cm). The bare slug `frying-pan`
  does not exist. First seen in baking bulk-012 (welsh-cakes).
  **How to fix:** Use `frying-pan-26` for standard-size recipes. For anything needing
  a flat cast-iron surface (Welsh cakes, griddle pancakes), `frying-pan-26` or
  `cast-iron-skillet` are both valid.

- **`servings` and `yieldDescription` are mutually exclusive** `[block]`
  Pattern: a recipe with both `"servings": 6` and `"yieldDescription": "one
  30 cm × 20 cm pie"` set simultaneously. Upload fails or silently sets
  yieldDescription when servings is also present.
  **Why:** The schema treats these as alternatives. Recipes that serve N people
  use `servings`. Recipes with a fixed-unit yield (a loaf, a jar, a tray)
  use `yieldDescription` and set `servings: null`.
  **How to fix:** Pick one. Pies and cakes that feed a known number of
  servings: use `servings`. Loaves, jars, and batches with no natural
  per-person count: use `yieldDescription` and set `servings: null`.
