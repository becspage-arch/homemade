# Cross-stitch NORTH STAR — the bar every NEW pattern must clear

Set 2026-06-29 by Rebecca. The goal is **the best cross-stitch collection in the
world** — nothing less is acceptable. This is the quality + variety bar for all
NEWLY GENERATED cross-stitch patterns (the rescale / refill work). It is a HIGHER
bar than the old catalogue; the 310 kept survivors (landscape posters + Delft +
the first 16 gems) are fine to keep, but new work must clear THIS, not them.

## The reference set (Rebecca's own picks — the guiding star)

Six best-seller / top-Etsy references she gave as the target. The collection must
span this whole range — a shop, not a row of look-alikes.

1. **Cat Lover's Bookshop** — LARGE, dense, narrative showpiece. A charming shop
   façade packed with little story details (sleeping cats on the sign, books in
   arched windows, an OPEN sign, roses over the door, a chalkboard). Warm, rich,
   full-coverage. *Complex showpiece tier.*
2. **Pastel shopfront row** — soft watercolour pastels on an airy white ground;
   pretty architectural row of little shops. *Pretty / pastel / light-coverage tier.*
3. **Mouse under a flower umbrella (Vihola)** — SMALL, adorable, characterful,
   soft painterly. One sweet character on white. *Cute / funny / "aww" tier.*
4. **Paris Café de Fleur** — rich impressionist colour, romantic scene, vibrant
   saturated palette, lamplight + blossom. *Romantic / painterly / saturated tier.*
5. **Wildflower meadow hoop** — delicate botanical, partial-coverage, sophisticated
   muted-but-rich palette, airy negative space. *Elegant botanical tier.*

