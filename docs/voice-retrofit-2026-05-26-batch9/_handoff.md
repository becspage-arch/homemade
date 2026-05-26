# Voice retrofit batch 2026-05-26-batch9

Batch 2026-05-26-batch9: 50 tutorials retrofitted. Deploy verification pending at the time of writing this file; updated in-line below once `gh run watch` returns and `/healthz` is confirmed 200.

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

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 381
After this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 431
Delta: +50 (matches the batch size).

Source of truth: `pnpm --filter "@homemade/db" exec tsx scripts/_count-voice-retrofitted.ts`.

### 3. Spot-check

Slug: `thyme-cough-syrup`
voiceRetrofittedAt: `Tue May 26 2026 12:46:22 GMT+0100 (British Summer Time)`
First paragraph in DB after apply: "Thyme syrup is a sweet, dark syrup of fresh thyme simmered in water and stirred into honey. A kitchen tradition long made for dry, tickly coughs and a sore chest. The thyme softens the cough; the honey coats the throat and keeps the syrup good in the fridge for about three weeks. About 40 minutes' work, mostly waiting for the thyme to simmer."

Live URL: https://homemade.education/herbal-medicine/thyme-cough-syrup
Live first paragraph after deploy: [filled in below once deploy is green]

### 4. Full slug list (50)

diagnosing-a-hen-not-laying, dispatching-and-paunching-a-rabbit, macrame-belt, macrame-plant-hanger-simple, double-half-hitch-macrame, double-half-hitch-right-macrame, st-johns-wort-profile, thyme-cough-syrup, fitting-a-door-stop-and-weather-seal, fitting-a-fused-spur, decorating-with-what-you-have, deep-friendship-is-possible-at-this-age, lavender-reed-diffuser, lemon-verbena-room-spray, cotton-linter-sheet-forming, covering-boards-with-paper, carved-sycamore-tea-caddy-spoon, carved-walnut-coffee-spoon, apple-pie-dutch-streusel, apple-strudel-filo, air-fryer-roasted-mushrooms-garlic-thyme, air-fryer-salmon, connecting-water-butt-to-greenhouse, draught-proofing-floorboard-gaps, drenching-sheep-with-an-oral-wormer, macrame-shelf-basic, drum-carder-colour-blending, valerian-tincture-for-sleep, fitting-a-kitchen-sink-waste-and-trap, dress-as-the-wealthy-version-of-you-today, linen-water-spray, cutting-clean-curves-papercutting, carved-walnut-honey-spoon, apple-turnovers, air-fryer-salmon-fillet, draught-sealing-a-letterbox, ear-tagging-sheep, macrame-wall-hanging-diamonds, dyeing-with-blackberries, when-not-to-use-home-herbal-remedies, fitting-a-letterbox, each-muscle-softening-one-by-one, marseille-soap, dos-a-dos-double-pamphlet, cherry-hand-mirror-frame, apple-turnovers-puff, air-fryer-sausages, draught-sealing-skirting-boards, egg-washing-grading-and-storage, needle-felted-acorn-set.

## Sample public URLs

- cooking: https://homemade.education/cooking/air-fryer-salmon
- baking: https://homemade.education/baking/apple-turnovers
- herbal-medicine: https://homemade.education/herbal-medicine/thyme-cough-syrup
- mindset: https://homemade.education/mindset/each-muscle-softening-one-by-one
- home-repair: https://homemade.education/home-repair/fitting-a-fused-spur
- natural-home: https://homemade.education/natural-home/lavender-reed-diffuser
- sustainability: https://homemade.education/sustainability/draught-sealing-a-letterbox
- fibre-arts: https://homemade.education/fibre-arts/macrame-plant-hanger-simple
- paper-word: https://homemade.education/paper-word/dos-a-dos-double-pamphlet
- wood-natural-craft: https://homemade.education/wood-natural-craft/carved-walnut-coffee-spoon
- animals-smallholding: https://homemade.education/animals-smallholding/dispatching-and-paunching-a-rabbit

## Before / after excerpts

### Herbal: thyme-cough-syrup (paragraph 0)

