Batch 2026-05-28-batch13: 75 tutorials retrofitted. Deploy green, healthz 200.

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

(The "last fire" column on the four NOT_READY craft categories printed as a long dash in the script output. Replaced with "n/a" here so this file stays em-dash-free.)

### 2. Voice retrofit progress before and after this fire

```
SELECT COUNT(*) FROM "Tutorial" WHERE status='PUBLISHED' AND "voiceRetrofittedAt" IS NOT NULL
```

- Before: 2946
- After:  3021
- Diff:   75 (matches batch size)

### 3. Random spot-check

- Slug: `ratatouille`
- voiceRetrofittedAt: `2026-05-28T11:41:03.051Z`
- Public URL: https://homemade.education/cooking/ratatouille (HTTP 200)

The Homemade public site is client-rendered behind the pre-launch splash gate, so the rewritten paragraph is not present in the curl-fetched HTML. The DB row carries the new opening verbatim. New first paragraph in DB:

> Ratatouille has a reputation for being simple. It is, but only if you cook each vegetable separately before combining them. If everything goes into the pan together, the courgettes give off liquid and the aubergines steam rather than fry. The result is a uniform, watery mush. Thirty extra minutes of cooking in batches is the difference between a good ratatouille and a mediocre one.

### 4. Full slug list (75)

pierogi-z-miesem, pierogi-z-owocami, pigs-in-blankets, pikelets, pilaf-rice, pilau-rice, pimientos-de-padron, pinchitos-morunos, piperade, pissaladiere, pisto-manchego, pizza-margherita, pizza-napoletana, plain-naan, plantain-chips, ploughmans-lunch, plum-crumble, polenta-con-ragu, polenta-morbida, polish-potato-pancakes, pollo-al-ajillo, pollo-al-limone, pollo-alla-cacciatora, pollo-alla-cacciatore, pollo-alla-diavola, pollo-alla-pizzaiola, pollo-en-pepitoria, polpette-al-sugo, pommes-dauphinoise, pork-and-apple-casserole, pork-chops-with-cider-and-apples, pork-chops-with-mustard-cream-sauce, pork-loin-mustard-cream, pork-pie, pork-schnitzel, porkolt, porridge, posset-lemon, pot-au-feu, pot-roast, potato-salad, potted-shrimp, poule-au-pot, poulet-a-la-creme, poulet-a-la-moutarde, poulet-a-lestragon, poulet-basquaise, poulet-chasseur, poulet-roti, prawn-cocktail, pressure-cooker-beef-stew, pressure-cooker-chicken-stock, pressure-cooker-chickpea-curry, pressure-cooker-pulled-pork, pressure-cooker-red-lentil-dhal, pudding-and-souse, pulled-pork, pulpo-a-la-gallega, queen-of-puddings, quiche-lorraine, quick-pickled-red-onions, quick-poached-egg-garlic-spinach-bagel, quick-weeknight-lasagne, rabbit-pie, ragu-alla-bolognese, raita, ras-el-hanout, raspberry-fool, raspberry-jam, rassolnik, ratatouille, ravioli-di-ricotta-e-spinaci, raw-raspberry-brownie-truffle, red-beans-and-rice, red-wine-gravy.

## Sample public URLs across the batch

- https://homemade.education/cooking/pierogi-z-miesem
- https://homemade.education/cooking/pizza-napoletana
- https://homemade.education/cooking/polenta-con-ragu
- https://homemade.education/cooking/pollo-en-pepitoria
- https://homemade.education/cooking/potted-shrimp
- https://homemade.education/cooking/poule-au-pot
- https://homemade.education/cooking/pulled-pork
- https://homemade.education/cooking/queen-of-puddings
- https://homemade.education/cooking/ratatouille
- https://homemade.education/cooking/red-beans-and-rice

## Before / after excerpts (3 tutorials, cooking)

### poule-au-pot, opening paragraph

Before (grade 16.0):

> Poule au pot is one of the simplest things you can make, and one of the most satisfying: a whole chicken, submerged in cold water, brought slowly to a gentle simmer, and coaxed for ninety minutes until the cooking liquid has become a proper broth and the chicken is tender throughout. You get two courses from one pot: the broth first, with a few of the smaller vegetables, and the chicken and remaining vegetables after.

