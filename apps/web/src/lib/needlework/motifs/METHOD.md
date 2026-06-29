# Needlework original-design METHOD

The Phase-A producer for Homemade-ORIGINAL surface-embroidery patterns (see
`src/lib/loom/RENDER_PROCESS.md` for Phase B = validate + render). This is the
codified method — proven on **Foxglen** (the first signed-off original). Follow
every step for every design; do not skip any.

## The bar (judge against this BEFORE building, and again on the render)

A design ships only if a customer would pick it over a competitor best-seller,
pay for it, and hang it on their wall. That means:

- **Subject-led.** A clear, lovable subject a person points at and says "I want
  to make THAT" — a characterful animal/creature/scene. NOT generic decorative
  filler.
- **Dense, rich, colourful.** Full of detail and colour, not sparse.
- **Charm / personality.** Joyful and characterful.
- **Balanced, centred, cohesive, GROUNDED.** A complete, intentional picture
  where everything is rooted and connected (a scene), never elements floating in
  the whitespace.

**Anti-patterns (never produce):** generic botanical "frames" / wreaths; "[word]
in a wreath"; sparse/empty layouts; off-centre/lopsided; safe muted palettes;
anything that reads as auto-generated filler. A subject with a floating botanical
halo is the trap — the botanicals must be a grounded setting, not a halo.

**VARY THE COMPOSITION, not just the subject.** The best-seller sites win on
variety. Do NOT reskin one layout (centred creature + grass strip + a flower each
side) across the set — that reads as no variety even with different subjects. Give
each design a genuinely different *kind of picture*. Proven layout types (mix them
across a set):
- **Grounded scene** — hero on a woodland/garden floor with surroundings (Foxglen).
- **Open / airy** — subject(s) over a scatter of anchored sprigs on plain linen,
  no ground band (Little Forager: bees + a dashed flight path).
- **Single bold character** — one big subject on clean linen, minimal accents (Garden Bunny).
- **Celestial / sky** — on a coloured night ground, no floor (Goodnight Moon).
- **Landscape** — a horizon with rolling hills, a path, framing trees, sky (Toadstool Cottage).
- **Still-life** — objects in a jug/pot on a tabletop line (Sunny: sunflowers in a jug).
Anchoring rule: rooted to ground, held in a jug, on a sky, OR deliberately
balanced-and-scattered on open linen — but never accidentally floating. A subject
must SIT ON its baseline, not hover above it; a sprig has a stem; a cut flower is
in the jug.

## The steps (every design)

1. **Brief** — pick Territory (subject/theme) × Look × Palette from the
   design-direction; choose a subject-led hero. Vary across the set (animals,
   insects, scenes, objects, celestial, seasonal — NOT all botanical).
2. **Author** — compose from the motif library (`library.ts`, `animals.ts`).
   Author new hero motifs as clean vector shapes; reuse scene motifs (toadstools,
   leaves, flowers, grass). Compose a grounded scene: hero centred, supporting
   flora rooted to a low knoll + foreground fringe, framing foliage arching from
   the base. Keep the hero's body clear of foreground.
3. **Validate the LINE DRAWING (Step-3)** — generate the colour guide + template
   (`engine/guide.ts`) and **LOOK at it as a customer**: are shapes clean and
   layered (occlusion), internal detail present, nothing a tangle?
4. **Render the FINISHED item** — `renderHero` (loom). `tameWarm:true` for
   red/pink subjects; `tameWarm:false` to keep oranges/warm subjects vivid.
5. **LOOK at the finished render as a customer** (HARD RULE — never present
   either artifact unlooked). Check the hero reads: does the subject read
   correctly (a fox, not an owl)? Does every part read (tail, face, detail)?
6. **Iterate** until it clears the bar on BOTH the line drawing and the render.
   Judge proportions cheaply on line-art first; spend the render only when the
   silhouette is right.

## Internal definition — A + B + C (NOT outer outlines)

Definition in surface embroidery is **internal**, never an outline round the
silhouette (the outer edge is already clear against the cloth). Three methods,
all at the data level (no loom change):

- **A. Same-area definition lines at meaningful INTERNAL boundaries**, each in an
  appropriate colour (a darker shade of that area) — leaf central veins, the rim
  line under a toadstool cap. Never a uniform contrasting outline; never the outer
  silhouette.
- **B. Separate same-colour neighbours** (a tail against the body) by a *lighter
  value*, a *different stitch direction*, and one fine defining line in a darker
  shade only at that boundary. Same-colour areas blur in the soft long-and-short
  render unless separated this way.
- **C. Contained face/detail.** Features (nose, eyes) are distinct fine stitches
  drawn LAST so the fill can't bury them. Keep them contained — a muzzle must not
  streak into the chest; put an orange neck between muzzle and chest blaze. Give a
  nose a small highlight so it reads as a nose.

## Animal-authoring conventions (proven on the fox)

- Cute = big head, big round eyes, small body, characterful pose.
- The SUBJECT-defining feature must be unmistakable: a canid needs a **pointed
  snout with the nose at the tip** + an inverted-triangle face (a round face +
  forward eyes + ear-tufts reads as an owl).
- A bushy tail/appendage in the body colour will vanish — make it a lighter shade
  with a cream/white tip and a defining line (method B).
- Author in tidy local coords (origin at the chest, up = −y), draw back-to-front,
  place with `geometry.ts` `place*`. Snap every colour to real DMC.

## Reusable infrastructure (already built)

- `geometry.ts` — parametric shapes + placement transform.
- `elements.ts` — bound-element builders (satin / shaded / chainPetal / line /
  knot / wheel) + `THREAD`.
- `library.ts` — botanical + scene motifs. `animals.ts` — character motifs.
- `compose.ts` — `composePattern` (fit to hoop, square for the round frame).
- `engine/guide.ts` — `patternToGuideSvg` (OCCLUSION: back-to-front layered
  artwork, fills hide lines behind, outline on top): `mode:'colour'` = colour
  guide, `mode:'template'` = transfer template. The reusable cross-craft fix for
  legible line drawings.
- `engine/document.ts` — floss/stitch keys + steps + labels placed in each
  group's largest region then de-clustered (never averaged onto the centre line).
- Driver: `scripts/needlework-generate.ts`; seed: `scripts/needlework-seed-pattern.ts`.
