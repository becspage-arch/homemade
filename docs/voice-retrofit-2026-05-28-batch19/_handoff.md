Batch 2026-05-28-batch19: 75 tutorials retrofitted. Deploy green, healthz 200.

## Mandatory DB verification

### 1. audit-recent-state.ts output

```
CATEGORIES
ord | slug                  | status      | subs | last fire        | PUB    | DRAFT
  1 | cooking               | READY       |    2 | 2026-05-28 15:41 |   1138 |     0
  2 | baking                | READY       |    8 | 2026-05-28 14:28 |    613 |     0
  3 | garden                | NOT_READY   |    9 | 2026-05-17 15:05 |      0 |     4
  4 | mindset               | READY       |   11 | 2026-05-20 19:20 |    845 |     0
  5 | herbal-medicine       | NOT_READY   |   10 | 2026-05-20 08:38 |     42 |     0
  6 | crochet               | NOT_READY   |    5 | (none)           |      0 |     4
  7 | knitting              | NOT_READY   |    9 | (none)           |      0 |     3
  8 | needlework            | NOT_READY   |    4 | (none)           |      0 |     3
  9 | sewing                | NOT_READY   |   15 | (none)           |      0 |     2
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
  VERIFIED                     : 1218
```

(The "last fire" column rendered with em dashes by the audit script for null timestamps. Replaced with "(none)" here so the hand-off stays free of em or en dashes.)

PUBLISHED total still 3574 between batch18 and batch19. Autopilot has not added new rows in the gap.

### 2. Voice retrofit progress

Before this fire (carried from batch18 hand-off): 3396 PUBLISHED with voiceRetrofittedAt set.
After this fire: 3471 PUBLISHED with voiceRetrofittedAt set.
Difference: 75. Matches the batch size.

Counts from check-voice-progress.ts after apply:

```
Done:      3471 of 3574  (97%)
Remaining: 103
Last retrofit:  Thu May 28 2026 17:44:46 GMT+0100 (British Summer Time)
Batches of 50 still to go: 3
```

### 3. Random spot-check

Random pick from batch: `welsh-oven-bottom-muffins`.

DB row after apply:

```
slug:                welsh-oven-bottom-muffins
category:            baking
voiceRetrofittedAt:  Thu May 28 2026 17:44:44 GMT+0100 (British Summer Time)
revisedFrom set:     true
URL:                 https://homemade.education/baking/welsh-oven-bottom-muffins
```

Opening paragraph in DB after apply:

> Welsh oven-bottom muffins are cooked entirely on the hob, with no oven involved. The key is getting the griddle to the right temperature before the muffins go on. Too hot and the surfaces scorch while the dough stays raw inside; the muffin should cook through in about 12 minutes on each side over medium-low heat.

Live page check: the site is currently behind the pre-launch splash gate, so the public HTML for tutorial URLs serves the "coming soon" landing rather than the rendered tutorial. DB is canonical for this verification, same as batches 17 and 18.

### 4. Full slug list (75)

