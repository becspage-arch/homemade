Batch 2026-05-28-batch4: 56 tutorials retrofitted. Deploy green, healthz 200.

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

Before this fire: 1059 PUBLISHED rows with voiceRetrofittedAt IS NULL (from batch3 hand-off).
After this fire:  1003 PUBLISHED rows with voiceRetrofittedAt IS NULL.
Delta: 56 rows newly retrofitted. Matches the batch apply count after 1 verbatim-EFT slug was dropped from the original pick of 57.

PUBLISHED with voiceRetrofittedAt NOT NULL: 2532.

## Spot-check

Random pick from the batch: `tapping-to-release-the-grip-of-tension` (mindset).

DB row state:
- slug: `tapping-to-release-the-grip-of-tension`
- voiceRetrofittedAt: 2026-05-28T02:45:12.125Z
- public URL: https://homemade.education/mindset/tapping-to-release-the-grip-of-tension

Live page first paragraph: the public site is still behind the pre-launch
splash gate (`apps/web/src/app/coming-soon/`), so the public URL renders
the "coming soon" shell rather than the tutorial body. The DB row is the
source of truth for verification. Same pattern as batches 41 to 46.

First paragraph (DB body, post-rewrite):

> A five-minute tapping practice from Day 2 of SLEEP: A 30-Day Tapping Intensive. The script targets the physical holding pattern that sleep difficulty creates: the jaw that stays clenched, the shoulders that don't come down, the chest that remains tight through the day. Use it during daylight hours, when the tension has accumulated and needs to be released before it follows you to bed.

## 5 sample public URLs across the batch

- https://homemade.education/cooking/karp-w-galarecie
- https://homemade.education/cooking/khoresh-fesenjan
- https://homemade.education/baking/spelt-sourdough-loaf
- https://homemade.education/baking/stollen
- https://homemade.education/mindset/tapping-to-let-the-day-go
- https://homemade.education/mindset/tapping-to-release-the-grip-of-tension

## Full list of slugs retrofitted in this batch

Cooking (19):
kapusta-z-grochem, karniyarik, karp-w-galarecie, kasha, kedgeree, keema-matar, kefta-skewers, kefta-tagine, keftedes, kefteji, khobz, khoresh-bademjan, khoresh-fesenjan, kibbeh, king-prawn-balti, king-ranch-chicken, kleftiko, knedliky, knedliky-bread.

Baking (19):
sourdough-scones, sourdough-starter, spanakopita-spinach-feta, speculaas, spelt-loaf-wholegrain, spelt-sourdough-loaf, springerle, spritz-biscuits, squab-pie-west-country, stargazy-pie-cornish, sticky-ginger-cake, sticky-toffee-cake, sticky-toffee-pudding-cake, sticky-toffee-traybake, stollen, stollen-christmas, strawberry-rhubarb-pie, stroopwafels, stroopwafels-dutch-syrup.

Mindset (18):
tapping-to-keep-faith-through-market-fluctuations, tapping-to-let-go-of-others-can-not-me, tapping-to-let-safety-set-the-tone-at-night, tapping-to-let-the-day-go, tapping-to-let-the-muscles-melt, tapping-to-let-the-sleep-battle-be-over, tapping-to-live-in-daily-overflow, tapping-to-lock-in-ease-with-receiving-and-spending, tapping-to-love-saving-and-investing, tapping-to-open-to-multiple-streams, tapping-to-own-my-sleep-transformation, tapping-to-picture-my-familys-future-freedom, tapping-to-recode-the-bedtime-stress-response, tapping-to-release-fear-of-taxes-and-inheritance-loss, tapping-to-release-guilt-about-wanting-wealth, tapping-to-release-remaining-doubts-about-wealth, tapping-to-release-rest-guilt, tapping-to-release-the-grip-of-tension.

## Before / after openings, 3 tutorials

### Cooking (RECIPE): karp-w-galarecie paragraph[0]

Before:

> Karp w galarecie (carp in aspic) is one of the twelve meatless dishes of the Polish Christmas Eve supper, the wigilia. In Poland the fish is always carp, sold live from tanks in the days before Christmas; in Britain, trout is the practical substitute. The preparation is the same: the fish poaches gently in a light stock with vegetables and aromatics, is lifted out whole, and then the strained cooking liquid is clarified, set with gelatine, and poured over the fish to set overnight into a trembling, glassy aspic.

