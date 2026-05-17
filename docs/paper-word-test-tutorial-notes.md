# Paper & word — test tutorial review notes

**Tutorials reviewed:**
- `single-signature-pamphlet-binding` — PATTERN / bookbinding / BEGINNER
- `foundational-hand-basic-strokes` — TECHNIQUE / calligraphy / BEGINNER

**Session date:** 2026-05-17

---

## Preflight

- `docs/paper-word-author.md` v1 exists.
- 9 sub-categories seeded under `paper-word` Category per
  `seed-paper-word-taxonomy.ts` (bookbinding, calligraphy,
  papermaking, marbling, papercutting, journalling-craft, zines,
  scrapbooking, origami).
- Calligraphy exemplar renderer landed at
  `apps/web/src/lib/chart-renderers/calligraphy-exemplar.tsx` (commit
  61386b6); `calligraphyExemplar` TipTap node case wired in
  `tutorial-content.tsx`.
- Origami fold-basic renderer landed; `origamiFoldDiagram` TipTap
  node case wired.
- Tools `bookbinding-awl`, `bookbinding-needle`,
  `bookbinding-thread-linen`, `bone-folder`, `cartridge-paper-130`,
  `nib-mitchell-roundhand-3`, `straight-pen-holder`, `iron-gall-ink`
  all present in `data/tools.ts`.

All green. No infrastructure gaps for paper-word — this is the
cleanest pipeline preflight of the five categories in this session.

---

## Voice register check

**Pamphlet binding (PATTERN):** Voice is calm and instructional. The
opening paragraph cites Cockerell (1901) for the canonical source and
names the construction in three sentences. Step-by-step body uses
deterministic language — "pierce all three stations before moving to
the sewing", "the centre hole acts as the registration anchor for the
other two" — that reads as a working bookbinder explaining rather
than a marketing tutorial. No twee craft-cute phrasing.

**Foundational hand (TECHNIQUE):** Same register, with the
calligraphy-specific specificity the author prompt calls for. The
strokes are described with the geometric precision required for the
ductus to translate from prose to nib — "the body of the stroke is
the thickest the nib can lay down — perpendicular to the 30° angle".
No "you've got this!" pep around the difficulty of learning a new
hand. The opening paragraph plants the seven strokes as the
foundation; the practising paragraph reinforces it.

No AI-poetry, no platitudes, no condescension. Both drafts read as
period-accurate calligraphy-and-bookbinding writing.

One register note: the pamphlet binding's "open flat, lies flat,
lasts as long as the paper does" in the intro is a tricolon — the
common-issues anti-tells list flags tricolons as `[warn]` (rewrite
preferred but not required). The three items here are factual
attributes of a well-bound pamphlet, not padding. Decision: keep.

---

## Em-dash audit

Both drafts pass the voice-check em-dash rule (max 1 per paragraph,
max 1 per sentence) on first pass, confirmed by
`/tmp/dash-check.mjs`. No rewrite pass needed.

---

## Safety preamble flow

Both tutorials open with an `infoPanel(tone: "warning")` block
directly after the intro.

**Pamphlet binding:** workspace (cutting mat, light), awl safety
(pierce away from the body, brace the signature, never as a marking
tool), needle storage (pincushion or magnet, never lap or sofa),
thread tension (snug not tight — paper-cutting risk). The
bookbinding-adhesive preamble from the author prompt is not relevant
to this tutorial (the pamphlet binding uses no adhesive).

**Foundational hand:** workspace (flat or angled surface, masking
tape, clean cloth under the writing hand), ink safety (iron-gall
stains semi-permanent; cap the bottle; never in the cross-path),
nib safety (manufacturing coating removal; handle by the back of the
nib), eye fatigue (small x-height reads heavily; 5-minute breaks
every 20 minutes; daylight task lamp).

Both safety blocks are body-prose-level, not asterisks. Both are
proportional to the actual risks of the activity (low-stakes for
both; paper, ink, and small sharp implements rather than power tools
or chemistry).

---

## Cross-link gaps

The two tutorials reference each other via `subTutorialCard`. Both
slugs resolve once both DRAFTs land in the DB.

**Tutorials referenced in body prose but not as `subTutorialCard`
links:**
- Pamphlet binding mentions a "five-hole stitch (taller book)" as a
  variation but no separate tutorial exists. Variation is documented
  inline, not as a cross-link. This is appropriate; the variation is
  a small extension of the three-hole construction, not a separate
  tutorial.
