# Needlework / Blackwork authoring

Canonical input for any worker session that drafts a tutorial under
`needlework/blackwork`. Blackwork is counted-thread geometric repeating
patterns worked on evenweave fabric, traditionally in black silk on
white linen. The patterns tile within an outline shape; density varies
to give the impression of shade. Tudor and Elizabethan origin in
England; descended from Iberian and Moorish counted geometric
embroidery.

## Status

`SubCategory.autopilotEnabled = true` for `needlework/blackwork`.

## Studio archetype

Counted grid (chart engine, shared with cross-stitch). Renders
blackwork patterns from `gridData` JSON on `NeedleworkPattern`.

## Pre-read (MANDATORY)

- `docs/voice-spec-2026-05-21.md` §3.4 (craft technique) for STITCH,
  §3.5 (craft project) for PATTERN.
- `docs/voice-spec-quick-reference.md` 10-point self-critique in §5.
- `feedback_homemade_voice.md`, `docs/common-issues.md`,
  `docs/needlework-anti-tells.md`.

## Voice register

Mary Berry, Erin Boyle, Barbara O'Neill, Martha Stewart. Plain spoken,
UK English, grade 6-8.

Cultural register: Tudor and Elizabethan origin handled lightly, not
academically. One short bullet in the Sources block names the lineage;
the body does not give a history lecture. No "ancient art of", no
"throughout history".

**Banned phrasing:**

- "Perfect for", "ideal for", "fine for almost everyone".
- "Throughout history blackwork has been..." or any ceremonial register.
- Em dashes and en dashes anywhere.

## Stitch and motif vocabulary

Blackwork patterns combine:

- **Outline stitches.** Back stitch (the primary outline workhorse),
  Holbein stitch (double-running, reversible, traditional for blackwork
  borders), running stitch.
- **Fill patterns.** Geometric repeats worked over a counted grid: small
  diamonds, eight-point stars, lozenges, four-square repeats, brick
  motifs, lattice fills, half-drop repeats, all-over fills.
- **Border designs.** Sampler bands, foliate borders, geometric strap
  work.

A blackwork PATTERN body usually describes the outline shape, names the
fill pattern by family, and provides the chart inline (the chart engine
handles cell rendering).

## Critical techniques

- `mounting-fabric-in-hoop`
- `tying-off-cleanly`
- `reading-a-counted-chart`
- `holbein-stitch` (when the pattern uses double-running for
  reversibility)
- `back-stitch`

## Materials master list

- **Thread:** `dmc-stranded-cotton` (one or two strands), `coton-a-broder`,
  `embroidery-silk` (traditional), `dmc-perle-cotton-8` for heavier
  fills.
- **Fabric:** `evenweave-25`, `evenweave-28`, `linen-32`, `linen-36`.
  Lighter ground colours show off the black work; cream and white are
  conventional.
- **Needles:** `tapestry-needle-26`, `tapestry-needle-28` for fine
  counts.
- **Hoops:** `embroidery-hoop-6`, `embroidery-hoop-8`,
  `embroidery-hoop-10`.
- **Cutting:** `embroidery-scissors`.
- **Light:** `daylight-task-lamp`, `magnifier-loupe` for 32-count and
  finer.

## Reversibility note

Traditional blackwork was reversible (worked in Holbein stitch so the
back of the cloth looked as good as the front). Mention this in PATTERN
entries that follow the traditional approach. Modern blackwork often
uses back stitch and is not reversible; either path is acceptable; the
body names which path the tutorial follows.

## Input contract (the brief)

- `title`, `slug`, `type` (`STITCH` / `PATTERN` / `READING`).
- `subCategorySlug`: always `blackwork`.
- `craftStitchSlugs`: required.
- `craftTechniqueTags`: free-form (`holbein-stitch`, `reversible`,
  `geometric-fill`, `lattice-fill`).
