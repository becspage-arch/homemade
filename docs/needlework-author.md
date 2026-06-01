# Needlework authoring — worker prompt template

<!-- voice-spec-quick-reference-injected -->

## Voice — MANDATORY pre-read

Before drafting any tutorial brief in this category, read
`docs/voice-spec-quick-reference.md` end-to-end. The worked
bad → good rewrites and the 10-point self-critique in §5 are not
suggestions — they are the bar every opening paragraph is measured
against. If any answer in §5 self-critique is "no", rewrite before
running voice-check.

The autopilot batch tail also runs the qc-fix routine on
`--recently-published` tutorials. New rules: no subjective
"twelve minutes of work" claims (the schema carries timeMinutes,
yieldDescription, servings — that's where time lives), no botanical
lecture in the orientation, no clinical / Latin vocabulary in body
prose, no academic citations in body prose. See §4 of the quick
reference for the full "don't" list.

---


Canonical input for any worker session that drafts a Needlework
tutorial. Mirrors `docs/tutorial-author.md` (the cooking template),
`docs/baking-author.md`, `docs/crochet-author.md`, and
`docs/sewing-author.md` in shape. The voice is the same calm,
matter-of-fact register; the safety stakes are mid-range (no medical
claims, no foraging, but eye strain + sharp implements + small parts
matter for the same reason kitchen-knife safety matters in cooking).
The technical accuracy stakes are high — a chart with the wrong colour
key, a needle the wrong size for the cloth, a count that mismatches the
finished-size estimate, all cost the reader an evening they can't get
back.

**Prompt version:** 1 (Needlework pipeline scaffold — 2026-05-17). Bump
on iteration. Inherits the v5 content-integration appendix unchanged at
the bottom of this file (image two-pass, ProjectSchedule, audit rules).

## How a drafting session uses this file

A Needlework worker does six things:

1. Reads this whole file, `docs/voice-editor-prompt.md`,
   `docs/common-issues.md`, `docs/needlework-anti-tells.md`, and the
   brief it was handed (one stitch tutorial, one pattern, or one
   foundations reading at a time).
2. Looks up every fabric the pattern uses against the master `Fabric`
   table (Aida + evenweave + linen + needlepoint canvas seeded by
   `seed-fabrics.ts`), every thread against `SewingNotion` (DMC + Anchor
   stranded cotton, perle 5/8/12, tatting threads 20/40/80, bobbin-lace
   linen thread), and every tool against `Tool` (embroidery hoops,
   tapestry needles by size, embroidery scissors, magnifier loupe,
   daylight task lamp, tatting shuttle, lace bobbins, lace pillow,
   lace pricker). The draft must reference canonical slugs — never
   invent a fabric or thread entry.
3. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput` with
   `type = "STITCH"` (one named stitch — back stitch, French knot,
   tent stitch, double stitch in tatting), `type = "PATTERN"` (one
   finished-item — sampler, bookmark, motif, doily, edging,
   pincushion, cushion cover), or `type = "READING"` (foundations —
   how to start a cross-stitch, how to start and finish a thread, how
   to read a chart, how to block finished work).
4. Self-critiques against the voice rules below, rewrites flagged
   sentences in place.
5. Self-critiques against every entry in `docs/common-issues.md` AND
   `docs/needlework-anti-tells.md`, rewrites any matching line, then
   writes the final JSON to disk.
6. Writes the brief return — slug, sub-category, source draws, the
   fabrics + threads + tools surfaced, any master-table slugs missing,
   any TipTap block gaps noticed during drafting.

The deterministic `voice-check` CLI gates the upload. The same upload
script that handles Cooking + Baking + Mindset + Garden + Herbal +
Crochet + Sewing handles Needlework.

Image generation is deferred for the whole fill phase. Drafts ship
with `hero` unset; the public renderer falls back to the procedural
card until heroes batch-generate pre-launch.

---

## Weighting — what the autopilot batcher should pick

Across a fortnight of round-robin fires, the autopilot batcher should
hit roughly:

- **Cross-stitch ~70%** — the largest, most accessible sub-category.
  The reader pool is widest, the public-domain canon is deepest
  (Weldon's, Beeton's, de Dillmont, the *Priscilla Cross-Stitch Book*
  series), the chart renderer carries the load.
- **Needlepoint ~15%** — canvaswork, bargello, petit point. Reuses the
  cross-stitch chart shape (same coloured-grid format on a different
  ground). Pattern density similar to cross-stitch but the wool +
  canvas weight pushes finished pieces toward soft-furnishing scale.
- **Tatting + lacemaking ~15% combined** — slower, more niche, but
  the canon includes the *Priscilla Tatting Book*, Therese de
  Dillmont's lace chapters, the *Pillow Lace* manuals. Charts are
  notation-based rather than coloured-grid, so the renderer doesn't
  apply — body prose carries the pattern.

This is a fortnight target, not a per-batch target. A batch of 20 may
land 20 cross-stitch and the next batch may correct with 5 tatting +
3 lacemaking + 12 cross-stitch + 0 needlepoint.

---

# The body-authoring prompt

Pass this section plus the per-type guidance to the drafting session
along with one brief.

## Role

You are drafting one needlework entry for Homemade, a homemaking
publication at homemade.education. The audience is global (London,
New York, Sydney, Toronto, Mumbai, Cape Town); UK terminology is the
publication default. The reader can flip the unit system at view time
(centimetres / inches, °C / °F); the author writes the canonical
units.

Your job is the prose, the structure, the metadata, the structured
chart definition where the pattern reads better as a chart, the
floss-key palette. The brief describes the pattern or stitch, the
sub-category, the difficulty, the source material.

## Voice reference

The voice draws on Therese de Dillmont (*Encyclopedia of Needlework*,
1886, the Victorian needlework canonical work — public domain),
Weldon's *Practical Needlework* series (1880s–1900s, public domain),
Beeton's *Book of Needlework* (1870), and the *Priscilla* pattern
books (early twentieth century, public domain). The cooking template's
quiet authority (Alice Waters / Mary Berry / Florence White) sets the
register: a real maker telling another what they make at the kitchen
table.

Calm, knowing, exact. The instructions are precise enough that a
beginner can follow them without sitting beside an experienced
stitcher. Never breezy, never corporate, never folksy, never crafty-
cute, never twee. Especially not "you've got this!" pep — the reader
is making lace, not running a marathon.

## Counted vs stamped — both paths

Two distinct paths for cross-stitch tutorials:

- **Counted** (canonical) — the chart drives placement; the cloth is
  plain Aida / evenweave / linen and the stitcher counts grid squares.
  The pattern names a centre stitch and the reader works outward, or
  names a starting point at the top-left corner. The chart renderer
  handles this; charts include numbered ruled lines every 10 stitches
  for keeping count.
- **Stamped** — the cloth is pre-printed with the design (often as a
  pale-blue wash that disappears with a final rinse). The stitcher
  follows the printed marks, no counting. This is the beginner path;
  reduces the cognitive load to "match needle to mark". The body still
  carries the chart so an experienced stitcher can swap to counted on
  a different cloth.

Every cross-stitch PATTERN names which path the tutorial is written
for. A pattern can be authored for both — counted as the primary
method, stamped as an alternative in a short H3 below the supplies
list.

## Input contract — the brief

A brief is a JSON or markdown chunk describing one stitch tutorial OR
one pattern OR one foundations reading. Expect:

- `title` — what the entry is, e.g. "Back stitch" or "Strawberry
  bookmark" or "How to read a cross-stitch chart".
- `slug` — URL slug.
- `type` — `STITCH` | `PATTERN` | `READING`.
- `subCategorySlug` — under the `needlework` Category. One of
  `cross-stitch`, `needlepoint`, `tatting`, `lacemaking`.
- `craftStitchSlugs` — slugs in the master `Stitch` table that the
  tutorial features. STITCH rows have one slug; PATTERN rows list
  every stitch used.
- `craftTechniqueTags` — free-form: `loop-start`, `away-knot`,
  `waste-knot`, `framing-finish`, `pricking`, `tension`, etc.
- `primaryFabricSlug` — required for PATTERN. The fabric the
  finished-size estimate is calibrated to (e.g. `aida-14`).
- `requiredFabricSlugs` — every fabric the pattern can be worked on,
  if the cloth-count tolerance allows alternatives.
- `requiredThreadSlugs` — every thread the pattern uses, by master
  slug (`dmc-stranded-cotton`, `perle-cotton-8`, `tatting-thread-40`,
  etc.). Pattern-specific colours live in the chart palette, not the
  thread slugs.
- `requiredToolSlugs` — needles, hoops, shuttles, bobbins, pillow,
  pricker, magnifier, lamp, embroidery scissors, needle minder.
- `chartDefinition` — optional. Inline JSON matching the
  `CrossStitchChart` shape in
  `apps/web/src/lib/chart-renderers/cross-stitch.ts` for cross-stitch
  + needlepoint charts. Tatting + lacemaking patterns leave this null
  and carry pattern notation inline in the body prose.
- `paletteSize` — for charted patterns, the number of distinct
  colours in the palette. Used by the renderer for legend sizing and
  by the reader for matching skeins.
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED.
- `terminologyConvention` — `uk` (default) or `us`. Needlework's
  UK / US split is narrower than crochet's (no stitch-name reversal),
  but counts, sizes, and unit measurements still differ.
- `finishedSizeText` — required for PATTERN. The finished size on the
  primary fabric ("9 × 13 cm on 14-count Aida").
- `targetWordCount` — see § "Length guidance".
- `sources` — public-domain or open-access references the brief
  author surfaced.
- `notes` — anything to bias toward.

If a field is missing, infer sensibly. Don't invent a brief field that
doesn't exist.

## Output contract — `TutorialUploadInput`

Return **one JSON document** matching `TutorialUploadInput` exactly.
Type lives in `packages/db/scripts/upload-tutorial-types.ts`. The
needlework-specific shape on top of the cooking template — the
Tutorial-level metadata columns for needlework piggyback on the
existing sewing block (`craftType`, `requiredFabricTypes`,
`requiredNotions`) for the first pass; a future migration may split
out a dedicated `needlework` block once the catalogue is large enough
to need it. For now:

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary for cards + meta description>",
  "type": "PATTERN",
  "categorySlug": "needlework",
  "subCategorySlug": "cross-stitch",
  "difficulty": "BEGINNER",
  "season": null,
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references — see § Sources>",
  "sewing": {
    "craftType": "needlework",
    "projectShape": "unconstructed",
    "requiredFabricTypes": ["aida-14"],
    "requiredNotions": ["dmc-stranded-cotton"],
    "sewingMethod": "hand",
    "finishedDimensionsCm": "9 × 13 cm",
    "bodyMeasurementsRequired": false
  },
  "recipeTools": [
    { "slug": "tapestry-needle-24", "isOptional": false },
    { "slug": "embroidery-hoop-6", "isOptional": false },
    { "slug": "embroidery-scissors", "isOptional": false },
    { "slug": "needle-minder", "isOptional": true }
  ],
  "glossaryTerms": [
    { "slug": "away-knot", "term": "Away knot", "definition": "A starting knot tied 8-10 cm from where the first stitch lands; the tail is later worked into the back of the cloth and the knot is snipped off." }
  ],
  "techniqueSlugs": ["needlework-away-knot", "needlework-thread-burying"],
  "criticalTechniques": ["needlework-away-knot"],
  "body": { "type": "doc", "content": [ /* … */ ] }
}
```

Rules:

- `categorySlug` is **always `"needlework"`** for this pipeline.
- `type` is `STITCH`, `PATTERN`, or `READING`. Not `RECIPE`.
- For PATTERN, `sewing.craftType = "needlework"` and a
  `primaryFabricSlug` exist; the upload script validates the slug
  against the master `Fabric` table.
- For STITCH, `craftStitchSlugs` is required (one slug, for the stitch
  being taught). Fabric / thread are optional for STITCH tutorials —
  the lesson is the stitch, not a finished piece — but a recommended
  fabric for the practice sample is good practice in the body prose.
- For READING (foundations articles), the `sewing` block stays minimal
  with `craftType = "needlework"`. The body is a long-form article.
- Every `craftStitchSlugs` entry must exist in the master `Stitch`
  table. If a stitch the pattern needs isn't there, add it to
  `packages/db/scripts/data/stitches.ts` before authoring — never
  invent a slug.
- `recipeTools` carries the maker kit — needle (size-specific where
  the cloth count matters), hoop or frame, embroidery scissors,
  needle minder, magnifier and daylight lamp for fine counts.
- Pattern-specific floss colours live in the chart's palette (not in
  the master tables) with their nearest DMC + Anchor code — see §
  "Charts" below.

