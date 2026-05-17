# Needlework anti-tells — drafts that recur

Patterns that recur in Needlework drafts often enough to be worth
catching proactively during self-critique. Maintained as a living list
— the Needlework equivalent of `docs/common-issues.md` for the shared
cross-category list, and the analogue of `docs/baking-anti-tells.md`,
`docs/garden-anti-tells.md`, `docs/herbal-anti-tells.md`,
`docs/crochet-anti-tells.md`, and `docs/sewing-anti-tells.md`.

The safety stakes are mid-range (no medical claims, but eye strain +
sharp implements + small parts around children and pets matter). The
technical-accuracy stakes are high — a chart with the wrong colour
key, a needle the wrong size for the cloth, a count that mismatches
the finished-size estimate, all cost the reader an evening they can't
get back. And the IP stakes are unusually high for Homemade because
the cross-stitch + needlepoint world has a deep modern-designer chart
industry; a single citation slip exposes the publication.

**How this list is used:**

- Every Needlework drafting worker reads this file at session start.
- The body-authoring self-critique pass (see `docs/needlework-
  author.md` § "Self-critique pass") includes a step that checks each
  entry below against the draft and rewrites any matching line.
- When a worker spots a new pattern recurring 3+ times in its batch,
  it appends an entry at the end of the relevant section before the
  session hands off.
- When Rebecca spot-checks live entries and finds a recurring issue,
  she adds an entry directly. The next batch picks it up.
- Where a pattern is deterministic (a banned phrase, a missing-floss-
  key check, a missing-cloth-count check), it should also be added to
  `packages/db/scripts/voice-check.ts` so the upload gate catches it
  without relying on self-critique. The Needlework-specific voice-
  check extension is its own session — entries marked
  `[needs-voice-check]` are ready to land there.

Format per entry: a short rule, **Why**, **How to fix**. Severity flag
with the rule: `[block]` (rewrite mandatory), `[warn]` (rewrite
preferred but not required).

Seeded with the patterns the pipeline-scaffold worker expected to see
+ the patterns the cooking, baking, garden, herbal, crochet, and
sewing pipelines surfaced that translate to needlework. Will accrue
more entries as anchor / pilot / bulk batches land.

---

## Source legitimacy (the strict ones)

- **Modern-designer chart cited** `[block]` `[needs-voice-check]`
  Pattern: `sourceNotes` cites Dimensions, DMC modern pattern books,
  Bothy Threads, Riolis, Heaven & Earth Designs, an Etsy designer's
  name, a Lord Libidan post, an Instagram designer handle, or any
  post-1928 chart book. Or the body's intro names a modern designer
  as inspiration ("based on a chart by Riolis").
  **Why:** Modern designer charts are copyright-protected. Even
  "inspired by" is a problem when the chart shape, palette, or scene
  is recognisable. The legal stakes are real and the publication's
  Needlework canon must be defensible cold.
  **How to fix:** Cite only pre-1928 PD sources (Weldon's, Beeton's,
  de Dillmont, Priscilla series, Encyclopædia Britannica eleventh
  edition, Project Gutenberg, Internet Archive). If the pattern is
  inspired by something modern, reject the brief and pick a PD
  alternative. Set `sourceType: "SYNTHESISED"` for original charts
  built from PD reference motifs.

- **"Charted by [name]" or "designed by [name]"** `[block]`
  Pattern: the body credits a named modern designer for the chart.
  **Why:** Same as above. Modern attribution exposes IP risk and
  reads as endorsement.
  **How to fix:** Authorless attribution. The chart is a redrawing
  from PD source motifs or a synthesised composition built on PD
  reference. `sourceNotes` carries the PD reference; the body does
  not name a modern designer.

## Charts + floss keys

- **DMC only or Anchor only in the floss key** `[block]`
  Pattern: the chart palette gives DMC codes but no Anchor codes
  (or the reverse). The body's supplies card cites one brand and
  not the other.
  **Why:** A reader buying from the maker not cited has no
  conversion path. The publication's policy is dual-reference on
  every palette colour.
  **How to fix:** Every palette entry carries `dmcCode` AND
  `anchorCode`. The body's supplies card lists colours in the format
  "soft sage (DMC 522 / Anchor 859)".

- **Brand-anchored cloth name** `[warn]`
  Pattern: the cloth is named "Zweigart 14-count Aida" or "Permin
  evenweave" in the supplies list. Brand endorsement creeps in.
  **Why:** The publication doesn't endorse a cloth maker. Most major
  Aida makers cut to the same counts; the count is what matters.
  **How to fix:** "14-count Aida" or "32-count linen evenweave" —
  count + cloth type only. Aliases can mention brands as alternatives
  in passing if the source pattern names one.

