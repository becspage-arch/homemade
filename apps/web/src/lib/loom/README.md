# The Loom — render engine

The loom is the deterministic, stitch-accurate render engine for pattern crafts.
It takes a craft pattern's **complete structured stitch data** and renders the
finished object as a hero image good enough that a customer would buy it —
**accurate by construction** (every real stitch the pattern specifies, never
invented, faked, or approximated), **scalable** (a fresh pattern renders well
with zero per-object hand-tuning), and **producer-agnostic** (the same engine
renders our designs and a user's "design-your-own").

This is full software, not a script. Embroidery is the first proof; the same
spine renders the other crafts later.

## The render model — 2.5D thread strokes

Flat embroidery is rendered as real, shaded thread strokes on a woven cloth —
**not** 3D path-tracing (that was the dead crochet-era approach: washed-out,
wrong stitches). The whole engine is built on ONE primitive: a thread **capsule**
splatted with per-pixel fibre shading (anisotropic sheen along the strand, ply
banding, a rounded tube normal, depth). Everything is that primitive:

- **Fabric** = warp + weft height-field at z = 0 (a lit plain weave).
- **Every stitch** = thread strokes at z > 0, layered in working order.

Because each stitch primitive emits the *actual* thread the stitch lays (satin's
real parallel stitches, a French knot's real coil, chain's real interlocking
loops), accuracy is structural — there is no "looks like satin" shortcut.

## Module map

```
core/         vec, noise, colour — tiny deterministic maths, no deps
render/
  framebuffer.ts  the CPU raster: splat thread capsules, AO, cast shadow, develop
  fabric.ts       the woven cloth ground (lit plain-weave height field)
  thread.ts       thread materials + ThreadStroke -> capsule tessellator
  scene.ts        renderEmbroidery(): fabric + strokes -> developed PNG buffer
stitches/         the stitch library — each primitive returns real ThreadStrokes
  types.ts        StitchContext + the stroke() helper
  line.ts         straight, running, back, stem, split, couching
  satin.ts        satin block + satin band (follows a tapering shape)
  fill.ts         long-and-short shading, fishbone leaf
  detached.ts     French knot, lazy daisy (detached chain), seed
  chain.ts        chain, fly, feather
  index.ts        public surface + STITCH_IDS
contract/         (next) the structured-data pattern contract — the join below
compare/          (next) side-by-side vs a reference photo + audit
```

## The three-layer boundary (the loom is render-only)

1. **Brief** — what to make (the shared design-direction system).
2. **Generation** — brief → structured stitch data. CRAFT-OWNED, not here.
3. **Render** — structured data → picture. **THE LOOM.** It renders whatever it
   is handed, identically for every producer. It does not invent designs.

The structured-data contract (`contract/`) is the join between (2) and (3).

## How to render + look (Phase 1 proof)

```
cd apps/web && npx tsx scripts/loom-stitch-proof.ts            # all swatches + contact sheet
cd apps/web && npx tsx scripts/loom-stitch-proof.ts satin-leaf # one swatch
LOOM_SS=3 LOOM_PPM=28 npx tsx scripts/loom-stitch-proof.ts     # crisp final
```

Output PNGs land in `.loom-scratch/stitches/`. The non-negotiable workflow is:
render → **LOOK** at it (vision) against a real reference photo of that worked
stitch → critique → iterate. Never ship a render you have not honestly compared.
```
