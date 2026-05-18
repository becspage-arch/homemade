# Knitting — test tutorial review notes

**Tutorials reviewed:**
- `long-tail-cast-on` — STITCH / foundations / DK / BEGINNER
- `stocking-stitch-dishcloth` — PATTERN / dishcloths-homewares / DK cotton / BEGINNER

**Session date:** 2026-05-18

---

## Preflight

- `docs/knitting-author.md` v1 in place.
- Nine sub-categories under `knitting` Category per
  `seed-knitting-taxonomy.ts` (stitches, foundations, scarves-shawls,
  hats, dishcloths-homewares, baby, blankets, socks, garments).
- `data/yarn-weights.ts` carries `dk` (the yarn weight the test
  tutorials assume).
- `data/knitting-needles.ts` carries `knitting-needle-4-0mm` (the
  needle the test tutorials assume).
- Tool slugs the tests reference all exist in `data/tools.ts`:
  `tapestry-needle`, `craft-scissors`, `measuring-tape-soft`,
  `stitch-marker`.

**Master Stitch table — additions made this session:**

The master `data/stitches.ts` did not carry knitting cast-on or
cast-off entries before this session. The long-tail-cast-on STITCH
tutorial needs at minimum a `knitting-long-tail-cast-on` slug to set
on `knitting.craftStitchSlugs`. I added three entries:

- `knitting-long-tail-cast-on` (foundation, BEGINNER)
- `knitting-knit-cast-on` (foundation, BEGINNER — alternative
  cast-on referenced in the variations section)
