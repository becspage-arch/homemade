# Knitting hat authoring — worker prompt template

## Voice — MANDATORY pre-read

Read `docs/voice-spec-quick-reference.md` end-to-end and re-read
`docs/voice-spec-2026-05-21.md` §3.4 (technique) and §3.5 (craft
project). The opening-paragraph register is the bar.

The voice draws on Elizabeth Zimmermann, Meg Swansen, and Barbara
Walker. Mary Berry, Erin Boyle, Barbara O'Neill, Martha Stewart set
the register: a real maker telling another what they make.

Every hat tutorial opens with one sentence naming the finished
piece, the construction direction, and the head circumference it
fits. Voice spec §3.5 worked rewrite is the template.

## Image policy — DO NOT GENERATE IMAGES

Authoring NEVER generates images. Set `hero` unset on every draft.
See `memory/feedback_image_strategy.md`.

Patterns with `chartData` (Fair Isle bands, cabled crowns, brioche
brims) render through `apps/web/src/lib/knitting/renderer/`. K-2
owns the locked `KnittingChartData` shape.

## Inline glossary coverage — HARD RULE

Every entry in `glossaryTerms[]` appears inline at least once
wrapped in a `glossaryTooltip` mark with `termSlug` set. See
`memory/feedback_inline_glossary_coverage.md` and
`memory/feedback_glossary_tooltip_termslug.md`.

## TipTap node rules — HARD

Every text leaf carries `"type": "text"`. Numbered preparation
steps use `orderedList`, never prose.

---

Canonical input for any autopilot fire that drafts a knitting HAT
pattern. Covers beanies, slouchy hats, fitted hats, bucket hats,
berets, watchcaps, earflap hats. Sub-category is `hat`.

**Prompt version:** 1 (Knitting pipeline-setup — 2026-06-09).

## How a drafting session uses this file

1. Reads this file, `docs/voice-editor-prompt.md`,
   `docs/common-issues.md`, the knitting anti-tells file, and the
   brief.
2. Looks up every stitch in `packages/db/scripts/data/stitches.ts`
   and every yarn or needle in `data/yarn-weights.ts` /
   `data/knitting-needles.ts`. Never invent a slug.
3. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput`
   with `type = "PATTERN"`.
4. Self-critiques against the voice rules and the hat-specific
   sizing logic.
5. Walks `docs/common-issues.md` and the knitting anti-tells file.
6. Writes the brief return.

## Hat sizing — simple grading

Hats grade against head circumference. One circumference fits a
range (a 56 cm crown stretches comfortably from a 54 cm to a 58 cm
head). Standard sizes:

| Size | Head circumference | Crown circumference (negative ease 2 cm) |
|---|---|---|
| Baby (3 to 6 mo) | 38 to 42 cm | 38 cm |
| Toddler (1 to 3 yr) | 46 to 49 cm | 46 cm |
| Child (4 to 10 yr) | 50 to 53 cm | 50 cm |
| Adult small | 54 to 56 cm | 54 cm |
| Adult medium | 56 to 58 cm | 56 cm |
| Adult large | 58 to 61 cm | 58 cm |

Garment-level grading (with bust, waist, hip, sleeve length) is K-5
territory. Hats stay on this single-axis grading and are safe to
author now.

## Input contract — the brief

- `title` — the finished piece, e.g. "Ribbed wool beanie".
- `slug` — URL slug.
- `type` — always `PATTERN`.
- `subCategorySlug` — always `hat`.
- `hatShape` — `BEANIE` | `SLOUCHY` | `FITTED` | `BUCKET` |
  `BERET` | `WATCHCAP` | `EARFLAP`.
- `construction` — `IN_THE_ROUND` (default) or `FLAT_SEAMED` (rare).
- `crownShaping` — `STAR_DECREASES` | `SPIRAL_DECREASES` |
  `WEDGE_DECREASES` | `GATHERED`.
- `sizes` — array of head circumferences to grade, e.g.
  `[54, 56, 58]`. The pattern body writes one set of instructions
  with bracketed-size variants for the others.
- `techniqueDisciplines` — multi-valued. Common combinations:
  `[COLOURWORK]` for a Fair Isle band, `[CABLE_ARAN]` for a cabled
  beanie, `[BRIOCHE_DOUBLEKNIT]` for a brioche slouchy hat,
  `[LACE]` for an open-work beret. Empty array for plain stockinette
  or ribbed.
- `craftStitchSlugs` — every stitch used.
- `craftTechniqueTags` — `magic-loop`, `two-handed-stranded`,
  `cable-without-needle`, `brioche-set-up-row`, etc.
- `primaryYarnWeightSlug` — required.
- `primaryNeedleSlug` — required.
- `secondaryNeedleSlugs` — array; many hats use a smaller needle
  for the ribbed brim and a larger one for the body. Empty array
  for single-needle patterns.
- `castOnMethod` — required.
- `bindOffMethod` — required (or `KITCHENER` for grafted crowns
  worked top-down).
- `inTheRoundMethod` — required: `MAGIC_LOOP`, `DPN`,
  `TWO_CIRCULARS`, `FIXED_CIRCULAR`, `SHORT_CIRCULAR`.
- `terminologyConvention` — `uk` (default) or `us`.
- `gaugeText` — required.
- `gaugeInPatternStitch` — required when the body stitch's gauge
  differs from stockinette.
- `finishedSizeText` — required. State each finished crown
  circumference and brim depth.
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED.
- `targetWordCount` — see § "Length guidance".
- `sources` — public-domain references.

## Output contract — `TutorialUploadInput`

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary>",
  "type": "PATTERN",
  "categorySlug": "knitting",
  "subCategorySlug": "hat",
  "difficulty": "BEGINNER",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "knitting": {
    "primaryYarnWeightSlug": "worsted",
    "primaryNeedleSlug": "needle-4-5-mm",
    "secondaryNeedleSlugs": ["needle-3-75-mm"],
    "castOnMethod": "LONG_TAIL",
    "bindOffMethod": "STANDARD",
    "inTheRoundMethod": "MAGIC_LOOP",
    "gaugeText": "20 sts × 28 rows = 10 × 10 cm in stockinette on 4.5 mm needles, blocked.",
    "gaugeInPatternStitch": null,
    "finishedSizeText": "Crown circumference 54 (56, 58) cm. Brim depth 5 cm.",
    "terminologyConvention": "uk",
    "craftStitchSlugs": ["knit-stitch", "purl-stitch", "knit-2-together", "slip-slip-knit"],
    "craftTechniqueTags": ["magic-loop", "crown-decreases-star"],
    "projectShape": "HAT",
    "techniqueDisciplines": [],
    "sizesGraded": [
      { "name": "S", "headCircumference": 54 },
      { "name": "M", "headCircumference": 56 },
      { "name": "L", "headCircumference": 58 }
    ]
  },
  "recipeTools": [
    { "slug": "needle-4-5-mm", "isOptional": false },
    { "slug": "needle-3-75-mm", "isOptional": false },
    { "slug": "stitch-markers", "isOptional": false },
    { "slug": "tapestry-needle", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "magic-loop", "term": "Magic loop", "definition": "Knitting a small circumference on one long circular needle by pulling a loop of cable through the work at the halfway point." }
  ],
  "techniqueSlugs": ["long-tail-cast-on", "knit-stitch", "purl-stitch", "magic-loop", "knit-2-together", "slip-slip-knit"],
  "criticalTechniques": ["long-tail-cast-on", "knit-stitch", "purl-stitch", "magic-loop"],
  "body": { "type": "doc", "content": [] }
}
```

