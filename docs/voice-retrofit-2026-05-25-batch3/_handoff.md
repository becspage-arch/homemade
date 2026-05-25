Batch 2026-05-25-batch3: 50 tutorials retrofitted. Deploy green, healthz 200.

## DB verification

### audit-recent-state (full category table)

```
CATEGORIES
ord | slug                  | status      | subs | last fire        | PUB    | DRAFT
  1 | cooking               | READY       |    2 | 2026-05-20 17:21 |   1139 |     0
  2 | baking                | READY       |    8 | 2026-05-20 13:33 |    573 |     0
  3 | garden                | NOT_READY   |    9 | 2026-05-17 15:05 |      0 |     4
  4 | mindset               | READY       |   11 | 2026-05-20 19:20 |    845 |     0
  5 | herbal-medicine       | NOT_READY   |   10 | 2026-05-20 08:38 |     42 |     0
  6 | crochet               | NOT_READY   |    5 | -                |      0 |     4
  7 | knitting              | NOT_READY   |    9 | -                |      0 |     3
  8 | needlework            | NOT_READY   |    4 | -                |      0 |     3
  9 | sewing                | NOT_READY   |   15 | -                |      0 |     2
 10 | fibre-arts            | READY       |    6 | 2026-05-20 20:30 |    127 |     0
 11 | wood-natural-craft    | READY       |    6 | 2026-05-20 23:08 |    162 |     0
 12 | paper-word            | READY       |    9 | 2026-05-21 00:28 |    117 |     0
 13 | pottery-ceramics      | READY       |    6 | 2026-05-21 02:42 |     82 |     0
 14 | animals-smallholding  | READY       |    6 | 2026-05-21 04:28 |    121 |     0
 15 | home-repair           | READY       |    6 | 2026-05-21 06:49 |    123 |     0
 16 | natural-home          | READY       |    5 | 2026-05-21 01:23 |     82 |     0
 17 | sustainability        | READY       |    6 | 2026-05-21 06:49 |    122 |     0

IMAGE VERIFICATION
  UNVERIFIED                   : 1508
  REJECTED_USED_PROCEDURAL     : 43
  VERIFIED                     : 1227
```

### Before vs after counts (revisedFrom IS NOT NULL on PUBLISHED rows)

- Before batch3 apply: 1887 retrofitted, 1648 unretrofitted
- After batch3 apply: 1937 retrofitted, 1598 unretrofitted
- Difference: +50 retrofitted, -50 unretrofitted (matches batch size exactly)

### Spot-check: elderberry-profile

- slug: elderberry-profile
- revisedFrom IS NOT NULL: true
- First 200 chars of revisedFrom:

```
{"type":"doc","content":[{"type":"paragraph","content":[{"text":"Elderberry, Sambucus nigra, is the hedgerow's autumn berry, taken in syrups and warm decoctions through the cold season. The deep-purpl
```

The snapshot holds the OLD body for this slug (the pre-rewrite text starting with the Latin name "Sambucus nigra" and the longer pre-retrofit phrasing). The NEW body in the DB starts with the rewritten plain-English opening. Snapshot intact.

### Slugs retrofitted in this batch (50)

```
air-fryer-chips-fresh-cut
air-fryer-cod-fillet
air-fryer-courgette-fries
air-fryer-fish-cakes
air-fryer-fish-fillets
air-fryer-fish-fingers
air-fryer-haddock-fillet
air-fryer-hash-browns
applying-skim-coat-to-plasterboard
attaching-a-pulled-handle
basic-leather-care-cleaning-and-conditioning
bath-salts-lavender
bee-space-and-hive-maintenance
beeswax-honeycomb-sheet-candle
beeswax-pillar-candle
beeswax-scented-jar-candle
beeswax-taper-candles
behind-whose-schedule-journal
bicarbonate-scouring-paste
big-sums-are-safe-to-hold
bills-are-met-i-am-met
biosecurity-on-a-smallholding
bisque-firing-schedule-cone-06
bleeding-a-radiator
blending-fibres-on-drum-carder
body-in-perimenopause-what-shifts
bouquet-combing-pattern
bradel-binding
breaking-a-broody-hen
breeding-management-meat-rabbits
building-a-field-shelter-from-treated-timber
building-a-floating-shelf-with-hidden-brackets
building-a-garden-gate-simple-frame
building-a-hay-rack-for-livestock
building-a-simple-shelving-unit
butterfly-key-repair-for-split-tabletop
calendula-lip-balm
chamomile-infusion-for-tension-headache
chamomile-profile
chamomile-sleep-bath
cutting-a-housing-joint
cutting-a-mortise-and-tenon-joint
cutting-and-fitting-foam-for-a-box-cushion
cutting-foam-to-size-for-an-upholstery-project
cutting-tiles-with-a-scorer-and-nipper
descaling-a-shower-head
echinacea-tincture
elderberry-and-ginger-decoction
elderberry-profile
elderberry-syrup
```

## Sample public URLs

- https://homemade.education/herbal-medicine/elderberry-profile
- https://homemade.education/herbal-medicine/chamomile-profile
- https://homemade.education/herbal-medicine/echinacea-tincture
- https://homemade.education/herbal-medicine/elderberry-syrup
- https://homemade.education/mindset/body-in-perimenopause-what-shifts
- https://homemade.education/animals-smallholding/biosecurity-on-a-smallholding
- https://homemade.education/animals-smallholding/building-a-hay-rack-for-livestock
- https://homemade.education/home-repair/bleeding-a-radiator
- https://homemade.education/home-repair/building-a-garden-gate-simple-frame
- https://homemade.education/natural-home/bicarbonate-scouring-paste
- https://homemade.education/cooking/air-fryer-chips-fresh-cut

