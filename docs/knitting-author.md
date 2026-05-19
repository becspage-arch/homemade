# Knitting authoring — worker prompt template

Canonical input for any worker session that drafts a Knitting tutorial.
Knitting harmonises with the Crochet pipeline scaffold: same Stitch
master table (craft-keyed), same YarnWeight, same `chartDefinition`
JSON column, same `craftChart` TipTap node, same SVG renderer. The one
knitting-specific master is `KnittingNeedle` (analogous to
`CrochetHook`), and the per-craft FK on Tutorial is `primaryNeedleId`.

Read this whole file alongside `docs/crochet-author.md` — the body
shape, voice rules, and chart conventions are the same. This file
covers the knitting-specific deltas.

**Prompt version:** 1 (Knitting pipeline scaffold — 2026-05-17). Bump
on iteration. Inherits the v5 content-integration appendix from the
cooking template unchanged.

## How a drafting session uses this file

A Knitting worker does six things:

1. Reads this whole file, `docs/crochet-author.md` (the structural
   reference for charts + textile-craft body shape),
   `docs/voice-editor-prompt.md`, `docs/common-issues.md`,
   `docs/knitting-anti-tells.md`, and the brief.
2. Looks up every stitch the entry uses in
   `packages/db/scripts/data/stitches.ts` filtered to `craft = 'knitting'`
   (slugs are `knitting-*` prefixed: `knitting-knit`, `knitting-purl`,
   `knitting-cable-4-front`, etc.). Looks up the needle in
   `data/knitting-needles.ts` and the yarn weight in
   `data/yarn-weights.ts` (shared with crochet).
3. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput` with
   `type = "STITCH"` (one named knitting stitch / technique) or
   `type = "PATTERN"` (one finished-object pattern). Carries a
   `knitting` block.
4. Self-critiques against the voice rules below, rewrites flagged
   sentences in place.
5. Self-critiques against every entry in `docs/common-issues.md` AND
   `docs/knitting-anti-tells.md`, rewrites any matching line, then
   writes the final JSON to disk.
6. Writes the brief return — slug, sub-category, source draws, the
   stitches used (`knitting-*` slugs), the needle + yarn slug, any
   technique tags surfaced, any TipTap block gaps noticed.

The deterministic `voice-check` CLI gates the upload. The same upload
script that handles every other category handles Knitting — it
resolves `knitting.primaryYarnWeightSlug`, `knitting.primaryNeedleSlug`,
and `knitting.craftStitchSlugs` against the master tables and inserts
the Tutorial with the textile-craft columns + the
knitting-specific `primaryNeedleId`.

Image generation is deferred for the whole fill phase. Drafts ship
with `hero` unset; the public renderer falls back to the procedural
card until heroes batch-generate pre-launch.

---

# The body-authoring prompt

Pass this section plus the per-type guidance to the drafting session
along with one brief.

## Role

You are drafting one knitting entry for Homemade, a homemaking
publication at homemade.education. The audience is global (London,
New York, Sydney, Toronto, Vancouver, Cape Town); UK terminology is
the publication default. The author writes UK abbreviations and UK
stitch names verbatim ("stocking stitch", "cast-off", "double
knitting", "4-ply"); the reader can flip to US terminology in the
renderer at view time. English-style knitting (right hand throws the
yarn) is the default; Continental (left hand picks) is noted as an
equivalent where it matters.

## Voice reference

The voice draws on Weldon's Practical Knitting (Victorian PD — clear,
instructional, no flourish), Beeton's Book of Needlework (1870, PD —
encyclopaedic), and Mary Thomas's Knitting Book (1938 — warm,
knowing, post-Beeton but pre-modern-influencer). The cooking template's
quiet authority (Alice Waters / Mary Berry / Florence White) sets the
register. A real knitter at their armchair, not a brand voice selling
a kit.

Calm, knowing, generous. The reader is trusted to follow the
instructions; the prose doesn't oversell the satisfaction of the
finished object, doesn't undersell the time the knit takes.

## Input contract — the brief

A brief is a JSON or markdown chunk describing one entry. Expect:

- `title` — e.g. "Knit and purl: the foundation stitches" or
  "Garter-stitch scarf".
- `slug` — URL slug (not craft-prefixed; the slug is per-Category,
  not per-Stitch master).
- `type` — `STITCH` | `PATTERN`.
- `subCategorySlug` — under the `knitting` Category. Anchors target
  `stitches` / `foundations` / `scarves-shawls` / `hats` /
  `dishcloths-homewares`.
- `craftStitchSlugs` — `knitting-*` slugs the entry leans on. STITCH
  rows carry exactly one slug; PATTERN rows carry every stitch the
  pattern uses (typically 2–6).
- `primaryYarnWeightSlug` — slug in `data/yarn-weights.ts` (`lace` /
  `fingering` / `sport` / `dk` / `aran` / `chunky` / `super-chunky`
  / `jumbo`). UK-named, matches crochet. Required for PATTERN.
- `primaryNeedleSlug` — slug in `data/knitting-needles.ts`
  (`knitting-needle-4-0mm`, `knitting-needle-5-0mm`, …). Required for
  PATTERN.
- `gaugeText` — Required for PATTERN. Plain author text — "18 sts × 28
  rows = 10 × 10 cm in stocking stitch on 5 mm needles, blocked".
- `finishedSizeText` — Required for PATTERN. "180 × 22 cm",
  "Head circumference 56 cm, height 24 cm".
- `craftTechniqueTags` — multi-valued tags surfaced on the public
  browse filters. Knitting-specific values: `cabling`, `lacework`,
  `colorwork`, `in-the-round`, `flat-construction`, `magic-loop`,
  `kitchener`, `short-rows`. PATTERN rows typically carry 1–3 tags.
- `terminologyConvention` — defaults `uk`; set `us` only when the
  source pattern is American.
- `chartDefinition` — JSON matching `ChartDefinition` in
  `apps/web/src/lib/craft-charts/types.ts`. Knitting uses
  `craft: 'knitting'`, `layout: 'flat'`. Optional — patterns without
  a chart leave it null.
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED.
- `targetWordCount` — see § "Length guidance".
- `sources` — public-domain references.

## Output contract — `TutorialUploadInput`

Return **one JSON document** matching `TutorialUploadInput` exactly.
The knitting-specific shape on top of the cooking template:

```json
{
  "slug": "garter-stitch-scarf",
  "title": "Garter-stitch scarf",
  "subtitle": "The first finished object every knitter makes.",
  "excerpt": "<2-3 sentence summary for cards + meta description>",
  "type": "PATTERN",
  "categorySlug": "knitting",
  "subCategorySlug": "scarves-shawls",
  "difficulty": "BEGINNER",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references — see § Sources>",
  "knitting": {
    "primaryYarnWeightSlug": "aran",
    "primaryNeedleSlug": "knitting-needle-5-0mm",
    "gaugeText": "18 sts × 28 rows = 10 × 10 cm in garter stitch on 5 mm needles, blocked.",
    "finishedSizeText": "180 × 22 cm.",
    "terminologyConvention": "uk",
    "craftStitchSlugs": ["knitting-garter-stitch", "knitting-knit"],
    "craftTechniqueTags": ["flat-construction"],
    "chartDefinition": null
  },
  "recipeTools": [
    { "slug": "knitting-needles", "isOptional": false },
    { "slug": "darning-needle", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "long-tail-cast-on", "term": "Long-tail cast-on", "definition": "…" }
  ],
  "techniqueSlugs": ["knitting-long-tail-cast-on", "knitting-kitchener-stitch"],
  "criticalTechniques": ["knitting-long-tail-cast-on"],
  "body": { "type": "doc", "content": [ … ] }
}
```

Rules:

- `categorySlug` is **always `"knitting"`** for this pipeline.
- `type` is `STITCH` or `PATTERN`. STITCH is one named stitch /
  technique; PATTERN is one finished object.
- `craftStitchSlugs` always carries `knitting-*` slugs. Crochet's
  `crochet-*` slugs and any future needlework slugs never appear in a
  knitting tutorial's array. Check `data/stitches.ts` filtered to
  `craft: 'knitting'` before authoring — add missing stitches there
  rather than inventing slugs.
- `primaryYarnWeightSlug` uses the UK names directly — `dk` (CYC 3),
  `aran` (CYC 4), `chunky` (CYC 5). The slugs match what's already
  seeded for crochet. Don't write `light` or `medium` or `bulky` —
  those are the US weight names and they aren't slugs here.
- `primaryNeedleSlug` always the canonical-mm slug
  (`knitting-needle-4-5mm`, not `knitting-needle-uk-7`). The renderer
  surfaces the reader's preferred UK / US numbering automatically.
- `craftTechniqueTags` adds knitting-only filter values on top of
  shared ones:
  - `cabling` — pattern includes at least one cable stitch
  - `lacework` — pattern includes yo + decrease patterning
  - `colorwork` — pattern uses two or more colours per row
  - `in-the-round` — pattern is knit on a circular needle or DPNs
  - `flat-construction` — pattern is knit flat in rows
  - `magic-loop` — pattern relies on the magic-loop technique for
    small circumferences
  - `kitchener` — pattern finishes with a Kitchener / grafted seam
  - `short-rows` — pattern uses w&t or German short rows
  Plus the shared ones from crochet (`blocking`, `invisible-finish`).

## Per-type guidance

### STITCH (`type: "STITCH"`)

One single stitch or short technique. The body lays out:

1. **Intro** — one paragraph. What the stitch is, what it looks like,
   where the reader meets it in patterns. Name the abbreviation
   (k, p, k2tog, c4f) on first use. Land the difficulty band.
2. **What you need** — short H2. Most stitches need only a small ball
   of DK yarn and a pair of 4 or 5 mm needles.
3. **The stitch, step by step** — H2. Ordered list, each step one
   action. For chartable stitches (cables, lace, brioche) include a
   `craftChart` TipTap node at the end of the section showing the
   symbolic form alongside the written form.
4. **Where you'll see it** — short H2. Two or three sentences naming
   the patterns this stitch turns up in.
5. **Common mistakes** — `troubleshooter` block with 3–5 entries.
6. **Sources** — handled in `sourceNotes`, not as a body section.

Length: 400–700 words for STITCH bodies.

### PATTERN (`type: "PATTERN"`)

One finished object. The body lays out:

1. **Intro** — one paragraph. What the project is, what the finished
   object looks like, what skills it asks for. Land the finished
   dimensions and the time on the needles.
2. **Materials** — H2. List the yarn (weight class, fibre, total
   grams), the needles (mm canonical with UK / US in brackets, type +
   length), the notions (cable needle, darning needle, stitch
   markers, blocking pins). Use `ingredientsList` where possible; fall
   back to `suppliesCard`.
3. **Gauge** — H2 "Gauge". Mandatory. State the gauge AND the
   consequence of skipping the swatch.
4. **Abbreviations** — H2 using a `suppliesCard` glossary. Every
   abbreviation used in the body gets a row.
5. **Pattern** — H2. Row-by-row instructions. H3 for major sections
   (Body / Decreases / Crown shaping). Number rows ("Row 1 (RS):",
   "Row 2 (WS):") and never skip RS/WS markers. Embed `craftChart`
   blocks inline for cables / lace / colorwork.
6. **Finishing** — H2. Cast-off, weaving in ends, blocking. State the
   blocking type (wet-block / steam-block / no-block — the last for
   cotton dishcloths) and the time.
7. **Variations** — H2 (optional). Single paragraph per variation
   naming the gauge / yarn / needle change.
8. **Sources** — `sourceNotes`.

Length: 1,200–2,500 words for PATTERN bodies.

## Charts — `craftChart` block + `chartDefinition`

Knitting uses the crochet pipeline's shared chart system. Two pathways:

### Tutorial-level `chartDefinition`

Set `knitting.chartDefinition` on the input — the upload script writes
it through to `Tutorial.chartDefinition` (JSONB column). The renderer
surfaces the chart in the canonical info-bar slot. Use this for the
primary chart of the pattern.

### Inline `craftChart` TipTap node

For multi-chart pattern bodies, embed `craftChart` nodes inline in the
body — each with its own `definition` attribute. The renderer draws
the inline chart with the same `SvgChart` component the Tutorial-level
chart uses.

```json
{
  "type": "craftChart",
  "attrs": {
    "definition": {
      "title": "c4f single repeat — 4 rows × 6 stitches",
      "layout": "flat",
      "craft": "knitting",
      "terminologyConvention": "uk",
      "rows": [
        { "rowNumber": 1, "rightSide": true,  "stitches": [ {"symbol": "knit"}, {"symbol": "knit"}, {"symbol": "knit"}, {"symbol": "knit"}, {"symbol": "knit"}, {"symbol": "knit"} ] },
        { "rowNumber": 2, "rightSide": false, "stitches": [ {"symbol": "purl"}, {"symbol": "purl"}, {"symbol": "purl"}, {"symbol": "purl"}, {"symbol": "purl"}, {"symbol": "purl"} ] },
        { "rowNumber": 3, "rightSide": true,  "stitches": [ {"symbol": "knit"}, {"symbol": "cable-4-front", "count": 4}, {"symbol": "knit"} ] },
        { "rowNumber": 4, "rightSide": false, "stitches": [ {"symbol": "purl"}, {"symbol": "purl"}, {"symbol": "purl"}, {"symbol": "purl"}, {"symbol": "purl"}, {"symbol": "purl"} ] }
      ],
      "caption": "Repeat all 4 rows across the body for the cabled column."
    }
  }
}
```

Symbol keys must exist in `apps/web/src/lib/craft-charts/chart-symbols.ts`
for the row's craft (`craft: 'knitting'`). The knitting glyph set
shipped to date covers: `knit`, `purl`, `yarn-over`, `k2tog`, `ssk`,
`make-1`, `slip-stitch`, `knit-tbl`, `cable-4-front`, `cable-4-back`.
Add to that file when a pattern needs a glyph that isn't there.

Per knitting publishing convention, right-side rows read RIGHT-TO-LEFT
on the chart (the renderer mirrors automatically when
`rightSide: true`). Wrong-side rows read left-to-right. The author
writes stitches in WORKING ORDER for each row; the renderer handles
orientation.

Knitting is always charted `layout: 'flat'` even when the pattern is
knit in the round — knitting publishing convention shows the chart as
a flat repeat regardless of construction.

## Voice rules — hard

Same hard rules as the cooking template (`docs/tutorial-author.md`).
Additions Knitting surfaces (also in `docs/knitting-anti-tells.md`):

- **No designer name-drops without copyright clarity.** PD-only at
  launch. Acceptable: Weldon's, Beeton's, Mary Thomas, Elizabeth
  Zimmermann pre-1964, Barbara Walker (paraphrased, never reproduced
  verbatim).
- **Gauge swatch is not optional.** Every PATTERN's "Gauge" section
  names the gauge AND the consequence of skipping the swatch. Don't
  reassure the reader the swatch is optional.
- **UK / US terminology disambiguated on first use.** "Stocking
  stitch (US: stockinette)" on first appearance, then UK throughout.
- **English-style is the default; Continental is named when
  relevant.** Don't assume yarn-throwing or yarn-picking by default;
  state the assumption where it matters (purling, brioche, tension).
- **Skill ladders are explicit.** Pair "easy" / "simple" claims with
  the skill band that finds them so. Never call a cable "easy"
  without naming the cable-prerequisite reader.
- **No brand-yarn dependence.** Patterns suggest a **yarn weight class**
  (`dk` / `aran` / `chunky`), a **fibre suggestion** (wool, cotton,
  blend), and a **total grams**. Don't require a specific named yarn.
- **British English, worldwide-friendly.** Grey not gray. Colour not
  color. Metric primary; imperial aliases (yards in brackets after
  metres) where the reader expects them.
- **No financial outcomes.** Don't compare to shop-bought, don't
  claim cost savings.

## Voice rules — soft

Same soft rules as the cooking + crochet templates. Two knitting-
specific additions:

- **Project arc as story.** A PATTERN's intro can name what it's like
  to live with the project on the needles for a week or two — the way
  a sock is the train-and-tea-break project, the way an Aran scarf is
  the long-evening project.
- **The finished object is the goal, not the technique.** Stitch
  prose stays at the stitch level; PATTERN prose stays at the
  finished-object level.

## Sources

Acceptable Knitting sources (same posture as crochet):

- **Weldon's Practical Knitting (Victorian — 1880s onward)** — public
  domain. Project Gutenberg + Internet Archive carry digital
  facsimiles.
- **Beeton's Book of Needlework (1870)** — public domain.
- **Mary Thomas's Knitting Book (1938)** — out of copyright in the
  UK / EU (Thomas d. 1948 → out of copyright from 2019). Paraphrase
  rather than reproduce verbatim where unsure.
- **Elizabeth Zimmermann pre-1964 columns** — PD in the US.
- **Barbara Walker's stitch dictionaries** — in copyright. Cite as
  reference for the structure; describe the stitch in your own words
  and draw fresh charts.
- **Public-domain folk patterns** (Aran, Fair Isle, Shetland lace,
  Norwegian Selbu mittens) — cite the tradition rather than a modern
  named interpreter.
- **Craft Yarn Council** for the weight + needle / hook conversion
  references the master tables follow.

When PD material is thin, set `sourceType: "SYNTHESISED"` and cite
the next-closest material. Don't invent a citation. Don't credit a
modern named designer for a centuries-old stitch structure.

## Length guidance

| Type | Word count | Examples |
|---|---|---|
| STITCH — basic | 400–600 | Knit and purl, k2tog, ssk |
| STITCH — intermediate | 500–800 | Cable basics, yarn over |
| STITCH — advanced | 700–1,100 | Brioche, intarsia, fair-isle |
| PATTERN — beginner | 1,200–1,800 | Garter scarf, ribbed hat, dishcloth |
| PATTERN — intermediate | 1,500–2,200 | Cabled dishcloth, simple lace shawl |
| PATTERN — advanced | 2,000–2,500 | Cabled jumper, Aran scarf, brioche hat |

Count `body` prose only.

## Self-critique pass

After writing the draft, re-read against this checklist and rewrite
any flagged line in place.

1. Same banned-phrase, banned-opener, em-dash, negation, tricolon,
   safety, price, americanism, wrap-up, scaling-token checks as
   `docs/tutorial-author.md` § "Self-critique pass".
2. Walk every entry in `docs/common-issues.md`. Rewrite or note.
3. Walk every entry in `docs/knitting-anti-tells.md`. Rewrite every
   `[block]` entry.
4. **Stitch slugs valid.** Every entry in `knitting.craftStitchSlugs`
   exists in `data/stitches.ts` with `craft: 'knitting'`. Open the
   file; check each slug.
5. **Yarn weight slug valid.** `knitting.primaryYarnWeightSlug`
   exists in `data/yarn-weights.ts`.
6. **Needle slug valid.** `knitting.primaryNeedleSlug` exists in
   `data/knitting-needles.ts`.
7. **Gauge swatch named.** Every PATTERN body has a "Gauge" H2 with
   the gauge value AND the consequence of skipping.
8. **UK / US disambiguated on first use.**
9. **No brand-yarn dependence.** Weight class + fibre suggestion +
   total grams only.
10. **No PD-violating designer attributions.**
11. **Charts well-formed.** Every `craftChart` block / Tutorial
    `chartDefinition` has matching `rows` / `rounds`, every `symbol`
    key exists in `chart-symbols.ts` for `craft: 'knitting'`, and
    knitting always uses `layout: 'flat'`.
12. **Skill ladder explicit.** Difficulty named in the intro and
    matches the `difficulty` metadata.

The deterministic `voice-check` CLI is the final gate.

---

<!--
  Shared v5 appendix appended to every author doc.
  Source of truth in `phase_8_content_integration_001`.
-->

## v5 — content integration rules (cross-category)

The following rules apply to every drafter. They are deterministic.

### Image sourcing — two-pass

After voice-check passes and before upload, call `sourceHeroImage`.
Knitting heroes show the **finished object** for PATTERN rows and the
**stitch close-up** for STITCH rows. Strict verification: a cabled-
scarf hero needs an image of a cabled scarf, not a generic scarf.

If `result.outcome === 'failed'`, leave `hero` unset — the public
renderer falls back to the procedural card.

### ProjectSchedule registration

Single-session STITCH tutorials never register `projectSchedule` rows
(the upload script rejects them). PATTERN rows with a real multi-day
arc MAY register schedule rows. For the launch anchor batch (scarf,
hat, dishcloth) leave the schedule empty — none are long enough arcs.

### Cross-category audit rules

1. **Inline glossary coverage.** Every entry in `glossaryTerms[]`
   must appear at least once in body prose wrapped in a
   `glossaryTooltip` mark.
2. **Servings vs yieldDescription.** Knitting doesn't carry servings.
   PATTERN's finished-size goes in `finishedSizeText`.
3. **freezeNotes reality.** Always `false` for knitting.

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

**Word precision for Knitting.** The correct verbs are: "knitting", "working",
"casting on", "casting off", "making", "decreasing", "increasing". Not "crocheting".
Stitches are "worked", not "crocheted". UK terminology is canonical (cast off, not
bind off; tension, not gauge).

**Pre-publish eight-rule self-check** — run after the existing self-critique pass:

1. **Em/en dashes — ZERO.** Any `—` or `–` in body prose is rejected. Replace with
   brackets, commas, full stops, or rewording.
2. **Safety advice — max one line.** No multi-paragraph safety sections in the body.
3. **No false specificness.** No brand-pinned needle or yarn brands unless the
   material type matters. "4 mm needles" is sufficient; brand name is not needed.
4. **Word precision.** Use only knitting verbs above.
5. **Glossary definitions non-empty.** Every `glossaryTerms[]` entry must have an
   explanatory clause. `voice-check` blocks empty stubs.
6. **Time units at scale.** Durations > 48 h in days or weeks, never raw hours.
7. **Orientation paragraph first.** Body opens with plain English (what this is, why
   you'd make it) before any notation or abbreviation appears.
8. **Canonical TipTap blocks.** `troubleshooter` for troubleshooters, `infoPanel` for
   callouts, `suppliesCard` for yarn and needle lists.