- **Floss-key colour endorsement**  `[warn]`
  Pattern: the body says "DMC 522 is the best green" or "Anchor's
  reds are more lightfast than DMC's".
  **Why:** Brand endorsement. The publication doesn't pick winners.
  **How to fix:** Describe the colour ("soft sage", "deep rose")
  and cite both makers' codes. Lightfastness notes belong in a
  separate READING tutorial on floss properties, not inside a
  pattern body.

- **Chart cells without a palette entry** `[block]`
  Pattern: the `cells` array references a `paletteKey` not present
  in the `palette` array — the renderer silently drops those cells.
  **Why:** Silent data loss. The reader sees a chart with holes the
  author didn't intend.
  **How to fix:** Validate every `paletteKey` in `cells` against
  the `palette` keys before output. The renderer's smoke-test in
  `/admin/dev/cross-stitch-preview` is one verifier.

- **Palette over twenty colours without explicit symbol overrides**
  `[warn]`
  Pattern: the chart palette has 25 colours but the entries don't
  set `symbol`. The renderer wraps around the fallback set and two
  colours share a glyph.
  **Why:** Symbol collisions break the monochrome / accessibility
  fallback.
  **How to fix:** Set `symbol` explicitly on every palette entry
  past the twentieth. Or simplify the palette — most PD Victorian +
  Edwardian charts run six to twelve colours and the rich palette
  is more often modern designer territory anyway (which we don't
  source from).

## Fabric + cloth count

- **Missing cloth count in supplies + finished-size** `[block]`
  Pattern: the body's supplies card says "Aida cloth" without a
  count, or the finished-size text doesn't name a count.
  **Why:** Finished size depends entirely on count. "Aida cloth"
  could be 11-count (large) through 18-count (small) — the finished
  piece varies by 60% in linear size.
  **How to fix:** Every PATTERN names cloth + count in the supplies
  card ("14-count Aida, 25 × 30 cm cut") and the finished-size text
  ("9 × 13 cm at 14-count").

- **Finished size given as inches only** `[warn]`
  Pattern: "Finished size: 3.5 × 5 inches".
  **Why:** Centimetres are the publication default. Inches in
  brackets when the source pattern is American.
  **How to fix:** "9 × 13 cm (3.5 × 5 in)" — cm primary, inches in
  brackets.

- **Wrong needle size for the cloth count** `[warn]`
  Pattern: a 14-count Aida pattern lists a size-22 needle (which
  suits 11-count) or a size-26 needle (which suits 18-count).
  **Why:** Needle size + cloth count match for clean stitching. A
  too-large needle distorts the holes; a too-small needle slows
  stitching.
  **How to fix:** Default mappings: size 22 for 11-count Aida, size
  24 for 14-count + 16-count + 28-count evenweave / linen, size 26
  for 18-count + 32-count, size 28 for 36 – 40-count. Pattern's
  `requiredToolSlugs` references the size-specific tapestry needle
  slug (`tapestry-needle-24`, `tapestry-needle-26`).

## Stitch + strand convention

- **Cross-stitch tops running mixed directions** `[block]`
  Pattern: the body's worked-example describes top legs running
  north-east in row 1 and north-west in row 3, or doesn't specify
  direction at all.
  **Why:** The cross-stitch convention is that every top leg runs
  the same way across one finished piece (north-east is the
  standard). Mixed-direction tops read as scrappy from any
  distance.
  **How to fix:** State direction explicitly in the working method:
  "Every top leg runs from bottom-right to top-left of the square.
  Hold this through the whole piece — once you set the direction in
  the first stitch, keep it."

- **Strand count missing** `[block]`
  Pattern: PATTERN body doesn't name how many strands of stranded
  cotton to use.
  **Why:** Strand count is what makes the cloth read covered. Two
  strands for 14-count Aida is the default; one strand on 18-count
  +; the wrong count looks too sparse or too lumpy.
  **How to fix:** Every PATTERN states strand count in the working-
  method section. Defaults: two strands on 14-count + 16-count
  Aida, two strands on 28-count evenweave / linen stitched over two,
  one strand on 18-count + 32-count + finer.

