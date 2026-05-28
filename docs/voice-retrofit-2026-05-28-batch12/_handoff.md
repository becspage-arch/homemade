Batch 2026-05-28-batch12: 63 tutorials retrofitted. Deploy green, healthz 200.

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

(Note: the "last fire" column on the four NOT_READY craft categories printed as an em dash in the script output. Replaced with "n/a" here so this file stays em-dash-free.)

### 2. Voice retrofit progress before and after this fire

```
SELECT COUNT(*) FROM "Tutorial" WHERE status='PUBLISHED' AND "voiceRetrofittedAt" IS NOT NULL
```

- Before: 2883
- After:  2946
- Diff:   63 (matches batch size)

### 3. Random spot-check

- Slug: `pelmeni`
- voiceRetrofittedAt: `2026-05-28T10:43:32.803Z`
- Public URL: https://homemade.education/cooking/pelmeni (HTTP 200)

The Homemade public site is client-rendered behind the pre-launch splash gate, so the rewritten paragraph is not present in the curl-fetched HTML. The DB row carries the new opening verbatim. New first paragraph in DB:

> Making pelmeni is a task for an afternoon and ideally several pairs of hands. In Russia it is traditionally a family activity, everyone gathered around a table, rolling dough, filling, folding, pinching. The process is slow but meditative, and the reward is a large batch that can be frozen and cooked throughout the winter.

### 4. Full slug list (63)

paella-mixta, paella-valenciana, pampushky, pan-con-tomate, paneer-tikka-masala, panna-cotta, panna-cotta-vanilla, panzanella, pappa-al-pomodoro, pappardelle-ai-porcini, pappardelle-al-cinghiale, pappardelle-al-ragu-di-anatra, parma-ham-salad, parmesan-cheese-crisps-laced-with-zucchini-carrots, parmigiana-di-melanzane, parsnip-and-pancetta-tagliatelle-with-parmesan-and-butter, pashtet, passionfruit-martini, pasta-aglio-e-olio, pasta-alla-norma, pasta-e-fagioli, pastitsio, patatas-alinadas, patatas-bravas, patlican-salatasi, patty-melt, pea-and-mint-soup, peach-raspberry-smoothie, peanut-butter-banana-smoothie, peanut-butter-brownies, peanut-butter-oatmeal-smoothie, peanut-butter-overnight-oats, peanut-butter-protein-balls, pear-salad, pearl-barley-risotto-with-mushroom, pears-in-red-wine, pelau, pelau-beef, pelau-chicken, pelmeni, penne-ai-quattro-formaggi, penne-al-salmone, penne-alla-boscaiola, penne-alla-vodka, penne-allarrabbiata, pepper-and-chorizo-picnic-frittata, pepper-sauce-trinidad, pepperpot-soup, pepperpot-soup-jamaican, peshwari-naan, philly-cheesesteak, pholourie, picadillo, picadillo-cuban, piccalilli, pici-allaglione, pici-cacio-e-pepe, pide-kiymali, pierogi, pierogi-ruskie, pierogi-with-potato-and-cheese, pierogi-z-grzybami, pierogi-z-kapusta.

## Sample public URLs across the batch

- https://homemade.education/cooking/paella-mixta
- https://homemade.education/cooking/pappardelle-al-cinghiale
- https://homemade.education/cooking/pasta-e-fagioli
- https://homemade.education/cooking/peanut-butter-oatmeal-smoothie
- https://homemade.education/cooking/penne-ai-quattro-formaggi
- https://homemade.education/cooking/philly-cheesesteak
- https://homemade.education/cooking/pierogi-z-kapusta
- https://homemade.education/cooking/piccalilli
- https://homemade.education/cooking/pelmeni
- https://homemade.education/cooking/pici-cacio-e-pepe

## Before / after excerpts (3 tutorials, cooking)

### pappa-al-pomodoro, "Where this dish lives" paragraph

Before (grade 15.3):

> Pappa al pomodoro is Florentine by origin and Tuscan by adoption. Artusi documented it as a workman's lunch, bread that was too old to eat fresh given a second life in summer tomatoes and olive oil. It became famous to a wider Italian audience in 1958 when a children's television programme featured a song about it, turning a peasant dish into a national comfort food.

After:

> Pappa al pomodoro started in Florence and spread across Tuscany. The 19th-century cookery writer Artusi set it down as a workman's lunch. Stale bread got a second life in summer tomatoes and olive oil. The dish went national in the late 1950s after a children's TV show featured a song about it. A peasant dish turned into a comfort-food classic.

### penne-al-salmone, history paragraph

Before (grade 17.7):

> Penne al salmone is northern Italian urban cooking of the 1980s, the decade when Italian food became simultaneously more cosmopolitan and more convenience-driven. It appears on the menus of Italian restaurants across Britain from the mid-1990s onwards, where it occupied the position of reliable crowd-pleaser.

After:

> Penne al salmone is northern Italian city cooking from the 1980s. That was the decade when Italian food became both more worldly and more about convenience. It turned up on Italian restaurant menus in Britain from the mid-1990s. It was a reliable crowd-pleaser: clearly Italian, mild in flavour, and built from things you can keep in the fridge for a week.

### piccalilli, history paragraph

Before (grade 12.5, plus Mrs Beeton with no inline gloss):

> Piccalilli is what late-Victorian British cookery called Indian pickle. Mrs Beeton's 1861 recipe runs under that name; the word piccalilli took over by the end of the nineteenth century.

After:

> Piccalilli is what late-Victorian British cookery called Indian pickle. The Victorian cookery writer Mrs Beeton printed it under that name in 1861. The word piccalilli took over by the end of the 1800s.

## Category-by-category count

- cooking: 63

(Alphabetical slug-ascending order put us deep in the cooking backlog; this batch landed inside the "pa" through "pi" stretch.)

## Anything that surprised me

- 29 of 63 files passed voice-check unchanged on first scan; only 34 needed work. The author pipeline appears to be producing closer-to-target prose now than in earlier batches.
- The dominant failure mode in this batch was grade-level on the "Where this dish lives" paragraph (typically the body's last block). The author template is putting historical context into long compound sentences. Most fixes were just splitting compound sentences into shorter ones, not rewording vocabulary.
- One safety-block heading sneaked through ("Before you start" on penne-allarrabbiata). Removed the heading entirely; the following paragraph was a craft note, not a safety advisory, so the section is fine standing on its own.
- pears-in-red-wine and piccalilli both referenced Mrs Beeton in body prose. piccalilli kept the reference and added the "Victorian cookery writer" gloss in the same sentence. pears-in-red-wine moved the Beeton citation out of the body and into sourceNotes; the body paragraph reads cleaner without it.
- No word-count drop above 20% on any file. The rewrites were sentence-splits and vocab simplifications, not deletions.

## Forward read

PUBLISHED tutorials with voiceRetrofittedAt IS NULL after this fire: 589.
