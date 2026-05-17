# Crochet anti-tells — drafts that recur

Patterns that recur in Crochet drafts often enough to be worth catching
proactively during self-critique. Maintained as a living list — the
Crochet equivalent of `docs/common-issues.md` for the shared cross-
category list, and the analogue of `docs/baking-anti-tells.md`,
`docs/garden-anti-tells.md`, and `docs/herbal-anti-tells.md`.

The safety stakes are lower than Herbal (no medical claims), but the
technical-accuracy stakes are higher than any other craft — a pattern
that doesn't tension-out, a turning chain that doesn't say whether it
counts, a UK/US terminology slip mid-pattern, all cost the reader a
whole evening.

**How this list is used:**

- Every Crochet drafting worker reads this file at session start.
- The body-authoring self-critique pass (see `docs/crochet-author.md`
  § "Self-critique pass") includes a step that checks each entry below
  against the draft and rewrites any matching line.
- When a worker spots a new pattern recurring 3+ times in its batch,
  it appends an entry at the end of the relevant section before the
  session hands off.
- When Rebecca spot-checks live entries and finds a recurring issue,
  she adds an entry directly. The next batch picks it up.
- Where a pattern is deterministic (a banned phrase, an inconsistent-
  abbreviation check, a missing-gauge check), it should also be added
  to `packages/db/scripts/voice-check.ts` so the upload gate catches
  it without relying on self-critique. The Crochet-specific voice-
  check extension is its own session — entries marked
  `[needs-voice-check]` are ready to land there.

Format per entry: a short rule, **Why**, **How to fix**. Severity flag
with the rule: `[block]` (rewrite mandatory), `[warn]` (rewrite
preferred but not required).

Seeded with the patterns the anchor-batch worker expected to see + the
patterns the cooking, baking, garden, and herbal pipelines surfaced
that translate to crochet. Will accrue more entries as pilot / bulk
batches land.

---

## Terminology consistency (the strict ones)

- **UK / US abbreviation mix in one pattern** `[block]` `[needs-voice-check]`
  Pattern: the body uses `dc` (UK double crochet) in one row and
  `dc` (US double crochet, which would be UK treble) in the next, or
  any other inconsistent shift between conventions inside the same
  pattern. Most-common offender: an author drafts the prose in UK
  convention but slips into US convention for a single instruction
  borrowed from a US source.
  **Why:** Mixed conventions mid-pattern is the canonical crochet bug.
  A reader following row 1 in UK convention is making a piece twice as
  tall as the author intended by row 2. Catastrophic for size + gauge.
  **How to fix:** Pick one `crochet.terminologyConvention` per
  tutorial and stick with it. UK is the publication default. When
  citing a US source, translate the convention at the moment of
  citation; never reproduce US abbreviations verbatim inside UK prose.
  Set the field on the input and verify every abbreviation in the body
  matches.

- **"DC" capitalised in mid-prose** `[warn]` `[needs-voice-check]`
  Pattern: the abbreviation appears as `DC` in some rows and `dc` in
  others — or the body uses uppercase abbreviations throughout. The
  Pauline Turner / Edie Eckman convention is lowercase abbreviations
  in pattern shorthand; capital letters read as US convention or as
  early-2000s pattern-blog style.
  **Why:** Consistency. The British modern crochet publishing
  convention is lowercase.
  **How to fix:** Lowercase abbreviations throughout (`ch`, `dc`,
  `htr`, `tr`, `dtr`, `sl st`). Stitch counts at the end of rows
  remain plain numbers ("(40 sts)" — lowercase "sts" too).

- **Treble named without the UK/US note in the intro** `[warn]`
  Pattern: the pattern features treble crochet (UK `tr` = US `dc`)
  but the intro doesn't surface the convention split. A reader
  arriving from a US-pattern background reads "treble" expecting US
  treble (which is UK double treble) — twice the height.
  **Why:** The most-confused stitch in crochet is the treble; the
  intro is the place to disambiguate.
  **How to fix:** On any pattern using `crochet-treble` and naming it
  in the intro, add one sentence: "UK treble (the same move US
  patterns call double crochet)." On stitch tutorials for treble or
  double crochet, the full convention discussion lives in the intro.

## Gauge + finished size