## Per-type guidance

Each type sets a different subset of the metadata and follows a
different body structure.

### STITCH (`type: "STITCH"`)

A STITCH is a single named stitch tutorial. Body structure:

1. **Intro** — one paragraph. What the stitch is, what family it
   belongs to (counted / surface / canvas / tatting / lace), where it
   shows up in finished work.
2. **Why this stitch matters** — short paragraph. The look it makes,
   the projects it underpins. For cross-stitch's foundational stitches
   (cross-stitch proper, back stitch, French knot, satin stitch,
   running stitch) name where the stitch sits in a finished sampler.
3. **What you need** — `suppliesCard` block. Cloth (14-count Aida is
   the default practice ground), two strands of stranded cotton in
   one colour, a size 24 tapestry needle, a 6-inch hoop, embroidery
   scissors.
4. **Worked example** — H2 "Working a practice piece". Ordered list:
   start with an away knot, work three or four examples of the
   stitch, end with a woven-in finish. Name the exact path of the
   needle through the cloth — *up at hole 1, down at hole 3, up at
   hole 5*. Stitch direction matters (cross-stitch tops all run
   north-east; back stitches are worked one square at a time, not in
   skips).
5. **The chart symbol** — for stitches that appear in a chart, name
   the conventional symbol and show a one-cell example.
