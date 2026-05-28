Batch 2026-05-28-batch23: 7 tutorials retrofitted. Deploy green, healthz 200.

This is the final partial batch. The voice retrofit is now 100% complete across
the full PUBLISHED library (3703 of 3703). The routine has no remaining work
and the next scheduled fire should exit cleanly noting 0 candidates.

## Mandatory DB verification

### 1. audit-recent-state.ts output

```
CATEGORIES
ord | slug                  | status      | subs | last fire        | PUB    | DRAFT
  1 | cooking               | READY       |    2 | 2026-05-28 15:41 |   1139 |     0
  2 | baking                | READY       |    8 | 2026-05-28 14:28 |    653 |     0
  3 | garden                | NOT_READY   |    9 | 2026-05-17 15:05 |      0 |     4
  4 | mindset               | READY       |   11 | 2026-05-28 17:19 |    885 |     0
  5 | herbal-medicine       | NOT_READY   |   10 | 2026-05-20 08:38 |     42 |     0
  6 | crochet               | NOT_READY   |    5 | (none)           |      0 |     4
  7 | knitting              | NOT_READY   |    9 | (none)           |      0 |     3
  8 | needlework            | NOT_READY   |    4 | (none)           |      0 |     3
  9 | sewing                | NOT_READY   |   15 | (none)           |      0 |     2
 10 | fibre-arts            | READY       |    6 | 2026-05-28 17:23 |    167 |     0
 11 | wood-natural-craft    | READY       |    6 | 2026-05-28 18:38 |    170 |     0
 12 | paper-word            | READY       |    9 | 2026-05-28 19:00 |    117 |     0
 13 | pottery-ceramics      | READY       |    6 | 2026-05-21 02:42 |     82 |     0
 14 | animals-smallholding  | READY       |    6 | 2026-05-21 04:28 |    121 |     0
 15 | home-repair           | READY       |    6 | 2026-05-21 06:49 |    123 |     0
 16 | natural-home          | READY       |    5 | 2026-05-28 19:26 |     82 |     0
 17 | sustainability        | READY       |    6 | 2026-05-21 06:49 |    122 |     0

IMAGE VERIFICATION
  UNVERIFIED                   : 2337
  REJECTED_USED_PROCEDURAL     : 6
  VERIFIED                     : 1210
```

(The audit script renders em dashes in the "last fire" column for null
timestamps. Replaced with "(none)" here so the hand-off stays free of em
or en dashes.)

PUBLISHED total is 3703, unchanged from batch22. No new tutorials authored
in the window between the two batch fires.

### 2. Voice retrofit progress

Before this fire: 3696 PUBLISHED with voiceRetrofittedAt set.
After this fire:  3703 PUBLISHED with voiceRetrofittedAt set.
Difference: 7. Matches the batch size.

Counts from check-voice-progress.ts after apply:

```
Done:      3703 of 3703  (100%)
Remaining: 0
First retrofit: Mon May 25 2026 17:33:37 GMT+0100 (British Summer Time)
Last retrofit:  Thu May 28 2026 20:44:35 GMT+0100 (British Summer Time)
Batches of 50 still to go: 0
```

The retrofit programme is complete. From batch1 on 2026-05-25 to batch23 on
2026-05-28, 23 batches covered all 3703 PUBLISHED tutorials across all 17
categories.

### 3. Random spot-check

Random pick from batch: `zereshk-polo`.

DB row after apply:

```
slug:                zereshk-polo
title:               Zereshk polo
category:            cooking
voiceRetrofittedAt:  2026-05-28T19:44:34.776Z
publicUrl:           https://homemade.education/cooking/zereshk-polo
```

First paragraph of the rewritten body, as it sits in the DB after apply:

> The rice is cooked using the Persian two-stage method: parboiled until
> barely cooked through, then drained and steamed in a covered pot with
> butter to form a tahdig crust. The barberries are sautéed separately in
> butter with a small amount of sugar, just enough to take the sharpest
> edge off their tartness. They are folded into the rice at the end or
> used as a topping. The saffron water is spooned over the top layer of
> rice after mounding, turning the top a deep golden.

Live page check: the site is currently behind the pre-launch splash gate,
so the public HTML for tutorial URLs serves the "coming soon" landing
rather than the rendered tutorial. DB is canonical for this verification,
same as batches 17 to 22.

### 4. Full slug list (7)

- zapiekanka
- zeppole-italian
- zereshk-polo
- zucchini-pine-nut-cranberry-paleo-pasta
- zupa-pomidorowa
- zuppa-di-pesce-italiana
- zurek

