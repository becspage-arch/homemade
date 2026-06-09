# Needlework / Foundations authoring

Canonical input for any worker session that drafts a tutorial under
`needlework/foundations`. Foundations are the cross-cutting basics:
threading a needle, mounting fabric, transferring a design, choosing
fabric and thread, starting and finishing thread cleanly, working in
good light, looking after the hands. The reader is starting needlework
from cold or stepping back to fundamentals; the prose trusts her and
keeps things plain.

## Status

`SubCategory.autopilotEnabled = true` for `needlework/foundations`. The
autopilot rotation picks this sub-cat as one of seven enabled needlework
disciplines.

## Pre-read (MANDATORY)

Read these in full before drafting:

- `docs/voice-spec-2026-05-21.md` §3.4 (craft technique) for STITCH and
  technique-shape READING entries.
- `docs/voice-spec-quick-reference.md` and the 10-point self-critique
  in §5; rewrite any opening paragraph that fails the test.
- `feedback_homemade_voice.md` for the eight hard rules.
- `docs/common-issues.md` for cross-category recurring patterns.
- `docs/needlework-anti-tells.md` for needlework-specific anti-tells.

## Voice register (summary)

Mary Berry, Erin Boyle, Barbara O'Neill, Martha Stewart. Calm,
matter-of-fact, instruction-led. UK English throughout. Plain spoken,
grade 6-8 reading level, sentences mostly 8-15 words, no academic
register, no marketing language, no soft-medical phrasing.

**Banned phrasing** (rewrite on sight):

- "Perfect for", "ideal for", "fine for almost everyone".
- "You've got this!", "don't worry!", "trust the process".
- "In the world of needlework", "few skills are as foundational".
- "Honour the wisdom of your hands", any ceremony register.
- Em dashes and en dashes anywhere in body prose, JSON, comments, or
  metadata. Use commas, colons, brackets, full stops, or rewrite.

**Word precision.** Stitches are "worked", not "sewn". The action is
"stitching", "working", "embroidering", "mounting", "tacking",
"finishing". A foundations tutorial may explain the difference between
sewing and stitching as part of orienting the reader.

## Tutorial type (almost always STITCH or READING)

Foundations tutorials are usually:

- `type = "STITCH"` for a single foundation technique (threading a
  needle, tying an away knot, mounting fabric in a hoop, transferring
  a design with prick-and-pounce).
- `type = "READING"` for a longer-form orientation (choosing fabric and
  needle for the discipline, working in good light, looking after the
  hands, reading a chart).

No PATTERN entries in foundations: a finished piece belongs in a
discipline sub-cat, not in foundations.

## Materials master list (canonical slugs)

The draft references these by slug; do not invent variants.

- **Thread / floss:** `dmc-stranded-cotton`, `anchor-stranded-cotton`,
  `madeira-stranded-cotton`, `dmc-perle-cotton-5`, `dmc-perle-cotton-8`,
  `dmc-perle-cotton-12`, `coton-a-broder`, `sashiko-ito`.
- **Fabric:** `aida-14`, `aida-16`, `aida-18`, `evenweave-25`,
  `evenweave-28`, `evenweave-32`, `linen-32`, `linen-36`, `linen-40`,
  `hardanger-22`, `needlepoint-canvas-10`, `needlepoint-canvas-13`,
  `needlepoint-canvas-18`, `cotton-muslin`, `candlewick-fabric`,
  `indigo-cotton`.
- **Needles:** `tapestry-needle-20`, `tapestry-needle-22`,
  `tapestry-needle-24`, `tapestry-needle-26`, `tapestry-needle-28`,
  `embroidery-needle-7`, `embroidery-needle-9`, `chenille-needle-22`,
  `chenille-needle-24`, `milliners-needle-9`, `sashiko-needle`.
- **Hoops / frames:** `embroidery-hoop-4`, `embroidery-hoop-6`,
  `embroidery-hoop-8`, `embroidery-hoop-10`, `embroidery-hoop-12`,
  `q-snap-frame`, `slate-frame`, `hardanger-hoop`.
