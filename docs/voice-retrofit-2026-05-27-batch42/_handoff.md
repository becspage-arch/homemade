Batch 2026-05-27-batch42: 59 tutorials retrofitted. Deploy green, healthz 200.

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

- Before this fire: 2180 PUBLISHED tutorials with voiceRetrofittedAt set.
- After this fire: 2239 PUBLISHED tutorials with voiceRetrofittedAt set.
- Remaining: 1296 PUBLISHED tutorials with voiceRetrofittedAt IS NULL.
- Delta: 59. The batch picked 63 candidates; 4 were removed before apply because they carry verbatim EFT setup statements that fail the grade-level rule (see Blocked section below). Counts match expected delta.

## Spot-check (one slug from batch, picked deterministically)

- slug: tapping-for-i-never-sleep
- voiceRetrofittedAt: 2026-05-27T21:42:12.155Z
- url: https://homemade.education/mindset/tapping-for-i-never-sleep (site behind splash gate; anonymous traffic lands on /coming-soon, so body is not visible to a public curl. DB content confirmed via direct query.)
- first paragraph (from DB):

> A five-minute tapping practice from Day 11 of the SLEEP program. The script targets the sleep identity: not a single bad night but the accumulated belief that poor sleep is simply who you are. A daytime practice for releasing the old story and trying on a quieter one.

## Sample public URLs across categories covered

- https://homemade.education/cooking/gambas-al-ajillo
- https://homemade.education/cooking/game-pie
- https://homemade.education/cooking/garlic-naan
- https://homemade.education/cooking/gigantes-plaki
- https://homemade.education/cooking/golubtsy-russian
- https://homemade.education/baking/pasteis-de-nata
- https://homemade.education/baking/pavlova
- https://homemade.education/baking/pecan-pie
- https://homemade.education/baking/peppermint-creams
- https://homemade.education/mindset/tapping-for-money-shame
- https://homemade.education/mindset/tapping-for-peace-around-bills

## Before / after excerpts (three slugs)

### gammon-with-parsley-sauce (cooking, RECIPE), paragraph[0]

BEFORE:
> Modern gammon is milder and less salty than the heavily cured joints of earlier centuries, but soaking is still worth doing for an unsmoked piece. The cooking liquid that results from poaching a gammon is well-flavoured and not as salty as the gammon itself; using part of it for the parsley sauce gives the sauce more character than milk alone.

AFTER:
> Modern gammon is milder and less salty than older cured joints, but soaking an unsmoked piece is still worth doing. The poaching liquid is well-flavoured and not as salty as the gammon. Using part of it in the parsley sauce gives the sauce more depth than milk alone.

(Two semicolon-joined long clauses split into short sentences; grade 13.0 down to under 12.)

### pasteis-de-nata (baking, RECIPE), paragraph[0]

BEFORE:
> Pastéis de nata are a Lisbon classic: small puff pastry cups holding a thick egg-yolk custard, baked at very high heat until the surface caramelises in dark spots. The cups are formed by pressing rolled puff pastry into a muffin tin; the custard is cooked on the hob to a thick pourable cream before going into the cups; the bake is short and hot.

AFTER:
> Pastéis de nata are a Lisbon classic. Small puff pastry cups hold a thick egg-yolk custard, baked at very high heat until the surface caramelises in dark spots. You form the cups by pressing rolled puff pastry into a muffin tin. You cook the custard on the hob to a thick pourable cream before it goes in. The bake is short and hot.

(Colon-and-semicolon-stacked sentences split. Passive "are formed" / "is cooked" changed to active "you form" / "you cook" for reader-direct register. Grade 12.9 down to under 12.)

### tapping-for-joy-that-softens-the-sleep-system (mindset, PRACTICE), paragraph[0]

BEFORE:
> A five-minute daytime tapping practice from Day 24 of a 30-day sleep program. The script targets the habit of getting through the day without allowing pleasure or ease, and reframes toward a direct connection between small daytime joys and the nervous system's availability for sleep at night.

AFTER:
> A five-minute daytime tapping practice from Day 24 of a 30-day sleep program. The script works on the habit of pushing through the day without pleasure or ease. It reframes small daytime joys as direct support for the nervous system to settle into sleep at night.

(Compound second sentence split into two; verbs shortened ("targets" / "reframes toward" / "availability for sleep" → "works on" / "reframes ... as direct support" / "settle into sleep"). Grade 12.2 down to under 12.)

## Category breakdown (applied to DB)

cooking: 21, baking: 21, mindset: 17. Total 59.

(Mindset count is 17 not 21 because 4 mindset bodies were removed before apply by the verbatim-energy-statements rule; see Blocked section.)

## Content-type breakdown

RECIPE: 42, PRACTICE: 17. Total 59.

(Beyond the first three batches, the brief requires only category spread; content-type spread is no longer mandated. Recorded for visibility.)

## Blocked: 4 verbatim EFT setup statements

Four mindset tutorials were picked but removed from the apply set because their bulletList tapping rounds contain verbatim "Even though [X], I deeply and completely accept myself" setup statements from Rebecca's books. These trip the grade-level voice-check rule (each setup statement reads at grade 12 to 15) but cannot be rewritten per the verbatim-energy-statements feedback rule.

