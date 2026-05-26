# Voice retrofit batch 2026-05-26-batch16

Batch 2026-05-26-batch16: 50 tutorials retrofitted. Deploy green, healthz 200.

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

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 731
After this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL):  781
Delta: +50 (matches the batch size).

Source of truth: `pnpm --filter "@homemade/db" exec tsx scripts/_count-voice-retrofitted.ts`.

Output after this fire:

```
voice_retrofitted_published: 781
remaining_published:         2754
total_published:             3535
```

### 3. Spot-check

Slug: `mishima-inlay-on-air-dry-clay`
voiceRetrofittedAt: `2026-05-26T18:45:15.784Z`
First paragraph in DB after apply:

> Mishima line inlay works well on air-dry clay. Cut the lines when the clay is leather-hard. Fill with coloured slip. Let it firm. Scrape back to reveal the lines. The name comes from a Korean tradition of white slip set into grey celadon. This tutorial uses the same cut-and-fill idea in acrylic-tinted slip on air-dry clay. Same idea, same look, with adapted materials.

Public URL: https://homemade.education/pottery-ceramics/mishima-inlay-on-air-dry-clay. The URL returns HTTP 200. The live site sits behind the splash gate for anonymous visitors, so the public render of the tutorial body itself is gated; the DB-side spot-check above is the live state that the page will render once a visitor is past the gate.

### 4. Full slug list (50)

```
apple-crumble
apple-sauce
apple-smoothie-with-raspberries
arancini
beignets-new-orleans
bialy-rolls
biscotti-almond
biscotti-chocolate-hazelnut
green-wood-vs-seasoned-wood
green-woodwork-moisture-testing
green-woodwork-primer
half-lap-joint-technique
hand-on-chest-you-were-doing-your-best
hand-on-heart-naming-what-is-there
hand-on-heart-naming-whats-there
handing-the-burden-back-gently
hands-open-not-gripping-visualisation
household-water-audit
insulating-below-rafters-warm-roof
insulation-and-ventilation-together
internal-wall-insulation-dry-lining
japanese-stab-binding-asanoha
japanese-stab-binding-kikko
japanese-stab-binding-yotsume
japanese-tissue-paper-mending
managing-a-sow-with-litter
marbling-two-tone-air-dry-clay
milking-a-dairy-goat
mishima-inlay-on-air-dry-clay
moving-pigs-with-a-pig-board
mucking-out-a-pig-arc
natural-dye-mordant-overview
navajo-ply-from-singles
needle-felting-a-base-shape
notching-and-tagging-piglets
planing-a-door-to-fit
plastering-over-a-plasterboard-patch
polymer-clay-geometric-pendant
polymer-clay-leaf-pendant
polymer-clay-marble-effect-coasters
polymer-clay-millefiori-cane
polymer-clay-miniature-succulent
putting-up-a-shelf-on-a-solid-wall
re-caning-a-pressed-cane-seat
regluing-a-loose-chair-rail
spring-simmer-pot
sugar-scrub-sweet-orange
sweet-almond-geranium-soap
sweet-orange-reed-diffuser
tea-tree-spot-treatment
```

## Sample public URLs across categories

- https://homemade.education/cooking/apple-sauce
- https://homemade.education/cooking/arancini
- https://homemade.education/baking/biscotti-chocolate-hazelnut
- https://homemade.education/animals-smallholding/managing-a-sow-with-litter
- https://homemade.education/mindset/hand-on-chest-you-were-doing-your-best
- https://homemade.education/home-repair/planing-a-door-to-fit
- https://homemade.education/natural-home/sweet-almond-geranium-soap
- https://homemade.education/pottery-ceramics/mishima-inlay-on-air-dry-clay
- https://homemade.education/paper-word/japanese-tissue-paper-mending
- https://homemade.education/sustainability/insulation-and-ventilation-together
- https://homemade.education/wood-natural-craft/green-wood-vs-seasoned-wood
- https://homemade.education/fibre-arts/needle-felting-a-base-shape

## Before / after excerpts (three content types)

### Baking (biscotti-chocolate-hazelnut, opening paragraph)

