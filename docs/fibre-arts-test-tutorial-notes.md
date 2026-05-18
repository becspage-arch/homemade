# Fibre arts — test tutorial review notes

**Tutorials reviewed:**
- `wet-felting-a-soap-covering` — TECHNIQUE / felting / merino / BEGINNER
- `plain-weave-on-a-cardboard-loom` — TECHNIQUE / weaving / cotton warp / BEGINNER

**Session date:** 2026-05-18

---

## Preflight

- `docs/fibre-arts-author.md` v1 in place.
- Six sub-categories under `fibre-arts` Category per
  `seed-fibre-arts-taxonomy.ts` (felting, spinning, weaving,
  natural-dyeing, macrame, rug-making).
- `data/craft-materials.ts` carries fibre-arts entries
  (`wool-roving-merino` for felting; `cotton-weaving-warp` and
  `linen-weaving-warp` for weaving).
- Tool slugs the tests reference all exist in `data/tools.ts`:
  `tea-towel`, `olive-oil-soap-felting`, `felting-net`,
  `bamboo-rolling-mat` (felting); `craft-scissors`, `ruler`,
  `tapestry-needle` (weaving).

No master-table gaps flagged at preflight. Both sub-categories
chosen represent different breadths of the fibre-arts surface
(felting + weaving) per the worker brief.

---

## Voice register check

**Wet-felting a soap covering (TECHNIQUE):** voice is calm and
factual. The opening paragraph names what the technique is and why
the soap-as-resist version is the "smallest, fastest, most forgiving
introduction" without overselling. The infoPanel safety block uses
direct register — "Test with the back of the wrist; if it's
uncomfortable but not painful, it's about right" — which suits the
fibre-arts author prompt's hands-on-specificity rule.

The fibre-arts author prompt explicitly bans
"magical / mystical / soulful" framing common in the wild. Spot-check:
no "the ancient craft of felting", no "this is meditation in wool",
no spiritual claims. Wool is described in physical terms (barbed
scales, interlocking fibres, fulling), water is described in
physical terms (50-60°C). Clean.

The "Step 6 — Pinch test" paragraph uses a concrete failure-finding
test ("If a tuft comes away in your fingers, keep rubbing") — the
hands-on-specificity register the author prompt prescribes for
fibre-arts.

