Batch 2026-05-27-batch32: 63 tutorials retrofitted. Deploy green, healthz 200.

## DB audit (audit-recent-state.ts)

```
CATEGORIES
ord | slug                  | status      | subs | last fire        | PUB    | DRAFT
  1 | cooking               | READY       |    2 | 2026-05-20 17:21 |   1139 |     0
  2 | baking                | READY       |    8 | 2026-05-20 13:33 |    573 |     0
  3 | garden                | NOT_READY   |    9 | 2026-05-17 15:05 |      0 |     4
  4 | mindset               | READY       |   11 | 2026-05-20 19:20 |    845 |     0
  5 | herbal-medicine       | NOT_READY   |   10 | 2026-05-20 08:38 |     42 |     0
  6 | crochet               | NOT_READY   |    5 | n/a              |      0 |     4
  7 | knitting              | NOT_READY   |    9 | n/a              |      0 |     3
  8 | needlework            | NOT_READY   |    4 | n/a              |      0 |     3
  9 | sewing                | NOT_READY   |   15 | n/a              |      0 |     2
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

(Audit output's "last fire" column originally contained em-dash placeholders for categories that have not autopiloted; rendered as `n/a` here to keep the hand-off em-dash clean.)

## Voice retrofit progress

- Before this fire: 1557 PUBLISHED tutorials with voiceRetrofittedAt set.
- After this fire: 1620 PUBLISHED tutorials with voiceRetrofittedAt set.
- Remaining: 1915 PUBLISHED tutorials with voiceRetrofittedAt IS NULL.
- Delta matches batch size (63). PASS.

## Spot-check (one slug from batch)

- slug: champ
- voiceRetrofittedAt: 2026-05-27T11:44:29.087Z
- url: https://homemade.education/cooking/champ (site behind splash gate; anonymous traffic lands on /coming-soon, so body is not visible to a public curl. DB content confirmed via direct query.)
- new first paragraph (from DB):

> What makes champ different from mashed potato with spring onion stirred in is the spring onion infusion. You heat the chopped spring onions in the milk before mashing. The milk pulls in their flavour and spreads it through every spoonful. Stir raw spring onion through mash and you get patches of raw onion flavour instead of an even taste.

## Sample public URLs across categories

- https://homemade.education/cooking/champ
- https://homemade.education/cooking/chana-masala
- https://homemade.education/cooking/cheeseburger
- https://homemade.education/cooking/chicken-and-dumplings
- https://homemade.education/baking/devils-food-cake
- https://homemade.education/baking/digestives-wholemeal
- https://homemade.education/baking/dundee-cake
- https://homemade.education/mindset/joy-as-practice-reading
- https://homemade.education/mindset/late-diagnosis-adhd-in-women-reading
- https://homemade.education/wood-natural-craft/whittled-hazel-pot-stirrer

## Before / after excerpts (three content types)

### Cooking RECIPE: champ (paragraph[0])

BEFORE:
> The difference between champ and mashed potato with spring onion stirred in is the spring onion infusion: heating the chopped spring onions in the milk before mashing draws their flavour into the liquid and distributes it evenly through every spoonful. Stirring raw spring onion through mash gives patches of raw onion flavour rather than a uniform taste throughout.

AFTER:
> What makes champ different from mashed potato with spring onion stirred in is the spring onion infusion. You heat the chopped spring onions in the milk before mashing. The milk pulls in their flavour and spreads it through every spoonful. Stir raw spring onion through mash and you get patches of raw onion flavour instead of an even taste.

### Mindset READING: late-diagnosis-adhd-in-women-reading (paragraph[5])

BEFORE:
> In women, ADHD commonly presents as: chronic disorganisation despite significant intelligence; difficulty sustaining attention on tasks that are not intrinsically interesting; hyperfocus on things that are interesting; time blindness (difficulty estimating how long things take or tracking time); emotional dysregulation; difficulty with working memory; and, particularly in women, a pervasive sense of underachieving relative to capacity and effort.

AFTER:
> In women, ADHD often shows up in several ways. Long-running disorganisation, even with strong intelligence. Trouble holding attention on tasks that are not naturally interesting. Hyperfocus on the things that are. Time blindness, which means struggling to gauge how long things take or to keep track of time. Strong shifts in mood that are hard to settle. Working memory that drops things. And a steady sense of falling short of what one's capacity and effort should produce.

### Wood-natural-craft PATTERN: whittled-hazel-pot-stirrer (paragraph[0])

BEFORE:
> A pot stirrer from a green hazel rod is the simplest starting project in wood carving. The rod arrives as a cylinder; the work is to taper one end toward a flat paddle, round the other end into a comfortable handle, and remove the bark along the whole length. Green wood cuts with noticeably less resistance than seasoned timber, which makes this an ideal first project for developing feel for the push cut before moving to harder or more complex work.

AFTER:
> A pot stirrer from a green hazel rod is the simplest starting project in wood carving. The rod arrives as a cylinder. The work is to taper one end into a flat paddle. Round the other end into a comfortable handle. Then strip the bark off the whole length. Green wood cuts with much less push-back than seasoned timber. That makes this a good first project for getting a feel for the push cut before moving to harder work.

## Category breakdown (63 total)

- cooking: 19
- baking: 19
- mindset: 19
- wood-natural-craft: 6

## Content type breakdown (batches past 3 do not require type spread; recorded for visibility)

- RECIPE (cooking + baking): 38
- PRACTICE (mindset energy statements and exercises): 14
- READING (mindset reading articles): 5
- PATTERN (wood-natural-craft whittled projects): 6

## Notes from this fire

- 41/63 candidates passed voice-check cleanly with no edits needed. The
  apply step still stamped voiceRetrofittedAt on all 63 so the routine's
  forward read stays accurate.
- 22 files needed targeted rewrites. 20 were grade-level only. 2 also had
  year-only references in body prose (journal-prompts-as-practice and
  joy-as-practice-reading); both years moved out of body to a Sources-block
  reference. No institutional-name, historical-figure, prose-style-steps,
  clinical-vocab, or em-dash violations on this batch.
- The five non-body fields containing en-dash or em-dash characters were
  cleaned up before commit: yieldDescription on devils-food-cake (12 to 16
  slices), digestives (20 to 24), dorset-knobs-biscuit (30 to 36), and
  easter-biscuits (18 to 20); plus the em-dash in subtitle on
  whittled-lime-spatula (replaced with a comma). The voice-check does not
  currently scan these fields; the cleanup keeps the JSON files consistent
  with the no-em-dash rule for future passes.
- late-diagnosis-adhd-in-women-reading was the heaviest single file with
  5 grade-level paragraphs (one at grade 34.1, the running list of how
  ADHD presents in women). The rewrites preserved every clinical fact and
  every named researcher while shortening sentences and swapping nominal
  phrases for plain verbs.
- joy-as-practice-reading needed two rewrite passes: the sources paragraph
  retained grade 12.2 after the first pass and was tightened a second
  time.
- No word-count drops over 20 per cent on any file. Most rewrites added
  one or two short sentences where breaking a long sentence in half
  needed a linking clause.

## Forward read

- PUBLISHED tutorials with voiceRetrofittedAt IS NULL after this fire: 1915.

## Full list of slugs retrofitted in this batch

cooking (19):
- celeriac-and-apple-soup
- chai-spiced-overnight-oats
- chakchouka-tunisienne
- champ
- chana-masala
- cheddar-broccoli-rice-cups
- cheddar-rosemary-spiralized-potato-pancakes
- cheese-and-onion-pasty
- cheese-on-toast
- cheeseburger
- chermoula
- chermoula-sea-bass
- chestnut-and-sausagemeat-stuffing
- chicken-and-dumplings
- chicken-and-ham-pie
- chicken-and-leek-pie
- chicken-and-mushroom-pie
- chicken-and-waffles
- chicken-bhuna

baking (19):
- dark-caramel
- date-and-walnut-loaf
- date-squares
- devils-food-cake
- devonshire-splits
- digestive-biscuits
- digestive-biscuits-homemade
- digestives
- digestives-wholemeal
- dinner-rolls
- dinner-rolls-pull-apart
- dobos-torte
- dorset-apple-cake
- dorset-knobs-biscuit
- drop-scones
- drop-scones-scotch-pancakes
- dundee-cake
- easter-biscuits
- easter-biscuits-currant

mindset (19):
- in-this-family-we-hold-money-well
- income-arriving-from-three-sources
- income-flows-from-many-directions
- inherited-religion-and-what-to-do-with-it
- investments-compounding-green-numbers
- it-can-be-easier-than-i-expect
- journal-prompts-as-practice
- joy-as-practice-reading
- joy-is-allowed-to-be-medicine
- joy-is-not-something-i-have-to-earn
- just-this-room-awareness
- late-diagnosis-adhd-in-women
- late-diagnosis-adhd-in-women-reading
- leave-a-twenty-in-your-wallet-for-a-week
- legs-up-the-wall-before-bed
- light-a-candle-for-them-daily
- light-the-candle-when-you-walk-in
- light-the-candles-even-on-tuesday
- lighting-a-candle-for-the-women-in-your-line

wood-natural-craft (6):
- whittled-birch-hair-comb
- whittled-cherry-pendant
- whittled-hazel-pot-stirrer
- whittled-hazel-walking-stick
- whittled-lime-spatula
- whittled-oak-letter-seal
