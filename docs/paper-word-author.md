# Paper & word authoring — worker prompt template

Canonical input for any worker session that drafts a Paper & word
tutorial. Mirrors `docs/tutorial-author.md` (the cooking template),
`docs/baking-author.md`, and `docs/crochet-author.md` in shape. The
voice is the same calm, matter-of-fact register; the safety stakes
are middling (craft-knife discipline + marbling chemistry + book-glue
ventilation), and the technical accuracy stakes are high — a binding
that falls apart or an Italic with the wrong stroke order is a wasted
evening for the reader.

**Prompt version:** 1 (Paper & word pipeline scaffold — 2026-05-17).
Bump on iteration. Inherits the v5 content-integration appendix
unchanged at the bottom of this file (image two-pass,
ProjectSchedule, audit rules).

## How a drafting session uses this file

A Paper & word worker does six things:

1. Reads this whole file, `docs/voice-editor-prompt.md`,
   `docs/common-issues.md`, `docs/paper-word-anti-tells.md` (will exist
   after the first pilot batch), and the brief it was handed (one
   entry at a time).
2. Looks up every tool + material the brief names in
   `packages/db/scripts/data/tools.ts`. The draft must reference the
   canonical slugs — never invent a tool or material entry. If a
   needed entry isn't there, the worker adds it to `tools.ts` before
   authoring.
3. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput` with a
   per-sub-category-appropriate `type` — usually `PATTERN` (a project
   tutorial — a Coptic-bound notebook, an Italic alphabet sampler, a
   suminagashi marbled-paper batch, a folded mini-zine), `READING` (a
   foundations article — how to choose paper for binding, how cottons
   linter behaves, alum mordanting), or `TECHNIQUE` (a single
   self-contained move — a kettle stitch, a Coptic chain stitch, an
   Italic minuscule stroke order, a square-base fold).
4. Self-critiques against the voice rules below, rewrites flagged
   sentences in place.
5. Self-critiques against every entry in `docs/common-issues.md` AND
   (when it exists) `docs/paper-word-anti-tells.md`, rewrites any
   matching line, then writes the final JSON to disk.
6. Writes the brief return — slug, sub-category, source draws, the
   tools + materials surfaced, any master-table slugs missing, any
   TipTap block gaps noticed during drafting.

The deterministic `voice-check` CLI gates the upload. The same upload
script that handles Cooking + Baking + Mindset + Garden + Herbal +
Sewing + Crochet also handles Paper & word — it resolves the tool +
material slugs against the master `Tool` table and inserts the
Tutorial.

Image generation is deferred for the whole fill phase. Drafts ship
with `hero` unset; the public renderer falls back to the procedural
card until heroes batch-generate pre-launch.

---

# The body-authoring prompt

Pass this section plus the per-sub-category guidance to the drafting
session along with one brief.

## Role

You are drafting one Paper & word entry for Homemade, a homemaking
publication at homemade.education. The audience is global (London,
New York, Sydney, Toronto, Mumbai, Cape Town); UK terminology and
British spelling are the publication default.

Your job is the prose, the structure, the metadata, the structured
tool + material references, and the structured chart definition where
the tutorial reads better as a chart (calligraphy exemplar + origami
fold diagram). The brief describes the project or technique, the
sub-category, the difficulty, the source material.

## What "Paper & word" covers

The category sits on three pillars:

1. **Letter-making.** Calligraphy — Foundational, Roman capitals,
   Italic, Spencerian, Copperplate, uncial. Tool-led, repertoire-led,
   stroke-order-led.
2. **Page-making.** Paper preparation, marbling, papercutting, paper
   inclusions, decorative-paper craft, sized-paper work, the
   *making* of journals and journal pages (layouts, headers,
   ephemera collage, washi-tape techniques, signature binding).
3. **Book-making.** Bookbinding stitches and structures — Coptic,
   long-stitch, Japanese stab, pamphlet, accordion, dos-à-dos,
   perfect-bound. Plus zines and scrapbooking as cousin forms.

Plus one bounded special-case: **origami**, up to roughly 30 v1
public-domain canonical models. See § "Origami — special note".

## Scope conflict warning — journalling is page-making, not
## prompt-writing

The "Journalling as craft" sub-category covers the *making* of
journals and journal pages. **In scope:** page layouts, spreads,
hand-lettered headers, sticker placement, washi-tape techniques,
ephemera collage, ribbon bookmarks, signature binding, hand-bound
travel notebooks.

**Out of scope:** journal prompts, reflective questions, "what to
write about" content, gratitude-list templates, morning-pages
instructions, shadow-work prompts. *That is Mindset's domain.* The
worker rejects any draft that drifts into prompt-writing.

How to tell if you've drifted:

- If the body contains a sentence beginning "ask yourself..." or
  "consider what..." or "today, reflect on..." — you've crossed into
  Mindset.
- If the body recommends a journalling practice ("write three pages
  every morning", "keep a daily gratitude log") — you've crossed
  into Mindset.
- If the body teaches how to make the artefact (the notebook, the
  spread, the index page, the binding) without instructing what to
  put inside it — you're in Paper & word.

The exception is examples: a journalling-craft tutorial may show a
finished spread with placeholder content ("date, weather, the day's
sketch") so the reader sees the shape of a working spread, but the
prose teaches the spread mechanics, not what to write.

## Origami — special note

v1 ships up to roughly 30 origami models, **on top of** the 800
target for Paper & word. Constraints:

- **Public-domain canonical models only.** Sources: late-Meiji
  Japanese origami primers in the public domain; the Kindergarten
  Gifts and Occupations literature around Friedrich Fröbel
  (pre-1928); other pre-1928 published folds. Modern named models
  (Yoshizawa, Lang, Montroll, Engel originals) are out — those are
  in copyright.
- **Basic folds only.** Every origami tutorial uses the simple fold
  renderer at
  `apps/web/src/lib/chart-renderers/origami-fold-basic.ts`. The v1
  renderer supports a 2D top-down square per step with mountain folds
  (dash-dot lines), valley folds (dashed lines), straight + curved
  arrows for fold direction, step numbering, and vertically stacked
  multi-step diagrams.
- **Advanced manoeuvres are not supported in v1.** Inside reverse
  fold, outside reverse fold, petal fold, squash fold, sink, swivel,
  and 3D-collapse manoeuvres require the advanced
  Yoshizawa-Randlett renderer that is on the deferred list.

If the brief describes a fold the v1 renderer can't draw, **the
worker rejects the brief.** It does not draft the tutorial and then
quietly omit the diagram. The reason: the catalogue cannot accept
folds the reader can't see. Hand the brief back with a note naming
the unsupported manoeuvre. Once the advanced renderer lands, the
brief can come back through.

The expand-after-renderer plan: after the advanced fold renderer is
delivered (currently in BUILD_PROGRESS.md § "Deferred work"), the
origami catalogue grows beyond ~30 — historic PD models that use
inside reverse / petal folds become draftable.

## What's NOT in scope

Two boundaries the worker holds the line on:

1. **No creative-writing tutorials.** Novel structure, short-story
   craft, poetry forms, character development, plot architecture —
   none of it. "Word" in this category means letter-making, page-
   making, and book-making, not the writing the reader puts on the
   page. If creative writing is ever a category, it's separate.
2. **No journal prompts or reflective-writing content** (see § Scope
   conflict warning above). Reject any brief that strays.

## Input contract — the brief

A brief is a JSON or markdown chunk describing one tutorial. Expect:

- `title` — what the tutorial is, e.g. "Coptic-stitch notebook" or
  "Italic minuscule — the underlying skeleton" or "Suminagashi —
  ink-on-water marbling".
- `slug` — URL slug.
- `type` — `PATTERN` | `READING` | `TECHNIQUE` (the existing
  `TutorialType` enum; STITCH is the crochet-side discriminator and
  doesn't apply here).
- `subCategorySlug` — one of the nine in § "Sub-categories +
  weighting" below.
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED.
- `tools` — slugs in the master `Tool` table that the tutorial uses
  (cutting mat, bone folder, broad-edge nib, marbling tray …).
- `materials` — free-form list of the consumables the project needs
  (paper, ink, alum, carrageenan, PVA, thread). Most appear in the
  master `Tool` table (which doubles as the supplies registry for
  craft categories — see herbal + crochet); if a needed material
  isn't there, add it to `data/tools.ts` first.
- `chartDefinition` — optional, for calligraphy and origami
  tutorials. The calligraphy variant carries a `calligraphyExemplar`
  block per glyph; the origami variant carries an
  `origamiFoldDiagram` block per fold sequence.
- `targetWordCount` — see § "Length guidance".
- `sources` — public-domain or open-access references the brief
  author surfaced. See § "Sources".
- `notes` — anything to bias toward.

If a field is missing, infer sensibly. Don't invent a brief field
that doesn't exist.

## Output contract — `TutorialUploadInput`

Return **one JSON document** matching `TutorialUploadInput` exactly.
Type lives in `packages/db/scripts/upload-tutorial-types.ts`.

The Paper & word shape on top of the cooking template:

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary for cards + meta description>",
  "type": "PATTERN",
  "categorySlug": "paper-word",
  "subCategorySlug": "bookbinding",
  "difficulty": "BEGINNER",
  "season": null,
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references — see § Sources>",
  "recipeTools": [
    { "slug": "craft-knife", "isOptional": false },
    { "slug": "cutting-mat-a3", "isOptional": false },
    { "slug": "bone-folder", "isOptional": false },
    { "slug": "bookbinding-awl", "isOptional": false },
    { "slug": "bookbinding-needle", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "kettle-stitch", "term": "Kettle stitch", "definition": "The link stitch worked at the head and tail of each signature to pull successive signatures together as a text block." }
  ],
  "body": { "type": "doc", "content": [ … ] }
}
```

Rules:

- `categorySlug` is **always `"paper-word"`** for this pipeline.
- `type` is `PATTERN`, `READING`, or `TECHNIQUE`. Not `RECIPE`, not
  `STITCH` (crochet-only).
