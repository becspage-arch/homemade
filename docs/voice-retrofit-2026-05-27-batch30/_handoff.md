Batch 2026-05-27-batch30: 63 tutorials retrofitted. Deploy green, healthz 200.

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

(Audit output's "last fire" column originally contained em dash placeholders for categories that have not autopiloted; rendered as `n/a` here to keep the hand-off em-dash clean.)

## Voice retrofit progress

- Before this fire: 1431 PUBLISHED tutorials with voiceRetrofittedAt set.
- After this fire: 1494 PUBLISHED tutorials with voiceRetrofittedAt set.
- Remaining: 2041 PUBLISHED tutorials with voiceRetrofittedAt IS NULL.
- Delta matches batch size (63). PASS.

## Spot-check (one slug from batch)

- slug: bucatini-allamatriciana
- voiceRetrofittedAt: 2026-05-27T09:42:42.316Z
- url: https://homemade.education/cooking/bucatini-allamatriciana (site behind splash gate; anonymous traffic lands on /coming-soon, so body is not visible to a public curl. DB content confirmed via direct query.)
- new first paragraph (from DB):

> Three things separate a good amatriciana from a mediocre one: guanciale instead of pancetta, San Marzano tinned tomatoes instead of fresh, and no onion. The Roman version is strict about all three. Use them and the sauce will be right; deviate and you have something else, which may be perfectly good but is not amatriciana.

## Sample public URLs across categories

- https://homemade.education/cooking/brown-stew-chicken
- https://homemade.education/cooking/bucatini-allamatriciana
- https://homemade.education/cooking/buttermilk-fried-chicken
- https://homemade.education/baking/coconut-layer-cake
- https://homemade.education/baking/coffee-walnut-layer-cake
- https://homemade.education/baking/cornish-saffron-cake
- https://homemade.education/mindset/i-release-money-shame-i-release-it-now
- https://homemade.education/mindset/i-release-self-doubt-and-allow-confidence-with-wealth
- https://homemade.education/sustainability/understanding-u-values
- https://homemade.education/sustainability/vapour-control-layers-explained

## Before / after excerpts (three content types)

### Cooking RECIPE: brown-stew-chicken (paragraph[0])

BEFORE:
> Brown stew chicken gets its colour from a step that sits outside most European cooking traditions: melting sugar in hot oil until it turns dark amber and bitter, then coating the chicken in it before any liquid goes in. The sugar doesn't taste sweet in the finished dish; it contributes a deep, slightly caramelised note that underpins the thyme and allspice. The technique is called 'browning' in Jamaican cooking and it applies to chicken, beef, and pork stews alike.

AFTER:
> Brown stew chicken gets its colour from a step that's rare in European cooking. You melt sugar in hot oil until it turns dark amber and bitter. Then you coat the chicken in it before any liquid goes in. The sugar doesn't taste sweet in the finished dish. It adds a deep, slightly burnt note that carries the thyme and allspice. The step is called 'browning' in Jamaican cooking. It applies to chicken, beef, and pork stews alike.

### Baking RECIPE: coffee-walnut-layer-cake (paragraph[0])

BEFORE:
> Coffee and walnut cake is a straightforward layer cake that succeeds or fails on the coffee: if the flavour is timid, the cake is just a plain walnut sponge with a sweet topping. Use enough instant coffee that the sponge tastes distinctly of coffee before the buttercream goes on, and make the buttercream with the same intensity.

AFTER:
> Coffee and walnut cake is a simple layer cake. It lives or dies on the coffee. If the flavour is weak, the cake is just a plain walnut sponge with a sweet topping. Use enough instant coffee that the sponge tastes clearly of coffee before the buttercream goes on. Make the buttercream with the same strength.

### Mindset PRACTICE: i-release-money-shame-i-release-it-now (paragraph[0])

BEFORE:
> A three-minute pair of energy statements for the money shame loop: the replaying of old decisions, a period of overspending, a missed opportunity, a time when the numbers went wrong, and the guilt that keeps those moments active today. Use it when the old shame is loud, not when reviewing current finances.

AFTER:
> A three-minute pair of energy statements for the money-shame loop. The replaying of old choices. A spell of overspending. A missed chance. A time when the numbers went wrong. And the guilt that keeps those moments alive today. Use it when the old shame is loud, not when you're reviewing your current finances.

## Category breakdown (63 total)

- cooking: 19
- baking: 19
- mindset: 19
- sustainability: 6

## Content type breakdown (batches past 3 do not require type spread; recorded for visibility)

- RECIPE (cooking + baking): 38
- PRACTICE (mindset energy statements): 19
- TECHNIQUE (sustainability how-to): 4
- PATTERN: 2

## Notes from this fire

- 40/63 candidates passed voice-check cleanly with no edits needed. The
  apply step still stamped voiceRetrofittedAt on all 63 so the routine's
  forward read stays accurate.
- 23 files needed targeted rewrites: 22 single-paragraph grade-level fixes
  plus one safety-block heading on buffalo-chicken-wings ("Before you start"
  removed; the orientation paragraph now stands alone).
- Most grade-level fixes were "where this dish lives" or technical-history
  paragraphs deep in the body, not orientation paragraphs. Sentences were
  shortened and a few high-syllable words simplified.
- Glossary tooltip marks preserved on coconut-layer-cake (coconut milk),
  understanding-u-values (thermal bridges), and vapour-control-layers-explained
  (mineral wool). No termIds changed.
- No mindset verbatim energy statements were touched. Only the descriptive
  orientation paragraphs prefacing them were re-registered.
- No word-count drops over 20% on any file.

## Forward read

- PUBLISHED tutorials with voiceRetrofittedAt IS NULL after this fire: 2041.

## Full list of slugs retrofitted in this batch

cooking (19):
- broccoli-and-stilton-soup
- brown-stew-chicken
- brown-windsor-soup
- brownie-batter-bites
- bubble-and-squeak
- bucatini-alla-puttanesca
- bucatini-allamatriciana
- bucatini-amatriciana
- buck-rarebit
- buckwheat-blini
- buffalo-chicken-wings
- burger-patties-meatballs
- buss-up-shut
- buttermilk-fried-chicken
- buttermilk-pancakes
- butternut-squash-soup
- cabbage-piroshki
- cabbage-rolls
- cacik

baking (19):
- cinnamon-rolls-american
- cinnamon-rolls-scandinavian
- cloverleaf-rolls
- coconut-cream-pie
- coconut-ice
- coconut-ice-pink-white
- coconut-layer-cake
- coconut-lime-traybake
- coffee-and-walnut-cake
- coffee-cake-american-streusel
- coffee-walnut-cake
- coffee-walnut-layer-cake
- coffee-walnut-traybake
- conversation-tart
- cornbread-southern
- cornbread-sweet-northern
- cornish-fairings
- cornish-saffron-cake
- cottage-loaf

mindset (19):
- i-release-conflict-with-sleep-and-allow-cooperation
- i-release-contraction-and-allow-joyful-flow
- i-release-debt-fear-and-allow-steady-flow
- i-release-fear-of-big-numbers-and-allow-multi-million-confidence
- i-release-fear-of-inheritance-loss-and-allow-safe-structure
- i-release-fear-of-market-swings-and-allow-long-term-faith
- i-release-fear-of-wealth-visibility-and-allow-safety
- i-release-hoarding-and-allow-continuous-flow
- i-release-isolation-in-big-decisions-and-allow-aligned-support
- i-release-money-fear-from-the-family-line
- i-release-money-shame-i-release-it-now
- i-release-old-financial-tension-and-allow-permanent-ease
- i-release-old-money-judgments-and-allow-loving-relationship
- i-release-remaining-doubt-and-allow-deep-trust
- i-release-rushing-to-next-and-allow-present-gratitude
- i-release-scarcity-and-allow-limitless-wealth
- i-release-scarcity-and-allow-permanent-overflow
- i-release-self-doubt-and-allow-confidence-with-wealth
- i-release-the-need-for-chaos-and-allow-stable-peace

sustainability (6):
- understanding-u-values
- understanding-your-electricity-bill-and-smart-tariffs
- using-finished-compost-in-the-garden
- using-wood-ash-in-compost
- vapour-control-layers-explained
- vermicomposting-troubleshooting
