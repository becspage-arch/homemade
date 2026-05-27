# Voice retrofit batch 2026-05-27-batch24

Batch 2026-05-27-batch24: 50 tutorials retrofitted. Deploy green, healthz 200.

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

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 1131
After this batch  (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 1181
Delta: +50 (matches the batch size).

Final post-fire output:

```
voice_retrofitted_published: 1181
remaining_published:         2354
total_published:             3535
```

### 3. Random spot-check

Slug: beef-stroganoff
Category: cooking
voiceRetrofittedAt: 2026-05-27T02:40:33.559Z

DB body.content[13] after retrofit (paragraph rewritten this batch from a single grade 21.4 paragraph to seven short sentences):

> Beef stroganoff started in 19th-century Russia. It takes its name from the Stroganov family, a line of Russian nobles. The dish appeared in Russian cookery books from the 1870s onward. It spread across Western Europe through the close link between French and Russian cooking at the time. French chefs shaped much of Russian noble cooking in the 1800s, and the dish reads as a hybrid of both. It reached American home cooking after the Second World War through post-war cookbooks. It became a weeknight staple, served over egg noodles rather than the original fried potato straws.

Public URL: https://homemade.education/cooking/beef-stroganoff returns HTTP 200. The public site sits behind the splash gate, so anonymous visits resolve to the coming-soon page rather than the tutorial body. The DB spot-check above is the live state the tutorial page will render once past the gate.

### 4. Full slug list (50)

1. beef-stir-fry
2. beef-stroganoff
3. beef-vindaloo
4. beef-wellington
5. beer-battered-haddock
6. carrot-cake-cream-cheese
7. carrot-cake-layered
8. cathead-biscuits-southern
9. challah-round
10. challah-six-strand
11. i-am-rewriting-my-sleep-story
12. i-am-safe-and-protected-as-wealth-grows-affirmation
13. i-am-safe-and-steady-with-money-today
14. i-am-safe-even-when-the-number-is-small
15. i-am-safe-to-be-seen-as-wealthy
16. pulp-painting-on-wet-sheets
17. quarter-bound-book
18. raised-cord-binding
19. reading-a-calligraphy-exemplar
20. recycled-paper-sheet-forming
21. riven-ash-chair-rung
22. riven-ash-hoe-handle
23. riven-cherry-mallet
24. riven-hazel-garden-rake-handle
25. riven-hazel-mallet
26. roof-light-draught-sealing
27. secondary-glazing-a-single-window-with-acrylic
28. setting-up-a-hotbed
29. shower-water-use-reduction
30. sieving-and-storing-finished-compost
31. spinning-lace-weight-on-wheel
32. spinning-on-a-top-whorl-drop-spindle
33. spring-fondant-emergency-feeding
34. square-knot-macrame
35. stacking-and-turning-a-muck-heap
36. stamping-texture-into-clay
37. supported-spindle-spinning
38. swarm-control-artificial-swarm
39. testing-sockets-and-circuits-with-a-socket-tester
40. the-uk-bee-year
41. the-weaner-to-bacon-arc
42. tiling-a-bathroom-wall
43. treating-active-woodworm
44. unblocking-a-sink-trap
45. understanding-domestic-lighting-circuits
46. wet-felted-pebble-soap-dish
47. wet-felted-small-rug
48. wet-felted-vessel-over-balloon
49. wet-felted-wall-hanging
50. woven-coaster-set-plain-weave

## Sample public URLs across categories

1. https://homemade.education/cooking/beef-stroganoff
2. https://homemade.education/baking/challah-six-strand
3. https://homemade.education/mindset/i-am-safe-even-when-the-number-is-small
4. https://homemade.education/paper-word/reading-a-calligraphy-exemplar
5. https://homemade.education/wood-natural-craft/riven-cherry-mallet
6. https://homemade.education/fibre-arts/wet-felted-wall-hanging
7. https://homemade.education/sustainability/shower-water-use-reduction
8. https://homemade.education/home-repair/understanding-domestic-lighting-circuits
9. https://homemade.education/animals-smallholding/swarm-control-artificial-swarm
10. https://homemade.education/pottery-ceramics/stamping-texture-into-clay

## Before / after excerpts (3 content types)

### Recipe (cooking) - beef-stroganoff

Before, paragraph[13] (grade 21.4):
> Beef stroganoff has its origin in nineteenth-century Russian haute cuisine and takes its name from the Stroganov family, who were prominent Russian nobles and patrons. The dish appeared in Russian cookery books from the 1870s onward and spread through Western Europe via the exchange of French and Russian culinary traditions: French cuisine had enormous influence on Russian aristocratic cooking throughout the nineteenth century, and the dish reads as a hybrid of both. It entered American home cooking in the mid-twentieth century through post-war cookbooks and became a weeknight dinner staple, recognisably European in origin but adapted entirely into the American domestic kitchen, typically served over egg noodles rather than its original accompaniment of fried potato straws.

After:
> Beef stroganoff started in 19th-century Russia. It takes its name from the Stroganov family, a line of Russian nobles. The dish appeared in Russian cookery books from the 1870s onward. It spread across Western Europe through the close link between French and Russian cooking at the time. French chefs shaped much of Russian noble cooking in the 1800s, and the dish reads as a hybrid of both. It reached American home cooking after the Second World War through post-war cookbooks. It became a weeknight staple, served over egg noodles rather than the original fried potato straws.

### Animals-smallholding - swarm-control-artificial-swarm

Before, paragraph[0] (grade 12.2):
> The artificial swarm works because flying bees return to the original hive site regardless of which box they find there. By moving the brood and nurse bees to one side and leaving an empty box on the original site with the queen, you give the flying population the impression they have swarmed without losing any bees at all.

After:
> The artificial swarm works because flying bees always return to the original hive site, whichever box they find there. So you move the brood and nurse bees to one side. Leave an empty box on the original site with the queen. The flying bees come home and behave as if they have swarmed. No bees are lost.

### Home-repair - understanding-domestic-lighting-circuits

Before, paragraph[2] (grade 13.2):
> In a loop-at-luminaire installation, the ceiling rose or back box contains three groups of connections: the permanent live and neutral arriving from the previous luminaire (or from the consumer unit at the first luminaire), the switch cable running down to the switch, and the feed continuing on to the next luminaire. The 1.0 mm twin-and-earth cable used for the switch drop contains a permanent live, a switched live (returning from the switch), and an earth. The switched live is the conductor that carries current when the switch is on.

After:
> In a loop-at-luminaire wiring, the ceiling rose or back box holds three groups of connections. The first is the permanent live and neutral arriving from the previous fitting (or from the consumer unit at the first fitting). The second is the switch cable running down to the switch. The third is the feed continuing on to the next fitting. The 1.0 mm twin-and-earth cable used for the switch drop has a permanent live, a switched live, and an earth. The switched live returns from the switch. It carries current when the switch is on.

## Category-by-category count

| Category | Count |
|---|---|
| animals-smallholding | 5 |
| baking | 5 |
| cooking | 5 |
| fibre-arts | 9 |
| home-repair | 5 |
| mindset | 5 |
| paper-word | 5 |
| pottery-ceramics | 1 |
| sustainability | 5 |
| wood-natural-craft | 5 |

Max-per-category cap of 15 was not approached; fibre-arts ran highest at 9 because the active alphabetic range still has a thick band of spinning-* and wet-felted-* slugs.

## Content-type-by-content-type count

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

Clean even spread, 5 per bucket. The first-3-batches min-2-per-bucket rule no longer applies past batch 3; the picker round-robin still produced an even shape.

## What surprised me

The precheck flagged 14 of 50 files (28%) for voice-check errors before any work, down from 20 of 50 (40%) in batch23. The drop is mainly because the batch24 candidate pool included nine fibre-arts wet-felted / spinning slugs and five mindset affirmations, which both author-prompt-clean. Every flag this batch was grade-level; zero historical-figure, institutional-name, em-dash, or safety-block flags.

The hardest hitter was beef-stroganoff paragraph[13] at grade 21.4, a single 161-word history paragraph stacking three nested clauses each ending in "and". The substance was historically interesting and worth keeping; the rewrite split it into seven short sentences using "It takes its name ... The dish appeared ... It spread ... French chefs shaped ... It reached ... It became ..." which kept every detail (Stroganov family, 1870s cookery books, French-Russian noble cooking link, post-war American adoption, egg noodles vs potato straws) and brought the grade well into range.

A second pattern recurred in three home-repair pieces (testing-sockets paragraph[5], understanding-domestic-lighting-circuits paragraph[2] and paragraph[10]): regulatory / technical content compressed into a single long sentence with a colon-separated three-item list. The fix was always the same: spread the list across three short sentences with "The first is ... The second is ... The third is ..." or split with full stops at the semicolons. No substance lost.

The roof-light-draught-sealing bullet was a 16-word single line at grade 14.9 - short content but every word multisyllable ("flexible", "paintable", "plasterboard", "acrylic"). Replacing "frame-to-plasterboard reveal gap" with "gap between the frame and the wall reveal" dropped the syllable density and cleared the rule. Worth noting because future batches with bullet-list-heavy reference content may keep tripping this same pattern; one rule of thumb for the rewriter is "if a bullet has four 3-syllable+ words in a row, split the noun chain".

The wc-batch24 script flagged beef-wellington at -33.9% but this is a measurement artifact, not a real drop. beef-wellington passed precheck clean (no voice-retrofit edits made this batch), but its `revisedFrom` snapshot was pre-populated by an earlier pipeline (likely image-relevance, which writes to the same field), and that snapshot pre-dates a separate trim of the body. The wc-script compares the new body to whatever lives in `revisedFrom`, not to the body at this batch's export time. For the 14 files actually rewritten this batch, the largest real drop was beef-stroganoff at -4.4% (sentence-splitting on the history paragraph, no content removed). No real drops > 20%.

No citation moves to sourceNotes this batch. The candidate pool sat outside the herbal-medicine / academic-citation-prone categories, so the historical-figure / institutional-name rules did not fire on any of the 50. One mindset-affirmation source paragraph (i-am-safe-even-when-the-number-is-small paragraph[12]) referenced Louise Hay and Rebecca J Page year-of-publication marks; both were preserved in body prose since neither name is on the historical-figures auto-flag list and neither year sat in the bare `(YYYY)` pattern the year-in-body rule catches.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 2354.
