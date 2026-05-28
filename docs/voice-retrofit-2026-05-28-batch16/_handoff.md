Batch 2026-05-28-batch16: 75 tutorials retrofitted. Deploy green, healthz 200.

## Mandatory DB verification

### 1. audit-recent-state.ts output

```
CATEGORIES
ord | slug                  | status      | subs | last fire        | PUB    | DRAFT
  1 | cooking               | READY       |    2 | 2026-05-20 17:21 |   1139 |     0
  2 | baking                | READY       |    8 | 2026-05-28 14:28 |    573 |     0
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

Before this fire (from check-voice-progress baseline): 3171 PUBLISHED with voiceRetrofittedAt set.
After this fire: 3246 PUBLISHED with voiceRetrofittedAt set.
Difference: 75. Matches the batch size.

Counts from check-voice-progress.ts after apply:

```
Done:      3246 of 3535  (92%)
Remaining: 289
Last retrofit:  Thu May 28 2026 15:49:13 GMT+0100 (British Summer Time)
Batches of 50 still to go: 6
```

### 3. Random spot-check

Random pick from batch: `sticky-toffee-pudding`.

DB row after apply:

```
slug:                sticky-toffee-pudding
category:            cooking
voiceRetrofittedAt:  2026-05-28T14:49:12.743Z
revisedFrom set:     true
URL:                 https://homemade.education/cooking/sticky-toffee-pudding
```

First body paragraph in DB after apply:

> The dates are the whole point. Medjool dates give a deeper, jammy result than the small dried variety, but either works. The bicarbonate of soda isn't there to leaven the sponge in the conventional sense, it softens the date flesh and darkens the soaking liquid so it dissolves into the batter with almost no resistance. Leave out the bicarbonate and the dates stay in identifiable pieces; use it and the result is a uniformly dark, moist sponge throughout.

Live page check: the site is currently behind the pre-launch splash gate, so the public HTML for tutorial URLs serves the "coming soon" landing rather than the rendered tutorial. DB is canonical for this verification.

### 4. Full slug list (75)

- slow-cooker-pot-roast
- slow-cooker-pot-roast-beef
- slow-cooker-pulled-bbq-chicken
- slow-cooker-pulled-pork
- slow-cooker-rice-pudding
- slow-cooker-sausage-casserole
- slow-cooker-teriyaki-chicken
- slow-cooker-tomato-soup
- slow-cooker-vegetable-curry
- slow-cooker-vegetable-soup
- slow-cooker-welsh-lamb-hotpot
- slow-cooker-whole-roast-chicken
- slow-roast-shoulder-of-lamb
- smazeny-syr
- smoked-haddock-and-leek-pie
- smoked-haddock-chowder
- smoked-salmon-rolls
- smoky-lamb-and-chickpea-stew
- soft-and-chewy-oatmeal-raisin-cookies
- soft-chewy-chocolate-chip-cookies
- sole-meuniere
- solyanka
- sopa-de-ajo
- sorrel-drink
- soupe-a-loignon
- soupe-au-pistou
- sour-gummies
- southern-fried-chicken
- soutzoukakia
- souvlaki-chicken
- souvlaki-lamb
- souvlaki-pork
- spaghetti-aglio-e-olio
- spaghetti-aglio-olio
- spaghetti-aglio-olio-e-peperoncino
- spaghetti-al-limone
- spaghetti-al-pomodoro
- spaghetti-al-tonno
- spaghetti-alla-carbonara
- spaghetti-alla-gricia
- spaghetti-alla-nerano
- spaghetti-alla-norma
- spaghetti-alla-puttanesca
- spaghetti-alle-cozze
- spaghetti-alle-vongole
- spaghetti-and-meatballs
- spaghetti-bolognaise
- spaghetti-carbonara
- spanakopita
- spiced-red-cabbage
- spinach-and-feta-pinwheels
- spinach-bacon-salad
- spinach-quiche
- spotted-dick
- steak-and-ale-pie
- steak-and-kidney-pie
- steak-and-kidney-pudding
- steak-and-mushroom-pie
- steak-au-poivre
- steak-frites
- steak-tartare
- stew-chicken-trinidad
- stew-peas-jamaican
- stewed-fruit-compote
- stewed-pears-ice-cream
- sticky-toffee-pudding
- stifado
- stovetop-rice-pudding
- stovies
- strawberry-banana-smoothie
- strawberry-cheesecake-overnight-oats
- strawberry-fool
- strawberry-jam
- strawberry-jam-open-pan-method
- street-corn-salad

## Sample public URLs

- https://homemade.education/cooking/slow-roast-shoulder-of-lamb
- https://homemade.education/cooking/solyanka
- https://homemade.education/cooking/southern-fried-chicken
- https://homemade.education/cooking/spaghetti-alla-carbonara
- https://homemade.education/cooking/spaghetti-alle-cozze
- https://homemade.education/cooking/steak-and-kidney-pie
- https://homemade.education/cooking/sticky-toffee-pudding
- https://homemade.education/cooking/stovies
- https://homemade.education/cooking/strawberry-jam-open-pan-method

## Before / after excerpts

All three are from the cooking category (the batch is one content type).

### slow-roast-shoulder-of-lamb (orientation, grade 16.2 to about 8)

Before:
> A shoulder of lamb is threaded with fat and connective tissue that a short roast would leave tough and chewy. Given time at a low temperature, that same connective tissue undergoes collagen breakdown and the shoulder becomes something altogether different: fibres that separate at a fork's pressure, fat that has melted through the meat rather than sitting on top of it, and pan juices thick with gelatin that need no thickening agent.

After:
> A shoulder of lamb is full of fat and tough fibres. A quick roast leaves it chewy. Cook it low and slow and those fibres soften through collagen breakdown. The meat pulls apart with a fork, the fat melts into the meat, and the pan juices set thick with their own gelatin. No thickening needed.

### solyanka (closing history, grade 20.4 to about 9)

Before:
> Solyanka was a fixture of Soviet restaurant culture, listed on the menu of every stolovaya (canteen) and restoran (restaurant) from Vladivostok to Kaliningrad, it was one of the few dishes that could be relied upon anywhere in the Soviet Union. The combination of smoked meat with pickled cucumbers and olives seems unlikely to be a committee's idea of a national soup, but it works: the flavours are decisive and the soup is satisfying in the way only a very salty, very sour, very rich soup can be.

After:
> Solyanka was a fixture of Soviet restaurant cooking. It appeared on the menu of every stolovaya (canteen) and restoran (restaurant) from Vladivostok to Kaliningrad. It was one of the few dishes you could count on anywhere in the Soviet Union. The mix of smoked meat with pickled cucumbers and olives sounds odd on paper. But it works. The flavours are bold and the soup is the kind of salty, sour, rich bowl that fills you up properly.

### spaghetti-alle-cozze (closing history, grade 18.3 to about 9)

Before:
> Spaghetti alle cozze is a Friday dish in Naples: historically a day of abstinence from meat, which made seafood pasta a staple of the city's poorer neighbourhoods, where mussels were cheap and abundant. The Bay of Naples sits over volcanic rock that produces particularly flavoursome mussels, and the city has always eaten its shellfish with intensity, from raw with lemon at the street stalls near the port to this, cooked in their own steam over a tangle of spaghetti.

After:
> Spaghetti alle cozze is a Friday dish in Naples. Friday was a day to skip meat, which made seafood pasta a staple of the city's poorer streets, where mussels were cheap and plentiful. The Bay of Naples sits over volcanic rock that grows particularly tasty mussels. The city has always eaten its shellfish with intent. Raw with lemon at the street stalls near the port, and like this, cooked in their own steam over a tangle of spaghetti.

## Category-by-category count

cooking: 75

## Notes / surprises

- 40 of the 75 picked tutorials passed voice-check cleanly on first export. 35 needed rewriting. Slightly more dirty than batch15 (which was 60 clean / 15 dirty) because this batch fell across slow-cooker, soupe / spaghetti, and steak / stew sections that all carry a closing history paragraph at grade 12 to 20.
- Failure modes:
  - 26 files had a single closing "where this dish lives" paragraph at grade 12 to 20. The cooking author still picks up academic register on the historical close more readily than anywhere else in the body.
  - 3 files (soupe-a-loignon, spaghetti-aglio-olio-e-peperoncino, spaghetti-alle-vongole) carried a "Before you start" H2 at the top of the body. The voice-check rule now treats that exact heading as a safety-advice section. The heading was removed in each case; the following paragraph stands as the opening orientation.
  - 1 file (stovies) carried a year-only reference "(1929)" and a citation to F. Marian McNeill in the body. The year and the citation were removed from body prose; the same citation is already present in sourceNotes so the provenance is preserved on the public Sources block.
  - 1 file (strawberry-fool) used "maceration" inline in body prose. Replaced with "sugar step" / "sugared fruit" in body and troubleshooter; the substance (sugar plus 30-minute rest) is unchanged.
  - 1 file (strawberry-jam-open-pan-method) had four separate issues: "USDA" in an infoPanel body (replaced with "US home food-preservation guidance"); a pullQuote attribution "Mrs Beeton, Book of Household Management, 1861" (now "Mrs Beeton, Victorian household manual, 1861" so the historical-figure-in-body rule sees the gloss); "maceration" in body (replaced with "sugar rest"); and a 66-word warning-tone safety infoPanel about hot sugar burns (compressed to one sentence per the canonical safety pattern).
  - 5 short list-item / troubleshooter-fix sentences had grade 12 to 16 readings driven by long average-word length or compound-clause structure. Each broken into two or three short sentences.
- Pre-existing em / en dashes were found in 8 metadata fields across the batch (4 subtitles, 4 titles) on souvlaki-chicken, souvlaki-lamb, souvlaki-pork, soft-chewy-chocolate-chip-cookies, spaghetti-aglio-olio, spaghetti-aglio-olio-e-peperoncino, spaghetti-al-limone, spaghetti-al-pomodoro. All replaced with commas in the batch files to keep the directory grep-clean. The apply script writes subtitle to the DB, so those updates land in production; titles are not written by the apply script, so the title em-dash removals only affect the batch files themselves.
- No word-count drops over 20% on any file.
- No Mindset verbatim text touched (the batch is one content type, cooking-only).
- No image / hero media files touched.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 289.
