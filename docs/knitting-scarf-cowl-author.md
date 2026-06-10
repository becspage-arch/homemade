# Knitting scarf and cowl authoring — worker prompt template

## Voice — MANDATORY pre-read

Before drafting any scarf or cowl pattern, read
`docs/voice-spec-quick-reference.md` end-to-end and re-read
`docs/voice-spec-2026-05-21.md` §3.4 (technique) and §3.5 (craft
project). The opening-paragraph register is the bar every knitting
pattern is measured against.

The voice draws on Elizabeth Zimmermann's plain-speech essays, Meg
Swansen's editing, Barbara Walker's stitch dictionaries, and June
Hemmons Hiatt's reference work. Mary Berry, Erin Boyle, Barbara
O'Neill, and Martha Stewart set the register from the cooking
template: a real maker telling another what they make.

The locked opening pattern: every scarf or cowl tutorial opens with
one sentence naming the finished piece, the construction direction,
and the rough finished dimensions. Voice spec §3.5 worked rewrite
is the template.

## Image policy — DO NOT GENERATE IMAGES

Authoring NEVER generates images. Set `hero` unset on every draft.
See `memory/feedback_image_strategy.md`.

When the pattern includes a `chartData` block (textured-stitch
scarves, Fair Isle infinity cowls, lace stoles, cable scarves), the
in-house chart engine at `apps/web/src/lib/knitting/renderer/`
renders the chart artwork. K-2 owns the locked
`KnittingChartData` shape. Authors populate `chartData`; the renderer
produces the visual.

## Inline glossary coverage — HARD RULE

Every entry in `glossaryTerms[]` appears inline at least once
wrapped in a `glossaryTooltip` mark with `termSlug` set. See
`memory/feedback_inline_glossary_coverage.md` and
`memory/feedback_glossary_tooltip_termslug.md`.

## TipTap node rules — HARD

Every text leaf in the TipTap body carries `"type": "text"`. The
public renderer silently drops nodes that hit its default case. See
`memory/feedback_tiptap_text_node_type.md`.

Numbered preparation steps use `orderedList`, never prose. See
`memory/feedback_voice_rewrite_dont_over_prune.md`.

---

Canonical input for any autopilot fire that drafts a knitting SCARF
or COWL pattern. Covers classic scarves, infinity scarves, hooded
cowls, cowls worked flat and seamed, and cowls worked in the round.
Sub-category is `scarf-cowl`.

**Prompt version:** 2 (K-4.1 author-prompt update — 2026-06-10).
v1 shipped with K-1 pipeline-setup (2026-06-09); v2 adds the
K-4.1 cross-cutting requirements and the Persona stuck-check.
Bump on iteration.

## How a drafting session uses this file

A knitting scarf and cowl worker does six things:

1. Reads this file, `docs/voice-editor-prompt.md`,
   `docs/common-issues.md`, the knitting-specific anti-tells once
   they land, and the brief (one pattern at a time).
2. Looks up every stitch in `packages/db/scripts/data/stitches.ts`
   and every yarn and needle in `data/yarn-weights.ts` and
   `data/knitting-needles.ts`. Never invent a slug.
3. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput`
   with `type = "PATTERN"`.
4. Self-critiques against the voice rules and the scarf-cowl-specific
   sizing logic.
5. Walks `docs/common-issues.md` and the knitting anti-tells file.
6. Writes the brief return.

The deterministic `voice-check` CLI is the upload gate.

## Input contract — the brief

- `title` — the finished piece, e.g. "Ribbed wool scarf" or
  "Stockinette infinity cowl".
- `slug` — URL slug.
- `type` — always `PATTERN`.
- `subCategorySlug` — always `scarf-cowl`.
- `pieceShape` — `STRAIGHT_SCARF` | `WIDTH_TAPERED_SCARF` |
  `HOODED_COWL` | `INFINITY_COWL_FLAT_SEAMED` |
  `INFINITY_COWL_IN_THE_ROUND` | `CLASSIC_COWL`.
- `construction` — `FLAT` (back and forth) or `IN_THE_ROUND`.
- `roughDimensionsCm` — target finished dimensions:
  - Scarf: `{ width: 20, length: 180 }`
  - Cowl: `{ circumference: 60, height: 25 }`
- `techniqueDisciplines` — multi-valued. Combine project shape with
  any of `COLOURWORK`, `LACE`, `CABLE_ARAN`, `BRIOCHE_DOUBLEKNIT`,
  `SPECIALTY`. A Fair Isle scarf carries `[COLOURWORK]`; a
  cabled-rib cowl carries `[CABLE_ARAN]`. Empty array for a plain
  stockinette or ribbed piece.
- `craftStitchSlugs` — every stitch used.
- `craftTechniqueTags` — free-form. Common: `provisional-cast-on`,
  `kitchener-graft`, `stranded-colourwork`, `cable-without-needle`,
  `magic-loop`, `blocking-wet`, `blocking-steam`.
- `primaryYarnWeightSlug` — required.
- `primaryNeedleSlug` — required. Match the yarn weight.
- `castOnMethod` — required. See enum below.
- `bindOffMethod` — required. See enum below.
- `inTheRoundMethod` — required when construction is `IN_THE_ROUND`.
- `terminologyConvention` — `uk` (default) or `us`.
- `gaugeText` — required. Stitches and rows per 10 cm, the stitch
  pattern, the needle size, blocked or unblocked.
- `gaugeInPatternStitch` — structured `{ stitchesPer10cm, rowsPer10cm,
  stitchName, blocked }`. Required when the pattern stitch's gauge
  differs from the stockinette swatch.
- `finishedSizeText` — required.
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED.
- `targetWordCount` — see § "Length guidance".
- `sources` — public-domain references.
- `notes` — anything to bias toward.

## Output contract — `TutorialUploadInput`

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary>",
  "type": "PATTERN",
  "categorySlug": "knitting",
  "subCategorySlug": "scarf-cowl",
  "difficulty": "BEGINNER",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "knitting": {
    "primaryYarnWeightSlug": "worsted",
    "primaryNeedleSlug": "needle-5-mm",
    "castOnMethod": "LONG_TAIL",
    "bindOffMethod": "STRETCHY",
    "inTheRoundMethod": null,
    "gaugeText": "18 sts × 24 rows = 10 × 10 cm in stockinette on 5 mm needles, blocked.",
    "gaugeInPatternStitch": null,
    "finishedSizeText": "Scarf — 20 × 180 cm.",
    "terminologyConvention": "uk",
    "craftStitchSlugs": ["knit-stitch", "purl-stitch"],
    "craftTechniqueTags": ["blocking-wet"],
    "projectShape": "SCARF",
    "techniqueDisciplines": []
  },
  "recipeTools": [
    { "slug": "needle-5-mm", "isOptional": false },
    { "slug": "tapestry-needle", "isOptional": false },
    { "slug": "craft-scissors", "isOptional": false },
    { "slug": "measuring-tape", "isOptional": false },
    { "slug": "blocking-mat", "isOptional": true },
    { "slug": "blocking-pins", "isOptional": true }
  ],
  "glossaryTerms": [
    { "slug": "blocking-wet", "term": "Wet blocking", "definition": "Soaking the finished piece, pressing out water, and pinning to shape on a flat surface to set the stitches." }
  ],
  "techniqueSlugs": ["long-tail-cast-on", "knit-stitch", "purl-stitch", "blocking-wet"],
  "criticalTechniques": ["long-tail-cast-on", "knit-stitch", "purl-stitch"],
  "body": { "type": "doc", "content": [] }
}
```

Rules:

- `categorySlug` is always `"knitting"`.
- `subCategorySlug` is always `"scarf-cowl"`.
- `type` is always `PATTERN`.
- `knitting.primaryYarnWeightSlug`, `primaryNeedleSlug`,
  `castOnMethod`, `bindOffMethod`, `gaugeText`, `finishedSizeText`,
  `projectShape` are required.
- `inTheRoundMethod` required when construction is `IN_THE_ROUND`.
- `chartDefinition` is optional. Use a chart for cable, lace,
  brioche, or colourwork repeats; a plain ribbed or stockinette
  scarf reads better as written instructions.
- `license` defaults to `LIBRARY_FREE`.

## Body structure — SCARF AND COWL PATTERN

1. **Opening sentence** — name the finished piece, the construction
   direction, the rough finished dimensions. Voice spec §3.5.