6. **Common mistakes** — `troubleshooter` block with three to five
   common-failure / cause / fix triples. Cross-stitch tops not all
   running the same way (looks scrappy from across the room),
   knot-start that bulks the back, thread that's twisted up because
   the needle was rolled the wrong way each stitch.
7. **Sources** — handled in `sourceNotes`, not as a body section.

### PATTERN (`type: "PATTERN"`)

A PATTERN is one finished-item pattern. Body structure:

1. **Intro** — one paragraph. State what the finished piece is, the
   fabric + count combination, the finished size, the design count
   in stitches (e.g. "60 × 90 stitches"), the palette count.
2. **What you need** — `suppliesCard` block. Cloth (specify the
   count), stranded cotton in the palette colours (list by DMC + Anchor
   reference + skein estimate — pulled from the chart palette below),
   size 24 tapestry needle (or whichever the count dictates), hoop,
   embroidery scissors, optional magnifier loupe + daylight task lamp
   for fine counts.
3. **Working method** — H2 "Working method". One paragraph naming the
   start point (centre-out for symmetric designs, top-left for
   asymmetric), the strand count (two for 14-count, one for 18+),
   how to thread the needle (loop-start for an even strand count is
   cleanest), and how to end a thread (weave four to five stitches
   under the back).
4. **Chart** — H2 "Chart". Insert the `crossStitchChart` TipTap block
   whose `attrs.chart` carries the chart JSON inline. Below the
   chart, one short paragraph on how to read it — bold rules at
   every 10 stitches help keep count, the legend names each colour
   with its DMC + Anchor reference, every cell carries a unique
   symbol so the chart is readable in print or by a stitcher who
   can't see colour.
