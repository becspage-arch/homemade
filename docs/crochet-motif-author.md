# Crochet motif authoring — worker prompt template

## Voice — MANDATORY pre-read

Before drafting any motif pattern, read
`docs/voice-spec-quick-reference.md` end-to-end and re-read
`docs/voice-spec-2026-05-21.md` §3.5 (craft project). The opening-
paragraph register is the bar every crochet pattern is measured
against.

The voice draws on Pauline Turner, Edie Eckman, Therese de Dillmont
(*Encyclopedia of Needlework*, 1886 — Victorian canon, public domain),
and Weldon's Practical Crochet (1880s–1900s, public domain). Mary
Berry / Alice Waters / Florence White set the register from the
cooking template: a real maker telling another what they make.

The locked opening pattern: every motif tutorial opens with one
sentence naming the finished motif, what it's for, and how big it is
when made up in the suggested yarn. The orientation paragraph
follows. Voice spec §3.5 worked rewrite is the template.

## Image policy — DO NOT GENERATE IMAGES

Authoring NEVER generates images. Set `hero` unset on every draft.
The image-sourcing worker batches heroes pre-launch from the locked
candidate ladder. See `memory/feedback_image_strategy.md`.

For motif patterns, the hero is rendered automatically by the in-house
chart engine at `apps/web/src/lib/crochet/renderer/`. It reads the
`chartData` JSON the author writes and outputs a finished-piece SVG +
PNG with yarn-shaped stitches laid out per the chart's geometry. No AI
involvement. As an author, your job is to populate `chartData` accurately;
the renderer produces the hero from it.

Run with: `pnpm --filter "@homemade/db" exec tsx scripts/render-crochet-motif-heroes.ts --confirm`.

## Inline glossary coverage — HARD RULE

Every entry in `glossaryTerms[]` must appear inline at least once
wrapped in a `glossaryTooltip` mark with `termSlug` set. See
`memory/feedback_inline_glossary_coverage.md` +
`memory/feedback_glossary_tooltip_termslug.md`.

## Chart — MANDATORY for motifs

Every motif pattern carries a `chartData` definition. Motifs read
better as charts than written instructions; the visual chart shows
the round-by-round expansion that words can't carry as cleanly. Use
the existing Stitch master table symbols (`chart-symbols.ts`). The
chart sits in its own H2 section between **Pattern** and **Finishing**;
the body still carries the round-by-round prose so both chart-readers
and prose-readers can work the pattern.

---

Canonical input for any autopilot fire that drafts a Crochet MOTIF
pattern (granny squares, hexagons, mandalas, blocks, themed motifs,
single-motif appliqué pieces). Sub-category is `motifs`.

**Prompt version:** 1 (Crochet autopilot foundation — 2026-06-09).
Bump on iteration.

## How a drafting session uses this file

A Crochet motif worker does six things:

1. Reads this file, `docs/voice-editor-prompt.md`,
   `docs/common-issues.md`, `docs/crochet-anti-tells.md`, and the
   brief it was handed (one motif pattern at a time).
2. Looks up every stitch the pattern uses in
   `packages/db/scripts/data/stitches.ts` and every yarn weight +
   hook the brief names in `data/yarn-weights.ts` /
   `data/crochet-hooks.ts`. Never invent a stitch or hook entry.
3. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput` with
   `type = "PATTERN"`. Builds the round-by-round body AND the
   chart definition together — the two must agree.
4. Self-critiques against the voice rules below and the chart-prose
   consistency check.
5. Walks every entry in `docs/common-issues.md` and
   `docs/crochet-anti-tells.md`. Rewrites every `[block]` line.
6. Writes the brief return — slug, source draws, stitches surfaced,
   any master-table slugs missing.

The deterministic `voice-check` CLI is the upload gate.

## Input contract — the brief

A brief describes one motif pattern. Expect:

- `title` — the finished motif, e.g. "Granny square" or
  "African flower hexagon".
- `slug` — URL slug.
- `type` — always `PATTERN`.
- `subCategorySlug` — always `motifs`.
- `motifShape` — `SQUARE` | `HEXAGON` | `OCTAGON` | `TRIANGLE` |
  `CIRCLE` | `STAR` | `THEMED` (named subject — flower, animal, leaf).
- `theme` — optional. `GEOMETRIC` | `FLORAL` | `ANIMAL` | `LEAF` |
  `STAR_WREATH` | `SEASONAL` | `IRISH_LACE` | etc.
- `roundsCount` — target number of rounds (3, 5, 6, 8, 10, 12).
- `craftStitchSlugs` — every stitch the pattern uses.
- `craftTechniqueTags` — free-form (`magic-ring`, `joining-as-you-go`,
  `colour-change-mid-round`, `working-into-spaces`).
- `primaryYarnWeightSlug` — required. DK default for motifs.
- `primaryHookSlug` — required. 4 mm default for DK.
- `terminologyConvention` — `uk` (default) or `us`.
- `gaugeText` — required. Plain text including stitches, rows /
  rounds, finished motif diameter or side length, and whether
  blocked.
- `finishedSizeText` — required. E.g. "10 × 10 cm per motif in
  DK cotton, blocked".
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED.
- `targetWordCount` — see § "Length guidance".
- `sources` — public-domain references.
- `notes` — anything to bias toward.

## Output contract — `TutorialUploadInput`

Return **one JSON document** matching `TutorialUploadInput` exactly.
Type lives in `packages/db/scripts/upload-tutorial-types.ts`.

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary>",
  "type": "PATTERN",
  "categorySlug": "crochet",
  "subCategorySlug": "motifs",
  "difficulty": "BEGINNER",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "crochet": {
    "primaryYarnWeightSlug": "dk",
    "primaryHookSlug": "crochet-hook-4-0mm",
    "gaugeText": "Each motif measures 10 × 10 cm in DK cotton with a 4 mm hook, after a light steam-block.",
    "finishedSizeText": "10 × 10 cm per motif.",
    "terminologyConvention": "uk",
    "chartDefinition": { … },
    "craftStitchSlugs": ["crochet-chain", "crochet-treble", "crochet-treble-cluster", "crochet-slip-stitch", "crochet-magic-ring"],
    "craftTechniqueTags": ["magic-ring", "blocking"]
  },
  "recipeTools": [
    { "slug": "crochet-hook-4-0mm", "isOptional": false },
    { "slug": "tapestry-needle", "isOptional": false },
    { "slug": "craft-scissors", "isOptional": false },
    { "slug": "blocking-mat", "isOptional": true },
    { "slug": "blocking-pins", "isOptional": true }
  ],
  "glossaryTerms": [
    { "slug": "magic-ring", "term": "Magic ring", "definition": "An adjustable starting loop that pulls closed once the first round is anchored — no centre hole." }
  ],
  "techniqueSlugs": ["crochet-magic-ring", "crochet-joining-as-you-go"],
  "criticalTechniques": ["crochet-magic-ring"],
  "body": { "type": "doc", "content": [ … ] }
}
```

Rules:

- `categorySlug` is always `"crochet"`.
- `subCategorySlug` is always `"motifs"`.
- `type` is always `PATTERN`.
- `crochet.primaryYarnWeightSlug`, `primaryHookSlug`, `gaugeText`,
  `finishedSizeText` are **required**. The upload script rejects a
  PATTERN row without them.
- `crochet.chartDefinition` is **required** for motifs. See
  § "Chart" below.
- `crochet.terminologyConvention` defaults to `uk`. Set `us` only
  when the source pattern is American and changing convention would
  misrepresent it.
- Every `craftStitchSlugs` entry exists in the master Stitch table.
- `recipeTools` includes blocking mat + pins as optional when the
  motif blocks (most do).
