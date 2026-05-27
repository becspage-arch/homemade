Batch 2026-05-27-batch27: 50 tutorials retrofitted. Deploy green, healthz 200.

## DB audit (audit-recent-state.ts)

```
CATEGORIES
ord | slug                  | status      | subs | last fire        | PUB    | DRAFT
  1 | cooking               | READY       |    2 | 2026-05-20 17:21 |   1139 |     0
  2 | baking                | READY       |    8 | 2026-05-20 13:33 |    573 |     0
  3 | garden                | NOT_READY   |    9 | 2026-05-17 15:05 |      0 |     4
  4 | mindset               | READY       |   11 | 2026-05-20 19:20 |    845 |     0
  5 | herbal-medicine       | NOT_READY   |   10 | 2026-05-20 08:38 |     42 |     0
  6 | crochet               | NOT_READY   |    5 |                  |      0 |     4
  7 | knitting              | NOT_READY   |    9 |                  |      0 |     3
  8 | needlework            | NOT_READY   |    4 |                  |      0 |     3
  9 | sewing                | NOT_READY   |   15 |                  |      0 |     2
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

## Voice retrofit progress

- Before this fire: 1281 PUBLISHED tutorials with voiceRetrofittedAt set (count derived: post-fire 1331 minus this batch's 50).
- After this fire: 1331 PUBLISHED tutorials with voiceRetrofittedAt set.
- Remaining: 2204 PUBLISHED tutorials with voiceRetrofittedAt IS NULL.
- Delta matches batch size (50). PASS.

## Spot-check (one slug from batch)

- slug: i-do-the-daily-things-wealthy-women-do
- voiceRetrofittedAt: 2026-05-27T06:38:26.606Z
- url: https://homemade.education/mindset/i-do-the-daily-things-wealthy-women-do (site behind splash gate; anonymous traffic lands on /coming-soon, so body is not visible to a public curl. DB content confirmed via direct query.)
- new first paragraph (from DB):

> A short affirmation for anchoring the daily actions that build wealth as current practice. The statement is present tense: not a plan, not a future intention, but what is already happening.

## Sample public URLs across categories

- https://homemade.education/cooking/bigos
- https://homemade.education/cooking/boeuf-bourguignon
- https://homemade.education/cooking/blt-sandwich
- https://homemade.education/baking/chiffon-cake-citrus
- https://homemade.education/baking/chocolate-eclairs
- https://homemade.education/mindset/i-clear-the-hidden-refusal-yes-is-allowed
- https://homemade.education/mindset/i-forgive-the-years-i-didnt-sleep
- https://homemade.education/wood-natural-craft/sharpening-a-sloyd-knife
- https://homemade.education/wood-natural-craft/side-axe-technique
- https://homemade.education/paper-word/sized-paper-for-calligraphy-alum-gelatin

## Before / after excerpts (three content types)

### Cooking RECIPE: blt-sandwich

BEFORE:
> The BLT is held together by the contrast of temperatures and textures: hot crisp bacon, cold lettuce, cool sliced tomato. The mayonnaise is not a condiment; it is the structural element that keeps the tomato from sliding and gives the sandwich its richness. There are only three variables to get right: the bacon should be properly crisp (not chewy, not brittle), the tomato should be ripe and at room temperature rather than cold from the fridge, and the toast should be warm when you assemble.

AFTER:
> A BLT works on contrast. Hot crisp bacon. Cold lettuce. Cool sliced tomato. The mayonnaise is not a side note. It holds the tomato in place and adds the richness the sandwich needs. Three things matter. The bacon should be properly crisp, not chewy and not brittle. The tomato should be ripe and at room temperature, not cold from the fridge. The toast should still be warm when you build.

### Mindset PRACTICE: i-clear-the-hidden-refusal-yes-is-allowed

BEFORE:
> A three-minute energy statement practice from Day 20 of the MONEY program. The statement works on the layer of resistance that runs quietly behind conscious intention: the part that spends before money settles, avoids the forward step, finds the reason this particular opportunity isn't the right one.

AFTER:
> A three-minute energy statement from Day 20 of the MONEY program. The statement works on the quiet part of you that says no to money even when you want it. The part that spends a payment before it settles, puts off the next step, or finds a reason the chance isn't right.

### Wood-natural-craft TECHNIQUE: side-axe-technique

BEFORE:
> The side axe does one thing a symmetric carving axe cannot: it hews a flat, planed-quality surface along the grain of a round billet. The flat back of the blade rides against the work surface while the bevel of the edge lifts the chip; the result is a much flatter face than a symmetric-bevel axe can produce. It is used to square a round log face before drawknife or spokeshave work, to flatten one side of a green stool seat, or to reduce a sawn cant to a consistent thickness faster than a hand plane could.

AFTER:
> The side axe does one thing a symmetric carving axe cannot: it hews a flat, planed-quality surface along the grain of a round billet. The flat back of the blade rides on the work; the bevel of the edge lifts the chip. The result is a much flatter face than a symmetric axe can make. Use it to square a log face before drawknife or spokeshave work, to flatten one side of a green stool seat, or to reduce a sawn block to an even thickness faster than a hand plane could.

## Category breakdown (50 total)

- cooking: 15
- baking: 15
- mindset: 15
- wood-natural-craft: 4
- paper-word: 1

## Content type breakdown (batches past 3 do not require type spread; recorded for visibility)

- RECIPE: 30
- PRACTICE: 15
- READING: 1
- TECHNIQUE: 2
- PATTERN: 2

## Surprises / notes

- Six tutorials initially failed the apply step on grade-level: i-clear-the-hidden-refusal-yes-is-allowed, i-did-the-best-i-could-with-what-i-knew, sharpening-a-sloyd-knife, side-axe-technique, simple-pine-wall-shelf, sized-paper-for-calligraphy-alum-gelatin. All six were corrected with shorter sentences and simpler vocabulary, then re-applied. Final apply: 50 of 50 OK.
- chocolate-layer-cake.json carried an en dash in yieldDescription ("serves 8-10"). Fixed before apply to a plain hyphen so the pre-commit em/en-dash sweep stays clean.
- Several cooking and baking entries (e.g. bigos, blackberry-jam, bircher-muesli) showed BEFORE = AFTER for the first paragraph; the published copy was already inside grade 6-8 register and no rewrite of the opening was needed. The body still moved through the apply path (subtitle / excerpt / sourceNotes were also written, and voiceRetrofittedAt now records the audit pass).
- No word-count drops over 20% were observed in this batch.

## Forward read

After this fire, 2204 PUBLISHED tutorials remain with voiceRetrofittedAt IS NULL. Next fire picks the next 50 in slug order.