Blocked slugs:
- tapping-for-im-always-behind
  - bulletList[5][2]: "Even though I measure myself against a timeline that nobody actually agreed to, I accept today as the real starting point." (grade 12.3)
- tapping-for-inherited-religion
  - bulletList[4][1]: "Even though questioning my inherited religion feels like a betrayal of the people who gave it to me, I deeply and completely accept myself." (grade 12.9)
  - bulletList[4][2]: "Even though I don't have a replacement framework and the not-knowing is uncomfortable, I deeply and completely accept myself." (grade 14.8)
- tapping-for-massive-cashflow
  - bulletList[4][0]: "Even though massive monthly cashflow once felt unrealistic, I deeply and completely accept myself." (grade 12.6)
- tapping-for-money-sex-power-taboo
  - bulletList[4][2]: "Even though I've absorbed a rule that says money and desire and authority don't all belong to me at once, I honour what that's been protecting, and I am open to releasing it now." (grade 14.7)
  - bulletList[6][3]: "Under nose: the self-monitoring every time I step into authority." (grade 13.1)

These will fail the same way on every subsequent fire because the same lines remain in the body. The voice-check needs an exemption (treat setup-statement bullets and tapping-point reading lines in mindset tapping practices as exempt from the grade-level check), or these specific lines need a sign-off from Rebecca to soften wording. The known-blocked exclusion list now has 11 slugs (7 carried from batch40 and batch41, 4 added by this fire) and will keep growing each batch until the voice-check rule is amended. Flagging for follow-up rather than retrying.

## Surprises / notable rewrites

- **45 of 63 picked tutorials passed voice-check as exported.** No body changes needed; they were applied as-is with voiceRetrofittedAt set. This matches the brief's "Don't over-prune" guidance: a body already in register stays in register.
- **gigot-dagneau**: a leading H2 heading "Before you start" with safety-advice framing was removed. The orientation paragraph at body[1] now leads the page, matching the spec.
- **5 mindset bodies** ended with a "Where this practice comes from" H2 + an attribution paragraph that duplicated the sourceNotes prose. The public renderer surfaces sourceNotes as a Sources block at the page foot, so the in-body version was redundant academic-register text. Removed the heading + paragraph in all five (tapping-for-is-this-too-much-pricing-fear, tapping-for-joy-that-softens-the-sleep-system, tapping-for-money-is-hard-to-earn, tapping-for-money-shame, tapping-for-peace-around-bills). Substance is fully retained at the page foot. Same pattern flagged by batch41.
- **glamorgan-sausages**: the paragraph[10] historical context paragraph referenced Jane Grigson's 1970s writing. The reference was removed from body prose; substance about Grigson's documentation belongs in sourceNotes, not in body register.
- **golubtsy-russian** and **garlic-naan**: each had a single long final paragraph stacking three or four clauses across decades and regional variants. Both were split into short factual sentences.
- **pavlova-meringue**: the `recipe.yieldDescription` field contained an en-dash ("1 pavlova (6-8 portions)"). Cleaned in the JSON export to keep the committed batch directory en-dash-clean even though the apply script does not write back into the yieldDescription field. The DB value still carries the en-dash; that is a separate cleanup not in scope for this voice-only fire.

No file lost over 20% of substantive word count. Removals were either the attribution-paragraph duplicates (5 mindset slugs), a safety-advice heading (gigot-dagneau), or a single historical date (glamorgan-sausages). All other content preserved.

## Full slug list (59 applied)

cooking (21): gambas-al-ajillo, gambas-pil-pil, game-pie, gammon-with-parsley-sauce, gammon-with-pineapple, garlic-beef-bites-potatoes, garlic-butter-chicken-bites, garlic-butter-salmon-pasta, garlic-naan, garlic-parmesan-pasta, gazpacho, ghormeh-sabzi, giant-chocolate-cornflake-cookies, gigantes-plaki, gigot-d-agneau, gigot-dagneau, gingerbread-cheesecake-cookies, glamorgan-sausages, goats-cheese-honey-rice-cakes, golabki, golubtsy-russian.

baking (21): paris-brest-praline, parker-house-rolls, parkin-yorkshire, passion-fruit-caramels-soft, pasteis-de-nata, pastel-de-nata, pastiera-napoletana, pavlova, pavlova-meringue, peach-pie, peanut-brittle, peanut-butter-cookies, peanut-butter-fudge, pear-frangipane-tart, pecan-bourbon-tart, pecan-pie, pecan-pie-classic, pepparkakor, peppermint-creams, petticoat-tails-shortbread, pfeffernusse.

mindset (17): tapping-for-i-never-sleep, tapping-for-i-only-earn-when-i-work, tapping-for-ill-lose-it-if-i-get-it, tapping-for-investing-isnt-for-me, tapping-for-is-it-wrong-to-want-this, tapping-for-is-this-too-much-pricing-fear, tapping-for-it-can-come-from-anywhere, tapping-for-joy-that-softens-the-sleep-system, tapping-for-loneliness-inside-marriage, tapping-for-millionaire-habits, tapping-for-money-is-hard-to-earn, tapping-for-money-shame, tapping-for-mum-guilt, tapping-for-never-enough-hours, tapping-for-peace-around-bills, tapping-for-perfect-partnerships-and-clients, tapping-for-permission-to-sleep.

## Forward read

PUBLISHED with voiceRetrofittedAt IS NULL after this fire: 1296.
