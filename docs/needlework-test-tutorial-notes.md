# Needlework — test tutorial review notes

**Tutorials reviewed:**
- `cross-stitch-alphabet-sampler-border` — PATTERN / cross-stitch / Aida-14 / BEGINNER
- `start-and-end-a-thread-cleanly` — READING / cross-stitch / BEGINNER

**Session date:** 2026-05-17

---

## Preflight

- `docs/needlework-author.md` v1 exists.
- 4 sub-categories seeded under `needlework` Category per
  `seed-needlework-taxonomy.ts` (cross-stitch, needlepoint, tatting,
  lacemaking).
- Cross-stitch SVG renderer landed at
  `apps/web/src/lib/chart-renderers/cross-stitch.ts` (commit 2d22fcb).
- Fabric `aida-14` exists in `data/fabrics.ts`.
- Notions `dmc-stranded-cotton`, `anchor-stranded-cotton` exist in
  `data/sewing-notions.ts`.
- Tools `tapestry-needle-24`, `embroidery-hoop-6`, `embroidery-scissors`,
  `needle-minder` all present in `data/tools.ts`.

**Gaps flagged at preflight:**

- **Master `Stitch` table has NO needlework entries.** The author prompt
  says: "Every `craftStitchSlugs` entry must exist in the master
  `Stitch` table." The needlework pipeline commit landed the
  `'cross-stitch'` value on the TypeScript union for `Stitch.craft`,
  but no actual rows. Cross-stitch / back-stitch / running-stitch /
  french-knot / tent-stitch / satin-stitch entries are all missing.
- **`crossStitchChart` TipTap node case is not yet wired in
  `tutorial-content.tsx`.** The renderer module exists; the case
  handler in the public renderer does not. A chart in a tutorial body
  will fall through to the default branch (no render). See "Renderer
  gap" below for the work needed.

Both gaps are flagged in this session, addressed structurally in the
draft body, and queued for a Rebecca-led fix or a separate
infrastructure session before autopilot flip.

---

## Voice register check

