Batch 2026-05-28-batch7: 57 tutorials retrofitted. Deploy green, healthz 200.

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

(Long-dash placeholders in the "last fire" column replaced with "n/a" to keep
this hand-off em-dash-free per the per-fire QC rule.)

## Voice-retrofit progress

Before this fire: 892 PUBLISHED rows with voiceRetrofittedAt IS NULL (from batch6 hand-off).
After this fire:  835 PUBLISHED rows with voiceRetrofittedAt IS NULL.
Delta: 57 rows newly retrofitted. Matches the batch apply count exactly.

PUBLISHED with voiceRetrofittedAt NOT NULL: 2700.

## Spot-check

Random pick from the batch: `the-figure-on-paper-fold-and-carry-it-for-thirty-days` (mindset).

DB row state:
- slug: `the-figure-on-paper-fold-and-carry-it-for-thirty-days`
- voiceRetrofittedAt: 2026-05-28T05:41:14.104Z
- public URL: https://homemade.education/mindset/the-figure-on-paper-fold-and-carry-it-for-thirty-days

Live page first paragraph: the public site is still behind the pre-launch
splash gate (`apps/web/src/app/coming-soon/`), so the public URL renders
the "coming soon" shell rather than the tutorial body. The DB row is the
source of truth for verification. Same pattern as the recent batches.

First paragraph (DB body, post-rewrite):

> A folk practice from Day 24 of the MONEY program. The premise is simple: the number you can't write down without a shiver of impossibility is the number to carry. Familiarity is the medicine. Thirty days of the paper in your pocket or bra. No chanting, no ceremony, just contact.

## 8 sample public URLs across the batch

- https://homemade.education/cooking/lemonade
- https://homemade.education/cooking/lentil-and-bacon-soup
- https://homemade.education/cooking/linguine-ai-gamberi
- https://homemade.education/cooking/liver-and-onions
- https://homemade.education/cooking/lobster-roll
- https://homemade.education/baking/victoria-sandwich-classic
- https://homemade.education/baking/walnut-coffee-cake
- https://homemade.education/mindset/the-feast-and-famine-money-cycle-explained

## Full list of slugs retrofitted in this batch

Cooking (19):
lemon-posset, lemon-potatoes, lemon-sorbet, lemonade, lentil-and-bacon-soup, lentil-and-feta-salad, lentil-feta-salad, lime-marmalade, limoncello, limoncello-curd, linguine-ai-gamberi, linguine-al-granchio, linguine-al-pesto, linguine-allastice, liver-and-onions, loaded-mashed-potato-casserole, lobster-roll, mac-and-cheese, mac-and-cheese-baked.

Baking (19):
vanilla-slice, vegan-brownies, vegan-carrot-cake, vegan-cheesecake-cashew, vegan-chocolate-cake, vegan-chocolate-chip-cookies, vegan-scones, vegan-scones-coconut-oil, victoria-sandwich-classic, victoria-sponge, victoria-sponge-buttercream, victoria-sponge-with-buttercream, viennese-fingers, viennese-whirls, vol-au-vents-mushroom, walnut-coffee-cake, walnut-fudge, walnut-raisin-bread, welsh-cakes.

Mindset (19):
the-deed-that-outlasts-you-visualisation, the-deposit-coin, the-door-you-didnt-know-was-a-door, the-drawer-where-the-paperwork-lives-visualisation, the-embodiment-and-completion-ceremony, the-embodiment-and-completion-ceremony-ritual, the-envelope-you-didnt-expect, the-falling-asleep-in-belonging-meditation, the-family-story-shifting-visualisation, the-fan-of-envelopes-each-one-a-different-source, the-feast-and-famine-cycle-and-how-to-widen-the-floor, the-feast-and-famine-money-cycle-explained, the-feeling-acknowledged-the-feeling-at-rest, the-figure-on-paper-fold-and-carry-it-for-thirty-days, the-first-thing-i-ever-heard-about-money-journal, the-first-thing-my-savings-will-buy-journal, the-five-minute-evening-download, the-fork-in-the-road-choosing-the-new-path, the-friend-whose-face-lights-up-visualisation.

## Before / after openings, 3 tutorials

### Cooking (RECIPE): lemonade paragraph[12]

Before:

> Homemade lemonade is a summer ritual in Britain that sits alongside Wimbledon, fêtes, and back-garden cricket. The commercial versions that dominate British fridges are made from lemon flavouring, CO2, and sweetener rather than actual lemon, which is why homemade lemonade tastes so different from the bottled kind: sharper and less sweet. The version here uses a simple sugar syrup and fresh lemon in a ratio that can be adjusted to taste.

After:

> Homemade lemonade is a summer ritual in Britain. It sits alongside Wimbledon, summer fêtes, and back-garden cricket. Most shop versions are made from lemon flavouring, fizz, and sweetener rather than real lemon. That is why homemade tastes so different from the bottled kind: sharper and less sweet. This version uses a simple sugar syrup and fresh lemon. The ratio is easy to adjust to taste.

### Mindset (READING): the-feast-and-famine-money-cycle-explained paragraph[0]

Before:

> The feast-and-famine cycle is partly practical, irregular income is irregular, and partly nervous system: the body has learned to expect the swing and braces for it even in months where the income is steady. This reading sketches the cycle's mechanism and walks a Release/Allow energy-statement pair for the gap period when the bracing has arrived too early.