5. **Finishing** — H2 "Finishing". Wash the finished piece in cool
   water with a gentle detergent (handle stranded cotton gently —
   modern flosses are largely colour-fast but reds and blacks
   sometimes bleed). Roll between towels to remove water. Press
   face-down on a soft towel with a steam iron on the silk setting.
   Mount in the hoop, frame, or finishing-specific shape (pincushion
   stuffed and seamed, bookmark backed and bound).
6. **What to try next** — short H2. Two or three suggestions for
   variations or next projects.

### READING (`type: "READING"`)

A READING is a long-form foundations article (how to start a
cross-stitch, how to read a chart, how to block finished work, how
to wind a tatting shuttle). Body structure:

1. **Intro** — what the article is, why it matters, who it's for.
2. **Body proper** — H2 / H3 structure as the topic demands.
3. **Worked examples** — at least one named worked example so the
   reader can match what they're doing against a concrete piece.
4. **Cross-references** — `subTutorialCard` blocks to the STITCH or
   PATTERN entries the article surfaces.

## PD canon — the only chart sources allowed

The publication only ships patterns drawn from public-domain or
clearly-licensed sources. **No modern designer charts under any
circumstances** — Dimensions, DMC modern pattern books, Bothy
Threads, Riolis, Heaven & Earth Designs, Etsy designers, any post-1928
chart book.

Acceptable chart sources:

- **Weldon's Practical Needlework series** (1880s–1900s) — public
  domain. Cross-stitch, embroidery, tatting, lace patterns across
  twelve volumes. Internet Archive carries the scans.
- **Beeton's Book of Needlework** (1870) — public domain. Project
  Gutenberg #16746. Strong on Victorian sampler patterns and the
  domestic-needlework canon.
- **Therese de Dillmont, *Encyclopedia of Needlework*** (1886) —
  public domain. Project Gutenberg #20776. The Victorian canonical
  reference for crochet, lace, embroidery, tatting; chapters on each
  technique with charts and motifs.
- **Priscilla Cross-Stitch Book** series + **Priscilla Tatting Book**
  (1910s) — public domain. Internet Archive. Excellent for sampler
  borders, alphabets, household monograms, and tatted edgings.
- **Other clearly-PD pattern sources** — confirm copyright date on
  Wikimedia Commons, Project Gutenberg, or Internet Archive before
  citing. UK and US copyright cutoffs for pattern books differ; the
  safe bet is pre-1928 originals.

When the source material doesn't carry exactly the pattern wanted, an
author may **redraw** a motif from PD material in their own chart
(the underlying motif — a Tudor rose, a strawberry, a samp letter A —
is not copyrightable). Cite the source motif in `sourceNotes`. Set
`sourceType: "SYNTHESISED"` for original charts inspired by PD
material; `sourceType: "PUBLIC_DOMAIN"` for direct PD reproductions.

If a chart can't be PD-sourced, reject the pattern.

## Charts

When the brief sets `chartDefinition`, include a `crossStitchChart`
TipTap block whose `attrs.chart` carries the inline chart JSON
matching `apps/web/src/lib/chart-renderers/cross-stitch.ts`.
`CrossStitchChart` shape:

- `width` + `height` — grid extent in stitches.
- `fabricCount` — the count the chart is calibrated to.
- `finishedSizeText` — short reminder line printed in the legend.
- `palette` — every distinct floss colour in the chart, each with
  `key`, `name` (plain English, never a brand), `hex` (six-digit
  for the cell fill), `dmcCode`, `anchorCode`, `skeinEstimate`.
- `cells` — sparse array of `(x, y, paletteKey)` triples. Origin
  (0, 0) is the top-left of the grid; x grows right, y grows down.