After:

> Karp w galarecie (carp in aspic) is one of the twelve meatless dishes of the Polish Christmas Eve supper, called wigilia. In Poland the fish is always carp, sold live from tanks just before Christmas. In Britain, trout is the practical swap. The method is the same. The fish poaches gently in a light stock with vegetables and aromatics, then is lifted out whole. The strained cooking liquid is cleared, set with gelatine, and poured over the fish to set overnight into a clear, glassy jelly.

### Baking (RECIPE): spelt-sourdough-loaf paragraph[1]

Before:

> Spelt is an ancient relative of modern wheat with a softer gluten structure and a nutty, slightly sweet flavour. It performs differently in sourdough: it ferments faster than a pure wheat dough and becomes extensible more quickly, which means bulk fermentation needs to be watched rather than timed to the minute. Using 50% spelt alongside strong white flour gives a compromise: the character and flavour of spelt with enough gluten strength from the white flour to hold a decent shape and an open crumb.

After:

> Spelt is an old relative of modern wheat. The gluten is softer and the flavour is nutty and a little sweet. In sourdough it behaves differently: it ferments faster than pure wheat dough and gets stretchy more quickly. That means the bulk fermentation needs watching rather than timing to the minute. Using 50% spelt with strong white flour gives a good balance. You get the flavour of spelt and enough gluten strength from the white to hold a decent shape and an open crumb.

### Mindset (PRACTICE): tapping-to-let-the-day-go paragraph[11]

Before:

> Adapted from Day 1 of SLEEP: A 30-Day Tapping Intensive (Rebecca J Page, 2025), "Let the day go." The tapping framework is Gary Craig's Emotional Freedom Technique (EFT), in use since the mid-1990s, building on Roger Callahan's Thought Field Therapy.

After:

> Adapted from Day 1 of SLEEP: A 30-Day Tapping Intensive by Rebecca J Page, 2025, "Let the day go." The tapping method is Emotional Freedom Technique, or EFT. It comes from Gary Craig in the mid-1990s, building on Roger Callahan's Thought Field Therapy.

## Category counts

cooking: 19, baking: 19, mindset: 18.

(Total 56. After the 1-slug drop for a verbatim EFT setup statement, mindset moved from 19 to 18; cooking and baking unchanged.)

## Surprises / notes

- The 19-per-category cap in the brief (scaled with batch size) limited this fire to 57 picks (cooking 19, baking 19, mindset 19) because only those three categories still hold PUBLISHED rows with voiceRetrofittedAt IS NULL. The other 14 categories are fully retrofitted. Throughput rate is now category-cap-bound rather than candidate-bound; the remaining ~1003 nulls are all in cooking, baking, and mindset.
- 42 of the 57 picked files were already clean against the current voice-check rule set. 15 needed rewrites: 11 RECIPE files with single-paragraph grade-level issues on the closing "where this dish comes from" history paragraph, 1 RECIPE file (spelt-sourdough-loaf) with a grade-level issue on the second orientation paragraph, 1 RECIPE file (stroopwafels-dutch-syrup) with two grade-level paragraphs, and 3 PRACTICE files with single-paragraph attribution-paragraph grade-level issues (the SLEEP-program citation block).
- One PRACTICE pick (`tapping-to-release-money-procrastination`) hit the grade-level rule on a verbatim EFT setup statement of the shape "Even though X, I deeply and completely accept myself." Per the verbatim-energy-statements memory rule the setup statement cannot be rewritten; the slug was dropped from the batch and added to the known-blocked list embedded in the next pick script.
- Two files carried em or en dashes outside the body chunks the voice-check scans: knedliky-bread had an en-dash in `recipe.yieldDescription` ("8 to 10 slices" after fix), and tapping-to-recode-the-bedtime-stress-response had an em-dash in `subtitle`. Both were rewritten to commas / sentence breaks before apply so the public renderer never emits a long dash.
- No file lost over 20% of substantive word count. The rewrites were grade-level reductions on a single paragraph in most cases, two paragraphs in the stroopwafels case.
- The accumulated verbatim-EFT known-blocked list is now 27 slugs (up from 26).

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 1003.

## Deploy verification

GitHub Actions deploy.yml run 26551529324 completed with conclusion `success` on commit d72820a.

`curl -sS -o /dev/null -w "%{http_code}\n" https://homemade.education/healthz` returned `200`.
