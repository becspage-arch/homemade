# Voice retrofit batch 2026-05-26-batch20

Batch 2026-05-26-batch20: 50 tutorials retrofitted. Deploy pending verification at hand-off time; healthz pending.

(Apply landed in DB cleanly: 50 ok, 0 failed. Commit + push + deploy + healthz block follows below in the verification trail once this file is written and committed.)

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

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 931
After this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL):  981
Delta: +50 (matches the batch size).

Source: `pnpm --filter "@homemade/db" exec tsx scripts/_count-voice-retrofitted.ts`.

Final post-fire output:

```
voice_retrofitted_published: 981
remaining_published:         2554
total_published:             3535
```

### 3. Random spot-check

Slug: pyrography-celtic-border-panel
Category: wood-natural-craft
voiceRetrofittedAt: 2026-05-26T22:42:06.424Z

DB first-paragraph text after retrofit:

> A Celtic knotwork border in pyrography works through one simple rule. At every crossing, the shading on the upper ribbon is lighter than the shading on the ribbon below. That single tonal rule is what creates the over-under feel. The pattern itself sits on a regular diagonal grid. Once you can draw the grid, you can draw and burn any knotwork pattern. Sycamore is the best wood for this project. Its pale, even grain gives the most contrast with the burned lines, and its fine texture gives clean edges on the writing-tip outlines.

Public URL: https://homemade.education/wood-natural-craft/pyrography-celtic-border-panel returns HTTP 200. The public site sits behind the splash gate, so anonymous visits resolve to the coming-soon page rather than the tutorial body. The DB spot-check above is the live state the tutorial page will render once past the gate.

### 4. Full slug list (50)

1. banana-bread-overnight-oats
2. banana-crisps
3. banana-oatmeal-smoothie
4. bangers-and-mash
5. banoffee-pie
6. brownies-cakey
7. brownies-cream-cheese-swirl
8. brownies-fudgy
9. brownies-gluten-free
10. burnt-basque-cheesecake
11. i-am-allowed-in-the-room-where-the-investments-are-decided
12. i-am-allowed-to-do-nothing-here
13. i-am-allowed-to-forgive-myself
14. i-am-allowed-to-receive-what-i-did-not-earn
15. i-am-allowed-to-stop-even-if-not-everything-is-done
16. making-iron-gall-ink
17. making-leaf-mould-from-autumn-leaves
18. managing-compost-through-winter
19. measuring-household-carbon-footprint
20. mini-accordion-photo-album
21. mini-swale-for-small-gardens
22. moire-double-combed-marbling
23. monthly-planner-spread
24. nib-angle-and-pen-hold
25. off-grid-electrical-basics
26. plain-weave-on-a-cardboard-loom
27. plying-a-two-ply-yarn-on-a-spindle
28. pole-lathe-drive-centre-use
29. pull-cut-technique
30. pulling-a-cylinder-wall
31. punch-needle-rug-tufting
32. push-cut-technique
33. pyrography-celtic-border-panel
34. pyrography-colour-technique
35. rabbit-dental-health-check
36. rabbit-ear-mite-treatment
37. rabbit-nutrition-and-feeding
38. rag-rug-braiding
39. raising-chicks-to-point-of-lay
40. reading-the-brood-frame
41. replacing-a-couch-cushion-with-new-foam
42. replacing-a-light-switch
43. replacing-a-mains-plug-and-flex
44. replacing-a-shower-cartridge
45. replacing-a-single-socket-faceplate
46. slab-picture-frame-clay
47. slab-tray-with-folded-rim
48. slab-vase-air-dry-clay
49. slip-decorated-coaster-set
50. tall-coil-cylinder-vase

## Sample public URLs across categories

1. https://homemade.education/cooking/bangers-and-mash
2. https://homemade.education/baking/burnt-basque-cheesecake
3. https://homemade.education/mindset/i-am-allowed-to-forgive-myself
4. https://homemade.education/paper-word/making-iron-gall-ink
5. https://homemade.education/sustainability/measuring-household-carbon-footprint
6. https://homemade.education/home-repair/replacing-a-light-switch
7. https://homemade.education/animals-smallholding/reading-the-brood-frame
8. https://homemade.education/pottery-ceramics/slab-picture-frame-clay
9. https://homemade.education/fibre-arts/plain-weave-on-a-cardboard-loom
10. https://homemade.education/wood-natural-craft/pyrography-celtic-border-panel

