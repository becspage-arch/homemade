Batch 2026-05-27-batch41: 58 tutorials retrofitted. Deploy green, healthz 200.

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

(The audit "last fire" column emits dash placeholders for categories that have not autopiloted; rendered as `n/a` to keep this hand-off em-dash-clean.)

## Voice retrofit progress

- Before this fire: 2122 PUBLISHED tutorials with voiceRetrofittedAt set.
- After this fire: 2180 PUBLISHED tutorials with voiceRetrofittedAt set.
- Remaining: 1355 PUBLISHED tutorials with voiceRetrofittedAt IS NULL.
- Delta: 58. The batch picked 63 candidates; 5 were blocked by voice-check on verbatim EFT karate-chop setup statements (see below). Counts match expected delta.

## Spot-check (one slug from batch, picked at random)

- slug: tapping-for-i-feel-guilty-asking-for-more
- voiceRetrofittedAt: 2026-05-27T20:55:47.909Z
- url: https://homemade.education/mindset/tapping-for-i-feel-guilty-asking-for-more (site behind splash gate; anonymous traffic lands on /coming-soon, so body is not visible to a public curl. DB content confirmed via direct query.)
- first paragraph (from DB):

> An EFT tapping sequence for the guilt that arrives when a raise, a higher rate, or a better deal is wanted. Taps through the belief that asking is demanding or ungrateful, and toward the clarity that a straightforward ask is a reasonable thing to make.

## Sample public URLs across categories covered

- https://homemade.education/cooking/fried-chicken
- https://homemade.education/cooking/french-onion-soup
- https://homemade.education/cooking/foul-medames
- https://homemade.education/cooking/galette-de-sarrasin
- https://homemade.education/baking/panettone
- https://homemade.education/baking/pain-au-chocolat
- https://homemade.education/baking/no-bake-vanilla-cheesecake
- https://homemade.education/baking/opera-cake
- https://homemade.education/mindset/tapping-for-debt-obsession
- https://homemade.education/mindset/tapping-for-his-money-isnt-my-money
- https://homemade.education/mindset/tapping-for-i-feel-guilty-asking-for-more

## Before / after excerpts (three slugs)

### french-dip (cooking, RECIPE), paragraph[0]

BEFORE:
> The French dip works because the bread softens where it meets the hot jus without going fully wet: you dip the corner of the sandwich, take a bite, and the outer inch of the bread has absorbed just enough liquid to carry the beefy flavour all the way through. The beef should be sliced very thin, a mandoline or a sharp carving knife drawn through a well-rested roast produces the right texture. Thick-cut beef turns the sandwich into a roast-dinner roll, which is a different thing.

AFTER:
> The French dip is a roast beef sandwich served with a cup of hot beef jus. You dip the corner of the sandwich, take a bite, and the outer inch of bread has absorbed just enough liquid to carry the beefy flavour through. The beef must be sliced very thin: a mandoline or a sharp carving knife drawn through a well-rested roast gives the right texture. Thick-cut beef turns it into a roast-dinner roll, which is a different thing.

(Orientation pattern applied: names the dish in one clause, then the eating mechanic, then the technique pin. Sentences shortened.)

### oatmeal-raisin-cookies (baking, RECIPE), paragraph[0]

BEFORE:
> Oatmeal cookies are done when the edges are set and the centre still looks raw. That is the point to pull them. They will firm on the tray as they cool to a dense, chewy texture. Leave them too long and they dry out; pull them too early and they collapse.

AFTER:
> These are thick, chewy oat cookies with raisins and a warm spice note from mixed spice. Pull them from the oven when the edges are set but the centre still looks raw. They firm on the tray as they cool to a dense, chewy texture. Leave them too long and they dry out; pull them too soon and they collapse.

(Orientation pattern applied: lead sentence names the bake and texture, then the technique cue. Existing pull-timing note kept verbatim.)

### tapping-for-his-money-isnt-my-money (mindset, PRACTICE), paragraph[0]

BEFORE:
> A five-minute tapping practice for the feeling that household money sourced through a partner is not fully yours to use. The script addresses the guilt and smallness that sit underneath that feeling, and works toward a clear sense of financial autonomy that does not require earning independently in order to be real.

AFTER:
> A five-minute tapping practice for the feeling that money earned by a partner is not really yours to spend. The script works through the guilt and the smallness underneath. It moves toward a clear sense that the money is yours too, even without earning it directly.

("sourced through a partner" softened to "earned by a partner". Run-on second sentence split into two short ones. Grade level dropped below 12. Verbatim karate-chop and tapping-round lines untouched.)

