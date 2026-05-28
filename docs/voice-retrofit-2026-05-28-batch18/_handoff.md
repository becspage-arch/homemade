Batch 2026-05-28-batch18: 75 tutorials retrofitted. Deploy pending verification.

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

(The "last fire" column rendered with em dashes by the audit script for null timestamps. Replaced with "(none)" here to keep the hand-off free of em or en dashes.)

Total PUBLISHED unchanged at 3574 between batch17 and batch18, so autopilot has not added new rows in the gap.

### 2. Voice retrofit progress

Before this fire (carried from batch17 hand-off): 3321 PUBLISHED with voiceRetrofittedAt set.
After this fire: 3396 PUBLISHED with voiceRetrofittedAt set.
Difference: 75. Matches the batch size.

Counts from check-voice-progress.ts after apply:

```
Done:      3396 of 3574  (95%)
Remaining: 178
Last retrofit:  Thu May 28 2026 17:23:59 GMT+0100 (British Summer Time)
Batches of 50 still to go: 4
```

### 3. Random spot-check

Random pick from batch: `baklava-almond`.

DB row after apply:

```
slug:                baklava-almond
category:            baking
voiceRetrofittedAt:  2026-05-28T16:23:56.404Z
revisedFrom set:     true
URL:                 https://homemade.education/baking/baklava-almond
```

Opening paragraph in DB after apply:

> Cut the baklava into diamonds before it goes in the oven, all the way through to the base, so the syrup can soak into the layers. Timing the syrup correctly is the other key: pour hot syrup over hot baklava the moment it comes out, then leave it alone to cool for at least 2 hours.

Live page check: the site is currently behind the pre-launch splash gate, so the public HTML for tutorial URLs serves the "coming soon" landing rather than the rendered tutorial. DB is canonical for this verification.

### 4. Full slug list (75)

- apple-crumble-pie
- apple-fritters
- baklava-almond
- banana-fritters
- banbury-cake
- berliner-jam-doughnut
- boston-brown-bread
- cassata-siciliana
- challah-round-rosh-hashanah
- cherry-strudel
- chocolate-crackle-rice-krispie
- cookie-bars-chocolate-chip
- cornish-biscuits-currant
- croquembouche
- crostata-di-nutella
- crostata-di-ricotta
- danish-pastry-raspberry
- doughnut-holes
- dream-bars-toffee-coconut
- funnel-cake
- gingerbread-house
- gluten-free-chocolate-cake
- gluten-free-chocolate-chip-cookies
- hand-pies-sour-cherry
- iced-biscuits-decorated
- kataifi-birds-nest
- krantz-cake
- paczki-polish-doughnut
- pain-au-lait
- pane-pugliese
- roggenbrot
- schiacciata-alluva
- sourdough-discard-waffles
- taiwanese-pineapple-bun
- treacle-soda-bread
- tuna-pasta-salad
- tunisian-fish-couscous
- tunisian-tajine
- two-voices-on-the-same-budget-activity
- tzatziki
- ultimate-gingerbread
- ultimate-spaghetti-carbonara
- vaca-frita
- vanessa-s-quiche
- vanilla-ice-cream
- vareniki
- veal-paprikash
- vegan-cinnamon-doughnuts
- vegan-cottage-pie
- vegan-flapjacks
- vegan-mac-cheese
- vegan-peanut-butter-cookies
- vegan-wellington
- vegetable-biryani
- vegetable-frittata
- vegetable-samosa
- vegetable-tagine-moroccan
- vegetarian-kedgeree
- vegetarian-mulligatawny
- vegetarian-sausage-roll
- vegetarian-shepherds-pie
- vegetarian-wellington
- veggie-full-english
- vepro-knedlo-zelo
- vichyssoise
- vinaigrette-salad
- vindaloo
- vindaloo-chicken
- vinegret
- visible-is-safe-visible-is-allowed
- visualise-the-sleep-space
- waffles
- waldorf-salad
- walking-into-the-room-wearing-the-thing-you-bought-yourself
- wanting-wealth-is-allowed

## Sample public URLs

- https://homemade.education/baking/baklava-almond
- https://homemade.education/baking/croquembouche
- https://homemade.education/baking/gingerbread-house
- https://homemade.education/baking/sourdough-discard-waffles
- https://homemade.education/cooking/vaca-frita
- https://homemade.education/cooking/veal-paprikash
- https://homemade.education/cooking/vichyssoise
- https://homemade.education/cooking/vegetarian-mulligatawny
- https://homemade.education/mindset/visible-is-safe-visible-is-allowed
- https://homemade.education/mindset/visualise-the-sleep-space

## Before / after excerpts

Two cooking, one mindset. Four lines each (old / new).

### vaca-frita (orientation, grade 12.8 to about 7)