## Before / after excerpts across three content types

### Herbal (elderberry-profile, opening paragraph)

OLD:
"Elderberry, Sambucus nigra, is the hedgerow's autumn berry, taken in syrups and warm decoctions through the cold season. The deep-purple berries appear in flat-topped clusters in late August through September across the British Isles and continental Europe, on the same tree whose creamy May flowers (elderflower) are the spring cordial. The berries are the herbal medicine kitchen's cold-and-flu staple, recorded in Maud Grieve's Modern Herbal as 'the medicine chest of the country people'."

NEW:
"Elderberry is the hedgerow's autumn berry. The kitchen takes it in syrups and warm simmered drinks through the cold season. Deep-purple berries hang in flat-topped clusters in late August through September across the British Isles and continental Europe. They grow on the same tree as the creamy May flowers (elderflower) of spring cordial. The berries are the herbal kitchen's cold-and-flu staple. Old herbals called the elder tree 'the medicine chest of the country people'."

### Mindset (body-in-perimenopause-what-shifts, opening paragraph)

OLD:
"A reading on what happens to the body in perimenopause and what it means for day-to-day living. Perimenopause can begin in the late thirties and typically runs for several years before menopause. The changes are wide-ranging and are still under-discussed in mainstream health contexts, which means many women arrive at the transition without a useful account of what is happening."

NEW:
"A reading on what happens to the body in perimenopause and what it means for daily life. Perimenopause can start in the late thirties. It runs for several years before menopause itself. The changes are wide-ranging. Many are still under-discussed in mainstream health care, so women often reach this phase without a clear account of what is going on."

### Animals-smallholding (biosecurity-on-a-smallholding, opening paragraph)

OLD:
"The most common route for disease to enter a smallholding is bought-in animals, followed by shared equipment and visitors who have been in contact with other livestock. Biosecurity does not require significant investment; it requires consistent habits."

NEW:
"Most disease arrives on a smallholding through bought-in animals. Next comes shared kit, and visitors who have been near other livestock. Biosecurity is not about money. It is about steady habits."

## Category-by-category count

- home-repair: 13
- cooking: 8
- natural-home: 7
- herbal-medicine: 7
- animals-smallholding: 6
- mindset: 4
- pottery-ceramics: 2
- paper-word: 2
- fibre-arts: 1

## Content-type-by-content-type count (spread rule)

- recipe: 8
- craft-project: 7
- craft-technique: 7
- mindset: 7
- natural-home-recipe: 7
- home-repair: 7
- herbal: 7

This batch covers 7 content buckets (every type present in PUBLISHED content). The `growing-guide` bucket is empty because the garden category is still NOT_READY with 0 PUBLISHED tutorials. With this third batch the first-3-batches content-type spread rule is fully met for every type that exists in published content.

## Surprises

- 32 of the 50 picked files were already clean against the voice-check rule set on first scan. Only 18 needed rewriting. The pre-scan picker uses alphabetical-first ordering and the remaining unretrofitted pool already includes a lot of content that was authored under the new register, so the lift per batch is dropping. Future batches will likely show the same pattern.
- The herbal-medicine slugs took most of the time (chamomile-profile had 18 errors, elderberry-profile 25, elderberry-syrup 12). All three were dense materia-medica entries with stacked academic citations, Latin binomials in body prose, and "decoction" / "anti-inflammatory" / "anhydrous" clinical vocab. The rewrites move every citation to sourceNotes (which already had them) and replace clinical vocab with plain English while keeping the tooltipped first instance.
- Three "Important safety notes" infoPanels (chamomile-profile, echinacea-tincture, elderberry-profile, elderberry-and-ginger-decoction) carried bureaucratic register at grade 13 to 18. Compressed each drastically to plain English while preserving every contraindication, dose threshold, and pregnancy / paediatric note. None of these blocks tripped the safety-block structural rule because their tone is "info", not "warning".
- "Maceration jar" appeared in echinacea-tincture step 1 as a literal container name. Replaced with "steeping jar" since "maceration" trips the clinical-vocab rule when not tooltipped. Same for repeated "decoction" instances inside elderberry-syrup and elderberry-and-ginger-decoction step prose: the introductory tooltipped "decoction" stays, all later instances rewritten to "brew" or "simmered drink".
- Two en-dash characters were detected by the final grep that the voice-check missed: a "6-9 mm" en-dash in the bee-space-and-hive-maintenance subtitle, and a clause-separating en-dash in a bouquet-combing-pattern recipeTools name field. Both fixed by hand before commit.
- No file dropped more than ~10 percent of word count in the body. Bodies that were already grade-clean stayed untouched (only 18 of 50 had any rewrite). The 18 rewritten files mostly broke long sentences into short ones rather than removing substance.

## Forward read

1598 PUBLISHED tutorials still have revisedFrom IS NULL after this batch. Next cron fire (15:30) will pick the next 50 from that pool. Combined batches today: batch1 (50) + batch2 (21) + batch3 (50) = 121 retrofitted in the 2026-05-25 batch run.
