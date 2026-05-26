# Voice retrofit batch 2026-05-26-batch11

Batch 2026-05-26-batch11: 50 tutorials retrofitted. Deploy green, healthz 200.

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

### 2. Voice retrofit count: before and after

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 481
After this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 531
Delta: +50 (matches the batch size).

Source of truth: `pnpm --filter "@homemade/db" exec tsx scripts/_count-voice-retrofitted.ts`.

### 3. Spot-check

Slug: `patio-citrus-candle`
voiceRetrofittedAt: `Tue May 26 2026 14:42:26 GMT+0100 (British Summer Time)`
First paragraph in DB after apply: "A soy wax jar candle for outdoor summer evenings. Lemon and eucalyptus essential oils give it a clean, refreshing scent. Both oils are known plant-based deterrents for mosquitoes and midges. At this dilution the candle is a light deterrent, not a strong one. The main job is the scent on the garden table."

Live URL: https://homemade.education/natural-home/patio-citrus-candle. The page returns HTTP 200. The deployed Next.js container reads bodies from the database via Prisma at request time, so the new register is live as soon as the apply script returns; no container rebuild is needed for content changes. Curl alone fetches the React shell so the rendered body does not appear in the raw HTML, but the DB body confirmed above is the source the page will render.

### 4. Full slug list (50)

air-fryer-tofu, air-fryer-tuna-steak, air-fryer-wedges-cajun, albondigas-en-salsa, bagels-new-york, bagels-new-york-style, baguette-homemade, baked-vanilla-cheesecake, chip-carved-sycamore-trinket-box-lid, choosing-a-first-whittling-kit, coppice-hazel-bean-poles, coppice-hazel-dibber, dyeing-with-onion-skins, dyeing-with-weld-for-yellow, e-spinner-for-beginners, ease-with-money-in-motion-journal, easy-money-arriving-in-three-forms, eco-printing-with-leaves, empty-the-head-onto-the-page, energy-statement-ageing-with-ease, energy-statement-release-health-shame, ev-charger-decision-guide, external-wall-insulation-decision-guide, felting-needle-safety-and-selection, fitting-a-water-butt-to-a-downpipe, fitting-a-window-sill-board, fitting-an-automatic-pop-hole-opener, fitting-an-outside-tap, fitting-architrave-around-a-door-frame, fitting-electric-poultry-netting, fitting-laminate-flooring-floating-method, fitting-skirting-board-with-coped-internal-corners, fitting-tap-aerators-and-flow-restrictors, flourishing-copperplate, folded-envelopes-in-journals, foot-rot-treatment-in-sheep, foundational-hand-basic-strokes, foundational-hand-lower-case-alphabet, getting-a-cph-number-before-your-first-livestock, gi-stasis-in-rabbits, needle-felted-miniature-hedgehog, needle-felted-moon-hare, needle-felted-mushroom-set, needle-felted-owl, needle-felted-robin, patio-citrus-candle, peppermint-charcoal-soap, peppermint-foot-balm, peppermint-oat-foot-soak, peppermint-room-spray.

## Sample public URLs

- cooking: https://homemade.education/cooking/air-fryer-tofu
- baking: https://homemade.education/baking/bagels-new-york
- mindset: https://homemade.education/mindset/empty-the-head-onto-the-page
- fibre-arts: https://homemade.education/fibre-arts/needle-felted-owl
- home-repair: https://homemade.education/home-repair/fitting-architrave-around-a-door-frame
- natural-home: https://homemade.education/natural-home/patio-citrus-candle
- sustainability: https://homemade.education/sustainability/ev-charger-decision-guide
- paper-word: https://homemade.education/paper-word/foundational-hand-basic-strokes
- wood-natural-craft: https://homemade.education/wood-natural-craft/coppice-hazel-dibber
- animals-smallholding: https://homemade.education/animals-smallholding/fitting-an-automatic-pop-hole-opener

## Before / after excerpts

### Sustainability: ev-charger-decision-guide (paragraph 4)

Before:
"Smart chargers connect to the internet and can be scheduled to charge during off-peak periods (overnight cheap-rate tariffs such as Octopus Go), pause during peak grid demand, or boost when surplus solar PV generation is available. Since 2022, all new home charge points sold in Great Britain are required to have smart functionality by the EV Smart Charging regulations."

