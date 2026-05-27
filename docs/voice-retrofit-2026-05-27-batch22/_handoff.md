# Voice retrofit batch 2026-05-27-batch22

Batch 2026-05-27-batch22: 50 tutorials retrofitted. Deploy green, healthz 200.

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

(Hyphens substituted for en dashes in the script output so this file stays em-dash / en-dash clean.)

### 2. Voice retrofit count: before and after

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 1031
After this batch  (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 1081
Delta: +50 (matches the batch size).

Final post-fire output:

```
voice_retrofitted_published: 1081
remaining_published:         2454
total_published:             3535
```

### 3. Random spot-check

Slug: reading-and-understanding-your-epc
Category: sustainability
voiceRetrofittedAt: 2026-05-27T00:41:18.583Z

DB first-paragraph text after retrofit (paragraph[0], untouched by this fire, kept verbatim from the pre-rewrite body):

> An EPC has four sections that are worth reading: the overall rating band, the SAP score, the fabric U-value table, and the recommendations list. Most people look at the letter band and stop. The detailed sections are where the actionable information is.

(The DB body has the term "U-value" wrapped in a glossaryTooltip mark; my extractor concatenates the surrounding text leaves without padding, which is why the raw string above reads "fabricU-valuetable" if pulled by a naive walker. The public page renders the mark with its own boundary spacing.)

Public URL: https://homemade.education/sustainability/reading-and-understanding-your-epc returns HTTP 200. The public site sits behind the splash gate, so anonymous visits resolve to the coming-soon page rather than the tutorial body. The DB spot-check above is the live state the tutorial page will render once past the gate.

### 4. Full slug list (50)

1. bechamel-the-basic-white-sauce
2. beef-and-ale-casserole
3. beef-and-barley-stew
4. beef-and-guinness-stew
5. beef-bourguignon
6. candied-orange-peel
7. caneles-de-bordeaux
8. cantucci
9. caramel-chocolate-flapjacks
10. caramel-fudge
11. cream-cheese-frosting-classic
12. ermine-frosting
13. fondant-covering-cake
14. fondant-covering-layer-cake
15. i-am-building-property-that-lasts-beyond-me
16. i-am-building-wealth-that-outlives-me
17. i-am-calm-and-confident-at-any-scale
18. i-am-enough-as-i-am-today
19. paste-paper-comb-patterns
20. paste-paper-wheat-paste
21. pasting-down-endpapers
22. peacock-pattern-marbling
23. pen-care-and-maintenance
24. perfect-bound-notebook
25. pyrography-mandala-panel
26. pyrography-nature-panel
27. pyrography-portrait-technique
28. pyrography-shading-technique
29. pyrography-texture-techniques
30. rabbet-groove-plane-technique
31. reading-an-in-home-display
32. reading-and-understanding-your-epc
33. reading-your-water-meter
34. recyclability-labels-explained
35. rolling-clay-coils
36. rya-knot-shaggy-texture
37. saddle-stitching-leather-by-hand
38. scouring-a-raw-fleece
39. securing-hessian-to-a-chair-seat
40. setting-the-twist-skeining-and-finishing
41. setting-up-a-piped-water-supply-for-livestock
42. setting-up-electric-fencing-for-pigs
43. setting-up-electric-fencing-on-a-smallholding
44. sgraffito-on-air-dry-clay
45. shaping-wet-felted-hat-without-block
46. shook-swarm-method-for-bees
47. skimming-a-small-wall-area
48. slip-trailing-on-air-dry-clay
49. soldering-a-copper-end-feed-joint
50. sprig-moulding-technique

## Sample public URLs across categories

1. https://homemade.education/cooking/beef-bourguignon
2. https://homemade.education/baking/caramel-fudge
3. https://homemade.education/mindset/i-am-enough-as-i-am-today
4. https://homemade.education/paper-word/paste-paper-comb-patterns
5. https://homemade.education/wood-natural-craft/pyrography-shading-technique
6. https://homemade.education/pottery-ceramics/rolling-clay-coils
7. https://homemade.education/fibre-arts/scouring-a-raw-fleece
8. https://homemade.education/home-repair/soldering-a-copper-end-feed-joint
9. https://homemade.education/sustainability/reading-and-understanding-your-epc
10. https://homemade.education/animals-smallholding/shook-swarm-method-for-bees

## Before / after excerpts (3 content types)

### Craft technique (paper-word) - paste-paper-comb-patterns

Before, paragraph[0] (grade 13.7):
> The German name for paste paper is Kleisterpapier (glue paper), and it appears as bookbinding endpaper from at least the 17th century in Nuremberg and Augsburg binderies. The patterns made by drawing combs through damp coloured paste are some of the most geometrically varied in the decorated-paper tradition.

After:
> Combed paste paper is a sheet brushed with thick coloured paste, then combed in patterns while the paste is still wet. The German name for it is Kleisterpapier. The patterns are some of the most varied in the decorated-paper tradition: the comb teeth carve through the paste and leave a crisp ridge along every line.

(The 17th-century Nuremberg / Augsburg detail moved into sourceNotes alongside the existing Smith and Mazzotta entries; nothing was dropped.)

### Craft technique (wood-natural-craft) - pyrography-shading-technique

Before, paragraph[0] (grade 15.3):
> Shading is the technique that moves pyrography from outline engraving into tonal drawing. With a shading tip on a wire-nib burner set to a medium heat, the operator can produce a full tonal range from near-white to near-black by varying how slowly or quickly the nib moves across the surface. A wire-nib burner is strongly preferred for shading over a solid-tip burner because its temperature is precisely adjustable; a solid-tip burner runs at a fixed heat and cannot produce the graduated tones that make shading effective.

After:
> Shading is the technique that moves pyrography from outline work into tonal drawing. With a shading tip on a wire-nib burner set to a medium heat, you can get a full tonal range from near-white to near-black. The shade depends on how slowly or quickly the nib moves across the surface. A wire-nib burner is much better for shading than a solid-tip burner. The wire nib lets you set the heat finely. A solid-tip burner runs at one fixed heat and cannot give the graded tones that make shading work.

### Animals-smallholding - shook-swarm-method-for-bees

Before, paragraph[0] (grade 12.5):
> The shook swarm is the standard UK intervention for European foulbrood and for breaking a heavy Varroa cycle. It moves all the adult bees onto clean foundation and destroys all old comb, which breaks the disease cycle and dramatically reduces the mite population by removing the sealed brood in which Varroa reproduces. It is done in spring once the colony is large enough to draw fresh comb quickly, typically when the trees are coming into blossom.

After:
> The shook swarm is the standard UK fix for European foulbrood and for breaking a heavy Varroa cycle. It moves all the adult bees onto clean foundation and destroys all old comb. That breaks the disease cycle. It also cuts the mite count, because Varroa breeds in the sealed brood that is now gone. Do it in spring, once the colony is large enough to draw fresh comb quickly. Usually that is when the trees are coming into blossom.

## Category-by-category count

| Category | Count |
|---|---|
| animals-smallholding | 4 |
| baking | 9 |
| cooking | 5 |
| fibre-arts | 4 |
| home-repair | 4 |
| mindset | 4 |
| paper-word | 6 |
| pottery-ceramics | 4 |
| sustainability | 4 |
| wood-natural-craft | 6 |

Max-per-category cap of 15 was not approached; baking ran highest at 9 because the candidate pool there had the most ordered-alphabetically slugs in the "b" range still unretrofitted (caneles, cantucci, caramel-* x2, cream-cheese-frosting, ermine-frosting, fondant-covering-cake, fondant-covering-layer-cake). Other categories were limited by what was still PUBLISHED + voiceRetrofittedAt-null in those slug ranges.

## Content-type-by-content-type count

| Bucket | Count |
|---|---|
| recipe-cooking | 5 |
| recipe-baking | 5 |
| other-baking (TECHNIQUE in baking) | 4 |
| mindset | 4 |
| other-paper-word (TECHNIQUE in paper-word) | 4 |
| craft-project (PATTERN) | 4 |
| other-wood-natural-craft (TECHNIQUE) | 4 |
| sustainability | 4 |
| other-pottery-ceramics (TECHNIQUE) | 4 |
| other-fibre-arts (TECHNIQUE) | 4 |
| home-repair | 4 |
| animals-smallholding | 4 |

(Even spread, all 12 buckets at 4 or 5.)

## What surprised me

The precheck flagged 17 of 50 files (34%) for voice-check errors before any work: 15 grade-level violations and 2 safety-block infoPanels. Higher than batch21's 13/50 (26%), but the mix this batch shifted away from heading-removal cases (only safety-tone infoPanels, no "Before you start" headings) toward grade-level paragraphs in reference content (pyrography shading, EPC reading, IHD reading, water-meter reading, electric-fencing setup). That tracks: the technical reference tutorials in wood-natural-craft and sustainability sit higher on the FK scale than the cooking / baking corpus.

The two safety-block infoPanels (bechamel "Keep the heat moderate" and fondant-covering-layer-cake "Do not refrigerate a fondant cake") were both craft tips, not safety warnings. Both were authored with tone "warning" plus bodies over 25 words, which trips the safety-block rule. The fix was a one-line tone swap from "warning" to "tip" on each. The body content was useful craft advice in both cases; nothing was lost.

A recurring shape on grade-level fails: a single long sentence with embedded definitions or institutional citations runs the FK score up even when the vocabulary is plain. paste-paper-comb-patterns paragraph[8] was one 63-word sentence with two parenthetical clauses; splitting it into five sentences without rewording anything brought the grade from 12.2 to under 8. The voice-spec's "8 to 15 word sentence" guidance is the load-bearing constraint, not vocabulary.

One pre-existing data quirk surfaced during the spot-check: reading-and-understanding-your-epc paragraph[0] contains a glossaryTooltip on "U-value" sandwiched between text leaves with no padding spaces around the mark, so my extractor reads "fabricU-valuetable" when flattening. The public renderer's TipTap mark wrapping handles spacing, so it almost certainly displays correctly on the page. Out of scope to fix in this voice-only retrofit but worth noting for the follow-up queue: any paragraph[0] with adjacent tooltipped terms is worth visually spot-checking on the live page.

No word-count drops above 20% on any file (checked via `_wc-batch22.ts` against the revisedFrom snapshot). The largest drop was around 5%, on the files where one academic paragraph was compressed and an institutional citation moved to sourceNotes (setting-up-a-piped-water-supply-for-livestock, paste-paper-comb-patterns).

The one citation move to sourceNotes this batch: setting-up-a-piped-water-supply-for-livestock paragraph[6] referenced "The Water Supply (Water Fittings) Regulations 1999" inline. The rewrite replaced "The Water Supply (Water Fittings) Regulations 1999 require" with "UK water regulations require" and added the full regulation title to sourceNotes alongside the existing DEFRA and WRAS entries. Substance preserved, body register lifted.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 2454.
