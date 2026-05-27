Batch 2026-05-27-batch33: 63 tutorials retrofitted. Deploy green, healthz 200.

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

- Before this fire: 1620 PUBLISHED tutorials with voiceRetrofittedAt set.
- After this fire: 1683 PUBLISHED tutorials with voiceRetrofittedAt set.
- Remaining: 1852 PUBLISHED tutorials with voiceRetrofittedAt IS NULL.
- Delta matches batch size (63). PASS.

## Spot-check (one slug from batch)

- slug: chicken-pathia
- voiceRetrofittedAt: 2026-05-27T12:40:45.478Z
- url: https://homemade.education/cooking/chicken-pathia (site behind splash gate; anonymous traffic lands on /coming-soon, so body is not visible to a public curl. DB content confirmed via direct query.)
- new first paragraph (from DB):

> Pathia is a balancing act: the three elements (sweet, sour, hot) need to be in tension with each other, not one dominating. Add the tamarind, then taste. Add the sugar, then taste again. They should counteract without cancelling. If the sauce tastes sweet, add more tamarind. If it tastes too sour, add more sugar. The heat from the chilli should be felt after swallowing, not immediately on the palate.

## Sample public URLs across categories

- https://homemade.education/cooking/chicken-biryani
- https://homemade.education/cooking/chicken-kiev
- https://homemade.education/cooking/chicken-korma
- https://homemade.education/cooking/chicken-passanda
- https://homemade.education/baking/eccles-cakes
- https://homemade.education/baking/empire-biscuits
- https://homemade.education/baking/focaccia-dimpled
- https://homemade.education/mindset/matrescence-the-identity-rewrite
- https://homemade.education/mindset/money-arriving-while-you-nap
- https://homemade.education/wood-natural-craft/willow-fishing-creel

## Before / after excerpts (three content types)

### Cooking RECIPE: chicken-passanda (paragraph[0])

BEFORE:
> Passanda is a mild, soothing curry, the almond and cream combination creates a sauce that is rich without being heavy. The key technique difference from korma is that the almond flour goes in earlier and cooks with the spices, which develops the nuttiness of the almonds into the base rather than simply stirring them in at the end as a thickener.

AFTER:
> Passanda is a mild, soothing curry. The almond and cream make a sauce that is rich but not heavy. The key technique difference from korma is when the almond flour goes in. Here it cooks with the spices from early on. That develops the nuttiness of the almonds into the base, rather than just stirring them in at the end as a thickener.

### Mindset READING: matrescence-the-identity-rewrite (paragraph[0])

BEFORE:
> A reading on matrescence, the psychological and developmental transition of becoming a mother. The word was coined by anthropologist Dana Raphael in 1973 and has been largely absent from mainstream discourse since. What it names is the identity shift of becoming a mother: a transition as significant as adolescence, with no cultural script to accompany it.

AFTER:
> A reading on matrescence, the change of becoming a mother. The word names the identity shift a woman moves through when she has a child. It is as big a transition as adolescence, but with no cultural script to go with it. The word has been used by researchers since the 1970s and is only now reaching wider use.

### Wood-natural-craft PATTERN: willow-fishing-creel (paragraph[0])

BEFORE:
> A fishing creel is a basket designed to be worn; the kidney shape fits against the back and the rounded belly faces outward, keeping the fish cool and aerated on a warm day. The construction is the most demanding in the basketry repertoire: the kidney base requires modifying the standard slath to produce a curved footprint, and the staking-up on a convex base requires holding the stakes at two different angles simultaneously. A confident intermediate basketmaker should expect to spend a full day on a first creel.

AFTER:
> A fishing creel is a basket designed to be worn. The kidney shape fits against the back. The rounded belly faces outward, keeping the fish cool and aerated on a warm day. The construction is the most demanding in the basketry repertoire. The kidney base needs a modified slath to give the curved footprint. Staking-up on a convex base means holding the stakes at two different angles at the same time. A confident intermediate basketmaker should expect to spend a full day on a first creel.

## Category breakdown (63 total)

- cooking: 19
- baking: 19
- mindset: 19
- wood-natural-craft: 6

## Content type breakdown (batches past 3 do not require type spread; recorded for visibility)

- RECIPE (cooking + baking): 38
- PRACTICE (mindset energy statements and exercises): 17
- READING (mindset reading articles): 2
- PATTERN (wood-natural-craft whittled / willow projects): 6

## Notes

