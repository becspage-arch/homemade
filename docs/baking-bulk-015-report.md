# Baking bulk-015 batch report

**Session date:** 2026-05-20  
**Batch:** baking-bulk-015 (10th consecutive autopilot baking batch — chain cap reached)  
**Status:** 40 PUBLISHED, 0 failures

---

## Summary

40 entries published across all 8 baking sub-categories. This is the 10th consecutive autopilot baking batch since the last human commit, hitting the hard chain cap. Baking will not run again via autopilot until a human commit resets the chain counter.

**Baking count: 552 → 592 PUBLISHED**

---

## Sub-category breakdown

| Sub-category | Count | Slugs |
|---|---|---|
| bread | 7 | barmbrack, rugbrod, pain-de-campagne, stollen, ciabatta, focaccia-rosemary, soft-pretzels |
| cakes | 8 | dobos-torte, battenberg-cake, genoise-sponge, angel-food-cake, chiffon-cake-citrus, opera-cake, marbled-bundt-cake, black-forest-gateau |
| pastries | 5 | kouign-amann, sfogliatelle, paris-brest, conversation-tart, eccles-cakes |
| biscuits | 5 | lebkuchen, springerle, florentines, speculaas, langues-de-chat |
| pies | 5 | treacle-tart, sussex-pond-pudding, bakewell-tart, tarte-bourdaloue, pastel-de-nata |
| scones | 3 | cheese-scones, drop-scones, potato-scones |
| sweets-confectionery | 5 | peanut-brittle, turkish-delight, honeycomb-toffee, scottish-tablet, walnut-fudge |
| cake-decorating | 2 | sugar-flowers, fondant-draping |

---

## Difficulty distribution

- BEGINNER: focaccia-rosemary, langues-de-chat, treacle-tart, marbled-bundt-cake, honeycomb-toffee, drop-scones, potato-scones, cheese-scones (8)
- INTERMEDIATE: barmbrack, ciabatta, soft-pretzels, stollen, battenberg-cake, genoise-sponge, angel-food-cake, chiffon-cake-citrus, black-forest-gateau, eccles-cakes, lebkuchen, florentines, speculaas, bakewell-tart, tarte-bourdaloue, pastel-de-nata, sussex-pond-pudding, turkish-delight, scottish-tablet, walnut-fudge, fondant-draping (21)
- ADVANCED: rugbrod, pain-de-campagne, kouign-amann, sfogliatelle, paris-brest, opera-cake, dobos-torte, springerle, sugar-flowers (9)
- INTERMEDIATE (confectionery): peanut-brittle (1)

---

## Foundational entries

- focaccia-rosemary (bread)
- langues-de-chat (biscuits)
- treacle-tart (pies)
- bakewell-tart (pies)
- pastel-de-nata (pies)
- cheese-scones (scones)
- drop-scones (scones)
- potato-scones (scones)
- honeycomb-toffee (sweets-confectionery)
- scottish-tablet (sweets-confectionery)
- fondant-draping (cake-decorating)

---

## New ingredients seeded (3)

- `vegetable-suet` — shredded vegetable fat for suet pastry and steamed puddings
- `anise-seeds` — liquorice-flavoured seeds used in springerle
- `rolled-fondant` — ready-to-roll sugar paste for cake covering and sugar flowers

---

## Voice-check fixes

- lebkuchen.json: `"48 to 72 hours"` → `"2 to 3 days"` (raw-hours error)
- honeycomb-toffee.json: `"a version of a Crunchie bar"` → `"a version of a chocolate honeycomb bar"` (brand-trademark warning)

## Upload fixes

- `vegetable-suet` commonSubstitutes: removed `beef-suet` (not in master list) — kept `unsalted-butter`
- `potatoes` → `potato` (singular slug) in potato-scones.json
- `cheddar-cheese` → `cheddar` in cheese-scones.json (correct slug)

---

## Notable entries

- **sussex-pond-pudding** (INTERMEDIATE) — steamed suet pudding with whole lemon inside. bakeTemperatureCelsius: null (no oven). cookMinutes: 150. Unusual entry for the pies sub-category.
- **drop-scones / potato-scones** (BEGINNER) — both pan-cooked, no oven. bakeTemperatureCelsius: null.
- **scottish-tablet** — uses `condensed-milk` 400g + 800g caster-sugar. bakeTemperatureCelsius: 118°C (soft-ball stage). beatings off the heat causes controlled crystallisation.
- **pastel-de-nata** — bakeTemperatureCelsius: 250°C (maximum oven heat for custard scorching). laminationFolds: 3. 
- **springerle** (ADVANCED) — uses `anise-seeds` (new). chillingMinutes: 720 (overnight drying before baking). Embossed mould technique.
- **fondant-draping / sugar-flowers** — cake-decorating type RECIPE entries with cake covering and sugar flower techniques. rolled-fondant (new ingredient) used in both.
- **sfogliatelle** (ADVANCED) — uses `lard` for lamination + `semolina` filling with `ricotta` and `orange-blossom-water`. Stretch-lamination technique.

---

## Chain cap note

Batch 015 = 10th consecutive autopilot baking batch. The hard chain cap (10 batches per category since last human commit) has been reached. Baking will not run again via the autopilot queue until Rebecca pushes a human commit, which resets the chain counter. The next category to fire in the round-robin will skip baking.