**Plain weave on a cardboard loom (TECHNIQUE):** voice carries
through. The opening establishes the place of plain weave in the
world ("Linen sheets, calico, wool tweed, tartan, your tea towel:
all plain weave") which grounds the technique without romanticising
it. The shed-stick paragraph in Step 7 names the move that scales:
"changes the weave from a one-thread-at-a-time process to a
row-at-a-time process, and is the move that unlocks faster weaving
on every loom that exists." Factual scaling claim, not lyrical.

One soft-register flag: the "Where this technique goes next" section
of both tutorials uses phrasing close to "The same move scales up..."
which is the author prompt's preferred frame for foundational
techniques. Consistent across both, fine.

No "easy", no "simple", no "magical", no "you've got this" lines in
either tutorial.

---

## Em-dash audit

Spot-check across both tutorials. Both within the rule (max one
per paragraph, max one per sentence) on a manual scan. The weaving
tutorial's "Step 4 — First weft pick" paragraph has em-dashes in two
adjacent clauses ("Pass the needle ... under the first warp thread,
over the second, under the third, over the fourth — alternating
over-and-under all the way across the loom. The needle leaves the
weft draped through the alternating warps."), but they're in
separate sentences, so still within rule.

The felting tutorial's pinch-test paragraph uses an em-dash for the
short technical aside ("If you can lift only one or two fibres away
from the rest, the felt has formed") — clean.

---

## Cross-link gaps

**Wet-felting a soap covering:** no `subTutorialCard` blocks.
`techniqueSlugs[]` contains `wet-felting-flat-panel` (a planned
TECHNIQUE in the felting sub-category that doesn't exist yet) —
the upload script will log it to `missing-techniques.md`.
`criticalTechniques` is empty (this is the foundational technique,
not a derivative). This is appropriate.

**Plain weave on a cardboard loom:** no `subTutorialCard` blocks
and `techniqueSlugs[]` empty. The "Where this technique goes next"
section mentions frame looms, rigid heddle looms, four-shaft floor
looms, and tapestry weaving as next steps — none currently exist as
tutorials, and all would be too speculative to wrap as
`techniqueLink` marks. Plain weave on a cardboard loom is itself
the foundational technique; nothing more foundational sits beneath
it.

**No cross-category links** in either tutorial. The fibre-arts
author prompt requires natural-dyeing entries to link to Garden +
Herbal references; neither of these tutorials is in natural-dyeing,
so the rule doesn't apply.

---

## Tools registry hits

**Wet-felting** (`recipeTools`):

| Slug | In tools.ts | Named in body |
|---|---|---|
| `tea-towel` | ✓ | ✓ ("tea towel") |
| `olive-oil-soap-felting` | ✓ | ✓ ("olive-oil soap") |
| `felting-net` | ✓ (optional) | ✓ ("felting net") |
| `bamboo-rolling-mat` | ✓ (optional) | ✓ ("bamboo or reed mat") |

Clean.

**Plain weave** (`recipeTools`):

| Slug | In tools.ts | Named in body |
|---|---|---|
| `craft-scissors` | ✓ | ✓ ("scissors") |
| `ruler` | ✓ | ✓ ("ruler") |
| `tapestry-needle` | ✓ | ✓ ("tapestry needle") |

Clean.

**Tools mentioned in body but NOT in `recipeTools`:**

- **Cardboard rectangle** — the loom itself. Not in `Tool` because
  the loom is improvised. Same logic as the kitchen-counter
  felting setup. **Decision needed by Rebecca:** should
  improvised / repurposed materials get a `tools.ts` entry like
  `improvised-cardboard-loom` so they show up in the structured
  tool list, or are they correctly left out of the master table?
  Recommendation: leave them out — `Tool` is purchasable / nameable
  kit, not improvised setups.
- **Stick for the shed** (Step 7) — same logic. Could be a
  chopstick, a knitting needle, a ruler. Improvised, not in `Tool`.
- **Comb for beating** — same; could be a hair comb or a kitchen
  fork.
- **Cotton warp thread, weft yarn** — these are `CraftMaterial`
  rows (`cotton-weaving-warp`), not `Tool` rows. Currently the
  upload script does not handle `requiredCraftMaterials` from the
  JSON (the field is on the Tutorial table per the pottery
  migration but the upload script doesn't read it). See schema
  gap flagged below.

---

## Schema gap flagged — `requiredCraftMaterials` not wired through upload

The Tutorial schema (added by `phase_pottery_pipeline_001`) has a
`requiredCraftMaterials String[]` column intended to carry slug
references to the master `CraftMaterial` table. The fibre-arts
author prompt documents the field — `requiredCraftMaterials:
["wool-roving-merino", "olive-oil-soap"]` — and expects the upload
script to validate against the master table.

`upload-tutorial.ts` does not currently read `requiredCraftMaterials`
from the input JSON. So a fibre-arts tutorial setting the field has
no effect — the value drops on the floor and the Tutorial row's
column stays the default empty array.

**Resolutions, in increasing complexity:**

1. **(a) Leave the column empty for now.** Both test tutorials
   omit the field in their JSON. Acceptable while the fibre-arts
   pipeline is in scaffold; the field can be backfilled when the
   feature ships.
2. **(b) Extend `upload-tutorial.ts`** to read the field from
   input JSON, validate slugs against `CraftMaterial`, and write
   to the `requiredCraftMaterials` array. Same pattern as
   `recipeTools` for `Tool`. A modest change.

**Recommended:** option (b) before the fibre-arts autopilot flips
to READY. Until then, option (a) is the working state — the test
tutorials in this session omit the field rather than carry it.

This is the same kind of gap the needlework test session flagged
for `crossStitchChart` — schema column exists, infrastructure isn't
fully wired yet. Worth a small follow-up task.

---

## Glossary tooltips

**Wet-felting** — registered: `wet-felting`, `roving`,
`cross-hatched-layers`, `fulling`.

Inline tooltip check:
- `wet-felting` → ✓ (opening paragraph)
- `roving` → ✓ (second paragraph)
- `cross-hatched-layers` → ✓ (Step 3 secondary paragraph)
- `fulling` → ✓ (Step 7)

All clean.

**Plain weave** — registered: `warp`, `weft`, `plain-weave`,
`shed`, `sett`, `beating-the-weft`.

Inline tooltip check:
- `warp` → ✓ (opening paragraph)
- `weft` → ✓ (opening paragraph)
- `plain-weave` → ✓ (opening paragraph)
- `shed` → ✓ (Step 7)
- `sett` → ✓ (Step 1 secondary paragraph)
- `beating-the-weft` → ✓ (Step 5)

All clean.

---

## Technique annotation per Worker C update

**Wet-felting:**
- `techniqueSlugs`: `wet-felting-flat-panel`
- `criticalTechniques`: empty (this IS the foundational technique;
  nothing more critical sits beneath it)
- `aliases`: `wet-felted soap`, `felted soap bar`,
  `soap in a wool jacket`, `merino soap covering`

`wet-felting-flat-panel` is the sibling foundational technique
listed in the fibre-arts author prompt as the worked example. It
doesn't exist as a Tutorial row yet; the upload script will log to
`missing-techniques.md`. Expected.

**Plain weave:**
- `techniqueSlugs`: empty (no inline `techniqueLink` marks; no
  underlying technique tutorials exist yet)
- `criticalTechniques`: empty
- `aliases`: `plain weave`, `tabby weave`, `cardboard loom weaving`,
  `cardboard loom plain weave`

The empty technique arrays are appropriate for a foundational
TECHNIQUE — there is no more fundamental weaving move than over-
and-under-alternating. Future PATTERN tutorials in the weaving
sub-category will link back to this entry; the dependency arrow
points outward from here, not inward.

---

## Hero images

Both tutorials: no hero set. Procedural cards will render until a
pre-launch image sweep.

**Wet-felting a soap covering:** moderate hero sources. Pexels and
Unsplash both have slow-living craft photography of felted-wool
soap bars — verify each shows the merino texture (not commercial
soap bar with decorative wool wrap, not knitted soap cosies). The
V&A textile collection on Wikimedia Commons has hand-felted pieces
but at a different scale (yurt covers, hats); a small kitchen-table
felt is harder to source as a museum-quality image. A close-up of a
finished wool-covered soap bar on a wooden soap dish would be the
ideal shot.

**Plain weave on a cardboard loom:** harder. The cardboard loom is
a folk-pedagogy setup; published photographs are mostly modern
workshop snapshots. Wikimedia Commons has a few public-domain
images of children's craft-class plain weaving but at a quality
that may not suit the publication aesthetic. Old Book Illustrations
has plates from Hooper's Hand-Loom Weaving (1910) of frame-loom
plain weave that would render as a credible period-illustration
substitute. A pre-launch image search should look at MERL (Museum
of English Rural Life) for traditional textile photography.

For both, procedural card is the honest fallback until a dedicated
image search runs.

---

## Open questions for Rebecca

1. **`requiredCraftMaterials` upload wiring** — see Schema gap
   flagged above. The fibre-arts author prompt documents the
   field; `upload-tutorial.ts` doesn't read it. Should a
   follow-up task extend the upload script before the fibre-arts
   pipeline flips to READY? Recommendation: yes, a small
   focused fix. The two test tutorials omit the field in their
   JSON to avoid silent data-loss.
2. **Improvised materials in `recipeTools`** — the cardboard
   rectangle (loom itself), the shed stick, the comb-for-beating
   are all named in the body but not in `recipeTools` because
   they're improvised, not purchasable. Confirm this is the
   right pattern — `Tool` rows for purchasable kit only;
   improvised setups stay in body prose.
3. **`wet-felting-flat-panel` as the prerequisite technique** —
   the wet-felting soap covering's `techniqueSlugs` references
   `wet-felting-flat-panel` (the worked example in the fibre-arts
   author prompt). That technique tutorial doesn't exist yet.
   Should the next fibre-arts authoring batch include
   `wet-felting-flat-panel` as the foundational technique
   tutorial, since it's referenced from the soap covering and
   from the author prompt's worked example?
4. **Basketry exclusion** — the fibre-arts author prompt
   explicitly excludes basketry (willow, rush, cane, etc.) from
   the fibre-arts category, redirecting to `wood-natural-craft`.
   Neither test tutorial is basketry, so the rule didn't apply
   here, but worth noting that the test set didn't exercise the
   intake rejection. A future session might want to test that
   a basketry-sounding brief gets rejected at intake.

---

## Summary

Two fibre-arts DRAFTs ready for upload — no body changes needed
beyond what's already in the JSONs.

The wet-felting tutorial sits at ~1,900 words (TECHNIQUE basic
band 700-1,100 — this lands above the upper bound but the
infoPanel safety block, the materials section, the eight method
steps, and the common-mistakes block all need their full prose; the
word count is justified for a beginner-first technique). The plain
weave tutorial sits at ~2,300 words (TECHNIQUE advanced band
1,100-1,800; this lands above the upper bound for the same reason —
the cardboard loom is a beginner setup but the technique still
requires loom-building + warp-winding + weaving + finishing in one
piece). Voice register is calm, factual, no AI-poetry, no mystical
framing. Technique annotation per Worker C update is populated.

One schema gap flagged: `requiredCraftMaterials` is in the Tutorial
schema but not read by the upload script. The two test tutorials
omit the field in their JSON; a follow-up fix to
`upload-tutorial.ts` should add the wiring before the fibre-arts
pipeline flips to READY.

Status: **ready for Rebecca's review.** pipelineStatus stays
NOT_READY (Rebecca flips manually).