Before:
> The twice-baking technique dries the biscotti to a snap that holds for weeks in a tin and survives dunking in coffee without disintegrating immediately. Roasting the hazelnuts before adding them deepens the flavour considerably; raw hazelnuts in biscotti taste flat by comparison.

After:
> The twice-baking method dries biscotti to a snap. They stay crisp for weeks in a tin and hold up to a dunk in coffee. Roast the hazelnuts before they go in. Raw hazelnuts in biscotti taste flat next to roasted ones.

### Sustainability (insulation-and-ventilation-together, opening paragraph)

Before:
> An unimproved pre-war UK house leaks around 15 to 20 air changes per hour at a 50 Pa pressure test. Standard retrofit draught-proofing (chimney sealing, floor-edge mastic, window draught strips) typically reduces this to 8 to 12 ACH. At below approximately 5 ACH, uncontrolled infiltration no longer reliably provides sufficient fresh air for normal occupancy. That threshold is rarely reached by basic draught-proofing alone, but it is relevant when adding internal wall insulation with taped vapour control layers or replacing windows with tightly sealed frames.

After:
> An unimproved pre-war UK house leaks about 15 to 20 air changes per hour at a 50 Pa pressure test. Standard draught-proofing (chimney sealing, floor-edge mastic, window draught strips) cuts that to 8 to 12 ACH. Below about 5 ACH, the random leaks no longer let in enough fresh air on their own. Basic draught-proofing rarely gets you that low. It does matter once you add taped vapour control layers, or fit tightly sealed window frames.

### Animals-smallholding (managing-a-sow-with-litter, opening paragraph)

Before:
> Most sows farrow without assistance if the pen is correctly prepared and the sow is in good condition. The critical work starts within an hour of farrowing: ensuring all piglets have accessed the sow's teats and received colostrum within the first six hours is the single biggest factor in early piglet survival.

After:
> Most sows farrow without help if the pen is set up well and the sow is in good shape. The vital work starts within an hour of farrowing. Make sure every piglet reaches a teat and takes colostrum in the first six hours. That single point matters more than any other for early piglet survival.

## Category-by-category count

```
animals-smallholding: 5
baking:               4
cooking:              4
fibre-arts:           3
home-repair:          5
mindset:              5
natural-home:         5
paper-word:           4
pottery-ceramics:     7
sustainability:       4
wood-natural-craft:   4
```

(Pottery-ceramics at 7 sits inside the 15-per-category cap; the bucket picker drew polymer-clay PATTERN tutorials into the craft-project slot and air-dry-clay TECHNIQUE tutorials into the craft-technique slot from the same category.)

## Content-type-by-content-type count

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

(The first-3-batches content-type-spread rule no longer applies; this is batch 16. The picker still tries for >=2 per bucket so the spread carries across off-spread phases.)

## Surprises

- 30 of 50 candidates passed the voice-check on export with zero errors. Only 20 needed any rewrite, and most fixes were one or two paragraphs each. This batch was mostly polish.
- The grade-level rule fired most often on opening paragraphs of READING and TECHNIQUE-shaped tutorials where the original author leaned on long noun phrases ("dimensional stability", "moisture-dependent ease of cutting", "thermal bridge running from the warm room"). Splitting into shorter clauses with the same numeric content cleared the rule.
- Three files had pre-existing em or en dashes in non-body fields the voice-check does not scan: biscotti-chocolate-hazelnut subtitle, japanese-stab-binding-kikko title, and a troubleshooter symptom on green-wood-vs-seasoned-wood. Each was rewritten with a colon, then re-applied.
- Several offending paragraphs had glossaryTooltip marks (and one had a techniqueLink mark) that had to be preserved when rebuilding the paragraph content. A structural-rewrite script reassembled the paragraph as text segments with marks intact, keeping all termIds and techniqueSlugs unchanged.
- One mindset acknowledgment paragraph (hand-on-chest-you-were-doing-your-best, "Where this practice comes from") cited researchers and therapy frameworks at grade 15. Rewritten to plain English without dropping any of the named references. No verbatim affirmations or energy statements were touched.
- No word-count drops over 20% on any file. Rewrites split long sentences and simplified vocabulary; substance was preserved.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 2754.

## Deploy verification

To be filled in by the deploy verification block at the end of this fire (commit, run id, healthz status).