- **Missing gauge on a PATTERN** `[block]` `[needs-voice-check]`
  Pattern: a PATTERN body without a "Gauge" H2 section, or without
  a `gaugeText` field, or with a gauge that says only "use any DK
  yarn".
  **Why:** Gauge is the single point of communication between the
  pattern writer and the reader's hook tension. A pattern without
  gauge is a pattern that misfits — the reader's blanket is twice
  the size or half the size and the hours are wasted.
  **How to fix:** Set `crochet.gaugeText` on the input ("18 dc × 10
  rows = 10 × 10 cm in DK cotton with a 4 mm hook, after a light
  steam-block"). Insert a "Gauge" H2 in the body, quote the
  `gaugeText` verbatim, then a sentence on how to swatch (work a
  square of ≥10 cm in the main stitch, measure unstretched, swap
  hook size if the tension misses by more than ~10%).

- **Missing finished size on a PATTERN** `[block]`
  Pattern: a PATTERN without `finishedSizeText` or without the size
  named in the body intro.
  **Why:** A reader needs to know the finished size before starting
  — to decide if it fits the purpose (lap blanket vs throw vs sofa-
  cover), to budget yarn, to decide on yarn substitution. Missing
  finished size is missing the most-asked question.
  **How to fix:** Set `crochet.finishedSizeText` on the input. The
  body intro names the finished size in the first or second
  paragraph.

- **"Tension" and "gauge" used interchangeably without saying so** `[warn]`
  Pattern: the body says "gauge" once and "tension square" later
  without a glossary entry or a clarifying clause.
  **Why:** Both terms are correct British usage but a beginner
  reading the body thinks the author means two different things.
  **How to fix:** Pick one term for the body. If both must appear
  (citing a UK source that uses "tension"), name the synonymy
  in-prose at first use: "the gauge — older British patterns call
  this a tension square."

## Pattern construction

- **Turning chain count not stated** `[block]` `[needs-voice-check]`
  Pattern: a row instruction reads "Row 2: ch, work treble across" —
  without specifying how many chains the turning chain is, and
  whether it counts as a stitch.
  **Why:** The turning chain controls the row height and the stitch
  count. UK treble takes a 3-chain turning chain that counts as the
  first treble; UK double crochet takes a 1-chain that doesn't count.
  Ambiguity here is the most-common cause of size drift.
  **How to fix:** Every row instruction states: the turning chain
  count, and whether it counts as a stitch. "Row 2: ch 3 (counts as
  the first treble), 1 tr in each st across (40 sts)." On rows where
  the turning chain doesn't count: "ch 1 (does not count as a stitch),
  1 dc in each st across (40 sts)."

- **Stitch count not stated at end of row / round** `[block]`
  Pattern: a pattern row or round without the running stitch count
  in brackets at the end.
  **Why:** The stitch count is the reader's verification anchor —
  the way they catch a drifted row before it cascades into the next.
  Patterns without counts are patterns that hide their bugs from the
  reader until the piece is the wrong size.
  **How to fix:** Every row / round ends with "(N sts)" or
  "(N st around)". For motif patterns where the count varies per
  round, every round names its own count.

- **Increase / decrease shorthand without the move** `[warn]`
  Pattern: a row instruction uses `inc` or `dec` without naming the
  exact move ("2 tr in next st" for increase; "tr2tog" for decrease).
  Modern crochet pattern conventions favour the explicit move over
  the abbreviation `inc` / `dec`, because the abbreviation hides
  whether the increase / decrease lands on the stitch itself or the
  space between stitches.
  **Why:** A beginner reading `inc` doesn't know whether to work
  two trebles into one stitch or two trebles into a chain space.
  Explicit moves resolve the ambiguity.
  **How to fix:** Replace `inc` with "2 tr in next st" or "2 tr in
  next ch sp". Replace `dec` with "tr2tog over next 2 sts". When
  the source pattern uses `inc` / `dec`, translate at the moment of
  citation.

- **Granny-square corner described without the chain-space** `[block]`
  Pattern: the granny-square pattern says "work 3 trebles in the
  corner" without specifying the chain-space and the chain count
  between the two clusters that make the corner.
  **Why:** The granny-square corner is two 3-treble clusters
  separated by 2 chains, all worked into the same chain-space.
  Missing any element makes a non-granny-square (a circle, or a
  hexagon, or just a mess).
  **How to fix:** State the full corner: "Into each corner ch-2 sp,
  work (3 tr, ch 2, 3 tr)." Show it on the chart. Cross-reference
  to a "what a granny-square corner looks like" `infoPanel` if the
  pattern is the reader's first granny.