(A 6th, the bookshop framed in a styled room, is the same Cat-Bookshop design — it
shows the framed-in-situ presentation we're emulating.)

## What this bar demands (and where the OLD catalogue failed)

- **Genuine variety across the SET** — size (small quick → large showpiece),
  complexity (one bold character → dense narrative scene), mood (funny, adorable,
  elegant, romantic, calm), palette (soft pastel → rich saturated), coverage
  (airy partial → full). A samey set FAILS even if each piece is fine.
- **Crisp at stitch resolution** — the old bulk's fatal flaw was MUSH: dense
  painterly art run through the converter came out muddy/brown. New work must read
  cleanly. Either keep the art cleaner/flatter, or tune the converter
  (colours/size/confetti) so density stays crisp — judge on the FINAL render.
- **Character + charm** — the references all have personality (a sleeping cat, a
  mouse's face, lamplight). Generic = cull.
- **Best-in-world, not "ok"** — every single piece must be an "I'd buy this and
  hang it" gem judged against these references.

## How to use these references

Rebecca asked to SAVE these images for the generation step. They should live as
literal visual refs at `apps/web/src/lib/studio/generation/north-star-refs/`
(filenames below) so a generation/gate session can compare new renders to them
side by side. **TODO: the 6 reference images need saving to that folder** — they
came as chat attachments and can't be pulled to disk by the worker; Rebecca (or a
drag-drop into the folder) is needed, OR re-fetch the public Caterpillar/Vihola/
Etsy listing images.

Suggested filenames:
- `01-cat-lovers-bookshop.png` (complex showpiece)
- `02-pastel-shopfront-row.png` (pretty pastel)
- `03-mouse-flower-umbrella.png` (cute character)
- `04-paris-cafe-de-fleur.png` (romantic saturated)
- `05-wildflower-hoop.png` (elegant botanical)

## Caterpillar Cross Stitch best-sellers — the other half of the bar

Looked at the live best-seller page 2026-06-29
(https://www.caterpillarcrossstitch.com/collections/cross-stitch-kits?sort_by=best-selling).
Their top sellers share a formula that is the OPPOSITE of the old muddy bulk —
and our converter handles it WELL:

- **Clean WHITE/blank background.** The motif sits on bare aida, not a full-coverage
  muddy scene. This is most of their range.
- **Bright, saturated multicolour**, high contrast, cheerful — not muted/brown.
- **Signature device: a silhouette packed with tiny colourful icons** — a world
  map, the British Isles, a deer, a pumpkin, a tree, a Halloween witch, each FILLED
  with dozens of little objects (adventure-awaits, british-isles, hello-deer,
  hello-pumpkin, touch-of-magic, christmas-wonderland, hello-petal, hello-sunshine).
- **Cute partial-coverage** pieces too (gingerbread-cottage, paws-&-pals cat+dog
  collection, bloom-and-grow botanical).

Best-seller titles seen: Adventure Awaits, British Isles Adventure, Hello Deer,
Hello Pumpkin, Hello Petal, Hello Sunshine, Touch of Magic, Christmas Wonderland,
Gingerbread Cottage, Paws & Pals, Bloom and Grow, Positivity Rules. (Images pulled
to scratchpad/caterpillar/ for this session's side-by-side gating; competitor photos
are reference-only, NOT committed to the repo and NEVER republished — see CC policy.)

**Implication for generation:** lead with WHITE-GROUND, bright, crisp designs
(icon-filled silhouettes, cute single characters, clean botanicals). These convert
crisply. Reserve full-coverage painterly showpieces (Cat Bookshop / Paris café tier)
for when the converter is proven not to mush them. The SET must still span the whole
range — white-ground bright → cute character → elegant botanical → pastel
architectural → rich detailed scene.

## Proven generation rules (from the 2026-06-29 pilots)

- **Render vivid — THREE-part colour fix** (best-seller kits are punchy; ours read
  washed out otherwise). All three are needed:
  1. **Bright ivory aida** — render on `#FCFAF6`, NOT the converter default
     `#F5EBD8` oatmeal which greys every colour. (Override `data.fabric.colourRgb`.)
  2. **Saturate the SOURCE art before quantising** — Flux trends soft/pastel, so the
     floss palette comes out pale. `sharp(raw).modulate({ saturation })` BEFORE
     `photoToPatternData`. Lane-aware: ~1.5 bold lanes (florals/cute/seasonal/
     wreath/showpiece), ~1.12 elegant botanical (keep it sophisticated), ~1.28 pastel.
  3. **Post-process `.modulate({ saturation: 1.3 })`** on the final rendered PNG
     (in the generation + publish scripts — NOT a change to the shared renderer, so
     the Studio renderer is untouched).
  Reference impl: `scripts/xs-volume-gen.ts` + `scripts/xs-volume-publish.ts`
  (`SRC_SAT`, `FABRIC`, post-modulate).
- **Match size + aspect to the design.** Square characters small (~115), florals
  ~150, wide bands/rows ~200×115, big showpieces ~200×200, busy subjects need to be
  BIG or detail turns to confetti. Drive Flux `imageSize` from the w:h ratio.
- **What works for generic generation:** bright florals/bouquets, cute single
  characters, seasonal cuties, elegant botanical bands, pastel architectural rows,
  detailed storybook scenes/showpieces.
- **SPECIALIST types — do NOT generic-generate** (own dedicated sessions, see
  memory project_cross_stitch_specialist_types): (1) MAPS with location graphics
  (random fill ≠ a real map — landmarks must sit in real places), (2)
  OUTLINE-FILLED-WITH-ICONS (needs a curated themed icon set, not confetti dots),
  (3) TYPOGRAPHIC / lettering (the converter renders text as GIBBERISH — avoid
  readable signage in scenes, or chart lettering deliberately).

## The gate, restated for new work

Run the existing ruthless vision gate (GATE_CHECKLIST.md) but calibrate "best-seller
bar" to THESE references, not the old catalogue. Expect a low pass rate. Generate
in abundance, keep only gems, kill near-duplicates, and make sure the published SET
spans the full range above.
