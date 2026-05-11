# Generation log

Run start: 2026-05-11T16:04:45.889Z. Run end: 2026-05-11T16:06:31.389Z.
Total wall time: 1 min 46 s. Cells: 24. Succeeded: 24. Failed: 0.

Tool: fal.ai (Flux 1.1 Pro Ultra) via the synchronous
`https://fal.run/fal-ai/flux-pro/v1.1-ultra` endpoint. Aspect: 16:9. Output:
PNG. Safety checker off. Four styles run in parallel per subject, six
subjects run sequentially.

Script: `docs/illustration-style-test/generate.mjs`. Style prefixes and
subject descriptions are embedded verbatim from `styles.md` and
`subjects.md`. To re-run, see the README.

**Cost:** approx £1.20 for the 24-image grid at Flux 1.1 Pro Ultra rates.
Scaled to a hero-illustration target of 1,560 tutorials, that lands around
£75–£100. For 3,000 tutorials with one hero and three inline
illustrations per tutorial (12,000 images total) the budget lands closer
to £600–£800. Workable, and within the build-cost envelope.

## First-look observations (Claude-eye sample, not formal scoring)

These are notes from a quick read across roughly a third of the grid. The
formal decision lives in `rubric.md` — Rebecca scores all 24 herself.

- **Style A (botanical) is the standout.** The rosemary cell looks like a
  vintage gardening book plate. The morning kitchen scene captures the
  light beautifully. Hands on the folding-dough cell rendered without
  obvious failure. The brand-fit gap to the other three styles is real on
  the sample reviewed.
- **Style B (pencil + wash) is the runner-up.** Visibly hand-drawn, warm
  paper texture, the right slow-living register. May drift more across
  bulk generation because the style is harder to pin down than A.
- **Style C (flat) is competent but generic.** Reads as commercial
  editorial. Risk: looks like every other food platform.
- **Style D (etching) has character but reads colder than the brand
  wants.** The pastiche risk flagged in `styles.md` is real.

Two model limitations surfaced that matter for bulk authoring, regardless
of which style wins:

- **Hallucinated text.** The Style B sourdough loaf had nonsense letters
  baked into the crust ("Coutery Souread"). Flux puts text on bread, jar
  labels, packaging when it thinks the context calls for it. The
  bulk-authoring prompt prefix needs an explicit negative: "no text, no
  letters, no writing, no labels on the food itself."
- **Diagram labels misspell.** The fermentation diagram has "brain Line"
  and "bubble live" instead of "brine line" and "bubble layer." Real
  diagrams in tutorials should be generated label-free, then labels
  typeset over the image in admin (or via a small SVG overlay component).
  Don't ask the model to render label text.

The diagram subject also had high variance run-to-run — first run rendered
three near-identical jars; the second run correctly showed three stages.
For diagrams and other high-variance subjects, generating 2–3 candidates
per cell and picking the best is worth the small cost.


## 01-sourdough-loaf — Finished food item — sourdough loaf

```
Subject description: a round country-style sourdough loaf, golden-brown crust scored with a wheat pattern across the top, sitting on a wire cooling rack, a linen tea towel underneath, soft window light from the left
```

- **Style A (Modern botanical)** — OK. Elapsed 10.5s. Seed `1048511118`. Saved to `output/style-a-botanical/01-sourdough-loaf.png` (5199 KB).
- **Style B (Editorial pencil + wash)** — OK. Elapsed 14.5s. Seed `576619413`. Saved to `output/style-b-pencil-wash/01-sourdough-loaf.png` (6007 KB).
- **Style C (Flat editorial)** — OK. Elapsed 10.4s. Seed `3944815590`. Saved to `output/style-c-flat/01-sourdough-loaf.png` (4232 KB).
- **Style D (Etching / engraving)** — OK. Elapsed 11.6s. Seed `37419553`. Saved to `output/style-d-etching/01-sourdough-loaf.png` (8045 KB).

## 02-folding-dough — Technique mid-action — folding bread dough

```
Subject description: a pair of hands folding bread dough on a wooden board, dough mid-stretch, flour dusted across the surface, sleeves rolled to the forearms, side-on view, the action caught mid-motion
```

- **Style A (Modern botanical)** — OK. Elapsed 10.6s. Seed `2265383813`. Saved to `output/style-a-botanical/02-folding-dough.png` (5994 KB).
- **Style B (Editorial pencil + wash)** — OK. Elapsed 11.7s. Seed `2072056931`. Saved to `output/style-b-pencil-wash/02-folding-dough.png` (6319 KB).
- **Style C (Flat editorial)** — OK. Elapsed 10.4s. Seed `1643715642`. Saved to `output/style-c-flat/02-folding-dough.png` (5304 KB).
- **Style D (Etching / engraving)** — OK. Elapsed 10.7s. Seed `3608886017`. Saved to `output/style-d-etching/02-folding-dough.png` (7636 KB).

