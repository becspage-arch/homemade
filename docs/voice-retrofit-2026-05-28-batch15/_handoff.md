Batch 2026-05-28-batch15: 75 tutorials retrofitted. Deploy green, healthz 200.

## Mandatory DB verification

### 1. audit-recent-state.ts output

```
CATEGORIES
ord | slug                  | status      | subs | last fire        | PUB    | DRAFT
  1 | cooking               | READY       |    2 | 2026-05-20 17:21 |   1139 |     0
  2 | baking                | READY       |    8 | 2026-05-20 13:33 |    573 |     0
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
  VERIFIED                     : 1219
```

(The "last fire" column was rendered with an em dash by the audit script for null timestamps. Replaced with "(none)" here to keep the hand-off free of em/en dashes.)

### 2. Voice retrofit progress

Before this fire (from check-voice-progress baseline): 3096 PUBLISHED with voiceRetrofittedAt set.
After this fire: 3171 PUBLISHED with voiceRetrofittedAt set.
Difference: 75. Matches the batch size.

Counts from check-voice-progress.ts after apply:

```
Done:      3171 of 3535  (90%)
Remaining: 364
Last retrofit:  Thu May 28 2026 14:41:05 GMT+0100 (British Summer Time)
Batches of 50 still to go: 8
```

### 3. Random spot-check

Random pick from batch: `shakshuka`.

DB row after apply:

```
slug:                shakshuka
category:            cooking
voiceRetrofittedAt:  2026-05-28T13:41:03.169Z
revisedFrom set:     true
URL:                 https://homemade.education/cooking/shakshuka
```

First body paragraph in DB after apply:

> The pan matters more than the recipe. Use a wide, lidded frying pan so the sauce is shallow enough to concentrate quickly and the eggs sit in it rather than floating. A 30 cm pan is about right for four eggs. The sauce should be reduced and thick before the eggs go in, if it is too loose, the whites will spread and the yolks will set before the whites are cooked through.

Live page check: `curl -sS -o /dev/null -w "%{http_code}" https://homemade.education/cooking/shakshuka` returned `200`. The site is currently behind the pre-launch splash gate so the public HTML for the tutorial URL serves the "coming soon" landing rather than the rendered tutorial. DB is canonical for this verification.

### 4. Full slug list (75)

- salted-edamame
- saltfish-fritters
- saltimbocca-alla-romana
- sausage-casserole
- sausage-roll
- scampi
- scotch-broth
- scotch-egg
- scotch-pie
- scottish-shortbread
- scrambled-eggs
- sea-bass-with-crispy-potatoes
- seed-bar
- self-saucing-chocolate-pudding
- selyodka-pod-shuboy
- seville-orange-marmalade
- shakshuka
- shark-and-bake
- shawarma-chicken
- shchi
- shepherds-pie
- shish-taouk
- shorbat-adas
- shortbread
- shoulder-of-lamb
- shrimp-and-grits
- sigara-boregi
- skordalia
- sledzie-w-oleju
- sloppy-joe
- sloppy-joe-s-pasta-bake
- slow-cooker-apple-crumble
- slow-cooker-bbq-chicken
- slow-cooker-bbq-chicken-wings
- slow-cooker-beef-and-ale-stew
- slow-cooker-beef-bourguignon
- slow-cooker-beef-brisket
- slow-cooker-beef-stew
- slow-cooker-beef-stew-dumplings
- slow-cooker-beef-stroganoff
- slow-cooker-bolognese-sauce
- slow-cooker-braised-steak-and-onions
- slow-cooker-butter-chicken
- slow-cooker-butternut-squash-soup
- slow-cooker-carrot-coriander-soup
- slow-cooker-cherry-cola-pulled-pork
- slow-cooker-chicken-cacciatore
- slow-cooker-chicken-curry
- slow-cooker-chicken-rice-soup
- slow-cooker-chicken-tikka-masala
- slow-cooker-chickpea-curry
- slow-cooker-chilli-con-carne
- slow-cooker-chinese-beef-and-broccoli
- slow-cooker-chocolate-pudding
- slow-cooker-coq-au-vin
- slow-cooker-gammon-glazed
- slow-cooker-ham-in-cola
- slow-cooker-honey-mustard-chicken
- slow-cooker-irish-stew
- slow-cooker-italian-beef-ragu
- slow-cooker-italian-chicken-pasta
- slow-cooker-korean-beef
- slow-cooker-lamb-curry
- slow-cooker-lamb-rogan-josh
- slow-cooker-lamb-shanks
- slow-cooker-lamb-shanks-red-wine
- slow-cooker-lamb-shoulder
- slow-cooker-lentil-bolognese
- slow-cooker-lentil-chilli
- slow-cooker-macaroni-cheese
- slow-cooker-moroccan-chicken-olives
- slow-cooker-moroccan-lamb-tagine
- slow-cooker-mushroom-stroganoff
- slow-cooker-pea-and-ham-soup
- slow-cooker-pork-belly-braised

