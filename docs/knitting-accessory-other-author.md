# Knitting accessory (other) authoring — worker prompt template

## Voice — MANDATORY pre-read

Read `docs/voice-spec-quick-reference.md` end-to-end and re-read
`docs/voice-spec-2026-05-21.md` §3.4 (technique) and §3.5 (craft
project).

The voice draws on Elizabeth Zimmermann, Meg Swansen, Barbara
Walker. Mary Berry, Erin Boyle, Barbara O'Neill, Martha Stewart
set the register.

Every accessory tutorial opens with one sentence naming the
finished piece, the construction direction, and the rough
finished dimensions.

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
accessory pattern that doesn't fit scarf-cowl, hat, mitt-glove,
shawl-wrap, or blanket. Catch-all for small accessories: bags,
headbands, leg warmers, scrunchies, jewellery (necklaces, knitted
bangles), bookmarks, water-bottle covers, mug cosies,
phone-pouch / tech-sleeve patterns, knitted toys (basic shapes
only — full amigurumi is a separate workstream). Sub-category is
`accessory-other`.

**Prompt version:** 2 (K-4.1 author-prompt update — 2026-06-10).
v1 shipped with K-1 pipeline-setup (2026-06-09); v2 adds the K-4.1
cross-cutting requirements and the Persona stuck-check.

## Sizing — per pattern

Accessories sized per-pattern in `finishedSizeText`. Most are
single-size or have one or two size variants. State the sizing
context plainly:

