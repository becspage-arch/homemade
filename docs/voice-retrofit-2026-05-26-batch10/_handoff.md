# Voice retrofit batch 2026-05-26-batch10

Batch 2026-05-26-batch10: 50 tutorials retrofitted. Deploy pending verification (see end of file).

## DB verification

### 1. audit-recent-state output

```
CATEGORIES
ord | slug                  | status      | subs | last fire        | PUB    | DRAFT
  1 | cooking               | READY       |    2 | 2026-05-20 17:21 |   1139 |     0
  2 | baking                | READY       |    8 | 2026-05-20 13:33 |    573 |     0
  3 | garden                | NOT_READY   |    9 | 2026-05-17 15:05 |      0 |     4
  4 | mindset               | READY       |   11 | 2026-05-20 19:20 |    845 |     0
  5 | herbal-medicine       | NOT_READY   |   10 | 2026-05-20 08:38 |     42 |     0
  6 | crochet               | NOT_READY   |    5 | -                |      0 |     4
  7 | knitting              | NOT_READY   |    9 | -                |      0 |     3
  8 | needlework            | NOT_READY   |    4 | -                |      0 |     3
  9 | sewing                | NOT_READY   |   15 | -                |      0 |     2
 10 | fibre-arts            | READY       |    6 | 2026-05-20 20:30 |    127 |     0
 11 | wood-natural-craft    | READY       |    6 | 2026-05-20 23:08 |    162 |     0
 12 | paper-word            | READY       |    9 | 2026-05-21 00:28 |    117 |     0
 13 | pottery-ceramics      | READY       |    6 | 2026-05-21 02:42 |     82 |     0
 14 | animals-smallholding  | READY       |    6 | 2026-05-21 04:28 |    121 |     0
 15 | home-repair           | READY       |    6 | 2026-05-21 06:49 |    123 |     0
 16 | natural-home          | READY       |    5 | 2026-05-21 01:23 |     82 |     0
 17 | sustainability        | READY       |    6 | 2026-05-21 06:49 |    122 |     0

IMAGE VERIFICATION
  UNVERIFIED                   : 2316
  VERIFIED                     : 1219
```

### 2. Voice retrofit count: before and after

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 431
After this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 481
Delta: +50 (matches the batch size).

Source of truth: `pnpm --filter "@homemade/db" exec tsx scripts/_count-voice-retrofitted.ts`.

### 3. Spot-check

Slug: `babka-cinnamon`
voiceRetrofittedAt: `Tue May 26 2026 13:43:35 GMT+0100 (British Summer Time)`
First paragraph in DB after apply: "Babka is a Polish and Ashkenazi Jewish baked good with deep roots in Eastern European home baking. The word means grandmother in Polish. The loaf's characteristic swirled cross-section, visible when sliced, comes from rolling the dough around a filling, cutting the roll lengthwa..."

Live URL: https://homemade.education/baking/babka-cinnamon. The page returns HTTP 200. The deployed Next.js container reads bodies from the database via Prisma at request time, so the new register is live as soon as the apply script returns; no container rebuild is needed for content changes. Curl alone fetches the React shell (BAILOUT_TO_CLIENT_SIDE_RENDERING) so the rendered text does not appear in the raw HTML, but the DB body confirmed above is the source the page will render.

### 4. Full slug list (50)

air-fryer-scampi, air-fryer-scotch-eggs, air-fryer-steak, air-fryer-sweet-potato-fries, babka-chocolate, babka-cinnamon, babka-savoury-cheese-herb, bagels-montreal-style, cherry-jewellery-box-lid, chip-carved-beech-butter-dish, chip-carved-beech-mirror-frame, chip-carved-oak-panel, double-page-scrapbook-spread, draught-strip-sash-windows, draught-stripping-a-front-door, drip-irrigation-from-a-water-butt, dual-flush-toilet-valve-conversion, dyeing-with-chamomile-yellow, dyeing-with-indigo-on-cotton, dyeing-with-madder-for-red, dyeing-with-nettles-for-green, dyeing-with-oak-galls, each-thought-loop-a-thread-you-set-down, earning-can-feel-light, earning-has-many-shapes, earning-is-allowed-to-be-easy-and-endless, ease-is-allowed-to-be-the-new-pattern, eight-page-mini-zine-one-sheet, electric-fence-troubleshooting, embossed-patterns-in-wet-sheets, emergency-queen-cell-management, ephemera-mounting-techniques, farrowing-pen-setup-for-an-outdoor-sow, first-aid-kit-for-a-smallholding, fitting-a-mouse-guard, fitting-a-new-light-fitting, fitting-a-picture-rail, fitting-a-shaver-socket, fitting-a-thermostatic-radiator-valve, fitting-a-threshold-strip, melt-and-pour-lavender-soap, mould-spray-tea-tree, natural-fabric-softener, needle-felted-cactus-set, needle-felted-flower-corsage, needle-felted-fox, needle-felted-landscape-panel, needle-felted-landscape-triptych, oat-honey-face-mask, oven-cleaner-paste.

## Sample public URLs

