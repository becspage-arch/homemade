Batch 2026-05-28-batch21: 75 tutorials retrofitted. Deploy pending verification at commit.

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
 10 | fibre-arts            | READY       |    6 | 2026-05-28 17:23 |    153 |     8
 11 | wood-natural-craft    | READY       |    6 | 2026-05-20 23:08 |    162 |     0
 12 | paper-word            | READY       |    9 | 2026-05-21 00:28 |    117 |     0
 13 | pottery-ceramics      | READY       |    6 | 2026-05-21 02:42 |     82 |     0
 14 | animals-smallholding  | READY       |    6 | 2026-05-21 04:28 |    121 |     0
 15 | home-repair           | READY       |    6 | 2026-05-21 06:49 |    123 |     0
 16 | natural-home          | READY       |    5 | 2026-05-21 01:23 |     82 |     0
 17 | sustainability        | READY       |    6 | 2026-05-21 06:49 |    122 |     0

IMAGE VERIFICATION
  UNVERIFIED                   : 2356
  VERIFIED                     : 1197
```

(The "last fire" column rendered with em dashes by the audit script for null
timestamps. Replaced with "(none)" here so the hand-off stays free of em or
en dashes.)

PUBLISHED total is now 3681 (up by 106 from batch20's 3575 reading; the gap
covered cooking-bulk-032 (1138 to 1139), mindset-bulk-022 (845 to 885), and
fibre-arts autopilot fires that added 40 more baking and 26 more fibre-arts
PUBLISHED tutorials between the two batches).

### 2. Voice retrofit progress

Before this fire: 3546 PUBLISHED with voiceRetrofittedAt set.
After this fire:  3621 PUBLISHED with voiceRetrofittedAt set.
Difference: 75. Matches the batch size.

Counts from check-voice-progress.ts after apply:

```
Done:      3621 of 3681  (98%)
Remaining: 60
Last retrofit:  Thu May 28 2026 19:36:42 GMT+0100 (British Summer Time)
Batches of 50 still to go: 2
```

### 3. Random spot-check

Random pick from batch: `nyc-style-giant-cookies`.

DB row after apply:

```
slug:               nyc-style-giant-cookies
title:              New York style giant chocolate chip cookies
category:           baking
voiceRetrofittedAt: 2026-05-28T18:36:41.626Z
publicUrl:          https://homemade.education/baking/nyc-style-giant-cookies
```

First paragraph in DB after apply:

> These cookies use melted butter, not softened butter. Melted butter makes
> the dough thinner and less aerated, which means the cookies spread flat
> and develop crispy lacey edges while staying chewy in the centre. The
> dough needs 30 minutes in the fridge before baking so it firms up enough
> to hold its shape.

Live page check: the site is currently behind the pre-launch splash gate,
so the public HTML for tutorial URLs serves the "coming soon" landing
rather than the rendered tutorial. DB is canonical for this verification,
same as batches 17 to 20.

### 4. Full slug list (75)

- 40-as-a-beginning
- a-40th-honouring
- an-ancestor-forgiveness-ritual
- apple-blackberry-pie
- banana-bread-walnut
- berry-pavlova-summer
- buche-de-noel
- cancel-one-thing-this-week-with-kindness
- canele-bordelais
- carrot-and-walnut-cake
- cherry-clafoutis
- chocolate-courgette-cake
- chocolate-sandwich-cake-buttercream
- christmas-cake-last-minute
- courgette-bread
- crostata-di-pere-e-cioccolato
- cupcakes-vanilla
- death-by-chocolate-cake
- filled-doughnuts-custard
- filled-doughnuts-jam
- filo-triangles-sweet-almond
- financiers-french
- finishing-handwoven-cloth
- five-minute-gut-check
- flat-felt-making-methods
- forgiveness-is-mine-to-choose-on-my-time
- four-shaft-herringbone-twill
- four-shaft-honeycomb-weave
- free-form-galette-rustic
- ginger-loaf-crystallised-ginger
- hand-carding-rolags
- hand-on-belly-hand-on-heart-three-rounds-of-breath
- hand-pies-peach
- hazelnut-roulade
- how-to-make-todays-home-feel-like-the-dream
- inner-safety-scan
- lamington-australian
- lemon-curd-pavlova
- light-a-candle-for-them
- long-exhale-breath-six-rounds
- maamoul-mad-levantine
- matrescence
- mhencha-moroccan-coiled
- mini-pavlovas
- my-spiritual-practice-is-mine-their-judgment-isnt
- my-time-is-allowed-to-be-enough
- needle-felted-bee
- needle-felted-bird-ornament
- needle-felted-hedgehog
- needle-felted-rabbit
- needle-felted-sheep-flock
- needle-felting-3d-sculpture-armature-free
- nuno-felting-on-silk-organza
- nyc-style-giant-cookies
- one-piece-youve-been-told-is-too-young
- one-sentence-of-prayer
- one-small-thing-today-just-one
- orange-polenta-cake
- pain-rustique-slack-dough
- pikelets-yorkshire
- pizzelle-italian
- reading-a-sett-chart
- rearrange-one-shelf-today
- resist-felting-a-bowl
- rosettes-scandinavian
- soda-farls-northern-irish
- sourdough-discard-banana-bread
- spinning-bluefaced-leicester
- spinning-corriedale-wool
- spinning-silk-hankies
- spoonbread-southern
- sugar-cookies-rolled-iced
- tapestry-weave-colour-blocking
- tapping-for-mum-rage
- tapping-for-resentment-in-the-marriage

## Sample public URLs across categories covered

- https://homemade.education/baking/apple-blackberry-pie
- https://homemade.education/baking/nyc-style-giant-cookies
- https://homemade.education/baking/cherry-clafoutis
- https://homemade.education/baking/buche-de-noel
- https://homemade.education/mindset/40-as-a-beginning
- https://homemade.education/mindset/an-ancestor-forgiveness-ritual
- https://homemade.education/mindset/tapping-for-mum-rage
- https://homemade.education/fibre-arts/tapestry-weave-colour-blocking
- https://homemade.education/fibre-arts/needle-felted-bee
- https://homemade.education/fibre-arts/spinning-corriedale-wool

## Before / after excerpts

All 75 files in this batch passed runVoiceCheck cleanly on the pre-rewrite
export. The autopilot author prompt has the 2026-05-21 voice spec baked in,
so newly authored tutorials land in the new register. The apply step on a
file whose body is already clean still populates voiceRetrofittedAt and
snapshots the body into revisedFrom where revisedFrom was null, so the row
is correctly marked as retrofitted while the body itself is unchanged.

Three excerpts from three content types follow. The "before" and "after"
are identical for this batch because no rewriting was needed; only the
voiceRetrofittedAt marker changed.

1. baking RECIPE, `apple-blackberry-pie`:

   before:
   > The key to a good shortcrust pastry is keeping everything cold. Cold
   > fat, cold water, cold hands. Work quickly and stop mixing as soon as
   > the dough holds together. Overworking develops gluten and makes the
   > pastry tough rather than short.

   after:
   > The key to a good shortcrust pastry is keeping everything cold. Cold
   > fat, cold water, cold hands. Work quickly and stop mixing as soon as
   > the dough holds together. Overworking develops gluten and makes the
   > pastry tough rather than short.

2. mindset READING, `40-as-a-beginning`:

   before:
   > The forties get a bad press. The marketing version says the body
   > slows, the skin goes, the energy thins. The story sells creams and
   > clinics.

   after:
   > The forties get a bad press. The marketing version says the body
   > slows, the skin goes, the energy thins. The story sells creams and
   > clinics.

3. fibre-arts TECHNIQUE, `tapestry-weave-colour-blocking`:

   before:
   > Bold colour blocking requires a clear decision at every colour
   > boundary: will you use an interlocking join, a shared warp thread, or
   > a deliberate slit? Each option changes the cloth structure and the
   > look of the boundary. An interlocking join produces a slightly
   > blended edge. A shared-warp join gives a cleaner edge but a slightly
   > open structure. A slit gives the sharpest edge of all but must be
   > sewn closed before the tapestry can hang.

   after:
   > Bold colour blocking requires a clear decision at every colour
   > boundary: will you use an interlocking join, a shared warp thread, or
   > a deliberate slit? Each option changes the cloth structure and the
   > look of the boundary. An interlocking join produces a slightly
   > blended edge. A shared-warp join gives a cleaner edge but a slightly
   > open structure. A slit gives the sharpest edge of all but must be
   > sewn closed before the tapestry can hang.

## Category-by-category count

baking: 37, mindset: 20, fibre-arts: 18

## Content-type count

RECIPE: 37, PRACTICE: 17, TECHNIQUE: 8, PATTERN: 8, READING: 5

## Anything that surprised me

1. The entire batch was already in voice. runVoiceCheck reported 0 errors
   on all 75 files at the pre-rewrite export step. Apply ran cleanly with
   no rewrite needed on any file. This is the expected outcome at this
   stage of the retrofit: the autopilot author prompt with the
   2026-05-21 spec baked in produces content that lands in register from
   the start. The retrofit pass is closing the long tail of pre-spec
   content.

2. The PUBLISHED total has climbed from 3575 (batch20 read) to 3681, an
   increase of 106 across cooking, baking, mindset, and fibre-arts in the
   roughly two-hour gap between batches. This means the routine will not
   finish at "0 remaining" in a tidy one-shot way; new content keeps
   getting published, so the tail asymptotes rather than empties. Each
   fire still picks up the next 75 by slug ascending, and the retrofit
   marker stays per-row stable.

3. No word-count drops to flag. No body changed, so word counts are
   unchanged.

One-line forward read: 60 PUBLISHED tutorials remain with
voiceRetrofittedAt IS NULL after this fire.
