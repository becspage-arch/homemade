# Crochet anchor batch — DRAFT report

Four anchor entries authored as part of `phase_crochet_pipeline_scaffold`
(2026-05-17). All four sit as JSON briefs in `docs/crochet-anchor-briefs/`
and have not yet been uploaded — the migration, the master tables, and
the seed scripts need to be applied first, and Rebecca's review on the
pipeline approach comes ahead of any DB writes.

## What landed

| Slug | Type | Sub-cat | Difficulty | Words (body) | Chart | Status |
|---|---|---|---|---|---|---|
| `crochet-treble-and-magic-ring` | STITCH | stitches | BEGINNER | ~1,400 | no | DRAFT brief |
| `crochet-granny-square` | PATTERN | motifs | BEGINNER | ~1,600 | round (4 rounds) | DRAFT brief |
| `crochet-simple-cotton-dishcloth` | PATTERN | homewares | BEGINNER | ~1,000 | no | DRAFT brief |
| `crochet-granny-hexagon` | PATTERN | motifs | BEGINNER | ~1,500 | round (3 rounds) | DRAFT brief |

Word counts are approximate (counted against the body prose, not the
JSON wrappers, stitch names, or chart-cell labels).

## Spread

- **1 × STITCH (combined)** — treble + magic ring. The two foundation
  moves every in-the-round pattern on the library depends on. Combined
  rather than split into two tutorials because the magic ring isn't
  useful without a stitch to work into it, and the treble swatch
  exercises the same UK/US terminology block the magic ring tutorial
  would have needed anyway.
- **3 × PATTERN** — the granny square (the canonical Victorian motif),
  the simple cotton dishcloth (flat-construction graduation piece for
  a beginner who's just learned trebles), and the granny hexagon (the
  next motif up from the square, with a chart). The set covers both
  in-the-round and flat construction and exercises both the
  no-chart and with-chart pipeline paths.
- **No READING this batch** — the canonical "how to swatch crochet
  gauge" + "blocking crochet — the full guide" READINGs land in the
  pilot-10 batch alongside more stitches and patterns.

## Sources cited

Each entry surfaces its primary public-domain or open-access
references in `sourceNotes`:

