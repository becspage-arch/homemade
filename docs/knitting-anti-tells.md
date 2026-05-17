# Knitting anti-tells — drafts that recur

Patterns that recur in Knitting drafts often enough to be worth catching
proactively during self-critique. Maintained as a living list — the
Knitting equivalent of `docs/common-issues.md` for the shared cross-
category list, and the analogue of `docs/crochet-anti-tells.md` (which
covers most of the textile-craft patterns that also apply to knitting).

**How this list is used:**

- Every Knitting drafting worker reads this file at session start.
- The body-authoring self-critique pass (`docs/knitting-author.md`
  § "Self-critique pass") checks each entry below against the draft
  and rewrites any matching line.
- When a worker spots a new pattern recurring 3+ times in its batch,
  it appends an entry to the relevant section.
- Deterministic rules (banned phrases, banned verbs) also belong in
  `packages/db/scripts/voice-check.ts` so the upload gate catches them
  without relying on self-critique. Entries marked `[needs-voice-check]`
  are ready to land there.

Format per entry: short rule, **Why**, **How to fix**. Severity flag:
`[block]` (rewrite mandatory), `[warn]` (rewrite preferred but not
required).

Seeded with patterns from cooking / baking / crochet / herbal that
translate to knitting, plus knitting-specific patterns the anchor batch
expects to see.

---

## Terminology + voice (the strict ones)

- **UK / US needle numbering confusion** `[block]`
  Pattern: "size 8 needles" without the mm. UK 8 = 4 mm, US 8 = 5 mm.
  The reader on the wrong side of the Atlantic gets a different gauge.
  **Why:** The two numbering systems are inverted; the mm value is the
  only universal reference.
  **How to fix:** State the canonical mm first ("4 mm needles"), then
  UK / US in brackets on first use ("4 mm (UK 8 / US 6)"). The master
  `KnittingNeedle` table seeds every common size's conversions; the
  renderer surfaces the reader's preferred numbering automatically.

- **UK / US stitch-name confusion** `[block]`
  Pattern: "stockinette" used in a UK-terminology body, or "moss
  stitch" used in a US-terminology body without the bracket
  disambiguation. UK "moss stitch" = US "seed stitch"; UK "double
  moss" = a different stitch from US "moss".
  **Why:** Misreading a stitch name produces visibly different fabric.
  **How to fix:** State the master `Stitch` table's `ukName` and
  `usName` on first use ("stocking stitch (US: stockinette)"), then
  stay in the terminology `knitting.terminologyConvention` declares.

- **Gauge swatch skipped or trivialised** `[block]` `[needs-voice-check]`
  Pattern: PATTERN bodies that say "if you want to swatch you can",
  "skip the swatch if you're confident", or omit the "Gauge" section
  entirely.
  **Why:** Gauge is the single most-skipped step and the single largest
  cause of pattern failures. A pattern without a stated consequence-of-
  skipping leaves the reader to find out their hat is the wrong size
  after a week's work.
  **How to fix:** Every PATTERN body has a "Gauge" H2. State the gauge
  AND the consequence ("a hat 4 cm too tight across the brow"). The
  voice is kind but firm — never apologetic.

- **Cable diagram glossed over** `[block]`
  Pattern: a PATTERN that includes cabling but ships no chart, OR
  ships a chart without explaining how to read it (which side starts
  on the right, which way the cable leans, where the cable needle
  goes).
  **Why:** Cables are the moment a reader most needs a visual.
  **How to fix:** Every cabling PATTERN includes at least one chart
  (Tutorial-level `chartDefinition` or inline `craftChart` block).
  The first chart in the body is paired with a paragraph explaining
  how knitting charts read (bottom-to-top, right-side rows right-to-
  left). Subsequent charts can lean on that introduction.

- **Brand-yarn dependence** `[block]` `[needs-voice-check]`
  Pattern: a PATTERN body that names a specific yarn ("Cascade 220",
  "Drops Karisma", "Malabrigo Sock") as if it were the only acceptable
  yarn.
  **Why:** The publication is global; the reader in Cape Town or
  Buenos Aires can't reliably source Cascade 220. Brand-locking
  excludes most of the audience.
  **How to fix:** Name the **yarn weight class** by its UK-named slug
  (`dk` for double-knit, `aran` for aran / worsted, `chunky` for
  chunky / bulky), a **fibre suggestion**, and a **total grams**.
  Yarn brand-name substitution is the reader's.

- **"Easy" without skill specification** `[warn]`
  Pattern: a STITCH or PATTERN calling itself "easy" without naming
  the skill band that finds it easy. A cable is easy for a knitter
  comfortable with cables; intimidating to a first-time cabler.
  **Why:** "Easy" without context is sales copy.
  **How to fix:** Pair the skill claim with the prerequisite. "An
  easy pattern for a knitter comfortable with knit and purl —
  k2tog and ssk make their first appearance here."

