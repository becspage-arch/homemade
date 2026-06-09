# Needlework / Candlewicking authoring

Canonical input for any worker session that drafts a tutorial under
`needlework/candlewicking`. Candlewicking is white-on-white surface
embroidery worked in heavy cotton thread on muslin or candlewick fabric.
American colonial in origin, often used for bedspreads, table linens,
nursery pieces, and christening robes.

## Status

`SubCategory.autopilotEnabled = true` for `needlework/candlewicking`.

## Studio archetype

Surface vector (SVG canvas with region-annotation side panel).

## Pre-read (MANDATORY)

- `docs/voice-spec-2026-05-21.md` §3.4 (technique), §3.5 (project).
- `docs/voice-spec-quick-reference.md` 10-point self-critique.
- `feedback_homemade_voice.md`, `docs/common-issues.md`,
  `docs/needlework-anti-tells.md`.

## Voice register

Mary Berry, Erin Boyle, Barbara O'Neill, Martha Stewart. Calm,
domestic, plain spoken. UK English. Grade 6-8.

The candlewicking register suits a quiet domestic register. The pieces
are heirloom-leaning: nursery covers, dressing-table runners, christening
gowns, household linens. The prose stays factual; no sentimental
register, no "treasured heirloom" framing.

**Banned phrasing:**

- "Treasured heirloom", "heirloom-quality", "passed down through
  generations".
- "Perfect for", "ideal for".
- Em dashes and en dashes anywhere.

## Stitch vocabulary

Candlewicking uses a small, focused stitch set:

- **Colonial knot.** The signature stitch. Wraps the thread once around
  the needle in a figure-eight; sits proud of the cloth.
- **French knot.** Similar but wraps twice or three times; sits flatter
  than a colonial knot.
- **Stem stitch.** Outlines.
- **Satin stitch.** Solid fills.
- **Padded satin.** Raised solid fills.
- **Bullion knot.** Long wrapped knot for stem and petal shapes.
- **Back stitch.** Outlines.
- **Running stitch.** Light decorative line.

Add new stitches to `packages/db/scripts/data/stitches.ts` if needed;
do not invent slugs.

## Critical techniques

- `mounting-fabric-in-hoop`
- `tying-off-cleanly`
- `transferring-patterns`
- `colonial-knot`
- `padded-satin`

## Materials master list

- **Thread:** `dmc-perle-cotton-5` (heavier; traditional), or
  `dmc-perle-cotton-8` for finer work. `coton-a-broder` as an
  alternative. Traditional candlewicking is white-on-white; the
  modern variant may use a colour-on-cream palette.
- **Fabric:** `candlewick-fabric` (heavy cotton muslin, canonical),
  `cotton-muslin`, `linen-32` for finer modern variants.
- **Needles:** `chenille-needle-22`, `chenille-needle-24` (large eye,
  sharp point, accommodates the perle cotton).
- **Hoops:** `embroidery-hoop-8`, `embroidery-hoop-10`,
  `embroidery-hoop-12`, `q-snap-frame` for larger pieces.
- **Cutting:** `embroidery-scissors`.
- **Transfer:** `water-soluble-pen`, `dressmakers-carbon`, `light-box`,
  `prick-and-pounce-kit`.

## Input contract (the brief)

- `title`, `slug`, `type` (`STITCH` / `PATTERN` / `READING`).
- `subCategorySlug`: always `candlewicking`.
- `craftStitchSlugs`: required.
- `craftTechniqueTags`: free-form (`colonial-knot`, `padded-satin`,
  `white-on-white`).
