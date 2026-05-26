# Voice retrofit batch 2026-05-26-batch19

Batch 2026-05-26-batch19: 50 tutorials retrofitted. Deploy green, healthz 200.

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

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 881
After this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL):  931
Delta: +50 (matches the batch size).

Source of truth: `pnpm --filter "@homemade/db" exec tsx scripts/_count-voice-retrofitted.ts`.

Output after this fire:

```
voice_retrofitted_published: 931
remaining_published:         2604
total_published:             3535
```

### 3. Random spot-check

Slug: i-am-a-woman-with-money
voiceRetrofittedAt: 2026-05-26T21:38:53.037Z

DB first-paragraph text:

> An affirmation from Day 22 of the MONEY program. Short, direct, present tense. The function is simple: to say the identity statement out loud before the day's choices are made, so the body hears it as the current frame rather than a future wish.

Public URL: https://homemade.education/mindset/i-am-a-woman-with-money. The URL returns HTTP 200. The public site sits behind the splash gate, so anonymous visits to a tutorial URL still resolve to the coming-soon page rather than the tutorial body. The DB-side spot-check above is the live state that the tutorial page renders once a visitor is past the gate.

### 4. Full slug list (50)

1. baked-raspberry-cheesecake
2. baked-ziti
3. baklava
4. bamia
5. bammy
6. brioche-classic-parisian
7. brioche-enriched
8. brioche-loaf
9. brioche-nanterre
10. brown-butter-chocolate-chip-cookies
11. i-already-live-the-small-habits-of-the-wealthy
12. i-am-a-calm-capable-sleeper
13. i-am-a-safe-place-for-money-to-land
14. i-am-a-wise-wealth-creator
15. i-am-a-woman-with-money
16. letter-spacing-and-rhythm
17. loft-conversion-insulation-options
18. loft-hatch-insulation-and-draught-sealing
19. loft-insulation-top-up-mineral-wool
20. lokta-paper-sheet-forming
21. long-stitch-journal-over-tapes
22. low-carbon-heating-options
23. making-a-cotton-rag-pulp
24. making-a-mould-and-deckle
25. making-compost-tea
26. oak-serving-board-through-tenon
27. opening-a-thrown-mound
28. oval-willow-shopping-basket
29. overhand-knot-macrame
30. overshot-weave-basics
31. painting-air-dry-clay-acrylics
32. pickup-stick-patterns-rigid-heddle
33. pine-display-box-sliding-lid
34. pine-shadow-box-frame
35. pole-lathe-bodger-turning
36. pre-tupping-ewe-management
37. preparing-a-lambing-kit
38. preventing-flystrike-in-rabbits
39. putting-the-ram-in-for-tupping
40. queen-marking-and-clipping
41. repairing-a-stair-balustrade-spindle
42. repairing-cracked-render-on-an-outside-wall
43. repairing-lifting-veneer-on-a-table-top
44. replacing-a-basin-tap
45. replacing-a-ceiling-rose
46. slab-box-with-lid-air-dry-clay
47. slab-built-oval-planter
48. slab-cup-air-dry-clay
49. slab-jewellery-dish
50. slab-oval-soap-dish

## Sample public URLs across categories

1. https://homemade.education/baking/baklava
2. https://homemade.education/cooking/bamia
3. https://homemade.education/mindset/i-am-a-woman-with-money
4. https://homemade.education/home-repair/repairing-lifting-veneer-on-a-table-top
5. https://homemade.education/animals-smallholding/preparing-a-lambing-kit
6. https://homemade.education/sustainability/low-carbon-heating-options
7. https://homemade.education/wood-natural-craft/pole-lathe-bodger-turning
8. https://homemade.education/paper-word/letter-spacing-and-rhythm
9. https://homemade.education/fibre-arts/overshot-weave-basics
10. https://homemade.education/pottery-ceramics/slab-jewellery-dish

## Before / after excerpts

### Recipe (baking) - baklava

Before:
> Baklava is one of the most contested foods in the Eastern Mediterranean, claimed with equal conviction by Turkey, Greece, Lebanon, Syria, Iran, and several other countries, all of whom make slight variations. The Ottoman Empire spread the technique of layered filo across the entire region during its expansion, and each culinary tradition adapted it.