- **"Knot the end" as the start instruction** `[block]`
  Pattern: the body tells the reader to knot the end of the thread
  to start. Or the troubleshooter accepts a knot-start as
  acceptable.
  **Why:** Knots on the back of cross-stitch bulk through the
  cloth, show on the front, and unpick over time. The convention
  is loop-start (for even strand counts) or away-knot (for odd
  strand counts).
  **How to fix:** Teach loop-start for even strand counts (fold
  the thread in half, thread the cut ends through the needle, the
  first stitch catches the loop). Teach away-knot for odd strand
  counts (knot the end far from the first stitch; the tail is
  worked into the back later and the knot snipped off). Never
  knot the end where the first stitch lands.

- **"French knot" worked with three+ wraps** `[warn]`
  Pattern: the body describes wrapping the needle three or four
  times for a French knot.
  **Why:** Two wraps is the convention. Three-plus produces a
  Colonial knot or a loose blob that snags.
  **How to fix:** Two wraps unless the chart calls for a bullion
  knot or a Colonial knot explicitly. If a larger knot is wanted,
  use a heavier thread (perle 5 over stranded cotton) rather than
  more wraps.

## Safety + ergonomics

- **No safety preamble** `[warn]`
  Pattern: the body skips the `safetyNote` block — no mention of
  eye fatigue, repetitive strain, needle storage, or sharp
  implements.
  **Why:** Needlework's safety stakes are subtle but real,
  especially around children and pets (loose needles), people with
  eye strain (28-count + linens), and people with hand strain
  (long sessions without breaks).
  **How to fix:** Drop the standard `safetyNote` block (the four-
  point preamble — eye fatigue + light, repetitive strain + breaks,
  needle storage + minder, sharp implements) near the top of every
  body. Reuse the same text across tutorials.

- **Recommending fine count to beginners** `[block]`
  Pattern: a beginner-difficulty tutorial recommends 32-count linen
  or 18-count Aida as the practice cloth.
  **Why:** Eye strain + frustration. The standard learner's cloth
  is 14-count Aida. Fine counts are an ability ramp once the
  fundamentals are solid.
  **How to fix:** Beginner tutorials default to 14-count Aida. Name
  finer counts as a "step up once you're comfortable" line, not as
  the recommended cloth.

## Voice tone — soft

- **"You've got this!" / "Don't worry!" lines** `[warn]`
  Pattern: pep-style encouragement in the body.
  **Why:** The publication's voice trusts the reader. Pep reads as
  AI-marketing or as a beginner blogger's habit.
  **How to fix:** Delete the pep. If the prose is about a stitch
  that's commonly mis-worked, name the failure mode (the actual
  service to the reader) rather than reassuring around it.

- **"Easy" / "quick" / "simple" without qualification** `[warn]`
  Pattern: "this is an easy pattern" or "a quick weekend make" in
  the body.
  **Why:** Difficulty is set by the `difficulty` field. Marketing
  language in prose dilutes the voice.
  **How to fix:** Delete unqualified "easy / quick / simple". If
  the meaning is "good for a first cross-stitch project",
  "beginner-friendly" or "first-project" carries the same meaning
  without the marketing cast.

- **Crafty-cute register** `[warn]`
  Pattern: "stitch happy", "needle love", "happy stitching!", "hugs
  in stitches", or any phrase that reads like an Etsy listing tag.
  **Why:** Off-register. The publication's voice is calm and
  matter-of-fact.
  **How to fix:** Strip the register-clashing phrases. Replace with
  factual lines or delete.

## Cross-craft mixing

- **Tatting described as crocheted lace** `[block]`
  Pattern: a tatting tutorial uses the word "crochet" for what
  tatting does. Or a crochet lace tutorial calls itself tatting.
  **Why:** Different crafts, different tools, different finished
  textures. Tatting builds with double-stitch knots formed by a
  shuttle or needle; crochet builds with a hook pulling loops.
  **How to fix:** Tatting tutorials use the tatting vocabulary
  (rings, chains, picots, joining picots, double stitch, the
  formula `4-3-4-3 clr`). Crochet edgings cited as cross-references
  link to the Crochet category, not folded into the tatting body.

- **Bobbin lace vs needle lace confusion** `[block]`
  Pattern: a tutorial's body conflates bobbin lace and needle lace,
  or shows one in the hero image and teaches the other in the
  prose.
  **Why:** Two distinct techniques. Bobbin lace is worked on a
  pillow with bobbins over a pricked pattern; needle lace is built
  on a couched-thread skeleton with a single needle.
  **How to fix:** Pick the technique per tutorial. The intro names
  it explicitly. Cross-reference the other technique via
  `subTutorialCard` rather than mixing inside one body.