- warm-pear-salad
- washing-money-shame-clean
- watering-the-garden-with-the-overflow
- we-can-come-back-to-each-other
- we-can-want-different-things-and-find-common-ground
- wealth-fits-the-life-i-am-building
- wealth-is-infinite-and-ever-renewing-affirmation
- wealth-is-natural-and-constant-affirmation
- wedding-fruit-cake
- welsh-cawl
- welsh-oven-bottom-muffins
- welsh-rarebit
- what-84-days-of-money-work-does-reading
- what-am-i-afraid-people-will-say-if-i-have-it-journal
- what-am-i-afraid-will-happen-if-i-stop-watching-journal
- what-am-i-gripping-about-my-sleep-journal
- what-am-i-postponing-until-conditions-are-perfect
- what-am-i-tracking-that-nobody-else-is-journal
- what-am-i-trying-to-control-about-sleep-journal
- what-ancestor-work-means-in-the-money-context
- what-bold-actions-have-i-been-delaying-journal
- what-can-wait-until-tomorrow
- what-can-wait-until-tomorrow-journal
- what-changes-about-my-day-when-the-wealth-lands-journal
- what-did-i-learn-about-money-before-age-10-journal
- what-did-i-lose-beyond-them-journal
- what-did-i-not-say-in-the-last-money-argument-journal
- what-did-my-grandmother-believe-about-money-journal
- what-did-thirty-nine-year-old-me-believe-about-forty
- what-do-i-believe-about-rich-women-journal
- what-do-i-want-this-decade-to-be
- what-does-a-wise-wealth-creator-do-on-monday-morning-journal
- what-does-admin-dread-say-about-me-journal
- what-does-being-a-person-who-sleeps-well-feel-like-journal
- what-does-being-older-bring-journal
- what-does-cashflow-at-your-dream-level-feel-like-journal
- what-does-effortless-financial-inflow-look-like-for-me-journal
- what-does-feeling-safe-in-abundance-look-like-journal
- what-does-free-mean-for-my-childrens-children-journal
- what-does-freedom-look-like-to-me-journal
- what-does-good-enough-with-my-body-look-like
- what-does-my-body-do-when-the-number-is-good-journal
- what-does-my-body-want-me-to-know-today-journal
- what-does-my-daily-money-rhythm-look-like-journal
- what-does-my-guilt-about-this-say-about-my-worthiness-story
- what-does-my-lottery-fantasy-say-i-want
- what-does-my-money-want-to-be-asked-journal
- what-does-my-mum-guilt-actually-want-from-me-journal
- what-does-my-work-give-my-children
- what-does-prayer-mean-to-me
- what-does-prayer-mean-to-me-beyond-childhood-journal
- what-does-safe-with-money-feel-like-in-my-body-journal
- what-does-sanctuary-mean-to-me-at-home-journal
- what-does-she-love-most-about-her-life-journal
- what-does-the-sleepless-version-of-me-deserve-to-hear-journal
- what-does-the-woman-with-money-wear-on-a-tuesday-journal
- what-does-this-diagnosis-explain
- what-doubts-about-wealth-am-i-ready-to-clear-journal
- what-feeling-is-asking-to-be-heard-tonight
- what-feeling-is-asking-to-be-heard-tonight-journal
- what-flows-in-stays-in
- what-forgiveness-is-what-it-isnt
- what-friendship-am-i-starving-for
- what-generosity-would-feel-right-journal
- what-has-changed-in-my-relationship-with-money-journal
- what-has-changed-in-thirty-days-of-tapping-for-sleep-journal
- what-has-my-body-managed-this-week-journal
- what-hides-beneath-financial-hesitation-journal
- what-i-want-my-grandchildren-to-inherit
- what-i-want-my-grandchildren-to-inherit-journal
- what-i-want-to-leave-my-childrens-children-journal
- what-in-the-dark-do-i-think-i-have-to-guard-against-journal
- what-is-available-to-her-is-available-to-me
- what-is-my-debt-story-journal
- what-is-my-health-anxiety-protecting-journal

## Sample public URLs

- https://homemade.education/baking/welsh-oven-bottom-muffins
- https://homemade.education/baking/wedding-fruit-cake
- https://homemade.education/cooking/warm-pear-salad
- https://homemade.education/cooking/welsh-cawl
- https://homemade.education/cooking/welsh-rarebit
- https://homemade.education/mindset/washing-money-shame-clean
- https://homemade.education/mindset/what-forgiveness-is-what-it-isnt
- https://homemade.education/mindset/what-friendship-am-i-starving-for
- https://homemade.education/mindset/what-i-want-my-grandchildren-to-inherit
- https://homemade.education/mindset/what-ancestor-work-means-in-the-money-context

## Before / after excerpts

One cooking, two mindset (the batch is heavy mindset: 70 of 75).

### welsh-rarebit (cooking closing paragraph, grade 12.6 to about 9)

Before:
> Welsh rarebit is a lunch dish, a late-night supper, and a savoury to end a dinner when something rich and sharp is wanted after dessert. It is the most sophisticated use of cheese on toast in the British tradition, made with a sauce rather than slices of cheese, and seasoned correctly it has a depth that straight melted cheese cannot match.

After:
> Welsh rarebit is a lunch dish, a late-night supper, and a savoury after dinner when something rich and sharp is wanted. It is the smartest use of cheese on toast in British cooking, made with a sauce rather than slices of cheese. Seasoned right, it has a depth that plain melted cheese cannot match.

