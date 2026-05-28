Batch 2026-05-28-batch5: 54 tutorials retrofitted. Deploy green, healthz 200.

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

Before this fire: 1003 PUBLISHED rows with voiceRetrofittedAt IS NULL (from batch4 hand-off).
After this fire:   949 PUBLISHED rows with voiceRetrofittedAt IS NULL.
Delta: 54 rows newly retrofitted. Matches the batch apply count after 3 verbatim-EFT slugs were dropped from the original pick of 57.

PUBLISHED with voiceRetrofittedAt NOT NULL: 2586.

## Spot-check

Random pick from the batch: `tarte-tatin-apple` (baking).

DB row state:
- slug: `tarte-tatin-apple`
- voiceRetrofittedAt: 2026-05-28T03:41:35.426Z
- public URL: https://homemade.education/baking/tarte-tatin-apple

Live page first paragraph: the public site is still behind the pre-launch
splash gate (`apps/web/src/app/coming-soon/`), so the public URL renders
the "coming soon" shell rather than the tutorial body. The DB row is the
source of truth for verification. Same pattern as batches 41 to 47.

First paragraph (DB body, post-rewrite):

> Tarte Tatin is built upside-down in a heavy ovenproof pan. Butter and sugar cook to a deep amber caramel. Apple halves go into the caramel cut-side up and cook until soft and glossy. A disc of puff pastry is laid over the apples and tucked down. The whole pan bakes until the pastry is risen and golden. Then the tart is flipped onto a serving plate so the apples are on top.

## 8 sample public URLs across the batch

- https://homemade.education/cooking/kotlety-mielone
- https://homemade.education/cooking/koshari
- https://homemade.education/cooking/lamb-biryani
- https://homemade.education/cooking/labneh
- https://homemade.education/baking/tarte-tatin-apple
- https://homemade.education/baking/tarte-aux-pommes
- https://homemade.education/baking/tea-loaf
- https://homemade.education/mindset/tapping-to-start-where-you-are
- https://homemade.education/mindset/ten-minutes-outside-daily
- https://homemade.education/mindset/the-84-day-arc-in-money-v2

## Full list of slugs retrofitted in this batch

Cooking (19):
knedliky-potato, kofte-izmir, korhelyleves, koshari, kotlety-mielone, kotlety-schabowe, krupnik, kuku-sabzi, kulajda, lablabi, labneh, lahmacun, lamb-bhuna, lamb-biryani, lamb-dhansak, lamb-fricassee-greek, lamb-hotpot-with-kidneys, lamb-madras, lamb-rogan-josh.

Baking (19):
sufganiyot, sugar-flowers, summer-fruit-tart, sussex-pond-pudding, sweet-potato-pie-southern, swiss-roll, swiss-roll-jam-cream, swiss-roll-vanilla, tablet-scottish, tarte-au-chocolat, tarte-au-citron, tarte-aux-framboises, tarte-aux-pommes, tarte-bourdaloue, tarte-tatin, tarte-tatin-apple, tea-loaf, tea-loaf-fruit, tea-loaf-overnight.

Mindset (16):
tapping-to-see-myself-as-an-abundant-leader, tapping-to-see-sleep-as-renewal, tapping-to-see-wealth-as-endless, tapping-to-start-where-you-are, tapping-to-stop-fighting-myself-about-sleep, tapping-to-trust-constant-replenishment, tapping-to-trust-myself-with-millions, tapping-to-unlink-rest-from-laziness, tapping-to-welcome-windfalls, tapping-to-work-with-the-body-sleep, teaching-children-about-money-without-passing-on-scarcity-reading, telling-your-younger-self-she-is-allowed, telling-your-younger-self-she-is-allowed-to-want-this, ten-minutes-of-play-today, ten-minutes-outside-daily, the-84-day-arc-in-money-v2.

## Before / after openings, 3 tutorials

### Cooking (RECIPE): kotlety-mielone paragraph[0]

Before:

> Kotlety mielone are the pan-fried pork mince patties of the Polish kitchen, similar in form to a hamburger but the seasoning takes a different direction. The onion is grated rather than chopped (it disappears into the mince and keeps it moist), and a little ground allspice gives a warm, slightly aromatic background note that places the dish firmly in the Polish kitchen.

After:

> Kotlety mielone are the pan-fried pork mince patties of the Polish kitchen. The shape is like a hamburger but the seasoning goes a different way. The onion is grated rather than chopped, so it melts into the mince and keeps it moist. A little ground allspice gives a warm, faintly aromatic note that places the dish firmly in Poland.

### Mindset (PRACTICE): tapping-to-start-where-you-are paragraph[11]

Before:

