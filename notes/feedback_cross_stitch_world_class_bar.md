---
name: feedback-cross-stitch-world-class-bar
description: "The cross-stitch quality bar Rebecca set 2026-06-29 — 'best cross-stitch collection in the world', with 6 north-star reference images. Applies to all NEW generated patterns."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a77e9b9e-ee18-4618-899c-bbd75803d8b3
---

Rebecca's goal for cross-stitch is **the best cross-stitch collection in the
world — anything less is not acceptable.** Set 2026-06-29 during the big cull.

**Why:** the old ~1,500 catalogue was muddy, samey, template-generated junk
(anthropomorphic-animal-with-a-job, brown cocktails, dark interiors, text
samplers). She judged it terrible against best-seller sites.

**How to apply:** judge every NEW cross-stitch design against her reference picks (top
Etsy / Caterpillar Cross Stitch / Vihola), captured in
`apps/web/src/lib/studio/generation/NORTH_STAR.md` (the file exists; five of the six are
listed here, which is how it was written):
1. Cat Lover's Bookshop — large dense narrative showpiece
2. Pastel shopfront row — soft watercolour, airy
3. Mouse under a flower umbrella — small adorable character
4. Paris Café de Fleur — rich romantic saturated scene
5. Wildflower hoop — delicate elegant botanical

The point is **RANGE** — small/large, simple/complex, funny/elegant,
pastel/saturated — every piece a gem. Reference link:
https://www.caterpillarcrossstitch.com/collections/cross-stitch-kits?sort_by=best-selling

**Cull outcome (2026-06-29):** catalogue cut 1,592 → 310 PUBLIC. Culled 1,282 to
PRIVATE (reversible, manifest at scratchpad/culled-manifest.json): 148 text/sampler
+ 1,134 muddy-template + Stitching Mama mockups. KEPT: 167 landscape posters + 129
monochrome/Delft + the first 16 new-system gems. Rebecca approved keeping the 310
survivors; the raised bar is for NEW generation only.

**Hard-won method rules:** LOOK at the final render of every piece (contact sheets
from persisted thumbnails work for culling — that IS the live customer artifact);
variety is a SET-level requirement; the converter MUSHES dense painterly art (this
is why the old bulk failed) — prove the bar on a small pilot render before scaling.

**Gate calibration correction (2026-07-01):** Rebecca pulled me up for CULLING pop-art/portrait
pieces she found beautiful (a bobble-hat portrait with a slight face smudge, a flower-crown face).
The gate is REPAIR-FIRST: on a fixable fault (a smudge, a stray mark, an odd shadow), RE-ROLL the
slug — don't cull. Only cull when a piece genuinely won't converge after a repair attempt (e.g. the
`artface` lane's harsh-orange patchy skin that persisted through a re-roll). Targeted re-roll = edit
that slug's brief in `xs-volume-gen.ts` (add "clean evenly-lit smooth face, both eyes symmetrical, no
markings/smudges"), delete ONLY that slug's `.flux.png` + `.render.png`, re-run `--batch X` (others stay
cached — no cost, nothing else disturbed). Don't be trigger-happy on portraits/faces she'd hang.

**Audit outcome (2026-09-05/06):** the July pause was duplication, not the bar: 85 clusters over 192 of 1,153 public patterns from brief stems re-used across batches with nothing comparing images. Fixed at the root with a mechanical dedupe guard in the publish path (image hashes, chart fingerprint, subject key against the whole catalogue) and a constrained planner. A full look at every thumbnail found only 14 fails, so the June bar held. World-best comparison: we already have the only library-plus-stitching-tool; we trailed on print quality, credibility and beginner entry, all shipped 6 September. The gate was then over-tightened and culled good work (a raven, a strawberry, a crystal ball, an owl); recalibrated: a wrong face is a kill, a small one is not; repair before cull still stands. Targets and shelves come from the audit: 1,818 across 27 shelves, the sum of the per-shelf
targets in `apps/web/src/lib/studio/generation/categories.ts` (checked 2026-09-06; it was
1,784 across 26 before the 34-piece `samplers` shelf landed on train 13). State:
[[project/project_cross_stitch_state]].

Related: [[project/project_cross_stitch_state]], [[project/project_pattern_generation_toolkit]]
(itself largely superseded), ([[project_cross_stitch]] is not in notes/),
[[feedback_customer_eye_renders]], [[feedback_no_popup_questions]], [[feedback_pattern_complexity_range]].
