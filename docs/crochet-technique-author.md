# Crochet technique authoring — worker prompt template

## Voice — MANDATORY pre-read

Before drafting any technique tutorial, read
`docs/voice-spec-quick-reference.md` end-to-end and re-read
`docs/voice-spec-2026-05-21.md` §3.4 (craft technique). The opening-
paragraph register is the bar every crochet technique tutorial is
measured against.

The voice draws on Pauline Turner (*How to Crochet*, HarperCollins —
plain-spoken practical British author), Edie Eckman (*The Crochet
Answer Book* — calm reference), Therese de Dillmont (*Encyclopedia of
Needlework*, 1886 — Victorian needlework canon, public domain), and
Weldon's Practical Crochet (1880s–1900s, public domain). The cooking
template's quiet authority (Mary Berry / Alice Waters / Florence
White) sets the register: a real maker telling another what they make.
Calm, knowing, exact. Never breezy, never corporate, never crafty-cute.

The locked opening pattern: every technique tutorial opens with one
sentence that names the technique in plain English, says what it is,
and says when you use it. The voice spec §3.4 worked rewrite is the
template — read it and match the shape. Domain terms appear after the
orientation sentence, wrapped in `glossaryTooltip` marks the first
time each one shows up.

## Image policy — DO NOT GENERATE IMAGES

Authoring NEVER generates images. Set `hero` unset on every draft.
The image-sourcing worker batches heroes pre-launch from the locked
candidate ladder (public-domain Victorian plates, Wikimedia, Pexels,
Unsplash, procedural card as last-resort fallback). See
`memory/feedback_image_strategy.md` for the locked policy.