2. **Orientation paragraph** — one paragraph. Construction direction
   AND one clause naming why it was chosen for this piece (a flat
   scarf reads as a flat scarf; an in-the-round cowl avoids the seam
   at the join). The rough yardage estimate. One practical line on
   the piece's drape or wear context.
3. **What you need** — `suppliesCard` block. Yarn weight + total
   grams, needle size, tapestry needle, scissors, measuring tape,
   blocking mat and pins if blocking is appropriate.
4. **Gauge** — H2 "Gauge". Quote `gaugeText` verbatim. State one
   sentence on how to swatch. State the concrete numeric
   consequence of being off — for a scarf or cowl, in cm of
   finished width (gauge sets width directly) and in cm per row
   (gauge drift makes the finished scarf longer or shorter than
   `finishedSizeText`). Write the actual number, not "wrong size".
5. **Stitches used** — H2 "Stitches used". Stitch name with UK and
   US abbreviation in brackets. Every `craftStitchSlugs` entry
   shows up.
6. **Pattern** — H2 "Pattern". Sub-headings as needed:
   - **Cast on** — state the cast-on method, the stitch count for
     the finished width, AND (for long-tail cast-ons) the cast-on
     tail-length formula `tail_cm ≈ (needleCircumferenceMm ×
     stitchCount) / 10 + 15` together with a worked number for
     the largest size in this pattern.
   - **Body** — row-by-row or round-by-round. Number the rows.
     Stitch counts at row ends.
   - **Bind off** — state the bind-off method and one line on
     tension.
   - **Stitch count check-in** — at least two structural check-ins
     across the pattern, e.g. after the cast-on rib and at the
     halfway mark. Populate `knitting.stitchCountCheckpoints` with
     the same data as `[{rowOrRound, expected, label}]`.
   - **Common faults** — `### Common faults` H3 with 2-4 named
     failure modes for the piece type in prose. For a scarf or
     cowl: edge curl from stockinette without a border; visible
     gauge drift across the length if the swatch was skipped;
     bind-off too tight that flips the top edge.
7. **Finishing** — H2 "Finishing". Fastening off, weaving in ends,
   blocking. Block lace and colourwork wet; block cables steamed;
   block ribbed pieces gently or not at all.
8. **Care** — H2 "Care". Wash and dry instructions for the fibre.
   Handwash cool and lay flat for wool. Machine wash gentle and
   tumble low for cotton. Cool wash and no tumble for acrylic.
9. **What to try next** — short closing paragraph. Variations
   (different colour palette, change the yarn weight up or down,
   add a contrast border) or related projects.

## Cast-on and bind-off vocabulary

Cast-on enum (`KnittingPattern.castOnMethod`):

| Value | Plain English |
|---|---|
| LONG_TAIL | Long-tail cast-on. Default for scarves and cowls. |
| CABLE | Cable cast-on. Firm edge, suited to a cabled border. |
| GERMAN_TWISTED | German twisted cast-on. Stretchier than long-tail. |
| PROVISIONAL | Provisional cast-on. Live stitches recovered later. |
| ITALIAN_TUBULAR | Italian tubular cast-on. Polished ribbed edge. |
| OLD_NORWEGIAN | Old Norwegian cast-on. Extra-stretchy variant. |
| BACKWARD_LOOP | Backward-loop cast-on. Fast but loose; small panels only. |
| JUDYS_MAGIC | Judy's Magic cast-on. Niche use for cowls worked toe-up style. |
| KNITTED_ON | Knitted cast-on. Forgiving and easy to teach. |
| CROCHET_PROVISIONAL | Crochet provisional cast-on. Recovered stitches. |
| OTHER | Anything else; describe in body. |

Bind-off enum (`KnittingPattern.bindOffMethod`):

