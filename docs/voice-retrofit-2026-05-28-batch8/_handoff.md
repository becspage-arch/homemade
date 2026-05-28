Batch 2026-05-28-batch8: 44 tutorials retrofitted. Deploy green, healthz 200.

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

Before this fire: 835 PUBLISHED rows with voiceRetrofittedAt IS NULL (from batch7 hand-off).
After this fire:  791 PUBLISHED rows with voiceRetrofittedAt IS NULL.
Delta: 44 rows newly retrofitted. Matches the batch apply count exactly.

PUBLISHED with voiceRetrofittedAt NOT NULL: 2744.

## Spot-check

Random pick from the batch: `maqluba` (cooking).

DB row state:
- slug: `maqluba`
- voiceRetrofittedAt: 2026-05-28T06:44:24.205Z
- public URL: https://homemade.education/cooking/maqluba

Live page first paragraph: the public site is still behind the pre-launch
splash gate (`apps/web/src/app/coming-soon/`), so the public URL renders
the "coming soon" shell rather than the tutorial body. The DB row is the
source of truth for verification. Same pattern as the recent batches.

First paragraph (DB body, post-rewrite, paragraph[15]):

> Maqluba is one of the great dishes of Palestinian cooking. It is made for celebrations, family gatherings, and weddings. It is brought to the table and turned out in front of guests for the drama of it. The name means 'upside-down'. The word fits both the method and the pleasure of the dish. It hides its layers until the moment of serving. Then it reveals a tower of rice, aubergine, and meat. It is claimed as a national dish in Palestine and in Jordan. It is also made in Lebanon and Syria. This is the shared Levantine food culture of the region.

## 8 sample public URLs across the batch

- https://homemade.education/cooking/macaroni-and-cheese
- https://homemade.education/cooking/major-greys-chutney
- https://homemade.education/cooking/manti
- https://homemade.education/cooking/maqluba
- https://homemade.education/mindset/the-hand-on-heart-money-breath
- https://homemade.education/mindset/the-invisible-mid-life-woman-myth-and-reality
- https://homemade.education/baking/white-tin-loaf-overnight-cold-proof
- https://homemade.education/baking/yorkshire-parkin

## Full list of slugs retrofitted in this batch

Cooking (19):
macaroni-and-cheese, macaroni-cheese, macaroni-pie-trinidad, macaroni-pie-trinidadian, mackerel-rundown, magret-de-canard, mahshi-cromb, mahshi-felfel, major-greys-chutney, manakish-zaatar, mango-chow, mango-strawberry-smoothie, manti, maqluba, margherita-pizza, marry-me-chicken, masala-chai, mashed-potato-gratin, mast-o-khiar.

Mindset (18):
the-fund-with-your-family-name-on-it, the-gift-settling-becoming-yours, the-growth-and-give-cycle-visualisation, the-hand-on-heart-money-breath, the-house-i-would-buy-if-i-knew-i-could-journal, the-i-dont-deserve-tax, the-if-i-had-more-money-i-would-trap, the-ill-lose-it-voice-whose-is-it-journal, the-income-celebration-log-activity, the-infinite-flow-activation, the-instagram-home-performance, the-investing-isnt-for-me-lie-and-where-it-came-from, the-invisible-mid-life-woman-myth-and-reality, the-last-time-i-had-it-and-lost-it-journal, the-last-time-something-good-arrived-journal, the-legacy-alignment-activation, the-line-of-women-hands-open, the-long-exhale-practice-six-rounds.

Baking (7):
welsh-cakes-griddle, white-tin-loaf-overnight-cold-proof, whole-wheat-sourdough, wholemeal-sandwich-loaf, wholemeal-scones, yorkshire-curd-tart, yorkshire-parkin.

## Before / after openings, 3 tutorials

### Cooking (RECIPE): macaroni-and-cheese paragraph[11]

Before:

