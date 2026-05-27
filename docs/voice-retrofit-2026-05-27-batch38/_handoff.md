Batch 2026-05-27-batch38: 63 tutorials retrofitted. Deploy green, healthz 200.

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

- Before this fire: 1935 PUBLISHED tutorials with voiceRetrofittedAt set.
- After this fire: 1998 PUBLISHED tutorials with voiceRetrofittedAt set.
- Remaining: 1537 PUBLISHED tutorials with voiceRetrofittedAt IS NULL.
- Delta matches batch size (63). PASS.

## Spot-check (one slug from batch, picked at random)

- slug: release-old-sleep-label-allow-calm-identity
- voiceRetrofittedAt: 2026-05-27T17:41:13.023Z
- url: https://homemade.education/mindset/release-old-sleep-label-allow-calm-identity (site behind splash gate; anonymous traffic lands on /coming-soon, so body is not visible to a public curl. DB content confirmed via direct query.)
- first paragraph (from DB):

> A short energy statement from Day 20 of the SLEEP program. The release names the identity label that's been in place, the 'bad sleeper' story that can outrun the current evidence. The allow claims its replacement.

## Sample public URLs across categories covered

- https://homemade.education/cooking/curried-goat
- https://homemade.education/cooking/cuban-black-beans
- https://homemade.education/cooking/cullen-skink
- https://homemade.education/baking/lebkuchen-christmas
- https://homemade.education/baking/lemon-meringue-pie
- https://homemade.education/baking/lemon-drizzle-loaf
- https://homemade.education/mindset/panic-attacks-whats-happening-what-helps
- https://homemade.education/mindset/reclaiming-homemaker-as-feminist-identity
- https://homemade.education/mindset/resentment-as-information-reading
- https://homemade.education/wood-natural-craft/wood-grain-reading

## Before / after excerpts (three slugs, three content types)

### curried-goat (cooking, RECIPE), opening paragraph

BEFORE:
> Goat is the correct meat for this dish (em-dash) cheaper, leaner, and more flavourful than lamb, with a firmer texture that holds up to the long braise. It is available from halal butchers and many supermarkets. If goat is not available, bone-in lamb shoulder on the bone works and gives a richer result. The bone is essential for the depth it adds to the sauce.

AFTER:
> Goat is the correct meat for this dish, cheaper, leaner, and more flavourful than lamb, with a firmer texture that holds up to the long braise. It is available from halal butchers and many supermarkets. If goat is not available, bone-in lamb shoulder on the bone works and gives a richer result. The bone is essential for the depth it adds to the sauce.

(Em-dash swapped for comma. The 109-word "Where this dish lives" paragraph later in the body was the grade-level violator and was split into 6 shorter sentences; no substance lost.)

### panic-attacks-whats-happening-what-helps (mindset, READING), opening paragraph

BEFORE:
> A panic attack is a rapid activation of the body's threat response in the absence of an actual threat. The symptoms (racing heart, shortness of breath, dizziness, the sense that something is very wrong) are the physiological package the body deploys when it believes danger is present. Understanding what is happening does not make it stop immediately, but it changes what the experience means, which is most of what drives the cycle.

AFTER:
> A panic attack is a rapid activation of the body's threat response when no actual threat is present. The symptoms include racing heart, shortness of breath, dizziness, and a strong sense that something is wrong. These are the sensations the body produces when it believes danger is real. Understanding what is happening does not stop it immediately. But it changes what the experience means. That shift is most of what drives the cycle.

(Compound sentence with parenthetical aside split into a list of symptoms in plain English; "physiological package the body deploys" simplified to "sensations the body produces". Same information, accessible register.)

### lebkuchen-christmas (baking, RECIPE), opening paragraph

BEFORE:
> Lebkuchen are German Christmas biscuits with honey as the primary sweetener: the honey is warmed with brown sugar to a thin syrup, poured into a bowl of flour, ground almonds, mixed peel and a generous hand of spice, brought together, and then rested in the fridge for at least 12 hours. The rest is non-negotiable; without it the biscuits bake tough and the spices read raw.

AFTER:
> Lebkuchen are German Christmas biscuits. Honey is the main sweetener. Warm the honey with brown sugar to a thin syrup, then pour it into a bowl of flour, ground almonds, mixed peel, and spice. Bring it together into a dough. Rest it in the fridge for at least 12 hours. The rest is not optional: without it the biscuits bake tough and the spices taste raw.

(Single run-on opening split into 6 short sentences. "Non-negotiable" simplified to "not optional"; "read raw" simplified to "taste raw". Same method, easier to read.)

## Category-by-category count

cooking: 21, baking: 20, mindset: 20, wood-natural-craft: 2.

(Same four buckets as batch37 plus the wood-natural-craft tail of 2. Per-category cap raised to 22 to hit the 63 target across the four available buckets, mirroring the batch37 precedent.)

## Notes / surprises

- 40 of 63 files passed voice-check on the first export (clean). The remaining 23 needed targeted edits: 22 grade-level violations on single paragraphs, 1 safety-block heading on croque-madame ("Before you start"), 2 historical-figure references in creme-anglaise ("Beeton" / "Mrs Beeton"), and 3 year-only references in mindset readings ((1986), (2009), (1985)). Three parallel Sonnet sub-agents cleared all 23 in under 7 minutes.
- The croque-madame safety-block heading was removed; the paragraph that followed (about béchamel being non-optional, useful instructional content) was preserved verbatim as an intro paragraph without the safety-block wrapper. No substance lost.
- The creme-anglaise body paragraph carrying "Beeton" and "Mrs Beeton" was rewritten to drop the names; the Project Gutenberg citation for Isabella Beeton's Book of Household Management already sat in sourceNotes from a prior pass, so nothing was added there.
- Year-only references in mindset readings ((1986) Donna Wilson, (2009) Stuart Brown, (1985) Harriet Lerner) were moved to sourceNotes as fresh bullets with the book / publisher context, and the body sentences were rewritten to keep the substance without the year stub.
- Two pre-existing en-dashes in `yieldDescription` fields on lemon-and-poppyseed-cake (between 8 and 10 slices) and lemon-drizzle-loaf (same range) were swapped for "8 to 10 slices" during the em-dash hygiene sweep. Voice-check does not gate on those fields but the brief's em-dash hygiene rule covers the full JSON.
- One pre-existing em-dash in the croque-madame subtitle (between "The Parisian café classic" and "toasted ham and Gruyère") was swapped for a comma during the safety-block fix.
- No file's word count dropped by more than 20%. The largest content reshape was lebkuchen-christmas paragraph 0 (split a run-on into 6 short sentences; word count rose slightly).
- Verbatim energy statements, affirmations, release statements, and tapping scripts in the mindset bodies (overflow-is-my-natural-daily-state-affirmation, the release-* practices, paying-a-bill-is-moving-money) were left untouched. The flagged paragraphs were all surrounding "Where this comes from" / methodology / framing prose, not the practice statements themselves.
- The two wood-natural-craft READING items (wood-finishing-oils-compared, wood-grain-reading) both passed voice-check clean on first export and were applied with no edits, finally draining that bucket from the candidate pool.
- Bucket composition reflects what is left after batch37: cooking 813, mindset 516, baking 269, wood-natural-craft 2 before this fire. After this fire: cooking 792, mindset 496, baking 249, wood-natural-craft 0. The remaining 1537 sit across just three categories.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 1537.
