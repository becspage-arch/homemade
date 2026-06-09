# Needlework / Surface embroidery authoring

Canonical input for any worker session that drafts a tutorial under
`needlework/surface-embroidery`. Surface embroidery is freehand
decorative stitching on the surface of fabric, following a transferred
line drawing. The family covers crewel work in wool, redwork outline
embroidery, whitework, botanical studies, and general surface stitching
in stranded cotton or silk.

## Status

`SubCategory.autopilotEnabled = true` for `needlework/surface-embroidery`.

## Studio archetype

Surface vector (SVG canvas with region-annotation side panel). The
Studio renders surface-embroidery patterns from the `vectorData` JSON on
`NeedleworkPattern`.

## Pre-read (MANDATORY)

- `docs/voice-spec-2026-05-21.md` §3.4 (craft technique) for STITCH
  entries, §3.5 (craft project) for PATTERN entries.
- `docs/voice-spec-quick-reference.md` 10-point self-critique in §5.
- `feedback_homemade_voice.md` for the eight hard rules.
- `docs/common-issues.md` and `docs/needlework-anti-tells.md`.

## Voice register (summary)

Mary Berry, Erin Boyle, Barbara O'Neill, Martha Stewart. Calm,
matter-of-fact, instruction-led. UK English. Grade 6-8 reading level,
sentences mostly 8-15 words.

**Banned phrasing:**

- "Perfect for", "ideal for", "fine for almost everyone".
- "You've got this!", "don't worry!".
- "In the world of embroidery", "few skills are as foundational".
- Em dashes and en dashes anywhere.

**Word precision.** Stitches are "worked", not "sewn". Actions:
"stitching", "working", "embroidering", "couching", "padding",
"mounting", "tacking", "finishing".

## Stitch vocabulary

The discipline-specific stitches a surface-embroidery STITCH or PATTERN
entry may cover:

- **Outline:** stem stitch, back stitch, split stitch, chain stitch,
  whipped back stitch, Pekinese stitch.
- **Fill:** satin stitch, padded satin, long-and-short, brick stitch,
  laid work, couched fill, encroaching satin, Bayeux stitch.
- **Detached:** French knot, colonial knot, bullion knot, cast-on
  stitch, Palestrina knot, woven picot.
- **Linear decorative:** fly stitch, feather stitch, fishbone, herringbone,
  blanket stitch, buttonhole stitch, cretan stitch, coral stitch.
- **Loop:** lazy daisy (detached chain), Roumanian stitch.
- **Specialised:** couching, padded couching, trellis fill, basket
  stitch.

Add new stitches to `packages/db/scripts/data/stitches.ts` before
authoring; do not invent slugs.

## Critical techniques

A surface-embroidery tutorial usually depends on these foundations:

- `transferring-patterns`
- `mounting-fabric-in-hoop`
- `tying-off-cleanly`
- `choosing-thread`

Reference them with `techniqueLink` marks inline and include them in
`techniqueSlugs[]`; the ones the tutorial cannot work without go in
`criticalTechniques[]`.

## Pattern transfer methods (covered briefly when relevant)

- Carbon paper trace.
- Water-soluble pen direct draw.
- Heat-erasable pen direct draw.
- Light-box trace.
- Prick-and-pounce (the traditional method; PD source-rich).
- Tissue-paper tear-away.

For PATTERN entries, name the recommended method in the body and
cross-reference the foundations tutorial that covers transfer in depth.

## Materials master list

- **Thread / floss:** `dmc-stranded-cotton`, `anchor-stranded-cotton`,
  `madeira-stranded-cotton`, `dmc-perle-cotton-5`, `dmc-perle-cotton-8`,
  `coton-a-broder`, `crewel-wool`, `tatting-thread-40`,
  `embroidery-silk`.
- **Fabric:** `cotton-muslin`, `linen-32`, `linen-36`,
  `crewel-twill`, `evenweave-28`, `silk-dupioni`.
- **Needles:** `embroidery-needle-7`, `embroidery-needle-9`,
  `embroidery-needle-10`, `chenille-needle-22`, `crewel-needle-7`,
  `crewel-needle-9`, `milliners-needle-9`.
- **Hoops:** `embroidery-hoop-4`, `embroidery-hoop-6`,
  `embroidery-hoop-8`, `embroidery-hoop-10`, `q-snap-frame`,
  `slate-frame`.
- **Cutting:** `embroidery-scissors`, `thread-snippers`.
- **Transfer:** `water-soluble-pen`, `heat-erasable-pen`,
  `dressmakers-carbon`, `prick-and-pounce-kit`, `light-box`.
- **Light:** `daylight-task-lamp`, `magnifier-loupe`.

## Input contract (the brief)

- `title`, `slug`, `type` (`STITCH` / `PATTERN` / `READING`).
- `subCategorySlug`: always `surface-embroidery`.
- `craftStitchSlugs`: required.
- `craftTechniqueTags`: free-form (`stem-stitch`, `padded-satin`,
  `couching`, `crewel-fill`, `prick-and-pounce`).
- `primaryFabricSlug`: required for PATTERN.
- `requiredFabricSlugs`, `requiredThreadSlugs`, `requiredToolSlugs`.
- `difficulty`: BEGINNER / INTERMEDIATE / ADVANCED.
- `finishedSizeText`: required for PATTERN.
- `targetWordCount`: see Length guidance.
- `sources`.

