# Needlework / Needlepoint authoring

Canonical input for any worker session that drafts a tutorial under
`needlework/needlepoint`. Needlepoint is counted-thread embroidery on
open-weave canvas, where every hole takes a stitch and the ground is
fully covered with thread. Worked in wool, silk, cotton, or pearl
cotton. Can be design-led (hand-painted canvas) or chart-led.

## Status

`SubCategory.autopilotEnabled = true` for `needlework/needlepoint`.

## Studio archetype

Counted grid (chart engine, shared with cross-stitch and blackwork).

## Pre-read (MANDATORY)

- `docs/voice-spec-2026-05-21.md` §3.4, §3.5.
- `docs/voice-spec-quick-reference.md` 10-point self-critique.
- `feedback_homemade_voice.md`, `docs/common-issues.md`,
  `docs/needlework-anti-tells.md`.

## Voice register

Mary Berry, Erin Boyle, Barbara O'Neill, Martha Stewart. UK English.
Grade 6-8. Calm, instructional.

**Banned phrasing:**

- "Perfect for", "ideal for".
- "Quick", "easy", "simple" without qualification.
- Em dashes and en dashes anywhere.

## Stitch vocabulary

Needlepoint stitch families:

- **Basic tent stitch family.** Continental, basketweave, half-cross.
  Continental works diagonally and pulls the canvas; basketweave works
  in diagonal rows that distribute tension; half-cross uses less yarn
  but has lower coverage on the back.
- **Diagonal stitches.** Slanted gobelin (over two threads), oblique
  slav, encroaching slanted gobelin.
- **Straight stitches.** Gobelin (over two or three threads), brick
  stitch, Hungarian stitch, Hungarian variation.
- **Composite blocks.** Mosaic, Scotch, cashmere, jacquard.
- **Long-stitch families.** Bargello / Florentine (zigzag patterns
  worked over four or six threads in straight stitches), brick
  bargello.
- **Decorative.** Rhodes stitch, Smyrna cross, Algerian eye, ray stitch,
  eyelet stitch.

A needlepoint PATTERN body names the stitch families used and tells the
reader which area each one fills.

## Critical techniques

- `mounting-fabric-in-hoop` (or stretching on a frame; needlepoint
  canvas often stretches on a slate frame or scroll frame instead)
- `tying-off-cleanly`
- `reading-a-counted-chart`
- `tent-stitch-continental`
- `tent-stitch-basketweave`
- `choosing-thread` (wool vs silk vs cotton; thread-to-canvas-count
  match)

## Materials master list

- **Thread:** `persian-wool` (canonical for traditional needlepoint;
  separates into three strands), `tapestry-wool` (single-ply, heavier),
  `dmc-perle-cotton-5`, `dmc-perle-cotton-8`, `embroidery-silk`,
  `dmc-stranded-cotton` (full six strands for fine canvas).
- **Canvas:** `needlepoint-canvas-10` (rug-weight), `needlepoint-canvas-13`
  (standard), `needlepoint-canvas-18` (petit point detail). Mono canvas
  for most work; interlock canvas where the count makes mono unstable;
  Penelope canvas where mixed-count work (petit point on a coarser
  background) is wanted.
- **Needles:** `tapestry-needle-18` for 10ct, `tapestry-needle-20` for
  13ct, `tapestry-needle-22` for 18ct.
- **Frames:** `slate-frame`, `scroll-frame`, `embroidery-hoop-10`,
  `embroidery-hoop-12` (smaller pieces only; large canvas needs frame
  tension).
- **Cutting:** `embroidery-scissors`.
- **Light:** `daylight-task-lamp`, `magnifier-loupe` for 18ct petit
  point.

## Painted vs charted canvas

Two distinct paths in needlepoint:

- **Charted needlepoint.** The chart specifies which stitch and which
  colour goes in each canvas hole. The Studio renders these from
  `gridData`. Authoring follows the cross-stitch and blackwork shape.
- **Painted (or hand-painted) canvas.** The canvas itself is printed or
  painted with a colour image at full size. The reader stitches each
  hole in the colour the canvas shows underneath. Stitch choice is the
  reader's; the tutorial may suggest stitch types per area.

A PATTERN body names which path the tutorial follows. Charted is the
default for autopilot authoring; painted-canvas patterns are usually
specialised and may need specialist curation later.

## Input contract (the brief)

- `title`, `slug`, `type` (`STITCH` / `PATTERN` / `READING`).
- `subCategorySlug`: always `needlepoint`.
- `craftStitchSlugs`: required.
- `craftTechniqueTags`: free-form (`continental`, `basketweave`,
  `bargello`, `mosaic-stitch`, `petit-point`).
- `primaryFabricSlug`: typically `needlepoint-canvas-13` for standard
  work.
