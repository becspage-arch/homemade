# Voice retrofit batch 2026-05-27-batch21

Batch 2026-05-27-batch21: 50 tutorials retrofitted. Deploy green, healthz 200.

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

(Hyphens substituted for en dashes in the script output so this file stays em-dash / en-dash clean.)

### 2. Voice retrofit count: before and after

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 981
After this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL):  1031
Delta: +50 (matches the batch size).

Final post-fire output:

```
voice_retrofitted_published: 1031
remaining_published:         2504
total_published:             3535
```

### 3. Random spot-check

Slug: paper-inclusions-flowers-and-leaves
Category: paper-word
voiceRetrofittedAt: 2026-05-26T23:43:12.457Z

DB first-paragraph text after retrofit:

> Inclusions work because the wet pulp fibres bond around the plant as the sheet presses and dries. The plant gets locked in place. Thin, flat things embed best: dried flower petals, leaves pressed flat, fronds of grass or fern. Thick things (dried berries, seed pods, woody stem) press unevenly and can pop back out of a thin sheet. The other big choice is the pulp itself. A light pulp lets the plants read as clear shapes with crisp edges. A heavier pulp buries them, so you only see them when you hold the sheet up to the light.

Public URL: https://homemade.education/paper-word/paper-inclusions-flowers-and-leaves returns HTTP 200. The public site sits behind the splash gate, so anonymous visits resolve to the coming-soon page rather than the tutorial body. The DB spot-check above is the live state the tutorial page will render once past the gate.

### 4. Full slug list (50)

1. barszcz-bialy
2. barszcz-czerwony
3. bastilla-chicken
4. bbq-baby-back-ribs
5. bbq-pork-ribs
6. butterfly-cakes
7. buttermilk-pie-southern
8. buttermilk-scones-american
9. buttermilk-scones-plain
10. cakey-brownies
11. i-am-allowed-to-want-this
12. i-am-already-wealthy-right-now
13. i-am-an-investor
14. i-am-an-investor-in-training-i-am-an-investor
15. i-am-building-a-fortune-that-lasts
16. nonpareil-combing-pattern
17. off-grid-water-treatment-basics
18. oil-on-water-marbling
19. origami-samurai-hat
20. pamphlet-stitch-notebook
21. paper-inclusions-flowers-and-leaves
22. pipe-lagging-hot-water-cylinder-and-pipes
23. plastic-free-bathroom-swaps
24. pyrography-design-transfer
25. pyrography-dog-portrait
26. pyrography-first-burn-birch
27. pyrography-geometric-pattern
28. pyrography-lettering-technique
29. rainwater-harvesting-underground-tank
30. rainwater-only-supply-feasibility
31. reading-clay-drying-stages
32. reading-wraps-per-inch
33. reclaiming-air-dry-clay
34. replacing-a-tap-washer
35. replacing-a-toilet-flush-valve
36. resist-felting-a-slipper-form
37. reupholstering-a-dining-chair-with-padded-back
38. reupholstering-a-drop-in-dining-chair-seat
39. reupholstering-a-full-seat-drop-in
40. rolling-a-clay-slab
41. safe-handling-and-moving-livestock
42. salting-and-curing-pork-from-a-home-pig
43. setting-up-a-chicken-coop-for-first-time-keepers
44. setting-up-a-dust-bath-for-chickens
45. setting-up-a-meat-rabbit-colony
46. tapestry-weave-diamond-pattern
47. thrown-bowl-smooth-stoneware
48. thrown-mug-smooth-stoneware
49. wet-felted-brooch
50. wet-felted-clutch-bag

## Sample public URLs across categories

1. https://homemade.education/cooking/bbq-pork-ribs
2. https://homemade.education/baking/butterfly-cakes
3. https://homemade.education/mindset/i-am-allowed-to-want-this
4. https://homemade.education/paper-word/paper-inclusions-flowers-and-leaves
5. https://homemade.education/sustainability/plastic-free-bathroom-swaps
6. https://homemade.education/home-repair/replacing-a-tap-washer
7. https://homemade.education/animals-smallholding/setting-up-a-chicken-coop-for-first-time-keepers
8. https://homemade.education/pottery-ceramics/thrown-bowl-smooth-stoneware
9. https://homemade.education/fibre-arts/wet-felted-brooch
10. https://homemade.education/wood-natural-craft/pyrography-first-burn-birch

## Before / after excerpts (3 content types)

### Recipe (cooking) - bbq-pork-ribs

Before, paragraph[13] (grade 15.6):
> Pork rib barbecue is one of the most regionally contested dishes in American cooking, Memphis, Kansas City, the Carolinas, and Texas all have distinct and deeply defended rib traditions, differing on dry versus wet, the sauce composition, and the wood used for smoking. What they share is the long, low cook that transforms cheap, tough ribs into something tender and complex. The oven version cannot replicate smoke, but it can replicate the time and temperature, and the sticky, spiced, caramelised result bears a family resemblance to the real thing that is close enough for most purposes.