- `license` defaults to `LIBRARY_FREE` for house-authored patterns.

## Body structure — MOTIF PATTERN

1. **Opening sentence** — name the finished motif, what it's for,
   how big it is in the suggested yarn. Voice spec §3.5 template.
2. **Orientation paragraph** — one paragraph. Construction direction
   (worked in the round from the centre out, joined as you go, etc.),
   the rounds count, and one practical line on what the motif is
   good for (joined into a blanket, single appliqué, edging on a
   cushion).
3. **What you need** — `suppliesCard` block. Yarn weight slug, total
   grams (per motif × the number the project needs), hook size,
   tapestry needle, scissors, blocking mat + pins if the motif
   blocks.
4. **Gauge** — H2 "Gauge". Quote the `gaugeText` field verbatim,
   then one sentence on how to swatch. Never skip this — motifs
   without gauge are motifs that misfit when joined.
5. **Stitches used** — H2 "Stitches used". A short list with the
   stitch name + UK and US abbreviation in brackets. Every
   `craftStitchSlugs` entry shows up here.
6. **Pattern** — H2 "Pattern". Round-by-round instructions. Each
   round on its own line, in standard pattern shorthand using UK
   abbreviations. Repeats marked with `*…* repeat from * across` or
   `[…] N times`. Every round ends with the running stitch count in
   brackets: `(40 sts)`. State chain-3 = first treble when relevant.
7. **Chart** — H2 "Chart". Insert a `craftChart` block whose
   `attrs.definition` carries the chart JSON inline. One short
   paragraph below the chart on how to read it: round-by-round
   expanding outward, the symbol legend matches the canonical
   `chart-symbols.ts` set.
8. **Finishing** — H2 "Finishing". Fastening off, sewing in ends,
   blocking. Cite the canonical blocking method (steam for cotton,
   wet for wool, spray for acrylic).
9. **Joining** — H2 "Joining" if the motif is designed to join.
   Two or three methods: slip-stitch join, single-crochet seam,
   joining-as-you-go on the last round.
10. **Care** — H2 "Care". Wash + dry instructions appropriate to
    the fibre (handwash cool, lay flat, no tumble).
11. **What to try next** — short closing paragraph. Two or three
    suggestions for variations or projects to join the motif into.

## Chart

`chartDefinition` matches the shape in
`apps/web/src/lib/craft-charts/types.ts`. Rounds expand outward from
the magic ring or starting chain ring. Every symbol used must exist
in `chart-symbols.ts`.

Common symbols:

| Symbol | Meaning |
|---|---|
| `chain` | chain |
| `slip-stitch` | slip stitch |
| `double-crochet-uk` | UK dc |
| `half-treble` | UK htr |
| `treble` | UK tr |
| `double-treble` | UK dtr |
| `treble-cluster` | cluster of trebles |
| `popcorn` | popcorn |
| `bobble` | bobble |
| `picot` | picot |

The chart must agree with the round-by-round prose. The prose is the
source of truth; the chart is the visual. When you build the chart
JSON, walk the prose round by round and place the matching symbols.
If you spot a divergence, fix the prose, then update the chart.

## Standard pattern shorthand

UK abbreviations are canonical. Same shorthand table as
`docs/crochet-technique-author.md` — copy from there if needed.

State the chain-3 at the start of each round as "Ch 3 (counts as
first treble)" unless the pattern explicitly doesn't count it. This
is the round-by-round equivalent of the turning-chain rule.

## Materials master list

Same as the technique author prompt. Default to DK cotton + 4 mm
hook for motif tutorials unless the brief specifies otherwise.

