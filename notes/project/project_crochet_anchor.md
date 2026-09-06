---
name: project_crochet_anchor
description: State of the crochet rebuild after the Dillmont anchor batch (2026-06-16). The teaching library is already fully published; the real gap is PATTERN rebuild. Records the locked PATTERN template + chartData shape the bulk worker matches.
metadata: 
  node_type: memory
  type: project
  originSessionId: f789fbfd-b579-4675-86ad-510491af2c3e
---

Crochet rebuild after the locked completeness gate culled ~636 crochet rows
(almost all PATTERN) to DRAFT on 2026-06-16.

**Key finding (non-obvious): the crochet teaching library is already
comprehensively PUBLISHED.** As of the anchor batch there were 184 published
crochet STITCH / TECHNIQUE / READING tutorials (Worker A's Foundations build),
all Dillmont/Weldon-anchored. So the crochet rebuild gap is **PATTERN content**,
not teaching content. A bulk worker re-authoring stitch/technique/reading
tutorials would create duplicates. Before authoring any crochet teaching entry,
check existing published slugs first (`crochet-*-stitch`, `crochet-*-technique`,
`crochet-*` readings already exist for chain, slip stitch, dc, htr, treble,
double/triple treble, crossed treble, picot, joining, rows-and-rounds, weaving,
gauge, chart-reading, etc.).

**Anchor shipped (2026-06-16): 5 PATTERN templates, PUBLISHED.** Slugs:
crochet-simple-chain-loop-edging, crochet-picot-edging,
crochet-solid-treble-square-motif, crochet-solid-hexagon-motif,
crochet-shell-lace-edging. Source files: `packages/db/scripts/anchor-crochet/pattern-*.json`.
The 17 STITCH/TECHNIQUE/READING anchor entries were authored + gate-passing but
HELD (not shipped) under `anchor-crochet/_held-duplicates-existing-published/`
because they duplicated existing published topics (8 by exact slug). One known
defect on a live row: `crochet-foundation-chain-technique` is mis-typed STITCH
with no sourceNotes; a held corrected TECHNIQUE version exists if wanted.

**Locked PATTERN template (what the bulk worker pattern-matches):**
- Tutorial: orientation + UK-terms note, "What you need" (yarn weight + brand +
  colour count + yardage; hook mm), "Gauge", "Abbreviations" (inline `ch = chain`
  lines), "Pattern" with a `crochetPatternInset` node (`crochetPatternSlug`) then
  a `craftChart` node, fully-enumerated rounds/rows where **every row ends with a
  `(N sts)` count with the number adjacent to the paren** (the makeability
  `rowsWithoutStitchCounts` check counts `(\d+ unit)` and "N sts"; a count like
  "(6 loops, 7 dc)" does NOT match), "Finishing", "What to try next". No stray
  "Row N"/"Round N" in prose (inflates the row-marker count). Repeats enumerated
  as `[...] N times` (never "to end"/"around"/"as established").
- Source attribution goes in `sourceNotes` (NOT a body field; there is no
  `sourceAttribution` column). Dillmont / year / "Project Gutenberg" / historical
  names are BANNED in body prose by the voice gate but allowed in sourceNotes.
- The bare "a tapestry" banned phrase was REMOVED from `voice-check-lib.ts`
  (2026-06-17) — it was a false positive on "tapestry needle" / "tapestry
  crochet". "tapestry of" still catches the real cliché. The "fall" americanism
  rule is a warn-only false positive when "fall" means drop/belong (not the
  season).
- `crochet.chartDefinition` writes through to `Tutorial.chartDefinition`, which
  satisfies the makeability chart check on its own. The brief still requires a
  linked `CrochetPattern` row with `chartData` — created by
  `seed-crochet-anchor-pattern-rows.ts` (mirrors `seed-crochet-pattern-rows.ts`),
  linked via `sourceTutorialId`, visibility PUBLIC.

**chartData / chartDefinition shape** (shared `ChartDefinition`,
`apps/web/src/lib/craft-charts/types.ts`): `{ title, layout: 'round'|'flat',
craft: 'crochet', terminologyConvention: 'uk', caption, rounds[]|rows[] }`; each
stitch `{ symbol, count?, label? }` with `symbol` keyed to `chart-symbols.ts`
(chain, slip-stitch, double-crochet-uk, half-treble, treble, double-treble,
triple-treble, magic-ring, treble-cluster, shell, picot, crossed-treble, ...).
Same object on `Tutorial.chartDefinition` and `CrochetPattern.chartData`.

**Reusable QC harness:** `packages/db/scripts/qc-preflight.ts <file-or-dir>` runs
voice + completeness + makeability offline against authored JSON, simulating
chart facts from `crochet.chartDefinition`. Use it before every upload.

**Teaching library is voice-clean (2026-06-17).** Audited all 184 published
crochet STITCH/TECHNIQUE/READING rows with the real makeability + voice gates
(`audit-crochet-teaching.ts`): 0 makeability fails, but 72 carried voice errors
(dominant cause: em dashes in the `sourceNotes` citation lines; plus "a tapestry
needle" matches, ~9 grade-level paragraphs, 2 stray "essentially"/"genuinely").
Fixed to 0 errors: mechanical em-dash strip from sourceNotes
(`fix-crochet-teaching-voice.ts`, 58 rows) + targeted rewrites
(`fix-crochet-teaching-voice-2.ts`, 11 rows) + the "a tapestry" gate fix.
Remaining 37 rows carry warn-only nits (yarn-brand examples the gate leaves to
reviewer judgment, mild tricolons) — non-blocking, left in place. NOTE: the
makeability gate is BODY-ONLY (`bodyText`), so it never catches sourceNotes
em-dashes; the upload-time voice gate does. Re-run `audit-crochet-teaching.ts`
to re-check.

**Chart visibility fix (2026-06-17).** The `craftChart` node previously showed a
sign-in wall (`ChartSignInGate`) to anyone whose session didn't resolve
server-side, hiding the chart even from signed-in readers. Changed
`tutorial-content.tsx` so anonymous / unresolved-session readers get the static
`ReferenceChartView`; the interactive, progress-saving `CraftChartView` stays the
signed-in upgrade. Aligns with the free-tier rule (anonymous = local Studio,
sign-in = sync). Cross-stitch's separate `crossStitchChart` gate was NOT changed.

Related: [[project_crochet_diagrams]], [[feedback_content_completeness_checklist]],
[[feedback_no_softening_options]], [[feedback_free_signin_carrots]].