Before:
> Vaca frita works on a simple principle: boil the beef until it can be shredded easily, then fry the shredded strands as hard as possible until they are crisp and dark at the edges. The two-stage process takes patience but the result is crunchy beef with caramelised edges and tender interior fibres, one of the better things in Cuban cooking.

After:
> Vaca frita works in two steps. Boil the beef until it pulls apart in shreds. Then fry the shreds hard until they are crisp and dark at the edges. The two steps take patience. The result is crunchy beef with caramelised edges and tender meat inside, one of the best things in Cuban cooking.

### veal-paprikash (closing history, grade 16.1 to about 9)

Before:
> Paprikás is one of the definitive preparations of the Hungarian kitchen, built around the country's most important spice export. The sweet paprika grown around Kalocsa and Szeged in southern Hungary has a gentle, rounded fruitiness distinct from the smoked Spanish variety. Veal paprikash appears on the menus of the grand old restaurants of Budapest (Gundel especially) but it is also a straightforward family dish, cooked throughout the week across central Hungary and in the Hungarian diaspora communities of Slovakia, Romania, and Austria.

After:
> Paprikás is one of the core dishes of the Hungarian kitchen. It is built around the country's most important spice export. The sweet paprika grown around Kalocsa and Szeged in southern Hungary has a gentle, rounded fruitiness, different from the smoked Spanish kind. Veal paprikash sits on the menus of the grand old Budapest restaurants (Gundel especially), but it is also an everyday family dish. It is cooked through the week across central Hungary and in the Hungarian communities of Slovakia, Romania, and Austria.

### walking-into-the-room-wearing-the-thing-you-bought-yourself (mindset orientation, grade 14.1 to about 8)

Before:
> A five-minute visualisation for practising financial visibility in a safe imagined space. The image is simple: you, walking into a room, wearing or carrying something you bought without apology, feeling easy about it.

After:
> A five-minute visualisation for working with money visibility, in a safe imagined space. The image is simple. You walk into a room. You wear or carry something you bought without apology. You feel easy about it.

## Category-by-category count

baking: 36, cooking: 34, mindset: 5

## Notes / surprises

- 53 of 75 picked tutorials passed voice-check cleanly on first export. 22 needed rewriting. Similar split to recent batches (38 / 37 in batch17, 40 / 35 in batch16).
- Failure modes:
  - 18 files had a single closing "Where this dish lives" or "Where this practice comes from" paragraph at grade 12 to 18. The cooking and mindset authors still pick up academic register on the closing context paragraph more readily than anywhere else in the body. Same pattern as previous batches.
  - 1 file (vegetarian-kedgeree) carried "Beeton" in body prose with no gloss token. The reference stays in body (the dish history reads naturally with it) but now reads "the Victorian household manual by Mrs Beeton" so the gloss heuristic catches it. A second Beeton mention in the same file already passed the heuristic via the surrounding "cookery manuals" wording.
  - 1 file (vichyssoise) carried a "Before you start" H2 at the top of the body. The voice-check rule treats that exact heading as a safety-advice section, even though the paragraph under it was orientation (chilling and sieving guidance, not safety). The heading was removed; the paragraph stands as the opening orientation, with one small word swap ("characteristic pale, satiny consistency" to "pale, satiny finish").
  - 1 file (vegetarian-kedgeree) tripped year-in-body after the first-pass rewrite, because the rewrite kept "(1861)" next to Mrs Beeton. Second pass dropped the parens-year reference: the surrounding text already conveys "Victorian" and "cookery manual", so the year carried no extra information for the reader.
- Pre-existing em or en dashes were found in 1 metadata field: the vegetarian-kedgeree subtitle ("Curried rice with eggs, parsley, and lemon EM-DASH the meat-free Raj breakfast."). Replaced with a colon. The apply script writes subtitle to DB, so the fix lands in production. No em or en dashes in any body or commit text.
- No word-count drops over 20% on any file. The largest drop was on vegetarian-mulligatawny p[11] (107 words to 96 words, about 10%), where the rewrite restructured "reclaims something of the original Tamil pepper-water tradition, which was meatless and intended as a digestive, before it was enriched and Anglicised into the thick soup familiar today" into shorter sentences without losing the substance.
- No Mindset verbatim text touched. All affirmations, energy alignment / release statements, and tapping scripts live in pullQuote nodes which were not edited. Edits only touched prose paragraphs around the verbatim blocks. visible-is-safe-visible-is-allowed is a Day 18 MONEY affirmation page; only the surrounding intro prose was rewritten, not the affirmation lines themselves.
- No image / hero media files touched.
- No troubleshooter symptom or cause fields were edited. One troubleshooter fix on waffles tripped grade-level and was shortened.
- The grade-level threshold is sensitive at 12.0. Two files (vegetarian-mulligatawny, vinaigrette-salad) needed a second pass because the first pass landed at 13.0 and 14.9. Breaking long sentences into shorter ones is the reliable lever; vocabulary swaps alone are not enough when sentence length is the main driver.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 178.
