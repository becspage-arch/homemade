# Knitting blanket authoring — worker prompt template

## Voice — MANDATORY pre-read

Read `docs/voice-spec-quick-reference.md` end-to-end and re-read
`docs/voice-spec-2026-05-21.md` §3.4 (technique) and §3.5 (craft
project).

The voice draws on Elizabeth Zimmermann, Meg Swansen, Jane Brocket,
and Barbara Walker. Mary Berry, Erin Boyle, Barbara O'Neill,
Martha Stewart set the register.

Every blanket tutorial opens with one sentence naming the finished
piece, the construction direction, and the rough finished
dimensions.

## Image policy — DO NOT GENERATE IMAGES

Authoring NEVER generates images. Set `hero` unset. See
`memory/feedback_image_strategy.md`. Charts render through
`apps/web/src/lib/knitting/renderer/` per K-2's locked
`KnittingChartData` shape.

## Inline glossary coverage — HARD RULE

Every `glossaryTerms[]` entry appears inline at least once wrapped
in a `glossaryTooltip` mark with `termSlug` set.

## TipTap node rules — HARD

Every text leaf carries `"type": "text"`. Numbered preparation
steps use `orderedList`.

---

Canonical input for any autopilot fire that drafts a knitting
BLANKET pattern. Covers afghans, throws, baby blankets, modular
mitred-square blankets, log-cabin blankets, woven-stitch blankets,
heirloom layette blankets. Sub-category is `blanket`.

**Prompt version:** 2 (K-4.1 author-prompt update — 2026-06-10).
v1 shipped with K-1 pipeline-setup (2026-06-09); v2 adds the K-4.1
cross-cutting requirements and the Persona stuck-check.

## Blanket sizing reference

| Size | Dimensions | Use |
|---|---|---|
| Pram or cradle | 60 × 80 cm | Newborn pram |
| Baby | 75 × 90 cm | Cot |
| Receiving | 90 × 90 cm | Swaddling |
| Stroller | 80 × 100 cm | Toddler stroller |
| Lap throw | 100 × 120 cm | Sofa or armchair |
| Single-bed throw | 130 × 180 cm | Single bed top |
| Double-bed throw | 180 × 200 cm | Double bed top |

No body grading required — blanket size is one fixed pair of
dimensions per pattern, stated in `finishedSizeText`. State how
to extend or shorten in a single paragraph.

## Construction patterns

**Single-panel rectangle.** Cast on for the width. Work straight
in the chosen stitch pattern to the finished length. Bind off.
Fastest, simplest, suits log-stripe colourwork blankets.

**Modular squares (mitred or full-square).** Each square cast on
separately and joined as work progresses (join-as-you-go) or
seamed at the end. Suits scrap-yarn blankets.

**Strip-and-seam.** Work several long strips. Seam side-by-side
with mattress stitch. Suits striped patterns where dye-lots
matter less.

**Centre-out square.** Cast on a small centre on dpns, work in the
round increasing at four corners. Suits christening blankets and
shawl-blanket hybrids.

**Log cabin.** Pick up stitches along an edge, work a strip,
bind off, rotate, pick up the next edge, repeat. Suits
self-striping yarn and stash use.

## Input contract — the brief

- `title` — e.g. "Striped wool baby blanket".
- `slug` — URL slug.
- `type` — always `PATTERN`.
- `subCategorySlug` — always `blanket`.
- `pieceShape` — `SINGLE_PANEL` | `MODULAR_SQUARES` |
  `STRIP_AND_SEAM` | `CENTRE_OUT_SQUARE` | `LOG_CABIN`.
- `construction` — `FLAT` (default) or `IN_THE_ROUND`
  (centre-out only).
- `targetSize` — `PRAM` | `BABY` | `RECEIVING` | `STROLLER` |
  `LAP` | `SINGLE_BED` | `DOUBLE_BED`.
- `roughDimensionsCm` — `{ width: 75, length: 90 }` for a baby
  blanket.
- `techniqueDisciplines` — common: `[COLOURWORK]` for Fair Isle
  or intarsia blankets; `[CABLE_ARAN]` for Aran-influence
  throws; `[LACE]` for heirloom blankets; `[]` for stockinette
  or garter.
- `craftStitchSlugs` — every stitch used.
- `craftTechniqueTags` — `colour-change`, `joining-as-you-go`,
  `mattress-stitch-seam`, `picking-up-stitches`,
  `centre-out-cast-on`.
