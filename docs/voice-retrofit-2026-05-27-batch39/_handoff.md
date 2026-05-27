Batch 2026-05-27-batch39: 63 tutorials retrofitted. Deploy green, healthz 200.

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

- Before this fire: 1998 PUBLISHED tutorials with voiceRetrofittedAt set.
- After this fire: 2061 PUBLISHED tutorials with voiceRetrofittedAt set.
- Remaining: 1474 PUBLISHED tutorials with voiceRetrofittedAt IS NULL.
- Delta matches batch size (63). PASS.

## Spot-check (one slug from batch, picked at random)

- slug: devilled-kidneys
- voiceRetrofittedAt: 2026-05-27T18:39:04.474Z
- url: https://homemade.education/cooking/devilled-kidneys (site behind splash gate; anonymous traffic lands on /coming-soon, so body is not visible to a public curl. DB content confirmed via direct query.)
- first paragraph (from DB):

> Three rules for devilled kidneys: the pan must be very hot, the kidneys must be fresh, and the whole thing takes no more than 10 minutes. Overcooked kidneys turn rubbery and develop a bitter flavour; cooked quickly over fierce heat they stay tender with a slight resistance at the centre. Split them open and remove the core of white sinew before cooking, this is not optional.

## Sample public URLs across categories covered

- https://homemade.education/cooking/curry-goat-jamaican
- https://homemade.education/cooking/devilled-mackerel
- https://homemade.education/cooking/dhalpuri-roti
- https://homemade.education/cooking/eggs-benedict
- https://homemade.education/baking/macarons-french-vanilla
- https://homemade.education/baking/marble-loaf
- https://homemade.education/baking/marshmallows-homemade
- https://homemade.education/baking/madeleines
- https://homemade.education/mindset/sitting-with-the-exhausted-past-version-kindly
- https://homemade.education/mindset/standing-in-your-own-hallway-keys-in-hand

## Before / after excerpts (three slugs)

### devilled-mackerel (cooking, RECIPE), paragraph[0]

BEFORE:
> Devilled mackerel is one of the most direct pleasures in British fish cookery: a rich, oily fish that stands up to powerful flavouring, with a skin that blisters under the grill and a devilled butter that melts into the flesh. The combination of mustard and cayenne against the fat of the mackerel is exactly the right balance of punchy and rich.

AFTER:
> Devilled mackerel is one of the best things you can do with a fresh mackerel. The fish is rich and oily, which means it can take strong flavour without being overwhelmed. The skin blisters under the grill and the devilled butter melts into the flesh. Mustard and cayenne against the fat of the fish is the right combination.

(Run-on colon-clause opener split into four short sentences. "Direct pleasures in British fish cookery" and "stands up to powerful flavouring" simplified to plain-English equivalents. Same praise, accessible register.)

### dhalpuri-roti (cooking, RECIPE), paragraph[0]

BEFORE:
> Dhalpuri is the roti you wrap around curry goat or curry chicken in Trinidad; the split pea filling means it has more structure than a plain roti and more flavour to stand up to a robust filling. The process takes a couple of hours but is not particularly difficult (em-dash) the main technique is keeping the split pea filling dry enough that it doesn't burst through the dough when you roll it.

AFTER:
> Dhalpuri is the roti you wrap around curry goat or curry chicken in Trinidad. The split pea filling gives it more structure than a plain roti and more flavour. The process takes a couple of hours but is not difficult. The main thing is keeping the split pea filling dry. If it is too wet, it will burst through the dough when you roll it.

(Semicolon and em-dash both retired; opener split into five short sentences. The "if it is too wet" clause makes the constraint concrete in plain English rather than nested in the original sentence.)

### sitting-with-the-exhausted-past-version-kindly (mindset, PRACTICE), paragraph[8]

BEFORE:
> Original to homemade.education. Compassionate self-visualisation for processing the emotional residue of sleep deprivation.

AFTER:
> Original to homemade.education. A visualisation for sitting with the hard feelings left over from the difficult sleep years.

(Grade-23.3 phrasing simplified to plain English. "Compassionate self-visualisation" and "emotional residue of sleep deprivation" replaced with concrete plain words. Verbatim energy statements and tapping scripts elsewhere in this practice were left untouched.)

## Category-by-category count

cooking: 21, baking: 21, mindset: 21.

(All three buckets hit the 21-per-category cap evenly. The retrofit pool now sits across three categories only; the wood-natural-craft tail of 2 cleared in batch38.)

## Content-type-by-content-type count

(Spec rule applies to first 3 batches only; batches 4+ track category spread alone. Recorded here for completeness.)

RECIPE: 42, PRACTICE: 21.

## Notes / surprises

- 45 of 63 files passed voice-check on the first export (clean). The remaining 18 needed targeted edits: 17 grade-level violations, 3 historical-figure references on devilled-kidneys (Beeton / Mrs Beeton / Acton), and 1 year-only reference on soft-start-morning-meditation ("(1979)" attached to Jon Kabat-Zinn / University of Massachusetts). Three parallel Sonnet sub-agents cleared all 18 in under 4 minutes.
- The devilled-kidneys body paragraph carrying "Eliza Acton" and "Mrs Beeton" was rewritten to drop the names; sourceNotes already cited both, so nothing was added there.
- The soft-start-morning-meditation "(1979)" year stub was removed from body paragraph[13]; sourceNotes already carried the "Jon Kabat-Zinn, 1979" citation, so no sourceNotes change was needed.
- Two pre-existing en-dashes in `yieldDescription` fields on manchester-tart ("8 to 10 slices") and marble-loaf (same range) were swapped to "8 to 10 slices" during the em-dash hygiene sweep. Voice-check does not gate on those fields but the brief's em-dash hygiene rule covers the full JSON.
- No file's word count dropped by more than 20%. The largest content reshape was eggs-royale paragraph[13] (grade 17.2, split into five short sentences; word count rose slightly).
- Verbatim energy statements, affirmations, release statements, and tapping scripts in the mindset bodies (rest-is-my-natural-state-sleep-affirmation, the safe-* / sleep-* / standing-* practices, she-is-here-i-am-her-we-celebrate, right-now-is-enough) were left untouched. The flagged paragraphs in mindset were all surrounding framing or methodology prose, not the practice statements themselves.
- Three-category round-robin came up even (21 each) on this fire. The remaining 1474 candidates: cooking ~771, mindset ~475, baking ~228, expected to keep round-robinning at roughly 21 cooking + 21 mindset + 21 baking per batch until baking drains around batch ~50.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 1474.
