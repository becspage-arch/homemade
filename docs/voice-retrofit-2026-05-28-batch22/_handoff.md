Batch 2026-05-28-batch22: 75 tutorials retrofitted. Deploy green, healthz 200.

Deploy run: https://github.com/becspage-arch/homemade/actions/runs/26597264428
healthz: 200 from https://homemade.education/healthz

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
 16 | natural-home          | READY       |    5 | 2026-05-21 01:23 |     82 |     0
 17 | sustainability        | READY       |    6 | 2026-05-21 06:49 |    122 |     0

IMAGE VERIFICATION
  UNVERIFIED                   : 2337
  REJECTED_USED_PROCEDURAL     : 6
  VERIFIED                     : 1210
```

(The audit script renders em dashes in the "last fire" column for null
timestamps. Replaced with "(none)" here so the hand-off stays free of em
or en dashes.)

PUBLISHED total is now 3703 (up by 22 from batch21's 3681; the gap covers
fibre-arts going from 153 to 167, wood-natural-craft going from 162 to
170, and paper-word static at 117 between batches).

### 2. Voice retrofit progress

Before this fire: 3621 PUBLISHED with voiceRetrofittedAt set.
After this fire:  3696 PUBLISHED with voiceRetrofittedAt set.
Difference: 75. Matches the batch size.

Counts from check-voice-progress.ts after apply:

```
Done:      3696 of 3703  (100%)
Remaining: 7
Last retrofit:  Thu May 28 2026 20:24:24 GMT+0100 (British Summer Time)
Batches of 50 still to go: 1
```

### 3. Random spot-check

Random pick from batch: `oak-candle-tray`.

DB row after apply:

```
slug:               oak-candle-tray
title:              Oak candle tray
category:           wood-natural-craft
voiceRetrofittedAt: 2026-05-28T19:24:22.092Z
publicUrl:          https://homemade.education/wood-natural-craft/oak-candle-tray
```

First paragraph in DB after apply:

> A candle tray sits on a sideboard or a low table and holds a small
> grouping of pillar candles: three or four 60 mm pillars, or a row of
> tea lights in metal cups. The form is a flat oak board with chamfered
> edges and a slight ridge along the long sides to keep wax from
> running off. Oak is the choice: dense, fire-resistant, and beautiful
> with age. Seasoned board because the tray sits flat indoors and the
> edges must remain straight.

Live page check: the site is currently behind the pre-launch splash
gate, so the public HTML for tutorial URLs serves the "coming soon"
landing rather than the rendered tutorial. DB is canonical for this
verification, same as batches 17 to 21.

### 4. Full slug list (75)

- braided-rag-rug-oval
- bundle-dyeing-on-wool
- carved-pear-honey-stirrer
- carving-from-windfall-primer
- cold-water-indigo-vat
- dyeing-with-goldenrod
- dyeing-with-marigold-petals
- dyeing-with-woad-for-blue
- dyeing-wool-with-walnut-hulls
- hooking-a-simple-geometric-rug
- macrame-hanging-basket
- macrame-table-runner
- macrame-wall-hanging-sunrise
- oak-candle-tray
- overdyeing-to-modify-colour
- pine-spice-rack
- pyrography-leaf-coaster
- rigid-heddle-doubleweave-tube
- riven-oak-tent-peg
- tapping-for-the-ageing-body
- tapping-for-the-event-i-cant-release
- tapping-for-the-no
- tapping-for-the-parent-loss
- tapping-in-depression
- tarte-aux-fraises
- the-10-minute-reclaim
- the-house-spell
- the-mental-load
- the-mid-life-what-do-i-actually-believe
- the-slow-road-with-you-walking-calmly-down-it
- the-sunday-money-date-for-couples
- the-sunday-slow-morning
- triple-chocolate-layer-cake
- understanding-yarn-plying
- vollkornbrot-german
- we-can-learn-to-talk-again
- wet-felted-bag-with-handles
- wet-felted-egg-cosies
- wet-felted-slippers
- wet-felted-table-runner
- wet-felted-wall-art-panel
- wet-felting-with-plant-fibres
- what-anxiety-is-biologically
- what-did-i-lose-when-i-lost-them-beyond-them
- what-does-the-event-still-want-me-to-know
- when-a-parent-dies
- when-did-the-drift-start-quietly
- whittled-apple-bottle-stopper
- who-was-i-before-the-baby-where-is-she
- why-inheritance-and-tax-fear-slows-down-wealth-planning
- why-investing-isnt-for-me-is-a-story
- why-not-enough-time-is-rarely-about-time
- why-where-you-are-is-the-only-starting-place-that-works
- why-women-are-taught-to-apologise-for-wanting
- why-women-say-yes-reading
- willow-bird-feeder
- working-is-part-of-how-i-love-them
- working-mum-guilt-the-long-view
- world-s-best-cheesy-garlic-bread
- woven-placemats
- woven-tea-towel
- write-the-email-asking-for-the-raise-activity
- write-the-price-you-want-next-to-the-price-you-charge-activity
- write-tomorrows-three-priorities-close-the-notebook
- write-what-i-believe-200-words-journal
- yakitori-chicken
- yayla-corbasi
- yemista
- yorkshire-puddings
- you-at-the-head-of-the-table-visualisation
- your-grandchildren-choices-made-possible-by-you-visualisation
- your-ideal-client-walking-through-the-door
- your-own-account-your-own-decisions-visualisation
- zaalouk
- zabaglione

## Sample public URLs across categories covered

- https://homemade.education/cooking/yakitori-chicken
- https://homemade.education/cooking/yemista
- https://homemade.education/cooking/zabaglione
- https://homemade.education/baking/tarte-aux-fraises
- https://homemade.education/baking/yorkshire-puddings
- https://homemade.education/mindset/the-mental-load
- https://homemade.education/mindset/working-mum-guilt-the-long-view
- https://homemade.education/mindset/tapping-for-the-no
- https://homemade.education/fibre-arts/wet-felted-slippers
- https://homemade.education/wood-natural-craft/oak-candle-tray

## Before / after excerpts

Ten of the 75 files needed body rewrites this batch (eight for grade-level
overshoot at grade 12+ to 25+ paragraphs; one for historical figures in
body without a plain-English gloss; one tail-source paragraph at grade
17). The other 65 files were already in voice and only the
voiceRetrofittedAt marker changed. Three before / after excerpts follow,
one per content type that received a body rewrite.

1. mindset READING, `why-not-enough-time-is-rarely-about-time`:

   before:
   > For women specifically, the drivers include: invisible work (the
   > mental load of coordination, anticipation, and management that
   > doesn't appear in any time diary); emotional labour that takes
   > cognitive and energy resources without appearing to take time; and
   > the number of roles whose demands are simultaneous rather than
   > sequential.

   after:
   > For women, the drivers tend to be three things. Invisible work: the
   > mental load of planning, tracking, and managing the home that does
   > not show up in any time diary. Emotional labour: the kind of work
   > that drains focus and energy without seeming to take time. And the
   > number of roles whose demands run at the same time, not one after
   > the other.

2. mindset PRACTICE, `write-the-price-you-want-next-to-the-price-you-charge-activity`:

   before:
   > Original to homemade.education. The named-gap exercise is a common
   > shape across business coaching and self-worth literature on
   > pricing.

   after:
   > Original to homemade.education. The named-gap exercise is a common
   > shape in coaching work on pricing.

3. cooking RECIPE, `yorkshire-puddings` (historical-figure case):

   before:
   > The Yorkshire pudding originated as a batter cooked beneath a joint
   > on a spit, catching the dripping fat. Eliza Acton's 1845 recipe is
   > one of the earliest printed versions. Mrs Beeton's 1861 edition
   > includes it as standard Sunday practice. The modern convention of
   > serving small individual puddings came later; the original was a
   > large flat pudding served as a first course before the meat, to
   > fill guests up on the cheaper batter and reduce their appetite for
   > the more expensive beef.

   after:
   > The Yorkshire pudding started as a batter cooked beneath a joint on
   > a spit, catching the dripping fat. The nineteenth-century cookery
   > writer Eliza Acton printed one of the earliest known recipes. The
   > Victorian cookery writer Mrs Beeton later included it as standard
   > Sunday practice. The modern habit of serving small individual
   > puddings came later. The original was one large flat pudding served
   > as a first course before the meat. It filled guests up on the
   > cheaper batter so they ate less of the costly beef.

## Category-by-category count

mindset: 35, fibre-arts: 22, wood-natural-craft: 8, cooking: 7, baking: 3

## Content-type count

PRACTICE: 24, PATTERN: 19, READING: 14, RECIPE: 10, TECHNIQUE: 8

## Anything that surprised me

1. Ten of the 75 files needed body rewrites. That is a higher
   intervention rate than batch21 (which needed zero) but lower than
   batches in the 25 to 35 range earlier in the week. All ten failures
   were on mindset READING paragraphs that used academic-register
   sentences with semicolons, parentheticals, and multi-clause builds,
   plus one cooking RECIPE (yorkshire-puddings) that named two
   Victorian cookery writers in body without the canonical gloss
   tokens, and one historical-context paragraph in zabaglione at grade
   15. None were Mindset verbatim text from Rebecca's books; the
   verbatim affirmations and tapping scripts in this batch were
   untouched.

2. Word-count drops: none over 20%. The biggest drop was
   `why-women-are-taught-to-apologise-for-wanting` tail paragraph,
   which went from 70 words to 25 words (a 64% drop on a single
   paragraph), but the body as a whole went from 1064 to 1019 words
   (a 4% drop). The dropped 45 words were a citation block listing
   academic researchers (Lusardi, Mitchell, Stanny, Brown) which was
   redundant with the existing sourceNotes. The substance is
   preserved; the academic name list is now only in the Sources block.

3. The retrofit is one batch from done. After this fire, 7 PUBLISHED
   tutorials remain with voiceRetrofittedAt IS NULL. The next fire (or
   the one after, depending on autopilot publishing in the meantime)
   should close the queue.

One-line forward read: 7 PUBLISHED tutorials remain with
voiceRetrofittedAt IS NULL after this fire.
