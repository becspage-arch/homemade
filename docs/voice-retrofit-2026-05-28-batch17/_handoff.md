Batch 2026-05-28-batch17: 75 tutorials retrofitted. Deploy green, healthz 200.

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

(The "last fire" column was rendered with an em dash by the audit script for null timestamps. Replaced with "(none)" here to keep the hand-off free of em/en dashes.)

Total PUBLISHED grew from 3535 (end of batch16) to 3574 here (+39), so autopilot has added rows in the gap between the two fires. The voice-retrofit picker is still drawing only from voiceRetrofittedAt IS NULL, so those new rows now sit in the forward read along with the older untouched ones.

### 2. Voice retrofit progress

Before this fire (carried from batch16 hand-off): 3246 PUBLISHED with voiceRetrofittedAt set.
After this fire (from check-voice-progress.ts): 3321 PUBLISHED with voiceRetrofittedAt set.
Difference: 75. Matches the batch size.

Counts from check-voice-progress.ts after apply:

```
Done:      3321 of 3574  (93%)
Remaining: 253
Last retrofit:  Thu May 28 2026 16:44:38 GMT+0100 (British Summer Time)
Batches of 50 still to go: 6
```

### 3. Random spot-check

Random pick from batch: `tagine-of-lamb-with-prunes-and-almonds`.

DB row after apply:

```
slug:                tagine-of-lamb-with-prunes-and-almonds
category:            cooking
voiceRetrofittedAt:  2026-05-28T15:44:35.880Z
revisedFrom set:     true
URL:                 https://homemade.education/cooking/tagine-of-lamb-with-prunes-and-almonds
```

Closing "Where this dish lives" paragraph in DB after apply (the section the retrofit rewrote):

> Lamb with sweet spices and dried fruit is one of the oldest dishes in North African and Middle Eastern cooking. In Morocco it is most linked to the mrouzia, a feast dish eaten after Eid al-Adha, when lamb is plentiful and the cooking takes a full slow day. The everyday version, cooked with prunes and honey for two hours rather than four or five, is a home staple in cities like Fez and Marrakech. The almonds are not decoration. They are part of the dish, giving a crunch the slow-cooked sauce and fruit cannot.

Live page check: the site is currently behind the pre-launch splash gate, so the public HTML for tutorial URLs serves the "coming soon" landing rather than the rendered tutorial. DB is canonical for this verification.

### 4. Full slug list (75)

- stroganina
- stuffed-bell-peppers
- stuffed-vine-leaves
- summer-pudding
- surowka-z-kapusty
- svickova-na-smetane
- sweet-potato-soup
- syllabub-lemon
- ta-ameya
- tabbouleh
- tagine-of-chicken-with-preserved-lemon-and-olives
- tagine-of-lamb-with-prunes-and-almonds
- tagliatelle-ai-funghi
- tagliatelle-al-ragu-bolognese
- tagliatelle-with-spinach-mascarpone-and-parmesan
- tahdig
- taktouka
- tandoori-chicken
- taramasalata
- tarhonya
- tarka-dal
- tarka-dhal
- tartiflette
- teriyaki-mushroom-rice-bowls
- the-story-that-says-property-is-not-for-me-journal
- the-sunday-money-date-ritual
- the-sunday-slow-morning-ritual
- the-sunday-wind-up-ritual
- the-switch-flicking-off
- the-ten-minute-reclaim-touched-out
- the-to-do-list-parked-outside-the-bedroom-door
- the-trust-and-stability-ceremony
- the-tuesday-that-feels-like-a-holiday-visualisation
- the-two-equal-doors-visualisation
- the-two-minute-money-minute
- the-unshakable-money-trust-ritual
- the-vagus-nerve-as-a-calm-rope-down-your-spine
- the-walk-by-drive-past-the-house-you-want
- the-wealth-alignment-practice
- the-wealth-alignment-practice-ritual
- the-wealth-identity-embodiment
- the-wealth-structure-that-holds-it-safe-visualisation
- the-wealthy-lineage-starts-here
- the-week-ahead-arriving-easier-than-expected
- the-weekly-giving-gesture-activity
- the-woman-who-has-it-and-is-still-her-visualisation
- the-woman-with-money-and-desire-visualisation
- the-zone-the-sway-allowing-releasing-rebeccas-four-anchors
- their-fight-made-my-ease-possible
- there-is-enough-now
- this-is-mine-to-hold
- this-will-pass-i-am-safe
- three-breath-reset-before-opening-bills
- three-daily-anchors
- three-habits-wealthy-me-already-has-journal
- three-income-streams-ive-never-tried-journal
- tiramisu
- tirokafteri
- tiropita
- toad-in-the-hole
- today-my-body-is-allowed-to-be-exactly-as-it-is
- toltott-kaposzta
- tomato-soup
- topside-roast
- tortilla-espanola
- tostones
- track-every-pound-coming-in-for-a-week
- tracking-is-intimacy-with-my-money
- treacle-sponge-pudding
- trini-tomato-choka
- trofie-al-pesto
- trout-meuniere
- truite-aux-amandes
- trust-the-timing-breath-practice
- tuesday-morning-with-the-money-already-in

## Sample public URLs