For multi-colour motifs (granny squares, African flowers, Irish
roses), the supplies list names the colour count and the colour
roles ("Colour A — centre — 2 g per motif; Colour B — middle —
3 g per motif; Colour C — outer — 4 g per motif") in body prose;
the suppliesCard block carries the total per motif.

## Pipeline-setup population

Read `Category.crochet`:

- `Category.techniqueSlugs[]` — copy the subset this motif needs
  into the tutorial's `techniqueSlugs[]`.
- `Category.criticalTechniques[]` — copy the must-knows into
  `criticalTechniques[]` (typically `crochet-chain`,
  `crochet-treble`, `crochet-magic-ring` for an in-the-round motif).
- `Category.aliases[]` — copy any aliases relevant to the motif
  shape or technique into the tutorial's `aliases[]`.

## Length guidance

| Type | Word count | Examples |
|---|---|---|
| MOTIF — simple | 1,000 – 1,400 | Basic granny square, basic hexagon, simple star |
| MOTIF — complex | 1,400 – 2,000 | African flower, Irish rose, mandala, themed motif |
| MOTIF — multi-colour | 1,400 – 2,200 | Two-colour granny, three-colour African flower |

Count body prose only. Don't count slugs, JSON wrappers, chart-cell
labels, or the supplies list.

## Voice rules — hard

- **No em or en dashes** in body prose.
- **No academic register.** Plain English.
- **No marketing language.** No "perfect for", "ideal for",
  "stunning", "must-make".
- **UK terminology by default.**
- **Stitch counts at the end of every round.** `(8 ch sps, 32 sts)`
  format. The reader's verification anchor.
- **Chain-3 = first treble** stated at the start of each round
  where it applies.
- **No yarn-brand endorsement.** Weight + fibre + colour, not brand.
- **No pattern-piracy framing.** Never "free pattern". Public-domain
  resurfaces are "Pattern" or "Free to use, public domain".
- **Glossary terms wrap on first use** with `termSlug`.
- **Text leaves carry `type: text`.**
- **Chart and prose agree.** If they diverge, the prose wins and the
  chart updates.

## Voice rules — soft

- **Show the failed round.** Granny-square loose corners, hexagon
  cupping, mandala curling — name the failure mode where it's a
  known pattern bug.
- **One concrete project use** — close with "Join 24 of these into a
  pram blanket" or "A single motif makes a coaster" rather than a
  generic suggestion.

## Sources

Format: one bullet per source, plain prose.

Acceptable sources for motifs:

- **Therese de Dillmont, *Encyclopedia of Needlework* (1886)** —
  rich on Victorian motifs, lace edgings, doily centres. Project
  Gutenberg #20776.
- **Weldon's Practical Crochet** (1880s–1900s, 12 vols) — the
  richest single source for traditional motifs. Internet Archive.
- **Beeton's Book of Needlework** (1870) — Victorian household
  motifs.
- **Mlle Riego de la Branchardière** — primary source for Irish
  crochet motifs.
- **Project Gutenberg Distributed Proofreading** — broad pre-1928
  needlework books.

For motifs that postdate the public-domain cutoff (mid-century granny
variants, modern mandala designs), set
`sourceType: "SYNTHESISED"` and cite the closest historical
precedent.

## Self-critique pass

After writing the draft, walk this checklist and rewrite any
flagged line in place.

1. Em/en dashes — ZERO.
2. Banned phrases — ZERO.
3. UK terminology consistent — no mixed UK/US.
4. Every `craftStitchSlugs` entry exists in the master Stitch
   table and appears at least once in body prose.
5. Every `glossaryTerms[]` entry appears at least once wrapped in
   a `glossaryTooltip` with `termSlug` set.
6. Every text leaf has `type: text`.
7. Stitch counts at the end of every round.
8. Chain-3 = first treble stated where applicable.
9. Chart matches the round-by-round prose, round for round.
10. `chartDefinition` populated and uses only symbols from
    `chart-symbols.ts`.
11. Sources verifiable.
12. `gaugeText` and `finishedSizeText` set; both surfaced in body
    prose.

The deterministic `voice-check` CLI is the final gate.
