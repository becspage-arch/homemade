Batch 2026-05-28-batch1: 59 tutorials retrofitted. Deploy green, healthz 200.

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

## Voice-retrofit progress

Before this fire: 1239 PUBLISHED rows with voiceRetrofittedAt IS NULL (from batch43 hand-off).
After this fire:  1180 PUBLISHED rows with voiceRetrofittedAt IS NULL.
Delta: 59 rows newly retrofitted. Matches batch apply count.

PUBLISHED with voiceRetrofittedAt NOT NULL: 2355.

## Spot-check

Random pick from the batch: `hob-nobs` (cooking).

DB row state:
- slug: `hob-nobs`
- voiceRetrofittedAt: 2026-05-27T23:45:56.606Z
- public URL: https://homemade.education/cooking/hob-nobs

First paragraph (DB body, post-rewrite):

> Hob Nobs. A British home-cook's dish, the kind of recipe families adjust across generations. Adjustable for what you need.

(The hob-nobs change in this batch was inside the Method orderedList step 5, not paragraph[0]. The opening above was already in register pre-rewrite.)

Live page first paragraph: the public site is still behind the
pre-launch splash gate (`apps/web/src/app/coming-soon/`), so the public
URL renders the "coming soon" page rather than the tutorial body. The
DB row is the source of truth for verification. Same pattern as
batches 41 to 43.

## 5 sample public URLs across the batch

- https://homemade.education/cooking/gumbo-chicken-andouille
- https://homemade.education/cooking/hard-dough-bread
- https://homemade.education/baking/pumpkin-bread-american
- https://homemade.education/baking/rough-puff-pastry
- https://homemade.education/mindset/tapping-for-the-good-mother-pressure

## Before / after openings, 3 content types

### Cooking (RECIPE): holubtsi paragraph[0]

Before:

> Holubtsi differ from Polish gołąbki in two principal ways: the filling uses both pork and beef mince (which gives a slightly more complex flavour than all-pork), and sunflower oil replaces butter as the fat in the filling and sauce. The tomato sauce is made from tinned tomatoes rather than a lighter stock-and-puree mixture, resulting in a more intensely flavoured braise.

After:

> Holubtsi differ from Polish gołąbki in two main ways. The filling uses both pork and beef mince. That gives a slightly richer flavour than all-pork. Sunflower oil replaces butter as the fat in the filling and sauce. The tomato sauce is made from tinned tomatoes, not a lighter stock-and-puree mix. The braise is more intensely flavoured as a result.

### Baking (RECIPE): ricotta-cheesecake-sicilian paragraph[0]

Before:

> Where the New York cheesecake is dense and rich, this Sicilian version is lighter and more delicate, the ricotta gives a texture that is almost mousse-like at the centre. The pastry case is a *pasta frolla*, a sweet Italian short pastry that lines the base and sides of a springform tin. The filling is beaten ricotta, eggs, sugar, and the flavourings that make Sicilian baking distinctive: orange zest and candied peel, vanilla, and a scrape of lemon.

After:

> The New York cheesecake is dense and rich. This Sicilian version is lighter and finer. The ricotta gives a texture that is almost mousse-like at the centre. The pastry case is a *pasta frolla*, a sweet Italian short pastry. It lines the base and sides of a springform tin. The filling is beaten ricotta, eggs, sugar, and the flavours that set Sicilian baking apart. Those are orange zest and candied peel, vanilla, and a scrape of lemon.

### Mindset (PRACTICE): tapping-for-the-good-mother-pressure paragraph[0]

Before:

> A five-minute EFT tapping practice for the good mother pressure. The script works through the constant internal audit of whether you are mothering correctly, the shifting goalposts of adequacy, and the exhaustion of being perpetually evaluated: by others and, more relentlessly, by yourself.

After:

> A five-minute EFT tapping practice for the good-mother pressure. The script works through the steady inner check on whether you are mothering well enough. It taps the moving goalposts, and the tiredness of being judged: by other people and, more sharply, by yourself.

## Category-by-category count

cooking: 21, baking: 21, mindset: 17. Total 59.

(Mindset originally picked 21; 4 dropped to verbatim-EFT blocklist before apply. See "Notable rewrites" below.)

## Content-type-by-content-type count

This is batch 44 overall (well past the first 3 batches that required content-type spread), but for completeness:
RECIPE: 42, PRACTICE: 17.

## Slugs retrofitted (59)

