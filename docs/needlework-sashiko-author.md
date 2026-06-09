# Needlework / Sashiko authoring

Canonical input for any worker session that drafts a tutorial under
`needlework/sashiko`. Sashiko is Japanese running-stitch embroidery,
traditionally white cotton thread on indigo cotton cloth, worked on a
counted grid to make geometric repeating patterns. The craft is
functional in origin (reinforcing and insulating worn cloth in the
Tohoku working tradition of northern Japan) and decorative in modern
practice.

## Status

`SubCategory.autopilotEnabled = true` for `needlework/sashiko`.

## Studio archetype

Counted grid or route diagram. Hitomezashi (single-line / row-by-row
counted) renders from `gridData`; moyozashi (pattern stitching following
a marked-up curve or motif) renders from `vectorData` with route
annotations.

## Pre-read (MANDATORY)

- `docs/voice-spec-2026-05-21.md` §3.4, §3.5.
- `docs/voice-spec-quick-reference.md`.
- `feedback_homemade_voice.md`, `docs/common-issues.md`,
  `docs/needlework-anti-tells.md`.

## Cultural attribution (READ THIS FIRST)

Sashiko comes from the Tohoku working tradition in northern Japan. It
was made to reinforce and insulate worn cloth: jackets, work coats, fire
coats, gloves. The patterns are regional and named (asanoha, shippo,
seigaiha, kasuri, kaki-no-hana, nowaki, jujizashi).

**Voice rules for sashiko:**

- Acknowledge Japanese origin clearly. One short line in the opening
  paragraph names the tradition; the Sources block names the regional
  lineage.
- Never claim cultural authority Homemade does not have. No "the soul
  of", "the spirit of", "the way of". No "meditative ancient practice".
- No "fusion", no "modern twist", no "reimagined" framing.
- Pattern names are the Japanese names. Romanise them (asanoha, not
  hemp leaf) and include a short plain-English gloss in parentheses on
  first use: "asanoha (hemp leaf)". After the first use, use the
  Japanese name.
- Treat the craft as practical and functional first. The reader is
  making something useful; the decoration grew out of that.
- Do not write a history lecture in the body. One short bullet in the
  Sources block names the lineage.

**Banned phrasing for sashiko (extra-strict):**

- "Ancient wisdom", "ancient art", "soul of Japan", "essence of".
- "Mindful practice", "meditative tradition" (the craft was working
  people's mending work; the modern meditative framing is a Western
  retro-fit and we do not lean on it).
- Em dashes and en dashes anywhere.

## Stitch vocabulary

Sashiko uses one stitch: a long running stitch worked over a counted
grid. The variations are in pattern, not in stitch type:

- **Hitomezashi.** Single-line counted patterns where the stitching
  follows alternating rows. Asanoha, juuji-tsunagi, kasane-jujizashi.
- **Moyozashi.** Pattern stitching that follows a transferred shape
  (curve, motif, circle). Seigaiha (overlapping waves), shippo
  (interlocking circles), nowaki (autumn grass), kaki-no-hana
  (persimmon flower).
- **Kogin.** Northern variant worked over odd numbers of threads with
  thicker thread, denser fills.

## Critical techniques

- `mounting-fabric-in-hoop` (or working without a hoop, which is more
  traditional).
- `tying-off-cleanly`
- `reading-a-counted-chart`
- `running-stitch`
- `transferring-patterns` (for moyozashi)

## Materials master list

- **Thread:** `sashiko-ito` (canonical), `dmc-perle-cotton-8` as a
  substitute, `coton-a-broder`. Traditional white thread on indigo
  cloth; modern variants use coloured sashiko thread on natural cotton.
- **Fabric:** `indigo-cotton` (canonical), `cotton-muslin`,
  `cotton-shirting`. Loosely-woven cotton sits a sashiko stitch better
  than tightly-woven.
- **Needles:** `sashiko-needle` (longer than embroidery needles; allows
  loading multiple stitches at once before pulling through).
- **Hoops:** Traditional sashiko works without a hoop; the cloth is
  pinched and rolled in the hands. A hoop is optional and modern.
- **Cutting:** `embroidery-scissors`, `thread-snippers`.
- **Transfer (moyozashi):** `water-soluble-pen`, `dressmakers-carbon`,
  `light-box`.

## Stitch length and spacing

A traditional sashiko stitch:

- Sits longer on the front than on the back. A typical ratio is 3 to 2
  or 2 to 1 (front to back).
- Spaces consistently across the grid. A common length is 4 mm to 6 mm
  front, with the gap roughly half the front stitch length.
- Runs straight along a counted column or row; the rhythm is steady.

The body says this once in plain English and shows it in the worked
example. The chart engine handles cell rendering for counted variants.

## Input contract (the brief)

- `title`, `slug`, `type` (`STITCH` / `PATTERN` / `READING`).
- `subCategorySlug`: always `sashiko`.
- `craftStitchSlugs`: required.
- `craftTechniqueTags`: free-form (`hitomezashi`, `moyozashi`, `kogin`,
  `asanoha`, `seigaiha`, `shippo`).
- `primaryFabricSlug`: typically `indigo-cotton`.
- `chartDefinition`: for hitomezashi patterns.
- `difficulty`, `finishedSizeText`, `targetWordCount`, `sources`.

