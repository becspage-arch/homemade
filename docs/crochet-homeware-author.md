# Crochet homeware authoring — worker prompt template

## Voice — MANDATORY pre-read

Before drafting any homeware pattern, read
`docs/voice-spec-quick-reference.md` end-to-end and re-read
`docs/voice-spec-2026-05-21.md` §3.5 (craft project). The opening-
paragraph register is the bar every crochet pattern is measured
against.

The voice draws on Pauline Turner, Edie Eckman, Therese de Dillmont,
and Weldon's Practical Crochet. Mary Berry / Alice Waters / Florence
White set the register from the cooking template: a real maker
telling another what they make.

The locked opening pattern: every homeware tutorial opens with one
sentence naming the finished piece, what it's for, and how big it
is. Voice spec §3.5 worked rewrite is the template.

## Image policy — DO NOT GENERATE IMAGES

Authoring NEVER generates images. Set `hero` unset on every draft.
See `memory/feedback_image_strategy.md`.

When a homeware pattern includes a `chartData` block (motif-style
panels, repeating blanket squares, mandala-style tablecloths), the
in-house chart engine at `apps/web/src/lib/crochet/renderer/` can
render the hero from chartData. Run
`pnpm --filter "@homemade/db" exec tsx scripts/render-crochet-motif-heroes.ts --confirm`
after upload. Authors populate chartData; the renderer produces the
hero.

## Inline glossary coverage — HARD RULE

Every entry in `glossaryTerms[]` appears inline at least once
wrapped in a `glossaryTooltip` mark with `termSlug` set. See
`memory/feedback_inline_glossary_coverage.md` +
`memory/feedback_glossary_tooltip_termslug.md`.

---

Canonical input for any autopilot fire that drafts a Crochet HOMEWARE
pattern. Covers blankets and throws, baskets, dishcloths and
washcloths, table runners, placemats, cushion covers, plant hangers,
hot pads, coasters, hanging organisers, rugs, decorative pillows.
Sub-category is `homewares`.

**Prompt version:** 1 (Crochet autopilot foundation — 2026-06-09).
Bump on iteration.

## How a drafting session uses this file

A Crochet homeware worker does six things:

1. Reads this file, `docs/voice-editor-prompt.md`,
   `docs/common-issues.md`, `docs/crochet-anti-tells.md`, and the
   brief (one homeware pattern at a time).
2. Looks up every stitch in `packages/db/scripts/data/stitches.ts`
   and every yarn / hook in `data/yarn-weights.ts` /
   `data/crochet-hooks.ts`. Never invent a slug.
3. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput`
   with `type = "PATTERN"`.
4. Self-critiques against the voice rules and the homeware-specific
   sizing logic.
5. Walks `docs/common-issues.md` and `docs/crochet-anti-tells.md`.
6. Writes the brief return.

The deterministic `voice-check` CLI is the upload gate.

## Input contract — the brief

- `title` — the finished piece, e.g. "Striped baby blanket" or
  "Cotton dishcloth — the workhorse".
- `slug` — URL slug.
- `type` — always `PATTERN`.
- `subCategorySlug` — always `homewares`.
- `homewareType` — `BLANKET` | `THROW` | `BASKET` | `DISHCLOTH` |
  `WASHCLOTH` | `TABLE_RUNNER` | `PLACEMAT` | `CUSHION` |
  `PLANT_HANGER` | `HOT_PAD` | `COASTER` | `RUG` | `HANGING_ORGANISER`.
- `constructionShape` — how the piece is built. Common patterns:
  `SINGLE_PANEL` (rectangle worked back and forth), `MOTIF_JOINED`
  (multiple motifs joined), `WORKED_IN_THE_ROUND` (basket, rug),
  `T_SHAPE` (cushion cover with a top panel + side panels).
- `roughDimensionsCm` — target finished dimensions, e.g.
  `{ width: 90, length: 110 }` for a baby blanket.
- `repeatBlock` — for modular pieces, the single repeat the reader
  works N times. Worked-out for one repeat in the body; the pattern
  states the repeat count for each finished size.
- `craftStitchSlugs` — every stitch used.
- `craftTechniqueTags` — free-form (`joining-as-you-go`, `working-
  in-the-round`, `colour-change`, `working-into-the-bottom-loop`,
  `surface-crochet`).
- `primaryYarnWeightSlug` — required. Common: `dk` for blankets and
  cushions, `worsted` for baskets and rugs, `aran` or `chunky` for
  throws and hot pads.
- `primaryHookSlug` — required. Match the yarn weight.
- `terminologyConvention` — `uk` (default) or `us`.
- `gaugeText` — required. Plain text including stitches, rows,
  10 cm × 10 cm, hook size, blocked or unblocked.
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
  "categorySlug": "crochet",
  "subCategorySlug": "homewares",
  "difficulty": "BEGINNER",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "crochet": {
    "primaryYarnWeightSlug": "dk",
    "primaryHookSlug": "crochet-hook-4-0mm",
    "gaugeText": "16 dc × 8 rows = 10 × 10 cm in DK cotton with a 4 mm hook, unblocked.",
    "finishedSizeText": "Baby blanket — 90 × 110 cm.",
    "terminologyConvention": "uk",
    "craftStitchSlugs": ["crochet-chain", "crochet-double-crochet", "crochet-treble"],
    "craftTechniqueTags": ["colour-change", "weaving-in-ends"]
  },
  "recipeTools": [
    { "slug": "crochet-hook-4-0mm", "isOptional": false },
    { "slug": "tapestry-needle", "isOptional": false },
    { "slug": "craft-scissors", "isOptional": false },
    { "slug": "measuring-tape", "isOptional": false },
    { "slug": "blocking-mat", "isOptional": true },
    { "slug": "blocking-pins", "isOptional": true }
  ],
  "glossaryTerms": [
    { "slug": "weaving-in-ends", "term": "Weaving in ends", "definition": "Threading yarn tails through nearby stitches with a tapestry needle so the fabric holds without knots showing." }
  ],
  "techniqueSlugs": ["crochet-colour-change", "crochet-weaving-in-ends"],
  "criticalTechniques": ["crochet-foundation-chain", "crochet-double-crochet", "crochet-treble"],
  "body": { "type": "doc", "content": [ … ] }
}
```