After:
> Pork rib barbecue is one of the most argued-over dishes in American cooking. Memphis, Kansas City, the Carolinas, and Texas all have their own rib traditions. They disagree on dry versus wet, the right sauce, and the best wood for smoking. What they share is the long, low cook that turns cheap, tough ribs into something tender. An oven cannot give you smoke. It can give you the time and the temperature, and the sticky, spiced, caramelised result is close enough to the real thing for most purposes.

### Sustainability - off-grid-water-treatment-basics

Before, paragraph[0] (grade 17.1):
> Collected or stored water from non-mains sources is considered a private water supply under UK law. Premises relying on a private water supply (borehole, spring, well, or collected rainwater) are subject to the Private Water Supply Regulations 2016, which require the supply to be risk-assessed and, where used for drinking or food preparation, to meet the quality standards of the Water Supply (Water Quality) Regulations.

After:
> Water from any non-mains source counts as a private water supply under UK law. If your home runs on a borehole, spring, well, or collected rainwater, the Private Water Supply Regulations apply. The supply has to be risk-assessed. If it is used for drinking or cooking, it has to meet the same quality standards as mains water.

### Animals-smallholding - setting-up-a-chicken-coop-for-first-time-keepers

Before, infoPanel[9] body (institutional name "DEFRA" in body prose):
> DEFRA's small-flock guidance is one square metre of coop floor space per three birds, plus four square metres of secure run per bird. For three hens that is roughly a 1 x 1 m coop and a 3 x 4 m run; for six hens, a 2 x 1 m coop and a 4 x 6 m run. Under-spacing is the single biggest predictor of feather-pecking and bullying. Over-spacing causes no problems.

After:
> The standard UK small-flock guidance is one square metre of coop floor per three birds, plus four square metres of secure run per bird. For three hens that is roughly a 1 x 1 m coop and a 3 x 4 m run; for six hens, a 2 x 1 m coop and a 4 x 6 m run. Under-spacing is the single biggest cause of feather-pecking and bullying. Over-spacing causes no problems.

(The DEFRA citation was already listed in the tutorial's sourceNotes block, so removing the inline reference does not lose the attribution; it just moves it to the Sources block where institutional names belong.)

## Category-by-category count

| Category | Count |
|---|---|
| animals-smallholding | 5 |
| baking | 5 |
| cooking | 5 |
| fibre-arts | 5 |
| home-repair | 5 |
| mindset | 5 |
| paper-word | 5 |
| pottery-ceramics | 5 |
| sustainability | 5 |
| wood-natural-craft | 5 |

## Content-type-by-content-type count (first 3 batches rule no longer applies; included for tracking)

| Bucket | Count |
|---|---|
| animals-smallholding | 5 |
| craft-project | 5 |
| craft-technique | 5 |
| home-repair | 5 |
| mindset | 5 |
| other-paper-word | 5 |
| other-wood-natural-craft | 5 |
| recipe-baking | 5 |
| recipe-cooking | 5 |
| sustainability | 5 |

(Even split across all 10 content-type buckets, same as batch20.)

## What surprised me

The precheck flagged 13 of 50 files (26%) with voice-check errors before any work: 12 with grade-level violations only, plus one with a mix (setting-up-a-chicken-coop-for-first-time-keepers carried DEFRA in an infoPanel body, the banned filler "at the end of the day", and three grade-level paragraphs), plus reupholstering-a-drop-in-dining-chair-seat carrying "honest" as a softener ("the work is honest"). Both of the latter were valuable catches; the bulk of the rest were academic register that the new threshold blocks. bbq-baby-back-ribs failed only on a "Before you start" H2 heading; removing that heading and letting the existing first paragraph stand as the orientation paragraph cleared the rule without losing any content.

A small recurring pattern: bullet items in "ideas / variations" lists ("Use a spoon blank as the panel: ..."), and bullets in technical reference lists (sustainability metric definitions, off-grid filtration stage descriptions), pushed individual list items above grade 12 even when the surrounding tutorial was in voice. The simplest fix is to split a single sentence into two; the rule is structural, not vocabulary-only.

No word-count drops above 20% on any file. Every rewrite was a targeted sentence-shape change; substance, scaling tokens, ingredient slugs, glossary tooltip termIds, recipe metadata, troubleshooter contents, and infoPanel structure were preserved.

The institutional-in-body finding on setting-up-a-chicken-coop-for-first-time-keepers (DEFRA in the infoPanel body) was already cited in sourceNotes; the rewrite simply removed the inline mention. No new sourceNotes entries were needed for this batch.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 2504.
