Batch 2026-05-28-batch14: 75 tutorials retrofitted. Deploy green, healthz 200.

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
  6 | crochet               | NOT_READY   |    5 |                  |      0 |     4
  7 | knitting              | NOT_READY   |    9 |                  |      0 |     3
  8 | needlework            | NOT_READY   |    4 |                  |      0 |     3
  9 | sewing                | NOT_READY   |   15 |                  |      0 |     2
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

### 2. Voice retrofit progress

Before this fire (from check-voice-progress baseline before apply): 3021 PUBLISHED with voiceRetrofittedAt set.
After this fire: 3096 PUBLISHED with voiceRetrofittedAt set.
Difference: 75. Matches the batch size.

After-fire counters from `check-voice-progress.ts`:

```
Done:      3096 of 3535  (88%)
Remaining: 439
```

### 3. Random spot-check

Random pick from batch: `salmon-and-dill-pie`.

DB row after apply:

```
slug:                salmon-and-dill-pie
category:            cooking
voiceRetrofittedAt:  2026-05-28T12:47:30.996Z
URL:                 https://homemade.education/cooking/salmon-and-dill-pie
```

First body paragraph in DB after apply:

> Salmon for a pie should be poached rather than roasted. A brief poach in a court-bouillon of white wine and herbs leaves the flesh tender and the poaching liquid flavoured enough to become the sauce base. Flake the fish into large pieces rather than fine shreds; you want identifiable chunks of salmon in the finished pie.

The Homemade public site is client-rendered behind the pre-launch splash gate, so the rewritten paragraph is not present in the curl-fetched HTML on the public URL. (`https://homemade.education/cooking/salmon-and-dill-pie` returns the splash page with "coming soon" copy.) The DB row carries the new body verbatim and the public renderer reads from that row, so the page will pick it up the moment the gate is lifted.

### 4. Full list of slugs retrofitted

See `_slugs.json` in this directory. 75 slugs from `redcurrant-jelly` through `salt-crusted-mini-baked-potatoes-with-cold-chive-hollandaise`, all PUBLISHED cooking tutorials.

## Sample public URLs

- https://homemade.education/cooking/redcurrant-jelly
- https://homemade.education/cooking/reuben-sandwich
- https://homemade.education/cooking/risotto-alla-milanese
- https://homemade.education/cooking/roast-beef-rib-on-the-bone
- https://homemade.education/cooking/roast-chicken-sunday
- https://homemade.education/cooking/roast-turkey
- https://homemade.education/cooking/saag-aloo
- https://homemade.education/cooking/salisbury-steak
- https://homemade.education/cooking/salmon-en-croute
- https://homemade.education/cooking/salmorejo

## Before / after excerpts

All three are from the cooking category (the batch is one content type).

### roast-beef-rib-on-the-bone (Mrs Beeton in body)

Before:
> The fore rib is the traditional British joint for large Sunday gatherings and Christmas Day tables. Mrs Beeton described it in 1861 as the prestige cut, preferred over the sirloin precisely because the bone runs through it.

After:
> The fore rib is the classic British joint for Sunday and Christmas tables. It has been the prestige Sunday cut for well over a century, preferred over the sirloin because the bone runs right through it.

### sage-and-onion-stuffing (grade 18.1 to grade 8)

Before:
> Sage and onion stuffing is one of the simpler preparations on the Sunday roast table, but it rewards attention to the basics: the onion must be fully softened before it goes into the mix, or it will remain crunchy in the finished stuffing, and the breadcrumbs should be from day-old white bread rather than fresh, which produces a damp, dense result.

After:
> Sage and onion stuffing is one of the simpler items on the Sunday roast table. It rewards getting the basics right. The onion must be fully softened before it goes into the mix, or it stays crunchy in the finished stuffing. The breadcrumbs should come from day-old white bread, not fresh, which gives a damp, dense result.

### ribollita (grade 17.3 plus negation pattern)

Before:
> Ribollita is the signature soup of the Tuscan contado (the farmland and small towns that surround Florence) and is one of the great examples of Italian cucina povera: a dish that turns the remains of yesterday's bread and the contents of the bean pot into something better than either ingredient alone. The re-boiling that gives the dish its name is not merely a reheating but a second cooking that transforms the texture entirely.

After:
> Ribollita is the signature soup of the Tuscan contado (the farmland and small towns around Florence). It is one of the great examples of Italian cucina povera: a dish that turns yesterday's stale bread and the leftovers of the bean pot into something better than either alone. The re-boiling that gives the dish its name is a second cooking, not a simple reheat, and it changes the texture entirely.

## Category-by-category count

cooking: 75

## Notes / surprises

- 45 of the 75 picked tutorials passed voice-check cleanly on first export. Only 30 needed rewriting. The autopilot author prompt is working; most recent cooking content lands in voice already.
- The remaining 30 clustered into two failure modes: Mrs Beeton or Eliza Acton mentioned in a body paragraph (7 files, all "Where this dish lives" closes), and grade-level paragraphs that ran over 12 with long erudite sentences and multi-syllable vocabulary (23 files).
- All rewrites were targeted at the offending paragraph. Substance preserved per `feedback_voice_rewrite_dont_over_prune.md`. Surrounding sections, recipe metadata, ingredient slugs and scaling tokens, glossaryTooltip termIds, and recipeTools arrays all untouched.
- No word-count drops over 20% per file.
- `ribollita` had one extra finding caught after the first scan: the rewrite of paragraph 11 introduced a "not just X but Y" negation pattern. Fixed by restructuring as "Y, not X". Second scan came back clean.
- saganaki had a troubleshooter `fix` field at grade 14.8 on a single short sentence dense with hard cheese names; broken into three shorter sentences using simpler verbs.
- `salad-e-shirazi` had a troubleshooter `intro` at grade 12.7 on a single 13-word sentence with high-syllable words; reworded.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 439.