- https://homemade.education/cooking/stroganina
- https://homemade.education/cooking/syllabub-lemon
- https://homemade.education/cooking/tagine-of-lamb-with-prunes-and-almonds
- https://homemade.education/cooking/tagliatelle-al-ragu-bolognese
- https://homemade.education/cooking/tandoori-chicken
- https://homemade.education/cooking/toad-in-the-hole
- https://homemade.education/cooking/treacle-sponge-pudding
- https://homemade.education/mindset/the-sunday-money-date-ritual
- https://homemade.education/mindset/the-vagus-nerve-as-a-calm-rope-down-your-spine
- https://homemade.education/mindset/three-daily-anchors

## Before / after excerpts

Two cooking, one mindset. Four lines each (old / new).

### tagine-of-lamb-with-prunes-and-almonds (closing history, grade 12.3 to about 8)

Before:
> The combination of lamb with sweet spices and dried fruit is one of the oldest preparations in North African and Middle Eastern cooking. In Morocco it is most associated with the mrouzia, a festive dish eaten after Eid al-Adha, when lamb is abundant and the cooking is done slowly over a full day. The everyday version, cooked with prunes and honey over two hours rather than four or five, is a home staple particularly in the cities of Fez and Marrakech.

After:
> Lamb with sweet spices and dried fruit is one of the oldest dishes in North African and Middle Eastern cooking. In Morocco it is most linked to the mrouzia, a feast dish eaten after Eid al-Adha, when lamb is plentiful and the cooking takes a full slow day. The everyday version, cooked with prunes and honey for two hours rather than four or five, is a home staple in cities like Fez and Marrakech.

### syllabub-lemon (closing history, Beeton + grade flag)

Before:
> Syllabub is one of the oldest English desserts with a continuous culinary history. Early versions from the sixteenth and seventeenth centuries were warm drinks, cream poured directly from a height into a bowl of spiced wine, with the frothy head drunk separately. By the eighteenth century, the whipped version had become the standard form: cream whipped with wine and lemon and served cold in glasses. Mrs Beeton included the dish in her household management guides.

After:
> Syllabub is one of the oldest English desserts with a continuous history. Early versions from the sixteenth and seventeenth centuries were warm drinks. Cream was poured from a height into a bowl of spiced wine, and the frothy head was drunk on its own. By the eighteenth century the whipped version had become standard: cream whipped with wine and lemon and served cold in glasses. The Victorian household manual by Mrs Beeton recorded the dish.

### the-wealth-alignment-practice-ritual (orientation, grade 12.7 to about 8)

Before:
> A five-step ritual for anchoring wealth as a natural rhythm in daily life. The ritual moves through preparation, release, allow, integration, and anchor, five steps that take the body and mind from whatever is present to a clear, grounded sense of alignment between daily action and abundance.

After:
> A five-step ritual for setting wealth as a steady rhythm in daily life. The five steps are prepare, release, allow, integrate, and anchor. Together they take the body and mind from whatever is here now to a clear, grounded sense that your daily actions and your abundance line up.

## Category-by-category count

cooking: 38, mindset: 37

## Notes / surprises

- 38 of 75 picked tutorials passed voice-check cleanly on first export. 37 needed rewriting. Roughly the same split as batch16 (40 clean / 35 dirty).
- Failure modes:
  - 30 files had a single closing "Where this dish lives" or "Where this practice comes from" paragraph at grade 12 to 20. The cooking and mindset authors both still pick up academic register on the closing context paragraph more readily than anywhere else in the body.
  - 4 files (syllabub-lemon, toad-in-the-hole, tomato-soup, treacle-sponge-pudding) carried "Mrs Beeton" in body prose without a plain-English gloss. The voice-check historical-figure rule now flags this. The references stay in body (the dish history reads naturally with them) but each now reads "the Victorian household manual by Mrs Beeton" so the gloss heuristic catches it.
  - 1 file (tagliatelle-ai-funghi) carried a "Before you start" H2 at the top of the body. The voice-check rule treats that exact heading as a safety-advice section. The heading was removed; the following paragraph stands as the opening orientation.
  - stroganina had three separate grade-level flags across method, troubleshooter fix, and history paragraph. Each was broken into shorter sentences with plainer vocabulary. Substance unchanged.
  - treacle-sponge-pudding had four flags (orientation grade, two Beeton references, method-step grade, closing-history grade). Method step's middle text was split by a techniqueLink mark, which made the edit fiddly but each text node was rewritten individually keeping the technique link intact.
- Pre-existing em or en dashes were found in 2 metadata fields (1 title on trust-the-timing-breath-practice and 1 subtitle on stuffed-vine-leaves). Both replaced with commas. The apply script writes subtitle to DB so the stuffed-vine-leaves subtitle update lands in production; titles are not written by the apply script so the trust-the-timing title update only affects the batch file. `_pick-summary.json` also carried the same trust-the-timing title em-dash, replaced with a comma to keep the directory grep-clean.
- No word-count drops over 20% on any file.
- No Mindset verbatim text touched. All affirmations, energy alignment / release statements, and tapping scripts live in pullQuote nodes which were not edited. Edits only touched prose paragraphs around the verbatim blocks.
- No image / hero media files touched.
- No troubleshooter fix or symptom fields were edited apart from the one stroganina fix that tripped grade-level.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 253.