**Alphabet sampler border (PATTERN):** Voice is calm, factual, with the
"a real maker telling another what they make" register the author
prompt calls for. The opening paragraph names the design ("88 stitches
wide and 28 stitches tall"), the cloth, the colour count, the finished
size, and the time estimate — concrete from the first sentence. No
"easy" / "simple" / "you've got this" marketing language. No brand
endorsement; floss is named by DMC and Anchor cross-references.

The chart commentary's reference to Victorian convention ("Working
outwards from the middle means any cumulative miscount is split across
two halves and stays manageable") sits in the same factual register as
the rest. Clean.

**Thread foundations (READING):** Same factual register. The intro
states the three methods and the one finish in a single sentence; the
body delivers each in the same shape (intro, ordered list, follow-on
paragraph on a common variation or pitfall). No twee craft-cute
phrasing, no condescension to the beginner.

One register note: "Muscle memory is the goal; thinking-about-the-start
at every project start slows the stitching down for the next ten
years." This is slightly more conversational than the rest. Decision:
keep — it lands the why of practising, which is the foundation reading's
job. The needlework author prompt allows the hands-on-specificity
register as long as it stays trusting of the reader.

No AI-poetry, no platitudes.

---

## Em-dash audit

Both drafts pass the voice-check em-dash rule (max 1 per paragraph,
max 1 per sentence) on first pass, confirmed by the
`/tmp/dash-check.mjs` deterministic script. No rewrite pass needed
this time — having debugged the herbal drafts, the patterns to avoid
(appositive pairs, multi-em-dash safety paragraphs) were front of mind
during writing.

---

## Safety preamble flow

**Alphabet sampler border:** carries an `infoPanel(tone: "warning",
title: "Before you start")` block directly after the intro, covering:
- Eye fatigue + lighting (daylight task lamp, 30-minute breaks) ✓
- Needle storage (needle minder, never on sofa arm, children/pets) ✓
- Scissors (capped between uses, dedicated cloth-and-thread) ✓
- Posture (hoop, shoulders, both hands free) ✓

This is the four-point safety set the needlework author prompt
specifies. Repetitive strain is implicit in the lighting + breaks
paragraph rather than called out separately; if Rebecca wants a fifth
explicit paragraph, the addition is small.

**Thread foundations:** carries a smaller `infoPanel(tone: "warning",
title: "Before you practise")` block. Less safety-focused (the
hazards of a practice swatch are minimal) and more setup-oriented
(eye-level light, scissors capped, needle minder for parking). This
seemed proportional — the safety stakes of a READING article on thread
starts are lower than a PATTERN that asks the reader to commit to
several hours of focused work. **Decision needed by Rebecca:** should
every needlework READING also drop the full four-point safety preamble,
or is a smaller preamble appropriate for foundations articles?

---

## Cross-link gaps

Both tutorials reference each other via `subTutorialCard`:
- `cross-stitch-alphabet-sampler-border` → not yet a Tutorial in DB
  (this batch is the first authored)
- `start-and-end-a-thread-cleanly` → same

When both DRAFTs land in the DB, the cross-links resolve. The
`subTutorialCard` slugs will be added to `missing-techniques.md` by
the upload script until both tutorials exist as Tutorial rows.

**Cross-category links the prompt mentioned but were not authored:**

- Sewing: finishing techniques (mounting in a hoop frame, backing as
  a cushion). The sampler's "Finishing" section gestures at a Sewing
  tutorial but does not reference a specific slug. The Sewing category
  test tutorials in this session don't cover this; a future pass adds
  the framing/backing tutorial.
- Fibre arts: linen / evenweave fabric production. Out of scope for
  beginner cross-stitch tutorials; would be more appropriate on a
  linen-stitched motif pattern.
- Crochet: Victorian crochet edgings on cross-stitched centres. Same
  point — out of scope for the alphabet border.

---

## Tools registry hits

**Sampler border** (`recipeTools`):

| Slug | In tools.ts | Named in body |
|---|---|---|
| `tapestry-needle-24` | ✓ | ✓ ("Size 24 tapestry needle") |
| `embroidery-hoop-6` | ✓ | ✓ ("15 cm embroidery hoop") |
| `embroidery-scissors` | ✓ | ✓ |
| `needle-minder` | ✓ | ✓ ("needle minder magnet") |

Clean.

**Thread foundations** (`recipeTools`):

| Slug | In tools.ts | Named in body |
|---|---|---|
| `tapestry-needle-24` | ✓ | ✓ |
| `embroidery-hoop-6` | ✓ (optional) | ✓ |
| `embroidery-scissors` | ✓ | ✓ |

Clean.

---

## Glossary tooltips

**Sampler border** — registered: `samp-letter`, `stranded-cotton`,
`loop-start`, `away-knot`

Inline tooltip check:
- `samp-letter` → ✓ (intro paragraph)
- `stranded-cotton` → ✓ (intro paragraph)
- `loop-start` → ✓ (working method paragraph)
- `away-knot` → ✓ (working method paragraph)

All registered terms used inline. Clean.

**Thread foundations** — registered: `loop-start`, `away-knot`,
`woven-tail-finish`, `waste-knot`

Inline tooltip check:
- `loop-start` → ✓ ("the loop start" intro to that section)
- `away-knot` → ✓ ("the away knot" intro to that section)
- `woven-tail-finish` → ✓ ("a woven-tail finish" intro to that section)
- `waste-knot` → ✓ (variation paragraph)

All registered terms used inline. Clean.

---

## Chart definition (PATTERN only)

The sampler border carries a `crossStitchChart` TipTap block with an
inline `definition` matching the `CrossStitchChart` shape exported
from `apps/web/src/lib/chart-renderers/cross-stitch.ts`. The chart:

- `width` 88, `height` 28 ✓
- `fabricCount` 14 ✓
- `finishedSizeText` "16 × 5 cm on 14-count Aida; 12.5 × 4 cm on
  18-count Aida" ✓
- `palette`: 3 entries, each with `key`, `name` (plain English),
  `hex` (6-digit), `dmcCode`, `anchorCode`, `skeinEstimate` ✓
- `cells`: ~210 sparse triples covering A through G (24 stitches per
  letter × 7 letters ≈ 170 stitches) plus two horizontal sage border
  rules at rows 16/22 and a gold tick row at row 19

The chart was hand-drawn to match the block-letter samp-letter
conventions from de Dillmont's Encyclopedia of Needlework. Each letter
is 5 stitches wide and 7 stitches tall, separated by 3-stitch gaps —
the standard Victorian alphabet plate spacing.

**Renderer gap (BLOCKING for the rendered preview):** the
`crossStitchChart` TipTap node case is not yet handled in
`apps/web/src/components/public/tutorial-content/tutorial-content.tsx`.
The other chart types in the same file (`craftChart`,
`calligraphyExemplar`, `origamiFoldDiagram`, `weavingDraft`,
`macrameKnot`) all have case statements that pull `attrs.definition`
and pipe it through their renderer. The cross-stitch case follows the
same pattern but is missing.

The fix is small — one case block in the renderer's switch statement
calling `renderCrossStitchChart()` from
`apps/web/src/lib/chart-renderers/cross-stitch.ts`. Either this
session's chart definition stays inline-invisible until the case lands,
or a follow-up commit wires it. Rebecca's call.

The chart definition in the JSON is structurally correct and will
render the moment the case statement lands.

---

## Schema / data gaps flagged

1. **Master `Stitch` table has zero needlework entries.** The
   needlework pipeline commit added `'cross-stitch'` and `'tatting'`
   to the `craft` union but didn't seed actual rows. Required entries
   the author prompt assumes exist:
   - `cross-stitch-full` (the basic cross)
   - `cross-stitch-half` (one diagonal only)
   - `cross-stitch-quarter` (used in shading)
   - `cross-stitch-back-stitch` (outline)
   - `cross-stitch-french-knot`
   - `cross-stitch-satin-stitch`
   - `cross-stitch-running-stitch`
   - `needlepoint-tent-stitch` (basketweave + continental variants)
   - `needlepoint-gobelin`
   - `tatting-double-stitch` (the foundational tatting stitch)
   - `tatting-ring`
   - `tatting-picot`
   - `tatting-chain`
   
   Until these land, every needlework PATTERN or STITCH tutorial that
   sets `craftStitchSlugs` will fail the upload script's master-table
   lookup. The two drafts in this session OMIT `craftStitchSlugs`
   entirely — both deliberately, since the master table is empty.
   PATTERN tutorials are permitted to omit the field per the upload
   validator, but the author prompt's intent is that they populate it.

2. **`crossStitchChart` TipTap node case missing in
   `tutorial-content.tsx`.** See "Renderer gap" above.

3. **`sewing.projectShape` on a needlework PATTERN is awkward.** The
   sampler border is `unconstructed` (the chart is the project shape;
   there's no rectangle / panel / circle / from-measurements). The
   field works but a `chart-piece` or `needlework-piece` value would
   read more naturally. Low priority — leave as `unconstructed`
   unless Rebecca wants the enum extended.

4. **`bodyMeasurementsRequired: []`** — sets the empty array correctly,
   but the field is sewing-shaped. Needlework patterns don't take body
   measurements at all. Consider making the field nullable for
   non-clothing crafts. Cosmetic; the validation passes.

---

## Hero images

Both tutorials: no hero set. Procedural cards will render at the
public site per the v5 appendix deferred-image rule.

**Sampler border:** strong sources exist. Old Book Illustrations
(Weldon's Practical Needlework volume 2) has period sampler plates
that would match the design directly. Project Gutenberg's de Dillmont
edition (#20776) has cross-stitch alphabet plates as illustrations.
A pre-launch image sweep should look at both before falling through
to procedural.

**Thread foundations:** harder. The article describes a method, not a
finished piece. Possibilities: a stylised diagram of the loop-start
moment (needle going down through the cloth, loop visible on the
back), or a back-of-cloth photo showing the four-stitch woven-tail
finish. Wikimedia Commons has some embroidery back-of-cloth photos
but matching one to this article's specific demonstration is unlikely.
Procedural card is the right fallback.

---

## Proposed changes to docs/needlework-author.md

These are proposals only. Rebecca decides what to apply before the
autopilot goes live.

1. **`crossStitchChart` vs `craftChart` node type clarification.**
   The author prompt § "Charts" says to insert a `crossStitchChart`
   TipTap block. The public renderer's `tutorial-content.tsx` has
   cases for `craftChart`, `calligraphyExemplar`, `origamiFoldDiagram`,
   `weavingDraft`, `macrameKnot` — but no `crossStitchChart` case.
   Either:
   - (a) Add the `crossStitchChart` case to the renderer (small fix;
     copies the pattern of the existing cross-stitch admin preview at
     `apps/web/src/app/admin/dev/cross-stitch-preview/page.tsx`)
   - (b) Repurpose `craftChart` for cross-stitch by adapting
     `CraftChart` to dispatch to `renderCrossStitchChart()` when the
     definition shape matches.
   Recommendation: (a). The cross-stitch renderer is structurally
   distinct from crochet / knitting stitch-glyph charts and shouldn't
   share a dispatch.

2. **Seed the cross-stitch / tatting stitches in `data/stitches.ts`.**
   Either as part of the needlework-author prompt rev or as a separate
   data-only commit. The author prompt assumes the table is populated;
   the table is empty. List above gives a starter set of 13 entries.

3. **READING safety preamble — short or full?** The author prompt
   says "Every tutorial body carries a short `safetyNote` block" but
   gives the same four-point set for all types. A foundations READING
   article on thread starts has lower safety stakes than a multi-hour
   sampler PATTERN. **Proposed addition** under § "Per-type guidance"
   → READING: "READING tutorials may carry a shorter safety preamble
   focused on the practice-piece setup; full safety preamble for
   PATTERN and STITCH tutorials." Confirm with Rebecca.

4. **`crossStitchChart.attrs.definition` shape clarification.** The
   author prompt § "Charts" describes the `CrossStitchChart` shape
   but doesn't explicitly state that it goes inside an `attrs.definition`
   wrapper on the TipTap node — only that the chart JSON is "inline".
   The shape I used (mirroring the other chart node types) was
   `{ "type": "crossStitchChart", "attrs": { "definition": {...} } }`.
   **Proposed addition:** an explicit one-line example of the
   node-attrs shape, to match the other chart types.

5. **Chart-density guidance.** The alphabet border's chart carries
   ~210 sparse cells across 88 × 28 grid. The renderer handles this
   cleanly. A sampler with ~2,000 cells (a full alphabet plus initials
   plus a border) would likely fall outside the inline-JSON
   convenience zone and want either pagination or a chart-only sub-
   page. Worth a note for when patterns scale up.

---

## Summary

Both DRAFTs landed at appropriate lengths (sampler border ~1,400 words
plus a 210-cell chart; foundations reading ~1,500 words). Both pass the
voice-check em-dash rule deterministically. Both safety preambles are
present at body-prose-level.

Two infrastructure gaps flagged for Rebecca's review before the
sub-category flip:

1. **Master Stitch table needs needlework rows seeded** (data-only;
   small file edit).
2. **`crossStitchChart` TipTap node case needs to be wired in
   `tutorial-content.tsx`** (single case block in the public
   renderer).

The two drafts in this session work around both gaps (no
`craftStitchSlugs` set; chart definition is structurally valid and
will render the moment the case statement lands). Both gaps need a
fix before the cross-stitch sub-category flips to READY and the
autopilot starts churning.

Status: **ready for Rebecca's review, with the two infrastructure
gaps queued for a small fix-up session before the
cross-stitch sub-category flip.**
