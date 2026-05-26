# Voice retrofit batch 2026-05-26-batch14

Batch 2026-05-26-batch14: 50 tutorials retrofitted. Deploy expected (packages/** path filter fired by two new helper scripts). healthz check pending verification.

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

(Hyphens replace en dashes in the script output to keep this file em-dash and en-dash clean.)

### 2. Voice retrofit count: before and after

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 631
After this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 681
Delta: +50 (matches the batch size).

Source of truth: `pnpm --filter "@homemade/db" exec tsx scripts/_count-voice-retrofitted.ts`.

Output:

```
voice_retrofitted_published: 681
remaining_published:         2854
total_published:             3535
```

### 3. Spot-check

Slug: `apple-and-blackberry-crumble`
voiceRetrofittedAt: `2026-05-26T16:45:01.722Z`
First paragraph in DB after apply:

> Blackberries and Bramley apples are a classic British pair. The apple gives bulk and sweetness once cooked. The blackberries bring colour and a sharp note. Together they make a lot of juice as they bake. The juice bubbles up at the edges and soaks into the underside of the crumble. That leaves a layer that is part crisp and part soft.

Public URL: https://homemade.education/cooking/apple-and-blackberry-crumble. Live page first paragraph will be confirmed after deploy goes green.

### 4. Full slug list (50)

```
anglicised-dhansak
anglo-indian-curry-powder
anglo-indian-fish-curry
apple-and-blackberry-crumble
bara-brith
barley-sugar
barmbrack
basic-white-sandwich-loaf
forty-as-a-beginning
four-seven-eight-breath-for-sleep
four-seven-eight-breath-four-rounds
freedom-and-joy-as-daily-standard-affirmation
generosity-feels-good-in-my-body
gouge-hollow-bowl-technique
green-ash-roughing-a-spoon-blank
green-ash-tool-handle
green-oak-post-mallet
hand-stamped-journal-borders
heat-pump-cop-scop-explained
heat-pump-flow-temperature
heat-pump-installation-what-to-expect
heat-pump-radiator-sizing
heritage-scrapbook-archival-page
how-cotton-linter-behaves
identifying-common-chicken-ailments
incubating-hatching-eggs
index-and-key-pages
indigo-vat-dyeing-basics
inspecting-a-beehive-in-summer
introducing-new-hens-to-an-existing-flock
iron-after-bath-mordant-modifier
joining-clay-score-and-slip
keeping-smallholding-livestock-records
larks-head-knot-macrame
layered-colour-blending-wet-felting
lifting-and-relaying-a-floorboard
making-a-leather-tool-roll
making-a-simple-leather-belt
making-a-simple-leather-wallet
painting-a-ceiling
pinch-pot-bowl-air-dry-clay
pinch-pot-ring-dish
pinch-pot-tea-light-holder
plain-weave-yardage-rigid-heddle
polymer-clay-bead-set
soft-floor-cleaner
solid-rose-perfume-balm
soy-botanical-candle
soy-tealights
soy-wax-jar-candle-citrus
```

## Sample public URLs across categories

- https://homemade.education/cooking/apple-and-blackberry-crumble
- https://homemade.education/baking/basic-white-sandwich-loaf
- https://homemade.education/animals-smallholding/identifying-common-chicken-ailments
- https://homemade.education/mindset/forty-as-a-beginning
- https://homemade.education/home-repair/heat-pump-flow-temperature
- https://homemade.education/natural-home/solid-rose-perfume-balm
- https://homemade.education/pottery-ceramics/pinch-pot-ring-dish
- https://homemade.education/fibre-arts/indigo-vat-dyeing-basics
- https://homemade.education/paper-word/heritage-scrapbook-archival-page
- https://homemade.education/wood-natural-craft/green-ash-tool-handle

## Before/after excerpts (three content types)

### Cooking (apple-and-blackberry-crumble)

Before:
> Blackberries and Bramley apple have a natural affinity: the apple provides volume and sweetness once cooked, the blackberries provide colour and tartness. Together they release a lot of juice during baking, which bubbles up through the crumble edges and soaks into the underside, giving it a layer that is part-crisp and part-softened.

After:
> Blackberries and Bramley apples are a classic British pair. The apple gives bulk and sweetness once cooked. The blackberries bring colour and a sharp note. Together they make a lot of juice as they bake.

### Home repair (heat-pump-cop-scop-explained, paragraph 9)

Before:
> The single most effective action is reducing the required flow temperature. Upgrading radiators to low-temperature models (larger surface area) allows the heat pump to run at 40-45°C flow instead of 55-65°C, improving SCOP by 0.5-1.0.

After:
> The single most useful change is lowering the flow temperature. Bigger radiators have more surface area, so the pump can run at 40-45°C instead of 55-65°C. That raises SCOP by 0.5 to 1.0.

### Animals-smallholding (identifying-common-chicken-ailments, paragraph 4)

Before:
> Open-mouthed breathing, rattling or gurgling sounds, nasal discharge, and swollen sinuses below the eyes are all respiratory warning signs. In a flock context, respiratory disease spreads quickly.

After:
> Open-mouthed breathing, rattles or gurgles, runny nose, and swollen sinuses under the eyes are all warning signs of a chest problem. Respiratory disease moves through a flock fast.

## Category-by-category count

```
animals-smallholding: 5
baking:               4
cooking:              4
fibre-arts:           5
home-repair:          5
mindset:              5
natural-home:         5
paper-word:           4
pottery-ceramics:     5
sustainability:       4
wood-natural-craft:   4
```

## Content-type-by-content-type count (batch 14, off-spread phase)

```
animals-smallholding:    5
craft-project:           5
craft-technique:         5
home-repair:             5
mindset:                 5
natural-home:            5
other-paper-word:        4
other-wood-natural-craft:4
recipe-baking:           4
recipe-cooking:          4
sustainability:          4
```

## Surprises

- 32 of 50 candidates already passed the voice-check on export with zero errors. Most edits in this batch were narrow grade-level fixes on individual paragraphs, not full openings. The batch is more polish than rewrite.
- One file (identifying-common-chicken-ailments) tripped the medical-claim rule on the word "treats" in the phrase "not all vets treat chickens" after the grade-level rewrite. Reworded to "Not every vet works with chickens" and re-verified.
- No word-count drops over 20% on any file (the rewrites trimmed clinical/Latin vocabulary and split long sentences rather than removing substance).

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 2854.