- **Magic ring + first round in one instruction** `[warn]`
  Pattern: "Round 1: in a magic ring, ch 3 (counts as tr), 11 tr
  into ring, sl st to top of beg ch (12 sts)." — fine in a pattern
  for an experienced crocheter, but the magic ring is the
  notoriously hard move for beginners, and crushing it into the
  same instruction as the first round buries the technique.
  **Why:** Beginners hit two unfamiliar moves at once; the failure
  cascades.
  **How to fix:** On BEGINNER patterns, the first round names the
  magic ring as a separate prep step before round 1. Cross-reference
  to the `crochet-magic-ring` STITCH tutorial via `subTutorialCard`.

## Yarn + materials

- **Yarn brand named as a requirement** `[block]`
  Pattern: "you'll need 200 g of Stylecraft Special DK in pale rose"
  or "King Cole Cottonsoft" or any other brand named as a buying
  instruction.
  **Why:** The publication doesn't endorse particular brands.
  Naming a brand turns the pattern into product placement; it also
  ages badly when the brand discontinues the colour.
  **How to fix:** Specify yarn weight + fibre + colour: "200 g
  DK-weight cotton yarn in pale rose, and 50 g DK-weight cotton in
  cream for the contrast border". When a brand is in a public-domain
  source ("Coats Mercer-Crochet Cotton No. 20 in Weldon's"), surface
  it as historical context, not endorsement.

- **Yarn weight stated only in the source's convention** `[warn]`
  Pattern: a pattern citing a US source uses "worsted weight" without
  naming the UK equivalent ("aran"), or a pattern citing a UK source
  uses "4-ply" without naming the US equivalent ("fingering").
  **Why:** Yarn weight is the single biggest reader question
  before starting. Naming only one convention forces the cross-
  region reader to look it up.
  **How to fix:** State the yarn weight slug from the master
  `YarnWeight` table (the renderer surfaces the UK + US names from
  the master row). In the prose, name the primary convention plus
  the cross-region equivalent: "DK-weight cotton (US light worsted)".