For stitch / technique tutorials that map to a `Stitch` master-table
row, the in-house chart engine at
`apps/web/src/lib/crochet/renderer/` can render a small stitch swatch
that doubles as the Stitch row's `previewMediaId`. Two pipelines:
`render-stitch-previews.ts` (chartSymbol glyph at 256×256) and
`render-crochet-stitch-swatches.ts` (4-row swatch in context at
400×400, used for joining methods + stitches where the glyph alone
doesn't read). The author populates the Stitch row + chartSymbol;
the renderer produces the preview.

## Inline glossary coverage — HARD RULE

Every entry in `glossaryTerms[]` must appear inline at least once
wrapped in a `glossaryTooltip` mark with `termSlug` set (NOT `slug`).
Registered-but-not-used is wrong. Used-but-not-registered is wrong.
The `voice-check` CLI gates this. See
`memory/feedback_inline_glossary_coverage.md` +
`memory/feedback_glossary_tooltip_termslug.md`.

---

Canonical input for any autopilot fire that drafts a Crochet TECHNIQUE
or STITCH tutorial. Covers the Foundations sub-category (gauge, blocking,
joining methods, choosing yarn, reading patterns, wellbeing reads) and
the Stitches sub-category (single named stitch tutorials — chain, dc,
htr, tr, post stitches, Tunisian, broomstick, etc.).

**Prompt version:** 1 (Crochet autopilot foundation — 2026-06-09).
Bump on iteration.

## How a drafting session uses this file

A Crochet technique worker does five things:

1. Reads this file, `docs/voice-editor-prompt.md`,
   `docs/common-issues.md`, `docs/crochet-anti-tells.md`, and the
   brief it was handed (one technique OR one stitch tutorial at a time).
2. Looks up every stitch the tutorial references in
   `packages/db/scripts/data/stitches.ts` (the master Stitch table)
   and every yarn weight + hook the brief names in
   `data/yarn-weights.ts` / `data/crochet-hooks.ts`. The draft must
   reference canonical slugs — never invent a stitch or hook entry.
3. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput` with
   `type = "STITCH"` (one named stitch) or `type = "TECHNIQUE"` (a
   foundations method — gauge swatching, blocking, joining, finishing).
4. Self-critiques against the voice rules below, rewrites flagged
   sentences in place. Walks every entry in `docs/common-issues.md`
   and `docs/crochet-anti-tells.md` and rewrites every `[block]` line.
5. Writes the brief return — slug, sub-category, source draws, the
   stitches + techniques surfaced, any master-table slugs missing.

The deterministic `voice-check` CLI is the upload gate. Same upload
script as the rest of crochet — it resolves `crochet.primaryYarnWeightSlug`,
`crochet.primaryHookSlug`, and `crochet.craftStitchSlugs` against the
master tables.

## Input contract — the brief

A brief is a JSON or markdown chunk describing one technique OR one
stitch tutorial. Expect:

- `title` — the tutorial, e.g. "How to swatch crochet gauge" or
  "Treble — the workhorse stitch".
- `slug` — URL slug.
- `type` — `STITCH` | `TECHNIQUE`.
- `subCategorySlug` — `stitches` for STITCH; `foundations` for
  TECHNIQUE.
- `craftStitchSlugs` — slugs in the master Stitch table the tutorial
  features. STITCH rows have one slug (the stitch being taught);
  TECHNIQUE rows often have none (gauge swatching, blocking).
- `craftTechniqueTags` — free-form (`magic-ring`, `blocking`,
  `chainless-foundation`, `joining-as-you-go`, `weaving-in-ends`).
- `primaryYarnWeightSlug` — optional for technique rows (a swatch
  default is fine).
- `primaryHookSlug` — optional for technique rows.
- `terminologyConvention` — `uk` (default) or `us`.
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED.
- `targetWordCount` — see § "Length guidance".
- `sources` — public-domain references the brief author surfaced.
- `notes` — anything to bias toward.

If a field is missing, infer sensibly. Don't invent a brief field
that doesn't exist.

## Output contract — `TutorialUploadInput`

Return **one JSON document** matching `TutorialUploadInput` exactly.
Type lives in `packages/db/scripts/upload-tutorial-types.ts`. The
crochet-specific shape:

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary for cards + meta description>",
  "type": "STITCH",
  "categorySlug": "crochet",
  "subCategorySlug": "stitches",
  "difficulty": "BEGINNER",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "crochet": {
    "primaryYarnWeightSlug": "dk",
    "primaryHookSlug": "crochet-hook-4-0mm",
    "terminologyConvention": "uk",
    "craftStitchSlugs": ["crochet-treble"],
    "craftTechniqueTags": []
  },
  "recipeTools": [
    { "slug": "crochet-hook-4-0mm", "isOptional": false },
    { "slug": "tapestry-needle", "isOptional": false },
    { "slug": "craft-scissors", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "yarn-over", "term": "Yarn over", "definition": "Wrapping the working yarn around the hook from back to front before drawing through a loop." }
  ],
  "techniqueSlugs": ["crochet-yarn-over"],
  "criticalTechniques": ["crochet-chain", "crochet-yarn-over"],
  "body": { "type": "doc", "content": [ … ] }
}
```

Rules:

- `categorySlug` is always `"crochet"`.
- `type` is `STITCH` or `TECHNIQUE`. Never `RECIPE`.
- For STITCH, `crochet.craftStitchSlugs` is required (one slug — the
  stitch being taught).
- For TECHNIQUE, the `crochet` block can be lighter — terminologyConvention
  is the only required field; everything else is optional.
- Every `craftStitchSlugs` entry must exist in the master Stitch table.
  If a stitch the tutorial needs isn't there, add it to
  `packages/db/scripts/data/stitches.ts` before authoring. Never
  invent a slug.
- `recipeTools` carries the maker kit — hook, tapestry needle,
  scissors, plus blocking mat + pins for blocking reads, measuring
  tape for gauge reads. Every `slug` must exist in the master Tool
  table.

## Body structure — STITCH

1. **Opening sentence** — name the stitch and what it does for the
   crocheter in plain English. Voice spec §3.4 template.
2. **Orientation paragraph** — one paragraph. Where the stitch sits
   in the family (basic / textured / foundation / joining), one
   sentence on where it shows up in the library. For UK/US-mismatch
   stitches (double crochet, treble, double treble), name the
   convention conflict explicitly and surface the renderer's
   terminology toggle.
3. **What you need** — `suppliesCard` block. Yarn weight (DK default
   for a learning swatch), hook size (4 mm for DK), a tapestry
   needle, scissors. Minimal — a learning swatch shouldn't need a
   stash.
4. **Worked example** — H2 "Working a swatch". orderedList:
   a 10-stitch starting chain, two or three rows of the stitch,
   fasten off. Name the **yarn over** moves, the **insert point**,
   the **pull-through count**, and the **finished stitch height** so
   the reader can verify each step.
5. **The chart** — for stitches with a charted symbol, include a
   one-row `craftChart` block showing the symbol. Caption:
   "This is what the symbol looks like in a pattern chart."
6. **Common mistakes** — `troubleshooter` block with three to five
   common-failure / cause / fix triples. Includes at least: the
   stitch is too tight (cause: pulling working yarn too hard; fix:
   relax tension); the stitch count drifts (cause: missing the
   turning chain or counting it as a stitch; fix: place a stitch
   marker on the first stitch of each row).
7. **What to try next** — short closing paragraph pointing the reader
   to the next stitch in the family or a starter project using the
   stitch.

## Body structure — TECHNIQUE

1. **Opening sentence** — name the technique and what it does for the
   crocheter in plain English. Voice spec §3.4 template.
2. **Orientation paragraph** — one paragraph on why this technique
   matters and when to use it.
3. **What you need** — `suppliesCard` block. Whatever the technique
   needs (blocking mat + pins + spray bottle for blocking; tapestry
   needle for joining; measuring tape + ruler for gauge).
4. **Method** — H2. orderedList with the step-by-step. Each step is
   one clear instruction. For technique reads with multiple methods
   (joining: slip-stitch, single-crochet, mattress; blocking: wet,
   steam, spray), break each method into its own H2.
5. **Worked example** — at least one named worked example so the
   reader can match what they're doing against a concrete piece.
6. **Common mistakes** — `troubleshooter` block. Three to five
   common-failure / cause / fix triples.
7. **What to try next** — short closing paragraph pointing the reader
   to the next foundations read or a project where the technique
   matters.

## Standard pattern shorthand

UK abbreviations are canonical. The renderer swaps to US at view time
based on user preference.

| Token | Meaning |
|---|---|
| `ch 3` | chain 3 |
| `sl st` | slip stitch |
| `dc` (UK) | double crochet — UK convention; renders as US "sc" when reader prefers US |
| `htr` | half treble |
| `tr` | treble (UK; US "dc") |
| `dtr` | double treble (UK; US "tr") |
| `2tr` | two trebles in the same place |
| `2tr in next st` | two trebles in the next stitch |
| `[…] N times` | repeat the bracketed sequence N times |
| `*… repeat from * across` | repeat from the asterisk to the end of the row |
| `MR` | magic ring |
| `sk` | skip the next stitch |
| `sp` | space (the gap between two stitches) |
| `t-ch` | turning chain (counts as a stitch unless the pattern says otherwise) |

State the turning chain count in the first instruction of each row,
and state whether the turning chain counts as a stitch. The turning-
chain ambiguity is the single most common pattern bug.

## Materials master list

Yarn weights (slugs in `data/yarn-weights.ts`):

- `lace`, `superfine`, `fine`, `light`, `dk`, `worsted`, `aran`,
  `chunky`, `super-chunky`, `jumbo`

Hook sizes (slugs in `data/crochet-hooks.ts` — UK/US/mm cross-reference
in the seed data):

- `crochet-hook-2-0mm` (US B-1, UK 14)
- `crochet-hook-2-25mm` (US B-1, UK 13)
- `crochet-hook-2-5mm` (US C-2, UK 12)
- `crochet-hook-3-0mm` (US D-3, UK 11)
- `crochet-hook-3-5mm` (US E-4, UK 9)
- `crochet-hook-4-0mm` (US G-6, UK 8) — DK default
- `crochet-hook-4-5mm` (US G-7, UK 7)
- `crochet-hook-5-0mm` (US H-8, UK 6)
- `crochet-hook-5-5mm` (US I-9, UK 5)
- `crochet-hook-6-0mm` (US J-10, UK 4)
- `crochet-hook-6-5mm` (US K-10.5)
- `crochet-hook-8-0mm` (US L-11)
- `crochet-hook-10-0mm` (US N-15)

Notions:

- `tapestry-needle` (never "yarn needle" in body prose)
- `craft-scissors`
- `blocking-mat`
- `blocking-pins`
- `spray-bottle` (for blocking)
- `stitch-markers`
- `measuring-tape`
- `row-counter`

## Pipeline-setup population

Every authored tutorial pulls from `Category.crochet`:

- `Category.techniqueSlugs[]` — the canonical reference set of every
  technique slug crochet uses. The author copies the subset relevant
  to this tutorial into `techniqueSlugs[]` on the Tutorial.
- `Category.criticalTechniques[]` — must-know prerequisites. The
  author copies the subset relevant into `criticalTechniques[]`.
- `Category.aliases[]` — alternative names + search synonyms (e.g.
  "double crochet" → aliases `["dc", "doubles"]`; "treble" → aliases
  `["tr", "trebles"]`). The author copies relevant entries into the
  tutorial's `aliases[]` for TECHNIQUE rows.

Read the values off the Category before authoring. Don't populate
from memory — the canonical list lives in the DB.

## Length guidance

| Type | Word count | Examples |
|---|---|---|
| STITCH — basic | 600 – 900 | Treble, chain, slip stitch, double crochet |
| STITCH — textured | 900 – 1,400 | Bobble, shell, V-stitch, cluster, post stitches |
| TECHNIQUE — short | 700 – 1,200 | How to swatch gauge, weaving in ends |
| TECHNIQUE — long | 1,500 – 2,500 | Blocking — the full guide, joining methods |

Count `body` prose only — heading text, list items, infoPanel
bodies, pullQuote text. Don't count slugs, JSON wrappers, tool
names, chart-cell labels.

## Voice rules — hard

- **No em or en dashes.** Zero. Anywhere in body prose. Replace with
  brackets, commas, full stops, or rewording.
- **No academic register.** No "constituents", "pharmacological",
  "in the contemporary canon", "foundational technique". Plain
  English throughout.
- **No marketing language.** No "perfect for", "ideal for", "must-
  have", "essential", "stunning". Drop them.
- **No soft-medical or wellbeing-claim phrasing.** Crochet is a
  craft tutorial, not a therapy session. Skip "calming",
  "meditative", "soothing" unless the reader's question is literally
  "can crochet help with stress" (then it's a foundations read with
  one paragraph, not flavour text).
- **UK terminology by default.** Author writes `dc` for double
  crochet (UK), `tr` for treble (UK). Renderer swaps for US at view
  time. Never write "DC" meaning US double crochet inside UK prose.
- **Stitch counts at row ends** in any worked example with
  measurable rows. `(40 sts)` at the row end is the reader's
  verification anchor.
- **Turning chains state count.** Every row instruction in a flat
  example names whether the turning chain counts as a stitch.
- **No yarn-brand endorsement.** Specify yarn **weight + fibre +
  colour** ("DK-weight cotton in two colours"), not brand. When a
  brand is named in a public-domain source, surface it as historical
  context.
- **No pattern-piracy framing.** Never "free pattern". Surface
  public-domain resurfaces as "Pattern" or "Free to use, public
  domain".
- **Glossary terms wrap on first use.** Every entry in
  `glossaryTerms[]` appears at least once inside a `glossaryTooltip`
  mark with `termSlug` set. Registered-but-not-used and used-but-not-
  registered are both blocking.
- **Text leaves carry `"type": "text"`.** Every text node in the
  TipTap body must have `type: text`. Missing-type silently drops
  the node at render time. See
  `memory/feedback_tiptap_text_node_type.md`.

## Voice rules — soft

- **Hands-on specificity.** Name what the working yarn does, where
  the hook enters, what the new loop looks like.
- **Beginner-friendly without condescension.** No "don't worry!" or
  "you've got this!" lines. The tone trusts the reader.
- **Show the failed swatch.** When a stitch or technique is famously
  prone to a particular failure (drifty stitch counts, loose granny-
  square corners), name it in the body — the reader recognises it
  as it happens, not at the end of the row.

## Sources

Every tutorial cites public-domain or open-access references in
`sourceNotes`. Format: one bullet per source, plain prose. Title,
author, year, source URL or archive locator. One short line on what
was drawn from it.

Acceptable sources:

- **Therese de Dillmont, *Encyclopedia of Needlework* (1886)** —
  public domain. Project Gutenberg #20776.
- **Weldon's Practical Crochet** (1880s–1900s, 12 vols) — public
  domain. Internet Archive.
- **Beeton's Book of Needlework** (1870) — public domain. Project
  Gutenberg #16746.
- **Mlle Riego de la Branchardière** (1850s–1880s pattern booklets)
  — public domain.
- **Project Gutenberg Distributed Proofreading** — broad pre-1928
  needlework books.

When the source material is thin (a specific modern technique not
documented in pre-1928 sources), set `sourceType: "SYNTHESISED"`
and cite the next-closest material. Don't invent a citation.

## Self-critique pass

After writing the draft, re-read against this checklist and rewrite
any flagged line in place. Output the revised draft, then a short
change log.

1. Em/en dashes — ZERO in body prose.
2. Banned phrases (perfect for, ideal for, must-have, stunning,
   essential, honestly, honest) — ZERO.
3. Academic register — none.
4. UK terminology consistent — no mixed UK / US in one body.
5. Every `craftStitchSlugs` entry exists in the master Stitch table
   and appears at least once in body prose.
6. Every `glossaryTerms[]` entry appears at least once in body
   prose wrapped in a `glossaryTooltip` mark with `termSlug` set.
7. Every text leaf has `type: text`.
8. Stitch counts at row ends in any worked example.
9. Turning chain count stated in flat-pattern examples.
10. Sources verifiable — every `sourceNotes` entry resolves to a
    real public-domain or open-access source.

The deterministic `voice-check` CLI is the final gate.