- **Cutting + handling:** `embroidery-scissors`, `thread-snippers`,
  `fabric-shears`, `needle-minder`, `pin-cushion`.
- **Light + magnification:** `daylight-task-lamp`, `magnifier-loupe`,
  `magnifier-floor-stand`.
- **Transfer:** `water-soluble-pen`, `heat-erasable-pen`,
  `dressmakers-carbon`, `prick-and-pounce-kit`, `light-box`.

If a needed item is not in the master tables, add it via the proper
seed script before authoring; do not invent a slug.

## Critical techniques the foundations entries cover

Every entry in `criticalTechniques[]` for the needlework category traces
back to a foundations tutorial. The full list:

- `threading-a-needle`
- `mounting-fabric-in-hoop`
- `basic-running-stitch`
- `back-stitch`
- `tying-off-cleanly`
- `transferring-patterns`
- `choosing-fabric`
- `choosing-thread`

If a foundations tutorial introduces a new critical technique, add it to
`Category.criticalTechniques` for needlework before publishing.

## Input contract (the brief)

A brief is a JSON or markdown chunk describing one foundations entry.
Expect:

- `title`: short plain-English title.
- `slug`: URL slug, kebab-case.
- `type`: `STITCH` or `READING`.
- `subCategorySlug`: always `foundations`.
- `craftStitchSlugs`: required for `STITCH`; one slug for the stitch or
  technique being taught.
- `craftTechniqueTags`: free-form tags (`away-knot`, `loop-start`,
  `prick-and-pounce`, `light-box-transfer`, `hand-care`).
- `requiredFabricSlugs`: the fabric used in the worked-example sample.
- `requiredThreadSlugs`: the thread used in the worked-example sample.
- `requiredToolSlugs`: needles, hoop, scissors, light, magnifier.
- `difficulty`: usually BEGINNER for foundations.
- `targetWordCount`: see Length guidance.
- `sources`: public-domain references the brief author surfaced.

## Output contract (TutorialUploadInput)

