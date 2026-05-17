# Sewing — test tutorial review notes

**Tutorials reviewed:**
- `simple-drawstring-bag` — PATTERN / accessories-small-projects / rectangle / BEGINNER
- `running-and-backstitch-by-hand` — TECHNIQUE / mending-visible-mending / hand-sewn / BEGINNER

**Session date:** 2026-05-17

---

## Preflight

- `docs/sewing-author.md` v1 exists.
- 15 sub-categories seeded under `sewing` Category per
  `seed-sewing-taxonomy.ts`: techniques, aprons-pinafores, bags-storage,
  homewares-soft-furnishing, curtains-blinds, baby-children, soft-toys,
  kitchen-table-linens, mending-visible-mending, quilting,
  reusable-household, christmas-seasonal, simple-clothing-rectangles,
  accessories-small-projects, pet-items.
- Fabrics `cotton-canvas`, `cotton-drill`, `quilting-cotton`, `calico`
  all present in `data/fabrics.ts`.
- Notions `thread-polyester`, `thread-cotton`, `drawstring-cord` all
  present in `data/sewing-notions.ts`.
- Tools `embroidery-scissors`, `needle-minder` present in `data/tools.ts`.
- Existing anchor brief `drawstring-tote-bag.json` was referenced for
  voice and construction guidance, but the new draft is the
  smaller-scale, single-channel variant the prompt called for, sitting
  under `accessories-small-projects` (the existing brief sits under
  `bags-storage`).

All green. No infrastructure gaps for the sewing pipeline.

---

## Voice register check

**Drawstring bag (PATTERN):** Voice is the "calm, factual,
hands-down-on-the-table" register the author prompt calls for.
Construction steps name the seam allowance, the chalk-mark positions,
the backstitch points, and the press steps in a deterministic order.
The hand-sewn alternative is presented as an equivalent path, not a
lesser one — matches the author prompt's "the finished bag is no
weaker either way."

No "easy" / "quick" / "simple" marketing language in body prose;
"starter project" and "first sewing project" are used as factual
descriptions, not as reassurance. No "you've got this!" pep. No brand
names — fabric is named by master-table slug, cord is "cotton or
polyester braided cord" without a YKK / Bondaweb-style endorsement.

**Hand-stitch foundations (TECHNIQUE):** Same register. The opening
paragraph names the two stitches and where each is used; the body
delivers each in the same shape (when to use, step-by-step on a
practice swatch, tension cue, finish). The "Reading the stitch length"
paragraphs are factual rather than impressionistic — the right
register for a foundation tutorial.

One register flag worth noting: "Keep the swatch in the sewing basket
for reference: when the stitch falters mid-project, the practice piece
is a quicker check than the manual." This is slightly more
conversational than the rest of the body. Decision: keep — it lands a
real practice tip without slipping into chatty.

No AI-poetry, no platitudes, no condescension.

---

## Em-dash audit

Both drafts pass the voice-check em-dash rule (max 1 per paragraph,
max 1 per sentence) on first pass, confirmed by
`/tmp/dash-check.mjs`. No rewrite pass needed.

---

## Safety preamble flow

Both tutorials open with an `infoPanel(tone: "warning")` block
directly after the intro.

**Drawstring bag:** covers pre-washing fabric, workspace setup,
sewing-machine safety (eye-level light, fingers clear of foot, stop
before adjusting), and iron safety. The four-point safety set is
appropriate to a machine project; if the reader uses the hand-sewn
alternative, the machine-specific notes are obviously inapplicable
and the hand-sewing notes from the second tutorial would be more
relevant. **Decision needed by Rebecca:** for tutorials that name
both a machine and a hand-sewn path, should the safety preamble
cover both? A small structural change to the author prompt's safety
guidance.

**Hand-stitch foundations:** covers lighting, posture, needle safety
(park in needle minder, never lap or sofa), eye breaks (every 20
minutes), and scissors. The hand-sewing-specific preamble is
appropriate to the technique tutorial.

Both safety blocks are body-prose-level, not asterisks or footnotes.

---

## Cross-link gaps

The two tutorials reference each other via `subTutorialCard`:
- `simple-drawstring-bag` → `running-and-backstitch-by-hand` (in the
  hand-sewn version section)
- `running-and-backstitch-by-hand` → `simple-drawstring-bag` (in
  related tutorials)

