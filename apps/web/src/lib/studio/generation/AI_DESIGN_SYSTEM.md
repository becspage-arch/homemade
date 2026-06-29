# AI-Design Pattern System — the niche-agnostic way we make beautiful patterns

This is THE way Homemade generates pattern designs (cross-stitch, embroidery, and
any future pattern niche). It replaces hand-coded/templated generators, which
produce repetitive, low-quality output (the "heap of junk" problem). Proven on
cross-stitch — the Cosy Autumn Fox + six varied designs are live.

## The principle

A templated generator can't be a designer, so don't ask it to be. Instead:

1. **A real AI illustrator designs each piece** (Flux). Every design is unique and
   has artistry — not a permutation of a template.
2. **We make it stitchable + faithful** — convert the illustration into real
   pattern data, and render the finished piece from that data (so the hero is
   exactly what the stitcher makes).
3. **A ruthless gate keeps only the gems.** We generate in abundance (Flux is
   pennies) and a vision judge kills everything that isn't best-seller quality —
   including near-duplicates. **Junk cannot reach the catalogue, because nothing
   ships un-judged.** The control is the GATE, not the generator.

## The pipeline (per design)

```
brief ──▶ Flux illustration ──▶ convert (per niche) ──▶ render ──▶ VISION GATE ──▶ publish
 (varied) (sources.fluxIllustration)  (chart / regions)  (beauty)   (keep gem / kill)  (PUBLIC + thumb + search)
```

- **Brief** — vary on FOUR axes within a set, not just subject (the best-seller
  sites win on range):
  - **Subject** — animals, scenes, food, objects, botanical, seasonal, celestial…
  - **Style** — fun, cheery, cheeky, childlike, kawaii, folk-art, watercolour,
    vintage/old-fashioned, modern/minimalist, boho… name the style in the prompt;
    it changes the whole feel.
  - **Size** — deliberately mix small/quick (≈80–110 cells, 6–8 colours), medium
    (≈130–160), and large statement pieces (≈180–220, 30–45 colours). Drive it via
    the converter settings (`width/height/colours`), not just the prompt.
  - **Complexity** — single bold motifs (beginner) → dense detailed scenes
    (advanced); set `difficulty` to match so the library filters work.
  A good set reads like a shop: a cheeky quick one beside a big detailed showpiece
  beside a vintage sampler, across many subjects and styles. Prompt for clean art on
  a white background (bold + flat for embroidery; rich is fine for cross-stitch).
- **Design** — `sources.fluxIllustration(prompt)` → image bytes. Cache per slug so
  a reviewed-and-approved image is the one that ships.
- **Convert (the niche-specific step)**:
  - *cross-stitch* — `photoToPatternData(bytes, settings)` → a floss chart. Robust
    and solved: an image is literally a grid of floss colours.
  - *surface embroidery* — flat illustration → colour regions → stitch per region
    → loom `renderHero`. The harder, still-open converter (smooth faithful shapes,
    not a grid). Cross-stitch is the dependable quality route until this lands.
- **Render** — the finished-piece view the customer judges (cross-stitch:
  `renderPatternSvgString` beauty; embroidery: loom hero).
- **GATE** (below).
- **Publish** — only gems: upsert a PUBLIC `Pattern` + persist the beauty
  thumbnail + `buildPatternDoc`→`syncPatternDoc`. See `scripts/ai-crossstitch-publish.ts`.

## The ruthless vision gate (the anti-junk control)

Run by a Claude vision pass over the FINISHED renders of a batch. Binary per design
— **keep only a clear gem; kill everything else.** Judge against, in order:

1. **Best-seller bar** — would a customer choose this over a competitor best-seller,
   pay for it, and hang it? (Compare to Caterpillar / top Etsy listings.) Not "is it
   ok" — "is it a gem."
2. **Clean conversion** — no mush, no garbled detail, no dead/confetti areas; reads
   crisply at stitch resolution.
3. **On-brand + coherent** — a clear, charming, intentional picture.
4. **Original + safe** — Homemade-original; no infringement of a shop's design,
   celebrity, brand or franchise IP (see the IP guardrail in design-direction).
5. **Not a near-duplicate** — reject anything too close in subject AND look to a
   design already in the catalogue, so the range stays varied.

Expect a LOW pass rate (e.g. a few in ten). That is the point — abundance in,
gems out. The gate is the single place quality is enforced; the old text-only
"hold" check is not enough — it must be a look-at-the-picture judgement.

## Niche abstraction (use across categories)

A niche plugs in: (a) a converter (image → pattern data), (b) a renderer (data →
finished view), (c) the category/designer/sub-category + taggable type for publish.
Everything else — brief generation, Flux, the gate, the publish shape — is shared.
Cross-stitch is wired (`photoToPatternData` + `renderPatternSvgString` + the
publish script). Embroidery reuses the same front + gate; only its converter +
renderer (the loom) differ, and its converter is the open build.

## Status

- **Cross-stitch: live + proven.** `cozy-autumn-fox` + `cosy-reading-cat`,
  `wildflower-wreath`, `sunset-lighthouse`, `haunted-hill-house`, `sun-and-moon`,
  `happy-ramen` published (PUBLIC), each gate-passed by a vision review. Generator +
  publish: `scripts/needlework-ai-pilot.ts` (generate+render for review),
  `scripts/ai-crossstitch-publish.ts` (publish the gems).
- **Embroidery: design half proven, converter open.** Flux supplies the same
  design quality; turning flat art into smooth, faithful surface-embroidery stitch
  regions is the remaining build.
- **To productionise the gate:** the vision pass is a Claude review today; it can
  be wired as a per-image Claude call in the batch runner so a routine can
  generate→gate→publish unattended, but a human-quality vision judge in the loop is
  the requirement, not a text heuristic.