Rules:

- `categorySlug` is always `"knitting"`.
- `subCategorySlug` is always `"hat"`.
- `type` is always `PATTERN`.
- `knitting.projectShape` is always `"HAT"`.
- `inTheRoundMethod` is required.
- `chartDefinition` optional. Use a chart for Fair Isle bands,
  cabled crowns, lace berets.
- `license` defaults to `LIBRARY_FREE`.

## Body structure — HAT PATTERN

1. **Opening sentence** — name the finished piece, the
   construction direction, the head circumference. Voice spec §3.5.
2. **Orientation paragraph** — one paragraph. Construction (worked
   in the round from the brim, top-down, or in the round from a
   provisional cast-on), the rough yardage estimate, one practical
   wear note.
3. **What you need** — `suppliesCard` block. Yarn weight + total
   grams, primary needle, secondary needle for the brim if used,
   stitch markers, tapestry needle.
4. **Gauge** — H2 "Gauge". Quote `gaugeText` verbatim, then one
   sentence on swatching. Gauge sets the finished circumference;
   a tight knitter on the same yarn gets a child's hat instead of
   an adult one.
5. **Stitches used** — H2 "Stitches used". UK and US abbreviations.
6. **Pattern** — H2 "Pattern":
   - **Cast on** — state the cast-on method and the cast-on count
     for each size, "Cast on 96 (100, 104) sts on 3.75 mm needles".
   - **Brim** — row count for the ribbed band, switch needle size
     where applicable.
   - **Body** — round-by-round to the start of crown shaping.
     Mention the stitch pattern, repeat structure, length to the
     decrease start.
   - **Crown shaping** — number every decrease round. Stitch counts
     at the end of every decrease round. End at 8 to 12 stitches
     for a grafted top, or at 6 to 8 stitches for a gathered top.
   - **Finishing the top** — gather the remaining stitches onto a
     yarn tail, draw up, fasten on the inside.
7. **Finishing** — H2 "Finishing". Weaving in ends, blocking.
   Beanies block lightly; berets block aggressively over a plate.
8. **Care** — H2 "Care". Fibre-specific.
9. **What to try next** — variations or related projects.

## Crown shaping reference

**Star decreases.** 6 or 8 sections. Place a marker between each
section on the last body round. Decrease one stitch before each
marker every decrease round. Even spiral pull.

**Spiral decreases.** Decrease one stitch every 8 stitches around,
then every 7, then every 6, every other round, until you reach
8 to 12 stitches. Spirals visibly around the crown.

