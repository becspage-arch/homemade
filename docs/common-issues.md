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

- **"Essentially" as a hedging word** `[block]`
  Pattern: `"has remained essentially unchanged"`, `"essentially the
  same formula"`, `"essentially a shortcrust"`. Flagged as a vague
  hedger; banned per voice rules. Recurs in `sourceNotes` historical
  summary sentences. First seen in baking bulk-013 (scottish-oatcakes,
  potato-scones).
  **How to fix:** drop the word entirely: `"has remained unchanged"`,
  `"the same formula"`, `"a shortcrust"`. The sentence reads more
  direct without it.

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

- **Price mentions in body text (sustainability / technique files)** `[block]`
  Pattern: `"costs £8-15 for a pack"`, `"install costs £1,500-3,000"`, `"a typical quote is £7,500"` — inline price context in body paragraphs, list items, or infoPanel attrs. All 40 sustainability bulk-001 files had this; also observed in paper-word bulk-001 (1 file).
  **Why:** Voice-check's `containsPriceMention` rule bans any `£/$/€/¥` + digit in body content and metadata. Prices must live in `approximateCostGbp` (integer pence/pounds) only.
  **How to fix:** Strip the price entirely, or rephrase as a non-currency qualifier: `"costs a small amount"`, `"competitively priced"`, `"inexpensive"`. For bulk batches, add `fixPrices(node.text)` to the body text-node walk in the fix script (the bulk-001 script only applied to excerpt/sourceNotes on first pass).

- **Raw-hours false positive on annual calculation constants** `[block]`
  Pattern: `"Total watts × 8,760 hours per year ÷ 1,000"` — the raw-hours rule matches `760 hours` as a substring of `8,760 hours`. Also triggers on machine operating-life comparisons: `"equivalent to running it for 1,500 hours"` (matches `500 hours`).
  **Why:** The raw-hours rule flags any `\d+ hours?` where the matched number > 48, intended to force calendar durations into days/weeks. It fires on engineering constants and operating-time figures too.
  **How to fix:** For annual constants: `"× 8,760 (hours in a year) ÷ 1,000"` or just `"× 8,760 ÷ 1,000"`. For operating-time comparisons: convert to weeks (`1,500 h ÷ 24 h/day ÷ 7 = ~9 weeks continuous`). The word "hours" can appear without a number immediately before it — only the `\d+ hours?` pattern triggers.

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

- **"fall apart" triggers americanism false positive** `[warn]`
  Pattern: `"Thin fillets fall apart"`, `"Pancakes fall apart"` — the verb
  phrase "fall apart" triggering the americanism check for "fall" (autumn).
  First seen bulk-026 (placki-ziemniaczane), recurred bulk-027 (merluza-en-salsa-verde).
  **How to fix:** Replace with "break apart" or "collapse". Both read naturally
  and avoid the false positive.

- **`pnpm run tutorial:upload -- <file>` passes literal `--` as a flag** `[block]`
  Pattern: `pnpm run tutorial:upload -- path/to/file.json --status PUBLISHED` exits
  with code 1 and shows the USAGE/help text for every file.
  **Why:** pnpm passes the `--` separator through to the script as a literal argument.
  The upload script's arg parser sees `--` as an unknown flag starting with `--` and
  returns null (prints help and exits 1).
  **How to fix:** Use `pnpm exec tsx scripts/upload-tutorial.ts path/to/file.json --status PUBLISHED`
  directly (no `pnpm run`, no `--` separator). Or loop from `packages/db/` and use
  `pnpm exec tsx scripts/upload-tutorial.ts "$f" --status PUBLISHED`.

- **`voice-check.ts` resolves paths relative to `packages/db/`, not the repo root** `[block]`
  Pattern: `pnpm --filter "@homemade/db" exec tsx scripts/voice-check.ts docs/natural-home-bulk-001-briefs/01-foo.json`
  fails silently or reads the wrong file.
  **Why:** The voice-check script resolves its file argument relative to the `packages/db/`
  directory (its `process.cwd()` when run via pnpm filter). A relative path like
  `docs/…` will be looked up under `packages/db/docs/` which does not exist.
  **How to fix:** Always pass an **absolute path** to `voice-check.ts`:
  ```bash
  REPO=$(git rev-parse --show-toplevel)
  pnpm --filter "@homemade/db" exec tsx scripts/voice-check.ts "$REPO/docs/natural-home-bulk-001-briefs/01-foo.json"
  ```
  Or cd to the repo root and use `$(pwd)/docs/…`. The upload script does not have this
  problem — it accepts relative paths. Only voice-check requires absolute paths.

- **New PracticeTarget enum values not in generated Prisma client** `[block]`
  Pattern: Upload fails with `Invalid value for argument 'practiceTargets'. Expected PracticeTarget.`
  even though the value is present in `schema.prisma`.
  **Why:** The Prisma client is generated from the schema at build time. If an enum value
  is added to the schema (e.g. `HOME`) without running `prisma generate`, the generated
  client won't know about it.
  **How to fix:** Run `pnpm --filter "@homemade/db" exec prisma generate` before uploading
  any batch that uses newly-added enum values. Check the generated client at
  `node_modules/.pnpm/@prisma+client@7.8.0_*/node_modules/.prisma/client/index.d.ts`
  to confirm the value is present before relying on it.

- **"target" as common noun triggers brand-trademark false positive** `[warn]`
  Pattern: `"the target is set whites"`, `"the target internal temperature is 74°C"` —
  the word "target" (meaning goal or aim) triggering the "Target" shop brand check.
  First seen bulk-026 (holodets: "target window"), recurred bulk-027 (huevos-a-la-flamenca,
  souvlaki-chicken).
  **How to fix:** Replace with "aim", "correct", or "goal": `"the aim is set whites"`,
  `"the correct internal temperature is 74°C"`.
