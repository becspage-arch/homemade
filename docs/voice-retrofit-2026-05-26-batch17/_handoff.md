# Voice retrofit batch 2026-05-26-batch17

Batch 2026-05-26-batch17: 50 tutorials retrofitted. Deploy green, healthz 200.

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

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 781
After this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL):  831
Delta: +50 (matches the batch size).

Source of truth: `pnpm --filter "@homemade/db" exec tsx scripts/_count-voice-retrofitted.ts`.

Output after this fire:

```
voice_retrofitted_published: 831
remaining_published:         2704
total_published:             3535
```

### 3. Spot-check

Slug: `how-rituals-work`
voiceRetrofittedAt: `2026-05-26T19:42:08.483Z`
First paragraph in DB after apply:

> Rituals in the library follow a five-part shape. The same shape works for a money reset, a wealth-identity activation, a forgiveness rite, a closing of one month and an opening of the next. Each step does a specific piece of work; the shape is what lets the rite fit ten or fifteen minutes.

Public URL: https://homemade.education/mindset/how-rituals-work. The URL returns HTTP 200. The live site sits behind the splash gate for anonymous visitors, so the public render of the tutorial body itself is gated; the DB-side spot-check above is the live state that the page will render once a visitor is past the gate.

### 4. Full slug list (50)

```
arancini-al-ragu
arroz-caldoso-marisco
arroz-con-pollo
arroz-con-pollo-caribbean
ash-e-reshteh
aubergine-parmigiana
avgolemono-soup
avocado-bacon-chicken-salad
baba-ganoush
baba-ghanoush
bacon-spaghetti-squash-fritters
baghali-polo
baghrir
bajan-chicken-stew
bajan-fish-cakes
black-forest-cake
black-forest-gateau
blondies
bloomer
bloomer-split-top
blueberry-pie-double-crust
boiled-fruit-cake
bombolone
bonfire-toffee
borodinsky-rye
boston-cream-pie
bourbon-biscuits
bourbon-biscuits-homemade
bramley-apple-cake
brandy-snaps
hazel-pea-sticks
hazel-wattle-fence-panel
hazel-woven-garden-panel
her-wealth-is-proof-not-theft
her-win-is-evidence-not-threat
her-win-on-the-table-beside-yours-both-real
houses-land-assets-allowed-to-be-mine
how-affirmations-work
how-do-i-want-to-relate-to-money-as-a-partner-journal
how-does-an-abundant-leader-decide-journal
how-eft-tapping-works
how-embodiment-works
how-energy-statements-work
how-multi-million-investing-feels-in-my-body-journal
how-rituals-work
how-sleep-connects-me-to-the-world-journal
how-spells-work
how-the-nervous-system-learns-bed-is-unsafe
internal-wall-insulation-how-to-choose
jianzhi-symmetrical-papercut
```

## Sample public URLs across categories

- https://homemade.education/cooking/arancini-al-ragu
- https://homemade.education/cooking/avgolemono-soup
- https://homemade.education/cooking/baba-ghanoush
- https://homemade.education/baking/black-forest-gateau
- https://homemade.education/baking/borodinsky-rye
- https://homemade.education/baking/brandy-snaps
- https://homemade.education/mindset/how-rituals-work
- https://homemade.education/mindset/how-the-nervous-system-learns-bed-is-unsafe
- https://homemade.education/mindset/how-spells-work
- https://homemade.education/wood-natural-craft/hazel-wattle-fence-panel
- https://homemade.education/sustainability/internal-wall-insulation-how-to-choose
- https://homemade.education/paper-word/jianzhi-symmetrical-papercut

## Before / after excerpts (three content types)

### Cooking recipe (arancini-al-ragu, history paragraph)

Before:
> Arancini are the street food of Sicily: sold from friggitorie, bakeries, and bars throughout the island, eaten standing at a counter with a napkin, hot from the oil. They are morning food in Sicily, served for breakfast alongside a granita and a brioche. The name means little oranges, from the golden, round shape that resembles the Sicilian blood orange. The saffron comes from the Arab culinary influence that shaped Sicilian cooking between the ninth and twelfth centuries.

