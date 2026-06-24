# The Loom — worker brief & handoff (embroidery build)

The single carry-over document for "the loom": the deterministic, stitch-accurate
finished-object render engine. This is the EMBROIDERY-first rebuild (2026-06-24),
started fresh after the crochet 3D-Blender path was abandoned as a dead model
(washed-out, wrong stitches, didn't converge, didn't scale). Read this first.

---

## ★★ SOLVED PIPELINE (2026-06-24, end of session 2) — READ THIS FIRST ★★

The hero render is **solved and proven** on Countryside (simple), Provence
(complex), and an our-own-format bouquet. Rebecca: "THAT IS SOLVED." A hero is a
PROMISE — it must depict EXACTLY what the customer will stitch (no AI drift). The
pipeline guarantees that:

**1. Deterministic engine → the EXACT pattern geometry.** Our own patterns hand
the loom clean `stitchedElements` (stitch slug + colour + thread + geometry);
`render/renderPattern.ts patternToStrokes` dispatches each to its primitive. (For
the licensed sample PDFs we recover geometry via vector extraction — see the
superseded section below — but in PRODUCTION patterns arrive already in our
format, so extraction is irrelevant.)

**2. Photoreal BASE in Blender** — `scripts/loom_render.py` (Cycles, CPU,
ABSOLUTE paths). The flat "blob" look was high ambient filling every shadow; fixed
with: a RAKING directional key light (low angle) so each raised stitch casts a
contact shadow = 3D; floss lifted proud of the cloth; natural BEIGE linen
(`#e3d8c0`); a muted-wood WOODEN HOOP framing the design; `filter_main_cluster()`
drops spatially-isolated stray test marks + centres on the real motif; world 0.45
+ exposure 0.9 (NOT the old 2.0/1.9). Run:
`"<blender.exe>" --background --factory-startup --python scripts/loom_render.py -- <ABS scene.json> <ABS out.png> 200`

**3. LOCKED creative-upscale finish** — `scripts/loom-hybrid-fal.ts <base> <out>
<creativity> upscale <resemblance>` (Fal `clarity-upscaler`, ~£0.04/img; loads
FAL_KEY from `.env.credentials` walked up from the script dir). It adds real
thread micro-texture/relief while keeping the composition PIXEL-LOCKED. Use
creativity **0.5**, resemblance **0.85**. (KEY: plain img2img goes photoreal but
DRIFTS the design = banned for heroes; control-lora canny/depth lock but stay
flat; the creative upscaler is the only tool that adds texture WITHOUT drift — and
only works on a base that already has the 3D/linen/hoop from step 2.)

**4. FIDELITY GATE** — `scripts/loom-fidelity-gate.ts <base> <final>` (edge-map
Pearson correlation + low-res colour delta; free, deterministic; exit 0=pass
1=fail). Calibrated: locked passes ~0.83–0.91 structure / PASS; drifted img2img
0.09–0.25 / FAIL. Thresholds STRUCT_MIN 0.45, COLOUR_MAX 0.1. This is the
safeguard that makes shipping an AI-finished hero safe — any drift is rejected.
A Claude Code vision session is the authoritative second opinion on borderline.

**Best outputs in `.loom-scratch/blender/`:** `final-countryside.png`,
`final-provence2.png` (cleaned), `final-bouquet.png` (our-format), plus
`*-final-compare.png` (vs designer heroes) and `pipeline-compare.png` (base vs
final = lock proof).

**WIRED (2026-06-24, session 3) — `scripts/loom-render-hero.ts`.** The whole
chain is now one production entrypoint:

```
import { renderHero } from 'apps/web/scripts/loom-render-hero'
const hero = await renderHero({ name, stitchedElements, finishedSizeMm, fabricHex?, defaultThread?, strands? })
// -> { localHeroPath, width, height, pathTaken, gate, attempts, r2: { key, publicUrl } }
```

It is BUILD-TIME tooling (a pattern-generator / worker calls it), never the live
ECS server — Blender + Fal run where patterns are generated. Steps:
`patternToStrokes` → `strokesToBlenderScene` (new, in `render/blenderScene.ts`;
also tames over-saturated greens per-pattern) → `loom_render.py` base → locked
`falCreativeUpscale` (extracted from `loom-hybrid-fal.ts`) → `fidelityGate`
(extracted from `loom-fidelity-gate.ts`) → `r2UploadScript` (prefix
`patterns/loom`). **Automated gate:** a passing upscale ships; a FAIL retries at
creativity 0.5 → 0.35 → 0.2 (more faithful each time); if every upscale still
drifts it falls back to the deterministic base, so a drifted hero is NEVER
shipped. `pathTaken` + `attempts` log which route each hero took. CLI proof:
`npx tsx scripts/loom-render-hero.ts <pattern.json> [name] [--no-persist]`.