- Bag: tote-bag dimensions in cm.
- Headband: head circumference (54 to 58 cm typical, account for
  the ribbing's stretch).
- Leg warmer: calf circumference at the widest point + length from
  ankle to knee or thigh.
- Scrunchie: hair-tie size (single fits all; bigger for thick
  hair).
- Bookmark: standard 3 to 5 cm width, 15 to 25 cm length.
- Mug cosy: standard mug circumference 25 to 28 cm.
- Phone pouch: phone model dimensions; flag the model.
- Knitted toy: stated finished height.

## Input contract — the brief

- `title` — e.g. "Garter-stitch headband" or "Striped wool tote
  bag".
- `slug` — URL slug.
- `type` — always `PATTERN`.
- `subCategorySlug` — always `accessory-other`.
- `accessoryType` — `BAG_TOTE` | `HEADBAND` | `LEG_WARMER` |
  `SCRUNCHIE` | `BOOKMARK` | `MUG_COSY` | `WATER_BOTTLE_COVER` |
  `PHONE_POUCH` | `NECKLACE` | `BANGLE` | `KNITTED_TOY_BASIC` |
  `OTHER`.
- `construction` — `FLAT` | `IN_THE_ROUND` | `FLAT_SEAMED`.
- `roughDimensionsCm` — per-pattern.
- `techniqueDisciplines` — common combinations: `[]` for plain,
  `[CABLE_ARAN]` for cabled bags, `[COLOURWORK]` for striped or
  Fair Isle accessories.
- `craftStitchSlugs` — every stitch used.
- `craftTechniqueTags` — `i-cord`, `picking-up-stitches`,
  `magic-loop`, `bobble`, `provisional-cast-on`, etc.
- `primaryYarnWeightSlug` — required.
- `primaryNeedleSlug` — required.
- `castOnMethod` — required.
- `bindOffMethod` — required.
- `inTheRoundMethod` — required when in-the-round.
- `terminologyConvention` — `uk` (default) or `us`.
- `gaugeText` — required (yes, even on a bookmark — gauge sets the
  finished width).
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
  "subCategorySlug": "accessory-other",
  "difficulty": "BEGINNER",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "knitting": {
    "primaryYarnWeightSlug": "worsted",
    "primaryNeedleSlug": "needle-4-5-mm",
    "castOnMethod": "LONG_TAIL",
    "bindOffMethod": "STANDARD",
    "inTheRoundMethod": null,
    "gaugeText": "20 sts × 28 rows = 10 × 10 cm in stockinette on 4.5 mm needles, blocked.",
    "gaugeInPatternStitch": null,
    "finishedSizeText": "Headband — 50 cm circumference, 8 cm depth. Stretches to fit 54 to 58 cm head circumference.",
    "terminologyConvention": "uk",
    "craftStitchSlugs": ["knit-stitch", "purl-stitch"],
    "craftTechniqueTags": ["mattress-stitch-seam"],
    "projectShape": "OTHER",
    "techniqueDisciplines": []
  },
  "recipeTools": [
    { "slug": "needle-4-5-mm", "isOptional": false },
    { "slug": "tapestry-needle", "isOptional": false },
    { "slug": "craft-scissors", "isOptional": false }
  ],
  "glossaryTerms": [],
  "techniqueSlugs": ["long-tail-cast-on", "knit-stitch", "purl-stitch", "mattress-stitch-seam"],
  "criticalTechniques": ["long-tail-cast-on", "knit-stitch", "purl-stitch"],
  "body": { "type": "doc", "content": [] }
}
```

## Body structure — ACCESSORY PATTERN

1. **Opening sentence** — name the finished piece, the
   construction direction, the rough finished dimensions.
2. **Orientation paragraph** — one paragraph. Construction
   direction AND one clause naming why it was chosen for this
   accessory. Rough yardage. One practical use note.

   For knitted-toy patterns: name the intended age range. State
   the child-safety constraint plainly: "If this toy is intended
   for a child under three, work the eyes in embroidered yarn
   not safety eyes; stuff with washable toy stuffing; choose
   superwash yarn if the toy will be hugged often." Toy patterns
   without an age-and-safety call-out fail this prompt.

   For bag patterns: name the intended hardware (handles, lining,
   inner pocket) up front. Bags without structured handles or
   lining sag under contents; state which the pattern includes
   and which the maker adds.

   For phone-pouch patterns: do not pin to a specific phone
   model year. State the fit by dimensions ("fits a phone up to
   80 × 165 × 9 mm") and instruct the maker to measure her phone
   before casting on. Phone models change every year; the pattern
   does not.
3. **What you need** — `suppliesCard` block. Yarn weight + total
   yardage, needle size, tapestry needle, scissors, and anything
   project-specific (hair tie for a scrunchie, bag handle hardware
   for a tote, mug for sizing a cosy).
4. **Gauge** — H2 "Gauge". Quote `gaugeText` verbatim, swatch
   instructions. State the concrete numeric consequence in cm
   for this accessory type — bookmarks get 2-3 mm of slack per
   stitch-per-10cm of drift, totes get visible centimetres of
   handle-droop drift, phone pouches get the difference between
   a fit and a stretched-thin pouch. Write the actual number,
   not "wrong size".
5. **Stitches used** — H2 "Stitches used". UK and US
   abbreviations.
6. **Pattern** — H2 "Pattern":
   - **Cast on** — method and count. For long-tail cast-on, state
     the formula `tail_cm ≈ (needleCircumferenceMm × stitchCount)
     / 10 + 15` AND a worked number for the cast-on count.
   - **Body** — row-by-row or round-by-round to the finished
     dimensions. Stitch counts at row ends.
   - **Construction** — for bags, leg warmers, scrunchies and
     similar: any shaping, picked-up handles, etc.
   - **Bind off** — method.
   - **Stitch count check-in.** At least one structural prose
     entry in the Pattern section, at a logical mid-point or
     before the bind-off. Populate
     `knitting.stitchCountCheckpoints` with the matching data.
     Skip on flat-and-trivial pieces like a bookmark.
   - **Common faults** — `### Common faults` H3 inside the
     Pattern section. For most accessories: cast-on tighter than
     working tension producing a curled hem; bind-off too tight
     producing a curled top; bag handles sagging under intended
     contents because the handle pickup count was wrong; cotton
     phone pouch stretching out of fit after one week of pocket
     wear.
7. **Assembly or finishing** — H2 "Finishing". Seaming (where
   needed), threading hair-tie elastic (scrunchies), attaching
   bag handles, weaving in ends.
8. **Care** — H2 "Care". Fibre-specific.
9. **What to try next** — variations or related projects.

## Cast-on and bind-off

See `docs/knitting-scarf-cowl-author.md` for the full enum table.
Accessory-specific notes:
- `LONG_TAIL` cast-on covers most.
- `PROVISIONAL` cast-on for scrunchies (so the ends graft
  invisibly).
- `STANDARD` bind-off for most.
- `KITCHENER` graft for scrunchies and tubular pieces.

## Materials master list

| Accessory type | Yarn weight | Needle | Why |
|---|---|---|---|
| Tote bag | Aran cotton or wool blend | 4 to 5 mm | Holds shape, robust |
| Headband | DK or worsted wool | 4 to 4.5 mm | Stretchy, warm |
| Leg warmer | DK or worsted wool | 4 to 4.5 mm | Warm, hugs the leg |
| Scrunchie | DK or sport wool | 3.5 to 4 mm | Holds shape |
| Bookmark | Lace or fingering cotton | 3 to 3.5 mm | Flat, light |
| Mug cosy | DK wool | 4 mm | Insulates, washable |
| Phone pouch | DK or sport cotton or wool | 3.5 to 4 mm | Snug, padded |
| Necklace | Lace or fingering cotton, linen | 2.5 to 3 mm | Drapes |
| Bangle | Worsted or aran wool, felted | 4.5 to 5 mm | Holds shape after felting |
| Basic knitted toy | DK wool or wool blend | 3 to 3.5 mm | Tight fabric, stuffing-safe |

