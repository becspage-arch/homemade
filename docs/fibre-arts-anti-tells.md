# Fibre arts anti-tells — drafts that recur

Patterns that recur in Fibre arts drafts often enough to be worth
catching proactively during self-critique. Maintained as a living
list — the Fibre arts equivalent of `docs/common-issues.md` for the
shared cross-category list.

**How this list is used:**

- Every Fibre arts drafting worker reads this file at session start.
- The body-authoring self-critique pass (see `docs/fibre-arts-author.md`
  § "Self-critique pass") includes a step that checks each entry
  below against the draft and rewrites any matching line.
- When a worker spots a new pattern recurring 3+ times in its
  batch, it appends an entry at the end of the relevant section
  before the session hands off.
- Where a pattern is deterministic (a banned phrase, a banned
  register-word), it should also be added to
  `packages/db/scripts/voice-check.ts` so the upload gate catches
  it without relying on self-critique. Entries marked
  `[needs-voice-check]` are ready to land there.

Format per entry: a short rule, **Why**, **How to fix**. Severity
flag with the rule: `[block]` (rewrite mandatory), `[warn]`
(rewrite preferred but not required).

Seeded with patterns from bulk-001 (41 entries across felting,
spinning, weaving, natural dyeing, macramé, rug-making).

---

## Safety and hazard issues

- **Safety infoPanel body exceeds 25 words** `[block]`
  Pattern: a `tone: "warning"` infoPanel whose `body` string runs
  beyond 25 words. The voice-check gate counts words and blocks
  upload on any warning-tone panel over the threshold.
  **Why:** The safety-block rule keeps warning panels short and
  scannable. A long safety panel becomes prose that readers skip.
  **How to fix:** Cut to the single most-important physical action.
  "Wear dedicated gloves, work in a ventilated space, and keep
  mordant jars away from food and children." (13 words) is the
  right shape. If more detail is needed, split into a short
  warning infoPanel + a follow-on `tone: "neutral"` infoPanel.

- **Mordant-safety missing from iron/copper dyeing entries** `[block]`
  Pattern: a dyeing tutorial that uses iron sulphate or copper
  sulphate without a warning infoPanel that names the specific
  hazard (iron: stains + cumulative environmental load; copper:
  toxic to aquatic life, must go to foul drain).
  **Why:** Iron and copper mordants have real disposal obligations
  that a home reader cannot infer. Skipping the panel leaves them
  ignorant of a legal and ecological duty.
  **How to fix:** Add a `tone: "warning"` infoPanel immediately
  after the mordant introduction step. Body text (≤25 words):
  "Dispose of copper mordant bath via the foul drain only. Never
  pour down a storm drain or into any watercourse."

- **Safety panel missing from needle felting entries** `[block]`
  Pattern: a needle felting PATTERN or TECHNIQUE that has no
  infoPanel warning about needle puncture hazard.
  **Why:** Felting needles are extremely sharp and puncture wounds
  are common; the needle-in-at-90° rule is non-obvious to beginners.
  **How to fix:** Include at entry to every needle felting body:
  `{ "type": "infoPanel", "attrs": { "tone": "warning", "title":
  "Needle safety", "body": "Always stab straight in and out at 90
  degrees. The needle must enter foam, not a hard surface, on every
  stroke." } }`

---

## Banned phrase issues

- **"a tapestry needle" triggers the "a tapestry" banned-phrase check** `[block]`
  Pattern: finishing instructions that say "sew with a tapestry
  needle" or "weave in with a tapestry needle". The voice-check
  `whole: false` setting means "a tapestry" matches as a substring
  anywhere the words appear together.
  **Why:** "a tapestry of..." is a banned AI-tell phrase. The
  substring match catches "a tapestry needle" as a false positive
  that is still a blocking error.
  **How to fix:** Replace "a tapestry needle" with "a blunt darning
  needle" (for finishing woven ends) or "a blunt needle" (general).
  The tool name in `recipeTools` can still use slug `tapestry-needle`
  with `name: "Tapestry needle"` in the suppliesCard; only the body
  prose triggers the check.

- **"genuinely" in troubleshooter fix text** `[block]`
  Pattern: a troubleshooter fix that says "roll it until it is
  genuinely round" or similar. The word "genuinely" is on the
  banned-phrase list.
  **Why:** "genuinely" is a filler intensifier and an AI-voice tell.
  **How to fix:** Remove the adverb. "Roll it until it is round and
  dense" is stronger than "until it is genuinely round and dense".

- **`"target"` triggers brand-trademark substring check (Target retailer)** `[warn]`
  Pattern: phrases like "target tension", "target colour", "target
  yarn weight", "weft target" anywhere in body prose, glossary
  definitions, troubleshooter strings, or excerpt. Recurred 5+ times
  in bulk-005 across weaving, dyeing, and spinning briefs.
  **Why:** `voice-check`'s brand-trademark rule matches "Target"
  (US retailer) on the substring "target" with `whole: false`. False
  positive for the generic noun, but still flagged.
  **How to fix:** Substitute with `desired`, `aim for`, `the count to
  hold`, `planned`, `intended`. "Spin to a desired DK weight" reads
  cleaner than "spin to a target DK weight" anyway.