After:

> Poule au pot is one of the simplest things you can make, and one of the most satisfying. A whole chicken, put into cold water, brought slowly to a gentle simmer, and coaxed for ninety minutes. The cooking liquid turns into a proper broth, and the chicken cooks through to tender. You get two courses from one pot. The broth comes first, with a few of the smaller vegetables. The chicken and the rest of the vegetables come after.

### raspberry-jam, "Where this dish lives" paragraph

Before (Beeton without inline gloss):

> Raspberry jam is the easiest of the British summer preserves, high pectin, high acid, almost incapable of failing for a careful cook. Beeton calls it the housewife's first jam. Spread on hot buttered toast for breakfast, layered into a Victoria sponge, spooned over Greek yoghurt at lunch.

After:

> Raspberry jam is the easiest of the British summer preserves. High pectin, high acid, almost incapable of failing for a careful cook. The Victorian cookery writer Mrs Beeton called it the housewife's first jam. Spread it on hot buttered toast for breakfast, layer it into a Victoria sponge, spoon it over Greek yoghurt at lunch.

### pulled-pork, "Where this dish lives" paragraph

Before (grade 19.1):

> Pulled pork is the product of the American barbecue tradition, and in particular of the Carolinas, where the whole-hog and pork shoulder barbecue has been a cultural practice for centuries. The slow-smoking of whole pigs over wood fires was documented in the American South from the colonial period, and the vinegar-based sauce of the Carolinas (as distinct from the tomato-and-sugar sauce of Kansas City) reflects a culinary tradition rooted in specific geography. The oven version sacrifices the smoke but retains everything else, and the result (a pile of tender, flavour-soaked pork on a soft roll with coleslaw) is one of the most satisfying things the American kitchen produces.

After:

> Pulled pork is the product of the American barbecue tradition, and the Carolinas in particular. Whole-hog and pork-shoulder barbecue has been a cultural practice there for centuries. Slow-smoking whole pigs over wood fires was recorded in the American South from colonial times. The vinegar-based sauce of the Carolinas (as opposed to the tomato-and-sugar sauce of Kansas City) reflects a food tradition rooted in specific geography. The oven version loses the smoke but keeps everything else. The result, a pile of tender, flavour-soaked pork on a soft roll with coleslaw, is one of the most satisfying things the American kitchen produces.

## Category-by-category count

- cooking: 75

(Alphabetical slug-ascending order put us deep in the cooking backlog; this batch landed in the "pi" through "re" stretch.)

## Anything that surprised me

- 32 of 75 files passed voice-check unchanged on the first scan; 43 needed work. Slightly worse hit rate than batch12 (29 of 63), but in the same range. The "Where this dish lives" closing paragraphs are still the dominant failure mode: long compound sentences packing multiple regions, dates, and clauses into single units.
- Six files (polenta-morbida, pollo-alla-cacciatora, polpette-al-sugo, pommes-dauphinoise, pot-roast, red-beans-and-rice) had a "Before you start" H2 sitting on top of a craft tip paragraph. The heading itself trips the safety-block rule even when the body underneath is fine. Removed the heading in each; the following paragraph stands on its own as a tip.
- Six subtitles (ploughmans-lunch, polenta-morbida, pollo-alla-cacciatora, pommes-dauphinoise, pressure-cooker-red-lentil-dhal, red-beans-and-rice) carried a stray em-dash. The voice-check em-dash rule only fires on body paragraphs, not subtitles, so these slipped through the automated gate. Caught them with a manual `grep` before committing per the brief; rewrote each as a colon, comma, or sentence break.
- Three "Beeton" / Jane-Grigson references needed fixing: pressure-cooker-beef-stew (removed the Beeton reference entirely, kept the substance); raspberry-jam (added a "Victorian cookery writer Mrs Beeton" gloss in the same sentence); pork-chops-with-cider-and-apples (removed the parenthesised (1974) and (1982) year-only references, kept the cookery writer name with a gloss). The years remain in sourceNotes where they belong.
- No word-count drop above 20% on any file. All rewrites were sentence-splitting and vocabulary simplification, not deletions.

## Forward read

PUBLISHED tutorials with voiceRetrofittedAt IS NULL after this fire: 514.