## Before / after excerpts (3 content types)

### Recipe (cooking) - bangers-and-mash

Before, paragraph[10] (grade 12.5):
> Bangers and mash is the standard British pub supper and one of the fastest weeknight meals in the domestic repertoire. The quality of the sausage determines the quality of the dish, a good butcher's sausage with a high meat content is a different product from a supermarket budget sausage.

After:
> Bangers and mash is a classic British pub supper, and one of the fastest weeknight meals you can put on the table. The sausage decides the dish. A good butcher's sausage with a high meat content is a different product from a cheap supermarket pack.

### Home repair - replacing-a-light-switch

Before, paragraph[0] (grade 17.2):
> Replacing a switch faceplate follows exactly the same safe-isolation sequence as replacing a socket faceplate: isolate the circuit, lock off, prove dead with live-dead-live, photograph the connections, transfer, refit, restore, and test. The only additional complexity is at a two-way switch, which has three terminals and a three-core-and-earth cable rather than a simple twin-and-earth.

After:
> Swapping a switch faceplate follows the same safe-isolation steps as swapping a socket faceplate. Isolate the circuit, lock it off, prove it dead with a live-dead-live test, photograph the connections, transfer them, refit, restore the supply, and test the switch. The extra step is at a two-way switch. A two-way switch has three terminals and a three-core-and-earth cable, not a simple twin-and-earth.

### Sustainability - measuring-household-carbon-footprint

Before, paragraph[0] (grade 12.7):
> The home energy contribution to a household's operational carbon is calculable from annual energy bills. Annual gas consumption (in kWh) multiplied by 0.182 kgCO2e/kWh (DESNZ 2024 natural gas factor) gives the gas contribution in kg CO2e. Annual electricity consumption multiplied by 0.207 kgCO2e/kWh (DESNZ 2024 UK grid average) gives the electricity contribution.

After:
> Home energy is the part of a household carbon footprint you can read straight off your bills. Take your annual gas use in kWh and multiply by 0.182 to get gas kg CO2e. Take your annual electricity use in kWh and multiply by 0.207 to get electricity kg CO2e. Both factors are the 2024 UK figures. Add the two for total home-energy carbon.

(DESNZ moved to sourceNotes for this tutorial as part of the rewrite; the body now references the 2024 UK figures without the institutional name, and the Sources block names DESNZ as the publisher.)

## Category-by-category count

| Category | Count |
|---|---|
| animals-smallholding | 5 |
| baking | 5 |
| cooking | 5 |
| fibre-arts | 4 |
| home-repair | 5 |
| mindset | 5 |
| paper-word | 5 |
| pottery-ceramics | 6 |
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

(Even split across all 10 content-type buckets.)

## What surprised me

Almost every picked tutorial was already in spec. The voice-check found only 17 files (out of 50) with errors, and every flagged error was the grade-level rule, never the older banned-phrase / em-dash / citation rules. That signals the autopilot author prompt has the new register baked in for newer batches; the retrofit job here is now finishing off paragraphs whose syllable density or sentence length pushes them above grade 12.

A second small surprise: three files carried em / en dashes in fields the voice-check does not scan (subtitle on plain-weave-on-a-cardboard-loom, troubleshooter cue / cause / fix on reading-the-brood-frame, recipe.yieldDescription on burnt-basque-cheesecake). The voice-check only checks paragraph-level em-dashes in body chunks; the subtitle and the troubleshooter attribute fields slipped through. I fixed all three in the JSON files before applying. The voice-check could usefully extend to those fields in a later pass, but that is out of scope for this fire.

No word-count drops above 20% on any file.

Body-content rewrite scope, per the don't-over-prune rule: every rewrite changed offending sentence shape and vocabulary only; substance, references, troubleshooter contents, ingredients, and recipe metadata were preserved. The single exception is measuring-household-carbon-footprint, where DESNZ (the publisher of the 2024 carbon factors) moved from inline body to sourceNotes; this is the spec's documented pattern for institutional names.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 2554.
