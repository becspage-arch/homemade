Batch 2026-05-27-batch28: 50 tutorials retrofitted. Deploy green, healthz 200.

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

- Before this fire: 1331 PUBLISHED tutorials with voiceRetrofittedAt set.
- After this fire: 1381 PUBLISHED tutorials with voiceRetrofittedAt set.
- Remaining: 2154 PUBLISHED tutorials with voiceRetrofittedAt IS NULL.
- Delta matches batch size (50). PASS.

## Spot-check (one slug from batch)

- slug: wet-felting-a-flat-panel
- voiceRetrofittedAt: 2026-05-27T07:45:07.924Z
- url: https://homemade.education/fibre-arts/wet-felting-a-flat-panel (site behind splash gate; anonymous traffic lands on /coming-soon, so body is not visible to a public curl. DB content confirmed via direct query.)
- new first paragraph (from DB):

> A flat felt panel is where wet felting starts. A small piece of merino roving, a bar of olive-oil soap, hot water, and a kitchen surface: in 30 to 45 minutes the fibres lock together into a firm, stable fabric. Every subsequent felting project, from bowls to hats to needle-felted pictures, uses this same foundation. Learn the physical signs of each stage here, and the rest follows.

## Sample public URLs across categories

- https://homemade.education/cooking/borscht
- https://homemade.education/cooking/bouillabaisse
- https://homemade.education/baking/chocolate-tart
- https://homemade.education/baking/choux-pastry-base
- https://homemade.education/mindset/i-invest-with-clarity
- https://homemade.education/mindset/i-keep-what-comes-to-me
- https://homemade.education/wood-natural-craft/stop-cut-technique
- https://homemade.education/sustainability/thermal-bridging-explained
- https://homemade.education/animals-smallholding/worming-chickens
- https://homemade.education/pottery-ceramics/wedging-clay-spiral-method

## Before / after excerpts (three content types)

### Sustainability READING: thermal-bridging-explained (paragraph[0])

BEFORE:
> A thermal bridge forms wherever a material with a higher lambda value than the surrounding insulation spans from the warm interior to the cold exterior. In a timber-framed wall, studs conduct roughly three times more heat per unit area than the mineral wool between them. In a steel-framed structure, the steel carries approximately 1000 times more heat than the insulation: even a small frame fraction dominates the total heat loss.

AFTER:
> A thermal bridge forms wherever a material with a higher lambda value than the insulation runs from the warm inside to the cold outside. In a timber-framed wall, the studs carry about three times more heat per square metre than the mineral wool between them. In a steel-framed wall, the steel carries about 1000 times more heat than the insulation. Even a small steel fraction sets the total heat loss.

### Wood-natural-craft TECHNIQUE: stop-cut-technique (paragraph[2])

BEFORE:
> Use the stop cut whenever a carving cut must stop at a defined edge and the grain direction could carry the blade past that edge. The three most common situations are: chip carving patterns (where each triangle is defined by three stop cuts before any material is removed), relief carving (where an outline cut defines the panel boundary before the ground is lowered around it), and making a shoulder cut in any woodwork where two surfaces meet at a corner.

AFTER:
> Use the stop cut whenever a carving cut must end at a clear edge and the grain might carry the blade past that edge. Three common uses. In chip carving, each triangle is set up by three stop cuts before any wood is taken out. In relief carving, an outline cut sets the panel boundary before the ground is lowered around it. And in any woodwork where two surfaces meet at a corner, the stop cut makes the shoulder.

### Pottery-ceramics TECHNIQUE: wedging-clay-spiral-method (paragraph[23])

BEFORE:
> The rhythm is the experienced potter's tell, pushing, rocking, rotating in a steady pulse like a slow heartbeat. The hands feel the clay's resistance change as the wedging progresses: a stiff fresh block softens slightly under repeated compression, a too-wet block tightens slightly as moisture redistributes, and a well-wedged block reads as uniformly resistant to the push with no soft spots that take the hand by surprise.

AFTER:
> The rhythm is the experienced potter's tell. Push, rock, rotate in a steady pulse like a slow heartbeat. Your hands feel the clay change as you wedge. A stiff fresh block softens a little under repeated compression. A too-wet block tightens a little as moisture spreads out. A well-wedged block feels evenly firm to the push, with no soft spots.

## Category breakdown (50 total)

- animals-smallholding: 6
- baking: 6
- cooking: 6
- fibre-arts: 4
- mindset: 7
- paper-word: 7
- pottery-ceramics: 2
- sustainability: 6
- wood-natural-craft: 6

## Content type breakdown (batches past 3 do not require type spread; recorded for visibility)

- PATTERN: 6
- PRACTICE: 7
- READING: 2
- RECIPE: 12
- TECHNIQUE: 23

## Surprises and notes

- Baseline voice-check on the picked 50 showed 31/50 already clean. The autopilot author has been generating new content in the locked register, so this batch needed targeted fixes only on 19 files (mostly grade-level long sentences and one file with bulk em-dash usage).
- wet-felting-a-soap-covering.json had a "Before you start" warning infoPanel (safety-block error); removed per the safety-block rule, with no replacement since the step-level rubbing instruction already covers the hot-water and lye-free temperature note where it matters.
- standalone-home-battery-decision-guide.json had five paragraphs above grade 12, including an 18.5-grade list item; all rewritten to plain English without losing the safety-certification or carbon-aware nuance.
- worm-egg-count-and-wormer-resistance.json: rewrote the opener but kept the domain-specific terms (faecal egg count, refugia, anthelmintic resistance) verbatim because the existing glossaryTooltip marks reference those exact surface strings; the rewrite reads cleaner and tooltips are preserved.
- chouquettes-sugar-puffs.json and spencerian-capital-letters.json had en/em dashes in fields the apply script does not write (yieldDescription and title); local JSON edited so the em-dash grep on the batch directory came back clean, but DB title and yield remain unchanged from this fire (those fields will get retrofitted via a separate pass if needed).
- No body was over-pruned. Largest word-count drop was on standalone-home-battery infoPanel body (419 chars to 374 chars, well under 20%); all other rewrites were within 10% of the original word count.

## Forward read

PUBLISHED tutorials with voiceRetrofittedAt IS NULL after this fire: 2154.
