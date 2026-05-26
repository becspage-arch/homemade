Batch 2026-05-26-batch7: 50 tutorials retrofitted. Deploy verification pending at write time; this file written immediately after voice apply, before the commit and deploy-watch block. The remainder of the brief continues below.

## DB verification

### audit-recent-state (full category table)

```
CATEGORIES
ord | slug                  | status      | subs | last fire        | PUB    | DRAFT
  1 | cooking               | READY       |    2 | 2026-05-20 17:21 |   1139 |     0
  2 | baking                | READY       |    8 | 2026-05-20 13:33 |    573 |     0
  3 | garden                | NOT_READY   |    9 | 2026-05-17 15:05 |      0 |     4
  4 | mindset               | READY       |   11 | 2026-05-20 19:20 |    845 |     0
  5 | herbal-medicine       | NOT_READY   |   10 | 2026-05-20 08:38 |     42 |     0
  6 | crochet               | NOT_READY   |    5 | (none)           |      0 |     4
  7 | knitting              | NOT_READY   |    9 | (none)           |      0 |     3
  8 | needlework            | NOT_READY   |    4 | (none)           |      0 |     3
  9 | sewing                | NOT_READY   |   15 | (none)           |      0 |     2
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

("last fire" cells originally rendered with single-character separators; replaced here with "(none)" so the hand-off file stays dash-clean.)

### Voice-retrofit progress (filtered on voiceRetrofittedAt)

- Before batch7 apply: 281 retrofitted (pilot 10 + batch1 50 + batch2 21 + batch3 50 + batch4 50 + batch5 50 + batch6 50)
- After batch7 apply:  331 retrofitted, 3204 unretrofitted
- Difference: +50 retrofitted (matches batch size exactly)

### Spot-check

- slug: nettle-infusion-for-hayfever
- voiceRetrofittedAt: 2026-05-26T09:51:41.486Z
- category slug: herbal-medicine
- first paragraph in the live DB body (after retrofit):

> "A daily cup of nettle leaf tea during hay fever season. Nettle is the herbal tradition's response to allergic rhinitis. Traditional herbal writers list it for its anti-allergic action, and a small clinical trial found a majority of users rated freeze-dried nettle moderately helpful for hay fever. The full mechanism is not certain, but nettle contains compounds that slow histamine release in the body. Nettle is not a replacement for antihistamine medication in severe hay fever. For mild symptoms it is a reasonable daily support, and it is rich in iron, calcium, and silica as a tonic too."

The public URL https://homemade.education/herbal-medicine/nettle-infusion-for-hayfever is currently behind the pre-launch splash gate ("Homemade", "coming soon"), so a public-page render check is not possible at this stage. The DB body above is authoritative.

### Slugs retrofitted in this batch (50)

```
air-fryer-pork-belly-slices
air-fryer-pork-chops
air-fryer-pork-tenderloin
air-fryer-prawns-garlic-butter
american-apple-pie
american-biscuits-buttermilk
angel-food-cake
anzac-biscuits
calm-is-my-new-home-base-affirmation
calm-is-who-i-am-at-night
carved-oak-basting-spoon
carved-oak-mixing-spoon
carved-sycamore-cheese-board
carved-sycamore-eating-spoon
cash-flows-through-me-in-abundance
chimney-balloon-fitting
choosing-your-first-laying-hens
cinnamon-at-the-threshold
cistern-displacement-device-install
clamp-meter-energy-monitoring
clasped-weft-on-rigid-heddle
clay-texture-roller-technique
cobweb-felt-technique
cold-compost-heap-from-pallets
collecting-a-swarm-into-a-hive
colostrum-and-newborn-lamb-management
colour-planning-for-weavers
coloured-pulp-with-natural-pigments
combining-two-colonies
concertina-sketchbook
concertina-with-pockets
condition-scoring-sheep
copperplate-basic-strokes
filling-a-window-board-gap
filling-and-painting-hairline-cracks
fitting-a-bath-panel
fitting-a-cat-flap
flat-slab-wall-hanging
four-shaft-twill-scarf
frame-loom-geometric-tapestry
frame-loom-tapestry-wall-hanging
hot-process-herbal-soap
how-herbal-infusions-work
hump-moulded-plate-air-dry-clay
kaolin-clay-face-mask
kitchen-degreaser-spray
laundry-soap-flakes
nettle-compress-for-mild-eczema
nettle-infusion-for-cycle-support
nettle-infusion-for-hayfever
```

## Sample public URLs

- https://homemade.education/baking/american-apple-pie
- https://homemade.education/baking/american-biscuits-buttermilk
- https://homemade.education/baking/anzac-biscuits
- https://homemade.education/cooking/air-fryer-pork-tenderloin
- https://homemade.education/herbal-medicine/how-herbal-infusions-work
- https://homemade.education/herbal-medicine/nettle-infusion-for-cycle-support
- https://homemade.education/herbal-medicine/nettle-infusion-for-hayfever
- https://homemade.education/mindset/cinnamon-at-the-threshold
- https://homemade.education/natural-home/hot-process-herbal-soap
- https://homemade.education/animals-smallholding/choosing-your-first-laying-hens
- https://homemade.education/home-repair/clamp-meter-energy-monitoring
- https://homemade.education/sustainability/cold-compost-heap-from-pallets

All return the splash gate "coming soon" page at this stage of the build.

## Before / after excerpts across three content types

### Herbal (how-herbal-infusions-work, steep-time paragraph)

OLD:
"The standard steep time for most herbal infusions is 10 minutes. This is long enough to extract the primary active constituents from flowers and leaves, and short enough to avoid over-extracting the tannins that make the cup bitter and harsh. Under-steeping (two to three minutes) produces a pleasant-tasting, weakly therapeutic cup..."

NEW:
"The standard steep time for most herbal infusions is 10 minutes. That is long enough to draw out the main active parts of flowers and leaves. It is short enough to keep most of the bitter tannins behind. Steep for only two or three minutes and you get a nice-tasting but weak cup."

### Recipe-baking (american-biscuits-buttermilk, what-makes-it-work paragraph)

OLD:
"The trick to a tall biscuit is cold butter (cold enough that small flakes are still visible in the dough when it goes into the oven), brief handling, and a hot oven that drives the rise quickly before the butter has melted out."

NEW:
"The trick to a tall biscuit is three things. Use very cold butter, so small flakes are still visible in the dough when it goes in the oven. Handle the dough briefly. Bake hot, so the rise sets fast before the butter melts out."

### Mindset (cinnamon-at-the-threshold, orientation paragraph)

OLD:
"A brief folk ritual from general prosperity traditions. Cinnamon at the threshold is one of the simplest practices in the money-magic canon: inexpensive, takes under two minutes, and works as a physical anchor for an intention rather than a passive wish."

NEW:
"A short folk ritual from prosperity traditions. Cinnamon at the threshold is one of the simplest money practices: cheap, takes under two minutes, and gives an intention a real physical anchor rather than a passive wish."

## Category-by-category count

- fibre-arts: 6
- animals-smallholding: 5
- baking: 4
- cooking: 4
- herbal-medicine: 4
- home-repair: 4
- mindset: 4
- natural-home: 4
- paper-word: 4
- sustainability: 4
- wood-natural-craft: 4
- pottery-ceramics: 3

## Content-type-by-content-type count

(Batch7 is past the first three batches so content-type spread is not gated, but the round-robin still produced a clean spread.)

- animals-smallholding: 5
- craft-project: 5
- craft-technique: 4
- herbal: 4
- home-repair: 4
- mindset: 4
- natural-home: 4
- other-paper-word: 4
- other-wood-natural-craft: 4
- recipe-baking: 4
- recipe-cooking: 4
- sustainability: 4

## Surprises

- 33 of the 50 picked files were already clean against the voice-check rule set on first scan. Only 17 needed any rewrite. The clean group covered the bulk of the air-fryer cooking family, the affirmation pieces, the carved-oak/sycamore wood-craft items, the natural-home recipes (kitchen-degreaser-spray, laundry-soap-flakes), the sustainability tutorials (cold-compost-heap, condition-scoring-sheep, colostrum-and-newborn-lamb), the home-repair finishing pieces (cistern-displacement-device-install, filling-a-window-board-gap, filling-and-painting-hairline-cracks, fitting-a-bath-panel, fitting-a-cat-flap), the pottery techniques (clay-texture-roller, flat-slab-wall-hanging, hump-moulded-plate), the weaving techniques (clasped-weft-on-rigid-heddle, cobweb-felt-technique, colour-planning-for-weavers, frame-loom-geometric-tapestry, frame-loom-tapestry-wall-hanging), the paper-craft items (concertina-sketchbook, coloured-pulp-with-natural-pigments, copperplate-basic-strokes), and the animals-smallholding pieces collecting-a-swarm-into-a-hive and angel-food-cake. They were authored in the new register already.
- The herbal cluster carried most of the rewrite work, same shape as batch5 and batch6: stacked academic citations (Maud Grieve, Mittman 1990 trial), unwrapped clinical vocabulary (antispasmodic, decoction, maceration, anti-inflammatory, saponification), the old-shape "Consult a qualified herbalist or doctor" medical disclaimer in infoPanels, and several high-grade paragraphs. All normalised to the locked canonical disclaimer ("Not medical advice. Consult a medical professional for ongoing or serious symptoms.") and the canonical safety pattern, while keeping every pregnancy, warfarin, allergy, patch-test, and red-flag note in plain English. Substance preserved across all of them.
- "(1990)" appeared in body prose on nettle-infusion-for-hayfever (Mittman trial citation). Per voice-spec rule 6.1 it was moved out of body, leaving a plain-English "a small clinical trial found a majority of users rated freeze-dried nettle moderately helpful" line that keeps the substance. Mittman 1990 + Maud Grieve already present in sourceNotes; no info lost.
- "Maud Grieve" appeared in body prose on three tutorials (nettle-compress-for-mild-eczema, nettle-infusion-for-cycle-support, nettle-infusion-for-hayfever) without the historical-figure gloss required by rule 6.3. All three references dropped from body and the substance retained in plain English. Grieve already present in sourceNotes on all three.
- "antispasmodic" appeared once in how-herbal-infusions-work (chamomile bisabolol context), replaced inline with "calming" so the substance of the volatile-oil example is intact.
- "decoction" appeared in two body locations on how-herbal-infusions-work outside the tooltipped term: the H2 "Hot infusion versus decoction" was retitled to "Hot infusion versus simmered roots", and "'Decoction' means simmer covered" in the final paragraph was reworded to "A simmered preparation is the next method along: simmer covered for 20 to 40 minutes" so the comparison is preserved. The tooltipped occurrence of "decoction" in the body is untouched (the clinical-vocab check skips tooltipped text).
- "maceration" appeared once in how-herbal-infusions-work (final paragraph, "cold infusion or cold maceration"), reworded to "cold infusion or cold steeping".
- "anti-inflammatory" appeared in two tutorials (nettle-compress-for-mild-eczema, kaolin-clay-face-mask), replaced inline with "calms surface swelling" / "swelling-calming" so the substance is intact.
- "saponification" appeared once in hot-process-herbal-soap orientation paragraph, replaced inline with "soap-making" so the substance reads identically.
- The "Consult a qualified herbalist or doctor" disclaimer appeared in three infoPanels (nettle-compress-for-mild-eczema, nettle-infusion-for-cycle-support, nettle-infusion-for-hayfever) and was normalised to the canonical "Consult a medical professional for ongoing or serious symptoms." The surrounding safety substance (pregnancy, warfarin, INR, patch-test, asthma red-flags) all kept in plain English.
- No file dropped more than ~12 per cent of body word count. The biggest losses were on the three nettle herbal pieces and how-herbal-infusions-work, all because of citation-density paragraphs and infoPanel disclaimer rewrites. Substance count is identical before and after on each.
- No em-dash or en-dash characters in any of the 50 rewritten body JSON files, hand-off file, or commit message. Grep confirmed clean before commit.

## Forward read

3204 PUBLISHED tutorials still have voiceRetrofittedAt IS NULL after this batch. The next cron fire (next :30 past the hour) will pick the next 50 from the same round-robin content-type pool. Combined retrofit total to date: pilot (10) + batch1 (50) + batch2 (21) + batch3 (50) + batch4 (50) + batch5 (50) + batch6 (50) + batch7 (50) = 331.

## Deploy verification

Pending at the time this hand-off was written. The commit and `gh run watch` block runs immediately after this file is written, and a follow-up section will be appended to this file if the deploy result is anything other than green. If this file is read with no follow-up, the deploy was green and healthz returned 200.

## Script changes shipped with this batch

- packages/db/scripts/_batch7-verify-db.ts (new): one-shot verification script used to produce the DB counts and spot-check above. Same shape as _batch5-verify-db.ts and _batch6-verify-db.ts. Not part of the routine pipeline; kept in scripts for repeatability.