| Value | Plain English |
|---|---|
| STANDARD | Standard bind-off. Default. |
| STRETCHY | Stretchy bind-off. For ribbed cowl tops. |
| TUBULAR | Tubular bind-off. Matches an Italian tubular cast-on. |
| SEWN | Sewn bind-off. Elastic; suits ribbed pieces. |
| SEWN_TUBULAR | Sewn tubular bind-off. Polished ribbed finish. |
| JENYS_SURPRISINGLY_STRETCHY | Jeny's surprisingly stretchy bind-off. Very elastic. |
| ICELANDIC | Icelandic bind-off. Crisp decorative edge. |
| THREE_NEEDLE | Three-needle bind-off. Joins two live edges. |
| KITCHENER | Kitchener graft. Invisible join across live stitches. |
| I_CORD | Applied i-cord bind-off. Rounded decorative edge. |
| RUSSIAN_GRAFT | Russian grafted bind-off. Joins live edges with yarn over needle. |
| PICOT | Picot bind-off. Decorative scalloped edge. |
| SUSPENDED | Suspended bind-off. Looser than standard. |
| OTHER | Anything else; describe in body. |

## Materials master list

Default yarn weight and needle size by piece type:

| Piece | Yarn weight | Needle | Why |
|---|---|---|---|
| Lightweight summer scarf | Fingering or sport wool | 3.25 mm | Drapes, packs small |
| Everyday scarf | DK or worsted wool | 4 to 5 mm | Warm, fast work |
| Chunky winter scarf | Aran or bulky wool | 6 to 8 mm | Very warm, very fast |
| Lace stole | Lace or fingering | 3.5 to 4 mm | Open texture |
| Ribbed cowl | DK or worsted wool | 4 to 5 mm | Stretchy fit |
| Infinity cowl | Worsted or aran wool | 5 to 6 mm | Doubles for warmth |
| Hooded cowl | Worsted or aran wool blend | 5 to 6 mm | Holds shape with hood |
| Fair Isle cowl | Fingering or sport wool, multi-colour | 3 to 3.5 mm | Standard colourwork weight |
| Cabled scarf | DK or worsted wool | 4 to 5 mm | Crisp stitch definition |

Don't pin a brand. State weight and fibre.

## Construction patterns

**Straight scarf, flat.** Cast on for the width. Work back and forth
in the chosen stitch pattern to the finished length. Bind off.

**Infinity cowl, flat seamed.** Cast on for the width. Work back
and forth to the finished length. Bind off. Seam the two short
ends with mattress stitch or three-needle bind-off (a provisional
cast-on at the start lets you graft instead).

**Infinity cowl, in the round.** Cast on for the circumference.
Join in the round, mind the join. Work in rounds to the finished
height. Bind off.

**Classic cowl.** Same as infinity cowl in the round but worked at
a smaller circumference and worn close to the neck.

**Hooded cowl.** Work the cowl tube first. Pick up stitches across
the top of the front, work the hood flat or in the round to the
crown, then graft or three-needle bind off at the top.

## Pipeline-setup population

Read `Category.knitting`:

- `Category.techniqueSlugs[]` — copy the subset this pattern needs
  into the tutorial's `techniqueSlugs[]`.
- `Category.criticalTechniques[]` — copy the must-knows into
  `criticalTechniques[]` (typically `long-tail-cast-on`,
  `knit-stitch`, `purl-stitch`, plus any pattern-specific
  prerequisites the body uses).
- `Category.aliases[]` — copy relevant aliases.

## Length guidance

| Piece | Word count |
|---|---|
| Simple ribbed scarf or cowl | 900 – 1,300 |
| Stockinette infinity cowl | 1,000 – 1,400 |
| Cabled scarf | 1,400 – 1,900 |
| Lace scarf or stole | 1,500 – 2,100 |
| Fair Isle cowl | 1,600 – 2,200 |
| Hooded cowl | 1,800 – 2,400 |

Count body prose only.

## Voice rules — hard

- **No em or en dashes** in body prose.
- **No academic register.**
- **No marketing language** — no "perfect for", "stunning",
  "must-make", "elevate", "snuggle up", "cosy classic".
- **No soft-medical claims** — no "warm enough for any winter",
  no "perfect for sensitive skin".
- **UK terminology by default** with US wrapped in
  `glossaryTooltip` where stitch terminology differs.
- **Stitch counts at row and round ends.**
- **Cast-on method named** in the body, not just the field.
- **Bind-off method named** in the body, not just the field.
- **Gauge isn't optional.** Every scarf and cowl states gauge in
  `gaugeText` and in the body. Without gauge the finished size is
  a guess.