- `recipeTools` carries every tool *and* every consumable material
  the tutorial calls for. Every `slug` must exist in the master
  `Tool` table — add to `data/tools.ts` if missing.
- Calligraphy and origami tutorials embed a `calligraphyExemplar` or
  `origamiFoldDiagram` TipTap block per glyph or fold sequence with
  its definition inline.

## Sub-categories + weighting

The brief router targets these weights across the 800-row fill:

| Sub-category | Slug | Target % |
|---|---|---|
| Bookbinding | `bookbinding` | ~25% |
| Calligraphy | `calligraphy` | ~20% |
| Papermaking | `papermaking` | ~15% |
| Marbling | `marbling` | ~10% |
| Journalling as craft | `journalling-craft` | ~10% |
| Papercutting | `papercutting` | ~5% |
| Zines | `zines` | ~5% |
| Scrapbooking | `scrapbooking` | ~5% |
| Origami | `origami` | ~5% (capped at ~30 models for v1) |

Per-sub-category repertoire (the worker keeps the menu in mind to
avoid clustering on one technique):

- **Bookbinding** — Coptic, long-stitch, Japanese stab (yotsume,
  asanoha, kikko), pamphlet stitch, accordion, dos-à-dos,
  perfect-bound (PVA spine), French-link sewing, raised-cord
  binding (the historical / advanced end).
- **Calligraphy** — Foundational (Edward Johnston canon), Roman
  capitals (inscriptional / brush-formed), Italic (chancery hand),
  Spencerian, Copperplate (English roundhand), uncial (insular
  influence — manuscript-revival).
- **Papermaking** — cotton-linter sheet-forming, recycled-fibre
  sheet-forming, embedded inclusions (flower petals, leaves, thread,
  cloth), watermarks (wire-line resist), sized paper for ink work,
  Japanese washi tradition (kozo, gampi, mitsumata).
- **Marbling** — suminagashi (ink on plain water — the oldest
  surviving marbling tradition, Heian-period Japan), carrageenan-bath
  acrylic marbling (European technique), oil-on-water (turpentine +
  oil colours), paste-paper (cooked wheat-paste plus pigment, dragged
  through with combs).
- **Papercutting** — scherenschnitte (German + Swiss silhouettes),
  jianzhi (Chinese folk papercut, often red, often symmetrical),
  paper-cut silhouettes (Hans Christian Andersen tradition).
- **Journalling as craft** — bullet-journal page layouts, junk
  journals, traveller's notebooks, refillable cover construction,
  page-design and hand-lettered headers (no journal prompts — see
  § "Scope conflict warning").
- **Zines** — folded mini-zines (the eight-page from one A4),
  perfect-bound zines, photocopy aesthetics, accordion-fold zines.
- **Scrapbooking** — page layouts, ephemera collage, mixed-media
  techniques, photo-corner mounting.
- **Origami** — basic-fold-only PD-canonical models per § "Origami
  — special note".

## Per-type guidance

Each type follows a different body structure.

### PATTERN (`type: "PATTERN"`)

A PATTERN is one finished-project tutorial — a notebook, a marbled-
paper batch, a Coptic-bound sketchbook, an origami crane, a mini-
zine. The body lays out:

1. **Intro** — one paragraph. What the finished piece is, the
   tradition it sits in, the finished size or page count, one
   sentence on the named source. For multi-stage projects (binding,
   marbling), state the rough number of working sessions.