## Sample public URLs

- https://homemade.education/cooking/scotch-broth
- https://homemade.education/cooking/shakshuka
- https://homemade.education/cooking/shrimp-and-grits
- https://homemade.education/cooking/sigara-boregi
- https://homemade.education/cooking/skordalia
- https://homemade.education/cooking/sloppy-joe
- https://homemade.education/cooking/slow-cooker-chicken-tikka-masala
- https://homemade.education/cooking/slow-cooker-italian-beef-ragu

## Before / after excerpts

All three are from the cooking category (the batch is one content type).

### scotch-broth (Mrs Beeton + Eliza Acton in body)

Before:
> Scotch broth has been made in Scotland for centuries, appearing in household accounts and cookery books from the eighteenth century onward. Mrs Beeton included it as a standard British soup in 1861, and Eliza Acton noted the barley as the defining element that distinguished it from English mutton broth.

After:
> Scotch broth has been made in Scotland for centuries. It appears in household accounts and cookery books from the eighteenth century onward, listed as a standard British soup by Victorian writers who saw the barley as the element that set it apart from English mutton broth.

(The Beeton and Acton names plus the year 1861 are still cited in `sourceNotes` so the provenance is preserved on the public Sources block.)

### shrimp-and-grits (grade 17.1 to grade about 9)

Before:
> Shrimp and grits is a dish of the South Carolina and Georgia Lowcountry, where the tidal marshes and estuaries have supplied abundant shrimp to local cooking for centuries and where hominy grits (made from dried, alkaline-treated corn) have been a staple since Native American times.

After:
> Shrimp and grits is a dish of the South Carolina and Georgia Lowcountry. The tidal marshes and estuaries there have supplied shrimp to local cooking for centuries. Hominy grits, made from dried corn treated with lye, have been a staple since Native American times.

### sigara-boregi (grade 17.2 to grade about 8)

Before:
> Börek (pastry made with thin layers of yufka or filo, filled with cheese, meat, or vegetables) is one of the foundational preparations of Ottoman palace cooking and spread with the Ottoman empire across Southeastern Europe, the Levant, and North Africa.

After:
> Börek is pastry made with thin layers of yufka or filo and filled with cheese, meat, or vegetables. It is one of the core preparations of Ottoman palace cooking. It spread with the Ottoman empire across Southeastern Europe, the Levant, and North Africa.

## Category-by-category count

cooking: 75

## Notes / surprises

- 60 of the 75 picked tutorials passed voice-check cleanly on first export. Only 15 needed rewriting. The autopilot author prompt is still working; recent cooking content lands in voice already.
- Failure modes for the 15 that needed work:
  - 12 files had a single closing "where this dish lives" paragraph at grade 12 to 17 with long erudite sentences and multi-syllable vocabulary. The cooking authoring picks up academic register on the historical close more readily than anywhere else in the body.
  - 1 file (scotch-broth) carried Mrs Beeton, Beeton, and Eliza Acton in the historical close. Names removed from body and replaced with "Victorian writers"; the citations were already in `sourceNotes` so no source data lost.
  - 4 troubleshooter fields (across scotch-broth, skordalia, and sloppy-joe) had a single long sentence at grade 12 to 14. Broken into shorter sentences each.
  - 2 step-list paragraphs (sea-bass-with-crispy-potatoes, slow-cooker-italian-beef-ragu) had compound 25 to 40 word steps. Broken into 2 to 3 shorter steps each.
  - 1 file (slow-cooker-chicken-tikka-masala) had a paragraph[0] technical note at grade 12.5. Simplified to two short sentences.
- One pre-existing en dash in `saltfish-fritters.json` recipe.yieldDescription ("12-14 fritters") was replaced with "12 to 14 fritters" in the file to keep the batch grep-clean. The apply script does not write `yieldDescription`, so the field in the DB row remains untouched.
- No word-count drops over 20% on any file.
- No tutorial in the batch touched a Mindset verbatim text (the batch is one content type, cooking-only).
- No image / hero media files touched.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 364.