- **`"anchor"` / `"Anchor"` triggers brand-trademark substring check (Anchor butter / Anchor cord)** `[warn]`
  Pattern: weaving and macramé entries that say "anchor cord",
  "anchor end", "anchor knot", "anchor to a wall". Recurred 2+ times
  in bulk-005 (backstrap-loom, macramé curtain tieback).
  **Why:** `voice-check`'s brand-trademark rule matches "Anchor"
  (UK dairy brand + cord brand). False positive but flagged.
  **How to fix:** Substitute with `mount cord`, `tie point`, `fixed
  wall hook`, `holding cord`, `securing knot`. Where the cord
  genuinely serves a structural anchoring role, `mount` reads more
  natural than `anchor` in macramé instruction.

- **`"Jacob"` as sheep breed name triggers brand-trademark check** `[warn]`
  Pattern: any spinning, fleece, or sheep entry that names the Jacob
  breed (multi-coloured British heritage sheep).
  **Why:** `voice-check`'s brand-trademark rule matches "Jacob" on
  the Jacob's biscuit brand. The breed name is the entire subject of
  any Jacob-fleece tutorial; it cannot be omitted.
  **How to fix:** Accept the warnings — the breed name is correct
  usage. Tag the brief in its report as "warnings accepted: Jacob
  breed name". Do not paraphrase as "Jacob's" or "Jacobs" — both
  alternatives are wrong; the breed is named "Jacob".

---

## Glossary coverage issues

- **Glossary term registered but never used inline** `[block]`
  Pattern: a term in `glossaryTerms[]` (e.g. "rolag", "weft") that
  never appears in the body wrapped with a `glossaryTooltip` mark.
  The voice-check gate detects this as a coverage violation.
  **Why:** Registered-but-not-used and used-but-not-registered are
  both treated as errors. Every term in the array must appear at
  least once in a tooltip.
  **How to fix:** Either (a) use the term inline — find a natural
  sentence in the body and wrap the word with a glossaryTooltip mark
  for that termSlug, or (b) remove the term from `glossaryTerms[]`
  if it was never needed.

- **"rolag" in glossaryTerms without a body use** `[warn]` `[needs-voice-check]`
  Specific case of the above: spinning and felting entries that
  include "rolag" in the glossary (useful, as the distinction
  from roving is non-obvious) but forget to add it to the body text.
  **How to fix:** Add a natural mention — e.g. in Step 1 of a
  spinning or felting technique: "Carded fleece prepared as a
  [rolag tooltip] compacts well too; allow a few extra minutes at
  the start as the lofty fibres bed in."

---

## Structural issues

- **Step headings formatted as "Step N — Description"** `[block]`
  Pattern: H3 step headings written as "Step 1 — Build the body
  base" using an em dash. The voice-check zero-em-dash rule applies
  to heading text as well as body prose.
  **Why:** Em dashes in any string field are a blocking error.
  Heading text is a string field.
  **How to fix:** Use a colon: "Step 1: Build the body base". This
  is the standard Homemade step-heading form.

- **`requiredCraftMaterials` field included in upload JSON** `[block]`
  Pattern: an upload brief that includes a top-level
  `"requiredCraftMaterials": [...]` array.
  **Why:** `upload-tutorial.ts` does not handle
  `requiredCraftMaterials` — the field is silently dropped and the
  upload may error depending on the Prisma schema version. The field
  belongs only in the pottery / jewellery pipelines where the upload
  script has been extended to handle it.
  **How to fix:** Omit `requiredCraftMaterials` entirely from all
  Fibre arts JSON briefs. Tool slugs go in `recipeTools[]` only.

---

## Voice issues

- **Wheel-spinning mysticism register** `[warn]`
  Pattern: spinning tutorials that use language like "find your
  rhythm", "let the wheel guide you", "meditative flow", "feel the
  fibre come alive". This is the craft-enthusiast magazine register,
  not the Homemade instructional register.
  **Why:** Homemade prose is factual and procedural: what to do,
  what to look for, what goes wrong. Aspirational spinning prose
  is not instructional.
  **How to fix:** State the observation-led cue. "The yarn will
  begin to slip through your fingers when the twist is even" not
  "feel the fibre come alive in your hands".

- **Dyeing result described as "vibrant" or "rich"** `[warn]`
  Pattern: natural dyeing tutorials that promise "vibrant colour"
  or "rich orange". Natural dyes are not vibrant by synthetic-dye
  standards; promising otherwise sets a false expectation.
  **Why:** Natural dye colours are characteristically muted and
  vary by mordant, pH, water hardness, fibre preparation, and dye
  plant freshness. "Vibrant" is accurate for synthetic dyes; for
  natural dyes it often misleads.
  **How to fix:** Name the colour accurately. "A warm amber-yellow
  on alum-mordanted wool" or "a soft rust-orange on unmordanted
  yarn" sets the right expectation.

- **"This is a great project for beginners" opener** `[warn]`
  Pattern: the very first sentence of the body or excerpt
  self-certifying the difficulty level. The difficulty enum and
  excerpt should do this structurally; the body prose starts with
  the subject of the tutorial, not a meta-statement about it.
  **Why:** "This is a great project for beginners" is a filler
  opener that delays getting into the content. It is also
  tautological — BEGINNER is already set in the metadata.
  **How to fix:** Start the body with the subject. "Needle felt a
  compact egg-shaped body in grey-brown merino..." is better than
  "This is a great project for beginners who want to try needle
  felting."
