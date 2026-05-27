Batch 2026-05-27-batch25: 50 tutorials retrofitted. Deploy green, healthz 200.

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

- Before this fire: 2740 PUBLISHED tutorials with voiceRetrofittedAt set
- After this fire:  2790 PUBLISHED tutorials with voiceRetrofittedAt set
- Delta:            50 (matches batch size)
- Total PUBLISHED:  3535

## Spot-check (one random slug from batch)

- slug: cheese-straws
- voiceRetrofittedAt: 2026-05-27T03:41:59.194Z
- url: https://homemade.education/baking/cheese-straws (site is currently behind splash gate so anonymous traffic lands on /coming-soon; DB content confirmed via direct query)
- new first paragraph (from DB):

> Cheese straws are the most forgiving pastry on this list. The shortcrust dough comes together quickly: flour rubbed with cold butter, enriched with grated cheddar and sharpened with cayenne and English mustard powder. It chills briefly, rolls thin, cuts into strips, and bakes in 12 minutes. They should be eaten warm, within an hour of baking.

## Sample public URLs across categories

- https://homemade.education/cooking/beetroot-feta-walnut-salad
- https://homemade.education/baking/cheese-straws
- https://homemade.education/mindset/i-am-the-woman-who-has-it
- https://homemade.education/fibre-arts/tablet-weaving-a-basic-band
- https://homemade.education/wood-natural-craft/riven-oak-shingles
- https://homemade.education/paper-word/risograph-zine-layout-basics
- https://homemade.education/home-repair/understanding-the-consumer-unit
- https://homemade.education/sustainability/sizing-a-12v-off-grid-solar-system
- https://homemade.education/animals-smallholding/treating-red-mite-in-a-chicken-coop
- https://homemade.education/pottery-ceramics/testing-clay-dryness-by-colour-and-touch

## Before / after excerpts (3 content types)

### Cooking: beetroot-feta-walnut-salad (paragraph[14])

Old:
> Beetroot salad in Britain is old: pickled beetroot was a common accompaniment to cold meats long before the gastropub era. The restaurant version of warm roasted beetroot with soft cheese and toasted nuts appeared on British menus in the 1990s and became one of the most widely copied restaurant-to-home dishes of that decade.

New:
> Beetroot salad is an old British dish. Pickled beetroot has been served with cold meats for a long time. The restaurant version with warm roasted beetroot, soft cheese, and toasted nuts spread through pub menus in the 1990s. Home cooks soon copied it.

### Paper-word: risograph-zine-layout-basics (paragraph[0])

Old:
> Risograph printing occupies a specific niche in small-press production: it is cheaper per copy than laser printing for runs of 50 and above, it produces a tactile, slightly rough ink surface unlike toner printing, and it imposes constraints on colour that force particular design decisions.

New:
> Risograph is a small-press printing method. It costs less per copy than laser printing for runs of 50 and up. The ink sits on the paper with a slightly rough feel, not the flat finish of toner. It also limits your colours in ways that shape the design.

### Home-repair: understanding-the-consumer-unit (paragraph[0])

Old:
> The consumer unit distributes electricity from the meter to the circuits of the house. It contains the devices that protect both people and cables from faults. Understanding what is inside the consumer unit is the prerequisite for any domestic electrical work, including the simple faceplate replacements covered elsewhere.

New:
> The consumer unit splits the electricity coming in from the meter and sends it out to the circuits of the house. It also holds the devices that protect people and cables from faults. Knowing what is inside the consumer unit is the first step for any domestic electrical work, including the simple faceplate swaps covered elsewhere.

## Category-by-category count

- animals-smallholding: 6
- baking: 5
- cooking: 5
- fibre-arts: 5
- home-repair: 6
- mindset: 6
- paper-word: 6
- pottery-ceramics: 1
- sustainability: 5
- wood-natural-craft: 5

(Content-type spread not required for batch 4+. This is batch 25.)

## Notes

- Of the 50 picks, 31 were already voice-check clean on export. The 19 dirty files all failed on single or small numbers of grade-level paragraphs above the 12.0 threshold; targeted paragraph rewrites brought every file to clean.
- Several paragraphs were split across multiple text nodes because of glossaryTooltip marks. Each rewrite preserved the tooltipped term verbatim and edited only the surrounding plain text. termIds untouched.
- One safety-block fire on the smart-thermostat-installation infoPanel surfaced on the second scan: my first rewrite of the heat-pump warning came in at 32 words, over the 25-word safety-block cap. Shortened to 21 words on a second pass.
- One year-in-body trigger on i-am-the-woman-who-has-it-now: the verbatim source attribution included "(Rebecca J Page, 2025)". Removed the year (kept "by Rebecca J Page"). Source-book attribution is not energy-statement text per the verbatim rule, so the rewrite was in scope.
- One pre-existing em dash in the title field of i-am-the-woman-who-has-it.json ("Not someday  now"). Not introduced by this batch; the apply script does not write the title back to DB.
- No file showed a word-count drop over 20%. The pickled-beetroot intro and the riven-oak-shingles instruction paragraph dropped roughly 15 percent on word count, both from sentence-shortening rather than substance removal.
- Site is currently behind the splash gate, so the public URLs above currently render the /coming-soon page to anonymous traffic. DB content verified directly.

## Full slug list (50)

beetroot-feta-walnut-salad, belgium-waffles, berry-smoothie, bessara-egyptian, best-ever-banana-cake, chaussons-aux-pommes, cheddar-chive-american-biscuits, cheese-scones, cheese-scones-cheddar, cheese-straws, i-am-safe-with-a-full-account, i-am-the-turning-point-in-my-familys-money-story, i-am-the-woman-who-has-it, i-am-the-woman-who-has-it-now, i-am-where-i-am-theres-no-behind, i-am-wise-with-what-comes-through-me, risograph-zine-layout-basics, riven-oak-chair-leg, riven-oak-shingles, riving-with-a-froe, roman-capitals-inscriptional, round-willow-basket-small, ruling-guide-lines-for-calligraphy, rush-bread-basket-coiled, rustica-roman-capitals, saddle-stapled-zine, scherenschnitte-folded-silhouette, sizing-a-12v-off-grid-solar-system, sizing-a-solar-pv-array-for-a-uk-roof, slow-water-leak-detection, smart-thermostat-installation, solar-battery-storage-sizing, tablet-weaving-a-basic-band, tannin-pre-mordant-plant-fibres, tapestry-butterfly-bobbin, testing-clay-dryness-by-colour-and-touch, the-long-draw-on-a-spinning-wheel, the-short-forward-draw, transferring-bees-from-nuc-to-full-hive, treating-bumblefoot-in-chickens, treating-minor-pig-injuries, treating-red-mite-in-a-chicken-coop, treating-scaly-leg-mite, understanding-rcd-and-mcb-trip-types, understanding-the-6-day-movement-standstill, understanding-the-consumer-unit, using-a-heat-gun-to-strip-furniture-paint, using-ptfe-tape-and-jointing-compound, waxing-and-buffing-bare-wood, webbing-a-drop-in-chair-seat

## Forward read

745 PUBLISHED tutorials with voiceRetrofittedAt IS NULL remain after this fire.
