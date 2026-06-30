# Needlework engine — THE process (canonical, locked)

This is THE way we make surface‑embroidery (thread‑painting) needlework patterns.
Follow it. Do not reinvent it. If something here is unclear, STOP and ask — do not
guess. This doc + `project_needlework_signoff.md` (owner memory) + the engine code
(`apps/web/scripts/needlework-paint.ts`) are the three things a new session reads first.

Proven 2026-06-30 across animals, birds, florals, landscapes/scenes, fine‑art faces,
full‑scene "animals doing human things", and delicate line motifs. Nothing is live yet.

## The one idea (why this works when everything else failed)

The render was never the problem — generating rich stitch DATA was. So:

1. **Flux generates a beautiful illustration** of the subject (it is a far better
   illustrator than any code). It carries colour, form, composition.
2. The engine lays a **directional long‑and‑short stitch field**: thousands of short
   straight stitches, each one **coloured by sampling the illustration** at its spot
   (snapped to a real DMC floss), each running **along the local form** (a structure‑
   tensor flow field). Real needle‑painting at picture resolution — no confetti, no blobs.
3. The **loom** (`renderHero`) renders that stitch data unchanged into a photoreal hoop.

Dead ends (do NOT revisit): hand‑authored vector shapes → flat clip‑art; tracing an AI
raster picture → blobs/confetti/fragments; flat‑satin converter → flat paint. All rejected.

## The pipeline (every pattern)

```
brief ─▶ Flux illustration ─▶ engine (pick MODE) ─▶ loom renderHero ─▶ GATE ─▶ publish
        (cached per slug)     (per-stitch DMC + flow)  (photoreal hoop)  (keep gems)
```

The SAME stitch data drives the loom hero AND the pattern document (template / colour
guide / floss key / stitch key / steps) so the hero == what the customer stitches.

## Modes — pick by subject (in `needlework-paint.ts`)

- **dense** — a single subject cut out of its plain background (animals, birds, florals,
  portraits/faces). The plain ground is flood‑filled away; the subject sits on linen.
- **line** — delicate designs (wildflower jars, sprigs, minimal botanicals): fill only the
  *saturated* motifs (flowers/stems) + back‑stitch the strong edges as an outline, leave
  the pale negative space as **bare linen**. (A jar must read as a thin outline, not a blob.)
- **bleed** — full scenes edge‑to‑edge with no plain background to remove (landscapes;
  "animals doing human things" like the dachshund‑in‑a‑pink‑room). Stitches the whole image.

### Levers
- **detail** — denser stitching (smaller spacing). REQUIRED for faces and detailed scenes;
  without it, features are mushy. Larger pieces also need more density (still to auto‑scale).
- **tameWarm** — calms the loom's warm‑tone push. REQUIRED for faces (orange skin), reds, pinks.

## Framing (owner‑locked 2026-06-30)

- **Circular subject → round wooden HOOP.** This is the embroidery signature; it renders
  beautifully. Default for most pieces.
- **Anything non‑circular → FRAMELESS** (the rendered wooden rectangle frame was DROPPED —
  it looked cheap). Run with `--none`.
- **Always leave a SMALL ring of linen** — not swimming in white, not cropped to the edge.
  Set in `loom_render.py`: hoop margin `content_r*1.25` + ring `content_r*1.5`; frameless
  margin `content_r*0.55`. (Industry: embroidery sells as round‑hoop "hoop art"; art‑print
  categories — pop‑art / PD / faces — read well frameless.)

## The GATE — the anti‑junk control (this is what keeps quality world‑class)

Generate abundantly (Flux is pennies), then a **Claude vision pass looks at every FINISHED
render as a customer** and keeps ONLY clear best‑seller gems. Per design, in order:
1. Best‑seller bar — would a customer choose it over a competitor and hang it? Not "is it ok."
2. Clean — no mush, dropped parts, stray stitches, garble.
3. On‑brand + coherent — reads instantly as the subject (a fox, not an owl).
4. Original + safe — Homemade‑original; no protected likeness/brand/franchise IP.
5. Not a near‑duplicate — keep the set varied (size × style × subject × frame).
Repair the fixable (re‑roll Flux, bump detail/tameWarm, change frame), cull the rest.
Expect a LOW pass rate. Publish only all‑YES designs.

## HARD RULES (these bit us; do not break them)

- **LOOK at every finished render as a customer BEFORE presenting or publishing.** Never judge
  from code or a preview. (This caught flat‑satin, a background halo, an ugly frame, an over‑tight crop.)
- **Don't charge off changing direction without checking** with the owner.
- **Compare to a real reference** before declaring something good.
- **No img2img / no AI reinterpretation of the stitches** — the hero must be a faithful render
  of the exact stitch data (the locked platform rule).

## Categories
See `docs/needlework-subject-references.md` for the seeded categories (animals incl. dog
breeds, animals‑doing‑human‑things, fabulous/artistic faces, pop‑art & PD icons, florals,
birds, scenes, seasonal, celestial…). The full master list is built to the format of
`docs/cross-stitch-subject-master-list.md`. LEVEL OF DETAIL is make‑or‑break for faces +
animals‑doing‑human‑things — prove detail, then batch.

## How to run

```
# from the MAIN checkout (needs node_modules; FAL_KEY from .env.credentials; Blender installed)
cd apps/web && npx tsx scripts/needlework-paint.ts <slug> [--none]
```
Flux output is cached per slug in `.loom-scratch/needlework/paint/`; heroes land in
`.loom-scratch/heroes/`. The script is tsconfig‑excluded (build‑time only).

## Phase‑2 TODO (not done yet)

1. Build the master list (separate session, mirrors the cross‑stitch list).
2. **Engine‑promotion**: merge this engine to main (deploy‑verify), lift the reusable core
   (`bitmap → StitchedElement[]`) out of the script into `src/lib/needlework/`, and wire it
   through the existing `NeedleworkPattern` DB → public‑page pipeline (template = Foxglen /
   Countryside) with the free‑with‑login gate.
3. Gated batches: generate → gate (look at every one) → publish gems → STOP for owner sign‑off
   before bulk. Defer bespoke‑art categories (typography, word art, map icons) to dedicated sessions.
