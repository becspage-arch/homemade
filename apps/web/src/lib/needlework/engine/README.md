# Needlework pattern-maker engine

Turns an idea into a faithful, loom-renderable surface-embroidery pattern. It is
**dual-use**: the same engine powers our bulk pattern generation AND the
customer-facing premium "upload a photo / describe an idea → your own pattern"
feature. Build it once, behind one stable function boundary.

## The locked rule

AI generates **only** the line-art DESIGN. Everything after — segmenting it,
assigning a stitch type + floss colour + geometry to each element, the hero
render, the legend, the steps — is deterministic and reads from **one** shared
`stitchedElements` structure. So the hero = the printable template = the stitch
guide = exactly what the customer stitches. No AI drift.
(See `feedback_hero_must_be_exact_pattern`.)

## Two input paths, one deterministic back half

```
A. design brief    ──briefToPrompt──┐
   (Territory×Look×Palette)          │  Flux line-art DESIGN     ┐
                                     ├─ (the ONLY AI step)        ├─→ bitmapToPattern()
B. reference photo ─referenceToPrompt┘  (text→img / img2img)     ┘        │
   (the customer upload)                                                  │
                                                                          ▼
        stitchedElements  +  DMC floss list  +  stitch legend  +  steps
                                                                          │
                                                                          ▼
                                   loom renderHero()  →  finished-piece photo
```

The AI step lives in the CALLER (a script / the future premium endpoint), so the
engine stays pure and testable. `apps/web/scripts/needlework-pattern-maker.ts`
is the reference driver wiring Flux + the engine + the loom for both paths.

## The boundary: `bitmapToPattern(bitmap, meta, opts)`

The stable, deterministic spine. Hand it a flat-colour RGBA bitmap (a Flux brief
render, or a customer's flattened photo) and it returns the full pattern.

Pipeline (`index.ts`):

1. **downscale** to a working resolution.
2. **quantise** (`quantize.ts`) — median-cut to N flat colours; flood-fill the
   cloth ground from the image edge so it is never stitched (a coloured ground,
   e.g. a night sky, is opted in via `groundHint`).
3. **crop** to the stitched content so the subject fills the hoop.
4. **segment** (`segment.ts`) — connected components per colour → regions with
   shape stats (area, elongation, fill-ratio, orientation).
5. **classify** (`classify.ts`) — the stitch decision. Each region becomes:
   - `point`  → **French knot** (small round blob: berries, centres, dots)
   - `line`   → **stem / back** (thin, elongated, OR a hollow outline/ring —
     every skeleton branch is kept, so line-art keeps all its strokes)
   - `wheel`  → **woven wheel** (round, solid, mid-sized lone blob)
   - `fill`   → **long-and-short / satin** (a worked area; long-and-short for
     large painterly shading, satin for small solid shapes)

   Only slugs the loom renders well are emitted, so every stitch draws truthfully.
6. **assemble** (`assemble.ts`) — snap each region's colour to a real DMC stand
   (perceptual CIELAB nearest), scale geometry to mm, build the loom contract.
7. **legend** (`legend.ts`) + **steps** (`steps.ts`) — derived from the SAME
   bound elements, never a parallel list.

## Output

`EmbroideryPattern` (`types.ts`): `stitchedElements` (the loom contract),
`palette` (DMC floss list), `legend` (symbol → floss + stitch + area), `steps`,
and `stats`. The `stitchedElements` go straight to the loom's `renderHero`.

## Notes / known character

- **Bold, clearly-shaped subjects render best** (a robin, a sun, a wreath, a city
  skyline). **Soft-gradient subjects render loosest** (a hazy sunset flattens to
  colour bands) — flat shapes segment cleanly, gradients do not.
- **Path A (brief) beats path B (photo)** on average: a brief asks Flux for flat,
  segmentable shapes; a photo must be flattened first (img2img), which is lossy
  for soft or busy scenes. Architecture/skyline photos convert far better than
  landscapes.
- The printable 1:1 vector template is a thin follow-on off `stitchedElements`
  (geometry is already in mm) — not built here.
