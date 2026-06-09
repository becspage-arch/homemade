# Knitting shawl and wrap authoring — worker prompt template

## Voice — MANDATORY pre-read

Read `docs/voice-spec-quick-reference.md` end-to-end and re-read
`docs/voice-spec-2026-05-21.md` §3.4 (technique) and §3.5 (craft
project).

The voice draws on Elizabeth Zimmermann, Meg Swansen, Barbara
Walker, Sharon Miller (Heirloom Knitting), and Nancy Bush
(Estonian lace). Mary Berry, Erin Boyle, Barbara O'Neill, Martha
Stewart set the register.

Every shawl or wrap tutorial opens with one sentence naming the
finished shape, the construction direction, and the rough finished
dimensions.

## Image policy — DO NOT GENERATE IMAGES

Authoring NEVER generates images. Set `hero` unset. See
`memory/feedback_image_strategy.md`. Charts render through
`apps/web/src/lib/knitting/renderer/` per K-2's locked
`KnittingChartData` shape. Lace patterns benefit heavily from a
chart; consider one for any lace shawl.

## Inline glossary coverage — HARD RULE

Every `glossaryTerms[]` entry appears inline at least once wrapped
in a `glossaryTooltip` mark with `termSlug` set.

## TipTap node rules — HARD

Every text leaf carries `"type": "text"`. Numbered preparation
steps use `orderedList`, never prose.

---

Canonical input for any autopilot fire that drafts a knitting
SHAWL or WRAP pattern. Covers triangular shawls, semicircular
shawls, asymmetric shawls, Faroese shawls, half-pi shawls, square
shawls, rectangular stoles. Sub-category is `shawl-wrap`.

**Prompt version:** 1 (Knitting pipeline-setup — 2026-06-09).

## Shawl shape reference