Both also implicitly relate to the existing `drawstring-tote-bag.json`
anchor brief (the two-channel variation is referenced in the "two-cord
closure" variation). When the anchor brief lands as a Tutorial in the
DB, that cross-link should be added; for now it lives in body prose
as "see the related drawstring-tote tutorial for the two-channel
construction" without a `subTutorialCard` slug.

---

## Tools and fabric registry hits

**Drawstring bag:**

| Slug | In master table | Named in body |
|---|---|---|
| Fabric: `cotton-canvas` | ✓ | ✓ ("around 330 gsm") |
| Fabric: `cotton-drill` | ✓ | ✓ ("around 270 gsm") |
| Fabric: `quilting-cotton` | ✓ | ✓ ("around 115 gsm") |
| Fabric: `calico` | ✓ | ✓ ("around 160 gsm") |
| Notion: `thread-polyester` | ✓ | ✓ ("All-purpose polyester thread, Tex 27") |
| Notion: `drawstring-cord` | ✓ | ✓ ("1 metre of drawstring cord or ribbon") |

Clean.

Tools named in body but NOT in `recipeTools`: sewing machine, iron,
pressing cloth, tape measure, dressmaking scissors, pins, tailor's
chalk, safety pin. None of these are in the master `Tool` table for
sewing kit; the cooking template's recipeTools convention is
extremely strict about including every named item. **Decision needed
by Rebecca:** does the sewing pipeline want every machine + iron +
pin + scissors entry in `recipeTools`, or is sewing kit handled as
"presumed-present hand-sewing supplies"? The wood test tutorial had
the same question for chopping blocks. Recommendation: a single
explicit entry per project for the major specialised tool (sewing
machine, iron) and the rest treated as default kit; the cooking
template's strictness reflects food safety, not sewing safety.

**Hand-stitch foundations:**

| Slug | In master table | Named in body |
|---|---|---|
| Fabric: `calico` | ✓ | ✓ |
| Notion: `thread-cotton` | ✓ | ✓ ("All-purpose cotton hand-sewing thread") |
| Tool: `embroidery-scissors` | ✓ | ✓ |
| Tool: `needle-minder` | ✓ (optional) | ✓ |

Clean. Hand-sewing needle named in body but not in `recipeTools`
(same caveat as above — hand-sewing needles are not in the master
`Tool` table; only tapestry needles are seeded).

---

## Glossary tooltips

**Drawstring bag** — registered: `casing`, `french-seam`,
`running-stitch`, `backstitch-hand`

Inline tooltip check:
- `casing` → ✓ (step 4)
- `french-seam` → ✓ (step 2 alternative)
- `running-stitch` → ✗ defined but not wrapped inline. Term is
  mentioned in the hand-sewn version section but the tooltip mark was
  not applied. **Fix needed:** wrap the first occurrence.
- `backstitch-hand` → ✓ (intro)

**Hand-stitch foundations** — registered: `running-stitch`,
`backstitch-hand`, `basting`, `stitch-length`

Inline tooltip check:
- `running-stitch` → ✓ (intro)
- `backstitch-hand` → ✓ (intro)
- `basting` → ✓ (intro)
- `stitch-length` → ✗ defined but not wrapped inline. Term is
  mentioned in the "Reading the stitch length" paragraphs but the
  tooltip mark was not applied. **Fix needed:** wrap one occurrence.

Same pattern as the herbal drafts — the self-critique pass needs a
deterministic check that walks `glossaryTerms` against
`glossaryTooltip` marks in body prose. Both gaps logged for the
autopilot self-critique rev.

---

## Sewing metadata

**Drawstring bag:**
- `craftType`: `'sewing'` ✓
- `projectShape`: `'rectangle'` ✓ (matches the locked-scope rule)
- `requiredFabricSlugs`: 4 alternatives listed ✓
- `requiredNotionSlugs`: 2 items ✓
- `sewingMethod`: `'mixed'` — the tutorial covers both machine and
  hand-sewn paths
- `fabricYardageMetres`: 0.5 ✓
- `finishedDimensionsCm`: `{ widthCm: 25, heightCm: 40 }` ✓
- `bodyMeasurementsRequired`: `[]` ✓

**Hand-stitch foundations (TECHNIQUE):**
- `craftType`: `'sewing'` ✓
- `projectShape`: `null` ✓ (TECHNIQUE rows leave this null)
- `requiredFabricSlugs`: `['calico']` ✓
- `requiredNotionSlugs`: `['thread-cotton']` ✓
- `sewingMethod`: `'hand-sewn'` ✓
- `fabricYardageMetres`: 0.1 ✓
- `finishedDimensionsCm`: `null` ✓
- `bodyMeasurementsRequired`: `[]` ✓

Both pass `validateInput()` cleanly.

---

## Hero images

Both tutorials: no hero set. Procedural cards will render at the
public site per the v5 appendix deferred-image rule.

**Drawstring bag:** Pexels and Wikimedia Commons have a wide range
of drawstring-bag photos (cotton totes, gift bags, shoe bags). The
pre-launch image sweep should look for a calico or canvas single-cord
bag photo, ideally with the casing and drawstring clearly visible.
Stock photos of branded marketing tote bags should be rejected per
the brand-removal rule.

**Hand-stitch foundations:** harder; the article teaches two stitches
on a swatch. Plausible candidates: a back-of-cloth photo showing
running-stitch and backstitch worked side by side on a sample
(Wikimedia has period sample swatches from Victorian needlework
plates that could serve), or a procedural card. Procedural is the
right fallback unless the sweep finds a strict-match photograph.

---

## Schema / data gaps flagged

1. **Hand-sewing needles not in the master Tool table.** Only tapestry
   needles (sizes 18-28) are seeded. The author prompt for sewing
   assumes a hand-sewing-needle slug exists when authoring hand-sewn
   tutorials; the table doesn't have one. Proposed entries:
   `hand-sewing-needle-7` (everyday), `hand-sewing-needle-8` (light
   cotton), and possibly `hand-sewing-needle-5` (heavyweight).
   Low-priority; doesn't block this session's drafts (they reference
   the size in body prose only) but worth seeding before the
   autopilot starts running mending and hand-sewn tutorials.

2. **Sewing kit master coverage.** Sewing machine, iron, pressing
   cloth, tape measure, dressmaking scissors, pins, tailor's chalk
   — none of these are in `data/tools.ts`. Sewing kit is treated as
   default kit in this session, but the author prompt's wording on
   `recipeTools` suggests every named item should resolve. Decision
   needed: either seed a sewing-kit set (sewing-machine,
   sewing-iron, dressmaking-scissors, etc.) or accept the "presumed-
   present" convention.

3. **`sewing.sewingMethod = 'mixed'`** is accepted by the validator
   but is not in the documented `SewingMethod` type:
   ```ts
   export type SewingMethod = 'hand-sewn' | 'machine' | 'mixed'
   ```
   Actually 'mixed' IS in the union. Confirmed clean. Noting here
   because the wording in the body talks about "machine version + hand
   version" rather than "mixed construction" — the field captures the
   choice-of-path tutorial pattern correctly.

---

## Proposed changes to docs/sewing-author.md

These are proposals only. Rebecca decides what to apply before the
autopilot goes live.

1. **Safety preamble for dual-path tutorials.** When a PATTERN covers
   both machine and hand-sewn paths, the current author prompt's safety
   preamble guidance is machine-leaning. **Proposed addition:** under
   the safety preamble section, a paragraph naming that dual-path
   tutorials should combine the four-point machine safety set with the
   four-point hand-sewing safety set (lighting, posture, needle
   storage, eye breaks). Or alternatively split into two separate
   `infoPanel` blocks, machine and hand.

2. **Hand-sewing-needle slugs in the master Tool table.** The author
   prompt § "Per-type guidance — TECHNIQUE" mentions needles in the
   recipeTools list but doesn't specify slugs for hand-sewing
   needles (only tapestry needles for needlework). Add a seed entry
   (or three) to `data/tools.ts` and reference in the author prompt.

3. **Sewing-kit "presumed-present" convention.** Clarify whether the
   author should add sewing machine + iron + pins + scissors etc. to
   `recipeTools` on every PATTERN, or treat them as default kit not
   needing explicit listing. The wood test tutorials raised the same
   question about chopping blocks. Same answer should work here.

4. **`projectShape` for unconstructed dual-rectangle bags.** The
   drawstring bag uses `'rectangle'` which is accurate — it is
   constructed from two rectangles. But it could equally be
   `'panel-construction'` (two rectangles joined into a shape). The
   author prompt's definitions don't strictly disambiguate. Suggestion:
   `'rectangle'` for items that ARE a rectangle when finished (a tea
   towel, a napkin); `'panel-construction'` for items built FROM
   rectangles that become a shape (a tote, a cushion cover). Worth a
   one-line clarification.

5. **Glossary tooltip coverage self-critique step.** Same as the
   herbal anti-tells finding: the self-critique pass should
   deterministically check that every `glossaryTerms` entry appears
   wrapped in `glossaryTooltip` at least once in body prose.

---

## Summary

Both DRAFTs landed at moderate lengths (drawstring bag ~1,400 words,
hand-stitch foundations ~1,500 words). Both pass the voice-check
em-dash rule deterministically. Both safety preambles are present.
Two minor glossary-tooltip gaps flagged (drawstring bag:
`running-stitch`; hand-stitch foundations: `stitch-length`).

Three small infrastructure suggestions queued for the sewing master
data (hand-sewing-needle slugs, sewing-kit coverage convention,
dual-path safety guidance). None block the test-tutorial review
or the autopilot flip; all sit at the author-prompt revision level.

Status: **ready for Rebecca's review and the
accessories-small-projects + mending-visible-mending sub-category
flip decisions.**