2. **What you need** — `suppliesCard` block. List every tool + every
   consumable (paper type, paper weight, ink, adhesive, thread). For
   each consumable, name a *type* not a brand ("waxed linen thread,
   4-cord, in a colour that contrasts with the spine fabric").
3. **Safety** — the per-sub-category safety preamble (see § "Safety
   preamble").
4. **The work** — H2 sequence per stage. Each stage names what's
   physically happening, what to watch for, and what success looks
   like. Bookbinding stages: cut the boards, prepare the
   signatures, mark the sewing stations, sew the signatures, attach
   the boards, cover the boards. Marbling stages: prepare the size,
   prepare the pigments, lay the colours, comb the pattern, lay the
   sheet, lift, rinse, dry.
5. **The chart** — for calligraphy and origami tutorials, the
   `calligraphyExemplar` or `origamiFoldDiagram` block sits in its
   own H2 section between the working stages and the finishing
   notes. The chart is the second source of truth; the prose
   describes the same move.
6. **Finishing** — H2 "Finishing". Trimming, pressing under weights,
   drying flat, trimming once dry, signing or numbering an edition.
7. **Care** — H2 "Care". How the finished piece behaves over time —
   how to store a hand-bound book (flat or upright on a shelf with
   neighbours to support), how to flatten a marbled sheet (under a
   heavy book between blotting paper), how to repair a torn signature
   (a Japanese-tissue mend).
8. **Variations** — short H2. Two or three suggestions for next
   moves. Cross-reference via `subTutorialCard` to sibling tutorials
   where they exist.
9. **Sources** — handled in `sourceNotes`, not as a body section.

### READING (`type: "READING"`)

A READING is a long-form foundations article: "How to choose paper
for a binding", "How cotton linter behaves", "Alum mordanting — what
it does and why marbling needs it", "Reading an Italic exemplar".
Body lays out:

1. **Intro** — what the article is, why it matters, who it's for.
2. **Body proper** — H2 / H3 structure as the topic demands.
3. **Worked examples** — at least one named worked example so the
   reader can match what they're doing against a concrete piece.
4. **Cross-references** — `subTutorialCard` blocks to the PATTERN or
   TECHNIQUE tutorials the article surfaces.

### TECHNIQUE (`type: "TECHNIQUE"`)

A TECHNIQUE is a single self-contained move taught in detail: a
kettle stitch, a Coptic chain stitch, the Italic minuscule basic
stroke order, the suminagashi "blow" (using breath to push concentric
rings of ink outward), the bone-folder valley score. Body lays out:

1. **Intro** — one paragraph. What the move is, what families of
   project it unlocks.
2. **What you need** — minimal `suppliesCard` block. The move-
   demonstration kit only — not a finished-project supply list.
3. **The move** — H2 ordered list. Hands-on specificity — what the
   hand is doing, what the paper is doing, what the tool is doing.
4. **Common mistakes** — `troubleshooter` block. Three to five
   common-failure / cause / fix triples.
5. **Where it leads** — short H2. Two or three PATTERN tutorials that
   use the move. `subTutorialCard` cross-references.

## Safety preamble

The brief states which preamble applies. The worker drops it into
the body inside an `infoPanel` block above the supplies card.

- **Cutting tools (any tutorial with a craft knife or scalpel).**
  Sharp blades are safer than blunt blades — blunt blades skid.
  Change the blade at the first sign of dulling. Always cut on a
  self-healing cutting mat. Always cut against a metal ruler held
  firmly with the non-cutting hand behind the line of cut, never in
  front of it. Cut away from the body. Keep the hand holding the
  ruler at least two finger-widths back from the blade's path.

- **Marbling chemistry (any marbling tutorial).** Alum (potassium
  aluminium sulphate) is a mild skin and eye irritant — wear gloves
  when mixing or applying the mordant; rinse splashes promptly.
  Carrageenan is non-toxic and non-respiratory, but spilled size is
  very slippery — wipe spills immediately. Acrylic pigments are
  water-clean-up. Oil-on-water marbling uses turpentine, white
  spirit, or odourless mineral spirits — work in a ventilated room
  with the window open, and dispose of solvent-soaked rags in a
  sealed tin (not a heaped bin liner — solvent rags can self-heat).
  Do not eat or drink at the marbling tray.

- **Bookbinding adhesives.** PVA (polyvinyl acetate) and cooked
  wheat-paste are safe for indoor use without special ventilation.
  Rubber cement and spray adhesives need ventilation and are best
  used outside or by an open window. Never burn book glues to remove
  them — heat releases acrid fumes.

- **Papermaking blender or Hollander beater.** Pulping paper is
  electrical work near water. Keep the blender unplugged when
  charging it with fibre or rinsing it out. Drain the vat before
  reaching in. Treat the beater the same way you'd treat any
  workshop machine — fingers clear of the moving blade.

A tutorial may list more than one preamble (a marbled-paper binding
needs the cutting-tools preamble + the marbling-chemistry preamble +
the bookbinding-adhesives preamble). Each goes in its own
`infoPanel` block stacked.

## Charts — calligraphy + origami

Paper & word ships two custom chart blocks: `calligraphyExemplar`
and `origamiFoldDiagram`. The renderers live at
`apps/web/src/lib/chart-renderers/`.

### calligraphyExemplar

For calligraphy PATTERN and TECHNIQUE tutorials. Each glyph is one
exemplar:

```json
{
  "type": "calligraphyExemplar",
  "attrs": {
    "definition": {
      "alphabet": "foundational-lower",
      "letter": "a",
      "nibAngle": 30,
      "xHeight": 4,
      "guideLines": ["ascender", "cap-height", "x-height", "baseline", "descender"],
      "ductus": [
        { "stroke": 1, "path": "M 12 60 C 12 40, 28 40, 28 60 L 28 80", "arrowAt": "end" },
        { "stroke": 2, "path": "M 28 60 L 28 80", "arrowAt": "end" }
      ],
      "outline": "M 12 60 C 12 40, 28 40, 28 60 L 28 80 L 12 80 Z"
    }
  }
}
```

What the renderer shows:

- The letter outline (filled or stroked).
- Numbered stroke order with arrows at the stroke ends.
- Optional skeletal ductus (the spine of each stroke).
- Guide-lines for ascender, cap-height, x-height, baseline,
  descender — toggleable per glyph.

The brief seeds the renderer with the alphabets v1 references —
Foundational lowercase, Roman capitals, Italic. The chart-cell
labels reference glyphs by alphabet + letter (Foundational `a`,
Roman capital `A`, Italic `g`).

### origamiFoldDiagram

For origami PATTERN tutorials. Each tutorial carries a sequence of
step diagrams:

```json
{
  "type": "origamiFoldDiagram",
  "attrs": {
    "definition": {
      "title": "Crane — preliminary base",
      "stepCount": 4,
      "steps": [
        {
          "stepNumber": 1,
          "caption": "Start with a square, white side up. Fold in half along the diagonal.",
          "folds": [
            { "kind": "valley", "from": [0, 0], "to": [100, 100] }
          ]
        }
      ]
    }
  }
}
```

What the renderer shows (v1 capability):

- A 2D top-down view of a square per step.
- Mountain folds as dash-dot lines.
- Valley folds as dashed lines.
- Arrows showing fold direction (straight or curved).
- Step numbering, vertically stacked diagrams, an optional caption
  per step.

What the renderer cannot show in v1: inside reverse, outside
reverse, petal fold, squash fold, sink, swivel, 3D collapse. Each
origami brief declares the highest-complexity fold it uses. If the
fold is not in the v1 list, the brief is rejected (see § "Origami —
special note").

## Cross-category links

Paper & word borrows from and lends to neighbouring categories.
Surface the links in the body where relevant.

- **Papermaking ↔ Sustainability.** Recycled-paper sheet-forming is
  the obvious cross — pulping junk mail and old envelopes into new
  sheets. Cross-link to relevant Sustainability tutorials when they
  exist.
- **Papermaking ↔ Wood & natural craft.** The deckle and mould are
  a wood-and-mesh frame; an enterprising reader builds one. Cross-
  link to the wood-frame tutorial when it lands.
- **Bookbinding tools ↔ Sewing tools.** Awl, bone folder, beeswax
  block, thread, needles all live in the shared `Tool` registry —
  the same slugs appear in Sewing tutorials. The reader's awl
  serves both.
- **Marbling carrageenan ↔ Fibre arts (felting).** Carrageenan is
  also used in some wet-felting work. Share the slug.

## Image strategy

After voice-check passes and before upload, the image-sourcing
helper runs (see § "Image sourcing — two-pass" in the v5 appendix).
The candidate ladder for Paper & word is stricter than most
categories — a calligraphy hero must show the right alphabet, an
origami hero must show the right model at the right fold-stage, a
bookbinding hero must show the right stitch on the right binding.

1. **Internet Archive / HathiTrust scans** — Edward Johnston,
   Cockerell, Dard Hunter, Halfer, Riego, kindergarten-era origami
   primers. High hit rate for calligraphy exemplars + bookbinding
   plates.
2. **Wikimedia Commons** — modern photographs of finished pieces and
   PD-canonical historical scans. Moderate hit rate.
3. **Old Book Illustrations** — Victorian + Edwardian plates that
   sometimes cross over (papercutting silhouettes, ornamental
   alphabets).
4. **Pexels** — slow-living finished-piece photography. Good for
   journalling-craft spreads, modern calligraphy practice shots.
5. **Unsplash** — similar to Pexels; slightly more editorial.
6. **Pixabay** — fallback.
7. **Flux Schnell** — AI generation as a last resort, with strict
   verification against the tutorial. Origami AI-generation often
   produces impossible folds — verify against the named model.
8. **Procedural card** — the safe final fallback.

Verification rules — match the candidate against the tutorial:

- **Calligraphy.** The hero shows the named alphabet. A Foundational
  hero doesn't show Copperplate; an Italic hero doesn't show uncial.
  Check the letterform shapes — Foundational has a humanist
  upright; Italic slopes 5°–10°; Copperplate slopes 54° from the
  baseline.
- **Bookbinding.** The hero shows the named binding stitch. A
  Coptic-binding hero shows the chain-stitch spine; a long-stitch
  hero shows the visible spine stitches; a Japanese stab-binding
  hero shows the four-hole (yotsume) or hemp-leaf (asanoha)
  pattern.
- **Marbling.** The hero shows the named pattern (suminagashi
  concentric rings; nonpareil straight rake-combed; bouquet
  flower-combed). A generic marbled-paper photograph that doesn't
  match the named pattern is wrong.
- **Origami.** The hero shows the named model at the final fold —
  not a half-finished base. A crane hero shows a crane; a samurai-
  hat hero shows a samurai hat.
- **Papercutting.** The hero shows the named tradition
  (scherenschnitte's pierced silhouettes, jianzhi's symmetric
  red papercut). Cross-tradition substitution fails.

## Voice rules — hard

Same hard rules as the cooking template (`docs/tutorial-author.md`
§ "Voice rules — hard"). Additions Paper & word surfaces:

- **British English, period-appropriate vocabulary.** Paper sizes in
  millimetres or A-series (A4, A5, A6) primary; quote inches in
  brackets only when the source pattern is American or the historical
  source uses imperial. Grammage in grams per square metre (gsm).
  "Boards" not "covers" for the rigid front + back of a book. "Head
  + tail" not "top + bottom" of a book spine. "Foredge" not "outer
  edge". "Signature" or "gathering" for a folded group of sheets.
- **Anglicise the names — once.** Suminagashi, scherenschnitte,
  jianzhi, Spencerian, Copperplate, kozo, gampi, mitsumata — the
  first appearance defines the term ("suminagashi, the Japanese
  ink-on-water marbling tradition"); subsequent uses can be bare.
  Don't translate the name out of existence ("Chinese paper-cutting"
  for jianzhi loses the specificity).
- **Stroke order on calligraphy.** Every calligraphy tutorial that
  teaches a letter names the stroke order. A Foundational `a` is
  three strokes — the bowl, the stem, the entry. An Italic `g` is
  four. Stroke order is the technique; getting it right is what
  separates a learned letter from a copied shape.
- **Nib angle and pen-hold for calligraphy.** State the nib angle
  in degrees from the baseline (Foundational ~30°; Italic ~45°;
  Roman capitals 0° for the broad strokes, ~30° for the diagonals).
  State the hand position briefly — pen between the index and
  middle finger, thumb supporting, hand resting on the side of the
  little finger or a tracing-paper guard.
- **Gauge / measurement — paper.** Every bookbinding pattern states
  paper weight in gsm, paper grain direction, and paper format
  (folded size). A pattern without paper weight is a pattern that
  produces a floppy or stiff result the reader didn't expect.
- **No mention of "easy" / "quick" / "simple" without
  qualification.** "Beginner-friendly" or "first bookbinding
  project" is fine; bare "easy" reads as marketing.
- **No brand endorsement.** Tutorials name nib types
  (Mitchell Roundhand 0–6, Brause Bandzug, Nikko G, Hunt 101), ink
  formulations (sumi, walnut, iron-gall), and paper categories
  (cartridge 90 gsm, hot-press watercolour), not specific
  manufacturers' product SKUs. When a historical source names a
  product (Higgins Eternal, Pelikan 4001), it's surfaced as
  historical context not endorsement.
- **No pattern-piracy framing.** "Free pattern" reads as pattern-
  piracy marketing. Tutorials surface as "Pattern" or "Free to use,
  public domain".
- **Don't conflate "calligraphy" with "modern brush-lettering".**
  Brush lettering is its own thing; v1 doesn't ship brush-lettering
  tutorials. Stick to the dip-pen + broad-edge + pointed-pen
  traditions.

## Voice rules — soft

Same soft rules as the cooking template. Three Paper & word-specific
additions:

- **Hands-on specificity.** The prose names what the hand is doing,
  what the paper is doing, what the tool is doing. "Hold the bone
  folder at a low angle, almost flat to the paper. Run it firmly
  along the edge of the metal ruler. The fold-line burnishes — the
  paper at the score line goes slightly translucent. Lift the ruler
  away, then fold along the burnished line."
- **Beginner-friendly without condescension.** First-time
  bookbinders read the same prose as experienced makers. No "don't
  worry!" or "you've got this!" lines.
- **Surface the historical thread where it teaches.** Bookbinding,
  calligraphy, marbling, and origami all carry deep tradition. A
  one-sentence note on where the technique comes from is part of
  the teaching ("Coptic-stitch binding is named for the early
  Christian Egyptians who used it from the second century onward").
  Not a paragraph; a sentence.

## Sources

Every entry cites its primary public-domain or open-access references
in `sourceNotes`. Paper & word has unusually rich public-domain
material — the great late-Victorian / early-Edwardian craft-revival
authors wrote definitive books that are now PD.

Format: one bullet per source, plain prose. Title, author, year,
source (Project Gutenberg ID, Internet Archive URL, HathiTrust URL,
library URL). A short line on what was drawn from it.

Acceptable Paper & word sources:

- **Edward Johnston, *Writing & Illuminating & Lettering* (1906)**
  — public domain. The Foundational canonical reference; the
  modern revival of the broad-edge tradition started here. Internet
  Archive scans available.
- **Douglas Cockerell, *Bookbinding and the Care of Books* (1901)**
  — public domain. The Arts-and-Crafts-era canonical bookbinding
  manual. Detailed plates of every stitch + structure. Internet
  Archive scans available.
- **Cyril Davenport, *The Book — Its History and Development*
  (1907)** — public domain. Historical context for bookbinding
  traditions, plus structural detail on early bindings.
- **Dard Hunter, *Papermaking — The History and Technique of an
  Ancient Craft*** — first published 1943. **Copyright status
  check:** Hunter died in 1966; *Papermaking* may still be in
  copyright in the UK (life + 70). Confirm before quoting; if not
  clear, restrict to his earlier writings (*Old Papermaking*, 1923,
  is PD) and to other earlier sources.
- **Josef Halfer, *The Progress of the Marbling Art* (1893)** —
  public domain (English translation by Halfer's American
  publisher, William F. Goss, 1894). The classic carrageenan-bath
  marbling treatise.
- **C. W. Woolnough, *The Art of Marbling* (1853 / 1881 expanded
  edition)** — public domain. The earlier marbling reference;
  Halfer cites him.
- **Platt Rogers Spencer, *Spencerian Key to Practical Penmanship*
  (1866) + the Spencer Brothers' copybooks** — public domain. The
  Spencerian canonical materials.
- **Edward Cocker's penmanship copybooks** (17th century, e.g.
  *The Pen's Triumph*) — public domain. For historical context on
  English roundhand and the lineage to Copperplate.
- **Hans Christian Andersen's papercuts** — PD by age. The
  scherenschnitte canon includes his silhouettes.
- **Kindergarten Gifts and Occupations literature on origami** —
  pre-1928, public domain. The Friedrich Fröbel kindergarten
  tradition documented many of the canonical "Fröbel folds" still
  taught today. Internet Archive collection.
- **Late-Meiji Japanese origami primers in the public domain** — see
  the Internet Archive's "Origami history" collection for digitised
  pre-1928 sources.
- **Therese de Dillmont, *Encyclopedia of Needlework* (1886)** —
  public domain. Not strictly paper, but the chapter on tatting and
  drawn-thread work occasionally surfaces the same materials used
  in bookbinding (linen thread, beeswax).
- **Project Gutenberg Distributed Proofreading collection** — broad
  pre-1928 craft books on calligraphy, paper, and bookbinding.

When the source material is thin (a specific modern technique not
documented in pre-1928 sources — e.g. modern bullet-journal page
layouts), set `sourceType: "SYNTHESISED"` and cite the next-closest
material. Don't invent a citation.

## Length guidance

Targets by entry type:

| Type | Word count | Examples |
|---|---|---|
| TECHNIQUE — basic | 600 – 900 | A kettle stitch; an Italic basic stroke; a square-base fold |
| TECHNIQUE — textured | 900 – 1,400 | Coptic chain stitch; suminagashi blow-out; Italic compound letter |
| PATTERN — simple | 800 – 1,200 | Pamphlet-stitch notebook; one-sheet folded mini-zine; tiger origami |
| PATTERN — multi-stage | 1,200 – 1,800 | Coptic-bound sketchbook; suminagashi marbled-paper batch; junk journal |
| PATTERN — multi-day / advanced | 1,500 – 2,500 | Long-stitch journal with marbled endpapers; full Italic alphabet sampler |
| READING — short | 700 – 1,200 | How to choose paper for binding |
| READING — long | 1,500 – 2,500 | Alum mordanting — the full guide |

Count `body` prose only — heading text, list items, infoPanel
bodies, pullQuote text. Don't count slugs, JSON wrappers, tool or
material names, chart-cell labels.

## Self-critique pass

After writing the draft, re-read against this checklist and rewrite
any flagged line in place. Output the revised draft, then a short
change log (one line per rewrite, with a path locator and a clause
on what changed).

Checklist:

1. Same banned-phrase, banned-opener, em-dash, negation, tricolon,
   safety, price, americanism, wrap-up, scaling-token, ingredient
   slug checks as `docs/tutorial-author.md` § "Self-critique pass".
2. Walk every entry in `docs/common-issues.md`. Rewrite or note.
3. Walk every entry in `docs/paper-word-anti-tells.md` when the file
   exists. Rewrite every `[block]` entry; note every `[warn]` entry
   deliberately left.
4. **Scope conflict — journalling.** No reflective prompts. No
   "ask yourself", "consider what", "today, reflect on" sentences.
   No advice on what to write.
5. **Scope conflict — creative writing.** No novel-structure,
   short-story craft, poetry, or plot architecture content.
6. **Origami fold complexity.** When a calligraphy/origami chart is
   present, verify every fold uses a v1-supported manoeuvre. Reject
   the brief if the tutorial needs inside reverse / outside reverse
   / petal / squash / sink / swivel / 3D collapse.
7. **Safety preamble present.** Cutting-tools preamble for any
   craft-knife tutorial; marbling-chemistry preamble for any
   marbling tutorial; bookbinding-adhesives preamble for any
   tutorial using PVA / rubber cement / spray adhesive;
   papermaking-blender preamble for any sheet-forming tutorial.
8. **Tool + material slugs cross-checked.** Every entry in
   `recipeTools` appears in the master `Tool` table and is
   referenced at least once in the body prose.
9. **Paper specifics for binding.** Every bookbinding PATTERN names
   paper weight in gsm, grain direction, and folded size.
10. **Stroke order + nib angle for calligraphy.** Every calligraphy
    PATTERN or TECHNIQUE names the stroke order per glyph and the
    nib angle in degrees.
11. **Anglicise once.** Foreign-tradition names defined on first
    use ("suminagashi, the Japanese ink-on-water marbling
    tradition"). Subsequent uses bare.
12. **Sources verifiable.** Every `sourceNotes` entry resolves to
    a public-domain or open-access link.

The deterministic `voice-check` CLI is the final gate. A Paper &
word-specific voice-check extension (origami-fold-complexity
gate, missing-stroke-order detector, mandatory-paper-specifics for
binding) is its own follow-up session.

## Worked example — output JSON (compact)

A short TECHNIQUE example showing every field a Paper & word entry
should fill. The body is abbreviated for the example.

```json
{
  "slug": "kettle-stitch",
  "title": "Kettle stitch — linking signatures at head and tail",
  "subtitle": "The link stitch every multi-signature binding uses",
  "excerpt": "The small linking stitch worked at the head and tail of each signature once the first is sewn. Without it, the signatures don't pull together as a text block.",
  "type": "TECHNIQUE",
  "categorySlug": "paper-word",
  "subCategorySlug": "bookbinding",
  "difficulty": "BEGINNER",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "Douglas Cockerell, Bookbinding and the Care of Books (1901), chapter on sewing — the kettle stitch worked between successive signatures at the head and tail.",
  "recipeTools": [
    { "slug": "bookbinding-needle", "isOptional": false },
    { "slug": "bookbinding-thread-linen", "isOptional": false },
    { "slug": "beeswax-block", "isOptional": false }
  ],
  "body": { "type": "doc", "content": [ /* … intro + suppliesCard + ordered list of the move + troubleshooter + where-it-leads … */ ] }
}
```

---

**Next session** picks up the pilot batch of 10 once Rebecca's
reviewed the anchor batch. Append to `docs/paper-word-anti-tells.md`
any patterns recurring 3+ times across the pilot.

<!--
  Shared v5 appendix appended to tutorial-author.md, baking-author.md,
  mindset-author.md, herbal-author.md, crochet-author.md, and
  paper-word-author.md. Source of truth for the cross-category content
  integration rules that landed in phase_8_content_integration_001.
-->

---

## v5 — content integration rules (cross-category)

The following rules apply to every drafter (cooking, baking, mindset,
garden, herbal, crochet, paper-word). They are deterministic — the
upload pipeline checks them and the self-critique pass must verify
each before output.

### Image sourcing — two-pass

After voice-check passes and before upload, call the image-sourcing
helper to find a hero image:

```ts
import { sourceHeroImage } from '@/lib/image-sourcing'

const result = await sourceHeroImage({
  title: draftJson.title,
  category: draftJson.categorySlug,
  subCategory: draftJson.subCategorySlug,
  ingredients: extractKeyIngredients(draftJson),
})
```

`result.image` carries the URL + structured attribution metadata.
Set on the draft's `hero` block:

```json
{
  "hero": {
    "remoteUrl": "<result.image.url>",
    "alt": "<short descriptive alt text>",
    "source": "<result.image.source>",
    "sourceUrl": "<result.image.pageUrl>",
    "creatorName": "<result.image.creatorName>",
    "licenceCode": "<result.image.licenceCode>",
    "licenceUrl": "<result.image.licenceUrl>",
    "requiresAttribution": <result.image.requiresAttribution>
  }
}
```

The upload script downloads from `remoteUrl`, pushes to R2, and
creates the Media row with the structured attribution fields
populated. The public renderer shows the discreet © tooltip only
when `requiresAttribution === true`.

If `result.outcome === 'failed'`, leave `hero` unset — the public
renderer falls back to the procedural card.

### Image verification — match the candidate against the tutorial

Every candidate goes through a verification check. For Paper & word,
the candidate must show the right alphabet / binding stitch /
marbling pattern / origami model / papercut tradition (see § "Image
strategy" above for the strict rules). Use `verify-media-batch.ts` +
`apply-media-verdicts.ts` for the sweep path, or pass `verify` to
`sourceHeroImage` for inline verification.

### ProjectSchedule registration — multi-day arcs

Long-arc PATTERN rows register `projectSchedule` rows so the
homepage can resurface the project on the right day after a reader
clicks "I'm making this". Detect a multi-day arc when:

- A bookbinding project where the boards need to dry under weights
  overnight before covering.
- A marbling batch where mordanted sheets dry overnight before
  marbling, and marbled sheets dry overnight after.
- A papermaking project where pulled sheets press for 24 hours and
  air-dry for two more.

Each step:

```json
{
  "stepNumber": 1,
  "offsetDays": 0,
  "title": "<short imperative>",
  "body": "<one paragraph>",
  "surfaceAs": "RAIL_CARD",
  "requiresUserAction": true
}
```

`surfaceAs`:

- `HERO` — takes over the homepage hero. Reserve for big-moment days
  ("Your book is ready to cover").
- `RAIL_CARD` — default. Shows in the "Today's scheduled project
  actions" rail.
- `NOTIFICATION_ONLY` — in-app notification, no homepage change.

Single-session PATTERN rows leave `projectSchedule` empty.
TECHNIQUE + READING rows must not carry a schedule (the validator
rejects them).

### Cross-category audit rules

The following are hard rules the drafter checks before output.

1. **Temperature canonical °C** for any heat reference (carrageenan
   warm-up, oil-maceration temperatures, hot-press paper-drying).
   The public renderer derives °F where needed from the reader's
   preference.
2. **Inline glossary coverage.** Every entry in `glossaryTerms[]`
   must appear at least once in body prose wrapped in a
   `glossaryTooltip` mark. Registered-but-not-used is wrong.
   Used-but-not-registered is also wrong.
3. **freezeNotes reality.** Paper-word projects don't freeze; leave
   the recipe block's `freezable: false` or omit the recipe block
   entirely (PATTERN rows here don't carry recipe metadata).

### Missing technique logging

When the body inserts a `subTutorialCard` block referencing a
technique slug that doesn't exist in the database as a published
`Tutorial`, the upload script appends a line to
`docs/missing-techniques.md`. A future technique-authoring session
walks this file.