After:

> The feast-and-famine cycle is partly practical: irregular income is irregular. It is also partly nervous system: the body learns to expect the swing and braces for it, even in months where income is steady. This reading sketches how the cycle works. It then walks a Release/Allow energy-statement pair for the gap period, when the bracing has arrived too early.

### Baking (RECIPE): victoria-sandwich-classic paragraph[22]

Before:

> A lemon Victoria takes the zest of two unwaxed lemons folded into the creamed butter, and lemon curd instead of raspberry jam. A buttercream version sandwiches with vanilla buttercream as well as the jam, soften 100 g unsalted butter, beat in 200 g sifted icing sugar and 1 tsp vanilla, spread between the jam and the second sponge. The classic four-quarters with raspberry and icing sugar is the cake the recipe is named for; anything richer is a different cake.

After:

> A lemon Victoria takes the zest of two unwaxed lemons folded into the creamed butter, and lemon curd instead of raspberry jam. A buttercream version adds vanilla buttercream as well as the jam. Soften 100 g unsalted butter. Beat in 200 g sifted icing sugar and 1 tsp vanilla. Spread between the jam and the second sponge. The classic four-quarters with raspberry and icing sugar is the cake this recipe is named for. Anything richer is a different cake.

## Category counts

cooking: 19, baking: 19, mindset: 19.

(Total 57. Full 19/19/19 cap on all three categories. No drops this fire.)

## Surprises / notes

- The 19-per-category cap continues to be the rate-limiter. Only cooking, baking, and mindset still hold PUBLISHED rows with voiceRetrofittedAt IS NULL, so each fire picks 57 maximum. Batch7 picked 19/19/19, no slugs dropped, and shipped the full 57.
- 38 of the 57 picked files were already clean against the current voice-check rule set. 19 needed rewrites: 9 cooking RECIPE files with grade-level issues on the opening / history paragraph, 1 cooking RECIPE file (loaded-mashed-potato-casserole) with two grade-level issues on long run-on step text inside orderedList[5], 1 cooking RECIPE file (lobster-roll) that combined a grade-level history paragraph with a troubleshooter[11] fix that read above grade 12, 1 baking RECIPE file (victoria-sandwich-classic) with a multi-clause paragraph plus a servings/yieldDescription conflict where both fields were populated, and 7 mindset files (5 PRACTICE attribution paragraphs, 1 PRACTICE intro paragraph that tripped a medical-claim watchword in pass 2 after the grade-level rewrite added "treats", and 1 READING file with two issues including a banned-phrase "genuinely").
- Two passes were needed. Pass 1 cleared 15 of 19 problem files. Pass 2 fixed four residuals: three mindset attribution paragraphs where the first rewrite was still above grade 12 (the-deed-that-outlasts-you-visualisation, the-door-you-didnt-know-was-a-door, the-family-story-shifting-visualisation), and the-drawer-where-the-paperwork-lives-visualisation where pass 1 had accidentally introduced the medical-claim watchword "treats" while compressing the opening paragraph. Pass 2 dropped "Forward-looking" / "Lineage-shift" / "Creative" framings from the attributions and swapped "the body treats" for "the body responds to" in the drawer intro.
- `the-feast-and-famine-money-cycle-explained` paragraph[14] tripped the banned-phrase rule on "genuinely". The fix was a single-word swap to "really".
- `victoria-sandwich-classic` had both `servings` (8) and `yieldDescription` ("1 cake (20 cm, serves 8)") populated, which trips the servings-yield voice-check rule. The apply path does not touch recipe fields, so a one-off DB update (`_voice-retrofit-batch50-fix-yield.ts`) cleared `yieldDescription` on the live row before commit. Matches the tea-loaf / knedliky-bread / sourdough-discard-crumpets / treacle-tart-classic fixes used in earlier batches.
- `the-five-minute-evening-download.json` carried an em-dash in the `subtitle` field (between "sleep" and "three things done"). The voice-check on the apply path didn't flag it (the rule only blocks em-dashes in body, not in subtitle), but the per-fire QC grep for em / en dashes across the batch directory caught it. The subtitle was rewritten in place as one sentence followed by a second.
- `mac-and-cheese-baked` paragraph[13] referenced Mary Randolph's The Virginia Housewife with the year 1824. The voice-check year-in-body rule requires parenthesised four-digit years and "1824" alone was bare, but for safety the rewrite moved the named-author / book / year detail to `sourceNotes` and replaced the inline mention with "It appears in printed cookbooks of that period (see Sources below)". Same shape as the citation moves used in earlier batches.
- No verbatim-EFT slugs were tripped this fire; the accumulated known-blocked list (30 slugs going in) was already pre-applied to the pick script and held all expected violations out of the candidate pool. No new additions to the list.
- No word-count drop exceeded 20% on any rewritten body block. The most aggressive compression was on the-deposit-coin paragraph[17], where the inline "decades-long folk-magic and property-manifesting" lineage compressed from 53 words to 44 (17% drop), preserving substance.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 835.

## Deploy verification

GitHub Actions deploy.yml run 26557044905 completed with conclusion `success` on commit 6b7a2fe.

`curl -sS -o /dev/null -w "%{http_code}\n" https://homemade.education/healthz` returned `200`.