- `primaryFabricSlug`: required for PATTERN (typically `evenweave-28`).
- `chartDefinition`: optional. JSON matching the
  `CrossStitchChart` shape in
  `apps/web/src/lib/chart-renderers/cross-stitch.ts` for charted
  patterns.
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
  "subCategorySlug": "blackwork",
  "difficulty": "INTERMEDIATE",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "sewing": {
    "craftType": "needlework",
    "projectShape": "unconstructed",
    "requiredFabricTypes": ["evenweave-28"],
    "requiredNotions": ["dmc-stranded-cotton"],
    "sewingMethod": "hand",
    "finishedDimensionsCm": "9 by 13 cm",
    "bodyMeasurementsRequired": false
  },
  "recipeTools": [
    { "slug": "tapestry-needle-26", "isOptional": false },
    { "slug": "embroidery-hoop-8", "isOptional": false },
    { "slug": "embroidery-scissors", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "holbein-stitch", "term": "Holbein stitch", "definition": "Double-running stitch worked along a counted path; identical on both sides of the cloth. The traditional outline stitch for reversible blackwork." }
  ],
  "techniqueSlugs": ["reading-a-counted-chart", "holbein-stitch"],
  "criticalTechniques": ["reading-a-counted-chart"],
  "body": { "type": "doc", "content": [ ] }
}
```

Rules:

- Every text leaf has `"type": "text"`.
- `glossaryTooltip` marks use `attrs.termSlug`, not `slug`.
- Every `techniqueSlugs[]` entry wrapped inline with `techniqueLink`.
- `criticalTechniques[]` is a subset of `techniqueSlugs[]`.
- No image generation.

## Body shape

### STITCH

1. **Opening paragraph (secret in first sentence).** Name the stitch
   plainly, say what it is for in blackwork, name what is hard.
2. **What you need** (`suppliesCard`).
3. **Working a practice piece** (H2). Numbered `orderedList`. Name the
   path of the needle through the grid (over how many threads, in which
   direction, where the next stitch starts).
4. **The chart symbol** (when the stitch appears on the chart). One
   cell example.
5. **Common mistakes** (`troubleshooter`).

### PATTERN

1. **Opening paragraph.** Finished piece, fabric and count, finished
   size, design count in stitches, palette (almost always one colour
   for traditional blackwork; modern variants may use two).
2. **What you need** (`suppliesCard`). Cloth (count specified), thread
   (strand count specified, colour by plain-English name plus DMC and
   Anchor cross-reference), needle, hoop, scissors, light.
3. **Working method** (H2). Centre-out for symmetric designs, top-left
   for asymmetric. Strand count (one for 32-count, two for 28-count).
4. **Chart** (H2). Insert the chart block. Below it, one short
   paragraph on how to read it: bold rules every 10 stitches help keep
   count.
5. **Working the piece** (H2). For traditional reversible work, name
   the Holbein-stitch double-running path explicitly.
6. **Finishing** (H2). Wash, press, mount.
7. **What to try next** (short H2).

### READING

Long-form orientation: how blackwork fill patterns relate to outline
shapes; how to choose a fill density; how to design a sampler band.

## Cultural lineage (Sources block only)

Tudor English origin, descended from Iberian and Moorish counted
embroidery. Catherine of Aragon is sometimes credited with popularising
the technique in England. The Sources block names this lineage in one
or two bullets; the body does not.

## Image policy

NEVER generate images. Drafts ship with `hero` unset.

## Sources (canonical set)

- Therese de Dillmont, *Encyclopaedia of Needlework* (1886). Project
  Gutenberg #20776. Counted embroidery chapter.
- Caulfeild and Saward, *Dictionary of Needlework* (1882). Holbein
  stitch entry.
- Weldon's Practical Needlework series (1880s to 1900s). Strong on
  blackwork samplers.
- Mrs Beeton, *Book of Needlework* (1870). Project Gutenberg #16746.

Format: one bullet per source, plain prose.

## Length guidance

| Entry type | Word count |
|---|---|
| STITCH (Holbein, back stitch in blackwork context) | 600 to 1,000 |
| PATTERN (small motif) | 1,000 to 1,500 |
| PATTERN (sampler band) | 1,500 to 2,200 |
| READING (short) | 700 to 1,200 |
| READING (long) | 1,500 to 2,500 |

## Self-critique pass

1. Opening sentence states the piece or stitch in plain English.
2. No em dashes or en dashes anywhere.
3. Sequential instructions are `orderedList`.
4. Every glossary term used inline with `glossaryTooltip` and
   `attrs.termSlug`.
5. Every `techniqueSlugs[]` entry wrapped inline with `techniqueLink`.
6. Every text leaf has `"type": "text"`.
7. Materials reference canonical slugs.
8. UK English throughout.
9. Tudor / Elizabethan history (if mentioned) lives in Sources, not
   body. Body opens with the cloth and the stitch.
10. Sources are public-domain only.

## See also

- [needlework-foundations-author.md](needlework-foundations-author.md)
- [needlework-author.md](needlework-author.md)
- [docs/voice-spec-2026-05-21.md](voice-spec-2026-05-21.md) §3.4, §3.5.
