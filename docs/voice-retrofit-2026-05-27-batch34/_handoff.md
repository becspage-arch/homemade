Batch 2026-05-27-batch34: 63 tutorials retrofitted. Deploy green, healthz 200.

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

(The audit output's "last fire" column originally contained em-dash placeholders for categories that have not autopiloted; rendered as `n/a` here so the hand-off stays em-dash clean.)

## Voice retrofit progress

- Before this fire: 1683 PUBLISHED tutorials with voiceRetrofittedAt set.
- After this fire: 1746 PUBLISHED tutorials with voiceRetrofittedAt set.
- Remaining: 1789 PUBLISHED tutorials with voiceRetrofittedAt IS NULL.
- Delta matches batch size (63). PASS.

## Spot-check (one slug from batch, picked at random)

- slug: my-best-days-begin-with-calm
- voiceRetrofittedAt: 2026-05-27T13:51:11.734Z
- url: https://homemade.education/mindset/my-best-days-begin-with-calm (site behind splash gate; anonymous traffic lands on /coming-soon, so body is not visible to a public curl. DB content confirmed via direct query.)
- new first paragraph (from DB):

> A short affirmation from Day 21 of the SLEEP program. The line works as permission, a reminder that a slow start is a productive one, and that calm is not the enemy of output.

## Sample public URLs across categories covered

- https://homemade.education/cooking/chicken-piccata
- https://homemade.education/cooking/chicken-tikka-masala
- https://homemade.education/cooking/chickpea-salad-with-lemon
- https://homemade.education/cooking/chilli-jam
- https://homemade.education/baking/focaccia-rosemary
- https://homemade.education/baking/french-silk-pie
- https://homemade.education/baking/galette-des-rois
- https://homemade.education/mindset/mortality-as-a-gift-not-a-threat
- https://homemade.education/mindset/my-body-knows-how-to-rest
- https://homemade.education/wood-natural-craft/willow-laundry-basket

## Before / after excerpts (3 content types)

### chicken-pot-pie (RECIPE), paragraph[11]

OLD:
> Chicken pot pie belongs to the broad tradition of British and American savoury pies, carried into North America by English and Welsh settlers who brought the pie-making tradition with them. It became one of the canonical American comfort foods of the twentieth century, with frozen commercial versions available from the 1950s onward (Marie Callender and Swanson both made it a household name). The commercial versions are a shadow of the real thing, which involves an actual pastry crust and a filling with enough flavour to stand on its own. It is the kind of meal that rewards the time it takes to make.

NEW:
> Chicken pot pie sits in the long line of British and American savoury pies. English and Welsh settlers carried the pie-making habit to North America, where it became a comfort-food classic in the twentieth century. Frozen supermarket versions arrived in the 1950s and made it a household name. The frozen kind is a shadow of the real one, which has a proper pastry crust and a filling with enough flavour to carry the dish. It rewards the time it takes to make.

### mortality-as-a-gift-not-a-threat (READING), paragraph[5]

OLD:
> The resistance to thinking about death is usually justified as a mental health measure: why dwell on something painful and unavoidable? But the research in existential psychology suggests the opposite is often true. Avoiding the thought of death tends to produce a low-level chronic anxiety, a background unease about time passing and meaning being unresolved, rather than the peace avoidance was meant to create.

NEW:
> Most people avoid thinking about death and call it a mental-health choice. Why dwell on something painful and out of your control? But the research in existential psychology points the other way. Avoiding the thought of death tends to leave a low-level chronic anxiety in its place. You get a background unease about time passing and meaning unresolved, not the peace the avoidance was meant to bring.

### willow-laundry-basket (PATTERN), paragraph[0]

OLD:
> A laundry basket is the largest domestic willow basket: an oval form, deep enough to hold a full household wash load, with a lid that closes against moisture. The construction is classic English country: oval slath base, staking-up, upsett waling, main body in randing, border waling, and a separate lid worked on the same base dimensions. This is a substantial three-day project for a confident intermediate basketmaker; not a first basket.

NEW:
> A laundry basket is the largest household willow basket. It is oval, deep enough for a full wash load, and has a lid that closes against damp. The make is classic English country: oval slath base, staking-up, upsett waling, main body in randing, border waling, and a separate lid worked on the same base size. This is a three-day project for a confident intermediate basketmaker. Not a first basket.

## Category-by-category count

- cooking: 19
- baking: 19
- mindset: 19
- wood-natural-craft: 6

(Cap of 19 per category hit on cooking, baking, and mindset; wood-natural-craft filled the remaining 6 slots by alphabetical slug order.)

## Anything surprising

- 34 of 63 picked tutorials already passed voice-check on export. The voice-retrofit progress is now narrowing to tutorials that were either authored under the new register or were already in voice; the genuine fixes were on 29 files. That said, every retrofitted row gets voiceRetrofittedAt populated, so the tracking number moves by the full batch size.
- The grade-level rule fires on short citation paragraphs (e.g. "Written for homemade.education, drawing on Stoic memento mori practice, Buddhist contemplations of impermanence...") because the per-paragraph Flesch-Kincaid is dominated by syllables-per-word when the sentence count is low. Fix is to break the citation into short sentences with shorter words.
- A handful of yieldDescription strings carried en-dashes for serving ranges ("serves 8 to 10" written as "serves 8 something 10" with an en-dash). Voice-check did not catch these because yieldDescription is recipe metadata, not body prose. The em/en dash grep at commit time did; cleaned in place. The apply script does not push yieldDescription back to DB, so the DB still has the en-dash form on those three rows. Worth a small follow-up worker to normalise yieldDescription ranges across the library to ASCII " to ".
- No word-count drops over 20% on any file: the rewrites preserved substance, only the language register changed.

## Forward read

- 1789 PUBLISHED tutorials still have voiceRetrofittedAt IS NULL after this fire.
- At 63 per fire, that is roughly 29 more fires to clear the queue.

## Slug list (63)

- chicken-piccata (cooking, RECIPE)
- chicken-pot-pie (cooking, RECIPE)
- chicken-rice-casserole (cooking, RECIPE)
- chicken-saag (cooking, RECIPE)
- chicken-shawarma (cooking, RECIPE)
- chicken-souvlaki (cooking, RECIPE)
- chicken-tagine (cooking, RECIPE)
- chicken-tagine-figs (cooking, RECIPE)
- chicken-tagine-preserved-lemon-olives (cooking, RECIPE)
- chicken-tagine-with-olives (cooking, RECIPE)
- chicken-tagine-with-preserved-lemon (cooking, RECIPE)
- chicken-tikka (cooking, RECIPE)
- chicken-tikka-masala (cooking, RECIPE)
- chicken-wrapped-in-parma-ham (cooking, RECIPE)
- chickpea-salad-with-lemon (cooking, RECIPE)
- chicory-pear-goats-cheese-salad (cooking, RECIPE)
- chili-con-carne (cooking, RECIPE)
- chilli-con-carne (cooking, RECIPE)
- chilli-jam (cooking, RECIPE)
- focaccia-herb-sea-salt (baking, RECIPE)
- focaccia-onion-thyme (baking, RECIPE)
- focaccia-rosemary (baking, RECIPE)
- focaccia-rosemary-and-sea-salt (baking, RECIPE)
- focaccia-tomato-olive (baking, RECIPE)
- fondant-cake-covering (baking, RECIPE)
- fondant-draping (baking, RECIPE)
- fondant-modelling-figures (baking, TECHNIQUE)
- fondant-sugar-flowers (baking, TECHNIQUE)
- fougasse-herb (baking, RECIPE)
- french-apple-cake (baking, RECIPE)
- french-silk-pie (baking, RECIPE)
- fruit-scones (baking, RECIPE)
- fruit-scones-currant (baking, RECIPE)
- fruit-scones-sultana (baking, RECIPE)
- fudge-vanilla (baking, RECIPE)
- fudge-vanilla-classic (baking, RECIPE)
- fudge-vanilla-scottish (baking, RECIPE)
- galette-des-rois (baking, RECIPE)
- money-in-the-room-like-a-calm-dog-at-your-feet (mindset, PRACTICE)
- money-is-energy-and-choice-affirmation (mindset, PRACTICE)
- money-is-safe-i-am-safe-with-money (mindset, PRACTICE)
- money-moving-through-your-account-like-a-river (mindset, PRACTICE)
- money-settled-like-silt (mindset, PRACTICE)
- money-stays (mindset, PRACTICE)
- mortality-as-a-gift-not-a-threat (mindset, READING)
- mum-guilt-what-it-is-and-what-to-do-with-it (mindset, READING)
- mum-guilt-what-it-is-what-to-do-with-it (mindset, READING)
- my-age-is-mine-to-be (mindset, PRACTICE)
- my-anxiety-is-information-not-identity (mindset, PRACTICE)
- my-ask-is-aligned-with-my-value (mindset, PRACTICE)
- my-best-days-begin-with-calm (mindset, PRACTICE)
- my-body-and-i-are-on-the-same-team (mindset, PRACTICE)
- my-body-has-learned-to-relax-here (mindset, PRACTICE)
- my-body-has-time-so-do-i (mindset, PRACTICE)
- my-body-is-allowed-to-change-shape (mindset, PRACTICE)
- my-body-is-allowed-to-fall (mindset, PRACTICE)
- my-body-knows-how-to-rest (mindset, PRACTICE)
- willow-flat-back-wall-basket (wood-natural-craft, PATTERN)
- willow-fruit-bowl (wood-natural-craft, PATTERN)
- willow-garden-trug (wood-natural-craft, PATTERN)
- willow-heart-wreath (wood-natural-craft, PATTERN)
- willow-hurdle-garden-panel (wood-natural-craft, PATTERN)
- willow-laundry-basket (wood-natural-craft, PATTERN)
