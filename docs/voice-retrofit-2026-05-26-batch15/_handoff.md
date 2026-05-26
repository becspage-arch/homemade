# Voice retrofit batch 2026-05-26-batch15

Batch 2026-05-26-batch15: 50 tutorials retrofitted. Deploy green, healthz 200.

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

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 681
After this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL):  731
Delta: +50 (matches the batch size).

Source of truth: `pnpm --filter "@homemade/db" exec tsx scripts/_count-voice-retrofitted.ts`.

Output:

```
voice_retrofitted_published: 731
remaining_published:         2804
total_published:             3535
```

### 3. Spot-check

Slug: `apple-charlotte`
voiceRetrofittedAt: `2026-05-26T17:44:26.307Z`
First paragraph in DB after apply:

> Apple Charlotte is built the wrong way up: the base of the basin becomes the top of the finished pudding when it is turned out. The bread slices need to overlap well in the basin so there are no gaps for the apple to escape through. Cut a circle for the base, then fit rectangular strips around the sides with each one overlapping its neighbour slightly.

Public URL: https://homemade.education/cooking/apple-charlotte. The live page renders the body from the DB at request time, so the opening above is what visitors now see at that URL.

### 4. Full slug list (50)

```
apple-and-cinnamon-porridge
apple-charlotte
apple-chutney
apple-cinnamon-overnight-oats
bath-buns-sweet-yeasted
battenberg-cake
beer-bread
beer-cheese-quick-bread
giving-and-receiving-are-the-same-river
giving-feels-expansive-and-fearless-affirmation
green-oak-three-legged-stool
green-oak-tool-tote
green-wood-bowl-rough-out
green-wood-stool-leg
grief-isnt-linear
guilt-is-not-the-measure-of-good-mothering
hand-on-belly-bills-are-met
heating-controls-upgrade
home-energy-audit-measuring-your-baseload
hot-composting-without-a-bin
household-leak-detection
italian-vein-marbling
italic-capital-letters
italic-joined-letterforms
italic-minuscule-alphabet
kittens-from-birth-to-weaning
leno-weave-frame-loom
lighting-a-bee-smoker
locker-hook-rug-basics
making-a-hump-mould-for-bowls
making-a-nucleus-hive
making-a-pig-wallow
making-a-simple-drape-mould
making-clay-slip-and-slurry
managing-a-broody-hen
painting-a-room-walls-and-ceiling
painting-over-mould-and-damp-stains
painting-skirting-boards-and-architrave
patching-a-lath-and-plaster-wall
patching-a-small-plasterboard-hole
polymer-clay-brooch
polymer-clay-buttons
polymer-clay-face-bead
polymer-clay-flower-cane-earrings
polymer-clay-flower-hair-clip
soy-wax-jar-candle-citrus-spice
soy-wax-jar-candle-geranium
soy-wax-jar-candle-lavender
soy-wax-jar-candle-vanilla
soy-wax-massage-candle
```

## Sample public URLs across categories

- https://homemade.education/cooking/apple-charlotte
- https://homemade.education/cooking/apple-chutney
- https://homemade.education/baking/battenberg-cake
- https://homemade.education/animals-smallholding/making-a-nucleus-hive
- https://homemade.education/mindset/grief-isnt-linear
- https://homemade.education/home-repair/painting-over-mould-and-damp-stains
- https://homemade.education/natural-home/soy-wax-massage-candle
- https://homemade.education/pottery-ceramics/polymer-clay-buttons
- https://homemade.education/paper-word/italic-capital-letters
- https://homemade.education/sustainability/heating-controls-upgrade
- https://homemade.education/wood-natural-craft/green-oak-three-legged-stool

## Before / after excerpts (three content types)

### Cooking (apple-charlotte, "Where this dish lives" paragraph)

Before:
> Apple Charlotte is one of the older named British puddings, with recipes appearing in cookery books from the early nineteenth century. The bread-lined mould format was a practical solution in an era before domestic pastry was reliable, producing a self-contained pudding that turned out whole and held its shape on the plate.

After:
> Apple Charlotte is one of the older named British puddings. Recipes appear in cookery books from the early 1800s. The bread-lined basin was a practical fix in a time before home pastry was reliable. It turned out whole and held its shape on the plate.

### Sustainability (heating-controls-upgrade, opening paragraph)

Before:
> A house heated with a modern condensing boiler and no controls beyond an on/off switch on the boiler will consume significantly more gas than the same house with a programmer, a room thermostat, and TRVs on every radiator. The Energy Saving Trust estimates that adding a programmer and room stat to a home with no controls saves 15-20% on annual gas consumption.

After:
> A house with a modern condensing boiler but only an on/off switch burns far more gas than the same house fitted with a programmer, a room thermostat, and TRVs on every radiator. Adding a programmer and room stat to a home with no controls cuts annual gas use by about 15 to 20%.

### Animals-smallholding (making-a-nucleus-hive, frame-selection paragraph)

Before:
> Pick two frames of mixed brood (eggs, young larvae, and some sealed cells), one frame of sealed honey and pollen, one frame carrying a sealed queen cell (if available) or eggs young enough to raise a queen cell from, and one frame of drawn comb for the queen to lay into.

After:
> Pick two frames of mixed brood (eggs, young larvae, and some sealed cells). Add one frame of sealed honey and pollen. Add one frame with a sealed queen cell, or eggs young enough to raise a queen cell from. Then add one frame of drawn comb for the queen to lay into.

## Category-by-category count

```
animals-smallholding: 5
baking:               4
cooking:              4
fibre-arts:           2
home-repair:          5
mindset:              5
natural-home:         5
paper-word:           4
pottery-ceramics:     8
sustainability:       4
wood-natural-craft:   4
```

(Pottery-ceramics ran high at 8 because the picker hit its per-category cap of 15 only on the largest backlogs; pottery-ceramics had a fresh seam of polymer-clay PATTERN tutorials that fed both craft-project and other-pottery-ceramics bucket draws. Still inside the 15 cap.)

## Content-type-by-content-type count (batch 15, off-spread phase)

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

- 38 of 50 candidates passed the voice-check on export with zero errors. Only 12 needed any rewrite, and every fix was narrow (1 to 4 paragraphs each). This batch was more polish than rewrite.
- The medical-claim rule fired on patching-a-small-plasterboard-hole because the body used "cures" in its plain joinery sense (filler curing as it sets). Reworded to "sets".
- Three files had pre-existing en or em dashes (italic-capital-letters title, polymer-clay-brooch qty, polymer-clay-buttons qty + circular-template name). The voice-check does not scan title or suppliesCard qty by design (those are non-paragraph chunks), but the routine's no-dashes-anywhere rule applies. Replaced with colons or "to" and re-applied.
- No word-count drops over 20% on any file (rewrites split long sentences and dropped institutional attributions where the same citation already lived in sourceNotes, rather than removing substance).
- Hand-on-belly-bills-are-met is a PRACTICE with verbatim energy statements inside it. The rewrite touched only the "How this practice works" closing paragraph (Levine, Ogden, Rebecca's book citation) which is acknowledgment prose, not a verbatim energy statement. Verbatim statements in the body were left untouched.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 2804.

## Deploy verification

- Commit: c39afc6 on main.
- GitHub Actions deploy run id: 26465176699. Completed green.
- `curl https://homemade.education/healthz` returned 200.

The public site sits behind the splash gate, so anonymous visits to a
tutorial URL still resolve to the coming-soon page rather than the
tutorial body. The DB-side spot-check above is the live state that the
tutorial page would render once a visitor is past the gate.
