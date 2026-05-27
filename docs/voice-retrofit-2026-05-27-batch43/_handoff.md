Batch 2026-05-27-batch43: 57 tutorials retrofitted. Deploy green, healthz 200.

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

(The audit "last fire" column emits dash placeholders for categories that have not autopiloted; rendered as `n/a` to keep this hand-off em-dash-clean.)

## Voice retrofit progress

- Before this fire: 2239 PUBLISHED tutorials with voiceRetrofittedAt set.
- After this fire: 2296 PUBLISHED tutorials with voiceRetrofittedAt set.
- Remaining: 1239 PUBLISHED tutorials with voiceRetrofittedAt IS NULL.
- Delta: 57. The batch picked 63 candidates; 6 were removed before apply because they carry verbatim EFT setup or tapping-script statements that fail the grade-level rule (see Blocked section below). Counts match expected delta.

## Spot-check (one slug from batch, picked deterministically)

- slug: pita-bread-homemade
- voiceRetrofittedAt: 2026-05-27T22:49:26.108Z
- url: https://homemade.education/baking/pita-bread-homemade (site behind splash gate; anonymous traffic lands on /coming-soon, so body is not visible to a public curl. DB content confirmed via direct query.)
- first paragraph (from DB):

> The pita's pocket forms in a blast of heat. The oven must be as hot as it will go and the baking tray must be preheated with it. When the pita goes onto the hot surface, the extreme heat causes rapid steam production inside the dough, this is the  pocketing  moment. A lukewarm tray will produce flat, unpocketed pita. They still taste the same, but the pocket is the reason to make them at home.

## Sample public URLs across categories covered

- https://homemade.education/cooking/gulyasleves
- https://homemade.education/cooking/greek-roast-lamb
- https://homemade.education/cooking/granola
- https://homemade.education/cooking/grilled-cheese
- https://homemade.education/baking/plum-frangipane-tart
- https://homemade.education/baking/plain-shortbread-fingers
- https://homemade.education/baking/pork-pie-hot-water-crust
- https://homemade.education/baking/pita-bread-homemade
- https://homemade.education/mindset/tapping-for-the-doubted-intuition
- https://homemade.education/mindset/tapping-for-the-friendship-drought
- https://homemade.education/mindset/tapping-for-the-feast-or-famine-swing

## Before / after excerpts (three slugs)

### gulyasleves (cooking, RECIPE), paragraph[11]

BEFORE:
> Gulyásleves is Hungarian peasant food in the most direct sense: a meal made by herdsmen from the cattle they drove across the puszta, cooked in a cauldron over an open fire, eaten with bread. The modern version is a domestic soup, made in a saucepan on a kitchen hob, but the principle is the same: beef, paprika, and time. It is the most internationally recognisable Hungarian dish, served in Hungarian restaurants from Budapest to Buenos Aires, and it is made better at home than in almost any of them.

AFTER:
> Gulyásleves is Hungarian peasant food in the most direct sense. Herdsmen made it from the cattle they drove across the puszta. It was cooked in a cauldron over an open fire, eaten with bread. The modern version is a home soup, made in a saucepan on the hob. The idea is the same: beef, paprika, and time. It is the best-known Hungarian dish abroad. You can order it in Hungarian restaurants from Budapest to Buenos Aires. It is made better at home than in most of them.

(Three colon-and-comma-stacked compound sentences split into eight short ones. Grade 13.7 down to under 12.)

### plum-frangipane-tart (baking, RECIPE), paragraph[0]

BEFORE:
> A plum frangipane tart is built in three layers: a blind-baked sweet shortcrust shell, a frangipane filling (almond cream of butter, sugar, eggs, ground almonds and a little flour), and quartered plums pressed cut-side up into the frangipane before baking. The plums sink slightly into the cream and stain it with their juice; the surface darkens to deep gold as the bake finishes.

AFTER:
> A plum frangipane tart has three layers. First a blind-baked sweet shortcrust shell. Then a frangipane filling, which is an almond cream made of butter, sugar, eggs, ground almonds and a little flour. Then quartered plums pressed cut-side up into the cream before it goes in the oven. The plums sink slightly into the cream and stain it with their juice. The surface darkens to deep gold as the tart bakes.

(Single-sentence three-layer enumeration split into a label sentence plus three short layer sentences. Grade 13.0 down to under 12.)

### tapping-for-the-doubted-intuition (mindset, PRACTICE), paragraph[0]

BEFORE:
> A five-minute EFT tapping practice for rebuilding trust in your own intuition. The script works through the habit of overriding inner sense, the conditioning that says gut feelings are unreliable, and moves toward treating intuitive information as data worth taking seriously.

AFTER:
> A five-minute EFT tapping practice for rebuilding trust in your own gut sense. The script works through the habit of talking yourself out of what you knew. It moves toward treating your inner signals as real information worth listening to.