- cooking: https://homemade.education/cooking/air-fryer-steak
- baking: https://homemade.education/baking/babka-cinnamon
- mindset: https://homemade.education/mindset/ease-is-allowed-to-be-the-new-pattern
- home-repair: https://homemade.education/home-repair/fitting-a-new-light-fitting
- natural-home: https://homemade.education/natural-home/mould-spray-tea-tree
- sustainability: https://homemade.education/sustainability/drip-irrigation-from-a-water-butt
- fibre-arts: https://homemade.education/fibre-arts/needle-felted-fox
- paper-word: https://homemade.education/paper-word/eight-page-mini-zine-one-sheet
- wood-natural-craft: https://homemade.education/wood-natural-craft/chip-carved-oak-panel
- animals-smallholding: https://homemade.education/animals-smallholding/farrowing-pen-setup-for-an-outdoor-sow

## Before / after excerpts

### Natural-home: mould-spray-tea-tree (paragraph 0)

Before:
"A mould and mildew spray. White vinegar (5% acetic acid) is effective against a range of mould species including Aspergillus, Penicillium, and Cladosporium at full concentration; this spray dilutes it to 60% for practical use on tiled surfaces without excessive odour. Tea tree essential oil (Melaleuca alternifolia) has well-documented antifungal activity at 0.5-1% concentration; at 2% in this spray it provides a sustained effect on porous grout and silicone sealant after the vinegar has evaporated."

After:
"A mould and mildew spray for tiled surfaces. White vinegar (5% acetic acid) kills a wide range of common moulds at full strength. This spray dilutes it to 60%, so the smell is bearable on a bathroom wall. Tea tree oil is known to kill mould at low concentrations. At 2% in this spray, it keeps working on porous grout and silicone sealant after the vinegar has dried off."

### Home-repair: fitting-a-new-light-fitting (paragraph 4)

Before:
"UK domestic lights use one of two wiring systems: the loop-in ceiling rose (the flex to the pendant emerges from a rose that contains the wiring connections), or a junction-box system (the rose is simply a flex outlet, with the wiring connections in a separate junction box above the ceiling). In either case, only the conductors connecting to the pendant flex are touched; the conductors entering the ceiling rose from the ceiling are not disturbed."

After:
"UK homes use one of two wiring systems for lights. The first is a loop-in ceiling rose. The flex to the pendant comes out of a rose that holds the wiring connections. The second is a junction-box system. The rose is just a flex outlet, with the wiring in a separate junction box above the ceiling. In both cases, you only touch the wires going to the pendant flex. The wires entering the rose from the ceiling stay where they are."

### Natural-home: oat-honey-face-mask (paragraph 1)

Before:
"Finely milled oat provides gentle physical exfoliation and a soothing quality for sensitive or dry skin; kaolin clay provides a very light oil absorption without the drying effect of stronger clays like bentonite; honey powder (dehydrated honey) provides the humectant and antimicrobial honey properties without the runny texture of fresh honey in a dry mix."

After:
"The finely milled oat gives a gentle scrub and soothes dry or sensitive skin. The kaolin clay soaks up a little oil without the drying effect of stronger clays like bentonite. The honey powder is dried honey, so the mix stays dry in the jar. Once you stir it with water, the honey draws moisture into the skin like fresh honey does."

## Category-by-category count

animals-smallholding: 5, baking: 4, cooking: 4, fibre-arts: 10, home-repair: 5, mindset: 5, natural-home: 5, paper-word: 4, sustainability: 4, wood-natural-craft: 4. Total: 50.

## Anything surprising

- 32 of 50 candidates passed voice-check on first run. The new-register author prompt is shipping in-register bodies for fresh content; retrofit work concentrates on legacy bodies authored before 2026-05-21. Carry-on trend from batch 9 (34 of 50 first-pass clean).
- The grade-level rule caught 23 of the 26 violations, with only 2 institutional-name (Energy Saving Trust, NHS) and 1 clinical-vocab (saponification) flags. As the backlog clears, the remaining violators skew toward dense technical paragraphs in home-repair, sustainability, and POM-V medicines copy, not academic-citation patterns.
- The "saponification" hit on melt-and-pour-lavender-soap was a useful catch: it appeared in body prose to explain the process. The rewrite leaves the lay-reader with "the base is already finished soap from the factory" instead of the clinical term.
- "Energy Saving Trust" in draught-stripping-a-front-door body was already in sourceNotes; the body sentence just attributed an estimate. The fix was to drop the attribution sentence prefix and keep the substantive claim.
- No file showed a word-count drop greater than 20% versus the pre-rewrite body. Paragraph-level rewrites stayed close to the original length, mostly breaking long sentences into shorter ones rather than removing substance.
- fibre-arts pulled 10 picks because the round-robin filled craft-technique and craft-project buckets from the same category pool. Still inside the per-category cap of 15.

## Forward read

3054 PUBLISHED tutorials with voiceRetrofittedAt IS NULL remain after this fire.

## Deploy verification

To be filled in after `gh run watch` completes. See bottom of file.
