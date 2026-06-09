# Needlework / Hardanger authoring

Canonical input for any worker session that drafts a tutorial under
`needlework/hardanger`. Hardanger is Norwegian counted embroidery
combining kloster block satin stitch with cut work and open-weave
filling stitches. Worked on hardanger fabric (22-count, occasionally
25-count), traditionally white-on-white in pearl cotton.

## Status

`SubCategory.autopilotEnabled = true` for `needlework/hardanger`.

## Studio archetype

Counted grid (chart engine, with cut-work area annotations on top of
the grid).

## Pre-read (MANDATORY)

- `docs/voice-spec-2026-05-21.md` §3.4, §3.5.
- `docs/voice-spec-quick-reference.md` 10-point self-critique.
- `feedback_homemade_voice.md`, `docs/common-issues.md`,
  `docs/needlework-anti-tells.md`.

## Cultural attribution

Hardanger comes from the Hardanger region of western Norway. Worked on
linen and wool by women in the region for several centuries, used on
the traditional Hardanger bunad (folk costume) and household linens.

Voice rules for hardanger:

- Acknowledge Norwegian origin clearly in one short line, usually in the
  opening paragraph or the Sources block.
- No claims of cultural authority. No "soul of Norway", no "the way
  it was".
- The body opens with the cloth and the stitch, not a history lecture.

## Stitch vocabulary

Hardanger combines three stitch types:

- **Kloster blocks.** Five satin stitches over four threads of fabric,
  worked in tight blocks that frame the cut area. The structural
  foundation of every hardanger piece.
- **Drawn-thread / cut work.** After the kloster blocks frame the area,
  threads are cut and removed inside the frame to make an open
  rectangle.
- **Filling stitches.** Worked in the open cut area: woven bars,
  wrapped bars, spider's web, dove's eye, square filet,
  cross-and-twist, picots.
- **Surface decoration.** Satin stitch motifs, eyelets, four-sided
  stitch, pulled-thread fills outside the cut areas.

The classic hardanger piece combines kloster-framed cut squares with
surface motifs that read as one design.

## Critical techniques

- `mounting-fabric-in-hoop` (often hand-held instead; hardanger fabric
  is stiff enough)
- `tying-off-cleanly`
- `reading-a-counted-chart`
- `kloster-block`
- `cutting-threads-for-hardanger` (the careful cutting step)
- `woven-bar`
- `wrapped-bar`

## Materials master list

- **Thread:** `dmc-perle-cotton-5` for kloster blocks and surface
  stitches, `dmc-perle-cotton-8` for fillings, `dmc-perle-cotton-12`
  for very fine work. Traditional white-on-white; modern variants use
  cream or single-colour palettes.
- **Fabric:** `hardanger-22` (the canonical 22-count cotton hardanger
  fabric), `evenweave-25` for finer work.
- **Needles:** `tapestry-needle-22` for kloster blocks,
  `tapestry-needle-24` or `tapestry-needle-26` for fillings.
- **Hoops:** Traditional hardanger works without a hoop; the fabric is
  stiff and the hands manage the tension. `embroidery-hoop-8`,
  `embroidery-hoop-10` are acceptable.
- **Cutting:** **Sharp** small embroidery scissors are non-negotiable
  for the cutting step. `embroidery-scissors`,
  `hardanger-scissors` (very fine, very sharp points).
- **Light:** `daylight-task-lamp`, `magnifier-loupe`.

## The cutting step (always called out)

Cutting threads is the moment a hardanger piece commits. The body
always names this clearly:

- Cut only after every kloster block framing the area is finished and
  the thread tails are secured.
- Cut close to the satin stitches, not into them. Hardanger scissors are
  designed for this work.
- The threads to cut are the ones inside the frame that run between two
  kloster blocks of the same orientation. The pattern names which.
- Pull the cut threads out gently with the needle or tweezers.

One short H3 inside the working method covers this. No multi-paragraph
safety block; one inline mention is the rule.

## Input contract (the brief)

- `title`, `slug`, `type` (`STITCH` / `PATTERN` / `READING`).
- `subCategorySlug`: always `hardanger`.
- `craftStitchSlugs`: required.
- `craftTechniqueTags`: free-form (`kloster-block`, `cutwork`,
  `woven-bar`, `dove-eye`, `spider-web`).