### what-forgiveness-is-what-it-isnt (mindset definitions paragraph, grade 16.1 to about 9)

Before:
> Psychologists Fred Luskin and Robert Enright, who have studied forgiveness extensively, converge on a working definition: forgiveness is the decision to let go of resentment, bitterness, and the desire for punishment, for your own benefit. It is the release of the ongoing activation that holding the grievance produces in the nervous system.

After:
> Psychologists Fred Luskin and Robert Enright have studied forgiveness for years. They agree on a working definition. Forgiveness is the choice to let go of resentment, bitterness, and the wish for punishment, for your own benefit. It is the release of the steady stress response that holding the grievance creates in the body.

### what-ancestor-work-means-in-the-money-context (mindset reading paragraph, grade 12.7 to about 8)

Before:
> Money beliefs are transmitted through families in several ways. Explicitly, through what was said out loud: 'money doesn't grow on trees,' 'we can't afford it,' 'rich people are greedy.' Implicitly, through what was modelled: how anxiety was managed, whether bills were spoken about or hidden, what was celebrated, what was shameful. And structurally, through the actual financial circumstances of the previous generation, what they had, what they lost, what they worked toward and never reached.

After:
> Money beliefs pass through families in several ways. Explicitly, through what was said out loud: 'money doesn't grow on trees,' 'we can't afford it,' 'rich people are greedy.' Implicitly, through what was shown: how anxiety was managed, whether bills were talked about or hidden, what was praised, what was treated as shameful. And structurally, through the actual money lives of the older generation. What they had. What they lost. What they worked for and never reached.

## Category-by-category count

mindset: 70, cooking: 3, baking: 2

## Notes / surprises

- 57 of 75 picked tutorials passed voice-check cleanly on first export. 18 needed rewriting. This is the highest first-pass rate of any batch today (vs 53 / 22 in batch18, 38 / 37 in batch17, 40 / 35 in batch16). The slug-ascending walk has reached the "what-..." mindset journal prompts, which are short, instructional, and mostly in register already.
- Failure modes were unusually narrow: every single failure was the grade-level rule. Zero year-in-body, zero institutional-in-body, zero historical-figure-in-body, zero prose-style-steps, zero clinical-vocab, zero missing-node-type, zero em or en dash. The mindset content has clearly settled into the new register on every dimension except sentence complexity in the closing "Sources / Written for" paragraph.
- Of the 18 failing files, 13 tripped on the closing paragraph (paragraph[14], [15], or [16]), which is consistently the "Written for homemade.education / Drawn from..." citation. The "homemade.education" token is 7 syllables and acts as a load on any short paragraph. The fix in every case was to split the closing into two or three sentences so the average sentence length drops.
- One file (watering-the-garden-with-the-overflow) needed two passes. The first rewrite still scored grade 14.8 because "creative visualisation" is 8 syllables across 2 content words. The fix was dropping "creative visualisation" entirely and saying "imagery in the mind" with a separate sentence on public-domain status. The general lesson for short closing paragraphs: avoid multisyllabic content nouns near "homemade.education" because the syllable density alone can push grade over 12.
- No Mindset verbatim text touched. Every affirmation / energy alignment / tapping script in this batch lives in pullQuote nodes which the rewrite script did not edit. Edits only touched prose paragraphs (orientation, instructions, closing notes).
- No word-count drops over 20% on any file. Largest drop was on what-does-my-money-want-to-be-asked-journal paragraph[7] (13 words to 19 words: a small expansion to convert the noun-list-then-instruction shape into a clear lead sentence plus a follow-up sentence).
- Affirmation files (wealth-is-infinite-..., wealth-is-natural-...) passed first time. Verbatim affirmation copy was already in shape and the surrounding orientation prose was already short enough.
- Welsh- cluster (welsh-cawl, welsh-oven-bottom-muffins, welsh-rarebit): two passed cleanly, one needed a closing-paragraph fix. The British recipes are consistently in voice except where the closing "where this dish lives" paragraph picks up academic register.
- No image / hero media files touched.
- No troubleshooter blocks were edited; none tripped a rule.
- No ingredient slugs, scaling tokens, glossaryTooltip termIds, recipe metadata, or recipeTools arrays changed.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 103.