Proven end-to-end on the bouquet (our-format) + Countryside fixtures: both pass
the gate at creativity 0.5 (structure ~0.89 / ~0.94) and persist live heroes;
the forced-fail test confirms the base fallback. Framing already centres on the
main stitch mass (`filter_main_cluster` drops stray clusters); greens now read
natural, not electric. NOTE: any script importing `dotenv` (loom-hybrid-fal,
loom-render-hero) MUST stay in `apps/web/tsconfig.json` `exclude` or it breaks
`next build`.

**REMAINING (next session):** wire `renderHero` into a real pattern-generator's
publish step (it currently returns the R2 result; the caller creates the `Media`
row + points the pattern's `heroMediaId` at it, same shape as the Fal photo-hero
pipeline). The 18-stitch library + format + renderer from session 1 are the
exact-structure backbone the whole thing depends on — NOT wasted.

---

## ⤵ SUPERSEDED — earlier same-day state (kept for history)

## ★ CURRENT STATE (2026-06-24, end of the long session) — READ FIRST ★

**THE METHOD THAT WORKS (Rebecca approved "THAT'S IT… this IS the same pattern"):**
The pattern PDF is a VECTOR file. DO NOT rasterise it and trace the picture (that
failed for ~6h — lossy, never matched). EXTRACT the designer's vector paths +
per-path colour directly, render each path as thread following its EXACT shape.