- `primaryFabricSlug`: typically `hardanger-22`.
- `chartDefinition`: the chart with kloster-block placement and
  cut-area annotations.
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
  "subCategorySlug": "hardanger",
  "difficulty": "INTERMEDIATE",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "sewing": {
    "craftType": "needlework",
    "projectShape": "unconstructed",
    "requiredFabricTypes": ["hardanger-22"],
    "requiredNotions": ["dmc-perle-cotton-5", "dmc-perle-cotton-8"],
    "sewingMethod": "hand",
    "finishedDimensionsCm": "15 by 15 cm",
    "bodyMeasurementsRequired": false
  },
  "recipeTools": [
    { "slug": "tapestry-needle-22", "isOptional": false },
    { "slug": "tapestry-needle-24", "isOptional": false },
    { "slug": "hardanger-scissors", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "kloster-block", "term": "Kloster block", "definition": "Five satin stitches worked over four threads of evenweave fabric, set in tight blocks. The structural frame around every hardanger cut area." }
  ],
  "techniqueSlugs": ["reading-a-counted-chart", "kloster-block", "cutting-threads-for-hardanger"],
  "criticalTechniques": ["kloster-block", "cutting-threads-for-hardanger"],
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
   State what it does in a hardanger piece (frames, fills, decorates).
   Name what makes it work.
2. **What you need** (`suppliesCard`).
3. **Working a practice piece** (H2). Numbered `orderedList`. For a
   kloster block: the count over (four threads), the count up (five
   stitches), the spacing (kloster blocks usually pair across the cut
   area).
4. **Common mistakes** (`troubleshooter`).
5. **What it underpins** (short H2).

### PATTERN

1. **Opening paragraph.** Finished piece. Fabric and count. Finished
   size. Design count in kloster-block units (a typical piece reads
   as a count of motifs and cut squares). One short factual line on
   Norwegian origin if it fits naturally; otherwise leave it to the
   Sources block.
2. **What you need** (`suppliesCard`). Cloth (22-count canonical),
   pearl cotton sizes 5 and 8, two tapestry needle sizes, hardanger
   scissors.
3. **Working method** (H2). The order of work in hardanger is
   non-negotiable: kloster blocks first, surface stitches around them,
   THEN cut and remove threads inside the kloster frames, THEN fillings
   in the open areas. Name this order explicitly.
4. **Chart** (H2). Insert the chart block. Below it, one short
   paragraph on how to read the cut-area annotations.
5. **Stage 1: kloster blocks and surface stitches** (H2 or H3).
   Numbered `orderedList`.
6. **Stage 2: cutting** (H2 or H3). Numbered `orderedList`. The
   cutting step (sharp scissors, cut close to the satin stitch, pull
   cut threads out gently) is called out clearly. One short inline
   safety line maximum.
7. **Stage 3: filling stitches** (H2 or H3). Numbered `orderedList`.
   Filling type (woven bar, dove's eye, etc.) named per area.
8. **Finishing** (H2). Hand wash, press face-down on a soft towel.
   Mounting and framing where the piece is destined for it.
9. **What to try next** (short H2).

### READING

Foundations-style readings: kloster-block construction and counting;
the cutting step and how to do it safely; choosing filling stitches.

## Image policy

NEVER generate images. The image worker sources hardanger heroes from
public-domain Norwegian needlework archives and verifies the piece
shows the characteristic kloster-block frames with cut work, not a
generic openwork sample.

## Sources (canonical set)

- Therese de Dillmont, *Encyclopaedia of Needlework* (1886). Project
  Gutenberg #20776. Drawn-thread and cut-work chapter.
- Weldon's Practical Needlework series (1880s to 1900s). Strong on
  hardanger.
- Caulfeild and Saward, *Dictionary of Needlework* (1882). Cut-work
  and drawn-thread entries.
- Public-domain Norwegian needlework archives where PD-cleared. Cite
  the archive URL.

Format: one bullet per source, plain prose. One bullet names the
regional Norwegian lineage.

## Length guidance

| Entry type | Word count |
|---|---|
| STITCH (kloster block, woven bar) | 700 to 1,100 |
| PATTERN (small motif) | 1,200 to 1,800 |
| PATTERN (sampler, runner) | 1,800 to 2,500 |
| READING (short) | 700 to 1,200 |
| READING (long) | 1,500 to 2,500 |

## Self-critique pass

1. Opening sentence states the piece or stitch in plain English with
   one factual cultural attribution at most.
2. No em dashes or en dashes anywhere.
3. The kloster-then-surface-then-cut-then-fill order is named
   explicitly.
4. The cutting step is called out clearly, one inline safety line
   maximum.
5. Sequential instructions are `orderedList`.
6. Every glossary term used inline with `glossaryTooltip` and
   `attrs.termSlug`.
7. Every `techniqueSlugs[]` entry wrapped inline with `techniqueLink`.
8. Every text leaf has `"type": "text"`.
9. Materials reference canonical slugs.
10. UK English throughout. Sources public-domain only.

## See also

- [needlework-foundations-author.md](needlework-foundations-author.md)
- [needlework-author.md](needlework-author.md)
- [docs/voice-spec-2026-05-21.md](voice-spec-2026-05-21.md) §3.4, §3.5.