- 45 of the 63 picked files were already CLEAN per voice-check at export time. They were applied unchanged (body passes through), with voiceRetrofittedAt populated and the body+subtitle+excerpt+sourceNotes write happening as a no-op refresh.
- 18 files had grade-level violations on specific paragraphs. Only those paragraphs were rewritten; the rest of each body was left intact (per the "do not over-prune" rule).
- One paragraph in matrescence-the-identity-rewrite tripped the medical-claim watchword "treats" after the first rewrite pass ("a framework that treats it as a transition"); a second-pass fix changed "treats" to "takes" and "treat their own normal responses" to "take their own normal responses", which kept the substance and passed voice-check.
- One paragraph in money-arriving-while-you-nap (the trailing attribution) still failed grade-level after the first rewrite (13.6); a second-pass fix split it into three shorter sentences.
- One step inside whittled-sycamore-cocktail-pick is wrapped around a glossaryTooltip mark on "push cuts" (termId cmpa0m70u0002t8v46ohivdkd); the rewrite preserved the mark by keeping the marked leaf and rewriting the surrounding two leaves.
- Four files had en/em dashes in subtitle or yieldDescription (chicken-dopiaza subtitle, chicken-pathia subtitle, english-muffins-griddle yieldDescription, florentines-chocolate yieldDescription). Subtitles were rewritten to use commas and re-applied to DB. yieldDescription is recipe metadata and out of scope for this batch per the locked scope rules; the in-batch JSON files were edited to keep the artifact dash-free, but DB yieldDescription was not changed. Flagged for a separate pass over recipe metadata if Rebecca wants the en-dash ranges normalised.
- No file had a word-count drop greater than 20% compared with the pre-rewrite DB state. The change set is small and targeted at the specific failing paragraphs.

## Forward read

- 1852 PUBLISHED tutorials remain with voiceRetrofittedAt IS NULL.
## Slug list (63)
- cooking/chicken-biryani
- cooking/chicken-caesar-salad
- cooking/chicken-casserole-cider-tarragon
- cooking/chicken-chasseur
- cooking/chicken-dopiaza
- cooking/chicken-fajitas
- cooking/chicken-fried-steak
- cooking/chicken-gumbo
- cooking/chicken-gyoza
- cooking/chicken-jalfrezi
- cooking/chicken-katsu-curry
- cooking/chicken-kiev
- cooking/chicken-korma
- cooking/chicken-noodle-soup
- cooking/chicken-paprikash
- cooking/chicken-parmesan
- cooking/chicken-passanda
- cooking/chicken-pathia
- cooking/chicken-pesto-pasta-salad
- baking/eccles-cakes
- baking/eclair-chocolate
- baking/eclairs-chocolate
- baking/elderflower-and-lemon-cake
- baking/empire-biscuits
- baking/english-muffins
- baking/english-muffins-griddle
- baking/english-muffins-stovetop
- baking/fairy-cakes-glace
- baking/fat-rascals
- baking/fat-rascals-yorkshire
- baking/financiers
- baking/financiers-brown-butter
- baking/flapjacks
- baking/flapjacks-golden-syrup
- baking/flatbreads-yeasted
- baking/florentines
- baking/florentines-chocolate
- baking/focaccia-dimpled
- mindset/looking-back-from-the-end-of-your-life
- mindset/looking-back-from-the-end-of-your-life-at-the-lineage-you-started
- mindset/looking-back-from-the-end-of-your-life-visualisation
- mindset/massive-cashflow-is-allowed-and-mine
- mindset/matrescence-the-identity-rewrite
- mindset/millions-are-allowed-to-be-mine
- mindset/money-always-returns-and-grows-affirmation
- mindset/money-and-desire-are-not-at-war-affirmation
- mindset/money-and-the-nervous-system
- mindset/money-arriving-and-staying
- mindset/money-arriving-while-you-nap
- mindset/money-can-come-easily-i-am-safe-to-receive-it
- mindset/money-can-come-through-ease-as-well-as-effort
- mindset/money-comes-through-me-not-just-from-me
- mindset/money-comes-to-me-steadily-and-easily-affirmation
- mindset/money-finds-me-through-every-door
- mindset/money-finds-me-through-expected-and-unexpected-doors
- mindset/money-in-motion-comes-back-multiplied-affirmation
- mindset/money-in-the-household-is-shared-energy-statement
- wood-natural-craft/whittled-sycamore-candle-holder
- wood-natural-craft/whittled-sycamore-cheese-knife
- wood-natural-craft/whittled-sycamore-cocktail-pick
- wood-natural-craft/whittled-sycamore-letter-opener
- wood-natural-craft/willow-christmas-star
- wood-natural-craft/willow-fishing-creel