- **No yarn-brand endorsement.** Weight, fibre, colour — not brand.
- **No pattern-piracy framing.** Never "free pattern".
- **Glossary terms wrap on first use** with `termSlug`.
- **Text leaves carry `type: text`.**
- **Numbered preparation steps use `orderedList`**, never prose.

## Voice rules — soft

- **Named failure modes go in the `### Common faults` H3.** The
  K-4.1 update replaces the "show the failed swatch" pattern (which
  depended on photography we don't have) with a structural prose H3
  inside the Pattern section. Name 2-4 failure modes per piece —
  acrylic that pills under a coat seam; wool that loses memory at
  the bind-off; lace that drinks the blocking water. State the
  failure mode and the cause; the chart engine + PD line drawings
  cover what a photograph used to.
- **One concrete drape note** — close with "Wraps twice around the
  neck" or "Pulls up over the chin" rather than "perfect for
  every wardrobe".
- **Practical-not-twee.** Plain English.

## Cultural attribution

Where a scarf or cowl draws on a regional tradition (Shetland lace,
Faroese cowls, Estonian lace, Sanquhar two-colour work, Russian
Orenburg) acknowledge the tradition by name in the orientation
paragraph. Do not claim cultural authority. One sentence is enough.

## Sources

Format: one bullet per source.

Acceptable sources for scarves and cowls:

- **Weldon's Practical Knitter** (1880s to 1900s) — Internet
  Archive. Public domain.
- **Therese de Dillmont, *Encyclopedia of Needlework* (1886)** —
  Project Gutenberg #20776. Public domain.
- **Mary Thomas's Knitting Book (1938)** — out of UK copyright;
  citations only, not direct reproduction.
- **Cornelia Mee, *A Manual of Knitting and Crochet* (1846)** —
  Internet Archive. Public domain.

For modern-only piece types (infinity cowls worn looped, hooded
cowls, two-colour brioche scarves), set `sourceType: "SYNTHESISED"`
and cite the closest historical precedent (Victorian comforter
scarves, Victorian hood patterns, Victorian Brioche-stitch
samplers).

## Self-critique pass

1. Em or en dashes — ZERO.
2. Banned phrases — ZERO.
3. UK terminology consistent.
4. Every `craftStitchSlugs` entry exists in the master Stitch
   table and appears in body prose.
5. Every `glossaryTerms[]` entry appears inline wrapped in a
   `glossaryTooltip` with `termSlug` set.
6. Every text leaf has `type: text`.
7. Numbered preparation steps use `orderedList`.
8. `gaugeText` quoted verbatim in the Gauge section.
9. Cast-on and bind-off methods named in the body.
10. Stitch counts at every row or round end.
11. Cultural attribution is respectful and bounded.
12. K-4.1 cross-cutting:
    - Orientation paragraph states construction direction AND
      justifies the choice in one clause.
    - Gauge section names the concrete numeric consequence (cm of
      finished width AND cm per row), not a vague "wrong size".
    - Long-tail cast-on: tail-length formula AND worked number
      present.
    - Pattern section contains at least two stitch-count
      check-ins. `knitting.stitchCountCheckpoints` populated with
      the same data.
    - `### Common faults` H3 present in Pattern section with
      2-4 named failure modes in prose.
    - No "see video" / "watch the video" / "see photo" anywhere.
13. **Persona stuck-check (self-critique heuristic — we have no
    in-house knitter, so this is a quality pass, not a verification
    pass).** Read the draft three times, each as a different
    reader. Best self-critique we can run without a tester pool.
    Future iteration: when an unpaid tester pool exists post-launch
    the stuck-check becomes pre-publication verification.
    - **Beginner (cast on + first knit / first purl only):** flag
      every step where a first-time knitter stops because a skill
      or term is assumed she hasn't built.
    - **Intermediate (k / p / dec / inc, learning charts +
      shaping):** flag where the pattern assumes a skill not yet
      built or where the chart doesn't say what to do.
    - **Master (Walker / Bush / Miller / Zimmermann literature):**
      flag where the pattern violates an established convention or
      omits something a competent designer would always include.
    Each flag carries a row or section reference and a one-line
    fix. Fix every flag before voice-check, or document in
    sourceNotes why the flag was intentional.