| Shape | Cast on | Construction | Finished form |
|---|---|---|---|
| **Top-down triangle** | 3 to 5 stitches at the centre back | Increase 4 stitches per RS row (2 at the centre, 1 at each side) | 90 degree triangle |
| **Side-to-side asymmetric** | A few stitches at one tip | Increase at one edge only | Diagonal scarf/shawl hybrid |
| **Bottom-up triangle** | A long cast-on at the wingspan | Decrease both edges | Inverted triangle |
| **Half-pi shawl** | A handful of stitches at the centre back neck | Doubles the stitch count every few rows (Zimmermann's pi recipe) | Semicircle |
| **Faroese** | Cast on at the wingspan | Worked from wingspan to centre back with a centre back panel and shoulder shaping | Shaped to stay on the shoulders |
| **Square shawl** | Centre worked in the round on dpns | Square outwards, four sides increase together | Square with diagonal lines |
| **Rectangular stole** | A long cast-on for one short edge | Work straight | Rectangle |

## Lace blocking

Lace shawls need wet-blocking. Soak the finished piece, press out
water, pin out to the dimensions stated in `finishedSizeText`.
State that wet-blocking is essential in the body. Lace pattern
"only opens up after blocking" is a real description, not
marketing.

## Input contract — the brief

- `title` — e.g. "Top-down triangle wool shawl".
- `slug` — URL slug.
- `type` — always `PATTERN`.
- `subCategorySlug` — always `shawl-wrap`.
- `pieceShape` — `TRIANGLE_TOP_DOWN` | `TRIANGLE_BOTTOM_UP` |
  `SEMICIRCLE` | `HALF_PI` | `ASYMMETRIC` | `FAROESE` |
  `SQUARE` | `RECTANGULAR_STOLE`.
- `construction` — `FLAT` (almost always) or `IN_THE_ROUND` (square
  shawls only).
- `wingspanCm` — target wingspan along the cast-on edge or the long
  edge.
- `depthCm` — target centre-back depth.
- `techniqueDisciplines` — multi-valued. Most shawls carry `[LACE]`;
  cabled shawls carry `[CABLE_ARAN]`; Faroese can carry
  `[COLOURWORK]`. Garter-stitch shawls can carry `[]`.
- `craftStitchSlugs` — every stitch used.
- `craftTechniqueTags` — `yarn-over`, `lifeline`, `wet-blocking`,
  `picking-up-stitches`, `nupp`, `bobble`, `provisional-cast-on`,
  `knitted-on-edging`.
- `primaryYarnWeightSlug` — required.
- `primaryNeedleSlug` — required (often two sizes larger than
  standard for the yarn weight to open up lace).
- `castOnMethod` — required. Top-down triangles often use
  `GARTER_TAB` (a sub-method of `PROVISIONAL`); record
  `PROVISIONAL` and describe the garter-tab steps in the body.
- `bindOffMethod` — required. Stretchy bind-offs are essential for
  lace; the edge controls the blocked dimensions.
- `inTheRoundMethod` — required when in-the-round.
- `terminologyConvention` — `uk` (default) or `us`.
- `gaugeText` — required. State blocked.
- `gaugeInPatternStitch` — required for lace.
- `finishedSizeText` — required, blocked dimensions.
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED. Most lace
  shawls are INTERMEDIATE; nupp-heavy Estonian and laceweight
  half-pi shawls are ADVANCED.
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
  "subCategorySlug": "shawl-wrap",
  "difficulty": "INTERMEDIATE",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "knitting": {
    "primaryYarnWeightSlug": "fingering",
    "primaryNeedleSlug": "needle-4-mm",
    "castOnMethod": "PROVISIONAL",
    "bindOffMethod": "JENYS_SURPRISINGLY_STRETCHY",
    "inTheRoundMethod": null,
    "gaugeText": "20 sts × 28 rows = 10 × 10 cm in stockinette on 4 mm needles, blocked.",
    "gaugeInPatternStitch": {
      "stitchesPer10cm": 18,
      "rowsPer10cm": 24,
      "stitchName": "lace panel",
      "blocked": true
    },
    "finishedSizeText": "Wingspan 180 cm. Centre-back depth 80 cm. Blocked.",
    "terminologyConvention": "uk",
    "craftStitchSlugs": ["knit-stitch", "purl-stitch", "yarn-over", "knit-2-together", "slip-slip-knit", "k3tog"],
    "craftTechniqueTags": ["wet-blocking", "lifeline", "garter-tab"],
    "projectShape": "SHAWL",
    "techniqueDisciplines": ["LACE"]
  },
  "recipeTools": [
    { "slug": "needle-4-mm", "isOptional": false },
    { "slug": "stitch-markers", "isOptional": false },
    { "slug": "blocking-wires", "isOptional": false },
    { "slug": "blocking-pins", "isOptional": false },
    { "slug": "blocking-mat", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "garter-tab", "term": "Garter tab", "definition": "A small strip of garter-stitch worked on a provisional cast-on, then opened up and live stitches picked up around three of its edges, giving a clean centre-back start for a top-down triangle." }
  ],
  "techniqueSlugs": ["provisional-cast-on", "yarn-over", "knit-2-together", "slip-slip-knit", "wet-blocking", "lifeline"],
  "criticalTechniques": ["yarn-over", "knit-2-together", "slip-slip-knit", "wet-blocking"],
  "body": { "type": "doc", "content": [] }
}
```

## Body structure — SHAWL AND WRAP PATTERN

1. **Opening sentence** — name the finished shape, the construction
   direction, the rough wingspan or finished dimensions. Voice
   spec §3.5.
2. **Orientation paragraph** — one paragraph. Construction
   direction, the lace tradition (if any), rough yardage,
   blocked-not-unblocked finished dimensions.
3. **What you need** — `suppliesCard` block. Yarn weight + total
   yardage, needle size (a sentence on why a larger needle than
   standard), stitch markers, tapestry needle, blocking wires and
   pins, blocking mat.
4. **Gauge** — H2 "Gauge". Quote `gaugeText` verbatim. For lace,
   include the pattern-stitch gauge. State that gauge is taken
   blocked.
5. **Stitches used** — H2 "Stitches used". UK and US abbreviations.
6. **Chart key** — H2 "Chart key". When a chart is included, list
   the symbols with their meaning. Reading direction (RS rows
   right to left, WS rows left to right for flat work).
7. **Pattern** — H2 "Pattern":
   - **Cast on** — state the cast-on method and stitch count. For
     garter-tab cast-on, walk through the tab construction.
   - **Set-up rows** — any garter or stockinette setup before the
     lace pattern.
   - **Body** — row-by-row or chart-driven. Lifelines every chart
     repeat. Stitch counts at row ends where they change.
   - **Repeat the chart** — state how many full chart repeats are
     worked.
   - **Edging** — when the shawl has a separately-knitted edging,
     walk through joining or knitted-on edging row-by-row.
   - **Bind off** — stretchy bind-off, named.
8. **Blocking** — H2 "Blocking". Pin out to the dimensions stated
   in `finishedSizeText`. Wires through the edge, pins at the
   points. Cold soak with no-rinse wool wash. Press out water with
   towels. Pin out to dimensions. Leave 24 hours.
9. **Care** — H2 "Care". Cool hand wash, lay flat to dry. Wool
   wash mid-season. Re-block on the same wires if shape softens.
10. **What to try next** — variations or related projects.

## Cast-on and bind-off

See `docs/knitting-scarf-cowl-author.md` for the full enum table.
Shawl-specific notes:
- `PROVISIONAL` cast-on covers garter-tab top-down starts.
- `LONG_TAIL` cast-on for bottom-up triangles at the wingspan.
- `JENYS_SURPRISINGLY_STRETCHY` bind-off for lace — gives the edge
  the give it needs to block flat.
- `RUSSIAN_GRAFT` bind-off for an invisible join across a stole's
  short edges.
- `PICOT` bind-off for a decorative edge on top-down triangles.

## Materials master list

| Shawl type | Yarn weight | Needle | Why |
|---|---|---|---|
| Heirloom Shetland lace | Lace or cobweb wool | 4 mm | Opens dramatically on blocking |
| Estonian lace nupp shawl | Fingering wool | 4 to 4.5 mm | Holds nupps; opens on blocking |
| Faroese shawl | Sport or DK wool | 4.5 mm | Warm enough to wear |
| Half-pi blanket-shawl | Fingering or sport | 4 to 4.5 mm | Drapes |
| Modern semi-solid triangle | Fingering wool | 4 mm | Showcases a hand-dyed skein |
| Garter-stitch wrap | DK or worsted wool | 4.5 to 5 mm | Easy first project |
| Cabled stole | DK or worsted wool | 4 to 5 mm | Crisp cable definition |

## Pipeline-setup population

Read `Category.knitting`:

- `Category.techniqueSlugs[]` → copy relevant.
- `Category.criticalTechniques[]` → `yarn-over`, `knit-2-together`,
  `slip-slip-knit`, `wet-blocking`. For nupps, add
  `nupp-construction`. For garter-tab starts, add `garter-tab` and
  `provisional-cast-on`.
- `Category.aliases[]` → copy relevant.

## Length guidance

| Piece | Word count |
|---|---|
| Garter-stitch beginner triangle | 1,200 – 1,700 |
| Modern semi-solid triangle | 1,500 – 2,100 |
| Faroese shawl | 1,800 – 2,400 |
| Shetland lace shawl with edging | 2,200 – 3,000 |
| Estonian nupp shawl | 2,400 – 3,200 |
| Half-pi blanket-shawl | 2,000 – 2,800 |

Count body prose only.

## Voice rules — hard

Same as `docs/knitting-scarf-cowl-author.md`. Shawl-specific
additions:

- **State that gauge is taken blocked.**
- **Lifelines named** in the body where lace warrants them.
- **Blocking is a section, not a sentence.** Lace shawls aren't
  done until blocked.
- **Charts are charts, not numbered text** when included. Reading
  direction stated in the chart key.
- **No purple prose about lace.** "Opens up on blocking" is a
  description. "Magical transformation" is not.

## Voice rules — soft

- **Show the failed swatch.** Tight lace on a small needle that
  won't open; cobweb yarn that snaps under pinning tension;
  superwash that grows three sizes after blocking and never
  recovers. Name the failure mode.
- **One concrete drape note** — close with "Drapes across the
  shoulders held at the centre back" or "Pins around the
  shoulders with a brooch" rather than marketing language.

## Cultural attribution

Shawls draw heavily on regional traditions. Acknowledge by name:
Shetland lace, Estonian lace (Haapsalu, Orenburg-influence),
Faroese (Faroe Islands), Russian Orenburg, Spanish lace. One
sentence in the orientation paragraph. Do not claim cultural
authority. Sharon Miller's *Heirloom Knitting* and Nancy Bush's
*Knitted Lace of Estonia* are the standard secondary sources;
cite them. Do not reproduce charts that aren't out of copyright.

## Sources

Format: one bullet per source. Acceptable sources:

- **Weldon's Practical Knitter** — Internet Archive. Public domain.
- **Therese de Dillmont, *Encyclopedia of Needlework*** — Project
  Gutenberg #20776.
- **Mary Thomas, *Mary Thomas's Book of Knitting Patterns* (1943)**
  — out of UK copyright.
- **Sharon Miller, *Heirloom Knitting*** — modern; cite as
  secondary reference for Shetland tradition. Do not reproduce
  charts.
- **Nancy Bush, *Knitted Lace of Estonia*** — modern; cite as
  secondary reference for Estonian tradition. Do not reproduce
  charts.

For modern shawl shapes (asymmetric, two-colour cresent, brioche
half-circles) set `sourceType: "SYNTHESISED"`.

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
9. Cast-on count stated for the centre or wingspan, depending on
   shape.
10. Lifelines named where warranted.
11. Blocking is a structured section.
12. Cultural attribution respectful and bounded.