**Working pipeline (apps/web/scripts/):**
1. `loom_extract_vectors.py` (Blender's python + fitz `get_drawings()`): pull
   page-1 colour-guide vector paths + colours. SPLITS sub-paths at moveto gaps
   (critical — joining them made zig-zags + stray lines). Run:
   `"<blender>/4.2/python/bin/python.exe" scripts/loom_extract_vectors.py <PDF> <out paths.json> 0`
2. `loom-render-vectors.ts <pathsJson> <name> [enrich] [gmute] [deepen]`: each
   path → thread; dots→French knots, rust circles→whipped wheels; drops only DARK
   label-blue (keeps blue/purple FLOWERS); near-black floret-circles→white knots;
   short marks render fuller (petals). Writes `<name>.json` (Blender scene),
   `<name>-vec-preview.png` (fast CPU look), and `<name>.pattern.json` (needlework
   format: vectorData svg + stitchedElements with stitch slug + colour + thread).
   Per-pattern colour: Countryside `1.2 0.66`, Provence `1.9 0.95 0.8`.
3. `loom_render.py` (Blender Cycles): photoreal hero. ABSOLUTE paths only. Frames
   to thread bbox; bright white ground (exposure 1.9, world 2.0). Run:
   `"<blender.exe>" --background --factory-startup --python scripts/loom_render.py -- <ABS scene.json> <ABS out.png> 190`
4. `loom-compare.ts <heroJpg> <ourPng> <out> [h]`: side-by-side. Show via Read.

**Verified:** Countryside + Provence both render from the SAME pipeline, zero
hand-tuning. The loom also renders FROM the needlework format via
`renderPattern.ts` (`patternToStrokes`) — the same path our Studio will use.

**OPEN — the next job (the rigorous A–G STITCH MAP). This is what de-blobs it.**
Right now the importer renders almost everything as generic "thread-along-a-path"
or dots, so dense flowers (Provence) read as pale BLOBS, not real stitches. The
render engine CAN do distinct stitches (the stitch sampler proved satin / french
knot / lazy-daisy / fern / wheel / fishbone all render distinctly) — the IMPORT is
flattening them. Fix = classify each vector element to its REAL stitch + render it
as that stitch:
  - FILLED shape (a solid flower/leaf) → satin / long-and-short FILL (currently
    rendered as its outline or a knot → blobby). THE BIGGEST WIN — render fills.
  - radiating short lines from a hub → straight-stitch petals / umbel rays.
  - teardrop loop → lazy daisy (detached chain).
  - small dot → french knot; ring/circle → whipped/woven wheel.
  - feathery branching → fern.
  - long smooth curve → stem; the leafy-sprig spine → backstitch.
Stitch slugs MUST be the controlled dictionary
(`packages/db/scripts/data/embroidery-stitches.ts`, `embroidery-*`). For OUR OWN
patterns the Studio supplies stitch-type + colour as DATA (no inference), so the
renderer just dispatches — this inference is only to recover an external PDF.
Rebecca: colours needn't be perfect (our engine inputs them); the RENDER must be
right (real stitch structure, not blobs).

**Also small/known:** Countryside still missing a few stems; Provence has a stray
cluster bottom-right + white daisies render as rings not petal-daisies.

**HARD RULES (Rebecca, learned painfully):** (a) use the EXACT diagram (the real
vectors); (b) use the EXACT stitches/instructions (no faking/skipping); (c) LOOK
at every render + the diagram and check EVERY element type is present before
claiming fidelity. Per-pattern heuristics (blue=label, rust=pod) SILENTLY DELETE
real elements on the next pattern — always LOOK. NEVER use AskUserQuestion popups
(she can't see context under them) — ask inline. Show images via Read. Only show
the BEST result, not every step.

---

## 1. Mission

One engine that takes a craft **pattern** and renders the **finished object** as
if a real tester made it and photographed it — the hero image on a listing. It
must be: **accurate by construction** (the exact stitches of the pattern, never
invented/approximated); **full software that scales** (every pattern, zero
per-pattern hand-tuning); **producer-agnostic** (our designs AND a user's
design-your-own, same quality). No img2img, no AI image gen, no paid image APIs,
no invented stitches. All deterministic, from the pattern.

## 2. Rebecca's NON-NEGOTIABLE rules (do not soften)

1. **STITCH FOR STITCH. Consume the WHOLE pattern.** Every stitch it specifies is
   constructed and rendered as that real stitch — right place, count, type.
   Never guess, never fill blanks, never approximate, never stand a stitch in
   with a bead or a smooth fill. (Only genuine inserted non-thread parts the
   pattern says to insert — a bead, a sequin — are non-stitch.)
2. **You need a real pattern to follow.** Rebecca supplies a licensed embroidery
   pattern + its designer photo as an INTERNAL TEST FIXTURE ONLY — never shipped,
   sold, redistributed, or used as content. Ask her for the simple one at Phase 2.
3. **LOOK, don't just check the code.** Render → LOOK (Claude vision) → build a
   side-by-side vs the designer photo → critique yourself → AUDIT that every
   stitch + instruction was used and placed right → iterate. Only then present,
   with an honest read.
4. **Don't minimise real problems as "little fixes."** If the construction is
   wrong, fix the construction.
5. **No per-object hand-tuning as the method.** The product test: a FRESH pattern
   renders well with ZERO hand-tuning. Build shared fundamentals so that's true.
6. **Don't iterate on a bad model.** If, after a fair build, 2.5D thread
   rendering isn't reaching customer quality, STOP, say so plainly, rethink with
   Rebecca. Do not keep nudging a failing model.

## 3. The approach — 2.5D thread strokes (what WORKS, keep)

Each stitch is a real, shaded thread stroke on woven cloth. The engine is built
on ONE primitive: a thread **capsule** splatted with per-pixel fibre shading.
Proven precedent: machine-embroidery digitizing software (Ink/Stitch, Wilcom)
renders realistic previews from stitch data — the technique, not their code.

- `render/framebuffer.ts` — the CPU raster. `splat()` lays a thread capsule with
  Kajiya–Kay anisotropic sheen, subtle ply banding, tube normal, z-buffer
  crossings. `ambientOcclusion()` = crevice shadow. `directionalShadow()` = the
  soft shadow each raised stitch casts. `develop()` = filmic finish. (Adapted
  from the crochet-era yarn raster — the one piece that carried over.)
- `render/fabric.ts` — the cloth as a lit plain-weave height field (warp/weft
  over-under), so stitches sit ON a surface, not on flat colour.
- `render/thread.ts` — thread materials (stranded cotton, perle, crewel wool,
  silk, metallic) + `ThreadStroke` → capsule tessellation. `strandRadiusMm()`
  sizes thread by strand count.
- `render/scene.ts` — `renderEmbroidery()`: fabric + a flat list of strokes →
  developed RGBA. Render-only; knows nothing about stitches or patterns.
- `stitches/*` — the library. Each primitive emits the REAL strokes of that
  stitch. 16 so far (see `stitches/index.ts` STITCH_IDS), all looked-at and
  iterated against references in Phase 1.

### Tuning lessons (Phase 1)
- **Real filaments, not one tube** (`render/thread.ts`). The single biggest
  realism lever: render each stroke as its actual strands spiralling around the
  bundle (a helix — lateral + height offset rotate with the twist). This is what
  makes it read as real floss instead of a plastic pipe. Synthetic per-pixel ply
  banding is retired (it made candy-cane corduroy); the geometry does it now.
- **Tint the specular toward the floss colour** (`SPEC_MIX` in framebuffer
  splat), do NOT add pure white. Pure-white sheen washes thin stitches to pale
  ghosts. Coloured thread keeps its hue in the highlight.
- **Blur the AO + the cast shadow** (`blur1`). Unblurred screen-space occlusion
  reads as blotchy CG dirt — Rebecca flagged "weird shadows". Soft penumbra only.
- **Punch in develop, not in exposure**: saturation ~1.3 + a gentle contrast
  S-curve + light DoF (stitches sharp, cloth soft) + low vignette gives
  photographic punch. High exposure/bloom just washes thin threads.
- **Bright ground**: the real hero photos are on near-white cloth, not muted
  linen. Default fabric ~`#f3efe6`, fine weave.
- **French knots are a filled spiral, not concentric rings** (rings = donut
  hole). Still the weakest stitch — slightly pale; candidate for more polish.
- Render at `ss=2` for iteration; `LOOM_SS=3 LOOM_PPM=26` for a crisp final.

### Stitch backlog (from the example patterns + the 60-page guide)
The full vocabulary the example patterns + DMC/Anchor/StudioX guide cover (build
each as the chosen pattern demands it — don't build speculatively):
- **Countryside (simplest, first pattern) needs:** fern stitch, whipped/woven
  wheel (spider rose). The other five it uses (back, lazy daisy, French knot,
  stem, straight) exist. NOTE: Countryside uses **perlé #5** (single cord, 2-ply
  twist), not stranded — use the `perle-cotton` kind.
- **Broader vocabulary to add later:** bullion knot (caterpillar), woven wheel
  rose, ribbed spider, colonial knot, dot, pistil (knot-on-a-stalk), blanket /
  buttonhole + buttonhole wheel, herringbone, cretan, twisted/cable/reverse
  chain, threaded + whipped back stitch, trellis, basket weave, sheaf filling,
  woven picot/oval, padded satin, turkey work (cut pile), cast-on, tulip.
  Source guide (text-extractable, internal ref): the StudioX "Fundamental
  Embroidery Stitch Instructions" PDF in Rebecca's Example Patterns folder.

## 4. What DOESN'T work (don't repeat)

- 3D path-tracing / Blender for stitched crafts — the dead crochet model.
- img2img / AI image gen — banned and inaccurate.
- Faking stitches — beads-for-stitches, smooth tubes/fills for real worked
  stitches. Always construct the real stitch.
- Per-object hand-tuning as the workflow — oscillates, doesn't scale.
- Building pattern VOLUME before the render is judged on a finished-look hero.

## 5. State at handoff (2026-06-24)

- **Phase 1 DONE-ish:** the render substrate + a 16-stitch library, each rendered
  as a swatch and iterated against real references (satin, satin-band, long-and-
  short, fishbone, stem, back, running, split, couching, chain, fly, feather,
  French knot, lazy daisy, seed, straight). Reads as real floss on real cloth —
  decisively validates 2.5D over the dead Blender path. Awaiting Rebecca's
  sign-off (checkpoint 1). Known polish: French knots a touch pale; satin shows
  faint thread ribbing (realistic but could soften).
- **Not yet built:** the structured-data **contract** (`contract/`), the
  **placement engine** (pattern → strokes), the **compare/audit** harness
  (`compare/`), DB wiring. These are Phase 2 — built against the first licensed
  pattern so the contract is shaped by a real pattern, not guessed.

## 6. NEXT WORKER — ready to paste (Phase 2)

> **Homemade — the loom: simple licensed embroidery pattern (Phase 2)**
> Model: Opus. Continue the loom. Read `apps/web/src/lib/loom/WORKER_BRIEF.md` +
> `README.md` in full first. Phase 1 (the stitch library) is signed off.
>
> Rebecca will give you a SIMPLE licensed embroidery pattern + the designer's
> photo (internal test fixture only — never shipped/sold/redistributed). Then:
> 1. Design the structured-data **pattern contract** (`contract/`) shaped by THIS
>    real pattern (stitch id + placement + thread per element), with a zod
>    validator. This is the join between craft generation and the loom.
> 2. Build the **placement engine**: parse the FULL pattern — every step, no
>    summarising, no faking, no substituting — into contract instructions, then
>    into thread strokes via the stitch library.
> 3. Render with `renderEmbroidery()`. Build the **compare harness**
>    (`compare/`): extract the designer photo, render yours, side-by-side, and an
>    AUDIT that every stitch + instruction in the pattern was used and placed.
> 4. LOOK (Claude vision), critique, iterate until it genuinely holds up as a
>    customer would judge it. ONLY THEN present the side-by-side + an honest read.
> Obey the non-negotiable rules in section 2. Don't iterate on a bad model.

Environment: `cd apps/web && npx tsx scripts/loom-*.ts`; PNGs in `.loom-scratch/`.
`sharp` encodes RGBA→PNG. If you push to main: standard deploy-verification +
worker-handoff blocks.