- Foundational hand mentions "the next tutorial in this sequence
  works the seven strokes into the lower-case Foundational alphabet"
  — no slug yet. The next-step tutorial would be
  `foundational-hand-lower-case-alphabet` or similar; not in this
  batch. The autopilot will pick this up later.

No placeholder slugs logged to `missing-techniques.md` from this
batch.

---

## Tools registry hits

**Pamphlet binding:**

| Slug | In tools.ts | Named in body |
|---|---|---|
| `bookbinding-awl` | ✓ | ✓ ("bookbinder's awl") |
| `bookbinding-needle` | ✓ | ✓ ("blunt needle") |
| `bookbinding-thread-linen` | ✓ | ✓ ("waxed linen bookbinding thread, 4-cord") |
| `bone-folder` | ✓ | ✓ |

Clean. Items in body but not in `recipeTools`: ruler, pencil, clips
or weights — all standard everyday kit not in the master Tool table.

**Foundational hand:**

| Slug | In tools.ts | Named in body |
|---|---|---|
| `nib-mitchell-roundhand-3` | ✓ | ✓ |
| `straight-pen-holder` | ✓ | ✓ |
| `iron-gall-ink` | ✓ | ✓ |
| `cartridge-paper-130` | ✓ | ✓ |
| `bone-folder` | ✓ (optional) | ✓ |

Clean.

---

## Glossary tooltips

**Pamphlet binding** — registered: `signature`, `sewing-station`,
`head-and-tail`, `kettle-stitch`

Inline tooltip check:
- `signature` → ✓ (intro)
- `sewing-station` → ✓ (step 2)
- `head-and-tail` → ✓ (step 2)
- `kettle-stitch` → ✓ (step 5, item 5)

All registered terms used inline. Clean.

**Foundational hand** — registered: `broad-edge-nib`, `nib-angle`,
`x-height`, `ductus`

Inline tooltip check:
- `broad-edge-nib` → ✓ (setting-up paragraph)
- `nib-angle` → ✓ (intro)
- `x-height` → ✓ (intro)
- `ductus` → ✓ (basic-strokes paragraph)

All registered terms used inline. Clean. **First batch in this
session with zero glossary-tooltip gaps on either tutorial.**

---

## Renderer integration — calligraphyExemplar

The Foundational hand tutorial uses 7 inline `calligraphyExemplar`
TipTap blocks (one per basic stroke). Each carries an
`attrs.definition` matching the `CalligraphyExemplarDefinition`
shape from `apps/web/src/lib/chart-renderers/types.ts`:

- `alphabet`: `'foundational-lower'` for all 7 (one of the 3 seeded
  alphabets — confirmed in the type union)
- `letter`: a Unicode glyph representing the stroke (│ ─ ╲ ╱ ◗ • ⌒)
  rather than an actual letter — the stroke exemplars are abstract
  shapes, not letters. **Decision needed by Rebecca:** the renderer's
  `letter` field was designed for an actual letter (e.g. "a", "B");
  using box-drawing characters works but is unconventional. Either
  (a) the field should be relaxed to allow descriptive labels
  ("vertical downstroke"), or (b) the stroke exemplars use the
  letter most associated with that stroke (e.g. "l" for the vertical,
  "o" for the bowl). Recommendation: rename `letter` to `glyph` or
  `label` and accept any descriptive string. Low priority; current
  shape renders.
- `nibAngle`: `30` ✓ (Foundational standard)
- `xHeight`: `4` ✓ (Foundational standard)
- `guideLines`: `['ascender', 'x-height', 'baseline']` or subset per
  stroke ✓
- `ductus`: 1-stroke per exemplar (the basic-stroke tutorial; the
  alphabet tutorials will use multi-stroke ducti) ✓