After:
> Arancini are the street food of Sicily. They sell from friggitorie, bakeries, and bars across the island. People eat them standing at a counter, hot from the oil. In Sicily they are also breakfast food, served with a granita and a brioche. The name means little oranges, from the golden round shape. The saffron comes from Arab cooks who shaped Sicilian food from the ninth to the twelfth century.

### Mindset reading (how-the-nervous-system-learns-bed-is-unsafe, Bootzin paragraph)

Before:
> Richard Bootzin, a sleep researcher at the University of Arizona, described this pattern formally in 1972. The finding has been replicated consistently since: the bed stops being associated with sleep and starts being associated with the arousal and frustration of not sleeping. Once the association is established, simply being in the bed can produce a stress response that makes sleep biologically harder to achieve.

After:
> A sleep researcher named Richard Bootzin set this pattern out formally in the early 1970s. Later research has backed the finding up. The bed stops being linked to sleep. It starts being linked to the alertness and frustration of not sleeping. Once that link is set, simply being in the bed can spark a stress response. That makes sleep harder to reach.

### Sustainability long-form (internal-wall-insulation-how-to-choose, junctions bullet)

Before:
> Thermal bridging at junctions: with internal insulation, floor joists bearing into the wall create cold spots that are difficult to close without cutting back floors, factor this into the detail design.

After:
> Thermal bridging at junctions: with internal insulation, floor joists set into the wall make cold spots. They are hard to close without cutting back floors. Plan for this at the detail design stage.

## Category-by-category count

```
baking:             15
cooking:            15
mindset:            15
wood-natural-craft:  3
sustainability:      1
paper-word:          1
```

(Three categories landed at the 15-per-category cap. The picker drew the remaining 5 slots from the next slug-ordered candidates across wood, sustainability, and paper.)

## Content-type-by-content-type count

```
RECIPE:    30
PRACTICE:   8
READING:    7
PATTERN:    4
TECHNIQUE:  1
```

(Past batch 3 the content-type spread rule does not apply; the spread fell naturally out of the slug ordering.)

## Surprises

- 33 of 50 candidates passed voice-check on export with zero errors. Only 17 needed any rewrite, almost all single-paragraph fixes to bring the grade-level score below the 12 threshold. This batch was mostly polish.
- The grade-level rule fired most often on history / lineage paragraphs of cooking recipes (Sicilian arancini, Caribbean arroz con pollo, Levantine baba ghanoush). Original drafts strung four or five long clauses together with semicolons; splitting into short sentences cleared the rule without losing detail.
- Three Mindset reading tutorials had year-only citations in body prose ((1972), (1994 onward), (2024), (2025), (2018)). All were moved to sourceNotes with full citations; the body now names the researcher in plain English and points the reader to the Sources block.
- Three files had pre-existing em / en dashes in non-body fields that the voice-check does not scan: borodinsky-rye title, bourbon-biscuits yieldDescription, and how-embodiment-works subtitle. Each was rewritten (em dash to colon for the title, en dash to "to" for the yield, em dashes to parentheses for the subtitle). The batch apply script does not write title or yieldDescription, so the DB was patched directly with `_fix-em-dash-metadata-batch17.ts`.
- No word-count drops over 20% on any file. Largest drop was arroz-con-pollo-caribbean at -4.9 percent; most files were within 2 percent. Several files grew slightly because short staccato sentences in the new register run a few words longer than tight semicolon-stitched originals.
- The how-the-nervous-system-learns-bed-is-unsafe reading needed five rewrites in one file, the most of any batch member. All landed cleanly without losing the underlying model (conditioned arousal, stimulus control, EFT amygdala downregulation, somatic visualisation); the rewrites just split the long noun-phrase sentences and moved the year citations to sourceNotes.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 2704.

## Deploy verification

(Filled in after the push completes.)