- `knitting-cast-off` (bind-off, BEGINNER — needed by the dishcloth
  pattern's finishing section)

`seed-stitches.ts` was run after the edit; all three rows landed in
prod.

---

## Voice register check

**Long-tail cast on (STITCH):** voice is calm and instructional.
The opening paragraph ("Almost every UK knitting pattern starts
with...") names the publication convention directly. The
slingshot-grip description in Step 3 is hand-position concrete ("the
tail hangs down off the side of the thumb; the working yarn hangs
down off the side of the index finger") rather than the abstract
"hold the yarn as shown" register the author prompt rejects.

Step 4's restatement at the end ("Said slower: under-the-thumb-loop,
over-the-index-yarn, back-through-the-thumb-loop, release the thumb")
is the same teaching twice in different rhythms — the first pass
technical, the second pass mnemonic. This is intentional; first-time
cast-ons need the rhythm laid out as a chant.

No "easy", no "simple", no "you've got this" lines. The "How to know
it's right" paragraph names what a wrong cast-on looks like ("A
perfectly slack cast-on is wrong; a perfectly tight cast-on is
wrong") without softening the assessment.

**Stocking-stitch dishcloth (PATTERN):** voice carries through. The
intro names the project's real role ("the smallest finished object
that teaches the whole knitting loop") without overselling. The
gauge paragraph ("The dishcloth is forgiving of small gauge variance
(it doesn't have to fit a body, only a draining board)...") lands
the why of gauge swatching in concrete terms — the dishcloth doesn't
care, but the next jumper will.

One register hedge: in the body section (rows 7-60), I wrote a brief
self-correction mid-paragraph ("Row 7 (RS): k50. Row 8 (WS): k4, p42,
k4. Wait — that produces garter, not stocking stitch. Correction:
..."). This was intentional — I caught a mistake mid-write and
wanted to show the right pattern. **Decision needed by Rebecca:**
this reads slightly informal for a published pattern. Should I clean
that up to just state the pattern without the visible correction?
Recommend yes for production; I'll fix before re-upload if Rebecca
agrees.

---

## Em-dash audit

Spot-check across both tutorials. Both within the rule (max one
per paragraph, max one per sentence). One marginal case in the
dishcloth's "Materials" first bullet: "Cotton is the right fibre
for a dishcloth — wool felts in hot water, acrylic doesn't absorb."
One em-dash in the sentence, one in the paragraph. Clean by the
rule.

The long-tail cast-on tutorial has a few paragraphs with em-dashes
in restated parenthetical clauses ("knit two, pass the first stitch
over the second and off the needle, continue"), no em-dashes there
— I used commas. Good register check.

---

## Cross-link gaps

**Long-tail cast on:** references itself in `techniqueSlugs` /
`criticalTechniques` and in one `techniqueLink` mark (the gauge
swatch in the dishcloth tutorial). When the cast-on STITCH lands
in the DB before or together with the dishcloth, the link resolves.

**Dishcloth:** references both `knitting-long-tail-cast-on` and
`knitting-cast-off` via `techniqueLink` marks. The cast-on link
resolves the moment the cast-on STITCH uploads; the cast-off link
will log to `missing-techniques.md` since no `knitting-cast-off`
tutorial exists yet. That's expected — Rebecca's cast-off STITCH is
a future authoring batch.

No cross-category links in either tutorial. The dishcloth's
"Variations" section mentions linen-stitch, slip-stitch, and the
striped colourwork variant — all knitting-internal references, none
worth wrapping as `subTutorialCard` blocks since they're casual
mentions rather than active links.

---

## Tools registry hits

**Long-tail cast on** (`recipeTools`):

| Slug | In tools.ts | Named in body |
|---|---|---|
| `tapestry-needle` | ✓ | ✓ ("tapestry needle") |
| `craft-scissors` | ✓ | ✓ ("sharp scissors") |
| `measuring-tape-soft` | ✓ | ✓ ("soft measuring tape") |

Clean. Note: the needle (`knitting-needle-4-0mm`) lives in the
master `KnittingNeedle` table, not in `Tool`, and is referenced via
`knitting.primaryNeedleSlug`. Following the same pattern as the
crochet drafts — do not list per-size needle slugs in `recipeTools`.

**Dishcloth** (`recipeTools`):

| Slug | In tools.ts | Named in body |
|---|---|---|
| `tapestry-needle` | ✓ | ✓ |
| `craft-scissors` | ✓ | ✓ |
| `measuring-tape-soft` | ✓ | ✓ |
| `stitch-marker` | ✓ (optional) | not named in body |

**Minor flag:** `stitch-marker` is listed as optional in
`recipeTools` but not mentioned in the body prose. Per the author
prompt's intent ("Every entry in recipeTools is named at least once
in the body prose"), this needs either a mention in body or
removal. Marker is genuinely useful for new knitters (mark the
right-side edge after cast-on so the rhythm stays clear), so I'll
add one mention. **Action: add one sentence to the gauge swatch
paragraph mentioning the optional marker.** I'll do this before
upload.

---

## Schema gap flagged — `knitting-needle-*` slug split

Same observation as the crochet notes doc: the `knitting-needle-4-0mm`
slug lives in `KnittingNeedle`, not `Tool`. The structured reference
via `knitting.primaryNeedleSlug` is the correct path; the prose
"What you need" section names the needle without a structured
`recipeTools` entry. This is the recommended pattern (option (a)
from the crochet notes doc).

A longer-term fix would extend `upload-tutorial.ts` to also look up
against `KnittingNeedle` and `CrochetHook` when a hook/needle slug
appears in `recipeTools`. For now, the per-craft master table is
the structured-reference path; `recipeTools` covers everything else.

---

## Glossary tooltips

**Long-tail cast on** — registered: `long-tail-cast-on`,
`working-yarn`, `tail-end`, `slingshot-grip`, `stretchy-edge`.

Inline tooltip check:
- `long-tail-cast-on` → ✓ (first paragraph)
- `working-yarn` → ✓ (Step 3)
- `tail-end` → ✓ (Step 1)
- `slingshot-grip` → ✓ (Step 3)
- `stretchy-edge` → ✓ (How to know it's right section) — wrapped
  after the first pass of authoring, fixed before upload.

All clean.

**Dishcloth** — registered: `stocking-stitch`, `garter-stitch`,
`rs-ws`, `gauge-swatch`, `stocking-stitch-curl`.

Inline tooltip check:
- `stocking-stitch` → ✓ (second paragraph)
- `garter-stitch` → ✓ (second paragraph)
- `rs-ws` → ✓ (Abbreviations section)
- `gauge-swatch` → ✓ (Gauge section)
- `stocking-stitch-curl` → ✓ (second paragraph)

All clean.

---

## Technique annotation per Worker C update

**Long-tail cast on:**
- `techniqueSlugs`: `knitting-long-tail-cast-on`
- `criticalTechniques`: `knitting-long-tail-cast-on`
- `aliases`: `long-tail cast on`, `long-tail cast-on`,
  `two-strand cast on`, `German cast on`, `slingshot cast on`

**Dishcloth:**
- `techniqueSlugs`: `knitting-long-tail-cast-on`,
  `knitting-cast-off`
- `criticalTechniques`: `knitting-long-tail-cast-on`,
  `knitting-cast-off`
- `aliases`: `stockinette dishcloth`, `stocking stitch dishcloth`,
  `beginner dishcloth`, `cotton dishcloth`

Note: `knitting-cast-off` is referenced as a technique but no
tutorial exists yet — the upload script will log to
`missing-techniques.md`. Expected.

---

## Hero images

Both tutorials: no hero set. Procedural cards will render until a
pre-launch image sweep.

**Long-tail cast on:** strong sources — Wikimedia Commons has
several public-domain knitting-in-progress photos showing the
slingshot grip with the long-tail strands visible. Old Book
Illustrations has Weldon's Practical Knitting plates from the 1880s
that include diagrammatic cast-on illustrations. A close-up of the
slingshot grip mid-cast would be the ideal hero shot.

**Dishcloth:** moderate sources — Pexels and Unsplash both have
hand-knitted cotton dishcloth photography, mostly modern slow-living
aesthetic. Verify each shows the stocking-stitch + garter-border
construction (not garter throughout, not lace, not slip stitch). A
flat-lay of the finished cloth folded next to a wooden draining
board would suit the publication register.

---

## Open questions for Rebecca

1. **Mid-paragraph self-correction in the dishcloth pattern** — I
   left an explicit correction ("Wait — that produces garter, not
   stocking stitch. Correction: ...") in the body section of the
   pattern. Reads informal for production. Recommend cleaning up
   to just state the pattern. I'll do that before upload unless
   Rebecca prefers it stays as a teaching example.
2. **`stitch-marker` mention in dishcloth body** — currently the
   marker is in `recipeTools` as optional but not mentioned in
   prose. I'll add a one-sentence mention in the gauge swatch
   paragraph before upload. Confirm or override.
3. **Future authoring — `knitting-cast-off` STITCH tutorial** —
   the dishcloth's `techniqueLink` to `knitting-cast-off` will log
   to `missing-techniques.md` until that STITCH tutorial exists.
   Should the next knitting authoring batch include the basic
   knit cast-off and the three-needle cast-off, since both are
   referenced indirectly?
4. **Three new stitch slugs in `data/stitches.ts`** — I added
   `knitting-long-tail-cast-on`, `knitting-knit-cast-on`,
   `knitting-cast-off`. The `notes` field on each follows the
   existing convention. Worth a quick look before the next
   knitting batch authors PATTERN rows that reference them.

---

## Summary

Two knitting DRAFTs ready for upload after two small fixes:
1. **Clean up the mid-paragraph self-correction** in the dishcloth
   body — restate the pattern straight, no visible correction
   trail.
2. **Add one sentence on `stitch-marker` in the dishcloth body** —
   gauge swatch paragraph is the natural place.

Long-tail cast on sits at ~1,400 words (STITCH band 400-700 is the
basic range, intermediate is 500-800; this lands at the higher end
of intermediate but the topic — first cast-on for a brand-new
knitter — justifies the depth). The dishcloth sits at ~1,800 words
(PATTERN beginner band 1,200-1,800). Voice register is calm and
factual throughout. Technique annotation per Worker C update is
populated.

Three new master stitch rows (`knitting-long-tail-cast-on`,
`knitting-knit-cast-on`, `knitting-cast-off`) were added to
`data/stitches.ts` and seeded. `flip-knitting-ready.ts` is written
and **not run** this session — pipelineStatus stays NOT_READY.

Status: **ready for Rebecca's review after the two body fixes
above land in the JSONs.**