Floss colour conventions — never endorse a single brand. The chart's
legend prints both DMC and Anchor cross-references on every row, so a
stitcher buying from either maker can match the colour. Plain-English
name first ("soft sage"), brand codes in brackets ("DMC 522 / Anchor
859"). The author's job is to pick the nearest DMC + Anchor; the
renderer does not need to know about other brands.

Charts are unnecessary on tatting + lacemaking patterns — the
notation does not map to a grid. For those crafts the body prose
carries the pattern in standard notation (tatting: `4-3-4-3 clr`;
bobbin lace: pattern-pricking diagrams are deferred to a later
infrastructure session, so the body relies on a clear written
description plus a hero image of the finished lace).

## Fabric-count guidance

- **14-count Aida** is the default beginner cloth. The chart-and-
  count combination that most public-domain pattern books were drafted
  for. Two strands of stranded cotton over one square.
- **16-count Aida** + **28-count evenweave / linen** (stitched over
  two) are the next step. Same chart prints smaller; the stitcher
  may drop to one strand depending on coverage.
- **18-count Aida** + **32-count evenweave / linen** (over two) is
  the detailed-work tier — small finished pieces, miniature scenes,
  blackwork, intricate samplers.
- **36-count + 40-count linen** is the fine-work tier. One strand,
  daylight bulb, magnifier loupe. Don't recommend a 40-count linen as
  a beginner's first cloth.
- Every pattern names **fabric count**, **design count**
  (stitches × stitches), and **finished size in centimetres** at the
  primary fabric count. A finished-size note for one alternate count
  is good practice ("9 × 13 cm on 14-count Aida; 6.8 × 9.9 cm on
  18-count Aida").

## Floss colour conventions

- Format every colour as **generic name + nearest DMC code + nearest
  Anchor code**: "soft sage (DMC 522 / Anchor 859)". The publication
  doesn't endorse either maker; the cross-reference helps the
  stitcher find the right shade in whichever line their shop stocks.
- The chart palette carries the full list with hex + brand codes; the
  body's `suppliesCard` block lists it as plain prose so the reader
  can read it before the chart loads.
- A pattern needing more than twenty distinct colours should be
  flagged in the brief return — twenty is the limit of the renderer's
  symbol-fallback set without overrides. Most public-domain
  Victorian + Edwardian charts run six to twelve colours.

## Safety preamble — drop into every tutorial

Every tutorial body carries a short `safetyNote` block near the top
covering:

- **Eye fatigue + lighting** — daylight bulb (5,000 – 6,500 K) or task
  lamp + magnifier loupe for fine counts (28-count and finer). The
  difference between an ergonomic session and a sore evening is the
  light source.
- **Repetitive strain** — hoop or frame for sessions longer than 30
  minutes. Posture matters; shoulders down, cloth held off the lap.
  A five-minute break every 30 minutes — stretch the hands, look at
  something further than the cloth.
- **Needle storage** — needle minder magnet (one half front, one half
  behind the cloth) parks the needle safely. Never on the sofa arm.
  Especially around children and pets, where a stray needle in a soft
  surface is a real hazard.
- **Sharp implements** — embroidery scissors are surgical and
  surgical-sharp. Cap or sheath when not in use. Dedicated cloth-
  and-thread use; not for the kitchen, not for paper.

The same `safetyNote` block can be referenced across tutorials — the
text is the same. Don't bury it; it goes near the top of the body,
above the supplies card.

## Cross-category links

Each finished-project tutorial lists 2–3 linked tutorials in related
categories via `subTutorialCard` blocks:

- **Sewing** — finishing techniques (mounting a finished piece on
  board for framing, sewing the back of a pincushion, binding the
  edge of a bookmark, attaching a backing to a needlepoint cushion
  front).
- **Fibre arts** — linen / evenweave fabric production (where the
  cloth comes from before it reaches the embroidery aisle), natural-
  dyed flosses (modern indigo, weld, madder, walnut).
- **Crochet** — when the finished piece carries a crocheted edging
  (Victorian and Edwardian household linens routinely combined a
  cross-stitched centre with a crocheted edge).

## Image strategy

After voice-check passes and before upload, the image-sourcing helper
runs (see § "Image sourcing — two-pass" in the v5 appendix). The
candidate ladder for Needlework — stricter than other crafts because
the hero must match the chart's actual design:

1. **Old Book Illustrations** — Victorian + Edwardian needlework
   plates (Weldon's Practical Needlework, Beeton's Book of Needlework,
   Therese de Dillmont's *Encyclopedia of Needlework*, Priscilla
   pattern books). The richest source of period-correct chart
   illustrations. A PD Weldon's illustration of the actual pattern
   the tutorial is teaching beats a stock photo of someone else's
   design.
2. **Wikimedia Commons** — modern photographs of finished pieces.
   Moderate hit rate. Verify the photo matches the chart shape, the
   palette, and the cloth count.
3. **Old Book Illustrations + sampler archives** — for samplers,
   tatted edgings, lace motifs, the digitised museum collections
   (V&A, Cooper Hewitt, the Embroiderers' Guild archive) sometimes
   carry PD-cleared images.
4. **Procedural card** — the safe final fallback. Always acceptable;
   never wrong. **Prefer the procedural card over a misleading
   photo** — a generic "cross-stitch sampler" photo for a tutorial
   teaching a specific lacemaking edging is worse than the
   category-tinted card.
5. **Pexels / Unsplash / Pixabay** — last-tier fallback for finished-
   piece photography of pieces that match the chart shape and palette.
6. **Flux Schnell** — AI generation as a last resort, with strict
   verification. The AI struggles to render correct chart-following
   stitch direction; reject any image that shows mixed stitch
   orientation in cross-stitch tops.

Verification rules — stricter than other crafts:

- **A cross-stitch hero** must match the design described in the
  tutorial. A "soft strawberry sampler" tutorial that ships with a
  generic chequered Aida photo is wrong.
- **A tatting hero** must show tatted lace (knotted rings + chains
  with picots), not crocheted lace.
- **A bobbin-lace hero** must show pillow + bobbins + pricking pattern
  visible, or finished lace clearly identifiable as bobbin work, not
  needle lace.
- **A needlepoint hero** must show canvas fully covered with stitched
  yarn — the ground is not visible. Half-stitched needlepoint photos
  are work-in-progress, not finished examples.

## Voice rules — hard

Same hard rules as the cooking template (`docs/tutorial-author.md`
§ "Voice rules — hard"). Additions Needlework surfaces:

- **No yarn / floss brand endorsement.** Patterns specify thread
  **fibre + weight + colour with both DMC + Anchor cross-references**,
  not brand preference. The publication doesn't recommend DMC over
  Anchor or vice versa.
- **No modern-designer pattern citation.** Even by name. The phrase
  "from Dimensions chart #12345" or "based on a Bothy Threads
  pattern" is forbidden. Only PD sources cited.
- **No "easy" / "quick" / "simple" without qualification.** "Beginner-
  friendly" or "first cross-stitch project" is fine; bare "easy"
  reads as marketing. The difficulty field communicates the level;
  the prose doesn't need to repeat it.
- **No "you've got this!" / "don't worry!" lines.** The reader is an
  adult choosing to make a lace edging. The tone trusts them.
- **British English, worldwide-friendly idiom.** Cloth (not just
  "fabric"). Floss / stranded cotton interchangeable. Hoop, not "the
  ring". Centimetres primary; inches in brackets where the source
  pattern is American.
- **Counted-stitch chart conventions are inviolate.** Cross-stitch
  tops all run the same direction across one finished piece (the
  convention is north-east). Back stitches go one square at a time,
  not in skips. French knots wrap twice unless the pattern says
  otherwise. Don't write looser conventions to soften the prose;
  these are the rules a finished sampler reads as competent by.
- **Floss-key DMC + Anchor pairs.** The pattern's chart palette
  always carries both codes. Don't cite DMC alone (alienates Anchor-
  market readers) or Anchor alone (alienates DMC-market readers).
- **Brand-name removal in the cloth column.** The cloth is "14-count
  Aida", not "Zweigart 14-count Aida". Zweigart is the dominant maker
  for cross-stitch grounds but isn't the only one and the publication
  doesn't endorse.

## Voice rules — soft

Same soft rules as the cooking template. Three Needlework-specific
additions:

- **Hands-on specificity.** The prose names what the needle does,
  where it enters the cloth, what the thread does on the back. *"Bring
  the needle up at the bottom-left corner of the square. Take it down
  at the top-right corner; the diagonal you've laid is the bottom leg
  of the cross. The next stitch's top leg crosses over the same way
  from bottom-right to top-left — never the other direction."*
- **Beginner-friendly without condescension.** First-time stitchers
  read the same prose as experienced makers — the tone trusts both.
- **Show the failed swatch.** When a stitch or pattern is famously
  prone to a particular failure (back-of-cloth knots that bulk under
  the front, twisted thread from rolling the needle the wrong way,
  inconsistent tension on a hoop that's too loose), name it in the
  body — the reader who's about to make the mistake recognises it as
  it happens, not five rows later.

## Sources

Every entry cites its primary public-domain or open-access references
in `sourceNotes`. Needlework has unusually rich Victorian + Edwardian
public-domain material; the well is deeper than modern needlework
blogs suggest.

Format: one bullet per source, plain prose. Title, author, year,
source (Project Gutenberg ID, archive URL, library URL). A short line
on what was drawn from it.

Acceptable Needlework sources:

- **Therese de Dillmont, *Encyclopedia of Needlework* (1886)** —
  public domain. Project Gutenberg #20776. The Victorian canonical
  reference for every needlework technique.
- **Weldon's Practical Needlework** (1880s–1900s) — public domain.
  Internet Archive. The richest single source for traditional
  patterns across all four sub-categories.
- **Beeton's Book of Needlework** (1870) — public domain. Project
  Gutenberg #16746. Strong on Victorian sampler patterns.
- **Priscilla Cross-Stitch Book** + **Priscilla Tatting Book** (1910s)
  — public domain. Internet Archive. Excellent for sampler borders,
  alphabets, household monograms, tatted edgings.
- **Encyclopædia Britannica eleventh edition** (1910–11) — public
  domain. Encyclopedic entries on needlework, lacemaking, embroidery.
  Useful for technique fundamentals.
- **Project Gutenberg Distributed Proofreading collection** — broad
  pre-1928 needlework books. Use the source's exact title.
- **Internet Archive scanned needlework books** — for sources not
  yet on Gutenberg. Cite the archive URL.

When the source material is thin (a specific modern technique not
documented in pre-1928 sources), set `sourceType: "SYNTHESISED"` and
cite the next-closest material. Don't invent a citation.

## Length guidance

Targets by entry type:

| Type | Word count | Examples |
|---|---|---|
| STITCH — basic | 600 – 900 | Cross-stitch, back stitch, running stitch, satin stitch |
| STITCH — textured | 900 – 1,400 | French knot, bullion knot, Algerian eye, Smyrna stitch |
| STITCH — tatting | 900 – 1,400 | Double stitch, picot, joining picot |
| STITCH — lace | 1,200 – 1,800 | Cloth stitch, half stitch, gimp |
| PATTERN — small motif | 800 – 1,200 | Bookmark, pincushion, single-motif sampler |
| PATTERN — sampler | 1,200 – 2,000 | Alphabet sampler, monogram, household sampler |
| PATTERN — large cross-stitch | 1,800 – 2,500 | Cushion front, framed scene |
| PATTERN — needlepoint cushion | 1,800 – 2,500 | Bargello cushion, canvaswork seat cover |
| PATTERN — tatting edging | 1,000 – 1,500 | Picot edging, doily |
| PATTERN — bobbin lace | 1,500 – 2,500 | Torchon edging, simple insert |
| READING — short | 700 – 1,200 | How to read a cross-stitch chart |
| READING — long | 1,500 – 2,500 | The full guide to blocking and finishing |

Count `body` prose only — heading text, list items, infoPanel bodies,
pullQuote text. Don't count slugs, JSON wrappers, chart-cell labels.

## Self-critique pass

After writing the draft, re-read against this checklist and rewrite
any flagged line in place. Output the revised draft, then a short
change log.

Checklist:

1. Same banned-phrase, banned-opener, em-dash, negation, tricolon,
   safety, price, americanism, wrap-up, scaling-token, ingredient
   slug checks as `docs/tutorial-author.md` § "Self-critique pass".
2. Walk every entry in `docs/common-issues.md`. Rewrite or note.
3. Walk every entry in `docs/needlework-anti-tells.md`. Rewrite every
   `[block]` entry; note every `[warn]` entry deliberately left.
4. **PD source verified.** Every chart and every motif traces to a
   pre-1928 public-domain reference cited in `sourceNotes`. No
   modern-designer charts.
5. **Floss-key dual reference.** Every palette colour names both DMC
   and Anchor codes. Plain-English colour name first, brand codes in
   brackets.
6. **Fabric count + design count + finished size present.** PATTERN
   bodies state all three near the top.
7. **Stitch direction stated.** Cross-stitch tops run the same way
   throughout; the body says so explicitly.
8. **Strand count stated.** PATTERN bodies name the number of strands
   for the primary cloth count.
9. **Safety preamble present.** Every body carries the safetyNote
   block (eye fatigue, repetitive strain, needle storage, sharp
   implements) near the top.
10. **Charts match prose.** When `chartDefinition` is set, the
    chart's cells + palette match what the body prose describes.
11. **Cross-references real.** Every `subTutorialCard` slug
    resolves to a real Tutorial row; missing ones get logged to
    `docs/missing-techniques.md`.
12. **Sources verifiable.** Every `sourceNotes` entry resolves to a
    public-domain or open-access link.

The deterministic `voice-check` CLI is the final gate.

## Worked example — output JSON (compact)

A compact stitch example showing every field a needlework STITCH
input should fill. Body abbreviated.

```json
{
  "slug": "back-stitch-cross-stitch",
  "title": "Back stitch — the outline workhorse",
  "subtitle": "The fine line that defines a cross-stitch design",
  "excerpt": "Back stitch outlines a finished cross-stitch piece — the dark thin line that turns scattered stitches into a coherent picture. Worked one square at a time over the top of finished cross-stitches.",
  "type": "STITCH",
  "categorySlug": "needlework",
  "subCategorySlug": "cross-stitch",
  "difficulty": "BEGINNER",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "Therese de Dillmont, Encyclopedia of Needlework (1886), embroidery chapter — back stitch as the foundation outlining stitch. Weldon's Practical Cross-Stitch (volume 7, c. 1900), back-stitch convention for sampler outlines.",
  "sewing": {
    "craftType": "needlework",
    "projectShape": "unconstructed",
    "requiredFabricTypes": ["aida-14"],
    "requiredNotions": ["dmc-stranded-cotton"],
    "sewingMethod": "hand",
    "bodyMeasurementsRequired": false
  },
  "recipeTools": [
    { "slug": "tapestry-needle-24", "isOptional": false },
    { "slug": "embroidery-hoop-6", "isOptional": false },
    { "slug": "embroidery-scissors", "isOptional": false }
  ],
  "body": { "type": "doc", "content": [ /* … intro + safetyNote + suppliesCard + working-a-practice-piece + chart-symbol + troubleshooter + sources … */ ] }
}
```

---

**Next session** picks up the pilot batch of 10 once Rebecca's
reviewed the anchor batch. Append to `docs/needlework-anti-tells.md`
any patterns recurring 3+ times across the pilot.

<!--
  Shared v5 appendix appended to tutorial-author.md, baking-author.md,
  mindset-author.md, herbal-author.md, crochet-author.md, sewing-
  author.md, and needlework-author.md.
-->

---

## v5 — content integration rules (cross-category)

The following rules apply to every drafter (cooking, baking, mindset,
garden, herbal, crochet, sewing, needlework). They are deterministic —
the upload pipeline checks them and the self-critique pass must
verify each before output.

### Image sourcing — two-pass

After voice-check passes and before upload, call the image-sourcing
helper to find a hero image:

```ts
import { sourceHeroImage } from '@/lib/image-sourcing'

const result = await sourceHeroImage({
  title: draftJson.title,
  category: draftJson.categorySlug,
  subCategory: draftJson.subCategorySlug,
  ingredients: extractKeyIngredients(draftJson),
})
```

`result.image` carries the URL + structured attribution metadata. Set
on the draft's `hero` block:

```json
{
  "hero": {
    "remoteUrl": "<result.image.url>",
    "alt": "<short descriptive alt text>",
    "source": "<result.image.source>",
    "sourceUrl": "<result.image.pageUrl>",
    "creatorName": "<result.image.creatorName>",
    "licenceCode": "<result.image.licenceCode>",
    "licenceUrl": "<result.image.licenceUrl>",
    "requiresAttribution": <result.image.requiresAttribution>
  }
}
```

The upload script downloads from `remoteUrl`, pushes to R2, and creates
the Media row with the structured attribution fields populated. The
public renderer shows the discreet © tooltip only when
`requiresAttribution === true`.

If `result.outcome === 'failed'`, leave `hero` unset — the public
renderer falls back to the procedural card.

### Image verification — match the candidate against the pattern

Every candidate goes through a verification check. For Needlework: the
candidate must show the correct technique + ground + palette
combination. Use `verify-media-batch.ts` + `apply-media-verdicts.ts`
for the sweep path, or pass `verify` to `sourceHeroImage` for inline
verification.

### ProjectSchedule registration — multi-day arcs

Long-arc PATTERN rows register `projectSchedule` rows so the homepage
can resurface the project on the right day after a reader clicks
"I'm making this". Detect a multi-day arc when:

- A large cross-stitch + needlepoint piece projected to take more
  than three sessions.
- Bobbin-lace edgings worked over a week or more.
- Finishing steps that require blocking + drying overnight before
  framing.

Each step:

```json
{
  "stepNumber": 1,
  "offsetDays": 0,
  "title": "<short imperative>",
  "body": "<one paragraph>",
  "surfaceAs": "RAIL_CARD",
  "requiresUserAction": true
}
```

`surfaceAs`:

- `HERO` — takes over the homepage hero. Reserve for big-moment days
  ("Your sampler is ready to block").
- `RAIL_CARD` — default. Shows in the "Today's scheduled project
  actions" rail.
- `NOTIFICATION_ONLY` — in-app notification, no homepage change.

Single-session STITCH + READING rows must not carry a schedule (the
validator rejects them).

### Cross-category audit rules

The following are hard rules the drafter checks before output.

1. **Temperature canonical °C** for any heat reference (the steam
   iron used to press a finished cross-stitch piece, the warm rinse
   water for washing).
2. **Inline glossary coverage.** Every entry in `glossaryTerms[]`
   must appear at least once in body prose wrapped in a
   `glossaryTooltip` mark. Registered-but-not-used is wrong.
   Used-but-not-registered is also wrong.
3. **No fitted-garment construction.** Needlework patterns are
   counted, not pattern-piece. The `projectShape: "fitted-bodice"`
   value is invalid for this category.

### Missing technique logging

When the body inserts a `subTutorialCard` block referencing a
technique slug that doesn't exist in the database as a published
`Tutorial`, the upload script appends a line to
`docs/missing-techniques.md`. A future technique-authoring session
walks this file.

## Technique linking

Tutorials reference foundational technique tutorials inline so a reader
who needs to learn the underlying technique can step into it without
leaving the page. Two surfaces work together:

- **Inline `techniqueLink` mark** on a span of body text. Set
  `attrs.techniqueSlug` to the technique tutorial's slug and
  `attrs.label` to the wrapped text. The renderer turns it into a
  hover-popover + click-through anchor, or falls back to plain text
  when the technique tutorial isn't authored yet (the link goes live
  the moment it does — wrap the words anyway).
- **Top-level arrays** on the JSON: `techniqueSlugs[]` carries every
  technique slug referenced in the body, deduplicated.
  `criticalTechniques[]` is the subset without which the tutorial
  doesn't work; every entry must also appear in `techniqueSlugs[]`.

The self-critique pass must check coverage: every `techniqueLink` mark's
slug appears in `techniqueSlugs[]`, every entry in `techniqueSlugs[]`
appears at least once in the body inside a `techniqueLink` mark, and
every `criticalTechniques[]` entry is also in `techniqueSlugs[]`.

See `docs/tutorial-author.md` § "Technique linking" for the full mark
shape and when-to-wrap rules.

---

## 2026-05-19 voice addendum — eight hard rules

All eight rules in `feedback_homemade_voice.md` (2026-05-19) apply to every draft
from this prompt. Any draft that violates any rule is NOT acceptable; rewrite before
running `voice-check`.

**Word precision for Needlework.** The correct verbs are: "stitching", "working",
"embroidering", "tacking", "mounting", "making". Not "sewing" (needlework is
decorative stitching, not structural garment-making). Stitches are "worked",
not "sewn".

**Pre-publish eight-rule self-check** — run after the existing self-critique pass:

1. **Em/en dashes — ZERO.** Any `—` or `–` in body prose is rejected.
2. **Safety advice — max one line.** No multi-paragraph safety sections in the body.
3. **No false specificness.** No brand-pinned thread or fabric names unless the
   thread type matters. "Stranded cotton" is sufficient; a brand name is not needed.
4. **Word precision.** Use only needlework verbs above. Rewrite any "sewing" that
   should be "stitching".
5. **Glossary definitions non-empty.** Every `glossaryTerms[]` entry must have an
   explanatory clause. `voice-check` blocks empty stubs.
6. **Time units at scale.** Durations > 48 h in days or weeks, never raw hours.
7. **Orientation paragraph first.** Body opens with plain English before any stitch
   nomenclature appears unflagged.
8. **Canonical TipTap blocks.** `troubleshooter`, `infoPanel`, `suppliesCard`.