## Sample public URLs

- https://homemade.education/cooking/zapiekanka
- https://homemade.education/baking/zeppole-italian
- https://homemade.education/cooking/zereshk-polo
- https://homemade.education/cooking/zucchini-pine-nut-cranberry-paleo-pasta
- https://homemade.education/cooking/zupa-pomidorowa
- https://homemade.education/cooking/zuppa-di-pesce-italiana
- https://homemade.education/cooking/zurek

## Category-by-category count

- cooking: 6
- baking:  1

## Before / after excerpts

The orientation paragraphs were already in voice on all 7 tutorials. The
only rewrites were on the closing "Where this dish lives" paragraphs that
tripped the grade-level rule (above grade 12). Three rewrites in total;
all three are shown below.

### zapiekanka closing paragraph (grade 13.0 to passing)

Before:

> Zapiekanka was the fast food of communist Poland, cheap and available in
> the state-run milk bars that dotted every Polish town. After 1989 it
> briefly fell out of fashion as international fast food arrived, then
> staged a quiet comeback, there are now zapiekanka specialists in
> Krakow's Kazimierz district that sell elaborate versions with pulled
> pork, truffle oil, and twenty toppings.

After:

> Zapiekanka was the fast food of communist Poland. It was cheap, hot, and
> sold from the state-run milk bars in every town. After 1989 it fell out
> of fashion when foreign chains arrived. Then it quietly came back.
> Krakow's Kazimierz district now has stalls selling fancy versions with
> pulled pork, truffle oil, and twenty toppings.

### zereshk-polo closing paragraph (grade 13.3 to passing)

Before:

> Zereshk polo ba morgh is one of the great set pieces of Iranian home
> cooking, made for guests, for Nowruz (Persian New Year), and for any
> occasion considered worth celebrating. The combination of saffron gold,
> ruby-red barberries, and snowy white rice makes it visually striking as
> well as delicious.

After:

> Zereshk polo ba morgh is one of the great party dishes of Iranian home
> cooking. Cooks make it for guests, for Nowruz (Persian New Year), and
> for any day worth marking. The saffron gold, the ruby barberries, and
> the snowy rice make it as pretty as it is good.

### zuppa-di-pesce-italiana closing paragraph (grade 15.7 to passing)

Before:

> Every port town in Italy has a version of fish soup with a different
> name and a fierce local attachment to its specific form. The brodetto of
> the Adriatic coast from Ancona to Bari, the cacciucco of Livorno, the
> ciuppin of Genoa, the buridda of Sardinia: all are the same impulse
> expressed differently, which is to make a meal from the fish that the
> nets brought in and the tomatoes and wine that were cheap.

After:

> Every port town in Italy has its own fish soup, each with its own name
> and fierce local pride. Brodetto is the version on the Adriatic coast
> from Ancona down to Bari. Cacciucco is the one in Livorno. Ciuppin
> comes from Genoa, buridda from Sardinia. All come from the same idea:
> a meal made from the fish the nets brought in, with the tomatoes and
> wine that were cheap.

## Anything that surprised me

- 6 of the 7 are cooking tutorials; the other is baking. The slug-ascending
  order placed the alphabetical tail (everything starting with z) entirely
  in the food categories, which is why the final partial batch is one
  content type rather than the mixed bag earlier batches had.
- The bodies were almost all clean on first voice-check pass. Only 3 of
  the 7 had blocking errors (all grade-level on the closing cultural
  paragraph). Two had non-blocking warnings.
- zucchini-pine-nut-cranberry-paleo-pasta has 7 non-blocking americanism
  warnings on "zucchini" in body prose. The dish is American-style paleo
  and the slug itself encodes "zucchini", so changing only the body to
  "courgette" would create an inconsistency between title, slug, and
  prose. Left untouched per the no-over-prune rule. Worth a separate
  followup on whether the dish should be renamed or republished as a
  courgette pasta in a future content sweep.
- zurek has one non-blocking tricolon warning. Left untouched.
- No word-count drops over 20% on any file. The rewrites were
  re-phrasings of long sentences into shorter ones, not content cuts.

## Forward read

After this fire: 0 PUBLISHED tutorials with voiceRetrofittedAt IS NULL.

The voice-retrofit-50-batch cron routine is now redundant. Next fire will
pick 0 candidates and exit. Recommend deleting the scheduled task or
letting it run as a no-op safety net while new tutorials get authored,
since the upstream autopilot author prompt already bakes in the new
register.