- **"Free pattern" framing** `[warn]`
  Pattern: the body uses "free pattern" as a value-prop ("here's a
  free pattern for…") or as a category descriptor.
  **Why:** The phrase belongs to the pattern-piracy / pattern-blog
  ecosystem; on a publication that resurfaces public-domain
  patterns, it reads as marketing copy.
  **How to fix:** Plain "pattern" or "the granny-square pattern".
  When the pattern is from a public-domain source, name the source:
  "Weldon's granny-square pattern, redrafted for modern yarn".

## Hook + tools

- **Hook size given only in one convention** `[warn]`
  Pattern: "use a 4 mm hook" with no US / JP equivalent, or "use a
  G/6 hook" with no mm equivalent.
  **Why:** Hook conversions are not obvious; readers crossing from a
  different region need both.
  **How to fix:** State the mm size + the conversion in brackets:
  "4 mm hook (US G/6)". The renderer also surfaces the full
  conversion from the master `CrochetHook` table, but the body's
  first reference includes both conventions.

- **"Any hook that gets gauge" without the starting size** `[warn]`
  Pattern: an instruction to "use any hook that achieves gauge"
  without naming a starting hook size.
  **Why:** Even readers who plan to swap hook sizes need a starting
  point to swatch from. The bare "use any hook" instruction reads as
  a punt.
  **How to fix:** Name the starting hook size: "Start with a 4 mm
  hook and adjust up or down a size if your swatch misses gauge."

## Charts

- **Chart and prose disagree** `[block]`
  Pattern: the chart shows 12 stitches in round 1 but the prose says
  11 stitches; the chart shows a corner shell with 5 trebles but the
  prose says 3.
  **Why:** Two sources of truth in the same pattern. Readers split
  between chart-followers and prose-followers; if the two disagree,
  half the readers make a different piece.
  **How to fix:** Treat the prose as the canonical source; the
  chart visualises the prose. Walk the chart cell-by-cell and check
  against the prose row / round. Update whichever is wrong.

- **Chart with unknown symbol keys** `[block]`
  Pattern: the `chartDefinition` references symbol keys that don't
  exist in `apps/web/src/lib/craft-charts/chart-symbols.ts`.
  **Why:** Unknown keys render as a labelled `?` placeholder — the
  chart silently degrades to half-information.
  **How to fix:** Walk every symbol in the chart definition. Add
  any missing symbol to `chart-symbols.ts` (with a clean 24×24 SVG
  glyph) before authoring. If the symbol is genuinely one-off (a
  per-pattern composite glyph), set the symbol key to the closest
  generic and add an in-cell `label` for the variation.

- **Chart without legend** `[warn]`
  Pattern: a chart with symbols readers may not recognise (popcorn,
  bobble, crossed treble) where the renderer surfaces the legend
  but the body doesn't lead with the legend's role.
  **Why:** The renderer's legend is small. For complex charts the
  body's prose pointer ("the chart symbol key sits beneath the
  chart") helps readers find it.
  **How to fix:** On any chart with more than four distinct
  symbols, the caption (the chart's `caption` field) names the
  legend's location and reminds readers to read in working order.

## Voice + structure

- **"Easy" / "quick" / "simple" without qualification** `[warn]` `[needs-voice-check]`
  Pattern: "an easy beginner project" or "a quick weekend make".
  **Why:** Bare adjectives read as marketing. The difficulty field
  communicates the level; the prose doesn't need to repeat it.
  **How to fix:** "Beginner-friendly" or "first crochet project"
  is fine when accurate. For weekend-scale projects, "a one-evening
  project" or "a single-afternoon make" — concrete time, not bare
  "quick".

- **"Don't worry!" / "you've got this!" lines** `[warn]`
  Pattern: condescending encouragement.
  **Why:** First-time crocheters and experienced makers read the
  same prose. The tone trusts both. "Don't worry" reads as the
  publication doubting the reader's competence.
  **How to fix:** State the difficulty honestly and trust the
  reader. When a step is famously prone to a particular failure,
  name the failure and the fix, not the emotion.

- **"In just a few rows…" / "almost done!" pacing notes** `[warn]`
  Pattern: pacing reassurance inside row instructions.
  **Why:** Pacing notes interrupt the reader's working flow.
  **How to fix:** Pacing belongs in the intro or the section
  before "Pattern". Working instructions stay procedural.

- **Wrap-up sentence after the last row** `[block]` `[needs-voice-check]`
  Pattern: "And there you have it — your finished granny square!"
  after the last working instruction.
  **Why:** Crochet pattern convention ends with "Fasten off and
  weave in ends." A wrap-up cheer line is a tell of marketing-blog
  style.
  **How to fix:** End the pattern section with "Fasten off and weave
  in ends." Move every finishing instruction into the "Finishing"
  H2. Move every variation suggestion into "What to try next".

## Crediting + sourcing

- **Public-domain pattern credited to a modern named crocheter** `[block]`
  Pattern: a granny square attributed to a 21st-century crochet
  blogger, when the actual source is Weldon's Practical Crochet
  (1880s).
  **Why:** Public-domain attribution belongs to the original source.
  Re-attributing a Victorian pattern to a modern named creator is
  a form of provenance theft.
  **How to fix:** Cite the earliest source the worker can verify.
  Modern names belong in `sourceNotes` only when the modern
  contribution is genuine (a new joining method, a new colour
  treatment) — and even then named alongside the historical source.

- **"Invented in the 1970s" / "popularised by the hippies"
  granny-square framing** `[warn]`
  Pattern: granny-square histories that start in the 1970s or
  pin the motif to mid-century counterculture.
  **Why:** The granny square is documented in Weldon's Practical
  Crochet from the 1880s. The 1970s revival is real but the motif
  is Victorian.
  **How to fix:** Name the actual provenance: Victorian granny-
  square motifs, the 1970s mass-revival driven by yarn scrap-use.
  Both dates, not just the revival.

## TipTap blocks + structure

- **Chart inside a recipe block** `[block]`
  Pattern: a `craftChart` block placed inside an `ingredientsList`
  attrs or a `suppliesCard` items array.
  **Why:** TipTap block nesting rules. Charts are top-level body
  blocks; nested chart definitions render as nothing.
  **How to fix:** Move the `craftChart` block to the body's
  top-level content array, between the "Pattern" and "Finishing"
  H2 sections.

- **`subTutorialCard` to a STITCH that doesn't exist** `[warn]`
  Pattern: a pattern's "Stitches used" list cross-references a
  STITCH tutorial slug that isn't yet authored.
  **Why:** Renders as a "Linked tutorial not yet chosen" placeholder
  on the public page.
  **How to fix:** Skip the cross-reference at draft time; add it
  in a follow-up batch once the STITCH tutorial lands. Alternatively,
  log the missing slug to `docs/missing-techniques.md` and continue.

---

## Anchor-batch additions

(empty — appended as the anchor + pilot batches surface new patterns)