**Wedge decreases.** Bigger wedges (4 or 6 sections). Two decreases
per section per decrease round. Crisp pinwheel look.

**Gathered.** No structured decreases. Work to a height, cut the
yarn, draw through every live stitch, gather flat. Beret finish.

## Cast-on and bind-off

See `docs/knitting-scarf-cowl-author.md` for the full enum table.
Hats commonly use:
- `LONG_TAIL` cast-on with a ribbed brim.
- `GERMAN_TWISTED` or `OLD_NORWEGIAN` for stretchier brims.
- `STANDARD` bind-off where the cast-on edge stays flat.
- `KITCHENER` bind-off for top-down hats with a smooth crown.

## In-the-round method reference

| Value | Plain English |
|---|---|
| MAGIC_LOOP | One long circular needle; pull a loop at the halfway point. |
| DPN | Four or five double-pointed needles. |
| TWO_CIRCULARS | Stitches split across two circular needles. |
| FIXED_CIRCULAR | One circular needle, cable length matching the work. |
| SHORT_CIRCULAR | One short circular needle (16 inch / 40 cm), brim-sized. |

Default authoring assumption is `MAGIC_LOOP` because one needle
fits every circumference and beginners only buy one tool.

## Materials master list

| Hat type | Yarn weight | Needle | Why |
|---|---|---|---|
| Quick adult beanie | Worsted or aran wool | 4.5 to 5 mm | Fast, warm |
| Fitted beanie | DK wool or wool blend | 3.75 to 4 mm | Crisp stitch definition |
| Slouchy hat | DK or worsted wool | 4 to 4.5 mm | Drapes |
| Fair Isle hat | Fingering wool | 3 to 3.5 mm | Standard colourwork weight |
| Cabled beanie | Worsted wool | 4.5 mm | Holds cable definition |
| Beret | DK wool | 3.75 to 4 mm | Drapes flat |
| Baby beanie | Fingering or sport machine-wash wool | 3 to 3.25 mm | Soft, washable |
| Earflap hat | Worsted wool | 4.5 mm | Warm |

## Pipeline-setup population

Read `Category.knitting`:

- `Category.techniqueSlugs[]` → copy the relevant subset.
- `Category.criticalTechniques[]` → must-knows: `long-tail-cast-on`,
  `knit-stitch`, `purl-stitch`, `magic-loop` (or whichever
  in-the-round method the pattern uses), `knit-2-together`,
  `slip-slip-knit`.
- `Category.aliases[]` → copy relevant.

## Length guidance

| Piece | Word count |
|---|---|
| Plain ribbed beanie | 1,000 – 1,400 |
| Slouchy stockinette hat | 1,100 – 1,500 |
| Cabled beanie | 1,500 – 2,000 |
| Beret | 1,500 – 2,000 |
| Fair Isle hat | 1,800 – 2,400 |
| Earflap hat with i-cord ties | 1,800 – 2,500 |

Count body prose only.

## Voice rules — hard

Same as `docs/knitting-scarf-cowl-author.md`. Hat-specific
additions:

- **State the cast-on count for every size** in the body.
- **Stitch counts at the end of every decrease round.**
- **Name the in-the-round method** in the orientation paragraph.
- **Crown-shaping section is named and structured**, not buried.
- **Gauge is non-negotiable.** A tight knitter on the same yarn
  produces a child's hat.

## Voice rules — soft

- **Show the failed swatch.** Acrylic crowns that stretch out under
  weight; cotton hats that lose elasticity at the brim; superwash
  merino that grows two sizes in the wash — name the failure
  mode where it's known.
- **One concrete fit note** — close with "Sits at the brow line"
  or "Slouches three fingers behind the crown" rather than
  marketing language.

## Cultural attribution

Where a hat draws on a regional tradition (Selbu Fair Isle, Sami
hats, Andean chullos, Faroese watchcaps) acknowledge the
tradition by name in the orientation paragraph. Do not claim
cultural authority. One sentence is enough.

## Sources

Format: one bullet per source. Acceptable sources:

- **Weldon's Practical Knitter** — Internet Archive. Public domain.
- **Therese de Dillmont, *Encyclopedia of Needlework*** — Project
  Gutenberg #20776.
- **Cornelia Mee, *A Manual of Knitting and Crochet* (1846)** —
  Internet Archive.

For modern-only piece types (slouchy beanies, brioche hats,
high-fashion berets) set `sourceType: "SYNTHESISED"`.

## Self-critique pass

1. Em or en dashes — ZERO.
2. Banned phrases — ZERO.
3. UK terminology consistent.
4. Every `craftStitchSlugs` entry exists in master Stitch table
   and appears in body prose.
5. Every `glossaryTerms[]` entry appears inline wrapped in a
   `glossaryTooltip` with `termSlug` set.
6. Every text leaf has `type: text`.
7. Numbered preparation steps use `orderedList`.
8. `gaugeText` quoted verbatim in the Gauge section.
9. Cast-on count stated for every size.
10. Crown-shaping decreases numbered with stitch counts at every
    decrease round.
11. In-the-round method named in orientation.
12. Cultural attribution respectful and bounded.