- `primaryYarnWeightSlug` — required.
- `primaryNeedleSlug` — required.
- `castOnMethod` — required.
- `bindOffMethod` — required.
- `inTheRoundMethod` — required when in-the-round.
- `terminologyConvention` — `uk` (default) or `us`.
- `gaugeText` — required.
- `gaugeInPatternStitch` — required where pattern stitch differs
  from stockinette.
- `finishedSizeText` — required.
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
  "subCategorySlug": "blanket",
  "difficulty": "BEGINNER",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "knitting": {
    "primaryYarnWeightSlug": "dk",
    "primaryNeedleSlug": "needle-4-mm",
    "castOnMethod": "LONG_TAIL",
    "bindOffMethod": "STANDARD",
    "inTheRoundMethod": null,
    "gaugeText": "22 sts × 30 rows = 10 × 10 cm in stockinette on 4 mm needles, blocked.",
    "gaugeInPatternStitch": null,
    "finishedSizeText": "Baby blanket — 75 × 90 cm.",
    "terminologyConvention": "uk",
    "craftStitchSlugs": ["knit-stitch", "purl-stitch"],
    "craftTechniqueTags": ["colour-change"],
    "projectShape": "BLANKET",
    "techniqueDisciplines": [],
    "repeatRowGroups": [
      { "startRow": 1, "endRow": 8, "label": "Stripe sequence", "defaultTargetCm": 90 }
    ]
  },
  "recipeTools": [
    { "slug": "needle-4-mm", "isOptional": false },
    { "slug": "tapestry-needle", "isOptional": false },
    { "slug": "craft-scissors", "isOptional": false },
    { "slug": "measuring-tape", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "joining-as-you-go", "term": "Join as you go", "definition": "Joining each new square or strip to the existing fabric on its final round or row of the new piece, removing the need to seam later." }
  ],
  "techniqueSlugs": ["long-tail-cast-on", "knit-stitch", "purl-stitch", "colour-change"],
  "criticalTechniques": ["long-tail-cast-on", "knit-stitch", "purl-stitch"],
  "body": { "type": "doc", "content": [] }
}
```

## Body structure — BLANKET PATTERN

1. **Opening sentence** — name the finished piece, the
   construction direction, the rough finished dimensions.
2. **Orientation paragraph** — one paragraph. Construction AND
   one clause naming why it was chosen for this blanket (single
   panel suits a beginner, fewer ends to weave in; modular squares
   let the maker use up stash; log cabin uses up partial skeins
   without dye-lot worry). Rough yardage. One practical use note
   (cot, pram, sofa, lap). For striped or modular blankets, a
   plain-English finishing-time estimate ("the joining will take
   roughly as long as the knitting"); blankets are the project
   most readers under-estimate.
3. **What you need** — `suppliesCard` block. Yarn weight + total
   grams (a blanket needs a lot — give a clear "for the size
   shown" total). State the finished weight in grams (populate
   `knitting.finishedWeightGrams`) — readers picking yarn benefit
   from knowing the finished blanket weighs ≈ 600 g. Needle size,
   tapestry needle, scissors, measuring tape. **Dye-lot warning
   when total yarn exceeds one skein.** State plainly: "Buy all
   the yarn at once in matched dye lots. A blanket showing a dye-
   lot shift mid-row is the most common knitting-blanket
   disappointment." Mention the safer-yarn-substitute path:
   alternate skeins every two rows so any drift averages out.
4. **Gauge** — H2 "Gauge". Quote `gaugeText` verbatim, then one
   sentence on swatching. State the concrete numeric consequence:
   "Blankets forgive a stitch per 10 cm of width drift; they don't
   forgive row-per-10cm drift on length. Two rows per 10 cm loose
   over a 180 cm cot blanket finishes ≈ 7 cm shorter than
   `finishedSizeText`." Write the actual number, not "wrong size".
5. **Stitches used** — H2 "Stitches used". UK and US abbreviations.
6. **Pattern** — H2 "Pattern":
   - For single-panel rectangle: cast-on count, row-by-row or
     repeat block, finished row count. For long-tail cast-on:
     state the formula `tail_cm ≈ (needleCircumferenceMm ×
     stitchCount) / 10 + 15` AND a worked number — blanket cast-
     ons are long enough that an under-counted tail forces a
     restart. Example: "For a 90 cm cot blanket on 4 mm needles
     with 198 sts, cast on tail of (4 × 198) / 10 + 15 ≈ 94 cm
     of tail plus 15 cm working end ≈ 110 cm. Round up to 130 cm
     to be safe."
   - For modular squares: pattern for one square, count of
     squares for the size shown, join order.
   - For strip-and-seam: pattern for one strip, strip count,
     seaming order.
   - For centre-out square: cast-on, increase rounds, finished
     round count.
   - For log cabin: starting strip, pickup-and-rotate sequence.
   - **You can set this down for weeks and pick it back up.**
     One sentence acknowledging blankets are long projects. The
     Studio's find-your-place feature lands here later; in prose
     for now: "When you set this aside between sessions, jot the
     row number in the notes panel or place a marker; the
     pattern resumes cleanly from any row."
   - **Stitch count check-in (mid-blanket and pre-bind-off).**
     Two structural prose entries inside the Pattern section, at
     the halfway mark and immediately before the bind-off.
     Populate `knitting.stitchCountCheckpoints` with the matching
     data. For modular blankets, one check-in per square plus
     one at the finished count of joined squares.
   - **Common faults** — `### Common faults` H3 inside the Pattern
     section. For most blankets: dye-lot shift mid-row (yarn was
     bought in batches; skeins not alternated); puckered seams on
     modular blankets (mattress stitch pulled too tight); cast-
     on tighter than the rest of the blanket (cast-on tension
     differs from working tension); centre-pull-ball collapse
     producing tangles partway through a long blanket session.