The SVG paths are hand-written in the 100×100 unit box per the
renderer's convention. The strokes will render but may not visually
match Edward Johnston's plates with full fidelity — the stroke
geometry is approximated. **Proposal:** a future pass should
calibrate the path coordinates against scanned Johnston plates from
the Project Gutenberg edition (#34879) for greater fidelity.

For this DRAFT, the exemplars demonstrate the shape and the renderer
integration; the autopilot can pull in higher-fidelity paths once the
calibration work is done.

---

## Schema / data gaps flagged

1. **`CalligraphyExemplarDefinition.letter` field naming.** The
   field name implies an actual letter, but the seven basic strokes
   are abstract shapes. Either rename the field (to `glyph` or
   `label`), relax the field semantics, OR write the basic-strokes
   tutorial to use letter-mnemonics ("the vertical stroke as it
   appears in l", "the bowl curve as it appears in b"). The current
   draft uses box-drawing characters; this works at the renderer
   level but isn't ideal.

2. **Foundational stroke geometry calibration.** Pre-launch, the
   stroke SVG paths should be calibrated against scanned Johnston
   plates for higher fidelity. Low priority; the strokes render now
   and demonstrate the renderer integration.

3. **`craftType` for paper-word PATTERN / TECHNIQUE rows.** The
   pamphlet binding does not set a `sewing` block (it's not a sewing
   tutorial). The upload validator says: "Wood-natural-craft,
   pottery-ceramics, and other craft-category PATTERN rows carry
   only `recipeTools` and no additional metadata block." Per the
   wood test tutorial precedent, the upload script derives
   `craftType` from `categorySlug` for paper-word rows. Both drafts
   in this session omit the sewing / crochet / knitting blocks
   entirely. Confirmed clean.

---

## Hero images

Both tutorials: no hero set. Procedural cards will render at the
public site per the v5 appendix deferred-image rule.

**Pamphlet binding:** strong sources exist. Project Gutenberg's
Cockerell edition (#14921) has period engravings of pamphlet stitch
construction. Wikimedia Commons has photographs of hand-bound
single-signature pamphlets (Internet Archive's bookbinding category
is also rich). The pre-launch image sweep should land a real-photo
hero showing a finished cream-cover pamphlet open flat at the spine.

**Foundational hand:** Project Gutenberg's Johnston edition (#34879)
has the canonical plates of the seven basic strokes — these are the
ideal hero. Wikimedia Commons has scans of Johnston exemplar pages.
The pre-launch sweep should target Plate 4 or Plate 6 from the 1906
edition.

---

## Proposed changes to docs/paper-word-author.md

These are proposals only. Rebecca decides what to apply before the
autopilot goes live.

1. **`CalligraphyExemplarDefinition.letter` field semantics.** See
   schema gap above. Either rename the field or update the author
   prompt to specify that the field accepts descriptive labels for
   basic-stroke tutorials and actual letters for letter exemplars.

2. **Bookbinding pamphlet — recipeTools convention for everyday
   tools.** Ruler, pencil, weights, clips are named in body prose
   but not in `recipeTools`. Same recurring question across wood,
   sewing, needlework. The author prompt should pick a convention
   (either "every tool named in body must be in recipeTools" or
   "everyday-kit tools are implied"). Currently inconsistent.

3. **Adjective-restraint for instructional ductus prose.** The
   Foundational hand body uses concrete geometry vocabulary
   ("perpendicular to the 30° angle", "the nib's edge is nearly
   aligned with the stroke direction") which reads well. A worker
   tempted to soften this with "the thickest you can lay" or "the
   pen wants to" should be redirected to the geometry. **Proposed
   addition:** under § "Voice rules — soft", a calligraphy-specific
   note: "Stroke prose names geometry, not feeling. The nib doesn't
   want anything; the thickness comes from the angle."

4. **Practice-time guidance.** The Foundational hand tutorial says
   "twenty minutes total" for practising all 7 strokes. The author
   prompt doesn't currently differentiate practice-time targets from
   project-time targets. **Proposed addition:** under § "Per-type
   guidance" → TECHNIQUE, a sentence: "Calligraphy TECHNIQUE
   tutorials may name a practice-time target rather than a
   completion target — the reader is learning a movement, not
   producing a finished piece."

---

## Summary

Both DRAFTs landed at the targeted lengths (pamphlet binding
~1,400 words, Foundational hand ~1,800 words plus 7 inline
calligraphy exemplar renderings). Both pass the voice-check em-dash
rule deterministically. Both safety preambles are present and
proportional. **Both have zero glossary-tooltip gaps** — the first
batch in this session to land clean on that check first try.

One schema-naming proposal flagged (`CalligraphyExemplarDefinition.letter`)
for Rebecca's review. One stroke-geometry calibration suggestion for
a later pass. No infrastructure gaps block the bookbinding or
calligraphy sub-category flips.

Status: **ready for Rebecca's review and the bookbinding +
calligraphy sub-category flip decisions.**