Rules:

- `categorySlug` is always `"crochet"`.
- `subCategorySlug` is always `"homewares"`.
- `type` is always `PATTERN`.
- `crochet.primaryYarnWeightSlug`, `primaryHookSlug`, `gaugeText`,
  `finishedSizeText` are required.
- `crochet.chartDefinition` is optional for homewares — most
  homewares read better as written instructions. Use a chart only
  for textured-stitch repeats over a multi-row pattern or for
  motif-joined pieces.
- `license` defaults to `LIBRARY_FREE`.

## Body structure — HOMEWARE PATTERN

1. **Opening sentence** — name the finished piece, what it's for,
   how big it is. Voice spec §3.5.
2. **Orientation paragraph** — one paragraph. Construction direction
   (worked back and forth, in the round, motif-joined), the rough
   yardage estimate, and one practical line on where the piece
   sits in the home.
3. **What you need** — `suppliesCard` block. Yarn weight + total
   grams (with a clear "for the size shown" note), hook size,
   tapestry needle, scissors, measuring tape, blocking mat + pins
   if blocking is appropriate.
4. **Gauge** — H2 "Gauge". Quote `gaugeText` verbatim, then one
   sentence on how to swatch. For homewares, gauge drift between
   maker and pattern is the difference between a "baby blanket" and
   a "small dog blanket". Don't skip.
5. **Stitches used** — H2 "Stitches used". Stitch name + UK and US
   abbreviation in brackets. Every `craftStitchSlugs` entry shows up.
6. **Pattern** — H2 "Pattern". For modular pieces (motif-joined,
   single-repeat × N rows), break into:
   - **Single repeat** — work out one full repeat of the pattern
     with stitch counts at row ends.
   - **For the size shown** — repeat N times. Name the row count to
     hit the finished dimension at the stated gauge.
   - **For larger / smaller** — one short paragraph on adjusting.
     "For a single-bed throw, repeat 60 times for a 180 × 100 cm
     finished piece in DK cotton."
   For single-panel pieces (rectangle in one stitch worked back and
   forth), the **Pattern** section gives the foundation chain count,
   the row-by-row, and the row count to hit each finished size.
7. **Joining** — H2 "Joining" if the pattern joins motifs. Methods:
   slip-stitch, single-crochet seam, mattress-stitch seam, join-as-
   you-go on the last round of each motif.
8. **Edging** — H2 "Edging" if the piece has a finished edge.
   Standard edgings: single round of dc, picot edging, crab stitch
   (reverse dc), scalloped edge.
9. **Finishing** — H2 "Finishing". Fastening off, weaving in ends,
   blocking where appropriate. Block cotton with steam; block wool
   wet; block acrylic with spray (heat will kill acrylic).
10. **Care** — H2 "Care". Wash + dry instructions for the fibre.
    Handwash cool, lay flat for wool. Machine wash gentle, tumble
    low for cotton. Cool wash, no tumble for acrylic.
11. **What to try next** — short closing paragraph. Variations
    (different colour palette, change the yarn weight up or down,
    work the pattern in a different motif arrangement) or
    related projects.

## Standard pattern shorthand

UK abbreviations are canonical. See `docs/crochet-technique-author.md`
for the full table.

State the turning chain count at the start of every row in a flat
piece. State chain-3 = first treble at the start of every round
where applicable. Stitch counts at the end of every row and round.

## Materials master list

Same as the technique author prompt. Default by piece type:

| Piece | Yarn weight | Hook | Why |
|---|---|---|---|
| Baby blanket | DK cotton or DK acrylic | 4 mm | Drapes well, washable |
| Adult throw | Aran wool or acrylic | 5 mm | Warmer, faster work |
| Dishcloth | Worsted cotton | 4.5 mm | Absorbent, machine wash hot |
| Washcloth | DK cotton | 4 mm | Gentler on skin |
| Basket | Worsted or aran (Cotton or T-shirt yarn) | 5–6 mm | Holds shape |
| Hot pad | DK or worsted cotton | 4 mm | Heat-safe |
| Plant hanger | Cotton string or macramé cord | 5 mm | Holds weight |
| Rug | T-shirt yarn or chunky cotton | 8–10 mm | Thick, hardwearing |
| Cushion cover | DK cotton or wool blend | 4 mm | Drapes, washable |

Don't pin a brand. State weight + fibre.

## Pipeline-setup population

Read `Category.crochet`:

- `Category.techniqueSlugs[]` — copy the subset this homeware needs
  into the tutorial's `techniqueSlugs[]`.
- `Category.criticalTechniques[]` — copy the must-knows into
  `criticalTechniques[]` (typically the basic stitches the pattern
  uses, plus colour-change for striped pieces, joining-as-you-go
  for motif-joined pieces).
- `Category.aliases[]` — copy relevant aliases.

## Length guidance

| Piece | Word count |
|---|---|
| Simple dishcloth / washcloth / coaster | 800 – 1,200 |
| Hot pad / placemat / small basket | 1,000 – 1,400 |
| Cushion cover / table runner / plant hanger | 1,400 – 1,800 |
| Baby blanket / lap throw / large basket / rug | 1,500 – 2,200 |
| Adult throw / bed runner / large rug | 1,800 – 2,500 |

Count body prose only.

## Voice rules — hard

- **No em or en dashes** in body prose.
- **No academic register.**
- **No marketing language** — no "perfect for", "stunning",
  "must-make", "elevate".
- **UK terminology by default.**
- **Stitch counts at row / round ends.**
- **Turning chain count stated** in every row instruction in a
  flat piece.
- **Gauge isn't optional.** Every homeware states gauge in the
  `gaugeText` field and in the body. Without gauge, the finished
  size is a guess.
- **No yarn-brand endorsement.** Weight + fibre + colour, not brand.
- **No pattern-piracy framing.** Never "free pattern".
- **Glossary terms wrap on first use** with `termSlug`.
- **Text leaves carry `type: text`.**
- **Sizing scales honestly.** When the brief gives one finished
  size, state how to adjust for larger or smaller — don't pretend
  one size fits all rooms.

## Voice rules — soft

- **Show the failed swatch.** Acrylic that goes limp under heat;
  cotton that bleeds the first wash; wool that felts when
  machine-washed — name the failure mode where it's a known bug.
- **One concrete use** — close with "Sits on a 90 × 120 cm cot" or
  "Drapes a two-seater sofa" rather than "perfect for any home".
- **Practical-not-twee.** No "snuggle up", no "cosy corner", no
  "the perfect treat for yourself". Plain English.

## Sources

Format: one bullet per source.

Acceptable sources for homewares:

- **Weldon's Practical Crochet** (1880s–1900s) — household crochet
  is the bulk of Weldon's. Internet Archive.
- **Therese de Dillmont, *Encyclopedia of Needlework* (1886)** —
  edgings, doily centres, table-piece motifs. Project Gutenberg
  #20776.
- **Beeton's Book of Needlework** (1870) — Victorian household
  pieces.
- **Project Gutenberg Distributed Proofreading** — broad pre-1928
  needlework books.

For modern-only piece types (T-shirt-yarn rugs, macramé-style
plant hangers, granny-stripe blankets), set
`sourceType: "SYNTHESISED"` and cite the closest historical
precedent (Victorian carpet-rug patterns; Victorian hanging-pot
covers; Victorian striped afghans).

## Self-critique pass

1. Em/en dashes — ZERO.
2. Banned phrases — ZERO.
3. UK terminology consistent.
4. Every `craftStitchSlugs` entry exists in the master Stitch
   table and appears in body prose.
5. Every `glossaryTerms[]` entry appears inline wrapped in a
   `glossaryTooltip` with `termSlug` set.
6. Every text leaf has `type: text`.
7. Stitch counts at row / round ends.
8. Turning chain count stated where applicable.
9. `gaugeText` and `finishedSizeText` set; both surfaced in body
   prose.
10. Sizing-up + sizing-down paragraph present for homewares where
    finished dimensions matter (blankets, throws, table runners,
    rugs, cushion covers).
11. Care instructions match the fibre (no machine-wash advice on
    wool; no high-heat advice on acrylic).
12. Sources verifiable.

The deterministic `voice-check` CLI is the final gate.