7. **Joining or seaming** — H2 "Joining" if the blanket joins
   motifs or seams strips. Mattress stitch, three-needle
   bind-off, join-as-you-go, slip-stitch seam.
8. **Edging** — H2 "Edging" if the blanket has a worked-on edge.
   Common: garter-stitch border, picot edge, applied i-cord,
   crochet edging.
9. **Finishing** — H2 "Finishing". Weaving in ends (so many ends;
   say so), blocking. Block wool wet; block acrylic with cool
   steam; cotton blocks lightly damp.
10. **Care** — H2 "Care". Fibre-specific. Baby blankets need
    machine-washable yarn — flag if the choice doesn't qualify.
11. **What to try next** — variations or related projects.

## Cast-on and bind-off

See `docs/knitting-scarf-cowl-author.md` for the full enum table.
Blanket-specific notes:
- `LONG_TAIL` cast-on for the width of a single panel.
- `PROVISIONAL` cast-on when both edges are picked up later (log
  cabin starts, double-thick blankets).
- `STANDARD` bind-off for most blanket edges.
- `THREE_NEEDLE` bind-off for joining two halves of a double-thick
  blanket.

## Materials master list

| Blanket type | Yarn weight | Needle | Why |
|---|---|---|---|
| Baby blanket | DK superwash wool or cotton | 4 mm | Machine-washable |
| Lap throw | Aran wool | 5 mm | Warm, fast |
| Heirloom christening | Fingering wool or merino | 3.25 to 3.5 mm | Fine drape |
| Aran throw | Aran wool | 4.5 to 5 mm | Cable definition |
| Chunky modern throw | Bulky wool or wool blend | 6 to 8 mm | Quick, statement |
| Fair Isle blanket | Worsted wool | 4.5 mm | Holds stranded colourwork |
| Log-cabin blanket | DK or worsted wool | 4 to 4.5 mm | Standard utility |

## Pipeline-setup population

Read `Category.knitting`:

- `Category.techniqueSlugs[]` → copy relevant.
- `Category.criticalTechniques[]` → `long-tail-cast-on`,
  `knit-stitch`, `purl-stitch`. Add `colour-change` for striped;
  `joining-as-you-go` or `mattress-stitch-seam` for modular;
  `picking-up-stitches` for log cabin.
- `Category.aliases[]` → copy relevant.

## Length guidance

| Piece | Word count |
|---|---|
| Plain garter or stockinette baby blanket | 1,000 – 1,400 |
| Striped baby blanket | 1,200 – 1,600 |
| Cabled lap throw | 1,500 – 2,000 |
| Fair Isle blanket | 1,800 – 2,400 |
| Mitred-square blanket | 1,700 – 2,300 |
| Heirloom lace blanket | 2,200 – 3,000 |
| Log-cabin blanket | 1,500 – 2,100 |

