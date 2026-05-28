Batch 2026-05-28-batch2: 60 tutorials retrofitted. Deploy green, healthz 200.

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

## Voice-retrofit progress

Before this fire: 1180 PUBLISHED rows with voiceRetrofittedAt IS NULL (from batch44 hand-off).
After this fire:  1120 PUBLISHED rows with voiceRetrofittedAt IS NULL.
Delta: 60 rows newly retrofitted. Matches batch apply count.

PUBLISHED with voiceRetrofittedAt NOT NULL: 2415.

## Spot-check

Random pick from the batch: `irish-stew` (cooking).

DB row state:
- slug: `irish-stew`
- voiceRetrofittedAt: 2026-05-28T00:40:47.605Z
- public URL: https://homemade.education/cooking/irish-stew

First paragraph (DB body, post-rewrite):

> Irish stew is one of the most minimal dishes in the British repertoire. Lamb neck, potato, onion, water, and time. That is the purist version. The recipe here adds a small amount of thyme and parsley. That is a common modern touch and does not change the character of the dish. Carrots appear in some versions and not others. Their use is a matter of regional preference, not authenticity.

Live page first paragraph: the public site is still behind the
pre-launch splash gate (`apps/web/src/app/coming-soon/`), so the public
URL renders the "coming soon" page rather than the tutorial body. The
DB row is the source of truth for verification. Same pattern as
batches 41 to 44.

## 5 sample public URLs across the batch

- https://homemade.education/cooking/huevos-rancheros
- https://homemade.education/cooking/hungarian-goulash
- https://homemade.education/baking/sausage-rolls-rough-puff
- https://homemade.education/baking/shokupan
- https://homemade.education/mindset/tapping-to-attract-the-right-advisors-and-deals

## Before / after openings, 3 tutorials

### Cooking (RECIPE): huevos-rancheros paragraph[0]

Before:

> The dish is built in three layers: a corn tortilla crisped briefly in oil so it holds up without going limp, a fried egg with a runny yolk, and a ranchero salsa (tinned tomatoes, garlic, chilli, cumin) that is sharp, a little spicy, and loose enough to soak into the tortilla edges. The eggs are fried, not scrambled, and served sunny-side up or over-easy so the yolk breaks when you cut into it and mixes with the salsa.

After:

> The dish has three layers. A corn tortilla, crisped briefly in oil so it does not go limp. A fried egg with a runny yolk on top. And a ranchero salsa of tinned tomatoes, garlic, chilli, and cumin. The salsa is sharp, a little spicy, and loose enough to soak into the edges of the tortilla. Fry the eggs sunny-side up or over-easy. The yolk breaks when you cut into it and mixes with the salsa.

### Cooking (RECIPE): irish-stew paragraph[0]

Before:

> The traditional Irish stew is one of the most minimal dishes in the British repertoire: lamb neck, potato, onion, water, and time. Purists would stop there; the version here adds a small amount of thyme and parsley, which is a common enough modern addition without changing the character of the dish. Carrots appear in some versions and not others; their inclusion is a matter of regional preference rather than authenticity.

After:

> Irish stew is one of the most minimal dishes in the British repertoire. Lamb neck, potato, onion, water, and time. That is the purist version. The recipe here adds a small amount of thyme and parsley. That is a common modern touch and does not change the character of the dish. Carrots appear in some versions and not others. Their use is a matter of regional preference, not authenticity.

### Mindset (PRACTICE): tapping-to-attract-the-right-advisors-and-deals paragraph[0]

Before:

> A five-minute tapping practice from Day 74 of a 12-week money programme. The script works with the feeling of facing large financial decisions without the right people around you, and moves toward a settled expectation of aligned advisors, mentors, and opportunities coming in at the right time.

After:

> A five-minute EFT tapping practice from Day 74 of a 12-week money programme. The script works with the feeling of facing large money decisions without the right people around you. It moves toward a settled expectation that the right advisors, mentors, and opportunities will turn up at the right time.

## Category counts

cooking: 21, baking: 21, mindset: 18. Total applied: 60.

## Verbatim-EFT-blocked drops

3 mindset slugs picked but dropped at rewrite time because their only
voice-check failure is on a verbatim EFT setup statement that cannot be
reworded per the verbatim-energy-statements memory rule:

- tapping-to-anchor-trust-in-multi-million-investments
- tapping-to-build-generational-wealth
- tapping-to-celebrate-daily-freedom-and-joy

Added to the known-blocked set in the next pick script so they are not
picked again on subsequent fires.

## Word-count drops

No file dropped over 20% of its original word count. Rewrites were
surgical: orientation paragraphs and cultural-note paragraphs shortened
into 6 to 10-word sentences; in 6 tapping tutorials the redundant
"Where this practice comes from" attribution paragraph was removed
because the same content is on the Sources block via sourceNotes.

## Em-dash sweep

Grep over the batch directory found 2 pre-existing dashes in
non-prose fields (subtitle, yieldDescription) that voice-check does
not gate. Replaced with plain hyphen / comma before commit so the
committed JSON files are dash-clean:

- scottish-tablet-traditional.json subtitle: em-dash replaced with comma
- shortbread-all-butter-rounds.json yieldDescription: en-dash in
  "20-24 rounds" replaced with hyphen

## Anything surprising

Nothing structural. The 1120 IS-NULL pool is now heavily mindset-only
(the cooking and baking remaining is fronted by the next ~30 slugs in
alphabetical order, then tapers off into more mindset slugs). The
21-cooking / 21-baking / 21-mindset balance held for this fire; the
next fire will likely tilt more toward mindset as the pool shifts.

## One-line forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 1120.