> Macaroni and cheese has an American culinary history that spans from Thomas Jefferson's documented enthusiasm for pasta and cheese after his time in France and Italy, through Fannie Farmer's baked version at the end of the nineteenth century, to the invention of Kraft Dinner in 1937, which made it a ubiquitous household staple. It occupies an unusual position in the food culture: simultaneously a children's food of the most basic kind, a comfort food for adults who grew up on the boxed version, and, in its proper béchamel form, a sophisticated baked dish. The gap between the packet version and the homemade version is wider than for almost any other American comfort food.

After:

> Macaroni and cheese has a long American story. Thomas Jefferson loved pasta and cheese after his time in France and Italy. Fannie Farmer printed a baked version at the end of the nineteenth century. Kraft Dinner arrived in 1937 and made the dish a household staple. The result sits in an odd place in food culture. It is a children's food at its simplest. It is a comfort food for adults who grew up on the boxed version. And in its proper béchamel form, it is a baked dish for a dinner table. The gap between the packet version and the homemade version is wider than for almost any other American comfort food.

### Mindset (READING): the-invisible-mid-life-woman-myth-and-reality paragraph[12]

Before:

> The useful question is not 'am I visible?' but 'visible to whom, and does it matter?' If the answer is that the visibility you want is the attention of the people close to you, your professional peers, the communities you are part of: most women in mid-life find that kind of visibility intact or growing. If the visibility you want is in the general cultural sphere, the answer is more complicated, and the work is partly about whether that sphere's attention is the right measure.

After:

> The useful question is not 'am I visible?'. It is 'visible to whom, and does it matter?'. If the answer is the people close to you, your work peers, and the communities you sit in, most women in mid-life find that kind of visibility steady or growing. If the answer is the wider cultural sphere, the picture is more mixed. The work is partly about whether that sphere's attention is the right measure.

### Baking (RECIPE): white-tin-loaf-overnight-cold-proof paragraph[28]

Before:

> The household tin loaf is the British baking baseline. Beeton's 1861 chapter on bread runs the same shape: strong flour, water, salt, yeast, a tin. The change since is in pace, not method, modern domestic ovens are hotter, modern yeasts work harder, and the fridge gives us a long flavour build her kitchen had to compensate for with sponges and pre-ferments. The recipe here is the household loaf with one modern adaptation: an overnight cold retard for the flavour she had to coax in other ways.

After:

> The household tin loaf is the British baking baseline. The Victorian cookery writer Mrs Beeton's 1861 chapter on bread runs the same shape: strong flour, water, salt, yeast, a tin. The change since is in pace, not method. Modern home ovens are hotter. Modern yeasts work harder. The fridge gives us a long flavour build her kitchen had to compensate for with sponges and pre-ferments. The recipe here is the household loaf with one modern step added: an overnight cold retard for the flavour she had to coax in other ways.

## Category counts

cooking: 19, mindset: 18, baking: 7.

(Total 44. Cooking and mindset hit the 19-per-category cap. Mindset dropped
to 18 after dropping the-inspired-opportunity-activation mid-fire; see
"Surprises" below. Baking has only 7 PUBLISHED rows left with
voiceRetrofittedAt IS NULL, so the natural pool was exhausted before
the cap.)

## Surprises / notes

- The pick step grabbed 45 candidates and chose 19/19/7 across cooking,
  mindset, baking. The 19-per-category cap held on the first two; baking
  is winding down (only 7 PUBLISHED rows left to retrofit in the whole
  category).