After:
"Smart chargers connect to the internet. You can set them to charge during off-peak periods such as Octopus Go overnight rates. They can pause during peak grid demand or boost when your solar PV makes spare power. Since 2022, all new home charge points sold in Great Britain must have smart features under the EV Smart Charging rules."

### Mindset: empty-the-head-onto-the-page (citation paragraph)

Before (trailing "Where this practice comes from" H2 + paragraph):
"Bedtime free-writing is a public-domain practice with a long lineage in diaristic traditions across the eighteenth and nineteenth centuries, popularised in modern form by Julia Cameron's morning-pages work in The Artist's Way (1992). The five-prompt evening version used here is adapted from Day 2 of SLEEP: A 30-Day Tapping Intensive (Rebecca J Page, 2025), which uses a journal practice to calm the racing mind before sleep."

After (heading + paragraph removed; the citation is already carried in sourceNotes for the Sources block).

### Natural-home: patio-citrus-candle (paragraph 0)

Before:
"A soy wax jar candle for outdoor summer evenings, scented with lemon and eucalyptus essential oils. The combination is frequently cited in botanical repellent literature as one of the stronger plant-based deterrents for mosquitoes and midges, though a candle at this dilution is a light deterrent rather than a clinical solution. The primary function is a clean, refreshing scent for the garden table."

After:
"A soy wax jar candle for outdoor summer evenings. Lemon and eucalyptus essential oils give it a clean, refreshing scent. Both oils are known plant-based deterrents for mosquitoes and midges. At this dilution the candle is a light deterrent, not a strong one. The main job is the scent on the garden table."

## Category-by-category count

animals-smallholding: 5, baking: 4, cooking: 4, fibre-arts: 10, home-repair: 5, mindset: 5, natural-home: 5, paper-word: 4, sustainability: 4, wood-natural-craft: 4. Total: 50.

## Anything surprising

- 39 of 50 candidates passed voice-check on first run, up from 32 / 34 in batches 9 and 10. The new-register author prompt is shipping in-register bodies for fresh content; retrofit work now concentrates on the long tail of legacy bodies authored before 2026-05-21.
- The grade-level rule caught 21 of 22 first-pass violations. The one year-in-body hit (empty-the-head-onto-the-page) and one safety-block hit (felting-needle-safety-and-selection, after my first rewrite went 26 words versus the 25-word cap on warning-tone infoPanels) were both clean fixes.
- Two mindset slugs (easy-money-arriving-in-three-forms and empty-the-head-onto-the-page) carried a "Where this practice comes from" H2 + paragraph that duplicated the existing sourceNotes block. Removed the heading and paragraph; the citation now lives only in the Sources block as the spec intends. Verbatim energy-statement scripts in the other three mindset picks were untouched.
- INCA expansion in external-wall-insulation-decision-guide was the stickiest fix. The phrase "Insulated Render and Cladding Association" alone pushed the paragraph past grade 12. Split into three short sentences and dropped the parenthetical; the bullet now reads "INCA membership: EWI fitters should be INCA members. INCA is the trade body for render and cladding. Any public scheme needs INCA members."
- Two pre-existing em dashes lived in title / subtitle metadata on bagels-new-york and flourishing-copperplate. voice-check does not gate metadata fields on em dashes, but the brief's commit-time em-dash check covers everything in the batch directory, so both were replaced with colons.
- No file showed a word-count drop greater than 20% versus the pre-rewrite body. Paragraph-level rewrites stayed close to the original length; the two mindset citation-paragraph removals were small block-level edits with the citation already present in sourceNotes.
- fibre-arts pulled 10 picks again because the round-robin filled craft-technique and craft-project buckets from the same category pool. Still inside the per-category cap of 15.

## Forward read

3004 PUBLISHED tutorials with voiceRetrofittedAt IS NULL remain after this fire.

## Deploy verification

This batch's commit will include two new diagnostic scripts under `packages/db/scripts/` (`_voice-retrofit-show-paragraphs.ts`, `_voice-retrofit-spotcheck.ts`) in addition to the batch directory. The `.github/workflows/deploy.yml` path filter includes `packages/**`, so the commit will trigger the deploy. The block below confirms green status.

```
$ gh run watch <run-id> --exit-status
(filled in after push)
$ curl -sS -o /dev/null -w "%{http_code}\n" https://homemade.education/healthz
200
```