After:
> Baklava is one of the most argued-over foods in the Eastern Mediterranean. Turkey, Greece, Lebanon, Syria, Iran, and several other countries all claim it as theirs, and each one makes a slightly different version. Layered filo pastry spread across the region under the Ottoman Empire, and each cooking tradition shaped it to its own taste.

### Sustainability - low-carbon-heating-options

Before:
> Heating accounts for around 80% of domestic energy use in the UK: approximately 80% of that is met by natural gas. The grid electricity carbon intensity has fallen substantially (from 450 g/kWh in 2012 to approximately 150 g/kWh in 2025), making electric heating increasingly low-carbon.

After:
> Heating uses about 80% of the energy in a UK home. Around 80% of that heat comes from natural gas. The carbon hit per kWh of grid electricity has fallen a long way (from 450 g/kWh in 2012 to about 150 g/kWh now), so electric heating gets cleaner each year.

### Craft technique (wood) - pole-lathe-bodger-turning

Before:
> A firmer chisel driven into the rotating blank at the parting point produces the final separation cut. Hold the firmer chisel at 90 degrees to the cylinder, bevel toward the work, and advance it into the blank on the downstroke; it cuts a parting groove down to the centre. Stop 5 mm from the centre and complete the cut with a handsaw or a knife while the blank is stationary; the rotating blank splits unpredictably if parted completely by chisel while turning.

After:
> A firmer chisel driven into the spinning blank at the parting point makes the final cut. Hold the chisel at 90 degrees to the cylinder, bevel toward the work, and push it in on the downstroke. It cuts a parting groove down to the centre. Stop 5 mm from the centre and finish the cut with a handsaw or a knife while the blank is still. If you part it right through with the chisel while it spins, the blank splits in a way you cannot predict.

## Category-by-category count

- animals-smallholding: 5
- baking: 5
- cooking: 5
- fibre-arts: 3
- home-repair: 5
- mindset: 5
- paper-word: 5
- pottery-ceramics: 7
- sustainability: 5
- wood-natural-craft: 5

Total: 50. Cap of 15 per category respected.

## Content-type-by-content-type count

This is batch 19, well past the first 3. Not required, but for completeness:

- recipe (baking): 5
- recipe (cooking): 5
- mindset (affirmation): 5
- animals-smallholding: 5
- home-repair: 5
- sustainability: 5
- craft technique (fibre-arts, paper-word, wood-natural-craft, pottery): 12
- craft project (pottery, wood, paper, fibre-arts): 8

## Notes

- Of the 50 picked, 15 were flagged dirty by the binary voice-check on first scan. 14 were grade-level errors only; 1 (loft-insulation-top-up-mineral-wool) also tripped institutional-in-body for an "Energy Saving Trust" reference inside body prose. The institutional name was replaced with "free ones live online" in the body and remains in sourceNotes.
- The 35 clean files were applied with no body edits. voiceRetrofittedAt was populated on all 50.
- Two paragraphs in loft-conversion-insulation-options were dirty and rewritten; five paragraphs across low-carbon-heating-options were dirty and rewritten. Each rewrite split one long clause-stacked sentence into two or three plain-English sentences and swapped multi-syllable phrases for plain equivalents.
- No file lost more than 20% of its word count. Rewrites preserved substance, including all glossary tooltips (enriched dough, optical spacing, lokta fibres, slurry, U-value, lambda-value, heat pump, SCOP, BUS, veneer blister, caul, clostridial vaccine), ingredient slugs, scaling tokens, troubleshooter blocks, and recipe metadata.
- Em dash / en dash check ran against all 50 JSON bodies, the commit message body, and this hand-off file before commit. Zero matches.

## Forward read

PUBLISHED + voiceRetrofittedAt IS NULL after this fire: 2604.

## Deploy verification

- Commit: 62ba20a on main.
- GitHub Actions deploy run id: 26476866782. Completed green.
- `curl https://homemade.education/healthz` returned 200.
