# Voice retrofit batch 2026-05-26-batch18

Batch 2026-05-26-batch18: 50 tutorials retrofitted. Deploy green, healthz 200.

## DB verification

### 1. audit-recent-state output

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
  UNVERIFIED                   : 2316
  VERIFIED                     : 1219
```

(Hyphens replace en dashes in the script output to keep this file em-dash and en-dash clean.)

### 2. Voice retrofit count: before and after

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 831
After this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL):  881
Delta: +50 (matches the batch size).

Source of truth: `pnpm --filter "@homemade/db" exec tsx scripts/_count-voice-retrofitted.ts`.

Output after this fire:

```
voice_retrofitted_published: 881
remaining_published:         2654
total_published:             3535
```

### 3. Random spot-check

Slug: winter-spice-simmer-pot
voiceRetrofittedAt: 2026-05-26T20:40:27.504Z

DB first-paragraph text:

> A winter spice simmer pot. The way it works is simple. Scented oils in the spices, peel, and herbs lift with the steam as it rises, carrying the fragrance through the room. Cinnamon and cloves give a warm, sweet base. Star anise adds a liquorice note that deepens the blend. Orange peel adds a bright top note. Fresh rosemary adds a clean herbal edge so the blend doesn't get too sweet.

Live URL: https://homemade.education/natural-home/winter-spice-simmer-pot. The live page rendered the new opening paragraph identical to the DB text above after the deploy turned green.

### 4. Full slug list (50)

1. outdoor-pig-paddock-rotation
2. oxalic-acid-trickle-treatment-for-varroa
3. polymer-clay-teardrop-earrings
4. polymer-clay-textured-bangle
5. needle-felting-fine-detail
6. needle-felting-on-fabric
7. removing-and-replacing-ceramic-wall-tiles
8. repairing-a-chair-leg-with-a-new-spindle
9. how-to-know-when-youve-hit-a-money-block
10. how-to-tell-inner-voice-from-anxiety-reading
11. toilet-cleaning-fizz-tabs
12. toilet-cleaning-powder
13. junk-journal-ephemera-collage-spread
14. kettle-stitch
15. kolrosing-design-guide
16. kolrosing-technique
17. brandy-snaps-cream-filled
18. brandy-truffles
19. baked-apples-sultanas
20. baked-brown-sugar-chicken-wings
21. kitchen-caddy-routine
22. led-lighting-home-upgrade
23. pig-nutrition-and-feed-management
24. rigid-heddle-scarf-with-pickup
25. needle-felting-wire-armature-figure
26. repairing-a-larger-plasterboard-hole
27. how-visualisations-work
28. turmeric-honey-cold-process-soap
29. kozo-washi-sheet-forming
30. marking-gauge-technique
31. brioche-a-tete
32. baked-croissants
33. linking-two-water-butts-in-series
34. planning-rotational-grazing-paddocks
35. sgraffito-abstract-tile
36. nuno-felting-a-silk-scarf
37. repairing-a-rotted-window-sill
38. how-wealth-identity-gets-built
39. whipped-shea-body-butter
40. layered-scrapbook-page
41. mortise-tenon-oak-picture-frame
42. brioche-burger-buns
43. baked-meatballs
44. loft-boarding-over-insulation
45. post-and-rail-fencing-for-stock
46. simple-latch-hook-rug
47. nuno-felting-on-linen
48. repairing-a-small-tear-in-leather
49. i-act-boldly-and-trust-myself
50. winter-spice-simmer-pot

## Sample public URLs across categories

1. https://homemade.education/cooking/baked-meatballs
2. https://homemade.education/baking/brioche-a-tete
3. https://homemade.education/mindset/how-visualisations-work
4. https://homemade.education/natural-home/turmeric-honey-cold-process-soap
5. https://homemade.education/wood-natural-craft/marking-gauge-technique
6. https://homemade.education/home-repair/repairing-a-rotted-window-sill
7. https://homemade.education/animals-smallholding/planning-rotational-grazing-paddocks
8. https://homemade.education/sustainability/led-lighting-home-upgrade
9. https://homemade.education/fibre-arts/nuno-felting-a-silk-scarf
10. https://homemade.education/paper-word/kettle-stitch

## Before / after excerpts

### Recipe (cooking) - baked-apples-sultanas

Before:
> Bramley apples are the best choice for baking whole: their flesh collapses readily during cooking and the skin keeps the apple upright in the dish rather than spreading into a puddle. The score around the middle is not decorative, it prevents the skin from splitting unevenly and lets the apple expand without cracking open on one side.

After:
> Bramley apples are the best for baking whole. The flesh softens fast and the skin keeps the apple upright in the dish, instead of spreading into a puddle. The score around the middle is not for show. It stops the skin splitting unevenly and lets the apple expand without cracking open on one side.

### Mindset (reading) - how-to-tell-inner-voice-from-anxiety-reading

Before:
> Intuition tends to have these qualities: it is quiet rather than loud; it is stable rather than fluctuating; it does not need to be repeatedly justified; it points toward something rather than away from everything; and when it is ignored, it does not escalate into catastrophe thinking, it simply remains.

After:
> Intuition tends to feel quiet, not loud. It is steady, not jumpy. It does not need to be justified again and again. It points toward something, rather than away from everything. When it is ignored, it does not turn into catastrophe thinking. It simply remains.

### Home repair (pattern) - repairing-a-rotted-window-sill

Before:
> Localised wet rot in a window sill is a standard repair for a painted-joinery window. The rot occurs where water has been lying on the sill face (failed paint, lifted putty at the glass joint) or where water-trapping detail has held moisture against end grain. The two-part epoxy system (consolidant and filler) is the correct repair for damage affecting up to about 30 percent of the cross-section; for deeper structural damage, a timber splice repair or full sill replacement is the right answer.

After:
> Localised wet rot in a window sill is a standard repair for a painted timber window. The rot starts where water has been sitting on the sill (failed paint, lifted putty at the glass) or where a fold in the joinery has trapped water against end grain. A two-part epoxy system (consolidant plus filler) is the right fix for damage up to about a third of the sill's thickness. For deeper damage, the right call is a timber splice or a full sill replacement.

## Category-by-category count

- cooking: 4
- baking: 4
- mindset: 5
- home-repair: 5
- animals-smallholding: 5
- natural-home: 5
- sustainability: 4
- fibre-arts: 7
- pottery-ceramics: 3
- paper-word: 4
- wood-natural-craft: 4

Total: 50.

## Content-type-by-content-type count

This is batch 18, well past the first 3. Not required, but for completeness:

- recipe (cooking + baking): 8
- mindset (reading + practice): 5
- craft technique: 5
- craft project: 5
- home repair: 5
- natural home recipe: 5
- animals smallholding: 5
- sustainability: 4
- paper / wood reference: 8

## Notes

- Of the 50 picked, only 16 were flagged dirty by the binary voice-check on first scan, all with grade-level errors (one also tripped year-in-body for inline (2025) references). Most flagged paragraphs were already short and clean but used 3-4 syllable words that pushed the Flesch-Kincaid grade above 12. Rewrites focused on splitting one long clause-stacked sentence into two or three plain-English sentences and swapping "disproportionately"-shaped words for plain equivalents.
- The 34 clean files were applied with no body edits. voiceRetrofittedAt was populated on all 50.
- One file (how-visualisations-work.json) needed a second pass because the first rewrite of paragraph 17 still scored 12.1 (just above threshold).
- No file lost more than 20% of its word count. Rewrites preserved substance, including all glossary tooltips, ingredient slugs, scaling tokens, troubleshooter blocks, and recipe metadata.
- Em dash / en dash check ran against all 50 JSON bodies, the commit message body, and this hand-off file before commit. Zero matches.

## Forward read

PUBLISHED + voiceRetrofittedAt IS NULL after this fire: 2654.