> Adapted from Day 1 of SLEEP: A 30-Day Tapping Intensive (Rebecca J Page, 2025), "Start where you are." The tapping framework is Gary Craig's Emotional Freedom Technique (EFT), in use since the mid-1990s, building on Roger Callahan's Thought Field Therapy.

After:

> Adapted from Day 1 of SLEEP: A 30-Day Tapping Intensive by Rebecca J Page, 2025, "Start where you are." The tapping method is Emotional Freedom Technique, or EFT. It comes from Gary Craig in the mid-1990s, building on Roger Callahan's Thought Field Therapy.

### Mindset (READING): the-84-day-arc-in-money-v2 paragraph[10]

Before:

> Written for homemade.education as an orientation to the MONEY v2 program structure.

After:

> Written for homemade.education. It introduces the shape of the MONEY v2 program.

## Category counts

cooking: 19, baking: 19, mindset: 16.

(Total 54. After the 3-slug drop for verbatim EFT setup statements, mindset moved from 19 to 16; cooking and baking unchanged.)

## Surprises / notes

- The 19-per-category cap continues to be the rate-limiter. Only cooking, baking, and mindset still hold PUBLISHED rows with voiceRetrofittedAt IS NULL, so each fire picks 57 maximum. Batch5 picked 19/19/19, dropped 3 mindset slugs for verbatim EFT setup statements, and shipped 54.
- 35 of the 57 picked files were already clean against the current voice-check rule set. 22 needed rewrites: 16 RECIPE files with single-paragraph or twin-paragraph grade-level issues on "Where this dish lives" history paragraphs (one had two such paragraphs, lamb-biryani and lamb-fricassee-greek), 1 RECIPE file (tarte-tatin-apple) that combined a grade-level orientation paragraph with a 26-word safety-tone infoPanel that exceeded the 20-word safety-block rule, and 5 PRACTICE / READING files with single-paragraph attribution-block or program-citation grade-level issues.
- Three PRACTICE picks (`tapping-to-see-myself-as-someone-who-has-it`, `tapping-to-trust-legacy-property-building`, `tapping-to-welcome-property-and-investment`) hit the grade-level rule on verbatim EFT setup statements of the shape "Even though X, I deeply and completely accept myself." Per the verbatim-energy-statements memory rule the setup statements cannot be rewritten; all three slugs were dropped from the batch and added to the known-blocked list embedded in the next pick script.
- Two files carried em or en dashes outside the body chunks the voice-check scans: `tea-loaf` had an en-dash in `recipe.yieldDescription` ("10-12 slices" after fix) and `labneh` had an em-dash in `subtitle`. The labneh subtitle was rewritten in the snapshot JSON to a comma form ("Strained yoghurt, Lebanon's everyday cheese"), which the apply script then pushed to the live row. The tea-loaf yieldDescription is not touched by the apply path; a one-off DB update (`_voice-retrofit-fix-tea-loaf-yield.ts`) rewrote the live row to "1 loaf (10 to 12 slices)" before commit, matching the same fix used in batch3 (sourdough-discard-crumpets) and batch4 (knedliky-bread).
- `tarte-tatin-apple` carried a dedicated safety infoPanel (tone: warning, title: "Caramel is hot", 26 words) that violated the no-safety-block rule. The block was removed entirely. The orientation paragraph still signals heat by saying the butter and sugar "cook to a deep amber caramel"; the safety substance is implied by the temperature description and covered by the site-wide terms per the voice spec's safety pattern.
- `ten-minutes-outside-daily` paragraph[10] tripped two rules at once: the year-only "(1989)" reference for Attention Restoration Theory, and a grade-level score of 20.2 (the highest in this batch). The full Kaplan citation was already present in `sourceNotes`, so the body paragraph was compressed to "Written for homemade.education. Time in nature is known to restore tired attention. See the Sources note below for the research." The pre-rewrite paragraph was 38 words; the new version is 22. That is a 42% drop on a single paragraph, justified because the citation substance already lives in sourceNotes and the body was duplicating it.
- `telling-your-younger-self-she-is-allowed-to-want-this` paragraph[13] was an attribution line citing the MONEY program. The pre-rewrite paragraph was 32 words; the new version is 24 words (a 25% drop). The drop is on a citation line where the long program title was the source of grade-level pressure; the substance (which program, which day, which theme) is preserved.
- The accumulated verbatim-EFT known-blocked list is now 30 slugs (up from 27).

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 949.

## Deploy verification

GitHub Actions deploy.yml run 26553306313 completed with conclusion `success` on commit f95f714.

`curl -sS -o /dev/null -w "%{http_code}\n" https://homemade.education/healthz` returned `200`.
