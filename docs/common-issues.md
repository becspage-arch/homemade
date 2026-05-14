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

- **Brand-trademark mentions in titles, ingredients, or prose** `[block]`
  Pattern: a registered trademark name used directly — "Wagamamas
  chicken katsu curry", "Nutella stuffed cookies", "Tabasco", "Marmite
  on toast", "KitchenAid stand mixer", "from Tesco". Caught in the
  first ingest of Rebecca's personal recipes (May 2026), led to the
  brand-trademark rule.
  **How to fix:** use the generic equivalent. Wagamama → Japanese-style;
  Nutella → chocolate hazelnut spread; Oreo → chocolate sandwich
  biscuit; Biscoff → caramelised biscuit; Baileys → Irish cream
  liqueur; Tabasco → Louisiana hot sauce; OXO → stock cube;
  KitchenAid → stand mixer; Tesco → any supermarket. Full list in
  [`packages/db/scripts/data/banned-brands.ts`](../packages/db/scripts/data/banned-brands.ts).
  The voice-check `brand-trademark` rule blocks the upload, scanning
  title / subtitle / excerpt / source notes / body. The narrow
  genericised tier (Sriracha, Hoover, Sellotape) only warns.

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

## Structural issues

(empty initially — populated as workers spot recurring structural
patterns, e.g. closing paragraphs that wrap up, intros that lead with
generic claims rather than concrete facts, etc.)

## Metadata issues

(empty initially — populated as workers spot recurring metadata
patterns, e.g. dietary flags missed, wrong cuisine, missing
freeze/batch notes for obvious candidates.)

## Cross-category issues

(empty initially — populated once we have more than one category in
production. Things like "method prose loses scaling tokens on bake-time
references" or "garden tutorials forget zone metadata".)