- **crochet-treble-and-magic-ring** — Therese de Dillmont,
  *Encyclopedia of Needlework* (1886, Project Gutenberg #20776);
  Weldon's Practical Crochet Volume 1 (1885); Pauline Turner,
  *How to Crochet* (HarperCollins, 2008) for the modern
  adjustable-loop phrasing.
- **crochet-granny-square** — Weldon's Practical Crochet Volume 1
  (1885), the earliest English-language pattern; Beeton's Book of
  Needlework (1870); Dillmont.
- **crochet-simple-cotton-dishcloth** — Weldon's Practical Crochet
  (late-Victorian kitchen-cloth patterns); Beeton's Book of
  Needlework (1870); Pauline Turner method notes.
- **crochet-granny-hexagon** — Weldon's Practical Crochet Volume 4
  (1888) for the six-corner hexagon motif; Dillmont; modern
  join-as-you-go reference from open-access crochet-journal
  articles.

All public-domain or open-access except the contemporary Pauline
Turner references, which are cited as cross-reference rather than
primary source. No modern-blogger attributions; the granny square's
1880s provenance is named on every entry that touches the motif
(per the anti-tells `[block]` rule on crediting public-domain
patterns to modern named creators).

## Master entity coverage

The anchor batch exercises every master table the pipeline scaffold
seeded:

- **Stitch** — `crochet-magic-ring`, `crochet-chain`, `crochet-slip-stitch`,
  `crochet-treble`, `crochet-treble-cluster`. Five of the 24 seeded
  stitches; the remaining 19 land via the pilot + bulk batches.
- **YarnWeight** — `dk` (all four anchors). The other 8 weights surface
  when the pipeline reaches finer-yarn lace patterns (lace + fingering)
  and chunky throws (aran + chunky + super-chunky).
- **CrochetHook** — `crochet-hook-4-0mm` (all four anchors). 26 hooks
  seeded total; the rest get exercised across the pilot + bulk.
- **Tool** — `crochet-hook-4-0mm`, `tapestry-needle`, `craft-scissors`,
  `stitch-marker`, `blocking-mat`, `blocking-pins`, `measuring-tape-soft`.
  Seven of the eight new crochet tools added to `tools.ts`. The
  `row-counter` slug doesn't surface yet — it lands on the longer
  multi-row patterns.

## Voice-rule coverage

The four anchors between them surface every voice-rule the pipeline
relies on at least once:

- **UK terminology default** — every anchor authored UK-first;
  `terminologyConvention: "uk"` set on every entry; the renderer-side
  toggle to US convention named in the intro of every entry that
  uses a stitch with a UK/US mismatch.
- **Gauge stated verbatim** — every PATTERN includes a "Gauge" H2
  with the `gaugeText` field quoted verbatim, then a sentence on how
  to swatch and adjust hook size.
- **Finished size in intro + field** — every PATTERN names the
  finished size in the intro and sets `finishedSizeText`.
- **Turning chain count stated** — every row / round instruction in
  every PATTERN names the turning chain count and whether it counts
  as a stitch.
- **Stitch counts at row / round ends** — every working row / round
  ends with the running stitch count in brackets.
- **No yarn-brand endorsement** — every pattern specifies yarn weight
  + fibre + colour ("DK-weight cotton"), not brand.
- **Public-domain provenance** — every PATTERN names the Victorian
  source; no modern-blogger attributions; no 1970s-revival framing
  on the granny square (the canonical anti-tell `[warn]` rule).
- **No "free pattern" framing** — every entry uses plain "pattern"
  or "the granny-square pattern", never the pattern-piracy-coded
  "free pattern".

## TipTap blocks used

Across the four anchors:

- `paragraph` — universal.
- `heading` (level 2 / 3) — section + sub-section structure.
- `infoPanel` (tone: `tip`) — materials block + tip blocks on the
  STITCH tutorial.
- `glossaryTooltip` mark — every entry in `glossaryTerms[]` used
  inline in body prose.
- `orderedList` + `bulletList` + `listItem` — used for working
  steps + stitch-list sections.
- `troubleshooter` — common-mistakes block on the STITCH tutorial
  and the simple-cotton-dishcloth pattern.
- `craftChart` — the new block, used on `crochet-granny-square` and
  `crochet-granny-hexagon`. Definition inline in `attrs.definition`
  per the renderer's contract.

Blocks not yet exercised (land in pilot / bulk): `subTutorialCard`,
`pullQuote`, `varietiesPanel`, `productCard`, `suppliesCard` (the
anchor briefs use plain `infoPanel` for materials; `suppliesCard`
will be exercised once the bulk batch needs the structured-link
form).

## Open questions for Rebecca

- **Anchor sub-categories** — the briefs assume four crochet sub-
  categories: `stitches`, `motifs`, `homewares`, `garments`,
  `foundations`. The first three are exercised in this batch. The
  sub-category list isn't seeded yet — `seed-crochet-taxonomy.ts`
  would mirror `seed-herbal-taxonomy.ts`. Pending Rebecca's nod on
  sub-category names before that script lands.
- **Knitting pipeline coordination** — the chart renderer +
  `Stitch` master + `YarnWeight` master are shared with knitting.
  The knitting pipeline session will add a `KnittingNeedle` master
  (parallel to `CrochetHook`), a knitting-author prompt, and
  knitting symbols to `chart-symbols.ts`. The five knitting symbols
  seeded here (knit, purl, yarn-over, k2tog, ssk) are placeholders
  — the knitting session can extend or rewrite them without breaking
  the chart renderer.
- **Image strategy** — every anchor leaves `hero` unset. The
  image-sourcing run for these anchors is deferred to the pre-
  launch hero-batch sweep, same pattern as garden + herbal. The
  procedural card stands in until then.

## Next session

The pilot batch of 10 once Rebecca's reviewed this anchor set:

- Five more STITCH tutorials: double crochet (UK), half treble,
  double treble, chain (full tutorial separate from its appearance
  in the STITCH combined), slip stitch.
- Five more PATTERN tutorials: a coaster (in-the-round, 3 rounds);
  a market bag (multi-day arc, exercises `projectSchedule`); a
  granny-stripe blanket (multi-day arc, hexagon-or-square variants);
  a treble shawl (multi-stitch, exercises `craftStitchSlugs` with
  4+ entries); a popcorn-stitch cushion cover (textured, exercises
  the `popcorn` and `bobble` symbols on a chart).

The pilot prompt template is `docs/crochet-author.md` as-is, with
the brief per pilot drawn from a `docs/crochet-pilot-001-briefs/`
directory in the same shape as `docs/garden-anchor-briefs/` and
`docs/herbal-anchor-briefs/`.

## Migration + seed checklist (Rebecca-action)

Before the first upload:

1. Apply migration `20260624000000_phase_crochet_pipeline_scaffold`
   to staging + production. The migration is additive (no column
   drops, no breaking renames).
2. Run `pnpm --filter "@homemade/db" exec tsx scripts/seed-stitches.ts`
   — seeds 24 starter stitches.
3. Run `pnpm --filter "@homemade/db" exec tsx scripts/seed-yarn-weights.ts`
   — seeds 8 yarn weights.
4. Run `pnpm --filter "@homemade/db" exec tsx scripts/seed-crochet-hooks.ts`
   — seeds 26 crochet hooks.
5. Run `pnpm --filter "@homemade/db" exec tsx scripts/seed-tools.ts`
   — picks up the 8 new crochet tools.
6. Upload the four anchor briefs:
   `pnpm --filter "@homemade/db" exec tsx scripts/upload-batch.ts docs/crochet-anchor-briefs --status DRAFT`.

Once Rebecca's reviewed each anchor in the admin preview, flip the
crochet `Category.pipelineStatus` from `NOT_READY` to `READY` and
the autopilot single-queue cron picks up the bulk batches.
