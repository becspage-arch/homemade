Batch 2026-05-27-batch40: 61 tutorials retrofitted. Deploy green, healthz 200.

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

(The audit "last fire" column emits placeholders for categories that have not autopiloted; rendered as `n/a` to keep this hand-off em-dash-clean.)

## Voice retrofit progress

- Before this fire: 2061 PUBLISHED tutorials with voiceRetrofittedAt set.
- After this fire: 2122 PUBLISHED tutorials with voiceRetrofittedAt set.
- Remaining: 1413 PUBLISHED tutorials with voiceRetrofittedAt IS NULL.
- Delta: 61. The batch picked 63 candidates; 2 were blocked by voice-check on verbatim EFT setup statements (see below). Counts match expected delta.

## Spot-check (one slug from batch, picked at random)

- slug: fettuccine-alfredo
- voiceRetrofittedAt: 2026-05-27T19:54:42.953Z
- url: https://homemade.education/cooking/fettuccine-alfredo (site behind splash gate; anonymous traffic lands on /coming-soon, so body is not visible to a public curl. DB content confirmed via direct query.)
- first paragraph (from DB):

> Two things determine whether this works: the Parmesan must be very finely grated (small-hole grater, not the large holes used for pizza), and the bowl must be warm before the pasta goes in. Cold butter dropped into a cold bowl seizes rather than melts into an emulsion. The pasta water controls the consistency, add it sparingly.

## Sample public URLs across categories covered

- https://homemade.education/cooking/escovitch-fish
- https://homemade.education/cooking/fish-and-chips
- https://homemade.education/cooking/falafel
- https://homemade.education/cooking/fettuccine-alfredo
- https://homemade.education/cooking/eton-mess
- https://homemade.education/baking/marshmallows-vanilla
- https://homemade.education/baking/millionaires-shortbread
- https://homemade.education/baking/mille-feuille-napoleon
- https://homemade.education/baking/mince-pies
- https://homemade.education/mindset/tapping-for-being-the-older-generation
- https://homemade.education/mindset/stepping-into-calm-sleeper-identity

## Before / after excerpts (three slugs)

### fettuccine-alfredo (cooking, RECIPE), paragraph[0]

BEFORE:
> Two things determine whether this works: the Parmesan must be very finely grated (small-hole grater, not the large holes used for pizza), and the bowl must be warm before the pasta goes in. Cold butter dropped into a cold bowl seizes rather than melts into an emulsion. The pasta water controls the consistency (em-dash) add it sparingly.

AFTER:
> Two things determine whether this works: the Parmesan must be very finely grated (small-hole grater, not the large holes used for pizza), and the bowl must be warm before the pasta goes in. Cold butter dropped into a cold bowl seizes rather than melts into an emulsion. The pasta water controls the consistency, add it sparingly.

(Em-dash removed. "Before you start" H2 stripped; the practical opening folded into the lead paragraph.)

### mille-feuille-napoleon (baking, RECIPE), paragraph[0]

BEFORE:
> Mille-feuille (a thousand sheets, also called a napoleon) is three flat slabs of puff pastry sandwiched with creme patissiere. The puff is baked between two trays so it stays flat and shatter-crisp; the creme patissiere is cooked on the hob and piped between layers; the top is finished with a thin white-icing glaze, fed across with thin lines of dark chocolate and dragged with a skewer to feather.

AFTER:
> Mille-feuille (a thousand sheets, also called a napoleon) is three flat slabs of puff pastry layered with creme patissiere. The puff bakes between two trays so it stays flat and snaps crisp. The creme patissiere is cooked on the hob and piped between layers. The top gets a thin white glaze. Drag thin lines of dark chocolate across it with a skewer to feather.

(Triple-semicolon run-on broken into five short sentences. Grade level dropped below 12.)

### tapping-for-being-the-older-generation (mindset, PRACTICE), paragraph[0]

BEFORE:
> A five-minute EFT tapping practice for the disorientation of becoming the older generation. The script works through the specific feeling of standing where the adults used to stand, without anyone above you now, toward a place where that position can be held with some steadiness.

AFTER:
> A five-minute EFT tapping practice for the strange shift of becoming the older generation. The script works through the feeling of standing where the adults used to stand, with no one above you now. It helps you hold that spot with more ease.

("disorientation" softened to "strange shift". Run-on second sentence split. Verbatim tapping-script lines untouched.)

## Category breakdown (applied to DB)

cooking: 25, baking: 19, mindset: 17. Total 61.

(Three remaining categories have no PUBLISHED + un-retrofitted candidates yet: the remaining 1413 live in cooking, baking, and mindset only.)

## Content-type breakdown

RECIPE: 44, PRACTICE: 17. Total 61.

(Beyond the first three batches, the brief requires only category spread; content-type spread is no longer mandated. Recorded here for visibility.)

## Blocked: 2 verbatim EFT setup statements

Two mindset tutorials were picked but blocked by the voice-check grade-level rule because the failing lines are EFT setup statements taken verbatim from Rebecca's published programs (the canonical "Even though [X], I deeply and completely accept myself" pattern). Per the verbatim energy statements rule, these lines may not be rewritten.

Blocked slugs:
- tapping-for-abundance-through-the-family-line
  - Failing line: "Even though I've carried generational anxiety about money, I deeply and completely accept myself." (grade 15.2)
- tapping-for-am-i-spoiling-them
  - Failing lines (both bulletList[4] items):
    - "Even though part of me believes struggle is what builds character, and that removing it is risky, I deeply and completely accept myself." (grade 12.4)
    - "Even though I'm afraid that my generosity might become their limitation, I honour that fear and I am open to releasing it now." (grade 12.4)

These will fail the same way on every subsequent fire because the same lines remain in the body. The voice-check needs an exemption (treat setup-statement bullets in mindset tapping practices as exempt from the grade-level check), or these specific lines need a sign-off from Rebecca to soften wording. Flagging for follow-up rather than retrying.

## Notable rewrites (other agents flagged)

- fluffy-pancakes: pre-rewrite body was wrong content for the recipe. Opening, troubleshooter, and variations all referenced cakes (oven, skewer, ground almonds, sinking cake) rather than pancakes. Rewriter rewrote the body to be accurate to American pancakes. Word count drop similar to a fresh-author pass.
- fantastic-fish-pie: troubleshooter was for a fruit crumble; replaced.
- family-chocolate-chip-cookies: "make ahead" was "reheat with a splash of liquid" (wrong for cookies); fixed. "Where this dish lives" claimed "classic American recipe" without basis; corrected to Rebecca's kitchen.
- Three mindset tapping bodies (tapping-for-body-overwhelm, tapping-for-bold-action-without-fear, tapping-for-calm-mornings) had tapping-point labels encoded as markdown `**Eyebrow:**` inline strings rather than TipTap bold marks. Rewriter converted to proper marks. Script text content stayed verbatim.

No file had a word-count drop over 20% on substance. Removals were either generic placeholder content, wrong-recipe content (fish pie troubleshooter for crumble, pancake body for cake), or historical citations migrated to sourceNotes.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 1413.