## Category breakdown (applied to DB)

cooking: 21, baking: 21, mindset: 16. Total 58.

(Mindset count is 16 not 21 because 5 mindset bodies were blocked by the verbatim-energy-statements rule; see below.)

## Content-type breakdown

RECIPE: 42, PRACTICE: 16. Total 58.

(Beyond the first three batches, the brief requires only category spread; content-type spread is no longer mandated. Recorded here for visibility.)

## Blocked: 5 verbatim EFT karate-chop setup statements

Five mindset tutorials were picked but blocked by the voice-check grade-level rule because the failing lines are EFT setup statements taken verbatim from Rebecca's published programs (the canonical "Even though [X], I deeply and completely accept myself" pattern). Per the verbatim-energy-statements rule, these lines may not be rewritten.

Blocked slugs:
- tapping-for-calm-with-overflow
  - Failing line: "Even though overflow once felt like something that had to be spent or lost before it could be taken, I deeply and completely accept myself." (grade 12.1)
- tapping-for-diet-guilt
  - Failing line: "Even though I feel guilty about what I just ate and the voice telling me I've ruined everything is loud, I deeply and completely accept myself." (grade 12.3)
- tapping-for-emotional-overload-at-bedtime
  - Failing line: "Even though I'm still holding the residue of everyone's feelings, I deeply and completely accept myself." (grade 12.0)
- tapping-for-fear-of-repeating-family-patterns
  - Failing line: "Even though I am afraid I am becoming the family money pattern, I deeply and completely accept myself." (grade 12.4)
- tapping-for-health-anxiety
  - Failing line: "Even though I am afraid that something is physically wrong and I can't stop thinking about it, I deeply and completely accept myself." (grade 12.9)

These will fail the same way on every subsequent fire because the same lines remain in the body. The voice-check needs an exemption (treat setup-statement bullets in mindset tapping practices as exempt from the grade-level check), or these specific lines need a sign-off from Rebecca to soften wording. Two prior known blockers (`tapping-for-abundance-through-the-family-line`, `tapping-for-am-i-spoiling-them` from batch40) were proactively excluded from this batch's pick to avoid re-doing wasted work; that exclusion list now has 7 slugs and will keep growing each batch until the voice-check rule is amended. Flagging for follow-up rather than retrying.

## Surprises / notable rewrites (agents flagged)

- **fried-chicken**: orderedList[8][0] originally enumerated 8 ingredients in one 30-word sentence including "coating" group-label prefixes inlined as prose ("coating {{garlic-powder}}, ..."). Split into a three-sentence step (set up bowl / tip in ingredients / whisk). Source paragraph[13] originally compressed Scottish frying + West African seasoning + 19th-century spread into one long sentence; split into five short sentences.
- **fried-green-tomatoes**: orderedList[6][0] was a single 56-word three-clause sentence setting up three coating bowls. Restructured to one short opening sentence plus three bowl-specific sentences.
- **no-bake-vanilla-cheesecake**: orderedList[5][0] hit grade 17 from a 15-word sentence stacking four scaling-token ingredients in one breath. Split into tip-in / add / stir.
- **nougat-soft-honey**: a 57-word warning-tone infoPanel restating hot-syrup safety was dropped. The two relevant temperatures (121°C and 145°C) appear in the syrup steps themselves; the dedicated panel duplicated guidance.
- **6 mindset bodies** had a duplicate "Where this practice comes from" paragraph in body that just restated the sourceNotes string (mentioning Gary Craig EFT and Roger Callahan with dates). The public renderer surfaces sourceNotes as a Sources block at the bottom of the page, so the in-body duplicate was redundant academic-register prose. Removed the heading + paragraph in all six. The agents had preserved them out of caution; the substance is fully retained at page foot.
- **3 mindset bodies** had tapping-point labels stored as raw markdown `**Eyebrow:**` inline strings rather than TipTap bold marks. Agents converted to proper marks. Script text content stayed verbatim.
- **Several files with mismatched content**: fruit-rollups had a bread-recipe troubleshooter and bread-variations bullets pasted in; fixed. french-toast-casserole had a pancake troubleshooter and pancake variations; fixed. french-toast-roll-ups had a bread-yeast troubleshooter and seeded-crust variations; fixed. french-onion-soup had photo-reference captions ("the first photo is after 20 minutes") and first-person notes; cleaned.

No file lost over 20% of substantive word count. Removals were either generic placeholder content, wrong-recipe content, duplicate-of-sourceNotes provenance paragraphs, or historical citations migrated to sourceNotes.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 1355.
