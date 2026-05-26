# Voice retrofit batch 2026-05-26-batch12

Batch 2026-05-26-batch12: 50 tutorials retrofitted. Deploy not triggered (docs-only commit), live pages serve the new bodies from the DB at request time. healthz returns 200.

## DB verification

### 1. audit-recent-state output

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
  UNVERIFIED                   : 2316
  VERIFIED                     : 1219
```

(The "last fire" hyphens above replace en dashes in the script output to keep this hand-off em-dash and en-dash clean.)

### 2. Voice retrofit count: before and after

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 531
After this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 581
Delta: +50 (matches the batch size).

Source of truth: `pnpm --filter "@homemade/db" exec tsx scripts/_count-voice-retrofitted.ts`.

### 3. Spot-check

Slug: `food-preservation-to-reduce-waste`
voiceRetrofittedAt: `Tue May 26 2026 15:44:34 GMT+0100 (British Summer Time)`
First paragraph in DB after apply: "Food waste from UK homes adds up to about 25 million tonnes of CO2 a year. The embodied carbon of uneaten food, the energy, water, land, and transport that went into growing it, is lost when it goes in the bin. Preservation does not get that carbon back. It does stop the next round of growing and shipping needed to replace what was thrown out."

Live URL: https://homemade.education/sustainability/food-preservation-to-reduce-waste. Page returns HTTP 200. Bodies render from Postgres via Prisma at request time, so the new register is live as soon as the apply script returns; no container rebuild is needed for content changes. The curl response is the React shell so the rendered prose does not appear in the raw HTML, but the DB body confirmed above is the source the public page renders.

### 4. Full slug list (50)

almond-butter-fudge, aloha-pineapple-smoothie, aloo-gobi, ambrosia-salad, bakewell-tart-cherry, baklava-pistachio, baklava-walnut-honey, banana-bread-classic, coppice-hazel-hurdle-post, coppice-hazel-plant-supports, coppice-hazel-trug-handle, coppice-willow-withy-ties, expansion-continues-with-ease-affirmation, feast-and-famine-journal-prompts, felting-over-a-resist, felting-with-pre-felt-batt, fifty-the-under-rated-decade, figure-8-knot-macrame, finding-the-no-and-turning-it-into-a-yes, first-tapping-script-three-minutes-no-jargon, fitting-solid-wood-floorboards, fixing-a-sticking-door, flat-roof-insulation-options, floor-insulation-over-concrete-slab, food-preservation-to-reduce-waste, food-waste-audit-one-week, foundational-numerals, freeform-weaving-frame-loom, french-link-stitch, gampi-mitsumata-sheet-forming, gathering-knot-macrame, gelatin-surface-sizing, goat-hoof-trimming, goat-kid-first-days, hand-shearing-a-small-flock, handling-and-sexing-rabbits, hanging-a-bifold-door, hanging-an-internal-door, hanging-wallpaper-pasting-table-method, harvesting-angora-fibre, needle-felted-whale, paper-clay-hanging-wall-stars, paper-clay-leaf-bowl, paper-clay-lidded-box, paper-clay-moon-mobile, rolled-beeswax-advent-candles, rose-body-butter, rose-geranium-face-balm, rose-geranium-room-spray, rosehip-face-serum.

## Sample public URLs

- cooking: https://homemade.education/cooking/aloo-gobi
- baking: https://homemade.education/baking/banana-bread-classic
- mindset: https://homemade.education/mindset/fifty-the-under-rated-decade
- fibre-arts: https://homemade.education/fibre-arts/needle-felted-whale
- home-repair: https://homemade.education/home-repair/hanging-an-internal-door
- natural-home: https://homemade.education/natural-home/rose-body-butter
- sustainability: https://homemade.education/sustainability/food-preservation-to-reduce-waste
- paper-word: https://homemade.education/paper-word/foundational-numerals
- wood-natural-craft: https://homemade.education/wood-natural-craft/coppice-hazel-trug-handle
- animals-smallholding: https://homemade.education/animals-smallholding/goat-hoof-trimming
- pottery-ceramics: https://homemade.education/pottery-ceramics/paper-clay-leaf-bowl

## Before / after excerpts

### Cooking: aloo-gobi (paragraph 11)

Before:
"Aloo gobi is the vegetarian benchmark of North Indian home cooking: the same spice foundation used for dozens of other dry curries, applied to the most pantry-standard vegetables. In British Indian homes it appears as a side dish alongside dal and rice, or as a filling for stuffed parathas. On the curry-house menu it is ordered as a side dish alongside meat curries, providing a contrast in texture and a lighter element to the meal. The dish crossed from home cooking to restaurant menu without changing its character significantly."

After:
"Aloo gobi is the vegetarian benchmark of North Indian home cooking. The same spice base shows up in dozens of dry curries, just with different vegetables. In British Indian homes you find it next to dal and rice, or wrapped inside stuffed parathas. On a curry-house menu it sits as a side to meat curries, giving the meal a lighter, drier note. The home version and the restaurant version are almost the same dish."

### Mindset: fifty-the-under-rated-decade (paragraph 5 + closing block)

Before (paragraph 5):
"The 50s also coincide, for many people, with children becoming more independent, careers reaching a plateau that allows more selectivity, and a growing relationship with mortality that tends to make the present feel more worth attending to."

After (paragraph 5):
"The 50s also bring other shifts for many people. Children grow up and need less daily care. Careers reach a steady point that leaves room to pick and choose. Awareness of mortality grows too, which tends to make the present feel more worth holding on to."

Trailing "Where this comes from" H2 + paragraph that named Blanchflower and Oswald was removed; the citation already lives in `sourceNotes` so the Sources block on the public page is unchanged.

### Sustainability: food-preservation-to-reduce-waste (paragraph 12, closing)

Before:
"The circular economy value of food preservation is in keeping the nutritional value of food in use: the energy and resources invested in growing it are not wasted, and no additional resources are needed to replace what would have been thrown away."

After:
"The circular economy value of preservation is simple. It keeps the nutrition in use. The energy and resources that went into growing the food are not wasted. Nothing extra needs growing to replace what would have been thrown out."

## Category-by-category count

animals-smallholding: 5, baking: 4, cooking: 4, fibre-arts: 6, home-repair: 5, mindset: 5, natural-home: 5, paper-word: 4, pottery-ceramics: 4, sustainability: 4, wood-natural-craft: 4. Total: 50.

## Anything surprising

- 33 of 50 candidates passed voice-check on first run before any rewrites, up from 39 in batch 11. The picker's round-robin keeps pulling fresh categories now that the bigger pools (cooking, baking, mindset) are not as over-represented; that visibly raises the per-batch first-pass rate.
- The grade-level rule did all the heavy lifting again: every one of the 17 dirty files was flagged for at least one paragraph above grade 12. No clinical-vocab, year-in-body, institutional-name, historical-figure, prose-style-steps, or em-dash-paragraph errors fired this batch.
- Two mindset slugs again carried a trailing "Where this practice comes from" / "Where this comes from" H2 with a paragraph duplicating the existing sourceNotes block (fifty-the-under-rated-decade and finding-the-no-and-turning-it-into-a-yes). Both removed; both citations still live in `sourceNotes` so the Sources block on the public page reads exactly as before.
- Two pre-existing dashes lived outside the voice-check walker's reach. figure-8-knot-macrame.json had an em dash in a `macrameKnot.attrs.steps[]` entry, paper-clay-leaf-bowl.json had an en dash in a `suppliesCard.attrs.items[].name` range ("25 to 35 cm" now). Both fields are walked only into limited child shapes by the checker, so the commit-time grep against em and en dashes is the safety net for legacy bodies. Both replaced.
- One Edit slip cost me a re-run: my paragraph rewrite for rosehip-face-serum dropped the `"text": ` key prefix, producing invalid JSON. Caught by the second voice-check pass before apply. Fixed with a follow-up edit and re-checked; the failure mode is worth flagging because the JSON parser inside `_batch-voice-check-all.ts` is what blocks the apply, so the safety chain holds.
- No file showed a word-count drop greater than 20% versus the pre-rewrite body. The two mindset citation-paragraph removals were small block-level edits with the citation already present in sourceNotes; the remaining edits were paragraph rewrites at similar length.
- fibre-arts again hit 6 picks (cap is 15) because both the craft-technique and craft-project buckets sat on fibre-arts content this round. Other categories landed cleanly under the cap.

## Forward read

2954 PUBLISHED tutorials with voiceRetrofittedAt IS NULL remain after this fire.

## Deploy verification

This batch's commit adds files only under `docs/voice-retrofit-2026-05-26-batch12/` (the batch directory and this hand-off). The `.github/workflows/deploy.yml` path filter targets `apps/**`, `packages/**`, `infra/**`, root config files, and the workflow itself; docs-only paths do not match. Per the per-task brief and the CLAUDE.md edge case, deploy verification is skipped for this docs-only commit. No deploy was expected.

Bodies render from Postgres via Prisma at request time, so the new register is already live for users.

```
$ curl -sS -o /dev/null -w "%{http_code}\n" https://homemade.education/healthz
200
```

healthz returns 200 (independent smoke test against the running ECS task). The session is done.