Before:
"Thyme simmered in water, strained, cooled, and stirred into honey. This is the kitchen's oldest cough remedy, the combination of thyme's antispasmodic and expectorant action with honey's coating and preserving properties makes a syrup that soothes a dry, tickling cough and helps loosen stubborn mucus. Culpeper (1652) prescribed thyme for coughs and chest complaints; the German Commission E, which reviews traditional herbal medicines, confirms its traditional use for upper respiratory catarrh."

After:
"Thyme syrup is a sweet, dark syrup of fresh thyme simmered in water and stirred into honey. A kitchen tradition long made for dry, tickly coughs and a sore chest. The thyme softens the cough; the honey coats the throat and keeps the syrup good in the fridge for about three weeks. About 40 minutes' work, mostly waiting for the thyme to simmer."

### Animals-smallholding: dispatching-and-paunching-a-rabbit (paragraph 0)

Before:
"Under Schedule 1 of the Welfare of Animals at the Time of Killing (England) Regulations 2015 (WATOK), owners may dispatch their own rabbits by cervical dislocation without a Certificate of Competence, provided the animal is kept for personal consumption and the method is applied correctly. Do not attempt this method on an animal belonging to another person without appropriate authorisation."

After:
"Under UK rules, an owner can humanely dispatch their own rabbit by cervical dislocation without a Certificate of Competence. The rabbit must be kept for personal use. The method must be done correctly. Never attempt this on another person's animal without permission."

### Baking: apple-pie-dutch-streusel (paragraph 0)

Before:
"The streusel removes the technical challenge of a pastry lid and replaces it with something quicker, more forgiving, and arguably better, a buttery oat crumble that browns more evenly than pastry and adds a contrasting crunch. Use Bramley apples for flavour and body; Cox or Braeburn if you prefer a firmer, less tart filling."

After:
"The streusel skips the trickiness of a pastry lid. In its place you get a buttery oat crumble. It browns more evenly than pastry and adds a contrasting crunch. Use Bramley apples for flavour and body. Cox or Braeburn give a firmer, less tart filling."

## Category-by-category count

animals-smallholding: 5, baking: 4, cooking: 4, fibre-arts: 9, herbal-medicine: 4, home-repair: 4, mindset: 4, natural-home: 4, paper-word: 4, sustainability: 4, wood-natural-craft: 4. Total: 50.

## Content-type-by-content-type count

animals-smallholding: 5, craft-project: 5, craft-technique: 4, herbal: 4, home-repair: 4, mindset: 4, natural-home: 4, other-paper-word: 4, other-wood-natural-craft: 4, recipe-baking: 4, recipe-cooking: 4, sustainability: 4. Total: 50.

Note: brief says content-type spread enforcement applies to the first 3 batches only. Batch 9 is past that gate; pick-and-export still runs the round-robin so the spread is incidentally maintained.

## Anything surprising

- 34 of 50 candidates passed voice-check on first run. The autopilot author prompt with the new register baked in is producing in-register bodies out of the gate, which means the retrofit work concentrates on legacy content authored before 2026-05-21. As the backlog drains, batches should pass more cleanly.
- "fibre-arts" pulled 9 picks rather than the typical 4-5 because the round-robin filled from buckets with deep candidate pools. Still inside the per-category cap of 15.
- Two herbal bodies (st-johns-wort-profile, when-not-to-use-home-herbal-remedies) needed several paragraph rewrites for grade-level alone, not just citation/historical-figure fixes. They were authored before the grade-level rule landed and the language sat at grade 13-18.
- "NHS 111" in body prose triggers the institutional-name rule and had to be replaced with "111 in the UK". The rule does not exempt service-line numbers; the rewrite keeps the practical info while complying with the rule. Worth a small spec note for future authors.
- No file showed a word-count drop greater than 20% versus the pre-rewrite body. Largest drops were paragraph-level on st-johns-wort-profile (the four rewritten paragraphs each lost ~30% words to remove citations) but the whole-body delta stayed well inside the 20% line because the rest of the body was untouched.

## Forward read

3104 PUBLISHED tutorials with voiceRetrofittedAt IS NULL remain after this fire.