- One mindset file, `the-inspired-opportunity-activation.json`, was dropped
  from the batch before commit. The file contains a verbatim affirmation
  ("This week, I am grateful for every idea, opportunity, and connection
  that is guiding me toward greater wealth.") inside the Anchor blockquote.
  That affirmation is taken from Week 7 of MONEY: A 12-Week Tapping Program
  / The Money Journal by Rebecca J Page (2025). Per the
  verbatim-energy-statements memory rule, text taken verbatim from
  Rebecca's books must stay exactly as written and voice rewrites do not
  apply. The affirmation scores grade 12.4 on the FK rule, which blocks the
  file from passing voice-check. Both constraints can't be satisfied, so
  the file is skipped permanently and added to KNOWN_BLOCKED in the pick
  script for future fires. The batch shipped 44 files instead of 45.
- Three pass-1 rewrites failed because the offending attribution paragraph
  appeared identically in both `body` and `sourceNotes`. The pass-1 script
  uses raw text find-and-replace and bailed on the non-unique match.
  Pass-2 scoped the search to `"text": "..."` wrapping so only the body
  occurrence was rewritten. This affected the-fund-with-your-family-name-on-it,
  the-instagram-home-performance, and the-investing-isnt-for-me-lie. The
  scope tweak landed safely.
- Pass-1's break-on-first-failure logic also meant `the-investing-isnt-for-me-lie`
  got NONE of its 5 rewrites applied (pass-1 hit the non-unique attribution
  in the middle of the rewrite list, bailed, skipped the write). Pass-2
  fixed only the duplicate paragraph; pass-3 then had to apply the
  remaining 4 paragraphs. A future iteration of the rewrite script should
  apply all successful rewrites and skip only the failing one, not abandon
  the whole file. Logged as a tooling note; not blocking this fire.
- Pass-2 rewrote `the-fund-with-your-family-name-on-it` and
  `the-investing-isnt-for-me-lie` paragraph[11] to lower grade, but both
  still scored just over 12 (12.4 and 12.8 respectively). Pass-3 dropped
  them further with shorter words ("a long line of" instead of
  "long-standing", "basic studies of money skills" instead of "financial
  literacy research"). Both clear after pass-3.
- `welsh-cakes-griddle` carried an en-dash in `recipe.yieldDescription`
  ("12-14 welsh cakes" with U+2013). The voice-check rule is body-only and
  doesn't catch metadata fields, but the per-fire em/en-dash QC grep across
  the batch directory caught it. The apply path doesn't touch recipe
  metadata, so a one-off DB update (`_voice-retrofit-batch51-fix-yield.ts`)
  rewrote the live row to "12 to 14 welsh cakes". Same shape as the yield
  fixes used in earlier batches (victoria-sandwich-classic in batch7,
  tea-loaf / knedliky-bread in older batches).
- `macaroni-cheese` paragraph[15] tripped the historical-figure-in-body
  rule on three figures in one sentence (Acton, Mrs Beeton, Beeton). The
  rewrite kept the substance but introduced each figure with a gloss
  token: "The nineteenth-century cookery writer Eliza Acton..." and "The
  Victorian cookbook writer Mrs Beeton..." Both are accepted gloss tokens
  on the HISTORICAL_GLOSS_TOKENS list.
- `the-hand-on-heart-money-breath` paragraph[18] tripped the year-in-body
  rule on two parenthesised years ("(2025)" and "(2003 onwards)"). The
  rewrite removed both years from the body and shifted the historical
  context to plain phrasing ("Kristin Neff popularised the form in her
  self-compassion work").
- No verbatim-EFT (tapping) slugs were tripped this fire. The accumulated
  KNOWN_BLOCKED list (30 going in) held all expected violations out of
  the pool. One new addition to the list: the-inspired-opportunity-activation
  (verbatim-affirmation Anchor blockquote, see above).
- No word-count drop exceeded 20% on any rewritten body block. The most
  aggressive compression was on
  `the-investing-isnt-for-me-lie-and-where-it-came-from` paragraph[3],
  where the financial-services-sector clause compressed from 40 words to
  29 (28% drop). The drop was driven by replacing
  "demographically concentrated at the senior level in ways that shaped
  product design, distribution, and marketing for decades" with "skews
  male at the top. That shaped how the products were made and sold for
  decades", which preserves the substance (sector skew at the senior
  level, downstream effect on product design) while dropping abstract
  vocabulary. Flagged here per the >20% rule.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 791.

## Deploy verification

GitHub Actions deploy.yml run 26559374847 completed with conclusion `success` on commit 9ecc876.

`curl -sS -o /dev/null -w "%{http_code}\n" https://homemade.education/healthz` returned `200`.
