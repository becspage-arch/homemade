# Voice retrofit batch 2026-05-27-batch23

Batch 2026-05-27-batch23: 50 tutorials retrofitted. Deploy green, healthz 200.

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

(Hyphens substituted for em-dashes / en-dashes in the script output so this file stays em-dash and en-dash clean.)

### 2. Voice retrofit count: before and after

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 1081
After this batch  (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 1131
Delta: +50 (matches the batch size).

Final post-fire output:

```
voice_retrofitted_published: 1131
remaining_published:         2404
total_published:             3535
```

### 3. Random spot-check

Slug: rocket-stove-principles
Category: sustainability
voiceRetrofittedAt: 2026-05-27T01:41:10.962Z

DB first-paragraph text after retrofit (paragraph[0], rewritten this batch from a single 6-clause sentence at grade 25.0 to four short sentences):

> A rocket stove's efficiency comes from three design ideas working together. First, the L-shape creates a strong natural draft. Second, insulation at the burn zone keeps the temperature high without constant stoking. Third, the top-feeding fuel design means only the tip of each piece of wood burns at any time. That cuts the surface area in contact with the fire.

Public URL: https://homemade.education/sustainability/rocket-stove-principles returns HTTP 200. The public site sits behind the splash gate, so anonymous visits resolve to the coming-soon page rather than the tutorial body. The DB spot-check above is the live state the tutorial page will render once past the gate.

### 4. Full slug list (50)

1. beef-chili
2. beef-enchiladas
3. beef-goulash
4. beef-madras
5. beef-stew-with-herb-dumplings
6. caramel-layer-cake
7. cardamom-buns
8. cardamom-buns-swedish
9. carrot-cake
10. carrot-cake-classic
11. i-am-fully-capable-of-holding-great-wealth-affirmation
12. i-am-her-she-is-me-we-are-the-same-woman
13. i-am-not-my-mothers-bank-balance
14. i-am-older-i-am-wiser-both-are-gifts
15. i-am-ready-to-hold-property-and-land
16. photo-corner-mounting
17. pockets-and-flaps-in-journals
18. polish-wycinanki-layered-cut
19. preparing-a-dip-nib
20. pressing-and-drying-handmade-sheets
21. pyrography-starter-kit
22. pyrography-sycamore-name-plaque
23. randing-willow-basketry
24. reducing-food-waste-at-home
25. reducing-packaging-waste
26. repair-rather-than-replace-decision-guide
27. right-to-repair-electronics
28. riven-ash-axe-handle
29. riven-ash-bowl-blank
30. rocket-stove-principles
31. sanding-wooden-floors-by-machine
32. setting-up-a-rainwater-harvesting-system-for-stock
33. smallholding-livestock-calendar
34. soumak-stitch-tapestry
35. sourcing-first-livestock-what-to-check-before-you-buy
36. spinning-a-dk-yarn-on-the-wheel
37. spinning-art-yarn-thick-thin
38. spinning-cotton-on-supported-spindle
39. spinning-flax-linen-top
40. spreading-manure-and-timing-the-spread
41. spring-colony-assessment
42. stripping-a-drop-in-chair-seat-to-the-frame
43. stripping-a-painted-pine-table
44. stripping-and-oiling-a-garden-chair
45. stripping-wallpaper-steam-and-scorer
46. wet-felted-dryer-balls
47. wet-felted-hat-on-a-hat-block
48. wet-felted-hot-water-bottle-cover
49. wet-felted-merino-bowl
50. wet-felted-pebble-set

## Sample public URLs across categories

1. https://homemade.education/cooking/beef-madras
2. https://homemade.education/baking/caramel-layer-cake
3. https://homemade.education/mindset/i-am-ready-to-hold-property-and-land
4. https://homemade.education/paper-word/preparing-a-dip-nib
5. https://homemade.education/wood-natural-craft/pyrography-sycamore-name-plaque
6. https://homemade.education/fibre-arts/wet-felted-pebble-set
7. https://homemade.education/sustainability/rocket-stove-principles
8. https://homemade.education/home-repair/sanding-wooden-floors-by-machine
9. https://homemade.education/animals-smallholding/spring-colony-assessment
10. https://homemade.education/sustainability/repair-rather-than-replace-decision-guide

## Before / after excerpts (3 content types)

### Recipe (cooking) - beef-chili

Before, paragraph[11] (grade 18.3):
> Chilli has its origins in the Tex-Mex cooking tradition of the Texas-Mexico border, where the preparation of dried chillies with beef was documented in San Antonio as early as the 1840s. The 'chilli queens' of San Antonio's Military Plaza were famous for their outdoor stalls serving chilli con carne by the 1880s, and the dish spread nationally through the late nineteenth and early twentieth centuries, becoming one of the most widely cooked dishes in the American home kitchen. It is one of those preparations where intense regional identity (Texas purists exclude beans; Kansas City includes them) coexists with broad national adoption, and every household has its version.

After:
> Chilli began on the Texas to Mexico border, in the Tex-Mex kitchen tradition. Dried chillies cooked with beef were already known in San Antonio in the 1840s. By the 1880s the 'chilli queens' of San Antonio's Military Plaza sold bowls from their outdoor stalls. The dish spread across the country in the late 1800s and early 1900s. It became one of the most cooked dishes in the American home kitchen. Regional pride still runs strong. Texas purists leave the beans out. Kansas City keeps them in. Every household has its own version.

### Sustainability - rocket-stove-principles

Before, paragraph[0] (grade 25.0):
> A rocket stove's efficiency comes from three design principles working together: the L-shape creates a strong natural draft; insulation at the combustion zone maintains high temperature without constant stoking; and the top-feeding fuel design means only the tip of each piece of wood burns at any time, reducing the surface area in contact with the fire.

After:
> A rocket stove's efficiency comes from three design ideas working together. First, the L-shape creates a strong natural draft. Second, insulation at the burn zone keeps the temperature high without constant stoking. Third, the top-feeding fuel design means only the tip of each piece of wood burns at any time. That cuts the surface area in contact with the fire.

### Sustainability (decision guide) - repair-rather-than-replace-decision-guide

Before, paragraph[6] (grade 17.5):
> EU Directive 2024/1799 gives EU consumers the right to request repair from manufacturers for common household goods (washing machines, dishwashers, televisions, bicycles, clothing, and smartphones) at reasonable cost and with a parts obligation for a set number of years after manufacture. The UK government is consulting on equivalent domestic legislation, check gov.uk for the current status.

After:
> EU Directive 2024/1799 gives EU consumers a right to request repair from manufacturers for common goods. The list covers washing machines, dishwashers, televisions, bicycles, clothing, and smartphones. Repairs must be at a reasonable cost. Parts must be available for a set number of years after manufacture. The UK government is consulting on its own version. Check gov.uk for the current status.

## Category-by-category count

| Category | Count |
|---|---|
| animals-smallholding | 5 |
| baking | 5 |
| cooking | 5 |
| fibre-arts | 10 |
| home-repair | 5 |
| mindset | 5 |
| paper-word | 5 |
| sustainability | 5 |
| wood-natural-craft | 5 |

Max-per-category cap of 15 was not approached; fibre-arts ran highest at 10 because the alphabetically-ordered candidate pool had two large fibre-arts slug clusters in the active range (spinning-* x4 and wet-felted-* x5, plus soumak-stitch-tapestry).

## Content-type-by-content-type count

| Bucket | Count |
|---|---|
| recipe-cooking | 5 |
| recipe-baking | 5 |
| mindset | 5 |
| craft-project (PATTERN) | 5 |
| craft-technique (TECHNIQUE in craft cats) | 5 |
| other-paper-word | 5 |
| other-wood-natural-craft | 5 |
| sustainability | 5 |
| home-repair | 5 |
| animals-smallholding | 5 |

Even spread, all 10 buckets at 5. (First-3-batches min-2-per-bucket rule no longer applies past batch 3, but the picker still rotates by bucket, which produced the clean 5-per-bucket shape this batch.)

## What surprised me

The precheck flagged 20 of 50 files (40%) for voice-check errors before any work, up from 17 of 50 (34%) in batch22 and 13 of 50 (26%) in batch21. The mix continued the batch22 trend toward grade-level violations in reference / decision-guide content rather than the heading-removal / safety-block cases of earlier batches. All 20 hits this batch were grade-level paragraphs, zero infoPanel-tone or safety-block flags. That makes the rewrite simpler: every fix is a sentence-shortening pass.

The hardest hitter was rocket-stove-principles paragraph[0] at grade 25.0 - a single 60-word sentence with three semicolon-separated design principles. The substance was tight and worth keeping; the rewrite split it into four short numbered sentences using "First, ... Second, ... Third, ..." which kept every detail and brought the grade well into range.

Two sustainability long-form pieces (repair-rather-than-replace-decision-guide at 6 errors and right-to-repair-electronics at 4 errors) accounted for half the total error count between them. Both are bullet-list-heavy reference content where each list item is a single long noun-phrase-plus-colon-plus-explanation construction. Splitting each into two or three short sentences fixed every flag without losing the content. The pattern is recognisable: any "Term: long explanation containing nested clauses." construction trips the rule, even when the vocabulary is plain. Sentence length is the load-bearing constraint, same finding as batch22's paste-paper-comb-patterns paragraph[8].

The 50% chunk of fibre-arts in this batch (10 of 50 picks) was a quirk of the alphabetic candidate pool: every remaining unretrofitted slug starting with "s" or "w" in the active range was either spinning-* or wet-felted-*. None tripped voice-check (the fibre-arts authoring prompt's plain-instruction register has been holding cleanly). Worth noting because future fibre-arts batches will likely keep this clean rate; the FYM and rocket-stove style cases come from sustainability / animals / home-repair categories.

One small recurring shape: every "embodied carbon" passage in the sustainability decision guides tripped grade-level on a single sentence stacking a unit-equivalence claim. The fix was always the same - break the equivalence onto its own short sentence and convert the implicit semicolon into a full stop. The author prompt could pre-empt this with a "carbon equivalences are their own sentence" line, but only if that's worth one line of prompt budget; the rewrites are fast.

No word-count drops above 20% on any file (checked via _voice-retrofit-wc-batch23.ts against the revisedFrom snapshot). The largest drop was 3.1% (beef-madras paragraph[11] tightened from one 47-word sentence to four shorter ones). Several files gained words (rocket-stove-principles +1.0%, setting-up-a-rainwater-harvesting +4.3%, repair-decision-guide +5.9%) because the rewrites added connective tissue ("First, ... Second, ...") and split nested clauses into full sentences. No substance was removed.

No citation moves to sourceNotes this batch. The candidate pool sat outside the herbal-medicine / academic-citation-prone categories, so the historical-figure / institutional-name rules did not fire on any of the 50.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 2404.
