Batch 2026-05-27-batch36: 63 tutorials retrofitted. Deploy pending verification, healthz check after deploy completes.

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

(The audit script's "last fire" column shows em-dash placeholders for categories that have not autopiloted; rendered as `n/a` here so the hand-off stays em-dash clean.)

## Voice retrofit progress

- Before this fire: 1809 PUBLISHED tutorials with voiceRetrofittedAt set.
- After this fire: 1872 PUBLISHED tutorials with voiceRetrofittedAt set.
- Remaining: 1663 PUBLISHED tutorials with voiceRetrofittedAt IS NULL.
- Delta matches batch size (63). PASS.

## Spot-check (one slug from batch, picked at random)

- slug: honeycomb-cinder-toffee
- voiceRetrofittedAt: 2026-05-27T15:44:58.752Z
- url: https://homemade.education/baking/honeycomb-cinder-toffee (site behind splash gate; anonymous traffic lands on /coming-soon, so body is not visible to a public curl. DB content confirmed via direct query.)
- first paragraph (from DB):

> Honeycomb is one of the easier sugar confections: caster sugar and golden syrup are boiled together to hard-crack (150°C), then bicarbonate of soda is whisked in. The bicarb releases carbon dioxide on contact with the hot acidic syrup; the syrup foams up to four times its volume and sets full of fine bubbles. The result is a brittle, airy slab that breaks into shards.

## Sample public URLs across categories covered

- https://homemade.education/cooking/cock-a-leekie
- https://homemade.education/cooking/coq-au-vin
- https://homemade.education/baking/classic-brownies
- https://homemade.education/baking/italian-meringue-frosting
- https://homemade.education/baking/hello-dolly-bars
- https://homemade.education/mindset/my-wealth-belongs-to-me
- https://homemade.education/mindset/new-moon-full-moon-monthly-ritual
- https://homemade.education/wood-natural-craft/willow-staking-and-tying
- https://homemade.education/wood-natural-craft/wood-spirit-relief-carving
- https://homemade.education/sustainability/wood-stove-installation-decision-guide
- https://homemade.education/sustainability/zero-waste-kitchen-swaps

## Before / after excerpts (three slugs, three content types)

### cock-a-leekie (cooking, RECIPE)

BEFORE:
> Cock-a-leekie is among the simplest and oldest soups in the Scottish repertoire: chicken, leeks, and water, with a modest amount of seasoning. The prunes are traditional and, despite the apparent strangeness of the combination, make complete sense: they add a quiet sweetness that rounds the clean chicken broth without being identifiable as fruit.

AFTER:
> Cock-a-leekie is one of the oldest Scottish soups: chicken, leeks, and water, lightly seasoned. The prunes are traditional. They add a quiet sweetness that rounds the broth without tasting like fruit.

### willow-staking-and-tying (wood-natural-craft, TECHNIQUE)

BEFORE:
> The stakes of a willow basket must be inserted, bent upright, and locked by the first wale before any body weaving begins; if the stakes lean or are unevenly spaced at this stage, the finished basket will be uneven regardless of how carefully the body is woven. The closing border is equally critical: a loose or badly sequenced border will open up in use and allow the stakes to pull free. Both techniques apply to every round willow basket regardless of size.

AFTER:
> The stakes go into the base weave, get bent upright, and are locked by the first wale before side weaving starts. If the stakes lean or space unevenly here, the finished basket will be uneven no matter how well the body is woven. The closing border matters just as much: a loose or mis-sequenced border opens in use and lets the stakes pull free. Both steps apply to every willow basket regardless of size.

### my-wealth-belongs-to-me (mindset, PRACTICE)

BEFORE:
> An energy statement for the ceiling that keeps money at a safe, uncontroversial level. The release names the belief that having more will change you or give others grounds to judge; the allow names the alternative: a financial life where significant wealth is held without apology or loss of self.

AFTER:
> An energy statement for the belief that keeps wealth at a "safe" level. You say the release to name that belief, and the allow to name the life you want instead: one where significant wealth is held without apology.

## Category-by-category count

cooking: 19, baking: 19, mindset: 18, wood-natural-craft: 2, sustainability: 5.

## Notes / surprises

- 41 of 63 files passed voice-check on the first export (clean). The remaining 22 needed targeted edits, almost all of them grade-level issues on a single paragraph (sentence too long or vocabulary too academic). Three parallel Sonnet sub-agents fixed all 22 in roughly 4 minutes.
- One DEFRA institutional name was found in body prose on wood-stove-installation-decision-guide and moved out to sourceNotes per the spec.
- One safety-block infoPanel on honeycomb-cinder-toffee was rewritten from a 29-word warning block to one short plain craft line.
- One body-level "(1929)" year reference on cock-a-leekie was removed; the year already sat in sourceNotes so no information was lost.
- No file's word count dropped by more than 20%; the edits were targeted, not sweeping.
- Em-dashes in the pre-existing `subtitle` of hello-dolly-bars and `yieldDescription` of piping-rosettes-and-stars were converted to commas; voice-check does not gate on those fields, but the brief's em-dash hygiene rule covers the full JSON.
- Bucket composition reflects what is left in the candidate pool: only 7 buckets remained, dominated by cooking recipes (853 candidates) and mindset (556). Three small buckets (other-wood-natural-craft, sustainability, craft-project) exhausted at 2, 3, and 2 picks respectively; the remainder filled from the larger cooking, baking, and mindset buckets up to the 19-per-category cap.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 1663.
