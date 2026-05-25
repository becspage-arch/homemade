Batch 2026-05-25-batch2: 21 tutorials retrofitted. Deploy verification pending after push.

## Why this batch is 21, not 50

A parallel worker session committed `2026-05-25-batch1` (50 tutorials) onto `main` at 18:01 UTC, while this session was still rewriting. Both sessions started from the same alphabetical-first candidate pool, so 29 of this session's 50 picked slugs overlapped with batch1.

To reconcile cleanly:
1. The 29 overlap slugs had their bodies restored to the parallel worker's batch1 wording (their `_batch-voice-apply.ts` was re-run on `2026-05-25-batch1` after pull). The two voice-retrofit versions are functionally equivalent; both pass voice-check. Their version is canonical because it's what's in their committed JSON files.
2. The 21 slugs unique to this session's pick (alphabetically later, mostly pottery + later home-repair / cooking / herbal) form this batch (`2026-05-25-batch2`).
3. Both batches' JSON files now match the live DB body state for their respective slugs.

The next cron fire will see 1648 candidates remaining (combined effect of both batches today) and should pick a fresh 50 with the full spread rule.

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
  UNVERIFIED                   : 737
  REJECTED_USED_PROCEDURAL     : 427
  VERIFIED                     : 1231
```

### Before vs after counts (revisedFrom IS NOT NULL on PUBLISHED rows)

- Before this session's first apply: 1866 retrofitted
- After this session's first apply (50 slugs): 1887 retrofitted (+21 newly snapshotted; 29 already had snapshots from the parallel worker's batch1 apply)
- After re-apply of canonical batch1 and final state of batch2: 1887 retrofitted, 1648 remaining

The +21 matches the 21 unique slugs in this batch. The other 29 of this session's picks were already counted toward batch1's +50 in the parallel worker's apply.

### Spot-check: applying-pva-sealer-and-varnish

- slug: applying-pva-sealer-and-varnish
- revisedFrom IS NOT NULL: true
- First 200 chars of revisedFrom:

```
{"type":"doc","content":[{"type":"paragraph","content":[{"text":"Sealing air-dry clay is the last step before a piece goes into use. PVA glue diluted 1:1 with water brushes on as a first coat sealer t
```

The snapshot contains the OLD body for this slug (the pre-voice-retrofit text). Snapshot intact.

### Slugs retrofitted in this batch (21)

```
applying-pva-sealer-and-varnish
applying-wax-resist-for-glaze-decoration
assessing-pasture-quality-for-small-flocks
autumn-feeding-sugar-syrup-to-bees
bakewell-tart
banana-cream-pie
basketry-materials-guide
bastille-bar-soap
bath-bombs-fizzing
beech-bowl-hand-carved
beech-bread-bin
bokashi-indoor-composting
bokashi-second-stage
braided-rush-log-basket
brushed-underglaze-decoration-on-bisqueware
chamomile-eye-compress
chamomile-infusion-for-colic
coil-and-pinch-combined-bowl
coil-built-herb-pot-trio
coil-built-planter-air-dry-clay
coil-built-tall-amphora-jar
```

## Sample public URLs

- https://homemade.education/herbal-medicine/chamomile-infusion-for-colic
- https://homemade.education/herbal-medicine/chamomile-eye-compress
- https://homemade.education/baking/bakewell-tart
- https://homemade.education/baking/banana-cream-pie
- https://homemade.education/natural-home/bastille-bar-soap
- https://homemade.education/natural-home/bath-bombs-fizzing
- https://homemade.education/sustainability/bokashi-indoor-composting
- https://homemade.education/animals-smallholding/autumn-feeding-sugar-syrup-to-bees
- https://homemade.education/animals-smallholding/assessing-pasture-quality-for-small-flocks
- https://homemade.education/wood-natural-craft/beech-bowl-hand-carved
- https://homemade.education/wood-natural-craft/beech-bread-bin
- https://homemade.education/pottery-ceramics/brushed-underglaze-decoration-on-bisqueware
- https://homemade.education/pottery-ceramics/coil-and-pinch-combined-bowl

## Before / after excerpts across three content types

### Herbal (chamomile-infusion-for-colic, opening paragraph)

OLD:
"A cup of chamomile after a meal that has left the stomach cramping. Chamomile's antispasmodic action on the gut has been documented since Culpeper (1652) and is confirmed in the EMA's 2015 monograph, the herb relaxes smooth muscle in the digestive tract and eases the cramping pattern that follows a gassy, over-large, or poorly digested meal."

NEW:
"A cup of chamomile after a meal that has left the stomach cramping. Chamomile's antispasmodic action on the gut is a long-recorded kitchen tradition. The herb relaxes the smooth muscle in the gut. It eases the cramping that follows a gassy or heavy meal."

### Wood-natural-craft (beech-bowl-hand-carved, opening paragraph)

OLD:
"Beech has been the standard British bowl wood for centuries because it holds an edge cleanly, is hard enough for daily kitchen use, and is available from managed woodland."

NEW:
"Beech is the classic British bowl wood. It cuts cleanly, stands up to daily kitchen use, and comes from managed woodland."

### Animals-smallholding (assessing-pasture-quality-for-small-flocks, paragraph 2)

OLD:
"Walk the field monthly and note: the proportion of bare soil visible (any area where bare patches exceed 10% of the visible sward is overgrazed or poached), the weed species present (docks, thistles, and rushes indicate poor drainage or nutrient imbalance; ragwort must be removed by the roots), and the sward height across the field."

NEW:
"Walk the field every month. Note how much bare soil shows. Bare patches over 10% mean the ground is overgrazed or poached. Note which weeds are growing. Docks, thistles, and rushes point to poor drainage or low nutrients. Ragwort must be pulled out by the roots. And note the sward height across the field."

## Category-by-category count

- pottery-ceramics: 7
- wood-natural-craft: 4
- animals-smallholding: 2
- baking: 2
- herbal-medicine: 2
- natural-home: 2
- sustainability: 2

## Content-type-by-content-type count (spread rule)

- craft-project: 8 (pottery + wood)
- craft-technique: 3 (pottery)
- recipe-baking: 2
- herbal: 2
- natural-home: 2
- sustainability: 2
- animals-smallholding: 2

This batch covers 7 content buckets. Missing from this batch (covered by the parallel batch1 instead): recipe-cooking, mindset, home-repair, paper-word, fibre-arts. The first-3-batches spread rule was met across the combined 71 retrofits today, just not within batch2 alone.

## Surprises

- Race condition with the parallel worker. The cron fires hourly; if a previous fire's session is still rewriting when the next fires, the two pick from the same candidate pool and collide. This batch reconciled by deferring to the earlier commit and reducing to the 21 non-overlapping slugs. Note for the cron skill: pick should re-check the candidate set against any in-flight batch directories in `docs/voice-retrofit-*/_slugs.json` before exporting, and treat slugs already in an in-flight batch as taken.
- Picker filter `revisedFrom: { equals: Prisma.DbNull }` selected some tutorials that subsequently turned out to have non-null revisedFrom by apply time (the 29 overlap with batch1). The picker was correct at pick time; the parallel worker's apply between pick and apply changed the state. The mitigation above (check in-flight batch dirs) handles this.
- The narrower category spread for batch2 (7 buckets vs the 12 that batch1 + batch2 together cover) is a downstream effect of being the second pick after the alphabetically-earlier slugs were taken. Future batches will rebalance once both batches today are accounted for in the candidate pool.
- The "Method 2, Solar maceration" heading in calendula-infused-oil was renamed to "Solar steep" (and Method 1 "Heat maceration" likewise to "Heat steep") to clear a clinical-vocab finding. This change is in the parallel worker's batch1 canonical version, not in this batch2 (calendula-infused-oil is one of the 29 overlap slugs and now reflects the parallel worker's wording).

## Forward read

1648 PUBLISHED tutorials still have revisedFrom IS NULL. The next cron fire will pick the next 50 from that pool. Total retrofitted today: 71 (50 batch1 from the parallel worker + 21 batch2 from this session).