Count body prose only.

## Voice rules — hard

Same as `docs/knitting-scarf-cowl-author.md`. Blanket-specific
additions:

- **State total yardage clearly** for the size shown.
- **Stitch counts at row ends.**
- **Name the joining or seaming method** if the blanket isn't a
  single panel.
- **Baby-safe note** — if the pattern is sold for a baby blanket
  and uses non-machine-washable yarn, say so plainly in the
  Care section.

## Voice rules — soft

- **Named failure modes go in the `### Common faults` H3.** The
  K-4.1 update replaces the "show the failed swatch" pattern with
  a structural prose H3. Acrylic baby blanket that pills under
  crawl traffic; cotton blanket that drinks dye on the first
  wash; superwash wool that stretches two sizes after one blocking
  and doesn't recover — state the failure mode and the cause as
  named prose, not as a photo reference.
- **One concrete use note** — close with "Folded across a cot
  end" or "Drapes a two-seater armrest" rather than marketing
  language.
- **Practical-not-twee.** No "snuggle", no "perfect for cosy
  evenings", no "must-have for any nursery".

## Cultural attribution

Modular knit blankets draw on Welsh tapestry traditions and
American log-cabin and granny-square traditions. Acknowledge by
name in the orientation paragraph where relevant. One sentence.

## Sources

Format: one bullet per source. Acceptable sources:

- **Weldon's Practical Knitter** — Internet Archive. Public
  domain.
- **Therese de Dillmont, *Encyclopedia of Needlework*** —
  Project Gutenberg #20776.
- **Cornelia Mee, *A Manual of Knitting and Crochet* (1846)** —
  Internet Archive.

For modern blanket constructions (log cabin, mitred squares as
they're known today) set `sourceType: "SYNTHESISED"`.

## Self-critique pass

1. Em or en dashes — ZERO.
2. Banned phrases — ZERO.
3. UK terminology consistent.
4. Every `craftStitchSlugs` entry exists and appears in body
   prose.
5. Every `glossaryTerms[]` entry appears inline wrapped in a
   `glossaryTooltip` with `termSlug` set.
6. Every text leaf has `type: text`.
7. Numbered preparation steps use `orderedList`.
8. `gaugeText` quoted verbatim in the Gauge section.
9. Total yardage stated clearly.
10. Joining method named when the blanket isn't a single panel.
11. Baby-safe flag in Care section where applicable.
12. K-4.1 cross-cutting:
    - Orientation paragraph names construction AND justifies the
      choice. Plain-English finishing-time estimate for striped
      or modular blankets.
    - Dye-lot warning present where the project uses more than
      one skein of any colour.
    - `knitting.finishedWeightGrams` populated.
    - Gauge section names the concrete numeric consequence in
      cm, not "wrong size".
    - Long-tail cast-on: tail-length formula AND worked number
      present (blanket cast-ons make this load-bearing).
    - "You can set this down and pick it back up" sentence
      present.
    - Stitch count check-in at the halfway mark AND before
      bind-off (or per-square + at finished count for modular).
      `knitting.stitchCountCheckpoints` populated.
    - `### Common faults` H3 present with 2-4 named failure
      modes in prose.
    - No "see video" / "watch the video" / "see photo" anywhere.
13. **Persona stuck-check (self-critique heuristic — we have no
    in-house knitter, so this is a quality pass, not a verification
    pass).** Read the draft three times, each as a different
    reader.
    - **Beginner (cast on + first knit / first purl only):** flag
      every step where a first-time knitter stops because a skill
      or term is assumed she hasn't built. Blanket patterns are a
      common first-finished-object and deserve real beginner
      kindness in the cast-on and bind-off rows.
    - **Intermediate (k / p / dec / inc, learning charts +
      shaping):** flag where the pattern assumes a skill not yet
      built or where the joining or seaming instructions skip a
      step.
    - **Master (Walker / Zimmermann / Brocket literature):** flag
      where the pattern violates an established convention.
    Each flag carries a row or section reference and a one-line
    fix. Fix every flag before voice-check, or document why it
    was intentional. Future iteration: when an unpaid tester pool
    exists post-launch, the stuck-check becomes pre-publication
    verification.