1. gumbo-chicken-andouille
2. gumbo-with-chicken-and-andouille
3. gyros-pork
4. halaszle
5. ham-and-cheese-omelette
6. ham-and-cream-cheese-wraps
7. ham-chive-filo-tartlets
8. hard-dough-bread
9. harira
10. harira-soup
11. harissa-chicken
12. harissa-paste
13. hash-browns
14. hasselback-potatoes
15. hawawshi
16. hob-nobs
17. holodets
18. holubtsi
19. homemade-cheese-bread
20. homemade-cottage-pie
21. honey-garlic-glazed-salmon
22. profiteroles
23. profiteroles-cream-filled
24. pumpernickel-loaf
25. pumpkin-bars-cream-cheese
26. pumpkin-bread-american
27. pumpkin-pie
28. pumpkin-pie-thanksgiving
29. raised-pork-pie
30. raspberry-frangipane-tart
31. red-velvet-cake
32. religieuse-au-chocolat
33. rhubarb-custard-cake
34. ricotta-cheesecake-sicilian
35. ring-doughnuts-classic
36. rock-cakes
37. rock-cakes-currant
38. rocky-road-chocolate
39. rocky-road-slice
40. rosemary-focaccia
41. rough-puff-pastry
42. royal-icing-flat
43. tapping-for-the-good-mother-pressure
44. tapping-for-the-home-comparison-spiral
45. tapping-for-the-marriage-drift
46. tapping-for-the-money-fight-that-keeps-returning
47. tapping-for-the-need-to-control-the-night
48. tapping-for-the-non-linear-grief
49. tapping-for-the-secret-no-to-wealth
50. tapping-for-the-should-be-over-it-pressure
51. tapping-for-the-specific-loss
52. tapping-for-the-trigger-of-her-win
53. tapping-for-the-trying-too-hard-paradox
54. tapping-for-the-wait-for-apology-trap
55. tapping-for-the-windfall-fantasy
56. tapping-for-this-home-today
57. tapping-for-this-isnt-for-me
58. tapping-for-trust-in-perfect-timing
59. tapping-for-turning-40

## Notable rewrites (agent flagged)

- gumbo-with-chicken-and-andouille (cooking): the H2 "Before you start" heading tripped the safety-block rule. The paragraph under it was a useful dark-roux technique note, not safety guidance. Removed the heading and kept the paragraph as a free-standing opening note before the Ingredients block.
- pumpkin-bread-american (baking): paragraph[6] and paragraph[8] were single-sentence wet/dry ingredient steps tokenised heavily ({{pumpkin-puree}}, {{light-brown-sugar}}, and so on). The Flesch-Kincaid calculator treats each scaling token as one long pseudo-word, which pushed both paragraphs to grade 15.4 and 17.2. Split each step into two or three short sentences with the same tokens intact. The substance and the token set are unchanged.
- rough-puff-pastry (baking): paragraph[24] cited Mrs Beeton (1861), Florence White, and Mrs Acton (1845) directly in body prose. All three are already named in sourceNotes. Rewrote the paragraph to keep the British-kitchen lineage in plain English without the named figures.
- holodets (cooking): paragraph[13] named Molokhovets directly in body. Moved the Molokhovets reference to sourceNotes (which did not previously carry her) and rewrote the body line.
- 4 mindset tutorials dropped to the verbatim-EFT KNOWN_BLOCKED list: `tapping-for-the-new-family-story`, `tapping-for-the-over-promised-week`, `tapping-for-the-parent-money-tangle`, `tapping-for-the-unearned-money`. Each has at least one EFT setup statement ("Even though X, I deeply and completely accept myself") whose Flesch-Kincaid score sits above grade 12 and which the verbatim-energy-statements memory exempts from voice rewrites. They cannot be cleanly applied under the current rule set. The accumulated known-blocked list now stands at 21 across batches 40 to 44.
- The "Where this practice comes from" / "Where this comes from" H2 plus its single attribution paragraph was removed from 4 tapping tutorials (need-to-control-the-night, should-be-over-it-pressure, wait-for-apology-trap, money-fight-that-keeps-returning). The same pattern landed in batches 41 to 43: the sourceNotes block carries the same attribution and the public renderer surfaces it as the Sources section, so the in-body duplicate was academic-register prose with no extra information. Substance retained at page foot.
- No file lost over 20% of substantive word count. Removals were duplicate-of-sourceNotes attribution paragraphs and historical figures migrated to sourceNotes.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 1180.

## Deploy verification

GitHub Actions deploy.yml run 26545572990 completed with conclusion
"success". `gh run watch` exited zero.

`curl -sS -o /dev/null -w "%{http_code}\n" https://homemade.education/healthz`
returned `200`.

Session is done.