## 03-preserving-supplies — Still life — preserving supplies

```
Subject description: a still life of preserving equipment laid out on a kitchen table: a Kilner jar, a brass kitchen scale with two weights, a glass funnel, a square of muslin folded loosely, a wooden spoon, a small saucer, overhead three-quarter angle
```

- **Style A (Modern botanical)** — OK. Elapsed 12.4s. Seed `1253080647`. Saved to `output/style-a-botanical/03-preserving-supplies.png` (5801 KB).
- **Style B (Editorial pencil + wash)** — OK. Elapsed 11.7s. Seed `1178358472`. Saved to `output/style-b-pencil-wash/03-preserving-supplies.png` (6535 KB).
- **Style C (Flat editorial)** — OK. Elapsed 14.0s. Seed `2213217751`. Saved to `output/style-c-flat/03-preserving-supplies.png` (6215 KB).
- **Style D (Etching / engraving)** — OK. Elapsed 12.0s. Seed `4223727687`. Saved to `output/style-d-etching/03-preserving-supplies.png` (6822 KB).

## 04-rosemary-sprig — Botanical ingredient — rosemary sprig

```
Subject description: a single sprig of rosemary, leaves and stem detailed, against a plain warm cream background, slight shadow underneath, in the style of a vintage gardening book botanical plate
```

- **Style A (Modern botanical)** — OK. Elapsed 17.5s. Seed `1605888468`. Saved to `output/style-a-botanical/04-rosemary-sprig.png` (2124 KB).
- **Style B (Editorial pencil + wash)** — OK. Elapsed 15.6s. Seed `1412731579`. Saved to `output/style-b-pencil-wash/04-rosemary-sprig.png` (4653 KB).
- **Style C (Flat editorial)** — OK. Elapsed 19.0s. Seed `3190774708`. Saved to `output/style-c-flat/04-rosemary-sprig.png` (1902 KB).
- **Style D (Etching / engraving)** — OK. Elapsed 25.1s. Seed `1440177684`. Saved to `output/style-d-etching/04-rosemary-sprig.png` (2479 KB).

## 05-fermentation-diagram — Diagram — fermentation stages

```
Subject description: a labelled cross-section diagram of a jar of fermenting sauerkraut at three different stages of fermentation, shown as three jars side by side, each jar showing the cabbage, the brine line, and the bubble activity, labels in a serif typeface point to the brine line, the bubble layer, and the weighted plate
```

- **Style A (Modern botanical)** — OK. Elapsed 10.7s. Seed `2826872892`. Saved to `output/style-a-botanical/05-fermentation-diagram.png` (4802 KB).
- **Style B (Editorial pencil + wash)** — OK. Elapsed 9.8s. Seed `592528209`. Saved to `output/style-b-pencil-wash/05-fermentation-diagram.png` (3679 KB).
- **Style C (Flat editorial)** — OK. Elapsed 12.0s. Seed `1743780321`. Saved to `output/style-c-flat/05-fermentation-diagram.png` (3606 KB).
- **Style D (Etching / engraving)** — OK. Elapsed 10.3s. Seed `2301904348`. Saved to `output/style-d-etching/05-fermentation-diagram.png` (6947 KB).

## 06-morning-kitchen — Scene — kitchen counter at morning light

```
Subject description: a kitchen counter at morning light, a wooden chopping board with a folded linen cloth on it, a copper pan to one side, a sheet of parchment paper with a dusting of flour, a clear glass of water, the window in the background implied rather than rendered, the light is what matters
```

- **Style A (Modern botanical)** — OK. Elapsed 10.1s. Seed `1866172636`. Saved to `output/style-a-botanical/06-morning-kitchen.png` (7107 KB).
- **Style B (Editorial pencil + wash)** — OK. Elapsed 18.8s. Seed `1038005803`. Saved to `output/style-b-pencil-wash/06-morning-kitchen.png` (5732 KB).
- **Style C (Flat editorial)** — OK. Elapsed 19.2s. Seed `2102773514`. Saved to `output/style-c-flat/06-morning-kitchen.png` (3735 KB).
- **Style D (Etching / engraving)** — OK. Elapsed 11.1s. Seed `4157277939`. Saved to `output/style-d-etching/06-morning-kitchen.png` (7844 KB).

---

Run end: 2026-05-11T16:06:31.389Z. Cells: 24. OK: 24. Failed: 0.