- **Continental vs English assumption** `[warn]`
  Pattern: prose assuming yarn-throwing (English style) or yarn-
  picking (Continental) without naming the assumption where the style
  matters (purling, brioche, tension control).
  **Why:** Most readers stick to whichever style they learned first.
  **How to fix:** When the style matters, name both. "Most English-
  style knitters find brioche easier to count by tapping the needle;
  Continental-style knitters can pick the strand from below with the
  same effect."

- **Modern-designer name-drops with unclear copyright** `[block]`
  Pattern: a PATTERN body that credits or quotes a modern named
  designer ("Joji Locatelli's Three Color Cashmere Cowl", "Antarktis
  by Janina Kallio", "Stephen West's Doodler") as the basis for the
  pattern.
  **Why:** Modern designer patterns are in copyright; reproducing or
  closely paraphrasing them exposes the publication to takedown.
  **How to fix:** Cite the underlying public-domain source (Weldon's,
  Beeton's, Mary Thomas, the tradition itself). If the pattern is
  genuinely modern and the source is unclear, the pattern doesn't
  belong in the PD-only launch library.

## Pattern structure

- **Missing RS / WS markers** `[block]`
  Pattern: "Row 1: k2, p2 across" without "(RS)" or "(WS)" after the
  row number. Once a reader loses track of which side is facing, the
  rest of the pattern collapses.
  **Why:** RS / WS is the orientation anchor for every pattern.
  Cables, increases, decreases all behave differently per side.
  **How to fix:** Every row introducing a new operation carries the
  marker: "Row 1 (RS): k2, p2 across." "Row 2 (WS): k the knits, p
  the purls as they appear."

- **Cast-on / cast-off method unspecified** `[warn]`
  Pattern: "Cast on 24 stitches" without naming the method. Long-tail,
  cable, knitted, German twisted cast-on each produce different edges.
  **Why:** The cast-on edge is the most visible part of the finished
  object.
  **How to fix:** Name the method on first use ("Cast on 24 stitches
  using the long-tail cast-on"). Beginner patterns may add a one-line
  note on why. Cast-off the same — name the method.

- **Yardage instead of grams** `[block]`
  Pattern: yarn quantity stated only in yards. Leaves UK / EU readers
  converting.
  **Why:** The publication's primary measurement is metric; UK yarn
  labels carry grams + metres. Yardage is fine as a secondary reference.
  **How to fix:** State **grams primary**, **metres secondary in
  brackets**, with yards alongside metres for the US reader. "About
  200 g (440 m / 480 yards) of aran-weight yarn."

- **Finished dimensions vague** `[block]`
  Pattern: "fits most adult heads", "comfortably oversized", "average
  scarf length". The reader can't plan around vague dimensions.
  **Why:** The `finishedSizeText` field surfaces on the pattern info-
  bar; the body prose has to match.
  **How to fix:** State the dimensions in cm with the unit. "Finished
  length 180 cm × width 22 cm." Variations are named explicitly.

- **Blocking step omitted** `[warn]`
  Pattern: a PATTERN ending with "weave in ends" and stopping, without
  naming the blocking step.
  **Why:** Blocking opens up lace, evens out tension, sets the finished
  dimensions. Skipping it means the finished object measures
  differently from the pattern's stated dimensions.
  **How to fix:** Every PATTERN's "Finishing" section names the
  blocking type (wet-block / steam-block / no-block — the last for
  cotton dishcloths) and the time.

## Metadata + structural

- **Wrong category slug** `[block]`
  Pattern: `"categorySlug": "knit"` or `"categorySlug": "knits"`.
  **Why:** The seeded slug is `knitting`; the upload script rejects
  anything else.
  **How to fix:** Always `"categorySlug": "knitting"`.

- **Wrong type for the entry kind** `[block]`
  Pattern: a stitch tutorial drafted as `type: "TECHNIQUE"`, a pattern
  drafted as `type: "RECIPE"`.
  **Why:** STITCH and PATTERN ship the textile-craft info-bar with
  gauge / needle / yarn-weight + the chart slot. A stitch rendered as
  TECHNIQUE loses the chart placement.
  **How to fix:** STITCH for single stitches, PATTERN for full
  finished objects. The upload script validates the type against the
  `knitting` block — PATTERN without `knitting.primaryYarnWeightSlug`
  / `primaryNeedleSlug` / `gaugeText` / `finishedSizeText` is rejected.

- **Stitch slug not craft-prefixed** `[block]`
  Pattern: `"craftStitchSlugs": ["knit", "c4f"]` instead of
  `["knitting-knit", "knitting-cable-4-front"]`.
  **Why:** The master `Stitch` table uses craft-prefixed slugs so the
  same word across crafts doesn't collide. The unprefixed slug doesn't
  exist; upload fails loudly.
  **How to fix:** Use `knitting-*` prefixed slugs always. Open
  `data/stitches.ts`, filter to `craft: 'knitting'`, confirm each
  slug. Add missing stitches there and reseed before uploading.

- **Yarn weight slug wrong** `[block]`
  Pattern: `"primaryYarnWeightSlug": "light"` or `"medium"` or
  `"bulky"` (the US-style names).
  **Why:** The master `YarnWeight` table uses UK-named slugs to match
  the crochet seed: `lace`, `fingering`, `sport`, `dk`, `aran`,
  `chunky`, `super-chunky`, `jumbo`. The US weight names (light,
  worsted, bulky) live in the `usNames` array but the slug is the UK
  name.
  **How to fix:** Use the slug from `data/yarn-weights.ts`. DK / light-
  worsted → `dk`. Aran / worsted → `aran`. Chunky / bulky → `chunky`.

- **Needle slug not canonical mm** `[block]`
  Pattern: `"primaryNeedleSlug": "knitting-needle-uk-7"` or
  `"knitting-needle-size-8"`.
  **Why:** Slugs follow the canonical-mm convention
  (`knitting-needle-4-5mm`).
  **How to fix:** Always the mm slug. Open `data/knitting-needles.ts`
  to confirm.

- **Chart layout `round` instead of `flat`** `[block]`
  Pattern: a knitting chart with `"layout": "round"`. Knitting publishing
  convention shows even in-the-round patterns as a flat repeat.
  **Why:** The Stitch glyphs in `chart-symbols.ts` are positioned for
  the flat-grid layout; the round layout is crochet-only.
  **How to fix:** Always `"layout": "flat"` for knitting charts. The
  prose explains how the flat repeat is worked across the round.

- **Chart `craft` other than `knitting`** `[block]`
  Pattern: a `craftChart` block on a knitting tutorial with `"craft":
  "crochet"` (or unset). The renderer's symbol lookup uses the craft
  to resolve the glyph; the wrong craft yields garbled charts.
  **How to fix:** Always `"craft": "knitting"` for knitting charts.

- **Chart symbol key not in chart-symbols.ts** `[warn]`
  Pattern: `{"symbol": "ktbl"}` when the registered key is `knit-tbl`,
  or `{"symbol": "c4-front"}` when the key is `cable-4-front`.
  **Why:** Unknown keys render as labelled placeholders, not glyphs.
  **How to fix:** Use the exact key from `chart-symbols.ts`. Add new
  glyphs to that file when a pattern needs a key that isn't there.

- **`recipe.scalable: true` on a knitting PATTERN** `[block]`
  Pattern: a PATTERN row left with the default `scalable: true`.
  Knitting patterns don't "scale 2×"; they resize via different cast-
  on counts, repeats, or yarn weight.
  **Why:** The recipe scaler is a food concept. Surfacing a 2× / 4×
  scaler on a hat pattern is nonsense.
  **How to fix:** Knitting bodies should set `recipe.scalable: false`
  (when the recipe block is set at all). Variations live in the body's
  "Variations" section.

- **Season enum lowercase** `[block]`
  Pattern: `"season": "winter"`. Prisma rejects lower-case values.
  **How to fix:** Use `AUTUMN`, `WINTER`, `SPRING`, `SUMMER`,
  `YEAR_ROUND`, or `null`. Most knitting entries are year-round.

- **Em-dash appositive pairs in body or sourceNotes** `[block]`
  Pattern: `"Weldon's Practical Knitting — the Victorian reference —
  covers…"`. Voice-check treats `— text —` as an error.
  **How to fix:** Rewrite as colons, parentheses, or two sentences.

## Source attribution

- **Citing a knitting-blog URL as a primary source** `[block]`
  Pattern: `sourceNotes` listing a Substack, Medium post, or
  knitting-influencer blog as the primary citation.
  **Why:** The knitting blogosphere is a thin layer over Weldon's,
  Beeton's, Mary Thomas, and Barbara Walker. Citing the blog obscures
  whether the pattern has any basis in the long-established literature.
  **How to fix:** Cite the underlying PD or open-access source.

- **Reproducing Barbara Walker patterns verbatim** `[block]`
  Pattern: a PATTERN body lifting a Walker stitch pattern text + chart
  verbatim.
  **Why:** Walker's books are still in print and her estate enforces.
  **How to fix:** Cite Walker as reference for the structure; describe
  the stitch in your own words and draw a fresh chart.