Return one JSON document matching `TutorialUploadInput` exactly. Shape:

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary for cards and meta description>",
  "type": "STITCH",
  "categorySlug": "needlework",
  "subCategorySlug": "foundations",
  "difficulty": "BEGINNER",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "sewing": {
    "craftType": "needlework",
    "projectShape": "unconstructed",
    "requiredFabricTypes": ["aida-14"],
    "requiredNotions": ["dmc-stranded-cotton"],
    "sewingMethod": "hand",
    "bodyMeasurementsRequired": false
  },
  "recipeTools": [
    { "slug": "tapestry-needle-24", "isOptional": false },
    { "slug": "embroidery-hoop-6", "isOptional": false },
    { "slug": "embroidery-scissors", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "away-knot", "term": "Away knot", "definition": "A starting knot tied 8 to 10 cm from where the first stitch lands; the tail is later worked into the back of the cloth and the knot snipped off." }
  ],
  "techniqueSlugs": ["mounting-fabric-in-hoop", "tying-off-cleanly"],
  "criticalTechniques": ["mounting-fabric-in-hoop"],
  "body": { "type": "doc", "content": [ ] }
}
```

Rules:

- `categorySlug` is always `"needlework"`.
- `subCategorySlug` is always `"foundations"`.
- Every text leaf in the TipTap body MUST have `"type": "text"`. The
  renderer silently drops nodes that hit its default case.
- Every entry in `glossaryTerms[]` MUST appear inline at least once
  wrapped in a `glossaryTooltip` mark whose `attrs.termSlug` matches the
  glossary slug. Not `slug`. The voice-check CLI exits non-zero on the
  wrong key.
- Every entry in `techniqueSlugs[]` MUST be wrapped in a `techniqueLink`
  mark inline at least once.
- Every entry in `criticalTechniques[]` MUST also appear in
  `techniqueSlugs[]`.
- No image generation. `hero` stays unset; the renderer falls back to
  the procedural card. A separate image worker handles hero sourcing
  per the locked policy.

## Body shape

### STITCH

1. **Opening paragraph (secret in first sentence).** Name the technique
   in plain English. State what it is for and what makes it work or
   what is hard about it. Two to four sentences.
2. **What you need** (`suppliesCard` block). Fabric, thread, needle,
   hoop, scissors, light. Minimal.
3. **Working the technique** (H2). Use a numbered `orderedList` for
   every sequence of actions. No "first, then, next" prose.
4. **Common mistakes** (`troubleshooter` block). Three to five
   failure / cause / fix triples.
5. **What it unlocks** (short H2). One or two sentences naming the
   disciplines or stitches this foundation underpins.

### READING

1. **Opening paragraph.** What the article is, who it is for, what the
   reader will know by the end.
2. **Body proper.** H2 / H3 structure as the topic demands. Numbered
   lists for sequences, never prose.
3. **Worked examples.** At least one named example so the reader can
   match what she is reading against a concrete piece of cloth.
4. **Cross-references.** `subTutorialCard` blocks to the STITCH entries
   the reading surfaces.

## Image policy

NEVER generate images in this prompt. Drafts ship with `hero` unset; the
public renderer falls back to the procedural card. A dedicated image
worker handles hero sourcing and diagram generation per the locked
image policy (`feedback_image_strategy.md`).

## Sources (canonical set)

The standing source set for foundations tutorials:

- Therese de Dillmont, *Encyclopaedia of Needlework* (1886). Project
  Gutenberg #20776. The Victorian canonical reference for every
  needlework technique.
- Caulfeild and Saward, *Dictionary of Needlework* (1882). The
  encyclopaedic reference for Victorian technique nomenclature.
- Weldon's Practical Needlework series (1880s to 1900s). Internet
  Archive. Strong on starting and finishing thread cleanly.
- Mrs Beeton, *Book of Needlework* (1870). Project Gutenberg #16746.

Format: one bullet per source, plain prose. Title, author, year, source
identifier, one clause on what was drawn from it.

## Length guidance

| Entry type | Word count |
|---|---|
| STITCH (single technique) | 500 to 900 |
| READING (short orientation) | 700 to 1,200 |
| READING (long orientation) | 1,500 to 2,500 |

Count body prose only: heading text, list items, infoPanel bodies. Do
not count slugs, JSON wrappers, or chart cell labels.

## Self-critique pass

After writing the draft, re-read against this checklist and rewrite any
flagged line in place. Output the revised draft, then a short change
log.

1. Opening sentence states the technique in plain English. No academic
   opening, no "in the world of needlework", no historical preamble.
2. No em dashes or en dashes anywhere in the JSON.
3. Sentences mostly 8 to 15 words. Paragraphs short.
4. Sequential instructions are `orderedList`, never prose.
5. Every `glossaryTerms[]` entry appears inline wrapped in a
   `glossaryTooltip` mark whose `attrs.termSlug` matches the glossary
   slug.
6. Every `techniqueSlugs[]` entry appears inline wrapped in a
   `techniqueLink` mark; every `criticalTechniques[]` entry also lives
   in `techniqueSlugs[]`.
7. Every text leaf in the TipTap body has `"type": "text"`.
8. Materials reference canonical slugs from the master tables. No
   invented slugs.
9. UK English consistent throughout. No "yarn brand" endorsement; no
   "Zweigart" or other brand-pinned cloth names.
10. Sources cite public-domain references only; no modern designer or
    branded pattern citations.

The deterministic `voice-check` CLI is the final gate; do not skip it.

## See also

- [needlework-author.md](needlework-author.md) for the category-level
  index of all 10 discipline prompts.
- [needlework-surface-embroidery-author.md](needlework-surface-embroidery-author.md)
  for the next step after foundations.
- [docs/voice-spec-2026-05-21.md](voice-spec-2026-05-21.md) §3.4.