- `primaryFabricSlug`: typically `candlewick-fabric` or
  `cotton-muslin`.
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
  "subCategorySlug": "candlewicking",
  "difficulty": "BEGINNER",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "sewing": {
    "craftType": "needlework",
    "projectShape": "unconstructed",
    "requiredFabricTypes": ["candlewick-fabric"],
    "requiredNotions": ["dmc-perle-cotton-5"],
    "sewingMethod": "hand",
    "finishedDimensionsCm": "30 by 30 cm",
    "bodyMeasurementsRequired": false
  },
  "recipeTools": [
    { "slug": "chenille-needle-22", "isOptional": false },
    { "slug": "embroidery-hoop-10", "isOptional": false },
    { "slug": "embroidery-scissors", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "colonial-knot", "term": "Colonial knot", "definition": "A figure-eight wrap of thread around the needle that sits proud of the cloth. The signature stitch of American colonial candlewicking." }
  ],
  "techniqueSlugs": ["transferring-patterns", "colonial-knot"],
  "criticalTechniques": ["colonial-knot"],
  "body": { "type": "doc", "content": [ ] }
}
```

Rules:

- Every text leaf has `"type": "text"`.
- `glossaryTooltip` marks use `attrs.termSlug`.
- Every `techniqueSlugs[]` entry wrapped inline with `techniqueLink`.
- `criticalTechniques[]` is a subset of `techniqueSlugs[]`.
- No image generation.

## Body shape

### STITCH

1. **Opening paragraph (secret in first sentence).** Name the stitch.
   State what it is for in candlewicking, how it sits (proud or flat),
   what makes it work.
2. **What you need** (`suppliesCard`).
3. **Working a practice piece** (H2). Numbered `orderedList`. Name the
   wrap, the pull, the finish.
4. **Common mistakes** (`troubleshooter`).
5. **What it underpins** (short H2).

### PATTERN

1. **Opening paragraph.** Finished piece (table runner, nursery pillow,
   dressing-table mat). Fabric and thread. Finished size. The stitches
   in the design (usually 2 to 4 stitch types). The colour scheme
   (white-on-white or single-colour-on-cream).
2. **What you need** (`suppliesCard`).
3. **Transferring the design** (H2). Brief plain-English description;
   reference the foundations transfer tutorial inline.
4. **Stitches used** (H2). Short list with `techniqueLink` marks.
5. **Working the piece** (H2). Numbered `orderedList`. Order matters:
   outline first, then fill, then knots.
6. **Finishing** (H2). Hand wash in cool water with a gentle soap.
   Roll between towels. Press face-down on a soft towel.
7. **What to try next** (short H2).

### READING

Foundations-style readings: white-on-white technique, choosing the
fabric weight, how candlewicking sits in the broader American colonial
needlework tradition.

## Image policy

NEVER generate images. Drafts ship with `hero` unset. The image worker
sources candlewicking heroes from public-domain American colonial
needlework archives and verifies the piece shows the raised knot work
characteristic of the discipline.

## Sources (canonical set)

- Therese de Dillmont, *Encyclopaedia of Needlework* (1886). Project
  Gutenberg #20776. White work and colonial knot context.
- Caulfeild and Saward, *Dictionary of Needlework* (1882). Knot stitch
  entries.
- Weldon's Practical Needlework series (1880s to 1900s). White work
  and knot work coverage.
- Mrs Beeton, *Book of Needlework* (1870). Project Gutenberg #16746.
  Household linen patterns.
- Public-domain American colonial needlework archives (Cooper Hewitt
  digitised collections where PD-cleared).

Format: one bullet per source, plain prose.

## Length guidance

| Entry type | Word count |
|---|---|
| STITCH (colonial knot, padded satin) | 600 to 1,000 |
| PATTERN (small motif, runner) | 1,000 to 1,500 |
| PATTERN (bedspread, christening gown) | 1,500 to 2,500 |
| READING (short) | 700 to 1,200 |
| READING (long) | 1,500 to 2,500 |

## Self-critique pass

1. Opening sentence states the piece in plain English.
2. No em dashes or en dashes anywhere.
3. No "heirloom-quality", "treasured", or sentimental register.
4. Sequential instructions are `orderedList`.
5. Every glossary term used inline with `glossaryTooltip` and
   `attrs.termSlug`.
6. Every `techniqueSlugs[]` entry wrapped inline with `techniqueLink`.
7. Every text leaf has `"type": "text"`.
8. Materials reference canonical slugs.
9. UK English throughout.
10. Sources are public-domain only.

## See also

- [needlework-foundations-author.md](needlework-foundations-author.md)
- [needlework-surface-embroidery-author.md](needlework-surface-embroidery-author.md)
- [needlework-author.md](needlework-author.md)
- [docs/voice-spec-2026-05-21.md](voice-spec-2026-05-21.md) §3.4, §3.5.