## Pipeline-setup population

Read `Category.knitting`:

- `Category.techniqueSlugs[]` → copy the relevant subset.
- `Category.criticalTechniques[]` → `long-tail-cast-on`,
  `knit-stitch`, `purl-stitch`. Add pattern-specific must-knows.
- `Category.aliases[]` → copy relevant.

## Length guidance

| Piece | Word count |
|---|---|
| Simple bookmark | 700 – 1,000 |
| Scrunchie | 700 – 1,100 |
| Headband | 900 – 1,300 |
| Mug cosy | 800 – 1,200 |
| Leg warmer | 1,100 – 1,600 |
| Tote bag | 1,400 – 1,900 |
| Knitted toy (basic) | 1,500 – 2,200 |
| Phone pouch | 1,000 – 1,500 |
| Necklace or bangle | 900 – 1,400 |

Count body prose only.

## Voice rules — hard

Same as `docs/knitting-scarf-cowl-author.md`. Accessory-specific
additions:

- **State target dimensions** for the size shown.
- **State what to substitute** when the project depends on a
  specific external item (mug, phone model, hair tie). Don't
  pretend one size fits all phones.
- **Flag care needs** plainly. Bags that need washing rarely; mug
  cosies that go through the washing-machine cycle weekly.

## Voice rules — soft

- **Named failure modes go in the `### Common faults` H3.** The
  K-4.1 update replaces the "show the failed swatch" pattern with
  a structural prose H3. Tote bags that stretch out of shape
  under heavy contents; non-superwash knitted toys that felt in
  the wash; cotton bookmarks that go yellow over time — state
  the failure mode and the cause as named prose, not as a photo
  reference.
- **One concrete use note** — close with "Holds a paperback plus
  a small notebook" or "Fits a standard pint glass" rather than
  marketing language.

## Cultural attribution

Where an accessory draws on a regional tradition (Norwegian
purses, Sami stick-knitted bands, knitted-and-felted Faroese
purses) acknowledge by name in the orientation paragraph. Do
not claim cultural authority. One sentence.

## Sources

Format: one bullet per source. Acceptable sources:

- **Weldon's Practical Knitter** — Internet Archive. Public
  domain.
- **Therese de Dillmont, *Encyclopedia of Needlework*** —
  Project Gutenberg #20776.
- **Cornelia Mee, *A Manual of Knitting and Crochet* (1846)** —
  Internet Archive.

For modern accessory types (phone pouches, tech sleeves, modern
totes) set `sourceType: "SYNTHESISED"`.

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
9. Sizing context stated for the specific accessory type.
10. External-item substitution flagged where relevant.
11. K-4.1 cross-cutting:
    - Orientation paragraph names construction AND justifies the
      choice.
    - Knitted toy: child-safety constraint stated (eyes, stuffing,
      yarn choice).
    - Bag: lining + handle hardware stated up front.
    - Phone pouch: sized by dimensions ("up to 80 × 165 × 9 mm")
      with measure-your-phone instruction; no model-year pinning.
    - Gauge section names concrete numeric consequence in cm,
      not "wrong size".
    - Long-tail cast-on: tail-length formula AND worked number
      present.
    - At least one stitch count check-in (skip on a bookmark).
      `knitting.stitchCountCheckpoints` populated where present.
    - `### Common faults` H3 present in Pattern section with
      2-4 named failure modes in prose.
    - No "see video" / "watch the video" / "see photo" anywhere.
12. **Persona stuck-check (self-critique heuristic — we have no
    in-house knitter, so this is a quality pass, not a verification
    pass).** Read the draft three times, each as a different
    reader.
    - **Beginner (cast on + first knit / first purl only):** flag
      every step where a first-time knitter stops.
    - **Intermediate (k / p / dec / inc, learning charts +
      shaping):** flag where the pattern assumes a skill not yet
      built.
    - **Master (Walker / Zimmermann literature):** flag where the
      pattern violates an established convention.
    Each flag carries a row or section reference and a one-line
    fix. Fix every flag before voice-check, or document why it
    was intentional. Future iteration: when an unpaid tester pool
    exists post-launch, the stuck-check becomes pre-publication
    verification.