## Output contract (TutorialUploadInput)

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary>",
  "type": "PATTERN",
  "categorySlug": "needlework",
  "subCategorySlug": "surface-embroidery",
  "difficulty": "BEGINNER",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "sewing": {
    "craftType": "needlework",
    "projectShape": "unconstructed",
    "requiredFabricTypes": ["linen-32"],
    "requiredNotions": ["dmc-stranded-cotton"],
    "sewingMethod": "hand",
    "finishedDimensionsCm": "20 by 15 cm",
    "bodyMeasurementsRequired": false
  },
  "recipeTools": [
    { "slug": "embroidery-needle-9", "isOptional": false },
    { "slug": "embroidery-hoop-8", "isOptional": false },
    { "slug": "embroidery-scissors", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "padded-satin", "term": "Padded satin", "definition": "Satin stitch worked over an underlayer of straight stitches that raise the surface slightly so the top layer sits prouder of the fabric." }
  ],
  "techniqueSlugs": ["transferring-patterns", "mounting-fabric-in-hoop"],
  "criticalTechniques": ["transferring-patterns"],
  "body": { "type": "doc", "content": [ ] }
}
```

Rules:

- Every text leaf in the TipTap body has `"type": "text"`.
- Every `glossaryTerms[]` entry appears inline wrapped in a
  `glossaryTooltip` mark with `attrs.termSlug` matching the glossary
  slug. Not `slug`.
- Every `techniqueSlugs[]` entry appears inline wrapped in a
  `techniqueLink` mark. `criticalTechniques[]` is a subset.
- No image generation; `hero` stays unset.

## Body shape

### STITCH

1. **Opening paragraph (secret in first sentence).** Name the stitch in
   plain English. State what it is for, where it appears in finished
   work, what makes it work. Two to four sentences.
2. **What you need** (`suppliesCard`).
3. **Working a practice piece** (H2). Numbered `orderedList` for the
   sequence. Name the path of the needle, the strand count, the
   direction of the stitch, the finished look.
4. **Common mistakes** (`troubleshooter`). Three to five
   failure / cause / fix triples.
5. **What it underpins** (short H2). Two or three projects that build
   on this stitch.

### PATTERN

1. **Opening paragraph.** Name the finished piece. State the fabric and
   thread combination, the finished size, the stitch base, the time
   feel ("an evening", "a weekend"). No false specificness about minutes.
2. **What you need** (`suppliesCard`). Fabric, thread (by colour as a
   plain-English name plus DMC and Anchor cross-reference where the
   colour matters), needle, hoop, scissors, transfer method.
3. **Transferring the design** (H2). Plain-English description of how
   to get the line drawing onto the fabric. Reference the foundations
   transfer tutorial inline.
4. **Stitches used** (H2). Short list, each stitch named with a
   `techniqueLink` mark to its STITCH tutorial.
5. **Working the piece** (H2). Numbered `orderedList`. Order matters:
   outline first or fill first depending on the design; padded work
   under top fill.
6. **Finishing** (H2). Wash, press face-down on a soft towel with a
   steam iron on the silk setting, mount in the hoop or frame.
7. **What to try next** (short H2). Two or three suggestions.

### READING

1. **Opening paragraph.**
2. **Body proper.** H2 / H3 as topic demands. Numbered lists for
   sequences.
3. **Worked examples.** At least one named example.
4. **Cross-references.** `subTutorialCard` blocks to STITCH / PATTERN
   entries.

## Image policy

NEVER generate images. Drafts ship with `hero` unset. A dedicated image
worker handles hero sourcing per the locked image policy.

## Sources (canonical set)

- Therese de Dillmont, *Encyclopaedia of Needlework* (1886). Project
  Gutenberg #20776. Embroidery chapter, full stitch dictionary.
- Caulfeild and Saward, *Dictionary of Needlework* (1882).
- Weldon's Practical Needlework series (1880s to 1900s). Strong on
  surface embroidery.
- Mrs Beeton, *Book of Needlework* (1870). Project Gutenberg #16746.

Format: one bullet per source, plain prose.

## Length guidance

| Entry type | Word count |
|---|---|
| STITCH (single stitch) | 600 to 1,000 |
| STITCH (textured / detached) | 900 to 1,400 |
| PATTERN (small motif) | 1,000 to 1,500 |
| PATTERN (sampler or scene) | 1,500 to 2,500 |
| READING (short) | 700 to 1,200 |
| READING (long) | 1,500 to 2,500 |

## Self-critique pass

1. Opening sentence names the stitch or piece in plain English.
2. No em dashes or en dashes anywhere.
3. Sequential instructions are `orderedList`, never prose.
4. Every glossary term used inline with `glossaryTooltip` and
   `attrs.termSlug`.
5. Every `techniqueSlugs[]` entry wrapped inline with `techniqueLink`.
6. Every text leaf has `"type": "text"`.
7. Materials reference canonical slugs.
8. UK English throughout; no brand-pinned fabric or thread names.
9. Sources are public-domain references only.
10. No "perfect for", "ideal for", soft-medical phrasing.

## See also

- [needlework-foundations-author.md](needlework-foundations-author.md)
- [needlework-author.md](needlework-author.md)
- [docs/voice-spec-2026-05-21.md](voice-spec-2026-05-21.md) §3.4, §3.5.