## Output contract (TutorialUploadInput)

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary>",
  "type": "PATTERN",
  "categorySlug": "needlework",
  "subCategorySlug": "sashiko",
  "difficulty": "BEGINNER",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "sewing": {
    "craftType": "needlework",
    "projectShape": "unconstructed",
    "requiredFabricTypes": ["indigo-cotton"],
    "requiredNotions": ["sashiko-ito"],
    "sewingMethod": "hand",
    "finishedDimensionsCm": "20 by 20 cm",
    "bodyMeasurementsRequired": false
  },
  "recipeTools": [
    { "slug": "sashiko-needle", "isOptional": false },
    { "slug": "embroidery-scissors", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "asanoha", "term": "Asanoha", "definition": "Hemp leaf pattern; a six-point star repeated across a grid. One of the most common sashiko motifs." }
  ],
  "techniqueSlugs": ["reading-a-counted-chart", "running-stitch"],
  "criticalTechniques": ["running-stitch"],
  "body": { "type": "doc", "content": [ ] }
}
```

Rules:

- Every text leaf has `"type": "text"`.
- `glossaryTooltip` marks use `attrs.termSlug`.
- Romanised Japanese pattern names get a plain-English gloss on first
  use, then stand alone.
- No image generation.

## Body shape

### STITCH

Sashiko STITCH entries are rare (there is really one stitch). When they
exist, they cover length and rhythm, or kogin-specific variants.

1. **Opening paragraph.** Name the stitch family. State the function,
   the rhythm, the look.
2. **What you need** (`suppliesCard`).
3. **Working a practice piece** (H2). Numbered `orderedList`. Name the
   stitch length, the gap, the loading-and-pull method (sashiko works
   in batches: load several stitches on the needle, then pull through).
4. **Common mistakes** (`troubleshooter`). Uneven length, drift across
   the grid, thread tension that gathers the cloth.

### PATTERN

1. **Opening paragraph.** Name the pattern (asanoha, seigaiha, etc.)
   with a plain-English gloss on first use. State the fabric, the
   thread, the finished size, the design rhythm. One short factual line
   on the regional origin: "from the Tohoku working tradition in
   northern Japan". No history lecture.
2. **What you need** (`suppliesCard`).
3. **Marking the grid or motif** (H2). For hitomezashi: a counted grid
   marked with chalk or a water-soluble pen, or worked directly on
   evenweave indigo. For moyozashi: transfer the motif.
4. **Working method** (H2). Stitch length, gap, loading rhythm,
   direction (typical sashiko runs row by row in one direction, then
   the next row, building the pattern as repeating bands).
5. **Chart or route diagram** (H2). The chart for hitomezashi, the
   route for moyozashi.
6. **Working the piece** (H2). Numbered `orderedList`.
7. **Finishing** (H2). Hand wash in cool water; the indigo may bleed
   for the first few washes (mention this practically, not as warning).
   Press face-down on a soft towel.
8. **What to try next** (short H2). Two or three suggestions.

### READING

Foundations-style readings that fit under sashiko (rather than under
needlework foundations): the regional origin and pattern names; choosing
fabric and thread for sashiko; how the loading-and-pull rhythm differs
from Western running stitch.

## Image policy

NEVER generate images. Drafts ship with `hero` unset. The image worker
sources sashiko hero imagery from public-domain Japanese print
collections (V&A, Cooper Hewitt, Japanese museum archives) and verifies
the image is sashiko, not kantha, embroidery, or quilting.

## Sources (canonical set)

- Therese de Dillmont, *Encyclopaedia of Needlework* (1886). Project
  Gutenberg #20776. Limited Japanese coverage; useful for general
  counted technique.
- Public-domain Japanese pattern archives (Wikimedia Commons for older
  prints; Japanese museum digitised collections where available).
- Where contemporary work is referenced (Takako Sudo, Nihon Vogue
  publishers), cite the original Japanese-language publication where
  the English translation is not yet PD.

Format: one bullet per source, plain prose. Name the regional lineage
in one bullet ("from the Tohoku working tradition, northern Japan").

## Length guidance

| Entry type | Word count |
|---|---|
| STITCH (rhythm and length) | 600 to 900 |
| PATTERN (hitomezashi small motif) | 1,000 to 1,500 |
| PATTERN (moyozashi sampler or panel) | 1,500 to 2,200 |
| READING (regional origin and pattern names) | 1,000 to 1,800 |

## Self-critique pass

1. Opening sentence states the pattern in plain English with one
   factual cultural attribution. No ceremony register.
2. No "ancient", "soul of", "meditative" framing.
3. Pattern names romanised correctly with first-use gloss.
4. No "fusion", "modern twist", "reimagined".
5. No em dashes or en dashes anywhere.
6. Sequential instructions are `orderedList`.
7. Every glossary term used inline with `glossaryTooltip` and
   `attrs.termSlug`.
8. Every `techniqueSlugs[]` entry wrapped inline with `techniqueLink`.
9. Every text leaf has `"type": "text"`.
10. Sources name the regional lineage in one bullet; body does not
    deliver a history lecture.

## See also

- [needlework-foundations-author.md](needlework-foundations-author.md)
- [needlework-author.md](needlework-author.md)
- [docs/voice-spec-2026-05-21.md](voice-spec-2026-05-21.md) §3.4, §3.5.