- `chartDefinition`: the chart with stitch family per region.
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
  "subCategorySlug": "needlepoint",
  "difficulty": "INTERMEDIATE",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "sewing": {
    "craftType": "needlework",
    "projectShape": "unconstructed",
    "requiredFabricTypes": ["needlepoint-canvas-13"],
    "requiredNotions": ["persian-wool"],
    "sewingMethod": "hand",
    "finishedDimensionsCm": "30 by 30 cm",
    "bodyMeasurementsRequired": false
  },
  "recipeTools": [
    { "slug": "tapestry-needle-20", "isOptional": false },
    { "slug": "scroll-frame", "isOptional": false },
    { "slug": "embroidery-scissors", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "basketweave", "term": "Basketweave", "definition": "A tent stitch worked in diagonal rows. The back of the canvas reads as a woven texture; the front matches continental tent. Pulls the canvas less than continental." }
  ],
  "techniqueSlugs": ["reading-a-counted-chart", "tent-stitch-basketweave"],
  "criticalTechniques": ["tent-stitch-basketweave"],
  "body": { "type": "doc", "content": [ ] }
}
```

Rules:

- Every text leaf has `"type": "text"`.
- `glossaryTooltip` marks use `attrs.termSlug`.
- Every `techniqueSlugs[]` entry wrapped inline with `techniqueLink`.
- No image generation.

## Body shape

### STITCH

1. **Opening paragraph (secret in first sentence).** Name the stitch
   family. State the look, the coverage, the use.
2. **What you need** (`suppliesCard`).
3. **Working a practice piece** (H2). Numbered `orderedList`. Path of
   the needle on the front and the back of the canvas; coverage; thread
   amount per square inch (or per cm); whether the stitch pulls or
   distributes tension.
4. **Common mistakes** (`troubleshooter`). Continental pulling the
   canvas off-square is the canonical example.
5. **What it underpins** (short H2).

### PATTERN

1. **Opening paragraph.** Finished piece. Canvas count. Yarn type and
   weight. Finished size. Charted or painted path. Palette count.
2. **What you need** (`suppliesCard`).
3. **Stretching the canvas** (H2). Brief: stretch on a slate or scroll
   frame to keep the canvas square through the work. Reference the
   foundations tutorial.
4. **Stitches used** (H2). Short list with `techniqueLink` marks per
   stitch family.
5. **Working method** (H2). Working order: background last is the
   conventional approach (it lets the design stitches set the canvas
   tension). Name the order explicitly. Strand counts for the chosen
   thread (Persian wool: one strand on 13ct, two strands on 10ct).
6. **Chart** (H2). Insert the chart block. Below it, one short paragraph
   on how to read it: stitch family per region, colour per cell.
7. **Working the piece** (H2). Numbered `orderedList`, stage by stage.
8. **Finishing** (H2). Block the finished canvas on a board (canvas
   often distorts during work; blocking pulls it square). Mount or frame
   per the finished use.
9. **What to try next** (short H2).

### READING

Foundations-style: tent stitch variants compared; choosing a thread for
a canvas count; blocking distorted canvas; mounting and framing.

## Image policy

NEVER generate images. The image worker sources needlepoint heroes from
public-domain pattern archives and verifies the canvas is fully covered
(half-stitched canvas is work-in-progress, not a finished hero).

## Sources (canonical set)

- Therese de Dillmont, *Encyclopaedia of Needlework* (1886). Project
  Gutenberg #20776. Tapestry and canvaswork chapter.
- Caulfeild and Saward, *Dictionary of Needlework* (1882). Stitch
  dictionary entries.
- Weldon's Practical Needlework series (1880s to 1900s). Canvaswork
  and Berlin work coverage.
- Mrs Beeton, *Book of Needlework* (1870). Project Gutenberg #16746.

Format: one bullet per source, plain prose.

## Length guidance

| Entry type | Word count |
|---|---|
| STITCH (basic tent stitch family) | 700 to 1,100 |
| STITCH (textured / composite) | 900 to 1,400 |
| PATTERN (small piece, cushion front) | 1,500 to 2,200 |
| PATTERN (large piece, seat cover) | 2,000 to 2,800 |
| READING (short) | 700 to 1,200 |
| READING (long) | 1,500 to 2,500 |

## Self-critique pass

1. Opening sentence names the piece or stitch in plain English.
2. No em dashes or en dashes anywhere.
3. Sequential instructions are `orderedList`.
4. Working order (design first, background last) named explicitly in
   PATTERN entries.
5. Every glossary term used inline with `glossaryTooltip` and
   `attrs.termSlug`.
6. Every `techniqueSlugs[]` entry wrapped inline with `techniqueLink`.
7. Every text leaf has `"type": "text"`.
8. Materials reference canonical slugs (canvas count, yarn type,
   needle size match).
9. UK English throughout.
10. Sources public-domain only; no Dimensions / Bothy Threads / modern
    designer citations.

## See also

- [needlework-foundations-author.md](needlework-foundations-author.md)
- [needlework-author.md](needlework-author.md)
- [docs/voice-spec-2026-05-21.md](voice-spec-2026-05-21.md) §3.4, §3.5.