(One long compound second sentence split into two short declaratives. "intuition" → "gut sense"; "conditioning that says gut feelings are unreliable" → "talking yourself out of what you knew"; "intuitive information as data worth taking seriously" → "your inner signals as real information worth listening to". Grade 13.4 down to under 12.)

## Category breakdown (applied to DB)

cooking: 21, baking: 21, mindset: 15. Total 57.

(Mindset count is 15 not 21 because 6 mindset bodies were removed before apply by the verbatim-energy-statements rule; see Blocked section below.)

## Content-type breakdown

RECIPE: 42, PRACTICE: 15. Total 57.

(Beyond the first three batches, the brief requires only category spread; content-type spread is no longer mandated. Recorded for visibility.)

## Blocked: 6 verbatim EFT setup or tapping-script statements

Six mindset tutorials were picked but removed from the apply set because their bulletList rounds contain verbatim EFT setup statements ("Even though [X], I deeply and completely accept myself" or close variants) or verbatim tapping-point script phrases taken from Rebecca's published programs. Per the verbatim-energy-statements rule, these lines may not be rewritten.

Blocked files moved to docs/voice-retrofit-2026-05-27-batch43/_blocked/ so the apply step skipped them. The `_` directory-name prefix matches the apply script's readdir filter.

Blocked slugs:

- tapping-for-pleasure-guilt
  - bulletList[8] listItem[5]: "Collarbone: The difficulty of letting something feel good without immediately pulling away." (grade 15.6, tapping-point script line)
  - Also paragraph[0] at grade 12.6, but the script line is the unfixable blocker.
- tapping-for-safety-in-stillness
  - bulletList[4] listItem[0]: "Even though stillness feels uncomfortable and unsafe, I deeply and completely accept myself." (grade 13.1)
  - Also paragraph[11] at grade 20.8.
- tapping-for-safety-receiving-a-big-sum
  - bulletList[4] listItem[1]: "Even though receiving large amounts feels overwhelming, I deeply and completely accept myself." (grade 13.1)
- tapping-for-self-forgiveness
  - bulletList[5] listItem[2]: "Even though forgiving myself feels like letting myself off too easily, I am open to the possibility that I am allowed to continue." (grade 13.4)
- tapping-for-spotting-profitable-ideas
  - bulletList[4] listItem[1]: "Even though I doubt my ability to spot opportunities, I deeply and completely accept myself." (grade 13.1)
- tapping-for-stillness-without-dread
  - bulletList[4] listItem[0]: "Even though calm has felt unfamiliar and even a little dangerous, I deeply and completely accept myself." (grade 12.6)

The accumulated known-blocked list (slugs that fail this rule on every retry) now stands at 17 across batches 40 to 43. The voice-check needs an exemption (treat EFT setup-statement bullets and tapping-point script lines in mindset practices as exempt from the grade-level check) before any further batch picks any of these slugs again. The current pick script excludes the list to avoid wasted work; that list will keep growing each batch until the rule is amended.

## Notable rewrites (agents flagged)

- goose-fat-roast-potatoes (cooking): paragraph[13] kept the kitchen substance ("the method has not changed in principle since the mid-19th century") but moved the Mrs Beeton 1860s citation to sourceNotes. One troubleshooter fix line had a "genuinely floury" wording the voice-check did not catch; reworded to "floury and rough" on touch to honour the banned-fillers rule.
- plain-shortbread-fingers (baking): paragraph[22] reworded to drop the Beeton 1861 and Florence White 1932 named citations; sourceNotes already carried both. Troubleshooter[18][1].cause reworded to lower grade. Recipe.servings set to null in favour of yieldDescription "16 fingers (20 cm square tin)" because the yield is a discrete-item count.
- pork-pie-hot-water-crust (baking): the 50-word warning-tone food-safety infoPanel was deleted. The relevant 75 C meat-thermometer line was already present inline in the Bake step, so no inline insertion was needed; the dedicated panel was redundant.
- tapping-for-the-family-money-story-i-inherited (mindset): the "Adapted from Day 8 of MONEY..." attribution paragraph (paragraph[11]) and its preceding "Where this practice comes from" H2 heading (heading[10]) were both removed. Same redundancy pattern flagged by batch41 and batch42: the public renderer surfaces sourceNotes as a Sources block, so the in-body duplicate was redundant academic-register prose. Substance retained at page foot.
- tapping-for-the-feast-or-famine-swing (mindset): same attribution-removal pattern. paragraph[13] "Adapted from Day 4 of MONEY..." plus preceding heading[12] removed. The "level pool" link paragraph (paragraph[11]) was rewritten in place to lower grade.
- No file lost over 20% of substantive word count. Removals were duplicate-of-sourceNotes provenance paragraphs, the food-safety infoPanel that duplicated an inline step, and historical citations migrated to sourceNotes.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 1239.
