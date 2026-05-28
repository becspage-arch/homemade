Batch 2026-05-28-batch9: 38 tutorials retrofitted. Deploy green, healthz 200.

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

(Long-dash placeholders in the "last fire" column replaced with "n/a" to keep
this hand-off em-dash-free per the per-fire QC rule.)

## Voice-retrofit progress

Before this fire: 791 PUBLISHED rows with voiceRetrofittedAt IS NULL (from batch8 hand-off).
After this fire:  753 PUBLISHED rows with voiceRetrofittedAt IS NULL.
Delta: 38 rows newly retrofitted. Matches the batch apply count exactly.

PUBLISHED with voiceRetrofittedAt NOT NULL: 2782.

## Spot-check

Random pick from the batch: `menemen` (cooking).

DB row state:
- slug: `menemen`
- voiceRetrofittedAt: 2026-05-28T07:39:09.265Z
- public URL: https://homemade.education/cooking/menemen

Live page first paragraph: the public site is still behind the pre-launch
splash gate (`apps/web/src/app/coming-soon/`), so the public URL renders
the "coming soon" shell rather than the tutorial body. The DB row is the
source of truth for verification. Same pattern as the recent batches.

First body paragraph (DB body, post-rewrite):

> Menemen is made in a single pan and takes about 15 minutes. The method matters: the tomato and pepper cook first until completely soft, then the eggs go in over low heat and are folded rather than stirred. If the heat is too high or the eggs are worked too actively, they turn granular and dry. The target is custardy folds that still wobble slightly when the pan is moved.

## 8 sample public URLs across the batch

- https://homemade.education/cooking/melitzanosalata
- https://homemade.education/cooking/menemen
- https://homemade.education/cooking/migas-extremenas
- https://homemade.education/cooking/mini-victoria-sponge-cakes
- https://homemade.education/cooking/mint-jelly
- https://homemade.education/mindset/the-mid-life-spiritual-reset
- https://homemade.education/mindset/the-mistake-letter-ritual
- https://homemade.education/mindset/the-money-zone-method-what-it-is-and-how-it-works

## Full list of slugs retrofitted in this batch

Cooking (19):
mauby, meat-piroshki, meatloaf, mechouia-salad, meggyleves, melitzanosalata, menemen, mercimek-corbasi, merguez-sausages, merluza-en-salsa-verde, migas-extremenas, millionaire-peach-salad, mince-pie-cookies, minestrone, mini-blueberry-and-vanilla-cheesecakes, mini-chocolate-mud-cakes-with-salted-caramel-chocolate-icing, mini-coffee-walnut-cakes, mini-victoria-sponge-cakes, mint-jelly.

Mindset (19):
the-loop-that-visits-you-most-journal, the-lottery-fantasy-as-a-scarcity-tell, the-mid-life-spiritual-reset, the-mistake-letter-ritual, the-money-conversation-i-havent-had-with-my-parents-journal, the-money-flowing-through-me-for-good-visualisation, the-money-question-youve-been-avoiding, the-money-zone-method-what-it-is-and-how-it-works, the-new-family-story-written-into-stone, the-new-family-story-written-into-the-wall, the-new-story-is-already-true, the-next-size-up-journal, the-night-is-safe, the-noting-practice, the-number-i-am-most-afraid-to-write-down-journal, the-one-money-task-today-activity, the-one-week-overflow-check-activity, the-opportunity-i-almost-said-no-to-journal, the-overflow-anchoring-ceremony.

## Before / after openings, 3 tutorials across content types

### Cooking (RECIPE): melitzanosalata paragraph[13]

Before:

> Melitzanosalata is the summer companion to tzatziki and taramasalata, always on the same mezze table, always eaten with the same pitta. The dish is closely related to the Middle Eastern baba ganoush and the Romanian zacuscă, and all three use the same core technique of open-fire charring. Greek versions tend to be simpler than the Levantine ones, avoiding tahini or cumin, letting the smoke and olive oil carry the flavour.

After:

> Melitzanosalata is the summer companion to tzatziki and taramasalata. It sits on the same mezze table and is eaten with the same pitta. The dish is a close cousin of the Middle Eastern baba ganoush and the Romanian zacuscă. All three char the aubergine over an open flame. Greek versions are simpler than the Levantine ones. No tahini, no cumin. The smoke and olive oil carry the flavour.

### Mindset (READING): the-mid-life-spiritual-reset paragraph[5]

Before:

> The religious educator James Fowler described adult faith development as moving through stages, from received belief (faith held because it was given) toward examined faith (belief held because it has survived your own scrutiny). The transition between these stages is often experienced as loss rather than growth, because what is being lost is familiar, and what comes next has no guaranteed form.

After:

> The religious educator James Fowler wrote about adult faith in stages. The move is from received belief, which is faith you hold because it was given to you, toward examined faith, which is belief that has survived your own questions. The shift often feels like loss rather than growth. What is going is familiar. What comes next has no fixed shape yet.

### Mindset (PRACTICE): the-mistake-letter-ritual paragraph[20]

Before:

> Adapted from Day 5 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025), where releasing shame around past financial decisions is the focus. Compassionate letter-writing as a self-inquiry tool is documented across cognitive-behavioural and narrative therapy traditions; the ceremonial release element is a public-domain ritual form. The five-part ritual structure is from The Money Journal (Rebecca J Page, 2025).

After:

> Adapted from Day 5 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). The focus of the day is releasing shame around past money choices. Compassionate letter-writing as a tool of self-inquiry runs across cognitive-behavioural and narrative therapy traditions. The ceremonial release element is a public-domain ritual form. The five-part ritual structure is from The Money Journal (Rebecca J Page, 2025).

## Category counts

cooking: 19, mindset: 19.

(Total 38. Both categories hit the 19-per-category cap. With the per-category cap of 19 and only these two categories carrying unretrofitted PUBLISHED rows, the natural batch ceiling sits at 38 even though the brief asks for 63. All other PUBLISHED categories have been fully retrofitted; cooking carries 525 unretrofitted rows and mindset carries 266. The cap is now the throughput limiter; lifting it or scaling it down with batch size are both possible levers, but the brief explicitly locks the cap so the worker holds 19 and ships what fits.)

## Surprises / notes

- The candidate pool dropped from 791 (batch8 close) to 791 minus 31 known-blocked = 760 entries, all from cooking (525) and mindset (266 minus blocked). All other categories are fully retrofitted. The 19-per-category cap therefore limits this fire to 38.
- 25 of 38 exported bodies were already clean on first voice-check. The retrofit-apply step still ran on those to populate voiceRetrofittedAt. The other 13 carried grade-level violations (mostly paragraph FK score over 12) and one year-in-body violation in the-mid-life-spiritual-reset paragraph[14] for "(2005)".
- Three mini-cake recipes (chocolate mud, coffee-walnut, victoria sponge) carried the same bake step text, all over grade 12. Same shorter rewrite landed in each. The repeated text is a tell that the autopilot author template used a shared step phrasing for this family of recipes; not a problem to fix here, but worth flagging if it shows up again in future batches.
- No verbatim-EFT (tapping) slugs were tripped this fire. The accumulated KNOWN_BLOCKED list (31 going in) held all expected violations out of the pool. No new additions to the list this fire.
- No word-count drop exceeded 20% on any rewritten body block. The most aggressive compression was on the-money-flowing-through-me-for-good-visualisation paragraph[8], which dropped from 22 words to 22 words (no change in length, vocabulary swapped for shorter syllable count). Grade dropped from 17.0 to roughly grade 9.
- the-mid-life-spiritual-reset paragraph[14] tripped both year-in-body ("(2005)") and grade-level. The rewrite removes the year and breaks the citation into shorter sentences. Substance preserved.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 753.

## Deploy verification

GitHub Actions deploy.yml run 26561537513 completed with conclusion `success` on commit 4ebd454.

`curl -sS -o /dev/null -w "%{http_code}\n" https://homemade.education/healthz` returned `200`.
